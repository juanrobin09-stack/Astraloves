import { supabase } from './supabase';

export interface AstraMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface UserContext {
  name?: string;
  signeSolaire?: string;
  ascendant?: string;
  lune?: string;
  relationship?: {
    status: 'single' | 'dating' | 'relationship';
    lookingFor?: string;
    challenges?: string[];
  };
  recentMatchs?: Array<{
    pseudo: string;
    signe: string;
    compatibility: number;
    conversationStarted: boolean;
  }>;
  preferences?: {
    communicationStyle?: string;
    values?: string[];
  };
}

export interface AstraInsights {
  attachmentStyle?: string;
  loveLanguage?: string;
  patterns?: string[];
  strengths?: string[];
  areasToWork?: string[];
  communicationStyle?: string;
}

export interface AstraConversation {
  id: string;
  user_id: string;
  plan: 'free' | 'premium';
  messages_data: AstraMessage[];
  user_context: UserContext;
  insights_data: AstraInsights;
  created_at: string;
  last_message_at: string;
  expires_at?: string | null;
}

const SENSITIVE_KEYWORDS = [
  'suicide',
  'suicid',
  'me tuer',
  'en finir',
  'depression',
  'dépression',
  'anxiété sévère',
  'trouble alimentaire',
  'anorexie',
  'boulimie',
  'automutilation',
  'me faire mal',
  'violence',
  'abus',
  'viol',
  'trauma',
  'traumatisme',
  'addiction',
  'drogue',
  'alcool',
];

export function detectSensitiveTopic(message: string): boolean {
  const lower = message.toLowerCase();
  return SENSITIVE_KEYWORDS.some((kw) => lower.includes(kw));
}

export function getSafeguardResponse(): string {
  return `Je vois que tu traverses quelque chose de difficile. 💙

Je ne suis pas qualifiée pour t'aider avec ce type de situation. C'est important que tu parles à quelqu'un de formé :

📞 **SOS Amitié** : 09 72 39 40 50 (24h/24, 7j/7)
📞 **Fil Santé Jeunes** : 0 800 235 236 (9h-23h)
💬 https://www.filsantejeunes.com

Tu mérites un vrai soutien professionnel. Prends soin de toi. ✨`;
}

export async function getOrCreateConversation(userId: string): Promise<AstraConversation | null> {
  try {
    const { data: profile } = await supabase
      .from('astra_profiles')
      .select('is_premium, username, signe_solaire, ascendant, lune, looking_for, valeurs')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) return null;

    const plan = profile.is_premium ? 'premium' : 'free';

    let { data: conversation } = await supabase
      .from('astra_conversations')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (conversation) {
      if (conversation.expires_at && new Date(conversation.expires_at) < new Date()) {
        await supabase
          .from('astra_conversations')
          .update({
            messages_data: [],
            expires_at: plan === 'free' ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
          })
          .eq('id', conversation.id);

        conversation.messages_data = [];
      }

      await supabase
        .from('astra_conversations')
        .update({ plan })
        .eq('id', conversation.id);

      return { ...conversation, plan };
    }

    const userContext: UserContext = {
      name: profile.username,
      signeSolaire: profile.signe_solaire,
      ascendant: profile.ascendant,
      lune: profile.lune,
      relationship: {
        status: 'single',
        lookingFor: profile.looking_for,
      },
      preferences: {
        values: profile.valeurs || [],
      },
    };

    const { data: newConversation, error } = await supabase
      .from('astra_conversations')
      .insert({
        user_id: userId,
        title: 'Ma conversation avec Astra',
        plan,
        messages_data: [],
        user_context: userContext,
        insights_data: {},
        expires_at: plan === 'free' ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
      })
      .select()
      .single();

    if (error) throw error;

    return newConversation;
  } catch (error) {
    console.error('Get/create conversation error:', error);
    return null;
  }
}

