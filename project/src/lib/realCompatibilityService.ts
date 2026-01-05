import { supabase } from './supabase';

// ═══════════════════════════════════════════════════════════════
// 🌟 TABLES DE COMPATIBILITÉ ASTROLOGIQUE
// ═══════════════════════════════════════════════════════════════

// Compatibilité Soleil-Soleil (20 points max)
const sunCompatibility: Record<string, Record<string, number>> = {
  aries: { aries: 16, taurus: 10, gemini: 18, cancer: 8, leo: 20, virgo: 11, libra: 14, scorpio: 13, sagittarius: 19, capricorn: 9, aquarius: 17, pisces: 12 },
  taurus: { aries: 10, taurus: 15, gemini: 11, cancer: 18, leo: 12, virgo: 19, libra: 16, scorpio: 17, sagittarius: 9, capricorn: 20, aquarius: 10, pisces: 18 },
  gemini: { aries: 18, taurus: 11, gemini: 14, cancer: 10, leo: 17, virgo: 12, libra: 20, scorpio: 9, sagittarius: 18, capricorn: 8, aquarius: 19, pisces: 11 },
  cancer: { aries: 8, taurus: 18, gemini: 10, cancer: 16, leo: 11, virgo: 15, libra: 13, scorpio: 20, sagittarius: 9, capricorn: 17, aquarius: 10, pisces: 19 },
  leo: { aries: 20, taurus: 12, gemini: 17, cancer: 11, leo: 15, virgo: 10, libra: 18, scorpio: 13, sagittarius: 19, capricorn: 9, aquarius: 16, pisces: 12 },
  virgo: { aries: 11, taurus: 19, gemini: 12, cancer: 15, leo: 10, virgo: 14, libra: 13, scorpio: 16, sagittarius: 8, capricorn: 20, aquarius: 11, pisces: 17 },
  libra: { aries: 14, taurus: 16, gemini: 20, cancer: 13, leo: 18, virgo: 13, libra: 15, scorpio: 12, sagittarius: 17, capricorn: 10, aquarius: 19, pisces: 14 },
  scorpio: { aries: 13, taurus: 17, gemini: 9, cancer: 20, leo: 13, virgo: 16, libra: 12, scorpio: 18, sagittarius: 11, capricorn: 19, aquarius: 10, pisces: 20 },
  sagittarius: { aries: 19, taurus: 9, gemini: 18, cancer: 9, leo: 19, virgo: 8, libra: 17, scorpio: 11, sagittarius: 16, capricorn: 10, aquarius: 20, pisces: 13 },
  capricorn: { aries: 9, taurus: 20, gemini: 8, cancer: 17, leo: 9, virgo: 20, libra: 10, scorpio: 19, sagittarius: 10, capricorn: 15, aquarius: 11, pisces: 18 },
  aquarius: { aries: 17, taurus: 10, gemini: 19, cancer: 10, leo: 16, virgo: 11, libra: 19, scorpio: 10, sagittarius: 20, capricorn: 11, aquarius: 14, pisces: 12 },
  pisces: { aries: 12, taurus: 18, gemini: 11, cancer: 19, leo: 12, virgo: 17, libra: 14, scorpio: 20, sagittarius: 13, capricorn: 18, aquarius: 12, pisces: 16 }
};

