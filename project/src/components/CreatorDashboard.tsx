import { useState, useEffect } from 'react';
import { TrendingUp, Users, Clock, Star, Video, DollarSign, Award, BarChart3, Calendar, Eye, Gift, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CreatorStats {
  total_lives: number;
  total_viewers: number;
  total_watch_time_minutes: number;
  total_gifts_received: number;
  total_earnings_euros: number;
  average_viewers: number;
  peak_viewers: number;
  follower_count: number;
}

interface LiveHistory {
  id: string;
  title: string;
  started_at: string;
  ended_at: string;
  viewer_count: number;
  peak_viewers: number;
  total_gifts_value: number;
  total_views: number;
  duration_seconds: number;
}

interface TopViewer {
  user_id: string;
  first_name: string;
  avatar_url: string | null;
  total_gifts_sent: number;
  total_watch_time: number;
}

interface CreatorDashboardProps {
  onBack: () => void;
}

export default function CreatorDashboard({ onBack }: CreatorDashboardProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [liveHistory, setLiveHistory] = useState<LiveHistory[]>([]);
  const [topViewers, setTopViewers] = useState<TopViewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, timeRange]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const [statsResult, historyResult] = await Promise.all([
        supabase
          .from('creator_stats')
          .select('*')
          .eq('creator_id', user.id)
          .maybeSingle(),

        supabase
          .from('live_streams')
          .select('id, title, started_at, ended_at, viewer_count, peak_viewers, total_gifts_value, total_views, status')
          .eq('creator_id', user.id)
          .order('started_at', { ascending: false })
          .limit(10)
      ]);

      if (statsResult.data) {
        setStats(statsResult.data);
      }

      if (historyResult.data) {
        const processedHistory = historyResult.data.map(live => ({
          ...live,
          duration_seconds: live.ended_at && live.started_at
            ? Math.floor((new Date(live.ended_at).getTime() - new Date(live.started_at).getTime()) / 1000)
            : 0
        }));
        setLiveHistory(processedHistory);
      }

      await loadTopViewers();
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTopViewers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('live_gifts_sent')
        .select(`
          from_user_id,
          stars_spent,
          astra_profiles!from_user_id(first_name, avatar_url)
        `)
        .eq('to_user_id', user.id);

      if (error) {
        console.error('Error loading top viewers:', error);
        return;
      }

      const viewerMap = new Map<string, { first_name: string; avatar_url: string | null; total_gifts: number }>();

      data?.forEach(gift => {
        const profile = gift.astra_profiles as any;
        if (profile) {
          const existing = viewerMap.get(gift.from_user_id);
          if (existing) {
            existing.total_gifts += gift.stars_spent;
          } else {
            viewerMap.set(gift.from_user_id, {
              first_name: profile.first_name,
              avatar_url: profile.avatar_url,
              total_gifts: gift.stars_spent
            });
          }
        }
      });

      const topViewersList = Array.from(viewerMap.entries())
        .map(([user_id, data]) => ({
          user_id,
          first_name: data.first_name,
          avatar_url: data.avatar_url,
          total_gifts_sent: data.total_gifts,
          total_watch_time: 0
        }))
        .sort((a, b) => b.total_gifts_sent - a.total_gifts_sent)
        .slice(0, 5);

      setTopViewers(topViewersList);
    } catch (error) {
      console.error('Error loading top viewers:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-red-500" />
            Dashboard Créateur
          </h1>
          <p className="text-gray-400">Analyse de tes performances en live</p>
        </div>

        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              timeRange === 'week'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            7 jours
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              timeRange === 'month'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            30 jours
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              timeRange === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Tout
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Video className="w-8 h-8 text-red-500" />
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats?.total_lives || 0}</div>
            <div className="text-sm text-gray-400">Lives Total</div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-500" />
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats?.total_viewers || 0}</div>
            <div className="text-sm text-gray-400">Spectateurs Total</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border border-yellow-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Star className="w-8 h-8 text-yellow-500" />
              <Gift className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats?.total_gifts_received || 0}</div>
            <div className="text-sm text-gray-400">Étoiles Reçues</div>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-500" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats?.total_earnings_euros?.toFixed(2) || '0.00'}€</div>
            <div className="text-sm text-gray-400">Revenus Estimés</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-purple-500" />
              <h3 className="font-bold text-lg">Moyenne Spectateurs</h3>
            </div>
            <div className="text-4xl font-bold text-purple-500">{stats?.average_viewers || 0}</div>
            <div className="text-sm text-gray-400 mt-2">par live</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-orange-500" />
              <h3 className="font-bold text-lg">Record Spectateurs</h3>
            </div>
            <div className="text-4xl font-bold text-orange-500">{stats?.peak_viewers || 0}</div>
            <div className="text-sm text-gray-400 mt-2">pic d'audience</div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-cyan-500" />
              <h3 className="font-bold text-lg">Temps de Visionnage</h3>
            </div>
            <div className="text-4xl font-bold text-cyan-500">
              {Math.floor((stats?.total_watch_time_minutes || 0) / 60)}h
            </div>
            <div className="text-sm text-gray-400 mt-2">total</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-red-500" />
              <h3 className="font-bold text-xl">Historique des Lives</h3>
            </div>
            {liveHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucun live pour le moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {liveHistory.map(live => (
                  <div
                    key={live.id}
                    className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-white line-clamp-1">{live.title}</h4>
                      <span className="text-xs text-gray-500">{formatDate(live.started_at)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Spectateurs</div>
                        <div className="font-semibold text-blue-400">{live.viewer_count}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Durée</div>
                        <div className="font-semibold text-cyan-400">{formatDuration(live.duration_seconds)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Étoiles</div>
                        <div className="font-semibold text-yellow-400">{live.total_gifts_value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-6 h-6 text-yellow-500" />
              <h3 className="font-bold text-xl">Top Supporters</h3>
            </div>
            {topViewers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucun supporter pour le moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topViewers.map((viewer, index) => (
                  <div
                    key={viewer.user_id}
                    className="flex items-center gap-4 bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors"
                  >
                    <div className="text-2xl font-bold text-gray-600">#{index + 1}</div>
                    {viewer.avatar_url ? (
                      <img
                        src={viewer.avatar_url}
                        alt={viewer.first_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {viewer.first_name?.[0] || '?'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-white">{viewer.first_name}</div>
                      <div className="text-sm text-gray-400">
                        {viewer.total_gifts_sent} ⭐ offerts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
