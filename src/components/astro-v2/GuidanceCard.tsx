// ═══════════════════════════════════════════════════════════════════════
// GUIDANCE CARD - Guidance stratégique (ELITE)
// ═══════════════════════════════════════════════════════════════════════

import { Guidance, Tier } from '../../../types/astro-v2';
import UpgradePrompt from '../shared/UpgradePrompt';

interface GuidanceCardProps {
  guidance?: Guidance;
  tier: Tier;
  onUpgrade: () => void;
}

export default function GuidanceCard({ guidance, tier, onUpgrade }: GuidanceCardProps) {
  if (tier !== 'elite') {
    return (
      <div className="relative bg-zinc-900 border border-red-900/30 rounded-xl p-5 min-h-[400px]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🧭</span>
          <h3 className="text-xl font-bold text-white">
            Guidance Stratégique
          </h3>
        </div>

        {/* Locked overlay */}
        <UpgradePrompt
          targetTier="elite"
          message="ASTRA te guide stratégiquement: quand chercher, quand attendre, quand clarifier. Le timing compte autant que l'action."
          onUpgrade={onUpgrade}
        />
      </div>
    );
  }

  if (!guidance) {
    return null;
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

        @keyframes compassGlow {
          0%, 100% {
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.4),
                        0 0 30px rgba(239, 68, 68, 0.2);
          }
          50% {
            box-shadow: 0 0 25px rgba(239, 68, 68, 0.6),
                        0 0 50px rgba(239, 68, 68, 0.4);
          }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        className="bg-zinc-900 border border-red-500/50 rounded-xl p-5"
        style={{ animation: 'slideUpFade 0.6s ease-out 0.9s backwards' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🧭</span>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">
              Guidance Stratégique
            </h3>
            <p className="text-xs text-red-400">
              Le timing compte autant que l'action
            </p>
          </div>
          <div className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 rounded-full">
            <span className="text-xs font-bold text-white">👑 ELITE</span>
          </div>
        </div>

        {/* Current phase indicator */}
        <div 
          className="bg-gradient-to-br from-red-950/40 to-black/60 border border-red-500/50 rounded-xl p-4 mb-6"
          style={{ animation: 'compassGlow 4s ease-in-out infinite' }}
        >
          <div className="flex items-center gap-4 mb-3">
            <div 
              className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50"
              style={{ animation: 'rotate 20s linear infinite' }}
            >
              <span className="text-2xl">🧭</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white capitalize">
                Phase: {guidance.currentPhase}
              </h4>
              <p className="text-xs text-zinc-400">
                Encore {guidance.daysRemaining} jours
              </p>
            </div>
          </div>
        </div>

        {/* Strategic guidance */}
        <div className="space-y-4 mb-6">
          <div className="bg-black/40 border border-red-900/30 rounded-lg p-4">
            <h5 className="text-sm font-semibold text-red-400 mb-3">
              Ce n'est PAS une période pour:
            </h5>
            <ul className="space-y-2">
              {guidance.strategic.notFor.map((item, i) => (
                <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-4">
            <h5 className="text-sm font-semibold text-red-400 mb-3">
              C'est une période pour:
            </h5>
            <ul className="space-y-2">
              {guidance.strategic.isFor.map((item, i) => (
                <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Timing */}
        <div className="bg-black/40 border border-red-900/30 rounded-lg p-4 mb-6">
          <h5 className="text-sm font-semibold text-red-400 mb-3">
            Timing Optimal
          </h5>

          <div className="space-y-3">
            {/* Do now */}
            <div>
              <p className="text-xs font-semibold text-white mb-2">À faire maintenant:</p>
              <div className="space-y-1.5">
                {guidance.timing.doNow.map((action, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-red-400 text-xs">→</span>
                    <p className="text-xs text-zinc-300">{action}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Avoid */}
            <div className="pt-3 border-t border-red-900/20">
              <p className="text-xs font-semibold text-white mb-2">À éviter:</p>
              <div className="space-y-1.5">
                {guidance.timing.avoid.map((action, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-zinc-600 text-xs">⊘</span>
                    <p className="text-xs text-zinc-400">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ASTRA Voice */}
        <div className="bg-gradient-to-br from-red-950/30 to-black/60 border border-red-500/40 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-sm">✨</span>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-red-400 mb-1">ASTRA DIT</p>
              <p className="text-sm text-white italic leading-relaxed">
                "{guidance.astraVoice}"
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming shift */}
        {guidance.upcomingShift && (
          <div className="bg-black/30 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🔄</span>
              <h5 className="text-sm font-semibold text-white">
                Prochain shift stratégique
              </h5>
            </div>

            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">
                  {new Date(guidance.upcomingShift.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long'
                  })}
                </p>
                <p className="text-sm font-bold text-white capitalize">
                  Phase: {guidance.upcomingShift.phase}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300">
              {guidance.upcomingShift.preview}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
