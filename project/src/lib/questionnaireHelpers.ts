import { supabase } from './supabase';

export interface QuestionnaireResult {
  id: string;
  user_id: string;
  questionnaire_id: string;
  title: string;
  icon: string;
  answers: any;
  analysis: any;
  completed_at: string;
  can_retake_at: string;
  created_at: string;
}

/**
 * Check if user can retake a questionnaire (7 days cooldown)
 */
export async function canRetakeQuestionnaire(
  userId: string,
  questionnaireId: string
): Promise<{ canRetake: boolean; timeLeft?: string; lastResult?: QuestionnaireResult }> {
  const { data, error } = await supabase
    .from('astra_questionnaire_results')
    .select('*')
    .eq('user_id', userId)
    .eq('questionnaire_id', questionnaireId)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error checking retake eligibility:', error);
    return { canRetake: true };
  }

  if (!data) {
    return { canRetake: true };
  }

  const now = new Date();
  const canRetakeAt = new Date(data.can_retake_at);

  if (now >= canRetakeAt) {
    return { canRetake: true, lastResult: data };
  }

  const timeLeft = getTimeUntilRetake(canRetakeAt);
  return { canRetake: false, timeLeft, lastResult: data };
}

/**
 * Get formatted time until retake is available
 */
function getTimeUntilRetake(canRetakeAt: Date): string {
  const now = new Date();
  const diff = canRetakeAt.getTime() - now.getTime();

  if (diff <= 0) return '';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days}j ${hours}h`;
  }
  return `${hours}h`;
}

/**
 * Save questionnaire result with 7-day cooldown
 */
export async function saveQuestionnaireResult(
  userId: string,
  questionnaireId: string,
  title: string,
  icon: string,
  answers: any,
  analysis: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const canRetakeAt = new Date();
    canRetakeAt.setDate(canRetakeAt.getDate() + 7); // 7 days from now

    const { error } = await supabase
      .from('astra_questionnaire_results')
      .insert({
        user_id: userId,
        questionnaire_id: questionnaireId,
        title,
        icon,
        answers,
        analysis,
        completed_at: new Date().toISOString(),
        can_retake_at: canRetakeAt.toISOString(),
      });

    if (error) {
      console.error('Error saving questionnaire result:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error saving questionnaire result:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get all questionnaire results for a user
 */
export async function getUserQuestionnaireResults(
  userId: string
): Promise<QuestionnaireResult[]> {
  const { data, error } = await supabase
    .from('astra_questionnaire_results')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Error fetching questionnaire results:', error);
    return [];
  }

  return data || [];
}

/**
 * Get latest result for a specific questionnaire
 */
export async function getLatestQuestionnaireResult(
  userId: string,
  questionnaireId: string
): Promise<QuestionnaireResult | null> {
  const { data, error } = await supabase
    .from('astra_questionnaire_results')
    .select('*')
    .eq('user_id', userId)
    .eq('questionnaire_id', questionnaireId)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching latest result:', error);
    return null;
  }

  return data;
}

/**
 * Parse analysis data from string or object
 */
export function parseAnalysisData(analysis: any): any {
  if (!analysis) return null;

  if (typeof analysis === 'string') {
    try {
      return JSON.parse(analysis);
    } catch (e) {
      console.error('Error parsing analysis:', e);
      return null;
    }
  }

  return analysis;
}

/**
 * Format analysis sections into arrays of strings
 */
export function formatAnalysisSection(text: string): string[] {
  if (!text) return [];

  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.replace(/^[•\-\*]\s*/, ''));
}
