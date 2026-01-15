import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useNavigate } from 'react-router-dom';
import {
  Crown, Sparkles, Shield, Star, Check, X, Zap, Heart,
  Eye, MessageCircle, Infinity, ChevronRight, ArrowLeft,
  Users, Telescope, Lock
} from 'lucide-react';

const PLANS = {
  free: {
    name: 'GRATUIT',
    price: 0,
    icon: Sparkles,
    color: '#6B7280',
    gradient: 'from-gray-600 to-gray-800',
    description: 'Découvre l\'univers',
    features: [
      { name: '5 profils visibles/jour', included: true },
      { name: '10 messages ASTRA/jour', included: true },
      { name: '20 messages matchs/jour', included: true },
      { name: 'Horoscope quotidien', included: true },
      { name: 'Profil basique', included: true },
      { name: 'Compatibilité détaillée', included: false },
      { name: 'Voir qui m\'a liké', included: false },
      { name: 'Filtres avancés', included: false },
      { name: 'Guardian (Protection IA)', included: false },
      { name: 'Synastrie complète', included: false },
    ],
  },
  premium: {
    name: 'PREMIUM',
    price: 9.99,
    yearlyPrice: 99.90,
    icon: Crown,
    color: '#E63946',
    gradient: 'from-cosmic-red to-pink-600',
    description: 'L\'éveil cosmique',
    popular: false,
    features: [
      { name: '50 profils visibles/jour', included: true },
      { name: '40 messages ASTRA/jour', included: true },
      { name: 'Messages matchs illimités', included: true },
      { name: 'Horoscopes hebdomadaires', included: true },
      { name: '10 photos de profil', included: true },
      { name: 'Compatibilité détaillée', included: true },
      { name: 'Voir qui m\'a liké', included: true },
      { name: 'Filtres avancés', included: true },
      { name: 'Super Nova (1/jour)', included: true },
      { name: 'Guardian (Protection IA)', included: false },
      { name: 'Synastrie complète', included: false },
    ],
  },
  elite: {
    name: 'ELITE',
    price: 14.99,
    yearlyPrice: 149.90,
    icon: Shield,
    color: '#FFD700',
    gradient: 'from-cosmic-gold to-yellow-600',
    description: 'L\'ascension totale',
    popular: true,
    features: [
      { name: 'Profils illimités', included: true },
      { name: '65 messages ASTRA/jour', included: true },
      { name: 'Messages matchs illimités', included: true },
      { name: 'Prévisions mensuelles', included: true },
      { name: '20 photos de profil', included: true },
      { name: 'Compatibilité avancée', included: true },
      { name: 'Voir qui m\'a liké + quand', included: true },
      { name: 'Tous les filtres', included: true },
      { name: 'Super Nova (5/jour)', included: true },
      { name: 'Guardian (Protection IA)', included: true },
      { name: 'Synastrie complète', included: true },
      { name: 'Mode Incognito', included: true },
      { name: 'Priorité algorithme x10', included: true },
    ],
  },
};

