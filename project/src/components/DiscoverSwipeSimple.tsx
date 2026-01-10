import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import FullProfileModal from './FullProfileModal';

interface Profile {
  id: number | string;
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
  is_demo?: boolean;
}

// Helper functions for daily swipe management
const SWIPES_STORAGE_KEY = 'astraloves_daily_swipes';
const MAX_DAILY_SWIPES = 5;

interface SwipeData {
  swipesLeft: number;
  lastResetDate: string;
}

function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
}

function getInitialSwipes(): number {
  try {
    const stored = localStorage.getItem(SWIPES_STORAGE_KEY);
    if (!stored) {
      return MAX_DAILY_SWIPES;
    }

    const data: SwipeData = JSON.parse(stored);
    const today = getTodayDateString();

    // Check if we need to reset (new day)
    if (data.lastResetDate !== today) {
      console.log('🔄 New day detected - resetting swipes to', MAX_DAILY_SWIPES);
      const newData: SwipeData = {
        swipesLeft: MAX_DAILY_SWIPES,
        lastResetDate: today
      };
      localStorage.setItem(SWIPES_STORAGE_KEY, JSON.stringify(newData));
      return MAX_DAILY_SWIPES;
    }

    // Same day, return stored value
    console.log('📊 Loading saved swipes:', data.swipesLeft);
    return data.swipesLeft;
  } catch (error) {
    console.error('Error loading swipes from localStorage:', error);
    return MAX_DAILY_SWIPES;
  }
}

function saveSwipes(swipesLeft: number): void {
  try {
    const data: SwipeData = {
      swipesLeft,
      lastResetDate: getTodayDateString()
    };
    localStorage.setItem(SWIPES_STORAGE_KEY, JSON.stringify(data));
    console.log('💾 Swipes saved:', swipesLeft);
  } catch (error) {
    console.error('Error saving swipes to localStorage:', error);
  }
}

