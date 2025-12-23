import { SubscriptionTier } from '../lib/subscriptionLimits';
import { Crown, TrendingUp } from 'lucide-react';

interface EliteBadgesProps {
  subscriptionTier?: SubscriptionTier | null;
  showTopBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function EliteBadges({
  subscriptionTier,
  showTopBadge = true,
  size = 'md',
  className = ''
}: EliteBadgesProps) {
  if (!subscriptionTier || subscriptionTier === 'free') return null;

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-base gap-2'
  };

  const isElite = subscriptionTier === 'premium_elite';

  return (
    <div className={`flex items-center ${sizeClasses[size]} ${className}`}>
      {/* Badge Premium/Elite */}
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full font-bold shadow-lg ${
          isElite
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black'
            : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
        }`}
        title={isElite ? 'Membre Elite' : 'Membre Premium'}
      >
        {isElite ? (
          <>
            <Crown size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} className="mr-1" />
            Elite
          </>
        ) : (
          <>
            💎 Premium
          </>
        )}
      </span>

      {/* Badge Top 1% pour Elite uniquement */}
      {isElite && showTopBadge && (
        <span
          className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold shadow-lg"
          title="Profil Top 1%"
        >
          <TrendingUp size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} className="mr-1" />
          Top 1%
        </span>
      )}
    </div>
  );
}
