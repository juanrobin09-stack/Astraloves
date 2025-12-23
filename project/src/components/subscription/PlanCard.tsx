import type { SubscriptionPlan } from '../../types/subscription';
import { useSubscription } from '../../context/SubscriptionContext';
import { UpgradeButton } from './UpgradeButton';
import { FeatureList } from './FeatureList';
import { formatLimit } from '../../config/subscriptionPlans';

interface PlanCardProps {
  plan: SubscriptionPlan;
  highlighted?: boolean;
  compact?: boolean;
  onSelect?: (plan: SubscriptionPlan) => void;
}

export function PlanCard({
  plan,
  highlighted = false,
  compact = false,
  onSelect,
}: PlanCardProps) {
  const { currentPlan } = useSubscription();
  const isCurrentPlan = currentPlan.id === plan.id;

  const cardClasses = highlighted
    ? 'ring-2 ring-amber-400 bg-gradient-to-b from-gray-800/90 to-gray-900/90'
    : 'bg-gray-800/60';

  return (
    <div
      className={`
        relative rounded-2xl p-6 backdrop-blur-sm border border-gray-700/50
        transition-all duration-300 hover:border-gray-600/50
        ${cardClasses}
        ${highlighted ? 'scale-105 shadow-xl shadow-amber-500/10' : ''}
      `}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
            POPULAIRE
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            ACTUEL
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <span className="text-4xl mb-2 block">{plan.icon}</span>
        <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          {plan.price === 0 ? (
            <span className="text-3xl font-bold text-gray-300">Gratuit</span>
          ) : (
            <>
              <span className="text-3xl font-bold text-white">{plan.priceFormatted}</span>
              <span className="text-gray-400">/mois</span>
            </>
          )}
        </div>
      </div>

      {!compact && (
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <LimitDisplay
              icon="💫"
              label="Signaux"
              value={formatLimit(plan.limits.cosmicSignalsPerDay)}
              suffix="/jour"
            />
            <LimitDisplay
              icon="🤖"
              label="Astra IA"
              value={formatLimit(plan.limits.astraMessagesPerDay)}
              suffix="/jour"
            />
            <LimitDisplay
              icon="💬"
              label="Messages"
              value={formatLimit(plan.limits.matchMessagesPerDay)}
              suffix="/jour"
            />
            <LimitDisplay
              icon="🌟"
              label="Super Nova"
              value={formatLimit(plan.limits.superNovaPerDay)}
              suffix="/jour"
            />
            <LimitDisplay
              icon="📷"
              label="Photos"
              value={formatLimit(plan.limits.maxPhotos)}
              suffix="max"
            />
            <LimitDisplay
              icon="🚀"
              label="Boost"
              value={`x${plan.limits.visibilityBoost}`}
              suffix=""
            />
          </div>
        </div>
      )}

      {!compact && (
        <div className="border-t border-gray-700/50 pt-4 mb-6">
          <FeatureList plan={plan} maxItems={5} />
        </div>
      )}

      <div className="mt-auto">
        {isCurrentPlan ? (
          <button
            disabled
            className="w-full py-3 px-4 rounded-xl bg-gray-700 text-gray-400 font-medium cursor-not-allowed"
          >
            Plan actuel
          </button>
        ) : plan.tier > currentPlan.tier ? (
          <UpgradeButton
            targetPlan={plan.id}
            variant={highlighted ? 'gold' : 'primary'}
            fullWidth
          />
        ) : (
          <button
            onClick={() => onSelect?.(plan)}
            className="w-full py-3 px-4 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
          >
            Changer de plan
          </button>
        )}
      </div>
    </div>
  );
}

function LimitDisplay({
  icon,
  label,
  value,
  suffix,
}: {
  icon: string;
  label: string;
  value: string;
  suffix: string;
}) {
  const isUnlimited = value === '∞';

  return (
    <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2">
      <span className="text-sm">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 truncate">{label}</div>
        <div className={`font-medium ${isUnlimited ? 'text-emerald-400' : 'text-white'}`}>
          {value}
          {!isUnlimited && <span className="text-gray-500 text-xs ml-0.5">{suffix}</span>}
        </div>
      </div>
    </div>
  );
}