// Compatibilité Lune-Lune (15 points max)
const moonCompatibility: Record<string, Record<string, number>> = {
  aries: { aries: 12, taurus: 7, gemini: 14, cancer: 6, leo: 15, virgo: 8, libra: 10, scorpio: 9, sagittarius: 14, capricorn: 7, aquarius: 13, pisces: 8 },
  taurus: { aries: 7, taurus: 13, gemini: 8, cancer: 14, leo: 9, virgo: 15, libra: 12, scorpio: 13, sagittarius: 7, capricorn: 15, aquarius: 8, pisces: 14 },
  gemini: { aries: 14, taurus: 8, gemini: 11, cancer: 7, leo: 13, virgo: 9, libra: 15, scorpio: 6, sagittarius: 14, capricorn: 7, aquarius: 15, pisces: 8 },
  cancer: { aries: 6, taurus: 14, gemini: 7, cancer: 13, leo: 8, virgo: 12, libra: 10, scorpio: 15, sagittarius: 6, capricorn: 13, aquarius: 7, pisces: 15 },
  leo: { aries: 15, taurus: 9, gemini: 13, cancer: 8, leo: 12, virgo: 7, libra: 14, scorpio: 10, sagittarius: 15, capricorn: 8, aquarius: 13, pisces: 9 },
  virgo: { aries: 8, taurus: 15, gemini: 9, cancer: 12, leo: 7, virgo: 11, libra: 10, scorpio: 13, sagittarius: 7, capricorn: 15, aquarius: 9, pisces: 13 },
  libra: { aries: 10, taurus: 12, gemini: 15, cancer: 10, leo: 14, virgo: 10, libra: 12, scorpio: 9, sagittarius: 13, capricorn: 9, aquarius: 15, pisces: 11 },
  scorpio: { aries: 9, taurus: 13, gemini: 6, cancer: 15, leo: 10, virgo: 13, libra: 9, scorpio: 14, sagittarius: 8, capricorn: 15, aquarius: 7, pisces: 15 },
  sagittarius: { aries: 14, taurus: 7, gemini: 14, cancer: 6, leo: 15, virgo: 7, libra: 13, scorpio: 8, sagittarius: 13, capricorn: 8, aquarius: 15, pisces: 10 },
  capricorn: { aries: 7, taurus: 15, gemini: 7, cancer: 13, leo: 8, virgo: 15, libra: 9, scorpio: 15, sagittarius: 8, capricorn: 12, aquarius: 9, pisces: 14 },
  aquarius: { aries: 13, taurus: 8, gemini: 15, cancer: 7, leo: 13, virgo: 9, libra: 15, scorpio: 7, sagittarius: 15, capricorn: 9, aquarius: 11, pisces: 10 },
  pisces: { aries: 8, taurus: 14, gemini: 8, cancer: 15, leo: 9, virgo: 13, libra: 11, scorpio: 15, sagittarius: 10, capricorn: 14, aquarius: 10, pisces: 13 }
};

// Compatibilité Vénus-Mars (15 points max)
const venusMarsCompatibility: Record<string, Record<string, number>> = {
  aries: { aries: 14, taurus: 8, gemini: 13, cancer: 7, leo: 15, virgo: 9, libra: 11, scorpio: 12, sagittarius: 14, capricorn: 8, aquarius: 13, pisces: 10 },
  taurus: { aries: 8, taurus: 13, gemini: 9, cancer: 14, leo: 10, virgo: 15, libra: 12, scorpio: 14, sagittarius: 8, capricorn: 15, aquarius: 9, pisces: 14 },
  gemini: { aries: 13, taurus: 9, gemini: 12, cancer: 8, leo: 13, virgo: 10, libra: 15, scorpio: 7, sagittarius: 14, capricorn: 7, aquarius: 15, pisces: 9 },
  cancer: { aries: 7, taurus: 14, gemini: 8, cancer: 13, leo: 9, virgo: 13, libra: 11, scorpio: 15, sagittarius: 7, capricorn: 14, aquarius: 8, pisces: 15 },
  leo: { aries: 15, taurus: 10, gemini: 13, cancer: 9, leo: 13, virgo: 8, libra: 14, scorpio: 11, sagittarius: 15, capricorn: 9, aquarius: 13, pisces: 10 },
  virgo: { aries: 9, taurus: 15, gemini: 10, cancer: 13, leo: 8, virgo: 12, libra: 11, scorpio: 14, sagittarius: 8, capricorn: 15, aquarius: 10, pisces: 14 },
  libra: { aries: 11, taurus: 12, gemini: 15, cancer: 11, leo: 14, virgo: 11, libra: 13, scorpio: 10, sagittarius: 13, capricorn: 10, aquarius: 15, pisces: 12 },
  scorpio: { aries: 12, taurus: 14, gemini: 7, cancer: 15, leo: 11, virgo: 14, libra: 10, scorpio: 14, sagittarius: 9, capricorn: 15, aquarius: 8, pisces: 15 },
  sagittarius: { aries: 14, taurus: 8, gemini: 14, cancer: 7, leo: 15, virgo: 8, libra: 13, scorpio: 9, sagittarius: 13, capricorn: 9, aquarius: 15, pisces: 11 },
  capricorn: { aries: 8, taurus: 15, gemini: 7, cancer: 14, leo: 9, virgo: 15, libra: 10, scorpio: 15, sagittarius: 9, capricorn: 13, aquarius: 10, pisces: 14 },
  aquarius: { aries: 13, taurus: 9, gemini: 15, cancer: 8, leo: 13, virgo: 10, libra: 15, scorpio: 8, sagittarius: 15, capricorn: 10, aquarius: 12, pisces: 11 },
  pisces: { aries: 10, taurus: 14, gemini: 9, cancer: 15, leo: 10, virgo: 14, libra: 12, scorpio: 15, sagittarius: 11, capricorn: 14, aquarius: 11, pisces: 13 }
};

