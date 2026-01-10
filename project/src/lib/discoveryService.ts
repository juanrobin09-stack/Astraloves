import { supabase } from './supabase';
import { DatingProfile } from '../data/datingProfiles';
import { calculateAstrologicalCompatibility, calculateInterestsCompatibility, calculateSimpleCompatibility } from './compatibilityEngine';
import { getAgeRange } from './ageFilterService';

/**
 * Service de découverte de profils
 * S'assure qu'un profil déjà swipé (liké, passé, superliké) ne réapparaît JAMAIS
 */

export interface DiscoveryFilters {
  ageMin?: number;
  ageMax?: number;
  city?: string;
  maxDistance?: number;
}

/**
 * Récupère les profils à découvrir pour un utilisateur
 * GARANTIT qu'aucun profil déjà swipé ne réapparaît
 */
export async function getProfilesToDiscover(
  userId: string,
  filters: DiscoveryFilters = {}
): Promise<DatingProfile[]> {
  try {
    // 1. RÉCUPÉRER TOUS LES PROFILS DÉJÀ SWIPÉS (like, pass, superlike)
    const { data: swipedData, error: swipedError } = await supabase
      .from('swipes')
      .select('target_id')
      .eq('user_id', userId);

    if (swipedError) {
      console.error('Erreur récupération swipes:', swipedError);
    }

    const swipedIds = swipedData?.map(s => s.target_id) || [];

    console.log(`🔍 [Discovery] User ${userId} a déjà swipé ${swipedIds.length} profils`);

    // 2. RÉCUPÉRER LE PROFIL DE L'UTILISATEUR ACTUEL
    const { data: currentUserProfile } = await supabase
      .from('astra_profiles')
      .select('signe_solaire, interests, age, age_min, age_max, ville')
      .eq('id', userId)
      .maybeSingle();

    if (!currentUserProfile) {
      console.error('Profil utilisateur non trouvé');
      return [];
    }

    // 3. CALCULER LA TRANCHE D'ÂGE
    const userAge = currentUserProfile.age || 25;
    const preferences = currentUserProfile.age_min && currentUserProfile.age_max
      ? { minAge: currentUserProfile.age_min, maxAge: currentUserProfile.age_max }
      : undefined;

    const { minAge, maxAge } = getAgeRange(userAge, preferences);

    console.log('🎯 [Discovery] Filtres âge:', { userAge, minAge, maxAge });

    // 4. CONSTRUIRE LA REQUÊTE AVEC EXCLUSIONS
    let query = supabase
      .from('astra_profiles')
      .select('id, first_name, age, ville, avatar_url, banner_url, signe_solaire, bio, interests, photos, email')
      .neq('id', userId) // Exclure soi-même
      .gte('age', minAge)
      .lte('age', maxAge)
      .eq('visible_in_matching', true)
      .order('created_at', { ascending: false })
      .limit(200);

    // CRITIQUE: Exclure TOUS les profils déjà swipés
    if (swipedIds.length > 0) {
      query = query.not('id', 'in', `(${swipedIds.join(',')})`);
    }

    // Filtres optionnels
    if (filters.city) {
      query = query.eq('ville', filters.city);
    }

    const { data: profiles, error: profilesError } = await query;

    if (profilesError) {
      console.error('Erreur récupération profils:', profilesError);
      return [];
    }

    if (!profiles || profiles.length === 0) {
      console.log('⚠️ [Discovery] Aucun nouveau profil disponible');
      return [];
    }

    // Filtrer les profils de test/démo
    const realProfiles = profiles.filter(p =>
      p.email &&
      !p.email.includes('@astraloves.fr') &&
      !p.email.includes('@temp.com')
    ).slice(0, 100);

    console.log(`✅ [Discovery] ${realProfiles.length} nouveaux profils réels trouvés (${profiles.length - realProfiles.length} profils de test filtrés)`);

    // 5. CALCULER LA COMPATIBILITÉ POUR CHAQUE PROFIL
    const profilesWithCompatibility = realProfiles.map((profile) => {
      // Compatibilité astrologique
      const astroCompat = currentUserProfile.signe_solaire && profile.signe_solaire
        ? calculateAstrologicalCompatibility(currentUserProfile.signe_solaire, profile.signe_solaire)
        : { score: 70, breakdown: {} };

      // Compatibilité des centres d'intérêt
      const interestsCompat = currentUserProfile.interests && profile.interests
        ? calculateInterestsCompatibility(currentUserProfile.interests, profile.interests)
        : 50;

      // Score global : 60% astrologie + 40% intérêts
      const compatibility = calculateSimpleCompatibility(astroCompat.score, interestsCompat);

      const formattedProfile: DatingProfile = {
        id: profile.id,
        name: profile.first_name || 'Utilisateur',
        first_name: profile.first_name || 'Utilisateur',
        age: profile.age || 25,
        location: profile.ville || 'France',
        photo: profile.avatar_url || profile.photos?.[0] || '',
        photos: profile.photos || [profile.avatar_url].filter(Boolean),
        banner: profile.banner_url || null,
        compatibility,
        zodiac: profile.signe_solaire || 'Balance',
        bio: profile.bio || '',
        interests: profile.interests || [],
        isPremium: false,
        isVerified: false,
        isOnline: false
      };

      return formattedProfile;
    });

    // 6. TRIER PAR COMPATIBILITÉ (meilleurs en premier)
    profilesWithCompatibility.sort((a, b) => b.compatibility - a.compatibility);

    // 7. VÉRIFIER LES SUPER LIKES REÇUS (priorité)
    const { data: superLikesReceived } = await supabase
      .from('swipes')
      .select('user_id')
      .eq('target_id', userId)
      .eq('action', 'superlike');

    const superLikeUserIds = superLikesReceived?.map(s => s.user_id) || [];

    // Mettre les super likes en premier
    const finalProfiles = [
      ...profilesWithCompatibility.filter(p => superLikeUserIds.includes(p.id)),
      ...profilesWithCompatibility.filter(p => !superLikeUserIds.includes(p.id))
    ];

    return finalProfiles;
  } catch (error) {
    console.error('Erreur dans getProfilesToDiscover:', error);
    return [];
  }
}

