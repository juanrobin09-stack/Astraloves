import { useState, useEffect } from 'react';
import { Search, MessageSquare, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Conversation {
  id: string;
  other_user: {
    id: string;
    pseudo: string;
    avatar_url?: string;
    is_premium: boolean;
    is_online: boolean;
    last_seen_at: string;
  };
  last_message_text: string;
  last_message_sender_id: string;
  last_message_at: string;
  unread_count: number;
}

interface ConversationsListProps {
  onSelectConversation: (conversationId: string, otherUser: any) => void;
}

export default function ConversationsList({ onSelectConversation }: ConversationsListProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConversations();

    const channel = supabase
      .channel('conversations_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
      }, () => {
        loadConversations();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, () => {
        loadConversations();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data: convs, error } = await supabase
        .from('conversations')
        .select(`
          id,
          user1_id,
          user2_id,
          last_message_text,
          last_message_sender_id,
          last_message_at,
          user1_unread_count,
          user2_unread_count
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const conversationsWithUsers = await Promise.all(
        (convs || []).map(async (conv) => {
          const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;

          const { data: otherUser } = await supabase
            .from('astra_profiles')
            .select('id, pseudo, avatar_url, is_premium, last_seen_at')
            .eq('id', otherUserId)
            .maybeSingle();

          const { data: presence } = await supabase
            .from('user_presence')
            .select('is_online, last_seen_at')
            .eq('user_id', otherUserId)
            .maybeSingle();

          const unread_count = conv.user1_id === user.id
            ? conv.user1_unread_count
            : conv.user2_unread_count;

          return {
            id: conv.id,
            other_user: {
              ...otherUser,
              is_online: presence?.is_online || false,
              last_seen_at: presence?.last_seen_at || otherUser?.last_seen_at,
            },
            last_message_text: conv.last_message_text,
            last_message_sender_id: conv.last_message_sender_id,
            last_message_at: conv.last_message_at,
            unread_count,
          };
        })
      );

      setConversations(conversationsWithUsers as Conversation[]);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredConversations = conversations.filter((conv) =>
    conv.other_user?.pseudo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-700/50 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">Messages</h2>
            {totalUnread > 0 && (
              <span className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                {totalUnread}
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">
              {searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}
            </p>
            <p className="text-gray-500 text-sm">
              {searchQuery ? 'Essayez avec un autre pseudo' : 'Commencez à matcher pour envoyer des messages'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id, conv.other_user)}
              className="w-full p-4 flex items-center gap-3 hover:bg-gray-800/50 transition-colors border-b border-gray-800/50"
            >
              <div className="relative flex-shrink-0">
                {conv.other_user?.avatar_url ? (
                  <img
                    src={conv.other_user.avatar_url}
                    alt={conv.other_user.pseudo}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
                    {conv.other_user?.pseudo?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                {conv.other_user?.is_online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium truncate">
                    @{conv.other_user?.pseudo || 'Utilisateur'}
                  </span>
                  {conv.other_user?.is_premium && (
                    <span className="text-yellow-400">💎</span>
                  )}
                </div>
                <p className={`text-sm truncate ${conv.unread_count > 0 ? 'text-white font-medium' : 'text-gray-400'}`}>
                  {conv.last_message_sender_id === user?.id && 'Vous : '}
                  {conv.last_message_text || 'Nouveau message'}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-gray-500">
                  {getTimeAgo(conv.last_message_at)}
                </span>
                {conv.unread_count > 0 && (
                  <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full">
                    {conv.unread_count}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
