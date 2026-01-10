import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SubscriptionTier } from '../lib/subscriptionLimits';

interface UseAstraChatLimitProps {
  userId?: string;
  premiumTier?: SubscriptionTier | null;
}

export function useAstraChatLimit({ userId, premiumTier }: UseAstraChatLimitProps) {
  const [messagesUsed, setMessagesUsed] = useState(0);
  const [limit, setLimit] = useState(10);
  const [canSend, setCanSend] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      checkLimit();
    }
  }, [userId, premiumTier]);

  const checkLimit = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Utiliser la fonction RPC sécurisée
      const { data, error } = await supabase.rpc('check_astra_limit', { p_user_id: userId });

      if (error) {
        console.error('[useAstraChatLimit] RPC error:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setMessagesUsed(data.used || 0);
        setLimit(data.limit || 10);
        setCanSend(data.allowed ?? true);
      }
    } catch (err) {
      console.error('[useAstraChatLimit] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string, profile: any, memory: any) => {
    if (!userId || !canSend) {
      return { error: 'Limite atteinte' };
    }

    try {
      // Call Astra Edge Function (l'incrémentation se fait côté serveur)
      const { data, error } = await supabase.functions.invoke('astra-chat', {
        body: {
          messages: [{ role: 'user', content: message }],
          profile,
          memory
        }
      });

      if (error) {
        console.error('[useAstraChatLimit] Edge function error:', error);
        throw error;
      }

      // Vérifier si limite atteinte
      if (data?.limitReached) {
        setCanSend(false);
        return { error: data.message || 'Limite atteinte' };
      }

      if (!data || !data.message) {
        throw new Error('Pas de réponse de l\'API');
      }

      // Rafraîchir le compteur depuis le serveur
      await checkLimit();

      return { response: data.message, used: messagesUsed + 1 };
    } catch (error: any) {
      console.error('[useAstraChatLimit] Error:', error);
      return { error: error.message || 'Erreur API. Réessaie.' };
    }
  };

  return {
    messagesUsed,
    limit,
    canSend,
    loading,
    remaining: Math.max(0, limit - messagesUsed),
    checkLimit,
    sendMessage
  };
}
