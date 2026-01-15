import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useNavigate } from 'react-router-dom';
import {
  Crown, Sparkles, Shield, Star, Check, X, Zap, Heart,
  Eye, Infinity, ChevronDown, ArrowLeft, MessageCircle,
  Users, Lock, Compass
} from 'lucide-react';

export default function SubscriptionPage() {
  const { tier } = useSubscriptionStore();
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const currentPlan = tier === 'premium_elite' ? 'elite' : tier;

  const plans = [
    {
      id: 'premium',
      name: 'PREMIUM',
      icon: Crown,
      color: '#E63946',
      monthlyPrice: 9.99,
      yearlyPrice: 99.90,
      description: "L'éveil cosmique",
      badge: null,
      features: [
        { icon: Users, text: '50 profils visibles/jour' },
        { icon: MessageCircle, text: '40 messages ASTRA/jour' },
        { icon: Infinity, text: 'Messages matchs illimités' },
        { icon: Star, text: 'Horoscopes hebdomadaires' },
        { icon: Eye, text: 'Voir qui m\'a liké' },
        { icon: Heart, text: 'Compatibilité détaillée' },
      ],
    },
    {
      id: 'elite',
      name: 'ELITE',
      icon: Shield,
      color: '#FFD700',
      monthlyPrice: 14.99,
      yearlyPrice: 149.90,
      description: "L'ascension totale",
      badge: 'RECOMMANDÉ',
      features: [
        { icon: Infinity, text: 'Profils illimités' },
        { icon: MessageCircle, text: '65 messages ASTRA/jour' },
        { icon: Shield, text: 'Guardian IA (protection)' },
        { icon: Compass, text: 'Synastrie complète' },
        { icon: Eye, text: 'Mode Incognito' },
        { icon: Zap, text: 'Priorité algorithme x10' },
      ],
    },
  ];

  const faqItems = [
    {
      q: 'Puis-je annuler à tout moment ?',
      a: 'Oui, tu peux annuler ton abonnement à tout moment depuis ton profil. Tu garderas accès aux fonctionnalités premium jusqu\'à la fin de ta période de facturation.',
    },
    {
      q: 'Qu\'est-ce que le Guardian ?',
      a: 'Le Guardian est notre IA de protection exclusive aux Elite. Elle analyse tes conversations en temps réel et te prévient des comportements toxiques ou manipulateurs.',
    },
    {
      q: 'Comment fonctionne la Synastrie ?',
      a: 'La Synastrie compare ton thème natal complet avec celui de tes matchs pour révéler vos dynamiques relationnelles, points de tension et zones de compatibilité.',
    },
    {
      q: 'Y a-t-il une période d\'essai ?',
      a: 'Nous offrons une garantie satisfait ou remboursé de 7 jours sur tous les abonnements. Contacte le support si tu n\'es pas satisfait.',
    },
  ];

  const comparisonRows = [
    { name: 'Profils visibles', free: '5/jour', premium: '50/jour', elite: '∞' },
    { name: 'Messages ASTRA', free: '10/jour', premium: '40/jour', elite: '65/jour' },
    { name: 'Super Nova', free: '0', premium: '1/jour', elite: '5/jour' },
    { name: 'Photos profil', free: '5', premium: '10', elite: '20' },
    { name: 'Qui m\'a liké', free: false, premium: true, elite: true },
    { name: 'Filtres avancés', free: false, premium: true, elite: true },
    { name: 'Guardian IA', free: false, premium: false, elite: true },
    { name: 'Synastrie', free: false, premium: false, elite: true },
    { name: 'Mode Incognito', free: false, premium: false, elite: true },
  ];

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-black/95 backdrop-blur-xl border-b border-white/10 z-10">
        <div className="px-5 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Abonnements</h1>
            <p className="text-xs text-white/50">Choisis ton niveau</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div className="px-5 pt-8 pb-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cosmic-red/10 border border-cosmic-red/30 rounded-full mb-4">
              <Zap className="w-4 h-4 text-cosmic-red" />
              <span className="text-sm text-cosmic-red font-medium">Ascension Cosmique</span>
            </div>

            <h1 className="text-3xl font-bold mb-2">
              <span className="text-white">Pas un abonnement.</span>
              <br />
              <span className="text-cosmic-gold">Une évolution.</span>
            </h1>

            <p className="text-white/50 text-sm">
              Chaque niveau débloque de nouvelles possibilités
            </p>
          </motion.div>
        </div>

        {/* Billing Toggle */}
        <div className="px-5 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-1.5 flex">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-cosmic-red text-white'
                  : 'text-white/50'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all relative ${
                billingPeriod === 'yearly'
                  ? 'bg-cosmic-red text-white'
                  : 'text-white/50'
              }`}
            >
              Annuel
              <span className="absolute -top-2 -right-1 px-2 py-0.5 bg-cosmic-gold text-black text-[10px] font-bold rounded-full">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="px-5 space-y-4 mb-8">
          {plans.map((plan, i) => {
            const isActive = currentPlan === plan.id;
            const isPremiumPlan = plan.id === 'premium';
            const isElitePlan = plan.id === 'elite';
            const price = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl overflow-hidden ${
                  isElitePlan
                    ? 'bg-gradient-to-br from-cosmic-gold/10 to-yellow-900/5 border-2 border-cosmic-gold/50'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-cosmic-gold text-black text-[10px] font-bold rounded-full">
                    {plan.badge}
                  </div>
                )}

                {/* Top accent */}
                <div
                  className="h-1"
                  style={{ background: `linear-gradient(to right, ${plan.color}, ${plan.color}80)` }}
                />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: plan.color }}
                    >
                      <plan.icon className={`w-6 h-6 ${isElitePlan ? 'text-black' : 'text-white'}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: plan.color }}>
                        {plan.name}
                      </h3>
                      <p className="text-xs text-white/50">{plan.description}</p>
                    </div>
                  </div>

                  {/* Guardian highlight for Elite */}
                  {isElitePlan && (
                    <div className="mb-4 p-3 bg-cosmic-gold/10 border border-cosmic-gold/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-4 h-4 text-cosmic-gold" />
                        <span className="text-sm font-semibold text-cosmic-gold">Guardian Actif</span>
                      </div>
                      <p className="text-xs text-white/50">
                        L'IA détecte les patterns toxiques et te protège
                      </p>
                    </div>
                  )}

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-3xl font-bold" style={{ color: isElitePlan ? '#FFD700' : 'white' }}>
                      {price.toFixed(2)}€
                    </span>
                    <span className="text-white/40 text-sm">
                      /{billingPeriod === 'monthly' ? 'mois' : 'an'}
                    </span>
                    {billingPeriod === 'yearly' && (
                      <p className="text-xs text-green-400 mt-1">
                        Économise {isPremiumPlan ? '20€' : '30€'}/an
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-2.5 mb-5">
                    {plan.features.map((feature, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <feature.icon
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: plan.color }}
                        />
                        <span className="text-sm text-white/80">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => !isActive && setSelectedPlan(plan.id)}
                    disabled={isActive || (isPremiumPlan && currentPlan === 'elite')}
                    className={`w-full py-3.5 rounded-xl font-semibold transition-all ${
                      isActive
                        ? 'bg-white/10 text-white/40 cursor-default'
                        : isPremiumPlan && currentPlan === 'elite'
                        ? 'bg-white/10 text-white/40 cursor-not-allowed'
                        : isElitePlan
                        ? 'bg-cosmic-gold text-black hover:bg-cosmic-gold/90'
                        : 'bg-cosmic-red text-white hover:bg-cosmic-red/90'
                    }`}
                  >
                    {isActive ? 'Plan actuel' : isPremiumPlan && currentPlan === 'elite' ? 'Plan inférieur' : `Choisir ${plan.name}`}
                  </button>
                </div>
              </motion.div>
            );
          })}

          {/* Free Plan Mini */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white/50" />
                </div>
                <div>
                  <h3 className="font-semibold text-white/70">GRATUIT</h3>
                  <p className="text-xs text-white/40">Découvre l'univers</p>
                </div>
              </div>
              <span className="text-lg font-bold text-white/30">0€</span>
            </div>
            {currentPlan === 'free' && (
              <p className="text-xs text-white/30 mt-3 text-center">
                Tu utilises actuellement ce plan
              </p>
            )}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="px-5 mb-8">
          <h2 className="text-lg font-bold mb-4 text-center">Comparaison</h2>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-2 p-3 border-b border-white/10 text-center">
              <div></div>
              <div className="text-xs text-white/40 font-medium">Gratuit</div>
              <div className="text-xs text-cosmic-red font-medium">Premium</div>
              <div className="text-xs text-cosmic-gold font-medium">Elite</div>
            </div>

            {/* Table Rows */}
            {comparisonRows.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-4 gap-2 p-3 text-center items-center ${
                  i !== comparisonRows.length - 1 ? 'border-b border-white/5' : ''
                }`}
              >
                <div className="text-left text-xs text-white/60">{row.name}</div>
                <div className="text-xs text-white/40">
                  {typeof row.free === 'boolean' ? (
                    row.free ? (
                      <Check className="w-4 h-4 mx-auto text-green-400" />
                    ) : (
                      <X className="w-4 h-4 mx-auto text-white/20" />
                    )
                  ) : (
                    row.free
                  )}
                </div>
                <div className="text-xs text-cosmic-red">
                  {typeof row.premium === 'boolean' ? (
                    row.premium ? (
                      <Check className="w-4 h-4 mx-auto text-green-400" />
                    ) : (
                      <X className="w-4 h-4 mx-auto text-white/20" />
                    )
                  ) : (
                    row.premium
                  )}
                </div>
                <div className="text-xs text-cosmic-gold">
                  {typeof row.elite === 'boolean' ? (
                    row.elite ? (
                      <Check className="w-4 h-4 mx-auto text-cosmic-gold" />
                    ) : (
                      <X className="w-4 h-4 mx-auto text-white/20" />
                    )
                  ) : (
                    row.elite
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="px-5 pb-8">
          <h2 className="text-lg font-bold mb-4 text-center">Questions fréquentes</h2>
          <div className="space-y-2">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <span className="font-medium text-sm pr-4">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform ${
                      expandedFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {expandedFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-sm text-white/60 leading-relaxed">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom spacing for navbar */}
        <div className="h-8" />
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPlan(null)}
          >
            <motion.div
              className="w-full max-w-md bg-[#1c1c1e] border-t border-white/10 rounded-t-3xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />

                <div className="text-center mb-6">
                  <div
                    className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: selectedPlan === 'elite' ? '#FFD700' : '#E63946' }}
                  >
                    {selectedPlan === 'elite' ? (
                      <Shield className="w-8 h-8 text-black" />
                    ) : (
                      <Crown className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <h2 className="text-xl font-bold mb-1">
                    {selectedPlan === 'elite' ? 'Devenir Elite' : 'Passer Premium'}
                  </h2>
                  <p className="text-white/50">
                    {billingPeriod === 'monthly'
                      ? `${selectedPlan === 'elite' ? '14,99€' : '9,99€'}/mois`
                      : `${selectedPlan === 'elite' ? '149,90€' : '99,90€'}/an`}
                  </p>
                </div>

                <button
                  className={`w-full py-4 rounded-xl font-bold text-lg ${
                    selectedPlan === 'elite'
                      ? 'bg-cosmic-gold text-black'
                      : 'bg-cosmic-red text-white'
                  }`}
                >
                  Confirmer le paiement
                </button>

                <button
                  onClick={() => setSelectedPlan(null)}
                  className="w-full py-3 text-white/40 text-sm mt-2"
                >
                  Annuler
                </button>

                <p className="text-center text-xs text-white/30 mt-4">
                  Paiement sécurisé via Stripe
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
