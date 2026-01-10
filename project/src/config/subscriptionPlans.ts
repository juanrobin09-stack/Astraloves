import type {
  SubscriptionPlan,
  PlanId,
  FeatureDescription,
  LimitDescription,
  FeatureName,
  LimitName,
} from '../types/subscription';

export const SUBSCRIPTION_PLANS: Record<PlanId, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    priceFormatted: '0',
    icon: '✨',
    tier: 0,
    color: '#6B7280',
    gradientFrom: '#374151',
    gradientTo: '#1F2937',
    limits: {
      cosmicSignalsPerDay: 10,
      astraMessagesPerDay: 10,
      matchMessagesPerDay: 20,
      superNovaPerDay: 0,
      superLikesPerDay: 0,
      maxPhotos: 5,
      maxBioChars: 200,
      visibleStars: 15,
      visibilityBoost: 1,
    },
    features: {
      unlimitedCosmicSignals: false,
      unlimitedMatchMessages: false,
      superNova: false,
      seeWhoSignaled: false,
      seeWhenSignaled: false,
      extendedVision: false,
      totalVision: false,
      visibilityBoost: false,
      aiCompatibilityMatch: false,
      aiProfileTips: false,
      aiIceBreakers: false,
      advancedHoroscope: false,
      premiumBadge: false,
      eliteBadge: false,
      starShineBoost: false,
      rewind: false,
      advancedAstroFilters: false,
      incognitoMode: false,
      profileVisitors: false,
      fullAstralChart: false,
      advancedCosmicCompatibility: false,
      goldenAura: false,
      shootingStarEffect: false,
      astraWritesMessages: false,
      aiCoachPro: false,
      unlimitedBio: false,
    },
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    priceFormatted: '9,99',
    icon: '💎',
    tier: 1,
    color: '#8B5CF6',
    gradientFrom: '#7C3AED',
    gradientTo: '#5B21B6',
    stripePriceId: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID,
    limits: {
      cosmicSignalsPerDay: Infinity,
      astraMessagesPerDay: 40,
      matchMessagesPerDay: Infinity,
      superNovaPerDay: 1,
      superLikesPerDay: 0,
      maxPhotos: 10,
      maxBioChars: 500,
      visibleStars: 50,
      visibilityBoost: 3,
    },
    features: {
      unlimitedCosmicSignals: true,
      unlimitedMatchMessages: true,
      superNova: true,
      seeWhoSignaled: true,
      seeWhenSignaled: false,
      extendedVision: true,
      totalVision: false,
      visibilityBoost: true,
      aiCompatibilityMatch: true,
      aiProfileTips: true,
      aiIceBreakers: true,
      advancedHoroscope: true,
      premiumBadge: true,
      eliteBadge: false,
      starShineBoost: true,
      rewind: false,
      advancedAstroFilters: false,
      incognitoMode: false,
      profileVisitors: false,
      fullAstralChart: false,
      advancedCosmicCompatibility: false,
      goldenAura: false,
      shootingStarEffect: false,
      astraWritesMessages: false,
      aiCoachPro: false,
      unlimitedBio: false,
    },
  },
  premium_elite: {
    id: 'premium_elite',
    name: 'Premium+ Elite',
    price: 14.99,
    priceFormatted: '14,99',
    icon: '👑',
    tier: 2,
    color: '#F59E0B',
    gradientFrom: '#F59E0B',
    gradientTo: '#D97706',
    stripePriceId: import.meta.env.VITE_STRIPE_ELITE_PRICE_ID,
    limits: {
      cosmicSignalsPerDay: Infinity,
      astraMessagesPerDay: 65,
      matchMessagesPerDay: Infinity,
      superNovaPerDay: 5,
      superLikesPerDay: 10,
      maxPhotos: 20,
      maxBioChars: Infinity,
      visibleStars: Infinity,
      visibilityBoost: 10,
    },
    features: {
      unlimitedCosmicSignals: true,
      unlimitedMatchMessages: true,
      superNova: true,
      seeWhoSignaled: true,
      seeWhenSignaled: true,
      extendedVision: true,
      totalVision: true,
      visibilityBoost: true,
      aiCompatibilityMatch: true,
      aiProfileTips: true,
      aiIceBreakers: true,
      advancedHoroscope: true,
      premiumBadge: true,
      eliteBadge: true,
      starShineBoost: true,
      rewind: true,
      advancedAstroFilters: true,
      incognitoMode: true,
      profileVisitors: true,
      fullAstralChart: true,
      advancedCosmicCompatibility: true,
      goldenAura: true,
      shootingStarEffect: true,
      astraWritesMessages: true,
      aiCoachPro: true,
      unlimitedBio: true,
    },
  },
};

