import { supabase } from './supabase';

export type UserTier = 'free' | 'premium' | 'elite';

export interface CosmicPowers {
  name: string;
  emoji: string;
  color: string;
  tier: UserTier;

  daily_signals: number;
  signal_recharge_hours: number;
  super_nova: number;

  constellation_limit: number;
  min_compatibility_visible: number;
  profile_preview: 'blurred' | 'full' | 'full_plus';
  compatibility_detail: 'score_only' | 'detailed' | 'ultra';

  can_see_who_signaled: boolean;
  can_see_signal_time: boolean;
  can_filter: boolean;
  can_filter_online: boolean;
  can_boost: boolean;
  can_rewind: boolean;
  can_go_incognito: boolean;

  astra_suggestions_daily: number;
  astra_icebreakers: boolean;
  astra_writes_first_message: boolean;
  astra_analysis: 'basic' | 'detailed' | 'ultra';
  astra_compatibility_prediction: boolean;

  star_size_multiplier: number;
  star_brightness: 'dim' | 'medium' | 'bright' | 'supernova';
  has_aura: boolean;
  aura_animated: boolean;
  shooting_star_effect: boolean;
  appears_first: boolean;
}

export const COSMIC_POWERS: Record<UserTier, CosmicPowers> = {
  free: {
    name: "Étoile Naissante",
    emoji: "🌑",
    color: "#6B7280",
    tier: 'free',

    daily_signals: 3,
    signal_recharge_hours: 24,
    super_nova: 0,

    constellation_limit: 15,
    min_compatibility_visible: 65,
    profile_preview: 'blurred',
    compatibility_detail: 'score_only',

    can_see_who_signaled: false,
    can_see_signal_time: false,
    can_filter: false,
    can_filter_online: false,
    can_boost: false,
    can_rewind: false,
    can_go_incognito: false,

    astra_suggestions_daily: 1,
    astra_icebreakers: false,
    astra_writes_first_message: false,
    astra_analysis: 'basic',
    astra_compatibility_prediction: false,

    star_size_multiplier: 1,
    star_brightness: 'dim',
    has_aura: false,
    aura_animated: false,
    shooting_star_effect: false,
    appears_first: false
  },

  premium: {
    name: "Étoile Brillante",
    emoji: "💎",
    color: "#E63946",
    tier: 'premium',

    daily_signals: 20,
    signal_recharge_hours: 8,
    super_nova: 1,

    constellation_limit: 50,
    min_compatibility_visible: 40,
    profile_preview: 'full',
    compatibility_detail: 'detailed',

    can_see_who_signaled: true,
    can_see_signal_time: false,
    can_filter: true,
    can_filter_online: false,
    can_boost: true,
    can_rewind: false,
    can_go_incognito: false,

    astra_suggestions_daily: 3,
    astra_icebreakers: true,
    astra_writes_first_message: false,
    astra_analysis: 'detailed',
    astra_compatibility_prediction: false,

    star_size_multiplier: 1.5,
    star_brightness: 'bright',
    has_aura: true,
    aura_animated: false,
    shooting_star_effect: false,
    appears_first: false
  },

  elite: {
    name: "Supernova",
    emoji: "👑",
    color: "linear-gradient(135deg, #FFD700, #FF6B6B, #A855F7)",
    tier: 'elite',

    daily_signals: 999999,
    signal_recharge_hours: 0,
    super_nova: 5,

    constellation_limit: 999999,
    min_compatibility_visible: 0,
    profile_preview: 'full_plus',
    compatibility_detail: 'ultra',

    can_see_who_signaled: true,
    can_see_signal_time: true,
    can_filter: true,
    can_filter_online: true,
    can_boost: true,
    can_rewind: true,
    can_go_incognito: true,

    astra_suggestions_daily: 10,
    astra_icebreakers: true,
    astra_writes_first_message: true,
    astra_analysis: 'ultra',
    astra_compatibility_prediction: true,

    star_size_multiplier: 2,
    star_brightness: 'supernova',
    has_aura: true,
    aura_animated: true,
    shooting_star_effect: true,
    appears_first: true
  }
};

export function getPowersByTier(tier?: string): CosmicPowers {
  const normalizedTier = (tier?.toLowerCase() || 'free') as UserTier;
  return COSMIC_POWERS[normalizedTier] || COSMIC_POWERS.free;
}

export interface StarPosition {
  x: number;
  y: number;
}

export function calculateStarPosition(
  compatibility: number,
  index: number,
  total: number
): StarPosition {
  const maxRadius = 280;
  const minRadius = 60;

  const normalizedCompat = compatibility / 100;
  const distance = maxRadius - (normalizedCompat * (maxRadius - minRadius));

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const angle = index * goldenAngle;

  const randomOffset = (Math.random() - 0.5) * 30;

  return {
    x: Math.cos(angle) * (distance + randomOffset),
    y: Math.sin(angle) * (distance + randomOffset)
  };
}

export type StarVisualType = 'supernova' | 'bright' | 'medium' | 'dim' | 'distant';

export function getStarVisualType(compatibility: number): StarVisualType {
  if (compatibility >= 90) return 'supernova';
  if (compatibility >= 75) return 'bright';
  if (compatibility >= 60) return 'medium';
  if (compatibility >= 45) return 'dim';
  return 'distant';
}

export function getStarSize(compatibility: number, tier?: string): number {
  let baseSize = 12;
  if (compatibility >= 90) baseSize = 28;
  else if (compatibility >= 75) baseSize = 22;
  else if (compatibility >= 60) baseSize = 18;
  else if (compatibility >= 45) baseSize = 14;

  if (tier === 'elite') baseSize *= 1.3;
  else if (tier === 'premium') baseSize *= 1.15;

  return baseSize;
}

