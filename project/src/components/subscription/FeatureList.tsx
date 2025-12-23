import type { SubscriptionPlan, FeatureName } from '../../types/subscription';
import { FEATURE_DESCRIPTIONS } from '../../config/subscriptionPlans';
import { Check, X, Crown } from 'lucide-react';

interface FeatureListProps {
  plan: SubscriptionPlan;
  maxItems?: number;
  showAll?: boolean;
  highlightElite?: boolean;
}

export function FeatureList({
  plan,
  maxItems,
  showAll = false,
  highlightElite = true,
}: FeatureListProps) {
  const enabledFeatures = (Object.entries(plan.features) as [FeatureName, boolean][])
    .filter(([, enabled]) => enabled)
    .map(([name]) => name);

  const displayFeatures = showAll
    ? enabledFeatures
    : maxItems
      ? enabledFeatures.slice(0, maxItems)
      : enabledFeatures;

  const hiddenCount = enabledFeatures.length - displayFeatures.length;

  return (
    <div className="space-y-2">
      {displayFeatures.map(featureName => {
        const desc = FEATURE_DESCRIPTIONS[featureName];
        if (!desc) return null;

        return (
          <div
            key={featureName}
            className={`
              flex items-center gap-2 text-sm
              ${desc.eliteOnly && highlightElite ? 'text-amber-400' : 'text-gray-300'}
            `}
          >
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
              {desc.eliteOnly && highlightElite ? (
                <Crown className="w-3 h-3 text-amber-400" />
              ) : (
                <Check className="w-3 h-3 text-emerald-400" />
              )}
            </span>
            <span className="text-sm">{desc.icon}</span>
            <span className="truncate">{desc.label}</span>
          </div>
        );
      })}
      {hiddenCount > 0 && (
        <div className="text-xs text-gray-500 pl-7">
          +{hiddenCount} autres fonctionnalites
        </div>
      )}
    </div>
  );
}

interface FeatureComparisonListProps {
  features: FeatureName[];
  planA: SubscriptionPlan;
  planB: SubscriptionPlan;
}

export function FeatureComparisonList({
  features,
  planA,
  planB,
}: FeatureComparisonListProps) {
  return (
    <div className="space-y-2">
      {features.map(featureName => {
        const desc = FEATURE_DESCRIPTIONS[featureName];
        if (!desc) return null;

        const hasA = planA.features[featureName];
        const hasB = planB.features[featureName];

        return (
          <div
            key={featureName}
            className="flex items-center justify-between text-sm py-1.5 border-b border-gray-800"
          >
            <div className="flex items-center gap-2">
              <span>{desc.icon}</span>
              <span className="text-gray-300">{desc.label}</span>
            </div>
            <div className="flex items-center gap-6">
              <FeatureStatus enabled={hasA} />
              <FeatureStatus enabled={hasB} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FeatureStatus({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
      <Check className="w-4 h-4 text-emerald-400" />
    </span>
  ) : (
    <span className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center">
      <X className="w-4 h-4 text-red-400/50" />
    </span>
  );
}
