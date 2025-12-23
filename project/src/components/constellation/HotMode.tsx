import { useState, useEffect } from 'react';
import { Eye, Heart, X } from 'lucide-react';
import { DatingProfile, getZodiacEmoji } from '../../data/datingProfiles';
import VerificationBadge from '../VerificationBadge';
import PlanBadge from '../PlanBadge';
import { getCompatibilityMessage } from '../../lib/compatibilityEngine';

interface HotModeProps {
  profiles: DatingProfile[];
  onSignal: (profile: DatingProfile, type: 'signal' | 'supernova') => void;
  onViewProfile: (profile: DatingProfile) => void;
  isSignalDisabled: boolean;
  isPremium: boolean;
}

export default function HotMode({
  profiles,
  onSignal,
  onViewProfile,
  isSignalDisabled,
  isPremium
}: HotModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [compatibilityProgress, setCompatibilityProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentProfile = profiles[currentIndex];
  const compatibility = currentProfile?.compatibility || 0;

  useEffect(() => {
    setCompatibilityProgress(0);
    const timer = setTimeout(() => {
      setCompatibilityProgress(compatibility);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentIndex, compatibility]);

  const handleSignalClick = async (type: 'signal' | 'supernova') => {
    if (isAnimating || !currentProfile) return;

    setIsAnimating(true);
    await onSignal(currentProfile, type);

    setTimeout(() => {
      if (currentIndex + 1 < profiles.length) {
        setCurrentIndex(currentIndex + 1);
      }
      setIsAnimating(false);
    }, 300);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < profiles.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (!currentProfile || profiles.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center px-6 w-full max-w-xs">
          <div className="text-4xl mb-4">💫</div>
          <h2 className="text-lg font-bold mb-2 text-white">Plus de profils disponibles</h2>
          <p className="text-white/60 text-xs mb-5 leading-relaxed">
            Tu as vu tous les profils disponibles pour le moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Navigation indicators */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {profiles.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 rounded-full transition-all ${
              idx === currentIndex
                ? 'w-8 bg-pink-500'
                : idx < currentIndex
                ? 'w-4 bg-pink-900'
                : 'w-4 bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* Main Card with Cosmic Aura */}
      <div
        className={`transition-all duration-300 ease-out ${
          isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <div className="relative max-w-md mx-auto">
          {/* Aura cosmique si haute compatibilité */}
          {compatibility >= 85 && (
            <div className="absolute inset-0 -z-10 pointer-events-none">
              {/* Anneaux animés */}
              <div
                className={`absolute inset-0 rounded-2xl border-2 animate-ping ${
                  compatibility >= 90 ? 'border-yellow-400/40' : 'border-pink-400/40'
                }`}
                style={{ animationDuration: '2s' }}
              />
              <div
                className={`absolute inset-0 rounded-2xl border-2 animate-ping ${
                  compatibility >= 90 ? 'border-yellow-400/30' : 'border-pink-400/30'
                }`}
                style={{ animationDuration: '2s', animationDelay: '0.5s' }}
              />
              <div
                className={`absolute inset-0 rounded-2xl border-2 animate-ping ${
                  compatibility >= 90 ? 'border-yellow-400/20' : 'border-pink-400/20'
                }`}
                style={{ animationDuration: '2s', animationDelay: '1s' }}
              />

              {/* Glow radial */}
              <div
                className={`absolute inset-0 rounded-2xl blur-3xl scale-110 ${
                  compatibility >= 90
                    ? 'bg-gradient-radial from-yellow-400/20 via-orange-400/10 to-transparent'
                    : 'bg-gradient-radial from-pink-400/20 via-purple-400/10 to-transparent'
                }`}
              />
            </div>
          )}

          {/* Badge "Étoile brillante" flottant au-dessus */}
          {compatibility >= 85 && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
              <div className="relative">
                {/* Glow */}
                <div
                  className={`absolute inset-0 rounded-full blur-lg ${
                    compatibility >= 90 ? 'bg-yellow-400/50' : 'bg-pink-400/50'
                  }`}
                />

                {/* Badge */}
                <div
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border-2 ${
                    compatibility >= 90
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-300/50 shadow-yellow-500/50'
                      : 'bg-gradient-to-r from-pink-500 to-purple-500 border-pink-300/50 shadow-pink-500/50'
                  }`}
                >
                  <span
                    className="text-2xl animate-spin"
                    style={{ animationDuration: '3s' }}
                  >
                    {compatibility >= 90 ? '✨' : '⭐'}
                  </span>
                  <span className="text-white font-bold text-sm">
                    {compatibility >= 90 ? 'Étoile Dorée' : 'Étoile Brillante'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* La carte elle-même */}
          <div
            className={`bg-black rounded-2xl overflow-hidden shadow-2xl ${
              compatibility >= 90
                ? 'border-2 border-yellow-400/50'
                : compatibility >= 75
                ? 'border-2 border-pink-400/50'
                : 'border border-red-500'
            }`}
            style={{
              boxShadow: compatibility >= 90
                ? '0 0 40px rgba(250, 204, 21, 0.4)'
                : compatibility >= 75
                ? '0 0 40px rgba(244, 114, 182, 0.4)'
                : '0 0 40px rgba(220, 20, 60, 0.3)'
            }}
          >
            {/* Banner */}
            <div className="relative w-full h-64 bg-black overflow-hidden">
              {currentProfile.banner ? (
                <>
                  <div className="absolute inset-0">
                    <img
                      src={currentProfile.banner}
                      alt="Background"
                      className="w-full h-full object-cover blur-md scale-110 opacity-40"
                    />
                  </div>
                  <div className="absolute inset-0">
                    <img
                      src={currentProfile.banner}
                      alt="Bannière"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(ellipse at center, transparent 0%, transparent 30%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.6) 100%)'
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/80 to-transparent" />
                </>
              ) : (
                <div className="w-full h-full bg-black" />
              )}
            </div>

            {/* Profile Info */}
            <div className="px-5 pb-3 bg-black">
              <div className="text-center mb-3">
                <div className="flex items-center justify-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-3xl font-bold text-white">
                    {currentProfile.first_name}, {currentProfile.age}
                  </h2>
                  <VerificationBadge isPremium={currentProfile.verified} size="sm" />
                  <PlanBadge plan={currentProfile.premium_tier || 'free'} size="sm" />
                </div>
                <p className="text-gray-400 text-sm mb-3 truncate px-2">
                  📍 {currentProfile.location}
                </p>
                <div className={`inline-flex items-center gap-2 backdrop-blur-sm px-3 py-1.5 rounded-full border ${
                  compatibility >= 90
                    ? 'bg-yellow-900/40 border-yellow-500/40'
                    : compatibility >= 75
                    ? 'bg-pink-900/40 border-pink-500/40'
                    : 'bg-red-900/60 border-red-500/40'
                }`}>
                  <span className="text-sm">{getZodiacEmoji(currentProfile.zodiac)}</span>
                  <span className="text-white text-sm font-medium">{currentProfile.zodiac}</span>
                </div>
              </div>
            </div>

            {/* Compatibility */}
            <div className="px-4 py-3 bg-black">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium uppercase tracking-wide ${
                  compatibility >= 90 ? 'text-yellow-400' :
                  compatibility >= 75 ? 'text-pink-400' :
                  'text-red-400'
                }`}>
                  Compatibilité
                </span>
                <span className={`text-2xl font-bold ${
                  compatibility >= 90 ? 'text-yellow-400' :
                  compatibility >= 75 ? 'text-pink-400' :
                  'text-red-500'
                }`}>
                  {compatibility}%
                </span>
              </div>

              <div className="h-2 bg-gray-900 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${compatibilityProgress}%`,
                    background: compatibility >= 90
                      ? 'linear-gradient(to right, #fbbf24, #f59e0b, #fb923c)'
                      : compatibility >= 75
                      ? 'linear-gradient(to right, #f472b6, #ec4899, #db2777)'
                      : 'linear-gradient(to right, #dc2626 0%, #ef4444 50%, #ec4899 100%)',
                    boxShadow: compatibility >= 85
                      ? compatibility >= 90
                        ? '0 0 10px rgba(251,191,36,0.6)'
                        : '0 0 10px rgba(244,114,182,0.6)'
                      : 'none'
                  }}
                />
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-white/90">
                  {getCompatibilityMessage(compatibility)}
                </p>
              </div>

              {/* Stars display */}
              <div className="flex items-center justify-center gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-lg ${
                      i < Math.floor(compatibility / 20)
                        ? compatibility >= 90
                          ? 'text-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.8)]'
                          : compatibility >= 75
                          ? 'text-pink-400 drop-shadow-[0_0_3px_rgba(244,114,182,0.8)]'
                          : 'text-blue-400 drop-shadow-[0_0_3px_rgba(96,165,250,0.8)]'
                        : 'text-gray-700'
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div className="px-4 py-3 bg-black">
              <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
                {currentProfile.bio}
              </p>
            </div>

            {/* View Profile Button */}
            <div className="px-4 py-3 bg-black">
              <button
                onClick={() => onViewProfile(currentProfile)}
                className={`w-full border-2 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-sm ${
                  compatibility >= 90
                    ? 'border-yellow-500 hover:bg-yellow-500/10'
                    : compatibility >= 75
                    ? 'border-pink-500 hover:bg-pink-500/10'
                    : 'border-red-500 hover:bg-red-500/10'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Voir le profil complet</span>
              </button>
            </div>

            {/* Signal Buttons */}
            <div className="flex items-center justify-center gap-4 px-6 py-5 bg-black">
              <button
                onClick={() => handleSignalClick('signal')}
                disabled={isSignalDisabled || isAnimating}
                className={`flex-1 max-w-[180px] text-white py-3.5 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg ${
                  compatibility >= 90
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 shadow-yellow-500/40'
                    : compatibility >= 75
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-pink-500/40'
                    : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-pink-500/30'
                } disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none`}
              >
                <span className="text-2xl">💫</span>
                <span>Signal</span>
              </button>

              <button
                onClick={() => handleSignalClick('supernova')}
                disabled={isSignalDisabled || isAnimating || !isPremium}
                className="flex-1 max-w-[180px] bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:via-orange-400 hover:to-yellow-400 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-3.5 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/40"
              >
                <span className="text-2xl">✨</span>
                <span>Super Nova</span>
              </button>
            </div>

            {/* Info text */}
            <div className="px-4 pb-3 bg-black text-center">
              <p className="text-white/40 text-xs">
                💫 Signal Normal | ✨ Super Nova = Plus de chances
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="px-6 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all text-sm"
        >
          ← Précédent
        </button>

        <span className="text-white/60 text-sm">
          {currentIndex + 1} / {profiles.length}
        </span>

        <button
          onClick={handleNext}
          disabled={currentIndex + 1 >= profiles.length}
          className="px-6 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all text-sm"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
