import { supabase } from '../lib/supabase';
import type {
  ActionResult,
  SignalerInfo,
  ProfileVisitor,
  BirthData,
  AstralChart,
  CompatibilityResult,
  IceBreakerSuggestion,
  CoachAdvice,
  MessageContext,
  PlanId,
} from '../types/subscription';
import { getPlanById, normalizePlanId } from '../config/subscriptionPlans';

async function getCurrentUserPlan(): Promise<{ userId: string; planId: PlanId } | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('astra_profiles')
    .select('premium_tier')
    .eq('id', user.id)
    .maybeSingle();

  return {
    userId: user.id,
    planId: normalizePlanId(data?.premium_tier),
  };
}

async function getDailyUsage(userId: string, column: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('daily_usage')
    .select(column)
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  return data?.[column] || 0;
}

async function incrementDailyUsage(userId: string, column: string, amount = 1): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const { data: existing } = await supabase
    .from('daily_usage')
    .select('id, ' + column)
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (existing) {
    const current = (existing as Record<string, number>)[column] || 0;
    await supabase
      .from('daily_usage')
      .update({ [column]: current + amount })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('daily_usage')
      .insert({ user_id: userId, date: today, [column]: amount });
  }
}

export async function sendCosmicSignal(targetUserId: string): Promise<ActionResult> {
  try {
    const userInfo = await getCurrentUserPlan();
    if (!userInfo) {
      return { success: false, error: 'AUTH_REQUIRED', message: 'Connexion requise' };
    }

    const plan = getPlanById(userInfo.planId);
    const limit = plan.limits.cosmicSignalsPerDay;

    if (limit !== Infinity) {
      const used = await getDailyUsage(userInfo.userId, 'cosmic_signals');
      if (used >= limit) {
        return {
          success: false,
          error: 'LIMIT_REACHED',
          message: `Limite de ${limit} signaux atteinte`,
          remaining: 0,
        };
      }
    }

    const { error } = await supabase
      .from('swipes')
      .insert({
        user_id: userInfo.userId,
        target_user_id: targetUserId,
        action: 'like',
      });

    if (error) throw error;

    await incrementDailyUsage(userInfo.userId, 'cosmic_signals');

    const remaining = limit === Infinity ? Infinity : limit - (await getDailyUsage(userInfo.userId, 'cosmic_signals'));

    return { success: true, remaining };
  } catch (err) {
    console.error('[subscriptionService] sendCosmicSignal error:', err);
    return { success: false, error: 'NETWORK_ERROR', message: 'Erreur reseau' };
  }
}

export async function sendSuperNova(targetUserId: string): Promise<ActionResult> {
  try {
    const userInfo = await getCurrentUserPlan();
    if (!userInfo) {
      return { success: false, error: 'AUTH_REQUIRED', message: 'Connexion requise' };
    }

    const plan = getPlanById(userInfo.planId);

    if (!plan.features.superNova) {
      return {
        success: false,
        error: 'FEATURE_LOCKED',
        message: 'Super Nova disponible avec Premium',
      };
    }

    const limit = plan.limits.superNovaPerDay;
    const used = await getDailyUsage(userInfo.userId, 'super_nova');

    if (used >= limit) {
      return {
        success: false,
        error: 'LIMIT_REACHED',
        message: `Limite de ${limit} Super Nova atteinte`,
        remaining: 0,
      };
    }

    const { error } = await supabase
      .from('swipes')
      .insert({
        user_id: userInfo.userId,
        target_user_id: targetUserId,
        action: 'super_nova',
      });

    if (error) throw error;

    await incrementDailyUsage(userInfo.userId, 'super_nova');

    return { success: true, remaining: limit - used - 1 };
  } catch (err) {
    console.error('[subscriptionService] sendSuperNova error:', err);
    return { success: false, error: 'NETWORK_ERROR', message: 'Erreur reseau' };
  }
}

