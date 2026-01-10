import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { Sparkles, Shield, Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CosmicJourney } from '@/components/subscription/CosmicJourney';
import { TierComparison } from '@/components/subscription/TierComparison';
import { TestimonialsSection } from '@/components/subscription/TestimonialsSection';
import { PaymentModal } from '@/components/subscription/PaymentModal';

export default function SubscriptionPage() {
  const { tier } = useSubscriptionStore();
  const [selectedTier, setSelectedTier] = useState<'premium' | 'elite' | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="min-h-screen cosmic-gradient overflow-y-auto">
      {/* Hero */}
      <div className="relative px-6 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-effect rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-cosmic-gold" />
            <span className="text-sm">L'évolution cosmique</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 bg-gradient-to-r from-white via-cosmic-purple to-cosmic-gold bg-clip-text text-transparent">
            Pas un abonnement.<br />Une ascension.
          </h1>

          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-4">
            FREE te montre les étoiles.<br />
            PREMIUM t'apprend à naviguer.<br />
            ELITE te rend cosmique.
          </p>

          <p className="text-sm text-white/50 max-w-xl mx-auto">
            L'IA ne rassure pas. Elle éclaire. Chaque tier est une strate de conscience.
          </p>
        </motion.div>
      </div>

      {/* Cosmic Journey */}
      <CosmicJourney currentTier={tier} />

      {/* Tiers */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-center mb-12">
          <div className="glass-effect p-2 rounded-medium flex gap-2">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-small font-medium transition-all ${
                billingPeriod === 'monthly' ? 'bg-cosmic-purple text-white' : 'text-white/60'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-small font-medium transition-all ${
                billingPeriod === 'yearly' ? 'bg-cosmic-purple text-white' : 'text-white/60'
              }`}
            >
              Annuel<span className="ml-2 text-xs text-cosmic-gold">-17%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* PREMIUM */}
          <motion.div whileHover={{ y: -8 }} className="glass-effect p-8 rounded-large border border-cosmic-purple/30 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cosmic-purple/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-medium bg-gradient-to-br from-cosmic-purple to-purple-700 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-2">PREMIUM</h3>
              <p className="text-white/60 text-sm mb-6">La conscience étendue</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{billingPeriod === 'monthly' ? '9,99€' : '99,90€'}</span>
                <span className="text-white/60 text-sm">/{billingPeriod === 'monthly' ? 'mois' : 'an'}</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex gap-3"><span className="text-cosmic-green">✓</span>20 âmes visibles</li>
                <li className="flex gap-3"><span className="text-cosmic-green">✓</span>40 messages ASTRA/jour</li>
                <li className="flex gap-3"><span className="text-cosmic-green">✓</span>Compatibilité exacte</li>
                <li className="flex gap-3"><span className="text-cosmic-green">✓</span>Filtres avancés</li>
                <li className="flex gap-3"><span className="text-cosmic-green">✓</span>Qui m'a vu</li>
                <li className="flex gap-3"><span className="text-cosmic-green">✓</span>Horoscopes hebdo</li>
              </ul>
              <Button variant="primary" className="w-full" onClick={() => setSelectedTier('premium')}>
                Choisir Premium
              </Button>
            </div>
          </motion.div>

          {/* ELITE */}
          <motion.div whileHover={{ y: -8 }} className="glass-effect p-8 rounded-large border-2 border-cosmic-gold/50 relative">
            <div className="absolute top-4 right-4 px-3 py-1 bg-cosmic-gold text-cosmic-black text-xs font-bold rounded-full">RECOMMANDÉ</div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-cosmic-gold/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-medium bg-gradient-to-br from-cosmic-gold to-yellow-600 flex items-center justify-center mb-4">
                <Crown className="w-6 h-6 text-cosmic-black" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-2 text-cosmic-gold">ELITE</h3>
              <p className="text-white/60 text-sm mb-6">L'éveil cosmique absolu</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{billingPeriod === 'monthly' ? '14,99€' : '149,90€'}</span>
                <span className="text-white/60 text-sm">/{billingPeriod === 'monthly' ? 'mois' : 'an'}</span>
              </div>
              <div className="p-4 bg-cosmic-gold/10 rounded-medium border border-cosmic-gold/20 mb-6">
                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cosmic-gold" /><span className="text-cosmic-gold">Guardian Actif</span>
                </p>
                <p className="text-xs text-white/60">L'IA détecte tes patterns toxiques avant toi.</p>
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex gap-3"><span className="text-cosmic-gold">✓</span><strong>Tout Premium</strong></li>
                <li className="flex gap-3"><span className="text-cosmic-gold">✓</span>Univers illimité</li>
                <li className="flex gap-3"><span className="text-cosmic-gold">✓</span>65 messages ASTRA/jour</li>
                <li className="flex gap-3"><span className="text-cosmic-gold">✓</span>🛡️ Guardian (protection)</li>
                <li className="flex gap-3"><span className="text-cosmic-gold">✓</span>Recommandations Silence</li>
                <li className="flex gap-3"><span className="text-cosmic-gold">✓</span>Priorité algorithme 3x</li>
                <li className="flex gap-3"><span className="text-cosmic-gold">✓</span>Synastrie complète</li>
                <li className="flex gap-3"><span className="text-cosmic-gold">✓</span>Prévisions mensuelles</li>
              </ul>
              <Button className="w-full bg-cosmic-gold hover:bg-cosmic-gold/90 text-cosmic-black font-bold" onClick={() => setSelectedTier('elite')}>
                Devenir Elite
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <TierComparison />
      <TestimonialsSection />

      <AnimatePresence>
        {selectedTier && <PaymentModal tier={selectedTier} billingPeriod={billingPeriod} onClose={() => setSelectedTier(null)} />}
      </AnimatePresence>
    </div>
  );
}
