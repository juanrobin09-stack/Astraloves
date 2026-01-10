import { useState, useEffect } from 'react';
import { Video, Plus, BarChart3, Eye, Users, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LiveStream {
  id: string;
  title: string;
  creator_id: string;
  viewer_count: number;
  peak_viewers: number;
  thumbnail_url: string | null;
  started_at: string;
  creator_profile: {
    first_name: string;
    avatar_url: string | null;
    is_premium: boolean;
  };
}

export default function LiveFeedPage({ onNavigate }: { onNavigate: (page: string, data?: any) => void }) {
  const { user } = useAuth();
  const [lives, setLives] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLives();

    const interval = setInterval(loadLives, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadLives = async () => {
    try {
      const { data, error } = await supabase
        .from('live_streams')
        .select(`
          id,
          title,
          creator_id,
          viewer_count,
          peak_viewers,
          thumbnail_url,
          started_at,
          creator_profile:astra_profiles!creator_id(
            first_name,
            avatar_url,
            is_premium
          )
        `)
        .eq('status', 'live')
        .order('viewer_count', { ascending: false });

      if (error) {
        console.error('Error loading lives:', error);
      } else {
        setLives(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLive = (liveId: string) => {
    onNavigate('live-stream', { liveId });
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Video className="w-10 h-10 text-red-500" />
              Lives en Direct
            </h1>
            <p className="text-gray-400">
              {loading ? 'Chargement...' : `${lives.length} live${lives.length > 1 ? 's' : ''} en cours`}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate('creator-dashboard')}
              className="hidden md:flex bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-xl items-center gap-2 transition-all"
            >
              <BarChart3 className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('start-live')}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden md:inline">Lancer un Live</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
          </div>
        ) : lives.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Aucun live pour le moment</h3>
            <p className="text-gray-400 mb-8">Sois le premier à lancer un live !</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => onNavigate('creator-dashboard')}
                className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-4 rounded-xl inline-flex items-center gap-2 transition-all"
              >
                <BarChart3 className="w-5 h-5" />
                Voir mes Stats
              </button>
              <button
                onClick={() => onNavigate('start-live')}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-8 py-4 rounded-xl inline-flex items-center gap-2 transition-all"
              >
                <Plus className="w-5 h-5" />
                Lancer mon premier Live
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lives.map((live) => {
              const creatorProfile = Array.isArray(live.creator_profile)
                ? live.creator_profile[0]
                : live.creator_profile;

              return (
                <div
                  key={live.id}
                  onClick={() => handleJoinLive(live.id)}
                  className="bg-gray-900 border-2 border-gray-800 rounded-2xl overflow-hidden cursor-pointer transition-all hover:border-red-600 hover:scale-105"
                >
                  <div className="relative h-48 bg-gray-800">
                    {live.thumbnail_url ? (
                      <img
                        src={live.thumbnail_url}
                        alt={live.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-16 h-16 text-gray-600" />
                      </div>
                    )}

                    <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      LIVE
                    </div>

                    <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {live.viewer_count}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      {creatorProfile?.avatar_url ? (
                        <img
                          src={creatorProfile.avatar_url}
                          alt={creatorProfile.first_name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-red-600"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center border-2 border-red-600">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate flex items-center gap-1">
                          {creatorProfile?.first_name || 'Créateur'}
                          {creatorProfile?.is_premium && <span className="text-yellow-500">💎</span>}
                        </h3>
                        <p className="text-sm text-gray-400 truncate">{live.title}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {user && lives.length > 0 && (
          <div className="mt-12 bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-red-500" />
              Deviens créateur
            </h3>
            <p className="text-gray-400 mb-4">
              Lance ton propre live et connecte-toi avec la communauté
            </p>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => onNavigate('start-live')}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
              >
                <Plus className="w-5 h-5" />
                Lancer un Live
              </button>
              <button
                onClick={() => onNavigate('creator-dashboard')}
                className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
              >
                <BarChart3 className="w-5 h-5" />
                Voir mes Stats
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
