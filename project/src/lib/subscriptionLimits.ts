export type SubscriptionTier = 'free' | 'premium' | 'premium_elite';

export interface SubscriptionLimits {
  cosmicSignalsPerDay: number | 'unlimited';
  superNovaPerDay: number;
  astraMessagesPerDay: number;
  matchMessagesPerDay: number | 'unlimited';
  maxPhotos: number;
  bioMaxLength: number | 'unlimited';
  liveReactionsPerDay: number | 'unlimited';
  liveChatMessagesPerDay: number | 'unlimited';
  canGoLive: boolean;
  livePerWeek?: number | 'unlimited';
  liveMaxDuration?: number | 'unlimited';
  liveMaxViewers?: number | 'unlimited';
  boostMultiplier: number;
  superLikesPerDay: number;
  starsPerMonth: number;
  giftDiscount: number;
  commission: number;
  badge?: string;
  badgeEmoji?: string;
  subtitle?: string;
  constellationLimit: number | 'unlimited';
  minCompatibilityVisible: number;
  profilePreview: 'blurred' | 'full' | 'full_plus';
  canSeeWhoSignaled: boolean;
  canSeeSignalTime?: boolean;
  canFilter: boolean;
  canFilterOnline?: boolean;
  canFilterAdvancedAstro?: boolean;
  canRewind?: boolean;
  incognitoMode?: boolean;
  seeProfileVisitors?: boolean;
  advancedFilters?: boolean;
  arEffects?: boolean;
  spotifyMusic?: boolean;
  prioritySupport?: boolean;
  astraIcebreakers?: boolean;
  astraWritesMessages?: boolean;
  astraCoach?: boolean;
  astraSuggestionsDaily?: number;
  astraCompatibilityPrediction?: boolean;
  starSizeMultiplier?: number;
  hasAura?: boolean;
  auraAnimated?: boolean;
  auraColor?: string;
  shootingStarEffect?: boolean;
  appearsFirst?: boolean;
  topPercent?: number;
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    cosmicSignalsPerDay: 10,
    superNovaPerDay: 0,
    astraMessagesPerDay: 10,
    matchMessagesPerDay: 20,
    maxPhotos: 5,
    bioMaxLength: 200,
    liveReactionsPerDay: 0,
    liveChatMessagesPerDay: 0,
    canGoLive: false,
    boostMultiplier: 1,
    superLikesPerDay: 0,
    starsPerMonth: 0,
    giftDiscount: 0,
    commission: 0.20,
    badgeEmoji: '🌑',
    subtitle: 'Étoile Naissante',
    constellationLimit: 15,
    minCompatibilityVisible: 65,
    profilePreview: 'blurred',
    canSeeWhoSignaled: false,
    canFilter: false,
    starSizeMultiplier: 1,
    hasAura: false
  },
  premium: {
    cosmicSignalsPerDay: 'unlimited',
    superNovaPerDay: 1,
    astraMessagesPerDay: 40,
    matchMessagesPerDay: 'unlimited',
    maxPhotos: 10,
    bioMaxLength: 500,
    liveReactionsPerDay: 0,
    liveChatMessagesPerDay: 0,
    canGoLive: false,
    boostMultiplier: 3,
    superLikesPerDay: 0,
    starsPerMonth: 0,
    giftDiscount: 0.20,
    commission: 0.15,
    badge: '💎',
    badgeEmoji: '💎',
    subtitle: 'Étoile Brillante',
    constellationLimit: 50,
    minCompatibilityVisible: 40,
    profilePreview: 'full',
    canSeeWhoSignaled: true,
    canFilter: true,
    advancedFilters: true,
    astraIcebreakers: true,
    astraSuggestionsDaily: 3,
    starSizeMultiplier: 1.5,
    hasAura: true,
    auraColor: 'rgba(230, 57, 70, 0.5)'
  },
  premium_elite: {
    cosmicSignalsPerDay: 'unlimited',
    superNovaPerDay: 5,
    astraMessagesPerDay: 65,
    matchMessagesPerDay: 'unlimited',
    maxPhotos: 20,
    bioMaxLength: 'unlimited',
    liveReactionsPerDay: 0,
    liveChatMessagesPerDay: 0,
    canGoLive: false,
    boostMultiplier: 10,
    superLikesPerDay: 10,
    starsPerMonth: 0,
    giftDiscount: 0.20,
    commission: 0.05,
    badge: '👑',
    badgeEmoji: '👑',
    subtitle: 'Supernova',
    constellationLimit: 'unlimited',
    minCompatibilityVisible: 0,
    profilePreview: 'full_plus',
    canSeeWhoSignaled: true,
    canSeeSignalTime: true,
    canFilter: true,
    canFilterOnline: true,
    canFilterAdvancedAstro: true,
    canRewind: true,
    incognitoMode: true,
    seeProfileVisitors: true,
    advancedFilters: true,
    astraIcebreakers: true,
    astraWritesMessages: true,
    astraCoach: true,
    astraSuggestionsDaily: 10,
    astraCompatibilityPrediction: true,
    starSizeMultiplier: 2,
    hasAura: true,
    auraAnimated: true,
    auraColor: 'linear-gradient(135deg, rgba(255, 215, 0, 0.6), rgba(168, 85, 247, 0.4))',
    shootingStarEffect: true,
    appearsFirst: true,
    topPercent: 1
  }
};

export const getUserLimits = (subscription?: SubscriptionTier | null): SubscriptionLimits => {
  return SUBSCRIPTION_LIMITS[subscription || 'free'];
};
