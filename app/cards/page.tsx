"use client";
import React, { useState } from 'react';
import { Plus, CreditCard as CardIcon, Loader2, X, Settings, Trash2 } from 'lucide-react';
import PageTemplate from '@/components/PageTemplate';
import { useDashboardData } from '@/lib/hooks/useDashboardData';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { useAccounts } from '@/lib/hooks/useAccounts';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

export default function Cards() {
  const { data, loading, refetch } = useDashboardData();
  const { addAccount, updateAccount, deleteAccount, loading: submitting } = useAccounts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [accountToDelete, setAccountToDelete] = useState<any>(null);

  const getCardColor = (color: string) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-600';
      case 'blue': return 'bg-blue-600';
      case 'purple': return 'bg-purple-600';
      case 'rose': return 'bg-rose-600';
      case 'amber': return 'bg-amber-600';
      case 'slate': return 'bg-slate-700';
      case 'brand': return 'bg-[#1f4842]';
      default: return 'bg-[#1f4842]';
    }
  };

  const getGradient = (color: string) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-400/20';
      case 'blue': return 'bg-blue-400/20';
      case 'purple': return 'bg-purple-400/20';
      case 'rose': return 'bg-rose-400/20';
      case 'amber': return 'bg-amber-400/20';
      case 'brand': return 'bg-[#bdf29f]/20';
      default: return 'bg-[#bdf29f]/20';
    }
  };

  const handleAddSuccess = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
    refetch();
  };

  const handleEdit = (acc: any) => {
    setEditingAccount(acc);
    setIsModalOpen(true);
  };

  const handleDelete = async (acc: any) => {
    setAccountToDelete(acc);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (accountToDelete) {
      try {
        await deleteAccount(accountToDelete.id);
        setIsDeleteModalOpen(false);
        setAccountToDelete(null);
        refetch();
      } catch (e) {}
    }
  };

  return (
    <PageTemplate 
      title="My Cards" 
      subtitle="Kelola semua kartu debit dan kreditmu"
    >
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#1f4842] text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:opacity-90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Card
        </button>
      </div>

      <div className="flex flex-wrap gap-6">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="w-full md:w-80 h-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-3xl" />
          ))
        ) : (
          data?.accounts?.map((acc: any) => (
            <div key={acc.id} className={cn(
              "w-full md:w-80 text-white p-6 rounded-3xl flex flex-col relative overflow-hidden shadow-xl h-48 transition-transform hover:scale-[1.02]",
              getCardColor(acc.color)
            )}>
              <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -mr-10 -mt-10", getGradient(acc.color))} />
              
              <div className="flex justify-between items-start mb-auto z-10">
                <div className="font-bold italic text-xl px-1">
                  {acc.type === 'credit_card' ? 'CREDIT' : acc.type.toUpperCase()}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(acc)}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(acc)}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-red-500/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="z-10 mt-auto">
                <div className="font-mono text-lg tracking-widest mb-4 flex items-center justify-between">
                  <span>****</span>
                  <span>****</span>
                  <span>****</span>
                  <span>{acc.accountNumber?.slice(-4) || '0000'}</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[10px] text-white/60 uppercase tracking-wider mb-0.5">Account Name</div>
                    <div className="text-sm font-semibold tracking-wide truncate max-w-[150px]">{acc.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-white/60 uppercase tracking-wider mb-0.5">Balance</div>
                    <div className="text-sm font-bold tracking-wide">{formatCurrency(acc.balance)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        <div 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-80 bg-white dark:bg-[#1f1f23] border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 p-6 rounded-3xl flex flex-col items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer h-48"
        >
            <Plus className="w-8 h-8 mb-2" />
            <span className="font-bold">Add Account</span>
            <span className="text-xs mt-1 text-center max-w-[200px]">Hubungkan rekening bank atau e-wallet baru</span>
        </div>
      </div>

      <AddAccountModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingAccount(null);
        }} 
        onSuccess={handleAddSuccess} 
        editingAccount={editingAccount}
      />

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setAccountToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Account"
        description={`Are you sure you want to delete "${accountToDelete?.name}"? All associated transactions will be affected.`}
        loading={submitting}
      />
    </PageTemplate>
  );
}

function AddAccountModal({ isOpen, onClose, onSuccess, editingAccount }: { isOpen: boolean, onClose: () => void, onSuccess: () => void, editingAccount?: any }) {
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();
  const { addAccount, updateAccount, loading } = useAccounts();

  React.useEffect(() => {
    if (editingAccount) {
      setValue('name', editingAccount.name);
      setValue('type', editingAccount.type);
      setValue('balance', editingAccount.balance);
      setValue('accountNumber', editingAccount.accountNumber);
      setValue('color', editingAccount.color);
    } else {
      reset();
    }
  }, [editingAccount, setValue, reset]);

  const onSubmit = async (data: any) => {
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, data);
      } else {
        await addAccount(data);
      }
      reset();
      onSuccess();
    } catch (err) {
      // toast handled in hook
    }
  };

  if (!isOpen) return null;

  const inputClass = "w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1f1f23] text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1f4842] focus:border-transparent outline-none transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-[#18181b] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {editingAccount ? 'Edit Account' : 'Add New Account'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Account Name</label>
            <input 
              {...register('name', { required: 'Name is required' })}
              placeholder="e.g. Bank Mandiri, GoPay"
              className={inputClass}
            />
            {errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.name.message as string}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Type</label>
              <select {...register('type')} className={inputClass}>
                <option value="bank">Bank Account</option>
                <option value="ewallet">E-Wallet</option>
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="investment">Investment</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Color</label>
              <select {...register('color')} className={inputClass}>
                <option value="emerald">Emerald</option>
                <option value="blue">Blue</option>
                <option value="purple">Purple</option>
                <option value="rose">Rose</option>
                <option value="amber">Amber</option>
                <option value="slate">Slate</option>
                <option value="brand">Brand (Dark Green)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Current Balance</label>
            <input 
              type="number"
              {...register('balance', { required: 'Balance is required' })}
              placeholder="0"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Account Number (Optional)</label>
            <input 
              {...register('accountNumber')}
              placeholder="**** **** **** 1234"
              className={inputClass}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1f4842] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              {loading ? 'Adding...' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
