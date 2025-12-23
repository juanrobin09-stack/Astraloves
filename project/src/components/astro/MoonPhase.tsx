import { getCurrentMoonPhase } from '../../lib/zodiacHelper';

export default function MoonPhase() {
  const moon = getCurrentMoonPhase();

  return (
    <div className="bg-gradient-to-br from-purple-900/15 to-black/90 border border-purple-500/30 rounded-2xl p-3 sm:p-5 flex gap-3 sm:gap-5 items-center">
      <div className="flex-shrink-0">
        <span className="text-4xl sm:text-6xl block">{moon.emoji}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-purple-400 text-base sm:text-lg font-bold mb-2 break-words">{moon.name}</h4>
        <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-3 break-words">{moon.description}</p>
        <div className="flex gap-2 items-start bg-black/30 rounded-lg p-2 sm:p-3">
          <span className="text-lg sm:text-xl flex-shrink-0">💕</span>
          <p className="text-white/80 text-[10px] sm:text-xs leading-relaxed italic break-words">{moon.loveAdvice}</p>
        </div>
      </div>
    </div>
  );
}
