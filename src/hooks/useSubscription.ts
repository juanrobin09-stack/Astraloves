import { useMemo } from 'react';
import { useAuth } from './useAuth';
import type { SubscriptionTier } from '@/types';

export const useSubscription = () => {
  const { subscription } = useAuth();

  const tier: SubscriptionTier = useMemo(() => {
    return subscription?.tier || 'free';
  }, [subscription]);

  const isFree = tier === 'free';
  const isPremium = tier === 'premium';
  const isElite = tier === 'elite';
  const isPremiumOrElite = isPremium || isElite;

  return { tier, isFree, isPremium, isElite, isPremiumOrElite, subscription };
};
