import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { matchingService } from '@/services/matching/matchingService';
import { supabase } from '@/config/supabase';
import { toast } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Heart, X, Star, Sparkles, Filter, Grid3X3, Layers,
  MapPin, Crown, Shield, Zap, RotateCcw, Lock,
  MessageCircle, Users, Send, Lightbulb
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

interface MatchRecord {
  id: string;
  user1_id: string;
  user2_id: string;
  status: string;
  created_at: string;
  profile?: Profile;
}

// Zodiac symbols
const ZODIAC_SYMBOLS: Record<string, string> = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
  leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
  sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
};

// ASTRA Tips based on zodiac compatibility
const ASTRA_TIPS: Record<string, string[]> = {
  high: [
    "Connexion cosmique forte ! Parle de tes rêves et aspirations.",
    "Vos énergies sont alignées. Propose une activité créative.",
    "L'univers favorise cette rencontre. Sois authentique.",
  ],
  medium: [
    "Potentiel intéressant. Explore ses passions pour créer du lien.",
    "Vos différences peuvent être complémentaires. Reste curieux.",
    "Montre ton côté unique, c'est ce qui peut faire la différence.",
  ],
  low: [
    "Défi cosmique ! Les opposés s'attirent parfois.",
    "Cherche les points communs inattendus.",
    "Cette connexion demande de la patience et de l'ouverture.",
  ],
};

// ASTRA Conversation starters
const ASTRA_STARTERS: Record<string, string[]> = {
  aries: ["Quelle est ta dernière aventure spontanée ?", "Tu préfères agir ou planifier ?"],
  taurus: ["Quel est ton plaisir coupable culinaire ?", "Tu as un endroit préféré pour te détendre ?"],
  gemini: ["Quel sujet pourrait te faire parler pendant des heures ?", "Tu lis quoi en ce moment ?"],
  cancer: ["Qu'est-ce qui te fait sentir chez toi ?", "Ta tradition préférée ?"],
  leo: ["Quel est ton talent caché ?", "Ta plus grande fierté récente ?"],
  virgo: ["Quel détail les gens ratent souvent ?", "Tu as une routine matinale ?"],
  libra: ["Art ou musique, tu choisis quoi ?", "Ta définition d'une soirée parfaite ?"],
  scorpio: ["Quelle est ta passion secrète ?", "Tu crois au destin ?"],
  sagittarius: ["Ton prochain voyage de rêve ?", "La leçon de vie la plus importante ?"],
  capricorn: ["Quel objectif te motive en ce moment ?", "Tu préfères les montagnes ou la mer ?"],
  aquarius: ["Quelle cause te tient à cœur ?", "Ta vision du futur idéal ?"],
  pisces: ["Tu te souviens de tes rêves ?", "Qu'est-ce qui t'inspire ?"],
};

// Avatar URL helper
const getAvatarUrl = (avatarUrl: string | null | undefined): string | null => {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('http')) return avatarUrl;
  const { data } = supabase.storage.from('avatars').getPublicUrl(avatarUrl);
  return data.publicUrl;
};

// Get random ASTRA tip
const getAstraTip = (compatibility: number): string => {
  const category = compatibility >= 80 ? 'high' : compatibility >= 50 ? 'medium' : 'low';
  const tips = ASTRA_TIPS[category];
  return tips[Math.floor(Math.random() * tips.length)];
};

// Get conversation starters for a sign
const getConversationStarters = (sign: string): string[] => {
  return ASTRA_STARTERS[sign?.toLowerCase()] || ASTRA_STARTERS.aries;
};

