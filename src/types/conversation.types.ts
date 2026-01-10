// ═══════════════════════════════════════════════════════════════════════
// CONVERSATION TYPES
// ═══════════════════════════════════════════════════════════════════════

import type { Profile } from './user.types';

export type MatchStatus = 'potential' | 'mutual' | 'rejected';

export interface Match {
  id: string;
  user_id_1: string;
  user_id_2: string;
  compatibility_score: number;
  compatibility_details?: any;
  status: MatchStatus;
  clicked_by_1: boolean;
  clicked_by_2: boolean;
  clicked_at_1?: string;
  clicked_at_2?: string;
  guardian_active_1: boolean;
  guardian_active_2: boolean;
  guardian_reason_1?: string;
  guardian_reason_2?: string;
  guardian_until_1?: string;
  guardian_until_2?: string;
  created_at: string;
  updated_at: string;
  
  // Populated field (optional join)
  other_profile?: Profile;
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
