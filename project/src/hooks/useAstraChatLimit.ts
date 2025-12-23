import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getUserLimits, SubscriptionTier } from '../lib/subscriptionLimits';

interface UseAstraChatLimitProps {
  userId?: string;
  premiumTier?: SubscriptionTier | null;
}

export function useAstraChatLimit({ userId, premiumTier }: UseAstraChatLimitProps) {
  const tier = premiumTier || 'free';
  const limits = getUserLimits(tier);
  const limit = limits.astraMessagesPerDay;

  const [messagesUsed, setMessagesUsed] = useState(0);
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

    // Charger le compteur depuis astra_profiles
    const { data } = await supabase
      .from('astra_profiles')
      .select('daily_astra_messages')
      .eq('id', userId)
      .maybeSingle();

    const used = data?.daily_astra_messages || 0;
    setMessagesUsed(used);
    setCanSend(used < limit);
    setLoading(false);
  };

  const sendMessage = async (message: string, profile: any, memory: any) => {
    if (!userId || !canSend) {
      return { error: 'Limite atteinte' };
    }

    try {
      // Increment counter in DB
      const newCount = messagesUsed + 1;

      await supabase
        .from('astra_profiles')
        .update({ daily_astra_messages: newCount })
        .eq('id', userId);

      // Call Astra Edge Function
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

      if (!data || !data.message) {
        throw new Error('Pas de réponse de l\'API');
      }

      // Update local state
      setMessagesUsed(newCount);
      setCanSend(newCount < limit);

      return { response: data.message, used: newCount };
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
