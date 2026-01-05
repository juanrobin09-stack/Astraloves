import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageCircle, Star, Moon, User, X, MapPin, Calendar, Send, Crown, Diamond, Camera, Check, ChevronLeft, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCosmicSignals } from '../hooks/useCosmicSignals';
import { useCosmicMessages, useConversationMessages } from '../hooks/useCosmicMessages';
import { useCosmicProfiles, useCurrentProfile, CosmicProfile } from '../hooks/useCosmicProfiles';

function SparklingStarIcon({ size = 16, className = '', style = {} }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={`sparkling-star ${className}`} style={{ display: 'inline-flex', ...style }}>
      <Star size={size} fill="currentColor" />
    </span>
  );
}

type Tier = 'free' | 'premium' | 'elite';
type ViewMode = 'univers' | 'messages' | 'astra' | 'astro' | 'profile';

interface TierConfig {
  maxProfiles: number;
  visibleSignals: number;
  dailySignalsToSend: number;
  canMessage: boolean;
  icon: React.ReactNode;
  label: string;
  color: string;
  price?: string;
}

const TIERS: Record<Tier, TierConfig> = {
  free: {
    maxProfiles: 15,
    visibleSignals: 3,
    dailySignalsToSend: 10,
    canMessage: false,
    icon: <Sparkles size={16} />,
    label: 'Gratuit',
    color: '#ff6b9d'
  },
  premium: {
    maxProfiles: 50,
    visibleSignals: 20,
    dailySignalsToSend: 100,
    canMessage: true,
    icon: <Diamond size={16} />,
    label: 'Premium',
    color: '#ff4477',
    price: '9.99'
  },
  elite: {
    maxProfiles: 200,
    visibleSignals: 100,
    dailySignalsToSend: 1000,
    canMessage: true,
    icon: <Crown size={16} />,
    label: 'Elite',
    color: '#ff0a54',
    price: '19.99'
  }
};

const navItems = [
  { id: 'univers' as ViewMode, icon: Sparkles, label: 'Univers' },
  { id: 'messages' as ViewMode, icon: MessageCircle, label: 'Messages' },
  { id: 'astra' as ViewMode, icon: Star, label: 'Astra' },
  { id: 'astro' as ViewMode, icon: Moon, label: 'Astro' },
  { id: 'profile' as ViewMode, icon: User, label: 'Profil' }
];