export async function sendAstraMessage(conversationId: string, message: string): Promise<ActionResult> {
  try {
    const userInfo = await getCurrentUserPlan();
    if (!userInfo) {
      return { success: false, error: 'AUTH_REQUIRED', message: 'Connexion requise' };
    }

    const plan = getPlanById(userInfo.planId);
    const limit = plan.limits.astraMessagesPerDay;
    const used = await getDailyUsage(userInfo.userId, 'astra_messages');

    if (used >= limit) {
      return {
        success: false,
        error: 'LIMIT_REACHED',
        message: `Limite de ${limit} messages Astra atteinte`,
        remaining: 0,
      };
    }

    const { data, error } = await supabase
      .from('astra_messages')
      .insert({
        conversation_id: conversationId,
        user_id: userInfo.userId,
        content: message,
        role: 'user',
      })
      .select()
      .single();

    if (error) throw error;

    await incrementDailyUsage(userInfo.userId, 'astra_messages');

    return { success: true, data, remaining: limit - used - 1 };
  } catch (err) {
    console.error('[subscriptionService] sendAstraMessage error:', err);
    return { success: false, error: 'NETWORK_ERROR', message: 'Erreur reseau' };
  }
}

export async function sendMatchMessage(matchId: string, message: string): Promise<ActionResult> {
  try {
    const userInfo = await getCurrentUserPlan();
    if (!userInfo) {
      return { success: false, error: 'AUTH_REQUIRED', message: 'Connexion requise' };
    }

    const plan = getPlanById(userInfo.planId);
    const limit = plan.limits.matchMessagesPerDay;

    if (limit !== Infinity) {
      const used = await getDailyUsage(userInfo.userId, 'match_messages');
      if (used >= limit) {
        return {
          success: false,
          error: 'LIMIT_REACHED',
          message: `Limite de ${limit} messages atteinte`,
          remaining: 0,
        };
      }
    }

    const { data, error } = await supabase
      .from('user_messages')
      .insert({
        conversation_id: matchId,
        sender_id: userInfo.userId,
        content: message,
      })
      .select()
      .single();

    if (error) throw error;

    await incrementDailyUsage(userInfo.userId, 'match_messages');

    const remaining = limit === Infinity ? Infinity : limit - (await getDailyUsage(userInfo.userId, 'match_messages'));

    return { success: true, data, remaining };
  } catch (err) {
    console.error('[subscriptionService] sendMatchMessage error:', err);
    return { success: false, error: 'NETWORK_ERROR', message: 'Erreur reseau' };
  }
}

export async function getSignalers(): Promise<ActionResult<SignalerInfo[]>> {
  try {
    const userInfo = await getCurrentUserPlan();
    if (!userInfo) {
      return { success: false, error: 'AUTH_REQUIRED', message: 'Connexion requise' };
    }

    const plan = getPlanById(userInfo.planId);

    if (!plan.features.seeWhoSignaled) {
      return {
        success: false,
        error: 'FEATURE_LOCKED',
        message: 'Disponible avec Premium',
      };
    }

    const selectFields = plan.features.seeWhenSignaled
      ? 'user_id, created_at, profiles:user_id(username, photo_url, zodiac_sign)'
      : 'user_id, profiles:user_id(username, photo_url, zodiac_sign)';

    const { data, error } = await supabase
      .from('swipes')
      .select(selectFields)
      .eq('target_user_id', userInfo.userId)
      .eq('action', 'like')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const signalers: SignalerInfo[] = (data || []).map((item: Record<string, unknown>) => {
      const profile = item.profiles as Record<string, unknown> | null;
      return {
        userId: item.user_id as string,
        username: profile?.username as string || 'Anonyme',
        photoUrl: profile?.photo_url as string || null,
        zodiacSign: profile?.zodiac_sign as string || null,
        signaledAt: plan.features.seeWhenSignaled && item.created_at
          ? new Date(item.created_at as string)
          : undefined,
      };
    });

    return { success: true, data: signalers };
  } catch (err) {
    console.error('[subscriptionService] getSignalers error:', err);
    return { success: false, error: 'NETWORK_ERROR', message: 'Erreur reseau' };
  }
}

interface AstroFilters {
  sunSign?: string;
  moonSign?: string;
  ascendant?: string;
  ageMin?: number;
  ageMax?: number;
  distance?: number;
}

