import { useState } from 'react';
import { Sparkles, Crown, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { PlanId } from '../../types/subscription';

interface UpgradeButtonProps {
  targetPlan: PlanId;
  variant?: 'primary' | 'gold' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function UpgradeButton({
  targetPlan,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
}: UpgradeButtonProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            plan: targetPlan === 'premium_elite' ? 'premium_elite' : 'premium',
            userId: user.id,
            successUrl: `${window.location.origin}/payment-success`,
            cancelUrl: `${window.location.origin}/premium`,
          }),
        }
      );

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.sessionId) {
        const stripe = await import('@stripe/stripe-js').then(m =>
          m.loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
        );
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId: data.sessionId });
        }
      }
    } catch (error) {
      console.error('Upgrade error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'py-2 px-3 text-sm gap-1.5',
    md: 'py-3 px-4 text-base gap-2',
    lg: 'py-4 px-6 text-lg gap-2.5',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25',
    gold: 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black shadow-lg shadow-amber-500/25',
    outline: 'border-2 border-red-500 text-red-400 hover:bg-red-500/10',
    ghost: 'text-red-400 hover:bg-red-500/10',
  };

  const Icon = targetPlan === 'premium_elite' ? Crown : Sparkles;

  return (
    <button
      onClick={handleUpgrade}
      disabled={isLoading}
      className={`
        inline-flex items-center justify-center font-semibold rounded-xl
        transition-all duration-200 active:scale-95 disabled:opacity-70
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <Icon className="w-5 h-5" />
          <span>
            {children || (targetPlan === 'premium_elite' ? 'Passer Elite' : 'Passer Premium')}
          </span>
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}

export function QuickUpgradeButton({ className = '' }: { className?: string }) {
  return (
    <UpgradeButton
      targetPlan="premium"
      variant="gold"
      size="sm"
      className={className}
    >
      Upgrade
    </UpgradeButton>
  );
}
