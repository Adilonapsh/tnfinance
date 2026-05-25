"use client"
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../authStore';
import toast from 'react-hot-toast';

export function useSavingPlans() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [savingPlans, setSavingPlans] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchSavingPlans = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/saving-plans', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }
      
      const data = await res.json();
      setSavingPlans(data);
    } catch (err: any) {
      console.error("Error fetching saving plans:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addPlan = async (planData: any) => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/saving-plans', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add saving plan');
      }
      
      toast.success('Saving plan added successfully!');
      fetchSavingPlans();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = async (id: string, planData: any) => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/saving-plans/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update saving plan');
      }
      
      toast.success('Saving plan updated successfully!');
      fetchSavingPlans();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (id: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/saving-plans/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete saving plan');
      }
      
      toast.success('Saving plan deleted successfully!');
      fetchSavingPlans();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavingPlans();
  }, [fetchSavingPlans]);

  return { loading, savingPlans, error, refetch: fetchSavingPlans, addPlan, updatePlan, deletePlan };
}