export function getAstraSystemPrompt(userContext: UserContext, insights: AstraInsights, plan: 'free' | 'premium'): string {
  let systemPrompt = `Tu es Astra, un coach relationnel bienveillant spécialisé en astrologie.

PERSONNALITÉ :
- Chaleureuse et empathique
- Positive mais réaliste
- Utilise des emojis avec parcimonie (💫 ⭐ 💕)
- Tutoie l'utilisateur
- Références astrologiques pertinentes mais pas excessives

TU PEUX :
- Conseils relationnels (couple, amitié, dating)
- Analyse de compatibilité astrologique
- Aide à la communication
- Support émotionnel léger
- Suggestions de messages
- Interprétation de comportements amoureux

TU NE PEUX PAS :
- Diagnostics médicaux ou psychologiques
- Prédire l'avenir avec certitude
- Remplacer un thérapeute
- Garantir des résultats
- Décider à la place de l'utilisateur

IMPORTANT :
- Si question médicale/psy : renvoie vers un professionnel
- Toujours rappeler le libre arbitre
- Astrologie = guide, pas destin
- Reste dans ton rôle de coach relationnel`;

  if (plan === 'premium') {
    systemPrompt += `\n\nCONTEXTE UTILISATEUR (MÉMOIRE PREMIUM) :`;

    if (userContext.name) {
      systemPrompt += `\nNom : ${userContext.name}`;
    }

    if (userContext.signeSolaire) {
      systemPrompt += `\nSigne solaire : ${userContext.signeSolaire}`;
    }

    if (userContext.ascendant) {
      systemPrompt += `\nAscendant : ${userContext.ascendant}`;
    }

    if (userContext.lune) {
      systemPrompt += `\nLune : ${userContext.lune}`;
    }

    if (userContext.relationship?.lookingFor) {
      systemPrompt += `\nRecherche : ${userContext.relationship.lookingFor}`;
    }

    if (userContext.preferences?.values?.length) {
      systemPrompt += `\nValeurs : ${userContext.preferences.values.join(', ')}`;
    }

    if (userContext.recentMatchs?.length) {
      systemPrompt += `\n\nMATCHS RÉCENTS :`;
      userContext.recentMatchs.forEach((m) => {
        systemPrompt += `\n- ${m.pseudo} (${m.signe}, ${m.compatibility}% compatible)`;
      });
    }

    if (insights.patterns?.length || insights.attachmentStyle || insights.loveLanguage) {
      systemPrompt += `\n\nINSIGHTS DÉCOUVERTS :`;

      if (insights.attachmentStyle) {
        systemPrompt += `\nStyle d'attachement : ${insights.attachmentStyle}`;
      }

      if (insights.loveLanguage) {
        systemPrompt += `\nLangage d'amour : ${insights.loveLanguage}`;
      }

      if (insights.patterns?.length) {
        systemPrompt += `\nPatterns : ${insights.patterns.join(', ')}`;
      }
    }

    systemPrompt += `\n\nTu te souviens de toutes vos conversations passées. Réfère-toi aux discussions précédentes pour donner des conseils personnalisés et suivre son évolution.`;
  } else {
    systemPrompt += `\n\nCONTEXTE UTILISATEUR (FREE - LIMITÉ) :`;

    if (userContext.signeSolaire) {
      systemPrompt += `\nSigne : ${userContext.signeSolaire}`;
    }

    systemPrompt += `\n\nCette conversation sera effacée dans 24h. Tu n'as pas accès à l'historique long terme.`;
  }

  return systemPrompt;
}

export async function addMessageToConversation(
  conversationId: string,
  userMessage: string,
  assistantMessage: string
): Promise<boolean> {
  try {
    const { data: conversation } = await supabase
      .from('astra_conversations')
      .select('messages_data')
      .eq('id', conversationId)
      .single();

    if (!conversation) return false;

    const messages = conversation.messages_data || [];
    messages.push(
      {
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
      },
      {
        role: 'assistant',
        content: assistantMessage,
        timestamp: Date.now(),
      }
    );

    const { error } = await supabase
      .from('astra_conversations')
      .update({
        messages_data: messages,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Add message error:', error);
    return false;
  }
}

export async function getUserInsights(userId: string): Promise<AstraInsights> {
  try {
    const { data } = await supabase
      .from('astra_user_insights')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!data) return {};

    return {
      attachmentStyle: data.attachment_style,
      loveLanguage: data.love_language,
      patterns: data.patterns || [],
      strengths: data.strengths || [],
      areasToWork: data.areas_to_work || [],
      communicationStyle: data.communication_style,
    };
  } catch (error) {
    console.error('Get insights error:', error);
    return {};
  }
}

export async function updateUserInsights(userId: string, insights: Partial<AstraInsights>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('astra_user_insights')
      .upsert({
        user_id: userId,
        attachment_style: insights.attachmentStyle,
        love_language: insights.loveLanguage,
        patterns: insights.patterns,
        strengths: insights.strengths,
        areas_to_work: insights.areasToWork,
        communication_style: insights.communicationStyle,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Update insights error:', error);
    return false;
  }
}

export function getExpirationTime(expiresAt?: string | null): string {
  if (!expiresAt) return '';

  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires.getTime() - now.getTime();

  if (diffMs <= 0) return 'Expiré';

  const diffHours = Math.floor(diffMs / 3600000);
  const diffMins = Math.floor((diffMs % 3600000) / 60000);

  if (diffHours > 0) {
    return `${diffHours}h${diffMins > 0 ? diffMins.toString().padStart(2, '0') : ''}`;
  }

  return `${diffMins} min`;
}

export function getContextualSuggestions(plan: 'free' | 'premium', userContext?: UserContext): string[] {
  if (plan === 'premium' && userContext?.recentMatchs?.length) {
    return [
      `💬 Comment démarrer avec ${userContext.recentMatchs[0].pseudo} ?`,
      `❤️ Compatibilité avec ${userContext.recentMatchs[0].pseudo}`,
      '🔮 Analyse mes conversations récentes',
      '💕 Conseils pour mon prochain date',
    ];
  }

  return [
    '💬 Comment démarrer une conversation',
    '❤️ Compatibilité de mon signe',
    '🔮 Conseils selon mon ascendant',
    '💕 Comment savoir si ça l\'intéresse ?',
  ];
}
