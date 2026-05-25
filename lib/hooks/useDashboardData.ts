"use client"
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../authStore';

export function useDashboardData() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }
      
      const jsonData = await res.json();
      setData(jsonData);
    } catch (err) {
      console.error("Error fetching dashboard data from API:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { loading, data, refetch: fetchData };
}
