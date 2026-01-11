// ═══════════════════════════════════════════════════════════════════════
// NATAL CHART CARD - Thème astral vivant (ELITE)
// ═══════════════════════════════════════════════════════════════════════

import { NatalChart, Tier } from '../../../types/astro-v2';
import UpgradePrompt from '../shared/UpgradePrompt';

interface NatalChartCardProps {
  natalChart?: NatalChart;
  tier: Tier;
  onUpgrade: () => void;
}

export default function NatalChartCard({ natalChart, tier, onUpgrade }: NatalChartCardProps) {
  if (tier !== 'elite') {
    return (
      <div className="relative bg-zinc-900 border border-red-900/30 rounded-xl p-5 min-h-[400px]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🌌</span>
          <h3 className="text-xl font-bold text-white">
            Thème Astral Vivant
          </h3>
        </div>

        {/* Locked overlay */}
        <UpgradePrompt
          targetTier="elite"
          message="Ton thème astral complet et évolutif. ASTRA le met à jour avec ton vécu réel pour comprendre tes blessures, moteurs et zones d'évitement."
          onUpgrade={onUpgrade}
        />
      </div>
    );
  }

  if (!natalChart) {
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

        @keyframes planetGlow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
          }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        className="bg-gradient-to-br from-black to-red-950/20 border border-red-500/50 rounded-xl p-5"
        style={{ animation: 'slideUpFade 0.6s ease-out 0.7s backwards' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🌌</span>
          <h3 className="text-xl font-bold text-white">
            Thème Astral Vivant
          </h3>
          <div className="ml-auto px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 rounded-full">
            <span className="text-xs font-bold text-white">👑 ELITE</span>
          </div>
        </div>

        {/* Astral wheel placeholder */}
        <div className="relative mb-6">
          <div className="aspect-square max-w-[200px] mx-auto relative">
            {/* Outer circle */}
            <div 
              className="absolute inset-0 rounded-full border-2 border-red-500/30"
              style={{ animation: 'rotate 60s linear infinite' }}
            >
              {/* Zodiac markers */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-red-400 rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `rotate(${i * 30}deg) translateY(-98px)`,
                  }}
                />
              ))}
            </div>

            {/* Middle circle */}
            <div className="absolute inset-4 rounded-full border border-red-500/20" />

            {/* Inner circle */}
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-red-950/40 to-black flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-1">✨</div>
                <div className="text-xs text-red-400 font-semibold">TOI</div>
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-400 text-center mt-3">
            Roue astrologique interactive (Version simplifiée)
          </p>
        </div>

        {/* Big Three */}
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-semibold text-red-400">Les Trois Piliers</h4>

          {/* Sun */}
          <PlanetCard
            symbol="☉"
            name="Soleil"
            sign={natalChart.sun.sign}
            house={natalChart.sun.house}
            meaning={natalChart.sun.meaning}
            color="from-red-600 to-red-700"
          />

          {/* Moon */}
          <PlanetCard
            symbol="☽"
            name="Lune"
            sign={natalChart.moon.sign}
            house={natalChart.moon.house}
            meaning={natalChart.moon.meaning}
            color="from-red-700 to-red-800"
          />

          {/* Ascendant */}
          <div className="bg-black/40 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-800 rounded-lg flex items-center justify-center text-2xl shadow-lg shadow-red-500/30">
                ♓
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-bold text-white">Ascendant {natalChart.ascendant.sign}</h5>
                <p className="text-xs text-zinc-500">Masque social</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-zinc-300">
              <p><span className="text-red-400 font-semibold">Masque:</span> {natalChart.ascendant.meaning.mask}</p>
              <p><span className="text-red-400 font-semibold">Évitement:</span> {natalChart.ascendant.meaning.avoidance}</p>
              <p><span className="text-red-400 font-semibold">Défi:</span> {natalChart.ascendant.meaning.challenge}</p>
            </div>
          </div>
        </div>

        {/* Live Updates */}
        {natalChart.liveUpdates && natalChart.liveUpdates.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-red-400 mb-3">
              Mis à jour par l'IA
            </h4>

            <div className="space-y-2">
              {natalChart.liveUpdates.slice(0, 3).map((update, i) => (
                <div
                  key={i}
                  className="bg-red-950/20 border border-red-900/30 rounded-lg p-3"
                >
                  <p className="text-xs text-zinc-500 mb-1">
                    {new Date(update.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </p>
                  <p className="text-xs text-zinc-300">
                    {update.observation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deep dive sections */}
        <div className="space-y-4">
          {/* Chiron */}
          {natalChart.chiron && (
            <DeepSection
              title="Blessure Chirurgicale"
              icon="🩹"
              planet={natalChart.chiron}
            />
          )}

          {/* North Node */}
          {natalChart.northNode && (
            <DeepSection
              title="Nœud Nord (Direction de l'âme)"
              icon="🧭"
              planet={natalChart.northNode}
            />
          )}
        </div>
      </div>
    </>
  );
}

// Planet Card component
function PlanetCard({
  symbol,
  name,
  sign,
  house,
  meaning,
  color
}: {
  symbol: string;
  name: string;
  sign: string;
  house: number;
  meaning: any;
  color: string;
}) {
  return (
    <div 
      className="bg-black/40 border border-red-500/30 rounded-lg p-4"
      style={{ animation: 'planetGlow 4s ease-in-out infinite' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center text-2xl shadow-lg shadow-red-500/30`}>
          {symbol}
        </div>
        <div className="flex-1">
          <h5 className="text-sm font-bold text-white capitalize">
            {name} en {sign}
          </h5>
          <p className="text-xs text-zinc-500">Maison {house}</p>
        </div>
      </div>

      <div className="space-y-2 text-xs text-zinc-300">
        {meaning.core && (
          <p><span className="text-red-400 font-semibold">Identité:</span> {meaning.core}</p>
        )}
        {meaning.wound && (
          <p><span className="text-red-400 font-semibold">Blessure:</span> {meaning.wound}</p>
        )}
        {meaning.work && (
          <p><span className="text-red-400 font-semibold">Travail:</span> {meaning.work}</p>
        )}
        {meaning.motor && (
          <p><span className="text-red-400 font-semibold">Moteur:</span> {meaning.motor}</p>
        )}
        {meaning.trap && (
          <p><span className="text-red-400 font-semibold">Piège:</span> {meaning.trap}</p>
        )}
        {meaning.challenge && (
          <p><span className="text-red-400 font-semibold">Défi:</span> {meaning.challenge}</p>
        )}
      </div>
    </div>
  );
}

// Deep section component
function DeepSection({ title, icon, planet }: { title: string; icon: string; planet: any }) {
  return (
    <div className="bg-gradient-to-br from-red-950/30 to-black/60 border border-red-500/40 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h5 className="text-sm font-bold text-white">{title}</h5>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-white font-semibold capitalize">
          {planet.sign}, Maison {planet.house}
        </p>

        <div className="space-y-2 text-xs text-zinc-300">
          {planet.meaning.core && <p>{planet.meaning.core}</p>}
          {planet.meaning.wound && (
            <p><span className="text-red-400">Se manifeste par:</span> {planet.meaning.wound}</p>
          )}
          {planet.meaning.work && (
            <p><span className="text-red-400">Guérison:</span> {planet.meaning.work}</p>
          )}
        </div>
      </div>
    </div>
  );
}
