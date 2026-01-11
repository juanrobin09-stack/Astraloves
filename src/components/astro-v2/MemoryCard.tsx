// ═══════════════════════════════════════════════════════════════════════
// MEMORY CARD - Mémoire astrale (PREMIUM)
// ═══════════════════════════════════════════════════════════════════════

import { AstralMemory, Tier } from '../../../types/astro-v2';
import AstraNote from '../shared/AstraNote';
import UpgradePrompt from '../shared/UpgradePrompt';

interface MemoryCardProps {
  memories: AstralMemory[];
  tier: Tier;
  onUpgrade: () => void;
}

export default function MemoryCard({ memories, tier, onUpgrade }: MemoryCardProps) {
  if (tier === 'free') {
    return (
      <div className="relative bg-zinc-900 border border-red-900/30 rounded-xl p-5 min-h-[300px]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🧠</span>
          <h3 className="text-xl font-bold text-white">
            Mémoire Astrale
          </h3>
        </div>

        {/* Locked overlay */}
        <UpgradePrompt
          targetTier="premium"
          message="ASTRA se souvient de comment les transits t'affectent personnellement. Plus tu utilises l'app, plus la lecture devient précise."
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

        @keyframes memoryPulse {
          0%, 100% {
            border-color: rgba(127, 29, 29, 0.3);
          }
          50% {
            border-color: rgba(239, 68, 68, 0.5);
          }
        }
      `}</style>

      <div
        className="bg-zinc-900 border border-red-900/30 rounded-xl p-5"
        style={{ animation: 'slideUpFade 0.6s ease-out 0.5s backwards' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🧠</span>
          <h3 className="text-xl font-bold text-white">
            Mémoire Astrale
          </h3>
        </div>

        {/* Memories list */}
        {memories.length > 0 ? (
          <div className="space-y-3 mb-4">
            {memories.map((memory) => (
              <div
                key={memory.id}
                className="bg-black/40 border border-red-900/20 rounded-lg p-4"
                style={{ animation: 'memoryPulse 4s ease-in-out infinite' }}
              >
                {/* Date & Transit */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-red-400">
                      {new Date(memory.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {memory.transit}
                    </p>
                  </div>
                </div>

                {/* Pattern détecté */}
                <div className="mb-3">
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {memory.pattern}
                  </p>
                </div>

                {/* Advice */}
                <div className="bg-red-950/20 border border-red-900/30 rounded p-2.5">
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 text-xs mt-0.5">💡</span>
                    <p className="text-xs text-red-300 font-medium">
                      {memory.advice}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🌟</div>
            <p className="text-sm text-zinc-400 mb-2">
              Ta mémoire astrale se construit
            </p>
            <p className="text-xs text-zinc-500">
              ASTRA commence à noter comment les transits t'affectent. Reviens dans quelques jours.
            </p>
          </div>
        )}

        {/* ASTRA Note */}
        <AstraNote size="sm">
          ASTRA se souvient de comment les transits t'affectent personnellement. Plus tu utilises l'app, plus la lecture devient précise.
        </AstraNote>
      </div>
    </>
  );
}
