"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuthStore } from "@/lib/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [syncing, setSyncing] = useState(true);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user && pathname !== '/login') {
      router.push('/login');
      setSyncing(false);
      return;
    }

    if (!authLoading && user) {
      // Sync Firebase user to PostgreSQL on every login
      const syncUser = async () => {
        try {
          const token = await user.getIdToken();
          await fetch('/api/user/sync', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              displayName: user.displayName,
              photoUrl: user.photoURL,
              emailVerified: user.emailVerified,
            }),
          });
        } catch (error) {
          console.error('Error syncing user to Postgres:', error);
        } finally {
          setSyncing(false);
        }
      };
      syncUser();
    } else if (!authLoading) {
      setSyncing(false);
    }
  }, [user, authLoading, router, pathname]);

  // Tutup sidebar mobile ketika path berubah
  useEffect(() => {
    setSidebarMobileOpen(false);
  }, [pathname]);

  if (authLoading || syncing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#18181b]">
        <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-[#1f4842] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user && pathname !== '/login') {
    return null;
  }

  if (pathname === '/login' || pathname === '/onboarding') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-[#18181b] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans p-4 gap-4">
      {/* Desktop Sidebar */}
      <div className="hidden xl:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay & Sidebar */}
      {sidebarMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 xl:hidden"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}
      <div className={`fixed inset-y-4 left-0 z-50 xl:hidden transition-transform duration-300 ${sidebarMobileOpen ? 'translate-x-4' : '-translate-x-[120%]'}`}>
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
        <Header onToggleSidebar={() => setSidebarMobileOpen(!sidebarMobileOpen)} />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto relative hide-scrollbar pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
