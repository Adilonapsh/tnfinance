"use client"
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../authStore';
import toast from 'react-hot-toast';

export function useSubscriptions() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/subscriptions', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }
      
      const data = await res.json();
      setSubscriptions(data);
    } catch (err: any) {
      console.error("Error fetching subscriptions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addSubscription = async (subData: any) => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add subscription');
      }
      
      const newSub = await res.json();
      toast.success('Subscription added successfully!');
      fetchSubscriptions();
      return newSub;
    } catch (err: any) {
      console.error("Error adding subscription:", err);
      toast.error(`Error: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (id: string, subData: any) => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update subscription');
      }
      
      const updatedSub = await res.json();
      toast.success('Subscription updated successfully!');
      fetchSubscriptions();
      return updatedSub;
    } catch (err: any) {
      console.error("Error updating subscription:", err);
      toast.error(`Error: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSubscription = async (id: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete subscription');
      }
      
      toast.success('Subscription deleted successfully!');
      fetchSubscriptions();
    } catch (err: any) {
      console.error("Error deleting subscription:", err);
      toast.error(`Error: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return { 
    loading, 
    subscriptions, 
    error, 
    refetch: fetchSubscriptions, 
    addSubscription, 
    updateSubscription, 
    deleteSubscription 
  };
}