// Éléments astrologiques
const elements: Record<string, string> = {
  aries: 'fire', leo: 'fire', sagittarius: 'fire',
  taurus: 'earth', virgo: 'earth', capricorn: 'earth',
  gemini: 'air', libra: 'air', aquarius: 'air',
  cancer: 'water', scorpio: 'water', pisces: 'water'
};

// Compatibilité des éléments (10 points max)
const elementCompatibility: Record<string, Record<string, number>> = {
  fire: { fire: 8, earth: 4, air: 10, water: 5 },
  earth: { fire: 4, earth: 8, air: 5, water: 10 },
  air: { fire: 10, earth: 5, air: 8, water: 4 },
  water: { fire: 5, earth: 10, air: 4, water: 8 }
};

// Compatibilité objectifs relationnels (8 points max)
const relationshipGoalsScore: Record<string, Record<string, number>> = {
  serious: { serious: 8, casual: 2, friendship: 4, exploring: 5 },
  casual: { serious: 2, casual: 8, friendship: 6, exploring: 7 },
  friendship: { serious: 4, casual: 6, friendship: 8, exploring: 6 },
  exploring: { serious: 5, casual: 7, friendship: 6, exploring: 8 }
};

// Compatibilité langage amoureux (7 points max)
const loveLanguageScore: Record<string, Record<string, number>> = {
  words: { words: 7, time: 5, gifts: 4, touch: 5, service: 4 },
  time: { words: 5, time: 7, gifts: 5, touch: 6, service: 6 },
  gifts: { words: 4, time: 5, gifts: 7, touch: 4, service: 5 },
  touch: { words: 5, time: 6, gifts: 4, touch: 7, service: 5 },
  service: { words: 4, time: 6, gifts: 5, touch: 5, service: 7 }
};

// ═══════════════════════════════════════════════════════════════
// 🧮 FONCTIONS DE CALCUL
// ═══════════════════════════════════════════════════════════════

const calculateValuesCompatibility = (values1: string[], values2: string[]): number => {
  if (!values1 || !values2 || values1.length === 0 || values2.length === 0) return 5;

  const commonValues = values1.filter(v => values2.includes(v));
  const score = (commonValues.length / Math.max(values1.length, values2.length)) * 10;
  return Math.round(score);
};

const calculateInterestsCompatibility = (interests1: string[], interests2: string[]): number => {
  if (!interests1 || !interests2 || interests1.length === 0 || interests2.length === 0) return 2;

  const commonInterests = interests1.filter(i => interests2.includes(i));
  const score = (commonInterests.length / 5) * 5; // Max 5 intérêts communs
  return Math.min(Math.round(score), 5);
};

const checkDealbreakers = (pref1: any, pref2: any): number => {
  let penalty = 0;

  if (pref1?.wants_children !== undefined && pref2?.wants_children !== undefined) {
    if (pref1.wants_children !== pref2.wants_children) penalty += 50;
  }

  if (pref1?.smoking_ok === false && pref2?.smokes === true) penalty += 30;
  if (pref2?.smoking_ok === false && pref1?.smokes === true) penalty += 30;

  if (pref1?.religion_important && pref2?.religion && pref1.religion !== pref2.religion) {
    penalty += 30;
  }

  return Math.min(penalty, 70); // Max 70% de pénalité
};

// ═══════════════════════════════════════════════════════════════
// 💫 FONCTION PRINCIPALE DE CALCUL DE COMPATIBILITÉ
// ═══════════════════════════════════════════════════════════════

