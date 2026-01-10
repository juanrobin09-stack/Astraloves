import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useSecureLimits() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchLimits = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const { data: result } = await supabase.rpc('get_user_limits_and_usage');
      setData(result);
    } catch (err) {
      console.error('[useSecureLimits] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  const canUse = (type: string): boolean => {
    if (!data) return false;
    return data.remaining?.[type] > 0;
  };

  return {
    plan: data?.plan || 'free',
    limits: data?.limits,
    usage: data?.usage,
    remaining: data?.remaining,
    loading,
    canUse,
    refresh: fetchLimits,
  };
}

export function useAstraLimits() {
  const { user } = useAuth();
  const [canSend, setCanSend] = useState(true);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);

  const checkLimit = useCallback(async () => {
    if (!user) {
      setCanSend(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('check_astra_limit', { p_user_id: user.id });

      if (error) {
        console.error('[useAstraLimits] Error:', error);
        setCanSend(true);
      } else {
        setCanSend(data?.allowed ?? true);
        setRemaining(data?.remaining ?? null);
        setLimit(data?.limit ?? 10);
      }
    } catch (err) {
      console.error('[useAstraLimits] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkLimit();
  }, [checkLimit]);

  return {
    canSend,
    remaining,
    limit,
    loading,
    refresh: checkLimit
  };
}

export default useSecureLimits;
