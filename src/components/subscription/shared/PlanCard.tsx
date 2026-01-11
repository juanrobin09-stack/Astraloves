// ═══════════════════════════════════════════════════════════════════════
// PLAN CARD - Carte d'affichage plan abonnement
// ═══════════════════════════════════════════════════════════════════════

import { SubscriptionPlan } from '../../../types/subscription';

interface PlanCardProps {
  plan: SubscriptionPlan;
  currentTier: 'free' | 'premium' | 'elite';
  onSelect: (planId: string) => void;
  isCurrentPlan?: boolean;
}

export default function PlanCard({ plan, currentTier, onSelect, isCurrentPlan }: PlanCardProps) {
  const isFree = plan.tier === 'free';
  const isRecommended = plan.recommended;
  const isElite = plan.tier === 'elite';
  const isUpgrade = 
    (currentTier === 'free' && plan.tier !== 'free') ||
    (currentTier === 'premium' && plan.tier === 'elite');

  return (
    <>
      <style>{`
        @keyframes cardGlow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.6);
          }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <div
        className={`
          relative rounded-2xl overflow-hidden transition-all duration-300
          ${isRecommended || isElite ? 'border-2 border-red-500/70' : 'border border-red-900/30'}
          ${isCurrentPlan ? 'bg-gradient-to-br from-red-950/40 to-black' : 'bg-zinc-900'}
          ${isRecommended || isElite ? 'shadow-lg shadow-red-500/20' : ''}
        `}
        style={isRecommended || isElite ? { animation: 'cardGlow 4s ease-in-out infinite' } : undefined}
      >
        {/* Badge recommandé/elite */}
        {plan.badge && (
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-600 to-red-700 py-2 px-4 text-center z-10">
            <span className="text-xs font-bold text-white">{plan.badge}</span>
          </div>
        )}

        {/* Content */}
        <div className={`p-6 ${plan.badge ? 'pt-14' : ''}`}>
          {/* Header */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              {plan.name}
            </h3>
            <p className="text-sm text-zinc-400 mb-4">
              {plan.tagline}
            </p>

            {/* Prix */}
            <div className="mb-4">
              {isFree ? (
                <div className="text-3xl font-bold text-white">
                  Gratuit
                </div>
              ) : (
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white">
                    {plan.price.toFixed(2).replace('.', ',')}€
                  </span>
                  <span className="text-sm text-zinc-500">/mois</span>
                </div>
              )}
            </div>

            {/* Current plan badge */}
            {isCurrentPlan && (
              <div className="inline-block px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full">
                <span className="text-xs font-semibold text-red-400">
                  Abonnement actuel
                </span>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {plan.features.slice(0, 8).map((feature) => (
              <div
                key={feature.id}
                className={`
                  flex items-start gap-3 text-sm
                  ${feature.highlight ? 'bg-red-950/20 border border-red-900/30 rounded-lg p-2' : ''}
                `}
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
                  <p className={`font-medium ${feature.included ? 'text-white' : 'text-zinc-500'}`}>
                    {feature.title}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {feature.description}
                  </p>
                  {feature.limited && (
                    <p className="text-xs text-red-400 mt-1 italic">
                      {feature.limited}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Voir plus */}
            {plan.features.length > 8 && (
              <div className="text-center pt-2">
                <button className="text-xs text-red-400 hover:text-red-300 transition-colors">
                  + {plan.features.length - 8} autres fonctionnalités
                </button>
              </div>
            )}
          </div>

          {/* CTA */}
          {!isCurrentPlan && (
            <button
              onClick={() => onSelect(plan.id)}
              disabled={isFree}
              className={`
                w-full py-3 rounded-xl font-semibold transition-all
                ${isFree
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : isElite
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/30'
                  : 'bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white'}
              `}
            >
              {isFree
                ? 'Plan actuel'
                : isUpgrade
                ? `Passer ${plan.tier === 'elite' ? 'Elite' : 'Premium'}`
                : isCurrentPlan
                ? 'Abonnement actuel'
                : 'Choisir ce plan'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
