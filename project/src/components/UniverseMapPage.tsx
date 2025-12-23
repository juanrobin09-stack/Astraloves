import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, Sparkles, Flame, Star as StarIcon } from 'lucide-react';
import BottomNav from './BottomNav';
import ProfileBottomSheet from './ProfileBottomSheet';
import LimitReachedPopup from './LimitReachedPopup';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { useAuth } from '../contexts/AuthContext';
import { getUniverseUsers, sendCosmicSignal, UniverseUser, formatDistance } from '../lib/universeService';
import { supabase } from '../lib/supabase';

interface UniverseMapPageProps {
  onNavigate?: (page: string) => void;
}

const StarIconSVG = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
  </svg>
);

const getPlanetStyle = (compatibility: number, isBlurred: boolean) => {
  if (isBlurred) {
    return {
      size: 35,
      borderColor: '#4A4A4A',
      glowColor: '#4A4A4A',
      glowIntensity: 0,
      opacity: 0.4,
      blur: true,
    };
  }

  if (compatibility >= 95) {
    return {
      size: 70,
      borderColor: '#DC2626',
      glowColor: '#DC2626',
      glowIntensity: 30,
      opacity: 1,
      blur: false,
    };
  } else if (compatibility >= 85) {
    return {
      size: 55,
      borderColor: '#DC2626',
      glowColor: '#DC2626',
      glowIntensity: 20,
      opacity: 1,
      blur: false,
    };
  } else if (compatibility >= 75) {
    return {
      size: 45,
      borderColor: '#E8B4B8',
      glowColor: '#E8B4B8',
      glowIntensity: 15,
      opacity: 1,
      blur: false,
    };
  } else {
    return {
      size: 35,
      borderColor: '#4A4A4A',
      glowColor: '#4A4A4A',
      glowIntensity: 0,
      opacity: 0.7,
      blur: false,
    };
  }
};

