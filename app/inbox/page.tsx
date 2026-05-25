"use client";

import React, { useMemo } from 'react';
import { Search, Mail, Bell, Circle, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import PageTemplate from '@/components/PageTemplate';

const messages = [
  { id: 1, sender: 'FinTrack Support', subject: 'Security Update', snippet: 'Your account security has been improved with...', date: '10:30 AM', unread: true },
  { id: 2, sender: 'Visa Alerts', subject: 'Transaction Successful', snippet: 'A transaction of Rp 1.250.000 was made at...', date: '09:15 AM', unread: false },
  { id: 3, sender: 'Saving Plans', subject: 'Goal Achieved!', snippet: 'Congratulations! You reached your goal for "Home Down Payment"...', date: 'Yesterday', unread: false },
  { id: 4, sender: 'Investment Team', subject: 'Market Analysis', snippet: 'Weekly market insights are now available for your review.', date: 'Oct 14', unread: false },
];

const InboxLabel = React.memo(({ icon: Icon, label, count, active }: any) => (
  <button className={cn(
    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors",
    active ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
  )}>
    <Icon className="w-4 h-4" />
    <span className="flex-1 text-left">{label}</span>
    {count && <span className="bg-[#1f4842] text-white text-[10px] px-1.5 py-0.5 rounded-full">{count}</span>}
  </button>
));
InboxLabel.displayName = 'InboxLabel';

export default function Inbox() {
  const memoizedMessages = useMemo(() => messages, []);

  return (
    <PageTemplate 
      title="Inbox" 
      subtitle="Pesan dan notifikasi untukmu"
    >
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <div className="flex items-center gap-3">
           <button className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-[#1f1f23] transition-colors">
              <Bell className="w-5 h-5" />
           </button>
           <button className="bg-[#1f4842] text-white px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2">
              <Mail className="w-4 h-4" /> New Message
           </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1f1f23] border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm flex" style={{ height: 'calc(100vh - 280px)' }}>
         {/* Sidebar - Labels */}
         <div className="w-64 border-r border-slate-100 dark:border-slate-700 p-4 space-y-1 hidden md:block">
            <InboxLabel icon={Mail} label="All Messages" count={2} active />
            <InboxLabel icon={Bell} label="Alerts" />
            <InboxLabel icon={Circle} label="Archived" />
         </div>

         {/* Message List */}
         <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-4">
               <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="Search messages..." 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f4842]/50 transition-all"
                  />
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto">
               {memoizedMessages.map((msg) => (
                  <div key={msg.id} className={cn(
                    "p-6 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-4",
                    msg.unread && "bg-emerald-50/20 dark:bg-[#1f4842]/5"
                  )}>
                     <div className={cn(
                       "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                       msg.unread ? "bg-[#1f4842] text-[#bdf29f]" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                     )}>
                        <Mail className="w-5 h-5" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                           <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{msg.sender}</div>
                           <div className="text-xs text-slate-400 whitespace-nowrap">{msg.date}</div>
                        </div>
                        <div className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-1 truncate">{msg.subject}</div>
                        <div className="text-xs text-slate-500 truncate">{msg.snippet}</div>
                     </div>
                     <button className="text-slate-300 hover:text-slate-500 self-center">
                        <MoreHorizontal className="w-5 h-5" />
                     </button>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </PageTemplate>
  );
}
