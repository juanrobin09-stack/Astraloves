import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface DailyCounts {
  swipes_today: number;
  daily_astra_messages: number;
  daily_match_messages: number;
  daily_super_likes: number;
  last_reset_date: string;
}

interface UserProfile {
  premium_tier?: string;
  is_premium?: boolean;
}

export function useDailyLimits(userId: string | undefined) {
  const [counts, setCounts] = useState<DailyCounts>({
    swipes_today: 0,
    daily_astra_messages: 0,
    daily_match_messages: 0,
    daily_super_likes: 0,
    last_reset_date: new Date().toISOString().split('T')[0]
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    loadCounts();

    const interval = setInterval(() => {
      checkAndResetLimits();
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userId]);

  async function loadCounts() {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('astra_profiles')
        .select('swipes_today, daily_astra_messages, daily_match_messages, daily_super_likes, last_reset_date, premium_tier, is_premium')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const today = new Date().toISOString().split('T')[0];

        // Stocker les infos premium
        setUserProfile({
          premium_tier: data.premium_tier,
          is_premium: data.is_premium
        });

        if (data.last_reset_date !== today) {
          await resetCounts();
        } else {
          setCounts({
            swipes_today: data.swipes_today || 0,
            daily_astra_messages: data.daily_astra_messages || 0,
            daily_match_messages: data.daily_match_messages || 0,
            daily_super_likes: data.daily_super_likes || 0,
            last_reset_date: data.last_reset_date
          });
        }

        console.log('🔍 [useDailyLimits] User premium status:', {
          premium_tier: data.premium_tier,
          is_premium: data.is_premium,
          swipes_today: data.swipes_today,
          isPremium: data.premium_tier === 'premium' || data.premium_tier === 'premium_elite'
        });
      }
    } catch (error) {
      console.error('Error loading daily counts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function checkAndResetLimits() {
    if (!userId) return;

    const today = new Date().toISOString().split('T')[0];
    if (counts.last_reset_date !== today) {
      await resetCounts();
    }
  }

  async function resetCounts() {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('astra_profiles')
        .update({
          swipes_today: 0,
          daily_astra_messages: 0,
          daily_match_messages: 0,
          daily_super_likes: 0,
          last_reset_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', userId);

      if (error) throw error;

      setCounts({
        swipes_today: 0,
        daily_astra_messages: 0,
        daily_match_messages: 0,
        daily_super_likes: 0,
        last_reset_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error resetting counts:', error);
    }
  }

  async function incrementSwipes(): Promise<{ success: boolean; error?: string; current?: number; max?: number }> {
    if (!userId) return { success: false, error: 'No user ID' };

    try {
      const { data, error } = await supabase.rpc('increment_user_swipes', {
        user_id: userId
      });

      if (error) throw error;

      if (data.success) {
        setCounts(prev => ({ ...prev, swipes_today: data.current }));
      }

      return data;
    } catch (error) {
      console.error('Error incrementing swipes:', error);
      return { success: false, error: 'Failed to increment swipes' };
    }
  }

  async function incrementMatchMessages(): Promise<{ success: boolean; error?: string; current?: number; max?: number }> {
    if (!userId) return { success: false, error: 'No user ID' };

    try {
      const { data, error } = await supabase.rpc('increment_user_match_messages', {
        user_id: userId
      });

      if (error) throw error;

      if (data.success) {
        setCounts(prev => ({ ...prev, daily_match_messages: data.current }));
      }

      return data;
    } catch (error) {
      console.error('Error incrementing match messages:', error);
      return { success: false, error: 'Failed to increment messages' };
    }
  }

  // Calculer isPremium - vérifier explicitement les tiers premium
  const isPremium = userProfile.premium_tier === 'premium' || userProfile.premium_tier === 'premium_elite';
  const plan = userProfile.premium_tier || 'free';

  // Limite de swipes basée sur le statut premium
  const swipesLimit = isPremium ? Infinity : 10;
  const swipesUsed = counts.swipes_today;
  const swipesRemaining = isPremium ? Infinity : Math.max(0, swipesLimit - swipesUsed);
  const canSwipe = isPremium || swipesRemaining > 0;

  console.log('🔍 [useDailyLimits] Final values:', {
    isPremium,
    plan,
    swipesLimit,
    swipesUsed,
    swipesRemaining,
    canSwipe,
    'swipesLimit === Infinity': swipesLimit === Infinity
  });

  return {
    counts,
    loading,
    incrementSwipes,
    incrementMatchMessages,
    refresh: loadCounts,
    swipesUsed,
    swipesLimit,
    swipesRemaining,
    canSwipe,
    isPremium,
    plan
  };
}
