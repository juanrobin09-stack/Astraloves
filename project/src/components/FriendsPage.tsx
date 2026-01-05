import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Users, UserPlus, Clock, Check, X, MessageSquare, User as UserIcon, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Friend {
  id: string;
  pseudo: string;
  avatar_url?: string;
  is_premium: boolean;
  is_online: boolean;
  signe_solaire?: string;
  age?: number;
  friendship_date?: string;
}

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  pseudo: string;
  avatar_url?: string;
  is_premium: boolean;
  signe_solaire?: string;
  age?: number;
  created_at: string;
  compatibility_score?: number;
}

interface FriendsPageProps {
  onBack: () => void;
  onMessage: (userId: string) => void;
}

export default function FriendsPage({ onBack, onMessage }: FriendsPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'received' | 'sent'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel('friends_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friends',
      }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      await Promise.all([
        loadFriends(),
        loadReceivedRequests(),
        loadSentRequests(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        id,
        sender_id,
        receiver_id,
        created_at
      `)
      .eq('statut', 'accepted')
      .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`);

    if (error) {
      console.error('Error loading friends:', error);
      return;
    }

    const friendsList = await Promise.all(
      (data || []).map(async (friendship) => {
        const friendId = friendship.sender_id === user!.id ? friendship.receiver_id : friendship.sender_id;

        const { data: profile } = await supabase
          .from('astra_profiles')
          .select('id, pseudo, avatar_url, is_premium, signe_solaire, age')
          .eq('id', friendId)
          .maybeSingle();

        const { data: presence } = await supabase
          .from('user_presence')
          .select('is_online')
          .eq('user_id', friendId)
          .maybeSingle();

        return {
          ...profile,
          is_online: presence?.is_online || false,
          friendship_date: friendship.created_at,
        };
      })
    );

    setFriends(friendsList.filter(Boolean) as Friend[]);
  };

  const loadReceivedRequests = async () => {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        id,
        sender_id,
        created_at
      `)
      .eq('receiver_id', user!.id)
      .eq('statut', 'pending');

    if (error) {
      console.error('Error loading received requests:', error);
      return;
    }

    const requests = await Promise.all(
      (data || []).map(async (request) => {
        const { data: profile } = await supabase
          .from('astra_profiles')
          .select('id, pseudo, avatar_url, is_premium, signe_solaire, age')
          .eq('id', request.sender_id)
          .maybeSingle();

        return {
          ...request,
          ...profile,
          receiver_id: user!.id,
        };
      })
    );

    setReceivedRequests(requests.filter(Boolean) as FriendRequest[]);
  };

  const loadSentRequests = async () => {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        id,
        receiver_id,
        created_at
      `)
      .eq('sender_id', user!.id)
      .eq('statut', 'pending');

    if (error) {
      console.error('Error loading sent requests:', error);
      return;
    }

    const requests = await Promise.all(
      (data || []).map(async (request) => {
        const { data: profile } = await supabase
          .from('astra_profiles')
          .select('id, pseudo, avatar_url, is_premium, signe_solaire, age')
          .eq('id', request.receiver_id)
          .maybeSingle();

        return {
          ...request,
          sender_id: user!.id,
          ...profile,
        };
      })
    );

    setSentRequests(requests.filter(Boolean) as FriendRequest[]);
  };

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);

    try {
      const { data, error } = await supabase
        .from('astra_profiles')
        .select('id, pseudo, avatar_url, is_premium, signe_solaire, age, ville')
        .ilike('pseudo', `%${query}%`)
        .neq('id', user!.id)
        .limit(10);

      if (error) throw error;

      const resultsWithStatus = await Promise.all(
        (data || []).map(async (profile) => {
          const { data: friendStatus } = await supabase.rpc('get_friend_status', {
            user1_id: user!.id,
            user2_id: profile.id,
          });

          return {
            ...profile,
            friendStatus: friendStatus || 'none',
          };
        })
      );

      setSearchResults(resultsWithStatus);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .insert({
          sender_id: user!.id,
          receiver_id: receiverId,
          statut: 'pending',
        });

      if (error) throw error;

      searchUsers(searchQuery);
      loadSentRequests();
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Impossible d\'envoyer la demande d\'ami');
    }
  };

  const handleFriendRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      if (action === 'accept') {
        const { error } = await supabase
          .from('friends')
          .update({ statut: 'accepted' })
          .eq('id', requestId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('friends')
          .delete()
          .eq('id', requestId);

        if (error) throw error;
      }

      loadData();
    } catch (error) {
      console.error('Error handling friend request:', error);
    }
  };

  const cancelFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', requestId);

      if (error) throw error;
      loadSentRequests();
      searchUsers(searchQuery);
    } catch (error) {
      console.error('Error canceling friend request:', error);
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!confirm('Voulez-vous vraiment retirer cet ami ?')) return;

    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .or(`and(sender_id.eq.${user!.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user!.id})`);

      if (error) throw error;
      loadFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffDays < 1) return "aujourd'hui";
    if (diffDays === 1) return 'hier';
    if (diffDays < 7) return `il y a ${diffDays} jours`;
    if (diffMonths < 1) return `il y a ${Math.floor(diffDays / 7)} semaines`;
    if (diffMonths === 1) return 'il y a 1 mois';
    return `il y a ${diffMonths} mois`;
  };

  const getFriendshipDuration = (timestamp: string) => {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffDays < 30) return `Amis depuis ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    return `Amis depuis ${diffMonths} mois`;
  };

  if (loading) {
    return (
      <div className="min-h-screen velvet-bg flex items-center justify-center">
        <Loader className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen velvet-bg pb-24">
      <div className="stars-bg absolute inset-0 opacity-30" />

      <div className="relative z-10">
        <header className="bg-black/90 backdrop-blur-lg border-b border-indigo-600/30 px-4 py-4">
          <div className="max-w-screen-xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-indigo-900/20 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <h1 className="text-xl font-bold text-white">Mes Amis</h1>
            </div>

            <button
              onClick={() => setShowSearchModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Ajouter
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-4">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'friends'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Amis ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'received'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <Clock className="w-5 h-5 inline mr-2" />
              Demandes ({receivedRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'sent'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <UserPlus className="w-5 h-5 inline mr-2" />
              Envoyées ({sentRequests.length})
            </button>
          </div>

          {activeTab === 'friends' && (
            <div className="space-y-3">
              {friends.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Aucun ami pour le moment</p>
                  <p className="text-gray-500 text-sm">Ajoutez des amis pour commencer</p>
                </div>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        {friend.avatar_url ? (
                          <img
                            src={friend.avatar_url}
                            alt={friend.pseudo}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                            {friend.pseudo?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {friend.is_online && (
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-bold text-lg">
                            @{friend.pseudo}
                          </h3>
                          {friend.is_premium && <span className="text-yellow-400">💎</span>}
                        </div>
                        <p className="text-gray-400 text-sm mb-1">
                          {friend.signe_solaire} • {friend.age} ans
                        </p>
                        <p className="text-gray-500 text-xs">
                          {getFriendshipDuration(friend.friendship_date!)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => onMessage(friend.id)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Message
                        </button>
                        <button
                          onClick={() => removeFriend(friend.id)}
                          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-all"
                        >
                          Retirer
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'received' && (
            <div className="space-y-3">
              {receivedRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Aucune demande reçue</p>
                </div>
              ) : (
                receivedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-lg rounded-xl border border-indigo-600/50 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {request.avatar_url ? (
                          <img
                            src={request.avatar_url}
                            alt={request.pseudo}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                            {request.pseudo?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-bold">
                            @{request.pseudo}
                          </h3>
                          {request.is_premium && <span className="text-yellow-400">💎</span>}
                          <span className="px-2 py-0.5 bg-green-600/30 text-green-400 text-xs font-medium rounded-full">
                            Nouveau
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">
                          {request.signe_solaire} • {request.age} ans
                        </p>
                        <p className="text-gray-500 text-xs">
                          {getTimeAgo(request.created_at)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFriendRequest(request.id, 'accept')}
                          className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                          title="Accepter"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleFriendRequest(request.id, 'reject')}
                          className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                          title="Refuser"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'sent' && (
            <div className="space-y-3">
              {sentRequests.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Aucune demande envoyée</p>
                </div>
              ) : (
                sentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {request.avatar_url ? (
                          <img
                            src={request.avatar_url}
                            alt={request.pseudo}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                            {request.pseudo?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-bold">
                            @{request.pseudo}
                          </h3>
                          {request.is_premium && <span className="text-yellow-400">💎</span>}
                        </div>
                        <p className="text-gray-400 text-sm">
                          Demande envoyée {getTimeAgo(request.created_at)}
                        </p>
                      </div>

                      <button
                        onClick={() => cancelFriendRequest(request.id)}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-all"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {showSearchModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-indigo-600/30 p-6 max-w-2xl w-full mt-20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Rechercher des amis</h3>
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par pseudo..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {searching ? (
                <div className="text-center py-8">
                  <Loader className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">
                    {searchQuery.length < 2
                      ? 'Entrez au moins 2 caractères'
                      : 'Aucun utilisateur trouvé'}
                  </p>
                </div>
              ) : (
                searchResults.map((profile) => (
                  <div
                    key={profile.id}
                    className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-4 flex items-center gap-4"
                  >
                    <div className="flex-shrink-0">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.pseudo}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
                          {profile.pseudo?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-medium">@{profile.pseudo}</h4>
                        {profile.is_premium && <span className="text-yellow-400">💎</span>}
                      </div>
                      <p className="text-gray-400 text-sm">
                        {profile.signe_solaire} • {profile.age} ans • {profile.ville}
                      </p>
                    </div>

                    {profile.friendStatus === 'accepted' ? (
                      <span className="px-4 py-2 bg-green-600/30 text-green-400 rounded-lg text-sm font-medium">
                        ✓ Déjà ami
                      </span>
                    ) : profile.friendStatus === 'pending' ? (
                      <span className="px-4 py-2 bg-yellow-600/30 text-yellow-400 rounded-lg text-sm font-medium">
                        ⏳ En attente
                      </span>
                    ) : (
                      <button
                        onClick={() => sendFriendRequest(profile.id)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Ajouter
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
