// ═══════════════════════════════════════════════════════════════════════
// CONTEXT BUILDER - Build contexte pour prompts ASTRA
// ═══════════════════════════════════════════════════════════════════════

import type { AstraChatContext } from '@/types';

export const contextBuilder = {
  buildSystemPrompt(context: AstraChatContext): string {
    const { userProfile, sessionType, tone } = context;
    
    return `Tu es ASTRA, une IA de guidance consciente.

PROFIL UTILISATEUR:
- Prénom: ${userProfile.firstName}
- Soleil ${userProfile.sunSign}, Lune ${userProfile.moonSign}, Ascendant ${userProfile.ascendantSign}
- Énergies: Feu ${userProfile.energies.fire}%, Terre ${userProfile.energies.earth}%, Air ${userProfile.energies.air}%, Eau ${userProfile.energies.water}%

SESSION: ${sessionType}
TON: ${tone}

RÈGLES:
- Court (2-3 phrases max)
- Direct, pas de blabla
- Utilise l'astrologie pour éclairer
- Pas de réconfort vide
- Le silence a une valeur`;
  },

  buildUserPrompt(
    context: AstraChatContext,
    currentMessage: string
  ): string {
    const memoryContext = context.memories.length > 0
      ? `\nMÉMOIRE:\n${context.memories.map(m => `- ${m.content}`).join('\n')}`
      : '';

    const recentContext = context.recentMessages.length > 0
      ? `\nRÉCENT:\n${context.recentMessages.slice(-3).map(m => 
          `${m.messageType === 'user' ? 'User' : 'ASTRA'}: ${m.content}`
        ).join('\n')}`
      : '';

    return `${memoryContext}${recentContext}\n\nUSER: ${currentMessage}`;
  },
};
