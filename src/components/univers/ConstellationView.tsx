import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { matchingService } from '@/services/matching/matchingService';
import { supabase } from '@/config/supabase';
import { toast } from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Heart, X, Star, Sparkles, Filter, Grid3X3, Layers,
  MapPin, ChevronLeft, ChevronRight, Crown, Shield,
  Zap, RotateCcw, Eye, Lock
} from 'lucide-react';

// Types
interface Profile {
  id: string;
  first_name: string;
  avatar_url: string | null;
  sun_sign: string;
  moon_sign: string;
  ascendant_sign: string;
  bio: string | null;
  birth_city: string | null;
  compatibility: number;
  photos?: { url: string }[];
}

// Zodiac symbols
const ZODIAC_SYMBOLS: Record<string, string> = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
  leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
  sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
};

// Avatar URL helper
const getAvatarUrl = (avatarUrl: string | null | undefined): string | null => {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('http')) return avatarUrl;
  const { data } = supabase.storage.from('avatars').getPublicUrl(avatarUrl);
  return data.publicUrl;
};

// Single Profile Card Component
function ProfileCard({
  profile,
  onLike,
  onPass,
  onSuperLike,
  isTop,
  style,
}: {
  profile: Profile;
  onLike: () => void;
  onPass: () => void;
  onSuperLike: () => void;
  isTop: boolean;
  style?: any;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onLike();
    } else if (info.offset.x < -100) {
      onPass();
    }
  };

  const avatarUrl = getAvatarUrl(profile.avatar_url);
  const zodiacSymbol = ZODIAC_SYMBOLS[profile.sun_sign?.toLowerCase()] || '✨';

  return (
    <motion.div
      className="absolute w-full h-full"
      style={{ ...style, x, rotate }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
    >
      <div className="relative w-full h-full bg-[#1c1c1e] rounded-3xl overflow-hidden shadow-2xl">
        {/* Photo */}
        <div className="absolute inset-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={profile.first_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cosmic-red/30 to-pink-600/30 flex items-center justify-center">
              <span className="text-8xl opacity-30">{zodiacSymbol}</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>

        {/* Like indicator */}
        <motion.div
          className="absolute top-8 right-8 px-4 py-2 bg-green-500 rounded-xl rotate-12 border-4 border-green-400"
          style={{ opacity: likeOpacity }}
        >
          <span className="text-2xl font-black text-white">LIKE</span>
        </motion.div>

        {/* Nope indicator */}
        <motion.div
          className="absolute top-8 left-8 px-4 py-2 bg-red-500 rounded-xl -rotate-12 border-4 border-red-400"
          style={{ opacity: nopeOpacity }}
        >
          <span className="text-2xl font-black text-white">NOPE</span>
        </motion.div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {/* Compatibility badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cosmic-red/90 rounded-full mb-3">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-bold">{profile.compatibility}% compatible</span>
          </div>

          {/* Name and age */}
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold">{profile.first_name}</h2>
            <span className="text-3xl">{zodiacSymbol}</span>
          </div>

          {/* Zodiac info */}
          <p className="text-white/70 text-sm mb-3">
            ☀️ {profile.sun_sign} • 🌙 {profile.moon_sign} • ↗️ {profile.ascendant_sign}
          </p>

          {/* Location */}
          {profile.birth_city && (
            <div className="flex items-center gap-2 text-white/50 text-sm mb-3">
              <MapPin className="w-4 h-4" />
              <span>{profile.birth_city}</span>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="text-white/80 text-sm line-clamp-2">{profile.bio}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Grid Profile Card
function GridProfileCard({
  profile,
  onClick,
  isLocked,
}: {
  profile: Profile;
  onClick: () => void;
  isLocked: boolean;
}) {
  const avatarUrl = getAvatarUrl(profile.avatar_url);
  const zodiacSymbol = ZODIAC_SYMBOLS[profile.sun_sign?.toLowerCase()] || '✨';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer ${isLocked ? 'opacity-50' : ''}`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={profile.first_name}
          className={`w-full h-full object-cover ${isLocked ? 'blur-md' : ''}`}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-cosmic-red/30 to-pink-600/30 flex items-center justify-center">
          <span className="text-4xl">{zodiacSymbol}</span>
        </div>
      )}

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Lock className="w-8 h-8 text-white/60" />
        </div>
      )}

      {/* Info */}
      {!isLocked && (
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">{profile.first_name}</span>
            <span>{zodiacSymbol}</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cosmic-red" />
            <span className="text-xs text-cosmic-red font-medium">{profile.compatibility}%</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Main Component
export default function ConstellationView() {
  const { profile } = useAuthStore();
  const { tier, isPremium, isElite } = useSubscriptionStore();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'cards' | 'grid'>('cards');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [passedProfiles, setPassedProfiles] = useState<string[]>([]);

  const visibleLimit = tier === 'free' ? 5 : tier === 'premium' ? 50 : 100;

  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      return matchingService.getPotentialMatches(profile.id, visibleLimit);
    },
    enabled: !!profile,
  });

  // Filter out passed profiles
  const activeMatches = matches?.filter(m => !passedProfiles.includes(m.id)) || [];

  const handleLike = async () => {
    if (!profile?.id || !activeMatches[currentIndex]) return;

    const targetProfile = activeMatches[currentIndex];

    try {
      const matchRecord = await matchingService.createMatch(profile.id, targetProfile.id);
      if (matchRecord) {
        await matchingService.recordClick(matchRecord.id, profile.id);
        const { data: updatedMatch } = await supabase
          .from('matches')
          .select('*')
          .eq('id', matchRecord.id)
          .single();

        if (updatedMatch?.status === 'mutual') {
          toast.success(`Match avec ${targetProfile.first_name} ! 🌟`);
        } else {
          toast.success('Signal envoyé ✨');
        }
      }
    } catch (error) {
      console.error('Like error:', error);
    }

    goToNext();
  };

  const handlePass = () => {
    if (activeMatches[currentIndex]) {
      setPassedProfiles(prev => [...prev, activeMatches[currentIndex].id]);
    }
    goToNext();
  };

  const handleSuperLike = async () => {
    if (!isPremium) {
      toast.error('Super Like réservé aux Premium');
      return;
    }
    toast.success('Super Like envoyé ! ⭐');
    handleLike();
  };

  const handleUndo = () => {
    if (passedProfiles.length > 0 && isPremium) {
      setPassedProfiles(prev => prev.slice(0, -1));
      toast.success('Profil restauré');
    }
  };

  const goToNext = () => {
    if (currentIndex < activeMatches.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Reset index when matches change
  useEffect(() => {
    setCurrentIndex(0);
  }, [matches?.length]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Star className="w-12 h-12 text-cosmic-red" />
        </motion.div>
      </div>
    );
  }

  if (!activeMatches || activeMatches.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-black px-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 rounded-full bg-cosmic-red/20 flex items-center justify-center mb-6"
        >
          <Sparkles className="w-12 h-12 text-cosmic-red" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Plus de profils</h2>
        <p className="text-white/50 mb-6">
          {passedProfiles.length > 0
            ? "Tu as vu tous les profils. Reviens demain pour en découvrir plus !"
            : "Aucun profil disponible pour le moment."}
        </p>
        {passedProfiles.length > 0 && isPremium && (
          <button
            onClick={() => setPassedProfiles([])}
            className="px-6 py-3 bg-cosmic-red rounded-xl font-medium flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Revoir les profils
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-4 flex items-center justify-between bg-black/90 backdrop-blur-xl border-b border-white/5 z-20">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cosmic-red" />
            Univers
          </h1>
          <p className="text-xs text-white/50">{activeMatches.length} profils à découvrir</p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-cosmic-red' : ''}`}
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-cosmic-red' : ''}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>

          {/* Filters */}
          {isPremium && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-white/5 rounded-xl"
            >
              <Filter className="w-5 h-5" />
            </button>
          )}

          {/* Elite Guardian */}
          {isElite && (
            <div className="flex items-center gap-1 px-3 py-2 bg-cosmic-gold/20 rounded-xl">
              <Shield className="w-4 h-4 text-cosmic-gold" />
              <span className="text-xs text-cosmic-gold font-medium">Guardian</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        {viewMode === 'cards' ? (
          /* Card Stack View */
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-sm h-[70vh] max-h-[600px]">
              <AnimatePresence>
                {activeMatches
                  .slice(currentIndex, currentIndex + 3)
                  .reverse()
                  .map((match, i, arr) => (
                    <ProfileCard
                      key={match.id}
                      profile={match}
                      onLike={handleLike}
                      onPass={handlePass}
                      onSuperLike={handleSuperLike}
                      isTop={i === arr.length - 1}
                      style={{
                        scale: 1 - (arr.length - 1 - i) * 0.05,
                        y: (arr.length - 1 - i) * 10,
                        zIndex: i,
                      }}
                    />
                  ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="h-full overflow-y-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {activeMatches.map((match, i) => {
                const isLocked = tier === 'free' && i >= 5;
                return (
                  <GridProfileCard
                    key={match.id}
                    profile={match}
                    onClick={() => !isLocked && setSelectedProfile(match)}
                    isLocked={isLocked}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons (Cards mode only) */}
      {viewMode === 'cards' && activeMatches.length > 0 && (
        <div className="flex-shrink-0 px-6 py-6 flex items-center justify-center gap-4 bg-gradient-to-t from-black via-black to-transparent">
          {/* Undo */}
          {isPremium && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleUndo}
              disabled={passedProfiles.length === 0}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center disabled:opacity-30"
            >
              <RotateCcw className="w-5 h-5 text-yellow-400" />
            </motion.button>
          )}

          {/* Pass */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePass}
            className="w-16 h-16 rounded-full bg-white/10 border-2 border-red-500/50 flex items-center justify-center"
          >
            <X className="w-8 h-8 text-red-500" />
          </motion.button>

          {/* Super Like */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSuperLike}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isPremium ? 'bg-blue-500' : 'bg-white/10'
            }`}
          >
            <Star className={`w-6 h-6 ${isPremium ? 'text-white' : 'text-white/30'}`} />
          </motion.button>

          {/* Like */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30"
          >
            <Heart className="w-8 h-8 text-white" />
          </motion.button>

          {/* Boost */}
          {isElite && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-full bg-cosmic-gold flex items-center justify-center"
            >
              <Zap className="w-5 h-5 text-black" />
            </motion.button>
          )}
        </div>
      )}

      {/* Profile Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProfile(null)}
          >
            <motion.div
              className="w-full max-w-lg bg-[#1c1c1e] rounded-t-3xl md:rounded-3xl max-h-[90vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Photo */}
              <div className="relative h-80">
                {getAvatarUrl(selectedProfile.avatar_url) ? (
                  <img
                    src={getAvatarUrl(selectedProfile.avatar_url)!}
                    alt={selectedProfile.first_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cosmic-red/30 to-pink-600/30 flex items-center justify-center">
                    <span className="text-8xl">
                      {ZODIAC_SYMBOLS[selectedProfile.sun_sign?.toLowerCase()] || '✨'}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1e] via-transparent to-transparent" />

                <button
                  onClick={() => setSelectedProfile(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Info */}
              <div className="p-6 -mt-16 relative">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{selectedProfile.first_name}</h2>
                  <span className="text-2xl">
                    {ZODIAC_SYMBOLS[selectedProfile.sun_sign?.toLowerCase()] || '✨'}
                  </span>
                </div>

                <p className="text-white/60 text-sm mb-4">
                  ☀️ {selectedProfile.sun_sign} • 🌙 {selectedProfile.moon_sign} • ↗️ {selectedProfile.ascendant_sign}
                </p>

                {/* Compatibility */}
                <div className="bg-white/5 rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/60">Compatibilité</span>
                    <span className="text-xl font-bold text-cosmic-gold">{selectedProfile.compatibility}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cosmic-red to-cosmic-gold rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedProfile.compatibility}%` }}
                    />
                  </div>
                </div>

                {selectedProfile.bio && (
                  <p className="text-white/80 text-sm mb-6">{selectedProfile.bio}</p>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedProfile(null);
                      handlePass();
                    }}
                    className="flex-1 py-3 bg-white/10 rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Passer
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProfile(null);
                      handleLike();
                    }}
                    className="flex-1 py-3 bg-cosmic-red rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <Heart className="w-5 h-5" />
                    Like
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quota indicator (FREE) */}
      {tier === 'free' && viewMode === 'cards' && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full">
          <p className="text-xs text-white/60">
            {Math.min(currentIndex + 1, 5)}/5 profils vus •{' '}
            <span className="text-cosmic-red">Passe Premium pour plus</span>
          </p>
        </div>
      )}
    </div>
  );
}
