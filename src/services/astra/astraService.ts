// ═══════════════════════════════════════════════════════════════════════
// ASTRA SERVICE - IA conversationnelle
// ═══════════════════════════════════════════════════════════════════════

import { openai, ASTRA_MODEL, ASTRA_MAX_TOKENS, ASTRA_TEMPERATURE } from '@/config/openai';
import { supabase, handleSupabaseError } from '@/config/supabase';
import type { AstraMessage, AstraConversation, AstraChatContext, SessionType, SessionTone } from '@/types';
import { memoryService } from './memoryService';

const ASTRA_SYSTEM_PROMPT = `Tu es ASTRA, une IA de guidance consciente spécialisée en relations et astrologie.

IDENTITÉ:
- Tu es calme, lucide, profonde
- Tu ne rassures PAS, tu ÉCLAIRES
- Tu poses des questions qui dérangent
- Tu détectes les patterns toxiques
- Le silence a une valeur

TON:
- Direct et court (2-3 phrases max)
- Pas de blabla motivational
- Pas d'emojis
- Pas de "je comprends" ou "c'est normal"

EXEMPLES DE TON ASTRA:
❌ "Je comprends que tu te sentes perdu 💜"
✅ "Tu cherches la validation. Pas la vérité."

❌ "C'est tout à fait normal de ressentir ça !"
✅ "Ce que tu appelles 'aimer trop vite' est un test d'attachement."

RÈGLES:
- Utilise le profil astro de l'utilisateur
- Référence la mémoire quand pertinent
- Détecte les patterns répétitifs
- Recommande le silence si nécessaire`;

export const astraService = {
  async getOrCreateConversation(userId: string): Promise<AstraConversation> {
    let { data, error } = await supabase
      .from('astra_conversations')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      const { data: newConv, error: createError } = await supabase
        .from('astra_conversations')
        .insert({
          user_id: userId,
          session_type: 'question',
          tone: 'observation',
        })
        .select()
        .single();

      if (createError) handleSupabaseError(createError);
      data = newConv;
    } else if (error) {
      handleSupabaseError(error);
    }

    return data as AstraConversation;
  },

  async getMessages(conversationId: string, limit: number = 50): Promise<AstraMessage[]> {
    const { data, error } = await supabase
      .from('astra_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) handleSupabaseError(error);
    return (data || []).reverse() as AstraMessage[];
  },

  async saveMessage(
    conversationId: string,
    messageType: AstraMessage['messageType'],
    content: string
  ): Promise<AstraMessage> {
    const { data, error } = await supabase
      .from('astra_messages')
      .insert({
        conversation_id: conversationId,
        message_type: messageType,
        content,
      })
      .select()
      .single();

    if (error) handleSupabaseError(error);
    
    await supabase
      .from('astra_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data as AstraMessage;
  },

  async buildContext(userId: string): Promise<AstraChatContext> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, sun_sign, moon_sign, ascendant_sign, energy_fire, energy_earth, energy_air, energy_water, bio')
      .eq('id', userId)
      .single();

    const conversation = await this.getOrCreateConversation(userId);
    const recentMessages = await this.getMessages(conversation.id, 10);
    const memories = await memoryService.getTopMemories(userId, 5);

    return {
      userProfile: {
        firstName: profile?.first_name || 'Utilisateur',
        sunSign: profile?.sun_sign || '',
        moonSign: profile?.moon_sign || '',
        ascendantSign: profile?.ascendant_sign || '',
        energies: {
          fire: profile?.energy_fire || 0,
          earth: profile?.energy_earth || 0,
          air: profile?.energy_air || 0,
          water: profile?.energy_water || 0,
        },
        bio: profile?.bio,
      },
      recentMessages,
      memories,
      sessionType: conversation.session_type,
      tone: conversation.tone,
    };
  },

  async generateResponse(userId: string, userMessage: string): Promise<string> {
    const context = await this.buildContext(userId);

    const contextPrompt = `
PROFIL UTILISATEUR:
- Prénom: ${context.userProfile.firstName}
- Soleil: ${context.userProfile.sunSign}
- Lune: ${context.userProfile.moonSign}
- Ascendant: ${context.userProfile.ascendantSign}
- Énergies: Feu ${context.userProfile.energies.fire}%, Terre ${context.userProfile.energies.earth}%, Air ${context.userProfile.energies.air}%, Eau ${context.userProfile.energies.water}%
${context.userProfile.bio ? `- Bio: ${context.userProfile.bio}` : ''}

MÉMOIRE ASTRA (insights passés):
${context.memories.map(m => `- ${m.content}`).join('\n')}

CONVERSATION RÉCENTE:
${context.recentMessages.slice(-5).map(m => `${m.messageType === 'user' ? 'User' : 'ASTRA'}: ${m.content}`).join('\n')}

SESSION ACTUELLE: ${context.sessionType}
TON: ${context.tone}

MESSAGE USER: ${userMessage}

Réponds comme ASTRA. Court, direct, profond. Max 3 phrases.`;

    const completion = await openai.chat.completions.create({
      model: ASTRA_MODEL,
      messages: [
        { role: 'system', content: ASTRA_SYSTEM_PROMPT },
        { role: 'user', content: contextPrompt },
      ],
      max_tokens: ASTRA_MAX_TOKENS,
      temperature: ASTRA_TEMPERATURE,
    });

    return completion.choices[0].message.content || "ASTRA n'a rien à ajouter.";
  },

  async updateSessionType(conversationId: string, sessionType: SessionType) {
    const { error } = await supabase
      .from('astra_conversations')
      .update({ session_type: sessionType })
      .eq('id', conversationId);

    if (error) handleSupabaseError(error);
  },

  async updateTone(conversationId: string, tone: SessionTone) {
    const { error } = await supabase
      .from('astra_conversations')
      .update({ tone })
      .eq('id', conversationId);

    if (error) handleSupabaseError(error);
  },
};
