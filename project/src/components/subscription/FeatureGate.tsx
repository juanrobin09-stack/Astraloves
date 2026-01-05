import { type ReactNode } from 'react';
import { useSubscription } from '../../context/SubscriptionContext';
import type { FeatureName, LimitName } from '../../types/subscription';

interface FeatureGateProps {
  feature?: FeatureName;
  limit?: LimitName;
  children: ReactNode;
  fallback?: ReactNode;
  showFallback?: boolean;
}

export function FeatureGate({
  feature,
  limit,
  children,
  fallback,
  showFallback = true,
}: FeatureGateProps) {
  const { hasFeature, canPerformAction } = useSubscription();

  if (feature) {
    const allowed = hasFeature(feature);
    if (!allowed) {
      return showFallback && fallback ? <>{fallback}</> : null;
    }
  }

  if (limit) {
    const { allowed } = canPerformAction(limit);
    if (!allowed) {
      return showFallback && fallback ? <>{fallback}</> : null;
    }
  }

  return <>{children}</>;
}

interface FeatureCheckProps {
  feature: FeatureName;
  children: (hasAccess: boolean) => ReactNode;
}

export function FeatureCheck({ feature, children }: FeatureCheckProps) {
  const { hasFeature } = useSubscription();
  return <>{children(hasFeature(feature))}</>;
}

interface LimitCheckProps {
  limit: LimitName;
  children: (result: { allowed: boolean; remaining: number; limit: number }) => ReactNode;
}

export function LimitCheck({ limit, children }: LimitCheckProps) {
  const { canPerformAction } = useSubscription();
  const result = canPerformAction(limit);
  return <>{children(result)}</>;
}
