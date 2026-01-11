// ═══════════════════════════════════════════════════════════════════════
// ENERGIES CARD - Énergies du jour (FREE)
// ═══════════════════════════════════════════════════════════════════════

import { DailyEnergies } from '../../../types/astro-v2';
import EnergyMeter from '../shared/EnergyMeter';
import AstraNote from '../shared/AstraNote';

interface EnergiesCardProps {
  energies: DailyEnergies;
}

export default function EnergiesCard({ energies }: EnergiesCardProps) {
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
        style={{ animation: 'slideUpFade 0.6s ease-out 0.1s backwards' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">⚡</span>
          <h3 className="text-xl font-bold text-white">
            Énergies du Jour
          </h3>
        </div>

        {/* Grid de jauges */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <EnergyMeter label="Vitalité" energy={energies.vitality} />
          <EnergyMeter label="Créativité" energy={energies.creativity} />
          <EnergyMeter label="Amour" energy={energies.love} />
          <EnergyMeter label="Chance" energy={energies.luck} />
        </div>

        <AstraNote size="sm">
          Ces énergies sont basées sur les transits du jour appliqués à ton thème natal.
        </AstraNote>
      </div>
    </>
  );
}
