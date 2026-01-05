/**
 * Stripe Configuration
 * Gère l'activation/désactivation de Stripe de manière centralisée
 *
 * SÉCURITÉ: Seule la clé publique est accessible côté client
 * La clé secrète est utilisée uniquement dans les Edge Functions
 */

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';

/**
 * Vérifie si Stripe est correctement configuré
 */
export function isStripeEnabled(): boolean {
  const hasValidPublicKey = STRIPE_PUBLIC_KEY.startsWith('pk_live_') || STRIPE_PUBLIC_KEY.startsWith('pk_test_');
  return hasValidPublicKey;
}

/**
 * Wrapper sécurisé pour les appels Stripe
 */
export async function safeStripeCall<T>(
  fn: () => Promise<T>,
  fallback: T,
  operationName: string = 'Stripe operation'
): Promise<T> {
  if (!isStripeEnabled()) {
    return fallback;
  }

  try {
    return await fn();
  } catch (error: any) {
    if (error?.message?.includes('Invalid API Key')) {
      return fallback;
    }

    if (import.meta.env.DEV) {
      return fallback;
    }

    throw error;
  }
}

/**
 * Obtient la clé publique Stripe (pour le client)
 */
export function getStripePublicKey(): string | null {
  return isStripeEnabled() ? STRIPE_PUBLIC_KEY : null;
}