interface ExploreProfile {
  id: string;
  username: string;
  photoUrl: string | null;
  zodiacSign: string | null;
  age: number | null;
  compatibility: number;
  isBlurred: boolean;
}

export async function exploreUniverse(filters?: AstroFilters): Promise<ActionResult<ExploreProfile[]>> {
  try {
    const userInfo = await getCurrentUserPlan();
    if (!userInfo) {
      return { success: false, error: 'AUTH_REQUIRED', message: 'Connexion requise' };
    }

    const plan = getPlanById(userInfo.planId);
    const limit = plan.limits.visibleStars === Infinity ? 100 : plan.limits.visibleStars;

    let query = supabase
      .from('profiles')
      .select('id, username, photo_url, zodiac_sign, birth_date, moon_sign, ascendant')
      .neq('id', userInfo.userId)
      .limit(limit);

    if (filters && plan.features.advancedAstroFilters) {
      if (filters.sunSign) query = query.eq('zodiac_sign', filters.sunSign);
      if (filters.moonSign) query = query.eq('moon_sign', filters.moonSign);
      if (filters.ascendant) query = query.eq('ascendant', filters.ascendant);
    }

    const { data, error } = await query;

    if (error) throw error;

    const profiles: ExploreProfile[] = (data || []).map(profile => {
      const age = profile.birth_date
        ? Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null;

      return {
        id: profile.id,
        username: profile.username || 'Anonyme',
        photoUrl: profile.photo_url,
        zodiacSign: profile.zodiac_sign,
        age,
        compatibility: Math.floor(Math.random() * 40) + 60,
        isBlurred: userInfo.planId === 'free',
      };
    });

    return { success: true, data: profiles };
  } catch (err) {
    console.error('[subscriptionService] exploreUniverse error:', err);
    return { success: false, error: 'NETWORK_ERROR', message: 'Erreur reseau' };
  }
}

export async function uploadPhoto(photoUrl: string): Promise<ActionResult> {
  try {
    const userInfo = await getCurrentUserPlan();
    if (!userInfo) {
      return { success: false, error: 'AUTH_REQUIRED', message: 'Connexion requise' };
    }

    const plan = getPlanById(userInfo.planId);
    const maxPhotos = plan.limits.maxPhotos;

    const { data: profile } = await supabase
      .from('profiles')
      .select('photos')
      .eq('id', userInfo.userId)
      .maybeSingle();

    const currentPhotos = (profile?.photos as string[]) || [];

    if (currentPhotos.length >= maxPhotos) {
      return {
        success: false,
        error: 'LIMIT_REACHED',
        message: `Maximum ${maxPhotos} photos atteint`,
      };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ photos: [...currentPhotos, photoUrl] })
      .eq('id', userInfo.userId);

    if (error) throw error;

    return { success: true, remaining: maxPhotos - currentPhotos.length - 1 };
  } catch (err) {
    console.error('[subscriptionService] uploadPhoto error:', err);
    return { success: false, error: 'NETWORK_ERROR', message: 'Erreur reseau' };
  }
}

export async function updateBio(bioText: string): Promise<ActionResult> {
  try {
    const userInfo = await getCurrentUserPlan();
    if (!userInfo) {
      return { success: false, error: 'AUTH_REQUIRED', message: 'Connexion requise' };
    }

    const plan = getPlanById(userInfo.planId);
    const maxChars = plan.limits.maxBioChars;

    if (maxChars !== Infinity && bioText.length > maxChars) {
      return {
        success: false,
        error: 'LIMIT_REACHED',
        message: `Maximum ${maxChars} caracteres (${bioText.length} utilises)`,
      };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ bio: bioText })
      .eq('id', userInfo.userId);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    console.error('[subscriptionService] updateBio error:', err);
    return { success: false, error: 'NETWORK_ERROR', message: 'Erreur reseau' };
  }
}

interface HoroscopeData {
  sign: string;
  date: string;
  general: string;
  love: string;
  career?: string;
  health?: string;
  luckyNumber?: number;
  mood?: string;
  compatibility?: string;
}

