// ═══════════════════════════════════════════════════════════════════════
// STRIPE CONFIG
// ═══════════════════════════════════════════════════════════════════════

import { loadStripe, Stripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

export const isStripeConfigured = !!stripePublishableKey;

if (!isStripeConfigured) {
  console.warn('⚠️ Stripe non configuré. Ajoutez VITE_STRIPE_PUBLISHABLE_KEY dans .env.local pour activer les paiements');
}

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!isStripeConfigured) {
    return Promise.resolve(null);
  }
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

export const STRIPE_PRICING = {
  premium: {
    monthly: { priceId: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly', amount: 999 },
    yearly: { priceId: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID || 'price_premium_yearly', amount: 9990 },
  },
  elite: {
    monthly: { priceId: import.meta.env.VITE_STRIPE_ELITE_PRICE_ID || 'price_elite_monthly', amount: 1499 },
    yearly: { priceId: import.meta.env.VITE_STRIPE_ELITE_PRICE_ID || 'price_elite_yearly', amount: 14990 },
  },
};
