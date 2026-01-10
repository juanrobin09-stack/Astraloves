import { useState, useEffect } from 'react';
import { Heart, X, Star, Eye, Flame, Check, Crown, Lock } from 'lucide-react';
import { datingProfiles, getZodiacEmoji, DatingProfile } from '../data/datingProfiles';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { calculateAstrologicalCompatibility, calculateInterestsCompatibility, calculateSimpleCompatibility, getCompatibilityMessage } from '../lib/compatibilityEngine';
import { useDailyLimits } from '../hooks/useDailyLimits';
import VerificationBadge from './VerificationBadge';
import UpgradePopup from './UpgradePopup';
import PlanBadge from './PlanBadge';
import Starfield from './Starfield';
import { vibrate } from '../utils/mobileUtils';
import { compatibilityService } from '../services/astraCompatibilityService';
import { StatsTracker } from '../lib/statsTracker';
import { getAgeRange } from '../lib/ageFilterService';
import MatchPopup from './MatchPopup';
import { calculateCompatibility } from '../lib/matchingService';
import { getProfilesToDiscover, recordSwipe, checkMutualMatch } from '../lib/discoveryService';

interface SwipePagePureProps {
  onNavigate?: (page: string) => void;
}

export default function SwipePagePure({ onNavigate }: SwipePagePureProps) {
  const { user } = useAuth();
  const swipeStats = useDailyLimits(user?.id);
  const [profiles, setProfiles] = useState<DatingProfile[]>(datingProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [signalType, setSignalType] = useState<'signal' | 'supernova' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMatchToast, setShowMatchToast] = useState(false);
  const [compatibilityProgress, setCompatibilityProgress] = useState(0);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<DatingProfile | null>(null);
  const [matchCompatibility, setMatchCompatibility] = useState(75);

  // Logs de debug pour vérifier le statut premium
  useEffect(() => {
    console.log('📊 [SwipePagePure] User premium flags:', {
      'user?.is_premium': user?.is_premium,
      'user?.premium_tier': user?.premium_tier
    });
    console.log('📊 [SwipePagePure] SwipeStats from hook:', {
      isPremium: swipeStats.isPremium,
      plan: swipeStats.plan,
      swipesLimit: swipeStats.swipesLimit,
      swipesUsed: swipeStats.swipesUsed,
      swipesRemaining: swipeStats.swipesRemaining,
      'swipesLimit === Infinity': swipeStats.swipesLimit === Infinity,
      'typeof swipesLimit': typeof swipeStats.swipesLimit
    });
  }, [user, swipeStats.isPremium, swipeStats.swipesLimit]);

  const handleMatchesClick = () => {
    if (onNavigate) {
      onNavigate('discovery');
    }
  };

  const currentProfile = profiles[currentIndex];

  useEffect(() => {
    loadProfiles();
  }, [user]);

  const loadProfiles = async () => {
    if (!user) {
      setProfiles(datingProfiles);
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 [SwipePagePure] Chargement des profils...');

      // Utiliser le service de découverte qui garantit l'exclusion des profils déjà swipés
      const discoveredProfiles = await getProfilesToDiscover(user.id, {});

      if (discoveredProfiles && discoveredProfiles.length > 0) {
        console.log(`✅ [SwipePagePure] ${discoveredProfiles.length} profils chargés`);
        setProfiles(discoveredProfiles);
      } else {
        console.log('⚠️ [SwipePagePure] Aucun nouveau profil disponible');
        setProfiles([]);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
      setProfiles(datingProfiles);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCompatibilityProgress(0);
    const timer = setTimeout(() => {
      setCompatibilityProgress(currentProfile?.compatibility || 0);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentIndex, currentProfile]);

  const handleCosmicSignal = async (type: 'signal' | 'supernova') => {
    if (isAnimating || !user || !currentProfile) return;

    if (!swipeStats.canSwipe) {
      vibrate.error();
      setShowLimitModal(true);
      return;
    }

    vibrate.light();
    setIsAnimating(true);
    setSignalType(type);

    try {
      if (!swipeStats.isPremium) {
        const result = await swipeStats.incrementSwipes();
        if (!result.success) {
          setShowLimitModal(true);
          setIsAnimating(false);
          setSignalType(null);
          return;
        }
      }

      // Déterminer l'action
      const action = type === 'supernova' ? 'superlike' : 'like';

      // Enregistrer le signal avec le service (garantit l'unicité)
      const signalResult = await recordSwipe(user.id, currentProfile.id, action);

      if (!signalResult.success) {
        if (signalResult.alreadyExists) {
          console.log('⚠️ [SignalsCosmiques] Profil déjà contacté, passer au suivant');
        } else {
          console.error('❌ [SignalsCosmiques] Erreur envoi signal:', signalResult.error);
        }
      } else {
        console.log(`✅ [SignalsCosmiques] Signal ${type} envoyé avec succès`);
      }

      StatsTracker.trackSwipe(user.id);
      setLikesCount(prev => prev + 1);
      StatsTracker.trackLike(currentProfile.id);

      // Vérifier match mutuel
      const isMutualMatch = await checkMutualMatch(user.id, currentProfile.id);

      if (isMutualMatch) {
        console.log('🎉 [SignalsCosmiques] CONNEXION COSMIQUE !');

        const [userId1, userId2] = [user.id, currentProfile.id].sort();

        // Calcul de la compatibilité
        const compatibility = await calculateCompatibility(user.id, currentProfile.id);

        // Créer le match
        const { error: matchError } = await supabase
          .from('matches')
          .upsert({
            user1_id: userId1,
            user2_id: userId2,
            user1_liked: true,
            user2_liked: true,
            statut: 'mutual',
            score: compatibility.score
          }, {
            onConflict: 'user1_id,user2_id'
          });

        if (!matchError) {
          setMatchCount(prev => prev + 1);
          vibrate.match();
          setMatchedProfile(currentProfile);
          setMatchCompatibility(compatibility.score);
          setShowMatchPopup(true);
          StatsTracker.trackMatch(user.id, currentProfile.id);
        } else {
          console.error('❌ [SignalsCosmiques] Erreur création connexion:', matchError);
        }
      }
    } catch (error) {
      console.error('Error sending cosmic signal:', error);
    }

    setTimeout(() => {
      if (currentIndex + 1 < profiles.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setProfiles([]);
        setCurrentIndex(0);
      }
      setSignalType(null);
      setIsAnimating(false);
    }, 300);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center pb-20">
        <div className="text-white text-center">
          <div className="text-4xl mb-3 animate-pulse text-red-500">✨</div>
          <p className="text-sm">Chargement des profils...</p>
        </div>
      </div>
    );
  }

  if (!currentProfile || profiles.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center pb-20">
        <div className="text-white text-center px-6 w-full max-w-xs">
          <div className="text-4xl mb-4">💫</div>
          <h2 className="text-lg font-bold mb-2">Plus de profils disponibles</h2>
          <p className="text-white/60 text-xs mb-5 leading-relaxed">Tu as vu tous les profils disponibles pour le moment.</p>
          <button
            onClick={() => {
              setCurrentIndex(0);
              loadProfiles();
            }}
            className="w-full max-w-[200px] mx-auto px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-bold active:scale-95 transition-transform shadow-lg text-sm"
          >
            Recharger
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden pb-32">
      {/* Animated Starfield Background */}
      <div className="fixed inset-0 pointer-events-none">
        <Starfield />
      </div>

      {/* Subtle red vignette */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(139, 0, 0, 0.15) 100%)'
      }} />

      {/* Header avec Compteurs Signaux Cosmiques */}
      <div
        className="fixed top-0 left-0 right-0 z-50 px-2 sm:px-4 py-2"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)' }}
      >
        <div className="max-w-md mx-auto">
          {/* Compteur Signaux avec barre de progression */}
          {swipeStats.swipesLimit === Infinity ? (
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md px-4 sm:px-5 py-3 rounded-xl border border-yellow-500/40 mb-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
                  <span className="text-white text-sm sm:text-base font-bold">Signaux Illimités</span>
                </div>
                <span className="text-yellow-400 text-xl sm:text-2xl font-bold">∞</span>
              </div>
            </div>
          ) : (
            <div className="bg-black/80 backdrop-blur-md px-4 sm:px-5 py-3 rounded-xl border border-pink-500/40 mb-2">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">💫</span>
                  <span className="text-white text-sm sm:text-base font-bold">Signaux Cosmiques</span>
                </div>
                <span className={`text-base sm:text-lg font-bold ${swipeStats.swipesRemaining > 3 ? 'text-pink-400' : 'text-orange-400'}`}>
                  {swipeStats.swipesRemaining}/{swipeStats.swipesLimit}
                </span>
              </div>
              {/* Barre de progression */}
              <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(swipeStats.swipesRemaining / swipeStats.swipesLimit) * 100}%`,
                    background: swipeStats.swipesRemaining > 3
                      ? 'linear-gradient(to right, #ec4899, #f472b6)'
                      : 'linear-gradient(to right, #f97316, #fb923c)'
                  }}
                />
              </div>
            </div>
          )}

          {/* Bouton Matchs */}
          <button
            onClick={handleMatchesClick}
            className="w-full bg-black/80 backdrop-blur-md px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border border-red-500/40 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 min-h-[48px]"
          >
            <Heart className="w-5 h-5 sm:w-5 sm:h-5 text-red-500" fill="currentColor" />
            <span className="text-white text-sm sm:text-base font-bold">Mes Connexions</span>
            {matchCount > 0 && (
              <span className="bg-red-500 text-white text-xs sm:text-sm font-bold rounded-full min-w-[24px] h-[24px] sm:min-w-[28px] sm:h-[28px] flex items-center justify-center px-1.5">
                {matchCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Card - Taille Optimisée Mobile */}
      <div className="relative z-10 flex items-center justify-center px-2 sm:px-4 pt-36 sm:pt-40 pb-28 sm:pb-32">
        <div
          className={`w-[92vw] max-w-[400px] sm:max-w-[380px] transition-all duration-300 ease-out ${
            signalType === 'signal'
              ? 'scale-95 opacity-0'
              : signalType === 'supernova'
              ? 'scale-110 opacity-0'
              : 'scale-100 opacity-100'
          }`}
          style={{
            animation: !signalType ? 'fadeSlideUp 0.5s ease-out' : undefined
          }}
        >
          {/* Card Container */}
          <div className="bg-black rounded-2xl overflow-hidden border border-red-500 shadow-2xl"
               style={{ boxShadow: '0 0 40px rgba(220, 20, 60, 0.3)' }}>

            {/* Banner Section - Optimisée Mobile */}
            <div className="relative w-full h-[22vh] max-h-[240px] sm:h-48 bg-black overflow-hidden">
              {currentProfile.banner ? (
                <>
                  {/* Blurred Background Layer for depth */}
                  <div className="absolute inset-0">
                    <img
                      src={currentProfile.banner}
                      alt="Background"
                      className="w-full h-full object-cover blur-md scale-110 opacity-40"
                    />
                  </div>

                  {/* Main Sharp Banner Image */}
                  <div className="absolute inset-0">
                    <img
                      src={currentProfile.banner}
                      alt="Bannière"
                      className="w-full h-full object-cover animate-subtle-zoom"
                    />
                  </div>

                  {/* Vignette effect - darkens edges, brightens center */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(ellipse at center, transparent 0%, transparent 30%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.6) 100%)'
                    }}
                  />

                  {/* Bottom to top gradient */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/80 to-transparent" />

                  {/* Subtle light effect from top */}
                  <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/5 to-transparent" />
                </>
              ) : (
                /* Pure Black Default Banner - No text, no decorations */
                <div className="w-full h-full bg-black" />
              )}
            </div>

            {/* Profile Info Section */}
            <div className="px-5 sm:px-5 pb-4 sm:pb-5 bg-black">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    {currentProfile.name}, {currentProfile.age}
                  </h2>
                  <VerificationBadge isPremium={currentProfile.verified} size="sm" />
                  <PlanBadge plan={currentProfile.premium_tier || 'free'} size="sm" />
                </div>
                <p className="text-gray-400 text-sm sm:text-base mb-3 truncate px-2">
                  📍 {currentProfile.location}
                </p>
                <div className="inline-flex items-center gap-2 bg-red-900/60 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-red-500/40">
                  <span className="text-sm sm:text-base">{getZodiacEmoji(currentProfile.zodiac)}</span>
                  <span className="text-white text-sm sm:text-base font-medium">{currentProfile.zodiac}</span>
                </div>
              </div>
            </div>

            {/* Compatibility Section - Compact */}
            <div className="px-4 sm:px-5 py-3 sm:py-4 bg-black">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-400 text-xs sm:text-sm font-medium uppercase tracking-wide">
                  Compatibilité
                </span>
                <span className="text-red-500 text-xl sm:text-2xl font-bold">
                  {currentProfile.compatibility}%
                </span>
              </div>

              <div className="h-3 sm:h-2 bg-gray-900 rounded-full overflow-hidden mb-2 sm:mb-3">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${compatibilityProgress}%`,
                    background: 'linear-gradient(to right, #dc2626 0%, #ef4444 50%, #ec4899 100%)'
                  }}
                />
              </div>

              {/* Message de compatibilité */}
              <div className="text-center">
                <p className="text-sm sm:text-base font-medium text-white/90">
                  {getCompatibilityMessage(currentProfile.compatibility)}
                </p>
              </div>
            </div>

            {/* Bio Section - Compact */}
            <div className="px-4 sm:px-5 py-3 sm:py-4 bg-black">
              <p className="text-white/90 text-sm sm:text-base leading-relaxed line-clamp-3">
                {currentProfile.bio}
              </p>
            </div>

            {/* View Profile Button */}
            <div className="px-4 sm:px-5 py-3 sm:py-4 bg-black">
              <button
                onClick={() => setShowFullProfile(true)}
                className="w-full bg-transparent border-2 border-red-500 hover:bg-red-500/10 text-white py-3 sm:py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-sm sm:text-base min-h-[48px]"
              >
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="truncate">Voir le profil complet</span>
              </button>
            </div>

            {/* Signaux Cosmiques - 2 Boutons Seulement */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 px-4 sm:px-6 py-5 sm:py-6 bg-black">
              {/* Signal Cosmique Normal 💫 */}
              <button
                onClick={() => handleCosmicSignal('signal')}
                disabled={isAnimating}
                className="flex-1 max-w-[180px] bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white py-3.5 sm:py-4 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 disabled:opacity-50 active:scale-95 shadow-lg shadow-pink-500/30 min-h-[52px]"
              >
                <span className="text-2xl">💫</span>
                <span className="text-base sm:text-lg">Signal</span>
              </button>

              {/* Super Nova ✨ */}
              <button
                onClick={() => handleCosmicSignal('supernova')}
                disabled={isAnimating}
                className="flex-1 max-w-[180px] bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:via-orange-400 hover:to-yellow-400 text-white py-3.5 sm:py-4 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 disabled:opacity-50 active:scale-95 shadow-lg shadow-orange-500/40 min-h-[52px]"
              >
                <span className="text-2xl">✨</span>
                <span className="text-base sm:text-lg">Super Nova</span>
              </button>
            </div>

            {/* Info text sous les boutons */}
            <div className="px-4 pb-4 bg-black text-center">
              <p className="text-white/50 text-xs sm:text-sm">
                💫 Signal Normal | ✨ Super Nova = Plus de chances
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Connexion Cosmique Toast */}
      {showMatchToast && (
        <div
          className="fixed top-36 sm:top-40 left-1/2 transform -translate-x-1/2 z-50 px-2 max-w-[calc(100vw-16px)]"
          style={{ animation: 'slideDown 2s ease-out' }}
        >
          <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-orange-600 text-white px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3.5 rounded-full shadow-2xl border border-pink-400 flex items-center gap-2 sm:gap-2.5 md:gap-3 whitespace-nowrap">
            <span className="text-lg sm:text-xl animate-pulse flex-shrink-0">✨</span>
            <span className="font-bold text-xs sm:text-sm md:text-base">Connexion Cosmique ! 🌟</span>
          </div>
        </div>
      )}

      {/* Full Profile Modal */}
      {showFullProfile && (
        <div
          className="fixed inset-0 z-[100000] bg-black overflow-y-auto"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="min-h-screen p-2 sm:p-4">
            {/* Close Button */}
            <button
              onClick={() => setShowFullProfile(false)}
              className="fixed top-2 right-2 sm:top-4 sm:right-4 w-12 h-12 sm:w-12 sm:h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center z-[100001] transition-colors shadow-lg active:scale-95"
              style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}
            >
              <X className="w-6 h-6 text-white" strokeWidth={2.5} />
            </button>

            {/* Full Profile Content */}
            <div className="max-w-md mx-auto pt-16 sm:pt-20 pb-28 sm:pb-32">
              {/* Main Photo - Only show if not from Pexels */}
              {currentProfile.banner && !currentProfile.banner.includes('pexels.com') && !currentProfile.banner.includes('placeholder') ? (
                <img
                  src={currentProfile.banner}
                  alt={currentProfile.name}
                  className="w-full rounded-xl sm:rounded-2xl mb-4 sm:mb-6 shadow-2xl"
                />
              ) : currentProfile.photo && !currentProfile.photo.includes('pexels.com') && !currentProfile.photo.includes('placeholder') ? (
                <img
                  src={currentProfile.photo}
                  alt={currentProfile.name}
                  className="w-full rounded-xl sm:rounded-2xl mb-4 sm:mb-6 shadow-2xl"
                />
              ) : (
                <div className="w-full h-64 sm:h-96 bg-black rounded-xl sm:rounded-2xl mb-4 sm:mb-6" />
              )}

              {/* Name & Location */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                    {currentProfile.name}, {currentProfile.age}
                  </h2>
                  {currentProfile.verified && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg flex items-center gap-2">
                  📍 {currentProfile.location}
                </p>
              </div>

              {/* About Section - Only show if bio exists */}
              {currentProfile.bio && currentProfile.bio.trim() !== '' && (
                <div className="bg-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 mb-3 sm:mb-4">
                  <h3 className="text-red-500 font-bold text-base sm:text-lg mb-2 sm:mb-3">À propos</h3>
                  <p className="text-white text-sm sm:text-base leading-relaxed">{currentProfile.bio}</p>
                </div>
              )}

              {/* Compatibility Section */}
              <div className="bg-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 mb-3 sm:mb-4">
                <h3 className="text-red-500 font-bold text-base sm:text-lg mb-2 sm:mb-3">Compatibilité</h3>
                <div className="text-4xl sm:text-5xl font-bold text-red-500 mb-3 sm:mb-4">
                  {currentProfile.compatibility}%
                </div>
                <div className="h-2 sm:h-3 bg-gray-800 rounded-full overflow-hidden mb-3 sm:mb-4">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${currentProfile.compatibility}%`,
                      background: 'linear-gradient(to right, #dc2626 0%, #ef4444 50%, #ec4899 100%)'
                    }}
                  />
                </div>
                <p className="text-base sm:text-lg font-semibold text-white text-center">
                  {getCompatibilityMessage(currentProfile.compatibility)}
                </p>
              </div>

              {/* Zodiac Section */}
              <div className="bg-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 mb-3 sm:mb-4">
                <h3 className="text-red-500 font-bold text-base sm:text-lg mb-2 sm:mb-3">Signe astrologique</h3>
                <p className="text-white text-xl sm:text-2xl flex items-center gap-2 sm:gap-3">
                  {getZodiacEmoji(currentProfile.zodiac)} {currentProfile.zodiac}
                </p>
              </div>

              {/* Interests Section */}
              {currentProfile.interests && currentProfile.interests.length > 0 && (
                <div className="bg-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6">
                  <h3 className="text-red-500 font-bold text-base sm:text-lg mb-2 sm:mb-3">Centres d'intérêt</h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {currentProfile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-900/40 border border-red-500/40 rounded-full text-white text-xs sm:text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons in Modal */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                <button
                  onClick={() => {
                    setShowFullProfile(false);
                    handleSwipe('left');
                  }}
                  className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-900 hover:bg-gray-800 border-2 border-gray-700 hover:border-red-500 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                >
                  <X className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400" strokeWidth={2.5} />
                </button>

                <button
                  onClick={() => {
                    setShowFullProfile(false);
                    handleSwipe('super');
                  }}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-red-500/50 active:scale-95"
                >
                  <Star className="w-7 h-7 sm:w-9 sm:h-9 text-yellow-400" fill="currentColor" />
                </button>

                <button
                  onClick={() => {
                    setShowFullProfile(false);
                    handleSwipe('right');
                  }}
                  className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                >
                  <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Popup */}
      <UpgradePopup
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        title="Limite de swipes atteinte"
        message={`Vous avez utilisé vos ${swipeStats.swipesLimit} swipes quotidiens`}
        feature="Swipes illimités"
        plans={['premium', 'premium_elite']}
        onNavigate={onNavigate}
      />

      <style>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.92);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translate(-50%, -100%);
          }
          10% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
          90% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes subtle-zoom {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        .animate-subtle-zoom {
          animation: subtle-zoom 20s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }
      `}</style>

      {/* Popup de Match */}
      {showMatchPopup && matchedProfile && user && (
        <MatchPopup
          currentUserPhoto={user.user_metadata?.avatar_url || ''}
          currentUserName={user.user_metadata?.first_name || 'Toi'}
          matchedUserPhoto={matchedProfile.photos[0] || ''}
          matchedUserName={matchedProfile.first_name}
          matchedUserAge={matchedProfile.age}
          compatibilityScore={matchCompatibility}
          onSendMessage={() => {
            setShowMatchPopup(false);
            if (onNavigate) {
              onNavigate('messages');
            }
          }}
          onClose={() => setShowMatchPopup(false)}
        />
      )}
    </div>
  );
}
