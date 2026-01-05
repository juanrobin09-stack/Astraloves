import { DatingProfile, getZodiacEmoji } from '../../data/datingProfiles';
import VerificationBadge from '../VerificationBadge';
import PlanBadge from '../PlanBadge';

interface ListeModeProps {
  profiles: DatingProfile[];
  onSignal: (profile: DatingProfile) => void;
  onViewProfile: (profile: DatingProfile) => void;
  onFavorite: (profile: DatingProfile) => void;
  isSignalDisabled: boolean;
}

export default function ListeMode({
  profiles,
  onSignal,
  onViewProfile,
  onFavorite,
  isSignalDisabled
}: ListeModeProps) {

  if (profiles.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">💫</div>
          <p className="text-white/60 text-sm">Aucun profil disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 px-3 space-y-2.5 max-w-2xl mx-auto">
      {profiles.map((profile) => {
        const compatibility = profile.compatibility || 0;

        return (
          <div
            key={profile.id}
            className={`relative bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 ${
              compatibility >= 90
                ? 'border-2 border-yellow-400/70 shadow-[0_0_40px_rgba(250,204,21,0.6),0_0_80px_rgba(250,204,21,0.3)]'
                : compatibility >= 75
                ? 'border-2 border-pink-400/70 shadow-[0_0_35px_rgba(244,114,182,0.6),0_0_70px_rgba(244,114,182,0.3)]'
                : compatibility >= 60
                ? 'border-2 border-blue-400/70 shadow-[0_0_30px_rgba(96,165,250,0.5),0_0_60px_rgba(96,165,250,0.2)]'
                : 'border border-slate-700'
            } active:scale-[0.98]`}
          >
            {/* Badge compatibilité - Position absolue top-right */}
            <div className="absolute top-2.5 right-2.5 z-20 bg-slate-900/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 border border-slate-700/50">
              <span className={`text-sm ${compatibility >= 90 ? 'animate-pulse' : ''}`}>
                {compatibility >= 90 ? '✨' :
                 compatibility >= 75 ? '⭐' :
                 compatibility >= 60 ? '💫' : '⚪'}
              </span>
              <span className="text-xs font-bold text-white">{compatibility}%</span>
            </div>

            {/* Badge En ligne - Position absolue top-left */}
            {profile.isOnline && (
              <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-400/40">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                <span className="text-green-300 text-xs font-semibold">En ligne</span>
              </div>
            )}

            {/* Particules flottantes pour 70%+ */}
            {compatibility >= 70 && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-10">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute rounded-full ${
                      compatibility >= 90
                        ? 'w-1.5 h-1.5 bg-yellow-300'
                        : 'w-1 h-1 bg-pink-300'
                    }`}
                    style={{
                      left: `${12 + (i * 15)}%`,
                      top: `${18 + ((i * 13) % 55)}%`,
                      opacity: 0.75,
                      animation: `float ${2.5 + i * 0.3}s ease-in-out infinite`,
                      animationDelay: `${i * 0.3}s`,
                      boxShadow: compatibility >= 90
                        ? '0 0 10px rgba(253,224,71,0.9)'
                        : '0 0 8px rgba(244,114,182,0.7)',
                    }}
                  />
                ))}
              </div>
            )}

            {/* NOUVEAU : Layout HORIZONTAL avec photo à gauche */}
            <div className="flex gap-3 p-3">

              {/* Photo COMPACTE 80x80px à gauche */}
              <button
                onClick={() => onViewProfile(profile)}
                className="flex-shrink-0"
              >
                <div className={`w-20 h-20 rounded-xl overflow-hidden ${
                  compatibility >= 90 ? 'ring-2 ring-yellow-400/70' :
                  compatibility >= 75 ? 'ring-2 ring-pink-400/70' :
                  compatibility >= 60 ? 'ring-2 ring-blue-400/70' : ''
                }`}>
                  {profile.photos && profile.photos[0] ? (
                    <img
                      src={profile.photos[0]}
                      alt={profile.first_name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-900 via-purple-900 to-red-900 flex items-center justify-center">
                      <span className="text-3xl">📷</span>
                    </div>
                  )}
                </div>
              </button>

              {/* Infos à droite de la photo */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">

                {/* En-tête : Nom + Âge */}
                <div>
                  <button
                    onClick={() => onViewProfile(profile)}
                    className="flex items-center gap-1.5 mb-0.5 hover:opacity-80 transition-opacity"
                  >
                    <h3 className="text-white font-bold text-base leading-tight truncate">
                      {profile.first_name}, {profile.age}
                    </h3>
                    <VerificationBadge isPremium={profile.verified} size="sm" />
                    <PlanBadge plan={profile.premium_tier || 'free'} size="xs" />
                  </button>

                  {/* Localisation + Signe astrologique */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="flex items-center gap-0.5">
                      📍 {profile.location?.split(',')[0] || 'Paris'}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-0.5">
                      {getZodiacEmoji(profile.zodiac)} {profile.zodiac}
                    </span>
                  </div>
                </div>

                {/* Étoiles de notation */}
                <div className="flex gap-0.5 my-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-xs ${
                        i < Math.floor(compatibility / 20)
                          ? compatibility >= 90
                            ? 'text-yellow-400'
                            : compatibility >= 75
                            ? 'text-pink-400'
                            : 'text-blue-400'
                          : 'text-slate-700'
                      }`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>

                {/* Barre de compatibilité */}
                <div className="bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      compatibility >= 90
                        ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500'
                        : compatibility >= 75
                        ? 'bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500'
                        : 'bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-500'
                    }`}
                    style={{
                      width: `${compatibility}%`,
                      boxShadow: compatibility >= 75
                        ? compatibility >= 90
                          ? '0 0 12px rgba(250,204,21,0.8)'
                          : '0 0 10px rgba(244,114,182,0.7)'
                        : 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Boutons d'action - LIGNE EN BAS */}
            <div className="flex gap-2 px-3 pb-3">
              <button
                onClick={() => onSignal(profile)}
                disabled={isSignalDisabled}
                className={`flex-1 rounded-xl py-2.5 flex items-center justify-center gap-2 transition-all text-sm font-medium ${
                  isSignalDisabled
                    ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-700/50 hover:bg-slate-700 active:scale-95 text-white'
                }`}
              >
                <span className="text-base">💫</span>
                Signal
              </button>

              <button
                onClick={() => onViewProfile(profile)}
                className="bg-slate-700/50 hover:bg-slate-700 active:scale-95 text-white rounded-xl py-2.5 px-3.5 transition-all"
              >
                <span className="text-base">👁️</span>
              </button>

              <button
                onClick={() => onFavorite(profile)}
                className="bg-slate-700/50 hover:bg-slate-700 active:scale-95 text-white rounded-xl py-2.5 px-3.5 transition-all"
              >
                <span className="text-pink-400 text-base">💖</span>
              </button>
            </div>
          </div>
        );
      })}

      {/* End indicator */}
      <div className="text-center py-6">
        <p className="text-white/40 text-xs">
          ✨ Tu as vu tous les profils disponibles
        </p>
      </div>
    </div>
  );
}
