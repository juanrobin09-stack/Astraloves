import { Heart, MessageSquare, UserPlus, Sparkles, MapPin, Calendar } from 'lucide-react';

interface MatchCardProps {
  profile: {
    id: string;
    pseudo: string;
    age: number;
    signe_solaire?: string;
    ville?: string;
    bio?: string;
    photos?: string[];
    avatar_url?: string;
  };
  score?: number;
  analyseIA?: string;
  onLike?: () => void;
  onPass?: () => void;
  onMessage?: () => void;
  onAddFriend?: () => void;
  showActions?: boolean;
  loading?: boolean;
}

export default function MatchCard({
  profile,
  score,
  analyseIA,
  onLike,
  onPass,
  onMessage,
  onAddFriend,
  showActions = true,
  loading = false,
}: MatchCardProps) {
  const photoUrl = profile.photos?.[0] || profile.avatar_url;
  const initials = profile.pseudo?.charAt(0).toUpperCase() || 'A';

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreGradient = (score?: number) => {
    if (!score) return 'from-gray-600 to-gray-800';
    if (score >= 80) return 'from-green-600 to-green-800';
    if (score >= 60) return 'from-yellow-600 to-yellow-800';
    return 'from-orange-600 to-orange-800';
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl overflow-hidden border border-red-600/30 shadow-2xl">
      <div className="relative h-[60vh] sm:h-[70vh] lg:h-96 overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={profile.pseudo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-900/30 to-purple-900/30 flex items-center justify-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold">
              {initials}
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate flex-1">
              @{profile.pseudo}
            </h2>
            <span className="text-lg sm:text-xl text-gray-300 flex-shrink-0">{profile.age}</span>
          </div>

          {profile.signe_solaire && (
            <div className="flex items-center gap-2 text-pink-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">{profile.signe_solaire}</span>
            </div>
          )}

          {profile.ville && (
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{profile.ville}</span>
            </div>
          )}
        </div>
      </div>

      {score !== undefined && (
        <div className="px-4 sm:px-6 pt-3 sm:pt-4 pb-2">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-gray-400 text-xs sm:text-sm font-medium">Compatibilité</span>
            <span className={`text-xl sm:text-2xl font-bold ${getScoreColor(score)}`}>
              {score}%
            </span>
          </div>
          <div className="w-full h-1.5 sm:h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getScoreGradient(score)} transition-all duration-500`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      )}

      {analyseIA && (
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-start gap-2 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-3 sm:p-4 border border-purple-600/30">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-3">
                {analyseIA}
              </p>
            </div>
          </div>
        </div>
      )}

      {profile.bio && (
        <div className="px-4 sm:px-6 pb-3 sm:pb-4">
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-2">{profile.bio}</p>
        </div>
      )}

      {showActions && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex gap-2 sm:gap-3">
          {onPass && (
            <button
              onClick={onPass}
              disabled={loading}
              className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <span className="truncate">Passer</span>
            </button>
          )}

          {onLike && (
            <button
              onClick={onLike}
              disabled={loading}
              className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl font-medium flex items-center justify-center gap-1.5 sm:gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="truncate">J'aime</span>
            </button>
          )}

          {onMessage && (
            <button
              onClick={onMessage}
              disabled={loading}
              className="p-2.5 sm:p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              title="Envoyer un message"
            >
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {onAddFriend && (
            <button
              onClick={onAddFriend}
              disabled={loading}
              className="p-2.5 sm:p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              title="Ajouter en ami"
            >
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
