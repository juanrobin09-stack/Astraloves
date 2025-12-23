import { getAstroAlerts } from '../../lib/astroData';

export default function AstroAlert() {
  const alerts = getAstroAlerts();

  if (!alerts.length) return null;

  return (
    <div className="bg-gradient-to-r from-orange-900/20 to-orange-600/10 border border-orange-500/40 rounded-2xl p-3 sm:p-4 flex gap-2 sm:gap-3 items-start mb-5">
      <span className="text-xl sm:text-2xl flex-shrink-0">⚠️</span>
      <div className="flex-1 min-w-0">
        <strong className="text-orange-500 block mb-1 text-xs sm:text-sm font-bold break-words">{alerts[0].title}</strong>
        <p className="text-white/80 text-xs sm:text-sm leading-relaxed break-words">{alerts[0].message}</p>
      </div>
    </div>
  );
}
