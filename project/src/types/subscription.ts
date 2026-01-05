export type PlanId = 'free' | 'premium' | 'premium_elite';

export type LimitName =
  | 'cosmicSignalsPerDay'
  | 'astraMessagesPerDay'
  | 'matchMessagesPerDay'
  | 'superNovaPerDay'
  | 'superLikesPerDay'
  | 'maxPhotos'
  | 'maxBioChars'
  | 'visibleStars'
  | 'visibilityBoost';

export type FeatureName =
  | 'unlimitedCosmicSignals'
  | 'unlimitedMatchMessages'
  | 'superNova'
  | 'seeWhoSignaled'
  | 'seeWhenSignaled'
  | 'extendedVision'
  | 'totalVision'
  | 'visibilityBoost'
  | 'aiCompatibilityMatch'
  | 'aiProfileTips'
  | 'aiIceBreakers'
  | 'advancedHoroscope'
  | 'premiumBadge'
  | 'eliteBadge'
  | 'starShineBoost'
  | 'rewind'
  | 'advancedAstroFilters'
  | 'incognitoMode'
  | 'profileVisitors'
  | 'fullAstralChart'
  | 'advancedCosmicCompatibility'
  | 'goldenAura'
  | 'shootingStarEffect'
  | 'astraWritesMessages'
  | 'aiCoachPro'
  | 'unlimitedBio';

export interface SubscriptionLimits {
  cosmicSignalsPerDay: number;
  astraMessagesPerDay: number;
  matchMessagesPerDay: number;
  superNovaPerDay: number;
  superLikesPerDay: number;
  maxPhotos: number;
  maxBioChars: number;
  visibleStars: number;
  visibilityBoost: number;
}

export interface SubscriptionFeatures {
  unlimitedCosmicSignals: boolean;
  unlimitedMatchMessages: boolean;
  superNova: boolean;
  seeWhoSignaled: boolean;
  seeWhenSignaled: boolean;
  extendedVision: boolean;
  totalVision: boolean;
  visibilityBoost: boolean;
  aiCompatibilityMatch: boolean;
  aiProfileTips: boolean;
  aiIceBreakers: boolean;
  advancedHoroscope: boolean;
  premiumBadge: boolean;
  eliteBadge: boolean;
  starShineBoost: boolean;
  rewind: boolean;
  advancedAstroFilters: boolean;
  incognitoMode: boolean;
  profileVisitors: boolean;
  fullAstralChart: boolean;
  advancedCosmicCompatibility: boolean;
  goldenAura: boolean;
  shootingStarEffect: boolean;
  astraWritesMessages: boolean;
  aiCoachPro: boolean;
  unlimitedBio: boolean;
}

export interface SubscriptionPlan {
  id: PlanId;
  name: string;
  price: number;
  priceFormatted: string;
  icon: string;
  tier: number;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  limits: SubscriptionLimits;
  features: SubscriptionFeatures;
  stripePriceId?: string;
}

export interface UserSubscription {
  planId: PlanId;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startedAt: Date | null;
  expiresAt: Date | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

export interface UsageTracking {
  date: string;
  cosmicSignals: number;
  superNova: number;
  astraMessages: number;
  matchMessages: number;
  superLikes: number;
}

export interface UpgradeInfo {
  required: boolean;
  currentPlan: SubscriptionPlan;
  minimumPlanRequired: SubscriptionPlan | null;
  allPlansWithFeature: SubscriptionPlan[];
  priceDifference: number;
  featuresGained: string[];
}

export interface FeatureCheckResult {
  allowed: boolean;
  feature: FeatureName;
  currentPlan: PlanId;
  minimumPlanRequired: PlanId | null;
}

export interface LimitCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
  isUnlimited: boolean;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: 'LIMIT_REACHED' | 'FEATURE_LOCKED' | 'NETWORK_ERROR' | 'AUTH_REQUIRED' | 'UNKNOWN';
  message?: string;
  upgrade?: UpgradeInfo;
  remaining?: number;
}

export interface PlanComparison {
  planA: SubscriptionPlan;
  planB: SubscriptionPlan;
  limitsDiff: Partial<Record<LimitName, { a: number; b: number; diff: number | 'unlimited' }>>;
  featuresDiff: Partial<Record<FeatureName, { a: boolean; b: boolean }>>;
  priceDiff: number;
  recommendation: 'upgrade' | 'downgrade' | 'same';
}

export interface FeatureDescription {
  name: FeatureName;
  label: string;
  description: string;
  icon: string;
  category: 'discovery' | 'messaging' | 'visibility' | 'astrology' | 'ai' | 'profile' | 'exclusive';
  eliteOnly?: boolean;
}

export interface LimitDescription {
  name: LimitName;
  label: string;
  description: string;
  icon: string;
  unit: string;
}

export interface SignalerInfo {
  userId: string;
  username: string;
  photoUrl: string | null;
  zodiacSign: string | null;
  signaledAt?: Date;
}

export interface ProfileVisitor {
  userId: string;
  username: string;
  photoUrl: string | null;
  zodiacSign: string | null;
  visitedAt: Date;
}

export interface BirthData {
  date: string;
  time: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface AstralChart {
  sunSign: string;
  moonSign: string;
  ascendant: string;
  planets: Record<string, { sign: string; house: number; degree: number }>;
  houses: Record<number, string>;
  aspects: Array<{ planet1: string; planet2: string; type: string; orb: number }>;
}

export interface CompatibilityResult {
  score: number;
  level: 'low' | 'medium' | 'high' | 'cosmic';
  summary: string;
  details?: {
    emotional: number;
    intellectual: number;
    physical: number;
    spiritual: number;
    communication: number;
  };
  advice?: string[];
}

export interface IceBreakerSuggestion {
  message: string;
  category: 'funny' | 'romantic' | 'astrology' | 'compliment' | 'question';
  confidence: number;
}

export interface CoachAdvice {
  situation: string;
  advice: string;
  tips: string[];
  astrologicalInsight?: string;
}

export interface MessageContext {
  conversationHistory: Array<{ role: 'user' | 'match'; content: string }>;
  matchProfile: {
    name: string;
    zodiacSign: string;
    interests: string[];
  };
  userIntent: 'flirt' | 'casual' | 'romantic' | 'friendly';
}
