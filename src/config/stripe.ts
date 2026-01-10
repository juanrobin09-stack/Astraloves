// ═══════════════════════════════════════════════════════════════════════
// STRIPE CONFIG
// ═══════════════════════════════════════════════════════════════════════

import { loadStripe, Stripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error('Missing Stripe publishable key');
}

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

export const STRIPE_PRICING = {
  premium: {
    monthly: { priceId: 'price_premium_monthly', amount: 999 },
    yearly: { priceId: 'price_premium_yearly', amount: 9990 },
  },
  elite: {
    monthly: { priceId: 'price_elite_monthly', amount: 1499 },
    yearly: { priceId: 'price_elite_yearly', amount: 14990 },
  },
};
