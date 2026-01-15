import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { astraService } from '@/services/astra/astraService';
import { toast } from 'react-hot-toast';
import { Send, Sparkles, Crown, Zap, Star, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'astra';
  content: string;
  timestamp: Date;
}

// Animated stars background component
const CosmicBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Deep space gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0000] via-[#150505] to-[#0a0000]" />

      {/* Nebula effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cosmic-red/5 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-pink-500/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Animated stars */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Shooting stars */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`shoot-${i}`}
          className="absolute w-20 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"
          style={{
            left: `${20 + i * 30}%`,
            top: `${10 + i * 20}%`,
            rotate: 45,
          }}
          animate={{
            x: [0, 200],
            y: [0, 200],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 3 + i * 4,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Constellation lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <motion.path
          d="M100,50 L150,100 L200,80 L250,120"
          stroke="url(#redGradient)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.path
          d="M300,200 L350,180 L400,220 L380,280"
          stroke="url(#redGradient)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, delay: 1, repeat: Infinity, repeatType: "reverse" }}
        />
        <defs>
          <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E63946" stopOpacity="0" />
            <stop offset="50%" stopColor="#E63946" stopOpacity="1" />
            <stop offset="100%" stopColor="#E63946" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// ASTRA Avatar component with cosmic glow
const AstraAvatar = ({ size = 'large' }: { size?: 'large' | 'small' }) => {
  const isLarge = size === 'large';

  return (
    <div className={`relative ${isLarge ? 'w-16 h-16' : 'w-8 h-8'}`}>
      {/* Outer glow rings */}
      <motion.div
        className={`absolute inset-0 rounded-full bg-gradient-to-r from-cosmic-red via-pink-500 to-orange-500`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ filter: 'blur(8px)' }}
      />
      <motion.div
        className={`absolute inset-0 rounded-full bg-gradient-to-r from-cosmic-red to-pink-600`}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
        style={{ filter: 'blur(4px)' }}
      />

      {/* Main avatar */}
      <div className={`relative ${isLarge ? 'w-16 h-16' : 'w-8 h-8'} rounded-full bg-gradient-to-br from-cosmic-red via-pink-600 to-orange-500 flex items-center justify-center shadow-lg shadow-cosmic-red/50`}>
        <span className={`${isLarge ? 'text-2xl' : 'text-sm'}`}>✨</span>
      </div>

      {/* Orbiting particles */}
      {isLarge && [...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-cosmic-gold rounded-full"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            top: '50%',
            left: '50%',
            transformOrigin: `${-20 - i * 8}px 0px`,
          }}
        />
      ))}
    </div>
  );
};

