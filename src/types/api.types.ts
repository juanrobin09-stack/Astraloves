// ═══════════════════════════════════════════════════════════════════════
// API TYPES
// ═══════════════════════════════════════════════════════════════════════

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export type NotificationType = 
  | 'new_match' 
  | 'new_message' 
  | 'profile_view' 
  | 'guardian_alert' 
  | 'horoscope_ready' 
  | 'subscription_ending' 
  | 'astra_insight';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
  actionLabel?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface StripeCheckoutSession {
  sessionId: string;
  url: string;
}

export interface CompatibilityRequest {
  userId1: string;
  userId2: string;
}

export interface HoroscopeGenerationRequest {
  userId: string;
  type: 'daily' | 'weekly' | 'monthly';
}

export interface GuardianDetectionRequest {
  userId: string;
  targetUserId: string;
  conversationId: string;
}

export interface AstraChatCompletionRequest {
  userId: string;
  message: string;
}

export interface AstraChatCompletionResponse {
  response: string;
  momentKey?: {
    type: 'insight' | 'consciousness' | 'silence' | 'memory';
    content: string;
  };
}

export interface PhotoModerationRequest {
  photoUrl: string;
}

export interface PhotoModerationResponse {
  approved: boolean;
  reason?: string;
}
