import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { astraService } from '@/services/astra/astraService';
import { toast } from 'react-hot-toast';
import { Star, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'astra';
  content: string;
  timestamp: Date;
}

export default function AstraPage() {
  const { profile } = useAuthStore();
  const { tier } = useSubscriptionStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messagesUsed, setMessagesUsed] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quotaLimit = tier === 'free' ? 5 : tier === 'premium' ? 40 : 65;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Add welcome message on first load
  useEffect(() => {
    if (messages.length === 0 && profile) {
      setMessages([{
        id: 'welcome',
        type: 'astra',
        content: `Bienvenue ${profile.first_name || 'voyageur'}. Je suis ASTRA, ton guide cosmique. Pose-moi une question sur toi, tes relations, ou ton parcours astral.`,
        timestamp: new Date(),
      }]);
    }
  }, [profile]);

  const handleSend = async () => {
    if (!input.trim() || !profile) return;

    if (messagesUsed >= quotaLimit) {
      toast.error(`Quota atteint (${quotaLimit} messages/jour). ${tier === 'free' ? 'Passe Premium pour plus.' : 'Reviens demain.'}`);
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setMessagesUsed(prev => prev + 1);

    try {
      const response = await astraService.generateResponse(profile.id, userMessage.content);

      const astraMessage: Message = {
        id: `astra-${Date.now()}`,
        type: 'astra',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, astraMessage]);
    } catch (error) {
      console.error('ASTRA error:', error);
      const errorMessage: Message = {
        id: `astra-error-${Date.now()}`,
        type: 'astra',
        content: "Je médite sur ta question. Réessaie dans un instant.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-2xl">⭐</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-black via-purple-950/20 to-black">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Star className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">ASTRA</h1>
              <p className="text-xs text-white/60">Coach cosmique IA</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60">Messages</p>
            <p className={`text-sm font-bold ${messagesUsed >= quotaLimit ? 'text-red-400' : 'text-purple-400'}`}>
              {messagesUsed}/{quotaLimit}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.type === 'user'
                    ? 'bg-purple-600 text-white rounded-br-md'
                    : 'bg-white/10 text-white rounded-bl-md border border-purple-500/20'
                }`}
              >
                {msg.type === 'astra' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-purple-400 font-medium">ASTRA</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs text-white/40 mt-2">
                  {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white/10 p-4 rounded-2xl rounded-bl-md border border-purple-500/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-purple-400">ASTRA réfléchit</span>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions for new users */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-white/40 mb-2">Suggestions :</p>
          <div className="flex flex-wrap gap-2">
            {[
              "Qu'est-ce que mon signe dit de moi ?",
              "Comment améliorer mes relations ?",
              "Quel est mon potentiel caché ?",
            ].map((suggestion, i) => (
              <button
                key={i}
                onClick={() => setInput(suggestion)}
                className="text-xs px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Pose ta question à ASTRA..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-white/40"
            disabled={isTyping || messagesUsed >= quotaLimit}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping || messagesUsed >= quotaLimit}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {messagesUsed >= quotaLimit && (
          <p className="text-xs text-red-400 mt-2 text-center">
            Quota atteint. {tier === 'free' ? 'Passe Premium pour 40 messages/jour.' : 'Reviens demain.'}
          </p>
        )}
      </div>
    </div>
  );
}
