import { supabase } from './supabase';

export interface CompatibilityScore {
  overall: number;
  astrological: number;
  personality: number;
  interests: number;
  distance: number;
  breakdown: {
    sunSignCompatibility: number;
    elementCompatibility: number;
    modalityCompatibility: number;
    planetaryAspects: number;
  };
}

const ZODIAC_ELEMENTS = {
  'Bélier': 'fire',
  'Taureau': 'earth',
  'Gémeaux': 'air',
  'Cancer': 'water',
  'Lion': 'fire',
  'Vierge': 'earth',
  'Balance': 'air',
  'Scorpion': 'water',
  'Sagittaire': 'fire',
  'Capricorne': 'earth',
  'Verseau': 'air',
  'Poissons': 'water',
};

const ZODIAC_MODALITIES = {
  'Bélier': 'cardinal',
  'Taureau': 'fixed',
  'Gémeaux': 'mutable',
  'Cancer': 'cardinal',
  'Lion': 'fixed',
  'Vierge': 'mutable',
  'Balance': 'cardinal',
  'Scorpion': 'fixed',
  'Sagittaire': 'mutable',
  'Capricorne': 'cardinal',
  'Verseau': 'fixed',
  'Poissons': 'mutable',
};

const SUN_SIGN_COMPATIBILITY: Record<string, Record<string, number>> = {
  'Bélier': { 'Bélier': 75, 'Taureau': 60, 'Gémeaux': 85, 'Cancer': 55, 'Lion': 95, 'Vierge': 50, 'Balance': 70, 'Scorpion': 65, 'Sagittaire': 95, 'Capricorne': 55, 'Verseau': 90, 'Poissons': 60 },
  'Taureau': { 'Bélier': 60, 'Taureau': 80, 'Gémeaux': 55, 'Cancer': 90, 'Lion': 65, 'Vierge': 95, 'Balance': 75, 'Scorpion': 85, 'Sagittaire': 50, 'Capricorne': 95, 'Verseau': 55, 'Poissons': 90 },
  'Gémeaux': { 'Bélier': 85, 'Taureau': 55, 'Gémeaux': 75, 'Cancer': 60, 'Lion': 90, 'Vierge': 70, 'Balance': 95, 'Scorpion': 55, 'Sagittaire': 85, 'Capricorne': 50, 'Verseau': 95, 'Poissons': 65 },
  'Cancer': { 'Bélier': 55, 'Taureau': 90, 'Gémeaux': 60, 'Cancer': 85, 'Lion': 70, 'Vierge': 80, 'Balance': 65, 'Scorpion': 95, 'Sagittaire': 55, 'Capricorne': 85, 'Verseau': 50, 'Poissons': 95 },
  'Lion': { 'Bélier': 95, 'Taureau': 65, 'Gémeaux': 90, 'Cancer': 70, 'Lion': 75, 'Vierge': 60, 'Balance': 85, 'Scorpion': 70, 'Sagittaire': 95, 'Capricorne': 60, 'Verseau': 85, 'Poissons': 65 },
  'Vierge': { 'Bélier': 50, 'Taureau': 95, 'Gémeaux': 70, 'Cancer': 80, 'Lion': 60, 'Vierge': 80, 'Balance': 75, 'Scorpion': 85, 'Sagittaire': 60, 'Capricorne': 95, 'Verseau': 65, 'Poissons': 75 },
  'Balance': { 'Bélier': 70, 'Taureau': 75, 'Gémeaux': 95, 'Cancer': 65, 'Lion': 85, 'Vierge': 75, 'Balance': 80, 'Scorpion': 70, 'Sagittaire': 90, 'Capricorne': 65, 'Verseau': 95, 'Poissons': 70 },
  'Scorpion': { 'Bélier': 65, 'Taureau': 85, 'Gémeaux': 55, 'Cancer': 95, 'Lion': 70, 'Vierge': 85, 'Balance': 70, 'Scorpion': 85, 'Sagittaire': 60, 'Capricorne': 90, 'Verseau': 65, 'Poissons': 95 },
  'Sagittaire': { 'Bélier': 95, 'Taureau': 50, 'Gémeaux': 85, 'Cancer': 55, 'Lion': 95, 'Vierge': 60, 'Balance': 90, 'Scorpion': 60, 'Sagittaire': 80, 'Capricorne': 55, 'Verseau': 90, 'Poissons': 65 },
  'Capricorne': { 'Bélier': 55, 'Taureau': 95, 'Gémeaux': 50, 'Cancer': 85, 'Lion': 60, 'Vierge': 95, 'Balance': 65, 'Scorpion': 90, 'Sagittaire': 55, 'Capricorne': 85, 'Verseau': 70, 'Poissons': 80 },
  'Verseau': { 'Bélier': 90, 'Taureau': 55, 'Gémeaux': 95, 'Cancer': 50, 'Lion': 85, 'Vierge': 65, 'Balance': 95, 'Scorpion': 65, 'Sagittaire': 90, 'Capricorne': 70, 'Verseau': 80, 'Poissons': 70 },
  'Poissons': { 'Bélier': 60, 'Taureau': 90, 'Gémeaux': 65, 'Cancer': 95, 'Lion': 65, 'Vierge': 75, 'Balance': 70, 'Scorpion': 95, 'Sagittaire': 65, 'Capricorne': 80, 'Verseau': 70, 'Poissons': 85 },
};

