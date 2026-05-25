'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, Wallet, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Selamat Datang di FinTrack!',
    description: 'Kelola keuanganmu dengan mudah dan efisien.',
  },
  {
    id: 'profile',
    title: 'Lengkapi Profil',
    description: 'Siapa nama kamu?',
  },
  {
    id: 'currency',
    title: 'Pilih Mata Uang',
    description: 'Mata uang apa yang kamu gunakan?',
  },
  {
    id: 'account',
    title: 'Tambah Akun Pertama',
    description: 'Mulai dengan menambah akun keuanganmu.',
  },
  {
    id: 'complete',
    title: 'Siap Memulai!',
    description: 'Kamu sudah siap mengelola keuanganmu.',
  },
];

const CURRENCIES = [
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
];

const ACCOUNT_TYPES = [
  { type: 'cash', name: 'Tunai', icon: '💵' },
  { type: 'bank', name: 'Rekening Bank', icon: '🏦' },
  { type: 'ewallet', name: 'E-Wallet', icon: '📱' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('IDR');
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<'cash' | 'bank' | 'ewallet'>('cash');
  const [initialBalance, setInitialBalance] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminSettings, setAdminSettings] = useState<{ enableOnboarding: boolean } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    const fetchAdminSettings = async () => {
      try {
        const docRef = doc(db, 'admin_settings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAdminSettings(docSnap.data() as any);
        } else {
          setAdminSettings({ enableOnboarding: true });
        }
      } catch (error) {
        setAdminSettings({ enableOnboarding: true });
      }
    };

    fetchAdminSettings();

    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && adminSettings) {
      if (!adminSettings.enableOnboarding) {
        completeOnboarding();
        return;
      }

      const checkUserOnboarding = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.onboardingCompleted) {
              router.push('/');
            }
          }
        } catch (error) {
          console.error('Error checking onboarding:', error);
        }
      };

      checkUserOnboarding();
    }
  }, [user, loading, adminSettings, router]);

  const completeOnboarding = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const userData = {
        uid: user.uid,
        email: user.email || '',
        emailVerified: user.emailVerified || false,
        displayName: displayName || user.displayName || 'User',
        photoURL: user.photoURL || '',
        currency: selectedCurrency,
        locale: 'id-ID',
        timezone: 'Asia/Jakarta',
        dateFormat: 'DD/MM/YYYY',
        isPremium: false,
        onboardingCompleted: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), userData, { merge: true });

      if (accountName && currentStep === ONBOARDING_STEPS.length - 2) {
        const accountData = {
          userId: user.uid,
          name: accountName,
          type: accountType,
          balance: parseFloat(initialBalance) || 0,
          currency: selectedCurrency,
          color: '#1f4842',
          icon: accountType === 'cash' ? 'wallet' : accountType === 'bank' ? 'building' : 'smartphone',
          includeInNetWorth: true,
          isActive: true,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await setDoc(doc(db, 'accounts', crypto.randomUUID()), accountData);
      }

      router.push('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  if (loading || !adminSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#18181b]">
        <div className="w-10 h-10 border-3 border-[#1f4842]/30 border-t-[#1f4842] rounded-full animate-spin"></div>
      </div>
    );
  }

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#18181b] p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-[#1f4842] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-[#bdf29f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">FinTrack</h1>
          </div>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index < currentStep 
                  ? 'w-8 bg-[#1f4842]' 
                  : index === currentStep 
                    ? 'w-8 bg-[#1f4842]' 
                    : 'w-2 bg-slate-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>

        <div className="bg-white dark:bg-[#1f1f23] rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">
            {step.title}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-center mb-8">
            {step.description}
          </p>

          {step.id === 'welcome' && (
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-[#1f4842]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-[#1f4842]" />
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Mulai perjalananmu menuju kebebasan finansial bersama FinTrack!
              </p>
            </div>
          )}

          {step.id === 'profile' && (
            <div className="space-y-4">
              <div className="w-20 h-20 bg-[#1f4842]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="w-10 h-10 text-[#1f4842]" />
              </div>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Masukkan nama kamu"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1f4842]/50"
              />
            </div>
          )}

          {step.id === 'currency' && (
            <div className="grid grid-cols-2 gap-3">
              {CURRENCIES.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => setSelectedCurrency(currency.code)}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    selectedCurrency === currency.code
                      ? 'border-[#1f4842] bg-[#1f4842]/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{currency.symbol}</div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{currency.code}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{currency.name}</div>
                </button>
              ))}
            </div>
          )}

          {step.id === 'account' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {ACCOUNT_TYPES.map((type) => (
                  <button
                    key={type.type}
                    onClick={() => setAccountType(type.type as any)}
                    className={`p-3 rounded-2xl border-2 transition-all ${
                      accountType === type.type
                        ? 'border-[#1f4842] bg-[#1f4842]/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-xs font-medium text-slate-900 dark:text-white">{type.name}</div>
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Nama akun (misal: Dompet, BNI)"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1f4842]/50"
              />
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  {CURRENCIES.find(c => c.code === selectedCurrency)?.symbol}
                </span>
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  placeholder="Saldo awal"
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1f4842]/50"
                />
              </div>
            </div>
          )}

          {step.id === 'complete' && (
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-[#bdf29f] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-[#1f4842]" />
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Selamat! Kamu siap mengelola keuanganmu dengan FinTrack.
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="flex-1 py-3 px-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Kembali
              </button>
            )}
            <button
              onClick={nextStep}
              disabled={isSubmitting}
              className={`flex-1 py-3 px-6 rounded-2xl bg-[#1f4842] text-white hover:bg-[#2d5a53] transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                currentStep === 0 ? 'flex-1' : currentStep > 0 ? 'flex-[2]' : 'flex-1'
              }`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : currentStep === ONBOARDING_STEPS.length - 1 ? (
                <>
                  Selesai
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  Selanjutnya
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {currentStep < ONBOARDING_STEPS.length - 1 && (
            <button
              onClick={skipOnboarding}
              className="w-full mt-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              Lewati
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
