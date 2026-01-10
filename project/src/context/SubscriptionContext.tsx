import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type {
  PlanId,
  SubscriptionPlan,
  UserSubscription,
  UsageTracking,
  UpgradeInfo,
  LimitCheckResult,
  FeatureCheckResult,
  PlanComparison,
  FeatureName,
  LimitName,
} from '../types/subscription';
import {
  SUBSCRIPTION_PLANS,
  getPlanById,
  getPlansWithFeature,
  getMinimumPlanForFeature,
  normalizePlanId,
  FEATURE_DESCRIPTIONS,
} from '../config/subscriptionPlans';

interface SubscriptionContextValue {
  currentPlan: SubscriptionPlan;
  subscription: UserSubscription;
  usage: UsageTracking;
  isLoading: boolean;
  error: string | null;
  hasFeature: (featureName: FeatureName) => boolean;
  getLimit: (limitName: LimitName) => number;
  canPerformAction: (limitName: LimitName) => LimitCheckResult;
  getAvailableUpgrades: () => SubscriptionPlan[];
  requiresUpgradeFor: (featureName: FeatureName) => UpgradeInfo;
  comparePlans: (planA: PlanId, planB: PlanId) => PlanComparison;
  incrementUsage: (limitName: LimitName, amount?: number) => Promise<void>;
  resetDailyUsage: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  refreshUsage: () => Promise<void>;
}

const defaultUsage: UsageTracking = {
  date: new Date().toISOString().split('T')[0],
  cosmicSignals: 0,
  superNova: 0,
  astraMessages: 0,
  matchMessages: 0,
  superLikes: 0,
};

