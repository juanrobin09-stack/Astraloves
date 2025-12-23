import { useSubscription } from '../../context/SubscriptionContext';
import type { PlanId } from '../../types/subscription';

interface CurrentPlanBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

const planStyles: Record<PlanId, { bg: string; text: string; border: string; glow?: string }> = {
  free: {
    bg: 'bg-gray-800/80',
    text: 'text-gray-300',
    border: 'border-gray-600',
  },
  premium: {
    bg: 'bg-gradient-to-r from-purple-600/80 to-violet-600/80',
    text: 'text-white',
    border: 'border-purple-400/50',
    glow: 'shadow-lg shadow-purple-500/30',
  },
  premium_elite: {
    bg: 'bg-gradient-to-r from-amber-500/90 to-yellow-500/90',
    text: 'text-black',
    border: 'border-amber-300/50',
    glow: 'shadow-lg shadow-amber-500/40',
  },
};

export function CurrentPlanBadge({
  size = 'md',
  showName = true,
  className = '',
}: CurrentPlanBadgeProps) {
  const { currentPlan } = useSubscription();
  const styles = planStyles[currentPlan.id];

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${styles.bg} ${styles.text} ${styles.border} ${styles.glow || ''}
        border backdrop-blur-sm
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <span>{currentPlan.icon}</span>
      {showName && <span>{currentPlan.name}</span>}
    </div>
  );
}

export function PlanIcon({ planId, size = 'md' }: { planId: PlanId; size?: 'sm' | 'md' | 'lg' }) {
  const iconSizes = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' };
  const styles = planStyles[planId];

  const icons: Record<PlanId, string> = {
    free: '✨',
    premium: '💎',
    premium_elite: '👑',
  };

  return (
    <span
      className={`
        ${iconSizes[size]}
        ${planId === 'premium_elite' ? 'animate-pulse' : ''}
      `}
    >
      {icons[planId]}
    </span>
  );
}
