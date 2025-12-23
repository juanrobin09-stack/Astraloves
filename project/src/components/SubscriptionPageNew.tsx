import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Sparkles, Crown, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Starfield from './Starfield';

type SubscriptionTier = 'free' | 'premium' | 'premium_elite';

interface SubscriptionPageNewProps {
  onBack: () => void;
}

interface OfferCardProps {
  title: string;
  emoji: string;
  price: string;
  features: string[];
  tier: SubscriptionTier;
  userTier: SubscriptionTier;
  onSubscribe: () => void;
}

const OfferCard = ({ title, emoji, price, features, tier, userTier, onSubscribe }: OfferCardProps) => {
  const isCurrent = tier === userTier;
  const canUpgrade =
    (tier === 'premium' && userTier === 'free') ||
    (tier === 'premium_elite' && (userTier === 'free' || userTier === 'premium'));

  const getButtonText = () => {
    if (isCurrent) return 'Abonnement actif';
    if (tier === 'premium_elite' && userTier === 'premium') return 'Passer Premium+ Elite 👑';
    return `Choisir ${title}`;
  };

  const getBorderStyle = () => {
    if (tier === 'premium_elite') return 'border-yellow-500';
    if (tier === 'premium') return 'border-red-600';
    return 'border-gray-700';
  };

  const getButtonStyle = () => {
    if (isCurrent) return 'bg-gray-700 cursor-not-allowed';
    if (tier === 'premium_elite') return 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold';
    if (tier === 'premium') return 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700';
    return 'bg-gray-800 hover:bg-gray-700';
  };

  return (
    <div className={`relative bg-gradient-to-br ${
      tier === 'premium_elite'
        ? 'from-gray-900/95 via-purple-900/30 to-gray-900/95'
        : tier === 'premium'
        ? 'from-gray-900/95 via-red-900/20 to-gray-900/95'
        : 'from-gray-900/90 to-black/90'
    } backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 ${getBorderStyle()} transition-transform sm:hover:scale-105 ${isCurrent ? 'opacity-70' : ''} shadow-lg`}>

      <div className="text-center mb-4 sm:mb-6">
        <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">{emoji}</div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">{title}</h3>
        <div className="flex items-center justify-center gap-2">
          <span className={`text-2xl sm:text-3xl font-extrabold ${
            tier === 'premium_elite' ? 'text-yellow-400' : tier === 'premium' ? 'text-red-400' : 'text-gray-300'
          }`}>
            {price}
          </span>
        </div>
      </div>

      <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 overflow-visible">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-gray-300">
            <Check className={`flex-shrink-0 mt-0.5 ${
              tier === 'premium_elite' ? 'text-yellow-400' : tier === 'premium' ? 'text-red-400' : 'text-gray-500'
            }`} size={16} />
            <span className="leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSubscribe}
        disabled={isCurrent}
        className={`w-full py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base text-white font-bold transition ${getButtonStyle()}`}
      >
        {getButtonText()}
      </button>

      {isCurrent && (
        <div className="mt-2 sm:mt-3 text-center text-xs text-green-400 font-medium">
          ✓ Abonnement en cours
        </div>
      )}
    </div>
  );
};

