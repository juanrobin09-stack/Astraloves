import { SubscriptionTier, getUserLimits } from './subscriptionLimits';

export interface UserSubscriptionData {
  premium_tier?: SubscriptionTier | null;
  daily_swipes?: number;
  daily_astra_messages?: number;
  daily_match_messages?: number;
  daily_super_likes?: number;
  weekly_lives?: number;
  live_reactions?: number;
  photos?: string[];
}

export const canSwipe = (user: UserSubscriptionData): boolean => {
  const limits = getUserLimits(user.premium_tier);
  if (limits.swipesPerDay === 'unlimited') return true;
  return (user.daily_swipes || 0) < limits.swipesPerDay;
};

export const getAstraLimit = (subscriptionTier?: SubscriptionTier | null): number => {
  const limits = getUserLimits(subscriptionTier);
  return limits.astraMessagesPerDay;
};

export const canMessageAstra = (user: UserSubscriptionData): boolean => {
  const limit = getAstraLimit(user.premium_tier);
  return (user.daily_astra_messages || 0) < limit;
};

export const canMessageMatch = (user: UserSubscriptionData): boolean => {
  const limits = getUserLimits(user.premium_tier);
  if (limits.matchMessagesPerDay === 'unlimited') return true;
  return (user.daily_match_messages || 0) < limits.matchMessagesPerDay;
};

export const getMaxPhotos = (subscriptionTier?: SubscriptionTier | null): number => {
  const limits = getUserLimits(subscriptionTier);
  return limits.maxPhotos;
};

export const canAddPhoto = (user: UserSubscriptionData): boolean => {
  const maxPhotos = getMaxPhotos(user.premium_tier);
  return (user.photos?.length || 0) < maxPhotos;
};

export const getMaxBioLength = (subscriptionTier?: SubscriptionTier | null): number => {
  const limits = getUserLimits(subscriptionTier);
  return typeof limits.bioMaxLength === 'number' ? limits.bioMaxLength : 5000;
};

export const canGoLive = (user: UserSubscriptionData): { allowed: boolean; reason?: string } => {
  const limits = getUserLimits(user.premium_tier);

  if (!limits.canGoLive) {
    return {
      allowed: false,
      reason: 'Le live est réservé aux membres Premium !'
    };
  }

  if (user.premium_tier === 'premium') {
    if (limits.livePerWeek !== 'unlimited' && (user.weekly_lives || 0) >= limits.livePerWeek) {
      return {
        allowed: false,
        reason: 'Tu as déjà fait ton live de la semaine. Passe Elite pour des lives illimités !'
      };
    }
  }

  return { allowed: true };
};

export const canReactInLive = (user: UserSubscriptionData): boolean => {
  const limits = getUserLimits(user.premium_tier);
  if (limits.liveReactionsPerDay === 'unlimited') return true;
  return (user.live_reactions || 0) < limits.liveReactionsPerDay;
};

export const getBoostMultiplier = (subscriptionTier?: SubscriptionTier | null): number => {
  const limits = getUserLimits(subscriptionTier);
  return limits.boostMultiplier;
};

export const getBadge = (subscriptionTier?: SubscriptionTier | null): string | null => {
  const limits = getUserLimits(subscriptionTier);
  return limits.badge || null;
};

export const canSuperLike = (user: UserSubscriptionData): { allowed: boolean; reason?: string } => {
  if (user.premium_tier !== 'elite') {
    return {
      allowed: false,
      reason: 'Les Super Likes sont réservés aux membres Elite !'
    };
  }

  const limits = getUserLimits(user.premium_tier);
  if ((user.daily_super_likes || 0) >= limits.superLikesPerDay) {
    return {
      allowed: false,
      reason: 'Tu as utilisé tes 10 Super Likes du jour !'
    };
  }

  return { allowed: true };
};

export const getSwipeLimit = (subscriptionTier?: SubscriptionTier | null): string => {
  const limits = getUserLimits(subscriptionTier);
  return limits.swipesPerDay === 'unlimited' ? '∞' : limits.swipesPerDay.toString();
};

export const getRemainingSwipes = (user: UserSubscriptionData): string => {
  const limits = getUserLimits(user.premium_tier);
  if (limits.swipesPerDay === 'unlimited') return '∞';
  const remaining = limits.swipesPerDay - (user.daily_swipes || 0);
  return `${Math.max(0, remaining)}`;
};

export const getRemainingAstraMessages = (user: UserSubscriptionData): string => {
  const limit = getAstraLimit(user.premium_tier);
  const remaining = limit - (user.daily_astra_messages || 0);
  return `${Math.max(0, remaining)}/${limit}`;
};
