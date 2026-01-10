import { dailyTips } from '../../lib/astroData';

interface AstraTipProps {
  sign: string;
}

export default function AstraTip({ sign }: AstraTipProps) {
  const tip = dailyTips[sign] || dailyTips["Bélier"];

  return (
    <div className="bg-gradient-to-r from-red-900/10 to-black/90 border border-red-500/20 rounded-2xl p-3 sm:p-5 flex gap-3 sm:gap-4 items-start">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-600 to-red-400 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-xl sm:text-2xl">⭐</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white/90 text-xs sm:text-sm leading-relaxed italic mb-2 break-words">"{tip}"</p>
        <span className="text-red-500 text-[10px] sm:text-xs font-semibold break-words">— Astra 💫</span>
      </div>
    </div>
  );
}
