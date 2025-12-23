export interface SubscriptionFeatures {
  swipesPerDay: number;
  astraMessagesPerDay: number;
  matchMessagesPerDay: number;
  maxPhotos: number;
  bioMaxChars: number;
  visibilityBoost: number;
  compatibilityAI: string;
  horoscope: string;
  superLikesPerDay: number;
  canSeeVisitors: boolean;
  incognitoMode: boolean;
  advancedFilters: boolean;
  badge: string | null;
  fullThemeAstral: boolean;
  aiProfileAdvice?: boolean;
  aiCoachPro?: boolean;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: string;
  features: SubscriptionFeatures;
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  FREE: {
    id: 'free',
    name: 'Gratuit',
    price: '0€',
    features: {
      swipesPerDay: 10,
      astraMessagesPerDay: 10,
      matchMessagesPerDay: 20,
      maxPhotos: 5,
      bioMaxChars: 200,
      visibilityBoost: 1,
      compatibilityAI: 'basique',
      horoscope: 'basique',
      superLikesPerDay: 0,
      canSeeVisitors: false,
      incognitoMode: false,
      advancedFilters: false,
      badge: null,
      fullThemeAstral: false
    }
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: '9,99€/mois',
    features: {
      swipesPerDay: Infinity,
      astraMessagesPerDay: 40,
      matchMessagesPerDay: Infinity,
      maxPhotos: 10,
      bioMaxChars: 500,
      visibilityBoost: 3,
      compatibilityAI: '92% compatibilité IA',
      horoscope: 'avancé détaillé',
      superLikesPerDay: 0,
      canSeeVisitors: false,
      incognitoMode: false,
      advancedFilters: false,
      badge: '💎 Premium',
      fullThemeAstral: false,
      aiProfileAdvice: true
    }
  },
  PREMIUM_ELITE: {
    id: 'premium_elite',
    name: 'Premium+ Elite',
    price: '14,99€/mois',
    features: {
      swipesPerDay: Infinity,
      astraMessagesPerDay: 65,
      matchMessagesPerDay: Infinity,
      maxPhotos: 20,
      bioMaxChars: Infinity,
      visibilityBoost: 10,
      compatibilityAI: 'compatibilité cosmique avancée',
      horoscope: 'thème astral complet détaillé',
      superLikesPerDay: 10,
      canSeeVisitors: true,
      incognitoMode: true,
      advancedFilters: true,
      badge: '👑 Elite · Top 1%',
      fullThemeAstral: true,
      aiCoachPro: true
    }
  }
};

export function getTierByPlan(plan: string | null): SubscriptionTier {
  const normalizedPlan = plan?.toUpperCase() || 'FREE';
  return SUBSCRIPTION_TIERS[normalizedPlan] || SUBSCRIPTION_TIERS.FREE;
}
