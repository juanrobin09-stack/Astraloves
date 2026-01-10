import { useSubscription } from '../../context/SubscriptionContext';
import type { LimitName } from '../../types/subscription';
import { LIMIT_DESCRIPTIONS } from '../../config/subscriptionPlans';

interface UsageIndicatorProps {
  limitName: LimitName;
  showLabel?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'bar' | 'circle' | 'text';
  className?: string;
}

export function UsageIndicator({
  limitName,
  showLabel = true,
  showIcon = true,
  size = 'md',
  variant = 'bar',
  className = '',
}: UsageIndicatorProps) {
  const { canPerformAction } = useSubscription();
  const result = canPerformAction(limitName);
  const description = LIMIT_DESCRIPTIONS[limitName];

  const percentage = result.isUnlimited
    ? 0
    : Math.min(100, (result.used / result.limit) * 100);

  const getBarColor = () => {
    if (result.isUnlimited) return 'bg-green-500';
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const sizeClasses = {
    sm: { bar: 'h-1.5', text: 'text-xs', icon: 'text-sm' },
    md: { bar: 'h-2', text: 'text-sm', icon: 'text-base' },
    lg: { bar: 'h-3', text: 'text-base', icon: 'text-lg' },
  };

  if (variant === 'text') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showIcon && <span className={sizeClasses[size].icon}>{description?.icon}</span>}
        <span className={`${sizeClasses[size].text} text-gray-300`}>
          {result.isUnlimited ? (
            <span className="text-emerald-400">Illimite</span>
          ) : (
            <>
              <span className={percentage >= 90 ? 'text-red-400' : 'text-white'}>
                {result.remaining}
              </span>
              <span className="text-gray-500">/{result.limit}</span>
            </>
          )}
        </span>
        {showLabel && (
          <span className={`${sizeClasses[size].text} text-gray-500`}>
            {description?.label}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'circle') {
    const circumference = 2 * Math.PI * 18;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <svg className="w-12 h-12 transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="18"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-gray-700"
          />
          <circle
            cx="24"
            cy="24"
            r="18"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={result.isUnlimited ? 0 : strokeDashoffset}
            strokeLinecap="round"
            className={getBarColor().replace('bg-', 'text-')}
          />
        </svg>
        <span className="absolute text-xs font-medium text-white">
          {result.isUnlimited ? '∞' : result.remaining}
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {(showLabel || showIcon) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {showIcon && <span className={sizeClasses[size].icon}>{description?.icon}</span>}
            {showLabel && (
              <span className={`${sizeClasses[size].text} text-gray-400`}>
                {description?.label}
              </span>
            )}
          </div>
          <span className={`${sizeClasses[size].text} text-gray-300`}>
            {result.isUnlimited ? (
              <span className="text-emerald-400">∞</span>
            ) : (
              <>
                <span className={percentage >= 90 ? 'text-red-400' : 'text-white'}>
                  {result.remaining}
                </span>
                <span className="text-gray-500">/{result.limit}</span>
              </>
            )}
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size].bar}`}>
        <div
          className={`${sizeClasses[size].bar} ${getBarColor()} rounded-full transition-all duration-300`}
          style={{ width: result.isUnlimited ? '100%' : `${100 - percentage}%` }}
        />
      </div>
    </div>
  );
}

export function UsageSummary({ className = '' }: { className?: string }) {
  const limits: LimitName[] = [
    'cosmicSignalsPerDay',
    'astraMessagesPerDay',
    'matchMessagesPerDay',
    'superNovaPerDay',
    'superLikesPerDay',
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      {limits.map(limit => (
        <UsageIndicator key={limit} limitName={limit} size="sm" />
      ))}
    </div>
  );
}
