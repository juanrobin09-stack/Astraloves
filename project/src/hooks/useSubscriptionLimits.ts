import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getTierByPlan, SUBSCRIPTION_TIERS } from '../lib/subscriptionTiers';

export interface DailyUsage {
  swipes: number;
  astraMessages: number;
  matchMessages: number;
  superLikes: number;
  lastReset: string;
}

export interface SubscriptionLimits {
  tier: string;
  features: any;
  dailyUsage: DailyUsage;
  checkLimit: (action: 'swipe' | 'astra_message' | 'match_message' | 'super_like' | 'add_photo') => Promise<{ allowed: boolean; message?: string }>;
  incrementUsage: (action: 'swipe' | 'astra_message' | 'match_message' | 'super_like') => Promise<boolean>;
  refreshLimits: () => Promise<void>;
}

export function useSubscriptionLimits(): SubscriptionLimits {
  const { user } = useAuth();
  const [tier, setTier] = useState<string>('free');
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>({
    swipes: 0,
    astraMessages: 0,
    matchMessages: 0,
    superLikes: 0,
    lastReset: new Date().toDateString()
  });

  const currentTier = getTierByPlan(tier);

  const fetchLimits = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('premium_tier, swipes_today, messages_matchs_today, super_likes_today, last_reset_date')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (profile) {
        setTier(profile.premium_tier || 'free');

        const today = new Date().toDateString();
        const lastReset = profile.last_reset_date ? new Date(profile.last_reset_date).toDateString() : today;

        if (lastReset !== today) {
          await supabase
            .from('profiles')
            .update({
              swipes_today: 0,
              messages_matchs_today: 0,
              super_likes_today: 0,
              last_reset_date: new Date().toISOString().split('T')[0]
            })
            .eq('id', user.id);

          setDailyUsage({
            swipes: 0,
            astraMessages: 0,
            matchMessages: 0,
            superLikes: 0,
            lastReset: today
          });
        } else {
          const { data: astraProfile } = await supabase
            .from('astra_profiles')
            .select('daily_astra_messages')
            .eq('user_id', user.id)
            .maybeSingle();

          setDailyUsage({
            swipes: profile.swipes_today || 0,
            astraMessages: astraProfile?.daily_astra_messages || 0,
            matchMessages: profile.messages_matchs_today || 0,
            superLikes: profile.super_likes_today || 0,
            lastReset
          });
        }
      }
    } catch (error) {
      console.error('Error fetching limits:', error);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, [user]);

  const checkLimit = async (action: 'swipe' | 'astra_message' | 'match_message' | 'super_like' | 'add_photo'): Promise<{ allowed: boolean; message?: string }> => {
    const features = currentTier.features;

    switch (action) {
      case 'swipe':
        if (dailyUsage.swipes >= features.swipesPerDay && features.swipesPerDay !== Infinity) {
          return {
            allowed: false,
            message: 'Tu as atteint ta limite de swipes quotidiens. Passe à Premium pour des swipes illimités ! 🚀'
          };
        }
        return { allowed: true };

      case 'astra_message':
        if (dailyUsage.astraMessages >= features.astraMessagesPerDay) {
          const upgrade = tier === 'free' ? 'Premium (40/jour)' : 'Premium+ Elite (65/jour)';
          return {
            allowed: false,
            message: `Tu as utilisé tous tes messages Astra (${features.astraMessagesPerDay}/jour). Passe à ${upgrade} ! 💬`
          };
        }
        return { allowed: true };

      case 'match_message':
        if (dailyUsage.matchMessages >= features.matchMessagesPerDay && features.matchMessagesPerDay !== Infinity) {
          return {
            allowed: false,
            message: 'Limite de messages quotidiens atteinte. Passe à Premium pour des messages illimités ! 💎'
          };
        }
        return { allowed: true };

      case 'super_like':
        if (dailyUsage.superLikes >= features.superLikesPerDay) {
          return {
            allowed: false,
            message: 'Les Super Likes sont réservés aux membres Premium+ Elite ! 👑'
          };
        }
        return { allowed: true };

      case 'add_photo':
        const { data: profile } = await supabase
          .from('profiles')
          .select('photos')
          .eq('id', user?.id)
          .maybeSingle();

        const photoCount = profile?.photos?.length || 0;
        if (photoCount >= features.maxPhotos) {
          return {
            allowed: false,
            message: `Limite de ${features.maxPhotos} photos atteinte. Upgrade pour plus de photos ! 📷`
          };
        }
        return { allowed: true };

      default:
        return { allowed: true };
    }
  };

  const incrementUsage = async (action: 'swipe' | 'astra_message' | 'match_message' | 'super_like'): Promise<boolean> => {
    if (!user) return false;

    const limitCheck = await checkLimit(action);
    if (!limitCheck.allowed) return false;

    try {
      if (action === 'swipe') {
        const { data } = await supabase.rpc('increment_user_swipes', { user_id: user.id });
        if (data?.success) {
          setDailyUsage(prev => ({ ...prev, swipes: data.current }));
          return true;
        }
      } else if (action === 'match_message') {
        const { data } = await supabase.rpc('increment_user_match_messages', { user_id: user.id });
        if (data?.success) {
          setDailyUsage(prev => ({ ...prev, matchMessages: data.current }));
          return true;
        }
      } else if (action === 'astra_message') {
        const { error } = await supabase
          .from('astra_profiles')
          .update({ daily_astra_messages: dailyUsage.astraMessages + 1 })
          .eq('user_id', user.id);

        if (!error) {
          setDailyUsage(prev => ({ ...prev, astraMessages: prev.astraMessages + 1 }));
          return true;
        }
      } else if (action === 'super_like') {
        const { error } = await supabase
          .from('profiles')
          .update({ super_likes_today: dailyUsage.superLikes + 1 })
          .eq('id', user.id);

        if (!error) {
          setDailyUsage(prev => ({ ...prev, superLikes: prev.superLikes + 1 }));
          return true;
        }
      }
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }

    return false;
  };

  return {
    tier,
    features: currentTier.features,
    dailyUsage,
    checkLimit,
    incrementUsage,
    refreshLimits: fetchLimits
  };
}