// ASTRA Star Logo
const AstraLogo = ({ size = 24 }: { size?: number }) => (
  <Star
    className="text-red-500"
    style={{
      width: size,
      height: size,
      fill: '#dc2626',
      filter: 'drop-shadow(0 0 4px #dc2626)',
    }}
  />
);

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
  const [showAstraTip, setShowAstraTip] = useState(false);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) onLike();
    else if (info.offset.x < -100) onPass();
  };

  const avatarUrl = getAvatarUrl(profile.avatar_url);
  const zodiacSymbol = ZODIAC_SYMBOLS[profile.sun_sign?.toLowerCase()] || '✨';
  const astraTip = getAstraTip(profile.compatibility);

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
            <img src={avatarUrl} alt={profile.first_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cosmic-red/30 to-pink-600/30 flex items-center justify-center">
              <span className="text-8xl opacity-30">{zodiacSymbol}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>

        {/* Like/Nope indicators */}
        <motion.div
          className="absolute top-8 right-8 px-4 py-2 bg-green-500 rounded-xl rotate-12 border-4 border-green-400"
          style={{ opacity: likeOpacity }}
        >
          <span className="text-2xl font-black text-white">LIKE</span>
        </motion.div>
        <motion.div
          className="absolute top-8 left-8 px-4 py-2 bg-red-500 rounded-xl -rotate-12 border-4 border-red-400"
          style={{ opacity: nopeOpacity }}
        >
          <span className="text-2xl font-black text-white">NOPE</span>
        </motion.div>

        {/* ASTRA Tip Button */}
        {isTop && (
          <motion.button
            className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-xl rounded-full z-10"
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAstraTip(!showAstraTip)}
          >
            <AstraLogo size={20} />
          </motion.button>
        )}

        {/* ASTRA Tip Popup */}
        <AnimatePresence>
          {showAstraTip && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-16 right-4 left-4 bg-black/80 backdrop-blur-xl rounded-2xl p-4 z-10 border border-cosmic-red/30"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-cosmic-red/20 flex items-center justify-center flex-shrink-0">
                  <AstraLogo size={16} />
                </div>
                <div>
                  <p className="text-xs text-cosmic-red font-medium mb-1">Conseil d'ASTRA</p>
                  <p className="text-sm text-white/90">{astraTip}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cosmic-red/90 rounded-full mb-3">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-bold">{profile.compatibility}% compatible</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold">{profile.first_name}</h2>
            <span className="text-3xl">{zodiacSymbol}</span>
          </div>

          <p className="text-white/70 text-sm mb-3">
            ☀️ {profile.sun_sign} • 🌙 {profile.moon_sign} • ↗️ {profile.ascendant_sign}
          </p>

          {profile.birth_city && (
            <div className="flex items-center gap-2 text-white/50 text-sm mb-3">
              <MapPin className="w-4 h-4" />
              <span>{profile.birth_city}</span>
            </div>
          )}

          {profile.bio && (
            <p className="text-white/80 text-sm line-clamp-2">{profile.bio}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Match Card Component (for Matches tab)
function MatchCard({
  match,
  currentUserId,
  onClick,
}: {
  match: MatchRecord;
  currentUserId: string;
  onClick: () => void;
}) {
  const profile = match.profile;
  if (!profile) return null;

  const avatarUrl = getAvatarUrl(profile.avatar_url);
  const zodiacSymbol = ZODIAC_SYMBOLS[profile.sun_sign?.toLowerCase()] || '✨';
  const isNew = new Date(match.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white/5 border border-white/10 rounded-2xl p-4 cursor-pointer"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cosmic-red">
            {avatarUrl ? (
              <img src={avatarUrl} alt={profile.first_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cosmic-red/30 to-pink-600/30 flex items-center justify-center">
                <span className="text-2xl">{zodiacSymbol}</span>
              </div>
            )}
          </div>
          {isNew && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-cosmic-red rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold">NEW</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{profile.first_name}</h3>
            <span>{zodiacSymbol}</span>
          </div>
          <p className="text-sm text-white/50 truncate">
            {profile.compatibility}% compatible • {profile.sun_sign}
          </p>
        </div>

        {/* Action */}
        <button className="w-10 h-10 bg-cosmic-red rounded-full flex items-center justify-center">
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

// Match Detail Modal with ASTRA
function MatchDetailModal({
  match,
  onClose,
  onStartChat,
}: {
  match: MatchRecord;
  onClose: () => void;
  onStartChat: () => void;
}) {
  const profile = match.profile;
  if (!profile) return null;

  const avatarUrl = getAvatarUrl(profile.avatar_url);
  const zodiacSymbol = ZODIAC_SYMBOLS[profile.sun_sign?.toLowerCase()] || '✨';
  const starters = getConversationStarters(profile.sun_sign);
  const astraTip = getAstraTip(profile.compatibility);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-lg bg-[#1c1c1e] rounded-t-3xl md:rounded-3xl max-h-[90vh] overflow-y-auto"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo */}
        <div className="relative h-64">
          {avatarUrl ? (
            <img src={avatarUrl} alt={profile.first_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cosmic-red/30 to-pink-600/30 flex items-center justify-center">
              <span className="text-8xl">{zodiacSymbol}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1e] via-transparent to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 -mt-12 relative">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">{profile.first_name}</h2>
            <span className="text-2xl">{zodiacSymbol}</span>
          </div>

          <p className="text-white/60 text-sm mb-4">
            ☀️ {profile.sun_sign} • 🌙 {profile.moon_sign} • ↗️ {profile.ascendant_sign}
          </p>

          {/* Compatibility */}
          <div className="bg-white/5 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">Compatibilité</span>
              <span className="text-xl font-bold text-cosmic-gold">{profile.compatibility}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cosmic-red to-cosmic-gold rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${profile.compatibility}%` }}
              />
            </div>
          </div>

          {/* ASTRA Section */}
          <div className="bg-cosmic-red/10 border border-cosmic-red/30 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <AstraLogo size={20} />
              <span className="font-semibold text-cosmic-red">Conseils d'ASTRA</span>
            </div>

            <p className="text-sm text-white/80 mb-4">{astraTip}</p>

            <div className="space-y-2">
              <p className="text-xs text-white/50 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                Idées pour briser la glace :
              </p>
              {starters.map((starter, i) => (
                <button
                  key={i}
                  className="w-full text-left text-sm p-3 bg-black/30 rounded-xl hover:bg-black/50 transition-colors"
                >
                  "{starter}"
                </button>
              ))}
            </div>
          </div>

          {profile.bio && (
            <p className="text-white/80 text-sm mb-6">{profile.bio}</p>
          )}

          {/* Actions */}
          <button
            onClick={onStartChat}
            className="w-full py-4 bg-cosmic-red rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Envoyer un message
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Main Component
export default function ConstellationView() {
  const { profile } = useAuthStore();
  const { tier, isPremium, isElite } = useSubscriptionStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'discover' | 'matches'>('discover');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'cards' | 'grid'>('cards');
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);
  const [passedProfiles, setPassedProfiles] = useState<string[]>([]);

  const visibleLimit = tier === 'free' ? 5 : tier === 'premium' ? 50 : 100;

  // Fetch potential matches
  const { data: potentialMatches, isLoading: loadingPotential } = useQuery({
    queryKey: ['matches', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      return matchingService.getPotentialMatches(profile.id, visibleLimit);
    },
    enabled: !!profile,
  });

  // Fetch mutual matches
  const { data: mutualMatches, isLoading: loadingMutual } = useQuery({
    queryKey: ['mutual-matches', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${profile.id},user2_id.eq.${profile.id}`)
        .eq('status', 'mutual')
        .order('created_at', { ascending: false });

      if (error) return [];

      // Fetch profiles for each match
      const matchesWithProfiles = await Promise.all(
        (data || []).map(async (match) => {
          const otherUserId = match.user1_id === profile.id ? match.user2_id : match.user1_id;
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherUserId)
            .single();

          return {
            ...match,
            profile: profileData ? { ...profileData, compatibility: 75 } : null,
          };
        })
      );

      return matchesWithProfiles.filter(m => m.profile);
    },
    enabled: !!profile,
  });

  const activeMatches = potentialMatches?.filter(m => !passedProfiles.includes(m.id)) || [];

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
          toast.success(`Match avec ${targetProfile.first_name} ! 🌟`, { duration: 3000 });
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

  const handleSuperLike = () => {
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

  const handleStartChat = (matchProfile: Profile) => {
    // Navigate to messages with this profile
    navigate(`/messages?user=${matchProfile.id}`);
  };

  useEffect(() => {
    setCurrentIndex(0);
  }, [potentialMatches?.length]);

  const isLoading = loadingPotential || loadingMutual;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Star className="w-12 h-12 text-cosmic-red" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header with Tabs */}
      <div className="flex-shrink-0 bg-black/95 backdrop-blur-xl border-b border-white/5 z-20">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cosmic-red" />
              Univers
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'discover' && (
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
            )}

            {isElite && (
              <div className="flex items-center gap-1 px-3 py-2 bg-cosmic-gold/20 rounded-xl">
                <Shield className="w-4 h-4 text-cosmic-gold" />
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 pb-3 flex gap-2">
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'discover' ? 'bg-cosmic-red text-white' : 'bg-white/5 text-white/50'
            }`}
          >
            <Users className="w-4 h-4" />
            Découvrir
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 relative ${
              activeTab === 'matches' ? 'bg-cosmic-red text-white' : 'bg-white/5 text-white/50'
            }`}
          >
            <Heart className="w-4 h-4" />
            Matchs
            {(mutualMatches?.length || 0) > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-cosmic-gold text-black text-xs font-bold rounded-full flex items-center justify-center">
                {mutualMatches?.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'discover' ? (
            /* DISCOVER TAB */
            <motion.div
              key="discover"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              {activeMatches.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center px-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 rounded-full bg-cosmic-red/20 flex items-center justify-center mb-6"
                  >
                    <Sparkles className="w-12 h-12 text-cosmic-red" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">Plus de profils</h2>
                  <p className="text-white/50 mb-6">Reviens demain pour découvrir plus de profils !</p>
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
              ) : viewMode === 'cards' ? (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="relative w-full max-w-sm h-[65vh] max-h-[550px]">
                    <AnimatePresence>
                      {activeMatches.slice(currentIndex, currentIndex + 3).reverse().map((match, i, arr) => (
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
                <div className="h-full overflow-y-auto px-4 py-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {activeMatches.map((match, i) => {
                      const isLocked = tier === 'free' && i >= 5;
                      const avatarUrl = getAvatarUrl(match.avatar_url);
                      const zodiacSymbol = ZODIAC_SYMBOLS[match.sun_sign?.toLowerCase()] || '✨';

                      return (
                        <motion.div
                          key={match.id}
                          whileHover={{ scale: 1.02 }}
                          className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer ${isLocked ? 'opacity-50' : ''}`}
                        >
                          {avatarUrl ? (
                            <img src={avatarUrl} className={`w-full h-full object-cover ${isLocked ? 'blur-md' : ''}`} />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-cosmic-red/30 to-pink-600/30 flex items-center justify-center">
                              <span className="text-4xl">{zodiacSymbol}</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          {isLocked ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Lock className="w-8 h-8 text-white/60" />
                            </div>
                          ) : (
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{match.first_name}</span>
                                <span>{zodiacSymbol}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-cosmic-red" />
                                <span className="text-xs text-cosmic-red font-medium">{match.compatibility}%</span>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* MATCHES TAB */
            <motion.div
              key="matches"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-y-auto"
            >
              {!mutualMatches || mutualMatches.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center px-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6"
                  >
                    <Heart className="w-12 h-12 text-white/30" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">Pas encore de matchs</h2>
                  <p className="text-white/50 mb-6">Continue à swiper pour trouver ton match cosmique !</p>
                  <button
                    onClick={() => setActiveTab('discover')}
                    className="px-6 py-3 bg-cosmic-red rounded-xl font-medium"
                  >
                    Découvrir des profils
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {/* ASTRA Match Tip */}
                  <div className="bg-cosmic-red/10 border border-cosmic-red/30 rounded-2xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-cosmic-red/20 flex items-center justify-center flex-shrink-0">
                        <AstraLogo size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-cosmic-red mb-1">ASTRA</p>
                        <p className="text-sm text-white/80">
                          Tu as {mutualMatches.length} match{mutualMatches.length > 1 ? 's' : ''} !
                          N'attends pas trop pour envoyer le premier message, les meilleures conversations commencent dans les 24h.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Match List */}
                  {mutualMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      currentUserId={profile?.id || ''}
                      onClick={() => setSelectedMatch(match)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons (Cards mode only, Discover tab) */}
      {activeTab === 'discover' && viewMode === 'cards' && activeMatches.length > 0 && (
        <div className="flex-shrink-0 px-6 py-4 flex items-center justify-center gap-4">
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

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePass}
            className="w-14 h-14 rounded-full bg-white/10 border-2 border-red-500/50 flex items-center justify-center"
          >
            <X className="w-7 h-7 text-red-500" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSuperLike}
            className={`w-11 h-11 rounded-full flex items-center justify-center ${isPremium ? 'bg-blue-500' : 'bg-white/10'}`}
          >
            <Star className={`w-5 h-5 ${isPremium ? 'text-white' : 'text-white/30'}`} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30"
          >
            <Heart className="w-7 h-7 text-white" />
          </motion.button>

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

      {/* Match Detail Modal */}
      <AnimatePresence>
        {selectedMatch && (
          <MatchDetailModal
            match={selectedMatch}
            onClose={() => setSelectedMatch(null)}
            onStartChat={() => {
              if (selectedMatch.profile) {
                handleStartChat(selectedMatch.profile);
              }
              setSelectedMatch(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Quota indicator (FREE, Discover) */}
      {tier === 'free' && activeTab === 'discover' && viewMode === 'cards' && activeMatches.length > 0 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full">
          <p className="text-xs text-white/60">
            {Math.min(currentIndex + 1, 5)}/5 •{' '}
            <span className="text-cosmic-red">Premium pour plus</span>
          </p>
        </div>
      )}
    </div>
  );
}