export default function SubscriptionPage() {
  const { tier, isPremium, isElite } = useSubscriptionStore();
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const currentPlan = tier === 'premium_elite' ? 'elite' : tier;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0a0000] to-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Abonnements</h1>
            <p className="text-xs text-white/50">Choisis ton niveau d'éveil</p>
          </div>
        </div>
      </div>

      {/* Current Plan Banner */}
      {currentPlan !== 'free' && (
        <div className="px-6 py-4">
          <div className={`p-4 rounded-2xl border ${
            currentPlan === 'elite'
              ? 'bg-cosmic-gold/10 border-cosmic-gold/30'
              : 'bg-cosmic-red/10 border-cosmic-red/30'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                currentPlan === 'elite' ? 'bg-cosmic-gold' : 'bg-cosmic-red'
              }`}>
                {currentPlan === 'elite' ? (
                  <Shield className="w-6 h-6 text-black" />
                ) : (
                  <Crown className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <p className={`font-bold ${currentPlan === 'elite' ? 'text-cosmic-gold' : 'text-cosmic-red'}`}>
                  Abonnement {currentPlan === 'elite' ? 'Elite' : 'Premium'} actif
                </p>
                <p className="text-xs text-white/50">Merci de ton soutien cosmique</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="px-6 py-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cosmic-red/10 border border-cosmic-red/30 rounded-full mb-6">
            <Zap className="w-4 h-4 text-cosmic-red" />
            <span className="text-sm text-cosmic-red font-medium">Ascension Cosmique</span>
          </div>

          <h1 className="text-4xl font-display font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-cosmic-red-light to-white bg-clip-text text-transparent">
              Pas un abonnement.
            </span>
            <br />
            <span className="text-cosmic-gold">Une évolution.</span>
          </h1>

          <p className="text-white/60 max-w-md mx-auto">
            Chaque niveau est une strate de conscience. Choisis jusqu'où tu veux aller.
          </p>
        </motion.div>
      </div>

      {/* Billing Toggle */}
      <div className="px-6 mb-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex max-w-xs mx-auto">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-cosmic-red text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all relative ${
              billingPeriod === 'yearly'
                ? 'bg-cosmic-red text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Annuel
            <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-cosmic-gold text-black text-xs font-bold rounded-full">
              -17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="px-6 pb-8 space-y-4">
        {/* PREMIUM Plan */}
        <motion.div
          className={`relative bg-white/5 backdrop-blur-xl border rounded-2xl overflow-hidden ${
            currentPlan === 'premium' ? 'border-cosmic-red' : 'border-white/10'
          }`}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cosmic-red to-pink-500" />

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cosmic-red flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-cosmic-red">PREMIUM</h3>
                  <p className="text-sm text-white/50">L'éveil cosmique</p>
                </div>
              </div>
              {currentPlan === 'premium' && (
                <span className="px-3 py-1 bg-cosmic-red/20 text-cosmic-red text-xs font-medium rounded-full">
                  Actif
                </span>
              )}
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold">
                {billingPeriod === 'monthly' ? '9,99€' : '99,90€'}
              </span>
              <span className="text-white/50 text-sm">
                /{billingPeriod === 'monthly' ? 'mois' : 'an'}
              </span>
              {billingPeriod === 'yearly' && (
                <p className="text-xs text-cosmic-green mt-1">Économise 20€/an</p>
              )}
            </div>

            <div className="space-y-3 mb-6">
              {PLANS.premium.features.slice(0, 6).map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  {feature.included ? (
                    <Check className="w-4 h-4 text-cosmic-green flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-white/20 flex-shrink-0" />
                  )}
                  <span className={feature.included ? 'text-white/80' : 'text-white/30'}>
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedPlan('premium')}
              disabled={currentPlan === 'premium' || currentPlan === 'elite'}
              className={`w-full py-4 rounded-xl font-bold transition-all ${
                currentPlan === 'premium' || currentPlan === 'elite'
                  ? 'bg-white/10 text-white/40 cursor-not-allowed'
                  : 'bg-cosmic-red hover:bg-cosmic-red-light text-white'
              }`}
            >
              {currentPlan === 'premium' ? 'Plan actuel' : currentPlan === 'elite' ? 'Plan inférieur' : 'Choisir Premium'}
            </button>
          </div>
        </motion.div>

        {/* ELITE Plan */}
        <motion.div
          className={`relative bg-gradient-to-br from-cosmic-gold/10 to-yellow-900/10 backdrop-blur-xl border-2 rounded-2xl overflow-hidden ${
            currentPlan === 'elite' ? 'border-cosmic-gold' : 'border-cosmic-gold/50'
          }`}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {/* Popular Badge */}
          <div className="absolute top-4 right-4 px-3 py-1 bg-cosmic-gold text-black text-xs font-bold rounded-full">
            RECOMMANDÉ
          </div>

          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cosmic-gold to-yellow-400" />

          <div className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-cosmic-gold flex items-center justify-center">
                <Shield className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-cosmic-gold">ELITE</h3>
                <p className="text-sm text-white/50">L'ascension totale</p>
              </div>
            </div>

            {/* Guardian Feature Highlight */}
            <div className="mb-6 p-4 bg-cosmic-gold/10 border border-cosmic-gold/30 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-cosmic-gold" />
                <span className="font-bold text-cosmic-gold">Guardian Actif</span>
              </div>
              <p className="text-sm text-white/60">
                L'IA détecte tes patterns toxiques et te protège des relations nocives.
              </p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-cosmic-gold">
                {billingPeriod === 'monthly' ? '14,99€' : '149,90€'}
              </span>
              <span className="text-white/50 text-sm">
                /{billingPeriod === 'monthly' ? 'mois' : 'an'}
              </span>
              {billingPeriod === 'yearly' && (
                <p className="text-xs text-cosmic-green mt-1">Économise 30€/an</p>
              )}
            </div>

            <div className="space-y-3 mb-6">
              {PLANS.elite.features.slice(0, 8).map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-cosmic-gold flex-shrink-0" />
                  <span className="text-white/80">{feature.name}</span>
                </div>
              ))}
              <p className="text-xs text-cosmic-gold/60 pl-7">+ 5 autres avantages exclusifs</p>
            </div>

            <button
              onClick={() => setSelectedPlan('elite')}
              disabled={currentPlan === 'elite'}
              className={`w-full py-4 rounded-xl font-bold transition-all ${
                currentPlan === 'elite'
                  ? 'bg-white/10 text-white/40 cursor-not-allowed'
                  : 'bg-cosmic-gold hover:bg-cosmic-gold/90 text-black'
              }`}
            >
              {currentPlan === 'elite' ? 'Plan actuel' : 'Devenir Elite'}
            </button>
          </div>
        </motion.div>

        {/* FREE Plan (Compact) */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <h3 className="font-bold">GRATUIT</h3>
                <p className="text-xs text-white/50">Découvre l'univers</p>
              </div>
            </div>
            <span className="text-lg font-bold text-white/40">0€</span>
          </div>
          {currentPlan === 'free' && (
            <p className="text-xs text-white/40 mt-4 text-center">
              Tu utilises actuellement le plan gratuit
            </p>
          )}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="px-6 pb-8">
        <h2 className="text-lg font-bold mb-4 text-center">Comparaison complète</h2>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-4 gap-2 p-4 border-b border-white/10 text-center text-xs font-medium">
            <div></div>
            <div className="text-white/50">Gratuit</div>
            <div className="text-cosmic-red">Premium</div>
            <div className="text-cosmic-gold">Elite</div>
          </div>

          {[
            { name: 'Profils visibles', free: '5/jour', premium: '50/jour', elite: '∞' },
            { name: 'Messages ASTRA', free: '10/jour', premium: '40/jour', elite: '65/jour' },
            { name: 'Super Nova', free: '0', premium: '1/jour', elite: '5/jour' },
            { name: 'Photos profil', free: '5', premium: '10', elite: '20' },
            { name: 'Qui m\'a liké', free: false, premium: true, elite: true },
            { name: 'Guardian IA', free: false, premium: false, elite: true },
            { name: 'Synastrie', free: false, premium: false, elite: true },
            { name: 'Mode Incognito', free: false, premium: false, elite: true },
          ].map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-4 gap-2 p-4 border-b border-white/5 text-center text-sm items-center"
            >
              <div className="text-left text-white/70 text-xs">{row.name}</div>
              <div className="text-white/40">
                {typeof row.free === 'boolean' ? (
                  row.free ? <Check className="w-4 h-4 mx-auto text-cosmic-green" /> : <X className="w-4 h-4 mx-auto text-white/20" />
                ) : row.free}
              </div>
              <div className="text-cosmic-red">
                {typeof row.premium === 'boolean' ? (
                  row.premium ? <Check className="w-4 h-4 mx-auto text-cosmic-green" /> : <X className="w-4 h-4 mx-auto text-white/20" />
                ) : row.premium}
              </div>
              <div className="text-cosmic-gold">
                {typeof row.elite === 'boolean' ? (
                  row.elite ? <Check className="w-4 h-4 mx-auto text-cosmic-gold" /> : <X className="w-4 h-4 mx-auto text-white/20" />
                ) : row.elite}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="px-6 pb-24">
        <h2 className="text-lg font-bold mb-4 text-center">Questions fréquentes</h2>
        <div className="space-y-3">
          {[
            {
              q: 'Puis-je annuler à tout moment ?',
              a: 'Oui, tu peux annuler ton abonnement à tout moment. Tu garderas accès aux fonctionnalités jusqu\'à la fin de ta période de facturation.',
            },
            {
              q: 'Qu\'est-ce que le Guardian ?',
              a: 'Le Guardian est notre IA de protection exclusive aux Elite. Elle analyse tes conversations et te prévient des comportements toxiques potentiels.',
            },
            {
              q: 'Comment fonctionne la Synastrie ?',
              a: 'La Synastrie compare ton thème natal complet avec celui de tes matchs pour révéler vos dynamiques relationnelles profondes.',
            },
          ].map((item, i) => (
            <details
              key={i}
              className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl"
            >
              <summary className="p-4 cursor-pointer flex items-center justify-between font-medium">
                {item.q}
                <ChevronRight className="w-4 h-4 text-white/40 transition-transform group-open:rotate-90" />
              </summary>
              <div className="px-4 pb-4 text-sm text-white/60">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Payment Modal Placeholder */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPlan(null)}
          >
            <motion.div
              className="w-full max-w-lg bg-cosmic-surface border-t border-white/10 rounded-t-3xl p-6"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
              <h2 className="text-xl font-bold mb-2 text-center">
                {selectedPlan === 'elite' ? 'Devenir Elite' : 'Passer Premium'}
              </h2>
              <p className="text-white/60 text-center mb-6">
                {billingPeriod === 'monthly'
                  ? `${selectedPlan === 'elite' ? '14,99€' : '9,99€'}/mois`
                  : `${selectedPlan === 'elite' ? '149,90€' : '99,90€'}/an`}
              </p>
              <button
                className={`w-full py-4 rounded-xl font-bold ${
                  selectedPlan === 'elite'
                    ? 'bg-cosmic-gold text-black'
                    : 'bg-cosmic-red text-white'
                }`}
              >
                Confirmer le paiement
              </button>
              <button
                onClick={() => setSelectedPlan(null)}
                className="w-full py-3 text-white/50 text-sm mt-2"
              >
                Annuler
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
