/**
 * Wrapper for Stripe API calls that shouldn't block the app
 * Stripe is optional in development mode
 */
export async function safeStripeCall<T>(
  fn: () => Promise<T>,
  fallback: T,
  context: string = 'Stripe'
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.warn(`[${context}] Error (non-blocking):`, error);

    // In dev mode, continue without Stripe
    if (import.meta.env.DEV) {
      console.log(`[${context}] ℹ️ Continuing without ${context} in development mode`);
      return fallback;
    }

    // In production, still throw
    throw error;
  }
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!(
    import.meta.env.VITE_STRIPE_PUBLIC_KEY &&
    import.meta.env.VITE_SUPABASE_URL
  );
}

/**
 * Safe wrapper specifically for Stripe webhook operations
 */
export async function safeWebhookCall<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  return safeStripeCall(fn, fallback, 'StripeWebhook');
}

/**
 * Safe wrapper specifically for Stripe product operations
 */
export async function safeProductCall<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  return safeStripeCall(fn, fallback, 'StripeProducts');
}
