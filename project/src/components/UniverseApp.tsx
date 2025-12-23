import { useState, useEffect, useRef, useMemo, TouchEvent } from 'react';
import { X, Star, Sparkles, Crown, Lock, Send, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { universeProfiles, UniverseProfile } from '../data/universeProfiles';
import { supabase } from '../lib/supabase';
import { getCompatibilityScore, getCompatibilityBorderColor, getCompatibilityLabel } from '../lib/realCompatibilityService';

type Plan = 'gratuit' | 'premium' | 'elite';

interface RealProfile extends UniverseProfile {
  userId?: string;
  realCompatibility?: number;
}

const SIZES = {
  mobile: {
    circle: 55,
    photo: 50,
    border: 2,
    fontSize: 10,
    badgeSize: 18,
    maxVisible: 12,
    cols: 3,
    spacingX: 110,
    spacingY: 100
  },
  desktop: {
    circle: 100,
    photo: 90,
    border: 3,
    fontSize: 14,
    badgeSize: 24,
    maxVisible: 25,
    cols: 5,
    spacingX: 180,
    spacingY: 160
  }
};

const UniverseApp = () => {
  const [userPlan, setUserPlan] = useState<Plan>('gratuit');
  const [signalsLeft, setSignalsLeft] = useState(10);
  const [superNovaLeft, setSuperNovaLeft] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<RealProfile | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [removedStars, setRemovedStars] = useState<number[]>([]);
  const [showSignalsReceived, setShowSignalsReceived] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [profiles, setProfiles] = useState<RealProfile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [incognito, setIncognito] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sizes = isMobile ? SIZES.mobile : SIZES.desktop;
  const starsPerPage = sizes.maxVisible;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setProfiles(universeProfiles);
          setLoading(false);
          return;
        }

        setCurrentUserId(user.id);

        const { data: realProfiles, error } = await supabase
          .from('astra_profiles')
          .select('id, pseudo, age, sun_sign, moon_sign, ascendant_sign, avatar_url, bio, ville, premium_tier')
          .neq('id', user.id)
          .limit(50);

        if (error || !realProfiles || realProfiles.length === 0) {
          setProfiles(universeProfiles);
          setLoading(false);
          return;
        }

        const profilesWithCompatibility = await Promise.all(
          realProfiles.map(async (profile, index) => {
            const compatibility = await getCompatibilityScore(user.id, profile.id);
            return {
              id: index + 1,
              userId: profile.id,
              name: profile.pseudo || 'Utilisateur',
              age: profile.age || 25,
              sign: getZodiacEmoji(profile.sun_sign),
              compatibility,
              realCompatibility: compatibility,
              plan: profile.premium_tier === 'premium_elite' ? 'elite' : profile.premium_tier === 'premium' ? 'premium' : 'gratuit',
              photo: profile.avatar_url || `https://i.pravatar.cc/150?img=${index + 1}`,
              bio: profile.bio || 'Pas encore de bio',
              sun: profile.sun_sign || 'Inconnu',
              moon: profile.moon_sign || 'Inconnu',
              ascendant: profile.ascendant_sign || 'Inconnu',
              city: profile.ville || 'Paris',
              x: 0,
              y: 0
            } as RealProfile;
          })
        );

        profilesWithCompatibility.sort((a, b) => b.compatibility - a.compatibility);
        setProfiles(profilesWithCompatibility);
        setLoading(false);
      } catch (error) {
        console.error('Error in loadProfiles:', error);
        setProfiles(universeProfiles);
        setLoading(false);
      }
    };

    loadProfiles();
  }, [userPlan]);

  const getZodiacEmoji = (sign: string | null): string => {
    if (!sign) return '⭐';
    const zodiacMap: Record<string, string> = {
      'aries': '♈', 'taurus': '♉', 'gemini': '♊', 'cancer': '♋',
      'leo': '♌', 'virgo': '♍', 'libra': '♎', 'scorpio': '♏',
      'sagittarius': '♐', 'capricorn': '♑', 'aquarius': '♒', 'pisces': '♓'
    };
    return zodiacMap[sign.toLowerCase()] || '⭐';
  };

  const getVisibleLimit = () => {
    if (userPlan === 'gratuit') return 15;
    if (userPlan === 'premium') return 50;
    return Infinity;
  };

  const visibleProfiles = profiles.filter(p => !removedStars.includes(p.id));
  const totalPages = Math.ceil(visibleProfiles.length / starsPerPage);
  const paginatedProfiles = visibleProfiles.slice(
    currentPage * starsPerPage,
    (currentPage + 1) * starsPerPage
  );

  const handleTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance && currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
    if (distance < -minSwipeDistance && currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleStarClick = (profile: RealProfile, globalIndex: number) => {
    if (removedStars.includes(profile.id)) return;

    const limit = getVisibleLimit();
    if (globalIndex >= limit) {
      setShowUpgradeModal(true);
      return;
    }
    setSelectedProfile(profile);
  };

  const sendSignal = () => {
    if (userPlan === 'gratuit' && signalsLeft <= 0) {
      showToast('Limite atteinte. Passe Premium !');
      return;
    }
    if (userPlan === 'gratuit') setSignalsLeft(prev => prev - 1);
    showToast('Signal envoye !');
    setSelectedProfile(null);
  };

  const sendSuperNova = () => {
    if (userPlan === 'gratuit') {
      setSelectedProfile(null);
      setShowUpgradeModal(true);
      return;
    }
    if (superNovaLeft <= 0) {
      showToast('Limite atteinte');
      return;
    }
    setSuperNovaLeft(prev => prev - 1);
    showToast('Super Nova envoyee !');
    setSelectedProfile(null);
  };

  const handlePass = () => {
    if (selectedProfile) {
      setRemovedStars(prev => [...prev, selectedProfile.id]);
      setSelectedProfile(null);
    }
  };

  const upgradePlan = (newPlan: Plan) => {
    setUserPlan(newPlan);
    if (newPlan === 'premium') {
      setSuperNovaLeft(1);
      setSignalsLeft(999);
    }
    if (newPlan === 'elite') {
      setSuperNovaLeft(5);
      setSignalsLeft(999);
    }
    setShowUpgradeModal(false);
    showToast('Abonnement active !');
  };

  const backgroundStars = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 5
    }));
  }, []);

  const getBorderColor = (compatibility: number) => {
    return getCompatibilityBorderColor(compatibility);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .badge-elite {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%);
          background-size: 200% 200%;
          animation: shimmer 3s ease infinite;
        }
        .badge-premium {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .star-item {
          transition: transform 0.2s ease;
        }
        .star-item:active {
          transform: scale(0.95);
        }
      `}</style>

      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-b border-white/10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-xl font-bold">Univers</h1>
              <p className="text-gray-400 text-xs">Explore les etoiles</p>
            </div>
            <button
              onClick={() => setShowSignalsReceived(true)}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full px-3 py-1.5 flex items-center gap-1.5"
            >
              <Star className="w-4 h-4 text-white" fill="white" />
              <span className="text-white text-sm font-bold">14</span>
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            <div className="bg-white/10 rounded-full px-3 py-1 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span className="text-white text-xs font-semibold">
                {userPlan === 'gratuit' ? `${signalsLeft}/10` : '∞'}
              </span>
            </div>
            {userPlan !== 'gratuit' && (
              <div className="bg-white/10 rounded-full px-3 py-1 flex items-center gap-1.5">
                <Star className="w-3 h-3 text-yellow-400" />
                <span className="text-white text-xs font-semibold">{superNovaLeft}</span>
              </div>
            )}
            {userPlan === 'elite' && (
              <button
                onClick={() => setIncognito(!incognito)}
                className={`rounded-full px-3 py-1 flex items-center gap-1.5 ${
                  incognito ? 'bg-red-600/30 border border-red-500' : 'bg-white/10'
                }`}
              >
                <EyeOff className="w-3 h-3 text-white" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main
        ref={containerRef}
        className="flex-1 pt-28 pb-20 px-3 overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {backgroundStars.map(star => (
            <div
              key={star.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animation: `twinkle ${star.duration}s ease-in-out infinite`,
                animationDelay: `${star.delay}s`
              }}
            />
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white text-sm">Chargement...</p>
            </div>
          </div>
        ) : (
          <>
            <div
              className="grid gap-4 relative z-10"
              style={{
                gridTemplateColumns: `repeat(${sizes.cols}, 1fr)`,
                maxWidth: isMobile ? '360px' : '900px',
                margin: '0 auto'
              }}
            >
              {paginatedProfiles.map((profile, pageIndex) => {
                const globalIndex = currentPage * starsPerPage + pageIndex;
                const isBlurred = globalIndex >= getVisibleLimit();
                const compatibility = profile.realCompatibility || profile.compatibility || 50;
                const borderColor = getBorderColor(compatibility);

                return (
                  <div
                    key={profile.id}
                    className="star-item flex flex-col items-center cursor-pointer touch-manipulation"
                    onClick={() => handleStarClick(profile, globalIndex)}
                  >
                    <div
                      className="relative rounded-full"
                      style={{
                        width: `${sizes.circle}px`,
                        height: `${sizes.circle}px`,
                        border: `${sizes.border}px solid ${isBlurred ? '#444' : borderColor}`,
                        boxShadow: isBlurred ? 'none' : `0 0 12px ${borderColor}60`
                      }}
                    >
                      <img
                        src={profile.photo}
                        alt={profile.name}
                        className="w-full h-full rounded-full object-cover"
                        style={{
                          filter: isBlurred ? 'blur(6px) grayscale(100%)' : 'none',
                          opacity: isBlurred ? 0.5 : 1
                        }}
                        loading="lazy"
                      />

                      {profile.plan === 'elite' && !isBlurred && (
                        <div
                          className="absolute -top-1 -right-1 badge-elite rounded-full flex items-center justify-center"
                          style={{ width: `${sizes.badgeSize}px`, height: `${sizes.badgeSize}px` }}
                        >
                          <Crown className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                      {profile.plan === 'premium' && !isBlurred && (
                        <div
                          className="absolute -top-1 -right-1 badge-premium rounded-full flex items-center justify-center"
                          style={{ width: `${sizes.badgeSize}px`, height: `${sizes.badgeSize}px` }}
                        >
                          <Sparkles className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}

                      {isBlurred && (
                        <div className="absolute inset-0 bg-black/70 rounded-full flex flex-col items-center justify-center">
                          <Lock className="w-4 h-4 text-white mb-0.5" />
                          <span className="text-white text-[7px] font-bold">PRO</span>
                        </div>
                      )}

                      {!isBlurred && (
                        <div
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[8px] font-bold text-white"
                          style={{ background: borderColor }}
                        >
                          {compatibility}%
                        </div>
                      )}
                    </div>

                    <p
                      className="text-white font-medium mt-1.5 truncate w-full text-center"
                      style={{ fontSize: `${sizes.fontSize}px`, maxWidth: `${sizes.circle + 20}px` }}
                    >
                      {profile.name}, {profile.age}
                    </p>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6 mb-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="p-2 rounded-full bg-white/10 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>

                <div className="flex gap-1.5">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`rounded-full transition-all ${
                        i === currentPage
                          ? 'bg-white w-6 h-2'
                          : 'bg-white/30 w-2 h-2'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="p-2 rounded-full bg-white/10 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            )}

            {isMobile && totalPages > 1 && (
              <p className="text-gray-500 text-xs text-center mt-2">
                Swipe pour naviguer
              </p>
            )}
          </>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-white/10 z-50 safe-area-bottom">
        <nav className="flex items-center justify-around h-16">
          <button className="flex flex-col items-center justify-center flex-1 h-full text-red-500">
            <Star className="w-5 h-5" fill="currentColor" />
            <span className="text-[10px] font-medium mt-0.5">Univers</span>
          </button>
          <button className="flex flex-col items-center justify-center flex-1 h-full text-gray-500">
            <span className="text-xl">💬</span>
            <span className="text-[10px] mt-0.5">Messages</span>
          </button>
          <button className="flex flex-col items-center justify-center flex-1 h-full text-gray-500">
            <span className="text-xl">⭐</span>
            <span className="text-[10px] mt-0.5">Astra</span>
          </button>
          <button className="flex flex-col items-center justify-center flex-1 h-full text-gray-500">
            <span className="text-xl">🌙</span>
            <span className="text-[10px] mt-0.5">Astro</span>
          </button>
          <button className="flex flex-col items-center justify-center flex-1 h-full text-gray-500">
            <span className="text-xl">👤</span>
            <span className="text-[10px] mt-0.5">Profil</span>
          </button>
        </nav>
      </footer>

      {selectedProfile && (
        <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-b from-black via-black/80 to-transparent p-4 flex justify-between items-center z-10">
            <button onClick={() => setSelectedProfile(null)} className="text-white p-2">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div
              className="rounded-full px-3 py-1"
              style={{ background: getBorderColor(selectedProfile.realCompatibility || selectedProfile.compatibility) }}
            >
              <span className="text-white text-sm font-bold">
                {selectedProfile.realCompatibility || selectedProfile.compatibility}%
              </span>
            </div>
          </div>

          <div className="px-4 -mt-4">
            <div className="relative mx-auto" style={{ width: '140px', height: '140px' }}>
              <div
                className="absolute inset-0 rounded-full blur-xl opacity-50"
                style={{ background: getBorderColor(selectedProfile.realCompatibility || selectedProfile.compatibility) }}
              />
              <img
                src={selectedProfile.photo}
                alt={selectedProfile.name}
                className="relative w-full h-full rounded-full object-cover border-4"
                style={{
                  borderColor: getBorderColor(selectedProfile.realCompatibility || selectedProfile.compatibility),
                  boxShadow: `0 0 30px ${getBorderColor(selectedProfile.realCompatibility || selectedProfile.compatibility)}60`
                }}
              />
              {selectedProfile.plan === 'elite' && (
                <div className="absolute -top-2 -right-2 badge-elite rounded-full p-2">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              )}
              {selectedProfile.plan === 'premium' && (
                <div className="absolute -top-2 -right-2 badge-premium rounded-full p-2">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>

          <div className="p-4 text-center">
            <h2 className="text-white text-2xl font-bold mb-1">
              {selectedProfile.name}, {selectedProfile.age}
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              {selectedProfile.sign} {selectedProfile.sun} - {selectedProfile.city}
            </p>

            <div className="bg-white/10 rounded-full h-2 overflow-hidden mb-1 mx-8">
              <div
                className="h-full transition-all duration-1000 rounded-full"
                style={{
                  width: `${selectedProfile.realCompatibility || selectedProfile.compatibility}%`,
                  background: getBorderColor(selectedProfile.realCompatibility || selectedProfile.compatibility)
                }}
              />
            </div>
            <p className="text-gray-400 text-xs mb-6">
              {getCompatibilityLabel(selectedProfile.realCompatibility || selectedProfile.compatibility)}
            </p>

            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-2xl mb-1">☀️</p>
                  <p className="text-white text-xs font-semibold">{selectedProfile.sun}</p>
                  <p className="text-gray-500 text-[10px]">Soleil</p>
                </div>
                <div>
                  <p className="text-2xl mb-1">🌙</p>
                  <p className="text-white text-xs font-semibold">{selectedProfile.moon}</p>
                  <p className="text-gray-500 text-[10px]">Lune</p>
                </div>
                <div>
                  <p className="text-2xl mb-1">⬆️</p>
                  <p className="text-white text-xs font-semibold">{selectedProfile.ascendant}</p>
                  <p className="text-gray-500 text-[10px]">Ascendant</p>
                </div>
              </div>
            </div>

            <div className="text-left mb-6">
              <h3 className="text-white font-bold text-sm mb-2">A propos</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {selectedProfile.bio}
              </p>
            </div>

            <div className="space-y-3 pb-8">
              <button
                onClick={sendSignal}
                disabled={userPlan === 'gratuit' && signalsLeft <= 0}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Envoyer un signal
                <span className="text-xs opacity-80">
                  ({userPlan === 'gratuit' ? `${signalsLeft}/10` : '∞'})
                </span>
              </button>

              <button
                onClick={sendSuperNova}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 ${
                  userPlan === 'gratuit'
                    ? 'bg-white/10 text-white'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                }`}
              >
                <Star className="w-5 h-5" fill={userPlan !== 'gratuit' ? 'currentColor' : 'none'} />
                Super Nova
                {userPlan === 'gratuit' ? (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Premium</span>
                ) : (
                  <span className="text-xs opacity-80">({superNovaLeft})</span>
                )}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Message
                </button>
                <button
                  onClick={handlePass}
                  className="bg-white/10 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Passer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl w-full max-w-md relative border border-white/10">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-3 right-3 z-10 bg-white/10 hover:bg-white/20 rounded-full p-2"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-center mb-2 text-white">
                Deverrouille l'Univers
              </h2>
              <p className="text-center text-gray-400 mb-6 text-sm">
                Accede a toutes les etoiles
              </p>

              <div className="space-y-4">
                <div className="border-2 border-blue-500 rounded-xl p-4 bg-blue-900/20">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold text-white">PREMIUM</h3>
                    <p className="text-xl font-bold text-white">9.99€<span className="text-sm text-gray-400">/mois</span></p>
                  </div>
                  <ul className="space-y-1 mb-4 text-sm">
                    <li className="text-green-400">50 etoiles visibles</li>
                    <li className="text-green-400">Signaux illimites</li>
                    <li className="text-green-400">1 Super Nova/jour</li>
                  </ul>
                  <button
                    onClick={() => upgradePlan('premium')}
                    className="w-full badge-premium text-white py-3 rounded-xl font-semibold"
                  >
                    CHOISIR
                  </button>
                </div>

                <div className="border-2 border-yellow-500 rounded-xl p-4 bg-yellow-900/20 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge-elite text-white px-3 py-1 rounded-full text-xs font-bold">
                    RECOMMANDE
                  </div>
                  <div className="flex justify-between items-center mb-3 mt-2">
                    <h3 className="text-lg font-bold text-white">ELITE</h3>
                    <p className="text-xl font-bold text-white">14.99€<span className="text-sm text-gray-400">/mois</span></p>
                  </div>
                  <ul className="space-y-1 mb-4 text-sm">
                    <li className="text-green-400">Etoiles illimitees</li>
                    <li className="text-green-400">5 Super Nova/jour</li>
                    <li className="text-green-400">Mode incognito</li>
                    <li className="text-green-400">Badge dore</li>
                  </ul>
                  <button
                    onClick={() => upgradePlan('elite')}
                    className="w-full badge-elite text-white py-3 rounded-xl font-semibold"
                  >
                    CHOISIR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSignalsReceived && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl w-full max-w-sm relative border border-white/10">
            <button
              onClick={() => setShowSignalsReceived(false)}
              className="absolute top-3 right-3 z-10 bg-white/10 hover:bg-white/20 rounded-full p-2"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-6 h-6 text-yellow-500" fill="currentColor" />
                <h2 className="text-xl font-bold text-white">Signaux Recus</h2>
              </div>

              {userPlan === 'gratuit' ? (
                <div className="text-center py-8">
                  <Lock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-6 text-sm">
                    Fonctionnalite Premium
                  </p>
                  <button
                    onClick={() => {
                      setShowSignalsReceived(false);
                      setShowUpgradeModal(true);
                    }}
                    className="badge-premium text-white px-6 py-3 rounded-xl font-semibold"
                  >
                    Passer Premium
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-300">14 signaux cette semaine !</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-lg border border-white/20 text-white px-5 py-2.5 rounded-full shadow-xl text-sm">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default UniverseApp;
