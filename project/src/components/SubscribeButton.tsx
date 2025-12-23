import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SubscribeButtonProps {
  plan: 'premium' | 'premium-plus';
  price: string;
  className?: string;
  children?: React.ReactNode;
}

export default function SubscribeButton({ plan, price, className, children }: SubscribeButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      alert('Tu dois être connecté pour souscrire');
      return;
    }

    setLoading(true);

    try {
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error('Stripe non initialisé');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            plan,
            userId: user.id,
            type: 'subscription'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session');
      }

      const { sessionId } = await response.json();

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Erreur Stripe:', error);
        alert('Erreur lors du paiement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue. Réessaye dans quelques instants.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className={className || 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center'}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Chargement...
        </>
      ) : (
        children || (
          <>
            {plan === 'premium' ? '💎' : '👑'} Souscrire - {price}
          </>
        )
      )}
    </button>
  );
}
