// ═══════════════════════════════════════════════════════════════════════
// HOROSCOPE CARD - Horoscope du jour IA
// ═══════════════════════════════════════════════════════════════════════

import { Horoscope, HoroscopePremium, HoroscopeElite, Tier } from '../../../types/astro-v2';
import TierBadge from '../shared/TierBadge';
import AstraNote from '../shared/AstraNote';
import UpgradePrompt from '../shared/UpgradePrompt';

interface HoroscopeCardProps {
  horoscope: Horoscope;
  tier: Tier;
  onUpgrade: () => void;
}

function isPremium(h: Horoscope): h is HoroscopePremium {
  return 'amour' in h;
}

function isElite(h: Horoscope): h is HoroscopeElite {
  return 'guardianAlert' in h;
}

export default function HoroscopeCard({ horoscope, tier, onUpgrade }: HoroscopeCardProps) {
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
        style={{ animation: 'slideUpFade 0.6s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔮</span>
            <h3 className="text-xl font-bold text-white">
              Horoscope du Jour
            </h3>
          </div>
          <TierBadge tier={tier} />
        </div>

        {/* Main Text */}
        <p className="text-sm leading-relaxed text-zinc-200 mb-4">
          {horoscope.mainText}
        </p>

        {/* Conseil */}
        <div className="bg-red-950/30 border border-red-900/40 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <p className="text-sm text-red-300 font-medium">
              {horoscope.conseil}
            </p>
          </div>
        </div>

        {/* PREMIUM Content */}
        {isPremium(horoscope) && (
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-1 gap-3">
              <Section icon="💞" title="Amour" content={horoscope.amour} />
              <Section icon="💼" title="Carrière" content={horoscope.carriere} />
              <Section icon="🌱" title="Relations" content={horoscope.relations} />
            </div>

            <AstraNote size="sm">
              {horoscope.astraNote}
            </AstraNote>
          </div>
        )}

        {/* ELITE Guardian Alert */}
        {isElite(horoscope) && horoscope.guardianAlert && (
          <div className={`
            bg-gradient-to-br from-red-950/40 to-black/60
            border-2 ${
              horoscope.guardianAlert.level === 'high' ? 'border-red-500/70' :
              horoscope.guardianAlert.level === 'medium' ? 'border-red-600/50' :
              'border-red-700/30'
            }
            rounded-xl p-4 mb-4
            animate-pulse-subtle
          `}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🛡️</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-red-400 mb-1">
                  GUARDIAN
                </p>
                <h4 className="text-sm font-bold text-white mb-2">
                  {horoscope.guardianAlert.title}
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {horoscope.guardianAlert.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Footer (FREE only) */}
        {tier === 'free' && (
          <div className="relative mt-4 p-4 bg-black/40 border border-red-900/20 rounded-lg">
            <p className="text-xs text-zinc-400 text-center">
              Débloque l'analyse complète <span className="text-red-400 font-semibold">Amour / Carrière / Relations</span> avec Premium
            </p>
            <button
              onClick={onUpgrade}
              className="mt-3 w-full py-2 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white text-sm font-semibold rounded-lg transition-all"
            >
              Voir Premium
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// Section helper component
function Section({ icon, title, content }: { icon: string; title: string; content: string }) {
  return (
    <div className="bg-black/30 border border-red-900/20 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{icon}</span>
        <h4 className="text-sm font-semibold text-red-400">{title}</h4>
      </div>
      <p className="text-xs text-zinc-300 leading-relaxed">
        {content}
      </p>
    </div>
  );
}
