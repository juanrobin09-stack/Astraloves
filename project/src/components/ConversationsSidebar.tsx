import { useState } from 'react';
import { X, MessageCircle, ClipboardList, Trophy } from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
  last_message_at: string;
  subscription_tier: 'free' | 'premium' | 'premium_elite';
  expires_at: string | null;
  messages_data: any[];
}

interface ConversationsSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  userTier: 'free' | 'premium' | 'premium_elite';
  onClose: () => void;
  onSelectConversation: (id: string) => void;
  onCreateNew: () => void;
  onDeleteConversation: (id: string) => void;
  onNavigate: (page: string) => void;
  resultsCount?: number;
}

export default function ConversationsSidebar({
  conversations,
  currentConversationId,
  userTier,
  onClose,
  onSelectConversation,
  onCreateNew,
  onDeleteConversation,
  onNavigate,
  resultsCount = 0
}: ConversationsSidebarProps) {

  const calculateTimeRemaining = (lastMessageAt: string): { hours: number; willExpire: boolean } => {
    const now = new Date();
    const lastMsg = new Date(lastMessageAt);
    const hoursLeft = 24 - Math.floor((now.getTime() - lastMsg.getTime()) / (1000 * 60 * 60));
    return {
      hours: Math.max(0, hoursLeft),
      willExpire: hoursLeft <= 6
    };
  };

  const sortedConversations = [...conversations].sort((a, b) =>
    new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  );

  const canCreateNew = userTier !== 'free' || conversations.filter(c => {
    const time = calculateTimeRemaining(c.last_message_at);
    return time.hours > 0;
  }).length === 0;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-80 bg-gradient-to-b from-gray-900 to-black border-r border-red-500/20 overflow-y-auto flex flex-col">

        <div className="p-4 border-b border-red-500/10 sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold text-lg">Mes conversations</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {userTier === 'free' && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl px-3 py-2">
              <p className="text-orange-400 text-xs flex items-center gap-2">
                <span className="flex-shrink-0">⏰</span>
                <span className="flex-1">Conversations conservées 24h</span>
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('/subscriptions');
                  }}
                  className="text-orange-300 underline flex-shrink-0 hover:text-orange-200"
                >
                  Upgrade
                </button>
              </p>
            </div>
          )}

          {(userTier === 'premium' || userTier === 'premium_elite') && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-3 py-2">
              <p className="text-green-400 text-xs flex items-center gap-2">
                <span>✓</span>
                <span>Historique illimité</span>
              </p>
            </div>
          )}
        </div>

        {/* Boutons Quizz et Résultats */}
        <div className="px-4 pb-2 space-y-2 flex-shrink-0">
          <button
            onClick={() => {
              onClose();
              onNavigate('questionnaires');
            }}
            className="w-full py-2.5 px-3 rounded-xl text-white font-semibold text-sm flex items-center gap-3 transition-all bg-gradient-to-r from-red-600/90 to-pink-600/90 hover:from-red-500 hover:to-pink-500 border border-red-400/30 hover:border-red-300/50 shadow-md hover:shadow-red-500/30 hover:scale-[1.02] active:scale-95"
            style={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            <span className="flex-1 text-left">Quizz</span>
            <div className="text-white/60 text-xs">→</div>
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigate('my-results');
            }}
            className="w-full py-2.5 px-3 rounded-xl text-white font-semibold text-sm flex items-center gap-3 transition-all bg-gradient-to-r from-purple-600/90 to-indigo-600/90 hover:from-purple-500 hover:to-indigo-500 border border-purple-400/30 hover:border-purple-300/50 shadow-md hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-95"
            style={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span className="flex-1 text-left">Mes résultats</span>
            {resultsCount > 0 && (
              <span className="bg-white/30 px-1.5 py-0.5 rounded-full text-xs font-bold">
                {resultsCount}
              </span>
            )}
            <div className="text-white/60 text-xs">→</div>
          </button>
        </div>

        <div className="p-4 flex-shrink-0">
          <button
            onClick={canCreateNew ? onCreateNew : () => {
              onClose();
              onNavigate('/subscriptions');
            }}
            disabled={!canCreateNew && userTier === 'free'}
            className={`w-full py-3 px-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all shadow-lg ${
              canCreateNew
                ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 hover:scale-105'
                : 'bg-gray-700/50 cursor-not-allowed opacity-50'
            }`}
          >
            <span className="text-xl">+</span>
            Nouvelle conversation
            {!canCreateNew && userTier === 'free' && (
              <span className="ml-auto text-xs opacity-75">(Premium)</span>
            )}
          </button>
        </div>

        <div className="px-2 pb-4 space-y-2 flex-1 overflow-y-auto">
          {sortedConversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="text-4xl mb-3 opacity-50">💬</div>
              <p className="text-gray-500 text-sm">Aucune conversation</p>
            </div>
          ) : (
            sortedConversations.map((conv) => {
              const lastMsg = conv.messages_data?.[conv.messages_data.length - 1];
              const isActive = conv.id === currentConversationId;
              const timeInfo = conv.subscription_tier === 'free'
                ? calculateTimeRemaining(conv.last_message_at)
                : null;
              const willExpire = timeInfo && timeInfo.willExpire;
              const isExpired = timeInfo && timeInfo.hours <= 0;

              return (
                <div
                  key={conv.id}
                  className={`relative group transition-all ${
                    isActive
                      ? 'bg-red-500/10 border-red-500/30'
                      : isExpired
                      ? 'bg-gray-900/50 border-gray-700/50 opacity-60'
                      : willExpire
                      ? 'bg-orange-500/5 border-orange-500/20'
                      : 'bg-white/5 border-white/10'
                  } border rounded-xl ${!isExpired && 'hover:bg-white/10'}`}
                >
                  <button
                    onClick={() => {
                      if (isExpired) {
                        onClose();
                        onNavigate('/subscriptions');
                      } else {
                        onSelectConversation(conv.id);
                      }
                    }}
                    className={`w-full p-4 text-left relative ${isExpired ? 'cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">⭐</span>
                      </div>

                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium text-sm truncate flex-1">
                            {conv.title}
                          </p>
                          {isExpired && (
                            <span className="text-gray-500 text-xs bg-gray-800/50 px-2 py-0.5 rounded flex items-center gap-1">
                              🔒 Expirée
                            </span>
                          )}
                        </div>

                        {timeInfo && !isExpired && (
                          <p className={`text-xs mt-1 ${willExpire ? 'text-orange-400' : 'text-gray-500'}`}>
                            {timeInfo.hours < 6
                              ? `⏰ ${timeInfo.hours}h restantes`
                              : `${timeInfo.hours}h restantes`
                            }
                          </p>
                        )}
                        {isExpired && (
                          <p className="text-xs mt-1 text-gray-500">
                            Upgrade pour accéder
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-xs text-gray-500">
                          {new Date(conv.last_message_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short'
                          })}
                        </span>
                        {conv.messages_data && conv.messages_data.length > 0 && (
                          <span className="px-2 py-0.5 bg-red-500/20 rounded-full text-xs text-red-400">
                            {conv.messages_data.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {conversations.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}