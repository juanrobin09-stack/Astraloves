import { useState, useEffect } from 'react';
import { Crown, X } from 'lucide-react';
import { usePremiumStatus } from '../hooks/usePremiumStatus';

interface PremiumBannerProps {
  onUpgrade: () => void;
}

export default function PremiumBanner({ onUpgrade }: PremiumBannerProps) {
  const { isPremium } = usePremiumStatus();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkBannerVisibility();
  }, []);

  const checkBannerVisibility = () => {
    const dismissed = localStorage.getItem('premium_banner_dismissed');
    if (dismissed) {
      const dismissedAt = parseInt(dismissed);
      const now = Date.now();
      const hoursSinceDismissed = (now - dismissedAt) / (1000 * 60 * 60);

      if (hoursSinceDismissed < 24) {
        setIsVisible(false);
        return;
      }
    }
    setIsVisible(true);
  };

  const handleDismiss = () => {
    localStorage.setItem('premium_banner_dismissed', Date.now().toString());
    setIsVisible(false);
  };

  if (!isVisible || isPremium) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-safe">
      <div className="max-w-4xl mx-auto bg-gradient-to-r from-yellow-900/95 via-orange-900/95 to-red-900/95 backdrop-blur-lg rounded-2xl border-2 border-yellow-600/50 shadow-2xl">
        <div className="flex items-center gap-4 p-4">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-full flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm md:text-base">
              💎 Passez Premium : Swipes illimités, 30 messages/jour, analyses IA illimitées
            </p>
            <p className="text-yellow-200 text-xs md:text-sm">
              9,99€/mois • Résiliation en 1 clic
            </p>
          </div>

          <button
            onClick={onUpgrade}
            className="flex-shrink-0 px-4 py-2 bg-white hover:bg-gray-100 text-gray-900 rounded-lg font-bold text-sm transition-all"
          >
            En savoir plus →
          </button>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
