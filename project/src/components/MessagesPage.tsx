import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ChatWindow from './ChatWindow';
import ConversationsList from './ConversationsList';

type MessagesPageProps = {
  onBack?: () => void;
};

export default function MessagesPage({ onBack }: MessagesPageProps = {}) {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedOtherUser, setSelectedOtherUser] = useState<any>(null);

  if (selectedConversation && selectedOtherUser) {
    return (
      <ChatWindow
        conversationId={selectedConversation}
        otherUserId={selectedOtherUser.id}
        otherUserPseudo={selectedOtherUser.pseudo}
        otherUserAvatar={selectedOtherUser.avatar_url}
        isOnline={selectedOtherUser.is_online}
        onBack={() => {
          setSelectedConversation(null);
          setSelectedOtherUser(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-y-auto overflow-x-hidden">
      <div className="stars-bg fixed inset-0 opacity-20 pointer-events-none" />

      <div className="relative z-10">
        {onBack && (
          <header className="bg-black/90 backdrop-blur-lg border-b border-indigo-600/30 px-4 py-4">
            <div className="max-w-screen-xl mx-auto flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-indigo-900/20 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <h1 className="text-xl font-bold text-white">Retour</h1>
            </div>
          </header>
        )}

        <div className="max-w-4xl mx-auto p-4 pb-24">
          <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg rounded-2xl border border-red-600/30 overflow-hidden" style={{ minHeight: 'calc(100vh - 180px)', maxHeight: 'calc(100vh - 180px)' }}>
            <ConversationsList
              onSelectConversation={(conversationId, otherUser) => {
                setSelectedConversation(conversationId);
                setSelectedOtherUser(otherUser);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
