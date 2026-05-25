"use client";

import React from 'react';
import { Send, Plus } from 'lucide-react';
import PageTemplate from '@/components/PageTemplate';

export default function Payments() {
  return (
    <PageTemplate 
      title="Payments & Transfers" 
      subtitle="Kirim dan terima uang dengan mudah"
    >
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <button className="flex items-center gap-2 bg-[#1f4842] text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:opacity-90 transition-colors">
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1f1f23] p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-6">Quick Transfer</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 mb-2 block font-medium">To / Recipient</label>
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ecf4e9] text-[#1f4842] rounded-xl flex items-center justify-center font-bold">AL</div>
                <input type="text" placeholder="Alex Johnson" className="bg-transparent border-none text-slate-800 dark:text-slate-200 outline-none w-full" defaultValue="alex.j@email.com" />
              </div>
            </div>
            
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 mb-2 block font-medium">Amount</label>
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-3">
                <span className="text-slate-500 font-bold text-lg">Rp </span>
                <input type="number" placeholder="0.00" className="bg-transparent border-none text-2xl font-bold text-slate-900 dark:text-slate-100 outline-none w-full" defaultValue="250000" />
              </div>
            </div>
            
            <button className="w-full bg-[#1f4842] hover:opacity-90 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-2 transition-colors mt-2">
              <Send className="w-4 h-4" /> Send Money
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#1f1f23] p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Recent Contacts</h3>
            <button className="text-sm text-[#1f4842] dark:text-[#bdf29f] font-medium hover:opacity-80">View Directory</button>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mb-4">
            {[
              { name: 'Sarah', init: 'S', color: 'bg-blue-500/10 text-blue-500' },
              { name: 'Mike', init: 'M', color: 'bg-orange-500/10 text-orange-500' },
              { name: 'Emma', init: 'E', color: 'bg-pink-500/10 text-pink-500' },
              { name: 'Add', init: <Plus className="w-5 h-5 mx-auto" />, color: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 border-dashed' }
            ].map(c => (
              <div key={c.name} className="flex flex-col items-center gap-2 cursor-pointer">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold ${c.color}`}>
                  {c.init}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}
