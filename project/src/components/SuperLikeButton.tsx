import { useState } from 'react';
import { Star } from 'lucide-react';
import { canSuperLike } from '../lib/premiumRestrictions';
import PremiumUpgradeModal from './PremiumUpgradeModal';

interface SuperLikeButtonProps {
  userProfile: {
    premium_tier?: 'free' | 'premium' | 'premium_elite' | null;
    daily_super_likes?: number;
  };
  onSuperLike: () => void;
  disabled?: boolean;
  className?: string;
}

export default function SuperLikeButton({
  userProfile,
  onSuperLike,
  disabled = false,
  className = ''
}: SuperLikeButtonProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const superLikeCheck = canSuperLike(userProfile);
  const remaining = 10 - (userProfile.daily_super_likes || 0);

  const handleClick = () => {
    if (!superLikeCheck.allowed) {
      setShowUpgradeModal(true);
      return;
    }

    onSuperLike();
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled || !superLikeCheck.allowed}
        className={`
          relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold
          bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500
          hover:from-yellow-600 hover:via-orange-600 hover:to-pink-600
          text-white shadow-lg hover:shadow-xl
          transform hover:scale-105 active:scale-95
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${className}
        `}
        title={superLikeCheck.allowed ? `${remaining} Super Likes restants` : superLikeCheck.reason}
      >
        <Star size={20} className="fill-current" />
        <span>Super Like</span>
        {superLikeCheck.allowed && (
          <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
            {remaining}
          </span>
        )}
      </button>

      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Super Like Elite 👑"
        message={superLikeCheck.reason || 'Les Super Likes sont réservés aux membres Elite !'}
        feature="10 Super Likes/jour pour te démarquer instantanément"
        onUpgrade={() => {
          window.location.href = '/subscription';
        }}
      />
    </>
  );
}
