import React from 'react';
import { Tag, FileText, CheckCircle } from 'lucide-react';

export function Promos() {
  return (
    <div className="space-y-6 flex flex-col items-center justify-center p-10 text-center">
       <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-6">
          <Tag className="w-10 h-10" />
       </div>
       <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">You have no active promos</h2>
       <p className="text-slate-500 dark:text-slate-400 max-w-md">
         Keep using your FinTrack cards to unlock special cashbacks, partner discounts, and VIP event access. We will notify you here when you have a new offer!
       </p>
    </div>
  );
}

export function Invoices() {
   return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Invoices</h2>
        <button className="flex items-center gap-2 bg-[#1f4842] text-white px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-colors">
           New Invoice
        </button>
      </div>

      <div className="bg-white dark:bg-[#18181b] transition-colors duration-300 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center h-64 text-center">
         <FileText className="w-12 h-12 text-slate-600 mb-4" />
         <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300 mb-2">No pending invoices</h3>
         <p className="text-sm text-slate-500">You're all caught up! Create an invoice to request payments.</p>
      </div>
    </div>
   );
}
