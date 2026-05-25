"use client"
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../authStore';
import toast from 'react-hot-toast';

export function useInvestments() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchInvestments = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/investments', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }
      
      const data = await res.json();
      setInvestments(data);
    } catch (err: any) {
      console.error("Error fetching investments:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addInvestment = async (invData: any) => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/investments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add investment');
      }
      
      const newInv = await res.json();
      toast.success('Investment added successfully!');
      fetchInvestments();
      return newInv;
    } catch (err: any) {
      console.error("Error adding investment:", err);
      toast.error(`Error: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateInvestment = async (id: string, invData: any) => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/investments/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update investment');
      }
      
      const updatedInv = await res.json();
      toast.success('Investment updated successfully!');
      fetchInvestments();
      return updatedInv;
    } catch (err: any) {
      console.error("Error updating investment:", err);
      toast.error(`Error: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteInvestment = async (id: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/investments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete investment');
      }
      
      toast.success('Investment deleted successfully!');
      fetchInvestments();
    } catch (err: any) {
      console.error("Error deleting investment:", err);
      toast.error(`Error: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  return { 
    loading, 
    investments, 
    error, 
    refetch: fetchInvestments, 
    addInvestment, 
    updateInvestment, 
    deleteInvestment 
  };
}
