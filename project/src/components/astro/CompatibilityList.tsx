import { compatibilityData } from '../../lib/astroData';
import { getZodiacEmoji } from '../../lib/zodiacHelper';

interface CompatibilityListProps {
  userSign: string;
}

export default function CompatibilityList({ userSign }: CompatibilityListProps) {
  const compatibilities = compatibilityData[userSign] || compatibilityData["Bélier"];

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h4 className="text-white/70 text-xs sm:text-sm font-semibold mb-3 flex items-center gap-2 break-words">
          🔥 Top compatibilité
        </h4>
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          {compatibilities.best.map((sign) => (
            <div
              key={sign}
              className="bg-black/60 border border-red-600/50 rounded-xl px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3 flex-1 min-w-[120px] sm:min-w-[140px]"
            >
              <span className="text-2xl sm:text-3xl flex-shrink-0">{getZodiacEmoji(sign)}</span>
              <div className="flex-1 min-w-0">
                <span className="text-white font-semibold text-xs sm:text-sm block break-words">{sign}</span>
                <span className="text-red-500 text-[10px] sm:text-xs font-bold">95%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-white/70 text-xs sm:text-sm font-semibold mb-3 flex items-center gap-2 break-words">
          💚 Bonne entente
        </h4>
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          {compatibilities.good.map((sign) => (
            <div
              key={sign}
              className="bg-black/60 border border-green-600/50 rounded-xl px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3 flex-1 min-w-[120px] sm:min-w-[140px]"
            >
              <span className="text-2xl sm:text-3xl flex-shrink-0">{getZodiacEmoji(sign)}</span>
              <div className="flex-1 min-w-0">
                <span className="text-white font-semibold text-xs sm:text-sm block break-words">{sign}</span>
                <span className="text-green-500 text-[10px] sm:text-xs font-bold">75%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-white/70 text-xs sm:text-sm font-semibold mb-3 flex items-center gap-2 break-words">
          ⚡ Défi du jour
        </h4>
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          {compatibilities.challenge.map((sign) => (
            <div
              key={sign}
              className="bg-black/60 border border-orange-600/50 rounded-xl px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3 flex-1 min-w-[120px] sm:min-w-[140px]"
            >
              <span className="text-2xl sm:text-3xl flex-shrink-0">{getZodiacEmoji(sign)}</span>
              <div className="flex-1 min-w-0">
                <span className="text-white font-semibold text-xs sm:text-sm block break-words">{sign}</span>
                <span className="text-orange-500 text-[10px] sm:text-xs font-bold">55%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
