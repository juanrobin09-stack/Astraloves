/**
 * SYSTÈME DE CONTRÔLE D'ACCÈS AUX QUESTIONNAIRES
 *
 * Gère les permissions d'accès aux questionnaires selon le niveau d'abonnement
 */

export type SubscriptionTier = 'free' | 'premium' | 'elite';
export type AccessLevel = 'free' | 'premium' | 'elite';

export interface QuizAccessConfig {
  id: string;
  name: string;
  emoji: string;
  access_level: AccessLevel;
  duration: string;
  questions_count: number;
  description: string;
  badge?: string | null;
  featured?: boolean;
  order: number;
}

/**
 * Configuration complète des questionnaires avec niveaux d'accès
 */
export const QUIZZES_ACCESS_CONFIG: Record<string, QuizAccessConfig> = {
  'first_impression': {
    id: 'first_impression',
    name: 'Première Impression',
    emoji: '👋',
    access_level: 'free',
    duration: '5 min',
    questions_count: 10,
    description: 'Découvrez l\'image que vous projetez lors des premières rencontres',
    badge: null,
    featured: true,
    order: 1
  },
  'seduction': {
    id: 'seduction',
    name: 'Test de Séduction',
    emoji: '💋',
    access_level: 'free',
    duration: '7 min',
    questions_count: 12,
    description: 'Identifiez vos atouts et votre style de séduction unique',
    badge: null,
    featured: true,
    order: 2
  },
  'attachment': {
    id: 'attachment',
    name: 'Style d\'attachement',
    emoji: '💕',
    access_level: 'premium',
    duration: '~10 min',
    questions_count: 14,
    description: 'Découvre ton style d\'attachement en 14 questions',
    badge: 'PREMIUM',
    order: 3
  },
  'archetype': {
    id: 'archetype',
    name: 'Archétype amoureux',
    emoji: '🌟',
    access_level: 'premium',
    duration: '~15 min',
    questions_count: 14,
    description: 'Découvre ton archétype amoureux parmi 12 profils',
    badge: 'PREMIUM',
    order: 4
  },
  'compatibility': {
    id: 'compatibility',
    name: 'Test de compatibilité',
    emoji: '❤️',
    access_level: 'premium',
    duration: '~8 min',
    questions_count: 8,
    description: 'Découvre ton profil relationnel en 8 questions rapides',
    badge: 'PREMIUM',
    order: 5
  },
  'astral': {
    id: 'astral',
    name: 'Thème astral complet',
    emoji: '✨',
    access_level: 'elite',
    duration: '~12 min',
    questions_count: 15,
    description: 'Analyse astrologique complète de ta personnalité amoureuse',
    badge: 'PREMIUM+',
    order: 6
  }
};

/**
 * Hiérarchie d'accès aux questionnaires
 */
const ACCESS_HIERARCHY: Record<SubscriptionTier, AccessLevel[]> = {
  free: ['free'],
  premium: ['free', 'premium'],
  elite: ['free', 'premium', 'elite']
};

/**
 * Vérifie si un utilisateur a accès à un questionnaire
 */
export function hasAccessToQuiz(
  userTier: SubscriptionTier | null | undefined,
  quizId: string
): boolean {
  const quiz = QUIZZES_ACCESS_CONFIG[quizId];
  if (!quiz) return false;

  const tier = userTier || 'free';
  const userAccessLevels = ACCESS_HIERARCHY[tier] || ['free'];

  return userAccessLevels.includes(quiz.access_level);
}

/**
 * Obtient la raison du verrouillage d'un questionnaire
 */
export function getLockReason(
  userTier: SubscriptionTier | null | undefined,
  quizId: string
): string | null {
  const quiz = QUIZZES_ACCESS_CONFIG[quizId];
  if (!quiz) return null;

  const tier = userTier || 'free';

  if (hasAccessToQuiz(tier, quizId)) {
    return null;
  }

  if (tier === 'free' && quiz.access_level === 'premium') {
    return 'Débloquer avec Premium';
  }
  if (tier === 'free' && quiz.access_level === 'elite') {
    return 'Débloquer avec Elite';
  }
  if (tier === 'premium' && quiz.access_level === 'elite') {
    return 'Passer à Elite';
  }

  return 'Accès restreint';
}

/**
 * Obtient le badge à afficher pour un questionnaire
 */
