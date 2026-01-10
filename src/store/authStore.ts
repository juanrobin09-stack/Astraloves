// ═══════════════════════════════════════════════════════════════════════
// AUTH STORE - Zustand
// ═══════════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import type { Profile, Subscription } from '@/types';

interface AuthState {
  user: any | null;
  profile: Profile | null;
  subscription: Subscription | null;
  isLoading: boolean;
  setUser: (user: any) => void;
  setProfile: (profile: Profile | null) => void;
  setSubscription: (subscription: Subscription | null) => void;
  setIsLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  subscription: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setSubscription: (subscription) => set({ subscription }),
  setIsLoading: (isLoading) => set({ isLoading }),
  clear: () => set({ user: null, profile: null, subscription: null }),
}));
