'use client';

import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Settings, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({
    enableOnboarding: true,
    onboardingSteps: ['welcome', 'profile', 'currency', 'account', 'complete'],
    enablePremiumFeatures: false,
    maintenanceMode: false,
    maintenanceMessage: '',
    latestAppVersion: '1.0.0',
    forceUpdateVersion: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'admin_settings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error('Error fetching admin settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'admin_settings', 'global'), {
        ...settings,
        updatedAt: new Date(),
      }, { merge: true });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving admin settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#18181b]">
        <div className="w-10 h-10 border-3 border-[#1f4842]/30 border-t-[#1f4842] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-[#1f4842] rounded-xl flex items-center justify-center">
          <Settings className="w-6 h-6 text-[#bdf29f]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Settings</h1>
          <p className="text-slate-500 dark:text-slate-400">Kelola pengaturan global aplikasi</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1f1f23] rounded-3xl p-8 shadow-lg space-y-8">
        {success && (
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-2xl">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300 font-medium">Pengaturan berhasil disimpan!</span>
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Onboarding
          </h2>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <div>
                <div className="font-medium text-slate-900 dark:text-white">Enable Onboarding</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Tampilkan onboarding untuk user baru</div>
              </div>
              <input
                type="checkbox"
                checked={settings.enableOnboarding}
                onChange={(e) => setSettings(prev => ({ ...prev, enableOnboarding: e.target.checked }))}
                className="w-6 h-6 rounded border-slate-300 text-[#1f4842] focus:ring-[#1f4842]"
              />
            </label>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-8 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Maintenance Mode</h2>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <div>
                <div className="font-medium text-slate-900 dark:text-white">Enable Maintenance Mode</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Tampilkan pesan maintenance ke semua user</div>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                className="w-6 h-6 rounded border-slate-300 text-[#1f4842] focus:ring-[#1f4842]"
              />
            </label>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Maintenance Message
              </label>
              <textarea
                value={settings.maintenanceMessage}
                onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMessage: e.target.value }))}
                placeholder="Pesan yang ditampilkan saat maintenance mode"
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1f4842]/50"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-8 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">App Version</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Latest App Version
              </label>
              <input
                type="text"
                value={settings.latestAppVersion}
                onChange={(e) => setSettings(prev => ({ ...prev, latestAppVersion: e.target.value }))}
                placeholder="1.0.0"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1f4842]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Force Update Version
              </label>
              <input
                type="text"
                value={settings.forceUpdateVersion}
                onChange={(e) => setSettings(prev => ({ ...prev, forceUpdateVersion: e.target.value }))}
                placeholder="Kosongkan jika tidak perlu force update"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1f4842]/50"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-8 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Premium Features</h2>
          
          <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Enable Premium Features</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Aktifkan fitur premium untuk semua user</div>
            </div>
            <input
              type="checkbox"
              checked={settings.enablePremiumFeatures}
              onChange={(e) => setSettings(prev => ({ ...prev, enablePremiumFeatures: e.target.checked }))}
              className="w-6 h-6 rounded border-slate-300 text-[#1f4842] focus:ring-[#1f4842]"
            />
          </label>
        </div>

        <div className="pt-4">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full py-4 px-6 text-base font-semibold rounded-2xl bg-[#1f4842] text-white hover:bg-[#2d5a53] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Simpan Pengaturan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
