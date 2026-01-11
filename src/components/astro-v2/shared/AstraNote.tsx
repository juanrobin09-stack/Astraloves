// ═══════════════════════════════════════════════════════════════════════
// ASTRA NOTE - Note ASTRA stylisée avec voix distinctive
// ═══════════════════════════════════════════════════════════════════════

interface AstraNoteProps {
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

export default function AstraNote({ children, size = 'md' }: AstraNoteProps) {
  return (
    <div className={`
      bg-red-950/20 border border-red-900/30 rounded-lg
      ${size === 'sm' ? 'p-3' : 'p-4'}
    `}>
      <div className="flex items-start gap-3">
        <div className="
          w-8 h-8 flex-shrink-0
          bg-gradient-to-br from-red-600 to-red-700
          rounded-lg flex items-center justify-center
          shadow-lg shadow-red-500/30
        ">
          <span className="text-white text-sm">✨</span>
        </div>
        
        <div className="flex-1">
          <p className={`
            text-[10px] uppercase tracking-wide font-bold text-red-400 mb-1
          `}>
            ASTRA
          </p>
          <p className={`
            text-zinc-300 leading-relaxed
            ${size === 'sm' ? 'text-xs' : 'text-sm'}
          `}>
            {children}
          </p>
        </div>
      </div>
    </div>
  );
}