export async function getHoroscope(zodiacSign: string): Promise<ActionResult<HoroscopeData>> {
  try {
    const userInfo = await getCurrentUserPlan();
    if (!userInfo) {
      return { success: false, error: 'AUTH_REQUIRED', message: 'Connexion requise' };
    }

    const plan = getPlanById(userInfo.planId);
    const isAdvanced = plan.features.advancedHoroscope;

    const { data, error } = await supabase
      .from('horoscope_cache')
      .select('*')
      .eq('zodiac_sign', zodiacSign.toLowerCase())
      .eq('date', new Date().toISOString().split('T')[0])
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;

    if (data) {
      const horoscope: HoroscopeData = {
        sign: zodiacSign,
        date: data.date,
        general: data.general_prediction,
        love: data.love_prediction,
      };

      if (isAdvanced) {
        horoscope.career = data.career_prediction;
        horoscope.health = data.health_prediction;
        horoscope.luckyNumber = data.lucky_number;
        horoscope.mood = data.mood;
        horoscope.compatibility = data.best_compatibility;
      }

      return { success: true, data: horoscope };
    }

    const basicHoroscope: HoroscopeData = {
      sign: zodiacSign,
      date: new Date().toISOString().split('T')[0],
      general: 'Les astres sont alignes en ta faveur aujourd\'hui.',
      love: 'Bonne journee pour les rencontres.',
    };

    return { success: true, data: basicHoroscope };
  } catch (err) {
    console.error('[subscriptionService] getHoroscope error:', err);
    return { success: false, error: 'NETWORK_ERROR', message: 'Erreur reseau' };
  }
}

export async function getCompatibility(targetUserId: string): Promise<ActionResult<CompatibilityResult>> {
  try {
    const userInfo = await getCurrentUserPlan();
    if (!userInfo) {
      return { success: false, error: 'AUTH_REQUIRED', message: 'Connexion requise' };
    }

    const plan = getPlanById(userInfo.planId);
    const isAdvanced = plan.features.advancedCosmicCompatibility;

    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('zodiac_sign, moon_sign, ascendant')
      .eq('id', targetUserId)
      .maybeSingle();

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('zodiac_sign, moon_sign, ascendant')
      .eq('id', userInfo.userId)
      .maybeSingle();

    const baseScore = Math.floor(Math.random() * 30) + 50;

    const result: CompatibilityResult = {
      score: baseScore,
      level: baseScore >= 80 ? 'cosmic' : baseScore >= 65 ? 'high' : baseScore >= 50 ? 'medium' : 'low',
      summary: `Compatibilite ${baseScore >= 65 ? 'prometteuse' : 'a explorer'} entre ${userProfile?.zodiac_sign || 'vous'} et ${targetProfile?.zodiac_sign || 'cette personne'}.`,
    };

    if (isAdvanced) {
      result.details = {
        emotional: Math.floor(Math.random() * 40) + 60,
        intellectual: Math.floor(Math.random() * 40) + 60,
        physical: Math.floor(Math.random() * 40) + 60,
        spiritual: Math.floor(Math.random() * 40) + 60,
        communication: Math.floor(Math.random() * 40) + 60,
      };
      result.advice = [
        'Cultivez la communication ouverte',
        'Respectez vos differences',
        'Partagez vos passions communes',
      ];
    }

    return { success: true, data: result };
  } catch (err) {
    console.error('[subscriptionService] getCompatibility error:', err);
    return { success: false, error: 'NETWORK_ERROR', message: 'Erreur reseau' };
  }
}

