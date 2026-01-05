import { X, Crown, Check, AlertCircle } from 'lucide-react';

interface Feature {
  text: string;
  available: boolean;
}

interface PremiumUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  title: string;
  context: 'messages' | 'swipes' | 'friends' | 'questionnaires' | 'analytics';
  currentUsage?: {
    current: number;
    limit: number;
    resetIn?: string;
  };
}

export default function PremiumUpsellModal({
  isOpen,
  onClose,
  onUpgrade,
  title,
  context,
  currentUsage,
}: PremiumUpsellModalProps) {
  if (!isOpen) return null;

  const getContextDetails = () => {
    switch (context) {
      case 'messages':
        return {
          icon: '💬',
          freeFeatures: [
            { text: '5 messages par jour', available: false },
            { text: 'Historique des 5 derniers messages', available: false },
            { text: 'Chat basique', available: false },
          ],
          premiumFeatures: [
            { text: '30 messages par 24h (reset glissant)', available: true },
            { text: 'Chat temps réel avec "en train d\'écrire..."', available: true },
            { text: 'Historique complet illimité', available: true },
            { text: 'Analyse de sentiment poussée', available: true },
            { text: 'Mémoire totale de vos conversations', available: true },
            { text: 'Badge Premium 💎 visible', available: true },
          ],
          tagline: 'Discutez sans limite et en toute fluidité',
        };

      case 'swipes':
        return {
          icon: '❤️',
          freeFeatures: [
            { text: '5 swipes par jour', available: false },
            { text: '3 analyses IA par jour', available: false },
            { text: 'Voir 3 personnes qui vous ont liké', available: false },
          ],
          premiumFeatures: [
            { text: 'Swipes illimités', available: true },
            { text: 'Analyses IA illimitées (OpenAI GPT-4o)', available: true },
            { text: 'Système de matching intelligent avec score', available: true },
            { text: 'Voir TOUS les likes reçus', available: true },
            { text: 'Profil prioritaire dans les résultats', available: true },
            { text: 'Mode invisible (navigation anonyme)', available: true },
            { text: 'Statistiques détaillées de compatibilité', available: true },
          ],
          tagline: 'Trouvez votre âme sœur plus rapidement',
        };

      case 'friends':
        return {
          icon: '👥',
          freeFeatures: [
            { text: '5 demandes d\'amis par jour', available: false },
            { text: 'Gestion basique des demandes', available: false },
          ],
          premiumFeatures: [
            { text: 'Ajout d\'amis illimité par pseudo', available: true },
            { text: 'Statut en ligne/hors ligne des amis', available: true },
            { text: 'Recherche avancée d\'amis', available: true },
            { text: 'Notifications en temps réel', available: true },
            { text: 'Gestion complète des demandes', available: true },
          ],
          tagline: 'Construisez votre réseau sans limites',
        };

      case 'questionnaires':
        return {
          icon: '📝',
          freeFeatures: [
            { text: 'Questionnaire de base uniquement', available: false },
          ],
          premiumFeatures: [
            { text: 'Tous les questionnaires + résultats sauvegardés', available: true },
            { text: '  • Style d\'attachement (anxieux/évitant/sécure)', available: true },
            { text: '  • Archétype amoureux (romantique/passionné)', available: true },
            { text: '  • Thème astral complet avec carte natale', available: true },
            { text: 'Analyses détaillées par l\'IA (OpenAI)', available: true },
            { text: 'Conseils personnalisés basés sur vos réponses', available: true },
            { text: 'Comparaison de compatibilité avec vos matchs', available: true },
          ],
          tagline: 'Découvrez qui vous êtes vraiment',
        };

      case 'analytics':
        return {
          icon: '📊',
          freeFeatures: [
            { text: '3 analyses IA par jour', available: false },
            { text: 'Analyse de base', available: false },
          ],
          premiumFeatures: [
            { text: 'Analyses IA illimitées (OpenAI GPT-4o)', available: true },
            { text: 'Analyses approfondies et détaillées', available: true },
            { text: 'Score de compatibilité précis', available: true },
            { text: 'Conseils relationnels personnalisés', available: true },
          ],
          tagline: 'Des analyses illimitées pour mieux comprendre',
        };

      default:
        return {
          icon: '💎',
          freeFeatures: [],
          premiumFeatures: [],
          tagline: 'L\'expérience complète Astra',
        };
    }
  };

  const details = getContextDetails();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl border-2 border-yellow-600/50 p-6 max-w-2xl w-full my-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-full flex items-center justify-center text-2xl">
              {details.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <p className="text-gray-400 text-sm">{details.tagline}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {currentUsage && (
          <div className="bg-red-900/20 border border-red-600/50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium mb-1">
                  Limite atteinte ({currentUsage.current}/{currentUsage.limit})
                </p>
                {currentUsage.resetIn && (
                  <p className="text-gray-400 text-sm">
                    Prochain reset dans {currentUsage.resetIn}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-lg">
                🆓
              </div>
              <h3 className="text-lg font-bold text-white">Gratuit</h3>
            </div>
            <div className="space-y-2.5">
              {details.freeFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400 text-sm line-through">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/30 via-orange-900/30 to-red-900/30 rounded-xl border-2 border-yellow-600/50 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-600/20 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-full flex items-center justify-center">
                  <Crown className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Premium</h3>
              </div>
              <div className="space-y-2.5 mb-4">
                {details.premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white text-sm font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
              <div className="text-center pt-3 border-t border-yellow-600/30">
                <p className="text-2xl font-bold text-white mb-1">9,99€<span className="text-base text-gray-300">/mois</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl border border-indigo-600/30 p-4 mb-6">
          <p className="text-white text-center text-sm">
            ✨ <span className="font-semibold">L'expérience complète, sans limite et sans attente.</span>
          </p>
          <p className="text-gray-400 text-center text-xs mt-2">
            Résiliation à tout moment • Instantanée • Zéro frais
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-all"
          >
            Plus tard
          </button>
          <button
            onClick={() => {
              onUpgrade();
              onClose();
            }}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Crown className="w-5 h-5" />
            Devenir Premium - 9,99€/mois
          </button>
        </div>

        <p className="text-center text-gray-500 text-xs mt-4">
          🔒 Paiement sécurisé par Stripe
        </p>
      </div>
    </div>
  );
}
