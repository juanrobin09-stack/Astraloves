import { supabase } from './supabase';

export interface QuizResult {
  id: string;
  user_id: string;
  quiz_id: string;
  quiz_name: string;
  result_title?: string;
  result_subtitle?: string;
  result_data: any;
  answers?: any;
  percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  hasResults: boolean;
  quizzesTaken: string[];
  astral: any | null;
  attachment: any | null;
  archetype: any | null;
  firstImpression: any | null;
}

/**
 * Sauvegarder un résultat de quiz
 * Si un résultat existe déjà pour ce quiz, il est mis à jour
 */
export async function saveQuizResult(
  userId: string,
  quizId: string,
  quizName: string,
  result: any,
  answers?: any
): Promise<QuizResult | null> {
  try {
    console.log('[QuizResultsService] Sauvegarde résultat:', { userId, quizId, quizName });

    // Vérifier si un résultat existe déjà
    const { data: existing } = await supabase
      .from('quiz_results')
      .select('id')
      .eq('user_id', userId)
      .eq('quiz_id', quizId)
      .maybeSingle();

    if (existing) {
      // Mettre à jour
      const { data, error } = await supabase
        .from('quiz_results')
        .update({
          quiz_name: quizName,
          result_title: result.title,
          result_subtitle: result.subtitle,
          result_data: result,
          answers: answers,
          percentage: result.percentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('[QuizResultsService] Erreur update:', error);
        throw error;
      }

      console.log('[QuizResultsService] Résultat mis à jour:', data);
      return data;
    } else {
      // Créer nouveau
      const { data, error } = await supabase
        .from('quiz_results')
        .insert({
          user_id: userId,
          quiz_id: quizId,
          quiz_name: quizName,
          result_title: result.title,
          result_subtitle: result.subtitle,
          result_data: result,
          answers: answers,
          percentage: result.percentage
        })
        .select()
        .single();

      if (error) {
        console.error('[QuizResultsService] Erreur insert:', error);
        throw error;
      }

      console.log('[QuizResultsService] Résultat créé:', data);
      return data;
    }
  } catch (error) {
    console.error('[QuizResultsService] Erreur sauvegarde:', error);
    return null;
  }
}

/**
 * Récupérer tous les résultats d'un utilisateur
 */
export async function getUserQuizResults(userId: string): Promise<QuizResult[]> {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[QuizResultsService] Erreur récupération:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[QuizResultsService] Erreur:', error);
    return [];
  }
}

/**
 * Récupérer un résultat spécifique
 */
export async function getQuizResult(userId: string, quizId: string): Promise<QuizResult | null> {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .eq('quiz_id', quizId)
      .maybeSingle();

    if (error) {
      console.error('[QuizResultsService] Erreur:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[QuizResultsService] Erreur:', error);
    return null;
  }
}

/**
 * Récupérer le profil complet pour Astra
 * Combine tous les résultats de quiz
 */
export async function getFullProfileForAstra(userId: string): Promise<UserProfile> {
  try {
    const results = await getUserQuizResults(userId);

    const profile: UserProfile = {
      hasResults: results.length > 0,
      quizzesTaken: results.map(r => r.quiz_name),
      astral: null,
      attachment: null,
      archetype: null,
      firstImpression: null
    };

    results.forEach(result => {
      switch (result.quiz_id) {
        case 'astral':
          profile.astral = result.result_data;
          break;
        case 'attachment':
          profile.attachment = result.result_data;
          break;
        case 'archetype':
          profile.archetype = result.result_data;
          break;
        case 'first-impression':
          profile.firstImpression = result.result_data;
          break;
      }
    });

    console.log('[QuizResultsService] Profil complet:', profile);
    return profile;
  } catch (error) {
    console.error('[QuizResultsService] Erreur profil complet:', error);
    return {
      hasResults: false,
      quizzesTaken: [],
      astral: null,
      attachment: null,
      archetype: null,
      firstImpression: null
    };
  }
}

/**
 * Construire le contexte enrichi pour Astra
 */
export function buildAstraContext(profile: UserProfile): string {
  if (!profile.hasResults) {
    return "";
  }

  let context = `\n\n=== PROFIL PSYCHOLOGIQUE DE L'UTILISATEUR ===\n`;
  context += `Quiz complétés: ${profile.quizzesTaken.join(', ')}\n\n`;

  if (profile.astral) {
    context += `🌟 THÈME ASTRAL:\n`;
    context += `- Type: ${profile.astral.title || 'Non défini'}\n`;
    context += `- Élément: ${profile.astral.element || 'Non défini'}\n`;
    if (profile.astral.traits) {
      context += `- Traits: ${profile.astral.traits.join(', ')}\n`;
    }
    if (profile.astral.inLove) {
      context += `- En amour: ${profile.astral.inLove}\n`;
    }
    if (profile.astral.compatibility) {
      context += `- Compatibilité: ${profile.astral.compatibility}\n`;
    }
    context += `\n`;
  }

  if (profile.attachment) {
    context += `💗 STYLE D'ATTACHEMENT:\n`;
    context += `- Type: ${profile.attachment.title || 'Non défini'}\n`;
    if (profile.attachment.pattern) {
      context += `- Pattern: ${profile.attachment.pattern}\n`;
    }
    if (profile.attachment.strengths) {
      context += `- Forces: ${profile.attachment.strengths.join(', ')}\n`;
    }
    if (profile.attachment.challenges) {
      context += `- Défis: ${profile.attachment.challenges.join(', ')}\n`;
    }
    if (profile.attachment.idealPartner) {
      context += `- Partenaire idéal: ${profile.attachment.idealPartner}\n`;
    }
    context += `\n`;
  }

  if (profile.archetype) {
    context += `👑 ARCHÉTYPE AMOUREUX:\n`;
    context += `- Type: ${profile.archetype.title || 'Non défini'}\n`;
    if (profile.archetype.loveStyle) {
      context += `- Style amoureux: ${profile.archetype.loveStyle}\n`;
    }
    if (profile.archetype.attracts) {
      context += `- Attire: ${profile.archetype.attracts}\n`;
    }
    if (profile.archetype.shadow) {
      context += `- Ombre: ${profile.archetype.shadow}\n`;
    }
    context += `\n`;
  }

  if (profile.firstImpression) {
    context += `👁️ PREMIÈRE IMPRESSION:\n`;
    context += `- Type: ${profile.firstImpression.title || 'Non défini'}\n`;
    if (profile.firstImpression.strengths) {
      context += `- Forces: ${profile.firstImpression.strengths.join(', ')}\n`;
    }
    if (profile.firstImpression.description) {
      context += `- Perception: ${profile.firstImpression.description}\n`;
    }
    context += `\n`;
  }

  context += `=== FIN DU PROFIL ===\n`;
  context += `Utilise ces informations pour personnaliser tes conseils et analyses de compatibilité.\n`;

  return context;
}
