// ═══════════════════════════════════════════════════════════════════════
// MATCHING SERVICE
// ═══════════════════════════════════════════════════════════════════════

import { supabase, handleSupabaseError } from '@/config/supabase';
import type { Match, Profile } from '@/types';
import { synastrieService } from '../astro/synastrieService';

export const matchingService = {
  async getPotentialMatches(userId: string, limit: number = 20): Promise<any[]> {
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!userProfile) return [];

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', userId)
      .contains('looking_for', [userProfile.gender])
      .overlaps('looking_for', userProfile.looking_for)
      .eq('is_banned', false)
      .limit(100);

    if (!profiles) return [];

    const matches = profiles.map(profile => ({
      ...profile,
      compatibility: synastrieService.calculateCompatibility(
        userProfile.natal_chart_data,
        profile.natal_chart_data
      ).overall,
    }));

    return matches
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, limit);
  },

  async createMatch(userId1: string, userId2: string): Promise<Match> {
    const [id1, id2] = [userId1, userId2].sort();

    const { data: existingMatch } = await supabase
      .from('matches')
      .select('*')
      .eq('user_id_1', id1)
      .eq('user_id_2', id2)
      .single();

    if (existingMatch) return existingMatch as Match;

    const { data: profile1 } = await supabase.from('profiles').select('natal_chart_data').eq('id', id1).single();
    const { data: profile2 } = await supabase.from('profiles').select('natal_chart_data').eq('id', id2).single();

    const compatibility = synastrieService.calculateCompatibility(
      profile1.natal_chart_data,
      profile2.natal_chart_data
    );

    const { data, error } = await supabase
      .from('matches')
      .insert({
        user_id_1: id1,
        user_id_2: id2,
        compatibility_score: compatibility.overall,
        compatibility_details: compatibility,
        status: 'potential',
      })
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data as Match;
  },

  async recordClick(matchId: string, userId: string) {
    const { data: match } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (!match) return;

    const isUser1 = match.user_id_1 === userId;
    const clickField = isUser1 ? 'clicked_by_1' : 'clicked_by_2';
    const clickTimeField = isUser1 ? 'clicked_at_1' : 'clicked_at_2';

    const updates: any = {
      [clickField]: true,
      [clickTimeField]: new Date().toISOString(),
    };

    const otherClicked = isUser1 ? match.clicked_by_2 : match.clicked_by_1;
    if (otherClicked) {
      updates.status = 'mutual';
    }

    await supabase.from('matches').update(updates).eq('id', matchId);

    if (updates.status === 'mutual') {
      await this.createConversation(match.user_id_1, match.user_id_2, matchId);
    }
  },

  async createConversation(userId1: string, userId2: string, matchId: string) {
    const [id1, id2] = [userId1, userId2].sort();

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id_1', id1)
      .eq('user_id_2', id2)
      .single();

    if (existing) return;

    await supabase.from('conversations').insert({
      user_id_1: id1,
      user_id_2: id2,
      match_id: matchId,
      status: 'active',
    });
  },
};