const defaultSubscription: UserSubscription = {
  planId: 'free',
  plan: SUBSCRIPTION_PLANS.free,
  status: 'active',
  startedAt: null,
  expiresAt: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription>(defaultSubscription);
  const [usage, setUsage] = useState<UsageTracking>(defaultUsage);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPlan = subscription.plan;

  const fetchSubscription = useCallback(async () => {
    if (!user?.id) {
      setSubscription(defaultSubscription);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('astra_profiles')
        .select('is_premium, premium_until, premium_tier, stripe_customer_id, subscription_id')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Supabase request failed', fetchError);
        throw fetchError;
      }

      if (data) {
        const planId = normalizePlanId(data.premium_tier);
        const plan = getPlanById(planId);

        const isExpired = data.premium_until && new Date(data.premium_until) < new Date();
        const effectivePlanId = isExpired ? 'free' : planId;
        const effectivePlan = isExpired ? SUBSCRIPTION_PLANS.free : plan;

        if (isExpired && data.is_premium) {
          await supabase
            .from('astra_profiles')
            .update({ is_premium: false, premium_tier: 'free' })
            .eq('id', user.id);
        }

        setSubscription({
          planId: effectivePlanId,
          plan: effectivePlan,
          status: isExpired ? 'expired' : 'active',
          startedAt: null,
          expiresAt: data.premium_until ? new Date(data.premium_until) : null,
          stripeCustomerId: data.stripe_customer_id,
          stripeSubscriptionId: data.subscription_id,
        });
      }
    } catch (err) {
      console.error('[SubscriptionContext] Error fetching subscription:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const fetchUsage = useCallback(async () => {
    if (!user?.id) {
      setUsage(defaultUsage);
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    try {
      const { data, error: fetchError } = await supabase
        .from('daily_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        setUsage({
          date: data.date,
          cosmicSignals: data.cosmic_signals || 0,
          superNova: data.super_nova || 0,
          astraMessages: data.astra_messages || 0,
          matchMessages: data.match_messages || 0,
          superLikes: data.super_likes || 0,
        });
      } else {
        setUsage({ ...defaultUsage, date: today });
      }
    } catch (err) {
      console.error('[SubscriptionContext] Error fetching usage:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSubscription();
    fetchUsage();

    if (user) {
      const channel = supabase
        .channel(`subscription_${user.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'astra_profiles',
          filter: `id=eq.${user.id}`,
        }, () => {
          fetchSubscription();
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'daily_usage',
          filter: `user_id=eq.${user.id}`,
        }, () => {
          fetchUsage();
        })
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [user, fetchSubscription, fetchUsage]);

  useEffect(() => {
    const checkMidnight = () => {
      const today = new Date().toISOString().split('T')[0];
      if (usage.date !== today) {
        fetchUsage();
      }
    };

    const interval = setInterval(checkMidnight, 60000);
    return () => clearInterval(interval);
  }, [usage.date, fetchUsage]);

  const hasFeature = useCallback((featureName: FeatureName): boolean => {
    return currentPlan.features[featureName] === true;
  }, [currentPlan]);

  const getLimit = useCallback((limitName: LimitName): number => {
    return currentPlan.limits[limitName];
  }, [currentPlan]);

  const canPerformAction = useCallback((limitName: LimitName): LimitCheckResult => {
    const limit = currentPlan.limits[limitName];
    const isUnlimited = limit === Infinity;

    const usageMap: Record<string, number> = {
      cosmicSignalsPerDay: usage.cosmicSignals,
      superNovaPerDay: usage.superNova,
      astraMessagesPerDay: usage.astraMessages,
      matchMessagesPerDay: usage.matchMessages,
      superLikesPerDay: usage.superLikes,
    };

    const used = usageMap[limitName] ?? 0;
    const remaining = isUnlimited ? Infinity : Math.max(0, limit - used);

    return {
      allowed: isUnlimited || remaining > 0,
      remaining,
      limit,
      used,
      isUnlimited,
    };
  }, [currentPlan, usage]);

  const getAvailableUpgrades = useCallback((): SubscriptionPlan[] => {
    return Object.values(SUBSCRIPTION_PLANS)
      .filter(plan => plan.tier > currentPlan.tier)
      .sort((a, b) => a.tier - b.tier);
  }, [currentPlan]);

  const requiresUpgradeFor = useCallback((featureName: FeatureName): UpgradeInfo => {
    const hasIt = hasFeature(featureName);
    const minimumPlan = getMinimumPlanForFeature(featureName);
    const plansWithFeature = getPlansWithFeature(featureName);

    const featuresGained: string[] = [];
    if (minimumPlan && minimumPlan.tier > currentPlan.tier) {
      Object.entries(minimumPlan.features).forEach(([key, value]) => {
        if (value && !currentPlan.features[key as FeatureName]) {
          const desc = FEATURE_DESCRIPTIONS[key as FeatureName];
          if (desc) featuresGained.push(desc.label);
        }
      });
    }

    return {
      required: !hasIt,
      currentPlan,
      minimumPlanRequired: hasIt ? null : minimumPlan,
      allPlansWithFeature: plansWithFeature,
      priceDifference: minimumPlan ? minimumPlan.price - currentPlan.price : 0,
      featuresGained,
    };
  }, [currentPlan, hasFeature]);

  const comparePlans = useCallback((planAId: PlanId, planBId: PlanId): PlanComparison => {
    const planA = getPlanById(planAId);
    const planB = getPlanById(planBId);

    const limitsDiff: PlanComparison['limitsDiff'] = {};
    (Object.keys(planA.limits) as LimitName[]).forEach(key => {
      const a = planA.limits[key];
      const b = planB.limits[key];
      if (a !== b) {
        limitsDiff[key] = {
          a,
          b,
          diff: b === Infinity ? 'unlimited' : b - a,
        };
      }
    });

    const featuresDiff: PlanComparison['featuresDiff'] = {};
    (Object.keys(planA.features) as FeatureName[]).forEach(key => {
      const a = planA.features[key];
      const b = planB.features[key];
      if (a !== b) {
        featuresDiff[key] = { a, b };
      }
    });

    return {
      planA,
      planB,
      limitsDiff,
      featuresDiff,
      priceDiff: planB.price - planA.price,
      recommendation: planB.tier > planA.tier ? 'upgrade' : planB.tier < planA.tier ? 'downgrade' : 'same',
    };
  }, []);

  const incrementUsage = useCallback(async (limitName: LimitName, amount = 1) => {
    if (!user?.id) return;

    const today = new Date().toISOString().split('T')[0];
    const columnMap: Record<string, string> = {
      cosmicSignalsPerDay: 'cosmic_signals',
      superNovaPerDay: 'super_nova',
      astraMessagesPerDay: 'astra_messages',
      matchMessagesPerDay: 'match_messages',
      superLikesPerDay: 'super_likes',
    };

    const column = columnMap[limitName];
    if (!column) return;

    try {
      const { data: existing } = await supabase
        .from('daily_usage')
        .select('id, ' + column)
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        const currentValue = (existing as Record<string, number>)[column] || 0;
        await supabase
          .from('daily_usage')
          .update({ [column]: currentValue + amount })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('daily_usage')
          .insert({
            user_id: user.id,
            date: today,
            [column]: amount,
          });
      }

      setUsage(prev => ({
        ...prev,
        [limitName === 'cosmicSignalsPerDay' ? 'cosmicSignals' :
         limitName === 'superNovaPerDay' ? 'superNova' :
         limitName === 'astraMessagesPerDay' ? 'astraMessages' :
         limitName === 'matchMessagesPerDay' ? 'matchMessages' : 'superLikes']:
         prev[limitName === 'cosmicSignalsPerDay' ? 'cosmicSignals' :
              limitName === 'superNovaPerDay' ? 'superNova' :
              limitName === 'astraMessagesPerDay' ? 'astraMessages' :
              limitName === 'matchMessagesPerDay' ? 'matchMessages' : 'superLikes'] + amount,
      }));
    } catch (err) {
      console.error('[SubscriptionContext] Error incrementing usage:', err);
    }
  }, [user?.id]);

  const resetDailyUsage = useCallback(async () => {
    if (!user?.id) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      await supabase
        .from('daily_usage')
        .upsert({
          user_id: user.id,
          date: today,
          cosmic_signals: 0,
          super_nova: 0,
          astra_messages: 0,
          match_messages: 0,
          super_likes: 0,
        });

      setUsage({ ...defaultUsage, date: today });
    } catch (err) {
      console.error('[SubscriptionContext] Error resetting usage:', err);
    }
  }, [user?.id]);

  const value: SubscriptionContextValue = {
    currentPlan,
    subscription,
    usage,
    isLoading,
    error,
    hasFeature,
    getLimit,
    canPerformAction,
    getAvailableUpgrades,
    requiresUpgradeFor,
    comparePlans,
    incrementUsage,
    resetDailyUsage,
    refreshSubscription: fetchSubscription,
    refreshUsage: fetchUsage,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
