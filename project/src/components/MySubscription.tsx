import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Crown, Sparkles, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MySubscriptionProps {
  userId: string;
  onNavigate?: (page: string) => void;
  onBack?: () => void;
}

type PlanType = 'free' | 'premium' | 'premium_elite';

export default function MySubscription({ userId, onNavigate, onBack }: MySubscriptionProps) {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<PlanType>('free');
  const [loading, setLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    // Cleanup: débloquer le scroll au montage du composant
    document.body.classList.remove('modal-open');
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';

    // Force scroll reset
    window.scrollTo(0, 0);

    loadCurrentPlan();

    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [userId]);

  const loadCurrentPlan = async () => {
    if (!userId) {
      console.error('No userId provided to MySubscription');
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('astra_profiles')
        .select('premium_tier')
        .eq('id', userId)
        .maybeSingle();

      if (data?.premium_tier) {
        setCurrentPlan(data.premium_tier as PlanType);
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
            userId: user.id,
          }),
        }
      );

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      setLoading(false);
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  if (loading) {
    return (
      <div className="bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const plans = [
    {
      id: 'free',
      name: 'Gratuit',
      price: '0€',
      emoji: '🆓',
      borderColor: 'border-gray-700',
      bgGradient: 'from-gray-900/90 to-black',
      buttonClass: 'bg-gray-700 cursor-not-allowed',
      features: [
        '💫 10 signaux cosmiques par jour',
        '🤖 10 messages Astra IA par jour',
        '💬 20 messages matchs par jour',
        '🔮 Horoscope du jour basique',
        '📷 5 photos de profil max',
        '📝 Bio 200 caractères max',
        '⭐ Compatibilité cosmique basique',
        '🌌 Vision limitée (15 étoiles)',
        '❌ Pas de boost de visibilité',
        '❌ Profils floutés dans l\'Univers',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '9,99€/mois',
      emoji: '💎',
      borderColor: 'border-red-600',
      bgGradient: 'from-red-900/20 to-black',
      buttonClass: 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700',
      features: [
        '💫 Signaux cosmiques illimités',
        '🌟 1 Super Nova par jour',
        '🤖 40 messages Astra IA par jour',
        '💬 Messages matchs illimités',
        '👁️ Voir qui t\'a envoyé un signal',
        '🌌 Vision étendue (50 étoiles)',
        '🚀 Boost de visibilité x3',
        '🎯 Matchs 92% compatibilité IA',
        '💡 Conseils de profil par IA',
        '💬 Ice-breakers générés par Astra',
        '🔮 Horoscope avancé détaillé',
        '📷 10 photos de profil max',
        '📝 Bio 500 caractères max',
        '💎 Badge Premium visible',
        '✨ Ton étoile brille 2x plus',
      ],
    },
    {
      id: 'premium_elite',
      name: 'Premium+ Elite',
      price: '14,99€/mois',
      emoji: '👑',
      borderColor: 'border-yellow-500',
      bgGradient: 'from-yellow-900/20 to-black',
      buttonClass: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold',
      features: [
        '💫 Signaux cosmiques ILLIMITÉS',
        '🌟 5 Super Nova par jour',
        '⚡ 65 messages Astra IA Ultra par jour',
        '🤖 Coach IA Pro personnalisé',
        '💬 Messages matchs illimités',
        '👁️ Voir qui t\'a envoyé un signal + QUAND',
        '🌌 Vision TOTALE de l\'univers (∞ étoiles)',
        '👑 Badge Elite exclusif + Top 1%',
        '📷 20 photos de profil max',
        '🔥 Bio illimitée',
        '🚀 Boost Elite x10 de visibilité',
        '💖 10 super likes par jour',
        '🔄 Rembobinage (revoir étoiles passées)',
        '🔭 Filtres astro avancés (signe, ascendant, lune)',
        '🎭 Mode incognito premium',
        '👁️ Voir qui a visité ton profil',
        '🌌 Thème astral complet détaillé',
        '🔮 Compatibilité cosmique avancée',
        '✨ Aura dorée animée sur ton étoile',
        '🌠 Effet étoile filante (priorité)',
        '📝 Astra écrit tes premiers messages',
      ],
    },
  ];

  const faqs = [
    {
      question: 'Puis-je annuler à tout moment ?',
      answer: 'Oui, ton abonnement est sans engagement. Tu peux l\'annuler quand tu veux.',
    },
    {
      question: 'Les paiements sont-ils sécurisés ?',
      answer: 'Oui, tous les paiements sont traités de manière sécurisée par Stripe, leader mondial du paiement en ligne.',
    },
  ];

  return (
    <div className="min-h-screen bg-black pb-32 overflow-y-auto">
      <div className="px-4 py-8 pb-32">
        <button
          onClick={onBack}
          className="mb-6 text-white/80 hover:text-white flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Zap className="w-10 h-10 text-yellow-500" />
              Débloquer tout le potentiel d'Astra
            </h1>
            <p className="text-xl text-gray-400">Choisis l'abonnement qui te correspond</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {plans.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              const canUpgrade =
                (plan.id === 'premium' && currentPlan === 'free') ||
                (plan.id === 'premium_elite' && (currentPlan === 'free' || currentPlan === 'premium'));

              return (
                <div
                  key={plan.id}
                  className={`relative bg-gradient-to-br ${plan.bgGradient} backdrop-blur-xl rounded-3xl p-8 border-2 ${plan.borderColor} transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                >
                  {plan.id === 'premium_elite' && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Recommandé
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">{plan.emoji}</div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-white mb-1">{plan.price}</div>
                  </div>

                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-gray-300">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {isCurrent ? (
                    <div>
                      <button
                        disabled
                        className="w-full py-4 px-6 rounded-xl bg-gray-700 cursor-not-allowed text-white font-semibold text-lg mb-3"
                      >
                        Abonnement actif
                      </button>
                      <div className="text-center text-green-500 text-sm font-semibold flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        Abonnement en cours
                      </div>
                    </div>
                  ) : canUpgrade ? (
                    <button
                      onClick={() => handleSubscribe(plan.id as 'premium' | 'premium_elite')}
                      disabled={loading}
                      className={`w-full py-4 px-6 rounded-xl ${plan.buttonClass} text-white font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loading ? 'Chargement...' : `Choisir ${plan.name}`}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-4 px-6 rounded-xl bg-gray-800 cursor-not-allowed text-gray-500 font-semibold text-lg"
                    >
                      Non disponible
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="max-w-3xl mx-auto bg-gradient-to-br from-gray-900/90 to-black backdrop-blur-xl rounded-3xl p-8 border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">❓</span>
              Questions fréquentes
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-gray-800/50 rounded-xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800/70 transition-colors"
                  >
                    <span className="text-white font-semibold">{faq.question}</span>
                    {expandedFaq === idx ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12 text-gray-500 text-sm">
            <p>En souscrivant, tu acceptes nos conditions générales de vente.</p>
            <p className="mt-2">Tous les prix sont en euros TTC.</p>
          </div>
        </div>
      </div>
    </div>
  );
}