"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { TrendingUp, LineChart, Plus, X, Loader2, Settings, Trash2, Search, Target, Briefcase, Bitcoin, BarChart3, Coins, Building2, Globe } from 'lucide-react';
import PageTemplate from '@/components/PageTemplate';
import { useInvestments } from '@/lib/hooks/useInvestments';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

const iconMap: any = {
  'trending-up': TrendingUp,
  'briefcase': Briefcase,
  'bitcoin': Bitcoin,
  'bar-chart': BarChart3,
  'coins': Coins,
  'building': Building2,
  'globe': Globe,
  'file-text': BarChart3, // Placeholder for bond
  'users': Globe // Placeholder for p2p
};

const investmentTypes = [
  { id: 'stock', label: 'Saham', icon: 'trending-up' },
  { id: 'mutual_fund', label: 'Reksadana', icon: 'briefcase' },
  { id: 'bond', label: 'Obligasi / SBN', icon: 'bar-chart' },
  { id: 'etf', label: 'ETF', icon: 'bar-chart' },
  { id: 'gold', label: 'Emas', icon: 'coins' },
  { id: 'crypto', label: 'Crypto', icon: 'bitcoin' },
  { id: 'real_estate', label: 'Properti', icon: 'building' },
  { id: 'p2p_lending', label: 'P2P Lending', icon: 'globe' },
  { id: 'other', label: 'Lainnya', icon: 'globe' },
];

