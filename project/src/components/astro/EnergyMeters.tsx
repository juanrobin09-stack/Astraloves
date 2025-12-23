import { getSignEnergies } from '../../lib/astroData';
import { useEffect, useState } from 'react';

interface EnergyMetersProps {
  sign: string;
}

export default function EnergyMeters({ sign }: EnergyMetersProps) {
  const [energies, setEnergies] = useState(getSignEnergies(sign));

  useEffect(() => {
    const updateEnergies = () => {
      setEnergies(getSignEnergies(sign));
    };

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    const timer = setTimeout(() => {
      updateEnergies();
      const dailyTimer = setInterval(updateEnergies, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyTimer);
    }, timeUntilMidnight);

    return () => clearTimeout(timer);
  }, [sign]);

  const bars = [
    { label: '💕 Amour', value: energies.love, gradient: 'from-red-600 to-red-400' },
    { label: '⚡ Énergie', value: energies.energy, gradient: 'from-yellow-500 to-orange-400' },
    { label: '🍀 Chance', value: energies.luck, gradient: 'from-green-500 to-emerald-400' },
    { label: '💬 Communication', value: energies.communication, gradient: 'from-blue-500 to-cyan-400' }
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      {bars.map((bar) => (
        <div key={bar.label} className="flex items-center gap-2 sm:gap-3">
          <span className="w-24 sm:w-32 text-white/80 text-xs sm:text-sm font-medium break-words">{bar.label}</span>
          <div className="flex-1 h-2 sm:h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${bar.gradient} transition-all duration-1000 ease-out rounded-full`}
              style={{ width: `${bar.value}%` }}
            />
          </div>
          <span className="w-10 sm:w-12 text-right text-white/60 text-xs sm:text-sm font-semibold">{bar.value}%</span>
        </div>
      ))}
    </div>
  );
}