export const calculateRealCompatibility = async (userId: string, targetUserId: string): Promise<number> => {
  try {
    // 1. Récupérer les données astrologiques
    const { data: user1, error: error1 } = await supabase
      .from('astra_profiles')
      .select('sun_sign, moon_sign, ascendant_sign, venus_sign, mars_sign')
      .eq('id', userId)
      .single();

    const { data: user2, error: error2 } = await supabase
      .from('astra_profiles')
      .select('sun_sign, moon_sign, ascendant_sign, venus_sign, mars_sign')
      .eq('id', targetUserId)
      .single();

    if (error1 || error2 || !user1 || !user2) {
      console.error('Error fetching astra profiles:', error1 || error2);
      return 50; // Score par défaut
    }

    // 2. Récupérer les préférences (optionnel)
    const { data: pref1 } = await supabase
      .from('astro_user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: pref2 } = await supabase
      .from('astro_user_preferences')
      .select('user_id', targetUserId)
      .single();

    // 3. Calculer le score astrologique (60 points max)
    let astroScore = 0;

    // Soleil (20 points)
    if (user1.sun_sign && user2.sun_sign) {
      astroScore += sunCompatibility[user1.sun_sign]?.[user2.sun_sign] || 10;
    } else {
      astroScore += 10;
    }

    // Lune (15 points)
    if (user1.moon_sign && user2.moon_sign) {
      astroScore += moonCompatibility[user1.moon_sign]?.[user2.moon_sign] || 7;
    } else {
      astroScore += 7;
    }

    // Vénus-Mars (15 points)
    if (user1.venus_sign && user2.mars_sign) {
      astroScore += venusMarsCompatibility[user1.venus_sign]?.[user2.mars_sign] || 7;
    } else {
      astroScore += 7;
    }

    // Ascendant (10 points) = Soleil / 2
    if (user1.ascendant_sign && user2.ascendant_sign) {
      astroScore += (sunCompatibility[user1.ascendant_sign]?.[user2.ascendant_sign] || 10) / 2;
    } else {
      astroScore += 5;
    }

    // Éléments (10 points)
    if (user1.sun_sign && user2.sun_sign) {
      const elem1 = elements[user1.sun_sign];
      const elem2 = elements[user2.sun_sign];
      astroScore += elementCompatibility[elem1]?.[elem2] || 5;
    } else {
      astroScore += 5;
    }

    // 4. Calculer le score questionnaire (40 points max)
    let questionnaireScore = 20; // Score par défaut si pas de préférences

    if (pref1 && pref2) {
      questionnaireScore = 0;

      // Valeurs (10 points)
      questionnaireScore += calculateValuesCompatibility(pref1.values || [], pref2.values || []);

      // Objectifs (8 points)
      if (pref1.relationship_goals && pref2.relationship_goals) {
        questionnaireScore += relationshipGoalsScore[pref1.relationship_goals]?.[pref2.relationship_goals] || 4;
      } else {
        questionnaireScore += 4;
      }

      // Langage amoureux (7 points)
      if (pref1.love_language && pref2.love_language) {
        questionnaireScore += loveLanguageScore[pref1.love_language]?.[pref2.love_language] || 3;
      } else {
        questionnaireScore += 3;
      }

      // Intérêts (5 points)
      questionnaireScore += calculateInterestsCompatibility(pref1.interests || [], pref2.interests || []);

      // Dealbreakers (pénalité)
      const penalty = checkDealbreakers(pref1, pref2);
      questionnaireScore = Math.round(questionnaireScore * (1 - penalty / 100));
    }

    // 5. Score total (0-100)
    const totalScore = Math.max(0, Math.min(100, Math.round(astroScore + questionnaireScore)));

    // 6. Sauvegarder dans le cache
    await supabase
      .from('astro_compatibility_scores')
      .upsert({
        user_id: userId,
        target_user_id: targetUserId,
        score: totalScore,
        astro_score: Math.round(astroScore),
        questionnaire_score: Math.round(questionnaireScore),
        calculated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,target_user_id'
      });

    return totalScore;
  } catch (error) {
    console.error('Error calculating compatibility:', error);
    return 50;
  }
};

// ═══════════════════════════════════════════════════════════════
// 📦 FONCTION AVEC CACHE
// ═══════════════════════════════════════════════════════════════

export const getCompatibilityScore = async (userId: string, targetUserId: string): Promise<number> => {
  try {
    // 1. Vérifier le cache (< 7 jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: cached, error } = await supabase
      .from('astro_compatibility_scores')
      .select('score')
      .eq('user_id', userId)
      .eq('target_user_id', targetUserId)
      .gte('calculated_at', sevenDaysAgo.toISOString())
      .single();

    if (!error && cached) {
      return cached.score;
    }

    // 2. Calculer et mettre en cache
    const score = await calculateRealCompatibility(userId, targetUserId);
    return score;
  } catch (error) {
    console.error('Error getting compatibility score:', error);
    return 50;
  }
};

// ═══════════════════════════════════════════════════════════════
// 🎨 COULEUR DE BORDURE SELON COMPATIBILITÉ
// ═══════════════════════════════════════════════════════════════

export const getCompatibilityBorderColor = (compatibility: number): string => {
  if (compatibility >= 90) return '#FF0000'; // Rouge vif
  if (compatibility >= 70) return '#CC0000'; // Rouge foncé
  if (compatibility >= 50) return '#999999'; // Gris moyen
  return '#666666'; // Gris
};

export const getCompatibilityLabel = (compatibility: number): string => {
  if (compatibility >= 90) return 'Connexion Cosmique';
  if (compatibility >= 80) return 'Très Compatible';
  if (compatibility >= 70) return 'Bonne Compatibilité';
  if (compatibility >= 60) return 'Compatible';
  if (compatibility >= 50) return 'Potentiel';
  return 'Explorez...';
};
