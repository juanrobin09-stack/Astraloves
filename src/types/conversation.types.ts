// ═══════════════════════════════════════════════════════════════════════
// CONVERSATION TYPES
// ═══════════════════════════════════════════════════════════════════════

export type MatchStatus = 'potential' | 'mutual' | 'rejected';

export interface Match {
  id: string;
  userId1: string;
  userId2: string;
  compatibilityScore: number;
  compatibilityDetails?: any;
  status: MatchStatus;
  clickedBy1: boolean;
  clickedBy2: boolean;
  clickedAt1?: string;
  clickedAt2?: string;
  guardianActive1: boolean;
  guardianActive2: boolean;
  guardianReason1?: string;
  guardianReason2?: string;
  guardianUntil1?: string;
  guardianUntil2?: string;
  createdAt: string;
  updatedAt: string;
}

export type ConversationStatus = 'active' | 'archived' | 'blocked';

export interface Conversation {
  id: string;
  userId1: string;
  userId2: string;
  matchId: string;
  status: ConversationStatus;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  silenceRecommendedFor?: string;
  silenceUntil?: string;
  silenceReason?: string;
  unreadCount1: number;
  unreadCount2: number;
  createdAt: string;
  updatedAt: string;
  
  // Populated fields (joins)
  otherUser?: {
    id: string;
    firstName: string;
    avatarUrl?: string;
    sunSign: string;
    moonSign: string;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface ProfileView {
  id: string;
  viewerId: string;
  viewedId: string;
  viewedAt: string;
}