export async function activateBoost(): Promise<ActionResult> {
  try {
    const userInfo = await getCurrentUserPlan();
    if (!userInfo) {
      return { success: false, error: 'AUTH_REQUIRED', message: 'Connexion requise' };
    }

    const plan = getPlanById(userInfo.planId);

    if (!plan.features.visibilityBoost) {
      return {
        success: false,
        error: 'FEATURE_LOCKED',
        message: 'Boost disponible avec Premium',
      };
    }

    const boostDuration = plan.tier === 2 ? 60 : 30;
    const boostUntil = new Date(Date.now() + boostDuration * 60 * 1000);

    const { error } = await supabase
      .from('profiles')
      .update({
        boost_active: true,
        boost_expiry: boostUntil.toISOString(),
        visibility_multiplier: plan.limits.visibilityBoost,
      })
      .eq('id', userInfo.userId);

    if (error) throw error;

    return {
      success: true,
      data: {
        boostUntil,
        multiplier: plan.limits.visibilityBoost,
      },
    };
  } catch (err) {
    console.error('[subscriptionService] activateBoost error:', err);
    return { success: false, error: 'NETWORK_ERROR', message: 'Erreur reseau' };
  }
}

export async function sendSuperLike(targetUserId: string): Promise<ActionResult> {
  try {
    const userInfo = await getCurrentUserPlan();
    if (!userInfo) {
      return { success: false, error: 'AUTH_REQUIRED', message: 'Connexion requise' };
    }

    const plan = getPlanById(userInfo.planId);
    const limit = plan.limits.superLikesPerDay;

    if (limit === 0) {
      return {
        success: false,
        error: 'FEATURE_LOCKED',
        message: 'Super likes disponibles avec Elite',
      };
    }

    const used = await getDailyUsage(userInfo.userId, 'super_likes');

    if (used >= limit) {
      return {
        success: false,
        error: 'LIMIT_REACHED',
        message: `Limite de ${limit} super likes atteinte`,
        remaining: 0,
      };
    }

    const { error } = await supabase
      .from('swipes')
      .insert({
        user_id: userInfo.userId,
        target_user_id: targetUserId,
        action: 'super_like',
      });

    if (error) throw error;

    await incrementDailyUsage(userInfo.userId, 'super_likes');

    return { success: true, remaining: limit - used - 1 };
  } catch (err) {
    console.error('[subscriptionService] sendSuperLike error:', err);
    return { success: false, error: 'NETWORK_ERROR', message: 'Erreur reseau' };
  }
}

export async function rewindProfile(profileId: string): Promise<ActionResult> {
  try {
    const userInfo = await getCurrentUserPlan();
    if (!userInfo) {
      return { success: false, error: 'AUTH_REQUIRED', message: 'Connexion requise' };
    }

    const plan = getPlanById(userInfo.planId);

    if (!plan.features.rewind) {
      return {
        success: false,
        error: 'FEATURE_LOCKED',
        message: 'Rembobinage disponible avec Elite',
      };
    }

    const { error } = await supabase
      .from('swipes')
      .delete()
      .eq('user_id', userInfo.userId)
      .eq('target_user_id', profileId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    console.error('[subscriptionService] rewindProfile error:', err);
    return { success: false, error: 'NETWORK_ERROR', message: 'Erreur reseau' };
  }
}

export async function toggleIncognito(enabled: boolean): Promise<ActionResult> {
  try {
    const userInfo = await getCurrentUserPlan();
    if (!userInfo) {
      return { success: false, error: 'AUTH_REQUIRED', message: 'Connexion requise' };
    }

    const plan = getPlanById(userInfo.planId);

    if (!plan.features.incognitoMode) {
      return {
        success: false,
        error: 'FEATURE_LOCKED',
        message: 'Mode incognito disponible avec Elite',
      };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ incognito_mode: enabled })
      .eq('id', userInfo.userId);

    if (error) throw error;

    return { success: true, data: { incognito: enabled } };
  } catch (err) {
    console.error('[subscriptionService] toggleIncognito error:', err);
    return { success: false, error: 'NETWORK_ERROR', message: 'Erreur reseau' };
  }
}

