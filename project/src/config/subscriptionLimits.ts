/**
 * ASTRA - Configuration des limites d'abonnement
 * Architecture centralisée pour tous les plans
 */

export type PlanTier = 'free' | 'premium' | 'premium_elite';

export interface PlanLimits {
  // Signaux cosmiques
  cosmicSignalsPerDay: number;
  cosmicSignalsUnlimited: boolean;
  
  // Super Nova (highlight)
  superNovaPerDay: number;
  
  // Messages Astra IA
  astraMessagesPerDay: number;
  astraCoachPro: boolean;
  astraWritesMessages: boolean;
  
  // Messages matchs
  matchMessagesPerDay: number | null; // null = illimité
  
  // Visibilité
  canSeeWhoSentSignal: boolean;
  canSeeWhenSignalSent: boolean;
  canSeeProfileVisitors: boolean;
  
  // Univers
  maxVisibleStars: number | null; // null = illimité
  profilesBlurred: boolean;
  
  // Boost
  visibilityBoostMultiplier: number;
  
  // Profil
  maxPhotos: number;
  maxBioLength: number;
  
  // Premium features
  hasPremiumBadge: boolean;
  hasEliteBadge: boolean;
  hasGoldenAura: boolean;
  hasShootingStarEffect: boolean;
  
  // Horoscope
  horoscopeLevel: 'basic' | 'advanced' | 'complete';
  
  // Compatibility
  compatibilityLevel: 'basic' | 'advanced' | 'complete';
  showCompatibilityScore: boolean;
  
  // Super likes
  superLikesPerDay: number;
  
  // Fonctionnalités avancées
  canRewind: boolean;
  hasAdvancedFilters: boolean;
  hasIncognitoMode: boolean;
  
  // AI features
  hasAIIceBreakers: boolean;
  hasAIProfileTips: boolean;
  hasAstralTheme: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    // Signaux
    cosmicSignalsPerDay: 10,
    cosmicSignalsUnlimited: false,
    superNovaPerDay: 0,
    
    // Messages
    astraMessagesPerDay: 10,
    astraCoachPro: false,
    astraWritesMessages: false,
    matchMessagesPerDay: 20,
    
    // Visibilité
    canSeeWhoSentSignal: false,
    canSeeWhenSignalSent: false,
    canSeeProfileVisitors: false,
    
    // Univers
    maxVisibleStars: 15,
    profilesBlurred: true,
    
    // Boost
    visibilityBoostMultiplier: 1,
    
    // Profil
    maxPhotos: 5,
    maxBioLength: 200,
    
    // Badges
    hasPremiumBadge: false,
    hasEliteBadge: false,
    hasGoldenAura: false,
    hasShootingStarEffect: false,
    
    // Horoscope
    horoscopeLevel: 'basic',
    
    // Compatibility
    compatibilityLevel: 'basic',
    showCompatibilityScore: false,
    
    // Super likes
    superLikesPerDay: 0,
    
    // Advanced
    canRewind: false,
    hasAdvancedFilters: false,
    hasIncognitoMode: false,
    
