import { Check, X, Crown, Infinity } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import { UpgradeButton } from './UpgradeButton';
import {
  SUBSCRIPTION_PLANS,
  FEATURE_DESCRIPTIONS,
  LIMIT_DESCRIPTIONS,
  formatLimit,
} from '../../config/subscriptionPlans';
import type { FeatureName, LimitName } from '../../types/subscription';

interface PlanComparisonTableProps {
  highlightCurrent?: boolean;
  showUpgradeButtons?: boolean;
  compact?: boolean;
}

export function PlanComparisonTable({
  highlightCurrent = true,
  showUpgradeButtons = true,
  compact = false,
}: PlanComparisonTableProps) {
  const { currentPlan } = useSubscription();
  const plans = [SUBSCRIPTION_PLANS.free, SUBSCRIPTION_PLANS.premium, SUBSCRIPTION_PLANS.premium_elite];

  const limitRows: { limit: LimitName; label: string; icon: string }[] = [
    { limit: 'cosmicSignalsPerDay', label: 'Signaux cosmiques', icon: '💫' },
    { limit: 'superNovaPerDay', label: 'Super Nova', icon: '🌟' },
    { limit: 'astraMessagesPerDay', label: 'Messages Astra IA', icon: '🤖' },
    { limit: 'matchMessagesPerDay', label: 'Messages matchs', icon: '💬' },
    { limit: 'superLikesPerDay', label: 'Super likes', icon: '💖' },
    { limit: 'visibleStars', label: 'Etoiles visibles', icon: '🌌' },
    { limit: 'visibilityBoost', label: 'Boost visibilite', icon: '🚀' },
    { limit: 'maxPhotos', label: 'Photos max', icon: '📷' },
    { limit: 'maxBioChars', label: 'Bio max', icon: '📝' },
  ];

  const featureRows: { feature: FeatureName; label: string; icon: string; eliteOnly?: boolean }[] = [
    { feature: 'seeWhoSignaled', label: 'Voir qui a signale', icon: '👁️' },
    { feature: 'seeWhenSignaled', label: 'Voir quand', icon: '⏰', eliteOnly: true },
    { feature: 'aiCompatibilityMatch', label: 'Compatibilite IA', icon: '🎯' },
    { feature: 'aiProfileTips', label: 'Conseils profil IA', icon: '💡' },
    { feature: 'aiIceBreakers', label: 'Ice-breakers Astra', icon: '💬' },
    { feature: 'advancedHoroscope', label: 'Horoscope avance', icon: '🔮' },
    { feature: 'premiumBadge', label: 'Badge Premium', icon: '💎' },
    { feature: 'eliteBadge', label: 'Badge Elite', icon: '👑', eliteOnly: true },
    { feature: 'starShineBoost', label: 'Etoile brillante', icon: '✨' },
    { feature: 'rewind', label: 'Rembobinage', icon: '🔄', eliteOnly: true },
    { feature: 'advancedAstroFilters', label: 'Filtres astro avances', icon: '🔭', eliteOnly: true },
    { feature: 'incognitoMode', label: 'Mode incognito', icon: '🎭', eliteOnly: true },
    { feature: 'profileVisitors', label: 'Visiteurs profil', icon: '👁️', eliteOnly: true },
    { feature: 'fullAstralChart', label: 'Theme astral complet', icon: '🌌', eliteOnly: true },
    { feature: 'advancedCosmicCompatibility', label: 'Compatibilite avancee', icon: '🔮', eliteOnly: true },
    { feature: 'goldenAura', label: 'Aura doree', icon: '✨', eliteOnly: true },
    { feature: 'shootingStarEffect', label: 'Etoile filante', icon: '🌠', eliteOnly: true },
    { feature: 'astraWritesMessages', label: 'Astra ecrit messages', icon: '📝', eliteOnly: true },
    { feature: 'aiCoachPro', label: 'Coach IA Pro', icon: '🤖', eliteOnly: true },
  ];

  const displayFeatures = compact ? featureRows.slice(0, 10) : featureRows;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-3 text-gray-400 font-medium text-sm">
              Fonctionnalite
            </th>
            {plans.map(plan => (
              <th
                key={plan.id}
                className={`
                  p-3 text-center min-w-[120px]
                  ${highlightCurrent && currentPlan.id === plan.id ? 'bg-red-500/10 rounded-t-xl' : ''}
                `}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">{plan.icon}</span>
                  <span className="font-bold text-white">{plan.name}</span>
                  <span className="text-sm text-gray-400">
                    {plan.price === 0 ? 'Gratuit' : `${plan.priceFormatted}/mois`}
                  </span>
                  {highlightCurrent && currentPlan.id === plan.id && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                      Actuel
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={4} className="px-3 pt-4 pb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Limites quotidiennes
              </span>
            </td>
          </tr>
          {limitRows.map(({ limit, label, icon }) => (
            <tr key={limit} className="border-t border-gray-800/50">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{icon}</span>
                  <span className="text-gray-300 text-sm">{label}</span>
                </div>
              </td>
              {plans.map(plan => {
                const value = plan.limits[limit];
                const isUnlimited = value === Infinity;
                const displayValue = limit === 'visibilityBoost'
                  ? `x${value}`
                  : formatLimit(value);

                return (
                  <td
                    key={plan.id}
                    className={`
                      p-3 text-center
                      ${highlightCurrent && currentPlan.id === plan.id ? 'bg-red-500/5' : ''}
                    `}
                  >
                    {value === 0 ? (
                      <X className="w-5 h-5 text-red-400/50 mx-auto" />
                    ) : isUnlimited ? (
                      <span className="text-emerald-400 font-medium">∞</span>
                    ) : (
                      <span className="text-white font-medium">{displayValue}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}

          <tr>
            <td colSpan={4} className="px-3 pt-6 pb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Fonctionnalites
              </span>
            </td>
          </tr>
          {displayFeatures.map(({ feature, label, icon, eliteOnly }) => (
            <tr key={feature} className="border-t border-gray-800/50">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{icon}</span>
                  <span className={`text-sm ${eliteOnly ? 'text-amber-400' : 'text-gray-300'}`}>
                    {label}
                  </span>
                  {eliteOnly && (
                    <Crown className="w-3 h-3 text-amber-400" />
                  )}
                </div>
              </td>
              {plans.map(plan => {
                const hasFeature = plan.features[feature];
                return (
                  <td
                    key={plan.id}
                    className={`
                      p-3 text-center
                      ${highlightCurrent && currentPlan.id === plan.id ? 'bg-red-500/5' : ''}
                    `}
                  >
                    {hasFeature ? (
                      <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-red-400/30 mx-auto" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}

          {!compact && featureRows.length > displayFeatures.length && (
            <tr>
              <td colSpan={4} className="p-3 text-center text-gray-500 text-sm">
                +{featureRows.length - displayFeatures.length} autres fonctionnalites
              </td>
            </tr>
          )}

          {showUpgradeButtons && (
            <tr>
              <td className="p-3"></td>
              {plans.map(plan => (
                <td
                  key={plan.id}
                  className={`
                    p-4 text-center
                    ${highlightCurrent && currentPlan.id === plan.id ? 'bg-red-500/5 rounded-b-xl' : ''}
                  `}
                >
                  {currentPlan.id === plan.id ? (
                    <span className="text-gray-500 text-sm">Plan actuel</span>
                  ) : plan.tier > currentPlan.tier ? (
                    <UpgradeButton
                      targetPlan={plan.id}
                      variant={plan.id === 'premium_elite' ? 'gold' : 'primary'}
                      size="sm"
                    />
                  ) : null}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function MiniPlanComparison() {
  const { currentPlan } = useSubscription();
  const nextPlan = currentPlan.id === 'free'
    ? SUBSCRIPTION_PLANS.premium
    : currentPlan.id === 'premium'
      ? SUBSCRIPTION_PLANS.premium_elite
      : null;

  if (!nextPlan) return null;

  const keyDifferences = [
    {
      label: 'Signaux',
      current: formatLimit(currentPlan.limits.cosmicSignalsPerDay),
      next: formatLimit(nextPlan.limits.cosmicSignalsPerDay),
    },
    {
      label: 'Messages Astra',
      current: formatLimit(currentPlan.limits.astraMessagesPerDay),
      next: formatLimit(nextPlan.limits.astraMessagesPerDay),
    },
    {
      label: 'Boost',
      current: `x${currentPlan.limits.visibilityBoost}`,
      next: `x${nextPlan.limits.visibilityBoost}`,
    },
  ];

  return (
    <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">Comparaison rapide</span>
        <div className="flex items-center gap-2">
          <span className="text-sm">{currentPlan.icon}</span>
          <span className="text-gray-500">→</span>
          <span className="text-sm">{nextPlan.icon}</span>
        </div>
      </div>
      <div className="space-y-2">
        {keyDifferences.map(diff => (
          <div key={diff.label} className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{diff.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">{diff.current}</span>
              <span className="text-gray-600">→</span>
              <span className={diff.next === '∞' ? 'text-emerald-400' : 'text-white'}>
                {diff.next}
              </span>
            </div>
          </div>
        ))}
      </div>
      <UpgradeButton
        targetPlan={nextPlan.id}
        variant={nextPlan.id === 'premium_elite' ? 'gold' : 'primary'}
        size="sm"
        fullWidth
        className="mt-4"
      />
    </div>
  );
}