export default function Investments() {
  const { loading, investments, addInvestment, updateInvestment, deleteInvestment, refetch } = useInvestments();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<any>(null);
  const [investmentToDelete, setInvestmentToDelete] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInvestments = useMemo(() => {
    return investments.filter(inv => 
      inv.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      inv.tickerSymbol?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [investments, searchQuery]);

  const totalPortfolioValue = useMemo(() => 
    investments.reduce((sum, inv) => sum + inv.totalValue, 0),
  [investments]);

  const totalCostBasis = useMemo(() => 
    investments.reduce((sum, inv) => sum + inv.costBasis, 0),
  [investments]);

  const totalGainLoss = totalPortfolioValue - totalCostBasis;
  const totalReturn = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

  const handleEdit = (inv: any) => {
    setEditingInvestment(inv);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (inv: any) => {
    setInvestmentToDelete(inv);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (investmentToDelete) {
      try {
        await deleteInvestment(investmentToDelete.id);
        setIsDeleteModalOpen(false);
        setInvestmentToDelete(null);
        refetch();
      } catch (err) {}
    }
  };

  return (
    <PageTemplate 
      title="Investments" 
      subtitle="Kelola dan pantau portofolio investasimu"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1f4842] p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group col-span-1 lg:col-span-2 min-h-[220px] flex flex-col justify-center">
          <div className="relative z-10">
            <div className="text-[#bdf29f] text-sm font-bold uppercase tracking-widest mb-2 opacity-80">Total Portfolio Value</div>
            <div className="text-5xl font-extrabold mb-4 tracking-tighter">
              {loading ? <div className="h-12 w-64 bg-white/10 animate-pulse rounded-xl" /> : formatCurrency(totalPortfolioValue)}
            </div>
            <div className="flex items-center gap-4">
               <div className={cn(
                 "px-4 py-2 rounded-2xl font-bold flex items-center gap-1.5 text-sm",
                 totalReturn >= 0 ? "bg-[#bdf29f] text-[#1f4842]" : "bg-red-400 text-white"
               )}>
                 <TrendingUp className="w-4 h-4" /> {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
               </div>
               <div className="text-white/60 text-sm font-medium">
                 Total Profit/Loss: <span className={cn("font-bold", totalGainLoss >= 0 ? "text-[#bdf29f]" : "text-red-400")}>
                   {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)}
                 </span>
               </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#bdf29f]/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
        </div>

        <div className="bg-white dark:bg-[#1f1f23] p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ecf4e9] dark:bg-[#1f4842]/30 flex items-center justify-center text-[#1f4842] dark:text-[#bdf29f]">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Top Asset</div>
              <div className="font-bold text-slate-900 dark:text-white">
                {investments.length > 0 ? investments.sort((a,b) => b.totalValue - a.totalValue)[0].name : 'No assets'}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {investments.length > 0 ? formatCurrency(investments.sort((a,b) => b.totalValue - a.totalValue)[0].totalValue) : '-'}
            </div>
            <div className="text-xs text-slate-400 font-medium">Concentration: {investments.length > 0 ? Math.round((investments.sort((a,b) => b.totalValue - a.totalValue)[0].totalValue / (totalPortfolioValue || 1)) * 100) : 0}%</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1f1f23] p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm min-h-[500px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">Your Assets</h3>
            <p className="text-sm text-slate-500 font-medium">Pantau performa setiap aset investasimu</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search assets..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:ring-2 focus:ring-[#1f4842] w-full"
              />
            </div>
            <button 
              onClick={() => {
                setEditingInvestment(null);
                setIsModalOpen(true);
              }}
              className="bg-[#1f4842] text-white px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity flex-shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Asset
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-slate-50 dark:bg-slate-800 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredInvestments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Briefcase className="w-16 h-16 opacity-10 mb-4" />
            <p className="font-bold">Portofolio masih kosong</p>
            <p className="text-sm">Klik "Add Asset" untuk mulai mencatat investasi</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredInvestments.map((inv) => {
              const Icon = iconMap[inv.icon] || Globe;
              const profit = inv.totalValue - inv.costBasis;
              const isProfit = profit >= 0;

              return (
                <div key={inv.id} className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#18181b] shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-[#1f4842] dark:text-[#bdf29f]">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 dark:text-white truncate max-w-[150px]">{inv.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{inv.tickerSymbol || inv.type.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(inv)}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 hover:text-[#1f4842] transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(inv)}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Value</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(inv.totalValue)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Return</div>
                      <div className={cn("text-lg font-bold", isProfit ? "text-emerald-500" : "text-red-500")}>
                        {isProfit ? '+' : ''}{inv.unrealizedGainLossPercentage?.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center text-[11px] font-medium text-slate-500">
                    <div>{inv.quantity} Units</div>
                    <div className="flex items-center gap-2">
                      Avg: <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(inv.purchasePrice)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <InvestmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          refetch();
        }} 
        editingInvestment={editingInvestment}
      />

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Investment"
        description={`Are you sure you want to remove "${investmentToDelete?.name}" from your portfolio?`}
        loading={loading}
      />
    </PageTemplate>
  );
}

function InvestmentModal({ isOpen, onClose, onSuccess, editingInvestment }: any) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const { addInvestment, updateInvestment, loading } = useInvestments();

  useEffect(() => {
    if (editingInvestment) {
      setValue('name', editingInvestment.name);
      setValue('tickerSymbol', editingInvestment.tickerSymbol || '');
      setValue('type', editingInvestment.type);
      setValue('quantity', editingInvestment.quantity);
      setValue('purchasePrice', editingInvestment.purchasePrice);
      setValue('currentPrice', editingInvestment.currentPrice);
      setValue('purchaseDate', editingInvestment.purchaseDate ? new Date(editingInvestment.purchaseDate).toISOString().split('T')[0] : '');
      setValue('icon', editingInvestment.icon || 'trending-up');
    } else {
      reset();
      setValue('icon', 'trending-up');
      setValue('type', 'stock');
    }
  }, [editingInvestment, setValue, reset, isOpen]);

  const onSubmit = async (data: any) => {
    try {
      if (editingInvestment) {
        await updateInvestment(editingInvestment.id, data);
      } else {
        await addInvestment(data);
      }
      onSuccess();
    } catch (err) {}
  };

  if (!isOpen) return null;

  const inputClass = "w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1f4842] transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-[#18181b] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-8 border-b border-slate-50 dark:border-slate-800">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {editingInvestment ? 'Edit Asset' : 'Add New Asset'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 ml-1">Asset Name</label>
              <input 
                {...register('name', { required: 'Name is required' })}
                placeholder="e.g. Apple Inc, Bitcoin"
                className={inputClass}
              />
              {errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.name.message as string}</p>}
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 ml-1">Symbol / Ticker</label>
              <input 
                {...register('tickerSymbol')}
                placeholder="e.g. AAPL, BTC"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 ml-1">Asset Type</label>
              <select {...register('type')} className={inputClass}>
                {investmentTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 ml-1">Icon</label>
              <select {...register('icon')} className={inputClass}>
                <option value="trending-up">📈 Saham</option>
                <option value="briefcase">💼 Reksadana</option>
                <option value="bar-chart">📊 Obligasi / SBN</option>
                <option value="bitcoin">₿ Crypto</option>
                <option value="coins">🪙 Emas</option>
                <option value="building">🏢 Properti</option>
                <option value="globe">🌐 P2P / Lainnya</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 ml-1">Quantity</label>
              <input 
                type="number" step="any"
                {...register('quantity', { required: 'Required' })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 ml-1">Avg Price</label>
              <input 
                type="number" step="any"
                {...register('purchasePrice', { required: 'Required' })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 ml-1">Current Price</label>
              <input 
                type="number" step="any"
                {...register('currentPrice', { required: 'Required' })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 ml-1">Purchase Date</label>
            <input 
              type="date"
              {...register('purchaseDate')}
              className={inputClass}
            />
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1f4842] text-white py-4 rounded-2xl font-extrabold text-lg hover:opacity-95 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : editingInvestment ? 'Update Asset' : 'Add to Portfolio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
