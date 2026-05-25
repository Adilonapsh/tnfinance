"use client";

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Calendar, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import PageTemplate from '@/components/PageTemplate';

const spendingData = [
  { name: 'Mon', amount: 150000 },
  { name: 'Tue', amount: 230000 },
  { name: 'Wed', amount: 450000 },
  { name: 'Thu', amount: 120000 },
  { name: 'Fri', amount: 380000 },
  { name: 'Sat', amount: 850000 },
  { name: 'Sun', amount: 420000 },
];

const categoryData = [
  { category: 'Housing', current: 2500000, previous: 2500000 },
  { category: 'Food', current: 1800000, previous: 2100000 },
  { category: 'Transport', current: 800000, previous: 750000 },
  { category: 'Health', current: 500000, previous: 300000 },
  { category: 'Others', current: 400000, previous: 600000 },
];

const SummaryItem = React.memo(({ label, amount, icon: Icon, color }: any) => (
  <div className="flex items-center gap-4">
     <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
        <Icon className="w-5 h-5" />
     </div>
     <div>
        <div className="text-xs text-white/60 font-medium">{label}</div>
        <div className={cn("text-lg font-bold", color)}>{formatCurrency(amount)}</div>
     </div>
  </div>
));
SummaryItem.displayName = 'SummaryItem';

export default function Insights() {
  const memoizedSpending = useMemo(() => spendingData, []);
  const memoizedCategories = useMemo(() => categoryData, []);

  return (
    <PageTemplate 
      title="Financial Insights" 
      subtitle="Lihat analisis keuanganmu secara mendalam"
    >
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <div className="flex items-center gap-2 bg-white dark:bg-[#1f1f23] p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
           <button className="px-4 py-1.5 bg-[#1f4842] text-white rounded-xl text-sm font-bold">Week</button>
           <button className="px-4 py-1.5 text-slate-500 text-sm font-bold">Month</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white dark:bg-[#1f1f23] p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Spending Analysis</h3>
                    <p className="text-sm text-slate-500">Your average daily spend is {formatCurrency(375000)}</p>
                 </div>
                 <div className="text-right">
                    <div className="text-2xl font-bold text-[#1f4842] dark:text-[#bdf29f] mb-1">{formatCurrency(2600000)}</div>
                    <div className="text-xs font-bold text-red-500 flex items-center justify-end gap-1">
                       <ArrowUpRight className="w-3 h-3" /> +15.4% vs last week
                    </div>
                 </div>
              </div>

              <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={memoizedSpending}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                       <YAxis hide />
                       <Tooltip 
                         cursor={{ fill: '#f8fafc' }}
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                         formatter={(val) => formatCurrency(Number(val))}
                       />
                       <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                          {memoizedSpending.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={index === 5 ? '#1f4842' : '#bdf29f'} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-white dark:bg-[#1f1f23] p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">Category Comparison</h3>
              <div className="space-y-6">
                 {memoizedCategories.map((item) => {
                    const diff = ((item.current - item.previous) / item.previous) * 100;
                    const isIncrease = diff > 0;
                    return (
                       <div key={item.category} className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                             <span className="font-bold text-slate-800 dark:text-slate-200">{item.category}</span>
                             <div className="flex items-center gap-4">
                                <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(item.current)}</span>
                                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-xl", isIncrease ? "bg-red-500/10 text-red-500" : "bg-[#ecf4e9] dark:bg-[#1f4842]/20 text-[#1f4842] dark:text-[#bdf29f]")}>
                                   {isIncrease ? "+" : ""}{diff.toFixed(1)}%
                                </span>
                             </div>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                             <div className="bg-[#1f4842] dark:bg-[#bdf29f] h-2 rounded-full" style={{ width: `${Math.min((item.current / 3000000) * 100, 100)}%` }}></div>
                          </div>
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-[#1f4842] p-8 rounded-3xl text-white shadow-lg space-y-6">
              <h3 className="font-bold text-xl">Monthly Summary</h3>
              <div className="space-y-4">
                 <SummaryItem label="Total Savings" amount={12450000} icon={TrendingUp} color="text-[#bdf29f]" />
                 <SummaryItem label="Total Debt" amount={2300000} icon={TrendingDown} color="text-red-400" />
                 <SummaryItem label="Next Bill" amount={850000} icon={Calendar} color="text-blue-300" />
              </div>
              <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 py-3 rounded-2xl font-bold transition-colors">
                 Full Report PDF
              </button>
           </div>

           <div className="bg-white dark:bg-[#1f1f23] p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">AI Advice</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">
                Based on your weekend spending pattern, you could save up to <span className="text-[#1f4842] dark:text-[#bdf29f] font-bold">{formatCurrency(1200000)}</span> more monthly by reducing entertainment costs on Saturdays.
              </p>
           </div>
        </div>
      </div>
    </PageTemplate>
  );
}
