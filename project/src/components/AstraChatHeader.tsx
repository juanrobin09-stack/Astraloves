import { ArrowLeft, MoreVertical, Video } from 'lucide-react';
import AstraStarLogo from './AstraStarLogo';

interface AstraChatHeaderProps {
  onBack: () => void;
  onLiveClick: () => void;
  onMenuClick: () => void;
  liveCount?: number;
}

export default function AstraChatHeader({ onBack, onLiveClick, onMenuClick, liveCount = 0 }: AstraChatHeaderProps) {
  return (
    <div className="sticky top-0 z-50 h-[120px] bg-gradient-to-b from-[#0F1419] via-[#8A1538]/30 to-transparent">
      {/* Bouton retour */}
      <button
        onClick={onBack}
        className="absolute left-4 top-6 w-10 h-10 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-red-500/15 hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <ArrowLeft size={20} className="text-white" />
      </button>

      {/* Logo Astra animé au centre */}
      <div className="absolute left-1/2 top-6 -translate-x-1/2 flex flex-col items-center">
        {/* Étoile principale avec animations multiples */}
        <div className="relative animate-float">
          <div className="relative z-10 animate-pulse-glow">
            <AstraStarLogo size={64} />
          </div>
        </div>

        {/* Texte Astra */}
        <h1 className="mt-3 text-3xl font-bold bg-gradient-to-r from-[#E94057] to-[#FF6B9D] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(233,64,87,0.5)]">
          Astra
        </h1>

        {/* Sous-titre */}
        <p className="text-sm text-gray-400 mt-1">
          Votre coach séduction & relation ✨
        </p>

        {/* Statut en ligne */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-500">En ligne</span>
        </div>
      </div>

      {/* Bouton Live discret (top-right) */}
      <button
        onClick={onLiveClick}
        className="absolute right-16 top-6 w-9 h-9 rounded-lg bg-red-500/10 backdrop-blur-md border border-red-500/30 flex items-center justify-center opacity-70 hover:opacity-100 hover:scale-108 hover:bg-red-500/20 hover:border-red-500/50 active:scale-95 transition-all duration-200"
      >
        <Video size={18} className="text-red-500" />
        {liveCount > 0 && (
          <>
            {/* Indicateur live actif */}
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            {/* Badge count */}
            {liveCount > 1 && (
              <div className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">{liveCount}</span>
              </div>
            )}
          </>
        )}
      </button>

      {/* Menu options (optionnel) */}
      <button
        onClick={onMenuClick}
        className="absolute right-4 top-6 w-10 h-10 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-red-500/15 hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <MoreVertical size={20} className="text-gray-400" />
      </button>

      {/* Styles d'animation personnalisés */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(5deg);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            filter: drop-shadow(0 0 20px rgba(233, 64, 87, 0.8)) drop-shadow(0 0 40px rgba(233, 64, 87, 0.5)) drop-shadow(0 0 60px rgba(233, 64, 87, 0.3));
            transform: scale(1) rotate(0deg);
          }
          50% {
            filter: drop-shadow(0 0 30px rgba(233, 64, 87, 1)) drop-shadow(0 0 50px rgba(233, 64, 87, 0.7)) drop-shadow(0 0 70px rgba(233, 64, 87, 0.5));
            transform: scale(1.15) rotate(180deg);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .hover\\:scale-108:hover {
          transform: scale(1.08);
        }
      `}</style>
    </div>
  );
}
