/**
 * SYSTÈME DE CONTRÔLE D'ACCÈS AUX QUESTIONNAIRES
 * Version Premium - Descriptions introspectives
 */

export type SubscriptionTier = 'free' | 'premium' | 'elite';
export type AccessLevel = 'free' | 'premium' | 'elite';
export type QuizCategory = 'foundations' | 'advanced';

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
  category: QuizCategory;
  hasAI: boolean;
}

/**
 * Configuration complète des questionnaires avec descriptions premium
 */
export const QUIZZES_ACCESS_CONFIG: Record<string, QuizAccessConfig> = {
  'first_impression': {
    id: 'first_impression',
    name: 'Première Impression',
    emoji: '○',
    access_level: 'free',
    duration: '~5 min',
    questions_count: 10,
    description: 'Ce que les autres perçoivent de toi avant même que tu ne parles.',
    badge: null,
    featured: false,
    order: 1,
    category: 'foundations',
    hasAI: false
  },
  'seduction': {
    id: 'seduction',
    name: 'Test de Séduction',
    emoji: '○',
    access_level: 'free',
    duration: '~7 min',
    questions_count: 12,
    description: 'Ton langage silencieux. Ce qui attire sans que tu le saches.',
    badge: null,
    featured: false,
    order: 2,
    category: 'foundations',
    hasAI: false
  },
  'attachment': {
    id: 'attachment',
    name: 'Style d\'Attachement',
    emoji: '◐',
    access_level: 'premium',
    duration: '~10 min',
    questions_count: 14,
    description: 'Comment tu te lies. Et pourquoi certaines relations t\'échappent.',
    badge: null,
    order: 3,
    category: 'advanced',
    hasAI: true
  },
  'archetype': {
    id: 'archetype',
    name: 'Archétype Amoureux',
    emoji: '◐',
    access_level: 'premium',
    duration: '~12 min',
    questions_count: 14,
    description: 'Le schéma profond qui guide tes choix romantiques.',
    badge: null,
    order: 4,
    category: 'advanced',
    hasAI: true
  },
  'compatibility': {
    id: 'compatibility',
    name: 'Test de Compatibilité',
    emoji: '◐',
    access_level: 'premium',
    duration: '~6 min',
    questions_count: 8,
    description: 'Les dynamiques invisibles entre deux personnalités.',
    badge: null,
    order: 5,
    category: 'advanced',
    hasAI: true
  },
  'astral': {
    id: 'astral',
    name: 'Thème Astral Complet',
    emoji: '◐',
    access_level: 'elite',
    duration: '~10 min',
    questions_count: 12,
    description: 'Ta configuration intérieure. Une astrologie de l\'âme, pas des étoiles.',
    badge: null,
    order: 6,
    category: 'advanced',
    hasAI: true
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
 * Version sobre sans vocabulaire marketing
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

  // Messages sobres, pas marketing
  if (tier === 'free' && quiz.access_level === 'premium') {
    return 'Profil avancé requis';
  }
  if (tier === 'free' && quiz.access_level === 'elite') {
    return 'Profil complet requis';
  }
  if (tier === 'premium' && quiz.access_level === 'elite') {
    return 'Profil complet requis';
  }

  return 'Accès restreint';
}

/**
 * Obtient le badge à afficher pour un questionnaire
 * Version minimaliste
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
    return { text: 'Complété', type: 'completed' };
  }

  const hasAccess = hasAccessToQuiz(tier, quizId);

  // Utilisateur a accès - pas de badge criard
  if (hasAccess && quiz.access_level !== 'free') {
    return null; // Pas de badge "INCLUS" criard
  }

  // Utilisateur n'a pas accès - badges discrets
  if (!hasAccess) {
    if (quiz.access_level === 'elite') {
      return { text: 'Profil complet', type: 'locked-elite' };
    }
    if (quiz.access_level === 'premium') {
      return { text: 'Profil avancé', type: 'locked-premium' };
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
 * Groupe les questionnaires par catégorie
 * Nouvelle structure : Fondations vs Analyses Approfondies
 */
export function groupQuizzesByCategory(
  userTier: SubscriptionTier | null | undefined,
  completedQuizIds: string[] = []
) {
  const quizzes = getQuizzesWithAccess(userTier, completedQuizIds);

  const categories = {
    free: {
      title: 'Fondations',
      subtitle: 'Les bases de ta personnalité relationnelle',
      icon: '',
      quizzes: quizzes.filter(q => q.category === 'foundations')
    },
    premium: {
      title: 'Analyses Approfondies',
      subtitle: 'Modélisation avancée par intelligence artificielle',
      icon: '',
      quizzes: quizzes.filter(q => q.category === 'advanced' && q.access_level === 'premium')
    },
    elite: {
      title: 'Analyses Approfondies',
      subtitle: 'Modélisation avancée par intelligence artificielle',
      icon: '',
      quizzes: quizzes.filter(q => q.category === 'advanced' && q.access_level === 'elite')
    }
  };

  return categories;
}

/**
 * Groupe les questionnaires pour la nouvelle UI
 * Fondations + Analyses Approfondies (toutes combinées)
 */
export function groupQuizzesByNewCategories(
  userTier: SubscriptionTier | null | undefined,
  completedQuizIds: string[] = []
) {
  const quizzes = getQuizzesWithAccess(userTier, completedQuizIds);

  return {
    foundations: {
      title: 'Fondations',
      quizzes: quizzes.filter(q => q.category === 'foundations')
    },
    advanced: {
      title: 'Analyses Approfondies',
      subtitle: 'Modélisation avancée par intelligence artificielle',
      quizzes: quizzes.filter(q => q.category === 'advanced')
    }
  };
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

/**
 * Vérifie si un questionnaire utilise l'analyse IA
 */
export function hasAIAnalysis(quizId: string): boolean {
  const quiz = QUIZZES_ACCESS_CONFIG[quizId];
  return quiz?.hasAI || false;
}

/**
 * Obtient tous les questionnaires avec analyse IA
 */
export function getAIQuizzes(): QuizAccessConfig[] {
  return Object.values(QUIZZES_ACCESS_CONFIG)
    .filter(quiz => quiz.hasAI)
    .sort((a, b) => a.order - b.order);
}