    // AI
    hasAIIceBreakers: false,
    hasAIProfileTips: false,
    hasAstralTheme: false,
  },
  
  premium: {
    // Signaux
    cosmicSignalsPerDay: 999999, // pratiquement illimité
    cosmicSignalsUnlimited: true,
    superNovaPerDay: 1,
    
    // Messages
    astraMessagesPerDay: 40,
    astraCoachPro: false,
    astraWritesMessages: false,
    matchMessagesPerDay: null, // illimité
    
    // Visibilité
    canSeeWhoSentSignal: true,
    canSeeWhenSignalSent: false,
    canSeeProfileVisitors: false,
    
    // Univers
    maxVisibleStars: 50,
    profilesBlurred: false,
    
    // Boost
    visibilityBoostMultiplier: 3,
    
    // Profil
    maxPhotos: 10,
    maxBioLength: 500,
    
    // Badges
    hasPremiumBadge: true,
    hasEliteBadge: false,
    hasGoldenAura: false,
    hasShootingStarEffect: false,
    
    // Horoscope
    horoscopeLevel: 'advanced',
    
    // Compatibility
    compatibilityLevel: 'advanced',
    showCompatibilityScore: true,
    
    // Super likes
    superLikesPerDay: 3,
    
    // Advanced
    canRewind: false,
    hasAdvancedFilters: false,
    hasIncognitoMode: false,
    
    // AI
    hasAIIceBreakers: true,
    hasAIProfileTips: true,
    hasAstralTheme: false,
  },
  
  premium_elite: {
    // Signaux
    cosmicSignalsPerDay: 999999,
    cosmicSignalsUnlimited: true,
    superNovaPerDay: 5,
    
    // Messages
    astraMessagesPerDay: 65,
    astraCoachPro: true,
    astraWritesMessages: true,
    matchMessagesPerDay: null, // illimité
    
    // Visibilité
    canSeeWhoSentSignal: true,
    canSeeWhenSignalSent: true,
    canSeeProfileVisitors: true,
    
    // Univers
    maxVisibleStars: null, // illimité
    profilesBlurred: false,
    
    // Boost
    visibilityBoostMultiplier: 10,
    
    // Profil
    maxPhotos: 20,
    maxBioLength: 9999, // pratiquement illimité
    
    // Badges
    hasPremiumBadge: false,
    hasEliteBadge: true,
    hasGoldenAura: true,
    hasShootingStarEffect: true,
    
    // Horoscope
    horoscopeLevel: 'complete',
    
    // Compatibility
    compatibilityLevel: 'complete',
    showCompatibilityScore: true,
    
    // Super likes
    superLikesPerDay: 10,
    
    // Advanced
    canRewind: true,
    hasAdvancedFilters: true,
    hasIncognitoMode: true,
    
    // AI
    hasAIIceBreakers: true,
    hasAIProfileTips: true,
    hasAstralTheme: true,
  },
};

export const PLAN_NAMES: Record<PlanTier, string> = {
  free: 'Astra Essentiel',
  premium: 'Premium',
  premium_elite: 'Premium+ Elite',
};

export const PLAN_PRICES: Record<PlanTier, string> = {
  free: 'Gratuit',
  premium: '9,99€/mois',
  premium_elite: '14,99€/mois',
};

export const PLAN_COLORS: Record<PlanTier, { primary: string; gradient: string }> = {
  free: {
    primary: '#7A7A7A',
    gradient: 'linear-gradient(135deg, #4A4A4A, #2A2A2A)',
  },
  premium: {
    primary: '#E63946',
    gradient: 'linear-gradient(135deg, #E63946, #FF6B6B)',
  },
  premium_elite: {
    primary: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFD700, #FFA500)',
  },
};

/**
 * Helper pour obtenir les limites du plan actuel
 */
export function getPlanLimits(tier: PlanTier): PlanLimits {
  return PLAN_LIMITS[tier];
}

/**
 * Helper pour vérifier si une feature est accessible
 */
export function hasAccess(
  currentTier: PlanTier,
  requiredTier: PlanTier
): boolean {
  const tierLevels: Record<PlanTier, number> = {
    free: 0,
    premium: 1,
    premium_elite: 2,
  };
  
  return tierLevels[currentTier] >= tierLevels[requiredTier];
}

/**
 * Features spécifiques par tier
 */
export const TIER_FEATURES = {
  free: [
    '💫 10 signaux cosmiques / jour',
    '🤖 10 messages Astra IA / jour',
    '💬 20 messages matchs / jour',
    '🔮 Horoscope basique',
    '📷 5 photos maximum',
    '🌌 15 étoiles visibles',
  ],
  premium: [
    '💫 Signaux illimités',
    '🌟 1 Super Nova / jour',
    '🤖 40 messages Astra IA',
    '💬 Messages illimités',
    '👁️ Voir qui t\'a envoyé un signal',
    '🌌 50 étoiles visibles',
    '🚀 Boost x3',
    '💎 Badge Premium',
    '🔮 Horoscope avancé',
    '📷 10 photos',
  ],
  premium_elite: [
    '💫 Signaux ILLIMITÉS',
    '🌟 5 Super Nova / jour',
    '⚡ 65 messages Astra IA Ultra',
    '🤖 Coach IA Pro',
    '👁️ Voir qui + quand',
    '🌌 Univers infini',
    '👑 Badge Elite + Top 1%',
    '🚀 Boost Elite x10',
    '💖 10 super likes / jour',
    '🔄 Rembobinage',
    '🔭 Filtres astro avancés',
    '🎭 Mode incognito',
    '✨ Aura dorée',
    '📷 20 photos',
  ],
};
