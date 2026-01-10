import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Heart, X, Star, Info, MapPin, Brain, Shield, TrendingUp, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { useAstraAI } from '../hooks/useAstraAI';
import LogoutButton from './LogoutButton';
import Starfield from './Starfield';

interface Profile {
  id: string;
  first_name: string;
  age: number;
  photos: string[];
  bio: string;
  city: string;
  gender: string;
  sun_sign: string;
  interests: string[];
  verification?: {
    verification_score: number;
    verified_badge: boolean;
  }[];
  ai_compatibility_score?: number;
}

const ProfileCard = memo(({
  profile,
  offset,
  rotation,
  isVisible,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onMouseDown
}: {
  profile: Profile;
  offset: number;
  rotation: number;
  isVisible: boolean;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
}) => {
  const verificationScore = profile.verification?.[0]?.verification_score || 50;

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{
        transform: `translateX(${offset}px) rotate(${rotation}deg) translateZ(0)`,
        transition: offset === 0 ? 'transform 0.3s ease-out' : 'none',
        willChange: 'transform'
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-red-600/30 bg-black/90 backdrop-blur-sm">
        <img
          src={profile.photos?.[0] || '/logo.png'}
          alt={profile.first_name}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        {profile.verification?.[0]?.verified_badge && (
          <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-2 bg-blue-600/90 backdrop-blur-sm rounded-full">
            <Shield className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-bold">Vérifié</span>
          </div>
        )}

        {verificationScore >= 70 && (
          <div className="absolute top-6 right-6 px-3 py-2 bg-green-600/90 backdrop-blur-sm rounded-full">
            <span className="text-white text-sm font-bold">{verificationScore}%</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-4xl font-bold">{profile.first_name}</h2>
            <span className="text-3xl font-semibold">{profile.age}</span>
          </div>

          {profile.city && (
            <div className="flex items-center gap-2 text-gray-300 mb-3">
              <MapPin className="w-5 h-5" />
              <span>{profile.city}</span>
            </div>
          )}

          {profile.sun_sign && (
            <div className="inline-block px-3 py-1 bg-red-600/80 backdrop-blur-sm rounded-full text-sm font-medium mb-3">
              {profile.sun_sign}
            </div>
          )}

          {profile.bio && (
            <p className="text-gray-200 text-base line-clamp-3 mb-3">
              {profile.bio}
            </p>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.interests.slice(0, 3).map((interest, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
          onClick={(e) => {
            e.stopPropagation();
            alert('Voir profil complet');
          }}
        >
          <Info className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
});

ProfileCard.displayName = 'ProfileCard';

export default function SwipePageOptimized() {
  const { user } = useAuth();
  const { isPremium } = usePremiumStatus();
  const { insights, preferences, recordSwipe, markInsightDisplayed } = useAstraAI();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipesCount, setSwipesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'super' | null>(null);

  const [offset, setOffset] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [cardViewStartTime, setCardViewStartTime] = useState<number>(Date.now());
  const [hesitationCount, setHesitationCount] = useState(0);

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastPositionRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const animationFrameRef = useRef<number>();

  const SWIPE_LIMIT = 20; // 20 swipes per day for free users
  const SWIPE_THRESHOLD = 100;
  const canSwipe = isPremium || swipesCount < SWIPE_LIMIT;

  useEffect(() => {
    if (user) {
      loadProfiles();
      loadSwipesCount();
    }
  }, [user]);

  useEffect(() => {
    setCardViewStartTime(Date.now());
    setHesitationCount(0);
    setOffset(0);
    setRotation(0);
  }, [currentIndex]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const loadProfiles = async () => {
    console.log('🔍 [SWIPE] === LOAD PROFILES START ===');
    console.log('🔍 [SWIPE] User ID:', user?.id);

    if (!user) {
      console.warn('🔍 [SWIPE] ❌ No user found');
      return;
    }

    try {
      const { data: currentProfile, error: profileError } = await supabase
        .from('astra_profiles')
        .select('gender, age_min, age_max, distance_max, visible_in_matching')
        .eq('id', user.id)
        .maybeSingle();

      console.log('🔍 [SWIPE] Current profile:', currentProfile);
      if (profileError) console.error('🔍 [SWIPE] Profile error:', profileError);

      if (!currentProfile) {
        console.error('🔍 [SWIPE] ❌ Current profile not found in database!');
        console.error('🔍 [SWIPE] ℹ️ User needs to complete onboarding first');
        return;
      }

      const { data: alreadySwiped, error: swipesError } = await supabase
        .from('swipes')
        .select('target_id')
        .eq('user_id', user.id);

      const swipedIds = alreadySwiped?.map(s => s.target_id) || [];
      console.log('🔍 [SWIPE] Already swiped:', swipedIds.length, 'profiles');

      console.log('🔍 [SWIPE] Query params:', {
        userId: user.id,
        ageMin: currentProfile.age_min || 18,
        ageMax: currentProfile.age_max || 99,
        excludedIds: swipedIds.length
      });

      let query = supabase
        .from('astra_profiles')
        .select('*')
        .neq('id', user.id)
        .eq('visible_in_matching', true)
        .eq('onboarding_completed', true);

      if (swipedIds.length > 0) {
        query = query.not('id', 'in', `(${swipedIds.join(',')})`);
      }

      const { data: availableProfiles, error: profilesError } = await query
        .gte('age', currentProfile.age_min || 18)
        .lte('age', currentProfile.age_max || 99)
        .limit(20);

      console.log('🔍 [SWIPE] Query result:', {
        count: availableProfiles?.length || 0,
        hasError: !!profilesError,
        errorDetails: profilesError
      });

      if (profilesError) {
        console.error('🔍 [SWIPE] ❌ Profiles error:', profilesError);
        console.error('🔍 [SWIPE] Error message:', profilesError.message);
        console.error('🔍 [SWIPE] Error details:', profilesError.details);
        console.error('🔍 [SWIPE] Error hint:', profilesError.hint);
      }

      if (availableProfiles && availableProfiles.length > 0) {
        console.log('🔍 [SWIPE] ✅ First profile:', {
          name: availableProfiles[0].first_name,
          age: availableProfiles[0].age,
          city: availableProfiles[0].ville
        });
      } else {
        console.warn('🔍 [SWIPE] ⚠️ No profiles available!');
        console.warn('🔍 [SWIPE] Possible reasons:');
        console.warn('  - All profiles already swiped');
        console.warn('  - No profiles match age criteria');
        console.warn('  - Database is empty');
      }

      setProfiles(availableProfiles || []);
      console.log('🔍 [SWIPE] === LOAD PROFILES END ===');
    } catch (error) {
      console.error('🔍 [SWIPE] ❌ Fatal error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSwipesCount = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('daily_swipes')
        .select('swipes_count')
        .eq('user_id', user.id)
        .eq('swipe_date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      setSwipesCount(data?.swipes_count || 0);
    } catch (error) {
      console.error('Error loading swipes count:', error);
    }
  };

  const handleSwipe = useCallback(async (direction: 'left' | 'right' | 'super') => {
    if (!canSwipe || !user || currentIndex >= profiles.length) return;

    const swipedProfile = profiles[currentIndex];
    setSwipeDirection(direction);

    const timeSpentMs = Date.now() - cardViewStartTime;
    const velocity = Math.abs(offset) / (Date.now() - (touchStartRef.current?.time || Date.now())) * 1000;

    setTimeout(async () => {
      try {
        await supabase.from('swipes').insert({
          user_id: user.id,
          target_id: swipedProfile.id,
          direction: direction
        });

        await recordSwipe(
          swipedProfile.id,
          direction,
          timeSpentMs,
          hesitationCount,
          Math.min(Math.round(velocity), 100),
          {
            age: swipedProfile.age,
            interests: swipedProfile.interests,
            sun_sign: swipedProfile.sun_sign,
            city: swipedProfile.city
          }
        );

        if (!isPremium) {
          const { data } = await supabase.rpc('increment_swipe_count', {
            p_user_id: user.id
          });
          setSwipesCount(data || swipesCount + 1);
        }

        if (direction === 'right' || direction === 'super') {
          const { data: mutualLike } = await supabase
            .from('swipes')
            .select('id')
            .eq('user_id', swipedProfile.id)
            .eq('target_id', user.id)
            .eq('direction', 'right')
            .maybeSingle();

          if (mutualLike) {
            await supabase.from('matches').insert({
              user1_id: user.id,
              user2_id: swipedProfile.id
            });

            alert(`C'est un match avec ${swipedProfile.first_name} ! 💕`);
          }
        }

        setCurrentIndex(currentIndex + 1);
        setSwipeDirection(null);
        touchStartRef.current = null;
      } catch (error) {
        console.error('Error handling swipe:', error);
        setSwipeDirection(null);
      }
    }, 300);
  }, [canSwipe, user, currentIndex, profiles, cardViewStartTime, hesitationCount, offset, isPremium, swipesCount, recordSwipe]);

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (!touchStartRef.current || !isDraggingRef.current) return;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const deltaX = clientX - touchStartRef.current!.x;
      const deltaY = Math.abs(clientY - touchStartRef.current!.y);

      if (Math.abs(deltaX) > 10 && deltaY < 50) {
        setOffset(deltaX);
        setRotation(deltaX * 0.1);

        const currentDirection = deltaX - lastPositionRef.current;
        if (Math.abs(currentDirection) > 10 && Math.sign(currentDirection) !== Math.sign(deltaX)) {
          setHesitationCount(prev => prev + 1);
        }
        lastPositionRef.current = deltaX;
      }
    });
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    lastPositionRef.current = touch.clientX;
    isDraggingRef.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    updatePosition(touch.clientX, touch.clientY);
  }, [updatePosition]);

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (Math.abs(offset) > SWIPE_THRESHOLD) {
      if (offset > 0) {
        handleSwipe('right');
      } else {
        handleSwipe('left');
      }
    } else {
      setOffset(0);
      setRotation(0);
    }
    touchStartRef.current = null;
  }, [offset, handleSwipe]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    touchStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    lastPositionRef.current = e.clientX;
    isDraggingRef.current = true;

    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      handleTouchEnd();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [updatePosition, handleTouchEnd]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleSwipe('left');
      } else if (e.key === 'ArrowRight') {
        handleSwipe('right');
      } else if (e.key === ' ') {
        e.preventDefault();
        if (isPremium) handleSwipe('super');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipe, isPremium]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
          <div className="text-white text-xl">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!canSwipe || currentIndex >= profiles.length) {
    const reason = !canSwipe
      ? 'limit_reached'
      : profiles.length === 0
        ? 'no_profiles'
        : 'all_swiped';

    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 pb-24 relative overflow-hidden">
        <Starfield />
        <div className="text-center max-w-md relative z-10">
          {reason === 'limit_reached' ? (
            <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
          ) : (
            <Sparkles className="w-20 h-20 text-yellow-500 mx-auto mb-6 drop-shadow-[0_0_12px_rgba(255,215,0,0.6)]" />
          )}

          <h2 className="text-3xl font-bold text-white mb-4">
            {reason === 'limit_reached' && 'Limite quotidienne atteinte !'}
            {reason === 'no_profiles' && 'Aucun profil disponible'}
            {reason === 'all_swiped' && 'Plus de profils pour aujourd\'hui'}
          </h2>

          <p className="text-gray-400 mb-6 text-lg">
            {reason === 'limit_reached' && (
              <>
                Tu as swipé <span className="text-white font-bold">{swipesCount}/20</span> profils aujourd'hui.
                <br />
                Deviens Premium pour swiper sans limite !
              </>
            )}
            {reason === 'no_profiles' && (
              <>
                Aucun profil ne correspond à tes critères pour le moment.
                <br />
                Reviens plus tard ou élargis tes filtres !
              </>
            )}
            {reason === 'all_swiped' && (
              <>
                Tu as vu tous les profils disponibles.
                <br />
                Reviens demain pour en découvrir de nouveaux !
              </>
            )}
          </p>

          <div className="space-y-3">
            {reason === 'limit_reached' ? (
              <button
                onClick={() => window.location.href = '#premium'}
                className="w-full px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full font-bold hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
              >
                ✨ Devenir Premium
              </button>
            ) : (
              <button
                onClick={() => {
                  console.log('🔄 Manual reload requested');
                  loadProfiles();
                }}
                className="w-full px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full font-bold hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
              >
                🔄 Recharger les profils
              </button>
            )}

            <button
              onClick={() => window.location.href = '#dashboard'}
              className="w-full px-8 py-4 bg-gray-900/80 border-2 border-gray-700 text-white rounded-full font-bold hover:bg-gray-800 transition-all"
            >
              ← Retour au Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="min-h-screen bg-black pb-28 safe-area-inset relative overflow-hidden">
      <Starfield />
      <div className="max-w-screen-xl mx-auto px-4 py-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 md:w-8 md:h-8 text-red-500 animate-pulse" />
            <span className="bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-500 bg-clip-text text-transparent animate-pulse">
              Découvrir
            </span>
          </h1>
          <div className="flex items-center gap-3">
            <LogoutButton />
            {preferences && (
              <div className="hidden md:block bg-black/60 backdrop-blur-lg px-3 py-2 rounded-full border border-green-600/30">
                <span className="text-green-500 font-bold text-sm flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {preferences.attractiveness_score}
                </span>
              </div>
            )}
            <div className="bg-black/60 backdrop-blur-lg px-3 md:px-4 py-2 rounded-full border border-red-600/30">
              {isPremium ? (
                <span className="text-red-500 font-bold text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="hidden md:inline">Illimité</span>
                </span>
              ) : (
                <span className="text-white font-bold text-sm">
                  {swipesCount}/{SWIPE_LIMIT}
                </span>
              )}
            </div>
          </div>
        </div>

        {insights.length > 0 && insights[0].insight_type !== 'fatigue' && (
          <div className="mb-4 p-4 bg-red-600/10 border border-red-600/30 rounded-xl flex items-start gap-3">
            <Brain className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-white text-sm">{insights[0].message}</p>
            </div>
            <button
              onClick={() => markInsightDisplayed(insights[0].id)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="relative h-[calc(100vh-300px)] md:h-[calc(100vh-250px)] max-h-[700px] flex items-center justify-center">
          <div className="relative w-full max-w-md h-full">
            <ProfileCard
              profile={currentProfile}
              offset={offset}
              rotation={rotation}
              isVisible={!swipeDirection}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 md:gap-6 mt-8">
          <button
            onClick={() => handleSwipe('left')}
            disabled={!canSwipe}
            className="w-14 h-14 md:w-16 md:h-16 bg-white hover:bg-gray-100 disabled:bg-gray-700 disabled:opacity-50 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:cursor-not-allowed touch-manipulation"
            style={{ boxShadow: '0 0 20px rgba(220, 20, 60, 0.5)' }}
          >
            <X className="w-7 h-7 md:w-8 md:h-8 text-red-500" />
          </button>

          <button
            onClick={() => handleSwipe('right')}
            disabled={!canSwipe}
            className="w-18 h-18 md:w-20 md:h-20 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-700 disabled:to-gray-800 disabled:opacity-50 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:cursor-not-allowed touch-manipulation"
            style={{ boxShadow: '0 0 30px rgba(220, 20, 60, 0.8)' }}
          >
            <Heart className="w-9 h-9 md:w-10 md:h-10 text-white" fill="white" />
          </button>

          <button
            onClick={() => handleSwipe('super')}
            disabled={!isPremium || !canSwipe}
            className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:bg-gray-700 disabled:opacity-50 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:cursor-not-allowed relative touch-manipulation"
            style={{ boxShadow: '0 0 20px rgba(255, 215, 0, 0.6)' }}
          >
            <Star className="w-7 h-7 md:w-8 md:h-8 text-white" fill="white" />
            {!isPremium && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        </div>

        <div className="hidden md:block text-center mt-4 text-gray-400 text-sm">
          <p>Raccourcis: ← Passer | → Like | Espace Super Like</p>
        </div>
      </div>
    </div>
  );
}
