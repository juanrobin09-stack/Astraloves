import { supabase } from './supabase';

export interface MessageCounterStatus {
  can_send: boolean;
  current: number;
  limit: number;
  remaining: number;
  is_premium: boolean;
  reset_in_hours?: number;
  error?: string;
}

export async function canSendMessage(userId: string): Promise<MessageCounterStatus> {
  try {
    const { data, error } = await supabase.rpc('can_send_message', {
      p_user_id: userId,
    });

    if (error) throw error;

    return data as MessageCounterStatus;
  } catch (error) {
    console.error('Error checking message limit:', error);
    return {
      can_send: false,
      current: 0,
      limit: 10,
      remaining: 0,
      is_premium: false,
      error: 'Failed to check message limit',
    };
  }
}

export async function incrementMessageCount(userId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('increment_message_count', {
      p_user_id: userId,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error incrementing message count:', error);
  }
}

export async function getMessageCounterStatus(userId: string): Promise<MessageCounterStatus> {
  try {
    const { data, error } = await supabase.rpc('get_message_counter_status', {
      p_user_id: userId,
    });

    if (error) throw error;

    return {
      can_send: true,
      ...data,
    } as MessageCounterStatus;
  } catch (error) {
    console.error('Error getting message counter status:', error);
    return {
      can_send: true,
      current: 0,
      limit: 10,
      remaining: 10,
      is_premium: false,
    };
  }
}