export default function AstraPage() {
  const { profile } = useAuthStore();
  const { tier, isPremium } = useSubscriptionStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messagesUsed, setMessagesUsed] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quotaLimit = tier === 'free' ? 10 : tier === 'premium' ? 40 : 65;
  const quotaRemaining = quotaLimit - messagesUsed;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Add welcome message on first load
  useEffect(() => {
    if (messages.length === 0 && profile) {
      const sunSign = profile.sun_sign || 'voyageur cosmique';
      setMessages([{
        id: 'welcome',
        type: 'astra',
        content: `Salutations, ${profile.first_name || 'être de lumière'} ✨\n\nJe suis ASTRA, ton guide à travers les mystères du cosmos. Les étoiles m'ont révélé que tu es ${sunSign}... un signe fascinant.\n\nQue souhaites-tu explorer aujourd'hui ? L'amour, ta destinée, ou les secrets de ton âme ?`,
        timestamp: new Date(),
      }]);
    }
  }, [profile]);

  const handleSend = async () => {
    if (!input.trim() || !profile) return;

    if (messagesUsed >= quotaLimit) {
      toast.error(`Quota atteint. ${tier === 'free' ? 'Passe Premium pour plus.' : 'Reviens demain.'}`);
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
        content: "Les étoiles sont voilées par des nuages cosmiques... Réessaie dans un instant, je retrouverai ma connexion avec l'univers.",
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

  const suggestions = [
    { icon: <Star className="w-4 h-4" />, text: "Décris ma personnalité astrale", color: "from-yellow-500/20 to-orange-500/20" },
    { icon: <Moon className="w-4 h-4" />, text: "Que dit ma Lune sur mes émotions ?", color: "from-blue-500/20 to-purple-500/20" },
    { icon: <Sun className="w-4 h-4" />, text: "Mon potentiel amoureux", color: "from-pink-500/20 to-red-500/20" },
    { icon: <Zap className="w-4 h-4" />, text: "Mes défis à surmonter", color: "from-green-500/20 to-teal-500/20" },
  ];

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <AstraAvatar />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black relative overflow-hidden">
      <CosmicBackground />

      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex-shrink-0 p-4 border-b border-white/10 bg-black/60 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AstraAvatar />
            <div>
              <h1 className="font-bold text-xl flex items-center gap-2">
                <span className="bg-gradient-to-r from-cosmic-red via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  ASTRA
                </span>
                {isPremium && (
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Crown className="w-5 h-5 text-cosmic-gold" />
                  </motion.div>
                )}
              </h1>
              <p className="text-xs text-white/50 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Guide cosmique • Connectée aux étoiles
              </p>
            </div>
          </div>

          {/* Quota indicator */}
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <Sparkles className="w-4 h-4 text-cosmic-red" />
              <span className="text-xs text-white/40">Énergie cosmique</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cosmic-red to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(quotaRemaining / quotaLimit) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className={`text-sm font-bold ${quotaRemaining <= 3 ? 'text-red-400' : 'text-cosmic-red'}`}>
                {quotaRemaining}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.type === 'astra' && (
                <div className="flex-shrink-0 mr-3 mt-1">
                  <AstraAvatar size="small" />
                </div>
              )}

              <div
                className={`max-w-[80%] ${
                  msg.type === 'user'
                    ? 'bg-gradient-to-br from-cosmic-red to-pink-600 text-white rounded-3xl rounded-br-lg shadow-lg shadow-cosmic-red/30'
                    : 'bg-white/5 backdrop-blur-xl text-white rounded-3xl rounded-bl-lg border border-white/10 shadow-xl'
                }`}
              >
                {msg.type === 'astra' && (
                  <div className="px-5 pt-4 pb-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-4 h-4 text-cosmic-red" />
                      </motion.div>
                      <span className="text-xs font-semibold bg-gradient-to-r from-cosmic-red to-pink-400 bg-clip-text text-transparent">
                        ASTRA
                      </span>
                      <span className="text-[10px] text-white/30">• Oracle cosmique</span>
                    </div>
                  </div>
                )}

                <div className="px-5 py-4">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>

                <div className="px-5 pb-3">
                  <p className="text-[10px] text-white/30 text-right">
                    {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {msg.type === 'user' && (
                <div className="flex-shrink-0 ml-3 mt-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-sm border border-white/10">
                    {profile.first_name?.[0] || '👤'}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start"
            >
              <div className="flex-shrink-0 mr-3 mt-1">
                <AstraAvatar size="small" />
              </div>
              <div className="bg-white/5 backdrop-blur-xl px-6 py-4 rounded-3xl rounded-bl-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4 text-cosmic-red" />
                  </motion.div>
                  <span className="text-sm text-white/60">Consultation des astres</span>
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-2 h-2 bg-cosmic-red rounded-full"
                        animate={{
                          y: [0, -8, 0],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions for new users */}
      <AnimatePresence>
        {messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative z-10 px-4 pb-4"
          >
            <p className="text-xs text-white/40 mb-3 flex items-center gap-2">
              <Star className="w-3 h-3" />
              Questions suggérées
            </p>
            <div className="grid grid-cols-2 gap-2">
              {suggestions.map((suggestion, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInput(suggestion.text)}
                  className={`text-left text-xs p-3 bg-gradient-to-br ${suggestion.color} backdrop-blur-xl border border-white/10 hover:border-cosmic-red/50 rounded-2xl transition-all group`}
                >
                  <div className="flex items-center gap-2 text-white/70 group-hover:text-cosmic-red transition-colors mb-1">
                    {suggestion.icon}
                  </div>
                  <span className="text-white/80">{suggestion.text}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex-shrink-0 p-4 border-t border-white/10 bg-black/60 backdrop-blur-xl"
      >
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Pose ta question aux étoiles..."
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-cosmic-red/50 focus:ring-2 focus:ring-cosmic-red/20 text-white placeholder-white/30 text-sm transition-all"
              disabled={isTyping || messagesUsed >= quotaLimit}
            />
            {input && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <Sparkles className="w-4 h-4 text-cosmic-red/50" />
              </motion.div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isTyping || messagesUsed >= quotaLimit}
            className="p-4 bg-gradient-to-br from-cosmic-red to-pink-600 hover:from-cosmic-red-light hover:to-pink-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl transition-all shadow-lg shadow-cosmic-red/30 disabled:shadow-none"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Quota warning */}
        <AnimatePresence>
          {messagesUsed >= quotaLimit && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <div className="flex items-center justify-center gap-2 text-xs text-red-400 bg-red-500/10 py-3 px-4 rounded-xl border border-red-500/20">
                <Zap className="w-4 h-4" />
                <span>Énergie cosmique épuisée.</span>
                {tier === 'free' && (
                  <button className="text-cosmic-red hover:text-cosmic-red-light underline">
                    Passe Premium
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tier indicator */}
        <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-white/30">
          <span className={`px-2 py-0.5 rounded-full ${
            tier === 'elite' ? 'bg-cosmic-gold/20 text-cosmic-gold' :
            tier === 'premium' ? 'bg-cosmic-red/20 text-cosmic-red' :
            'bg-white/10 text-white/50'
          }`}>
            {tier === 'elite' ? '👑 ELITE' : tier === 'premium' ? '⭐ PREMIUM' : 'GRATUIT'}
          </span>
          <span>•</span>
          <span>{quotaLimit} messages/jour</span>
        </div>
      </motion.div>
    </div>
  );
}
