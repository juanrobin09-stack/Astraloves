import { supabase } from './supabase';

export interface UniverseUser {
  id: string;
  first_name: string;
  age: number;
  ville: string;
  photos: string[];
  photo_principale?: string;
  signe_solaire: string;
  bio: string;
  latitude?: number;
  longitude?: number;
  distance_km?: number;
  compatibilite: number;
  est_en_ligne?: boolean;
  dernier_signal_recu?: string;
  premium_tier: 'gratuit' | 'premium' | 'premium_plus';
}

export interface CosmicSignal {
  id: string;
  from_user_id: string;
  to_user_id: string;
  type: 'signal' | 'super_nova';
  message?: string;
  created_at: string;
  is_seen: boolean;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function formatDistance(km: number): string {
  if (km < 1) return "À moins d'1 km";
  if (km <= 10) return `À ${km} km`;
  if (km <= 50) return `À ~${Math.round(km / 5) * 5} km`;
  if (km <= 100) return "Dans ta région";
  return `À ${km} km`;
}

function calculateCompatibility(user1: any, user2: any): number {
  let score = 0;
  let factors = 0;

  if (user1.signe_solaire && user2.signe_solaire) {
    const compatibleSigns: Record<string, string[]> = {
      'Bélier': ['Lion', 'Sagittaire', 'Gémeaux', 'Verseau'],
      'Taureau': ['Vierge', 'Capricorne', 'Cancer', 'Poissons'],
      'Gémeaux': ['Balance', 'Verseau', 'Bélier', 'Lion'],
      'Cancer': ['Scorpion', 'Poissons', 'Taureau', 'Vierge'],
      'Lion': ['Bélier', 'Sagittaire', 'Gémeaux', 'Balance'],
      'Vierge': ['Taureau', 'Capricorne', 'Cancer', 'Scorpion'],
      'Balance': ['Gémeaux', 'Verseau', 'Lion', 'Sagittaire'],
      'Scorpion': ['Cancer', 'Poissons', 'Vierge', 'Capricorne'],
      'Sagittaire': ['Bélier', 'Lion', 'Balance', 'Verseau'],
      'Capricorne': ['Taureau', 'Vierge', 'Scorpion', 'Poissons'],
      'Verseau': ['Gémeaux', 'Balance', 'Bélier', 'Sagittaire'],
      'Poissons': ['Cancer', 'Scorpion', 'Taureau', 'Capricorne']
    };

    const compatibles = compatibleSigns[user1.signe_solaire] || [];
    if (compatibles.includes(user2.signe_solaire)) {
      score += 95;
    } else if (user1.signe_solaire === user2.signe_solaire) {
      score += 80;
    } else {
      score += 65;
    }
    factors++;
  }

  if (user1.interets && user2.interets) {
    const interests1 = Array.isArray(user1.interets) ? user1.interets : [];
    const interests2 = Array.isArray(user2.interets) ? user2.interets : [];
    const commonInterests = interests1.filter((i: string) => interests2.includes(i)).length;
    const totalInterests = Math.max(interests1.length, interests2.length);
    if (totalInterests > 0) {
      score += (commonInterests / totalInterests) * 100;
      factors++;
    }
  }

  if (user1.valeurs && user2.valeurs) {
    const values1 = Array.isArray(user1.valeurs) ? user1.valeurs : [];
    const values2 = Array.isArray(user2.valeurs) ? user2.valeurs : [];
    const commonValues = values1.filter((v: string) => values2.includes(v)).length;
    const totalValues = Math.max(values1.length, values2.length);
    if (totalValues > 0) {
      score += (commonValues / totalValues) * 100;
      factors++;
    }
  }

  const ageDiff = Math.abs((user1.age || 25) - (user2.age || 25));
  if (ageDiff <= 3) {
    score += 90;
  } else if (ageDiff <= 5) {
    score += 80;
  } else if (ageDiff <= 10) {
    score += 70;
  } else {
    score += 50;
  }
  factors++;

  return factors > 0 ? Math.round(score / factors) : 70;
}


export async function getUniverseUsers(currentUserId: string, tier: 'gratuit' | 'premium' | 'premium_plus'): Promise<UniverseUser[]> {
  const { data: currentUser } = await supabase
    .from('astra_profiles')
    .select('latitude, longitude, age, signe_solaire, interets, valeurs, age_min, age_max, distance_max, preference')
    .eq('id', currentUserId)
    .maybeSingle();

  if (!currentUser) return [];

  const maxUsers = tier === 'gratuit' ? 15 : tier === 'premium' ? 50 : 999;

  let query = supabase
    .from('astra_profiles')
    .select('*')
    .neq('id', currentUserId)
    .eq('visible_in_matching', true)
    .not('first_name', 'is', null);

  if (currentUser.age_min && currentUser.age_max) {
    query = query.gte('age', currentUser.age_min).lte('age', currentUser.age_max);
  }

  if (currentUser.preference && currentUser.preference !== 'Tous') {
    query = query.eq('gender', currentUser.preference.toLowerCase());
  }

  const { data: users, error } = await query.limit(maxUsers * 2);

  if (error || !users) {
    return [];
  }

  const processedUsers: UniverseUser[] = users
    .map(user => {
      const photos = Array.isArray(user.photos) ? user.photos : [];
      const photo_principale = photos.length > 0 ? photos[0] : undefined;

      if (!photo_principale) {
        return null;
      }

      let distance_km: number | undefined;
      if (currentUser.latitude && currentUser.longitude && user.latitude && user.longitude) {
        distance_km = calculateDistance(
          currentUser.latitude,
          currentUser.longitude,
          user.latitude,
          user.longitude
        );

        if (currentUser.distance_max && distance_km > currentUser.distance_max) {
          return null;
        }
      }

      const compatibilite = calculateCompatibility(currentUser, user);

      return {
        id: user.id,
        first_name: user.first_name || 'Utilisateur',
        age: user.age || 25,
        ville: user.ville || 'Ville inconnue',
        photos,
        photo_principale,
        signe_solaire: user.signe_solaire || '♈',
        bio: user.bio || '',
        latitude: user.latitude,
        longitude: user.longitude,
        distance_km,
        compatibilite,
        est_en_ligne: user.is_online || false,
        premium_tier: user.premium_tier || 'gratuit'
      };
    })
    .filter((user): user is UniverseUser => user !== null)
    .sort((a, b) => b.compatibilite - a.compatibilite);

  return processedUsers.slice(0, maxUsers);
}

export async function sendCosmicSignal(
  fromUserId: string,
  toUserId: string,
  type: 'signal' | 'super_nova' = 'signal',
  message?: string
): Promise<{ success: boolean; error?: string }> {
  const { data: profile } = await supabase
    .from('astra_profiles')
    .select('premium_tier, daily_super_likes')
    .eq('id', fromUserId)
    .maybeSingle();

  if (!profile) {
    return { success: false, error: 'Profil introuvable' };
  }

  if (type === 'super_nova') {
    const limits = {
      gratuit: 0,
      premium: 1,
      premium_plus: 5
    };

    const limit = limits[profile.premium_tier as keyof typeof limits] || 0;

    if (profile.daily_super_likes >= limit) {
      return { success: false, error: 'Limite de Super Nova atteinte' };
    }
  }

  const { error: insertError } = await supabase
    .from('swipes')
    .insert({
      user_id: fromUserId,
      target_id: toUserId,
      direction: type === 'super_nova' ? 'super_like' : 'right',
      message
    });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  if (type === 'super_nova') {
    await supabase
      .from('astra_profiles')
      .update({ daily_super_likes: profile.daily_super_likes + 1 })
      .eq('id', fromUserId);
  }

  const { data: reverseSwipe } = await supabase
    .from('swipes')
    .select('id')
    .eq('user_id', toUserId)
    .eq('target_id', fromUserId)
    .eq('direction', 'right')
    .maybeSingle();

  if (reverseSwipe) {
    const user1Id = fromUserId < toUserId ? fromUserId : toUserId;
    const user2Id = fromUserId < toUserId ? toUserId : fromUserId;

    await supabase
      .from('matches')
      .insert({
        user1_id: user1Id,
        user2_id: user2Id,
        user1_liked: true,
        user2_liked: true,
        statut: 'mutual',
        score: 85
      });
  }

  return { success: true };
}

export async function getReceivedSignals(userId: string): Promise<CosmicSignal[]> {
  const { data, error } = await supabase
    .from('swipes')
    .select(`
      id,
      user_id,
      target_id,
      direction,
      message,
      created_at,
      is_seen
    `)
    .eq('target_id', userId)
    .in('direction', ['right', 'super_like'])
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map(signal => ({
    id: signal.id,
    from_user_id: signal.user_id,
    to_user_id: signal.target_id,
    type: signal.direction === 'super_like' ? 'super_nova' : 'signal',
    message: signal.message,
    created_at: signal.created_at,
    is_seen: signal.is_seen || false
  }));
}

export { formatDistance };
