import { X, Sparkles, Crown, Check } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import { UpgradeButton } from './UpgradeButton';
import type { FeatureName } from '../../types/subscription';
import { FEATURE_DESCRIPTIONS, SUBSCRIPTION_PLANS } from '../../config/subscriptionPlans';

interface UpgradePromptProps {
  feature?: FeatureName;
  title?: string;
  description?: string;
  onClose?: () => void;
  variant?: 'inline' | 'card' | 'banner';
}

export function UpgradePrompt({
  feature,
  title,
  description,
  onClose,
  variant = 'card',
}: UpgradePromptProps) {
  const { requiresUpgradeFor, currentPlan } = useSubscription();

  const upgradeInfo = feature ? requiresUpgradeFor(feature) : null;
  const featureDesc = feature ? FEATURE_DESCRIPTIONS[feature] : null;

  const displayTitle = title || (featureDesc?.label || 'Fonctionnalite Premium');
  const displayDescription = description || featureDesc?.description || 'Passe au niveau superieur pour debloquer cette fonctionnalite.';

  const targetPlan = upgradeInfo?.minimumPlanRequired || SUBSCRIPTION_PLANS.premium;
  const isEliteRequired = targetPlan.id === 'premium_elite';

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-800/60 rounded-xl border border-gray-700/50">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-red-500/20 flex items-center justify-center">
          {isEliteRequired ? (
            <Crown className="w-5 h-5 text-amber-400" />
          ) : (
            <Sparkles className="w-5 h-5 text-red-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{displayTitle}</p>
          <p className="text-xs text-gray-400">Disponible avec {targetPlan.name}</p>
        </div>
        <UpgradeButton targetPlan={targetPlan.id} size="sm" variant={isEliteRequired ? 'gold' : 'primary'} />
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="relative bg-gradient-to-r from-gray-800 via-gray-800/95 to-gray-800 rounded-xl p-4 border border-gray-700/50">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <span className="text-3xl">{featureDesc?.icon || targetPlan.icon}</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white">{displayTitle}</h4>
            <p className="text-sm text-gray-400 mt-0.5">{displayDescription}</p>
          </div>
          <UpgradeButton targetPlan={targetPlan.id} variant={isEliteRequired ? 'gold' : 'primary'} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 text-center">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-white transition-colors rounded-full hover:bg-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500/20 to-red-500/20 flex items-center justify-center">
        <span className="text-3xl">{featureDesc?.icon || targetPlan.icon}</span>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">{displayTitle}</h3>
      <p className="text-gray-400 mb-6">{displayDescription}</p>

      {upgradeInfo && upgradeInfo.featuresGained.length > 0 && (
        <div className="bg-gray-900/50 rounded-xl p-4 mb-6 text-left">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            Tu obtiens aussi
          </p>
          <ul className="space-y-2">
            {upgradeInfo.featuresGained.slice(0, 4).map((feat, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                <Check className="w-4 h-4 text-emerald-400" />
                {feat}
              </li>
            ))}
            {upgradeInfo.featuresGained.length > 4 && (
              <li className="text-xs text-gray-500">
                +{upgradeInfo.featuresGained.length - 4} autres avantages
              </li>
            )}
          </ul>
        </div>
      )}

      <UpgradeButton
        targetPlan={targetPlan.id}
        variant={isEliteRequired ? 'gold' : 'primary'}
        size="lg"
        fullWidth
      >
        Passer {targetPlan.name} - {targetPlan.priceFormatted}/mois
      </UpgradeButton>

      <p className="text-xs text-gray-500 mt-3">
        Annulation possible a tout moment
      </p>
    </div>
  );
}
