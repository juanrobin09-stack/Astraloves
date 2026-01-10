import { useState } from 'react';
import { Search, UserPlus, Check, Clock, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../Avatar';
import Starfield from '../Starfield';

interface AddFriendsViewProps {
  currentUserProfile: any;
  onRefresh: () => void;
  onBack?: () => void;
}

export default function AddFriendsView({ currentUserProfile, onRefresh, onBack }: AddFriendsViewProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const searchUsers = async () => {
    if (!searchQuery.trim() || !user) return;

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('astra_profiles')
        .select('id, first_name, pseudo, photos, avatar_url, ville')
        .or(`pseudo.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%`)
        .neq('id', user.id)
        .limit(20);

      if (error) throw error;

      // Vérifier les demandes d'amis existantes
      if (data && data.length > 0) {
        const userIds = data.map(u => u.id);
        const { data: existingFriendships } = await supabase
          .from('friends')
          .select('sender_id, receiver_id, statut')
          .or(`and(sender_id.eq.${user.id},receiver_id.in.(${userIds.join(',')})),and(receiver_id.eq.${user.id},sender_id.in.(${userIds.join(',')}))`);

        const resultsWithStatus = data.map(profile => {
          const friendship = existingFriendships?.find(
            f => (f.sender_id === user.id && f.receiver_id === profile.id) ||
                 (f.receiver_id === user.id && f.sender_id === profile.id)
          );

          return {
            ...profile,
            friendshipStatus: friendship?.statut || null,
            isPending: friendship?.statut === 'pending' && friendship?.sender_id === user.id,
            isReceived: friendship?.statut === 'pending' && friendship?.receiver_id === user.id,
            isFriend: friendship?.statut === 'accepted'
          };
        });

        setSearchResults(resultsWithStatus);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (targetUserId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friends')
        .insert({
          sender_id: user.id,
          receiver_id: targetUserId,
          statut: 'pending'
        });

      if (error) throw error;

      setSentRequests(prev => new Set(prev).add(targetUserId));
      onRefresh();
      await searchUsers(); // Refresh results
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col relative">
      {/* Fond étoilé - COUVRE 100% DE L'ÉCRAN */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.6 }}>
        <Starfield />
      </div>

      <div className="relative z-10 p-4 border-b border-red-900/30 bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-sm flex-shrink-0 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 p-2 hover:bg-gray-800/50 rounded-full transition-colors text-gray-400 hover:text-white"
              aria-label="Retour"
            >
              <ArrowLeft size={22} />
              <span className="hidden sm:inline font-medium">Retour</span>
            </button>
          )}
          <h2 className="text-white font-bold text-xl">👥 Ajouter des amis</h2>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Recherche par pseudo ou prénom
        </p>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
            placeholder="@pseudo ou prénom..."
            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-red-900/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
          />
          <button
            onClick={searchUsers}
            disabled={searching || !searchQuery.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white rounded-lg text-sm font-medium transition"
          >
            {searching ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto p-4 pb-24" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#ef4444 #1a1a1a'
      }}>
        {searchResults.length === 0 && searchQuery && !searching && (
          <div className="text-center py-12">
            <Search className="mx-auto text-gray-600 mb-3" size={48} />
            <p className="text-gray-400">Aucun utilisateur trouvé</p>
            <p className="text-gray-500 text-sm mt-2">
              Essaye un autre pseudo ou prénom
            </p>
          </div>
        )}

        {!searchQuery && (
          <div className="text-center py-12">
            <UserPlus className="mx-auto text-gray-600 mb-3" size={48} />
            <p className="text-gray-400 font-semibold mb-2">
              Trouve tes amis sur Astra
            </p>
            <p className="text-gray-500 text-sm">
              Recherche par @pseudo ou prénom
            </p>
          </div>
        )}

        <div className="space-y-3">
          {searchResults.map((profile) => (
            <div
              key={profile.id}
              className="bg-gray-900 border border-red-900/20 rounded-xl p-4 hover:border-red-900/40 transition"
            >
              <div className="flex items-center gap-4">
                <Avatar
                  src={profile.avatar_url || profile.photos?.[0]}
                  name={profile.first_name || profile.pseudo}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-lg">
                    {profile.first_name}
                  </h3>
                  {profile.pseudo && (
                    <p className="text-red-400 text-sm">@{profile.pseudo}</p>
                  )}
                  {profile.ville && (
                    <p className="text-gray-500 text-xs mt-1">📍 {profile.ville}</p>
                  )}
                </div>

                {profile.isFriend ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-900/20 border border-green-600/30 text-green-400 rounded-lg text-sm font-medium">
                    <Check size={16} />
                    Amis
                  </div>
                ) : profile.isPending ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-yellow-900/20 border border-yellow-600/30 text-yellow-400 rounded-lg text-sm font-medium">
                    <Clock size={16} />
                    En attente
                  </div>
                ) : profile.isReceived ? (
                  <div className="px-4 py-2 bg-blue-900/20 border border-blue-600/30 text-blue-400 rounded-lg text-sm font-medium">
                    À accepter
                  </div>
                ) : (
                  <button
                    onClick={() => sendFriendRequest(profile.id)}
                    disabled={sentRequests.has(profile.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white rounded-lg text-sm font-medium transition"
                  >
                    <UserPlus size={16} />
                    {sentRequests.has(profile.id) ? 'Envoyé' : 'Ajouter'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
