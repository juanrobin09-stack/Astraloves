/**
 * Hook personnalisé pour gérer l'accès aux questionnaires
 */

import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePremiumStatus } from './usePremiumStatus';
import {
  hasAccessToQuiz,
  getLockReason,
  getQuizBadge,
  getQuizzesWithAccess,
  groupQuizzesByCategory,
  getUpgradeOptions,
  getUnlockedQuizzesByUpgrade,
  type SubscriptionTier,
  type QuizAccessConfig
} from '../lib/quizAccessControl';

export function useQuizAccess() {
  const { user } = useAuth();
  const { isPremium } = usePremiumStatus();

  const userTier: SubscriptionTier = useMemo(() => {
    if (!user) return 'free';

    // Vérifier le tier depuis plusieurs sources
    const tier = (user as any).premium_tier
      || (user as any).subscription_tier
      || (isPremium ? 'premium' : 'free');

    if (tier === 'elite' || tier === 'premium' || tier === 'free') {
      return tier as SubscriptionTier;
    }

    return isPremium ? 'premium' : 'free';
  }, [user, isPremium]);

  /**
   * Vérifie si l'utilisateur a accès à un questionnaire
   */
  const checkAccess = (quizId: string): boolean => {
    return hasAccessToQuiz(userTier, quizId);
  };

  /**
   * Obtient la raison du verrouillage
   */
  const getLockedReason = (quizId: string): string | null => {
    return getLockReason(userTier, quizId);
  };

  /**
   * Obtient le badge pour un questionnaire
   */
  const getBadge = (quizId: string, isCompleted: boolean) => {
    return getQuizBadge(userTier, quizId, isCompleted);
  };

  /**
   * Obtient tous les questionnaires avec statuts
   */
  const quizzes = useMemo(() => {
    const completedIds: string[] = []; // TODO: récupérer depuis la DB
    return getQuizzesWithAccess(userTier, completedIds);
  }, [userTier]);

  /**
   * Obtient les questionnaires groupés par catégorie
   */
  const categorizedQuizzes = useMemo(() => {
    const completedIds: string[] = []; // TODO: récupérer depuis la DB
    return groupQuizzesByCategory(userTier, completedIds);
  }, [userTier]);

  /**
   * Obtient les options d'upgrade disponibles
   */
  const upgradeOptions = useMemo(() => {
    return getUpgradeOptions(userTier);
  }, [userTier]);

  /**
   * Obtient les questionnaires débloqués par un upgrade
   */
  const getUnlockedByUpgrade = (targetTier: SubscriptionTier): QuizAccessConfig[] => {
    return getUnlockedQuizzesByUpgrade(userTier, targetTier);
  };

  return {
    userTier,
    checkAccess,
    getLockedReason,
    getBadge,
    quizzes,
    categorizedQuizzes,
    upgradeOptions,
    getUnlockedByUpgrade,
    isPremium: userTier === 'premium' || userTier === 'elite',
    isElite: userTier === 'elite',
    isFree: userTier === 'free'
  };
}
