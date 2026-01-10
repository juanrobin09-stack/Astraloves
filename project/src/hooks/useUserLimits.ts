import { useMemo } from 'react';

export interface PlanLimits {
  swipesPerDay: number;
  messagesAstraPerDay: number;
  messagesMatchsPerDay: number;
  superLikesPerDay: number;
  maxPhotos: number;
  maxBioLength: number;
  boostMultiplier: number;
  hasAdvancedAstro: boolean;
  hasAICoach: boolean;
  hasIncognito: boolean;
  canSeeVisitors: boolean;
  hasEliteBadge: boolean;
  hasPremiumBadge: boolean;
  hasAdvancedFilters: boolean;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    swipesPerDay: 10,
    messagesAstraPerDay: 10,
    messagesMatchsPerDay: 20,
    superLikesPerDay: 0,
    maxPhotos: 5,
    maxBioLength: 200,
    boostMultiplier: 1,
    hasAdvancedAstro: false,
    hasAICoach: false,
    hasIncognito: false,
    canSeeVisitors: false,
    hasEliteBadge: false,
    hasPremiumBadge: false,
    hasAdvancedFilters: false
  },
  premium: {
    swipesPerDay: Infinity,
    messagesAstraPerDay: 40,
    messagesMatchsPerDay: Infinity,
    superLikesPerDay: 0,
    maxPhotos: 10,
    maxBioLength: 500,
    boostMultiplier: 3,
    hasAdvancedAstro: true,
    hasAICoach: false,
    hasIncognito: false,
    canSeeVisitors: false,
    hasEliteBadge: false,
    hasPremiumBadge: true,
    hasAdvancedFilters: false
  },
  premium_elite: {
    swipesPerDay: Infinity,
    messagesAstraPerDay: 65,
    messagesMatchsPerDay: Infinity,
    superLikesPerDay: 10,
    maxPhotos: 20,
    maxBioLength: Infinity,
    boostMultiplier: 10,
    hasAdvancedAstro: true,
    hasAICoach: true,
    hasIncognito: true,
    canSeeVisitors: true,
    hasEliteBadge: true,
    hasPremiumBadge: false,
    hasAdvancedFilters: true
  }
};

export function useUserLimits(plan: string = 'free'): PlanLimits {
  return useMemo(() => {
    return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  }, [plan]);
}

export function getPlanLimits(plan: string = 'free'): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}
