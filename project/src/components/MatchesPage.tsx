import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Sparkles, Loader, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Starfield from './Starfield';

interface Match {
  id: string;
  user_id: string;
  first_name: string;
  age: number;
  photos: string[];
  city: string;
  sun_sign: string;
  score: number;
  last_message?: string;
  last_message_time?: string;
  is_new: boolean;
  is_online: boolean;
  has_conversation: boolean;
  unread_count?: number;
}

interface MatchesPageProps {
  onViewProfile: (userId: string) => void;
  onStartChat: (userId: string) => void;
  onBackToDiscover?: () => void;
}

export default function MatchesPage({ onViewProfile, onStartChat, onBackToDiscover }: MatchesPageProps) {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();

    const channel = supabase
      .channel('matches_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'matches',
        filter: `user1_id=eq.${user?.id},user2_id=eq.${user?.id}`,
      }, () => {
        loadMatches();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const loadMatches = async () => {
    if (!user) return;

    try {
      const { data: matchesData, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('statut', 'mutual')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const enrichedMatches = await Promise.all(
        (matchesData || []).map(async (match) => {
          const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
          const isNewForUser = match.user1_id === user.id ? !match.user1_seen : !match.user2_seen;

          const { data: profile } = await supabase
            .from('astra_profiles')
            .select('first_name, age, photos, city, sun_sign')
            .eq('id', otherUserId)
            .maybeSingle();

          const { data: presence } = await supabase
            .from('user_presence')
            .select('is_online')
            .eq('user_id', otherUserId)
            .maybeSingle();

          const { data: lastMsg } = await supabase
            .from('user_messages')
            .select('content, created_at')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const { count: unreadCount } = await supabase
            .from('user_messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', otherUserId)
            .eq('receiver_id', user.id)
            .eq('read', false);

          return {
            id: match.id,
            user_id: otherUserId,
            first_name: profile?.first_name || 'Utilisateur',
            age: profile?.age || 0,
            photos: profile?.photos || [],
            city: profile?.city || '',
            sun_sign: profile?.sun_sign || '',
            score: match.score || 75,
            last_message: lastMsg?.content,
            last_message_time: lastMsg?.created_at,
            is_new: isNewForUser,
            is_online: presence?.is_online || false,
            has_conversation: !!lastMsg,
            unread_count: unreadCount || 0,
          };
        })
      );

      setMatches(enrichedMatches);

      if (matchesData && matchesData.length > 0) {
        const updates = matchesData.map(match => {
          if (match.user1_id === user.id && !match.user1_seen) {
            return supabase
              .from('matches')
              .update({ user1_seen: true })
              .eq('id', match.id);
          } else if (match.user2_id === user.id && !match.user2_seen) {
            return supabase
              .from('matches')
              .update({ user2_seen: true })
              .eq('id', match.id);
          }
          return null;
        }).filter(Boolean);

        await Promise.all(updates);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp?: string) => {
    if (!timestamp) return '';

    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    return `${diffDays}j`;
  };

  const getCompatibilityClass = (score: number) => {
    if (score >= 70) return 'text-red-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-cyan-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <Starfield />
        <Loader className="w-12 h-12 text-red-500 animate-spin relative z-10" />
      </div>
    );
  }

  // Séparer les nouveaux matchs et les conversations
  const newMatches = matches.filter(m => !m.has_conversation);
  const conversations = matches.filter(m => m.has_conversation).sort((a, b) => {
    const timeA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
    const timeB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <div className="min-h-screen bg-black pb-24 relative overflow-hidden">
      <Starfield />

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-gradient-to-b from-red-950/40 to-transparent backdrop-blur-lg border-b border-red-900/30 px-4 py-5">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              <h1 className="text-xl font-bold text-white">Mes Matchs</h1>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-4">
          {matches.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">💕</div>
              <h2 className="text-xl font-bold text-white mb-2">Pas encore de matchs</h2>
              <p className="text-gray-400 mb-6 text-sm">Continue à découvrir des profils pour trouver ton match parfait !</p>
              <button
                onClick={onBackToDiscover}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl text-white font-semibold transition-all active:scale-95"
              >
                <Sparkles className="w-5 h-5" />
                Découvrir des profils
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Section Nouveaux Matchs */}
              {newMatches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Nouveaux Matchs</span>
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {newMatches.length}
                    </span>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {newMatches.map((match) => (
                      <div
                        key={match.id}
                        onClick={() => onStartChat(match.user_id)}
                        className="flex-shrink-0 w-24 text-center cursor-pointer group"
                      >
                        <div className="relative w-20 h-20 mx-auto mb-2">
                          <div className="w-full h-full rounded-full border-3 border-red-600 overflow-hidden">
                            <img
                              src={match.photos[0] || '/placeholder.jpg'}
                              alt={match.first_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {Date.now() - new Date(match.last_message_time || Date.now()).getTime() < 86400000 && (
                            <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                              NEW
                            </div>
                          )}
                        </div>
                        <div className="text-white text-sm font-semibold truncate">{match.first_name}</div>
                        <div className="text-red-500 text-xs font-bold">{match.score}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section Conversations */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Conversations</span>
                </div>
                {conversations.length > 0 ? (
                  <div className="space-y-3">
                    {conversations.map((match) => (
                      <div
                        key={match.id}
                        onClick={() => onStartChat(match.user_id)}
                        className={`bg-gray-900/50 border rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer transition-all active:scale-98 ${
                          match.unread_count && match.unread_count > 0
                            ? 'border-red-600/30 bg-red-950/20'
                            : 'border-gray-800/50 hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-800">
                            <img
                              src={match.photos[0] || '/placeholder.jpg'}
                              alt={match.first_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {match.is_online && (
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-black rounded-full" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-white font-semibold text-sm">
                              {match.first_name}, {match.age}
                            </span>
                            <span className="text-gray-500 text-xs flex-shrink-0">
                              {getTimeAgo(match.last_message_time)}
                            </span>
                          </div>

                          <div className={`text-xs mb-1 ${getCompatibilityClass(match.score)}`}>
                            {match.score >= 70 ? '🔥' : match.score >= 50 ? '⭐' : '💫'} {match.score}% compatible
                          </div>

                          <div className={`text-sm truncate ${
                            match.unread_count && match.unread_count > 0
                              ? 'text-white font-medium'
                              : 'text-gray-400'
                          }`}>
                            {match.last_message || 'Commencez à discuter →'}
                          </div>
                        </div>

                        {match.unread_count && match.unread_count > 0 && (
                          <div className="flex-shrink-0 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{match.unread_count}</span>
                          </div>
                        )}

                        <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8 text-sm">
                    Commencez à discuter avec vos nouveaux matchs !
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
