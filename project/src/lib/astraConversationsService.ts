import { supabase } from './supabase';

export interface AstraMessage {
  type: 'astra' | 'user';
  text: string;
  time: string;
  timestamp?: string;
  error?: boolean;
}

export interface AstraConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  subscription_tier: 'free' | 'premium' | 'premium_elite';
  expires_at: string | null;
  messages_data: AstraMessage[];
  is_archived: boolean;
}

export async function loadConversations(userId: string): Promise<AstraConversation[]> {
  try {
    const { data, error } = await supabase
      .from('astra_conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error loading conversations:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in loadConversations:', err);
    return [];
  }
}

export async function createConversation(
  userId: string,
  tier: 'free' | 'premium' | 'premium_elite',
  title?: string
): Promise<AstraConversation | null> {
  try {
    const welcomeMsg: AstraMessage = {
      type: 'astra',
      text: 'Salut ! ⭐ Je suis Astra, ton expert IA en séduction et relations.\n\nQue tu cherches à améliorer ton approche, décoder des signaux ou booster ta confiance... je suis là pour toi.\n\nDis-moi, qu\'est-ce qui t\'amène ? 😊',
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('astra_conversations')
      .insert({
        user_id: userId,
        title: title || 'Nouvelle conversation',
        subscription_tier: tier,
        messages_data: [welcomeMsg],
        last_message_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error in createConversation:', err);
    return null;
  }
}

export async function updateConversationMessages(
  conversationId: string,
  messages: AstraMessage[]
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('astra_conversations')
      .update({
        messages_data: messages,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    if (error) {
      console.error('Error updating conversation:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in updateConversationMessages:', err);
    return false;
  }
}

export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('astra_conversations')
      .update({ title })
      .eq('id', conversationId);

    if (error) {
      console.error('Error updating conversation title:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in updateConversationTitle:', err);
    return false;
  }
}

export async function deleteConversation(conversationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('astra_conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in deleteConversation:', err);
    return false;
  }
}

export async function updateConversationTier(
  userId: string,
  newTier: 'free' | 'premium' | 'premium_elite'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('astra_conversations')
      .update({ subscription_tier: newTier })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating conversation tiers:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in updateConversationTier:', err);
    return false;
  }
}

export async function cleanExpiredConversations(): Promise<void> {
  try {
    const { error } = await supabase.rpc('clean_expired_conversations');

    if (error) {
      console.error('Error cleaning expired conversations:', error);
    }
  } catch (err) {
    console.error('Error in cleanExpiredConversations:', err);
  }
}

export async function checkActiveConversationsCount(userId: string, tier: 'free' | 'premium' | 'premium_elite'): Promise<number> {
  if (tier !== 'free') {
    return 0;
  }

  try {
    const { data, error } = await supabase
      .from('astra_conversations')
      .select('id, last_message_at')
      .eq('user_id', userId)
      .eq('subscription_tier', 'free')
      .eq('is_archived', false);

    if (error) {
      console.error('Error checking active conversations:', error);
      return 0;
    }

    if (!data) return 0;

    const now = new Date();
    const activeCount = data.filter(conv => {
      const lastMsg = new Date(conv.last_message_at);
      const hoursDiff = (now.getTime() - lastMsg.getTime()) / (1000 * 60 * 60);
      return hoursDiff < 24;
    }).length;

    return activeCount;
  } catch (err) {
    console.error('Error in checkActiveConversationsCount:', err);
    return 0;
  }
}