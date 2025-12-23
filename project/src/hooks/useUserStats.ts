import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface UserStats {
  profileViews: number;
  likes: number;
  matches: number;
  messages: number;
  swipes: number;
  profileScore: number;
  lastUpdated: string;
}

export function useUserStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    profileViews: 0,
    likes: 0,
    matches: 0,
    messages: 0,
    swipes: 0,
    profileScore: 0,
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('profile_views, likes_received, matches_count, messages_sent, swipes_count, profile_score, stats_last_updated')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('[useUserStats] Erreur chargement:', fetchError);
        setError(fetchError.message);
        return;
      }

      if (data) {
        setStats({
          profileViews: data.profile_views || 0,
          likes: data.likes_received || 0,
          matches: data.matches_count || 0,
          messages: data.messages_sent || 0,
          swipes: data.swipes_count || 0,
          profileScore: data.profile_score || 0,
          lastUpdated: data.stats_last_updated || new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('[useUserStats] Erreur:', err);
      setError('Erreur de chargement des stats');
    } finally {
      setLoading(false);
    }
  };

  const incrementStat = async (statName: keyof UserStats, incrementBy: number = 1) => {
    if (!user) return;

    const statMapping: Record<keyof UserStats, string> = {
      profileViews: 'profile_views',
      likes: 'likes_received',
      matches: 'matches_count',
      messages: 'messages_sent',
      swipes: 'swipes_count',
      profileScore: 'profile_score',
      lastUpdated: 'stats_last_updated'
    };

    const dbStatName = statMapping[statName];
    if (!dbStatName || dbStatName === 'stats_last_updated' || dbStatName === 'profile_score') {
      return;
    }

    try {
      const { error: incrementError } = await supabase.rpc('increment_user_stat', {
        user_id: user.id,
        stat_name: dbStatName,
        increment_by: incrementBy
      });

      if (incrementError) {
        console.error('[useUserStats] Erreur incrémentation:', incrementError);
        return;
      }

      setStats(prev => ({
        ...prev,
        [statName]: prev[statName] + incrementBy,
        lastUpdated: new Date().toISOString()
      }));

      await recalculateScore();
    } catch (err) {
      console.error('[useUserStats] Erreur:', err);
    }
  };

  const recalculateScore = async () => {
    if (!user) return;

    try {
      const { data, error: scoreError } = await supabase.rpc('calculate_profile_score', {
        user_id: user.id
      });

      if (scoreError) {
        console.error('[useUserStats] Erreur calcul score:', scoreError);
        return;
      }

      if (typeof data === 'number') {
        setStats(prev => ({
          ...prev,
          profileScore: data
        }));
      }
    } catch (err) {
      console.error('[useUserStats] Erreur calcul score:', err);
    }
  };

  useEffect(() => {
    loadStats();
  }, [user]);

  return {
    stats,
    loading,
    error,
    incrementStat,
    recalculateScore,
    refresh: loadStats
  };
}
