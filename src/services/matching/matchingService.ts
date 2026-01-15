// ═══════════════════════════════════════════════════════════════════════
// MATCHING SERVICE
// ═══════════════════════════════════════════════════════════════════════

import { supabase, handleSupabaseError } from '@/config/supabase';
import type { Match, Profile } from '@/types';
import { synastrieService } from '../astro/synastrieService';

// Simple compatibility based on sun signs when natal_chart_data is missing
function getSimpleCompatibility(sign1: string, sign2: string): number {
  const elements: Record<string, string> = {
    aries: 'fire', leo: 'fire', sagittarius: 'fire',
    taurus: 'earth', virgo: 'earth', capricorn: 'earth',
    gemini: 'air', libra: 'air', aquarius: 'air',
    cancer: 'water', scorpio: 'water', pisces: 'water',
  };

  const elem1 = elements[sign1?.toLowerCase()] || 'fire';
  const elem2 = elements[sign2?.toLowerCase()] || 'fire';

  // Same element = high compatibility
  if (elem1 === elem2) return 85 + Math.random() * 10;

  // Compatible elements (fire-air, earth-water)
  const compatible: Record<string, string> = {
    fire: 'air', air: 'fire',
    earth: 'water', water: 'earth',
  };
  if (compatible[elem1] === elem2) return 70 + Math.random() * 15;

  // Other combinations
  return 50 + Math.random() * 20;
}

export const matchingService = {
  async getPotentialMatches(userId: string, limit: number = 20): Promise<any[]> {
    try {
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
        .eq('onboarding_completed', true)
        .limit(100);

      if (!profiles || profiles.length === 0) return [];

      const matches = profiles.map(profile => {
        let compatibility: number;

        // Use full synastry if natal_chart_data exists, otherwise use simple sun sign compatibility
        if (userProfile.natal_chart_data && profile.natal_chart_data) {
          try {
            compatibility = synastrieService.calculateCompatibility(
              userProfile.natal_chart_data,
              profile.natal_chart_data
            ).overall;
          } catch {
            compatibility = getSimpleCompatibility(userProfile.sun_sign, profile.sun_sign);
          }
        } else {
          compatibility = getSimpleCompatibility(userProfile.sun_sign, profile.sun_sign);
        }

        return {
          ...profile,
          compatibility: Math.round(compatibility),
        };
      });

      return matches
        .sort((a, b) => b.compatibility - a.compatibility)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting matches:', error);
      return [];
    }
  },

  async createMatch(userId1: string, userId2: string): Promise<Match | null> {
    try {
      const [id1, id2] = [userId1, userId2].sort();

      const { data: existingMatch } = await supabase
        .from('matches')
        .select('*')
        .eq('user_id_1', id1)
        .eq('user_id_2', id2)
        .single();

      if (existingMatch) return existingMatch as Match;

      const { data: profile1 } = await supabase.from('profiles').select('*').eq('id', id1).single();
      const { data: profile2 } = await supabase.from('profiles').select('*').eq('id', id2).single();

      let compatibilityScore: number;
      let compatibilityDetails: any;

      if (profile1?.natal_chart_data && profile2?.natal_chart_data) {
        const compatibility = synastrieService.calculateCompatibility(
          profile1.natal_chart_data,
          profile2.natal_chart_data
        );
        compatibilityScore = compatibility.overall;
        compatibilityDetails = compatibility;
      } else {
        compatibilityScore = Math.round(getSimpleCompatibility(profile1?.sun_sign, profile2?.sun_sign));
        compatibilityDetails = { overall: compatibilityScore, simple: true };
      }

      const { data, error } = await supabase
        .from('matches')
        .insert({
          user_id_1: id1,
          user_id_2: id2,
          compatibility_score: compatibilityScore,
          compatibility_details: compatibilityDetails,
          status: 'potential',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating match:', error);
        return null;
      }
      return data as Match;
    } catch (error) {
      console.error('Error creating match:', error);
      return null;
    }
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
