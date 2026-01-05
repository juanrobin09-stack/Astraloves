import { SubscriptionTier } from './subscriptionLimits';
import { getBoostMultiplier } from './premiumRestrictions';

export interface VisibilityScore {
  baseScore: number;
  boostMultiplier: number;
  finalScore: number;
  tier: string;
}

export const calculateVisibilityScore = (
  subscriptionTier: SubscriptionTier | null | undefined,
  baseScore: number = 50
): VisibilityScore => {
  const boostMultiplier = getBoostMultiplier(subscriptionTier);
  const finalScore = Math.min(100, baseScore * boostMultiplier);

  let tier = 'Gratuit';
  if (subscriptionTier === 'premium') tier = 'Premium (x3)';
  if (subscriptionTier === 'premium_elite') tier = 'Elite (x10)';

  return {
    baseScore,
    boostMultiplier,
    finalScore,
    tier
  };
};

export const getVisibilityBadgeColor = (subscriptionTier: SubscriptionTier | null | undefined): string => {
  if (subscriptionTier === 'premium_elite') return 'from-yellow-500 to-orange-500';
  if (subscriptionTier === 'premium') return 'from-red-500 to-pink-500';
  return 'from-gray-600 to-gray-500';
};

export const getVisibilityMessage = (subscriptionTier: SubscriptionTier | null | undefined): string => {
  if (subscriptionTier === 'premium_elite') {
    return 'Ton profil est boosté x10 ! Tu apparais en priorité dans toutes les recherches. 👑';
  }
  if (subscriptionTier === 'premium') {
    return 'Ton profil est boosté x3 ! Tu es plus visible dans les recherches. 💎';
  }
  return 'Boost ton profil avec Premium pour être plus visible ! ⚡';
};
