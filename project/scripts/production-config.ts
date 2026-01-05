/**
 * CONFIGURATION PRODUCTION DES QUESTIONNAIRES
 *
 * Ce fichier contient la configuration officielle de tous les questionnaires
 * pour le déploiement en production.
 */

export interface QuizConfig {
  id: string;
  name: string;
  emoji: string;
  type: 'gratuit' | 'premium' | 'premium_plus';
  duration: string;
  questions_count: number;
  description: string;
  is_active: boolean;
  order: number;
  featured?: boolean;
  min_premium_tier?: string;
}

/**
 * Configuration complète de tous les questionnaires
 * Ordre d'affichage et disponibilité
 */
export const PRODUCTION_QUIZZES: Record<string, QuizConfig> = {
  // ========================================
  // QUESTIONNAIRES GRATUITS
  // ========================================

  'first_impression': {
    id: 'first_impression',
    name: 'Première Impression',
    emoji: '👋',
    type: 'gratuit',
    duration: '5 min',
    questions_count: 10,
    description: 'Découvrez l\'image que vous projetez lors des premières rencontres',
    is_active: true,
    order: 1,
    featured: true
  },

  'seduction': {
    id: 'seduction',
    name: 'Test de Séduction',
    emoji: '💋',
    type: 'gratuit',
    duration: '7 min',
    questions_count: 12,
    description: 'Identifiez vos atouts et votre style de séduction unique',
    is_active: true,
    order: 2,
    featured: true
  },

  // ========================================
  // QUESTIONNAIRES PREMIUM
  // ========================================

  'attachment': {
    id: 'attachment',
    name: 'Style d\'attachement',
    emoji: '💕',
    type: 'premium',
    duration: '~10 min',
    questions_count: 14,
    description: 'Découvre ton style d\'attachement en 14 questions approfondies',
    is_active: true,
    order: 3,
    min_premium_tier: 'premium'
  },

  'archetype': {
    id: 'archetype',
    name: 'Archétype amoureux',
    emoji: '🌟',
    type: 'premium',
    duration: '~15 min',
    questions_count: 14,
    description: 'Découvre ton archétype amoureux parmi 12 profils uniques',
    is_active: true,
    order: 4,
    min_premium_tier: 'premium'
  },

  'compatibility': {
    id: 'compatibility',
    name: 'Test de compatibilité',
    emoji: '❤️',
    type: 'premium',
    duration: '~8 min',
    questions_count: 8,
    description: 'Découvre ton profil relationnel en 8 questions rapides',
    is_active: true,
    order: 5,
    min_premium_tier: 'premium'
  },

  // ========================================
  // QUESTIONNAIRES PREMIUM PLUS / ELITE
  // ========================================

  'astral': {
    id: 'astral',
    name: 'Thème astral complet',
    emoji: '✨',
    type: 'premium_plus',
    duration: '~12 min',
    questions_count: 15,
    description: 'Analyse astrologique complète de ta personnalité amoureuse',
    is_active: true,
    order: 6,
    min_premium_tier: 'elite'
  }
};

/**
 * Limites et restrictions par type d'abonnement
 */
export const SUBSCRIPTION_LIMITS = {
  free: {
    name: 'Gratuit',
    max_quizzes_per_day: 2,
    max_astra_messages_per_day: 10,
    available_quizzes: ['first_impression', 'seduction'],
    features: [
      'Questionnaires de base',
      'Analyse par Astra (limitée)',
      'Profil public'
    ]
  },
  premium: {
    name: 'Premium',
    max_quizzes_per_day: 999,
    max_astra_messages_per_day: 50,
    available_quizzes: ['first_impression', 'seduction', 'attachment', 'archetype', 'compatibility'],
    features: [
      'Tous les questionnaires Premium',
      'Analyses détaillées par Astra',
      'Conversations illimitées',
      'Boost de profil',
      'Mode incognito'
    ]
  },
  elite: {
    name: 'Elite',
    max_quizzes_per_day: 999,
    max_astra_messages_per_day: 999,
    available_quizzes: ['first_impression', 'seduction', 'attachment', 'archetype', 'compatibility', 'astral'],
    features: [
      'Tous les questionnaires (y compris Thème Astral)',
      'Analyses illimitées par Astra',
      'Conversations illimitées',
      'Boost de profil illimité',
      'Mode incognito',
      'Badge Elite',
      'Support prioritaire'
    ]
  }
};

