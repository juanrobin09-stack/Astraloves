import { supabase } from './supabase';

/**
 * Service de calcul de compatibilité avancée entre utilisateurs
 */

export interface CompatibilityResult {
  score: number;
  level: {
    emoji: string;
    label: string;
    color: string;
  };
  factors: {
    astro: number;
    interests: number;
    age: number;
    location: number;
  };
}

const ZODIAC_COMPATIBILITY: Record<string, Record<string, number>> = {
  'Bélier': { 'Lion': 90, 'Sagittaire': 85, 'Gémeaux': 80, 'Verseau': 75, 'Balance': 70 },
  'Taureau': { 'Vierge': 90, 'Capricorne': 85, 'Cancer': 80, 'Poissons': 75, 'Scorpion': 70 },
  'Gémeaux': { 'Balance': 90, 'Verseau': 85, 'Bélier': 80, 'Lion': 75, 'Sagittaire': 70 },
  'Cancer': { 'Scorpion': 90, 'Poissons': 85, 'Taureau': 80, 'Vierge': 75, 'Capricorne': 70 },
  'Lion': { 'Bélier': 90, 'Sagittaire': 85, 'Gémeaux': 80, 'Balance': 75, 'Verseau': 70 },
  'Vierge': { 'Taureau': 90, 'Capricorne': 85, 'Cancer': 80, 'Scorpion': 75, 'Poissons': 70 },
  'Balance': { 'Gémeaux': 90, 'Verseau': 85, 'Lion': 80, 'Sagittaire': 75, 'Bélier': 70 },
  'Scorpion': { 'Cancer': 90, 'Poissons': 85, 'Vierge': 80, 'Capricorne': 75, 'Taureau': 70 },
  'Sagittaire': { 'Bélier': 90, 'Lion': 85, 'Balance': 80, 'Verseau': 75, 'Gémeaux': 70 },
  'Capricorne': { 'Taureau': 90, 'Vierge': 85, 'Scorpion': 80, 'Poissons': 75, 'Cancer': 70 },
  'Verseau': { 'Gémeaux': 90, 'Balance': 85, 'Sagittaire': 80, 'Bélier': 75, 'Lion': 70 },
  'Poissons': { 'Cancer': 90, 'Scorpion': 85, 'Capricorne': 80, 'Taureau': 75, 'Vierge': 70 }
};

/**
 * Calcule le score de compatibilité astrologique
 */
function calculateAstroCompatibility(sign1: string, sign2: string): number {
  if (!sign1 || !sign2) return 50;

  const compatibility = ZODIAC_COMPATIBILITY[sign1]?.[sign2] ||
                       ZODIAC_COMPATIBILITY[sign2]?.[sign1];

  return compatibility || 50;
}

/**
 * Calcule le score de compatibilité basé sur les centres d'intérêt
 */
function calculateInterestsCompatibility(interests1: string[], interests2: string[]): number {
  if (!interests1?.length || !interests2?.length) return 50;

  const set1 = new Set(interests1);
  const set2 = new Set(interests2);

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  const jaccardIndex = intersection.size / union.size;
  return Math.round(jaccardIndex * 100);
}

/**
 * Calcule le score de compatibilité d'âge
 */
function calculateAgeCompatibility(age1: number, age2: number): number {
  const diff = Math.abs(age1 - age2);

  if (diff <= 2) return 100;
  if (diff <= 5) return 90;
  if (diff <= 8) return 75;
  if (diff <= 12) return 60;
  return 40;
}

/**
 * Calcule le score de compatibilité de localisation
 */
function calculateLocationCompatibility(city1: string, city2: string): number {
  if (!city1 || !city2) return 50;

  const normalizedCity1 = city1.toLowerCase().trim();
  const normalizedCity2 = city2.toLowerCase().trim();

  if (normalizedCity1 === normalizedCity2) return 100;

  // Même région (Paris/Île-de-France, Lyon/Rhône-Alpes, etc.)
  const regions: Record<string, string[]> = {
    'idf': ['paris', 'versailles', 'nanterre', 'créteil', 'bobigny'],
    'ara': ['lyon', 'grenoble', 'saint-étienne', 'chambéry'],
    'paca': ['marseille', 'nice', 'toulon', 'avignon', 'cannes'],
    'naq': ['bordeaux', 'toulouse', 'pau', 'bayonne'],
    'hdf': ['lille', 'amiens', 'valenciennes', 'douai']
  };

  for (const regionCities of Object.values(regions)) {
    if (regionCities.includes(normalizedCity1) && regionCities.includes(normalizedCity2)) {
      return 80;
    }
  }

  return 40;
}

