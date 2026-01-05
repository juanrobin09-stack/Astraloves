import { Check, Lock, Crown, Sparkles } from 'lucide-react';

interface Feature {
  icon: string;
  text: string;
  locked?: boolean;
}

interface UniversModeProps {
  currentPlan?: 'gratuit' | 'premium' | 'elite';
  onUpgrade?: (planId: string) => void;
  dailyUsage?: {
    signals: number;
    astraMessages: number;
    matchMessages: number;
    starsViewed: number;
  };
}

export default function UniversMode({
  currentPlan = 'gratuit',
  onUpgrade,
  dailyUsage
}: UniversModeProps) {
  const plans = [
    {
      id: 'gratuit',
      name: 'Gratuit',
      price: '0€',
      icon: '🌙',
      color: 'slate',
      features: [
        { icon: '💫', text: '10 signaux cosmiques par jour' },
        { icon: '🤖', text: '10 messages Astra IA par jour' },
        { icon: '💬', text: '20 messages matchs par jour' },
        { icon: '🔮', text: 'Horoscope du jour basique' },
        { icon: '📷', text: '5 photos de profil max' },
        { icon: '📝', text: 'Bio 200 caractères max' },
        { icon: '⭐', text: 'Compatibilité cosmique basique' },
        { icon: '🌌', text: 'Vision limitée (15 étoiles)' },
        { icon: '❌', text: 'Pas de boost de visibilité', locked: true },
        { icon: '❌', text: 'Profils floutés dans l\'Univers', locked: true },
      ] as Feature[]
    },
    {
      id: 'premium',
      name: '💎 Premium',
      price: '9,99€',
      period: '/mois',
      badge: 'RECOMMANDÉ',
      color: 'pink',
      features: [
        { icon: '💫', text: 'Signaux cosmiques illimités' },
        { icon: '🌟', text: '1 Super Nova par jour' },
        { icon: '🤖', text: '40 messages Astra IA par jour' },
        { icon: '💬', text: 'Messages matchs illimités' },
        { icon: '👁️', text: 'Voir qui t\'a envoyé un signal' },
        { icon: '🌌', text: 'Vision étendue (50 étoiles)' },
        { icon: '🚀', text: 'Boost de visibilité x3' },
        { icon: '🎯', text: 'Matchs 92% compatibilité IA' },
        { icon: '💡', text: 'Conseils de profil par IA' },
        { icon: '💬', text: 'Ice-breakers générés par Astra' },
        { icon: '🔮', text: 'Horoscope avancé détaillé' },
        { icon: '📷', text: '10 photos de profil max' },
        { icon: '📝', text: 'Bio 500 caractères max' },
        { icon: '💎', text: 'Badge Premium visible' },
        { icon: '✨', text: 'Ton étoile brille 2x plus' },
      ] as Feature[]
    },
    {
      id: 'elite',
      name: '👑 Premium+ Elite',
      price: '14,99€',
      period: '/mois',
      color: 'yellow',
      badge: 'ULTIME',
      features: [
        { icon: '💫', text: 'Signaux cosmiques ILLIMITÉS' },
        { icon: '🌟', text: '5 Super Nova par jour' },
        { icon: '⚡', text: '65 messages Astra IA Ultra par jour' },
        { icon: '🤖', text: 'Coach IA Pro personnalisé' },
        { icon: '💬', text: 'Messages matchs illimités' },
        { icon: '👁️', text: 'Voir qui t\'a envoyé un signal + QUAND' },
        { icon: '🌌', text: 'Vision TOTALE de l\'univers (∞ étoiles)' },
        { icon: '👑', text: 'Badge Elite exclusif + Top 1%' },
        { icon: '📷', text: '20 photos de profil max' },
        { icon: '🔥', text: 'Bio illimitée' },
        { icon: '🚀', text: 'Boost Elite x10 de visibilité' },
        { icon: '💖', text: '10 super likes par jour' },
        { icon: '🔄', text: 'Rembobinage (revoir étoiles passées)' },
        { icon: '🔭', text: 'Filtres astro avancés (signe, ascendant, lune)' },
        { icon: '🎭', text: 'Mode incognito premium' },
        { icon: '👁️', text: 'Voir qui a visité ton profil' },
        { icon: '🌌', text: 'Thème astral complet détaillé' },
        { icon: '🔮', text: 'Compatibilité cosmique avancée' },
        { icon: '✨', text: 'Aura dorée animée sur ton étoile' },
        { icon: '🌠', text: 'Effet étoile filante (priorité)' },
        { icon: '📝', text: 'Astra écrit tes premiers messages' },
      ] as Feature[]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, any> = {
      slate: {
        border: 'border-slate-600',
        button: 'bg-slate-600 hover:bg-slate-500',
        glow: ''
      },
      pink: {
        border: 'border-pink-500',
        button: 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600',
        glow: 'shadow-[0_0_30px_rgba(244,114,182,0.4)]'
      },
      yellow: {
        border: 'border-yellow-500',
        button: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
        glow: 'shadow-[0_0_40px_rgba(250,204,21,0.5)]'
      }
    };
    return colors[color];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900 pb-24">
      {/* Header */}
      <div className="text-center pt-8 pb-6 px-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
          <h1 className="text-3xl font-bold text-white">
            Déverrouillez l'Univers
          </h1>
          <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
        </div>
        <p className="text-slate-400 text-sm">
          Trouvez votre âme sœur cosmique avec les bons outils
        </p>
      </div>

      {/* Stats aujourd'hui (si gratuit) */}
      {currentPlan === 'gratuit' && dailyUsage && (
        <div className="px-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700">
            <p className="text-slate-300 text-sm mb-3 font-medium">📊 Aujourd'hui :</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-xl font-bold text-pink-400">{dailyUsage.signals}/10</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Signaux</div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-400">{dailyUsage.astraMessages}/10</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Astra IA</div>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-400">{dailyUsage.matchMessages}/20</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Messages</div>
              </div>
              <div>
                <div className="text-xl font-bold text-orange-400">{dailyUsage.starsViewed}/15</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Étoiles</div>
              </div>
            </div>
            <div className="mt-3 text-center text-xs text-orange-400">
              ⏰ Recharge à minuit
            </div>
          </div>
        </div>
      )}

      {/* Cartes des plans */}
      <div className="px-4 space-y-4 max-w-2xl mx-auto">
        {plans.map((plan) => {
          const isActive = currentPlan === plan.id;
          const colors = getColorClasses(plan.color);

          return (
            <div
              key={plan.id}
              className={`relative bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                isActive ? colors.border : 'border-slate-700'
              } ${colors.glow}`}
            >
              {/* Badge "Recommandé" ou "Ultime" */}
              {plan.badge && (
                <div className={`absolute top-0 right-0 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10 ${
                  plan.color === 'pink'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                }`}>
                  ⭐ {plan.badge}
                </div>
              )}

              {/* Badge "Abonnement actif" */}
              {isActive && (
                <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-br-xl flex items-center gap-1 z-10">
                  <Check className="w-3 h-3" /> ABONNEMENT ACTIF
                </div>
              )}

              <div className="p-4">
                {/* En-tête du plan */}
                <div className="flex items-center justify-between mb-4 mt-2">
                  <div>
                    <h3 className="text-white font-bold text-xl">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-bold text-white">{plan.price}</span>
                      {plan.period && (
                        <span className="text-slate-400 text-sm">{plan.period}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-4xl">{plan.icon}</div>
                </div>

                {/* Liste des features - SCROLLABLE si beaucoup */}
                <div className={`space-y-2 mb-4 ${
                  plan.features.length > 10 ? 'max-h-[280px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50' : ''
                }`}>
                  {plan.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <span className="text-base flex-shrink-0 mt-0.5">{feature.icon}</span>
                      <span className={`flex-1 leading-relaxed ${
                        feature.locked ? 'text-slate-500 line-through' : 'text-slate-200'
                      }`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bouton CTA */}
                {!isActive && (
                  <button
                    onClick={() => onUpgrade && onUpgrade(plan.id)}
                    className={`w-full py-3.5 rounded-xl font-bold text-white transition-all active:scale-95 ${colors.button}`}
                  >
                    {plan.id === 'gratuit' ? 'Rester en Gratuit' : `Choisir ${plan.name.replace(/[💎👑]/g, '').trim()}`}
                  </button>
                )}

                {isActive && plan.id !== 'gratuit' && (
                  <button className="w-full py-3 rounded-xl font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 transition-all">
                    Abonnement en cours
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer légal */}
      <div className="px-4 mt-8 text-center max-w-md mx-auto">
        <p className="text-xs text-slate-500 leading-relaxed">
          Les abonnements sont renouvelés automatiquement.<br/>
          Annulation possible à tout moment dans les réglages.<br/>
          Paiement sécurisé via Stripe.
        </p>
      </div>
    </div>
  );
}