/**
 * Vérifie si un utilisateur a déjà swipé un profil
 */
export async function hasAlreadySwiped(userId: string, targetId: string): Promise<boolean> {
  const { data } = await supabase
    .from('swipes')
    .select('id')
    .eq('user_id', userId)
    .eq('target_id', targetId)
    .maybeSingle();

  return !!data;
}

/**
 * Enregistre un swipe (like, pass, superlike)
 * GARANTIT l'unicité avec contrainte unique en base
 */
export async function recordSwipe(
  userId: string,
  targetId: string,
  action: 'like' | 'pass' | 'superlike'
): Promise<{ success: boolean; alreadyExists?: boolean; error?: string }> {
  try {
    // Vérifier si le swipe existe déjà
    const alreadySwiped = await hasAlreadySwiped(userId, targetId);

    if (alreadySwiped) {
      console.log(`⚠️ [Discovery] Swipe déjà enregistré: ${userId} -> ${targetId}`);
      return { success: false, alreadyExists: true };
    }

    // Enregistrer le swipe
    const { error } = await supabase
      .from('swipes')
      .insert({
        user_id: userId,
        target_id: targetId,
        action: action
      });

    if (error) {
      // Si erreur de contrainte unique, c'est OK (déjà existant)
      if (error.code === '23505') {
        console.log(`⚠️ [Discovery] Swipe déjà existant (contrainte unique): ${userId} -> ${targetId}`);
        return { success: false, alreadyExists: true };
      }

      console.error('Erreur enregistrement swipe:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ [Discovery] Swipe enregistré: ${userId} -> ${targetId} (${action})`);
    return { success: true };
  } catch (error) {
    console.error('Erreur dans recordSwipe:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Vérifie si c'est un match mutuel
 */
export async function checkMutualMatch(userId: string, targetId: string): Promise<boolean> {
  // Vérifier si l'autre utilisateur a aussi liké
  const { data } = await supabase
    .from('swipes')
    .select('action')
    .eq('user_id', targetId)
    .eq('target_id', userId)
    .in('action', ['like', 'superlike'])
    .maybeSingle();

  return !!data;
}

/**
 * Récupère les statistiques de découverte
 */
export async function getDiscoveryStats(userId: string) {
  // Nombre total de swipes aujourd'hui
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count: swipesToday } = await supabase
    .from('swipes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', today.toISOString());

  // Nombre de likes donnés
  const { count: likesGiven } = await supabase
    .from('swipes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('action', ['like', 'superlike']);

  // Nombre de matchs
  const { count: matchesCount } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .eq('statut', 'mutual');

  return {
    swipesToday: swipesToday || 0,
    likesGiven: likesGiven || 0,
    matches: matchesCount || 0
  };
}
