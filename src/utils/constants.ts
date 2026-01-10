// ═══════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════

import type { SubscriptionTier } from '@/types';

export const TIER_QUOTAS: Record<SubscriptionTier, {
  astraMessages: number;
  universClicks: number;
  visibleStars: number;
}> = {
  free: {
    astraMessages: 5,
    universClicks: 1,
    visibleStars: 5,
  },
  premium: {
    astraMessages: 40,
    universClicks: 999999,
    visibleStars: 20,
  },
  elite: {
    astraMessages: 65,
    universClicks: 999999,
    visibleStars: 999999,
  },
};

export const TIER_FEATURES = {
  free: [
    'Profil astro complet',
    '5 étoiles visibles',
    '1 clic/jour sur étoile',
    '5 messages ASTRA/jour',
    '3 conversations simultanées',
  ],
  premium: [
    'Tout de Free',
    '20 étoiles visibles',
    'Compatibilité % exacte',
    'Filtres avancés',
    '40 messages ASTRA/jour',
    'Conversations illimitées',
    '"Qui m\'a vu"',
    'Badge Premium',
  ],
  elite: [
    'Tout de Premium',
    'Toutes étoiles visibles',
    'Guardian actif',
    'Silence recommandé',
    '65 messages ASTRA/jour',
    'Priorité matching',
    'Badge Elite doré',
    'Support prioritaire',
    'Prévisions mensuelles',
  ],
};

export const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer',
  'leo', 'virgo', 'libra', 'scorpio',
  'sagittarius', 'capricorn', 'aquarius', 'pisces',
] as const;

export const ZODIAC_SYMBOLS: Record<string, string> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
};

export const ELEMENT_COLORS: Record<string, string> = {
  fire: '#EF4444',
  earth: '#10B981',
  air: '#60A5FA',
  water: '#8B5CF6',
};

export const TIER_COLORS: Record<SubscriptionTier, string> = {
  free: 'rgba(255, 255, 255, 0.4)',
  premium: '#A78BFA',
  elite: '#FCD34D',
};

export const ONBOARDING_PHASES = [
  { id: 1, name: 'Éveil', range: [0, 25], description: 'Complète ton profil astro' },
  { id: 2, name: 'Exploration', range: [25, 50], description: 'Découvre 5 connexions' },
  { id: 3, name: 'Résonance', range: [50, 75], description: 'Engage 3 conversations' },
  { id: 4, name: 'Alignement', range: [75, 100], description: 'Crée une connexion profonde' },
];