const ELEMENT_COMPATIBILITY = {
  fire: { fire: 90, earth: 50, air: 85, water: 55 },
  earth: { fire: 50, earth: 85, air: 60, water: 90 },
  air: { fire: 85, earth: 60, air: 90, water: 65 },
  water: { fire: 55, earth: 90, air: 65, water: 85 },
};

const MODALITY_COMPATIBILITY = {
  cardinal: { cardinal: 70, fixed: 85, mutable: 80 },
  fixed: { cardinal: 85, fixed: 60, mutable: 75 },
  mutable: { cardinal: 80, fixed: 75, mutable: 85 },
};

export function calculateAstrologicalCompatibility(
  user1SunSign: string,
  user2SunSign: string
): { score: number; breakdown: CompatibilityScore['breakdown'] } {
  const sunSignScore = SUN_SIGN_COMPATIBILITY[user1SunSign]?.[user2SunSign] || 50;

  const element1 = ZODIAC_ELEMENTS[user1SunSign as keyof typeof ZODIAC_ELEMENTS];
  const element2 = ZODIAC_ELEMENTS[user2SunSign as keyof typeof ZODIAC_ELEMENTS];
  const elementScore = ELEMENT_COMPATIBILITY[element1 as keyof typeof ELEMENT_COMPATIBILITY]?.[element2 as keyof typeof ELEMENT_COMPATIBILITY[keyof typeof ELEMENT_COMPATIBILITY]] || 50;

  const modality1 = ZODIAC_MODALITIES[user1SunSign as keyof typeof ZODIAC_MODALITIES];
  const modality2 = ZODIAC_MODALITIES[user2SunSign as keyof typeof ZODIAC_MODALITIES];
  const modalityScore = MODALITY_COMPATIBILITY[modality1 as keyof typeof MODALITY_COMPATIBILITY]?.[modality2 as keyof typeof MODALITY_COMPATIBILITY[keyof typeof MODALITY_COMPATIBILITY]] || 50;

  const planetaryAspects = (sunSignScore + elementScore) / 2;

  const breakdown = {
    sunSignCompatibility: sunSignScore,
    elementCompatibility: elementScore,
    modalityCompatibility: modalityScore,
    planetaryAspects: Math.round(planetaryAspects),
  };

  const overallScore = Math.round(
    sunSignScore * 0.4 +
    elementScore * 0.3 +
    modalityScore * 0.2 +
    planetaryAspects * 0.1
  );

  return { score: overallScore, breakdown };
}

export function calculateInterestsCompatibility(
  interests1: string[],
  interests2: string[]
): number {
  if (!interests1?.length || !interests2?.length) return 50;

  const set1 = new Set(interests1.map(i => i.toLowerCase()));
  const set2 = new Set(interests2.map(i => i.toLowerCase()));

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  const jaccardIndex = intersection.size / union.size;

  return Math.round(jaccardIndex * 100);
}

