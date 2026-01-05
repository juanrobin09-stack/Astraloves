import { ArrowLeft, Check, X, Crown, Sparkles, MessageSquare, Heart, FileText, Eye, EyeOff, Star, Settings, ClipboardList, Brain, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getMessageCounterStatus } from '../lib/messageCounter';

interface PremiumPageProps {
  onBack: () => void;
  onSubscribe: () => void;
  onNavigate?: (page: string) => void;
}

interface MessageCounterStatus {
  current: number;
  limit: number;
  remaining: number;
  is_premium: boolean;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="bg-gray-800 rounded-lg p-4 flex items-start gap-4">
    <div className="flex-shrink-0">{icon}</div>
    <div>
      <h4 className="text-white font-bold mb-1">{title}</h4>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  </div>
);

export default function PremiumPage({ onBack, onSubscribe, onNavigate }: PremiumPageProps) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [premiumUntil, setPremiumUntil] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageStatus, setMessageStatus] = useState<MessageCounterStatus | null>(null);
  const [invisibleMode, setInvisibleMode] = useState(false);

  useEffect(() => {
    const loadPremiumStatus = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('astra_profiles')
        .select('is_premium, premium_until')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setIsPremium(data.is_premium || false);
        setPremiumUntil(data.premium_until);
      }

      const msgStatus = await getMessageCounterStatus(user.id);
      setMessageStatus(msgStatus as MessageCounterStatus);

      setLoading(false);
    };

    loadPremiumStatus();

    if (user) {
      const subscription = supabase
        .channel('premium_status_updates')
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'astra_profiles', filter: `id=eq.${user.id}` },
          (payload) => {
            if (payload.new && 'is_premium' in payload.new) {
              setIsPremium(payload.new.is_premium || false);
              setPremiumUntil(payload.new.premium_until || null);
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen velvet-bg flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  if (isPremium) {
    const daysRemaining = premiumUntil
      ? Math.ceil((new Date(premiumUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const formattedDate = premiumUntil
      ? new Date(premiumUntil).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      : 'Indéterminée';

    return (
      <div className="min-h-screen velvet-bg relative overflow-hidden pb-24">
        <div className="stars-bg absolute inset-0 opacity-30" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={onBack}
            className="mb-6 text-white/80 hover:text-white flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>

          <div className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 rounded-xl p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Crown className="text-white" size={40} />
                <div>
                  <h2 className="text-2xl font-bold text-white">Vous êtes Premium</h2>
                  <p className="text-yellow-100">Statut actif</p>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
                <p className="text-white text-sm">Encore {daysRemaining} jours</p>
              </div>
            </div>
            <p className="text-white text-sm">
              Valide jusqu'au {formattedDate}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Messages aujourd'hui</span>
                <MessageSquare size={16} className="text-blue-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">
                  {messageStatus?.current || 0}
                </span>
                <span className="text-gray-400">/ {messageStatus?.limit || 40}</span>
              </div>
              <div className="mt-2 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${messageStatus ? (messageStatus.current / messageStatus.limit) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Swipes aujourd'hui</span>
                <Heart size={16} className="text-pink-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">0</span>
                <span className="text-green-400">illimités ♾️</span>
              </div>
              <div className="mt-2 bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-full" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-white font-bold text-lg mb-4">Vos avantages actifs</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-green-400">
                <Check size={20} className="flex-shrink-0" />
                <span>Questionnaires de compatibilité débloqués</span>
              </div>
              <div className="flex items-center gap-3 text-green-400">
                <Check size={20} className="flex-shrink-0" />
                <span>40 messages par 24h (reset glissant)</span>
              </div>
              <div className="flex items-center gap-3 text-green-400">
                <Check size={20} className="flex-shrink-0" />
                <span>Tous les questionnaires + résultats sauvegardés</span>
              </div>
              <div className="flex items-center gap-3 text-green-400">
                <Check size={20} className="flex-shrink-0" />
                <span>Style d'attachement • Archétype • Thème astral complet</span>
              </div>
              <div className="flex items-center gap-3 text-green-400">
                <Check size={20} className="flex-shrink-0" />
                <span>Analyse de sentiment poussée & mémoire totale</span>
              </div>
              <div className="flex items-center gap-3 text-green-400">
                <Check size={20} className="flex-shrink-0" />
                <span>Badge Premium + profil prioritaire</span>
              </div>
              <div className="flex items-center gap-3 text-green-400">
                <Check size={20} className="flex-shrink-0" />
                <span>Voir tous les likes reçus</span>
              </div>
              <div className="flex items-center gap-3 text-green-400">
                <Check size={20} className="flex-shrink-0" />
                <span>Swipes illimités</span>
              </div>
              <div className="flex items-center gap-3 text-green-400">
                <Check size={20} className="flex-shrink-0" />
                <span>Analyses IA illimitées</span>
              </div>
              <div className="flex items-center gap-3 text-green-400">
                <Check size={20} className="flex-shrink-0" />
                <span>Mémoire conversationnelle complète avec Astra</span>
              </div>
              <div className="flex items-center gap-3 text-green-400">
                <Check size={20} className="flex-shrink-0" />
                <span>Mode navigation invisible</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-white font-bold text-lg mb-4">Paramètres Premium</h3>

            <div className="flex items-center justify-between mb-4 p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <EyeOff className="text-purple-400" size={24} />
                <div>
                  <p className="text-white font-medium">Mode navigation invisible</p>
                  <p className="text-gray-400 text-sm">Naviguez sans laisser de traces de visite</p>
                </div>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  checked={invisibleMode}
                  onChange={(e) => setInvisibleMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Star className="text-yellow-400" size={24} />
                <div>
                  <p className="text-white font-medium">Profil prioritaire</p>
                  <p className="text-gray-400 text-sm">Apparaissez en premier dans les suggestions</p>
                </div>
              </div>
              <Check className="text-green-400" size={24} />
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onNavigate?.('settings')}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition"
            >
              Gérer mon abonnement
            </button>
            <button
              className="w-full border border-gray-600 hover:bg-gray-800 text-white py-3 rounded-lg font-medium transition"
            >
              Contacter le support Premium
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen velvet-bg relative overflow-hidden pb-24">
      <div className="stars-bg absolute inset-0 opacity-30" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="mb-6 text-white/80 hover:text-white flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>

        <div className="bg-gradient-to-br from-yellow-500 via-pink-500 to-red-500 rounded-xl p-8 text-center mb-8">
          <Crown className="mx-auto text-white mb-4" size={64} />
          <h1 className="text-3xl font-bold text-white mb-2">Passez à Premium</h1>
          <p className="text-white/90 text-lg">Débloquez toutes les fonctionnalités d'Astra</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-8 rounded-3xl shadow-2xl text-white border-4 border-orange-400 mb-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold">👑</span>
            </div>
            <h3 className="text-3xl font-black mb-2">Premium</h3>
            <div className="text-4xl font-black mb-6">9,99€</div>
            <div className="text-lg opacity-90 mb-8">/mois</div>
          </div>

          <ul className="space-y-3 mb-8 text-left">
            <li className="flex items-center">
              <span className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center mr-3 font-bold">✓</span>
              Swipes ILLIMITÉS
            </li>
            <li className="flex items-center">
              <span className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center mr-3 font-bold">✓</span>
              40 messages/jour AVEC chat Astra
            </li>
            <li className="flex items-center">
              <span className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center mr-3 font-bold">✓</span>
              Messages matchs ILLIMITÉS
            </li>
            <li className="flex items-center">
              <span className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center mr-3 font-bold">✓</span>
              IA Boost x3 visibilité
            </li>
            <li className="flex items-center">
              <span className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center mr-3 font-bold">✓</span>
              Matchs 92% compatibilité
            </li>
            <li className="flex items-center">
              <span className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center mr-3 font-bold">✓</span>
              Conseils profil IA
            </li>
            <li className="flex items-center">
              <span className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center mr-3 font-bold">✓</span>
              Messages optimisés par IA
            </li>
          </ul>

          <a
            href="https://buy.stripe.com/bIe28s83xcdi7xObRXgw000"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-white text-orange-600 text-xl font-black py-4 px-8 rounded-2xl text-center shadow-2xl hover:shadow-3xl hover:scale-105 transform transition-all duration-300 border-4 border-white/50"
          >
            🔥 COMMENCER MAINTENANT
          </a>
        </div>
      </div>
    </div>
  );
}
