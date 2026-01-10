// ═══════════════════════════════════════════════════════════════════════
// SUBSCRIPTION SERVICE
// ═══════════════════════════════════════════════════════════════════════

import { supabase, handleSupabaseError } from '@/config/supabase';
import type { SubscriptionTier } from '@/types';
import { TIER_QUOTAS } from '@/utils/constants';

export const subscriptionService = {
  async getCurrentTier(userId: string): Promise<SubscriptionTier> {
    const { data } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', userId)
      .or('ends_at.is.null,ends_at.gt.now()')
      .single();

    return data?.tier || 'free';
  },

  async getQuota(userId: string) {
    const tier = await this.getCurrentTier(userId);
    const limits = TIER_QUOTAS[tier];

    const { data: quota } = await supabase
      .from('quotas')
      .select('*')
      .eq('user_id', userId)
      .gte('resets_at', new Date().toISOString())
      .single();

    if (!quota) {
      return await this.createQuota(userId, tier);
    }

    return {
      ...quota,
      limits,
    };
  },

  async createQuota(userId: string, tier: SubscriptionTier) {
    const limits = TIER_QUOTAS[tier];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('quotas')
      .insert({
        user_id: userId,
        astra_messages_used: 0,
        astra_messages_limit: limits.astraMessages,
        univers_clicks_used: 0,
        univers_clicks_limit: limits.universClicks,
        resets_at: tomorrow.toISOString(),
      })
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return { ...data, limits };
  },

  async incrementAstraMessages(userId: string) {
    const { data } = await supabase.rpc('increment_astra_messages', {
      p_user_id: userId,
    });
    return data;
  },

  async incrementUniversClicks(userId: string) {
    const { data } = await supabase.rpc('increment_univers_clicks', {
      p_user_id: userId,
    });
    return data;
  },
};
