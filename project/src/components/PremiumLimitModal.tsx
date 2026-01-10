import { X, Crown, MessageCircle, Heart, Zap, Users } from 'lucide-react';

interface PremiumLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'privateMessages' | 'astraMessages' | 'swipes' | 'analyses' | 'friendRequests';
  currentCount: number;
  maxCount: number;
  resetIn?: string;
}

const LIMIT_INFO = {
  privateMessages: {
    icon: MessageCircle,
    title: 'Messages privés',
    premiumLimit: '10 messages/24h',
  },
  astraMessages: {
    icon: Zap,
    title: 'Messages Astra IA',
    premiumLimit: 'Messages illimités',
  },
  swipes: {
    icon: Heart,
    title: 'Swipes',
    premiumLimit: 'Swipes illimités',
  },
  analyses: {
    icon: Zap,
    title: 'Analyses',
    premiumLimit: 'Analyses illimitées',
  },
  friendRequests: {
    icon: Users,
    title: 'Demandes d\'ami',
    premiumLimit: 'Demandes illimitées',
  },
};

export default function PremiumLimitModal({
  isOpen,
  onClose,
  limitType,
  currentCount,
  maxCount,
  resetIn = '6h23',
}: PremiumLimitModalProps) {
  if (!isOpen) return null;

  const info = LIMIT_INFO[limitType];
  const Icon = info.icon;

  return (
    <div className="modal-mobile" onClick={onClose}>
      <div className="modal-content-mobile" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 rounded-full bg-[#252525] border border-[#2a2a2a] text-gray-400 hover:bg-[#2a2a2a] hover:border-red-500 hover:text-red-500 transition-transform active:scale-95 flex items-center justify-center"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/30 mb-4">
            <Icon className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Limite atteinte</h2>
          <p className="text-gray-400 text-sm">Tu as utilisé toutes tes ressources gratuites</p>
        </div>

        <div className="bg-[#252525] border border-[#2a2a2a] rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">{info.title}</span>
            <span className="text-red-400 font-bold">
              {currentCount}/{maxCount}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-red-500 to-red-600 h-full transition-all"
              style={{ width: `${(currentCount / maxCount) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Prochain reset dans {resetIn}</p>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-purple-500/10 border border-red-500/30 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-bold text-white">Avec Premium</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-gray-300 text-sm">{info.premiumLimit}</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-gray-300 text-sm">Tous les questionnaires débloqués</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-gray-300 text-sm">Analyses de compatibilité illimitées</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-gray-300 text-sm">Badge exclusif sur ton profil</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => (window.location.href = '/premium')}
          className="w-full h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-2xl transition-all mb-3 flex items-center justify-center gap-2"
        >
          <Crown className="w-5 h-5" />
          Passer Premium - 9,99€/mois
        </button>

        <button
          onClick={onClose}
          className="w-full h-12 bg-[#252525] border border-[#2a2a2a] text-gray-400 hover:text-white font-medium rounded-2xl transition-all"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}
