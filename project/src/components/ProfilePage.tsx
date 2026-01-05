import { useState, useEffect } from 'react';
import { Camera, Edit2, ChevronRight, Crown, Settings, TrendingUp, Eye, Sparkles, LogOut, Heart, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type ProfilePageProps = {
  onNavigate: (page: string) => void;
};

type ProfileData = {
  first_name: string | null;
  age: number | null;
  gender: string | null;
  avatar_url: string | null;
  is_premium: boolean;
  premium_until: string | null;
  premium_tier: string | null;
  created_at: string;
  birth_date: string | null;
  birth_time: string | null;
  sun_sign: string | null;
  ville: string | null;
  username: string | null;
  photos: string[];
  bio: string | null;
};

const ZODIAC_EMOJI: Record<string, string> = {
  'Belier': '♈', 'Taureau': '♉', 'Gemeaux': '♊', 'Cancer': '♋',
  'Lion': '♌', 'Vierge': '♍', 'Balance': '♎', 'Scorpion': '♏',
  'Sagittaire': '♐', 'Capricorne': '♑', 'Verseau': '♒', 'Poissons': '♓',
};

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avgCompatibility: 87,
    matches: 0,
    signalsReceived: 0,
    profileViews: 0,
  });
  const [completion, setCompletion] = useState(71);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('astra_profiles')
        .select('first_name, age, gender, avatar_url, is_premium, premium_until, premium_tier, created_at, birth_date, birth_time, sun_sign, ville, username, photos, bio')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
        calculateCompletion(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletion = (profileData: ProfileData) => {
    const fields = [
      profileData.first_name,
      profileData.age,
      profileData.gender,
      profileData.birth_date,
      profileData.ville,
      profileData.sun_sign,
      profileData.username,
      profileData.bio,
      profileData.birth_time,
      profileData.avatar_url || (profileData.photos && profileData.photos.length > 0),
    ];

    const completed = fields.filter(Boolean).length;
    const percentage = Math.round((completed / fields.length) * 100);
    setCompletion(percentage);
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      const { data: signalsData } = await supabase
        .from('swipes')
        .select('id')
        .eq('target_id', user.id)
        .eq('action', 'like');

      const { data: profileData } = await supabase
        .from('profiles')
        .select('profile_views, likes_received, matches_count')
        .eq('id', user.id)
        .maybeSingle();

      setStats({
        avgCompatibility: 87,
        matches: profileData?.matches_count || conversations?.length || 0,
        signalsReceived: profileData?.likes_received || signalsData?.length || 0,
        profileViews: profileData?.profile_views || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getPlanInfo = () => {
    if (!profile) return { label: 'Gratuit', badge: '✨', color: 'gray' };
    const tier = profile.premium_tier || (profile.is_premium ? 'premium' : 'free');
    if (tier === 'premium_elite' || tier === 'elite') {
      return { label: 'Elite', badge: '👑', color: 'amber' };
    }
    if (tier === 'premium' || profile.is_premium) {
      return { label: 'Premium', badge: '💎', color: 'purple' };
    }
    return { label: 'Gratuit', badge: '✨', color: 'gray' };
  };

  const planInfo = getPlanInfo();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-white">Profil non trouve</div>
      </div>
    );
  }

  const zodiacEmoji = profile.sun_sign ? ZODIAC_EMOJI[profile.sun_sign] || '⭐' : '⭐';

  return (
    <div className="fixed inset-0 bg-[#0A0A0F] flex flex-col" style={{ paddingBottom: '70px' }}>
      <div className="flex-1 flex flex-col px-3 pt-10 pb-2 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-base font-bold text-white">Mon Profil</h1>
          <button
            onClick={handleLogout}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(220, 38, 38, 0.15)' }}
          >
            <LogOut className="w-4 h-4 text-red-500" />
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <div
            className="rounded-xl p-3 flex-shrink-0"
            style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
          >
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full p-[2px]" style={{ background: 'conic-gradient(from 0deg, #DC2626, #FF6B6B, #DC2626)' }}>
                  {profile.avatar_url || (profile.photos && profile.photos.length > 0) ? (
                    <img src={profile.avatar_url || profile.photos[0]} alt="" className="w-full h-full rounded-full object-cover" style={{ border: '2px solid #0A0A0F' }} />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center" style={{ border: '2px solid #0A0A0F' }}>
                      <Camera className="w-4 h-4 text-white/80" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-white">{profile.first_name || 'Utilisateur'}</span>
                  <span className="text-xs text-white/60">{profile.age} ans</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500/20 text-amber-400">
                    {zodiacEmoji} {profile.sun_sign || '?'}
                  </span>
                  <span className="text-white/40 text-[10px]">{profile.ville || 'France'}</span>
                </div>
                <p className="text-white/30 text-[10px]">@{profile.username || 'pseudo'}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('edit-profile')}
              className="w-full h-8 mt-2 flex items-center justify-center gap-2 rounded-lg text-xs font-medium text-white/80 active:scale-[0.98]"
              style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <Edit2 className="w-3.5 h-3.5" />
              Modifier mon profil
            </button>
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-white/50">Profil {completion}%</span>
                <span className="text-white/30">{completion}/100</span>
              </div>
              <div className="h-1 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-500" style={{ width: `${completion}%` }} />
              </div>
            </div>
          </div>

          <div
            className="rounded-xl p-3 flex-1 min-h-0"
            style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
              <h3 className="text-xs font-semibold text-white">Statistiques</h3>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <StatCard value={`${stats.avgCompatibility}%`} label="Compat." color="purple" icon={<Sparkles className="w-3 h-3" />} />
              <StatCard value={stats.matches.toString()} label="Matchs" color="red" icon={<Heart className="w-3 h-3" />} />
              <StatCard value={stats.signalsReceived.toString()} label="Likes" color="pink" icon={<Users className="w-3 h-3" />} />
              <StatCard value={stats.profileViews.toString()} label="Vues" color="green" icon={<Eye className="w-3 h-3" />} />
            </div>
          </div>

          <button
            onClick={() => onNavigate('my-subscription')}
            className="rounded-xl p-2.5 flex-shrink-0"
            style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                <Crown className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xs font-semibold text-white">Mon Abonnement</h3>
                <p className="text-[10px] text-white/40">{planInfo.color === 'gray' ? 'Passe Premium' : 'Abonnement actif'}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </div>
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className="rounded-xl p-2.5 flex-shrink-0"
            style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(220, 38, 38, 0.15)' }}>
                <Settings className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xs font-semibold text-white">Parametres</h3>
                <p className="text-[10px] text-white/40">Personnalise ton experience</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
  color,
  icon
}: {
  value: string;
  label: string;
  color: 'purple' | 'red' | 'pink' | 'green';
  icon: React.ReactNode;
}) {
  const colorStyles = {
    purple: {
      bg: 'rgba(139, 92, 246, 0.15)',
      border: 'rgba(139, 92, 246, 0.25)',
      text: '#A78BFA',
    },
    red: {
      bg: 'rgba(220, 38, 38, 0.15)',
      border: 'rgba(220, 38, 38, 0.25)',
      text: '#F87171',
    },
    pink: {
      bg: 'rgba(236, 72, 153, 0.15)',
      border: 'rgba(236, 72, 153, 0.25)',
      text: '#F472B6',
    },
    green: {
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.25)',
      text: '#34D399',
    },
  };

  const style = colorStyles[color];

  return (
    <div
      className="rounded-lg p-2 flex flex-col items-center justify-center"
      style={{ background: style.bg, border: `1px solid ${style.border}` }}
    >
      <div className="opacity-50" style={{ color: style.text }}>{icon}</div>
      <p className="text-sm font-bold" style={{ color: style.text }}>{value}</p>
      <p className="text-white/40 text-[8px] text-center leading-tight">{label}</p>
    </div>
  );
}
