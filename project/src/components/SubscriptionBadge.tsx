import { SubscriptionTier } from '../lib/subscriptionLimits';
import { getBadge } from '../lib/premiumRestrictions';

interface SubscriptionBadgeProps {
  subscriptionTier?: SubscriptionTier | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function SubscriptionBadge({
  subscriptionTier,
  size = 'md',
  className = ''
}: SubscriptionBadgeProps) {
  const badge = getBadge(subscriptionTier);

  if (!badge) return null;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const bgClasses = subscriptionTier === 'elite'
    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
    : 'bg-gradient-to-r from-red-500 to-pink-500';

  return (
    <span
      className={`inline-flex items-center gap-1 ${bgClasses} text-white font-bold rounded-full ${sizeClasses[size]} shadow-lg ${className}`}
      title={subscriptionTier === 'elite' ? 'Membre Elite' : 'Membre Premium'}
    >
      {badge}
    </span>
  );
}
