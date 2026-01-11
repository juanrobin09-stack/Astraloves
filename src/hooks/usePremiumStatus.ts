// ═══════════════════════════════════════════════════════════════════════
// USE PREMIUM STATUS HOOK
// ═══════════════════════════════════════════════════════════════════════

import { useAuth } from './useAuth';

type PremiumTier = 'free' | 'premium' | 'premium+elite' | 'elite';

export const usePremiumStatus = () => {
  const { subscription } = useAuth();

  const isPremium = subscription?.status === 'active' || subscription?.status === 'trialing';
  
  // Déterminer le tier basé sur le plan
  let premiumTier: PremiumTier = 'free';
  
  if (isPremium && subscription?.plan_name) {
    const planLower = subscription.plan_name.toLowerCase();
    if (planLower.includes('elite')) {
      premiumTier = 'elite';
    } else if (planLower.includes('premium')) {
      premiumTier = 'premium';
    }
  }

  return {
    isPremium,
    premiumTier,
    subscription,
  };
};
