import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationService } from '@/services/messaging/conversationService';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, ArrowLeft, Sparkles, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ConversationData {
  id: string;
  user_id_1: string;
  user_id_2: string;
  match_id: string;
  status: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count_1: number;
  unread_count_2: number;
  profiles?: {
    id: string;
    first_name: string;
    avatar_url: string | null;
    sun_sign: string;
    moon_sign: string;
  };
}

interface MessageData {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

const SIGN_SYMBOLS: Record<string, string> = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
  leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
  sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
  bélier: '♈', taureau: '♉', gémeaux: '♊', lion: '♌',
  vierge: '♍', balance: '♎', scorpion: '♏', sagittaire: '♐',
  capricorne: '♑', verseau: '♒', poissons: '♓'
};

function getSignSymbol(sign: string): string {
  return SIGN_SYMBOLS[sign?.toLowerCase()] || '✨';
}

export default function MessagesPage() {
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const { data: conversations, isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      return conversationService.getConversations(profile.id);
    },
    enabled: !!profile,
  });

  // Fetch messages for selected conversation
  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: async () => {
      if (!selectedConversation) return [];
      return conversationService.getMessages(selectedConversation.id);
    },
    enabled: !!selectedConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!profile || !selectedConversation) throw new Error('Not ready');
      return conversationService.sendMessage(selectedConversation.id, profile.id, content);
    },
    onSuccess: () => {
      setMessageInput('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Mark as read when opening conversation
  useEffect(() => {
    if (selectedConversation && profile) {
      conversationService.markAsRead(selectedConversation.id, profile.id);
    }
  }, [selectedConversation, profile]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (messageInput.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(messageInput.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getOtherUser = (conv: ConversationData) => {
    return conv.profiles;
  };

  const getUnreadCount = (conv: ConversationData) => {
    if (!profile) return 0;
    return conv.user_id_1 === profile.id ? conv.unread_count_1 : conv.unread_count_2;
  };

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-cosmic-pulse text-2xl">⭐</div>
      </div>
    );
  }

  // Mobile: Show either list or chat
  // Desktop: Show both side by side
  return (
    <div className="h-full flex bg-cosmic-black">
      {/* Conversations List */}
      <AnimatePresence mode="wait">
        {(!selectedConversation || window.innerWidth >= 768) && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className={`${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 border-r border-white/10`}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <h1 className="text-2xl font-display font-bold flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-cosmic-purple" />
                Messages
              </h1>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {loadingConversations ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-cosmic-pulse text-2xl">✨</div>
                </div>
              ) : conversations && conversations.length > 0 ? (
                conversations.map((conv: ConversationData) => {
                  const otherUser = getOtherUser(conv);
                  const unreadCount = getUnreadCount(conv);

                  return (
                    <motion.button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 text-left ${
                        selectedConversation?.id === conv.id ? 'bg-white/10' : ''
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cosmic-purple to-pink-500 flex items-center justify-center overflow-hidden">
                          {otherUser?.avatar_url ? (
                            <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6 text-white" />
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-cosmic-gold text-cosmic-black text-xs font-bold rounded-full flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold truncate">
                            {otherUser?.first_name || 'Utilisateur'}
                          </span>
                          <span className="text-sm opacity-60">
                            {getSignSymbol(otherUser?.sun_sign || '')}
                          </span>
                        </div>
                        <p className="text-sm text-white/60 truncate">
                          {conv.last_message_preview || 'Commencez la conversation...'}
                        </p>
                      </div>

                      {/* Time */}
                      {conv.last_message_at && (
                        <span className="text-xs text-white/40">
                          {format(new Date(conv.last_message_at), 'HH:mm', { locale: fr })}
                        </span>
                      )}
                    </motion.button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Sparkles className="w-12 h-12 text-cosmic-purple mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Aucune conversation</h3>
                  <p className="text-white/60 text-sm">
                    Explorez l'Univers pour découvrir des profils et créer des connexions cosmiques !
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat View */}
      <AnimatePresence mode="wait">
        {selectedConversation ? (
          <motion.div
            key={selectedConversation.id}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cosmic-purple to-pink-500 flex items-center justify-center overflow-hidden">
                {getOtherUser(selectedConversation)?.avatar_url ? (
                  <img src={getOtherUser(selectedConversation)!.avatar_url!} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>

              <div>
                <h2 className="font-semibold flex items-center gap-2">
                  {getOtherUser(selectedConversation)?.first_name || 'Utilisateur'}
                  <span className="text-sm opacity-60">
                    {getSignSymbol(getOtherUser(selectedConversation)?.sun_sign || '')}
                  </span>
                </h2>
                <p className="text-xs text-white/60">
                  {getOtherUser(selectedConversation)?.sun_sign} • {getOtherUser(selectedConversation)?.moon_sign}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-cosmic-pulse text-2xl">✨</div>
                </div>
              ) : messages && messages.length > 0 ? (
                messages.map((msg: MessageData) => {
                  const isOwn = msg.sender_id === profile.id;

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                          isOwn
                            ? 'bg-gradient-to-r from-cosmic-purple to-pink-500 rounded-br-md'
                            : 'bg-white/10 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-white/40'}`}>
                          {format(new Date(msg.created_at), 'HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Sparkles className="w-12 h-12 text-cosmic-purple mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Nouvelle connexion</h3>
                  <p className="text-white/60 text-sm">
                    Envoyez le premier message et laissez la magie opérer !
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-cosmic-purple focus:outline-none transition-colors"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  className="p-3 bg-gradient-to-r from-cosmic-purple to-pink-500 rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-cosmic-purple mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-semibold mb-2">Sélectionnez une conversation</h3>
              <p className="text-white/60">
                Choisissez une conversation pour commencer à discuter
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
