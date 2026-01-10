import { Sparkles, Crown } from 'lucide-react';
import { PlanTier, PLAN_NAMES, PLAN_COLORS } from '../config/subscriptionLimits';

interface TierBadgeProps {
  tier: PlanTier;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  animated?: boolean;
}

export default function TierBadge({
  tier,
  size = 'medium',
  showName = true,
  animated = true,
}: TierBadgeProps) {
  
  const getIcon = () => {
    switch (tier) {
      case 'premium':
        return <Sparkles size={iconSize} />;
      case 'premium_elite':
        return <Crown size={iconSize} />;
      default:
        return null;
    }
  };

  const iconSize = {
    small: 12,
    medium: 16,
    large: 20,
  }[size];

  const padding = {
    small: '4px 8px',
    medium: '6px 12px',
    large: '8px 16px',
  }[size];

  const fontSize = {
    small: '11px',
    medium: '13px',
    large: '15px',
  }[size];

  if (tier === 'free') {
    return null;
  }

  const colors = PLAN_COLORS[tier];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding,
        background: tier === 'premium_elite' && animated
          ? `linear-gradient(135deg, ${colors.primary}20, ${colors.primary}10)`
          : `${colors.primary}20`,
        border: `1px solid ${colors.primary}${tier === 'premium_elite' ? '80' : '40'}`,
        borderRadius: '12px',
        color: colors.primary,
        fontSize,
        fontWeight: 'bold',
        animation: animated && tier === 'premium_elite' ? 'goldenPulse 2s ease-in-out infinite' : 'none',
      }}
    >
      {getIcon()}
      {showName && <span>{PLAN_NAMES[tier]}</span>}
      
      <style>{`
        @keyframes goldenPulse {
          0%, 100% {
            box-shadow: 0 0 10px ${colors.primary}40;
          }
          50% {
            box-shadow: 0 0 20px ${colors.primary}80;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Golden Aura Effect - Pour les profils Elite
 */
export function GoldenAura({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '-4px',
          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
          borderRadius: '50%',
          opacity: 0.3,
          filter: 'blur(8px)',
          animation: 'auraRotate 3s linear infinite',
          zIndex: -1,
        }}
      />
      {children}
      <style>{`
        @keyframes auraRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Star Brightness Effect - Premium brille 2x, Elite brille encore plus
 */
export function StarEffect({ tier, size = 32 }: { tier: PlanTier; size?: number }) {
  const brightness = {
    free: 1,
    premium: 2,
    premium_elite: 3,
  }[tier];

  const color = PLAN_COLORS[tier].primary;

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `radial-gradient(circle, ${color}${Math.floor(brightness * 40).toString(16)}, transparent)`,
        borderRadius: '50%',
        position: 'relative',
        animation: tier === 'premium_elite' ? 'starPulse 2s ease-in-out infinite' : 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: color,
          borderRadius: '50%',
          filter: `brightness(${brightness})`,
        }}
      />
      <style>{`
        @keyframes starPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Shooting Star Effect - Pour Elite uniquement
 */
export function ShootingStarEffect() {
  return (
    <div
      style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '60px',
        height: '2px',
        background: 'linear-gradient(90deg, #FFD700, transparent)',
        transform: 'rotate(-45deg)',
        animation: 'shootingStar 3s ease-in-out infinite',
        opacity: 0,
      }}
    >
      <style>{`
        @keyframes shootingStar {
          0% {
            opacity: 0;
            transform: translateX(-100px) translateY(-100px) rotate(-45deg);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(100px) translateY(100px) rotate(-45deg);
          }
        }
      `}</style>
    </div>
  );
}