export function calculateDistanceScore(
  city1?: string,
  city2?: string
): number {
  if (!city1 || !city2) return 50;

  if (city1.toLowerCase() === city2.toLowerCase()) return 100;

  return 60;
}

export async function calculateOverallCompatibility(
  userId: string,
  matchUserId: string,
  isPremium: boolean = false
): Promise<CompatibilityScore> {
  const { data: users } = await supabase
    .from('astra_profiles')
    .select('id, sun_sign, interests, city, is_premium')
    .in('id', [userId, matchUserId]);

  if (!users || users.length !== 2) {
    throw new Error('Unable to fetch user profiles');
  }

  const user1 = users.find(u => u.id === userId)!;
  const user2 = users.find(u => u.id === matchUserId)!;

  const astroResult = calculateAstrologicalCompatibility(
    user1.sun_sign || 'Bélier',
    user2.sun_sign || 'Bélier'
  );

  const interestsScore = calculateInterestsCompatibility(
    user1.interests || [],
    user2.interests || []
  );

  const distanceScore = calculateDistanceScore(user1.city, user2.city);

  const personalityScore = Math.round((interestsScore + 70) / 2);

  let baseScore = Math.round(
    astroResult.score * 0.4 +
    personalityScore * 0.3 +
    interestsScore * 0.2 +
    distanceScore * 0.1
  );

  if (isPremium || user1.is_premium || user2.is_premium) {
    baseScore = Math.min(100, baseScore + 5);
  }

  return {
    overall: baseScore,
    astrological: astroResult.score,
    personality: personalityScore,
    interests: interestsScore,
    distance: distanceScore,
    breakdown: astroResult.breakdown,
  };
}

export async function saveCompatibilityScore(
  userId: string,
  matchUserId: string,
  score: CompatibilityScore
): Promise<void> {
  const [minId, maxId] = [userId, matchUserId].sort();

  await supabase
    .from('matches')
    .upsert({
      user1_id: minId,
      user2_id: maxId,
      score: score.overall,
      analyse_ia: `Compatibilité astrologique: ${score.astrological}% | Personnalité: ${score.personality}% | Centres d'intérêt: ${score.interests}%`,
      points_forts: [
        `Compatibilité astrologique de ${score.astrological}%`,
        `${score.interests}% d'intérêts communs`,
      ],
      defis: score.overall < 70 ? ['Communication à renforcer', 'Différences à apprivoiser'] : [],
    }, {
      onConflict: 'user1_id,user2_id',
    });
}

export function getCompatibilityLabel(score: number): { text: string; color: string; emoji: string } {
  if (score >= 90) return { text: 'Parfait', color: 'text-green-500', emoji: '💚' };
  if (score >= 80) return { text: 'Excellent', color: 'text-green-400', emoji: '💚' };
  if (score >= 70) return { text: 'Très bon', color: 'text-blue-400', emoji: '💙' };
  if (score >= 60) return { text: 'Bon', color: 'text-yellow-400', emoji: '💛' };
  if (score >= 50) return { text: 'Moyen', color: 'text-orange-400', emoji: '🧡' };
  return { text: 'Faible', color: 'text-red-400', emoji: '❤️' };
}

export function getCompatibilityMessage(score: number): string {
  if (score >= 85) return '✨ Connexion cosmique exceptionnelle !';
  if (score >= 70) return '🔥 Très forte compatibilité';
  if (score >= 55) return '💫 Belle compatibilité';
  if (score >= 40) return '⚡ Compatibilité intéressante';
  return '💭 Des différences à découvrir';
}

export function calculateSimpleCompatibility(
  astroScore: number,
  interestsScore: number
): number {
  const numAstro = Number(astroScore) || 0;
  const numInterests = Number(interestsScore) || 0;

  const totalScore = Math.round(numAstro * 0.6 + numInterests * 0.4);

  return Math.min(99, Math.max(1, totalScore));
}
