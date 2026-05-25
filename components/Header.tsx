"use client";

import React, { useEffect, useRef, useState } from "react";

import { usePathname } from "next/navigation";
import Link from 'next/link';
import { Sun, Moon, LogOut, User, Settings, Menu, Bell } from 'lucide-react';
import { useAuthStore } from '../lib/authStore';
import { navItems } from '../lib/navigation';
import { cn } from '../lib/utils';
import { useTheme } from "next-themes";

import { useNotifications } from '@/lib/hooks/useNotifications';

const timeAgo = (date: string | Date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) return `${diffInDays}d ago`;
  if (diffInHours > 0) return `${diffInHours}h ago`;
  if (diffInMins > 0) return `${diffInMins}m ago`;
  return 'Just now';
};

export function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, markAsRead, loading: notificationsLoading } = useNotifications();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentNav = navItems.find(item => item.path === pathname);
  const title = currentNav ? currentNav.label : 'Overview';
  const currentTheme = mounted ? (resolvedTheme || theme) : 'dark';

  if (!mounted) return (
    <header className="h-16 flex items-center justify-between px-2 shrink-0 z-20 relative">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-6">
        <div className="w-10 h-10 bg-slate-100 rounded-xl" />
      </div>
    </header>
  );

  return (
    <header className="h-16 flex items-center justify-between px-2 shrink-0 z-20 relative">
      <div className="flex items-center gap-6">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#18181b] transition-all duration-300 hover:scale-105 active:scale-95 xl:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden lg:block">
          <input
            type="text"
            placeholder="Search placeholder"
            className="w-64 bg-white dark:bg-[#18181b] transition-colors duration-300 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-4 pr-10 text-sm focus:bg-slate-100 dark:bg-slate-800 focus:outline-none transition-all text-slate-900 dark:text-slate-100 placeholder-slate-500"
          />
          <svg className="w-4 h-4 absolute right-4 top-2.5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>

        <div className="hidden xl:flex items-center gap-3">
          <button
            onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#18181b] transition-all duration-300 hover:scale-105 active:scale-95"
          >
            {currentTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#18181b] transition-colors duration-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative"
            >
              {unreadCount > 0 && (
                <div className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#18181b]" />
              )}
              <Bell className="w-5 h-5" />
            </button>

            {notificationOpen && (
              <div className="absolute right-0 top-full mt-3 w-80 bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 py-2">
                <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</p>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAsRead()}
                      className="text-[10px] font-bold text-[#1f4842] dark:text-[#bdf29f] hover:underline uppercase"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-slate-400 text-sm italic">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => !n.isRead && markAsRead(n.id)}
                        className={cn(
                          "px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border-b border-slate-100 dark:border-slate-800",
                          !n.isRead && "bg-slate-50/50 dark:bg-slate-800/20"
                        )}
                      >
                        <div className="flex gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                            n.type === 'transaction' ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" :
                              n.type === 'subscription' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" :
                                "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
                          )}>
                            <Bell className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm text-slate-900 dark:text-slate-100", !n.isRead ? "font-bold" : "font-medium")}>
                              {n.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.body}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                          </div>
                          {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full self-center" />}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800">
                  <Link href="/notifications" className="w-full text-center block text-sm font-bold text-[#1f4842] dark:text-[#bdf29f] hover:underline">
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="hidden xl:block pl-4 border-l border-slate-200 dark:border-slate-800 relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="flex flex-col items-end">
              <span className="font-medium text-sm text-slate-900 dark:text-slate-100 leading-none">{user?.displayName || "User"}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{user?.email || "user@example.com"}</span>
            </div>
            <img src={user?.photoURL || "https://ui-avatars.com/api/?name=User&background=random"} alt="Avatar" className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 py-2">
              <div className="px-4 py-2">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">My Account</p>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-1"></div>
              <button
                onClick={() => {
                  logout();
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
