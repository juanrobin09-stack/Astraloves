import { X } from 'lucide-react';
import { vibrate } from '../utils/mobileUtils';

interface UpgradePopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  feature: string;
  plans: ('premium' | 'premium_elite')[];
  onNavigate?: (page: string) => void;
}

export default function UpgradePopup({ isOpen, onClose, title, message, feature, plans, onNavigate }: UpgradePopupProps) {
  if (!isOpen) return null;

  const handleNavigate = () => {
    vibrate.light();
    onClose();
    if (onNavigate) {
      onNavigate('premium');
    } else {
      window.location.href = '/';
    }
  };

  const handleClose = () => {
    vibrate.light();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl sm:rounded-2xl max-w-sm w-full p-5 sm:p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-white transition min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-5">
          <div className="text-4xl mb-2">🚀</div>
          <h2 className="text-lg sm:text-xl font-bold mb-2">{title}</h2>
          <p className="text-gray-400 text-xs sm:text-sm">{message}</p>
        </div>

        <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg p-3 sm:p-4 mb-5 border border-pink-500/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">✨</span>
            <span className="font-bold text-white text-sm">{feature}</span>
          </div>
          <p className="text-xs text-gray-300">
            {plans.includes('premium_elite')
              ? plans.length === 1
                ? "Disponible avec Premium+ Elite"
                : "Disponible avec Premium ou Elite"
              : "Disponible avec Premium"}
          </p>
        </div>

        <div className="space-y-2.5">
          {plans.includes('premium') && (
            <button
              onClick={handleNavigate}
              className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-bold hover:opacity-90 transition active:scale-95 min-h-[44px] text-sm"
            >
              Voir Premium (9,99€/mois)
            </button>
          )}

          {plans.includes('premium_elite') && (
            <button
              onClick={handleNavigate}
              className="w-full py-2.5 bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 rounded-full font-bold hover:opacity-90 transition active:scale-95 min-h-[44px] text-sm"
            >
              Voir Elite (14,99€/mois)
            </button>
          )}

          <button
            onClick={handleClose}
            className="w-full py-2.5 bg-gray-800 rounded-full font-bold hover:bg-gray-700 transition active:scale-95 min-h-[44px] text-sm"
          >
            Peut-être plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
