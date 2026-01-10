import { Check, Crown, Sparkles } from 'lucide-react';
import SubscribeButton from './SubscribeButton';

export default function PremiumPlansPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-black text-white pb-24 overflow-y-auto overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <button onClick={onBack} className="mb-8 text-gray-400 hover:text-white transition-colors">
          ← Retour
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-500 via-pink-500 to-yellow-500 bg-clip-text text-transparent">
            Deviens une Légende d'Astra
          </h1>
          <p className="text-gray-400 text-lg mb-6">Choisis le plan qui te correspond</p>
          <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/40 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-red-400" />
            <span className="text-red-400 font-semibold text-sm">Économise jusqu'à 33% avec un abonnement annuel</span>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Plans Premium 💎</h2>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">

            {/* Plan 1 mois */}
            <div className="bg-gradient-to-br from-red-900/20 to-pink-900/20 border-2 border-red-600/50 rounded-3xl p-6 md:p-8 hover:border-red-500 transition-colors">
              <h3 className="text-2xl md:text-3xl font-bold mb-2 text-white">Premium</h3>
              <div className="mb-4">
                <div className="text-4xl md:text-5xl font-bold text-white">9.99€</div>
                <p className="text-gray-400 text-sm">par mois</p>
              </div>
              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-2 text-white text-sm">
                  <Check className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>Swipes illimités</span>
                </div>
                <div className="flex items-center gap-2 text-white text-sm">
                  <Check className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>Super likes illimités</span>
                </div>
                <div className="flex items-center gap-2 text-white text-sm">
                  <Check className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>Voir qui t'a liké</span>
                </div>
                <div className="flex items-center gap-2 text-white text-sm">
                  <Check className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>Horoscope détaillé</span>
                </div>
                <div className="flex items-center gap-2 text-white text-sm">
                  <Check className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>Boost de profil</span>
                </div>
                <div className="flex items-center gap-2 text-white text-sm">
                  <Check className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>Badge Premium visible</span>
                </div>
              </div>
              <SubscribeButton plan="premium" price="9.99€" />
            </div>

            {/* Plan 6 mois - RECOMMANDÉ */}
            <div className="bg-gradient-to-br from-red-900/30 to-pink-900/30 border-2 border-red-500 rounded-3xl p-6 md:p-8 relative md:transform md:scale-105 shadow-2xl shadow-red-500/20">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                  RECOMMANDÉ
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2 text-white">Premium 6 mois</h3>
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl md:text-5xl font-bold text-white">49.99€</div>
                  <div className="text-lg line-through text-gray-500">59.94€</div>
                </div>
                <p className="text-red-400 text-sm font-bold">8.33€/mois - Économise 17%</p>
              </div>
              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-2 text-white text-sm">
                  <Check className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>Tout du plan mensuel</span>
                </div>
                <div className="flex items-center gap-2 text-white text-sm">
                  <Check className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>6 mois d'accès premium</span>
                </div>
                <div className="flex items-center gap-2 text-white text-sm">
                  <Check className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>Économise 10€</span>
                </div>
                <div className="flex items-center gap-2 text-white text-sm font-semibold">
                  <Check className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>Meilleur rapport qualité/prix</span>
                </div>
              </div>
              <SubscribeButton plan="premium" price="49.99€" />
            </div>

            {/* Plan 12 mois - MEILLEURE ÉCONOMIE */}
            <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-2 border-yellow-600/50 rounded-3xl p-6 md:p-8 hover:border-yellow-500 transition-colors">
              <div className="inline-flex items-center gap-1 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full mb-4">
                <Crown className="w-3 h-3" />
                <span>MEILLEURE ÉCONOMIE</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2 text-white">Premium 12 mois</h3>
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl md:text-5xl font-bold text-white">79.99€</div>
                  <div className="text-lg line-through text-gray-500">119.88€</div>
                </div>
                <p className="text-yellow-400 text-sm font-bold">6.67€/mois - Économise 33%</p>
              </div>
              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-2 text-white text-sm">
                  <Check className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span>Tout du plan mensuel</span>
                </div>
                <div className="flex items-center gap-2 text-white text-sm">
                  <Check className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span>12 mois d'accès premium</span>
                </div>
                <div className="flex items-center gap-2 text-white text-sm">
                  <Check className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span>Économise 40€</span>
                </div>
                <div className="flex items-center gap-2 text-white text-sm font-semibold">
                  <Check className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span>Meilleure valeur sur l'année</span>
                </div>
              </div>
              <SubscribeButton plan="premium" price="79.99€" />
            </div>
          </div>
        </div>

        {/* Avantages Premium */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            Pourquoi passer Premium ?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <div className="text-3xl mb-3">🔥</div>
              <h3 className="text-xl font-bold text-white mb-2">Swipes illimités</h3>
              <p className="text-gray-400 text-sm">Swipe autant que tu veux, sans limites quotidiennes</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <div className="text-3xl mb-3">💕</div>
              <h3 className="text-xl font-bold text-white mb-2">Voir qui t'a liké</h3>
              <p className="text-gray-400 text-sm">Découvre instantanément qui t'a liké et match plus vite</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <div className="text-3xl mb-3">⭐</div>
              <h3 className="text-xl font-bold text-white mb-2">Super Likes illimités</h3>
              <p className="text-gray-400 text-sm">Montre ton intérêt maximal sans limite</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <div className="text-3xl mb-3">🔮</div>
              <h3 className="text-xl font-bold text-white mb-2">Horoscope détaillé</h3>
              <p className="text-gray-400 text-sm">Accède aux prédictions complètes et conseils personnalisés d'Astra</p>
            </div>
          </div>
        </div>

        {/* Garantie */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <div className="bg-gradient-to-br from-red-900/20 to-pink-900/20 border border-red-500/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">💯 Garantie satisfaction</h3>
            <p className="text-gray-300 text-sm">
              Annule ton abonnement à tout moment depuis ton espace compte. Paiement sécurisé par Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
