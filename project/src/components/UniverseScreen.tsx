import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTouchGestures } from '../hooks/useTouchGestures';
import { useAuth } from '../contexts/AuthContext';
import { getUniverseUsers, UniverseUser } from '../lib/universeService';

interface Star {
  id: string;
  name: string;
  age: number;
  photo: string;
  compatibility: number;
  tier: 'free' | 'premium' | 'elite';
  zodiac: string;
  isOnline: boolean;
  distance: number;
  hasLikedYou: boolean;
}

type UserTier = 'free' | 'premium' | 'elite';

const getStarColor = (compatibility: number): string => {
  if (compatibility >= 90) return '#FFD700';
  if (compatibility >= 75) return '#FFA500';
  if (compatibility >= 60) return '#FBBF24';
  return '#9CA3AF';
};

const getTierLimits = (tier: UserTier) => {
  switch (tier) {
    case 'elite': return { maxStars: 100, zoomMin: 0.3, zoomMax: 3 };
    case 'premium': return { maxStars: 50, zoomMin: 0.5, zoomMax: 2 };
    default: return { maxStars: 15, zoomMin: 0.8, zoomMax: 1.3 };
  }
};

const CSS_ANIMATIONS = `
  @keyframes twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
  @keyframes auraExpand { 0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.6; } 100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; } }
  @keyframes float { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-5px); } }
  @keyframes slideUpFade { 0% { transform: translateY(100%); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
  @keyframes slideInFromRight { 0% { transform: translateX(100px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
  @keyframes modalBackdrop { 0% { opacity: 0; backdrop-filter: blur(0px); } 100% { opacity: 1; backdrop-filter: blur(8px); } }
  @keyframes shake { 0%, 100% { transform: translate(-50%, -50%) translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translate(-50%, -50%) translateX(-4px); } 20%, 40%, 60%, 80% { transform: translate(-50%, -50%) translateX(4px); } }
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
`;

interface UniverseScreenProps {
  userTier?: UserTier;
  onNavigate?: (page: string) => void;
}

