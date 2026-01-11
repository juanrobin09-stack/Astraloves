// ═══════════════════════════════════════════════════════════════════════
// HISTORY CARD - Historique énergies avec graphiques (PREMIUM)
// ═══════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { HistoryData, Tier } from '../../../types/astro-v2';
import UpgradePrompt from '../shared/UpgradePrompt';

interface HistoryCardProps {
  history: HistoryData;
  tier: Tier;
  onUpgrade: () => void;
}

export default function HistoryCard({ history, tier, onUpgrade }: HistoryCardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>(history.period);

  if (tier === 'free') {
    return (
      <div className="relative bg-zinc-900 border border-red-900/30 rounded-xl p-5 min-h-[300px]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📊</span>
          <h3 className="text-xl font-bold text-white">
            Historique Astro
          </h3>
        </div>

        {/* Locked overlay */}
        <UpgradePrompt
          targetTier="premium"
          message="Visualise l'évolution de tes énergies et comprends tes patterns sur le long terme."
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

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div
        className="bg-zinc-900 border border-red-900/30 rounded-xl p-5"
        style={{ animation: 'slideUpFade 0.6s ease-out 0.6s backwards' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📊</span>
          <h3 className="text-xl font-bold text-white">
            Historique Astro
          </h3>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`
                flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all
                ${selectedPeriod === period
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30'
                  : 'bg-black/40 text-zinc-400 hover:text-white'}
              `}
            >
              {period === '7d' ? 'Semaine' : period === '30d' ? 'Mois' : 'Trimestre'}
            </button>
          ))}
        </div>

        {/* Simple line chart */}
        <div className="bg-black/40 border border-red-900/20 rounded-lg p-4 mb-4">
          <div className="h-32 relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-zinc-600">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>

            {/* Chart area */}
            <div className="ml-8 h-full relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-px bg-zinc-800/50" />
                ))}
              </div>

              {/* Data lines */}
              <svg className="absolute inset-0 w-full h-full" style={{ animation: 'fadeIn 0.8s ease-out' }}>
                {/* Vitalité line */}
                <polyline
                  points={history.data.map((d, i) => 
                    `${(i / (history.data.length - 1)) * 100},${100 - d.energies.vitality.value}`
                  ).join(' ')}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                  className="opacity-80"
                />

                {/* Love line */}
                <polyline
                  points={history.data.map((d, i) => 
                    `${(i / (history.data.length - 1)) * 100},${100 - d.energies.love.value}`
                  ).join(' ')}
                  fill="none"
                  stroke="#f87171"
                  strokeWidth="2"
                  strokeDasharray="3 2"
                  vectorEffect="non-scaling-stroke"
                  className="opacity-60"
                />
              </svg>

              {/* X-axis labels (dates) */}
              <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-[9px] text-zinc-600">
                <span>
                  {new Date(history.data[0].date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </span>
                <span>Aujourd'hui</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-8 pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-red-500" />
              <span className="text-xs text-zinc-400">Vitalité</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-red-400" style={{ borderTop: '1px dashed' }} />
              <span className="text-xs text-zinc-400">Amour</span>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-semibold text-red-400">Insights</h4>
          {history.insights.map((insight, i) => (
            <div
              key={i}
              className="bg-black/30 border border-red-900/20 rounded-lg p-3"
            >
              <p className="text-xs text-zinc-300 leading-relaxed">
                {insight}
              </p>
            </div>
          ))}
        </div>

        {/* Evolution metrics */}
        <div className="bg-gradient-to-br from-red-950/20 to-black/40 border border-red-900/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-3">
            Évolution sur {selectedPeriod === '7d' ? '7 jours' : selectedPeriod === '30d' ? '30 jours' : '90 jours'}
          </h4>

          <div className="space-y-3">
            {/* Challenges completed */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-zinc-400 mb-1">Challenges accomplis</p>
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-bold text-white">
                    {history.evolution.challengesCompleted.total}
                  </p>
                  <div
                    className={`
                      text-xs font-semibold px-2 py-0.5 rounded
                      ${history.evolution.challengesCompleted.trend > 0
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-zinc-700 text-zinc-400'}
                    `}
                  >
                    {history.evolution.challengesCompleted.trend > 0 ? '+' : ''}
                    {history.evolution.challengesCompleted.trend}
                  </div>
                </div>
              </div>
            </div>

            {/* Alignment average */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-zinc-400 mb-1">Alignement moyen</p>
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-bold text-white">
                    {history.evolution.alignmentAverage.value}%
                  </p>
                  <div
                    className={`
                      text-xs font-semibold px-2 py-0.5 rounded
                      ${history.evolution.alignmentAverage.trend > 0
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-zinc-700 text-zinc-400'}
                    `}
                  >
                    {history.evolution.alignmentAverage.trend > 0 ? '+' : ''}
                    {history.evolution.alignmentAverage.trend}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