export async function getRemainingSignals(userId: string) {
  try {
    const { data, error } = await supabase.rpc('get_remaining_cosmic_signals', {
      p_user_id: userId
    });

    if (error) throw error;

    return data && data.length > 0 ? data[0] : {
      signals_remaining: 3,
      super_novas_remaining: 0,
      tier: 'free'
    };
  } catch (error) {
    console.error('Error getting remaining signals:', error);
    return {
      signals_remaining: 3,
      super_novas_remaining: 0,
      tier: 'free'
    };
  }
}

export async function sendCosmicSignal(
  fromUserId: string,
  toUserId: string,
  isSuperNova: boolean = false,
  isIncognito: boolean = false
) {
  try {
    const { data: signal, error: signalError } = await supabase
      .from('cosmic_signals')
      .insert({
        from_user: fromUserId,
        to_user: toUserId,
        signal_type: isSuperNova ? 'super_nova' : 'signal',
        is_incognito: isIncognito
      })
      .select()
      .single();

    if (signalError) throw signalError;

    await supabase.rpc('increment_cosmic_signal_usage', {
      p_user_id: fromUserId,
      p_is_super_nova: isSuperNova
    });

    const { data: isMatch } = await supabase.rpc('check_cosmic_match', {
      p_user1_id: fromUserId,
      p_user2_id: toUserId
    });

    if (isMatch) {
      const [user1, user2] = [fromUserId, toUserId].sort();

      const { data: existingMatch } = await supabase
        .from('cosmic_matches')
        .select('*')
        .eq('user1_id', user1)
        .eq('user2_id', user2)
        .maybeSingle();

      let match = existingMatch;

      if (!existingMatch) {
        const { data: newMatch, error: matchError } = await supabase
          .from('cosmic_matches')
          .insert({
            user1_id: user1,
            user2_id: user2,
            compatibility_score: 75
          })
          .select()
          .single();

        if (matchError) throw matchError;
        match = newMatch;

        const { data: existingConv } = await supabase
          .from('conversations')
          .select('id')
          .or(`and(user1_id.eq.${user1},user2_id.eq.${user2})`)
          .maybeSingle();

        if (!existingConv) {
          await supabase
            .from('conversations')
            .insert({
              user1_id: user1,
              user2_id: user2,
              match_id: match.id
            });
        }
      }

      return { success: true, matched: true, match };
    }

    return { success: true, matched: false };
  } catch (error) {
    console.error('Error sending cosmic signal:', error);
    throw error;
  }
}

export async function getConstellationProfiles(userId: string) {
  try {
    const { data: currentUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!currentUser) throw new Error('User not found');

    const powers = getPowersByTier(currentUser.subscription_tier);

    let query = supabase
      .from('profiles')
      .select('*')
      .neq('id', userId)
      .limit(powers.constellation_limit);

    if (currentUser.gender_preference) {
      query = query.eq('gender', currentUser.gender_preference);
    }

    const { data: profiles, error } = await query;

    if (error) throw error;

    const { data: sentSignals } = await supabase
      .from('cosmic_signals')
      .select('to_user')
      .eq('from_user', userId);

    const { data: receivedSignals } = await supabase
      .from('cosmic_signals')
      .select('from_user')
      .eq('to_user', userId);

    const sentSignalIds = new Set(sentSignals?.map(s => s.to_user) || []);
    const receivedSignalIds = new Set(receivedSignals?.map(s => s.from_user) || []);

    const filteredProfiles = (profiles || [])
      .filter(p => !sentSignalIds.has(p.id))
      .map(profile => {
        const compatScore = calculateCompatibility(currentUser, profile);

        return {
          ...profile,
          compatibility: {
            score: compatScore,
            level: getCompatibilityLevel(compatScore),
            factors: {
              location: 25,
              age: 20,
              quiz: 35,
              astro: 10
            }
          },
          has_signaled_you: receivedSignalIds.has(profile.id)
        };
      })
      .filter(p => p.compatibility.score >= powers.min_compatibility_visible)
      .sort((a, b) => b.compatibility.score - a.compatibility.score);

    if (powers.profile_preview === 'blurred') {
      return filteredProfiles.map(p => ({
        ...p,
        photo: null,
        first_name: '???'
      }));
    }

    return filteredProfiles;
  } catch (error) {
    console.error('Error getting constellation profiles:', error);
    return [];
  }
}

function calculateCompatibility(user1: any, user2: any): number {
  let score = 0;

  const ageDiff = Math.abs((user1.age || 25) - (user2.age || 25));
  if (ageDiff <= 2) score += 20;
  else if (ageDiff <= 5) score += 15;
  else if (ageDiff <= 10) score += 10;
  else score += 5;

  score += Math.floor(Math.random() * 30) + 40;

  return Math.min(100, Math.max(0, score));
}

function getCompatibilityLevel(score: number) {
  if (score >= 90) return { emoji: '🌟', label: 'Connexion Exceptionnelle' };
  if (score >= 75) return { emoji: '⭐', label: 'Très Compatible' };
  if (score >= 60) return { emoji: '✨', label: 'Bonne Compatibilité' };
  if (score >= 45) return { emoji: '💫', label: 'Compatible' };
  return { emoji: '·', label: 'Peu Compatible' };
}

export function getZodiacEmoji(sign: string): string {
  const zodiacEmojis: Record<string, string> = {
    'belier': '♈',
    'taureau': '♉',
    'gemeaux': '♊',
    'cancer': '♋',
    'lion': '♌',
    'vierge': '♍',
    'balance': '♎',
    'scorpion': '♏',
    'sagittaire': '♐',
    'capricorne': '♑',
    'verseau': '♒',
    'poissons': '♓'
  };

  return zodiacEmojis[sign?.toLowerCase()] || '⭐';
}
