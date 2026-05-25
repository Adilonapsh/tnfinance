"use client"
import { useState } from 'react';
import { useAuthStore } from '../authStore';
import toast from 'react-hot-toast';

export function useAccounts() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const addAccount = async (accountData: any) => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(accountData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create account');
      }
      
      const newAccount = await res.json();
      toast.success('Account added successfully!');
      return newAccount;
    } catch (err: any) {
      console.error("Error adding account:", err);
      toast.error(`Error: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAccount = async (id: string, accountData: any) => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/accounts/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(accountData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update account');
      }
      
      const updatedAccount = await res.json();
      toast.success('Account updated successfully!');
      return updatedAccount;
    } catch (err: any) {
      console.error("Error updating account:", err);
      toast.error(`Error: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (id: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/accounts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }
      
      toast.success('Account deleted successfully!');
      return true;
    } catch (err: any) {
      console.error("Error deleting account:", err);
      toast.error(`Error: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { 
    loading, 
    addAccount,
    updateAccount,
    deleteAccount
  };
}
