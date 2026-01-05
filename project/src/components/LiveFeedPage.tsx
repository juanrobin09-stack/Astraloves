import { useState, useEffect } from 'react';
import { Video, TrendingUp, X, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import WithdrawModal from './WithdrawModal';

type TabType = 'lives' | 'gains';

interface LiveFeedPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function LiveFeedPage({ onNavigate }: LiveFeedPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('lives');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [lives, setLives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadLives();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('astra_profiles')
      .select('total_earnings, is_premium, premium_tier, monthly_earnings')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setUserProfile(data);
    }
  };

  const loadLives = async () => {
    try {
      const { data } = await supabase
        .from('live_streams')
        .select(`
          id,
          title,
          creator_id,
          viewer_count,
          started_at,
          creator_profile:astra_profiles!creator_id(
            first_name,
            avatar_url,
            is_premium
          )
        `)
        .eq('status', 'live')
        .order('viewer_count', { ascending: false })
        .limit(20);

      if (data) {
        setLives(data);
      }
    } catch (error) {
      console.error('Error loading lives:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalEarningsStars = userProfile?.total_earnings || 0;
  const totalEarningsEuros = (totalEarningsStars * 0.01).toFixed(2);

  return (
    <div className="h-full bg-black">
      {/* Header avec solde */}
      <div className="sticky top-0 z-50 bg-gradient-to-b from-black via-black to-transparent border-b border-red-900/30 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Video className="w-6 h-6 text-red-500" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">Live</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Gains en argent */}
              {totalEarningsStars > 0 && (
                <button
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-600/30 px-3 sm:px-4 py-2 rounded-xl hover:border-green-500/50 transition-all"
                  onClick={() => setActiveTab('gains')}
                >
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  <span className="font-bold text-white text-sm sm:text-base">{totalEarningsEuros}€</span>
                </button>
              )}
            </div>
          </div>

          {/* Bouton lancer live */}
          <button
            className="w-full mt-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-3"
            onClick={() => onNavigate('start-live')}
          >
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            Lancer mon Live
            {!userProfile?.is_premium && (
              <span className="px-2 py-1 bg-black/30 rounded-lg text-xs">1/mois gratuit</span>
            )}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="sticky top-[140px] sm:top-[120px] z-40 bg-black/95 backdrop-blur-lg border-b border-red-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 sm:gap-4 py-3 overflow-x-auto">
            <button
              className={`flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-bold text-sm sm:text-base whitespace-nowrap transition-all ${
                activeTab === 'lives'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
              onClick={() => setActiveTab('lives')}
            >
              <Video className="w-4 h-4 sm:w-5 sm:h-5" />
              Lives
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-bold text-sm sm:text-base whitespace-nowrap transition-all ${
                activeTab === 'gains'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
              onClick={() => setActiveTab('gains')}
            >
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              Mes Gains
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'lives' && (
          <LivesTab lives={lives} loading={loading} onNavigate={onNavigate} />
        )}

        {activeTab === 'gains' && (
          <EarningsTab userProfile={userProfile} onNavigate={onNavigate} onRefresh={loadUserProfile} />
        )}
      </div>
    </div>
  );
}

// Lives Tab Component
function LivesTab({ lives, loading, onNavigate }: any) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white">Chargement des lives...</p>
      </div>
    );
  }

  if (lives.length === 0) {
    return (
      <div className="text-center py-12">
        <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Aucun live en cours</h3>
        <p className="text-gray-400">Sois le premier à lancer un live !</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {lives.map((live: any) => (
        <div
          key={live.id}
          className="bg-gradient-to-br from-gray-900 to-black border border-red-900/30 rounded-xl overflow-hidden hover:border-red-600/50 transition-all cursor-pointer"
          onClick={() => onNavigate('live-stream', { liveId: live.creator_id })}
        >
          <div className="relative aspect-video bg-gray-800">
            {live.creator_profile?.avatar_url ? (
              <img src={live.creator_profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Video className="w-12 h-12 text-gray-600" />
              </div>
            )}
            <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              LIVE
            </div>
            <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
              {live.viewer_count || 0} 👁️
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-white font-bold text-lg mb-2">{live.title || 'Live Stream'}</h3>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-sm">
                {live.creator_profile?.first_name?.[0] || '?'}
              </div>
              <span className="text-gray-300 text-sm font-semibold">
                {live.creator_profile?.first_name || 'Utilisateur'}
                {live.creator_profile?.is_premium && ' 💎'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Earnings Tab Component
function EarningsTab({ userProfile, onNavigate, onRefresh }: any) {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const totalStars = userProfile?.total_earnings || 0;
  const totalEuros = (totalStars * 0.01).toFixed(2);
  const canWithdraw = totalStars >= 5000;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-3">💰 Mes Gains et Commissions</h2>
      </div>

      {/* Balance principale */}
      <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-2 border-yellow-600/50 rounded-xl p-8 text-center">
        <div className="text-yellow-400 text-sm font-semibold mb-2">Ton solde total</div>
        <div className="text-5xl font-bold text-white mb-2">{totalStars} ⭐</div>
        <div className="text-3xl font-bold text-green-400 mb-6">{totalEuros}€</div>

        {canWithdraw ? (
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all"
          >
            💸 Retirer mes gains
          </button>
        ) : (
          <div>
            <p className="text-gray-300 mb-3">Minimum : 5000 ⭐ (50€)</p>
            <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all"
                style={{ width: `${(totalStars / 5000) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-400">
              Encore {5000 - totalStars} ⭐ ({((5000 - totalStars) * 0.01).toFixed(2)}€) à gagner
            </p>
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <WithdrawModal
          user={userProfile}
          onClose={() => setShowWithdrawModal(false)}
        />
      )}
    </div>
  );
}

