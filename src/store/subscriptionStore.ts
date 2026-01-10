import { create } from 'zustand';
import type { Subscription, Quota, SubscriptionTier } from '@/types';

interface SubscriptionState {
  subscription: Subscription | null;
  quota: Quota | null;
  tier: SubscriptionTier;
  setSubscription: (sub: Subscription | null) => void;
  setQuota: (quota: Quota | null) => void;
  setTier: (tier: SubscriptionTier) => void;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscription: null,
  quota: null,
  tier: 'free',
  setSubscription: (subscription) => {
    set({ subscription });
    if (subscription) {
      set({ tier: subscription.tier });
    }
  },
  setQuota: (quota) => set({ quota }),
  setTier: (tier) => set({ tier }),
  reset: () => set({ subscription: null, quota: null, tier: 'free' }),
}));