export default function UniverseMapPage({ onNavigate }: UniverseMapPageProps = {}) {
  const { user } = useAuth();
  const { tier } = usePremiumStatus();
  const [zoom, setZoom] = useState(1);
  const [hoveredPlanet, setHoveredPlanet] = useState<UniverseUser | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<UniverseUser | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(true);
  const [universeUsers, setUniverseUsers] = useState<UniverseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserPhoto, setCurrentUserPhoto] = useState<string>('');
  const [showLimitPopup, setShowLimitPopup] = useState<{
    show: boolean;
    type: 'signals' | 'super_nova' | 'distance' | 'visibility';
  }>({ show: false, type: 'signals' });

  const [limits, setLimits] = useState({
    signals: 10,
    signalsUsed: 0,
    superNovas: 0,
    superNovasUsed: 0,
    astraMessages: 10,
    astraMessagesUsed: 0,
    maxStarsVisible: 15,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; dist: number } | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id, tier]);

  const loadData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const users = await getUniverseUsers(user.id, tier);
      setUniverseUsers(users);

      const { data: profile } = await supabase
        .from('astra_profiles')
        .select('photos, daily_swipes, daily_super_likes, daily_astra_messages, premium_tier')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        const photos = Array.isArray(profile.photos) ? profile.photos : [];
        setCurrentUserPhoto(photos[0] || 'https://i.pravatar.cc/150?img=33');

        const tierLimits = {
          gratuit: { signals: 10, superNovas: 0, astraMessages: 10, maxStarsVisible: 15 },
          premium: { signals: Infinity, superNovas: 1, astraMessages: 40, maxStarsVisible: 50 },
          premium_plus: { signals: Infinity, superNovas: 5, astraMessages: 65, maxStarsVisible: Infinity },
        };

        const currentTier = (profile.premium_tier || 'gratuit') as keyof typeof tierLimits;
        const tierLimit = tierLimits[currentTier];

        setLimits({
          signals: tierLimit.signals,
          signalsUsed: profile.daily_swipes || 0,
          superNovas: tierLimit.superNovas,
          superNovasUsed: profile.daily_super_likes || 0,
          astraMessages: tierLimit.astraMessages,
          astraMessagesUsed: profile.daily_astra_messages || 0,
          maxStarsVisible: tierLimit.maxStarsVisible,
        });
      }
    } catch (error) {
      console.error('Error loading universe data:', error);
    } finally {
      setLoading(false);
    }
  };

  const backgroundStars = useMemo(
    () =>
      Array.from({ length: 200 }, (_, i) => {
        const depth = Math.random();
        const isEdge = Math.random() > 0.4;
        return {
          id: `star-${i}`,
          x: isEdge ? (Math.random() > 0.5 ? Math.random() * 20 : 80 + Math.random() * 20) : Math.random() * 100,
          y: isEdge ? (Math.random() > 0.5 ? Math.random() * 20 : 80 + Math.random() * 20) : Math.random() * 100,
          size: depth > 0.7 ? Math.random() * 2 + 1 : Math.random() * 1 + 0.5,
          opacity: depth > 0.7 ? Math.random() * 0.8 + 0.4 : Math.random() * 0.4 + 0.1,
          delay: Math.random() * 5,
          duration: Math.random() * 4 + 3,
        };
      }),
    []
  );

  const planetsWithPositions = useMemo(() => {
    const positions: Array<{ x: number; y: number; user: UniverseUser; angle: number; distance: number }> = [];
    const minDistance = 70;

    return universeUsers.map((user, idx) => {
      let placed = false;
      let attempts = 0;
      let finalAngle = 0;
      let finalDistance = 0;

      while (!placed && attempts < 50) {
        const ring = user.compatibilite >= 85 ? 1 : user.compatibilite >= 70 ? 2 : 3;
        const baseRadius = 100 + ring * 60;
        const angle = (idx / universeUsers.length) * 360 + (Math.random() - 0.5) * 30;
        const distance = baseRadius + (Math.random() - 0.5) * 40;

        const x = Math.cos((angle * Math.PI) / 180) * distance;
        const y = Math.sin((angle * Math.PI) / 180) * distance;

        const overlaps = positions.some((pos) => {
          const dist = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);
          return dist < minDistance;
        });

        if (!overlaps || attempts > 30) {
          positions.push({ x, y, user, angle, distance });
          finalAngle = angle;
          finalDistance = distance;
          placed = true;
        }
        attempts++;
      }

      return {
        ...user,
        angle: finalAngle,
        distance: finalDistance,
      };
    });
  }, [universeUsers]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      setShowControls(true);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(() => setShowControls(false), 3000);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;

    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchStart({
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        dist,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setOffset({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
      setShowControls(true);
    } else if (e.touches.length === 2 && touchStart) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / touchStart.dist;
      const newZoom = Math.max(0.5, Math.min(2, zoom * scale));
      setZoom(newZoom);
      setTouchStart({
        x: touchStart.x,
        y: touchStart.y,
        dist,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchStart(null);
    setTimeout(() => setShowControls(false), 3000);
  };

  const handlePlanetClick = (planet: UniverseUser, idx: number) => {
    if (limits.maxStarsVisible !== Infinity && idx >= limits.maxStarsVisible) {
      setShowLimitPopup({ show: true, type: 'visibility' });
      return;
    }
    setSelectedPlanet(planet);
  };

  const handleSendSignal = async (userId: string, type: 'signal' | 'super_nova') => {
    if (!user?.id) return;

    if (type === 'signal' && limits.signals !== Infinity && limits.signalsUsed >= limits.signals) {
      setShowLimitPopup({ show: true, type: 'signals' });
      return;
    }

    if (type === 'super_nova') {
      if (tier === 'gratuit') {
        setShowLimitPopup({ show: true, type: 'super_nova' });
        return;
      }
      if (limits.superNovasUsed >= limits.superNovas) {
        setShowLimitPopup({ show: true, type: 'super_nova' });
        return;
      }
    }

    const result = await sendCosmicSignal(user.id, userId, type);

    if (result.success) {
      setSelectedPlanet(null);
      await loadData();
    } else {
      console.error('Error sending signal:', result.error);
    }
  };

  const handleUpgrade = () => {
    if (onNavigate) {
      onNavigate('premium');
    }
  };

  const canSendSignal = limits.signals === Infinity || limits.signalsUsed < limits.signals;
  const canViewDistance = tier !== 'gratuit';

  if (loading) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-12 h-12 text-red-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden select-none touch-none"
      style={{
        background: 'radial-gradient(ellipse at 50% 50%, #0A0505 0%, #050505 60%, #000000 100%)',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {backgroundStars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: '#FFFFFF',
          }}
          animate={{
            opacity: [star.opacity, star.opacity * 0.3, star.opacity],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: star.delay,
          }}
        />
      ))}

      <motion.div
        className="absolute rounded-full blur-[100px] opacity-10 pointer-events-none"
        style={{
          right: '10%',
          top: '15%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(220, 38, 38, 0.3) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, 20, -20, 0],
          y: [0, -15, 15, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />

      <div className="absolute top-4 left-4 flex items-center gap-2 z-50">
        <motion.div
          className="px-4 py-2 rounded-full border border-red-600/30 backdrop-blur-xl relative overflow-hidden no-drag"
          style={{ background: 'rgba(10,10,10,0.6)' }}
          whileHover={{ scale: 1.02 }}
        >
          <span className="text-white font-medium text-sm relative flex items-center gap-2">
            {tier === 'premium_plus' ? (
              <>Elite <span className="text-yellow-500">👑</span></>
            ) : tier === 'premium' ? (
              <>Premium <span className="text-red-500">💎</span></>
            ) : (
              <>Gratuit <Sparkles className="w-3 h-3 text-red-500" /></>
            )}
          </span>
        </motion.div>

        <motion.div
          className="px-3 py-2 rounded-full backdrop-blur-xl no-drag"
          style={{ background: 'rgba(10,10,10,0.6)' }}
          whileHover={{ scale: 1.02 }}
        >
          <span className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-red-500" />
            {limits.signals === Infinity ? (
              <span className="text-white font-semibold text-sm">∞</span>
            ) : (
              <>
                <span className="text-white font-semibold text-sm">{limits.signals - limits.signalsUsed}</span>
                <span className="text-gray-500 text-xs">/{limits.signals}</span>
              </>
            )}
          </span>
        </motion.div>

        {limits.superNovas > 0 && (
          <motion.div
            className="px-3 py-2 rounded-full backdrop-blur-xl no-drag"
            style={{ background: 'rgba(10,10,10,0.6)' }}
            whileHover={{ scale: 1.02 }}
          >
            <span className="flex items-center gap-1.5">
              <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-white font-semibold text-sm">{limits.superNovas - limits.superNovasUsed}</span>
              <span className="text-gray-500 text-xs">/{limits.superNovas}</span>
            </span>
          </motion.div>
        )}

        <motion.div
          className="px-3 py-2 rounded-full backdrop-blur-xl no-drag"
          style={{ background: 'rgba(10,10,10,0.6)' }}
          whileHover={{ scale: 1.02 }}
        >
          <span className="flex items-center gap-1.5">
            <span className="text-lg">⭐</span>
            {limits.maxStarsVisible === Infinity ? (
              <span className="text-white font-semibold text-sm">∞</span>
            ) : (
              <span className="text-white font-semibold text-sm">{limits.maxStarsVisible}</span>
            )}
          </span>
        </motion.div>
      </div>

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col gap-2 z-50 no-drag"
          >
            <motion.button
              onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
              className="w-10 h-10 rounded-full backdrop-blur-xl flex items-center justify-center transition-all"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(220, 38, 38, 0.2)' }}
              whileTap={{ scale: 0.95 }}
            >
              <ZoomIn className="w-4 h-4 text-white" />
            </motion.button>

            <motion.button
              onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
              className="w-10 h-10 rounded-full backdrop-blur-xl flex items-center justify-center transition-all"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(220, 38, 38, 0.2)' }}
              whileTap={{ scale: 0.95 }}
            >
              <ZoomOut className="w-4 h-4 text-white" />
            </motion.button>

            <motion.button
              onClick={() => {
                setZoom(1);
                setOffset({ x: 0, y: 0 });
              }}
              className="w-10 h-10 rounded-full backdrop-blur-xl flex items-center justify-center transition-all"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(220, 38, 38, 0.2)' }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-4 h-4 text-white" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        <motion.div
          className="relative"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 200,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div className="relative w-[600px] h-[600px]">
            {planetsWithPositions.map((planet, idx) => {
              const x = Math.cos((planet.angle * Math.PI) / 180) * planet.distance;
              const y = Math.sin((planet.angle * Math.PI) / 180) * planet.distance;
              const isBlurred = limits.maxStarsVisible !== Infinity && idx >= limits.maxStarsVisible;
              const style = getPlanetStyle(planet.compatibilite, isBlurred);
              const isHovered = hoveredPlanet?.id === planet.id;

              return (
                <div key={planet.id}>
                  <motion.div
                    className="absolute"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                    }}
                    initial={{
                      opacity: 0,
                      scale: 0.3,
                    }}
                    animate={{
                      rotate: [0, -360],
                      y: [0, -3, 0],
                      opacity: selectedPlanet && selectedPlanet.id !== planet.id ? 0.3 : style.opacity,
                      scale: 1,
                    }}
                    transition={{
                      rotate: { duration: 200, repeat: Infinity, ease: 'linear' },
                      y: { duration: 3 + idx * 0.2, repeat: Infinity, ease: 'easeInOut' },
                      opacity: { duration: 0.3, delay: idx * 0.05 },
                      scale: { duration: 0.5, delay: idx * 0.05, ease: 'backOut' },
                    }}
                  >
                    <div className="relative no-drag">
                      <motion.div
                        className="relative rounded-full overflow-hidden cursor-pointer"
                        style={{
                          width: `${style.size}px`,
                          height: `${style.size}px`,
                          border: `2px solid ${style.borderColor}`,
                          boxShadow: style.glowIntensity > 0 ? `0 0 ${style.glowIntensity}px ${style.glowColor}` : 'none',
                          filter: style.blur ? 'blur(8px)' : 'none',
                        }}
                        whileHover={{
                          scale: isBlurred ? 1 : 1.1,
                          boxShadow:
                            style.glowIntensity > 0 ? `0 0 ${style.glowIntensity * 1.5}px ${style.glowColor}` : 'none',
                        }}
                        whileTap={{ scale: isBlurred ? 1 : 1.05 }}
                        onHoverStart={() => !isBlurred && setHoveredPlanet(planet)}
                        onHoverEnd={() => setHoveredPlanet(null)}
                        onClick={() => handlePlanetClick(planet, idx)}
                        animate={{
                          borderColor: isHovered ? [style.borderColor, '#FFFFFF', style.borderColor] : style.borderColor,
                        }}
                        transition={{
                          borderColor: { duration: 1, repeat: isHovered ? Infinity : 0 },
                        }}
                      >
                        {planet.photo_principale ? (
                          <img src={planet.photo_principale} alt={planet.first_name} className="w-full h-full object-cover" />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center text-white font-medium"
                            style={{
                              background: 'linear-gradient(135deg, #1A1A1A 0%, #450A0A 100%)',
                              fontSize: `${style.size * 0.4}px`,
                            }}
                          >
                            {planet.first_name.slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        {isBlurred && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <span className="text-white text-xs font-medium">🔒</span>
                          </div>
                        )}
                      </motion.div>

                      <AnimatePresence>
                        {!isBlurred && (isHovered || selectedPlanet?.id === planet.id) && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1"
                            style={{
                              top: `${style.size + 6}px`,
                              background: 'rgba(26, 26, 26, 0.9)',
                              border: planet.compatibilite >= 85 ? '1px solid rgba(220, 38, 38, 0.3)' : 'none',
                              color: '#FFFFFF',
                            }}
                          >
                            <span className="text-red-500">
                              <StarIconSVG />
                            </span>
                            <span>{planet.compatibilite}%</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>
              );
            })}

            <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 no-drag">
              <div className="relative">
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: '140px',
                    height: '140px',
                    border: '1px dashed rgba(220, 38, 38, 0.3)',
                  }}
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    rotate: { duration: 60, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                  }}
                />

                <motion.div
                  className="relative rounded-full overflow-hidden"
                  style={{
                    width: '80px',
                    height: '80px',
                    border: '3px solid #FFFFFF',
                    boxShadow: '0 0 0 2px #DC2626, 0 0 30px rgba(220, 38, 38, 0.5)',
                  }}
                  animate={{
                    boxShadow: [
                      '0 0 0 2px #DC2626, 0 0 30px rgba(220, 38, 38, 0.5)',
                      '0 0 0 2px #DC2626, 0 0 40px rgba(220, 38, 38, 0.8)',
                      '0 0 0 2px #DC2626, 0 0 30px rgba(220, 38, 38, 0.5)',
                    ],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <img src={currentUserPhoto} alt="You" className="w-full h-full object-cover" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <ProfileBottomSheet
        user={selectedPlanet}
        isOpen={!!selectedPlanet}
        onClose={() => setSelectedPlanet(null)}
        onSendSignal={handleSendSignal}
        userTier={tier}
        canSendSignal={canSendSignal}
        canViewDistance={canViewDistance}
      />

      <LimitReachedPopup
        isOpen={showLimitPopup.show}
        onClose={() => setShowLimitPopup({ ...showLimitPopup, show: false })}
        onUpgrade={handleUpgrade}
        type={showLimitPopup.type}
        current={showLimitPopup.type === 'signals' ? limits.signalsUsed : limits.superNovasUsed}
        limit={showLimitPopup.type === 'signals' ? limits.signals : limits.superNovas}
      />

      {onNavigate && <BottomNav currentPage="constellation" onNavigate={onNavigate} />}
    </div>
  );
}
