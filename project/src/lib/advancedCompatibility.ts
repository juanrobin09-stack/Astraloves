import { calculateDistance } from './frenchCitiesService';

export const astroCompatibility: Record<string, Record<string, number>> = {
  'Bélier': {
    'Bélier': 70, 'Taureau': 45, 'Gémeaux': 83, 'Cancer': 42,
    'Lion': 97, 'Vierge': 38, 'Balance': 62, 'Scorpion': 50,
    'Sagittaire': 93, 'Capricorne': 47, 'Verseau': 78, 'Poissons': 67
  },
  'Taureau': {
    'Bélier': 45, 'Taureau': 75, 'Gémeaux': 42, 'Cancer': 92,
    'Lion': 58, 'Vierge': 95, 'Balance': 68, 'Scorpion': 88,
    'Sagittaire': 35, 'Capricorne': 97, 'Verseau': 43, 'Poissons': 87
  },
  'Gémeaux': {
    'Bélier': 83, 'Taureau': 42, 'Gémeaux': 72, 'Cancer': 53,
    'Lion': 85, 'Vierge': 58, 'Balance': 93, 'Scorpion': 40,
    'Sagittaire': 78, 'Capricorne': 45, 'Verseau': 95, 'Poissons': 52
  },
  'Cancer': {
    'Bélier': 42, 'Taureau': 92, 'Gémeaux': 53, 'Cancer': 75,
    'Lion': 62, 'Vierge': 85, 'Balance': 47, 'Scorpion': 97,
    'Sagittaire': 38, 'Capricorne': 58, 'Verseau': 43, 'Poissons': 95
  },
  'Lion': {
    'Bélier': 97, 'Taureau': 58, 'Gémeaux': 85, 'Cancer': 62,
    'Lion': 78, 'Vierge': 52, 'Balance': 88, 'Scorpion': 55,
    'Sagittaire': 95, 'Capricorne': 48, 'Verseau': 68, 'Poissons': 53
  },
  'Vierge': {
    'Bélier': 38, 'Taureau': 95, 'Gémeaux': 58, 'Cancer': 85,
    'Lion': 52, 'Vierge': 72, 'Balance': 63, 'Scorpion': 92,
    'Sagittaire': 43, 'Capricorne': 97, 'Verseau': 48, 'Poissons': 78
  },
  'Balance': {
    'Bélier': 62, 'Taureau': 68, 'Gémeaux': 93, 'Cancer': 47,
    'Lion': 88, 'Vierge': 63, 'Balance': 75, 'Scorpion': 72,
    'Sagittaire': 85, 'Capricorne': 53, 'Verseau': 95, 'Poissons': 58
  },
  'Scorpion': {
    'Bélier': 50, 'Taureau': 88, 'Gémeaux': 40, 'Cancer': 97,
    'Lion': 55, 'Vierge': 92, 'Balance': 72, 'Scorpion': 78,
    'Sagittaire': 47, 'Capricorne': 85, 'Verseau': 43, 'Poissons': 95
  },
  'Sagittaire': {
    'Bélier': 93, 'Taureau': 35, 'Gémeaux': 78, 'Cancer': 38,
    'Lion': 95, 'Vierge': 43, 'Balance': 85, 'Scorpion': 47,
    'Sagittaire': 80, 'Capricorne': 52, 'Verseau': 88, 'Poissons': 58
  },
  'Capricorne': {
    'Bélier': 47, 'Taureau': 97, 'Gémeaux': 45, 'Cancer': 58,
    'Lion': 48, 'Vierge': 97, 'Balance': 53, 'Scorpion': 85,
    'Sagittaire': 52, 'Capricorne': 78, 'Verseau': 62, 'Poissons': 73
  },
  'Verseau': {
    'Bélier': 78, 'Taureau': 43, 'Gémeaux': 95, 'Cancer': 43,
    'Lion': 68, 'Vierge': 48, 'Balance': 95, 'Scorpion': 43,
    'Sagittaire': 88, 'Capricorne': 62, 'Verseau': 75, 'Poissons': 58
  },
  'Poissons': {
    'Bélier': 67, 'Taureau': 87, 'Gémeaux': 52, 'Cancer': 95,
    'Lion': 53, 'Vierge': 78, 'Balance': 58, 'Scorpion': 95,
    'Sagittaire': 58, 'Capricorne': 73, 'Verseau': 58, 'Poissons': 82
  }
};

type QuestionnaireAnswers = {
  weekend?: string;
  lifestyle?: string;
  valeurs?: string;
  objectif?: string;
};

