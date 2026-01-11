// ═══════════════════════════════════════════════════════════════════════
// SUBSCRIPTION TYPES
// ═══════════════════════════════════════════════════════════════════════

export type SubscriptionTier = 'free' | 'premium' | 'elite';

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  tagline: string;
  price: number;
  priceDisplay: string;
  period: 'month' | 'year';
  recommended?: boolean;
  badge?: string;
  features: SubscriptionFeature[];
}

export interface SubscriptionFeature {
  id: string;
  category: FeatureCategory;
  title: string;
  description: string;
  included: boolean;
  limited?: string;
  highlight?: boolean;
}

export type FeatureCategory = 
  | 'univers'
  | 'astra'
  | 'astro'
  | 'questionnaires'
  | 'visibility'
  | 'guardian'
  | 'effects';

export interface UserSubscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'expired' | 'trial';
  startDate: Date;
  endDate?: Date;
  nextBillingDate?: Date;
  autoRenew: boolean;
  paymentMethod?: string;
  trialEndsAt?: Date;
  canceledAt?: Date;
}
