"use client";

import React from 'react';
import { useAuthStore } from '@/lib/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LogIn, Mail, Lock, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface LoginFormInputs {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { user, isSignUp, error, setIsSignUp, setError, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuthStore();
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<LoginFormInputs>();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      if (isSignUp) {
        await signUpWithEmail(data.email, data.password);
      } else {
        await signInWithEmail(data.email, data.password);
      }
      reset();
    } catch (err) {
      // Error sudah di-handle di store
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#18181b]">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#1f4842] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-[#bdf29f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">FinTrack</h1>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {isSignUp ? 'Create your account' : 'Sign in to FinTrack'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {isSignUp ? 'Start managing your finances today' : 'Welcome back! Please enter your details'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  {...register('email', { required: true })}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1f1f23] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1f4842]/50 focus:border-[#1f4842] transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: true })}
                  className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1f1f23] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1f4842]/50 focus:border-[#1f4842] transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex justify-end">
                <button type="button" className="text-sm font-medium text-[#1f4842] dark:text-[#bdf29f] hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm bg-red-50 dark:bg-red-500/10 px-4 py-3 rounded-2xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 text-base font-semibold rounded-2xl bg-[#1f4842] text-white hover:bg-[#2d5a53] transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-50 dark:bg-[#18181b] text-slate-500 dark:text-slate-400">
                or continue with
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              signInWithGoogle();
              setError(null);
            }}
            className="w-full py-4 px-6 text-base font-semibold rounded-2xl bg-white dark:bg-[#1f1f23] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          <div className="mt-10 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                reset();
              }}
              className="text-sm font-medium text-[#1f4842] dark:text-[#bdf29f] hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Create one'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-[#1f4842] items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#bdf29f]/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#bdf29f]/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-lg text-center">
          <div className="mb-8">
            <div className="w-32 h-32 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
              <svg className="w-16 h-16 text-[#bdf29f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Take control of your finances
          </h2>
          <p className="text-lg text-[#bdf29f]/90 leading-relaxed">
            Track your expenses, investments, and savings all in one beautiful place. Start your journey to financial freedom today.
          </p>
        </div>
      </div>
    </div>
  );
}
