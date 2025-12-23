import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface CosmicSignal {
  id: string;
  from_user: string;
  to_user: string;
  signal_type: 'signal' | 'super_nova';
  is_incognito: boolean;
  created_at: string;
  from_profile?: {
    id: string;
    pseudo: string;
    age: number;
    avatar_url: string | null;
    bio: string | null;
    ville: string | null;
  };
}

interface UseCosmicSignalsReturn {
  receivedSignals: CosmicSignal[];
  sentSignals: CosmicSignal[];
  isLoading: boolean;
  error: string | null;
  sendSignal: (toUserId: string, type?: 'signal' | 'super_nova') => Promise<boolean>;
  hasSentSignalTo: (userId: string) => boolean;
  hasReceivedSignalFrom: (userId: string) => boolean;
  isMatch: (userId: string) => boolean;
  unreadCount: number;
  markAsRead: (signalId: string) => Promise<void>;
  dailySignalsUsed: number;
  refreshSignals: () => Promise<void>;
}

export function useCosmicSignals(userId: string | null): UseCosmicSignalsReturn {
  const [receivedSignals, setReceivedSignals] = useState<CosmicSignal[]>([]);
  const [sentSignals, setSentSignals] = useState<CosmicSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailySignalsUsed, setDailySignalsUsed] = useState(0);

  const fetchSignals = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const [receivedRes, sentRes] = await Promise.all([
        supabase
          .from('cosmic_signals')
          .select('*')
          .eq('to_user', userId)
          .order('created_at', { ascending: false }),

        supabase
          .from('cosmic_signals')
          .select('*')
          .eq('from_user', userId)
          .order('created_at', { ascending: false })
      ]);

      if (receivedRes.error) throw receivedRes.error;
      if (sentRes.error) throw sentRes.error;

      const receivedData = receivedRes.data || [];
      const fromUserIds = [...new Set(receivedData.map(s => s.from_user))];

      let signalsWithProfiles: CosmicSignal[] = receivedData;

      if (fromUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('astra_profiles')
          .select('id, pseudo, age, avatar_url, bio, ville')
          .in('id', fromUserIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        signalsWithProfiles = receivedData.map(signal => ({
          ...signal,
          from_profile: profileMap.get(signal.from_user)
        }));
      }

      setReceivedSignals(signalsWithProfiles);
      setSentSignals(sentRes.data || []);

      const today = new Date().toISOString().split('T')[0];
      const todaysSignals = (sentRes.data || []).filter(
        s => s.created_at.startsWith(today)
      );
      setDailySignalsUsed(todaysSignals.length);

    } catch (err) {
      console.error('Error fetching signals:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('cosmic_signals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cosmic_signals',
          filter: `to_user=eq.${userId}`
        },
        () => {
          fetchSignals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchSignals]);

  const sendSignal = async (toUserId: string, type: 'signal' | 'super_nova' = 'signal'): Promise<boolean> => {
    if (!userId) return false;

    try {
      const existingSignal = sentSignals.find(s => s.to_user === toUserId);
      if (existingSignal) {
        return false;
      }

      const { error } = await supabase
        .from('cosmic_signals')
        .insert({
          from_user: userId,
          to_user: toUserId,
          signal_type: type,
          is_incognito: false
        });

      if (error) throw error;

      const receivedFromTarget = receivedSignals.find(s => s.from_user === toUserId);
      if (receivedFromTarget) {
        await supabase
          .from('cosmic_matches')
          .insert({
            user1_id: userId,
            user2_id: toUserId,
            compatibility_score: 85
          });
      }

      await fetchSignals();
      return true;

    } catch (err) {
      console.error('Error sending signal:', err);
      return false;
    }
  };

  const hasSentSignalTo = (targetUserId: string): boolean => {
    return sentSignals.some(s => s.to_user === targetUserId);
  };

  const hasReceivedSignalFrom = (targetUserId: string): boolean => {
    return receivedSignals.some(s => s.from_user === targetUserId);
  };

  const isMatch = (targetUserId: string): boolean => {
    return hasSentSignalTo(targetUserId) && hasReceivedSignalFrom(targetUserId);
  };

  const markAsRead = async (signalId: string): Promise<void> => {
    console.log('Signal marked as read:', signalId);
  };

  const unreadCount = receivedSignals.length;

  return {
    receivedSignals,
    sentSignals,
    isLoading,
    error,
    sendSignal,
    hasSentSignalTo,
    hasReceivedSignalFrom,
    isMatch,
    unreadCount,
    markAsRead,
    dailySignalsUsed,
    refreshSignals: fetchSignals
  };
}
