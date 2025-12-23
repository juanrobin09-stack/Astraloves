import { useState, useEffect } from 'react';
import { X, Clock, Zap, ArrowRight } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import { UpgradeButton } from './UpgradeButton';
import type { LimitName } from '../../types/subscription';
import { LIMIT_DESCRIPTIONS, SUBSCRIPTION_PLANS } from '../../config/subscriptionPlans';

interface LimitReachedModalProps {
  limit: LimitName;
  isOpen: boolean;
  onClose: () => void;
}

export function LimitReachedModal({ limit, isOpen, onClose }: LimitReachedModalProps) {
  const { currentPlan, canPerformAction } = useSubscription();
  const [timeUntilReset, setTimeUntilReset] = useState('');

  const limitDesc = LIMIT_DESCRIPTIONS[limit];
  const result = canPerformAction(limit);

  useEffect(() => {
    if (!isOpen) return;

    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeUntilReset(`${hours}h ${minutes}min`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const nextPlan = currentPlan.id === 'free'
    ? SUBSCRIPTION_PLANS.premium
    : SUBSCRIPTION_PLANS.premium_elite;

  const nextPlanLimit = nextPlan.limits[limit];
  const improvement = nextPlanLimit === Infinity
    ? 'Illimite'
    : `${nextPlanLimit} ${limitDesc?.unit || ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-6 max-w-sm w-full border border-gray-700/50 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-white transition-colors rounded-full hover:bg-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="text-3xl">{limitDesc?.icon || '⚠️'}</span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            Limite atteinte
          </h3>

          <p className="text-gray-400 mb-4">
            Tu as utilise tes {result.limit} {limitDesc?.label?.toLowerCase() || 'actions'} du jour.
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
            <Clock className="w-4 h-4" />
            <span>Reset dans {timeUntilReset}</span>
          </div>

          <div className="bg-gray-900/60 rounded-xl p-4 mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
              Avec {nextPlan.name}
            </p>

            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-500 line-through">
                  {result.limit}
                </div>
                <div className="text-xs text-gray-600">Actuel</div>
              </div>

              <ArrowRight className="w-5 h-5 text-gray-600" />

              <div className="text-center">
                <div className={`text-2xl font-bold ${nextPlanLimit === Infinity ? 'text-emerald-400' : 'text-white'}`}>
                  {improvement}
                </div>
                <div className="text-xs text-gray-500">{nextPlan.name}</div>
              </div>
            </div>
          </div>

          <UpgradeButton
            targetPlan={nextPlan.id}
            variant={nextPlan.id === 'premium_elite' ? 'gold' : 'primary'}
            size="lg"
            fullWidth
          >
            <Zap className="w-5 h-5" />
            Debloquer maintenant
          </UpgradeButton>

          <button
            onClick={onClose}
            className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Attendre le reset
          </button>
        </div>
      </div>
    </div>
  );
}

export function useLimitReachedModal() {
  const [modalState, setModalState] = useState<{ isOpen: boolean; limit: LimitName | null }>({
    isOpen: false,
    limit: null,
  });

  const openModal = (limit: LimitName) => {
    setModalState({ isOpen: true, limit });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, limit: null });
  };

  const Modal = () =>
    modalState.limit ? (
      <LimitReachedModal
        limit={modalState.limit}
        isOpen={modalState.isOpen}
        onClose={closeModal}
      />
    ) : null;

  return { openModal, closeModal, Modal };
}
