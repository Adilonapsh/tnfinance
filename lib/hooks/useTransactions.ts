"use client"
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../authStore';

export interface TransactionFilter {
  search?: string;
  status?: string;
  categoryId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export function useTransactions(filters: TransactionFilter = {}) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());

      const res = await fetch(`/api/transactions?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }
      
      const data = await res.json();
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, filters.search, filters.status, filters.categoryId, filters.type, filters.startDate, filters.endDate, filters.page, filters.limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { loading, transactions, pagination, error, refetch: fetchTransactions };
}

