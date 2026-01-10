import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import type { SubscriptionTier } from '@/types';

export function HoroscopeSection({ userId, tier }: { userId: string; tier: SubscriptionTier }) {
  const { data: horoscope } = useQuery({
    queryKey: ['horoscope', userId],
    queryFn: async () => {
      const { data } = await supabase.from('horoscopes').select('*').eq('user_id', userId).eq('horoscope_type', 'daily').single();
      return data;
    }
  });

  return (
    <div className="glass-effect p-8 rounded-large max-w-3xl mx-auto">
      <h3 className="text-2xl font-display font-bold mb-6">Horoscope du Jour</h3>
      <p className="text-white/80 leading-relaxed">{horoscope?.content || "ASTRA observe vos astres. Votre horoscope personnalisé arrive."}</p>
    </div>
  );
}
