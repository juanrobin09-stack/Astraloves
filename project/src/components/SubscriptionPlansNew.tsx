import { useState, useEffect } from 'react';
import { Crown, Check, Sparkles, ArrowLeft, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionPlansNewProps {
  onBack?: () => void;
  onNavigate?: (page: string) => void;
}

export default function SubscriptionPlansNew({ onBack, onNavigate }: SubscriptionPlansNewProps) {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<'free' | 'premium' | 'premium_elite'>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentPlan();
  }, [user]);

  const loadCurrentPlan = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('astra_profiles')
        .select('premium_tier')
        .eq('id', user.id)
        .maybeSingle();

      if (data?.premium_tier) {
        setCurrentPlan(data.premium_tier);
      }
    } catch (error) {
      console.error('Error loading plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: 'premium' | 'premium_elite') => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            plan: plan,
            type: 'subscription',
            userId: user.id,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        console.error('Checkout error:', data.error);
        alert('Erreur lors de la création de la session de paiement');
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Erreur lors de la création de la session de paiement');
      setLoading(false);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Gratuit',
      price: 0,
      priceLabel: 'Gratuit',
      gradient: 'from-gray-600 to-gray-800',
      badge: null,
      features: [
        { icon: '💫', text: '10 signaux cosmiques par jour' },
        { icon: '🤖', text: '10 messages Astra IA par jour' },
        { icon: '💬', text: '20 messages matchs par jour' },
        { icon: '🔮', text: 'Horoscope du jour basique' },
        { icon: '📷', text: '5 photos de profil max' },
        { icon: '📝', text: 'Bio 200 caractères max' },
        { icon: '⭐', text: 'Compatibilité astrologique basique' },
        { icon: '❌', text: 'Pas de boost de visibilité' }
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 9.99,
      priceLabel: '9,99€',
      gradient: 'from-pink-600 via-rose-600 to-purple-600',
      badge: '💎',
      features: [
        { icon: '♾️', text: 'Signaux cosmiques illimités' },
        { icon: '💬', text: '40 messages Astra IA par jour' },
        { icon: '📱', text: 'Messages matchs illimités' },
        { icon: '🚀', text: 'Boost de visibilité x3' },
        { icon: '🎯', text: 'Matchs 92% compatibilité IA' },
        { icon: '💡', text: 'Conseils de profil par IA' },
        { icon: '🔮', text: 'Horoscope avancé détaillé' },
        { icon: '📸', text: '10 photos de profil max' },
        { icon: '✍️', text: 'Bio 500 caractères max' },
        { icon: '💎', text: 'Badge Premium visible' }
      ]
    },
    {
      id: 'premium_elite',
      name: 'Premium+ Elite',
      price: 14.99,
      priceLabel: '14,99€',
      gradient: 'from-yellow-400 via-orange-500 to-pink-500',
      badge: '👑',
      features: [
        { icon: '♾️', text: 'Signaux cosmiques illimités' },
        { icon: '⚡', text: '65 messages Astra IA Ultra par jour' },
        { icon: '🤖', text: 'Coach IA Pro personnalisé' },
        { icon: '👑', text: 'Badge Elite exclusif + Top 1%' },
        { icon: '📸', text: '20 photos de profil max' },
        { icon: '✍️', text: 'Bio illimitée' },
        { icon: '🔥', text: 'Boost Elite x10 de visibilité' },
        { icon: '💕', text: '10 super likes par jour' },
        { icon: '🔮', text: 'Filtres astro avancés complets' },
        { icon: '🕶️', text: 'Mode incognito premium' },
        { icon: '👀', text: 'Voir qui a visité ton profil' },
        { icon: '🌌', text: 'Thème astral complet détaillé' },
        { icon: '💫', text: 'Compatibilité cosmique avancée' }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-black pb-32">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 text-white/80 hover:text-white flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
        )}

        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
            <Crown className="w-8 h-8 text-yellow-500" />
            Choisissez votre plan
          </h1>
          <p className="text-gray-400 text-lg">
            Débloquez tout le potentiel de l'astrologie
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-gradient-to-br ${plan.gradient} rounded-2xl p-6 shadow-2xl ${
                currentPlan === plan.id ? 'ring-4 ring-white' : ''
              }`}
            >
              {currentPlan === plan.id && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white font-bold px-4 py-1 rounded-full text-sm shadow-lg flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Abonnement actif
                </div>
              )}

              <div className="text-center mb-6">
                {plan.badge && (
                  <div className="text-5xl mb-3">{plan.badge}</div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold text-white">
                    {plan.price === 0 ? 'Gratuit' : `${plan.priceLabel}`}
                  </span>
                </div>
                {plan.price > 0 && (
                  <p className="text-white/80 text-sm mt-1">/mois</p>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 text-white"
                  >
                    <span className="text-xl flex-shrink-0">{feature.icon}</span>
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  if (plan.id === 'free') return;
                  handleSubscribe(plan.id as 'premium' | 'premium_elite');
                }}
                disabled={currentPlan === plan.id || plan.id === 'free'}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                  currentPlan === plan.id
                    ? 'bg-green-500 text-white cursor-default'
                    : plan.id === 'free'
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-gray-100 hover:scale-105'
                }`}
              >
                {currentPlan === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    Plan actuel
                  </span>
                ) : plan.id === 'free' ? (
                  'Gratuit'
                ) : plan.id === 'premium_elite' ? (
                  'Devenir Elite'
                ) : (
                  'Passer à Premium'
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-gray-900/90 to-black border border-red-600/20 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" fill="currentColor" />
            Comparaison des plans
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-4 text-gray-400 font-medium">Fonctionnalité</th>
                  <th className="py-3 px-4 text-center text-gray-400 font-medium">Gratuit</th>
                  <th className="py-3 px-4 text-center text-gray-400 font-medium">Premium</th>
                  <th className="py-3 px-4 text-center text-gray-400 font-medium">Elite</th>
                </tr>
              </thead>
              <tbody className="text-white">
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4">Signaux cosmiques</td>
                  <td className="py-3 px-4 text-center">10/jour</td>
                  <td className="py-3 px-4 text-center">∞</td>
                  <td className="py-3 px-4 text-center">∞</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4">Messages Astra</td>
                  <td className="py-3 px-4 text-center">10/jour</td>
                  <td className="py-3 px-4 text-center">40/jour</td>
                  <td className="py-3 px-4 text-center">65/jour</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4">Photos</td>
                  <td className="py-3 px-4 text-center">5</td>
                  <td className="py-3 px-4 text-center">10</td>
                  <td className="py-3 px-4 text-center">20</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4">Bio</td>
                  <td className="py-3 px-4 text-center">200 car.</td>
                  <td className="py-3 px-4 text-center">500 car.</td>
                  <td className="py-3 px-4 text-center">∞</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4">Astro</td>
                  <td className="py-3 px-4 text-center">Du jour</td>
                  <td className="py-3 px-4 text-center">Avancée</td>
                  <td className="py-3 px-4 text-center">Elite</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4">Badge</td>
                  <td className="py-3 px-4 text-center">-</td>
                  <td className="py-3 px-4 text-center">💎</td>
                  <td className="py-3 px-4 text-center">👑</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4">Boost</td>
                  <td className="py-3 px-4 text-center">-</td>
                  <td className="py-3 px-4 text-center">x3</td>
                  <td className="py-3 px-4 text-center">x10</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
