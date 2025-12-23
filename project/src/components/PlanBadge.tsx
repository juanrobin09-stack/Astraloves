interface PlanBadgeProps {
  plan: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function PlanBadge({ plan, size = 'md' }: PlanBadgeProps) {
  if (plan === 'free' || !plan) return null;

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  if (plan === 'premium_elite') {
    return (
      <span className={`${sizes[size]} bg-gradient-to-r from-yellow-500 to-orange-500 rounded font-bold inline-flex items-center gap-1`}>
        <span>👑</span>
        <span className="text-black">ELITE</span>
      </span>
    );
  }

  if (plan === 'premium') {
    return (
      <span className={`${sizes[size]} bg-gradient-to-r from-pink-500 to-purple-500 rounded font-bold inline-flex items-center gap-1`}>
        <span>💎</span>
        <span>PREMIUM</span>
      </span>
    );
  }

  return null;
}
