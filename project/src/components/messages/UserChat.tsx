import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Avatar from '../Avatar';
import Starfield from '../Starfield';
import { StatsTracker } from '../../lib/statsTracker';

interface UserChatProps {
  currentUserId: string;
  selectedUser: any;
  onBack: () => void;
  onRefreshConversations: () => void;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function UserChat({
  currentUserId,
  selectedUser,
  onBack,
  onRefreshConversations,
}: UserChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedUser) {
      console.log('👤 Selected user:', {
        id: selectedUser.id,
        first_name: selectedUser.first_name,
        pseudo: selectedUser.pseudo,
        avatar_url: selectedUser.avatar_url,
        photos: selectedUser.photos,
      });
      loadMessages();
      markMessagesAsRead();
      loadUserPresence();
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Realtime messages subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (newMsg.sender_id !== currentUserId) {
            markMessagesAsRead();
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId, currentUserId]);

  // Realtime presence subscription
  useEffect(() => {
    if (!selectedUser?.id) return;

    const channel = supabase
      .channel(`presence:${selectedUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `user_id=eq.${selectedUser.id}`,
        },
        (payload) => {
          if (payload.new) {
            setIsOnline(payload.new.is_online);
            setLastSeen(payload.new.last_seen_at);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [selectedUser?.id]);

  const loadUserPresence = async () => {
    const { data } = await supabase
      .from('user_presence')
      .select('is_online, last_seen_at')
      .eq('user_id', selectedUser.id)
      .maybeSingle();

    if (data) {
      setIsOnline(data.is_online);
      setLastSeen(data.last_seen_at);
    }
  };

  const loadMessages = async () => {
    const { data: conv } = await supabase
      .from('conversations')
      .select('id')
      .or(
        `and(user1_id.eq.${currentUserId},user2_id.eq.${selectedUser.id}),and(user1_id.eq.${selectedUser.id},user2_id.eq.${currentUserId})`
      )
      .maybeSingle();

    if (conv) {
      setConversationId(conv.id);

      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
      }
    }
  };

  const markMessagesAsRead = async () => {
    const { data: conv } = await supabase
      .from('conversations')
      .select('id, user1_id')
      .or(
        `and(user1_id.eq.${currentUserId},user2_id.eq.${selectedUser.id}),and(user1_id.eq.${selectedUser.id},user2_id.eq.${currentUserId})`
      )
      .maybeSingle();

    if (conv) {
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conv.id)
        .eq('receiver_id', currentUserId)
        .eq('is_read', false);

      const unreadField = conv.user1_id === currentUserId ? 'user1_unread_count' : 'user2_unread_count';
      await supabase
        .from('conversations')
        .update({ [unreadField]: 0 })
        .eq('id', conv.id);

      onRefreshConversations();
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || loading) return;

    const content = newMessage.trim();
    const tempId = `temp-${Date.now()}`;

    // 1. OPTIMISTIC UPDATE - Affichage instantané
    const optimisticMessage: Message = {
      id: tempId,
      sender_id: currentUserId,
      receiver_id: selectedUser.id,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');
    setLoading(true);

    try {
      console.log('📤 Sending message...', { currentUserId, receiverId: selectedUser.id, content });

      let convId = conversationId;

      if (!convId) {
        console.log('📝 Creating new conversation...');
        const participant1 = [currentUserId, selectedUser.id].sort()[0];
        const participant2 = [currentUserId, selectedUser.id].sort()[1];

        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            user1_id: participant1,
            user2_id: participant2,
            last_message_text: content,
            last_message_sender_id: currentUserId,
            last_message_at: new Date().toISOString(),
            user1_unread_count: participant1 === currentUserId ? 0 : 1,
            user2_unread_count: participant2 === currentUserId ? 0 : 1,
          })
          .select()
          .single();

        if (convError) {
          console.error('❌ Conversation creation error:', convError);
          throw convError;
        }
        console.log('✅ Conversation created:', newConv);
        convId = newConv.id;
        setConversationId(convId);
      }

      console.log('💬 Inserting message into conversation:', convId);
      const { data: realMessage, error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: convId,
          sender_id: currentUserId,
          receiver_id: selectedUser.id,
          content,
        })
        .select()
        .single();

      if (msgError) {
        console.error('❌ Message insert error:', msgError);
        throw msgError;
      }
      console.log('✅ Message inserted successfully');

      StatsTracker.trackMessage(currentUserId);

      // 2. REMPLACER le message temporaire par le vrai message de la DB
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? realMessage : msg))
      );

      const { data: conv } = await supabase
        .from('conversations')
        .select('user1_id, user2_unread_count, user1_unread_count')
        .eq('id', convId)
        .single();

      if (conv) {
        const unreadField = conv.user1_id === currentUserId ? 'user2_unread_count' : 'user1_unread_count';
        const currentUnread = conv.user1_id === currentUserId ? conv.user2_unread_count : conv.user1_unread_count;

        console.log('📊 Updating conversation metadata...', { unreadField, currentUnread });
        const { error: updateError } = await supabase
          .from('conversations')
          .update({
            last_message_text: content,
            last_message_sender_id: currentUserId,
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            [unreadField]: (currentUnread || 0) + 1,
          })
          .eq('id', convId);

        if (updateError) {
          console.error('⚠️ Update conversation error (non-critical):', updateError);
        } else {
          console.log('✅ Conversation updated');
        }
      }

      onRefreshConversations();
      console.log('✅ Message sent successfully!');
    } catch (error: any) {
      console.error('❌ CRITICAL ERROR sending message:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      // 3. ROLLBACK - Retirer le message en cas d'erreur
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setNewMessage(content);

      alert(`Erreur lors de l'envoi du message: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const getLastSeenText = () => {
    if (isOnline) return 'En ligne';
    if (!lastSeen) return 'Hors ligne';

    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    return `Il y a ${diffDays}j`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col">
      {/* Fond étoilé - COUVRE 100% DE L'ÉCRAN */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.6 }}>
        <Starfield />
      </div>

      {/* Header - FIXE en haut */}
      <div className="relative z-10 flex-shrink-0 bg-gradient-to-r from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-sm border-b border-red-900/30 p-4 flex items-center gap-3 shadow-lg">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800/50 rounded-full"
        >
          <ArrowLeft size={22} />
        </button>

        <Avatar
          src={selectedUser.avatar_url || selectedUser.photos?.[0]}
          name={selectedUser.first_name || selectedUser.pseudo}
          size="md"
          showOnline
          isOnline={isOnline}
        />

        <div className="flex-1">
          <p className="text-white font-bold text-lg">
            {selectedUser.first_name || selectedUser.pseudo}
          </p>
          <p className="text-gray-400 text-xs flex items-center gap-1">
            {selectedUser.pseudo && `@${selectedUser.pseudo} • `}
            <span className={isOnline ? 'text-green-400' : 'text-gray-500'}>
              {getLastSeenText()}
            </span>
          </p>
        </div>
      </div>

      {/* Messages - SCROLLABLE avec padding bottom pour l'input */}
      <div
        className="relative z-10 flex-1 overflow-y-auto p-4 space-y-3"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#ef4444 transparent',
          paddingBottom: 'calc(160px + env(safe-area-inset-bottom, 0px))'
        }}
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-900 rounded-full flex items-center justify-center border-2 border-red-900/30">
              <Send className="text-red-600" size={32} />
            </div>
            <p className="font-semibold text-white mb-2">Début de la conversation</p>
            <p className="text-sm">Messages illimités entre amis ✨</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl shadow-lg ${
                msg.sender_id === currentUserId
                  ? 'bg-gradient-to-br from-red-600 to-red-700 text-white rounded-br-sm'
                  : 'bg-gradient-to-br from-gray-800 to-gray-900 text-white border border-gray-700 rounded-bl-sm'
              }`}
            >
              <p className="text-xs sm:text-sm leading-relaxed break-words overflow-wrap-anywhere">{msg.content}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-[10px] sm:text-xs opacity-70">
                  {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {msg.sender_id === currentUserId && (
                  <span className="text-[10px] sm:text-xs opacity-70">
                    {msg.is_read ? '✓✓' : '✓'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - FIXE AU-DESSUS DE LA NAVBAR */}
      <div
        className="fixed left-0 right-0 z-[101] bg-gradient-to-r from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-sm border-t border-red-900/30 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
        style={{
          bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
        }}
      >
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Écrivez votre message..."
            disabled={loading}
            className="flex-1 bg-white/10 border border-white/20 rounded-full px-5 py-3 text-white outline-none placeholder-gray-400 text-base focus:border-red-500 transition-colors"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !newMessage.trim()}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-red-600/50 flex-shrink-0"
          >
            <Send size={20} />
            <span className="hidden sm:inline">Envoyer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
