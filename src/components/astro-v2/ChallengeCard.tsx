// ═══════════════════════════════════════════════════════════════════════
// CHALLENGE CARD - Challenge cosmique quotidien
// ═══════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { Challenge } from '../../../types/astro-v2';
import AstraNote from '../shared/AstraNote';

interface ChallengeCardProps {
  challenge: Challenge;
  onComplete: (challengeId: string) => Promise<void>;
}

export default function ChallengeCard({ challenge, onComplete }: ChallengeCardProps) {
  const [completing, setCompleting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const isCompleted = challenge.completedAt !== null;

  const handleComplete = async () => {
    if (isCompleted || completing) return;

    setCompleting(true);
    try {
      await onComplete(challenge.id);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    } catch (error) {
      console.error('Erreur complétion challenge:', error);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes celebration {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
          }
        }
      `}</style>

      <div
        className={`
          bg-gradient-to-br ${isCompleted ? 'from-red-950/60' : 'from-red-950/40'} to-black
          border ${isCompleted ? 'border-red-500/70' : 'border-red-500/50'}
          rounded-xl p-5 relative overflow-hidden
        `}
        style={{ animation: 'slideUpFade 0.6s ease-out 0.3s backwards' }}
      >
        {/* Celebration overlay */}
        {showCelebration && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `sparkle 1s ease-out ${i * 0.1}s`,
                }}
              >
                ✨
              </div>
            ))}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <h3 className="text-xl font-bold text-white">
              Challenge Cosmique
            </h3>
          </div>
          <div className={`
            px-3 py-1 rounded-full text-xs font-bold
            ${isCompleted ? 'bg-red-600 text-white' : 'bg-red-950/50 text-red-400'}
          `}>
            +{challenge.xp} XP
          </div>
        </div>

        {/* Challenge text */}
        <div className="bg-black/40 border border-red-900/30 rounded-lg p-4 mb-4">
          <p className="text-sm text-white leading-relaxed">
            {challenge.text}
          </p>
        </div>

        {/* Action button */}
        {!isCompleted ? (
          <button
            onClick={handleComplete}
            disabled={completing}
            className={`
              w-full py-3 rounded-xl font-bold text-sm
              transition-all duration-300
              ${completing 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/30'}
            `}
          >
            {completing ? 'Validation...' : '✓ Marquer comme accompli'}
          </button>
        ) : (
          <div 
            className="text-center py-3 bg-red-600/20 rounded-xl border border-red-500/30"
            style={showCelebration ? { animation: 'celebration 0.6s ease-out' } : undefined}
          >
            <p className="text-base font-bold text-red-400">
              🌟 Challenge accompli ! +{challenge.xp} XP
            </p>
          </div>
        )}

        {/* ASTRA Note */}
        <div className="mt-4">
          <AstraNote size="sm">
            Les challenges sont générés selon ton thème et tes patterns. Ils nourrissent ta Trajectoire dans l'Univers V2.
          </AstraNote>
        </div>
      </div>
    </>
  );
}
