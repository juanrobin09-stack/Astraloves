import { Crown, Infinity, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PremiumCounterProps {
  current: number;
  limit: number | null;
  isPremium: boolean;
  type: 'swipes' | 'messages' | 'astra';
  resetAt?: Date;
  className?: string;
}

export default function PremiumCounter({
  current,
  limit,
  isPremium,
  type,
  resetAt,
  className = '',
}: PremiumCounterProps) {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!resetAt) return;

    const updateTime = () => {
      const now = new Date();
      const diff = resetAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Maintenant');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [resetAt]);

  const labels = {
    swipes: 'Swipes',
    messages: 'Messages matchs',
    astra: 'Chat Astra',
  };

  const percentage = limit ? Math.min((current / limit) * 100, 100) : 0;
  const isNearLimit = limit && current >= limit * 0.8;
  const isAtLimit = limit && current >= limit;

  if (isPremium && !limit) {
    return (
      <div
        className={`bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500/40 rounded-xl px-4 py-3 shadow-lg ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span className="text-white font-bold text-sm">{labels[type]}</span>
          </div>
          <div className="flex items-center gap-2">
            <Infinity className="w-5 h-5 text-yellow-500" />
            <span className="text-yellow-500 font-bold text-sm">Illimité</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-black/60 backdrop-blur-lg border-2 ${
        isAtLimit
          ? 'border-red-600/60'
          : isNearLimit
          ? 'border-orange-500/40'
          : 'border-red-600/30'
      } rounded-xl px-4 py-3 shadow-lg transition-all ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-300 font-medium text-sm">{labels[type]}</span>
        <div className="flex items-center gap-2">
          <span
            className={`font-bold text-sm ${
              isAtLimit ? 'text-red-500' : isNearLimit ? 'text-orange-500' : 'text-white'
            }`}
          >
            {current}
          </span>
          <span className="text-gray-500 text-sm">/ {limit}</span>
        </div>
      </div>

      <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full transition-all duration-500 ${
            isAtLimit
              ? 'bg-gradient-to-r from-red-600 to-red-700'
              : isNearLimit
              ? 'bg-gradient-to-r from-orange-500 to-red-600'
              : 'bg-gradient-to-r from-red-500 to-red-600'
          }`}
          style={{ width: `${percentage}%` }}
        >
          {!isAtLimit && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        {isAtLimit ? (
          <span className="text-red-500 text-xs font-medium">Limite atteinte</span>
        ) : (
          <span className="text-gray-500 text-xs">
            {limit && limit - current} restant{limit && limit - current > 1 ? 's' : ''}
          </span>
        )}

        {resetAt && timeRemaining && (
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <Clock className="w-3 h-3" />
            <span>Reset : {timeRemaining}</span>
          </div>
        )}
      </div>

      {isAtLimit && (
        <div className="mt-2 pt-2 border-t border-red-600/20">
          <button
            onClick={() => (window.location.href = '/premium')}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-bold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5"
          >
            <Crown className="w-3.5 h-3.5" />
            Passer Premium
          </button>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
