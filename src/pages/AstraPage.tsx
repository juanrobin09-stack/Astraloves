import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { astraService } from '@/services/astra/astraService';
import { toast } from 'react-hot-toast';
import { Star, Send, Sparkles, Bot, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'astra';
  content: string;
  timestamp: Date;
}

export default function AstraPage() {
  const { profile } = useAuthStore();
  const { tier, isPremium } = useSubscriptionStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messagesUsed, setMessagesUsed] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quotaLimit = tier === 'free' ? 10 : tier === 'premium' ? 40 : 65;

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
        content: `Bienvenue ${profile.first_name || 'voyageur'} ✨\n\nJe suis ASTRA, ton guide cosmique personnel. En tant que ${profile.sun_sign || 'être de lumière'}, tu possèdes des qualités uniques que je peux t'aider à explorer.\n\nPose-moi une question sur toi, tes relations, ou ton parcours astral.`,
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
        content: "Les étoiles sont un peu voilées en ce moment... Réessaie dans un instant.",
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
      <div className="h-full flex items-center justify-center bg-cosmic-black">
        <div className="animate-cosmic-pulse text-4xl">✨</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-black via-[#0a0000] to-black">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cosmic-red to-pink-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cosmic-green rounded-full border-2 border-black" />
            </div>
            <div>
              <h1 className="font-bold text-lg flex items-center gap-2">
                ASTRA
                {isPremium && <Crown className="w-4 h-4 text-cosmic-gold" />}
              </h1>
              <p className="text-xs text-white/50">Coach cosmique IA • En ligne</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40">Messages restants</p>
            <p className={`text-lg font-bold ${messagesUsed >= quotaLimit ? 'text-red-400' : 'text-cosmic-red'}`}>
              {quotaLimit - messagesUsed}
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
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 ${
                  msg.type === 'user'
                    ? 'bg-cosmic-red text-white rounded-2xl rounded-br-md'
                    : 'bg-white/5 backdrop-blur-xl text-white rounded-2xl rounded-bl-md border border-white/10'
                }`}
              >
                {msg.type === 'astra' && (
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                    <div className="w-6 h-6 rounded-lg bg-cosmic-red/20 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-cosmic-red" />
                    </div>
                    <span className="text-xs text-cosmic-red font-medium">ASTRA</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <p className="text-[10px] text-white/30 mt-3 text-right">
                  {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl rounded-bl-md border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-cosmic-red/20 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-cosmic-red animate-pulse" />
                </div>
                <span className="text-xs text-white/50">ASTRA réfléchit</span>
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-cosmic-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-cosmic-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-cosmic-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions for new users */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-white/40 mb-3">Suggestions rapides :</p>
          <div className="flex flex-wrap gap-2">
            {[
              { emoji: '✨', text: "Qu'est-ce que mon signe dit de moi ?" },
              { emoji: '💕', text: "Comment améliorer mes relations ?" },
              { emoji: '🔮', text: "Quel est mon potentiel caché ?" },
              { emoji: '🌙', text: "Que dit ma Lune sur mes émotions ?" },
            ].map((suggestion, i) => (
              <button
                key={i}
                onClick={() => setInput(suggestion.text)}
                className="text-xs px-4 py-2.5 bg-white/5 hover:bg-cosmic-red/20 border border-white/10 hover:border-cosmic-red/50 rounded-full transition-all flex items-center gap-2"
              >
                <span>{suggestion.emoji}</span>
                <span>{suggestion.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Pose ta question à ASTRA..."
            className="flex-1 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-cosmic-red/50 text-white placeholder-white/30 text-sm"
            disabled={isTyping || messagesUsed >= quotaLimit}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping || messagesUsed >= quotaLimit}
            className="px-5 py-4 bg-cosmic-red hover:bg-cosmic-red-light disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {messagesUsed >= quotaLimit && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-red-400 mt-3 text-center bg-red-500/10 py-2 rounded-xl"
          >
            Quota atteint. {tier === 'free' ? 'Passe Premium pour 40 messages/jour.' : 'Reviens demain.'}
          </motion.p>
        )}
      </div>
    </div>
  );
}