export const FEATURE_DESCRIPTIONS: Record<FeatureName, FeatureDescription> = {
  unlimitedCosmicSignals: {
    name: 'unlimitedCosmicSignals',
    label: 'Signaux cosmiques illimites',
    description: 'Envoie autant de signaux que tu veux sans limite quotidienne',
    icon: '💫',
    category: 'discovery',
  },
  unlimitedMatchMessages: {
    name: 'unlimitedMatchMessages',
    label: 'Messages matchs illimites',
    description: 'Discute sans limite avec tes matchs',
    icon: '💬',
    category: 'messaging',
  },
  superNova: {
    name: 'superNova',
    label: 'Super Nova',
    description: 'Envoie un signal ultra-visible qui se demarque',
    icon: '🌟',
    category: 'discovery',
  },
  seeWhoSignaled: {
    name: 'seeWhoSignaled',
    label: 'Voir qui a signale',
    description: 'Decouvre qui t\'a envoye un signal cosmique',
    icon: '👁️',
    category: 'discovery',
  },
  seeWhenSignaled: {
    name: 'seeWhenSignaled',
    label: 'Voir quand',
    description: 'Vois exactement quand on t\'a signale',
    icon: '⏰',
    category: 'discovery',
    eliteOnly: true,
  },
  extendedVision: {
    name: 'extendedVision',
    label: 'Vision etendue',
    description: 'Vois plus de profils dans ta constellation',
    icon: '🔭',
    category: 'discovery',
  },
  totalVision: {
    name: 'totalVision',
    label: 'Vision totale',
    description: 'Aucune limite sur les profils visibles',
    icon: '🌌',
    category: 'discovery',
    eliteOnly: true,
  },
  visibilityBoost: {
    name: 'visibilityBoost',
    label: 'Boost de visibilite',
    description: 'Apparais plus souvent dans les recherches',
    icon: '🚀',
    category: 'visibility',
  },
  aiCompatibilityMatch: {
    name: 'aiCompatibilityMatch',
    label: 'Compatibilite IA 92%',
    description: 'Analyse de compatibilite basee sur l\'IA',
    icon: '🎯',
    category: 'ai',
  },
  aiProfileTips: {
    name: 'aiProfileTips',
    label: 'Conseils profil IA',
    description: 'Ameliore ton profil avec des suggestions IA',
    icon: '💡',
    category: 'ai',
  },
  aiIceBreakers: {
    name: 'aiIceBreakers',
    label: 'Ice-breakers Astra',
    description: 'Astra te suggere des messages d\'accroche',
    icon: '💬',
    category: 'ai',
  },
  advancedHoroscope: {
    name: 'advancedHoroscope',
    label: 'Horoscope avance',
    description: 'Horoscope detaille avec predictions personnalisees',
    icon: '🔮',
    category: 'astrology',
  },
  premiumBadge: {
    name: 'premiumBadge',
    label: 'Badge Premium',
    description: 'Affiche ton statut Premium sur ton profil',
    icon: '💎',
    category: 'profile',
  },
  eliteBadge: {
    name: 'eliteBadge',
    label: 'Badge Elite Top 1%',
    description: 'Badge exclusif des membres Elite',
    icon: '👑',
    category: 'profile',
    eliteOnly: true,
  },
  starShineBoost: {
    name: 'starShineBoost',
    label: 'Etoile brillante x2',
    description: 'Ton etoile brille 2x plus dans l\'univers',
    icon: '✨',
    category: 'visibility',
  },
  rewind: {
    name: 'rewind',
    label: 'Rembobinage',
    description: 'Reviens sur un profil swipe par erreur',
    icon: '🔄',
    category: 'discovery',
    eliteOnly: true,
  },
  advancedAstroFilters: {
    name: 'advancedAstroFilters',
    label: 'Filtres astro avances',
    description: 'Filtre par signe, ascendant et lune',
    icon: '🔭',
    category: 'astrology',
    eliteOnly: true,
  },
  incognitoMode: {
    name: 'incognitoMode',
    label: 'Mode incognito',
    description: 'Parcours les profils sans etre vu',
    icon: '🎭',
    category: 'exclusive',
    eliteOnly: true,
  },
  profileVisitors: {
    name: 'profileVisitors',
    label: 'Visiteurs de profil',
    description: 'Vois qui a visite ton profil',
    icon: '👁️',
    category: 'exclusive',
    eliteOnly: true,
  },
  fullAstralChart: {
    name: 'fullAstralChart',
    label: 'Theme astral complet',
    description: 'Analyse astrologique complete avec tous les aspects',
    icon: '🌌',
    category: 'astrology',
    eliteOnly: true,
  },
  advancedCosmicCompatibility: {
    name: 'advancedCosmicCompatibility',
    label: 'Compatibilite cosmique avancee',
    description: 'Analyse detaillee de compatibilite sur 5 dimensions',
    icon: '🔮',
    category: 'astrology',
    eliteOnly: true,
  },
  goldenAura: {
    name: 'goldenAura',
    label: 'Aura doree animee',
    description: 'Ton profil brille avec une aura doree',
    icon: '✨',
    category: 'exclusive',
    eliteOnly: true,
  },
  shootingStarEffect: {
    name: 'shootingStarEffect',
    label: 'Effet etoile filante',
    description: 'Animation speciale sur ton profil',
    icon: '🌠',
    category: 'exclusive',
    eliteOnly: true,
  },
  astraWritesMessages: {
    name: 'astraWritesMessages',
    label: 'Astra ecrit tes messages',
    description: 'Laisse Astra ecrire des messages pour toi',
    icon: '📝',
    category: 'ai',
    eliteOnly: true,
  },
  aiCoachPro: {
    name: 'aiCoachPro',
    label: 'Coach IA Pro',
    description: 'Conseils personnalises pour tes relations',
    icon: '🤖',
    category: 'ai',
    eliteOnly: true,
  },
  unlimitedBio: {
    name: 'unlimitedBio',
    label: 'Bio illimitee',
    description: 'Ecris une bio sans limite de caracteres',
    icon: '📝',
    category: 'profile',
    eliteOnly: true,
  },
};

