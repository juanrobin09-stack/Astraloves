// ═══════════════════════════════════════════════════════════════════════
// MY SUBSCRIPTION PAGE - Gestion abonnement actuel
// ═══════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { SUBSCRIPTION_PLANS } from '../../config/subscriptionPlans';

export default function MySubscriptionPage() {
  const { user, subscription: userSub } = useAuth();
  const { premiumTier, isPremium } = usePremiumStatus();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.tier === premiumTier);

  // Mock subscription data (à remplacer par vraies données)
  const mockSubscription = {
    status: isPremium ? 'active' : 'free',
    startDate: new Date('2025-01-01'),
    nextBillingDate: isPremium ? new Date('2026-02-01') : null,
    autoRenew: isPremium,
    paymentMethod: isPremium ? '•••• 4242' : null,
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      // TODO: Appeler API Stripe pour annuler
      console.log('Canceling subscription...');
      // await cancelSubscription();
      setShowCancelModal(false);
    } catch (error) {
      console.error('Erreur annulation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    setLoading(true);
    try {
      // TODO: Réactiver abonnement
      console.log('Reactivating subscription...');
    } catch (error) {
      console.error('Erreur réactivation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = (newTier: 'premium' | 'elite') => {
    // Redirect vers page abonnement ou modal upgrade
    console.log('Change to:', newTier);
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

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.6);
          }
        }
      `}</style>

      <div className="min-h-screen bg-black pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div 
            className="text-center mb-8"
            style={{ animation: 'slideUp 0.6s ease-out' }}
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              Mon Abonnement
            </h1>
            <p className="text-sm text-zinc-400">
              Gère ton accès à l'univers ASTRA
            </p>
          </div>

          {/* Current Plan Card */}
          <div 
            className="bg-gradient-to-br from-zinc-900 to-red-950/20 border-2 border-red-500/50 rounded-2xl p-6 mb-6"
            style={{ animation: 'slideUp 0.6s ease-out 0.2s backwards, pulse 4s ease-in-out infinite' }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-white">
                    {currentPlan?.name || 'Astra Essentiel'}
                  </h2>
                  {premiumTier === 'elite' && (
                    <span className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 rounded-full text-xs font-bold text-white">
                      👑 ELITE
                    </span>
                  )}
                  {premiumTier === 'premium' && (
                    <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-xs font-bold text-red-400">
                      💎 PREMIUM
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-400">
                  {currentPlan?.tagline || 'Découvre l\'Univers'}
                </p>
              </div>

              {isPremium && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {currentPlan?.priceDisplay}
                  </div>
                  <div className="text-xs text-zinc-500">/mois</div>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-black/30 border border-red-900/30 rounded-lg p-4">
                <div className="text-xs text-zinc-500 mb-1">Statut</div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    mockSubscription.status === 'active' ? 'bg-red-500' : 'bg-zinc-600'
                  }`} />
                  <span className="text-sm font-semibold text-white capitalize">
                    {mockSubscription.status === 'active' ? 'Actif' : 'Gratuit'}
                  </span>
                </div>
              </div>

              {mockSubscription.nextBillingDate && (
                <div className="bg-black/30 border border-red-900/30 rounded-lg p-4">
                  <div className="text-xs text-zinc-500 mb-1">Prochaine facturation</div>
                  <div className="text-sm font-semibold text-white">
                    {mockSubscription.nextBillingDate.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              )}

              {mockSubscription.paymentMethod && (
                <div className="bg-black/30 border border-red-900/30 rounded-lg p-4">
                  <div className="text-xs text-zinc-500 mb-1">Moyen de paiement</div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span className="text-sm font-semibold text-white">
                      {mockSubscription.paymentMethod}
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-black/30 border border-red-900/30 rounded-lg p-4">
                <div className="text-xs text-zinc-500 mb-1">Renouvellement auto</div>
                <div className="text-sm font-semibold text-white">
                  {mockSubscription.autoRenew ? 'Activé' : 'Désactivé'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {isPremium && premiumTier === 'premium' && (
                <button
                  onClick={() => handleChangePlan('elite')}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-500/30"
                >
                  👑 Passer Elite
                </button>
              )}

              {isPremium && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-4 py-3 border border-red-900/30 hover:border-red-500/50 text-zinc-300 hover:text-white font-semibold rounded-xl transition-all"
                >
                  Annuler l'abonnement
                </button>
              )}

              {!isPremium && (
                <button
                  onClick={() => window.location.href = '/subscription'}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-500/30"
                >
                  Passer Premium ou Elite
                </button>
              )}
            </div>
          </div>

          {/* Features accessible */}
          <div 
            className="bg-zinc-900 border border-red-900/30 rounded-2xl p-6 mb-6"
            style={{ animation: 'slideUp 0.6s ease-out 0.4s backwards' }}
          >
            <h3 className="text-xl font-bold text-white mb-4">
              Tes accès {premiumTier === 'free' ? 'gratuits' : 'premium'}
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {currentPlan?.features.slice(0, 10).map((feature) => (
                <div
                  key={feature.id}
                  className="flex items-start gap-3 bg-black/30 border border-red-900/20 rounded-lg p-3"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {feature.included ? (
                      <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center">
                        <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                        <svg className="w-3 h-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {feature.title}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ASTRA Message */}
          <div 
            className="bg-gradient-to-br from-red-950/30 to-black border border-red-500/40 rounded-2xl p-6"
            style={{ animation: 'slideUp 0.6s ease-out 0.6s backwards' }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <p className="text-xs font-bold text-red-400 mb-2">ASTRA DIT</p>
                <p className="text-sm text-white leading-relaxed">
                  {premiumTier === 'free' && 
                    "L'essentiel est là. Si tu veux aller plus loin dans la compréhension, Premium ouvre 4 constellations et les lectures complètes. Quand tu es prêt."
                  }
                  {premiumTier === 'premium' && 
                    "Tu as accès à la profondeur. Elite ajoute Guardian, qui veille sur tes patterns et te protège des répétitions. C'est un autre niveau."
                  }
                  {premiumTier === 'elite' && 
                    "Tu as tout débloqué. Guardian veille. Ta trajectoire est visible. Utilise ces outils avec conscience."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div 
              className="bg-zinc-900 border border-red-900/30 rounded-2xl max-w-md w-full p-6"
              style={{ animation: 'slideUp 0.3s ease-out' }}
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Annuler ton abonnement ?
              </h3>

              <p className="text-sm text-zinc-300 mb-4 leading-relaxed">
                Tu gardes l'accès {premiumTier === 'elite' ? 'Elite' : 'Premium'} jusqu'au{' '}
                <span className="font-semibold text-white">
                  {mockSubscription.nextBillingDate?.toLocaleDateString('fr-FR')}
                </span>
                .
              </p>

              <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
                Après, tu retrouves l'accès Gratuit. Toutes tes données restent sauvegardées.
                Tu peux réactiver quand tu veux.
              </p>

              <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-4 mb-6">
                <p className="text-xs text-red-400 italic">
                  "ASTRA ne te retient pas. Si c'est le moment de partir, pars. L'Univers reste."
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 border border-zinc-700 hover:border-zinc-600 text-white font-semibold rounded-xl transition-all"
                >
                  Garder mon abonnement
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={loading}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  {loading ? 'Annulation...' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && !showCancelModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white font-semibold">Chargement...</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
