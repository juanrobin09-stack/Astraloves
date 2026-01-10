import { X, Check } from 'lucide-react';
import { DatingProfile, getZodiacEmoji } from '../../data/datingProfiles';
import { getCompatibilityMessage } from '../../lib/compatibilityEngine';

interface ProfileModalProps {
  profile: DatingProfile;
  onClose: () => void;
  onSignal: (type: 'signal' | 'supernova') => void;
  isSignalDisabled: boolean;
}

export default function ProfileModal({ profile, onClose, onSignal, isSignalDisabled }: ProfileModalProps) {
  return (
    <div className="fixed inset-0 z-[100000] bg-black overflow-y-auto">
      <div className="min-h-screen p-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="fixed top-4 right-4 w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center z-[100001] transition-colors shadow-lg"
        >
          <X className="w-6 h-6 text-white" strokeWidth={2.5} />
        </button>

        {/* Full Profile Content */}
        <div className="max-w-md mx-auto pt-16 pb-32">
          {/* Main Photo */}
          {profile.banner && !profile.banner.includes('pexels.com') && !profile.banner.includes('placeholder') ? (
            <img
              src={profile.banner}
              alt={profile.first_name}
              className="w-full rounded-2xl mb-6 shadow-2xl"
            />
          ) : profile.photos && profile.photos[0] && !profile.photos[0].includes('pexels.com') && !profile.photos[0].includes('placeholder') ? (
            <img
              src={profile.photos[0]}
              alt={profile.first_name}
              className="w-full rounded-2xl mb-6 shadow-2xl"
            />
          ) : (
            <div className="w-full h-96 bg-gray-900 rounded-2xl mb-6 flex items-center justify-center">
              <div className="text-center px-4">
                <div className="text-6xl mb-4">📷</div>
                <p className="text-gray-400 text-lg">Aucune photo disponible</p>
                <p className="text-gray-600 text-sm mt-2">Ce profil n'a pas encore ajouté de photos</p>
              </div>
            </div>
          )}

          {/* Name & Location */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-4xl font-bold text-white">
                {profile.first_name}, {profile.age}
              </h2>
              {profile.verified && (
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                </div>
              )}
            </div>
            <p className="text-gray-300 text-lg flex items-center gap-2">
              📍 {profile.location}
            </p>
          </div>

          {/* About Section */}
          {profile.bio && profile.bio.trim() !== '' && (
            <div className="bg-gray-900 rounded-xl p-6 mb-4">
              <h3 className="text-red-500 font-bold text-lg mb-3">À propos</h3>
              <p className="text-white text-base leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Compatibility Section */}
          <div className="bg-gray-900 rounded-xl p-6 mb-4">
            <h3 className="text-red-500 font-bold text-lg mb-3">Compatibilité</h3>
            <div className="text-5xl font-bold text-red-500 mb-4">
              {profile.compatibility}%
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${profile.compatibility}%`,
                  background: 'linear-gradient(to right, #dc2626 0%, #ef4444 50%, #ec4899 100%)'
                }}
              />
            </div>
            <p className="text-lg font-semibold text-white text-center">
              {getCompatibilityMessage(profile.compatibility)}
            </p>
          </div>

          {/* Zodiac Section */}
          <div className="bg-gray-900 rounded-xl p-6 mb-4">
            <h3 className="text-red-500 font-bold text-lg mb-3">Signe astrologique</h3>
            <p className="text-white text-2xl flex items-center gap-3">
              {getZodiacEmoji(profile.zodiac)} {profile.zodiac}
            </p>
          </div>

          {/* Interests Section */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-red-500 font-bold text-lg mb-3">Centres d'intérêt</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-red-900/40 border border-red-500/40 rounded-full text-white text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => onSignal('signal')}
              disabled={isSignalDisabled}
              className="flex-1 max-w-[180px] bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-pink-500/30"
            >
              <span className="text-2xl">💫</span>
              <span>Signal</span>
            </button>

            <button
              onClick={() => onSignal('supernova')}
              disabled={isSignalDisabled}
              className="flex-1 max-w-[180px] bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:via-orange-400 hover:to-yellow-400 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/40"
            >
              <span className="text-2xl">✨</span>
              <span>Super Nova</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
