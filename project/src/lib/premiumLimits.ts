import { supabase } from './supabase';

export const LIMITS = {
  FREE_MESSAGES_PER_DAY: 10,
  PREMIUM_MESSAGES_PER_DAY: 40,
  FREE_SWIPES_PER_DAY: 20,
  PREMIUM_SWIPES_UNLIMITED: null,
};

export interface MessageLimitStatus {
  canSend: boolean;
  current: number;
  limit: number;
  resetAt: Date;
  isPremium: boolean;
}

export async function checkMessageLimit(userId: string): Promise<MessageLimitStatus> {
  const { data: profile } = await supabase
    .from('astra_profiles')
    .select('is_premium, messages_count, messages_reset_at')
    .eq('id', userId)
    .maybeSingle();

  if (!profile) {
    throw new Error('Profile not found');
  }

  const isPremium = profile.is_premium || false;
  const limit = isPremium ? LIMITS.PREMIUM_MESSAGES_PER_DAY : LIMITS.FREE_MESSAGES_PER_DAY;
  const resetAt = new Date(profile.messages_reset_at);
  const now = new Date();

  if (now > resetAt) {
    await supabase
      .from('astra_profiles')
      .update({
        messages_count: 0,
        messages_reset_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', userId);

    return {
      canSend: true,
      current: 0,
      limit,
      resetAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      isPremium,
    };
  }

  const current = profile.messages_count || 0;
  const canSend = current < limit;

  return {
    canSend,
    current,
    limit,
    resetAt,
    isPremium,
  };
}

export async function incrementMessageCount(userId: string): Promise<boolean> {
  const status = await checkMessageLimit(userId);

  if (!status.canSend) {
    return false;
  }

  const { error } = await supabase
    .from('astra_profiles')
    .update({
      messages_count: status.current + 1,
    })
    .eq('id', userId);

  return !error;
}

export async function getSwipeLimit(userId: string): Promise<{ canSwipe: boolean; current: number; limit: number | null; isPremium: boolean }> {
  const { data: profile } = await supabase
    .from('astra_profiles')
    .select('is_premium')
    .eq('id', userId)
    .maybeSingle();

  const isPremium = profile?.is_premium || false;

  if (isPremium) {
    return {
      canSwipe: true,
      current: 0,
      limit: null,
      isPremium: true,
    };
  }

  return {
    canSwipe: true,
    current: 0,
    limit: LIMITS.FREE_SWIPES_PER_DAY,
    isPremium: false,
  };
}

export function formatTimeRemaining(resetAt: Date): string {
  const now = new Date();
  const diff = resetAt.getTime() - now.getTime();

  if (diff <= 0) {
    return 'Maintenant';
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
  }

  return `${minutes}min`;
}
