"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Sun, Moon, User, Settings, Bell } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from "next-themes";
import { useAuthStore } from '../lib/authStore';
import { cn } from '../lib/utils';
import { navItems } from '../lib/navigation';

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  const currentTheme = mounted ? (resolvedTheme || theme) : 'dark';

  return (
    <aside className="w-80 bg-white dark:bg-[#18181b] transition-colors duration-300 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col p-6 hide-scrollbar overflow-y-auto shrink-0">
      <div className="flex items-center gap-3 mb-10 px-4 text-white">
        <div className="w-12 h-12 bg-[#1f4842] rounded-2xl flex items-center justify-center font-bold text-2xl text-[#bdf29f]">
          F
        </div>
        <span className="text-2xl font-bold tracking-tight uppercase text-slate-900 dark:text-white">FinTrack</span>
      </div>
  
      <nav className="flex-1 px-2 py-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-[10px] items-center justify-center font-bold px-1.5 py-0.5 rounded-full flex">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 xl:hidden">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white w-full transition-colors relative"
          >
            <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#18181b]" />
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </button>

          {notificationOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 py-2">
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</p>
              </div>
              <div className="max-h-72 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border-b border-slate-100 dark:border-slate-800">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">New Invoice Created</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">You have created a new invoice #INV-2026-004</p>
                      <p className="text-[10px] text-slate-400 mt-1">2 minutes ago</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border-b border-slate-100 dark:border-slate-800">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Payment Reminder</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Invoice #INV-2026-003 is due tomorrow</p>
                      <p className="text-[10px] text-slate-400 mt-1">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800">
                <button className="w-full text-sm font-bold text-[#1f4842] dark:text-[#bdf29f] hover:underline">
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white w-full transition-colors"
        >
          {currentTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span>{currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* Profile */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white w-full transition-colors"
          >
            <img src={user?.photoURL || "https://ui-avatars.com/api/?name=User&background=random"} alt="Avatar" className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
            <div className="flex flex-col items-start">
              <span className="font-medium text-sm text-slate-900 dark:text-slate-100 leading-none">{user?.displayName || "User"}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">{user?.email || "user@example.com"}</span>
            </div>
          </button>

          {dropdownOpen && (
            <div className="mt-2 w-full bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 py-2">
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
    </aside>
  );
}