/**
 * Catégories de questionnaires pour l'affichage
 */
export const QUIZ_CATEGORIES = {
  gratuit: {
    title: 'Questionnaires Gratuits',
    subtitle: 'Découvre les bases de ton profil',
    icon: '📋'
  },
  premium: {
    title: 'Analyses Premium par Astra',
    subtitle: 'Approfondis ta connaissance de toi-même',
    icon: '💎'
  },
  premium_plus: {
    title: 'Analyses Elite Exclusives',
    subtitle: 'Le summum de l\'analyse personnalisée',
    icon: '✨'
  }
};

/**
 * Messages pour l'état vide (pas de résultats)
 */
export const EMPTY_STATE_MESSAGES = {
  my_results: {
    title: 'Aucun résultat pour le moment',
    message: 'Complète ton premier questionnaire pour découvrir ton profil !',
    cta: 'Découvrir les questionnaires',
    icon: '📊'
  },
  questionnaires: {
    title: 'Commence ton voyage de découverte',
    message: 'Nos questionnaires t\'aident à mieux te connaître et à améliorer tes relations',
    cta: 'Commencer le premier quiz',
    icon: '🚀'
  }
};

/**
 * Configuration des analyses IA par Astra
 */
export const ASTRA_ANALYSIS_CONFIG = {
  enabled: true,
  model: 'gpt-4',
  max_tokens: 1500,
  temperature: 0.7,
  system_prompt: `Tu es Astra, une IA spécialisée dans l'analyse psychologique et astrologique.
Tu analyses les résultats des questionnaires avec empathie, précision et bienveillance.
Tes analyses sont personnalisées, constructives et encourageantes.`,
  analysis_sections: [
    'personality_overview',
    'strengths',
    'areas_to_develop',
    'relationship_style',
    'compatibility_insights',
    'personalized_advice'
  ]
};

/**
 * Validation de la configuration
 */
export function validateProductionConfig(): boolean {
  const errors: string[] = [];

  const quizzes = Object.values(PRODUCTION_QUIZZES);

  if (quizzes.length !== 6) {
    errors.push(`Nombre de questionnaires incorrect: ${quizzes.length} (attendu: 6)`);
  }

  const activeQuizzes = quizzes.filter(q => q.is_active);
  if (activeQuizzes.length === 0) {
    errors.push('Aucun questionnaire actif');
  }

  const orders = quizzes.map(q => q.order);
  const uniqueOrders = new Set(orders);
  if (orders.length !== uniqueOrders.size) {
    errors.push('Ordres de questionnaires dupliqués détectés');
  }

  const freeQuizzes = quizzes.filter(q => q.type === 'gratuit');
  if (freeQuizzes.length === 0) {
    errors.push('Aucun questionnaire gratuit disponible');
  }

  if (errors.length > 0) {
    console.error('Erreurs de configuration détectées:');
    errors.forEach(err => console.error(`  - ${err}`));
    return false;
  }

  console.log('✅ Configuration valide');
  return true;
}

/**
 * Obtenir les questionnaires disponibles pour un utilisateur
 */
export function getAvailableQuizzesForUser(
  subscriptionTier: keyof typeof SUBSCRIPTION_LIMITS
): QuizConfig[] {
  const availableIds = SUBSCRIPTION_LIMITS[subscriptionTier].available_quizzes;

  return Object.values(PRODUCTION_QUIZZES)
    .filter(quiz => quiz.is_active && availableIds.includes(quiz.id))
    .sort((a, b) => a.order - b.order);
}

/**
 * Vérifier si un utilisateur peut accéder à un questionnaire
 */
export function canAccessQuiz(
  quizId: string,
  subscriptionTier: keyof typeof SUBSCRIPTION_LIMITS
): boolean {
  const availableIds = SUBSCRIPTION_LIMITS[subscriptionTier].available_quizzes;
  return availableIds.includes(quizId);
}

/**
 * Obtenir le tier minimum requis pour un questionnaire
 */
export function getRequiredTierForQuiz(quizId: string): string | null {
  const quiz = PRODUCTION_QUIZZES[quizId];
  return quiz?.min_premium_tier || null;
}
