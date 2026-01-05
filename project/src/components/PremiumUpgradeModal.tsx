import { X, Crown, Sparkles } from 'lucide-react';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  feature?: string;
  onUpgrade: () => void;
}

export default function PremiumUpgradeModal({
  isOpen,
  onClose,
  title = 'Limite atteinte',
  message,
  feature,
  onUpgrade
}: PremiumUpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl p-6 max-w-md w-full border-2 border-red-600/50 shadow-2xl shadow-red-600/20 animate-scaleIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full mb-4 animate-pulse">
            <Crown className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
        </div>

        {feature && (
          <div className="bg-black/30 rounded-xl p-4 mb-6 border border-red-600/30">
            <p className="text-red-400 text-sm font-medium flex items-center gap-2">
              <Sparkles size={16} />
              {feature}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
          >
            <Crown size={20} />
            Devenir Premium 💎
          </button>

          <button
            onClick={onClose}
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl transition-all"
          >
            Peut-être plus tard
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-500 text-xs">
            À partir de 9,99€/mois • Sans engagement
          </p>
        </div>
      </div>
    </div>
  );
}
