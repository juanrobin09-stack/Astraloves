// ═══════════════════════════════════════════════════════════════════════
// TIER BADGE - Badge FREE/PREMIUM/ELITE avec animations
// ═══════════════════════════════════════════════════════════════════════

import { Tier } from '../../../types/astro-v2';

interface TierBadgeProps {
  tier: Tier;
}

export default function TierBadge({ tier }: TierBadgeProps) {
  const config = {
    free: {
      gradient: 'from-zinc-700 to-zinc-800',
      text: '✓ GRATUIT',
      shadow: 'shadow-zinc-500/20',
    },
    premium: {
      gradient: 'from-red-700 to-red-800',
      text: '💎 PREMIUM',
      shadow: 'shadow-red-500/30',
    },
    elite: {
      gradient: 'from-red-600 to-red-700',
      text: '👑 ÉLITE',
      shadow: 'shadow-red-500/40',
    },
  };

  const { gradient, text, shadow } = config[tier];

  return (
    <>
      <style>{`
        @keyframes badgePulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
      `}</style>
      
      <div className="relative">
        {/* Glow effect */}
        <div 
          className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-full blur-md opacity-40`}
          style={{ animation: 'badgePulse 2s ease-in-out infinite' }}
        />
        
        {/* Badge */}
        <span className={`
          relative inline-flex items-center gap-1.5
          bg-gradient-to-r ${gradient}
          text-white text-[11px] font-bold
          px-3 py-1.5 rounded-full
          ${shadow}
          border border-white/20
        `}>
          {text}
        </span>
      </div>
    </>
  );
}
