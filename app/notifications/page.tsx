"use client";

import React from 'react';
import { Bell, Check, Trash2, Filter } from 'lucide-react';
import PageTemplate from '../../components/PageTemplate';
import { useNotifications } from '../../lib/hooks/useNotifications';
import { cn } from '../../lib/utils';

const timeAgo = (date: string | Date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) return `${diffInDays} hari yang lalu`;
  if (diffInHours > 0) return `${diffInHours} jam yang lalu`;
  if (diffInMins > 0) return `${diffInMins} menit yang lalu`;
  return 'Baru saja';
};

export default function NotificationsPage() {
  const { notifications, loading, unreadCount, markAsRead } = useNotifications();

  return (
    <PageTemplate 
      title="Notifications" 
      subtitle="Pantau semua aktivitas dan pemberitahuan akunmu"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="bg-[#1f4842] text-white px-3 py-1 rounded-full text-xs font-bold">
            {unreadCount} Unread
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => markAsRead()}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#1f4842] dark:hover:text-[#bdf29f] transition-colors"
          >
            <Check className="w-4 h-4" /> Mark all as read
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1f1f23] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-50 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Bell className="w-16 h-16 opacity-10 mb-4" />
            <p className="text-lg font-medium">Belum ada notifikasi</p>
            <p className="text-sm">Kami akan memberi tahu Anda jika ada aktivitas baru.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={cn(
                  "p-6 flex gap-4 transition-colors",
                  !n.isRead ? "bg-[#ecf4e9]/30 dark:bg-[#1f4842]/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",
                  n.type === 'transaction' ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" :
                  n.type === 'subscription' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" :
                  "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
                )}>
                  <Bell className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={cn(
                      "text-base text-slate-900 dark:text-slate-100",
                      !n.isRead ? "font-bold" : "font-medium"
                    )}>
                      {n.title}
                    </h3>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                    {n.body}
                  </p>
                  
                  {!n.isRead && (
                    <button 
                      onClick={() => markAsRead(n.id)}
                      className="text-xs font-bold text-[#1f4842] dark:text-[#bdf29f] hover:underline uppercase tracking-wider"
                    >
                      Tandai sudah dibaca
                    </button>
                  )}
                </div>

                {!n.isRead && (
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2" title="Unread" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTemplate>
  );
}
