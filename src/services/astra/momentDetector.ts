// ═══════════════════════════════════════════════════════════════════════
// MOMENT DETECTOR - Détecte quand afficher moments clés
// ═══════════════════════════════════════════════════════════════════════

import type { AstraMessage, KeyMomentData } from '@/types';

export const momentDetector = {
  shouldTriggerMoment(messages: AstraMessage[], tier: string): boolean {
    const astraMessages = messages.filter(m => m.messageType === 'astra');
    
    if (tier === 'free') return false;
    if (tier === 'premium' && astraMessages.length % 6 === 0) return Math.random() > 0.5;
    if (tier === 'elite' && astraMessages.length % 4 === 0) return Math.random() > 0.3;
    
    return false;
  },

  detectPatternRepetition(messages: AstraMessage[]): boolean {
    const userMessages = messages.filter(m => m.messageType === 'user');
    if (userMessages.length < 3) return false;

    const recentContents = userMessages.slice(-3).map(m => m.content.toLowerCase());
    const keywords = ['pourquoi', 'toujours', 'encore', 'jamais'];
    
    return recentContents.filter(content => 
      keywords.some(keyword => content.includes(keyword))
    ).length >= 2;
  },

  generateMoment(messages: AstraMessage[]): KeyMomentData | null {
    const isPattern = this.detectPatternRepetition(messages);
    
    if (isPattern) {
      return {
        type: 'insight',
        content: "Tu poses cette question à chaque fois qu'ASTRA te montre un pattern.\n\nLa résistance est un indice.",
      };
    }

    const types: Array<'insight' | 'consciousness' | 'silence' | 'memory'> = [
      'insight',
      'consciousness',
      'silence',
      'memory',
    ];
    
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    const contents: Record<string, string> = {
      insight: "Troisième fois ce mois-ci que tu sabotes au moment où ça devient stable.\n\nCe n'est pas la personne. C'est la stabilité.",
      consciousness: "Tu viens de réaliser que ce n'était pas lui.\nC'était ce qu'il réveillait en toi.\n\nCette clarté est un début.",
      silence: "ASTRA détecte un pattern toxique.\n\nRépondre maintenant serait répéter le même schéma.\n\nAttends 48h minimum.",
      memory: "Il y a 3 mois, même situation.\nTu avais identifié le pattern.\n\n\"Je teste son attachement.\"\n\nTu l'as oublié ?",
    };
    
    return {
      type: randomType,
      content: contents[randomType],
    };
  },
};
