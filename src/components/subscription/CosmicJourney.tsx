import { motion } from 'framer-motion';
import { Lock, Sparkles, Crown } from 'lucide-react';
import type { SubscriptionTier } from '@/types';

interface CosmicJourneyProps {
  currentTier: SubscriptionTier;
}

export function CosmicJourney({ currentTier }: CosmicJourneyProps) {
  const tiers = [
    { name: 'FREE', icon: Lock, color: 'white/40', position: 0 },
    { name: 'PREMIUM', icon: Sparkles, color: 'purple', position: 50 },
    { name: 'ELITE', icon: Crown, color: 'gold', position: 100 },
  ];

  const getCurrentPosition = () => {
    if (currentTier === 'free') return 0;
    if (currentTier === 'premium') return 50;
    return 100;
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 rounded-full -translate-y-1/2" />
        <motion.div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-white/40 via-cosmic-purple to-cosmic-gold rounded-full -translate-y-1/2"
          initial={{ width: '0%' }}
          animate={{ width: `${getCurrentPosition()}%` }}
          transition={{ duration: 1, delay: 0.3 }}
        />
        <div className="relative flex justify-between">
          {tiers.map((tier, i) => {
            const Icon = tier.icon;
            const isActive = (i === 0 && currentTier === 'free') ||
                            (i === 1 && currentTier === 'premium') ||
                            (i === 2 && currentTier === 'elite');
            return (
              <motion.div key={tier.name} className="flex flex-col items-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.2 }}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${isActive ? 'bg-cosmic-purple shadow-lg' : 'bg-white/10'}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold">{tier.name}</p>
                {isActive && <div className="mt-2 px-3 py-1 glass-effect rounded-full text-xs">Vous êtes ici</div>}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
