// ═══════════════════════════════════════════════════════════════════════
// ASTRA TYPES
// ═══════════════════════════════════════════════════════════════════════

export type SessionType = 'question' | 'guidance' | 'pattern' | 'guardian' | 'silence';
export type SessionTone = 'observation' | 'clarity' | 'alert' | 'protection';

export type MessageType = 
  | 'user' 
  | 'astra' 
  | 'insight' 
  | 'consciousness' 
  | 'silence' 
  | 'memory';

export interface AstraConversation {
  id: string;
  userId: string;
  sessionType: SessionType;
  tone: SessionTone;
  startedAt: string;
  lastMessageAt: string;
}

export interface AstraMessage {
  id: string;
  conversationId: string;
  messageType: MessageType;
  content: string;
  createdAt: string;
}

export type MemoryType = 
  | 'insight' 
  | 'pattern' 
  | 'preference' 
  | 'trauma' 
  | 'goal' 
  | 'relationship';

export interface AstraMemory {
  id: string;
  userId: string;
  memoryType: MemoryType;
  content: string;
  importance: number; // 1-10
  createdAt: string;
  lastReferenced: string;
  referenceCount: number;
}

export interface KeyMomentData {
  type: 'insight' | 'consciousness' | 'silence' | 'memory';
  content: string;
  actionLabel?: string;
}

export type GuardianPatternType = 
  | 'over_investment' 
  | 'anxious_attachment' 
  | 'avoidant' 
  | 'toxic_repeat' 
  | 'self_sabotage';

export type GuardianActionType = 
  | 'warning' 
  | 'silence_recommended' 
  | 'block_temporary';

export interface GuardianEvent {
  id: string;
  userId: string;
  targetUserId?: string;
  patternType: GuardianPatternType;
  detectedAt: string;
  confidenceScore: number; // 0-100
  actionTaken?: GuardianActionType;
  actionDuration?: string; // ISO 8601 duration
  contextData?: any;
  wasHelpful?: boolean;
  userFeedback?: string;
}

export interface AstraChatContext {
  userProfile: {
    firstName: string;
    sunSign: string;
    moonSign: string;
    ascendantSign: string;
    energies: {
      fire: number;
      earth: number;
      air: number;
      water: number;
    };
    bio?: string;
  };
  recentMessages: AstraMessage[];
  memories: AstraMemory[];
  sessionType: SessionType;
  tone: SessionTone;
}
