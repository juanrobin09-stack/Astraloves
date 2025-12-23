import { supabase } from './supabase';

export interface SwipeStats {
  swipesUsed: number;
  swipesRemaining: number;
  swipesLimit: number;
  canSwipe: boolean;
  isPremium: boolean;
  plan: string;
}

export async function getDailySwipeStats(userId: string): Promise<SwipeStats> {
  try {
    const { data: profile } = await supabase
      .from('astra_profiles')
      .select('premium_tier, swipes_today, is_premium')
      .eq('id', userId)
      .maybeSingle();

    const plan = profile?.premium_tier || 'free';
    const isPremiumByTier = plan !== 'free';
    const isPremiumByFlag = Boolean(profile?.is_premium);
    const isPremium = isPremiumByFlag || isPremiumByTier;

    if (isPremium) {
      return {
        swipesUsed: 0,
        swipesRemaining: Infinity,
        swipesLimit: Infinity,
        canSwipe: true,
        isPremium: true,
        plan
      };
    }

    const swipesLimit = 10;
    const swipesUsed = profile?.swipes_today || 0;
    const swipesRemaining = Math.max(0, swipesLimit - swipesUsed);
    const canSwipe = swipesRemaining > 0;

    return {
      swipesUsed,
      swipesRemaining,
      swipesLimit,
      canSwipe,
      isPremium: false,
      plan
    };
  } catch (error) {
    console.error('Error getting swipe stats:', error);
    return {
      swipesUsed: 0,
      swipesRemaining: 10,
      swipesLimit: 10,
      canSwipe: true,
      isPremium: false,
      plan: 'free'
    };
  }
}

export async function incrementSwipeCount(userId: string): Promise<{ success: boolean; current: number; max: number }> {
  try {
    const { data, error } = await supabase.rpc('increment_user_swipes', {
      user_id: userId
    });

    if (error) throw error;
    return data || { success: false, current: 0, max: 10 };
  } catch (error) {
    console.error('Error incrementing swipe count:', error);
    return { success: false, current: 0, max: 10 };
  }
}

export async function canUserSwipe(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('can_swipe', {
      p_user_id: userId
    });

    if (error) throw error;
    return data || false;
  } catch (error) {
    console.error('Error checking if user can swipe:', error);
    return false;
  }
}
