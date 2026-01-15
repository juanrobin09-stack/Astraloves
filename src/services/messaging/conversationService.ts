// ═══════════════════════════════════════════════════════════════════════
// CONVERSATION SERVICE
// ═══════════════════════════════════════════════════════════════════════

import { supabase } from '@/config/supabase';
import type { Conversation, Message } from '@/types';

export const conversationService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          profiles!conversations_user_id_2_fkey(id, first_name, avatar_url, sun_sign, moon_sign)
        `)
        .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) {
        console.warn('Conversations fetch error:', error.message);
        return [];
      }
      return (data || []) as Conversation[];
    } catch (err) {
      console.warn('Conversations fetch failed');
      return [];
    }
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Messages fetch error:', error.message);
        return [];
      }
      return (data || []) as Message[];
    } catch (err) {
      console.warn('Messages fetch failed');
      return [];
    }
  },

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<Message | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
        })
        .select()
        .single();

      if (error) {
        console.error('Send message error:', error.message);
        return null;
      }

      // Update conversation preview (fire and forget)
      supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: content.substring(0, 100),
        })
        .eq('id', conversationId)
        .then(() => {});

      return data as Message;
    } catch (err) {
      console.error('Send message failed');
      return null;
    }
  },

  async markAsRead(conversationId: string, userId: string) {
    try {
      const { data: conversation } = await supabase
        .from('conversations')
        .select('user_id_1, user_id_2')
        .eq('id', conversationId)
        .single();

      if (!conversation) return;

      const isUser1 = conversation.user_id_1 === userId;
      const unreadField = isUser1 ? 'unread_count_1' : 'unread_count_2';

      await supabase
        .from('conversations')
        .update({ [unreadField]: 0 })
        .eq('id', conversationId);

      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId);
    } catch (err) {
      console.warn('Mark as read failed');
    }
  },
};