export default function UniversSimple() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeView, setActiveView] = useState<ViewMode>('univers');
  const [selectedProfile, setSelectedProfile] = useState<CosmicProfile | null>(null);
  const [showSignalsModal, setShowSignalsModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState<Tier>('premium');
  const [currentTier, setCurrentTier] = useState<Tier>('free');
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tierConfig = TIERS[currentTier] || TIERS.free;

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      if (user) {
        const { data: profile } = await supabase
          .from('astra_profiles')
          .select('premium_tier')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.premium_tier && ['free', 'premium', 'elite'].includes(profile.premium_tier)) {
          setCurrentTier(profile.premium_tier as Tier);
        } else {
          setCurrentTier('free');
        }
      }
    };
    getUser();
  }, []);

  const { profile: currentProfile, uploadPhoto } = useCurrentProfile(userId);
  const { profiles, isLoading: profilesLoading } = useCosmicProfiles(userId, tierConfig.maxProfiles);
  const {
    receivedSignals,
    sentSignals,
    sendSignal,
    hasSentSignalTo,
    isMatch,
    unreadCount: signalsUnreadCount,
    dailySignalsUsed
  } = useCosmicSignals(userId);
  const { conversations, totalUnreadCount, getOrCreateConversation } = useCosmicMessages(userId);

  const visibleProfiles = profiles.slice(0, tierConfig.maxProfiles);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let stars: { x: number; y: number; size: number; baseOpacity: number; speed: number; phase: number }[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      const starCount = Math.min(150, Math.floor((canvas.width * canvas.height) / 6000));
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2,
          baseOpacity: Math.random() * 0.5 + 0.2,
          speed: Math.random() * 0.003 + 0.001,
          phase: Math.random() * Math.PI * 2
        });
      }
    };

    const animate = (time: number) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        const twinkle = Math.sin(time * star.speed + star.phase);
        const opacity = Math.max(0, Math.min(0.7, star.baseOpacity + twinkle * 0.3));

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'linear-gradient(135deg, #ff0a54, #ff1744)';
    if (score >= 80) return 'linear-gradient(135deg, #ff3355, #ff0a54)';
    if (score >= 70) return 'linear-gradient(135deg, #ff5577, #ff3355)';
    return 'linear-gradient(135deg, #ff7799, #ff5577)';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#ff0a54';
    if (score >= 80) return '#ff3355';
    if (score >= 70) return '#ff5577';
    return '#ff7799';
  };

  const handleShowUpgrade = (tier: Tier) => {
    setUpgradeTarget(tier);
    setShowUpgradeModal(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    await uploadPhoto(file);
    setIsUploading(false);
  };

  const handleSendSignal = async (profileId: string) => {
    if (dailySignalsUsed >= tierConfig.dailySignalsToSend) {
      handleShowUpgrade(currentTier === 'free' ? 'premium' : 'elite');
      return;
    }
    await sendSignal(profileId);
  };

  const handleOpenMessage = async (profileId: string) => {
    if (!tierConfig.canMessage && !isMatch(profileId)) {
      handleShowUpgrade('premium');
      return;
    }
    const convId = await getOrCreateConversation(profileId);
    if (convId) {
      setSelectedConversationId(convId);
      setActiveView('messages');
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'A l\'instant';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 10, 84, 0.4); }
          50% { box-shadow: 0 0 35px rgba(255, 10, 84, 0.6); }
        }
        @keyframes notif-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 10, 84, 0.5); }
          50% { transform: scale(1.1); box-shadow: 0 0 18px rgba(255, 10, 84, 0.8); }
        }
        @keyframes sparkle {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            filter: drop-shadow(0 0 3px currentColor);
          }
          25% {
            transform: scale(1.15) rotate(5deg);
            filter: drop-shadow(0 0 8px currentColor) drop-shadow(0 0 15px currentColor);
          }
          50% {
            transform: scale(1) rotate(0deg);
            filter: drop-shadow(0 0 5px currentColor);
          }
          75% {
            transform: scale(1.1) rotate(-5deg);
            filter: drop-shadow(0 0 10px currentColor) drop-shadow(0 0 18px currentColor);
          }
        }
        .sparkling-star {
          animation: sparkle 2s ease-in-out infinite;
          color: #ff6b9d;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes signal-pulse {
          0%, 100% { box-shadow: 0 0 15px rgba(255, 10, 84, 0.2); }
          50% { box-shadow: 0 0 25px rgba(255, 10, 84, 0.5); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes messageFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .profile-card {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @media (hover: hover) {
          .profile-card:hover {
            transform: translateY(-6px) scale(1.03);
          }
        }
        .profile-card:active {
          transform: scale(0.97);
        }
        .profile-circle {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
        }
        .profile-circle::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          pointer-events: none;
        }
        @media (hover: hover) {
          .profile-card:hover .profile-circle::after {
            animation: shine 0.5s ease forwards;
          }
        }
        .main-profile-ring {
          animation: pulse-glow 2.5s infinite ease-in-out;
        }
        .profiles-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px 6px;
          justify-items: center;
          align-items: start;
        }
        @media (min-width: 375px) {
          .profiles-grid {
            gap: 12px 8px;
          }
        }
        @media (min-width: 480px) {
          .profiles-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 14px 10px;
          }
        }
        @media (min-width: 640px) {
          .profiles-grid {
            grid-template-columns: repeat(5, 1fr);
            gap: 16px 12px;
          }
        }
        @media (min-width: 768px) {
          .profiles-grid {
            grid-template-columns: repeat(6, 1fr);
            gap: 18px 14px;
          }
        }
        .signal-item {
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @media (hover: hover) {
          .signal-item:hover {
            transform: translateX(3px);
          }
        }
        .signal-item:active {
          transform: scale(0.98);
        }
        .signal-item.new-signal {
          animation: signal-pulse 2s ease-in-out infinite;
        }
        .conversation-item {
          transition: all 0.2s ease;
        }
        @media (hover: hover) {
          .conversation-item:hover {
            background: rgba(255, 10, 84, 0.06);
          }
        }
        .conversation-item:active {
          background: rgba(255, 10, 84, 0.1);
        }
        .message-bubble {
          animation: messageFadeIn 0.25s ease-out;
        }

        * {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }

        .safe-bottom {
          padding-bottom: max(env(safe-area-inset-bottom), 12px);
        }
      `}</style>

      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />

      <div className="relative" style={{ zIndex: 1 }}>
        <header className="fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-lg border-b border-white/5">
          <div className="px-4 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-shrink-0">
                <h1
                  className="text-base font-bold bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, #ff0a54, #ff1744)' }}
                >
                  Univers
                </h1>
              </div>

              <button
                onClick={() => setShowSignalsModal(true)}
                className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 10, 84, 0.15), rgba(196, 0, 58, 0.1))',
                  border: '1.5px solid rgba(255, 10, 84, 0.4)',
                  color: '#ff6b9d'
                }}
              >
                <SparklingStarIcon size={14} />
                <span className="hidden xs:inline">Signaux</span>
                {signalsUnreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{
                      background: 'linear-gradient(135deg, #ff0a54, #c4003a)',
                      border: '1.5px solid #000',
                      animation: 'notif-pulse 1.5s ease-in-out infinite'
                    }}
                  >
                    {signalsUnreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="pt-16 pb-20 px-3 flex flex-col h-screen overflow-hidden">
          {activeView === 'univers' && (
            <>
              <section className="mb-3 mt-2">
                <div className="flex justify-center">
                  <div
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${tierConfig.color}30, ${tierConfig.color}20)`,
                      border: `1px solid ${tierConfig.color}40`,
                      boxShadow: `0 2px 10px ${tierConfig.color}20`
                    }}
                  >
                    {tierConfig.icon}
                    <span className="text-white text-xs font-medium">{tierConfig.label}</span>
                  </div>
                </div>
              </section>

              <section className="flex justify-center py-2 mb-3">
                <div className="flex flex-col items-center">
                  <div
                    className="main-profile-ring rounded-full p-[2px]"
                    style={{
                      width: 'clamp(65px, 16vw, 80px)',
                      height: 'clamp(65px, 16vw, 80px)',
                      background: 'linear-gradient(135deg, #ff0a54, #c4003a)'
                    }}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-black relative">
                      {currentProfile?.avatar_url ? (
                        <img
                          src={currentProfile.avatar_url}
                          alt="Moi"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex flex-col items-center justify-center cursor-pointer transition-all active:bg-white/5"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {isUploading ? (
                            <Loader2 size={18} className="text-[#ff6b9d] animate-spin" />
                          ) : (
                            <>
                              <Camera size={18} className="text-[#ff6b9d] mb-0.5" />
                              <span className="text-[8px] text-[#ff6b9d] font-medium">Ajouter</span>
                            </>
                          )}
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                  <span
                    className="mt-1.5 px-2.5 py-0.5 rounded-full text-white text-[9px] font-bold tracking-wide"
                    style={{ background: 'linear-gradient(135deg, #ff0a54, #c4003a)' }}
                  >
                    {currentProfile?.pseudo || 'MOI'}
                  </span>
                </div>
              </section>

              <section className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-2 px-1">
                  <h2 className="text-white text-xs font-bold">Profils compatibles</h2>
                  <span className="text-gray-500 text-[10px]">
                    {profilesLoading ? 'Chargement...' : `${visibleProfiles.length}`}
                  </span>
                </div>

                {profilesLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 size={24} className="text-[#ff0a54] animate-spin" />
                  </div>
                ) : visibleProfiles.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mb-3 opacity-30">
                      <Sparkles className="inline-block text-gray-500" size={32} />
                    </div>
                    <p className="text-gray-400 text-xs">Aucun profil disponible</p>
                    <p className="text-gray-500 text-[10px] mt-1">Revenez plus tard</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto -mx-3 px-3 pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style>{`
                      .profiles-scroll::-webkit-scrollbar {
                        display: none;
                      }
                    `}</style>
                    <div className="profiles-grid profiles-scroll">
                      {visibleProfiles.map((profile, index) => {
                        const score = profile.compatibility_score || 70;
                        const gradient = getScoreGradient(score);
                        const color = getScoreColor(score);

                        return (
                          <motion.div
                            key={profile.id}
                            className="profile-card flex flex-col items-center cursor-pointer w-full"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              duration: 0.25,
                              delay: Math.min(index * 0.015, 0.2),
                              ease: [0.34, 1.56, 0.64, 1]
                            }}
                            onClick={() => setSelectedProfile(profile)}
                          >
                            <div
                              className="profile-circle rounded-full p-[2px]"
                              style={{
                                width: 'clamp(65px, 20vw, 85px)',
                                height: 'clamp(65px, 20vw, 85px)',
                                background: gradient,
                                boxShadow: `0 2px 10px ${color}25`
                              }}
                            >
                              <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
                                <img
                                  src={profile.avatar_url!}
                                  alt={profile.pseudo!}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                            </div>

                            <div
                              className="relative -mt-2 px-1.5 py-0.5 rounded-full text-white text-[9px] font-bold"
                              style={{ background: gradient, zIndex: 2 }}
                            >
                              {score}%
                            </div>

                            <p
                              className="text-white text-[10px] font-medium mt-1 text-center truncate w-full px-0.5"
                            >
                              {profile.pseudo}{profile.age ? `, ${profile.age}` : ''}
                            </p>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

          {activeView === 'messages' && (
            <MessagesView
              userId={userId}
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              setSelectedConversationId={setSelectedConversationId}
              formatTime={formatTime}
            />
          )}

          {activeView === 'astra' && (
            <div className="text-center py-12">
              <Star className="inline-block text-[#ff0a54] mb-4" size={48} />
              <h2 className="text-white text-lg font-bold mb-2">Astra - Votre guide cosmique</h2>
              <p className="text-gray-400 text-sm">Discutez avec votre assistant personnel</p>
            </div>
          )}

          {activeView === 'astro' && (
            <div className="text-center py-12">
              <Moon className="inline-block text-[#ff0a54] mb-4" size={48} />
              <h2 className="text-white text-lg font-bold mb-2">Astrologie</h2>
              <p className="text-gray-400 text-sm">Decouvrez votre horoscope quotidien</p>
            </div>
          )}

          {activeView === 'profile' && (
            <div className="text-center py-12">
              <User className="inline-block text-[#ff0a54] mb-4" size={48} />
              <h2 className="text-white text-lg font-bold mb-2">Mon Profil</h2>
              <p className="text-gray-400 text-sm">Gerez vos informations personnelles</p>
            </div>
          )}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-lg border-t border-white/5 safe-bottom">
          <div className="flex justify-around items-center py-1.5 px-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              const showBadge = item.id === 'messages' && totalUnreadCount > 0;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className="relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all active:scale-95"
                >
                  <Icon
                    className="transition-colors duration-150"
                    style={{
                      width: isActive ? 20 : 18,
                      height: isActive ? 20 : 18,
                      color: isActive ? '#ff0a54' : '#555'
                    }}
                    fill={isActive ? '#ff0a54' : 'none'}
                  />
                  <span
                    className="text-[8px] font-medium transition-colors duration-150"
                    style={{ color: isActive ? '#ff0a54' : '#555' }}
                  >
                    {item.label}
                  </span>
                  {showBadge && (
                    <span
                      className="absolute -top-0.5 right-0 min-w-[14px] h-3.5 px-1 flex items-center justify-center rounded-full text-[7px] font-bold text-white"
                      style={{
                        background: 'linear-gradient(135deg, #ff0a54, #c4003a)',
                      }}
                    >
                      {totalUnreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <AnimatePresence>
          {selectedProfile && (
            <ProfileModal
              profile={selectedProfile}
              onClose={() => setSelectedProfile(null)}
              hasSentSignal={hasSentSignalTo(selectedProfile.id)}
              isMatched={isMatch(selectedProfile.id)}
              onSendSignal={() => handleSendSignal(selectedProfile.id)}
              onMessage={() => handleOpenMessage(selectedProfile.id)}
              canMessage={tierConfig.canMessage || isMatch(selectedProfile.id)}
              getScoreGradient={getScoreGradient}
              getScoreColor={getScoreColor}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSignalsModal && (
            <SignalsModal
              signals={receivedSignals}
              onClose={() => setShowSignalsModal(false)}
              onSelectProfile={setSelectedProfile}
              formatTime={formatTime}
              isMatch={isMatch}
              onSendSignal={handleSendSignal}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showUpgradeModal && (
            <UpgradeModal
              targetTier={upgradeTarget}
              onClose={() => setShowUpgradeModal(false)}
              onConfirm={() => {
                setCurrentTier(upgradeTarget);
                setShowUpgradeModal(false);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface ProfileModalProps {
  profile: CosmicProfile;
  onClose: () => void;
  hasSentSignal: boolean;
  isMatched: boolean;
  onSendSignal: () => void;
  onMessage: () => void;
  canMessage: boolean;
  getScoreGradient: (score: number) => string;
  getScoreColor: (score: number) => string;
}

function ProfileModal({
  profile,
  onClose,
  hasSentSignal,
  isMatched,
  onSendSignal,
  onMessage,
  canMessage,
  getScoreGradient,
  getScoreColor
}: ProfileModalProps) {
  const score = profile.compatibility_score || 70;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

      <motion.div
        className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ background: 'linear-gradient(180deg, #1a1a1a, #0a0a0a)' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center active:scale-90 transition-all"
        >
          <X size={16} className="text-white" />
        </button>

        <div
          className="h-40 relative flex items-center justify-center"
          style={{ background: 'linear-gradient(180deg, rgba(255,10,84,0.15), transparent)' }}
        >
          <div
            className="rounded-full p-[2px]"
            style={{
              width: 'clamp(90px, 25vw, 110px)',
              height: 'clamp(90px, 25vw, 110px)',
              background: getScoreGradient(score),
              boxShadow: `0 0 30px ${getScoreColor(score)}50`
            }}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
              <img
                src={profile.avatar_url!}
                alt={profile.pseudo!}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white text-xs font-bold"
            style={{ background: getScoreGradient(score) }}
          >
            {score}% compatible
          </div>
        </div>

        <div className="p-4 pb-6">
          <h2 className="text-xl font-bold text-white mb-0.5 text-center">
            {profile.pseudo}
          </h2>

          <div className="flex items-center justify-center gap-3 text-gray-400 text-xs mb-3">
            {profile.age && (
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {profile.age} ans
              </span>
            )}
            {profile.ville && (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {profile.ville}
              </span>
            )}
          </div>

          {profile.bio && (
            <p className="text-gray-400 text-xs mb-4 leading-relaxed text-center line-clamp-3">
              {profile.bio}
            </p>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mb-4">
              {profile.interests.slice(0, 4).map((interest, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full text-[10px]"
                  style={{
                    background: 'rgba(255, 10, 84, 0.1)',
                    border: '1px solid rgba(255, 10, 84, 0.25)',
                    color: '#ff6b9d'
                  }}
                >
                  {interest}
                </span>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {!hasSentSignal ? (
              <button
                onClick={onSendSignal}
                className="w-full py-2.5 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #ff0a54, #c4003a)',
                  boxShadow: '0 3px 12px rgba(255, 10, 84, 0.35)'
                }}
              >
                <Star size={16} fill="white" />
                Envoyer un signal
              </button>
            ) : (
              <div
                className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 text-center"
                style={{
                  background: 'rgba(0, 255, 100, 0.08)',
                  border: '1.5px solid rgba(0, 255, 100, 0.25)',
                  color: '#00ff64'
                }}
              >
                <Check size={16} />
                Signal envoye
                {isMatched && <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white">Match!</span>}
              </div>
            )}

            {canMessage && (
              <button
                onClick={onMessage}
                className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all active:bg-white/10"
                style={{
                  background: 'rgba(255, 10, 84, 0.08)',
                  border: '1.5px solid rgba(255, 10, 84, 0.25)',
                  color: '#ff4477'
                }}
              >
                <MessageCircle size={16} />
                Message
                {isMatched && <span className="text-amber-400">*</span>}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-white/8 text-white text-sm font-medium transition-all active:bg-white/15"
            >
              Fermer
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface SignalsModalProps {
  signals: any[];
  onClose: () => void;
  onSelectProfile: (profile: CosmicProfile) => void;
  formatTime: (date: string) => string;
  isMatch: (userId: string) => boolean;
  onSendSignal: (userId: string) => void;
}

function SignalsModal({
  signals,
  onClose,
  onSelectProfile,
  formatTime,
  isMatch,
  onSendSignal
}: SignalsModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <motion.div
        className="relative w-full sm:max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
        style={{ background: 'linear-gradient(180deg, #1a1a1a, #0a0a0a)' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 p-3 border-b border-white/10 bg-[#1a1a1a]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SparklingStarIcon size={18} style={{ color: '#ff0a54' }} />
              <h2 className="text-base font-bold text-white">Signaux Cosmiques</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
            >
              <X size={18} className="text-white" />
            </button>
          </div>

          <p className="mt-2 text-gray-400 text-xs">
            {signals.length} signal{signals.length > 1 ? 'x' : ''} recu{signals.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {signals.length === 0 ? (
            <div className="text-center py-10">
              <div className="mb-4 opacity-30">
                <Star size={40} className="inline-block text-gray-500" />
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Aucun signal pour le moment</h3>
              <p className="text-gray-500 text-xs">Explorez l'univers pour recevoir des signaux!</p>
            </div>
          ) : (
            <>
              {signals.map((signal) => {
                const profile = signal.from_profile;
                const matched = isMatch(signal.from_user);

                return (
                  <div
                    key={signal.id}
                    className="signal-item flex items-center gap-3 p-3 mb-2 rounded-xl cursor-pointer active:scale-98 transition-all"
                    style={{
                      background: 'rgba(255, 10, 84, 0.04)',
                      border: matched ? '1px solid #ff0a54' : '1px solid rgba(255, 10, 84, 0.15)'
                    }}
                    onClick={() => {
                      if (profile) {
                        onSelectProfile({
                          id: profile.id,
                          pseudo: profile.pseudo,
                          age: profile.age,
                          avatar_url: profile.avatar_url,
                          bio: profile.bio,
                          ville: profile.ville,
                          interests: null,
                          signe_solaire: null,
                          premium_tier: null,
                          is_verified: false,
                          looking_for: null,
                          last_seen_at: null,
                          compatibility_score: 85
                        });
                        onClose();
                      }
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full p-[1.5px] flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #ff0a54, #c4003a)' }}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile.pseudo || ''}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-gray-600">
                            {(profile?.pseudo || '?')[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-bold truncate">
                        {profile?.pseudo || 'Anonyme'}{profile?.age ? `, ${profile.age}` : ''}
                      </p>
                      <p className="text-gray-400 text-[10px] truncate">
                        {matched ? 'Vous avez matche!' : 'Signal cosmique recu'}
                      </p>
                      <p className="text-gray-500 text-[9px]">{formatTime(signal.created_at)}</p>
                    </div>
                    {!matched ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSendSignal(signal.from_user);
                        }}
                        className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white flex-shrink-0 transition-all active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #ff0a54, #c4003a)' }}
                      >
                        Accepter
                      </button>
                    ) : (
                      <span
                        className="px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #ffaa00, #ff6600)', color: 'white' }}
                      >
                        Match!
                      </span>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

interface UpgradeModalProps {
  targetTier: Tier;
  onClose: () => void;
  onConfirm: () => void;
}

function UpgradeModal({ targetTier, onClose, onConfirm }: UpgradeModalProps) {
  const config = TIERS[targetTier];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />

      <motion.div
        className="relative text-center max-w-sm"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl mb-6" style={{ animation: 'float 2.5s ease-in-out infinite' }}>
          {targetTier === 'elite' ? (
            <Crown className="inline-block text-[#ff0a54]" size={64} />
          ) : (
            <Diamond className="inline-block text-[#ff4477]" size={64} />
          )}
        </div>

        <h2
          className="text-2xl font-bold mb-3 bg-clip-text text-transparent"
          style={{ backgroundImage: 'linear-gradient(135deg, #ff0a54, #ff4477)' }}
        >
          Passez {config.label}
        </h2>

        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          {targetTier === 'elite'
            ? 'Acces TOTAL a l\'univers avec toutes les fonctionnalites!'
            : 'Debloquez plus de profils et de signaux!'}
        </p>

        <div className="space-y-3 mb-6 text-left">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <span className="text-[#ff0a54]">&#10003;</span>
            <span className="text-white text-sm">{config.maxProfiles} profils visibles</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <span className="text-[#ff0a54]">&#10003;</span>
            <span className="text-white text-sm">{config.visibleSignals} signaux visibles</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <span className="text-[#ff0a54]">&#10003;</span>
            <span className="text-white text-sm">
              {config.canMessage ? 'Messages illimites' : 'Messages avec matchs'}
            </span>
          </div>
        </div>

        <button
          onClick={onConfirm}
          className="w-full py-4 rounded-2xl text-white text-base font-bold transition-all hover:scale-105 mb-3"
          style={{
            background: 'linear-gradient(135deg, #ff0a54, #c4003a)',
            boxShadow: '0 6px 25px rgba(255, 10, 84, 0.5)'
          }}
        >
          Activer {config.label} - {config.price}/mois
        </button>

        <button
          onClick={onClose}
          className="text-gray-500 text-sm hover:text-white transition-colors"
        >
          Plus tard
        </button>
      </motion.div>
    </motion.div>
  );
}

interface MessagesViewProps {
  userId: string | null;
  conversations: any[];
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  formatTime: (date: string) => string;
}

function MessagesView({
  userId,
  conversations,
  selectedConversationId,
  setSelectedConversationId,
  formatTime
}: MessagesViewProps) {
  const { messages, sendMessage, markAsRead } = useConversationMessages(selectedConversationId, userId);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  useEffect(() => {
    if (selectedConversationId) {
      markAsRead();
    }
  }, [selectedConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim()) return;
    await sendMessage(messageText);
    setMessageText('');
  };

  if (selectedConversationId && selectedConversation) {
    return (
      <div className="flex flex-col h-[calc(100vh-160px)]">
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <button
            onClick={() => setSelectedConversationId(null)}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
          >
            <ChevronLeft size={18} className="text-white" />
          </button>
          <div
            className="w-10 h-10 rounded-full p-[2px] flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #ff0a54, #c4003a)' }}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
              {selectedConversation.other_user?.avatar_url ? (
                <img
                  src={selectedConversation.other_user.avatar_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-gray-600">
                  {(selectedConversation.other_user?.pseudo || '?')[0].toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-white text-sm font-bold">
              {selectedConversation.other_user?.pseudo || 'Anonyme'}
            </p>
            <p className="text-gray-500 text-xs">En ligne</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Aucun message</p>
              <p className="text-gray-600 text-xs">Envoyez le premier message!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender_id === userId;
              return (
                <div
                  key={msg.id}
                  className={`message-bubble flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                      isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'
                    }`}
                    style={{
                      background: isOwn
                        ? 'linear-gradient(135deg, #ff0a54, #c4003a)'
                        : 'rgba(255, 10, 84, 0.15)',
                      border: isOwn ? 'none' : '1px solid rgba(255, 10, 84, 0.3)'
                    }}
                  >
                    <p className="text-white text-sm">{msg.content}</p>
                    <p className="text-white/60 text-[10px] text-right mt-1">
                      {formatTime(msg.created_at)}
                      {isOwn && msg.is_read && <span className="ml-1 text-green-400">&#10003;&#10003;</span>}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Ecrivez votre message..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#ff0a54]/50"
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
            />
            <button
              onClick={handleSend}
              disabled={!messageText.trim()}
              className="px-4 py-3 rounded-xl text-white font-medium transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #ff0a54, #c4003a)'
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2
        className="text-lg font-bold mb-4 bg-clip-text text-transparent"
        style={{ backgroundImage: 'linear-gradient(135deg, #ff0a54, #ff1744)' }}
      >
        Messages
      </h2>

      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="inline-block text-gray-600 mb-4" size={48} />
          <p className="text-gray-400 text-sm">Aucune conversation</p>
          <p className="text-gray-500 text-xs mt-1">Envoyez des signaux pour commencer a discuter!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const hasUnread = userId === conv.user1_id
              ? conv.user1_unread_count > 0
              : conv.user2_unread_count > 0;

            return (
              <div
                key={conv.id}
                className="conversation-item flex items-center gap-3 p-3 rounded-xl cursor-pointer"
                style={{
                  background: hasUnread ? 'rgba(255, 10, 84, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  border: hasUnread ? '1px solid rgba(255, 10, 84, 0.3)' : '1px solid transparent'
                }}
                onClick={() => setSelectedConversationId(conv.id)}
              >
                <div
                  className="w-12 h-12 rounded-full p-[2px] flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #ff0a54, #c4003a)' }}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
                    {conv.other_user?.avatar_url ? (
                      <img
                        src={conv.other_user.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-gray-600">
                        {(conv.other_user?.pseudo || '?')[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-bold truncate">
                      {conv.other_user?.pseudo || 'Anonyme'}
                    </p>
                    {conv.last_message_at && (
                      <p className="text-gray-500 text-[10px]">{formatTime(conv.last_message_at)}</p>
                    )}
                  </div>
                  {conv.last_message_text && (
                    <p className="text-gray-400 text-xs truncate">{conv.last_message_text}</p>
                  )}
                </div>
                {hasUnread && (
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: '#ff0a54', boxShadow: '0 0 10px rgba(255, 10, 84, 0.6)' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
