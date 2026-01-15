import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { astraService } from '@/services/astra/astraService';
import { toast } from 'react-hot-toast';
import { Send, Star, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'astra';
  content: string;
  timestamp: Date;
}

// ASTRA Star Logo - Same as landing page
const AstraStarLogo = ({ size = 48 }: { size?: number }) => (
  <div className="relative" style={{ width: size, height: size }}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <Star
        className="w-full h-full"
        fill="#dc2626"
        strokeWidth={0}
        style={{
          filter: 'drop-shadow(0 0 10px #dc2626) drop-shadow(0 0 20px #dc2626)',
        }}
      />
    </motion.div>
  </div>
);

export default function AstraPage() {
  const { profile } = useAuthStore();
  const { tier } = useSubscriptionStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messagesUsed, setMessagesUsed] = useState(0);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const quotaLimit = tier === 'free' ? 10 : tier === 'premium' ? 40 : 65;
  const quotaRemaining = quotaLimit - messagesUsed;

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle scroll
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0 && profile) {
      const sunSign = profile.sun_sign || 'voyageur cosmique';
      setMessages([{
        id: 'welcome',
        type: 'astra',
        content: `Salut ${profile.first_name || 'toi'} ✨\n\nJe suis ASTRA, ton guide astral personnel. En tant que ${sunSign}, tu as des énergies uniques à explorer.\n\nPose-moi tes questions sur l'amour, ta personnalité, ou ton avenir !`,
        timestamp: new Date(),
      }]);
    }
  }, [profile]);

  const handleSend = async () => {
    if (!input.trim() || !profile) return;

    if (messagesUsed >= quotaLimit) {
      toast.error(`Quota atteint. ${tier === 'free' ? 'Passe Premium !' : 'Reviens demain.'}`);
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
      setMessages(prev => [...prev, {
        id: `astra-${Date.now()}`,
        type: 'astra',
        content: response,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('ASTRA error:', error);
      setMessages(prev => [...prev, {
        id: `astra-error-${Date.now()}`,
        type: 'astra',
        content: "Les étoiles sont voilées... Réessaie dans un instant ✨",
        timestamp: new Date(),
      }]);
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

  const suggestions = [
    "Décris ma personnalité",
    "Mon compatibilité amoureuse",
    "Mes forces et faiblesses",
    "Conseil du jour",
  ];

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <AstraStarLogo size={64} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#000000]">
      {/* Header - Style iMessage */}
      <div className="flex-shrink-0 px-4 py-3 bg-[#1c1c1e]/95 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AstraStarLogo size={40} />
            <div>
              <h1 className="font-semibold text-[17px] text-white">ASTRA</h1>
              <p className="text-[13px] text-[#8e8e93]">Guide cosmique • En ligne</p>
            </div>
          </div>

          {/* Quota pill */}
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
            <div className={`w-2 h-2 rounded-full ${quotaRemaining > 3 ? 'bg-green-500' : 'bg-orange-500'}`} />
            <span className="text-[13px] text-[#8e8e93]">{quotaRemaining} msg</span>
          </div>
        </div>
      </div>

      {/* Messages - iMessage style */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ background: 'linear-gradient(to bottom, #000000, #0a0a0a)' }}
      >
        <AnimatePresence>
          {messages.map((msg, index) => {
            const isUser = msg.type === 'user';
            const showTime = index === 0 ||
              (messages[index - 1] &&
               msg.timestamp.getTime() - messages[index - 1].timestamp.getTime() > 300000);

            return (
              <div key={msg.id}>
                {/* Timestamp separator */}
                {showTime && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center my-4"
                  >
                    <span className="text-[11px] text-[#8e8e93] bg-white/5 px-3 py-1 rounded-full">
                      {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* ASTRA avatar for first message in sequence */}
                  {!isUser && (index === 0 || messages[index - 1]?.type === 'user') && (
                    <div className="flex-shrink-0 mr-2 mt-auto mb-1">
                      <AstraStarLogo size={28} />
                    </div>
                  )}
                  {!isUser && index > 0 && messages[index - 1]?.type === 'astra' && (
                    <div className="w-[28px] mr-2" />
                  )}

                  {/* Message bubble - iMessage style */}
                  <div
                    className={`max-w-[75%] px-4 py-2.5 ${
                      isUser
                        ? 'bg-[#dc2626] text-white rounded-[20px] rounded-br-[4px]'
                        : 'bg-[#2c2c2e] text-white rounded-[20px] rounded-bl-[4px]'
                    }`}
                  >
                    <p className="text-[15px] leading-[1.4] whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator - iMessage style */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-end mb-2"
            >
              <div className="flex-shrink-0 mr-2 mb-1">
                <AstraStarLogo size={28} />
              </div>
              <div className="bg-[#2c2c2e] px-4 py-3 rounded-[20px] rounded-bl-[4px]">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-2 h-2 bg-[#8e8e93] rounded-full"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollDown && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-32 right-4 w-8 h-8 bg-[#2c2c2e] rounded-full flex items-center justify-center shadow-lg border border-white/10"
          >
            <ChevronUp className="w-5 h-5 text-white rotate-180" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Suggestions - Only show at start */}
      <AnimatePresence>
        {messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-2"
          >
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {suggestions.map((text, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setInput(text)}
                  className="flex-shrink-0 px-4 py-2 bg-transparent hover:bg-white/5 text-[14px] text-white/70 hover:text-white rounded-full transition-colors border border-white/20 hover:border-white/40"
                >
                  {text}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area - iMessage style */}
      <div className="flex-shrink-0 px-4 py-3 bg-[#1c1c1e]/95 backdrop-blur-xl border-t border-white/10">
        {/* Quota warning */}
        {quotaRemaining <= 3 && quotaRemaining > 0 && (
          <div className="mb-2 text-center">
            <span className="text-[12px] text-orange-400">
              Plus que {quotaRemaining} message{quotaRemaining > 1 ? 's' : ''} aujourd'hui
            </span>
          </div>
        )}

        {quotaRemaining <= 0 && (
          <div className="mb-2 text-center">
            <span className="text-[12px] text-[#ff453a]">
              Quota épuisé • {tier === 'free' ? 'Passe Premium pour plus' : 'Reviens demain'}
            </span>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Input field - iMessage style */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message"
              disabled={isTyping || quotaRemaining <= 0}
              className="w-full px-4 py-2.5 bg-[#2c2c2e] border border-white/10 rounded-full text-[15px] text-white placeholder-[#8e8e93] focus:outline-none focus:border-[#dc2626]/50 disabled:opacity-50 transition-colors"
            />
          </div>

          {/* Send button - iMessage style */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!input.trim() || isTyping || quotaRemaining <= 0}
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center disabled:opacity-30 transition-all"
            style={{
              background: input.trim() ? '#dc2626' : '#2c2c2e',
            }}
          >
            <Send className="w-4 h-4 text-white" style={{ marginLeft: 2 }} />
          </motion.button>
        </div>

        {/* Tier badge */}
        <div className="mt-2 flex justify-center">
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${
            tier === 'elite' ? 'bg-amber-500/20 text-amber-400' :
            tier === 'premium' ? 'bg-[#dc2626]/20 text-[#dc2626]' :
            'bg-white/5 text-[#8e8e93]'
          }`}>
            {tier === 'elite' ? '👑 Elite' : tier === 'premium' ? '⭐ Premium' : 'Gratuit'} • {quotaLimit}/jour
          </span>
        </div>
      </div>
    </div>
  );
}
