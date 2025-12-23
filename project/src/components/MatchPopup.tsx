import { Heart, MessageCircle, X, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MatchPopupProps {
  currentUserPhoto: string;
  currentUserName: string;
  matchedUserPhoto: string;
  matchedUserName: string;
  matchedUserAge: number;
  compatibilityScore: number;
  onSendMessage: () => void;
  onClose: () => void;
}

export default function MatchPopup({
  currentUserPhoto,
  currentUserName,
  matchedUserPhoto,
  matchedUserName,
  matchedUserAge,
  compatibilityScore,
  onSendMessage,
  onClose
}: MatchPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const getCompatibilityLevel = (score: number) => {
    if (score >= 80) return { emoji: '🔥', label: 'Connexion Exceptionnelle', color: '#E63946' };
    if (score >= 65) return { emoji: '⭐', label: 'Très Compatible', color: '#F77F00' };
    return { emoji: '💫', label: 'Belle Compatibilité', color: '#06B6D4' };
  };

  const level = getCompatibilityLevel(compatibilityScore);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div
        className={`bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-md w-full relative border-2 border-red-600/50 shadow-2xl transition-all duration-300 ${isVisible ? 'scale-100' : 'scale-90'}`}
        onClick={e => e.stopPropagation()}
        style={{
          boxShadow: '0 0 60px rgba(230, 57, 70, 0.4), inset 0 0 40px rgba(230, 57, 70, 0.1)'
        }}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all z-10 group"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors" />
        </button>

        <div className="text-center mb-6 sm:mb-8">
          <div className="relative inline-block mb-3 sm:mb-4">
            <h1
              className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight animate-pulse px-2"
              style={{
                background: 'linear-gradient(135deg, #E63946 0%, #FF6B6B 50%, #E63946 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% auto',
                animation: 'gradient 3s linear infinite'
              }}
            >
              C'EST UN MATCH !
            </h1>
            <div className="absolute -top-2 -right-4 sm:-top-3 sm:-right-8 text-xl sm:text-3xl animate-bounce">
              💕
            </div>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm font-medium px-2">
            Vous vous êtes mutuellement likés
          </p>
        </div>

        <div className="flex justify-center items-center mb-6 sm:mb-8 relative">
          <div className="relative">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full border-3 sm:border-4 overflow-hidden relative z-10"
              style={{
                borderColor: level.color,
                boxShadow: `0 0 30px ${level.color}80`
              }}
            >
              <img
                src={currentUserPhoto || '/placeholder.jpg'}
                alt={currentUserName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="mx-4 sm:mx-6 relative">
            <div className="relative">
              <Heart
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-red-500 animate-pulse fill-red-500"
                style={{
                  filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.8))',
                  animation: 'heartbeat 1s ease-in-out infinite'
                }}
              />
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>

          <div className="relative">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full border-3 sm:border-4 overflow-hidden relative z-10"
              style={{
                borderColor: level.color,
                boxShadow: `0 0 30px ${level.color}80`
              }}
            >
              <img
                src={matchedUserPhoto || '/placeholder.jpg'}
                alt={matchedUserName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="text-center mb-6 sm:mb-8">
          <div
            className="inline-flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border-2 mb-2 sm:mb-3"
            style={{
              backgroundColor: `${level.color}15`,
              borderColor: level.color,
              boxShadow: `0 8px 32px ${level.color}30`
            }}
          >
            <span className="text-2xl sm:text-3xl animate-pulse">{level.emoji}</span>
            <div className="text-left">
              <div
                className="text-2xl sm:text-3xl font-black"
                style={{ color: level.color }}
              >
                {compatibilityScore}%
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400 font-semibold uppercase tracking-wide">
                compatibles
              </div>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-400 font-medium px-2 truncate">
            {level.emoji} {level.label}
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <button
            onClick={onSendMessage}
            className="w-full py-3 sm:py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg text-sm sm:text-base"
            style={{
              background: 'linear-gradient(135deg, #E63946, #C1121F)',
              boxShadow: '0 10px 40px rgba(230, 57, 70, 0.4)'
            }}
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="truncate">Envoyer un message</span>
          </button>

          <button
            onClick={handleClose}
            className="w-full py-2.5 sm:py-3 rounded-xl font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all text-sm sm:text-base"
          >
            <span className="truncate">Continuer à découvrir</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.2); }
          50% { transform: scale(1); }
          75% { transform: scale(1.15); }
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