export async function getProfileVisitors(): Promise<ActionResult<ProfileVisitor[]>> {
  try {
    const userInfo = await getCurrentUserPlan();
    if (!userInfo) {
      return { success: false, error: 'AUTH_REQUIRED', message: 'Connexion requise' };
    }

    const plan = getPlanById(userInfo.planId);

    if (!plan.features.profileVisitors) {
      return {
        success: false,
        error: 'FEATURE_LOCKED',
        message: 'Visiteurs disponibles avec Elite',
      };
    }

    const { data, error } = await supabase
      .from('profile_visits')
      .select('visitor_id, visited_at, profiles:visitor_id(username, photo_url, zodiac_sign)')
      .eq('visited_id', userInfo.userId)
      .order('visited_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const visitors: ProfileVisitor[] = (data || []).map((item: Record<string, unknown>) => {
      const profile = item.profiles as Record<string, unknown> | null;
      return {
        userId: item.visitor_id as string,
        username: profile?.username as string || 'Anonyme',
        photoUrl: profile?.photo_url as string || null,
        zodiacSign: profile?.zodiac_sign as string || null,
        visitedAt: new Date(item.visited_at as string),
      };
    });

    return { success: true, data: visitors };
  } catch (err) {
    console.error('[subscriptionService] getProfileVisitors error:', err);
    return { success: false, error: 'NETWORK_ERROR', message: 'Erreur reseau' };
  }
}

export async function getFullAstralChart(birthData: BirthData): Promise<ActionResult<AstralChart>> {
  try {
    const userInfo = await getCurrentUserPlan();
    if (!userInfo) {
      return { success: false, error: 'AUTH_REQUIRED', message: 'Connexion requise' };
    }

    const plan = getPlanById(userInfo.planId);

    if (!plan.features.fullAstralChart) {
      return {
        success: false,
        error: 'FEATURE_LOCKED',
        message: 'Theme astral complet disponible avec Elite',
      };
    }

    const chart: AstralChart = {
      sunSign: 'Scorpion',
      moonSign: 'Cancer',
      ascendant: 'Lion',
      planets: {
        Soleil: { sign: 'Scorpion', house: 10, degree: 15 },
        Lune: { sign: 'Cancer', house: 6, degree: 22 },
        Mercure: { sign: 'Sagittaire', house: 11, degree: 5 },
        Venus: { sign: 'Balance', house: 9, degree: 18 },
        Mars: { sign: 'Capricorne', house: 12, degree: 8 },
      },
      houses: {
        1: 'Lion', 2: 'Vierge', 3: 'Balance', 4: 'Scorpion',
        5: 'Sagittaire', 6: 'Capricorne', 7: 'Verseau', 8: 'Poissons',
        9: 'Belier', 10: 'Taureau', 11: 'Gemeaux', 12: 'Cancer',
      },
      aspects: [
        { planet1: 'Soleil', planet2: 'Lune', type: 'trigone', orb: 2.5 },
        { planet1: 'Venus', planet2: 'Mars', type: 'carre', orb: 1.8 },
      ],
    };

    return { success: true, data: chart };
  } catch (err) {
    console.error('[subscriptionService] getFullAstralChart error:', err);
    return { success: false, error: 'NETWORK_ERROR', message: 'Erreur reseau' };
  }
}

export async function getProfileTips(): Promise<ActionResult<string[]>> {
  try {
    const userInfo = await getCurrentUserPlan();
    if (!userInfo) {
      return { success: false, error: 'AUTH_REQUIRED', message: 'Connexion requise' };
    }

    const plan = getPlanById(userInfo.planId);

    if (!plan.features.aiProfileTips) {
      return {
        success: false,
        error: 'FEATURE_LOCKED',
        message: 'Conseils IA disponibles avec Premium',
      };
    }

    const tips = [
      'Ajoute une photo ou tu souris pour attirer plus de matchs',
      'Mentionne tes passions dans ta bio',
      'Reponds aux messages dans les 24h pour plus de conversations',
      'Complete ton profil astrologique pour de meilleurs matchs',
    ];

    return { success: true, data: tips };
  } catch (err) {
    console.error('[subscriptionService] getProfileTips error:', err);
    return { success: false, error: 'NETWORK_ERROR', message: 'Erreur reseau' };
  }
}

interface TargetProfile {
  name: string;
  zodiacSign: string;
  interests: string[];
}

