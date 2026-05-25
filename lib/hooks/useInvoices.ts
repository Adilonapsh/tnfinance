"use client"
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../authStore';
import toast from 'react-hot-toast';

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  email: string;
  project: string;
  date: string;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue' | string;
  items: InvoiceItem[];
  tax: number;
  discount: number;
  notes: string;
}

export function useInvoices() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async (page = 1) => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/invoices?page=${page}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }
      
      const data = await res.json();
      setInvoices(data.invoices.map((inv: any) => ({
        ...inv,
        id: inv.invoiceNumber,
        dbId: inv.id
      })));
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
    } catch (err: any) {
      console.error("Error fetching invoices:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addInvoice = async (invoiceData: any) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create invoice');
      }
      
      const newInv = await res.json();
      fetchInvoices(1); // Refresh to first page
      return newInv;
    } catch (err: any) {
      console.error("Error adding invoice:", err);
      throw err;
    }
  };

  const updateInvoice = async (id: string, invoiceData: any) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update invoice');
      }
      
      const updatedInv = await res.json();
      fetchInvoices(currentPage);
      return updatedInv;
    } catch (err: any) {
      console.error("Error updating invoice:", err);
      throw err;
    }
  };

  const deleteInvoice = async (id: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete invoice');
      }
      
      toast.success('Invoice deleted successfully');
      fetchInvoices(currentPage);
    } catch (err: any) {
      console.error("Error deleting invoice:", err);
      toast.error(`Error: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchInvoices(1);
  }, [fetchInvoices]);

  return { 
    loading, 
    invoices, 
    error, 
    addInvoice, 
    updateInvoice,
    deleteInvoice,
    refetch: fetchInvoices,
    totalPages,
    currentPage,
    setPage: fetchInvoices
  };
}
