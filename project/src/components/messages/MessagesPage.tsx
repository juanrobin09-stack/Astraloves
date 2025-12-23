import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import MessagesSidebar from './MessagesSidebar';
import UserChat from './UserChat';
import AddFriendsView from './AddFriendsView';

type View = 'conversations' | 'chat' | 'friends' | 'requests' | 'add-friends';

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_content: string | null;
  last_message_sender: string | null;
  last_message_at: string | null;
  unread_count_1: number;
  unread_count_2: number;
  otherUser?: any;
}

interface Friend {
  id: string;
  sender_id: string;
  receiver_id: string;
  statut: string;
  profile?: any;
}

interface MessagesPageProps {
  onNavigateToDiscovery?: () => void;
  onNavigate?: (page: string) => void;
}

export default function MessagesPage({ onNavigateToDiscovery, onNavigate }: MessagesPageProps) {
  const { user } = useAuth();
  const [view, setView] = useState<View>('conversations');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Friend[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadCurrentUserProfile();
      loadConversations();
      loadFriends();
      loadRequests();
    }
  }, [user]);

  const loadCurrentUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('astra_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    setCurrentUserProfile(data);
  };

  const loadConversations = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('conversations')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('updated_at', { ascending: false });

    if (data) {
      const conversationsWithUsers = await Promise.all(
        data.map(async (conv) => {
          const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
          const { data: otherUserProfile } = await supabase
            .from('astra_profiles')
            .select('id, first_name, photos, pseudo, avatar_url')
            .eq('id', otherUserId)
            .maybeSingle();

          const { data: presence } = await supabase
            .from('user_presence')
            .select('is_online, last_seen_at')
            .eq('user_id', otherUserId)
            .maybeSingle();

          return {
            ...conv,
            otherUser: {
              ...otherUserProfile,
              is_online: presence?.is_online || false,
              last_seen_at: presence?.last_seen_at,
            },
          };
        })
      );
      setConversations(conversationsWithUsers);
    }
  };

  const loadFriends = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('friends')
      .select('*')
      .eq('statut', 'accepted')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (data) {
      const friendsWithProfiles = await Promise.all(
        data.map(async (friend) => {
          const otherUserId = friend.sender_id === user.id ? friend.receiver_id : friend.sender_id;
          const { data: profile } = await supabase
            .from('astra_profiles')
            .select('id, first_name, photos, pseudo, avatar_url')
            .eq('id', otherUserId)
            .maybeSingle();

          const { data: presence } = await supabase
            .from('user_presence')
            .select('is_online, last_seen_at')
            .eq('user_id', otherUserId)
            .maybeSingle();

          return {
            ...friend,
            profile: {
              ...profile,
              is_online: presence?.is_online || false,
              last_seen_at: presence?.last_seen_at,
            },
          };
        })
      );
      setFriends(friendsWithProfiles);
    }
  };

  const loadRequests = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('friends')
      .select('*')
      .eq('receiver_id', user.id)
      .eq('statut', 'pending');

    if (data) {
      const requestsWithProfiles = await Promise.all(
        data.map(async (req) => {
          const { data: profile } = await supabase
            .from('astra_profiles')
            .select('id, first_name, photos, pseudo, avatar_url')
            .eq('id', req.sender_id)
            .maybeSingle();

          return {
            ...req,
            profile,
          };
        })
      );
      setRequests(requestsWithProfiles);
    }
  };

  const openChat = (userProfile: any) => {
    setSelectedUser(userProfile);
    setView('chat');
  };

  if (!user || !currentUserProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col md:flex-row overflow-hidden relative">
      {/* Sidebar - COMPLÈTEMENT CACHÉ quand conversation ouverte */}
      <div className={`${
        view === 'chat' || view === 'add-friends'
          ? 'hidden'
          : 'flex'
      } w-full md:w-[30%] md:max-w-md flex-col border-r border-red-900/30 overflow-hidden`}>
        <MessagesSidebar
          view={view}
          setView={setView}
          conversations={conversations}
          friends={friends}
          requests={requests}
          currentUserProfile={currentUserProfile}
          onOpenChat={openChat}
          onRefresh={() => {
            loadConversations();
            loadFriends();
            loadRequests();
          }}
          onNavigateToDiscovery={onNavigateToDiscovery}
        />
      </div>

      {/* Content area - UserChat gère son propre fullscreen */}
      <div className={`${
        view === 'chat' || view === 'add-friends'
          ? 'flex'
          : 'hidden md:flex'
      } flex-1 flex-col bg-black overflow-hidden`}>
        {view === 'chat' && selectedUser && (
          <UserChat
            currentUserId={user.id}
            selectedUser={selectedUser}
            onBack={() => setView('conversations')}
            onRefreshConversations={loadConversations}
          />
        )}

        {view === 'add-friends' && (
          <AddFriendsView
            currentUserProfile={currentUserProfile}
            onRefresh={() => {
              loadFriends();
              loadRequests();
            }}
            onBack={() => setView('conversations')}
          />
        )}

        {view === 'conversations' && (
          <div className="flex-1 hidden md:flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="mx-auto text-gray-700 mb-4" size={64} />
              <p className="text-gray-400">Sélectionnez une conversation</p>
            </div>
          </div>
        )}

        {view === 'friends' && (
          <div className="flex-1 hidden md:flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="mx-auto text-gray-700 mb-4" size={64} />
              <p className="text-gray-400">Sélectionnez un ami pour discuter</p>
            </div>
          </div>
        )}

        {view === 'requests' && (
          <div className="flex-1 hidden md:flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="mx-auto text-gray-700 mb-4" size={64} />
              <p className="text-gray-400">Les demandes d'amis apparaissent dans la liste à gauche</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
