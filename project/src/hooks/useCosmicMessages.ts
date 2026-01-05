import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_text: string | null;
  last_message_at: string | null;
  last_message_sender_id: string | null;
  user1_unread_count: number;
  user2_unread_count: number;
  match_id: string | null;
  other_user?: {
    id: string;
    pseudo: string;
    age: number;
    avatar_url: string | null;
    bio: string | null;
    ville: string | null;
  };
}

interface UseCosmicMessagesReturn {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  totalUnreadCount: number;
  getConversationWith: (userId: string) => Conversation | undefined;
  getOrCreateConversation: (otherUserId: string) => Promise<string | null>;
  refreshConversations: () => Promise<void>;
}

export function useCosmicMessages(userId: string | null): UseCosmicMessagesReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (fetchError) throw fetchError;

      const conversationsWithProfiles = await Promise.all(
        (data || []).map(async (conv) => {
          const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;

          const { data: profile } = await supabase
            .from('astra_profiles')
            .select('id, pseudo, age, avatar_url, bio, ville')
            .eq('id', otherUserId)
            .maybeSingle();

          return {
            ...conv,
            other_user: profile || undefined
          };
        })
      );

      setConversations(conversationsWithProfiles);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('conversations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchConversations]);

  const totalUnreadCount = conversations.reduce((acc, conv) => {
    if (conv.user1_id === userId) {
      return acc + (conv.user1_unread_count || 0);
    } else {
      return acc + (conv.user2_unread_count || 0);
    }
  }, 0);

  const getConversationWith = (otherUserId: string): Conversation | undefined => {
    return conversations.find(
      conv =>
        (conv.user1_id === otherUserId && conv.user2_id === userId) ||
        (conv.user2_id === otherUserId && conv.user1_id === userId)
    );
  };

  const getOrCreateConversation = async (otherUserId: string): Promise<string | null> => {
    if (!userId) return null;

    const existingConv = getConversationWith(otherUserId);
    if (existingConv) {
      return existingConv.id;
    }

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user1_id: userId,
          user2_id: otherUserId,
          user1_unread_count: 0,
          user2_unread_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      await fetchConversations();
      return data?.id || null;
    } catch (err) {
      console.error('Error creating conversation:', err);
      return null;
    }
  };

  return {
    conversations,
    isLoading,
    error,
    totalUnreadCount,
    getConversationWith,
    getOrCreateConversation,
    refreshConversations: fetchConversations
  };
}

interface UseConversationMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<boolean>;
  markAsRead: () => Promise<void>;
}

export function useConversationMessages(
  conversationId: string | null,
  userId: string | null
): UseConversationMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversationData, setConversationData] = useState<Conversation | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const [messagesRes, convRes] = await Promise.all([
        supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true }),

        supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single()
      ]);

      if (messagesRes.error) throw messagesRes.error;

      setMessages(messagesRes.data || []);
      setConversationData(convRes.data || null);

    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const sendMessage = async (content: string): Promise<boolean> => {
    if (!conversationId || !userId || !conversationData) return false;

    const receiverId = conversationData.user1_id === userId
      ? conversationData.user2_id
      : conversationData.user1_id;

    try {
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          receiver_id: receiverId,
          content,
          is_read: false
        });

      if (msgError) throw msgError;

      const unreadField = conversationData.user1_id === receiverId
        ? 'user1_unread_count'
        : 'user2_unread_count';

      await supabase
        .from('conversations')
        .update({
          last_message_text: content,
          last_message_sender_id: userId,
          last_message_at: new Date().toISOString(),
          [unreadField]: (conversationData.user1_id === receiverId
            ? conversationData.user1_unread_count
            : conversationData.user2_unread_count) + 1
        })
        .eq('id', conversationId);

      return true;

    } catch (err) {
      console.error('Error sending message:', err);
      return false;
    }
  };

  const markAsRead = async (): Promise<void> => {
    if (!conversationId || !userId || !conversationData) return;

    const unreadField = conversationData.user1_id === userId
      ? 'user1_unread_count'
      : 'user2_unread_count';

    try {
      await supabase
        .from('conversations')
        .update({ [unreadField]: 0 })
        .eq('id', conversationId);

      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', userId)
        .eq('is_read', false);

    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    markAsRead
  };
}