export async function generateIceBreaker(targetProfile: TargetProfile): Promise<ActionResult<IceBreakerSuggestion[]>> {
  try {
    const userInfo = await getCurrentUserPlan();
    if (!userInfo) {
      return { success: false, error: 'AUTH_REQUIRED', message: 'Connexion requise' };
    }

    const plan = getPlanById(userInfo.planId);

    if (!plan.features.aiIceBreakers) {
      return {
        success: false,
        error: 'FEATURE_LOCKED',
        message: 'Ice-breakers disponibles avec Premium',
      };
    }

    const suggestions: IceBreakerSuggestion[] = [
      {
        message: `Salut ${targetProfile.name}! En tant que ${targetProfile.zodiacSign}, tu dois avoir un cote mysterieux... j'ai envie d'en savoir plus!`,
        category: 'astrology',
        confidence: 0.85,
      },
      {
        message: `Hey! J'ai vu que tu aimes ${targetProfile.interests[0] || 'voyager'}. C'est quoi ta meilleure experience?`,
        category: 'question',
        confidence: 0.9,
      },
      {
        message: `Ton sourire sur ta photo m'a fait cliquer instantanement. Tu as l'air d'avoir une energie incroyable!`,
        category: 'compliment',
        confidence: 0.8,
      },
    ];

    return { success: true, data: suggestions };
  } catch (err) {
    console.error('[subscriptionService] generateIceBreaker error:', err);
    return { success: false, error: 'NETWORK_ERROR', message: 'Erreur reseau' };
  }
}

export async function astraWriteMessage(context: MessageContext): Promise<ActionResult<string>> {
  try {
    const userInfo = await getCurrentUserPlan();
    if (!userInfo) {
      return { success: false, error: 'AUTH_REQUIRED', message: 'Connexion requise' };
    }

    const plan = getPlanById(userInfo.planId);

    if (!plan.features.astraWritesMessages) {
      return {
        success: false,
        error: 'FEATURE_LOCKED',
        message: 'Astra ecrit tes messages avec Elite',
      };
    }

    const intentMessages: Record<string, string> = {
      flirt: `Hey ${context.matchProfile.name}! Les ${context.matchProfile.zodiacSign} ont toujours su me charmer... Tu veux qu'on se decouvre?`,
      romantic: `Je dois t'avouer que ton profil m'a vraiment touche. Il y a quelque chose de special chez toi, ${context.matchProfile.name}.`,
      casual: `Salut ${context.matchProfile.name}! Tu fais quoi de beau ce soir?`,
      friendly: `Hey! J'ai vu qu'on avait des interets en commun. Ca te dit d'en discuter?`,
    };

    const message = intentMessages[context.userIntent] || intentMessages.casual;

    return { success: true, data: message };
  } catch (err) {
    console.error('[subscriptionService] astraWriteMessage error:', err);
    return { success: false, error: 'NETWORK_ERROR', message: 'Erreur reseau' };
  }
}

export async function getCoachAdvice(situation: string): Promise<ActionResult<CoachAdvice>> {
  try {
    const userInfo = await getCurrentUserPlan();
    if (!userInfo) {
      return { success: false, error: 'AUTH_REQUIRED', message: 'Connexion requise' };
    }

    const plan = getPlanById(userInfo.planId);

    if (!plan.features.aiCoachPro) {
      return {
        success: false,
        error: 'FEATURE_LOCKED',
        message: 'Coach IA Pro disponible avec Elite',
      };
    }

    const advice: CoachAdvice = {
      situation,
      advice: 'Prends le temps d\'ecouter vraiment l\'autre personne. La communication authentique est la cle de toute relation reussie.',
      tips: [
        'Pose des questions ouvertes',
        'Montre de l\'interet sincere',
        'Sois toi-meme',
        'Ne te precipite pas',
      ],
      astrologicalInsight: 'Cette periode est favorable aux nouvelles connexions emotionnelles.',
    };

    return { success: true, data: advice };
  } catch (err) {
    console.error('[subscriptionService] getCoachAdvice error:', err);
    return { success: false, error: 'NETWORK_ERROR', message: 'Erreur reseau' };
  }
}