/**
 * Calcule la compatibilité globale entre deux utilisateurs
 */
export async function calculateCompatibility(
  userId1: string,
  userId2: string
): Promise<CompatibilityResult> {
  try {
    const { data: profile1 } = await supabase
      .from('astra_profiles')
      .select('signe_solaire, interests, age, ville')
      .eq('id', userId1)
      .maybeSingle();

    const { data: profile2 } = await supabase
      .from('astra_profiles')
      .select('signe_solaire, interests, age, ville')
      .eq('id', userId2)
      .maybeSingle();

    if (!profile1 || !profile2) {
      return getDefaultCompatibility();
    }

    // Calcul des scores individuels
    const astroScore = calculateAstroCompatibility(profile1.signe_solaire, profile2.signe_solaire);
    const interestsScore = calculateInterestsCompatibility(profile1.interests || [], profile2.interests || []);
    const ageScore = calculateAgeCompatibility(profile1.age, profile2.age);
    const locationScore = calculateLocationCompatibility(profile1.ville, profile2.ville);

    // Pondération des scores
    const weights = {
      astro: 0.25,      // 25%
      interests: 0.35,  // 35% (le plus important)
      age: 0.20,        // 20%
      location: 0.20    // 20%
    };

    const totalScore = Math.round(
      astroScore * weights.astro +
      interestsScore * weights.interests +
      ageScore * weights.age +
      locationScore * weights.location
    );

    return {
      score: totalScore,
      level: getCompatibilityLevel(totalScore),
      factors: {
        astro: astroScore,
        interests: interestsScore,
        age: ageScore,
        location: locationScore
      }
    };
  } catch (error) {
    console.error('Error calculating compatibility:', error);
    return getDefaultCompatibility();
  }
}

function getCompatibilityLevel(score: number) {
  if (score >= 80) {
    return { emoji: '🔥', label: 'Connexion Exceptionnelle', color: '#E63946' };
  }
  if (score >= 65) {
    return { emoji: '⭐', label: 'Très Compatible', color: '#F77F00' };
  }
  if (score >= 50) {
    return { emoji: '💫', label: 'Belle Compatibilité', color: '#06B6D4' };
  }
  return { emoji: '✨', label: 'Potentiel Intéressant', color: '#8B5CF6' };
}

function getDefaultCompatibility(): CompatibilityResult {
  return {
    score: 75,
    level: { emoji: '⭐', label: 'Très Compatible', color: '#F77F00' },
    factors: {
      astro: 75,
      interests: 75,
      age: 75,
      location: 75
    }
  };
}

/**
 * Récupère ou crée un match avec calcul de compatibilité
 */
export async function createOrUpdateMatch(
  userId1: string,
  userId2: string,
  action: 'like' | 'superlike'
): Promise<{ isMatch: boolean; compatibilityScore: number }> {
  try {
    // Ordre les IDs pour la contrainte ordered_pair
    const [user1Id, user2Id] = [userId1, userId2].sort();

    // Vérifie si l'autre utilisateur a déjà liké
    const { data: existingSwipe } = await supabase
      .from('swipes')
      .select('action')
      .eq('user_id', userId2)
      .eq('target_id', userId1)
      .in('action', ['like', 'superlike'])
      .maybeSingle();

    const isMatch = !!existingSwipe;

    if (isMatch) {
      // Calcul de compatibilité
      const compatibility = await calculateCompatibility(userId1, userId2);

      // Crée ou met à jour le match
      await supabase
        .from('matches')
        .upsert({
          user1_id: user1Id,
          user2_id: user2Id,
          user1_liked: true,
          user2_liked: true,
          statut: 'mutual',
          score: compatibility.score
        }, {
          onConflict: 'user1_id,user2_id'
        });

      return { isMatch: true, compatibilityScore: compatibility.score };
    }

    return { isMatch: false, compatibilityScore: 0 };
  } catch (error) {
    console.error('Error in createOrUpdateMatch:', error);
    return { isMatch: false, compatibilityScore: 0 };
  }
}
