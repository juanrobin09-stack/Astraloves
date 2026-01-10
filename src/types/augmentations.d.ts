// ═══════════════════════════════════════════════════════════════════════
// TYPE AUGMENTATIONS - Propriétés manquantes temporaires
// ═══════════════════════════════════════════════════════════════════════

import '@/store/authStore';
import '@/store/subscriptionStore';
import '@/services/astra/astraService';
import '@/services/matching/matchingService';

declare module '@/store/authStore' {
  interface AuthState {
    refreshProfile?: () => Promise<void>;
    logout?: () => Promise<void>;
  }
}

declare module '@/store/subscriptionStore' {
  interface SubscriptionState {
    isPremium?: boolean;
    isElite?: boolean;
  }
}

declare module '@/services/astra/astraService' {
  interface AstraService {
    getMemories?: (conversationId: string) => Promise<any[]>;
  }
}

declare module '@/services/matching/matchingService' {
  interface MatchingService {
    findMatches?: (userId: string) => Promise<any[]>;
    clickMatch?: (userId: string, targetId: string) => Promise<any>;
  }
}

// Augment types for snake_case fields
declare module '@/types/user.types' {
  interface Quota {
    astraMessagesUsed: number;
    astraMessagesLimit: number;
    universClicksUsed: number;
    universClicksLimit: number;
  }
}

declare module '@/types/astro.types' {
  interface NatalChartData {
    elementEnergies?: {
      fire: number;
      earth: number;
      air: number;
      water: number;
    };
  }
  
  interface HousePosition {
    number: number;
    sign: string;
    degree: number;
  }
  
  interface Aspect {
    planet1: string;
    planet2: string;
    type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
    degree: number;
    orb: number;
  }
}

declare module '@/types/astra.types' {
  interface AstraConversation {
    sessionType: string;
  }
}
