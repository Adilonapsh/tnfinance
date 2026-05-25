"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { Plus, Home, Plane, Briefcase, Car, Wallet, TrendingUp, TrendingDown, Target, MoreHorizontal, X, Loader2, Settings, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/format';
import PageTemplate from '@/components/PageTemplate';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { useSavingPlans } from '@/lib/hooks/useSavingPlans';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/lib/authStore';
import { cn } from '@/lib/utils';

const iconMap: Record<string, any> = {
  Wallet, Plane, Briefcase, Home, Target, Car
};

const chartData = [
   { name: 'Jan', value: 1500000 },
   { name: 'Feb', value: 2000000 },
   { name: 'Mar', value: 3000000 },
   { name: 'Apr', value: 2500000 },
   { name: 'May', value: 3875000 },
   { name: 'Jun', value: 3875000 },
   { name: 'Jul', value: 3000000 },
   { name: 'Aug', value: 3500000 },
   { name: 'Sep', value: 4500000 },
   { name: 'Oct', value: 4200000 },
   { name: 'Nov', value: 5000000 },
   { name: 'Dec', value: 5000000 },
];

const StatCard = React.memo(({ title, amount, trend, isPositive, isAccent, loading }: any) => (
  <div className={`p-6 rounded-3xl border shadow-sm flex items-center justify-between ${isAccent ? 'bg-[#ecf4e9] dark:bg-[#1f4842] border-none' : 'bg-white dark:bg-[#1f1f23] border-slate-200 dark:border-slate-700'}`}>
     <div>
        <div className={`text-sm font-medium mb-1 ${isAccent ? 'text-[#1f4842] dark:text-[#ecf4e9] opacity-80' : 'text-slate-500'}`}>{title}</div>
        <div className="flex items-center gap-3">
           {loading ? (
             <div className="h-8 w-32 bg-white/20 rounded animate-pulse" />
           ) : (
             <div className={`text-2xl font-bold ${isAccent ? 'text-[#1f4842] dark:text-white' : 'text-slate-900 dark:text-slate-100'}`}>{amount}</div>
           )}
           <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${isPositive ? 'text-[#1f4842] dark:text-[#bdf29f] bg-[#ecf4e9] dark:bg-[#1f4842]' : 'text-red-500 bg-red-500/10'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {trend}
           </div>
        </div>
     </div>
  </div>
));
StatCard.displayName = 'StatCard';

const SavingPlanItem = React.memo(({ plan, isActive, onClick }: any) => {
  const IconComponent = iconMap[plan.icon] || Target;
  const percent = Math.min(Math.round((plan.currentAmount / plan.targetAmount) * 100), 100);
  
  return (
    <div onClick={onClick} className={`p-4 rounded-2xl border transition-colors cursor-pointer ${isActive ? 'bg-[#ecf4e9] dark:bg-[#1f4842] border-[#bdf29f]' : 'bg-white dark:bg-[#1f1f23] hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
       <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-white text-[#1f4842]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <IconComponent className="w-5 h-5" />
             </div>
             <div>
                <div className={`font-bold text-sm ${isActive ? 'text-[#1f4842] dark:text-white' : 'text-slate-900 dark:text-slate-100'}`}>{plan.name}</div>
                <div className="text-xs font-semibold mt-1">
                   <span className={`font-bold ${isActive ? 'text-[#1f4842] dark:text-white' : 'text-slate-900 dark:text-white'}`}>{formatCurrency(plan.currentAmount)}</span>
                   <span className="text-slate-400"> / {formatCurrency(plan.targetAmount)}</span>
                </div>
             </div>
          </div>
          <div className="text-right">
             <div className={`font-bold text-sm ${isActive ? 'text-[#1f4842] dark:text-white' : 'text-slate-900 dark:text-slate-100'}`}>{percent}%</div>
             <div className={`text-[10px] uppercase font-bold mt-1 ${plan.isCompleted ? 'text-[#1f4842] dark:text-[#bdf29f]' : 'text-slate-500'}`}>
                {plan.isCompleted ? 'Completed' : 'In Progress'}
             </div>
          </div>
       </div>
       <div className="w-full flex h-2.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          {percent > 0 && (
            <div className={cn(
              "h-full",
              plan.color === 'emerald' ? 'bg-emerald-500' :
              plan.color === 'blue' ? 'bg-blue-500' :
              plan.color === 'purple' ? 'bg-purple-500' :
              plan.color === 'rose' ? 'bg-rose-500' :
              plan.color === 'amber' ? 'bg-amber-500' : 
              plan.color === 'brand' ? 'bg-[#1f4842]' : 'bg-[#1f4842]'
            )} style={{ width: `${percent}%` }} />
          )}
          <div className="flex-1" />
       </div>
    </div>
  );
});
SavingPlanItem.displayName = 'SavingPlanItem';

export default function SavingPlans() {
  const { loading, savingPlans, updatePlan, deletePlan, refetch } = useSavingPlans();
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const memoizedChartData = useMemo(() => chartData, []);

  useEffect(() => {
    if (savingPlans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(savingPlans[0].id);
    }
  }, [savingPlans, selectedPlanId]);

  const selectedPlan = savingPlans.find(p => p.id === selectedPlanId) || (savingPlans.length > 0 ? savingPlans[0] : null);

  const totalSavings = useMemo(() => 
    savingPlans.reduce((sum, p) => sum + p.currentAmount, 0),
  [savingPlans]);

  const totalTarget = useMemo(() => 
    savingPlans.reduce((sum, p) => sum + p.targetAmount, 0),
  [savingPlans]);

  const percent = selectedPlan ? Math.min(Math.round((selectedPlan.currentAmount / selectedPlan.targetAmount) * 100), 100) : 0;
  const PlanIcon = selectedPlan ? (iconMap[selectedPlan.icon] || Target) : Target;

  const handleEdit = () => {
    setEditingPlan(selectedPlan);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedPlan) {
      setPlanToDelete(selectedPlan.id);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (planToDelete) {
      try {
        await deletePlan(planToDelete);
        setIsDeleteModalOpen(false);
        setPlanToDelete(null);
        setSelectedPlanId(null);
        refetch();
      } catch (e) {}
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
    refetch();
  };

  return (
    <PageTemplate 
      title="Saving Plans" 
      subtitle="Kelola rencana tabunganmu dengan mudah"
    >
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard loading={loading} title="Total Savings" amount={formatCurrency(totalSavings)} trend="4.20%" isPositive={true} />
        <StatCard loading={loading} title="Total Target" amount={formatCurrency(totalTarget)} trend="2.40%" isPositive={false} isAccent={true} />
        <StatCard loading={loading} title="Total Plans" amount={savingPlans.length} trend="8.20%" isPositive={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - List of Plans */}
        <div className="bg-white dark:bg-[#1f1f23] border border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col min-h-[500px]">
           <div className="p-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Saving Plans</h3>
              <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-5 h-5" /></button>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 bg-slate-50 dark:bg-slate-800 rounded-2xl animate-pulse" />
                ))
              ) : savingPlans.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-sm">No plans yet</div>
              ) : (
                savingPlans.map((plan) => (
                   <SavingPlanItem 
                    key={plan.id} 
                    plan={plan} 
                    isActive={plan.id === selectedPlanId} 
                    onClick={() => setSelectedPlanId(plan.id)}
                  />
                ))
              )}
           </div>
           <div className="p-6 border-t border-slate-100 dark:border-slate-700">
              <button 
                onClick={() => {
                  setEditingPlan(null);
                  setIsModalOpen(true);
                }}
                className="w-full py-3.5 bg-[#1f4842] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                 <Plus className="w-5 h-5" /> Add Plan
              </button>
           </div>
        </div>

        {/* Right Section */}
        <div className="lg:col-span-2 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plan Details Card */}
              {selectedPlan ? (
                <div className="bg-[#ecf4e9] dark:bg-[#1f4842] p-8 rounded-3xl border-none shadow-sm flex flex-col justify-between">
                  <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white/50 dark:bg-white/10 rounded-2xl flex items-center justify-center text-[#1f4842] dark:text-[#bdf29f]">
                              <PlanIcon className="w-6 h-6" />
                          </div>
                          <h3 className="font-bold text-xl text-[#1f4842] dark:text-white">{selectedPlan.name}</h3>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={handleEdit}
                            className="p-2 rounded-xl bg-white/20 hover:bg-white/40 transition-colors text-[#1f4842] dark:text-white"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={handleDelete}
                            className="p-2 rounded-xl bg-white/20 hover:bg-red-500/40 transition-colors text-[#1f4842] dark:text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className="text-4xl font-extrabold text-[#1f4842] dark:text-white">{formatCurrency(selectedPlan.currentAmount)}</span>
                        <span className="text-[#1f4842] dark:text-[#ecf4e9] font-medium opacity-70 ml-1">/{formatCurrency(selectedPlan.targetAmount)}</span>
                      </div>

                      <div className="w-full flex h-12 rounded-xl overflow-hidden bg-white/50 mb-4">
                        {percent > 0 ? (
                          <div className={cn(
                            "flex items-center px-4 text-white font-bold text-sm transition-all duration-500",
                            selectedPlan.color === 'emerald' ? 'bg-emerald-600' :
                            selectedPlan.color === 'blue' ? 'bg-blue-600' :
                            selectedPlan.color === 'purple' ? 'bg-purple-600' :
                            selectedPlan.color === 'rose' ? 'bg-rose-600' :
                            selectedPlan.color === 'amber' ? 'bg-amber-600' : 
                            selectedPlan.color === 'brand' ? 'bg-[#1f4842]' : 'bg-[#1f4842]'
                          )} style={{ width: `${percent}%` }}>
                            {percent >= 10 && `${percent}%`}
                          </div>
                        ) : null}
                        <div className="flex-1" />
                      </div>

                      <div className="flex justify-between items-center text-sm font-bold text-[#1f4842] dark:text-white mb-8">
                        <span>{selectedPlan.isCompleted ? 'Completed' : 'In Progress'}</span>
                        <span>{percent}%</span>
                      </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-[#1f4842]/10 dark:border-white/10">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[#1f4842] dark:text-[#ecf4e9] opacity-70 font-medium">Due Date</span>
                        <span className="font-bold text-[#1f4842] dark:text-white">
                          {selectedPlan.deadline ? new Date(selectedPlan.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[#1f4842] dark:text-[#ecf4e9] opacity-70 font-medium">Linked Account</span>
                        <span className="font-bold text-[#1f4842] dark:text-white">{selectedPlan.linkedAccount?.name || 'Manual'}</span>
                      </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#1f1f23] p-12 rounded-3xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 italic">
                  Select a plan to see details
                </div>
              )}

              {/* Saving Tips & Chart */}
              <div className="space-y-6 flex flex-col">
                 <div className="bg-white dark:bg-[#1f1f23] p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Saving Tips</h3>
                    <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400 font-medium list-disc list-outside ml-4">
                       <li className="text-slate-900 dark:text-white">Keep consistent with your saving habits.</li>
                       <li>Cut unnecessary subscriptions.</li>
                       <li>Skip eating out twice a week.</li>
                       <li>Automate savings from paycheck.</li>
                    </ul>
                 </div>

                 <div className="bg-white dark:bg-[#1f1f23] p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                       <h3 className="font-bold text-slate-900 dark:text-slate-100">Progress History</h3>
                    </div>
                    <div className="flex-1 w-full relative min-h-[150px]">
                       <ResponsiveContainer width="100%" height="100%" className="absolute inset-0">
                          <AreaChart data={memoizedChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                             <defs>
                                <linearGradient id="colorValueSaving" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#1f4842" stopOpacity={0.2} />
                                   <stop offset="95%" stopColor="#1f4842" stopOpacity={0} />
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                             <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                             <Area type="monotone" dataKey="value" stroke="#1f4842" strokeWidth={3} fillOpacity={1} fill="url(#colorValueSaving)" />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <AddPlanModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess}
        editingPlan={editingPlan}
      />

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Saving Plan"
        description={`Are you sure you want to delete "${selectedPlan?.name}"? This action cannot be undone.`}
        loading={loading}
      />
    </PageTemplate>
  );
}

function AddPlanModal({ isOpen, onClose, onSuccess, editingPlan }: any) {
  const { user } = useAuthStore();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const { addPlan, updatePlan, loading } = useSavingPlans();
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    if (editingPlan) {
      setValue('name', editingPlan.name);
      setValue('targetAmount', editingPlan.targetAmount);
      setValue('currentAmount', editingPlan.currentAmount);
      setValue('deadline', editingPlan.deadline ? new Date(editingPlan.deadline).toISOString().split('T')[0] : '');
      setValue('icon', editingPlan.icon);
      setValue('color', editingPlan.color || 'emerald');
      setValue('linkedAccountId', editingPlan.linkedAccountId || '');
    } else {
      reset();
    }
  }, [editingPlan, setValue, reset]);

  useEffect(() => {
    async function fetchAccounts() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAccounts(data.accounts || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (isOpen) fetchAccounts();
  }, [isOpen, user]);

  const onSubmit = async (data: any) => {
    try {
      if (editingPlan) {
        await updatePlan(editingPlan.id, data);
      } else {
        await addPlan(data);
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
            {editingPlan ? 'Edit Saving Plan' : 'Add New Plan'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Plan Name</label>
            <input 
              {...register('name', { required: 'Name is required' })}
              placeholder="e.g. New House, Dream Car"
              className={inputClass}
            />
            {errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.name.message as string}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Target Amount</label>
              <input 
                type="number"
                {...register('targetAmount', { required: 'Target is required' })}
                placeholder="0"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Current Balance</label>
              <input 
                type="number"
                {...register('currentAmount')}
                placeholder="0"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Due Date (Optional)</label>
              <input 
                type="date"
                {...register('deadline')}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Icon</label>
              <select {...register('icon')} className={inputClass}>
                <option value="Target">Target</option>
                <option value="Home">Home</option>
                <option value="Plane">Travel</option>
                <option value="Car">Car</option>
                <option value="Briefcase">Business</option>
                <option value="Wallet">Wallet</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Plan Color</label>
            <div className="flex gap-3">
              {['emerald', 'blue', 'purple', 'rose', 'amber', 'slate', 'brand'].map((c) => (
                <label key={c} className="relative cursor-pointer">
                  <input 
                    type="radio" 
                    value={c} 
                    {...register('color')} 
                    className="sr-only peer"
                  />
                  <div className={cn(
                    "w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-slate-900 dark:peer-checked:border-white transition-all",
                    c === 'emerald' ? 'bg-emerald-500' :
                    c === 'blue' ? 'bg-blue-500' :
                    c === 'purple' ? 'bg-purple-500' :
                    c === 'rose' ? 'bg-rose-500' :
                    c === 'amber' ? 'bg-amber-500' : 
                    c === 'brand' ? 'bg-[#1f4842]' : 'bg-slate-500'
                  )} />
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Linked Account (Auto-Save)</label>
            <select {...register('linkedAccountId')} className={inputClass}>
              <option value="">Manual Only</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance)})</option>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1f4842] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              {loading ? 'Processing...' : (editingPlan ? 'Save Changes' : 'Create Plan')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
