import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CreditCard, Lock, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getStripe, STRIPE_PRICING } from '@/config/stripe';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { supabase } from '@/config/supabase';
import { toast } from 'react-hot-toast';

interface PaymentModalProps {
  tier: 'premium' | 'elite';
  billingPeriod: 'monthly' | 'yearly';
  onClose: () => void;
}

export function PaymentModal({ tier, billingPeriod, onClose }: PaymentModalProps) {
  const { profile } = useAuthStore();
  const { setTier } = useSubscriptionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [success, setSuccess] = useState(false);

  const pricing = STRIPE_PRICING[tier][billingPeriod];
  const amount = (pricing.amount / 100).toFixed(2).replace('.', ',') + '€';
  const savings = billingPeriod === 'yearly' ? '17%' : null;

  const handleStripeCheckout = async () => {
    if (!profile) {
      toast.error('Veuillez vous connecter');
      return;
    }

    setIsLoading(true);

    try {
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe non disponible');
      }

      // In production, this would call a backend API to create a Checkout Session
      // For now, we'll show a message about the demo mode
      const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;

      // Try to redirect to Stripe Checkout
      // This requires a backend to create the session, so we'll fall back to demo mode
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: pricing.priceId, quantity: 1 }],
        mode: 'subscription',
        successUrl: `${appUrl}/subscription?success=true`,
        cancelUrl: `${appUrl}/subscription?canceled=true`,
        customerEmail: profile.id ? undefined : undefined,
      });

      if (error) {
        // If Stripe checkout fails (likely due to invalid price IDs in dev),
        // offer demo mode
        console.warn('Stripe checkout error:', error.message);
        setIsDemoMode(true);
      }
    } catch (error: any) {
      console.warn('Payment error:', error.message);
      setIsDemoMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSubscription = async () => {
    if (!profile) return;

    setIsLoading(true);

    try {
      // Update subscription in database (demo mode)
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: profile.id,
          tier: tier === 'elite' ? 'elite' : 'premium',
          starts_at: new Date().toISOString(),
          billing_period: billingPeriod,
          amount_cents: pricing.amount,
          currency: 'eur',
        });

      if (error) throw error;

      // Update local state
      setTier(tier === 'elite' ? 'elite' : 'premium');
      setSuccess(true);
      toast.success(`Abonnement ${tier.toUpperCase()} activé !`);

      // Close modal after success animation
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      toast.error('Erreur lors de l\'activation');
      console.error('Demo subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="glass-effect rounded-large p-8 max-w-md w-full text-center"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <CheckCircle className="w-20 h-20 text-cosmic-green mx-auto mb-6" />
          </motion.div>
          <h3 className="text-2xl font-display font-bold mb-2">Bienvenue {tier.toUpperCase()} !</h3>
          <p className="text-white/60">Votre voyage cosmique commence maintenant</p>
          <Sparkles className="w-6 h-6 text-cosmic-gold mx-auto mt-4 animate-pulse" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass-effect rounded-large p-8 max-w-md w-full"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-display font-bold flex items-center gap-2">
            {tier === 'elite' ? (
              <span className="text-cosmic-gold">ELITE</span>
            ) : (
              <span className="text-cosmic-purple">PREMIUM</span>
            )}
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="mb-6 p-4 bg-white/5 rounded-medium border border-white/10">
          <div className="flex justify-between mb-2">
            <span className="text-white/60">Abonnement</span>
            <span className="font-bold">{tier.toUpperCase()}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-white/60">Période</span>
            <span className="flex items-center gap-2">
              {billingPeriod === 'monthly' ? 'Mensuel' : 'Annuel'}
              {savings && (
                <span className="text-xs bg-cosmic-green/20 text-cosmic-green px-2 py-0.5 rounded-full">
                  -{savings}
                </span>
              )}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-3 border-t border-white/10">
            <span>Total</span>
            <span className={tier === 'elite' ? 'text-cosmic-gold' : 'text-cosmic-purple'}>
              {amount}
              <span className="text-sm font-normal text-white/60">
                /{billingPeriod === 'monthly' ? 'mois' : 'an'}
              </span>
            </span>
          </div>
        </div>

        {/* Demo Mode Notice */}
        {isDemoMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-cosmic-gold/10 rounded-medium border border-cosmic-gold/20"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-cosmic-gold flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-cosmic-gold mb-1">Mode Démonstration</p>
                <p className="text-xs text-white/60">
                  Le paiement Stripe nécessite une configuration backend.
                  Cliquez ci-dessous pour activer l'abonnement en mode démo.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        {isDemoMode ? (
          <Button
            variant="primary"
            className={`w-full mb-3 ${tier === 'elite' ? 'bg-cosmic-gold hover:bg-cosmic-gold/90 text-cosmic-black' : ''}`}
            onClick={handleDemoSubscription}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                Activation...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Activer {tier.toUpperCase()} (Démo)
              </span>
            )}
          </Button>
        ) : (
          <Button
            variant="primary"
            className={`w-full mb-3 ${tier === 'elite' ? 'bg-cosmic-gold hover:bg-cosmic-gold/90 text-cosmic-black' : ''}`}
            onClick={handleStripeCheckout}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                Redirection vers Stripe...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payer {amount}
              </span>
            )}
          </Button>
        )}

        {/* Security Notice */}
        <div className="flex items-center justify-center gap-2 text-xs text-white/40">
          <Lock className="w-3 h-3" />
          <span>Paiement sécurisé par Stripe</span>
        </div>

        {/* Guarantee */}
        <p className="text-center text-xs text-white/40 mt-2">
          7 jours satisfait ou remboursé. Annulation à tout moment.
        </p>
      </motion.div>
    </motion.div>
  );
}
