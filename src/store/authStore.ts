import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { User } from '../types';
import {
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  getSession,
  getCurrentUser,
} from '../services/supabase/authService';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    username: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  // ─── Initial state ─────────────────────────────────────────
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  // ─── Actions ───────────────────────────────────────────────
  setUser: (user) =>
    set({ user, isAuthenticated: user !== null }),

  setSession: (session) =>
    set({ session }),

  signIn: async (email, password) => {
    set({ isLoading: true });
    const { data, error } = await authSignIn(email, password);
    if (error || !data) {
      set({ isLoading: false });
      return { error: error ?? 'Sign in failed' };
    }
    set({ user: data, isAuthenticated: true, isLoading: false });
    return { error: null };
  },

  signUp: async (email, password, username) => {
    set({ isLoading: true });
    const { data, error } = await authSignUp(email, password, username);
    if (error || !data) {
      set({ isLoading: false });
      return { error: error ?? 'Sign up failed' };
    }
    set({ user: data, isAuthenticated: true, isLoading: false });
    return { error: null };
  },

  signOut: async () => {
    set({ isLoading: true });
    await authSignOut();
    set({ user: null, session: null, isAuthenticated: false, isLoading: false });
  },

  initialize: async () => {
    set({ isLoading: true });
    const { data: session } = await getSession();
    if (!session) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    const { data: user } = await getCurrentUser();
    set({
      session,
      user,
      isAuthenticated: user !== null,
      isLoading: false,
    });
  },
}));
