import { useState, useEffect } from 'react';
import { Sparkles, Heart, X, User, Crown, Gem, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DemoProfile {
  id: string;
  name: string;
  age: number;
  city: string;
  photo_url: string;
  bio: string;
  interests: string[];
  subscription_type: 'free' | 'premium' | 'elite';
  is_online: boolean;
}

type UserTier = 'free' | 'premium' | 'elite';
type ActiveTab = 'univers' | 'matches' | 'messages' | 'profil' | 'parametres';

const TIER_CONFIG = {
  free: {
    label: 'Gratuit',
    icon: <User size={14} className="text-white" />,
    color: '#EF4444',
    bgColor: 'bg-red-600'
  },
  premium: {
    label: 'Premium',
    icon: <Crown size={14} className="text-white" />,
    color: '#991B1B',
    bgColor: 'bg-red-900'
  },
  elite: {
    label: 'Elite',
    icon: <Gem size={14} className="text-amber-500" />,
    color: '#D97706',
    bgColor: 'bg-gradient-to-r from-red-600 to-amber-600'
  }
};

export default function UniversDating() {
  const [profiles, setProfiles] = useState<DemoProfile[]>([]);
  const [userTier, setUserTier] = useState<UserTier>('free');
  const [activeFilter, setActiveFilter] = useState<UserTier>('free');
  const [showSignals, setShowSignals] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('univers');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('demo_dating_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVisibleProfiles = () => {
    const tierHierarchy = { free: 0, premium: 1, elite: 2 };
    return profiles.filter(profile => {
      const profileLevel = tierHierarchy[profile.subscription_type];
      const userLevel = tierHierarchy[userTier];
      return profileLevel <= userLevel;
    });
  };

  const handleFilterClick = (tier: UserTier) => {
    const tierHierarchy = { free: 0, premium: 1, elite: 2 };
    if (tierHierarchy[tier] > tierHierarchy[userTier]) {
      alert(`Abonnement ${TIER_CONFIG[tier].label} requis pour accéder à ces profils !`);
      return;
    }
    setActiveFilter(tier);
  };

  const visibleProfiles = getVisibleProfiles();

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .star {
          position: absolute;
          background: #EF4444;
          border-radius: 50%;
          animation: twinkle 3s infinite;
        }
        .star:nth-child(2n) { animation-duration: 2s; }
        .star:nth-child(3n) { animation-duration: 4s; }
      `}</style>

      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="star"
          style={{
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            animationDelay: Math.random() * 3 + 's'
          }}
        />
      ))}

      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/80 border-b border-red-900/30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-red-600" size={28} />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
              Univers
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSignals(true)}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 rounded-lg text-sm font-medium transition-all"
            >
              Signaux
            </button>

            <div className={`px-3 py-1.5 ${TIER_CONFIG[userTier].bgColor} rounded-lg flex items-center gap-1.5 text-xs font-bold`}>
              {TIER_CONFIG[userTier].icon}
              <span className="hidden sm:inline">{TIER_CONFIG[userTier].label}</span>
            </div>

            <button
              onClick={() => {
                const tiers: UserTier[] = ['free', 'premium', 'elite'];
                const currentIndex = tiers.indexOf(userTier);
                const nextTier = tiers[(currentIndex + 1) % tiers.length];
                setUserTier(nextTier);
                setActiveFilter('free');
              }}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs transition-all"
            >
              Demo
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <section className="text-center mb-8">
            <div className="inline-block relative mb-4">
              <div
                className="w-24 h-24 rounded-full overflow-hidden border-4 border-red-600"
                style={{ boxShadow: '0 0 40px rgba(239, 68, 68, 0.6)' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"
                  alt="Mon profil"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Vous</h2>
            <p className="text-gray-400 text-sm mb-6">Explorez l'univers des rencontres</p>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              {(['free', 'premium', 'elite'] as UserTier[]).map((tier) => {
                const config = TIER_CONFIG[tier];
                const isActive = activeFilter === tier;
                const tierHierarchy = { free: 0, premium: 1, elite: 2 };
                const isLocked = tierHierarchy[tier] > tierHierarchy[userTier];

                return (
                  <button
                    key={tier}
                    onClick={() => handleFilterClick(tier)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      isActive
                        ? `${config.bgColor} shadow-lg`
                        : isLocked
                        ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                    style={
                      isActive
                        ? { boxShadow: `0 0 20px ${config.color}40` }
                        : {}
                    }
                  >
                    {config.icon}
                    <span>{config.label}</span>
                    {isLocked && <span className="text-xs">🔒</span>}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Sparkles className="text-red-600" size={20} />
              Profils compatibles
              <span className="text-gray-500 text-sm">({visibleProfiles.length})</span>
            </h3>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleProfiles.map((profile) => {
                  const config = TIER_CONFIG[profile.subscription_type];
                  return (
                    <div
                      key={profile.id}
                      className="bg-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-800 hover:border-red-600/50 transition-all duration-300 group hover:scale-[1.02]"
                      style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                    >
                      <div className="relative h-80">
                        <img
                          src={profile.photo_url}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                        <div className="absolute top-3 right-3">
                          <div className={`${config.bgColor} px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold shadow-lg`}>
                            {config.icon}
                            <span className="hidden sm:inline">{config.label}</span>
                          </div>
                        </div>

                        {profile.is_online && (
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs font-medium">En ligne</span>
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="text-xl font-bold mb-1">
                            {profile.name}, {profile.age}
                          </h4>
                          <p className="text-gray-300 text-sm mb-2">{profile.city}</p>
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{profile.bio}</p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {profile.interests.map((interest, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-red-600/20 border border-red-600/30 rounded-full text-xs font-medium"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>

                          <div className="flex gap-3">
                            <button className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-all">
                              Passer
                            </button>
                            <button
                              className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/50"
                              style={{ boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)' }}
                            >
                              <Heart size={18} fill="white" />
                              J'aime
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && visibleProfiles.length === 0 && (
              <div className="text-center py-20">
                <Sparkles className="mx-auto mb-4 text-red-600/30" size={64} />
                <h3 className="text-xl font-bold mb-2">Aucun profil disponible</h3>
                <p className="text-gray-400">
                  {userTier === 'free'
                    ? 'Passez à Premium ou Elite pour découvrir plus de profils !'
                    : 'Revenez plus tard pour découvrir de nouveaux profils'}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-2 py-2">
          <div className="flex items-center justify-around">
            {[
              { id: 'univers' as ActiveTab, icon: Sparkles, label: 'Univers' },
              { id: 'matches' as ActiveTab, icon: Heart, label: 'Matchs' },
              { id: 'messages' as ActiveTab, icon: Star, label: 'Messages' },
              { id: 'profil' as ActiveTab, icon: User, label: 'Profil' },
              { id: 'parametres' as ActiveTab, icon: Gem, label: 'Plus' }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                    isActive ? 'text-red-600' : 'text-gray-500'
                  }`}
                >
                  <Icon size={22} fill={isActive ? 'currentColor' : 'none'} />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {showSignals && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowSignals(false)}
          />

          <div className="relative bg-gray-900 rounded-2xl border border-red-600/30 max-w-md w-full p-6 shadow-2xl">
            <button
              onClick={() => setShowSignals(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-600/20 hover:bg-red-600/30 transition-all"
            >
              <X size={18} className="text-red-600" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <Star className="text-red-600" size={28} />
              <h2 className="text-2xl font-bold">Signaux Cosmiques</h2>
            </div>

            <div className="text-center py-12">
              <div className="mb-6 opacity-20">
                <Star className="mx-auto text-red-600" size={80} strokeWidth={1} />
              </div>

              <div className="mb-4">
                <p className="text-gray-400 text-lg mb-2">
                  <span className="text-white font-bold">0</span> signal reçu
                </p>
                <h3 className="text-xl font-bold text-gray-300 mb-3">
                  Aucun signal pour le moment
                </h3>
                <p className="text-gray-500 text-sm">
                  Explorez l'univers pour recevoir des signaux !
                </p>
              </div>

              <button
                onClick={() => setShowSignals(false)}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl font-bold transition-all shadow-lg shadow-red-600/50"
              >
                Commencer l'exploration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
