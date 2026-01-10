import { useState, useEffect } from 'react';
import { Zap, Clock, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getBoostStatus, activateBoost, canUseBoost, BoostStatus } from '../lib/profileBoost';

interface ProfileBoostButtonProps {
  onNavigateToPremium?: () => void;
}

export default function ProfileBoostButton({ onNavigateToPremium }: ProfileBoostButtonProps) {
  const { user } = useAuth();
  const [boostStatus, setBoostStatus] = useState<BoostStatus>({
    isActive: false,
    endsAt: null,
    remainingMinutes: 0
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadBoostStatus();
      const interval = setInterval(loadBoostStatus, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadBoostStatus = async () => {
    if (!user) return;
    const status = await getBoostStatus(user.id);
    setBoostStatus(status);
  };

  const handleBoost = async () => {
    if (!user) return;

    setLoading(true);
    setErrorMessage('');

    const { canUse, reason } = await canUseBoost(user.id);

    if (!canUse) {
      setErrorMessage(reason || 'Impossible d\'activer le boost');
      setLoading(false);
      if (reason?.includes('Premium')) {
        setTimeout(() => {
          setShowModal(false);
          onNavigateToPremium?.();
        }, 2000);
      }
      return;
    }

    const success = await activateBoost(user.id, 30);

    if (success) {
      await loadBoostStatus();
      setShowModal(false);
    } else {
      setErrorMessage('Erreur lors de l\'activation du boost');
    }

    setLoading(false);
  };

  if (boostStatus.isActive) {
    return (
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 flex items-center gap-3 shadow-lg shadow-purple-500/30 animate-pulse">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <Zap className="w-6 h-6 text-white" fill="currentColor" />
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">Boost actif !</p>
          <div className="flex items-center gap-1 text-white/80 text-xs">
            <Clock className="w-3 h-3" />
            <span>{boostStatus.remainingMinutes} min restantes</span>
          </div>
        </div>
        <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-purple-500/50"
      >
        <Zap className="w-5 h-5" fill="currentColor" />
        <span>Booster mon profil</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-6 border-2 border-purple-500/30 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Zap className="w-10 h-10 text-white" fill="currentColor" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Booste ton profil !</h3>
              <p className="text-gray-400 text-sm">
                Apparais en premier dans la découverte pendant 30 minutes
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-center">
                <p className="text-red-400 text-sm font-medium">{errorMessage}</p>
              </div>
            )}

            <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-4 mb-6">
              <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Avantages du boost :
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>Priorité dans la découverte</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>10x plus de vues sur ton profil</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>Plus de matchs potentiels</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>Durée : 30 minutes</span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-6">
              <div className="flex items-center gap-2 text-yellow-400 text-xs">
                <Crown className="w-4 h-4" />
                <span className="font-semibold">Fonctionnalité Premium • 1 boost par 24h</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleBoost}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Activation...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" fill="currentColor" />
                    <span>Activer le boost</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-xl transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
