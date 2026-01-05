import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Profile {
  id: number;
  name: string;
  age: number;
  location: string;
  sign: string;
  moonSign?: string;
  ascendant?: string;
  compatibility: number;
  verified: boolean;
  plan: 'free' | 'premium' | 'premium-plus';
  photo: string;
  photos: string[];
  bio: string;
  interests: string[];
  looking?: string;
  lives?: number;
  followers?: number;
  gifts?: number;
}

interface FullProfileModalProps {
  profile: Profile;
  onClose: () => void;
  onLike: () => void;
  onPass: () => void;
  onSuperLike?: () => void;
}

export default function FullProfileModal({ profile, onClose, onLike, onPass, onSuperLike }: FullProfileModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Filtrer les photos fictives (Pexels) pour ne garder que les vraies photos uploadées
  const realPhotos = profile.photos.filter(photo =>
    !photo.includes('pexels.com') &&
    !photo.includes('placeholder') &&
    !photo.includes('unsplash.com')
  );

  // Vérifier si la bannière est réelle
  const hasRealBanner = profile.photo &&
    !profile.photo.includes('pexels.com') &&
    !profile.photo.includes('placeholder') &&
    !profile.photo.includes('unsplash.com');

  const displayPhotos = realPhotos.length > 0 ? realPhotos : (hasRealBanner ? [profile.photo] : []);
  const hasPhotos = displayPhotos.length > 0;

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === profile.photos.length - 1 ? 0 : prev + 1
    );
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? profile.photos.length - 1 : prev - 1
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[10000] flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
      style={{ paddingBottom: '88px' }} // Espace pour la barre de navigation mobile
    >
      <div
        className="bg-black/95 border-2 border-red-500/30 rounded-2xl w-full max-w-md flex flex-col relative overflow-hidden"
        style={{ maxHeight: '65vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header mini + bouton retour */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-red-800/50 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">{profile.name}</h2>
          <button
            className="w-8 h-8 bg-neutral-900/90 backdrop-blur-md rounded-full text-white text-sm hover:bg-red-500/20 hover:rotate-90 transition-all flex items-center justify-center"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {hasPhotos ? (
          <div className="relative w-full h-48 flex-shrink-0">
            <img
              src={displayPhotos[currentPhotoIndex]}
              alt={profile.name}
              className="w-full h-full object-cover"
            />

            {displayPhotos.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {displayPhotos.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 rounded-full cursor-pointer transition-all ${
                      index === currentPhotoIndex
                        ? 'bg-white w-4'
                        : 'bg-white/50 w-1'
                    }`}
                    onClick={() => setCurrentPhotoIndex(index)}
                  />
                ))}
              </div>
            )}

            {displayPhotos.length > 1 && (
            <>
              <button
                className="absolute top-1/2 -translate-y-1/2 left-2 w-8 h-8 bg-neutral-900/80 backdrop-blur-md rounded-full text-white hover:bg-red-500/80 transition-all z-10 flex items-center justify-center"
                onClick={prevPhoto}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                className="absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8 bg-neutral-900/80 backdrop-blur-md rounded-full text-white hover:bg-red-500/80 transition-all z-10 flex items-center justify-center"
                onClick={nextPhoto}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
            )}
          </div>
        ) : (
          <div className="relative w-full h-48 flex-shrink-0 bg-neutral-900 border-b border-red-500/20 flex items-center justify-center">
            <div className="text-center px-4">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-neutral-400 text-sm">Aucune photo disponible</p>
              <p className="text-neutral-600 text-xs mt-1">Ce profil n'a pas encore ajouté de photos</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-3 pb-4 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-xl font-bold text-white">
                  {profile.name}
                </h1>
                {profile.verified && (
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white rounded-full text-xs">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-400">
                {profile.age} ans • {profile.location}
              </p>
            </div>

            {profile.plan !== 'free' && (
              <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 px-3 py-1 rounded-lg text-xs text-red-500 font-bold">
                {profile.plan === 'premium' && '💎'}
                {profile.plan === 'premium-plus' && '👑'}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-3">✨ Astrologie</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-center">
                <span className="text-2xl block mb-1">{getSignEmoji(profile.sign)}</span>
                <p className="text-xs text-white font-bold">{profile.sign}</p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-center">
                <span className="text-2xl block mb-1">🌙</span>
                <p className="text-xs text-white font-bold">{profile.moonSign || 'N/A'}</p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-center">
                <span className="text-2xl block mb-1">⬆️</span>
                <p className="text-xs text-white font-bold">{profile.ascendant || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-3">💫 Compatibilité</h3>
            <div className="flex gap-3 items-center bg-neutral-900 border border-neutral-800 rounded-xl p-3">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(239, 68, 68, 0.2)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="8"
                    strokeDasharray={`${profile.compatibility * 2.83} 283`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-black text-red-500">{profile.compatibility}%</span>
                </div>
              </div>

              <div className="flex-1">
                <p className="text-sm text-green-500 font-bold mb-1">
                  Excellente compatibilité !
                </p>
                <p className="text-xs text-neutral-400">
                  Vos signes s'alignent parfaitement.
                </p>
              </div>
            </div>
          </div>

          {profile.bio && profile.bio.trim() !== '' && (
            <div>
              <h3 className="text-base font-bold text-white mb-3">📝 À propos</h3>
              <p className="text-sm text-white leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-white mb-3">❤️ Centres d'intérêt</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="bg-neutral-900 border border-neutral-800 rounded-full px-3 py-1.5 text-xs text-white"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.looking && (
            <div>
              <h3 className="text-base font-bold text-white mb-3">🔍 Recherche</h3>
              <p className="text-sm text-neutral-300">{profile.looking}</p>
            </div>
          )}

          {(profile.plan === 'premium' || profile.plan === 'premium-plus') && (
            <div>
              <h3 className="text-base font-bold text-white mb-3">📊 Statistiques</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-center">
                  <span className="block text-xl text-red-500 font-black mb-0.5">
                    {profile.lives || 0}
                  </span>
                  <span className="text-xs text-neutral-500">Lives</span>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-center">
                  <span className="block text-xl text-red-500 font-black mb-0.5">
                    {profile.followers || 0}
                  </span>
                  <span className="text-xs text-neutral-500">Abonnés</span>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-center">
                  <span className="block text-xl text-red-500 font-black mb-0.5">
                    {profile.gifts || 0}
                  </span>
                  <span className="text-xs text-neutral-500">Cadeaux</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions Tinder Style */}
        <div className="flex items-center justify-center gap-6 py-5 bg-neutral-900/95 border-t border-red-800/50 flex-shrink-0">
          {/* Passer */}
          <button
            onClick={() => {
              onPass();
              onClose();
            }}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-neutral-900 border-2 border-neutral-600 flex items-center justify-center shadow-lg hover:bg-neutral-800 hover:border-neutral-500 active:scale-90 transition-all"
            aria-label="Passer"
          >
            <span className="text-2xl text-neutral-300">✕</span>
          </button>

          {/* Super Like Astra */}
          {onSuperLike && (
            <button
              onClick={() => {
                onSuperLike();
                onClose();
              }}
              className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl border-2 border-yellow-300 hover:scale-105 active:scale-90 transition-all -mt-2"
              aria-label="Super Like Astra"
            >
              <span className="text-3xl drop-shadow-lg">⭐</span>
            </button>
          )}

          {/* Like */}
          <button
            onClick={() => {
              onLike();
              onClose();
            }}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg hover:bg-red-500 hover:scale-105 active:scale-90 transition-all"
            aria-label="Liker"
          >
            <span className="text-2xl">❤️</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function getSignEmoji(sign: string): string {
  const emojis: Record<string, string> = {
    'Bélier': '♈',
    'Taureau': '♉',
    'Gémeaux': '♊',
    'Cancer': '♋',
    'Lion': '♌',
    'Vierge': '♍',
    'Balance': '♎',
    'Scorpion': '♏',
    'Sagittaire': '♐',
    'Capricorne': '♑',
    'Verseau': '♒',
    'Poissons': '♓'
  };
  return emojis[sign] || '⭐';
}
