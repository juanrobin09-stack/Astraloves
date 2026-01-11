// ═══════════════════════════════════════════════════════════════════════
// UPGRADE PROMPT - CTA pour upgrade Premium/Elite
// ═══════════════════════════════════════════════════════════════════════

import { Tier } from '../../../types/astro-v2';

interface UpgradePromptProps {
  targetTier: 'premium' | 'elite';
  message: string;
  onUpgrade: () => void;
}

export default function UpgradePrompt({ targetTier, message, onUpgrade }: UpgradePromptProps) {
  const config = {
    premium: {
      icon: '💎',
      title: 'Passe en Premium',
      price: '9,99€',
      gradient: 'from-red-700 to-red-800',
      hoverGradient: 'hover:from-red-800 hover:to-red-900',
    },
    elite: {
      icon: '👑',
      title: 'Passe en Elite',
      price: '14,99€',
      gradient: 'from-red-600 to-red-700',
      hoverGradient: 'hover:from-red-700 hover:to-red-800',
    },
  };

  const { icon, title, price, gradient, hoverGradient } = config[targetTier];

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center p-6">
      <div className="bg-gradient-to-br from-red-950/90 to-black/90 border-2 border-red-500/50 rounded-2xl p-6 text-center max-w-sm">
        {/* Icon */}
        <div className={`
          w-14 h-14 mx-auto mb-4
          bg-gradient-to-br ${gradient}
          rounded-full flex items-center justify-center
          shadow-lg shadow-red-500/50
        `}>
          <span className="text-2xl">{icon}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-zinc-300 mb-4">
          {message}
        </p>

        {/* Price */}
        <div className="text-2xl font-bold text-red-400 mb-4">
          {price}/mois
        </div>

        {/* Button */}
        <button
          onClick={onUpgrade}
          className={`
            w-full py-3
            bg-gradient-to-r ${gradient} ${hoverGradient}
            text-white font-bold rounded-xl
            transition-all duration-300
            shadow-lg shadow-red-500/30
          `}
        >
          Débloquer
        </button>
      </div>
    </div>
  );
}