export default function SubscriptionPageNew({ onBack }: SubscriptionPageNewProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userTier, setUserTier] = useState<SubscriptionTier>('free');

  useEffect(() => {
    // Débloquer le scroll au montage du composant
    document.body.classList.remove('modal-open');
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';

    // Force scroll reset
    window.scrollTo(0, 0);

    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, []);

  useEffect(() => {
    const fetchUserSubscription = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('astra_profiles')
        .select('premium_tier')
        .eq('id', user.id)
        .single();

      if (data?.premium_tier) {
        setUserTier(data.premium_tier as SubscriptionTier);
      }
    };

    fetchUserSubscription();
  }, [user]);

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (!user || loading) return;

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
            plan: tier === 'premium' ? 'premium' : 'premium_elite',
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

  const freeFeatures = [
    '💫 10 signaux cosmiques par jour',
    '🤖 10 messages Astra IA par jour',
    '💬 20 messages matchs par jour',
    '🔮 Horoscope du jour basique',
    '📷 5 photos de profil max',
    '📝 Bio 200 caractères max',
    '⭐ Compatibilité cosmique basique',
    '🌌 Vision limitée (15 étoiles)',
    '❌ Pas de boost de visibilité',
    '❌ Profils floutés dans l\'Univers'
  ];

  const premiumFeatures = [
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
    '✨ Ton étoile brille 2x plus'
  ];

  const eliteFeatures = [
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
    '📝 Astra écrit tes premiers messages'
  ];

  return (
    <div className="min-h-screen bg-black relative">
      <div className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.6 }}>
        <Starfield />
      </div>

      <div className="sticky top-0 z-10 bg-gradient-to-r from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-sm border-b border-red-900/30"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}
      >
        <div className="px-3 py-3 sm:px-4 sm:py-4 flex items-center gap-3 shadow-lg">
          <button
            onClick={onBack}
            className="flex items-center gap-2 p-2 hover:bg-gray-800/50 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline font-medium text-sm">Retour</span>
          </button>
          <h1 className="text-white font-bold text-lg sm:text-xl flex items-center gap-2">
            <Crown className="text-yellow-400" size={22} />
            Abonnements
          </h1>
        </div>
      </div>

      <div className="relative z-10"
        style={{
          paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))'
        }}
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">

        {userTier === 'free' && (
          <div className="bg-gradient-to-r from-red-900/30 to-purple-900/30 border border-red-600/50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center mb-4 sm:mb-6 shadow-lg">
            <Zap className="mx-auto text-yellow-400 mb-2" size={28} />
            <p className="text-white font-bold text-sm sm:text-base mb-1">Débloquer tout le potentiel d'Astral</p>
            <p className="text-gray-300 text-xs sm:text-sm">Choisis l'abonnement qui te correspond</p>
          </div>
        )}

        {userTier === 'premium' && (
          <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-600/50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center mb-4 sm:mb-6 shadow-lg">
            <Crown className="mx-auto text-yellow-400 mb-2" size={28} />
            <p className="text-white font-bold text-sm sm:text-base mb-1">Tu es Premium 💎</p>
            <p className="text-gray-300 text-xs sm:text-sm">Passe Premium+ Elite pour une expérience ultime</p>
          </div>
        )}

        {userTier === 'premium_elite' && (
          <div className="bg-gradient-to-r from-yellow-900/30 to-purple-900/30 border border-yellow-500 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center mb-4 sm:mb-6 shadow-lg">
            <Crown className="mx-auto text-yellow-400 mb-2" size={28} />
            <p className="text-white font-bold text-sm sm:text-base mb-1">Tu es Premium+ Elite 👑</p>
            <p className="text-gray-300 text-xs sm:text-sm">Tu as le meilleur abonnement ! Profite de tous les avantages exclusifs</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <OfferCard
            title="Gratuit"
            emoji="🆓"
            price="0€"
            features={freeFeatures}
            tier="free"
            userTier={userTier}
            onSubscribe={() => {}}
          />

          <OfferCard
            title="Premium"
            emoji="💎"
            price="9,99€/mois"
            features={premiumFeatures}
            tier="premium"
            userTier={userTier}
            onSubscribe={() => handleSubscribe('premium')}
          />

          <OfferCard
            title="Premium+ Elite"
            emoji="👑"
            price="14,99€/mois"
            features={eliteFeatures}
            tier="premium_elite"
            userTier={userTier}
            onSubscribe={() => handleSubscribe('premium_elite')}
          />
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-800 shadow-lg">
          <h3 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">❓ Questions fréquentes</h3>
          <div className="space-y-3 text-xs sm:text-sm text-gray-300">
            <div>
              <p className="font-bold text-white mb-1">Puis-je annuler à tout moment ?</p>
              <p>Oui, ton abonnement est sans engagement. Tu peux l'annuler quand tu veux.</p>
            </div>

            <div>
              <p className="font-bold text-white mb-1">Les paiements sont-ils sécurisés ?</p>
              <p>Oui, tous les paiements sont traités de manière sécurisée par Stripe, leader mondial du paiement en ligne.</p>
            </div>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
}
