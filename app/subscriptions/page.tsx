"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { CreditCard, AlertCircle, Calendar, MoreVertical, Plus, X, Loader2, Settings, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import PageTemplate from '@/components/PageTemplate';
import { useForm } from 'react-hook-form';
import { useSubscriptions } from '@/lib/hooks/useSubscriptions';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/authStore';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

const StatCard = React.memo(({ title, amount, icon: Icon, isAccent, count, loading }: any) => (
  <div className={`p-6 rounded-3xl border shadow-sm flex items-center gap-4 ${isAccent ? 'bg-[#1f4842] text-white border-none' : 'bg-white dark:bg-[#1f1f23] border-slate-200 dark:border-slate-700'}`}>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isAccent ? 'bg-white/20 text-white' : 'bg-[#ecf4e9] dark:bg-[#1f4842]/30 text-[#1f4842] dark:text-[#bdf29f]'}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="flex-1">
      <div className={`text-sm mb-1 ${isAccent ? 'text-[#ecf4e9] opacity-80' : 'text-slate-500 dark:text-slate-400'}`}>{title}</div>
      {loading ? (
        <div className={`h-8 rounded animate-pulse w-3/4 ${isAccent ? 'bg-white/10' : 'bg-slate-100 dark:bg-slate-800'}`} />
      ) : (
        <div className={`text-2xl font-bold tracking-tight ${isAccent ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
          {amount}
        </div>
      )}
      {count && <div className={`text-xs ${isAccent ? 'text-[#ecf4e9] opacity-70' : 'text-slate-400'}`}>{count}</div>}
    </div>
  </div>
));
StatCard.displayName = 'StatCard';

export default function Subscriptions() {
  const { loading, subscriptions, deleteSubscription, refetch } = useSubscriptions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<any>(null);
  const [subToDelete, setSubToDelete] = useState<any>(null);

  const totalMonthlySpent = useMemo(() => 
    subscriptions.reduce((sum, sub) => {
      if (sub.billingPeriod === 'monthly') return sum + sub.amount;
      if (sub.billingPeriod === 'yearly') return sum + (sub.amount / 12);
      if (sub.billingPeriod === 'quarterly') return sum + (sub.amount / 3);
      return sum + sub.amount;
    }, 0),
  [subscriptions]);

  const upcomingBills = useMemo(() => {
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    return subscriptions.filter(sub => new Date(sub.nextBillingDate) <= next7Days).length;
  }, [subscriptions]);

  const handleEdit = (sub: any) => {
    setEditingSubscription(sub);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (sub: any) => {
    setSubToDelete(sub);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (subToDelete) {
      try {
        await deleteSubscription(subToDelete.id);
        setIsDeleteModalOpen(false);
        setSubToDelete(null);
        refetch();
      } catch (err) {}
    }
  };

  return (
    <PageTemplate 
      title="Subscriptions" 
      subtitle="Kelola semua langgananmu dengan mudah"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard loading={loading} title="Total Monthly Spent" amount={formatCurrency(totalMonthlySpent)} icon={CreditCard} />
        <StatCard loading={loading} title="Upcoming (7 days)" amount={`${upcomingBills} Bills`} icon={Calendar} count="Bills" />
        <StatCard loading={loading} title="Potential Savings" amount={`~${formatCurrency(totalMonthlySpent * 0.1)}/mo`} icon={AlertCircle} isAccent={true} />
      </div>

      <div className="bg-white dark:bg-[#1f1f23] p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm min-h-[400px]">
         <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Active Subscriptions</h3>
            <button 
              onClick={() => {
                setEditingSubscription(null);
                setIsModalOpen(true);
              }}
              className="text-sm font-medium text-[#1f4842] dark:text-[#bdf29f] flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Add New
            </button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 bg-slate-50 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <CreditCard className="w-12 h-12 opacity-20 mb-4" />
            <p>No active subscriptions found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptions.map((sub) => (
               <div key={sub.id} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1f1f23] shadow-sm hover:border-slate-200 dark:hover:border-slate-600 transition-colors group relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#1f4842] text-white">
                           <span className="font-bold text-sm tracking-widest">{sub.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{sub.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{sub.category?.name || 'Subscription'}</div>
                        </div>
                     </div>
                     <div className="flex gap-1">
                        <button 
                          onClick={() => handleEdit(sub)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-[#1f4842] transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(sub)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                  
                  <div className="flex justify-between items-end mt-6">
                     <div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">Next Bill</div>
                        <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{new Date(sub.nextBillingDate).toLocaleDateString('id-ID')}</div>
                     </div>
                     <div className="text-right">
                       <div className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight">{formatCurrency(sub.amount)}</div>
                       <div className="text-[11px] text-slate-500 uppercase tracking-wider">{sub.billingPeriod}</div>
                     </div>
                  </div>
               </div>
            ))}
          </div>
        )}
      </div>

      <AddSubscriptionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          refetch();
        }} 
        editingSubscription={editingSubscription}
      />

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Subscription"
        description={`Are you sure you want to delete your subscription to "${subToDelete?.name}"?`}
        loading={loading}
      />
    </PageTemplate>
  );
}

function AddSubscriptionModal({ isOpen, onClose, onSuccess, editingSubscription }: any) {
  const { user } = useAuthStore();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const { addSubscription, updateSubscription, loading } = useSubscriptions();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (editingSubscription) {
      setValue('name', editingSubscription.name);
      setValue('amount', editingSubscription.amount);
      setValue('billingPeriod', editingSubscription.billingPeriod);
      setValue('nextBillingDate', new Date(editingSubscription.nextBillingDate).toISOString().split('T')[0]);
      setValue('categoryId', editingSubscription.categoryId || '');
    } else {
      reset();
    }
  }, [editingSubscription, setValue, reset]);

  useEffect(() => {
    async function fetchCategories() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/categories?type=expense', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (isOpen) fetchCategories();
  }, [isOpen, user]);

  const onSubmit = async (data: any) => {
    try {
      if (editingSubscription) {
        await updateSubscription(editingSubscription.id, data);
      } else {
        await addSubscription(data);
      }
      onSuccess();
    } catch (err) {}
  };

  if (!isOpen) return null;

  const inputClass = "w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1f1f23] text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1f4842] focus:border-transparent outline-none transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-[#18181b] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {editingSubscription ? 'Edit Subscription' : 'Add New Subscription'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Subscription Name</label>
            <input 
              {...register('name', { required: 'Name is required' })}
              placeholder="e.g. Netflix, Spotify, iCloud"
              className={inputClass}
            />
            {errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.name.message as string}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Amount</label>
              <input 
                type="number"
                {...register('amount', { required: 'Amount is required' })}
                placeholder="0"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Billing Period</label>
              <select {...register('billingPeriod')} className={inputClass}>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Next Billing Date</label>
              <input 
                type="date"
                {...register('nextBillingDate', { required: 'Date is required' })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Category</label>
              <select {...register('categoryId')} className={inputClass}>
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1f4842] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : editingSubscription ? <Settings className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {loading ? 'Processing...' : editingSubscription ? 'Update Subscription' : 'Add Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