export const LIMIT_DESCRIPTIONS: Record<LimitName, LimitDescription> = {
  cosmicSignalsPerDay: {
    name: 'cosmicSignalsPerDay',
    label: 'Signaux cosmiques',
    description: 'Nombre de signaux que tu peux envoyer par jour',
    icon: '💫',
    unit: '/jour',
  },
  astraMessagesPerDay: {
    name: 'astraMessagesPerDay',
    label: 'Messages Astra IA',
    description: 'Messages avec l\'assistant IA Astra',
    icon: '🤖',
    unit: '/jour',
  },
  matchMessagesPerDay: {
    name: 'matchMessagesPerDay',
    label: 'Messages matchs',
    description: 'Messages avec tes matchs',
    icon: '💬',
    unit: '/jour',
  },
  superNovaPerDay: {
    name: 'superNovaPerDay',
    label: 'Super Nova',
    description: 'Signaux ultra-visibles par jour',
    icon: '🌟',
    unit: '/jour',
  },
  superLikesPerDay: {
    name: 'superLikesPerDay',
    label: 'Super likes',
    description: 'Super likes disponibles par jour',
    icon: '💖',
    unit: '/jour',
  },
  maxPhotos: {
    name: 'maxPhotos',
    label: 'Photos de profil',
    description: 'Nombre maximum de photos sur ton profil',
    icon: '📷',
    unit: 'max',
  },
  maxBioChars: {
    name: 'maxBioChars',
    label: 'Caracteres bio',
    description: 'Longueur maximum de ta bio',
    icon: '📝',
    unit: 'car.',
  },
  visibleStars: {
    name: 'visibleStars',
    label: 'Etoiles visibles',
    description: 'Profils visibles dans ta constellation',
    icon: '🌌',
    unit: 'profils',
  },
  visibilityBoost: {
    name: 'visibilityBoost',
    label: 'Multiplicateur visibilite',
    description: 'Multiplicateur de visibilite dans les recherches',
    icon: '🚀',
    unit: 'x',
  },
};

export function getPlanById(planId: PlanId): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.free;
}

export function getPlanByTier(tier: number): SubscriptionPlan | null {
  return Object.values(SUBSCRIPTION_PLANS).find(p => p.tier === tier) || null;
}

export function getAllPlans(): SubscriptionPlan[] {
  return Object.values(SUBSCRIPTION_PLANS).sort((a, b) => a.tier - b.tier);
}

export function getPlansWithFeature(featureName: FeatureName): SubscriptionPlan[] {
  return Object.values(SUBSCRIPTION_PLANS)
    .filter(plan => plan.features[featureName])
    .sort((a, b) => a.tier - b.tier);
}

export function getMinimumPlanForFeature(featureName: FeatureName): SubscriptionPlan | null {
  const plans = getPlansWithFeature(featureName);
  return plans.length > 0 ? plans[0] : null;
}

export function getPlansWithLimit(limitName: LimitName, minValue: number): SubscriptionPlan[] {
  return Object.values(SUBSCRIPTION_PLANS)
    .filter(plan => plan.limits[limitName] >= minValue || plan.limits[limitName] === Infinity)
    .sort((a, b) => a.tier - b.tier);
}

export function formatLimit(value: number): string {
  if (value === Infinity) return '∞';
  return value.toString();
}

export function isUnlimited(value: number): boolean {
  return value === Infinity;
}

export function normalizePlanId(planId: string | null | undefined): PlanId {
  if (!planId) return 'free';
  const normalized = planId.toLowerCase().replace(/[^a-z_]/g, '');
  if (normalized === 'premium_elite' || normalized === 'elite' || normalized === 'premiumelite') {
    return 'premium_elite';
  }
  if (normalized === 'premium') {
    return 'premium';
  }
  return 'free';
}