export function getQuizBadge(
  userTier: SubscriptionTier | null | undefined,
  quizId: string,
  isCompleted: boolean
): { text: string; type: 'completed' | 'included-premium' | 'included-elite' | 'locked-premium' | 'locked-elite' | null } | null {
  const quiz = QUIZZES_ACCESS_CONFIG[quizId];
  if (!quiz) return null;

  const tier = userTier || 'free';

  // Badge complété prioritaire
  if (isCompleted) {
    return { text: '✓ COMPLÉTÉ', type: 'completed' };
  }

  const hasAccess = hasAccessToQuiz(tier, quizId);

  // Utilisateur a accès
  if (hasAccess && quiz.access_level !== 'free') {
    if (tier === 'elite') {
      return { text: '👑 INCLUS', type: 'included-elite' };
    }
    return { text: '💎 INCLUS', type: 'included-premium' };
  }

  // Utilisateur n'a pas accès
  if (!hasAccess) {
    if (quiz.access_level === 'elite') {
      return { text: '👑 ELITE', type: 'locked-elite' };
    }
    if (quiz.access_level === 'premium') {
      return { text: '💎 PREMIUM', type: 'locked-premium' };
    }
  }

  return null;
}

/**
 * Obtient tous les questionnaires avec leur statut d'accès
 */
export function getQuizzesWithAccess(
  userTier: SubscriptionTier | null | undefined,
  completedQuizIds: string[] = []
) {
  const tier = userTier || 'free';

  return Object.values(QUIZZES_ACCESS_CONFIG)
    .sort((a, b) => a.order - b.order)
    .map(quiz => ({
      ...quiz,
      is_locked: !hasAccessToQuiz(tier, quiz.id),
      is_completed: completedQuizIds.includes(quiz.id),
      lock_reason: getLockReason(tier, quiz.id),
      badge: getQuizBadge(tier, quiz.id, completedQuizIds.includes(quiz.id))
    }));
}

/**
 * Groupe les questionnaires par catégorie d'accès
 */
export function groupQuizzesByCategory(
  userTier: SubscriptionTier | null | undefined,
  completedQuizIds: string[] = []
) {
  const quizzes = getQuizzesWithAccess(userTier, completedQuizIds);

  const categories = {
    free: {
      title: 'Questionnaires Gratuits',
      subtitle: 'Découvre les bases de ton profil',
      icon: '📋',
      quizzes: quizzes.filter(q => q.access_level === 'free')
    },
    premium: {
      title: userTier === 'premium' || userTier === 'elite'
        ? 'Analyses Premium'
        : '💎 Analyses Premium',
      subtitle: 'Approfondis ta connaissance de toi-même',
      icon: '💎',
      quizzes: quizzes.filter(q => q.access_level === 'premium')
    },
    elite: {
      title: userTier === 'elite'
        ? 'Exclusif Elite'
        : '👑 Exclusif Elite',
      subtitle: 'Le summum de l\'analyse personnalisée',
      icon: '👑',
      quizzes: quizzes.filter(q => q.access_level === 'elite')
    }
  };

  return categories;
}

/**
 * Obtient le tier requis pour un questionnaire
 */
export function getRequiredTier(quizId: string): AccessLevel | null {
  const quiz = QUIZZES_ACCESS_CONFIG[quizId];
  return quiz?.access_level || null;
}

/**
 * Vérifie si un utilisateur peut améliorer son abonnement
 */
export function getUpgradeOptions(userTier: SubscriptionTier | null | undefined) {
  const tier = userTier || 'free';

  const options = {
    canUpgradeToPremium: tier === 'free',
    canUpgradeToElite: tier === 'free' || tier === 'premium',
    currentTier: tier,
    nextTier: tier === 'free' ? 'premium' : tier === 'premium' ? 'elite' : null
  };

  return options;
}

/**
 * Obtient les questionnaires débloqués par un upgrade
 */
export function getUnlockedQuizzesByUpgrade(
  currentTier: SubscriptionTier | null | undefined,
  targetTier: SubscriptionTier
): QuizAccessConfig[] {
  const current = currentTier || 'free';
  const currentAccess = ACCESS_HIERARCHY[current];
  const targetAccess = ACCESS_HIERARCHY[targetTier];

  const newAccessLevels = targetAccess.filter(level => !currentAccess.includes(level));

  return Object.values(QUIZZES_ACCESS_CONFIG)
    .filter(quiz => newAccessLevels.includes(quiz.access_level))
    .sort((a, b) => a.order - b.order);
}
