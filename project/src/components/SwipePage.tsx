import { useState, useEffect } from 'react';
import { Heart, X, Star, Info, MapPin, Zap, Crown, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import PremiumCounter from './PremiumCounter';
import PremiumLimitModal from './PremiumLimitModal';
import CompatibilityDetailModal from './CompatibilityDetailModal';
import { calculateOverallCompatibility, getCompatibilityLabel, CompatibilityScore } from '../lib/compatibilityEngine';

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
  is_premium?: boolean;
  compatibilityScore?: number;
  fullCompatibilityScore?: CompatibilityScore;
}

export default function SwipePage() {
  const { user } = useAuth();
  const { isPremium } = usePremiumStatus();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipesCount, setSwipesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchCurrent, setTouchCurrent] = useState<{ x: number; y: number } | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [resetAt, setResetAt] = useState<Date>(new Date(new Date().setHours(24, 0, 0, 0)));
  const [loadingCompatibility, setLoadingCompatibility] = useState(false);
  const [showCompatibilityDetail, setShowCompatibilityDetail] = useState(false);

  const SWIPE_LIMIT = 20; // 20 swipes per day for free users
  const canSwipe = isPremium || swipesCount < SWIPE_LIMIT;

  useEffect(() => {
    if (user) {
      loadProfiles();
      loadSwipesCount();
    }
  }, [user]);

  useEffect(() => {
    if (user && profiles.length > 0 && currentIndex < profiles.length) {
      loadCompatibilityForCurrentProfile();
    }
  }, [currentIndex, profiles, user]);

  const loadProfiles = async () => {
    if (!user) return;

    try {
      const { data: currentProfile } = await supabase
        .from('astra_profiles')
        .select('gender, age_min, age_max, distance_max')
        .eq('id', user.id)
        .maybeSingle();

      if (!currentProfile) return;

      const { data: alreadySwiped } = await supabase
        .from('swipes')
        .select('swiped_user_id')
        .eq('user_id', user.id);

      const swipedIds = alreadySwiped?.map(s => s.swiped_user_id) || [];

      let query = supabase
        .from('astra_profiles')
        .select('id, first_name, age, photos, bio, city, gender, sun_sign, interests, is_premium')
        .neq('id', user.id);

      if (swipedIds.length > 0) {
        query = query.not('id', 'in', `(${swipedIds.join(',')})`);
      }

      let { data: availableProfiles } = await query
        .gte('age', currentProfile.age_min || 18)
        .lte('age', currentProfile.age_max || 99)
        .limit(20);

      if (availableProfiles) {
        availableProfiles = availableProfiles.sort((a, b) => {
          const aBoost = (a.is_premium ? 3 : 1);
          const bBoost = (b.is_premium ? 3 : 1);
          return bBoost - aBoost;
        });
      }

      setProfiles(availableProfiles || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompatibilityForCurrentProfile = async () => {
    if (!user || currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];
    if (currentProfile.compatibilityScore !== undefined) return;

    setLoadingCompatibility(true);
    try {
      const score = await calculateOverallCompatibility(user.id, currentProfile.id, isPremium);

      setProfiles(prev => prev.map((p, idx) =>
        idx === currentIndex ? {
          ...p,
          compatibilityScore: score.overall,
          fullCompatibilityScore: score
        } : p
      ));
    } catch (error) {
      console.error('Error calculating compatibility:', error);
    } finally {
      setLoadingCompatibility(false);
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

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!canSwipe || !user || currentIndex >= profiles.length) {
      if (!canSwipe) setShowLimitModal(true);
      return;
    }

    const swipedProfile = profiles[currentIndex];
    setSwipeDirection(direction);

    setTimeout(async () => {
      try {
        await supabase.from('swipes').insert({
          user_id: user.id,
          swiped_user_id: swipedProfile.id,
          direction: direction
        });

        if (!isPremium) {
          const { data } = await supabase.rpc('increment_swipe_count', {
            p_user_id: user.id
          });
          setSwipesCount(data || swipesCount + 1);
        }

        if (direction === 'right') {
          const { data: mutualLike } = await supabase
            .from('swipes')
            .select('id')
            .eq('user_id', swipedProfile.id)
            .eq('swiped_user_id', user.id)
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
        setTouchStart(null);
        setTouchCurrent(null);
      } catch (error) {
        console.error('Error handling swipe:', error);
        setSwipeDirection(null);
      }
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touch = e.touches[0];
    setTouchCurrent({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchCurrent) return;

    const deltaX = touchCurrent.x - touchStart.x;
    const deltaY = Math.abs(touchCurrent.y - touchStart.y);

    if (Math.abs(deltaX) > 100 && deltaY < 50) {
      if (deltaX > 0) {
        handleSwipe('right');
      } else {
        handleSwipe('left');
      }
    } else {
      setTouchStart(null);
      setTouchCurrent(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Chargement des profils...</div>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center px-4">
        <div className="text-center">
          <Star className="w-20 h-20 text-red-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-3xl font-bold text-white mb-4">Plus de profils pour le moment</h2>
          <p className="text-gray-400 mb-8">Reviens plus tard pour découvrir de nouvelles personnes !</p>
          <button
            onClick={() => {
              setCurrentIndex(0);
              loadProfiles();
            }}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full font-bold hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
          >
            Recharger
          </button>
        </div>
      </div>
    );
  }

  if (!canSwipe) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Zap className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Limite atteinte !</h2>
          <p className="text-gray-400 mb-2">Tu as utilisé tes {SWIPE_LIMIT} swipes gratuits aujourd'hui.</p>
          <p className="text-gray-300 mb-8">Reviens demain ou passe Premium pour des swipes illimités !</p>
          <button
            onClick={() => window.location.href = '/premium'}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full font-bold hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
          >
            Devenir Premium
          </button>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];
  const swipeOffset = touchStart && touchCurrent
    ? touchCurrent.x - touchStart.x
    : 0;
  const rotation = swipeOffset * 0.1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pb-20">
      <div className="max-w-screen-xl mx-auto px-4 pt-6 pb-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-red-500" />
            Découvrir
          </h1>
          <PremiumCounter
            current={swipesCount}
            limit={isPremium ? null : SWIPE_LIMIT}
            isPremium={isPremium}
            type="swipes"
            resetAt={resetAt}
          />
        </div>

        <div className="relative h-[calc(100vh-250px)] max-h-[700px] flex items-center justify-center">
          <div
            className={`absolute w-full max-w-md h-full transition-all duration-300 ${
              swipeDirection ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
            style={{
              transform: `translateX(${swipeOffset}px) rotate(${rotation}deg)`,
              transition: touchStart ? 'none' : 'transform 0.3s ease-out'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
              <img
                src={currentProfile.photos?.[0] || '/logo.png'}
                alt={currentProfile.first_name}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

              {currentProfile.compatibilityScore !== undefined && (
                <div className="absolute top-6 left-6">
                  <button
                    onClick={() => setShowCompatibilityDetail(true)}
                    className={`flex items-center gap-2 px-3 py-2 bg-black/80 backdrop-blur-lg rounded-full border-2 hover:scale-105 transition-transform ${
                      currentProfile.compatibilityScore >= 80 ? 'border-green-500/50 hover:border-green-500' :
                      currentProfile.compatibilityScore >= 60 ? 'border-blue-500/50 hover:border-blue-500' :
                      'border-yellow-500/50 hover:border-yellow-500'
                    }`}
                  >
                    <TrendingUp className={`w-4 h-4 ${getCompatibilityLabel(currentProfile.compatibilityScore).color}`} />
                    <span className="text-white font-bold text-sm">{currentProfile.compatibilityScore}%</span>
                    <span className="text-xs text-gray-300">{getCompatibilityLabel(currentProfile.compatibilityScore).text}</span>
                  </button>
                </div>
              )}

              {loadingCompatibility && (
                <div className="absolute top-6 left-6">
                  <div className="flex items-center gap-2 px-3 py-2 bg-black/80 backdrop-blur-lg rounded-full border-2 border-gray-500/50">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-white text-sm">Calcul...</span>
                  </div>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-4xl font-bold">{currentProfile.first_name}</h2>
                  <span className="text-3xl font-semibold">{currentProfile.age}</span>
                  {currentProfile.is_premium && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full">
                      <Crown className="w-4 h-4 text-white" />
                      <span className="text-xs font-bold text-white">PREMIUM</span>
                    </div>
                  )}
                </div>

                {currentProfile.city && (
                  <div className="flex items-center gap-2 text-gray-300 mb-3">
                    <MapPin className="w-5 h-5" />
                    <span>{currentProfile.city}</span>
                  </div>
                )}

                {currentProfile.sun_sign && (
                  <div className="inline-block px-3 py-1 bg-red-600/80 backdrop-blur-sm rounded-full text-sm font-medium mb-3">
                    {currentProfile.sun_sign}
                  </div>
                )}

                {currentProfile.bio && (
                  <p className="text-gray-200 text-base line-clamp-3 mb-3">
                    {currentProfile.bio}
                  </p>
                )}

                {currentProfile.interests && currentProfile.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentProfile.interests.slice(0, 3).map((interest, idx) => (
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
                onClick={() => alert('Voir le profil complet (à implémenter)')}
              >
                <Info className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 mb-safe">
          <button
            onClick={() => handleSwipe('left')}
            disabled={!canSwipe}
            className="w-16 h-16 bg-white hover:bg-gray-100 disabled:bg-gray-700 disabled:opacity-50 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all disabled:cursor-not-allowed"
          >
            <X className="w-8 h-8 text-red-500" />
          </button>

          <button
            onClick={() => handleSwipe('right')}
            disabled={!canSwipe}
            className="w-20 h-20 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-700 disabled:to-gray-800 disabled:opacity-50 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all disabled:cursor-not-allowed"
          >
            <Heart className="w-10 h-10 text-white" fill="white" />
          </button>

          <button
            onClick={() => alert('Super Like (fonctionnalité premium)')}
            disabled={!isPremium}
            className="w-16 h-16 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:opacity-50 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all disabled:cursor-not-allowed"
          >
            <Star className="w-8 h-8 text-white" fill="white" />
          </button>
        </div>
      </div>

      <PremiumLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        limitType="swipes"
        currentCount={swipesCount}
        maxCount={SWIPE_LIMIT}
        resetIn={`${Math.ceil((resetAt.getTime() - Date.now()) / (1000 * 60 * 60))}h`}
      />

      {currentProfile?.fullCompatibilityScore && (
        <CompatibilityDetailModal
          isOpen={showCompatibilityDetail}
          onClose={() => setShowCompatibilityDetail(false)}
          partnerName={currentProfile.first_name}
          score={currentProfile.fullCompatibilityScore}
        />
      )}
    </div>
  );
}
