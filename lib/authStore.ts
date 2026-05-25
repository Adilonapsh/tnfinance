import { create } from 'zustand';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  isSignUp: boolean;
  setIsSignUp: (val: boolean) => void;
  setError: (err: string | null) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: true,
  error: null,
  isSignUp: false,

  setIsSignUp: (val) => set({ isSignUp: val, error: null }),
  setError: (err) => set({ error: err }),

  signInWithGoogle: async () => {
    set({ error: null });
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      let errorMessage = 'Gagal login dengan Google';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Popup ditutup sebelum login selesai';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Permintaan login dibatalkan';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Tidak ada koneksi internet';
      }
      set({ error: errorMessage });
      throw error;
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    set({ error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      let errorMessage = 'Gagal login dengan email';
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email tidak valid';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Akun ini dinonaktifkan';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Akun tidak ditemukan';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Password salah';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Tidak ada koneksi internet';
      }
      set({ error: errorMessage });
      throw error;
    }
  },

  signUpWithEmail: async (email: string, password: string) => {
    set({ error: null });
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      let errorMessage = 'Gagal mendaftar';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email sudah digunakan';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email tidak valid';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Operasi tidak diizinkan';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password terlalu lemah (min 6 karakter)';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Tidak ada koneksi internet';
      }
      set({ error: errorMessage });
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
    }
  },

  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
    });
    return unsubscribe;
  },
}));