const questionnaireCompatibility = {
  weekend: {
    fetard: { fetard: 100, casanier: 25, aventurier: 70, culturel: 55 },
    casanier: { fetard: 25, casanier: 100, aventurier: 45, culturel: 80 },
    aventurier: { fetard: 70, casanier: 45, aventurier: 100, culturel: 65 },
    culturel: { fetard: 55, casanier: 80, aventurier: 65, culturel: 100 },
  },
  lifestyle: {
    fetard: { fetard: 100, equilibre: 55, casanier: 15, flexible: 70 },
    equilibre: { fetard: 55, equilibre: 100, casanier: 70, flexible: 90 },
    casanier: { fetard: 15, equilibre: 70, casanier: 100, flexible: 55 },
    flexible: { fetard: 70, equilibre: 90, casanier: 55, flexible: 100 },
  },
  valeurs: {
    loyal: { loyal: 100, independant: 45, humour: 70, ambitieux: 60 },
    independant: { loyal: 45, independant: 100, humour: 75, ambitieux: 85 },
    humour: { loyal: 70, independant: 75, humour: 100, ambitieux: 50 },
    ambitieux: { loyal: 60, independant: 85, humour: 50, ambitieux: 100 },
  },
  objectif: {
    amour: { amour: 100, serieux: 95, aventure: 20, sais_pas: 45 },
    serieux: { amour: 95, serieux: 100, aventure: 25, sais_pas: 55 },
    aventure: { amour: 20, serieux: 25, aventure: 100, sais_pas: 75 },
    sais_pas: { amour: 45, serieux: 55, aventure: 75, sais_pas: 100 },
  },
};

const weights = {
  astro: 0.25,
  objectif: 0.35,
  valeurs: 0.20,
  lifestyle: 0.10,
  weekend: 0.10,
};

interface UserProfile {
  signe_astro?: string;
  sun_sign?: string;
  questionnaire?: QuestionnaireAnswers;
  goal?: string;
  ville?: string;
  ville_data?: {
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

export const calculateAdvancedCompatibility = (
  user1: UserProfile,
  user2: UserProfile
): number => {
  let totalScore = 0;

  const sign1 = user1.signe_astro || user1.sun_sign || '';
  const sign2 = user2.signe_astro || user2.sun_sign || '';

  const astroScore = astroCompatibility[sign1]?.[sign2] || 50;
  totalScore += astroScore * weights.astro;

  const q1 = user1.questionnaire || {};
  const q2 = user2.questionnaire || {};

  const objectifScore =
    (questionnaireCompatibility.objectif as any)[q1.objectif || 'sais_pas']?.[
      q2.objectif || 'sais_pas'
    ] || 50;
  totalScore += objectifScore * weights.objectif;

  const valeursScore =
    (questionnaireCompatibility.valeurs as any)[q1.valeurs || 'loyal']?.[
      q2.valeurs || 'loyal'
    ] || 50;
  totalScore += valeursScore * weights.valeurs;

  const lifestyleScore =
    (questionnaireCompatibility.lifestyle as any)[q1.lifestyle || 'flexible']?.[
      q2.lifestyle || 'flexible'
    ] || 50;
  totalScore += lifestyleScore * weights.lifestyle;

  const weekendScore =
    (questionnaireCompatibility.weekend as any)[q1.weekend || 'flexible']?.[
      q2.weekend || 'flexible'
    ] || 50;
  totalScore += weekendScore * weights.weekend;

  if (user1.ville === user2.ville) {
    totalScore += 5;
  }

  if (user1.ville_data?.coordinates && user2.ville_data?.coordinates) {
    const distance = calculateDistance(
      user1.ville_data.coordinates,
      user2.ville_data.coordinates
    );
    if (distance < 20) {
      totalScore += 3;
    }
  }

  return Math.min(100, Math.round(totalScore));
};

export const getCompatibilityDetails = (user1: UserProfile, user2: UserProfile) => {
  const sign1 = user1.signe_astro || user1.sun_sign || '';
  const sign2 = user2.signe_astro || user2.sun_sign || '';

  const q1 = user1.questionnaire || {};
  const q2 = user2.questionnaire || {};

  return {
    global: calculateAdvancedCompatibility(user1, user2),
    details: [
      {
        label: 'Astral',
        emoji: '✨',
        score: astroCompatibility[sign1]?.[sign2] || 50,
        description: `${sign1} × ${sign2}`,
      },
      {
        label: 'Objectifs',
        emoji: '🎯',
        score:
          (questionnaireCompatibility.objectif as any)[q1.objectif || 'sais_pas']?.[
            q2.objectif || 'sais_pas'
          ] || 50,
      },
      {
        label: 'Valeurs',
        emoji: '💎',
        score:
          (questionnaireCompatibility.valeurs as any)[q1.valeurs || 'loyal']?.[
            q2.valeurs || 'loyal'
          ] || 50,
      },
      {
        label: 'Lifestyle',
        emoji: '🌙',
        score:
          (questionnaireCompatibility.lifestyle as any)[q1.lifestyle || 'flexible']?.[
            q2.lifestyle || 'flexible'
          ] || 50,
      },
    ],
    distance:
      user1.ville_data?.coordinates && user2.ville_data?.coordinates
        ? calculateDistance(user1.ville_data.coordinates, user2.ville_data.coordinates)
        : null,
  };
};
