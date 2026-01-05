import { useState, useEffect, useRef, useMemo } from 'react';
import { Star, Menu, X, Plus, ClipboardList, ArrowRight, FileText, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import PremiumQuestionnaireFlow from './PremiumQuestionnaireFlow';
import { useAstraChatLimit } from '../hooks/useAstraChatLimit';
import ConversationsSidebar from './ConversationsSidebar';
import * as ConversationsService from '../lib/astraConversationsService';

interface AstraChatProps {
  onNavigate: (page: string) => void;
}

interface Message {
  type: 'astra' | 'user';
  text: string;
  time: string;
  error?: boolean;
  timestamp?: string;
}

interface ConversationData {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  subscription_tier: 'free' | 'premium' | 'premium_elite';
  last_message_at: string;
  expires_at: string | null;
}

export default function AstraChat({ onNavigate }: AstraChatProps) {
  const { user } = useAuth();
  const [userTier, setUserTier] = useState<string>('free');
  const { messagesUsed, limit, remaining, checkLimit } = useAstraChatLimit({
    userId: user?.id,
    premiumTier: userTier as any
  });
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [showConversations, setShowConversations] = useState(false);
  const [showQuizMenu, setShowQuizMenu] = useState(false);
  const [activeQuestionnaireId, setActiveQuestionnaireId] = useState<string | null>(null);
  const [resultsCount, setResultsCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const isSendingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showExpirationWarning, setShowExpirationWarning] = useState(false);
  const [expirationHoursLeft, setExpirationHoursLeft] = useState(0);

  const availableQuestionnaires = [
    {
      id: 'first_impression',
      title: 'Première impression',
      icon: '✨',
      description: 'Comment les autres te perçoivent',
      isFree: true
    },
    {
      id: 'astral',
      title: 'Thème astral',
      icon: '🔮',
      description: 'Ta carte natale complète',
      isPremiumFeatured: true
    },
    {
      id: 'attachment',
      title: 'Style d\'attachement',
      icon: '💕',
      description: 'Comment tu fonctionnes en relation'
    },
    {
      id: 'archetype',
      title: 'Archétype amoureux',
      icon: '👑',
      description: 'Ta personnalité profonde'
    },
  ];

  const staticStars = useMemo(() =>
    Array.from({ length: 200 }, (_, i) => ({
      id: i,
      width: Math.random() * 2.5 + 0.5,
      height: Math.random() * 2.5 + 0.5,
      top: Math.random() * 100,
      left: Math.random() * 100,
      opacity: Math.random() * 0.6 + 0.2,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 5
    })), []
  );

  const driftingStars = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      size: Math.random() * 6 + 3,
      left: Math.random() * 100,
      top: Math.random() * 100,
      opacity: Math.random() * 0.5 + 0.2,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10
    })), []
  );

  const shootingStars = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => {
      const sizeFactor = Math.random();
      return {
        id: i,
        startX: Math.random() * 120 - 10,
        startY: Math.random() * 100 - 20,
        delay: Math.random() * 8,
        duration: Math.random() * 3 + 2,
        size: sizeFactor * 3 + 1.5,
        trailLength: sizeFactor * 50 + 30,
        opacity: sizeFactor * 0.4 + 0.4
      };
    }), []
  );

  // Vérifier si la conversation actuelle est expirée
  const isCurrentConversationExpired = useMemo(() => {
    if (!currentConversationId) return false;
    const currentConv = conversations.find(c => c.id === currentConversationId);
    if (!currentConv || currentConv.subscription_tier !== 'free') return false;

    const lastMessageDate = new Date(currentConv.last_message_at);
    const hoursElapsed = (Date.now() - lastMessageDate.getTime()) / (1000 * 60 * 60);
    return hoursElapsed >= 24;
  }, [currentConversationId, conversations]);

  const handleScroll = () => {
    setIsUserScrolling(true);

    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current);
    }

    userScrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 150);
  };

  const scrollToBottom = (instant = false, force = false) => {
    if (!force && isUserScrolling) return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const doScroll = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: instant ? 'auto' : 'smooth',
          block: 'end'
        });
      }
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        doScroll();

        if (!instant) {
          setTimeout(doScroll, 50);
          setTimeout(doScroll, 150);
          setTimeout(doScroll, 300);
          scrollTimeoutRef.current = setTimeout(doScroll, 450);
        }
      });
    });
  };

  useEffect(() => {
    if (messages.length > 0 || isTyping) {
      scrollToBottom();
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages, isTyping]);

  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Charger le compteur de résultats
  useEffect(() => {
    const loadResultsCount = async () => {
      if (!user) return;

      try {
        const { count } = await supabase
          .from('quiz_results')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setResultsCount(count || 0);
      } catch (error) {
        console.error('Error loading results count:', error);
      }
    };

    loadResultsCount();
  }, [user]);

  // Charger ou créer une conversation par défaut
  useEffect(() => {
    const initConversation = async () => {
      if (!user) return;

      console.log('🔄 [AstraChat] Initialisation conversation...');
      setIsLoadingMessages(true);

      try {
        // Charger le tier
        const { data: profileData } = await supabase
          .from('astra_profiles')
          .select('premium_tier')
          .eq('id', user.id)
          .maybeSingle();

        const tier = (profileData?.premium_tier || 'free') as 'free' | 'premium' | 'premium_elite';
        setUserTier(tier);

        // Charger toutes les conversations
        const loadedConvs = await ConversationsService.loadConversations(user.id);
        console.log('✅ [AstraChat] Conversations chargées:', loadedConvs.length);

        if (loadedConvs.length > 0) {
          // Convertir pour le state local
          const convData: ConversationData[] = loadedConvs.map(conv => ({
            id: conv.id,
            title: conv.title,
            messages: conv.messages_data || [],
            createdAt: conv.created_at,
            updatedAt: conv.updated_at,
            subscription_tier: conv.subscription_tier,
            last_message_at: conv.last_message_at,
            expires_at: conv.expires_at
          }));

          setConversations(convData);
          setCurrentConversationId(convData[0].id);
          setMessages(convData[0].messages);
        } else {
          // Créer une nouvelle conversation
          console.log('✨ [AstraChat] Création nouvelle conversation...');
          const newConv = await ConversationsService.createConversation(user.id, tier);

          if (newConv) {
            const convData: ConversationData = {
              id: newConv.id,
              title: newConv.title,
              messages: newConv.messages_data || [],
              createdAt: newConv.created_at,
              updatedAt: newConv.updated_at,
              subscription_tier: newConv.subscription_tier,
              last_message_at: newConv.last_message_at,
              expires_at: newConv.expires_at
            };

            setConversations([convData]);
            setCurrentConversationId(convData.id);
            setMessages(convData.messages);
          }
        }
      } catch (err) {
        console.error('❌ [AstraChat] Exception initialisation:', err);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    initConversation();
  }, [user]);

  // Nettoyer les conversations expirées toutes les heures
  useEffect(() => {
    const cleanupInterval = setInterval(async () => {
      if (user) {
        await ConversationsService.cleanExpiredConversations();
        // Recharger les conversations
        const loadedConvs = await ConversationsService.loadConversations(user.id);
        const convData: ConversationData[] = loadedConvs.map(conv => ({
          id: conv.id,
          title: conv.title,
          messages: conv.messages_data || [],
          createdAt: conv.created_at,
          updatedAt: conv.updated_at,
          subscription_tier: conv.subscription_tier,
          last_message_at: conv.last_message_at,
          expires_at: conv.expires_at
        }));
        setConversations(convData);
      }
    }, 60 * 60 * 1000); // Toutes les heures

    return () => clearInterval(cleanupInterval);
  }, [user]);

  // Vérifier si une conversation va expirer (pour les utilisateurs gratuits)
  useEffect(() => {
    if (userTier !== 'free' || !currentConversationId) {
      setShowExpirationWarning(false);
      return;
    }

    const checkExpiration = () => {
      const currentConv = conversations.find(c => c.id === currentConversationId);
      if (!currentConv) return;

      const now = new Date();
      const lastMsg = new Date(currentConv.last_message_at);
      const hoursSinceLastMsg = (now.getTime() - lastMsg.getTime()) / (1000 * 60 * 60);
      const hoursLeft = Math.max(0, 24 - hoursSinceLastMsg);

      if (hoursLeft < 2 && hoursLeft > 0) {
        setShowExpirationWarning(true);
        setExpirationHoursLeft(Math.ceil(hoursLeft));
      } else {
        setShowExpirationWarning(false);
      }
    };

    checkExpiration();

    const checkInterval = setInterval(checkExpiration, 60 * 60 * 1000);

    return () => clearInterval(checkInterval);
  }, [userTier, currentConversationId, conversations]);

  const createNewConversation = async () => {
    if (!user) return;

    // Vérifier si l'utilisateur gratuit peut créer une nouvelle conversation
    const activeCount = await ConversationsService.checkActiveConversationsCount(user.id, userTier as any);

    if (userTier === 'free' && activeCount >= 1) {
      setShowLimitModal(true);
      return;
    }

    const newConv = await ConversationsService.createConversation(
      user.id,
      userTier as any,
      `Conversation ${conversations.length + 1}`
    );

    if (newConv) {
      const convData: ConversationData = {
        id: newConv.id,
        title: newConv.title,
        messages: newConv.messages_data || [],
        createdAt: newConv.created_at,
        updatedAt: newConv.updated_at,
        subscription_tier: newConv.subscription_tier,
        last_message_at: newConv.last_message_at,
        expires_at: newConv.expires_at
      };

      // Sauvegarder la conversation actuelle avant de changer
      if (currentConversationId) {
        await ConversationsService.updateConversationMessages(currentConversationId, messages);
      }

      setConversations([...conversations, convData]);
      setCurrentConversationId(convData.id);
      setMessages(convData.messages);
      setShowConversations(false);
    }
  };

  const switchConversation = async (convId: string) => {
    if (!currentConversationId) return;

    // Vérifier si la conversation cible est expirée (pour utilisateurs gratuits)
    const targetConv = conversations.find(c => c.id === convId);
    if (targetConv && targetConv.subscription_tier === 'free') {
      const lastMessageDate = new Date(targetConv.last_message_at);
      const hoursElapsed = (Date.now() - lastMessageDate.getTime()) / (1000 * 60 * 60);

      if (hoursElapsed >= 24) {
        // Conversation expirée, rediriger vers subscriptions
        onNavigate('/subscriptions');
        setShowConversations(false);
        return;
      }
    }

    // Sauvegarder les messages actuels
    await ConversationsService.updateConversationMessages(currentConversationId, messages);

    // Charger la nouvelle conversation
    const newConv = conversations.find(c => c.id === convId);
    if (newConv) {
      setCurrentConversationId(convId);
      setMessages(newConv.messages);
      setShowConversations(false);
    }
  };

  const deleteConversation = async (convId: string) => {
    if (conversations.length === 1) return;

    await ConversationsService.deleteConversation(convId);

    const filtered = conversations.filter(c => c.id !== convId);
    setConversations(filtered);

    if (currentConversationId === convId) {
      setCurrentConversationId(filtered[0].id);
      setMessages(filtered[0].messages);
    }
  };


  const startQuiz = () => {
    // Afficher le menu de sélection des questionnaires
    setShowQuizMenu(true);
    setShowConversations(false);
  };

  const selectQuestionnaire = (questionnaireId: string) => {
    setActiveQuestionnaireId(questionnaireId);
    setShowQuizMenu(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentConversationId || !user) return;

    if (isSendingRef.current) {
      console.log('⏸️ [AstraChat] Envoi déjà en cours, appel bloqué');
      return;
    }

    // Vérifier si la conversation actuelle est expirée
    const currentConv = conversations.find(c => c.id === currentConversationId);
    if (currentConv && currentConv.subscription_tier === 'free') {
      const lastMessageDate = new Date(currentConv.last_message_at);
      const hoursElapsed = (Date.now() - lastMessageDate.getTime()) / (1000 * 60 * 60);

      if (hoursElapsed >= 24) {
        // Conversation expirée, rediriger vers subscriptions
        onNavigate('/subscriptions');
        return;
      }
    }

    isSendingRef.current = true;
    setIsSending(true);

    if (remaining <= 0) {
      console.log('🚫 [AstraChat] Limite atteinte, affichage modal');
      setShowLimitModal(true);
      isSendingRef.current = false;
      setIsSending(false);
      return;
    }

    console.log('📤 [AstraChat] Envoi message...');

    const inputText = input;
    setInput('');
    inputRef.current?.blur();

    const userMsg: Message = {
      type: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    // 2. Sauvegarder les messages dans Supabase
    try {
      await ConversationsService.updateConversationMessages(currentConversationId, updatedMessages);
      console.log('✅ [AstraChat] Message utilisateur sauvegardé');
    } catch (err) {
      console.error('❌ [AstraChat] Erreur sauvegarde message user:', err);
    }

    // 3. Incrémenter le compteur
    try {
      await supabase.rpc('increment_astra_messages', { user_id_param: user.id });
      console.log('✅ [AstraChat] Compteur incrémenté');
      await checkLimit();
    } catch (err) {
      console.error('❌ [AstraChat] Erreur increment:', err);
    }

    // 4. Mettre à jour le titre de la conversation si premier message
    const userMessageCount = messages.filter(m => m.type === 'user').length;
    if (userMessageCount === 0) {
      try {
        await supabase
          .from('astra_conversations')
          .update({
            title: inputText.substring(0, 30) + (inputText.length > 30 ? '...' : ''),
            updated_at: new Date().toISOString()
          })
          .eq('id', currentConversationId);
        console.log('✅ [AstraChat] Titre conversation mis à jour');
      } catch (err) {
        console.error('❌ [AstraChat] Erreur update titre:', err);
      }
    }

    setIsTyping(true);

    try {
      // 5. Récupérer le profil et l'historique
      const { data: profileData } = await supabase
        .from('astra_profiles')
        .select('first_name, gender')
        .eq('id', user.id)
        .maybeSingle();

      const conversationHistory = [...messages, userMsg].map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      // 6. Appeler l'API Astra
      const { data, error } = await supabase.functions.invoke('astra-chat', {
        body: {
          messages: conversationHistory,
          profile: profileData,
          memory: null
        }
      });

      if (error) throw error;

      // 7. Créer et afficher la réponse Astra
      const astraMsg: Message = {
        type: 'astra',
        text: data.message || "Oups, j'ai eu un petit bug. Peux-tu réessayer ?",
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...updatedMessages, astraMsg];
      setMessages(finalMessages);

      // 8. Sauvegarder la réponse Astra en DB
      try {
        await ConversationsService.updateConversationMessages(currentConversationId, finalMessages);
        console.log('✅ [AstraChat] Réponse Astra sauvegardée');
      } catch (err) {
        console.error('❌ [AstraChat] Erreur sauvegarde réponse:', err);
      }
    } catch (error) {
      console.error('❌ [AstraChat] Error calling Astra:', error);

      const errorMsg: Message = {
        type: 'astra',
        text: "Oups, je réfléchis trop... 🤔",
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        error: true,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      isSendingRef.current = false; // Reset synchrone
      setIsSending(false);
    }
  };

  // Si un questionnaire est actif, afficher le composant PremiumQuestionnaireFlow
  if (activeQuestionnaireId) {
    return (
      <PremiumQuestionnaireFlow
        questionnaireId={activeQuestionnaireId}
        onBack={() => setActiveQuestionnaireId(null)}
      />
    );
  }

  // Afficher un loader pendant le chargement
  if (isLoadingMessages) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-sm">Chargement de la conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col astra-chat-container" style={{ height: '100dvh' }}>

      {/* FOND ÉTOILÉ IMMERSIF EN ARRIÈRE-PLAN */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        {/* Étoiles statiques blanches discrètes */}
        {staticStars.map((star) => (
          <div
            key={`star-${star.id}`}
            className="absolute rounded-full bg-white"
            style={{
              width: `${star.width}px`,
              height: `${star.height}px`,
              top: `${star.top}%`,
              left: `${star.left}%`,
              opacity: star.opacity,
              animation: `twinkle ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
              willChange: 'opacity'
            }}
          />
        ))}

        {/* Étoiles filantes cyan - effet immersif */}
        {shootingStars.map((star) => (
          <div
            key={`shooting-star-${star.id}`}
            className="absolute pointer-events-none"
            style={{
              left: `${star.startX}%`,
              top: `${star.startY}%`,
              animation: `diagonalStar ${star.duration}s linear infinite`,
              animationDelay: `${star.delay}s`,
              opacity: 0,
              willChange: 'transform, opacity'
            }}
          >
            <div
              className="relative"
              style={{
                transform: 'rotate(135deg)',
                transformOrigin: 'center',
                opacity: star.opacity
              }}
            >
              {/* Traînée EN ARRIÈRE */}
              <div
                className="absolute"
                style={{
                  right: `${star.size}px`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: `${star.trailLength}px`,
                  height: '1.5px',
                  background: 'linear-gradient(to left, rgba(0, 255, 255, 0.7), rgba(125, 249, 255, 0.4), rgba(0, 255, 255, 0.2), transparent)',
                  boxShadow: '0 0 6px rgba(0, 255, 255, 0.4)',
                  filter: 'blur(1px)',
                  pointerEvents: 'none'
                }}
              />
              {/* Tête lumineuse cyan EN AVANT */}
              <div
                className="rounded-full relative"
                style={{
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  background: '#00FFFF',
                  boxShadow: `
                    0 0 ${star.size * 1.5}px ${star.size * 0.5}px rgba(0, 255, 255, 0.6),
                    0 0 ${star.size * 3}px ${star.size}px rgba(0, 255, 255, 0.4),
                    0 0 ${star.size * 4}px ${star.size * 2}px rgba(0, 255, 255, 0.2)
                  `,
                  filter: 'blur(0.5px)'
                }}
              />
            </div>
          </div>
        ))}

        {/* Étoiles dérivantes */}
        {driftingStars.map((star) => (
          <div
            key={`drifting-${star.id}`}
            className="absolute"
            style={{
              fontSize: `${star.size}px`,
              left: `${star.left}%`,
              top: `${star.top}%`,
              opacity: star.opacity,
              animation: `drift ${star.duration}s linear infinite`,
              animationDelay: `${star.delay}s`,
              color: 'white'
            }}
          >
            ✦
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70"></div>
      </div>

      {/* HEADER COMPACT MOBILE */}
      <header className="flex-shrink-0 z-20 bg-black/95 backdrop-blur-xl border-b border-red-900/30 safe-area-inset-top">
        <div className="flex items-center justify-between px-3 py-2">
          <button
            onClick={() => setShowConversations(true)}
            className="w-9 h-9 bg-gray-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center border border-gray-700 active:bg-gray-800 transition active:scale-95"
          >
            <Menu className="w-4 h-4 text-white" />
          </button>

          <div className="flex items-center gap-2">
            <Star
              className="w-7 h-7 filter drop-shadow-[0_0_8px_#dc2626]"
              fill="#dc2626"
              strokeWidth={0}
            />
            <div>
              <h1 className="text-lg font-black bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent leading-tight">
                ASTRA
              </h1>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-green-400 font-medium">En ligne</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-900/60 border border-gray-700/50">
            <MessageCircle className={`w-3 h-3 ${
              remaining > limit * 0.5 ? 'text-green-400' : remaining > limit * 0.2 ? 'text-orange-400' : 'text-red-400'
            }`} />
            <span className={`text-xs font-bold ${
              remaining > limit * 0.5 ? 'text-green-400' : remaining > limit * 0.2 ? 'text-orange-400' : 'text-red-400'
            }`}>{remaining}</span>
          </div>
        </div>
      </header>

      {/* BANNIERES COMPACTES MOBILE */}
      {showExpirationWarning && (
        <div className="flex-shrink-0 mx-2 my-1 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/40">
          <p className="text-red-300 text-xs text-center">
            Expire dans {expirationHoursLeft}h - <button onClick={() => onNavigate('subscription')} className="underline font-bold">Premium</button>
          </p>
        </div>
      )}

      {userTier === 'free' && !showExpirationWarning && (
        <div className="flex-shrink-0 mx-2 my-1 px-3 py-2 rounded-lg bg-orange-500/15 border border-orange-500/30">
          <p className="text-orange-300 text-xs text-center">
            Historique 24h - <button onClick={() => onNavigate('subscription')} className="underline">Premium illimite</button>
          </p>
        </div>
      )}

      {userTier !== 'free' && (
        <div className="flex-shrink-0 mx-2 my-1 px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/30">
          <p className="text-red-300 text-xs text-center font-medium">Memoire permanente activee</p>
        </div>
      )}

      {/* ZONE MESSAGES - FLEX GROW */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden px-2 relative z-10 scrollbar-hide astra-messages-container"
        style={{
          minHeight: 0,
          paddingTop: '0.5rem',
          paddingBottom: 'calc(200px + env(safe-area-inset-bottom, 0px))',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y'
        }}
      >
        <div className="w-full max-w-2xl mx-auto space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                <Star className="w-10 h-10 text-white fill-white" />
              </div>
              <p className="text-gray-400 text-sm">Parlez avec Astra...</p>
            </div>
          ) : (
            messages.filter(msg => msg.text && msg.text.trim() !== '').map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.type === 'astra' ? (
                <div className="flex items-end gap-2 max-w-[85%]">
                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-red-500 fill-red-500" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className={`${msg.error ? 'bg-red-900/50 border border-red-500/30' : 'bg-red-600'} rounded-2xl rounded-bl-sm px-3 py-2`}>
                      <p className="text-white text-sm leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>
                      {msg.error && (
                        <button
                          onClick={() => {
                            setMessages(prev => prev.slice(0, -1));
                            if (!isSending) sendMessage();
                          }}
                          className="mt-1.5 px-2 py-1 bg-red-500/20 border border-red-500/40 rounded text-white text-[10px] font-medium"
                        >
                          Reessayer
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-600 mt-0.5 ml-2">{msg.time}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-end gap-2 max-w-[85%] flex-row-reverse">
                  <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[10px] font-bold">U</span>
                  </div>
                  <div className="flex flex-col items-end min-w-0">
                    <div className="bg-gray-800 rounded-2xl rounded-br-sm px-3 py-2">
                      <p className="text-gray-100 text-sm leading-relaxed break-words">{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-gray-600 mt-0.5 mr-2">{msg.time}</span>
                  </div>
                </div>
              )}
            </div>
          ))
          )}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2 max-w-[85%]">
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
                </div>
                <div className="bg-red-600 rounded-2xl rounded-bl-sm px-3 py-2">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} style={{ height: '20px' }} />
        </div>
      </div>

      {/* INPUT AREA - POSITIONNE AU DESSUS DE LA NAVBAR */}
      <div
        className="fixed left-0 right-0 z-20 px-3 bg-gradient-to-t from-black via-black/95 to-transparent pt-4 pb-2"
        style={{
          bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
        }}
      >
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Quick Replies compacts */}
          {messages.length <= 2 && !isCurrentConversationExpired && (
            <div className="flex gap-2 justify-center flex-wrap px-2">
              {[
                { text: "Astrologie", icon: "✨" },
                { text: "Rencontre", icon: "💘" },
                { text: "Compatibilite", icon: "🔮" }
              ].map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(reply.text);
                    setTimeout(() => {
                      if (!isSending) sendMessage();
                    }, 100);
                  }}
                  className="px-3 py-1.5 bg-gray-900/80 active:bg-red-900/50 border border-gray-700 active:border-red-500/50 rounded-full text-white text-xs font-medium transition-all active:scale-95 flex items-center gap-1"
                >
                  <span>{reply.icon}</span>
                  <span>{reply.text}</span>
                </button>
              ))}
            </div>
          )}

          {/* Zone de saisie */}
          <div className="relative">
            {isCurrentConversationExpired && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-full">
                <button
                  onClick={() => onNavigate('/subscriptions')}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 rounded-full text-white text-sm font-medium flex items-center gap-2"
                >
                  🔒 Conversation expirée - Upgrade
                </button>
              </div>
            )}
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={input}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setInput(e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && input.trim() && !isSending && !isCurrentConversationExpired) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={isCurrentConversationExpired ? "Conversation expirée..." : "Message..."}
              disabled={isCurrentConversationExpired}
              className="w-full bg-gray-900/95 backdrop-blur-xl border border-red-900/50 rounded-full text-white placeholder-gray-500 pl-4 pr-14 py-3 outline-none focus:border-red-500/70 disabled:opacity-50"
              style={{ fontSize: '16px' }}
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                if (!isSending && input.trim() && !isCurrentConversationExpired) {
                  sendMessage();
                }
              }}
              disabled={!input.trim() || isSending || isCurrentConversationExpired}
              style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)' }}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* SIDEBAR CONVERSATIONS AVEC RÉTENTION */}
      {showConversations && (
        <ConversationsSidebar
          conversations={conversations.map(c => ({
            id: c.id,
            title: c.title,
            last_message_at: c.last_message_at,
            subscription_tier: c.subscription_tier,
            expires_at: c.expires_at,
            messages_data: c.messages
          }))}
          currentConversationId={currentConversationId}
          userTier={userTier as any}
          onClose={() => setShowConversations(false)}
          onSelectConversation={switchConversation}
          onCreateNew={createNewConversation}
          onDeleteConversation={deleteConversation}
          onNavigate={onNavigate}
          resultsCount={resultsCount}
        />
      )}

      {/* MENU SÉLECTION QUESTIONNAIRE */}
      {showQuizMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowQuizMenu(false)}
          />

          {/* Menu */}
          <div className="relative w-full max-w-2xl mx-4 bg-gradient-to-b from-gray-900 to-black border border-red-500/20 rounded-2xl overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-red-500/20 flex items-center justify-between bg-gray-900/95 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <ClipboardList className="text-red-500" size={24} />
                <h2 className="text-white font-bold text-xl sm:text-2xl">Choisis ton quiz</h2>
              </div>
              <button
                onClick={() => setShowQuizMenu(false)}
                className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-all flex-shrink-0"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Liste des questionnaires */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto overflow-x-hidden">
              {availableQuestionnaires.map((quiz) => (
                <button
                  key={quiz.id}
                  onClick={() => selectQuestionnaire(quiz.id)}
                  className="w-full bg-gray-900/50 hover:bg-gray-800/80 border border-red-900/30 hover:border-red-500/50 rounded-xl p-4 sm:p-6 transition-all hover:scale-105 text-left relative overflow-hidden"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="text-4xl sm:text-5xl flex-shrink-0">{quiz.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-1">
                        <h3 className="text-white font-bold text-lg sm:text-xl mb-2">{quiz.title}</h3>
                        {(quiz.isFree || quiz.isPremiumFeatured) && (
                          <div className="mb-2">
                            {quiz.isFree && (
                              <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                                GRATUIT
                              </span>
                            )}
                            {quiz.isPremiumFeatured && (
                              <span className="inline-block px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/30 animate-pulse">
                                PREMIUM
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs sm:text-sm">{quiz.description}</p>
                    </div>
                    <div className="text-red-500 flex-shrink-0 mt-1">
                      <ArrowRight size={20} className="sm:w-6 sm:h-6" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL LIMITE ATTEINTE - MODERNE ET ANIMÉE */}
      {showLimitModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            animation: 'fadeIn 0.3s ease-out forwards'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLimitModal(false);
            }
          }}
        >
          {/* Backdrop avec blur */}
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            style={{
              animation: 'fadeIn 0.3s ease-out'
            }}
          />

          {/* Popup principale */}
          <div
            className="relative z-10 bg-gradient-to-br from-gray-900 via-gray-900 to-black rounded-3xl border border-red-500/40 max-w-md w-full p-6 sm:p-8"
            style={{
              animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              boxShadow: '0 0 60px rgba(239, 68, 68, 0.4), 0 20px 40px rgba(0, 0, 0, 0.6)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton fermer */}
            <button
              onClick={() => setShowLimitModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-all duration-300 hover:scale-125 hover:rotate-90"
            >
              <X size={24} />
            </button>

            {/* Icône avec glow et animations */}
            <div className="text-center mb-6">
              <div className="relative w-24 h-24 mx-auto mb-6">
                {/* Glow animé */}
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 via-pink-500 to-rose-500 blur-2xl opacity-70"
                  style={{
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  }}
                />
                {/* Icône principale avec bounce */}
                <div
                  className="relative w-24 h-24 rounded-full bg-gradient-to-br from-red-500 via-pink-500 to-rose-500 flex items-center justify-center"
                  style={{
                    animation: 'bounce 1s ease-in-out infinite, pulse 2s ease-in-out infinite',
                    boxShadow: '0 0 40px rgba(239, 68, 68, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <MessageCircle className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Titre avec shake et fade-in */}
              <h3
                className="text-3xl sm:text-4xl font-bold text-white mb-3 bg-gradient-to-r from-red-400 via-pink-400 to-rose-400 bg-clip-text text-transparent"
                style={{
                  animation: 'shake-fade-in 0.6s ease-out forwards'
                }}
              >
                Limite atteinte
              </h3>
              <p className="text-gray-300 text-base sm:text-lg">
                Vous avez utilisé tous vos messages gratuits avec Astra aujourd'hui.
              </p>
            </div>

            {/* Tableau plan avec glassmorphism et slide-up */}
            <div
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 mb-6 border border-white/20"
              style={{
                animation: 'slideUp 0.5s ease-out 0.2s forwards',
                opacity: 0,
                boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.05)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-300 font-medium">Plan actuel</span>
                <span className="text-white font-bold text-lg bg-gradient-to-r from-gray-600 to-gray-700 px-3 py-1 rounded-lg">
                  Gratuit
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 font-medium">Messages/jour</span>
                <span className="text-red-400 font-bold text-2xl">{limit}</span>
              </div>
            </div>

            {/* Boutons avec effets */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowLimitModal(false);
                  onNavigate('subscription');
                }}
                className="group w-full bg-gradient-to-r from-pink-500 via-red-500 to-rose-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 relative overflow-hidden"
                style={{
                  boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(239, 68, 68, 0.8), 0 8px 30px rgba(239, 68, 68, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(239, 68, 68, 0.4)';
                }}
              >
                {/* Effet de brillance au hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2">
                  <Star className="w-5 h-5" />
                  Passer Premium
                </span>
              </button>

              <button
                onClick={() => setShowLimitModal(false)}
                className="w-full bg-white/5 backdrop-blur-sm text-white font-medium py-3 px-6 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/30"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Peut-être plus tard
              </button>
            </div>

            {/* Message de réinitialisation */}
            <p
              className="text-center text-gray-400 text-sm mt-5"
              style={{
                animation: 'fadeIn 0.5s ease-out 0.4s forwards',
                opacity: 0
              }}
            >
              Vos messages sont réinitialisés chaque jour à minuit
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
