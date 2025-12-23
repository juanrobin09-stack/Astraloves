import { UserPlus, Check, X, Heart, Search, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Avatar from '../Avatar';

interface MessagesSidebarProps {
  view: string;
  setView: (view: any) => void;
  conversations: any[];
  friends: any[];
  requests: any[];
  currentUserProfile: any;
  onOpenChat: (user: any) => void;
  onRefresh: () => void;
  onNavigateToDiscovery?: () => void;
}

export default function MessagesSidebar({
  view,
  setView,
  conversations,
  friends,
  requests,
  currentUserProfile,
  onOpenChat,
  onRefresh,
  onNavigateToDiscovery,
}: MessagesSidebarProps) {

  const acceptRequest = async (friendshipId: string) => {
    await supabase
      .from('friends')
      .update({ statut: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', friendshipId);
    onRefresh();
  };

  const declineRequest = async (friendshipId: string) => {
    await supabase
      .from('friends')
      .update({ statut: 'rejected' })
      .eq('id', friendshipId);
    onRefresh();
  };

  return (
    <div className="w-full h-full bg-gray-900 flex flex-col">
      <div className="p-3 border-b border-red-900/30 flex-shrink-0">
        <h2 className="text-white font-bold text-lg mb-4">Messages</h2>

        {/* Onglets principaux - Privés + Demandes */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => setView('conversations')}
            className={`py-3 rounded-lg text-sm font-bold transition ${
              view === 'conversations'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
            }`}
          >
            Privés
          </button>
          <button
            onClick={() => setView('requests')}
            className={`relative py-3 rounded-lg text-sm font-bold transition ${
              view === 'requests'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
            }`}
          >
            Demandes
            {requests.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-red-500 rounded-full text-white text-xs font-bold">
                {requests.length}
              </span>
            )}
          </button>
        </div>

        {/* Filtres secondaires - Rechercher + Amis */}
        <div className="flex gap-2">
          <button
            onClick={() => setView('add-friends')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
              view === 'add-friends'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
            }`}
          >
            <Search size={14} />
            Rechercher
          </button>
          <button
            onClick={() => setView('friends')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
              view === 'friends'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
            }`}
          >
            <UserPlus size={14} />
            Amis ({friends.length})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {view === 'conversations' && (
          <div>
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="mx-auto text-gray-600 mb-3" size={48} />
                <p className="text-gray-400 text-sm font-bold mb-1">Aucune conversation</p>
                <p className="text-gray-500 text-xs mb-4">Pour commencer à échanger, ajoutez des amis depuis Discovery !</p>
                {onNavigateToDiscovery && (
                  <button
                    onClick={onNavigateToDiscovery}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    <Heart size={16} />
                    Découvrir des profils
                  </button>
                )}
                <p className="text-green-400 text-xs mt-4">✨ Messages illimités entre amis</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const unreadCount = conv.user1_id === currentUserProfile.id
                  ? conv.user1_unread_count
                  : conv.user2_unread_count;

                const getTimeAgo = (timestamp: string) => {
                  const now = new Date();
                  const then = new Date(timestamp);
                  const diffMs = now.getTime() - then.getTime();
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffHours = Math.floor(diffMs / 3600000);
                  const diffDays = Math.floor(diffMs / 86400000);

                  if (diffMins < 1) return 'maintenant';
                  if (diffMins < 60) return `${diffMins} min`;
                  if (diffHours < 24) return `${diffHours}h`;
                  if (diffDays === 1) return 'hier';
                  if (diffDays < 7) return `${diffDays}j`;
                  return then.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
                };

                return (
                  <button
                    key={conv.id}
                    onClick={() => onOpenChat(conv.otherUser)}
                    className="w-full p-3 hover:bg-gray-800/50 border-b border-gray-800/50 flex items-center gap-3 transition active:bg-gray-800 group"
                  >
                    <Avatar
                      src={conv.otherUser?.avatar_url || conv.otherUser?.photos?.[0]}
                      name={conv.otherUser?.first_name || conv.otherUser?.pseudo}
                      size="md"
                      showOnline
                      isOnline={conv.otherUser?.is_online}
                      className="group-hover:scale-105 transition"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-white font-semibold text-sm truncate">
                          {conv.otherUser?.pseudo || conv.otherUser?.first_name || 'Inconnu'}
                        </p>
                        {conv.last_message_at && (
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {getTimeAgo(conv.last_message_at)}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate ${unreadCount > 0 ? 'text-white font-medium' : 'text-gray-400'}`}>
                        {conv.last_message_sender_id === currentUserProfile.id && 'Vous : '}
                        {conv.last_message_text || 'Nouvelle conversation'}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}

        {view === 'friends' && (
          <div>
            {friends.length === 0 ? (
              <div className="p-8 text-center">
                <UserPlus className="mx-auto text-gray-600 mb-3" size={48} />
                <p className="text-gray-400 text-sm font-bold mb-1">Aucun ami pour le moment</p>
                <p className="text-gray-500 text-xs mb-4">Ajoutez des amis en likant des profils ou en cliquant sur le bouton "Ajouter ami"</p>
                {onNavigateToDiscovery && (
                  <button
                    onClick={onNavigateToDiscovery}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    <Heart size={16} />
                    Découvrir des profils
                  </button>
                )}
              </div>
            ) : (
              friends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => onOpenChat(friend.profile)}
                  className="w-full p-3 hover:bg-gray-800/50 border-b border-gray-800/50 flex items-center gap-3 transition active:bg-gray-800 group"
                >
                  <Avatar
                    src={friend.profile?.avatar_url || friend.profile?.photos?.[0]}
                    name={friend.profile?.first_name || friend.profile?.pseudo}
                    size="md"
                    showOnline
                    isOnline={friend.profile?.is_online}
                    className="group-hover:scale-105 transition"
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-white font-semibold text-sm">
                      {friend.profile?.pseudo || friend.profile?.first_name || 'Inconnu'}
                    </p>
                    <p className="text-gray-400 text-xs flex items-center gap-1">
                      {friend.profile?.pseudo ? `@${friend.profile.pseudo}` : 'Inconnu'}
                      {friend.profile?.is_online && (
                        <span className="text-green-400">• En ligne</span>
                      )}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {view === 'requests' && (
          <div>
            {requests.length === 0 ? (
              <div className="p-8 text-center">
                <UserPlus className="mx-auto text-gray-600 mb-3" size={48} />
                <p className="text-gray-400 text-sm font-bold mb-1">Aucune demande d'ami en attente</p>
                <p className="text-gray-500 text-xs">Les nouvelles demandes apparaîtront ici</p>
              </div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="p-4 border-b border-gray-800">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar
                      src={req.profile?.avatar_url || req.profile?.photos?.[0]}
                      name={req.profile?.first_name || req.profile?.pseudo}
                      size="md"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {req.profile?.pseudo || req.profile?.first_name || 'Inconnu'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {req.profile?.pseudo ? `@${req.profile.pseudo}` : 'Pseudo non défini'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptRequest(req.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Check size={16} />
                      Accepter
                    </button>
                    <button
                      onClick={() => declineRequest(req.id)}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <X size={16} />
                      Refuser
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
