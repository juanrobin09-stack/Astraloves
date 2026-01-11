// ═══════════════════════════════════════════════════════════════════════
// SUBSCRIPTION PAGE - Sélection abonnement
// ═══════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { SUBSCRIPTION_PLANS, MANIFESTO } from '../../config/subscriptionPlans';
import PlanCard from './shared/PlanCard';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { premiumTier } = usePremiumStatus();
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      // Redirect to login
      return;
    }

    setLoading(true);

    try {
      // TODO: Intégrer Stripe checkout
      console.log('Selected plan:', planId);
      
      // Simuler redirect Stripe
      // const { url } = await createCheckoutSession(planId);
      // window.location.href = url;
      
    } catch (error) {
      console.error('Erreur sélection plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>

      <div className="min-h-screen bg-black relative pb-20">
        {/* Background stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div 
            className="text-center mb-12"
            style={{ animation: 'slideUp 0.6s ease-out' }}
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              Choisis ton accès
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-6">
              ASTRA n'est pas une app de dating.<br />
              C'est un univers de perception.
            </p>

            {/* Manifesto quote */}
            <div className="inline-block p-4 bg-red-950/20 border border-red-900/30 rounded-xl">
              <p className="text-sm text-red-400 italic">
                "{MANIFESTO}"
              </p>
            </div>
          </div>

          {/* Plans grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {SUBSCRIPTION_PLANS.map((plan, index) => (
              <div
                key={plan.id}
                style={{
                  animation: `slideUp 0.6s ease-out ${0.2 * index}s backwards`,
                }}
              >
                <PlanCard
                  plan={plan}
                  currentTier={premiumTier}
                  onSelect={handleSelectPlan}
                  isCurrentPlan={plan.tier === premiumTier}
                />
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div 
            className="bg-zinc-900 border border-red-900/30 rounded-2xl p-6 mb-12"
            style={{ animation: 'slideUp 0.6s ease-out 0.6s backwards' }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Tableau comparatif
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-red-900/30">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-zinc-400">
                      Fonctionnalité
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-white">
                      Gratuit
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-white">
                      Premium
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-white">
                      Elite
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <ComparisonRow
                    feature="Univers V2"
                    free="1-2 constellations"
                    premium="4 constellations"
                    elite="Total + filtres"
                  />
                  <ComparisonRow
                    feature="Lectures ASTRA"
                    free="Courtes (2/6)"
                    premium="Complètes (6/6)"
                    elite="Complètes + Guardian"
                  />
                  <ComparisonRow
                    feature="Horoscope"
                    free="Basique"
                    premium="Avancé"
                    elite="Complet + thème vivant"
                  />
                  <ComparisonRow
                    feature="Questionnaires"
                    free="2 gratuits"
                    premium="Tous premium"
                    elite="Tous + thème astral IA"
                  />
                  <ComparisonRow
                    feature="Guardian"
                    free={false}
                    premium={false}
                    elite={true}
                  />
                  <ComparisonRow
                    feature="Trajectoire"
                    free={false}
                    premium={false}
                    elite={true}
                  />
                  <ComparisonRow
                    feature="Silence Actif"
                    free={false}
                    premium={false}
                    elite={true}
                  />
                  <ComparisonRow
                    feature="Boost visibilité"
                    free="×1"
                    premium="×3"
                    elite="×10"
                  />
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div 
            className="max-w-3xl mx-auto"
            style={{ animation: 'slideUp 0.6s ease-out 0.8s backwards' }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Questions fréquentes
            </h2>

            <div className="space-y-4">
              <FAQItem
                question="Puis-je annuler à tout moment ?"
                answer="Oui. Ton abonnement reste actif jusqu'à la fin de la période payée. Aucun renouvellement automatique après annulation."
              />
              <FAQItem
                question="Que se passe-t-il si j'annule ?"
                answer="Tu retrouves l'accès Gratuit. Tes données restent sauvegardées. Tu peux réactiver Premium/Elite quand tu veux."
              />
              <FAQItem
                question="Puis-je passer de Premium à Elite ?"
                answer="Oui, à tout moment. Le montant est proratisé. La différence est calculée automatiquement."
              />
              <FAQItem
                question="ASTRA me force-t-elle à upgrader ?"
                answer="Non. ASTRA te guide, ne te vend rien. Si une feature est verrouillée, elle t'explique pourquoi avec respect."
              />
            </div>
          </div>

          {/* Footer note */}
          <div 
            className="text-center mt-12 text-sm text-zinc-500"
            style={{ animation: 'fadeIn 1s ease-out 1s backwards' }}
          >
            <p>Paiement sécurisé via Stripe</p>
            <p className="mt-2">
              En t'abonnant, tu acceptes nos{' '}
              <a href="/terms" className="text-red-400 hover:text-red-300 transition-colors">
                Conditions d'utilisation
              </a>
            </p>
          </div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white font-semibold">Redirection vers le paiement...</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Comparison Row component
function ComparisonRow({
  feature,
  free,
  premium,
  elite,
}: {
  feature: string;
  free: string | boolean;
  premium: string | boolean;
  elite: string | boolean;
}) {
  return (
    <tr className="border-b border-zinc-800">
      <td className="py-4 px-4 text-sm text-white font-medium">
        {feature}
      </td>
      <td className="py-4 px-4 text-center">
        <ComparisonCell value={free} />
      </td>
      <td className="py-4 px-4 text-center">
        <ComparisonCell value={premium} />
      </td>
      <td className="py-4 px-4 text-center">
        <ComparisonCell value={elite} highlight />
      </td>
    </tr>
  );
}

// Comparison Cell component
function ComparisonCell({ value, highlight }: { value: string | boolean; highlight?: boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${highlight ? 'bg-red-500/20 border border-red-500/50' : 'bg-zinc-700'}`}>
        <svg className={`w-4 h-4 ${highlight ? 'text-red-400' : 'text-zinc-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    ) : (
      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800">
        <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  }

  return (
    <span className={`text-sm ${highlight ? 'text-red-400 font-semibold' : 'text-zinc-400'}`}>
      {value}
    </span>
  );
}

// FAQ Item component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-zinc-900 border border-red-900/30 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-red-950/10 transition-colors"
      >
        <span className="text-sm font-semibold text-white">{question}</span>
        <svg
          className={`w-5 h-5 text-red-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-sm text-zinc-300 leading-relaxed">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}
