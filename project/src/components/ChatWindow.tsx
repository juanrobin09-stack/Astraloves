import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Circle, Crown, MoreVertical, Ban, ImagePlus, X, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { canSendMessage, incrementMessageCount } from '../lib/messageCounter';
import EmailVerificationModal from './EmailVerificationModal';

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  image_url?: string;
};

type ChatWindowProps = {
  conversationId: string;
  otherUserId: string;
  otherUserPseudo: string;
  otherUserAvatar?: string;
  isOnline: boolean;
  onBack: () => void;
};

export default function ChatWindow({
  conversationId,
  otherUserId,
  otherUserPseudo,
  otherUserAvatar,
  isOnline,
  onBack
}: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [messageStatus, setMessageStatus] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMessages();
    markMessagesAsRead();
    loadMessageStatus();

    const messagesSubscription = supabase
      .channel(`messages_${conversationId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          if ((payload.new as Message).sender_id !== user!.id) {
            markMessagesAsRead();
          }
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const markMessagesAsRead = async () => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', user!.id)
      .eq('is_read', false);
  };

  const loadMessageStatus = async () => {
    if (!user) return;
    const status = await canSendMessage(user.id);
    setMessageStatus(status);
    setIsPremium(status.is_premium || false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || sending) return;

    if (!user?.email_confirmed_at) {
      setShowEmailModal(true);
      return;
    }

    const messageCheck = await canSendMessage(user!.id);

    if (!messageCheck.can_send) {
      const hours = messageCheck.reset_in_hours ? Math.ceil(messageCheck.reset_in_hours) : 24;
      alert(`⚠️ Limite de messages atteinte\n\n${messageCheck.is_premium ? '40 messages' : '10 messages'} par 24h\nProchain reset dans ${hours}h\n\n${!messageCheck.is_premium ? 'Passez à Premium pour 40 messages/jour !' : ''}`);
      return;
    }

    setSending(true);
    setUploading(true);

    let imageUrl = null;
    if (selectedImage) {
      imageUrl = await uploadImage(selectedImage);
    }

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user!.id,
        receiver_id: otherUserId,
        content: newMessage.trim() || '',
        image_url: imageUrl
      });

    if (!error) {
      await incrementMessageCount(user!.id);
      await loadMessageStatus();
    }

    if (!error) {
      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);
    }

    setSending(false);
    setUploading(false);
  };

  const handleBlockUser = async () => {
    const confirmBlock = confirm(`Bloquer ${otherUserPseudo} ? Cette personne ne pourra plus te contacter et disparaîtra de tes découvertes.`);
    if (!confirmBlock) return;

    const { error } = await supabase
      .from('blocked_users')
      .insert({
        blocker_id: user!.id,
        blocked_id: otherUserId
      });

    if (!error) {
      onBack();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffMins < 1440) return `Il y a ${Math.floor(diffMins / 60)}h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      <div className="bg-black/90 backdrop-blur-xl border-b border-red-600/20 p-3 sm:p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-2 sm:gap-4">
          <button
            onClick={onBack}
            className="text-white hover:text-red-400 transition-colors touch-manipulation p-1"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-red-600 shadow-lg">
              {otherUserAvatar ? (
                <img src={otherUserAvatar} alt={otherUserPseudo} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <span className="text-base sm:text-lg font-bold text-red-600">
                    {otherUserPseudo.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-600 border-2 border-white rounded-full" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-white truncate">{otherUserPseudo}</h2>
            <p className="text-white/70 text-xs sm:text-sm">
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </p>
          </div>

          <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" />

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-white hover:text-red-400 transition-colors p-2 touch-manipulation"
            >
              <MoreVertical className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-12 bg-black/90 backdrop-blur-xl border border-red-600/30 rounded-2xl overflow-hidden shadow-2xl z-50 min-w-[200px]">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleBlockUser();
                  }}
                  className="w-full px-4 py-3 text-left text-white hover:bg-red-600/20 transition-colors flex items-center gap-3 touch-manipulation"
                >
                  <Ban className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Bloquer {otherUserPseudo}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {messageStatus && !isPremium && messageStatus.remaining !== undefined && (
        <div className="bg-yellow-900/30 border-b border-yellow-600/30 p-2 sm:p-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span className="text-yellow-200">
                Messages: {messageStatus.current || 0}/{messageStatus.limit || 10}
              </span>
            </div>
            <button
              onClick={() => window.location.href = '#premium'}
              className="text-yellow-400 font-bold hover:underline flex items-center gap-1"
            >
              <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
              Premium
            </button>
          </div>
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto p-3 sm:p-4"
        style={{
          paddingBottom: 'calc(140px + env(safe-area-inset-bottom, 0px))'
        }}
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => {
            const isMine = message.sender_id === user!.id;
            return (
              <div
                key={message.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-3xl px-4 py-2.5 sm:px-6 sm:py-3 ${
                    isMine
                      ? 'bg-[#991b1b] text-white'
                      : 'bg-[#1a1a1a] text-gray-200 border border-gray-800'
                  }`}
                >
                  {message.image_url && (
                    <img
                      src={message.image_url}
                      alt="Shared image"
                      className="rounded-2xl mb-2 max-w-full cursor-pointer hover:opacity-90 transition-opacity touch-manipulation"
                      onClick={() => window.open(message.image_url, '_blank')}
                    />
                  )}
                  {message.content && (
                    <p className="text-sm sm:text-base leading-relaxed break-words">{message.content}</p>
                  )}
                  <p className={`text-[10px] sm:text-xs mt-1 ${isMine ? 'text-white/70' : 'text-white/60'}`}>
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-red-600/20 p-4 sm:p-5"
        style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
      >
        <form onSubmit={handleSend} className="max-w-3xl mx-auto">
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img src={imagePreview} alt="Preview" className="h-20 sm:h-24 rounded-xl" />
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center touch-manipulation active:scale-95 transition-transform"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              capture="environment"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#1a1a1a] hover:bg-red-600 active:bg-red-700 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all border border-gray-800 hover:border-red-600 touch-manipulation flex-shrink-0"
            >
              <ImagePlus className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message à ${otherUserPseudo}...`}
              className="flex-1 bg-[#1a1a1a] text-white placeholder-white/60 rounded-full px-5 py-3 sm:px-6 sm:py-3.5 focus:outline-none focus:ring-2 focus:ring-red-600 border border-gray-800 text-base min-h-[48px]"
            />
            <button
              type="submit"
              disabled={(!newMessage.trim() && !selectedImage) || sending || uploading}
              className="bg-red-600 hover:bg-[#991b1b] active:bg-[#7f1d1d] text-white rounded-full w-12 h-12 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation flex-shrink-0"
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>

      {showEmailModal && (
        <EmailVerificationModal
          email={user?.email || ''}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  );
}