export default function DiscoverSwipeSimple() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [remainingSwipes, setRemainingSwipes] = useState(getInitialSwipes);
  const [superLikes] = useState(3);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [userTier, setUserTier] = useState<string>('free');
  const [isLoadingTier, setIsLoadingTier] = useState(true);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

  const currentProfile = profiles[currentIndex];

  // Charger le tier de l'utilisateur
  useEffect(() => {
    const loadUserTier = async () => {
      if (!user) {
        setIsLoadingTier(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('astra_profiles')
          .select('premium_tier')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('❌ Erreur chargement tier:', error);
        } else if (data) {
          const tier = data.premium_tier || 'free';
          setUserTier(tier);
          console.log('✅ Tier utilisateur:', tier);
        }
      } catch (err) {
        console.error('❌ Exception chargement tier:', err);
      } finally {
        setIsLoadingTier(false);
      }
    };

    loadUserTier();
  }, [user]);

  // Charger les vrais profils depuis Supabase
  useEffect(() => {
    const fetchRealProfiles = async () => {
      if (!user) {
        setIsLoadingProfiles(false);
        return;
      }

      setIsLoadingProfiles(true);
      console.log('=== FETCH PROFILES ===');
      console.log('Current user ID:', user.id);

      try {
        // 1. Récupérer les IDs des profils déjà swipés
        const { data: swipedData } = await supabase
          .from('swipes')
          .select('target_id')
          .eq('user_id', user.id);

        const swipedIds = swipedData?.map(s => s.target_id) || [];
        console.log('📊 Profils déjà swipés:', swipedIds.length);

        // 2. Récupérer les profils non swipés depuis astra_profiles
        let query = supabase
          .from('astra_profiles')
          .select('*')
          .neq('id', user.id);

        // Exclure les profils déjà swipés
        if (swipedIds.length > 0) {
          query = query.not('id', 'in', `(${swipedIds.join(',')})`);
        }

        const { data, error } = await query
          .order('created_at', { ascending: false })
          .limit(20);

        console.log('Tous les profils dans la DB:', data?.length);
        console.log('Erreur éventuelle:', error);

        if (error) {
          console.error('❌ Erreur chargement profils:', error);
          setProfiles([]);
        } else {
          // Transformer les profils DB vers format interface
          const transformedProfiles: Profile[] = (data || []).map((p: any) => ({
            id: p.id,
            name: p.first_name || p.pseudo || 'Utilisateur',
            age: p.age || calculateAge(p.birth_date) || 25,
            location: p.ville || p.city || 'France',
            sign: p.signe_solaire || p.sun_sign || 'Balance',
            moonSign: p.lune,
            ascendant: p.ascendant,
            compatibility: Math.floor(Math.random() * 20) + 80,
            verified: false,
            plan: p.premium_tier === 'premium' ? 'premium' : p.premium_tier === 'elite' ? 'premium-plus' : 'free',
            photo: (p.photos && p.photos.length > 0) ? p.photos[0] : 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=800',
            photos: p.photos && p.photos.length > 0 ? p.photos : ['https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=800'],
            bio: p.bio || 'Passionné(e) de rencontres authentiques ✨',
            interests: p.interets || [],
            looking: p.looking_for,
            lives: 0,
            followers: 0,
            gifts: 0
          }));

          console.log(`✅ ${transformedProfiles.length} profils chargés`);

          setProfiles(transformedProfiles);
        }
      } catch (err) {
        console.error('❌ Exception chargement profils:', err);
        setProfiles([]);
      } finally {
        setIsLoadingProfiles(false);
      }
    };

    fetchRealProfiles();
  }, [user]);

  // Save swipes to localStorage whenever they change (only for free users)
  useEffect(() => {
    if (userTier === 'free') {
      saveSwipes(remainingSwipes);
    }
  }, [remainingSwipes, userTier]);

  // Déterminer si l'utilisateur est premium/elite
  const isPremiumOrElite = userTier === 'premium' || userTier === 'elite';

  const handlePass = () => {
    // Pour les utilisateurs premium/elite, pas de limite
    if (!isPremiumOrElite && remainingSwipes <= 0) {
      setShowLimitModal(true);
      return;
    }
    console.log('👋 Pass', currentProfile?.name);

    // Décrémenter uniquement pour les utilisateurs gratuits
    if (!isPremiumOrElite) {
      setRemainingSwipes(prev => prev - 1);
    }

    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(-1);
    }
  };

  const handleLike = () => {
    // Pour les utilisateurs premium/elite, pas de limite
    if (!isPremiumOrElite && remainingSwipes <= 0) {
      setShowLimitModal(true);
      return;
    }
    console.log('❤️ MATCH', currentProfile?.name);

    // Décrémenter uniquement pour les utilisateurs gratuits
    if (!isPremiumOrElite) {
      setRemainingSwipes(prev => prev - 1);
    }

    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(-1);
    }
  };

  const handleSuperLike = () => {
    console.log('⭐ SUPER LIKE ASTRA', currentProfile?.name);
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(-1);
    }
  };

  const openProfile = () => {
    setShowFullProfile(true);
  };

  if (isLoadingProfiles || isLoadingTier) {
    return (
      <div className="bg-gradient-to-br from-black via-red-900/30 to-black text-white h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⭐</div>
          <p className="text-gray-400 text-lg">Chargement des profils...</p>
        </div>
      </div>
    );
  }

  if (profiles.length === 0 || currentIndex === -1 || !currentProfile) {
    return (
      <div className="bg-gradient-to-br from-black via-red-900/30 to-black text-white h-full flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold mb-2">Plus de profils disponibles</h2>
          <p className="text-gray-400 mb-6">Reviens plus tard pour découvrir de nouveaux profils !</p>
          <button
            onClick={() => setCurrentIndex(0)}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-full font-semibold transition-colors"
          >
            Rafraîchir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-black via-red-900/30 to-black text-white h-full">
      {/* MOBILE VERSION */}
      <div className="block sm:hidden h-full flex flex-col">
        <MobileSwipeContent
          profile={currentProfile}
          remainingSwipes={remainingSwipes}
          isPremiumOrElite={isPremiumOrElite}
          superLikes={superLikes}
          onPass={handlePass}
          onLike={handleLike}
          onSuperLike={handleSuperLike}
          onOpenProfile={openProfile}
          currentIndex={currentIndex}
          totalProfiles={profiles.length}
        />
      </div>

      {/* DESKTOP VERSION */}
      <div className="hidden sm:flex min-h-screen flex-col">
        <DesktopSwipeContent
          profile={currentProfile}
          remainingSwipes={remainingSwipes}
          isPremiumOrElite={isPremiumOrElite}
          superLikes={superLikes}
          onPass={handlePass}
          onLike={handleLike}
          onSuperLike={handleSuperLike}
          onOpenProfile={openProfile}
          currentIndex={currentIndex}
          totalProfiles={profiles.length}
        />
      </div>

      {showFullProfile && currentProfile && (
        <FullProfileModal
          profile={currentProfile}
          onClose={() => setShowFullProfile(false)}
          onLike={handleLike}
          onPass={handlePass}
          onSuperLike={handleSuperLike}
        />
      )}

      {showLimitModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center">
              <div className="text-5xl mb-4">🚫</div>
              <h3 className="text-2xl font-bold text-white mb-3">Limite atteinte !</h3>
              <p className="text-gray-300 mb-6">
                Vous avez utilisé vos 5 swipes quotidiens gratuits.
              </p>
              <button
                onClick={() => {
                  setShowLimitModal(false);
                  // Trigger navigation to profile page
                  const event = new CustomEvent('navigate', { detail: { page: 'premium' } });
                  window.dispatchEvent(event);
                }}
                className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-black rounded-xl font-bold hover:from-yellow-700 hover:to-yellow-800 transition-all mb-3"
              >
                💎 Passer à Premium
              </button>
              <button
                onClick={() => setShowLimitModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// MOBILE COMPONENT
interface SwipeContentProps {
  profile: Profile;
  remainingSwipes: number;
  isPremiumOrElite: boolean;
  superLikes: number;
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  onOpenProfile: () => void;
  currentIndex: number;
  totalProfiles: number;
}

function MobileSwipeContent({
  profile,
  remainingSwipes,
  isPremiumOrElite,
  superLikes,
  onPass,
  onLike,
  onSuperLike,
  onOpenProfile,
}: SwipeContentProps) {
  return (
    <>
      {/* Header compact */}
      <header className="px-3 pt-3 pb-1 flex items-center justify-between text-[10px] flex-shrink-0">
        <div>
          {isPremiumOrElite ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-sm border border-red-600/30 rounded-full shadow-lg shadow-red-500/20">
              <span className="text-lg">⭐</span>
              <span className="text-red-400 text-xs font-bold tracking-wide">Swipes illimités</span>
            </div>
          ) : (
            <>
              <div className="text-gray-300">Swipes restants</div>
              <div className="text-yellow-300 text-base font-bold">{remainingSwipes}/5</div>
            </>
          )}
        </div>
        <div className="text-right">
          <div className="text-gray-300">Super Like Astra</div>
          <div className="text-pink-300 text-base font-bold">⭐ {superLikes}</div>
        </div>
      </header>

      {/* Carte centrée mobile */}
      <main className="flex-1 flex items-center justify-center px-2 pb-4 overflow-hidden">
        <div
          className="w-full max-w-xs bg-black/92 rounded-3xl shadow-xl flex flex-col"
          style={{ maxHeight: 'calc(100% - 20px)' }}
        >
          {/* Image */}
          <div className="relative h-36 overflow-hidden rounded-t-3xl flex-shrink-0">
            {profile.photo ? (
              <img
                src={profile.photo}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-black" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            {/* Badge Profil Démo */}
            {profile.is_demo && (
              <div className="absolute top-2 left-2 bg-orange-500/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg z-10">
                👤 Profil démo
              </div>
            )}

            <div className="absolute top-2 right-2 flex gap-1">
              {profile.verified && (
                <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white rounded-full text-[10px] font-bold">
                  ✓
                </span>
              )}
              {profile.plan === 'premium' && <span className="text-base">💎</span>}
              {profile.plan === 'premium-plus' && <span className="text-base">👑</span>}
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 px-4 pt-3 pb-1 overflow-y-auto no-scrollbar">
            <h2 className="text-lg font-extrabold">{profile.name}</h2>
            <p className="text-gray-300 text-[11px] mb-1">
              {profile.age} ans • {profile.location}
            </p>

            <div className="flex items-center mb-1">
              <span className="bg-red-700 px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1">
                {getSignEmoji(profile.sign)} {profile.sign}
              </span>
              <span className="ml-auto text-green-400 text-[11px] font-semibold">
                {profile.compatibility}%
              </span>
            </div>

            <div className="w-full h-1.5 bg-gray-700 rounded mb-2">
              <div
                className="h-1.5 bg-gradient-to-r from-red-400 via-yellow-300 to-green-400 rounded"
                style={{ width: `${profile.compatibility}%` }}
              />
            </div>

            <p className="text-gray-200 text-[11px] leading-snug mb-2 line-clamp-3">
              {profile.bio}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-2">
              {profile.interests.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-red-800/90 text-[10px] px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <button
              onClick={onOpenProfile}
              className="w-full bg-black/60 border border-gray-600 py-1.5 mb-1 rounded-2xl text-pink-200 text-[11px] font-semibold flex items-center justify-center gap-1"
            >
              👁️ Voir le profil complet
            </button>
          </div>

          {/* Boutons Tinder mobile */}
          <div className="flex items-center justify-center gap-4 py-2 bg-black/95 flex-shrink-0">
            <button
              onClick={onPass}
              className="w-11 h-11 rounded-full bg-gray-900 border border-gray-600 flex items-center justify-center shadow-md active:scale-90 transition-transform"
              aria-label="Passer"
            >
              <span className="text-lg">✕</span>
            </button>
            <button
              onClick={onSuperLike}
              className="w-13 h-13 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg border border-yellow-300 active:scale-90 transition-transform"
              aria-label="Super Like Astra"
            >
              <span className="text-xl">⭐</span>
            </button>
            <button
              onClick={onLike}
              className="w-11 h-11 rounded-full bg-red-500 flex items-center justify-center shadow-md active:scale-90 transition-transform"
              aria-label="Liker"
            >
              <span className="text-lg">❤️</span>
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

// DESKTOP COMPONENT
function DesktopSwipeContent({
  profile,
  remainingSwipes,
  isPremiumOrElite,
  superLikes,
  onPass,
  onLike,
  onSuperLike,
  onOpenProfile,
  currentIndex,
  totalProfiles,
}: SwipeContentProps) {
  return (
    <>
      {/* Header desktop */}
      <header className="px-4 pt-3 pb-2 flex items-center justify-between text-[11px] flex-shrink-0">
        <div>
          {isPremiumOrElite ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm border border-red-600/30 rounded-xl shadow-lg shadow-red-500/20">
              <span className="text-2xl">💫</span>
              <span className="text-red-400 text-sm font-bold tracking-wide">Swipes illimités</span>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="font-semibold text-gray-300">Swipes restants</span>
              <span className="text-yellow-300 text-lg font-bold">{remainingSwipes}/5</span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className="font-semibold text-gray-300">Super Like Astra</span>
          <span className="text-pink-300 text-lg font-bold">⭐ {superLikes}</span>
        </div>
      </header>

      {/* Carte centrée desktop */}
      <main className="flex-1 flex items-center justify-center px-3 pb-3 overflow-hidden">
        <div
          className="w-full max-w-sm bg-black/92 rounded-3xl shadow-2xl border border-red-500/20 flex flex-col"
          style={{ maxHeight: '90%' }}
        >
          {/* Image */}
          <div className="relative h-40 overflow-hidden rounded-t-3xl flex-shrink-0">
            {profile.photo ? (
              <img
                src={profile.photo}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-black" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

            {/* Badge Profil Démo */}
            {profile.is_demo && (
              <div className="absolute top-3 left-3 bg-orange-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10">
                👤 Profil démo
              </div>
            )}

            <div className="absolute top-3 right-3 flex gap-1.5">
              {profile.verified && (
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold shadow-lg">
                  ✓
                </span>
              )}
              {profile.plan === 'premium' && <span className="text-xl drop-shadow-lg">💎</span>}
              {profile.plan === 'premium-plus' && <span className="text-xl drop-shadow-lg">👑</span>}
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 px-5 pt-4 pb-1 overflow-y-auto no-scrollbar">
            <h3 className="text-xl font-bold text-white mb-0.5">{profile.name}</h3>
            <p className="text-neutral-400 text-xs">
              {profile.age} ans • {profile.location}
            </p>

            <div className="flex items-center gap-2 mb-3 mt-2">
              <div className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 px-3 py-1 rounded-full">
                <span className="text-base">{getSignEmoji(profile.sign)}</span>
                <span className="text-xs text-red-400 font-bold">{profile.sign}</span>
              </div>
              <span className="text-green-400 font-bold text-sm ml-auto">{profile.compatibility}%</span>
            </div>

            <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden mb-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-500 to-green-500 transition-all duration-500"
                style={{ width: `${profile.compatibility}%` }}
              />
            </div>

            <p className="text-neutral-300 text-xs leading-relaxed mb-3 line-clamp-3">
              {profile.bio}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {profile.interests.slice(0, 3).map((interest) => (
                <span
                  key={interest}
                  className="bg-red-700 text-white px-2.5 py-1 rounded-full text-xs font-semibold"
                >
                  {interest}
                </span>
              ))}
            </div>

            <button
              className="w-full py-2.5 bg-transparent border border-neutral-700 rounded-lg text-white text-xs font-bold hover:bg-neutral-800 hover:border-red-500 transition-all mb-3"
              onClick={onOpenProfile}
            >
              👁️ Voir le profil complet
            </button>
          </div>

          {/* Boutons Tinder desktop */}
          <div className="flex items-center justify-center gap-6 py-3 bg-black/95 flex-shrink-0">
            <button
              onClick={onPass}
              className="w-14 h-14 rounded-full bg-gray-900 border border-gray-600 flex items-center justify-center shadow-lg hover:bg-gray-800 hover:border-gray-500 active:scale-90 transition-all"
              aria-label="Passer"
            >
              <span className="text-xl">✕</span>
            </button>
            <button
              onClick={onSuperLike}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl border border-yellow-300 hover:scale-105 active:scale-90 transition-all"
              aria-label="Super Like Astra"
            >
              <span className="text-2xl">⭐</span>
            </button>
            <button
              onClick={onLike}
              className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center shadow-lg hover:scale-105 active:scale-90 transition-all"
              aria-label="Liker"
            >
              <span className="text-xl">❤️</span>
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-1.5 mt-3 flex-shrink-0">
          {Array.from({ length: totalProfiles }).map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-6 bg-red-500'
                  : index < currentIndex
                  ? 'w-1.5 bg-neutral-700'
                  : 'w-1.5 bg-neutral-800'
              }`}
            />
          ))}
        </div>
      </main>
    </>
  );
}

function calculateAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
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
