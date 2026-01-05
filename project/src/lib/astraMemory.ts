import { supabase } from './supabase';

export type AstraMemory = {
  profile: {
    first_name?: string;
    pseudo?: string;
    preferences?: any;
    created_at?: string;
  };
  questionnaires: {
    [key: string]: {
      completed: boolean;
      date?: string;
      results?: any;
    };
  };
  compatibilities_viewed: Array<{
    user_id: string;
    pseudo: string;
    score: number;
    date: string;
    feelings?: string;
  }>;
  messages_exchanged: Array<{
    with_user: string;
    pseudo: string;
    last_message?: string;
    conversation_status: string;
  }>;
  discoveries: Array<{
    user_id: string;
    viewed_date: string;
    interested?: boolean;
  }>;
  preferences_expressed: {
    dislikes: string[];
    likes: string[];
    dealbreakers: string[];
  };
  emotional_state: {
    fears: string[];
    dreams: string[];
    current_mood: string;
    relationship_goals: string;
  };
  astra_interactions: {
    total_messages: number;
    favorite_topics: string[];
    last_greeting: string | null;
    personalization_level: 'low' | 'medium' | 'high';
  };
  insights: string[];
  action_history: Array<{
    action: string;
    type?: string;
    with?: string;
    to?: string;
    date: string;
    details?: any;
  }>;
};

export async function getAstraMemory(userId: string): Promise<AstraMemory | null> {
  const { data, error } = await supabase
    .from('astra_memory')
    .select('memory_data')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[Astra Memory] Error loading memory:', error);
    return null;
  }

  return data?.memory_data as AstraMemory || null;
}

export async function updateAstraMemory(
  userId: string,
  updates: Partial<AstraMemory>
): Promise<boolean> {
  const currentMemory = await getAstraMemory(userId);

  if (!currentMemory) {
    const { error } = await supabase
      .from('astra_memory')
      .insert({
        user_id: userId,
        memory_data: updates
      });

    if (error) {
      console.error('[Astra Memory] Error creating memory:', error);
      return false;
    }
    return true;
  }

  const mergedMemory = deepMerge(currentMemory, updates);

  const { error } = await supabase
    .from('astra_memory')
    .update({ memory_data: mergedMemory })
    .eq('user_id', userId);

  if (error) {
    console.error('[Astra Memory] Error updating memory:', error);
    return false;
  }

  return true;
}

export async function trackAction(
  userId: string,
  action: string,
  details?: any
): Promise<void> {
  const memory = await getAstraMemory(userId);
  if (!memory) return;

  const newAction = {
    action,
    date: new Date().toISOString(),
    ...details
  };

  const updatedHistory = [
    ...(memory.action_history || []),
    newAction
  ].slice(-100);

  await updateAstraMemory(userId, {
    action_history: updatedHistory
  });
}

export async function trackQuestionnaireCompletion(
  userId: string,
  questionnaireType: string,
  results: any
): Promise<void> {
  await trackAction(userId, 'completed_questionnaire', {
    type: questionnaireType
  });

  const memory = await getAstraMemory(userId);
  if (!memory) return;

  await updateAstraMemory(userId, {
    questionnaires: {
      ...memory.questionnaires,
      [questionnaireType]: {
        completed: true,
        date: new Date().toISOString(),
        results
      }
    }
  });
}

export async function trackCompatibilityView(
  userId: string,
  targetUserId: string,
  targetPseudo: string,
  score: number
): Promise<void> {
  await trackAction(userId, 'viewed_compatibility', {
    with: targetPseudo
  });

  const memory = await getAstraMemory(userId);
  if (!memory) return;

  const existingView = memory.compatibilities_viewed?.find(
    c => c.user_id === targetUserId
  );

  if (!existingView) {
    await updateAstraMemory(userId, {
      compatibilities_viewed: [
        ...(memory.compatibilities_viewed || []),
        {
          user_id: targetUserId,
          pseudo: targetPseudo,
          score,
          date: new Date().toISOString()
        }
      ]
    });
  }
}

export async function trackMessageSent(
  userId: string,
  toUserId: string,
  toPseudo: string
): Promise<void> {
  await trackAction(userId, 'sent_message', {
    to: toPseudo
  });

  const memory = await getAstraMemory(userId);
  if (!memory) return;

  const existingConvo = memory.messages_exchanged?.find(
    m => m.with_user === toUserId
  );

  if (!existingConvo) {
    await updateAstraMemory(userId, {
      messages_exchanged: [
        ...(memory.messages_exchanged || []),
        {
          with_user: toUserId,
          pseudo: toPseudo,
          conversation_status: 'active'
        }
      ]
    });
  }
}


export async function updateAstraInteractions(
  userId: string,
  incrementMessages: boolean = true
): Promise<void> {
  const memory = await getAstraMemory(userId);
  if (!memory) return;

  const currentInteractions = memory.astra_interactions || {
    total_messages: 0,
    favorite_topics: [],
    last_greeting: null,
    personalization_level: 'low'
  };

  const totalMessages = currentInteractions.total_messages + (incrementMessages ? 1 : 0);

  let personalizationLevel: 'low' | 'medium' | 'high' = 'low';
  if (totalMessages >= 50) personalizationLevel = 'high';
  else if (totalMessages >= 20) personalizationLevel = 'medium';

  await updateAstraMemory(userId, {
    astra_interactions: {
      ...currentInteractions,
      total_messages: totalMessages,
      personalization_level: personalizationLevel,
      last_greeting: new Date().toISOString()
    }
  });
}

function deepMerge(target: any, source: any): any {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}
