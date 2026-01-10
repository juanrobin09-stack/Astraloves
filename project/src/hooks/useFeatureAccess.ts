import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PlanTier, getPlanLimits, hasAccess as checkTierAccess, PLAN_NAMES } from '../config/subscriptionLimits';

export interface FeatureAccess {
  canAccess: boolean;
  reason?: string;
  currentUsage?: number;
  limit?: number;
  upgradeTo?: PlanTier;
}

export interface DailyUsage {
  cosmicSignals: number;
  superNova: number;
  astraMessages: number;
  matchMessages: number;
  superLikes: number;
  lastReset: string;
}

export function useFeatureAccess() {
  const { user } = useAuth();
  const [tier, setTier] = useState<PlanTier>('free');
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>({
    cosmicSignals: 0,
    superNova: 0,
    astraMessages: 0,
    matchMessages: 0,
    superLikes: 0,
    lastReset: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(true);

  // Charger le tier de l'utilisateur
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadUserTier();
    loadDailyUsage();

    // Subscribe aux changements
    const channel = supabase
      .channel(`premium_status_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        () => {
          loadUserTier();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadUserTier = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('is_premium, premium_tier, premium_until')
        .eq('id', user.id)
        .single();

      if (data) {
        const now = new Date();
        const premiumUntil = data.premium_until ? new Date(data.premium_until) : null;
        const isPremiumActive = data.is_premium && (!premiumUntil || premiumUntil > now);

        if (isPremiumActive) {
          setTier((data.premium_tier as PlanTier) || 'free');
        } else {
          setTier('free');
        }
      }
    } catch (error) {
      console.error('[useFeatureAccess] Erreur chargement tier:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyUsage = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('daily_usage')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        const today = new Date().toISOString().split('T')[0];
        
        // Reset si c'est un nouveau jour
        if (data.last_reset !== today) {
          await resetDailyUsage();
        } else {
          setDailyUsage({
            cosmicSignals: data.cosmic_signals || 0,
            superNova: data.super_nova || 0,
            astraMessages: data.astra_messages || 0,
            matchMessages: data.match_messages || 0,
            superLikes: data.super_likes || 0,
            lastReset: data.last_reset,
          });
        }
      } else {
        // Créer l'entrée si elle n'existe pas
        await resetDailyUsage();
      }
    } catch (error) {
      console.error('[useFeatureAccess] Erreur chargement usage:', error);
    }
  };

  const resetDailyUsage = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { error } = await supabase
        .from('daily_usage')
        .upsert({
          user_id: user.id,
          cosmic_signals: 0,
          super_nova: 0,
          astra_messages: 0,
          match_messages: 0,
          super_likes: 0,
          last_reset: today,
        });

      if (!error) {
        setDailyUsage({
          cosmicSignals: 0,
          superNova: 0,
          astraMessages: 0,
          matchMessages: 0,
          superLikes: 0,
          lastReset: today,
        });
      }
    } catch (error) {
      console.error('[useFeatureAccess] Erreur reset usage:', error);
    }
  };

  const incrementUsage = async (metric: keyof Omit<DailyUsage, 'lastReset'>) => {
    if (!user) return;

    const columnMap = {
      cosmicSignals: 'cosmic_signals',
      superNova: 'super_nova',
      astraMessages: 'astra_messages',
      matchMessages: 'match_messages',
      superLikes: 'super_likes',
    };

    try {
      const { data } = await supabase
        .from('daily_usage')
        .select(columnMap[metric])
        .eq('user_id', user.id)
        .single();

      const currentValue = data?.[columnMap[metric]] || 0;

      await supabase
        .from('daily_usage')
        .update({ [columnMap[metric]]: currentValue + 1 })
        .eq('user_id', user.id);

      setDailyUsage((prev) => ({
        ...prev,
        [metric]: prev[metric] + 1,
      }));
    } catch (error) {
      console.error('[useFeatureAccess] Erreur increment:', error);
    }
  };

  // Vérifications d'accès spécifiques
  const checkCosmicSignal = (): FeatureAccess => {
    const limits = getPlanLimits(tier);
    
    if (limits.cosmicSignalsUnlimited) {
      return { canAccess: true };
    }

    if (dailyUsage.cosmicSignals >= limits.cosmicSignalsPerDay) {
      return {
        canAccess: false,
        reason: `Limite de ${limits.cosmicSignalsPerDay} signaux atteinte`,
        currentUsage: dailyUsage.cosmicSignals,
        limit: limits.cosmicSignalsPerDay,
        upgradeTo: 'premium',
      };
    }

    return {
      canAccess: true,
      currentUsage: dailyUsage.cosmicSignals,
      limit: limits.cosmicSignalsPerDay,
    };
  };

  const checkSuperNova = (): FeatureAccess => {
    const limits = getPlanLimits(tier);
    
    if (limits.superNovaPerDay === 0) {
      return {
        canAccess: false,
        reason: 'Super Nova réservé aux abonnés Premium',
        upgradeTo: 'premium',
      };
    }

    if (dailyUsage.superNova >= limits.superNovaPerDay) {
      return {
        canAccess: false,
        reason: `Limite de ${limits.superNovaPerDay} Super Nova atteinte`,
        currentUsage: dailyUsage.superNova,
        limit: limits.superNovaPerDay,
        upgradeTo: tier === 'premium' ? 'premium_elite' : 'premium',
      };
    }

    return {
      canAccess: true,
      currentUsage: dailyUsage.superNova,
      limit: limits.superNovaPerDay,
    };
  };

  const checkAstraMessage = (): FeatureAccess => {
    const limits = getPlanLimits(tier);

    if (dailyUsage.astraMessages >= limits.astraMessagesPerDay) {
      return {
        canAccess: false,
        reason: `Limite de ${limits.astraMessagesPerDay} messages Astra atteinte`,
        currentUsage: dailyUsage.astraMessages,
        limit: limits.astraMessagesPerDay,
        upgradeTo: tier === 'free' ? 'premium' : 'premium_elite',
      };
    }

    return {
      canAccess: true,
      currentUsage: dailyUsage.astraMessages,
      limit: limits.astraMessagesPerDay,
    };
  };

  const checkMatchMessage = (): FeatureAccess => {
    const limits = getPlanLimits(tier);

    if (limits.matchMessagesPerDay === null) {
      return { canAccess: true };
    }

    if (dailyUsage.matchMessages >= limits.matchMessagesPerDay) {
      return {
        canAccess: false,
        reason: `Limite de ${limits.matchMessagesPerDay} messages atteinte`,
        currentUsage: dailyUsage.matchMessages,
        limit: limits.matchMessagesPerDay,
        upgradeTo: 'premium',
      };
    }

    return {
      canAccess: true,
      currentUsage: dailyUsage.matchMessages,
      limit: limits.matchMessagesPerDay,
    };
  };

  const checkSuperLike = (): FeatureAccess => {
    const limits = getPlanLimits(tier);

    if (limits.superLikesPerDay === 0) {
      return {
        canAccess: false,
        reason: 'Super Likes réservés aux abonnés Premium',
        upgradeTo: 'premium',
      };
    }

    if (dailyUsage.superLikes >= limits.superLikesPerDay) {
      return {
        canAccess: false,
        reason: `Limite de ${limits.superLikesPerDay} super likes atteinte`,
        currentUsage: dailyUsage.superLikes,
        limit: limits.superLikesPerDay,
        upgradeTo: tier === 'premium' ? 'premium_elite' : 'premium',
      };
    }

    return {
      canAccess: true,
      currentUsage: dailyUsage.superLikes,
      limit: limits.superLikesPerDay,
    };
  };

  const checkFeature = (feature: string): FeatureAccess => {
    const limits = getPlanLimits(tier);

    switch (feature) {
      case 'seeWhoSentSignal':
        return {
          canAccess: limits.canSeeWhoSentSignal,
          reason: limits.canSeeWhoSentSignal ? undefined : 'Réservé aux abonnés Premium',
          upgradeTo: 'premium',
        };
      
      case 'seeWhenSignalSent':
        return {
          canAccess: limits.canSeeWhenSignalSent,
          reason: limits.canSeeWhenSignalSent ? undefined : 'Réservé aux Elite',
          upgradeTo: 'premium_elite',
        };
      
      case 'profileVisitors':
        return {
          canAccess: limits.canSeeProfileVisitors,
          reason: limits.canSeeProfileVisitors ? undefined : 'Réservé aux Elite',
          upgradeTo: 'premium_elite',
        };
      
      case 'rewind':
        return {
          canAccess: limits.canRewind,
          reason: limits.canRewind ? undefined : 'Rembobinage réservé aux Elite',
          upgradeTo: 'premium_elite',
        };
      
      case 'advancedFilters':
        return {
          canAccess: limits.hasAdvancedFilters,
          reason: limits.hasAdvancedFilters ? undefined : 'Filtres avancés réservés aux Elite',
          upgradeTo: 'premium_elite',
        };
      
      case 'incognito':
        return {
          canAccess: limits.hasIncognitoMode,
          reason: limits.hasIncognitoMode ? undefined : 'Mode incognito réservé aux Elite',
          upgradeTo: 'premium_elite',
        };
      
      case 'astralTheme':
        return {
          canAccess: limits.hasAstralTheme,
          reason: limits.hasAstralTheme ? undefined : 'Thème astral réservé aux Elite',
          upgradeTo: 'premium_elite',
        };

      default:
        return { canAccess: false, reason: 'Feature inconnue' };
    }
  };

  return {
    tier,
    tierName: PLAN_NAMES[tier],
    limits: getPlanLimits(tier),
    dailyUsage,
    loading,
    
    // Vérifications
    checkCosmicSignal,
    checkSuperNova,
    checkAstraMessage,
    checkMatchMessage,
    checkSuperLike,
    checkFeature,
    checkTierAccess: (requiredTier: PlanTier) => checkTierAccess(tier, requiredTier),
    
    // Actions
    incrementUsage,
    resetDailyUsage,
  };
}
