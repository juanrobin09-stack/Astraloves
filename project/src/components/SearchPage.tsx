import { useState, useEffect, useCallback } from 'react';
import { Search, MessageCircle, Zap, User, MapPin, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import LogoutButton from './LogoutButton';

interface SearchResult {
  id: string;
  username: string;
  first_name: string;
  age: number;
  city: string;
  sun_sign: string;
  avatar_url: string;
  photos: string[];
  bio: string;
  match_score: number;
}

interface SearchPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function SearchPage({ onNavigate }: SearchPageProps) {
  const { user } = useAuth();
  const { isPremium } = usePremiumStatus();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchCount, setSearchCount] = useState(0);

  const SEARCH_LIMIT = 5;
  const canSearch = isPremium || searchCount < SEARCH_LIMIT;

  useEffect(() => {
    if (user) {
      loadSearchCount();
    }
  }, [user]);

  const loadSearchCount = async () => {
    if (!user) return;

    try {
      const { data } = await supabase.rpc('get_search_count', {
        p_user_id: user.id
      });

      setSearchCount(data || 0);
    } catch (error) {
      console.error('Error loading search count:', error);
    }
  };

  const handleSearch = useCallback(async () => {
    if (!user || !query.trim() || query.trim().length < 3) {
      if (query.trim().length > 0 && query.trim().length < 3) {
        alert('⚠️ Entre au moins 3 caractères pour rechercher');
      }
      return;
    }

    if (!canSearch) {
      alert('⚠️ Limite atteinte !\n\nTu as utilisé tes 5 recherches gratuites aujourd\'hui.\n\nPasse Premium pour des recherches illimitées !');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const { data: searchResults } = await supabase.rpc('search_profiles', {
        p_query: query.trim(),
        p_user_id: user.id,
        p_limit: 10
      });

      setResults(searchResults || []);

      await supabase.from('search_history').insert({
        user_id: user.id,
        query: query.trim(),
        results_count: searchResults?.length || 0
      });

      if (!isPremium) {
        const { data: newCount } = await supabase.rpc('increment_search_count', {
          p_user_id: user.id
        });
        setSearchCount(newCount || searchCount + 1);
      }
    } catch (error) {
      console.error('Error searching:', error);
      alert('❌ Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  }, [user, query, canSearch, isPremium, searchCount]);

  const handleSendMessage = async (targetUserId: string, targetName: string) => {
    if (!user) return;

    try {
      const { data: existingConversation } = await supabase
        .from('user_conversations')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${user.id})`)
        .maybeSingle();

      if (existingConversation) {
        onNavigate('messages', { conversationId: existingConversation.id });
      } else {
        const { data: newConversation } = await supabase
          .from('user_conversations')
          .insert({
            user1_id: user.id,
            user2_id: targetUserId
          })
          .select()
          .single();

        if (newConversation) {
          onNavigate('messages', { conversationId: newConversation.id });
        }
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('❌ Erreur lors de la création de la conversation');
    }
  };

  const handleMatchDirect = async (targetUserId: string, targetName: string) => {
    if (!isPremium) {
      alert('⭐ Match Direct réservé aux membres Premium\n\nPasse Premium pour :\n✅ Match instantané\n✅ Bypass du swipe\n✅ Connexion directe');
      return;
    }

    if (!user) return;

    try {
      const { data: existingMatch } = await supabase
        .from('matches')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${user.id})`)
        .maybeSingle();

      if (existingMatch) {
        alert(`💕 Tu as déjà un match avec ${targetName} !`);
        onNavigate('discovery');
        return;
      }

      await supabase.from('matches').insert({
        user1_id: user.id,
        user2_id: targetUserId
      });

      await supabase.from('swipes').insert([
        {
          user_id: user.id,
          swiped_user_id: targetUserId,
          direction: 'super'
        },
        {
          user_id: targetUserId,
          swiped_user_id: user.id,
          direction: 'right'
        }
      ]);

      alert(`🎉 Match Direct avec ${targetName} !\n\n${targetName} recevra une notification de ton intérêt.`);
      onNavigate('discovery');
    } catch (error) {
      console.error('Error creating direct match:', error);
      alert('❌ Erreur lors de la création du match');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pb-28 safe-area-inset">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2 mb-2">
              <Search className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
              Rechercher
            </h1>
            <p className="text-gray-400 text-sm">Trouve quelqu'un par pseudo, prénom, ville ou signe</p>
          </div>
          <LogoutButton />
        </div>

        <div className="mb-6 bg-black/60 backdrop-blur-xl border border-red-600/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-300 text-sm">Recherches aujourd'hui</span>
            <div className="flex items-center gap-2">
              {isPremium ? (
                <span className="text-red-500 font-bold flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  Illimité
                </span>
              ) : (
                <span className="text-white font-bold">
                  {searchCount}/{SEARCH_LIMIT}
                </span>
              )}
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="ex: @alexdupont, Alex, Paris, Taureau"
              className="w-full px-4 py-3 pl-12 bg-gray-900 border-2 border-red-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-all"
              disabled={!canSearch}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || !canSearch || query.trim().length < 3}
            className="w-full mt-3 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:from-red-700 hover:to-red-800 disabled:from-gray-700 disabled:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Recherche...' : 'Rechercher'}
          </button>

          {!canSearch && (
            <button
              onClick={() => onNavigate('premium')}
              className="w-full mt-2 px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-600 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Passer Premium pour recherches illimitées
            </button>
          )}
        </div>

        {searched && (
          <div className="space-y-4">
            {results.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Aucun résultat</h3>
                <p className="text-gray-400 mb-1">Aucun résultat pour "{query}"</p>
                <p className="text-gray-400 mb-6">Essaie avec un autre pseudo ou prénom</p>
                <button
                  onClick={() => onNavigate('swipe')}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:from-red-700 hover:to-red-800 transition-all"
                >
                  Ou swipe pour découvrir !
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">
                    {results.length} résultat{results.length > 1 ? 's' : ''}
                  </h2>
                </div>

                {results.map((result) => (
                  <div
                    key={result.id}
                    className="bg-gray-900 border-2 border-red-600/30 rounded-xl overflow-hidden hover:border-red-600/50 transition-all"
                  >
                    <div className="flex gap-4 p-4">
                      <div className="relative flex-shrink-0">
                        {result.photos?.[0] || result.avatar_url ? (
                          <img
                            src={result.photos?.[0] || result.avatar_url || '/logo.png'}
                            alt={result.first_name}
                            className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gray-800 flex items-center justify-center">
                            <User className="w-10 h-10 text-gray-600" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg md:text-xl font-bold text-white mb-1 truncate">
                          {result.first_name}, {result.age}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          {result.sun_sign && (
                            <span className="text-yellow-500 text-sm">⭐ {result.sun_sign}</span>
                          )}
                          {result.username && (
                            <span className="text-red-500 text-sm">• @{result.username}</span>
                          )}
                        </div>
                        {result.city && (
                          <div className="flex items-center gap-1 text-gray-400 text-sm mb-2">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{result.city}</span>
                          </div>
                        )}
                        {result.bio && (
                          <p className="text-gray-300 text-sm line-clamp-2 mb-3">{result.bio}</p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleSendMessage(result.id, result.first_name)}
                            className="flex-1 min-w-[140px] px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Dire bonjour
                          </button>

                          <button
                            onClick={() => handleMatchDirect(result.id, result.first_name)}
                            className="flex-1 min-w-[140px] px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 relative"
                          >
                            <Zap className="w-4 h-4" />
                            Match direct
                            {!isPremium && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                                <span className="text-black text-xs font-bold">★</span>
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {!searched && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Recherche quelqu'un</h3>
            <p className="text-gray-400 mb-6">Entre un pseudo (@alexdupont) ou un prénom (Alex)</p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>💡 Minimum 3 caractères</p>
              <p>🔍 Recherche dans les pseudos et prénoms</p>
              <p>⚡ {isPremium ? 'Recherches illimitées' : `${SEARCH_LIMIT - searchCount} recherches restantes`}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
