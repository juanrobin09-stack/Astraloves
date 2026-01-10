import { useState, useEffect } from 'react';
import { Heart, X, Star, Eye, Flame, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import PremiumLimitModal from './PremiumLimitModal';

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
}

export default function SwipePageModern() {
  const { user } = useAuth();
  const { isPremium } = usePremiumStatus();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipesCount, setSwipesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'super' | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [superLikesRemaining, setSuperLikesRemaining] = useState(3);
  const [matchCount, setMatchCount] = useState(0);

  const SWIPE_LIMIT = 20;
  const canSwipe = isPremium || swipesCount < SWIPE_LIMIT;

  useEffect(() => {
    if (user) {
      loadProfiles();
      loadSwipesCount();
      loadMatchCount();
    }
  }, [user]);

  const loadProfiles = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: myProfile } = await supabase
        .from('astra_profiles')
        .select('gender, birth_date')
        .eq('id', user.id)
        .maybeSingle();

      if (!myProfile) return;

      const targetGender = myProfile.gender === 'male' ? 'female' : 'male';

      const { data, error } = await supabase
        .from('astra_profiles')
        .select('*')
        .eq('gender', targetGender)
        .neq('id', user.id)
        .limit(20);

      if (error) throw error;

      const profilesWithCompatibility = (data || []).map(profile => ({
        ...profile,
        compatibilityScore: Math.floor(Math.random() * 30) + 70
      }));

      setProfiles(profilesWithCompatibility);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSwipesCount = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('daily_swipes')
      .select('swipe_count')
      .eq('user_id', user.id)
      .eq('swipe_date', new Date().toISOString().split('T')[0])
      .maybeSingle();

    setSwipesCount(data?.swipe_count || 0);
  };

  const loadMatchCount = async () => {
    if (!user) return;

    const { count } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    setMatchCount(count || 0);
  };

  const handleSwipe = async (direction: 'left' | 'right' | 'super') => {
    if (!canSwipe && direction !== 'left') {
      setShowLimitModal(true);
      return;
    }

    if (direction === 'super' && superLikesRemaining <= 0) {
      return;
    }

    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    setSwipeDirection(direction);

    if (direction === 'super') {
      setSuperLikesRemaining(prev => prev - 1);
    }

    setTimeout(async () => {
      if (direction === 'right' || direction === 'super') {
        await supabase.from('swipes').insert({
          swiper_id: user!.id,
          swiped_id: currentProfile.id,
          direction: 'right',
          is_super_like: direction === 'super'
        });

        if (direction !== 'left') {
          await supabase.rpc('increment_swipe_count', { p_user_id: user!.id });
          setSwipesCount(prev => prev + 1);
        }
      }

      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };

  const getZodiacEmoji = (sign: string) => {
    const zodiacs: Record<string, string> = {
      'Bélier': '♈', 'Taureau': '♉', 'Gémeaux': '♊', 'Cancer': '♋',
      'Lion': '♌', 'Vierge': '♍', 'Balance': '♎', 'Scorpion': '♏',
      'Sagittaire': '♐', 'Capricorne': '♑', 'Verseau': '♒', 'Poissons': '♓'
    };
    return zodiacs[sign] || '⭐';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex gap-2 text-4xl mb-4 animate-pulse">
            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>🔥</span>
            <span className="animate-bounce" style={{ animationDelay: '150ms' }}>❤️</span>
            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>⭐</span>
          </div>
          <p className="text-white/60">Chargement des profils...</p>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-radial from-red-950/20 via-black to-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">😊</div>
          <h2 className="text-2xl font-bold text-white mb-3">Plus de profils pour aujourd'hui</h2>
          <p className="text-white/60 mb-6">Reviens demain pour découvrir de nouveaux profils !</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-full font-medium hover:scale-105 transition-transform"
          >
            Recharger
          </button>
        </div>
      </div>
    );
  }

  const progress = Math.round((currentProfile.compatibilityScore || 0));

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-radial from-red-950/30 via-black to-black" />
      <div className="fixed inset-0 opacity-30">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      <div className="fixed inset-0 bg-gradient-radial from-transparent via-transparent to-black opacity-60" />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-30 px-4 py-4 backdrop-blur-xl bg-black/40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 bg-black/80 px-4 py-2 rounded-full border border-yellow-600/40 backdrop-blur-xl">
            <Flame className="w-5 h-5 text-yellow-500 animate-pulse" />
            <span className="text-white font-medium">Swipes illimités</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black/80 px-3 py-2 rounded-full border border-red-500/40 backdrop-blur-xl">
              <Heart className="w-4 h-4 text-red-500 animate-pulse" fill="currentColor" />
              <span className="text-white font-medium">{matchCount}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/80 px-3 py-2 rounded-full border border-yellow-500/40 backdrop-blur-xl">
              <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
              <span className="text-white font-medium">{superLikesRemaining}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-24 pb-32">
        <div
          className={`w-full max-w-md transition-all duration-300 ${
            swipeDirection === 'left' ? 'translate-x-[-120%] rotate-[-20deg] opacity-0' :
            swipeDirection === 'right' ? 'translate-x-[120%] rotate-[20deg] opacity-0' :
            swipeDirection === 'super' ? 'translate-y-[-120%] scale-110 opacity-0' :
            'translate-x-0 translate-y-0 rotate-0 opacity-100'
          }`}
        >
          <div className="relative group hover:scale-[1.02] transition-transform duration-300">
            {/* Pulsing Border */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-pink-500 to-red-600 rounded-3xl opacity-75 blur-xl group-hover:opacity-100 transition-opacity animate-pulse-slow" />

            {/* Card Container */}
            <div className="relative bg-black/90 rounded-3xl overflow-hidden shadow-2xl border border-red-900/40">
              {/* Photo */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={currentProfile.photos[0] || 'https://via.placeholder.com/400x600?text=No+Photo'}
                  alt={currentProfile.first_name}
                  className="w-full h-full object-cover"
                />

                {/* Double Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />
                <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 via-transparent to-red-900/20" />

                {/* Profile Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-4xl font-bold text-white" style={{ textShadow: '0 0 20px rgba(239, 68, 68, 0.5)' }}>
                      {currentProfile.first_name}
                    </h2>
                    <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-white/90">
                    <span className="text-lg">{currentProfile.age} ans</span>
                    <div className="w-1 h-1 rounded-full bg-red-500" />
                    <span className="text-lg">{currentProfile.city}</span>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600/80 to-pink-600/80 backdrop-blur-md border border-red-400/30">
                    <span className="text-white font-medium text-sm">
                      {currentProfile.sun_sign} {getZodiacEmoji(currentProfile.sun_sign)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Compatibility Bar */}
              <div className="p-5 space-y-3 bg-gradient-to-b from-black/50 to-black/90">
                <div className="flex items-center justify-between">
                  <span className="text-red-400 text-sm font-medium tracking-wide">COMPATIBILITÉ</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                    {progress}%
                  </span>
                </div>

                <div className="relative h-3 bg-black/80 rounded-full overflow-hidden border border-red-900/40">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-900 via-red-600 to-pink-500 rounded-full animate-shimmer"
                    style={{ width: `${progress}%` }}
                  />
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 w-px bg-white/10"
                      style={{ left: `${(i + 1) * 10}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div className="p-5 bg-gradient-to-b from-black/90 to-black border-t border-red-900/20">
                <div className="flex items-start gap-2">
                  <span className="text-xl mt-1">❤️‍🔥</span>
                  <p className="text-white/80 leading-relaxed" style={{ textShadow: '0 0 10px rgba(239, 68, 68, 0.2)' }}>
                    {currentProfile.bio || 'Aucune bio disponible...'}
                  </p>
                </div>
              </div>

              {/* View Profile Button */}
              <div className="p-5 bg-black/95">
                <button className="w-full py-3 rounded-xl border-2 border-red-600 bg-black/50 hover:bg-red-600/20 text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 group hover:scale-105 hover:shadow-lg hover:shadow-red-600/50">
                  <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Voir le profil complet</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-8 left-0 right-0 z-20">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-center gap-6">
            {/* Pass Button */}
            <button
              onClick={() => handleSwipe('left')}
              className="relative group w-16 h-16 rounded-full bg-black border-2 border-red-900 hover:border-red-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12"
            >
              <div className="absolute inset-0 rounded-full bg-red-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <X className="w-7 h-7 text-red-600 relative z-10" strokeWidth={2.5} />
            </button>

            {/* Super Like Button */}
            <button
              onClick={() => handleSwipe('super')}
              disabled={superLikesRemaining <= 0}
              className="relative group w-24 h-24 rounded-full bg-gradient-to-br from-red-600 via-pink-600 to-red-500 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 shadow-2xl"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 blur-2xl opacity-60 group-hover:opacity-100 transition-opacity animate-pulse" />
              <Star className="w-10 h-10 text-yellow-300 relative z-10 animate-pulse-slow" fill="currentColor" strokeWidth={1.5} />
              {/* Rays */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-6 bg-gradient-to-t from-yellow-300/50 to-transparent rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    transform: `rotate(${i * 45}deg) translateY(-40px)`,
                    transformOrigin: 'center 40px'
                  }}
                />
              ))}
            </button>

            {/* Like Button */}
            <button
              onClick={() => handleSwipe('right')}
              disabled={!canSwipe}
              className="relative group w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 shadow-xl"
            >
              <div className="absolute inset-0 rounded-full bg-red-600 blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
              <Heart className="w-7 h-7 text-white relative z-10 group-hover:animate-pulse" fill="currentColor" />
            </button>
          </div>
        </div>
      </div>

      {showLimitModal && (
        <PremiumLimitModal
          onClose={() => setShowLimitModal(false)}
          onUpgrade={() => {
            setShowLimitModal(false);
            window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'subscription' } }));
          }}
        />
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.75; }
          50% { opacity: 1; }
        }

        @keyframes shimmer {
          0% { background-position: -100% 0; }
          100% { background-position: 100% 0; }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }

        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}
