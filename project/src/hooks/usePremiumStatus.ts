import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function usePremiumStatus() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [premiumTier, setPremiumTier] = useState<string>('free');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [premiumUntil, setPremiumUntil] = useState<Date | null>(null);

  const checkPremiumStatus = async () => {
    if (!user) {
      console.log('[usePremiumStatus] No user, setting isPremium to false');
      setIsPremium(false);
      setPremiumTier('free');
      setLoading(false);
      setError(null);
      return;
    }

    console.log('[usePremiumStatus] Checking premium status for user:', user.id);
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('astra_profiles')
        .select('is_premium, premium_until, premium_tier')
        .eq('id', user.id)
        .maybeSingle();

      console.log('[usePremiumStatus] Raw data from DB:', data);
      console.log('[usePremiumStatus] Error from DB:', fetchError);

      if (fetchError) {
        console.error('[usePremiumStatus] Error fetching premium status:', fetchError);
        setIsPremium(false);
        setPremiumTier('free');
        setError(fetchError.message || 'Erreur de chargement');
        setLoading(false);
        return;
      }

      if (data) {
        const premium = Boolean(data.is_premium);
        const rawTier = data.premium_tier || (premium ? 'premium' : 'free');
        const tier = rawTier === 'premium_elite' || rawTier === 'elite' ? 'premium+elite' : rawTier;
        console.log('[usePremiumStatus] is_premium value:', data.is_premium);
        console.log('[usePremiumStatus] premium_tier value (raw):', data.premium_tier);
        console.log('[usePremiumStatus] premium_tier value (normalized):', tier);
        console.log('[usePremiumStatus] premium_until value:', data.premium_until);
        console.log('[usePremiumStatus] Converted to boolean:', premium);

        if (premium && data.premium_until) {
          const expiryDate = new Date(data.premium_until);
          const now = new Date();
          console.log('[usePremiumStatus] Expiry date:', expiryDate);
          console.log('[usePremiumStatus] Current date:', now);
          console.log('[usePremiumStatus] Is expired?', expiryDate < now);

          if (expiryDate < now) {
            console.log('[usePremiumStatus] Premium expired, updating...');
            await supabase
              .from('astra_profiles')
              .update({ is_premium: false, premium_until: null, premium_tier: null })
              .eq('id', user.id);
            setIsPremium(false);
            setPremiumTier('free');
            setPremiumUntil(null);
          } else {
            console.log('[usePremiumStatus] ✅ Setting isPremium to TRUE');
            setIsPremium(true);
            setPremiumTier(tier);
            setPremiumUntil(expiryDate);
          }
        } else {
          console.log('[usePremiumStatus] Setting isPremium to:', premium);
          setIsPremium(premium);
          setPremiumTier(tier);
          setPremiumUntil(data.premium_until ? new Date(data.premium_until) : null);
        }
      } else {
        console.log('[usePremiumStatus] No profile data found');
        setIsPremium(false);
        setPremiumTier('free');
      }
    } catch (err) {
      console.error('[usePremiumStatus] Unexpected error:', err);
      setIsPremium(false);
      setPremiumTier('free');
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
      console.log('[usePremiumStatus] Loading complete');
    }
  };

  useEffect(() => {
    console.log('[usePremiumStatus] useEffect triggered, user.id:', user?.id);
    checkPremiumStatus();

    if (user) {
      const channelName = `premium_status_${user.id}`;
      console.log('[usePremiumStatus] Setting up realtime channel:', channelName);

      const subscription = supabase
        .channel(channelName)
        .on('postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'astra_profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            console.log('[usePremiumStatus] Real-time update received:', payload);
            if (payload.new && 'is_premium' in payload.new) {
              const premium = Boolean(payload.new.is_premium);
              const rawTier = payload.new.premium_tier || (premium ? 'premium' : 'free');
              const tier = rawTier === 'premium_elite' || rawTier === 'elite' ? 'premium+elite' : rawTier;
              console.log('[usePremiumStatus] Real-time update - setting isPremium to:', premium);
              console.log('[usePremiumStatus] Real-time update - tier normalized to:', tier);
              setIsPremium(premium);
              setPremiumTier(tier);
              setPremiumUntil(payload.new.premium_until ? new Date(payload.new.premium_until) : null);
            }
          }
        )
        .subscribe();

      return () => {
        console.log('[usePremiumStatus] Unsubscribing from channel:', channelName);
        subscription.unsubscribe();
      };
    }
  }, [user?.id]);

  return {
    isPremium,
    premiumTier,
    loading,
    error,
    premiumUntil,
    refresh: checkPremiumStatus,
  };
}