export const UniverseScreen: React.FC<UniverseScreenProps> = ({ userTier = 'free', onNavigate }) => {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [center, setCenter] = useState({ x: 200, y: 350 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [shakingStarId, setShakingStarId] = useState<string | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [likedStars, setLikedStars] = useState<Set<string>>(new Set());
  const [superNovasSent, setSuperNovasSent] = useState<Set<string>>(new Set());
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; icon: string } | null>(null);
  const [stars, setStars] = useState<Star[]>([]);
  const [loading, setLoading] = useState(true);

  const [signalsRemaining, setSignalsRemaining] = useState(() => {
    const saved = localStorage.getItem('signalsRemaining');
    const lastReset = localStorage.getItem('signalsLastReset');
    const today = new Date().toDateString();

    if (lastReset !== today) {
      localStorage.setItem('signalsLastReset', today);
      localStorage.setItem('signalsRemaining', '10');
      return 10;
    }

    return saved ? parseInt(saved) : 10;
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', icon: string = '💫') => {
    setToast({ message, type, icon });
    setTimeout(() => setToast(null), 3000);
  };

  const getSignalLimit = (tier: UserTier) => {
    switch(tier) {
      case 'elite': return Infinity;
      case 'premium': return Infinity;
      default: return 10;
    }
  };

  const signalLimit = getSignalLimit(userTier);
  const hasUnlimitedSignals = signalLimit === Infinity;

  const limits = getTierLimits(userTier);
  const visibleStars = stars.slice(0, limits.maxStars);

  const backgroundStars = useMemo(() =>
    Array.from({ length: 150 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 3,
    })), []
  );

  useEffect(() => {
    const loadUniverseUsers = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const tierMap: Record<UserTier, 'gratuit' | 'premium' | 'premium_plus'> = {
          free: 'gratuit',
          premium: 'premium',
          elite: 'premium_plus'
        };

        const users = await getUniverseUsers(user.id, tierMap[userTier]);

        const transformedStars: Star[] = users.map((u) => ({
          id: u.id,
          name: u.first_name,
          age: u.age,
          photo: u.photo_principale || '',
          compatibility: u.compatibilite,
          tier: u.premium_tier === 'premium_plus' ? 'elite' : u.premium_tier === 'premium' ? 'premium' : 'free',
          zodiac: u.signe_solaire || '⭐',
          isOnline: u.est_en_ligne || false,
          distance: u.distance_km || 0,
          hasLikedYou: false
        }));

        setStars(transformedStars);
      } catch (error) {
        console.error('Erreur chargement univers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUniverseUsers();
  }, [user, userTier]);

  useEffect(() => {
    const updateCenter = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCenter({ x: rect.width / 2, y: rect.height / 2 });
      }
    };
    updateCenter();
    setTimeout(updateCenter, 100);
    window.addEventListener('resize', updateCenter);
    return () => window.removeEventListener('resize', updateCenter);
  }, []);

  const touchRef = useTouchGestures({
    onPinch: (scale) => {
      setZoom(prev => {
        const newZoom = prev * scale;
        return Math.max(limits.zoomMin, Math.min(limits.zoomMax, newZoom));
      });
    },
    onPan: (deltaX, deltaY) => {
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
    },
    onDoubleTap: (x, y) => {
      const element = containerRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const localX = x - rect.left;
      const localY = y - rect.top;

      setZoom(prev => {
        if (prev >= limits.zoomMax * 0.9) return 1;
        return Math.min(prev * 2, limits.zoomMax);
      });

      setPan(prev => ({
        x: prev.x - (localX - center.x) * 0.5,
        y: prev.y - (localY - center.y) * 0.5,
      }));
    },
    minScale: limits.zoomMin,
    maxScale: limits.zoomMax,
  });

  const starPositions = useMemo(() => {
    const positions = new Map();
    const goldenAngle = 137.5 * (Math.PI / 180);
    const minSeparation = 110;

    const checkCollision = (x: number, y: number, existingPositions: Array<{x: number, y: number}>) => {
      return existingPositions.some(pos => {
        const dx = pos.x - x;
        const dy = pos.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < minSeparation;
      });
    };

    const sortedStars = [...visibleStars].sort((a, b) => b.compatibility - a.compatibility);
    const placedPositions: Array<{x: number, y: number}> = [];

    sortedStars.forEach((star, index) => {
      const minDist = 100;
      const maxDist = Math.min(center.x, center.y) - 70;
      const compatibilitySpread = (100 - star.compatibility) / 100;
      const baseDistance = minDist + compatibilitySpread * (maxDist - minDist);

      let angle = index * goldenAngle;
      let distance = baseDistance;
      let attempts = 0;
      const maxAttempts = 60;
      let spiralLevel = 0;

      while (attempts < maxAttempts) {
        const x = center.x + distance * Math.cos(angle) + pan.x;
        const y = center.y + distance * Math.sin(angle) + pan.y;

        if (!checkCollision(x, y, placedPositions)) {
          positions.set(star.id, { x, y });
          placedPositions.push({ x, y });
          break;
        }

        attempts++;

        if (attempts % 15 === 0) {
          spiralLevel++;
          distance = baseDistance + (spiralLevel * 35);
          angle = index * goldenAngle;
        } else if (attempts % 5 === 0) {
          angle += Math.PI / 3;
        } else {
          angle += Math.PI / 9;
        }
      }

      if (attempts >= maxAttempts) {
        const fallbackAngle = index * goldenAngle + (index * Math.PI / 12);
        const fallbackDistance = baseDistance + (Math.floor(index / 8) * 40);
        const fallbackX = center.x + fallbackDistance * Math.cos(fallbackAngle) + pan.x;
        const fallbackY = center.y + fallbackDistance * Math.sin(fallbackAngle) + pan.y;
        positions.set(star.id, { x: fallbackX, y: fallbackY });
        placedPositions.push({ x: fallbackX, y: fallbackY });
      }
    });

    return positions;
  }, [visibleStars, center, pan]);

  const isElite = userTier === 'elite';
  const isPremium = userTier === 'premium' || isElite;

  const handleClose = () => {
    if ('vibrate' in navigator) navigator.vibrate(10);
    setSelectedStar(null);
    setShowFullProfile(false);
  };

  const handleSendSignal = (star: Star) => {
    if (likedStars.has(star.id)) {
      showToast(`Tu as déjà envoyé un signal à ${star.name}`, 'info', '💫');
      return;
    }

    if (!hasUnlimitedSignals && signalsRemaining <= 0) {
      showToast('Plus de signaux aujourd\'hui ! Passe en Premium pour des signaux illimités', 'error', '😢');
      return;
    }

    if ('vibrate' in navigator) navigator.vibrate([10, 5, 10]);

    if (!hasUnlimitedSignals) {
      const newCount = signalsRemaining - 1;
      setSignalsRemaining(newCount);
      localStorage.setItem('signalsRemaining', newCount.toString());
    }

    setLikedStars(prev => new Set([...prev, star.id]));
    showToast(`Signal envoyé à ${star.name} !`, 'success', '💫');

    setTimeout(() => {
      setSelectedStar(null);
      setShowFullProfile(false);
    }, 800);
  };

  const handleSendSuperNova = (star: Star) => {
    if (userTier === 'free') {
      if ('vibrate' in navigator) navigator.vibrate([50, 30, 50]);
      showToast('Passe en Premium pour envoyer des Super Nova !', 'info', '⭐');
      return;
    }

    if (superNovasSent.has(star.id)) {
      showToast(`Tu as déjà envoyé une Super Nova à ${star.name}`, 'info', '🌟');
      return;
    }

    if ('vibrate' in navigator) navigator.vibrate([10, 10, 10]);
    setSuperNovasSent(prev => new Set([...prev, star.id]));

    showToast(`Super Nova envoyée à ${star.name} !`, 'success', '🌟');

    setTimeout(() => {
      setSelectedStar(null);
      setShowFullProfile(false);
    }, 800);
  };

  const handleViewProfile = (star: Star) => {
    if (userTier === 'free' && star.tier === 'free') {
      if ('vibrate' in navigator) navigator.vibrate([50, 30, 50]);
      showToast('Passe en Premium pour voir ce profil en détail', 'info', '🔒');
      return;
    }

    if ('vibrate' in navigator) navigator.vibrate(10);
    setShowFullProfile(true);
  };

  const visibleStarsInViewport = useMemo(() => {
    if (!containerRef.current) return visibleStars;
    const rect = containerRef.current.getBoundingClientRect();
    const buffer = 100;

    return visibleStars.filter(star => {
      const pos = starPositions.get(star.id);
      if (!pos) return false;

      const transformedX = (pos.x - center.x) * zoom + center.x;
      const transformedY = (pos.y - center.y) * zoom + center.y;

      return transformedX >= -buffer && transformedX <= rect.width + buffer &&
             transformedY >= -buffer && transformedY <= rect.height + buffer;
    });
  }, [visibleStars, starPositions, zoom, center]);

  return (
    <div
      ref={(node) => {
        if (node) {
          containerRef.current = node;
          (touchRef as any).current = node;
        }
      }}
      className="absolute inset-0 w-full h-full overflow-hidden touch-none select-none"
      style={{
        backgroundColor: '#050510',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
    >
      <style>{CSS_ANIMATIONS}</style>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />

      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, #0D0D2B 0%, #080818 50%, #050510 100%)' }} />

      <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)', top: '-10%', right: '-10%', transform: 'translateZ(0)', willChange: 'transform' }} />
      <div className="absolute w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)', bottom: '10%', left: '-5%', transform: 'translateZ(0)', willChange: 'transform' }} />
      <div className="absolute w-64 h-64 rounded-full blur-3xl opacity-5 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)', top: '40%', left: '30%', transform: 'translateZ(0)', willChange: 'transform' }} />

      {backgroundStars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animation: `twinkle ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
            transform: 'translateZ(0)',
            willChange: 'opacity',
          }}
        />
      ))}

      <div
        className="absolute inset-0 transition-transform duration-200"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          willChange: 'transform',
        }}
      >
        {visibleStarsInViewport.map(star => {
          const pos = starPositions.get(star.id);
          if (!pos) return null;
          const color = getStarColor(star.compatibility);
          const size = star.tier === 'elite' ? 18 : star.tier === 'premium' ? 14 : 10;
          const glowIntensity = star.compatibility / 100;
          const isHighCompat = star.compatibility >= 85;
          const isBlurred = userTier === 'free' && star.tier === 'free';

          return (
            <div
              key={star.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform active:scale-110"
              style={{
                left: pos.x,
                top: pos.y,
                zIndex: 100 + Math.floor(star.compatibility),
                minWidth: 65,
                minHeight: 65,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'translateZ(0)',
                willChange: 'transform',
                cursor: isBlurred ? 'not-allowed' : 'pointer',
                opacity: isBlurred ? 0.6 : 1,
                filter: isBlurred ? 'grayscale(100%) brightness(0.7)' : 'none',
                animation: shakingStarId === star.id ? 'shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)' : 'none',
              }}
              onClick={(e) => {
                e.stopPropagation();

                if (isBlurred) {
                  if ('vibrate' in navigator) {
                    navigator.vibrate(50);
                  }
                  setShakingStarId(star.id);
                  setShowUnlockModal(true);
                  setTimeout(() => setShakingStarId(null), 500);
                  return;
                }

                if ('vibrate' in navigator) {
                  navigator.vibrate(10);
                }
                setSelectedStar(star);
              }}
            >
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl pointer-events-none"
                style={{
                  width: size * 5,
                  height: size * 5,
                  backgroundColor: color,
                  opacity: 0.25 * glowIntensity,
                  animation: isHighCompat ? 'pulse 1.5s ease-in-out infinite' : 'none',
                  transform: 'translateZ(0)',
                  willChange: 'transform, opacity',
                }}
              />
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-md pointer-events-none"
                style={{
                  width: size * 3,
                  height: size * 3,
                  backgroundColor: color,
                  opacity: 0.4 * glowIntensity,
                  transform: 'translateZ(0)',
                  willChange: 'opacity',
                }}
              />
              <div
                className="relative rounded-full bg-white pointer-events-none"
                style={{
                  width: size,
                  height: size,
                  boxShadow: `0 0 ${size/2}px ${color}, 0 0 ${size}px ${color}`,
                  opacity: isBlurred ? 0.5 : 1,
                  transform: 'translateZ(0)',
                }}
              />
              {star.isOnline && !isBlurred && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400 pointer-events-none" style={{ boxShadow: '0 0 4px #4ADE80' }} />
              )}
              <div
                className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap flex items-center gap-0.5 pointer-events-none"
                style={{
                  top: '100%',
                  background: 'rgba(0,0,0,0.9)',
                  border: `1px solid ${color}40`,
                  color: color,
                  filter: isBlurred ? 'blur(3px)' : 'none',
                  boxShadow: `0 2px 8px rgba(0,0,0,0.5), 0 0 0 0.5px ${color}20`,
                  backdropFilter: 'blur(4px)'
                }}
              >
                {star.tier === 'elite' && '👑'}{star.tier === 'premium' && '⭐'}{star.compatibility}%
              </div>
              {isBlurred && <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-yellow-400 pointer-events-none">🔒</div>}
            </div>
          );
        })}

        <div className="absolute -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none" style={{ left: center.x + pan.x, top: center.y + pan.y }}>
          {isElite && (
            <>
              <div className="absolute left-1/2 top-1/2 w-24 h-24 rounded-full border-2 border-yellow-400/20" style={{ transform: 'translate(-50%, -50%) translateZ(0)', animation: 'auraExpand 3s ease-out infinite', willChange: 'transform, opacity' }} />
              <div className="absolute left-1/2 top-1/2 w-24 h-24 rounded-full border border-yellow-400/30" style={{ transform: 'translate(-50%, -50%) translateZ(0)', animation: 'auraExpand 3s ease-out infinite', animationDelay: '1s', willChange: 'transform, opacity' }} />
            </>
          )}
          <div
            className="absolute left-1/2 top-1/2 rounded-full blur-xl"
            style={{
              width: isElite ? 120 : isPremium ? 80 : 50,
              height: isElite ? 120 : isPremium ? 80 : 50,
              background: isPremium ? 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
              transform: 'translate(-50%, -50%) translateZ(0)',
              animation: isPremium ? 'pulse 3s ease-in-out infinite' : 'none',
              willChange: 'transform',
            }}
          />
          <div
            className="relative rounded-full bg-white"
            style={{
              width: isElite ? 28 : isPremium ? 22 : 16,
              height: isElite ? 28 : isPremium ? 22 : 16,
              boxShadow: isPremium ? '0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700' : '0 0 8px #FFFFFF, 0 0 15px #FFFFFF',
              transform: 'translateZ(0)',
            }}
          />
          <div
            className="absolute left-1/2 -translate-x-1/2 mt-3 rounded-full text-xs font-bold"
            style={{
              top: '100%',
              background: 'rgba(0,0,0,0.8)',
              border: isPremium ? '1px solid rgba(255, 215, 0, 0.3)' : '1px solid rgba(255,255,255,0.1)',
              color: isPremium ? '#FFD700' : '#9CA3AF',
              padding: '6px 14px',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              minWidth: 'max-content'
            }}
          >
            <span>{isElite ? '👑' : isPremium ? '⭐' : '●'}</span>
            <span>MOI</span>
          </div>
        </div>
      </div>

      {userTier === 'free' && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at ${center.x + pan.x}px ${center.y + pan.y}px, transparent 0%, transparent 30%, rgba(5,5,16,0.7) 60%, rgba(5,5,16,0.95) 100%)` }} />
      )}

      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 p-2 rounded-2xl" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={() => {
            if ('vibrate' in navigator) navigator.vibrate(10);
            setZoom(z => Math.min(z * 1.2, limits.zoomMax));
          }}
          className="w-12 h-12 rounded-full bg-white/10 active:bg-white/30 text-white text-xl flex items-center justify-center transition-colors"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          +
        </button>
        <div className="text-white/60 text-xs text-center font-medium">{Math.round(zoom * 100)}%</div>
        <button
          onClick={() => {
            if ('vibrate' in navigator) navigator.vibrate(10);
            setZoom(z => Math.max(z / 1.2, limits.zoomMin));
          }}
          className="w-12 h-12 rounded-full bg-white/10 active:bg-white/30 text-white text-xl flex items-center justify-center transition-colors"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          −
        </button>
        <div className="w-full h-px bg-white/10 my-1" />
        <button
          onClick={() => {
            if ('vibrate' in navigator) navigator.vibrate(10);
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="w-12 h-12 rounded-full bg-white/10 active:bg-white/30 text-white text-sm flex items-center justify-center transition-colors"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          ⟳
        </button>
      </div>

      <button
        onClick={() => setShowMiniMap(!showMiniMap)}
        className="absolute top-20 left-4 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-xl active:scale-95 transition-transform z-40"
        style={{ minWidth: 44, minHeight: 44 }}
      >
        🗺️
      </button>

      {showMiniMap && (
        <div className="absolute top-36 left-4 w-32 h-32 rounded-2xl p-2" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <div className="relative w-full h-full">
            {visibleStars.map(star => {
              const pos = starPositions.get(star.id);
              if (!pos) return null;
              const x = ((pos.x / (center.x * 2)) * 100);
              const y = ((pos.y / (center.y * 2)) * 100);
              return (
                <div
                  key={star.id}
                  className="absolute w-1 h-1 rounded-full bg-yellow-400"
                  style={{ left: `${x}%`, top: `${y}%` }}
                />
              );
            })}
            <div className="absolute w-2 h-2 rounded-full bg-white border-2 border-yellow-400" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
          </div>
        </div>
      )}

      {/* Badge Tier et Compteur de signaux - En haut à gauche */}
      <div className="absolute top-4 left-4 flex items-center gap-3 z-50">
        {/* Badge Tier */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-full"
          style={{
            background: userTier === 'elite'
              ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2))'
              : userTier === 'premium'
              ? 'rgba(255, 215, 0, 0.1)'
              : 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${userTier !== 'free' ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255,255,255,0.1)'}`,
          }}
        >
          <span>{userTier === 'elite' ? '👑' : userTier === 'premium' ? '⭐' : '🌑'}</span>
          <span
            className="font-semibold text-sm"
            style={{ color: userTier !== 'free' ? '#FFD700' : '#9CA3AF' }}
          >
            {userTier === 'elite' ? 'Elite' : userTier === 'premium' ? 'Premium' : 'Gratuit'}
          </span>
        </div>

        {/* Compteur de signaux */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-full"
          style={{
            background: signalsRemaining <= 3 && !hasUnlimitedSignals
              ? 'rgba(239, 68, 68, 0.2)'
              : 'rgba(255, 215, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            border: signalsRemaining <= 3 && !hasUnlimitedSignals
              ? '1px solid rgba(239, 68, 68, 0.3)'
              : '1px solid rgba(255, 215, 0, 0.2)',
          }}
        >
          <span>💫</span>
          <span
            className="font-bold text-sm"
            style={{
              color: signalsRemaining <= 3 && !hasUnlimitedSignals ? '#EF4444' : '#FFD700'
            }}
          >
            {hasUnlimitedSignals ? '∞' : signalsRemaining}
          </span>
          {!hasUnlimitedSignals && (
            <span className="text-white/50 text-xs">/{signalLimit}</span>
          )}
          <span className="text-white/50 text-xs hidden sm:inline">signaux</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2.5 rounded-full" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
        <span className="text-yellow-400 text-lg">✨</span>
        <span className="text-white font-bold text-sm">{visibleStars.length}</span>
        {limits.maxStars !== 100 && <span className="text-white/50 text-sm">/{limits.maxStars}</span>}
        <span className="text-white/50 text-xs">étoiles</span>
      </div>

      <div
        className="absolute left-4 flex items-center gap-2 px-4 py-2 rounded-[20px]"
        style={{
          bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          background: isElite
            ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2))'
            : isPremium
            ? 'rgba(255, 215, 0, 0.1)'
            : 'rgba(147, 51, 234, 0.15)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${
            isElite
              ? 'rgba(255, 215, 0, 0.3)'
              : isPremium
              ? 'rgba(255, 215, 0, 0.3)'
              : 'rgba(147, 51, 234, 0.4)'
          }`,
          zIndex: 40
        }}
      >
        <span className="text-base">{isElite ? '👑' : isPremium ? '⭐' : '🌑'}</span>
        <span
          className="font-semibold text-[13px]"
          style={{
            color: isElite
              ? '#FFD700'
              : isPremium
              ? '#FFD700'
              : '#a855f7'
          }}
        >
          {isElite ? 'Elite' : isPremium ? 'Premium' : 'Gratuit'}
        </span>
      </div>

      {userTier === 'free' && showUnlockModal && (
        <div
          className="absolute flex flex-col items-center gap-1.5 px-2.5 py-2 rounded-2xl"
          style={{
            bottom: '88px',
            right: '8px',
            width: 'auto',
            maxWidth: '150px',
            background: 'rgba(15, 15, 25, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 215, 0, 0.35)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            animation: 'slideInFromRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <div
            className="px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
            style={{
              background: 'rgba(255, 215, 0, 0.15)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              color: '#FFD700',
              fontSize: '10px',
            }}
          >
            🔒 <span>15 / ∞</span>
          </div>
          <p className="text-white font-semibold text-center" style={{ fontSize: '11px' }}>
            Vision limitée
          </p>
          <button
            className="w-full px-3 py-1.5 rounded-xl text-black font-bold active:scale-95 transition-all"
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
              minHeight: 36,
              fontSize: '11px',
            }}
            onClick={() => {
              if ('vibrate' in navigator) navigator.vibrate([10, 10, 10]);
              setShowUnlockModal(false);

              setTimeout(() => {
                if (onNavigate) {
                  onNavigate('subscriptions-plans');
                }
              }, 200);
            }}
          >
            Débloquer
          </button>
        </div>
      )}

      {selectedStar && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-[999]"
            style={{
              backdropFilter: 'blur(8px)',
              animation: 'modalBackdrop 0.3s ease-out',
            }}
            onClick={() => setSelectedStar(null)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-[1000] rounded-t-3xl p-6"
            style={{
              background: 'linear-gradient(180deg, #1A1A2E 0%, #0D0D1A 100%)',
              border: '1px solid rgba(255, 215, 0, 0.1)',
              borderBottom: 'none',
              animation: 'slideUpFade 0.4s ease-out',
              paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
            }}
          >
            <div className="flex justify-center mb-5">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>
            <div className="flex gap-5 mb-6">
              <div className="relative">
                <img
                  src={selectedStar.photo}
                  alt={selectedStar.name}
                  className="w-24 h-24 rounded-2xl object-cover"
                  style={{
                    border: `2px solid ${getStarColor(selectedStar.compatibility)}60`,
                    boxShadow: `0 0 20px ${getStarColor(selectedStar.compatibility)}40`
                  }}
                />
                {selectedStar.tier !== 'free' && (
                  <div
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}
                  >
                    {selectedStar.tier === 'elite' ? '👑' : '⭐'}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">{selectedStar.name}, {selectedStar.age}</h3>
                  <span className="text-xl">{selectedStar.zodiac}</span>
                </div>
                <p className="text-white/60 text-sm mb-3">📍 {selectedStar.distance} km</p>
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{
                    background: `${getStarColor(selectedStar.compatibility)}20`,
                    border: `1px solid ${getStarColor(selectedStar.compatibility)}40`
                  }}
                >
                  <span className="text-lg font-bold" style={{ color: getStarColor(selectedStar.compatibility) }}>
                    {selectedStar.compatibility}%
                  </span>
                  <span className="text-white/70 text-sm">compatible</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleClose}
                className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-xl transition-all active:scale-95"
                style={{ minWidth: 44, minHeight: 44 }}
              >
                ✕
              </button>
              <button
                onClick={() => handleSendSignal(selectedStar)}
                disabled={likedStars.has(selectedStar?.id || '') || (!hasUnlimitedSignals && signalsRemaining <= 0)}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all active:scale-95 ${
                  likedStars.has(selectedStar?.id || '') || (!hasUnlimitedSignals && signalsRemaining <= 0)
                    ? 'opacity-50 cursor-not-allowed grayscale'
                    : 'hover:scale-110'
                }`}
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)',
                  minWidth: 44,
                  minHeight: 44,
                }}
              >
                {likedStars.has(selectedStar?.id || '') ? '✓' : '💫'}
              </button>
              <button
                onClick={() => handleSendSuperNova(selectedStar)}
                disabled={userTier === 'free' || superNovasSent.has(selectedStar?.id || '')}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all active:scale-95 ${
                  userTier === 'free' || superNovasSent.has(selectedStar?.id || '')
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-110'
                }`}
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  minWidth: 44,
                  minHeight: 44,
                }}
              >
                {superNovasSent.has(selectedStar?.id || '') ? '✓' : '🌟'}
              </button>
              <button
                onClick={() => handleViewProfile(selectedStar)}
                className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-xl transition-all active:scale-95 hover:scale-110"
                style={{ minWidth: 44, minHeight: 44 }}
              >
                👤
              </button>
            </div>

            {!hasUnlimitedSignals && (
              <div className="mt-4 text-center">
                <span
                  className="text-xs"
                  style={{ color: signalsRemaining <= 3 ? '#EF4444' : 'rgba(255,255,255,0.5)' }}
                >
                  💫 {signalsRemaining} signal{signalsRemaining > 1 ? 's' : ''} restant{signalsRemaining > 1 ? 's' : ''} aujourd'hui
                </span>

                {signalsRemaining <= 3 && signalsRemaining > 0 && (
                  <p className="text-yellow-400 text-xs mt-1">
                    ⚠️ Plus que {signalsRemaining} signal{signalsRemaining > 1 ? 's' : ''} !
                  </p>
                )}

                {signalsRemaining === 0 && (
                  <button
                    className="mt-2 px-4 py-2 rounded-full text-black text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}
                  >
                    ⭐ Passer en Premium - Signaux illimités
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {showFullProfile && selectedStar && (
        <>
          <div
            className="fixed inset-0 bg-black/80 z-[1001]"
            style={{ backdropFilter: 'blur(12px)' }}
            onClick={() => setShowFullProfile(false)}
          />
          <div
            className="fixed inset-4 z-[1002] rounded-3xl p-6 overflow-y-auto"
            style={{
              background: 'linear-gradient(180deg, #1A1A2E 0%, #0D0D1A 100%)',
              border: '2px solid rgba(255, 215, 0, 0.2)',
              maxHeight: 'calc(100vh - 32px)',
            }}
          >
            <button
              onClick={() => setShowFullProfile(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-lg transition-all active:scale-95 z-10"
            >
              ✕
            </button>

            <div className="relative mb-6">
              <img
                src={selectedStar.photo}
                alt={selectedStar.name}
                className="w-full h-64 object-cover rounded-2xl"
                style={{
                  border: `2px solid ${getStarColor(selectedStar.compatibility)}60`,
                  boxShadow: `0 0 30px ${getStarColor(selectedStar.compatibility)}40`
                }}
              />
              {selectedStar.tier !== 'free' && (
                <div
                  className="absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}
                >
                  {selectedStar.tier === 'elite' ? '👑' : '⭐'}
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-white">{selectedStar.name}, {selectedStar.age}</h2>
                <span className="text-3xl">{selectedStar.zodiac}</span>
              </div>
              <p className="text-white/60 text-base mb-4">📍 À {selectedStar.distance} km de vous</p>

              <div
                className="inline-flex items-center gap-3 px-5 py-3 rounded-full mb-6"
                style={{
                  background: `${getStarColor(selectedStar.compatibility)}20`,
                  border: `2px solid ${getStarColor(selectedStar.compatibility)}40`
                }}
              >
                <span className="text-2xl font-bold" style={{ color: getStarColor(selectedStar.compatibility) }}>
                  {selectedStar.compatibility}%
                </span>
                <span className="text-white/70 text-base">de compatibilité</span>
              </div>

              {selectedStar.isOnline && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-green-400" style={{ boxShadow: '0 0 8px #4ADE80' }} />
                  <span className="text-green-400 text-sm font-semibold">En ligne maintenant</span>
                </div>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <h3 className="text-white font-bold mb-2">À propos</h3>
                <p className="text-white/70 text-sm">
                  Profil astrologique détaillé • Passionné par les étoiles et les rencontres cosmiques
                </p>
              </div>

              <div className="p-4 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <h3 className="text-white font-bold mb-2">Compatibilité astrologique</h3>
                <p className="text-white/70 text-sm">
                  Votre connexion astrale est exceptionnelle avec ce profil.
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleClose}
                className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-xl transition-all active:scale-95"
              >
                ✕
              </button>
              <button
                onClick={() => handleSendSignal(selectedStar)}
                disabled={likedStars.has(selectedStar?.id || '') || (!hasUnlimitedSignals && signalsRemaining <= 0)}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all active:scale-95 ${
                  likedStars.has(selectedStar?.id || '') || (!hasUnlimitedSignals && signalsRemaining <= 0)
                    ? 'opacity-50 cursor-not-allowed grayscale'
                    : 'hover:scale-110'
                }`}
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)',
                }}
              >
                {likedStars.has(selectedStar?.id || '') ? '✓' : '💫'}
              </button>
              <button
                onClick={() => handleSendSuperNova(selectedStar)}
                disabled={userTier === 'free' || superNovasSent.has(selectedStar?.id || '')}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all active:scale-95 ${
                  userTier === 'free' || superNovasSent.has(selectedStar?.id || '')
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-110'
                }`}
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
              >
                {superNovasSent.has(selectedStar?.id || '') ? '✓' : '🌟'}
              </button>
            </div>

            {!hasUnlimitedSignals && (
              <div className="mt-4 text-center">
                <span
                  className="text-xs"
                  style={{ color: signalsRemaining <= 3 ? '#EF4444' : 'rgba(255,255,255,0.5)' }}
                >
                  💫 {signalsRemaining} signal{signalsRemaining > 1 ? 's' : ''} restant{signalsRemaining > 1 ? 's' : ''} aujourd'hui
                </span>

                {signalsRemaining <= 3 && signalsRemaining > 0 && (
                  <p className="text-yellow-400 text-xs mt-1">
                    ⚠️ Plus que {signalsRemaining} signal{signalsRemaining > 1 ? 's' : ''} !
                  </p>
                )}

                {signalsRemaining === 0 && (
                  <button
                    className="mt-2 px-4 py-2 rounded-full text-black text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}
                  >
                    ⭐ Passer en Premium - Signaux illimités
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {toast && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[2000]"
          style={{
            animation: 'slideDown 0.3s ease-out',
          }}
        >
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
            style={{
              background: toast.type === 'success'
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.9))'
                : toast.type === 'error'
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))'
                : 'linear-gradient(135deg, rgba(255, 215, 0, 0.9), rgba(255, 165, 0, 0.9))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: toast.type === 'success'
                ? '0 0 30px rgba(34, 197, 94, 0.4)'
                : toast.type === 'info'
                ? '0 0 30px rgba(255, 215, 0, 0.4)'
                : '0 0 30px rgba(239, 68, 68, 0.4)',
            }}
          >
            <span className="text-2xl">{toast.icon}</span>
            <span className="text-white font-medium text-sm">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniverseScreen;
