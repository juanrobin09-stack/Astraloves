import { X } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  onUpgrade: () => void;
}

export default function UpgradeModal({ isOpen, onClose, message, onUpgrade }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gradient-to-br from-gray-900 to-black border border-red-500/30 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-white text-xl font-bold mb-2">Fonctionnalité Premium</h3>
          <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              onClose();
              onUpgrade();
            }}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 rounded-xl text-white font-bold transition-all hover:scale-105 shadow-lg shadow-red-500/30"
          >
            Voir les offres Premium
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 font-medium transition-all"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
