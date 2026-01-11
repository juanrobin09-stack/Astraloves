// ═══════════════════════════════════════════════════════════════════════
// CYCLES CARD - Cycles astraux courts (PREMIUM) et longs (ELITE)
// ═══════════════════════════════════════════════════════════════════════

import { CurrentCycle, LongCycle, Tier } from '../../../types/astro-v2';
import UpgradePrompt from '../shared/UpgradePrompt';

interface CyclesCardProps {
  currentCycle?: CurrentCycle;
  longCycles?: LongCycle[];
  tier: Tier;
  onUpgrade: () => void;
}

export default function CyclesCard({ currentCycle, longCycles, tier, onUpgrade }: CyclesCardProps) {
  if (tier === 'free') {
    return (
      <div className="relative bg-zinc-900 border border-red-900/30 rounded-xl p-5 min-h-[300px]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🌊</span>
          <h3 className="text-xl font-bold text-white">
            Cycles Astraux
          </h3>
        </div>

        {/* Locked overlay */}
        <UpgradePrompt
          targetTier="premium"
          message="Comprends les cycles courts qui rythment ta vie relationnelle et émotionnelle."
          onUpgrade={onUpgrade}
        />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes phaseGlow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
          }
        }
      `}</style>

      <div
        className="bg-zinc-900 border border-red-900/30 rounded-xl p-5"
        style={{ animation: 'slideUpFade 0.6s ease-out 0.4s backwards' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🌊</span>
          <h3 className="text-xl font-bold text-white">
            Cycles Astraux
          </h3>
        </div>

        {/* PREMIUM: Cycle court actuel */}
        {currentCycle && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-red-400 mb-3">
              Cycle Court Actuel
            </h4>

            {/* Phase indicator */}
            <div className="bg-black/40 border border-red-900/30 rounded-lg p-4 mb-4">
              <PhaseIndicator
                phases={['ouverture', 'expansion', 'tri', 'retrait', 'intégration']}
                currentPhase={currentCycle.phase}
              />

              <div className="mt-4 text-center">
                <h5 className="text-base font-bold text-white mb-1 capitalize">
                  Phase de {currentCycle.phase}
                </h5>
                <p className="text-xs text-zinc-400">
                  Actif depuis {currentCycle.daysActive} jours • Encore ~{currentCycle.daysRemaining} jours
                </p>
              </div>
            </div>

            {/* Meaning */}
            <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-4 mb-3">
              <p className="text-xs font-semibold text-red-400 mb-2">
                Ce que cette phase demande:
              </p>
              <ul className="space-y-1.5">
                {currentCycle.meaning.demands.map((demand, i) => (
                  <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>{demand}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 pt-3 border-t border-red-900/20">
                <p className="text-xs text-zinc-400">
                  <span className="font-semibold">Énergie:</span> {currentCycle.meaning.energy}
                </p>
              </div>
            </div>

            {/* ASTRA message */}
            <div className="bg-black/30 border border-red-900/20 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-red-400 text-xs">✨</span>
                <p className="text-xs text-zinc-300 italic">
                  ASTRA: "{currentCycle.meaning.astraMessage}"
                </p>
              </div>
            </div>

            {/* Practical */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <p className="text-xs font-semibold text-zinc-400 mb-2">
                Concrètement:
              </p>
              <div className="space-y-1">
                {currentCycle.practical.map((action, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-red-400 text-xs">→</span>
                    <p className="text-xs text-white">{action}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Next cycle preview */}
            <div className="mt-4 p-3 bg-black/20 border border-zinc-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-zinc-500 mb-0.5">Prochain cycle</p>
                  <p className="text-sm font-bold text-white capitalize">
                    {currentCycle.nextPhase.phase}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-400">
                    {new Date(currentCycle.nextPhase.startDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </p>
                </div>
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                {currentCycle.nextPhase.preview}
              </p>
            </div>
          </div>
        )}

        {/* ELITE: Cycles longs */}
        {tier === 'elite' && longCycles && longCycles.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
              <span>👑</span>
              Cycles Longs & Transits
            </h4>

            <div className="space-y-4">
              {longCycles.map((cycle, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-red-950/30 to-black/50 border border-red-500/40 rounded-lg p-4"
                  style={{ animation: 'phaseGlow 4s ease-in-out infinite' }}
                >
                  {/* Transit name */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h5 className="text-sm font-bold text-white mb-1">
                        {cycle.name}
                      </h5>
                      <p className="text-xs text-zinc-400">
                        {new Date(cycle.startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} 
                        {' → '}
                        {new Date(cycle.endDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-red-400">
                        {cycle.progress}%
                      </div>
                      <div className="text-[10px] text-zinc-500">accompli</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-black/50 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all duration-1000"
                      style={{ width: `${cycle.progress}%` }}
                    />
                  </div>

                  {/* Meaning */}
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-red-400 mb-1">
                        Ce que l'âme travaille:
                      </p>
                      <ul className="space-y-1">
                        {cycle.meaning.soulWork.map((work, i) => (
                          <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                            <span className="text-red-400">•</span>
                            <span>{work}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-red-900/20">
                      <p className="text-xs font-semibold text-red-400 mb-1">
                        Pourquoi ça se répète:
                      </p>
                      <p className="text-xs text-zinc-300">
                        {cycle.meaning.whyRepeats}
                      </p>
                    </div>

                    {/* Pattern si présent */}
                    {cycle.pattern && (
                      <div className="pt-2 border-t border-red-900/20">
                        <div className="flex items-start gap-2">
                          <span className="text-red-400 text-xs">🛡️</span>
                          <p className="text-xs text-red-300">
                            {cycle.pattern}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upgrade Elite si Premium */}
        {tier === 'premium' && (
          <div className="mt-4 p-4 bg-black/40 border border-red-900/20 rounded-lg">
            <p className="text-xs text-zinc-400 text-center mb-3">
              Passe en <span className="text-red-400 font-semibold">Elite</span> pour accéder aux cycles longs et comprendre ce que ton âme travaille vraiment
            </p>
            <button
              onClick={onUpgrade}
              className="w-full py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-semibold rounded-lg transition-all"
            >
              Voir Elite
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// Phase indicator component
function PhaseIndicator({ phases, currentPhase }: { phases: string[]; currentPhase: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      {phases.map((phase, index) => {
        const isCurrent = phase === currentPhase;
        const isPast = phases.indexOf(currentPhase) > index;

        return (
          <div key={phase} className="flex-1 flex flex-col items-center gap-1.5">
            {/* Circle */}
            <div
              className={`
                w-3 h-3 rounded-full transition-all
                ${isCurrent ? 'bg-red-500 ring-2 ring-red-500/30 ring-offset-2 ring-offset-black' : 
                  isPast ? 'bg-red-700' : 
                  'bg-zinc-800'}
              `}
              style={isCurrent ? { animation: 'phaseGlow 2s ease-in-out infinite' } : undefined}
            />

            {/* Label */}
            <div
              className={`
                text-[9px] text-center capitalize leading-tight
                ${isCurrent ? 'text-red-400 font-bold' : 
                  isPast ? 'text-zinc-500' : 
                  'text-zinc-600'}
              `}
            >
              {phase}
            </div>

            {/* Connector line */}
            {index < phases.length - 1 && (
              <div
                className={`
                  absolute top-1.5 left-1/2 w-full h-0.5 -z-10
                  ${isPast ? 'bg-red-700' : 'bg-zinc-800'}
                `}
                style={{
                  transform: 'translateX(50%)',
                  width: `calc(100% / ${phases.length} - 12px)`
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
