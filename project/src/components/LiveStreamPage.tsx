import { useState, useEffect } from 'react';
import { X, Video, Gift, MessageCircle, Users, TrendingUp, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import CosmicGifts from './CosmicGifts';
import EarningsQuickView from './EarningsQuickView';

interface LiveStreamPageProps {
  liveId: string;
  onClose: () => void;
  onViewCreatorEarnings?: () => void;
}

interface CreatorProfile {
  id: string;
  first_name: string;
  photo_url?: string;
  is_creator: boolean;
  total_earnings?: number;
}

interface GiftAnimation {
  id: string;
  emoji: string;
  name: string;
  sender: string;
  timestamp: number;
}

type TabType = 'live' | 'earnings';

export default function LiveStreamPage({ liveId, onClose, onViewCreatorEarnings }: LiveStreamPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('live');
  const [viewerCount, setViewerCount] = useState(127);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [giftAnimations, setGiftAnimations] = useState<GiftAnimation[]>([]);
  const [loadingCreator, setLoadingCreator] = useState(true);

  useEffect(() => {
    loadLiveData();
  }, [liveId]);

  const loadLiveData = async () => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('astra_profiles')
        .select('id, first_name, photo_url, is_creator, total_earnings')
        .eq('id', liveId)
        .maybeSingle();

      if (!profileError && profile) {
        setCreatorProfile(profile);
      }
    } catch (error) {
      console.error('Error loading live data:', error);
    } finally {
      setLoadingCreator(false);
    }
  };

  const handleGiftSent = (gift: any) => {
    const newAnimation: GiftAnimation = {
      id: `${Date.now()}-${Math.random()}`,
      emoji: gift.emoji,
      name: gift.name,
      sender: user?.email?.split('@')[0] || 'Anonyme',
      timestamp: Date.now(),
    };

    setGiftAnimations((prev) => [...prev, newAnimation]);

    setTimeout(() => {
      setGiftAnimations((prev) => prev.filter((a) => a.id !== newAnimation.id));
    }, 5000);

    loadLiveData();
  };

  const isCreatorView = user?.id === liveId;

  const tabs = [
    { id: 'live' as TabType, label: 'Live', icon: Video },
    { id: 'earnings' as TabType, label: 'Gains', icon: TrendingUp },
  ];

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">

      {/* Header */}
      <div className="bg-gradient-to-r from-black via-red-900 to-black border-b-2 border-red-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {creatorProfile?.photo_url ? (
            <img
              src={creatorProfile.photo_url}
              alt={creatorProfile.first_name}
              className="w-10 h-10 rounded-full object-cover border-2 border-red-500"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {creatorProfile?.first_name?.[0] || '?'}
              </span>
            </div>
          )}
          <div>
            <p className="text-white font-semibold text-sm">
              {creatorProfile?.first_name || 'Créateur Live'}
              {creatorProfile?.is_creator && (
                <span className="ml-2 text-xs bg-purple-600 px-2 py-0.5 rounded-full">Créateur</span>
              )}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              EN DIRECT • {viewerCount} spectateurs
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-red-900/50 hover:bg-red-800 rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black border-b-2 border-red-900/50 shadow-lg">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-4 font-bold text-base flex flex-col sm:flex-row items-center justify-center gap-2 transition-all duration-200 border-b-4 min-h-[64px] relative ${
                  isActive
                    ? 'bg-gradient-to-b from-red-900/50 to-red-900/30 text-yellow-400 border-yellow-400 shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-red-900/20 border-transparent'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-yellow-400/10 animate-pulse" />
                )}
                <Icon className={`w-6 h-6 relative z-10 ${
                  isActive ? 'text-yellow-400' : 'text-gray-400'
                }`} />
                <span className="text-xs sm:text-sm relative z-10 font-bold">{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-yellow-400 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">

        {/* LIVE TAB */}
        {activeTab === 'live' && (
          <div className="h-full relative">
            {/* Video Area */}
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <div className="text-white text-center">
                <Video className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-xl font-bold">Live Streaming</p>
                <p className="text-sm text-gray-400 mt-2">
                  {creatorProfile ? `${creatorProfile.first_name}'s Live` : `Live ID: ${liveId}`}
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-red-500">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold">EN DIRECT</span>
                </div>
              </div>

              {/* Gift Animations Overlay */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {giftAnimations.map((animation) => (
                  <div
                    key={animation.id}
                    className="absolute bottom-20 left-1/2 -translate-x-1/2"
                    style={{
                      animation: 'float 5s ease-out forwards',
                    }}
                  >
                    <div className="bg-black/80 backdrop-blur-lg rounded-2xl px-6 py-4 border-2 border-purple-500 shadow-lg shadow-purple-500/50">
                      <div className="text-5xl mb-2 text-center">{animation.emoji}</div>
                      <div className="text-white font-bold text-center">{animation.name}</div>
                      <div className="text-gray-400 text-xs text-center mt-1">de {animation.sender}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-lg rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MessageCircle className="w-5 h-5" />
                <span>Chat en direct</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">Le chat sera disponible prochainement</div>
            </div>
          </div>
        )}

        {/* EARNINGS TAB */}
        {activeTab === 'earnings' && (
          <div className="p-4 bg-gradient-to-br from-black via-red-900/30 to-black min-h-full">
            <div className="max-w-4xl mx-auto">
              <EarningsTabContent
                userId={user!.id}
                isCreatorView={isCreatorView}
                creatorProfile={creatorProfile}
                onViewFullDashboard={onViewCreatorEarnings}
              />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0% {
            transform: translate(-50%, 0) scale(0);
            opacity: 0;
          }
          10% {
            transform: translate(-50%, -20px) scale(1);
            opacity: 1;
          }
          90% {
            transform: translate(-50%, -200px) scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -250px) scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// Component for Earnings Tab Content
function EarningsTabContent({
  userId,
  isCreatorView,
  creatorProfile,
  onViewFullDashboard
}: {
  userId: string;
  isCreatorView: boolean;
  creatorProfile: any;
  onViewFullDashboard?: () => void;
}) {
  const [earnings, setEarnings] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawableBalance, setWithdrawableBalance] = useState(0);

  useEffect(() => {
    if (isCreatorView && creatorProfile?.is_creator) {
      fetchEarningsAndTransactions();
    } else {
      setLoading(false);
    }
  }, [userId, isCreatorView, creatorProfile]);

  const fetchEarningsAndTransactions = async () => {
    setLoading(true);

    try {
      const { data: userData, error: userError } = await supabase
        .from('astra_profiles')
        .select('total_earnings, withdrawable_balance')
        .eq('id', userId)
        .maybeSingle();

      if (!userError && userData) {
        setEarnings(userData.total_earnings || 0);
        setWithdrawableBalance(userData.withdrawable_balance || 0);
      }

      const { data: transactionsData, error: transactionsError } = await supabase
        .from('stars_transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('transaction_type', 'gift_received')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!transactionsError) {
        setTransactions(transactionsData || []);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-red-500 text-center py-12 text-lg font-semibold">Chargement des données...</div>;
  }

  // Si c'est un spectateur (non-créateur)
  if (!isCreatorView || !creatorProfile?.is_creator) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-extrabold text-yellow-400 text-center flex items-center justify-center gap-2">
          <TrendingUp className="w-8 h-8" />
          Gains et Commissions
        </h2>

        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-600/40 rounded-2xl p-8 text-center">
          <Crown className="w-20 h-20 text-purple-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3">Deviens Créateur</h3>
          <p className="text-gray-300 mb-6 max-w-md mx-auto">
            Active ton statut créateur pour gagner des étoiles et des commissions sur tes Lives
          </p>

          <div className="bg-black/40 border border-purple-600/30 rounded-xl p-4 mb-6 max-w-md mx-auto">
            <p className="text-sm text-purple-200 font-semibold mb-2">💰 Système de commissions :</p>
            <ul className="space-y-2 text-sm text-purple-300 text-left">
              <li>• Gratuit : 30% commission → Tu gardes 70%</li>
              <li>• Premium : 15% commission → Tu gardes 85%</li>
              <li>• Premium+ Elite : 5% commission → Tu gardes 95%</li>
            </ul>
          </div>

          <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl">
            Activer le mode créateur
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-extrabold text-yellow-400 text-center flex items-center justify-center gap-2">
        <TrendingUp className="w-8 h-8" />
        Mes Gains et Commissions
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-2 border-yellow-600/50 rounded-xl p-6">
          <div className="text-yellow-400 text-sm font-semibold mb-2">Total Gagné</div>
          <div className="text-3xl font-bold text-white">{earnings} ⭐</div>
          <div className="text-xs text-gray-400 mt-1">≈ {(earnings * 0.01).toFixed(2)}€</div>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-600/50 rounded-xl p-6">
          <div className="text-green-400 text-sm font-semibold mb-2">Retirable</div>
          <div className="text-3xl font-bold text-white">{withdrawableBalance.toFixed(2)}€</div>
          <div className="text-xs text-gray-400 mt-1">Min. 50€ requis</div>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h3 className="font-bold text-red-400 mb-3 text-lg">Transactions Récentes</h3>
        {transactions.length === 0 ? (
          <div className="bg-black/70 border-2 border-red-700/50 rounded-xl p-8 text-center">
            <Gift className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Aucune transaction récente</p>
          </div>
        ) : (
          <ul className="space-y-3 border-2 border-red-700/50 rounded-xl p-4 bg-black/70">
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex justify-between items-center bg-gradient-to-r from-red-900/40 to-red-900/20 rounded-lg p-4 border border-red-800/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-purple-400" />
                    <span className="font-semibold text-white">Cadeau reçu</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    <span className="text-green-400 font-bold">+{tx.creator_gain || tx.amount} ⭐</span>
                    {tx.commission_rate && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({(tx.commission_rate * 100).toFixed(0)}% commission)
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400">
                  {new Date(tx.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {withdrawableBalance >= 50 ? (
          <button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black px-6 py-4 rounded-xl font-bold shadow-lg transition transform hover:scale-[1.02]">
            <DollarSign className="w-5 h-5 inline mr-2" />
            Demander un retrait ({withdrawableBalance.toFixed(2)}€)
          </button>
        ) : (
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-center text-gray-400 text-sm">
            Encore {(50 - withdrawableBalance).toFixed(2)}€ à gagner pour pouvoir retirer
          </div>
        )}

        {onViewFullDashboard && (
          <button
            onClick={onViewFullDashboard}
            className="w-full bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition transform hover:scale-[1.02]"
          >
            Voir le Dashboard Complet
          </button>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-4">
        <div className="text-xs text-blue-200">
          <p className="font-semibold mb-2">💡 Optimise tes gains :</p>
          <ul className="space-y-1 text-blue-300">
            <li>• Gratuit : 30% commission → Tu gardes 70%</li>
            <li>• Premium : 15% commission → Tu gardes 85%</li>
            <li>• Premium+ Elite : 5% commission → Tu gardes 95%</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
