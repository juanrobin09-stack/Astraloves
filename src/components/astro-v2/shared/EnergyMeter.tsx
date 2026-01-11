// ═══════════════════════════════════════════════════════════════════════
// ENERGY METER - Jauge d'énergie animée
// ═══════════════════════════════════════════════════════════════════════

import { Energy } from '../../../types/astro-v2';

interface EnergyMeterProps {
  label: string;
  energy: Energy;
}

export default function EnergyMeter({ label, energy }: EnergyMeterProps) {
  const { value, description, icon } = energy;

  return (
    <>
      <style>{`
        @keyframes fillBar {
          from { width: 0%; }
          to { width: var(--target-width); }
        }
      `}</style>

      <div className="bg-zinc-900 border border-red-900/30 rounded-xl p-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{icon}</span>
          <div className="flex-1">
            <p className="text-xs font-semibold text-zinc-400">{label}</p>
            <p className="text-[10px] text-zinc-500">{description}</p>
          </div>
          <span className="text-base font-bold text-red-400">{value}%</span>
        </div>

        {/* Bar */}
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full"
            style={{
              '--target-width': `${value}%`,
              animation: 'fillBar 1s ease-out forwards',
            } as React.CSSProperties}
          />
        </div>
      </div>
    </>
  );
}
