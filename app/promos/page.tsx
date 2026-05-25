"use client";

import React, { useMemo } from 'react';
import { Tag, ArrowRight, Gift, Percent, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import PageTemplate from '@/components/PageTemplate';

const promos = [
  { id: 1, title: 'Cashback 5% on Grocery', provider: 'Visa Platinum', expiry: 'Ends in 2 days', color: 'bg-emerald-500', icon: Percent },
  { id: 2, title: 'Buy 1 Get 1 Coffee', provider: 'Starbucks', expiry: 'Every Friday', color: 'bg-orange-500', icon: Gift },
  { id: 3, title: 'Diskon 50% Traveloka', provider: 'Freedom Card', expiry: 'Ends in 1 week', color: 'bg-blue-500', icon: Zap },
  { id: 4, title: 'Netflix 3 Months Free', provider: 'New Account', expiry: 'Limited Time', color: 'bg-red-500', icon: Gift },
];

export default function Promos() {
  const memoizedPromos = useMemo(() => promos, []);

  return (
    <PageTemplate 
      title="Promos & Offers" 
      subtitle="Temukan penawaran dan promo menarik untukmu"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1f4842] p-6 rounded-3xl text-white relative overflow-hidden shadow-lg h-48 flex flex-col justify-between">
           <div className="z-10">
              <h3 className="font-bold text-xl mb-1">Premium Perks</h3>
              <p className="text-white/80 text-sm">Exclusive offers for FinTrack Premium users.</p>
           </div>
           <button className="z-10 bg-white text-[#1f4842] px-4 py-2 rounded-xl text-sm font-bold w-fit flex items-center gap-2">
             Explore <ArrowRight className="w-4 h-4" />
           </button>
           <Tag className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
        </div>

        {memoizedPromos.map((promo) => (
          <div key={promo.id} className="bg-white dark:bg-[#1f1f23] p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:border-[#bdf29f] transition-colors cursor-pointer group">
            <div className="flex items-center gap-4 mb-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white", promo.color)}>
                <promo.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#1f4842] dark:group-hover:text-[#bdf29f] transition-colors">{promo.title}</div>
                <div className="text-xs text-slate-500">{promo.provider}</div>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-xl text-slate-500 font-medium">{promo.expiry}</span>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#1f4842] dark:group-hover:text-[#bdf29f] transition-all transform group-hover:translate-x-1" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1f1f23] p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
         <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-[#ecf4e9] dark:bg-[#1f4842]/30 text-[#1f4842] dark:text-[#bdf29f] rounded-full flex items-center justify-center mx-auto mb-6">
               <Gift className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Refer & Earn</h3>
            <p className="text-slate-500 dark:text-slate-400">Invite your friends to FinTrack and get Rp 50.000 for each successful referral.</p>
            <button className="bg-[#1f4842] text-white px-8 py-3 rounded-2xl font-bold hover:opacity-90 transition-opacity">
              Share Referral Link
            </button>
         </div>
      </div>
    </PageTemplate>
  );
}
