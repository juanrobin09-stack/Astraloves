import { useState, useEffect } from 'react';

export interface DailyUsage {
  signals: number;
  astraMessages: number;
  matchMessages: number;
  starsViewed: number;
  date: string;
}

export interface PlanLimits {
  signalsPerDay: number;
  superNovaPerDay?: number;
  astraMessagesPerDay: number;
  matchMessagesPerDay: number;
  starsViewable: number;
  maxPhotos: number;
  bioMaxLength: number;
  canSeeWhoSignaled: boolean;
  canSeeWhen?: boolean;
  hasBoost: boolean;
  boostMultiplier?: number;
  profilesBlurred: boolean;
  hasBadge?: boolean;
  superLikesPerDay?: number;
  hasRewind?: boolean;
  hasIncognito?: boolean;
  canSeeVisitors?: boolean;
  hasGoldenAura?: boolean;
  astraWritesMessages?: boolean;
}

export type UserPlan = 'gratuit' | 'premium' | 'elite';

const STORAGE_KEY = 'daily_usage_limits';

export function usePlanLimits(userPlan: UserPlan = 'gratuit') {
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === new Date().toDateString()) {
        return parsed;
      }
    }
    return {
      signals: 0,
      astraMessages: 0,
      matchMessages: 0,
      starsViewed: 0,
      date: new Date().toDateString()
    };
  });

  // Définition des limites par plan
  const planLimitsConfig: Record<UserPlan, PlanLimits> = {
    gratuit: {
      signalsPerDay: 10,
      astraMessagesPerDay: 10,
      matchMessagesPerDay: 20,
      starsViewable: 15,
      maxPhotos: 5,
      bioMaxLength: 200,
      canSeeWhoSignaled: false,
      hasBoost: false,
      profilesBlurred: true
    },
    premium: {
      signalsPerDay: Infinity,
      superNovaPerDay: 1,
      astraMessagesPerDay: 40,
      matchMessagesPerDay: Infinity,
      starsViewable: 50,
      maxPhotos: 10,
      bioMaxLength: 500,
      canSeeWhoSignaled: true,
      hasBoost: true,
      boostMultiplier: 3,
      profilesBlurred: false,
      hasBadge: true
    },
    elite: {
      signalsPerDay: Infinity,
      superNovaPerDay: 5,
      astraMessagesPerDay: 65,
      matchMessagesPerDay: Infinity,
      starsViewable: Infinity,
      maxPhotos: 20,
      bioMaxLength: Infinity,
      canSeeWhoSignaled: true,
      canSeeWhen: true,
      hasBoost: true,
      boostMultiplier: 10,
      superLikesPerDay: 10,
      hasRewind: true,
      hasIncognito: true,
      canSeeVisitors: true,
      hasGoldenAura: true,
      profilesBlurred: false,
      hasBadge: true,
      astraWritesMessages: true
    }
  };

  const currentLimits = planLimitsConfig[userPlan];

  // Reset quotidien
  useEffect(() => {
    const today = new Date().toDateString();
    if (dailyUsage.date !== today) {
      const newUsage = {
        signals: 0,
        astraMessages: 0,
        matchMessages: 0,
        starsViewed: 0,
        date: today
      };
      setDailyUsage(newUsage);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage));
    }
  }, [dailyUsage.date]);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dailyUsage));
  }, [dailyUsage]);

  // Fonctions de vérification
  const canUseSignal = () => {
    return dailyUsage.signals < currentLimits.signalsPerDay;
  };

  const canUseAstraMessage = () => {
    return dailyUsage.astraMessages < currentLimits.astraMessagesPerDay;
  };

  const canUseMatchMessage = () => {
    return dailyUsage.matchMessages < currentLimits.matchMessagesPerDay;
  };

  const canViewMoreStars = () => {
    return dailyUsage.starsViewed < currentLimits.starsViewable;
  };

  // Fonctions d'utilisation
  const useSignal = () => {
    if (canUseSignal()) {
      setDailyUsage(prev => ({ ...prev, signals: prev.signals + 1 }));
      return true;
    }
    return false;
  };

  const useAstraMessage = () => {
    if (canUseAstraMessage()) {
      setDailyUsage(prev => ({ ...prev, astraMessages: prev.astraMessages + 1 }));
      return true;
    }
    return false;
  };

  const useMatchMessage = () => {
    if (canUseMatchMessage()) {
      setDailyUsage(prev => ({ ...prev, matchMessages: prev.matchMessages + 1 }));
      return true;
    }
    return false;
  };

  const viewStar = () => {
    if (canViewMoreStars()) {
      setDailyUsage(prev => ({ ...prev, starsViewed: prev.starsViewed + 1 }));
      return true;
    }
    return false;
  };

  // Calculer le temps restant jusqu'à minuit
  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}min`;
  };

  return {
    limits: currentLimits,
    dailyUsage,
    canUseSignal,
    canUseAstraMessage,
    canUseMatchMessage,
    canViewMoreStars,
    useSignal,
    useAstraMessage,
    useMatchMessage,
    viewStar,
    getTimeUntilReset
  };
}
