import { useState, useEffect } from 'react';
import { Crown, MessageCircle, Heart, Sparkles, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getUserLimits } from '../lib/subscriptionLimits';

type SubscriptionTabProps = {
  onNavigate: (page: string) => void;
};

type ProfileData = {
  is_premium: boolean;
  premium_until: string | null;
  premium_tier: string | null;
  daily_astra_messages: number;
  daily_swipes: number;
};

export default function SubscriptionTab({ onNavigate }: SubscriptionTabProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [counters, setCounters] = useState({
    private_messages: 0,
    private_messages_limit: 10,
    astra_messages: 0,
    astra_messages_limit: 10,
    swipes: 0,
    swipes_limit: 5,
    reset_time: new Date().toISOString(),
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadCounters();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('astra_profiles')
        .select('is_premium, premium_until, premium_tier, daily_astra_messages, daily_swipes')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCounters = async () => {
    if (!user) return;

    try {
      const { data: dailyMessages } = await supabase
        .from('daily_messages')
        .select('count, date')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      const { data: profileData } = await supabase
        .from('astra_profiles')
        .select('is_premium, premium_tier, daily_astra_messages, swipes_today')
        .eq('id', user.id)
        .maybeSingle();

      const isPremium = profileData?.is_premium || false;
      const limit = isPremium ? Infinity : 10;

      setCounters({
        private_messages: dailyMessages?.count || 0,
        private_messages_limit: limit,
        astra_messages: profileData?.daily_astra_messages || 0,
        astra_messages_limit: 10,
        swipes: profileData?.swipes_today || 0,
        swipes_limit: 10,
        reset_time: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
      });
    } catch (error) {
      console.error('Error loading counters:', error);
    }
  };

  const getResetTimeLeft = () => {
    const now = new Date();
    const reset = new Date(counters.reset_time);
    const diff = reset.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  };

  const getNextPaymentDate = () => {
    if (!profile?.premium_until) return null;
    const date = new Date(profile.premium_until);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Profil non trouvé</div>
      </div>
    );
  }

  return (
    <div className="bg-black h-screen overflow-y-scroll"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#ef4444 #1a1a1a'
      }}
    >
      <div className="bg-gradient-to-br from-red-950/40 via-black to-black border-b border-red-600/20 px-4 py-6">
        <div className="max-w-md sm:max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">💎 Mon Abonnement</h1>
          <p className="text-gray-400 text-sm">Gère ton abonnement et tes limites</p>
        </div>
      </div>

      <div className="max-w-md sm:max-w-2xl mx-auto px-4 py-6 pb-28 space-y-6">
        <div className="bg-gradient-to-br from-gray-900/90 to-black backdrop-blur-xl border border-yellow-600/30 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-bold text-white">💎 Mon Abonnement</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-950/20 to-black border border-yellow-600/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-white font-semibold">💎 {profile.is_premium ? 'Premium actif' : 'Gratuit'}</p>
                  {profile.is_premium && profile.premium_until && (
                    <p className="text-gray-400 text-sm">Prochain paiement : {getNextPaymentDate()}</p>
                  )}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${profile.is_premium ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                Actif
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-red-500" />
                  <span className="text-gray-300">💬 Messages privés</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">
                    {counters.private_messages}/∞
                  </p>
                  <p className="text-xs text-yellow-500">Illimité ♾️</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-300">⭐ Messages Astra</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">
                    {counters.astra_messages}/{getUserLimits(profile.premium_tier || 'free').astraMessagesPerDay}
                  </p>
                  <p className="text-xs text-gray-500">Par jour • Reset dans {getResetTimeLeft()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-gray-300">❤️ Swipes</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">
                    {profile.is_premium ? '∞' : `${counters.swipes}/10`}
                  </p>
                  {profile.is_premium ? (
                    <p className="text-xs text-yellow-500">Illimité ♾️</p>
                  ) : (
                    <p className="text-xs text-gray-500">Par jour • Reset dans {getResetTimeLeft()}</p>
                  )}
                </div>
              </div>
            </div>

            {!profile.is_premium && (
              <button
                onClick={() => onNavigate('premium')}
                className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-black rounded-xl font-bold hover:from-yellow-700 hover:to-yellow-800 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5" />
                Passer à Premium
              </button>
            )}

            <button
              onClick={() => onNavigate('premium')}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              📄 Gérer mon abonnement
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
