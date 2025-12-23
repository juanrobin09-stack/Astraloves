import { useState, useEffect, useRef } from 'react';
import { Heart, X, Star, Info, MapPin, Zap, Brain, Shield, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { useAstraAI } from '../hooks/useAstraAI';
import LogoutButton from './LogoutButton';

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

export default function SwipePageAI() {
  const { user } = useAuth();
  const { isPremium } = usePremiumStatus();
  const { insights, preferences, recordSwipe, markInsightDisplayed, getAISuggestions } = useAstraAI();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipesCount, setSwipesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'super' | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchCurrent, setTouchCurrent] = useState<{ x: number; y: number } | null>(null);
  const [cardViewStartTime, setCardViewStartTime] = useState<number>(Date.now());
  const [hesitationCount, setHesitationCount] = useState(0);
  const [showAIInsight, setShowAIInsight] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestedProfiles, setAISuggestedProfiles] = useState<Profile[]>([]);

  const lastPositionRef = useRef<number>(0);

  const SWIPE_LIMIT = 20; // 20 swipes per day for free users
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
  }, [currentIndex]);

  // Afficher insights après 3 swipes
  useEffect(() => {
    if (swipesCount > 0 && swipesCount % 3 === 0 && insights.length > 0 && !showAIInsight) {
      setShowAIInsight(true);
    }
  }, [swipesCount, insights]);

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
        .select(`
          *,
          verification:astra_profile_verification(verification_score, verified_badge)
        `)
        .neq('id', user.id);

      if (swipedIds.length > 0) {
        query = query.not('id', 'in', `(${swipedIds.join(',')})`);
      }

      const { data: availableProfiles } = await query
        .gte('age', currentProfile.age_min || 18)
        .lte('age', currentProfile.age_max || 99)
        .limit(20);

      setProfiles(availableProfiles || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
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

  const handleSwipe = async (direction: 'left' | 'right' | 'super') => {
    if (!canSwipe || !user || currentIndex >= profiles.length) return;

    const swipedProfile = profiles[currentIndex];
    setSwipeDirection(direction);

    // Calculer métriques
    const timeSpentMs = Date.now() - cardViewStartTime;
    const swipeVelocity = touchStart && touchCurrent
      ? Math.abs(touchCurrent.x - touchStart.x) / (Date.now() - touchStart.time) * 1000
      : 50;

    setTimeout(async () => {
      try {
        await supabase.from('swipes').insert({
          user_id: user.id,
          swiped_user_id: swipedProfile.id,
          direction: direction
        });

        // Enregistrer analytics IA
        await recordSwipe(
          swipedProfile.id,
          direction,
          timeSpentMs,
          hesitationCount,
          Math.min(Math.round(swipeVelocity), 100),
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
    setTouchStart({ x: touch.clientX, y: touch.clientY, time: Date.now() });
    lastPositionRef.current = touch.clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touch = e.touches[0];
    setTouchCurrent({ x: touch.clientX, y: touch.clientY });

    // Détecter hésitation (changement de direction)
    const currentDirection = touch.clientX - lastPositionRef.current;
    if (Math.abs(currentDirection) > 10 && Math.sign(currentDirection) !== Math.sign(touch.clientX - touchStart.x)) {
      setHesitationCount(prev => prev + 1);
    }
    lastPositionRef.current = touch.clientX;
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

  const loadAISuggestions = async () => {
    const suggestions = await getAISuggestions(3);
    setAISuggestedProfiles(suggestions);
    setShowAISuggestions(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
          <div className="text-white text-xl">Astra analyse les meilleurs profils pour toi...</div>
        </div>
      </div>
    );
  }

  // Afficher popup fatigue
  if (showAIInsight && insights.length > 0 && insights[0].insight_type === 'fatigue') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-black/80 backdrop-blur-xl border-2 border-red-600/30 rounded-3xl p-8 text-center">
          <Brain className="w-20 h-20 text-red-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-4">Astra détecte une fatigue</h2>
          <p className="text-gray-300 mb-2 whitespace-pre-line">{insights[0].message}</p>

          <div className="mt-8 space-y-3">
            <button
              onClick={loadAISuggestions}
              className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:from-red-700 hover:to-red-800 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Voir 3 profils IA-sélectionnés
            </button>
            <button
              onClick={() => {
                markInsightDisplayed(insights[0].id);
                setShowAIInsight(false);
              }}
              className="w-full px-6 py-4 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-all"
            >
              Continuer à swiper
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Afficher suggestions IA
  if (showAISuggestions && aiSuggestedProfiles.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pb-28 px-4">
        <div className="max-w-screen-xl mx-auto py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2 mb-2">
                <Brain className="w-8 h-8 text-red-500" />
                Sélection IA
              </h1>
              <p className="text-gray-400 text-sm">Profils optimisés selon tes préférences</p>
            </div>
            <button
              onClick={() => setShowAISuggestions(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {aiSuggestedProfiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-gray-900 border border-red-600/30 rounded-2xl overflow-hidden"
              >
                <div className="flex gap-4 p-4">
                  <img
                    src={profile.photos?.[0] || '/logo.png'}
                    alt={profile.first_name}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white">{profile.first_name}, {profile.age}</h3>
                      {profile.verification?.[0]?.verified_badge && (
                        <Shield className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    {profile.city && (
                      <div className="flex items-center gap-1 text-gray-400 text-sm mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.city}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-green-500 font-bold text-sm">
                        {profile.ai_compatibility_score}% compatible
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
          {preferences && (
            <div className="mb-8 p-4 bg-black/60 rounded-xl border border-red-600/30">
              <Brain className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-white font-bold">Ton score attractivité : {preferences.attractiveness_score}/100</p>
            </div>
          )}
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
  const verificationScore = currentProfile.verification?.[0]?.verification_score || 50;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pb-28">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500" />
            Découvrir
          </h1>
          <div className="flex items-center gap-3">
            <LogoutButton />
            {preferences && (
              <div className="bg-black/60 backdrop-blur-lg px-3 py-2 rounded-full border border-green-600/30">
                <span className="text-green-500 font-bold text-sm flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Score: {preferences.attractiveness_score}
                </span>
              </div>
            )}
            <div className="bg-black/60 backdrop-blur-lg px-4 py-2 rounded-full border border-red-600/30">
              {isPremium ? (
                <span className="text-red-500 font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Illimité
                </span>
              ) : (
                <span className="text-white font-bold">
                  {swipesCount}/{SWIPE_LIMIT}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* AI Insights Banner */}
        {insights.length > 0 && !showAIInsight && insights[0].insight_type !== 'fatigue' && (
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

              {/* Verification Badge */}
              {currentProfile.verification?.[0]?.verified_badge && (
                <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-2 bg-blue-600/90 backdrop-blur-sm rounded-full">
                  <Shield className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-bold">Vérifié Astra</span>
                </div>
              )}

              {/* Verification Score */}
              {verificationScore >= 70 && (
                <div className="absolute top-6 right-6 px-3 py-2 bg-green-600/90 backdrop-blur-sm rounded-full">
                  <span className="text-white text-sm font-bold">{verificationScore}% confiance</span>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-4xl font-bold">{currentProfile.first_name}</h2>
                  <span className="text-3xl font-semibold">{currentProfile.age}</span>
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

        <div className="flex items-center justify-center gap-6 mt-8">
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
            onClick={() => handleSwipe('super')}
            disabled={!isPremium || !canSwipe}
            className="w-16 h-16 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:opacity-50 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all disabled:cursor-not-allowed relative"
          >
            <Star className="w-8 h-8 text-white" fill="white" />
            {!isPremium && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-black" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
