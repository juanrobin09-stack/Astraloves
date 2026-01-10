import { Shield, CheckCircle } from 'lucide-react';

interface VerificationBadgeProps {
  isVerified?: boolean;
  isPremium?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function VerificationBadge({
  isVerified = false,
  isPremium = false,
  size = 'md',
  showLabel = false
}: VerificationBadgeProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSize = sizes[size];

  if (!isVerified && !isPremium) return null;

  return (
    <div className="inline-flex items-center gap-1">
      {isPremium && (
        <div className="relative group">
          <div className={`${iconSize} flex items-center justify-center`}>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full animate-pulse" />
            <Shield className={`${iconSize} text-black relative z-10`} fill="currentColor" />
          </div>
          {showLabel && (
            <span className="ml-1 text-xs font-semibold text-yellow-500">Premium</span>
          )}
        </div>
      )}
      {isVerified && (
        <div className="relative group">
          <div className={`${iconSize} flex items-center justify-center`}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full" />
            <CheckCircle className={`${iconSize} text-white relative z-10`} fill="currentColor" />
          </div>
          {showLabel && (
            <span className="ml-1 text-xs font-semibold text-blue-500">Vérifié</span>
          )}
        </div>
      )}
    </div>
  );
}
