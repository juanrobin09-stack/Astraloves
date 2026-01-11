// ═══════════════════════════════════════════════════════════════════════
// COMPATIBILITY CARD - Compatibilité du jour
// ═══════════════════════════════════════════════════════════════════════

import { Compatibility, CompatibilityDetailed, Tier } from '../../../types/astro-v2';

interface CompatibilityCardProps {
  compatibilities: Compatibility[];
  tier: Tier;
  onUpgrade: () => void;
}

function isDetailed(c: Compatibility): c is CompatibilityDetailed {
  return 'score' in c;
}

export default function CompatibilityCard({ compatibilities, tier, onUpgrade }: CompatibilityCardProps) {
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
      `}</style>

      <div
        className="bg-zinc-900 border border-red-900/30 rounded-xl p-5"
        style={{ animation: 'slideUpFade 0.6s ease-out 0.2s backwards' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">💫</span>
          <h3 className="text-xl font-bold text-white">
            {tier === 'free' ? 'Compatibilité du Jour' : 'Compatibilités Détaillées'}
          </h3>
        </div>

        {/* FREE Version */}
        {tier === 'free' && (
          <>
            <div className="flex items-center justify-around mb-4">
              {compatibilities.map((compat) => (
                <div key={compat.sign} className="text-center">
                  <div className={`
                    text-4xl mb-1
                    ${compat.level === 'high' ? 'opacity-100' : 
                      compat.level === 'medium' ? 'opacity-70' : 
                      'opacity-40'}
                  `}>
                    {compat.emoji}
                  </div>
                  <div className={`
                    text-[10px] font-semibold
                    ${compat.level === 'high' ? 'text-red-400' : 
                      compat.level === 'medium' ? 'text-zinc-400' : 
                      'text-zinc-600'}
                  `}>
                    {compat.level === 'high' ? 'Haute' : 
                     compat.level === 'medium' ? 'Moyenne' : 
                     'Faible'}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-zinc-400 text-center mb-4">
              Connexions favorables avec certains signes aujourd'hui
            </p>

            {/* Upgrade footer */}
            <div className="p-4 bg-black/40 border border-red-900/20 rounded-lg">
              <p className="text-xs text-zinc-400 text-center mb-3">
                Débloque l'analyse détaillée de <span className="text-red-400 font-semibold">POURQUOI</span> avec Premium
              </p>
              <button
                onClick={onUpgrade}
                className="w-full py-2 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white text-sm font-semibold rounded-lg transition-all"
              >
                Voir Premium
              </button>
            </div>
          </>
        )}

        {/* PREMIUM Version */}
        {tier !== 'free' && compatibilities[0] && isDetailed(compatibilities[0]) && (
          <div className="space-y-4">
            {compatibilities.map((compat) => {
              if (!isDetailed(compat)) return null;
              
              return (
                <div key={compat.sign} className="bg-black/30 border border-red-900/20 rounded-lg p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{compat.emoji}</span>
                      <div>
                        <h4 className="text-base font-bold text-white capitalize">
                          {compat.sign}
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-semibold text-red-400">
                            {compat.score}% compatible
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Analysis */}
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 mb-1">
                        Pourquoi ça marche:
                      </p>
                      <ul className="space-y-1">
                        {compat.analysis.works.map((point, i) => (
                          <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                            <span className="text-red-400">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-zinc-400 mb-1">
                        Attention:
                      </p>
                      <ul className="space-y-1">
                        {compat.analysis.attention.map((point, i) => (
                          <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                            <span className="text-zinc-500">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Universe link */}
                  {compat.universeLink && (
                    <button className="mt-3 text-xs text-red-400 hover:text-red-300 font-semibold transition-colors">
                      → {compat.universeLink}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
