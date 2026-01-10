import { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Lock, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PremiumCounter from '../PremiumCounter';
import { getUserLimits } from '../../lib/subscriptionLimits';

interface AstraChatProps {
  currentUserProfile: any;
  onBack?: () => void;
  onProfileUpdate?: () => void; // Callback pour recharger le profil parent
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export default function AstraChat({ currentUserProfile, onBack, onProfileUpdate }: AstraChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messagesUsed, setMessagesUsed] = useState(currentUserProfile?.daily_astra_messages || 0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [resetAt] = useState<Date>(new Date(Date.now() + 24 * 60 * 60 * 1000));

  const premiumTier = currentUserProfile?.premium_tier || 'free';
  const limits = getUserLimits(premiumTier);
  const messagesLimit = limits.astraMessagesPerDay;
  const canSendMessage = messagesUsed < messagesLimit;
  const isPremium = premiumTier !== 'free';

  useEffect(() => {
    console.log('=== DEBUG ASTRA INIT ===');
    console.log('currentUserProfile:', currentUserProfile);
    console.log('daily_astra_messages:', currentUserProfile?.daily_astra_messages);
    console.log('premium_tier:', currentUserProfile?.premium_tier);

    loadAstraHistory();
    loadMessagesCounter();
  }, []);

  // Recharger le compteur quand le profil change
  useEffect(() => {
    if (currentUserProfile?.daily_astra_messages !== undefined) {
      console.log('🔄 [Astra] Profil mis à jour, nouveau compteur:', currentUserProfile.daily_astra_messages);
      setMessagesUsed(currentUserProfile.daily_astra_messages);
    }
  }, [currentUserProfile?.daily_astra_messages]);

  const loadMessagesCounter = async () => {
    const { data } = await supabase
      .from('astra_profiles')
      .select('daily_astra_messages')
      .eq('id', currentUserProfile.id)
      .maybeSingle();

    if (data) {
      setMessagesUsed(data.daily_astra_messages || 0);
    }
  };

  // Fonction séparée pour mettre à jour le compteur en DB de manière atomique
  const updateAstraCounter = async (expectedCount: number) => {
    try {
      console.log('💾 [Astra] Incrémentation atomique en DB...');

      // Utiliser la fonction RPC atomique pour éviter les race conditions
      const { data, error } = await supabase
        .rpc('increment_astra_messages', { user_id_param: currentUserProfile.id });

      if (error) {
        console.error('❌ [Astra] Erreur increment RPC:', error);
        // Fallback: update classique
        await supabase
          .from('astra_profiles')
          .update({ daily_astra_messages: expectedCount })
          .eq('id', currentUserProfile.id);
      } else {
        console.log('✅ [Astra] Compteur incrémenté en DB (RPC):', data);
      }

      // Notifier le parent pour recharger le profil
      if (onProfileUpdate) {
        console.log('📢 [Astra] Notification parent pour recharger profil');
        onProfileUpdate();
      }
    } catch (error) {
      console.error('❌ [Astra] Exception increment compteur:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadAstraHistory = async () => {
    const { data } = await supabase
      .from('astra_messages')
      .select('*')
      .eq('conversation_id', currentUserProfile.id)
      .order('created_at', { ascending: true })
      .limit(100);

    if (data) {
      setMessages(data);
    }
  };

  const sendAstraMessage = async () => {
    if (!newMessage.trim() || loading) return;

    // Vérifier la limite AVANT d'envoyer
    console.log('🔍 [Astra] Compteur avant envoi:', messagesUsed, '/', messagesLimit);

    if (!canSendMessage) {
      alert(`⚠️ Tu as atteint ta limite de ${messagesLimit} messages Astra aujourd'hui !\n\nPasse Premium pour 40 messages/jour ou Elite pour 65 messages/jour.`);
      return;
    }

    const userMsg = newMessage.trim();
    setNewMessage('');
    setLoading(true);

    // 🔥 INCRÉMENTER IMMÉDIATEMENT (avant l'envoi API)
    const newCount = messagesUsed + 1;
    console.log('✅ [Astra] Incrémentation immédiate:', newCount);

    // Mettre à jour le STATE LOCAL immédiatement
    setMessagesUsed(newCount);

    // Mettre à jour la BASE DE DONNÉES immédiatement (en parallèle, pas bloquant)
    updateAstraCounter(newCount);

    const userMessage = {
      role: 'user' as const,
      content: userMsg,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      await supabase.from('astra_messages').insert({
        conversation_id: currentUserProfile.id,
        role: 'user',
        content: userMsg,
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/astra-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            user_id: currentUserProfile.id,
            message: userMsg,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'envoi du message');
      }

      const data = await response.json();

      const assistantMessage = {
        role: 'assistant' as const,
        content: data.response,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      await supabase.from('astra_messages').insert({
        conversation_id: currentUserProfile.id,
        role: 'assistant',
        content: data.response,
      });

      console.log('✅ [Astra] Réponse reçue. Compteur actuel:', messagesUsed);

      // Vérifier si limite atteinte (le compteur a déjà été incrémenté)
      if (messagesUsed >= messagesLimit) {
        setTimeout(() => {
          alert(`✨ Tu as utilisé tes ${messagesLimit} messages Astra du jour !\n\n${premiumTier === 'free' ? 'Passe Premium pour 40 messages/jour ou Elite pour 65 messages/jour.' : premiumTier === 'premium' ? 'Passe Elite pour 65 messages/jour !' : 'Reviens demain pour plus de messages !'}`);
        }, 500);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Désolé, une erreur est survenue. Réessayez plus tard.',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* DEBUG COUNTER - À retirer après tests */}
      <div className="fixed bottom-4 left-4 bg-red-600 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-50 font-mono">
        🔍 DEBUG: {messagesUsed}/{messagesLimit} messages
      </div>

      <div className="bg-gradient-to-r from-red-600 to-red-700 border-b border-red-900/30 p-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 hover:bg-red-700/50 rounded-full transition"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
          )}
          <Sparkles className="text-white" size={24} />
          <div className="flex-1">
            <p className="text-white font-bold">Astra - IA</p>
            <p className="text-white/80 text-xs">Votre assistant relationnel</p>
          </div>
        </div>
        <div className="space-y-2">
          <PremiumCounter
            current={messagesUsed}
            limit={messagesLimit}
            isPremium={isPremium}
            type="astra"
            resetAt={resetAt}
            className="bg-red-800/40"
          />
          {messagesUsed >= messagesLimit - 3 && messagesUsed < messagesLimit && (
            <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg px-3 py-2 text-center">
              <span className="text-orange-400 text-xs font-medium">
                ⚠️ Plus que {messagesLimit - messagesUsed} message{messagesLimit - messagesUsed > 1 ? 's' : ''} disponible{messagesLimit - messagesUsed > 1 ? 's' : ''} aujourd'hui !
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <Sparkles className="mx-auto mb-4" size={48} />
            <p className="text-lg font-bold text-white mb-2">Bienvenue sur Astra !</p>
            <p className="text-sm">
              Je suis votre assistant IA dédié aux relations. Posez-moi toutes vos questions.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-md px-4 py-3 rounded-2xl ${
                msg.role === 'user' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-md px-4 py-3 rounded-2xl bg-gray-800 text-white">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-75" />
                <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-150" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-gray-900 border-t border-red-900/30 p-4 flex-shrink-0">
        {!canSendMessage ? (
          <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-4 text-center">
            <Lock className="mx-auto text-red-500 mb-2" size={32} />
            <p className="text-white font-bold mb-1">Limite atteinte</p>
            <p className="text-gray-300 text-sm mb-3">
              Premium : 40 messages/jour • Elite : 65 messages/jour
            </p>
            <button
              onClick={() => window.location.href = '/premium'}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all"
            >
              Voir Premium - 9,99€/mois
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendAstraMessage()}
              placeholder="Posez votre question à Astra..."
              disabled={loading}
              className="flex-1 bg-black border border-gray-800 focus:border-red-600 rounded-lg px-4 py-3 text-white outline-none"
            />
            <button
              onClick={sendAstraMessage}
              disabled={loading || !newMessage.trim()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
