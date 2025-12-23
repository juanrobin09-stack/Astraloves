import { useState, useEffect } from 'react';
import { Gift, ArrowLeft, Copy, Check, Users, Star, Share2, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ReferralPageProps {
  onBack: () => void;
}

interface ReferralStats {
  code: string;
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalPoints: number;
  rewards: Array<{
    type: string;
    value: number;
    claimed: boolean;
  }>;
}

export default function ReferralPage({ onBack }: ReferralPageProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats>({
    code: '',
    totalReferrals: 0,
    pendingReferrals: 0,
    completedReferrals: 0,
    totalPoints: 0,
    rewards: []
  });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadReferralStats();
    }
  }, [user]);

  const loadReferralStats = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('astra_profiles')
        .select('referral_code, referral_count, referral_points')
        .eq('id', user.id)
        .maybeSingle();

      const { data: referrals } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id);

      const { data: rewards } = await supabase
        .from('referral_rewards')
        .select('reward_type, reward_value, claimed')
        .eq('user_id', user.id);

      const pending = referrals?.filter(r => r.status === 'pending').length || 0;
      const completed = referrals?.filter(r => r.status === 'completed').length || 0;

      setStats({
        code: profile?.referral_code || '',
        totalReferrals: referrals?.length || 0,
        pendingReferrals: pending,
        completedReferrals: completed,
        totalPoints: profile?.referral_points || 0,
        rewards: rewards || []
      });
    } catch (error) {
      console.error('Error loading referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    const referralUrl = `${window.location.origin}?ref=${stats.code}`;
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaEmail = () => {
    const referralUrl = `${window.location.origin}?ref=${stats.code}`;
    const subject = encodeURIComponent('Rejoins-moi sur l\'app de rencontre astrologique !');
    const body = encodeURIComponent(
      `Salut !\n\nJe t'invite à rejoindre cette super app de rencontre basée sur l'astrologie.\n\nUtilise mon code de parrainage : ${stats.code}\n\nOu clique sur ce lien : ${referralUrl}\n\nTu recevras des bonus à l'inscription et je serai récompensé aussi !\n\nÀ bientôt ! ✨`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareViaNative = async () => {
    const referralUrl = `${window.location.origin}?ref=${stats.code}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoins-moi sur l\'app de rencontre astrologique !',
          text: `Utilise mon code de parrainage ${stats.code} pour obtenir des bonus à l'inscription !`,
          url: referralUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-y-auto overflow-x-hidden pb-28">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={onBack}
          className="mb-6 text-white/80 hover:text-white flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Gift className="w-8 h-8 text-red-500" />
            Parrainage
          </h1>
          <p className="text-gray-400">
            Invite tes amis et gagne des récompenses
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-900/20 to-black border border-red-600/30 rounded-2xl p-6 mb-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
            Ton code de parrainage
          </h3>
          <div className="bg-black/50 rounded-xl p-4 mb-4">
            <p className="text-center text-4xl font-bold text-white tracking-wider mb-2 font-mono">
              {stats.code}
            </p>
            <p className="text-center text-gray-400 text-sm">
              {window.location.origin}?ref={stats.code}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={copyReferralCode}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copier</span>
                </>
              )}
            </button>
            <button
              onClick={navigator.share ? shareViaNative : shareViaEmail}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {navigator.share ? (
                <>
                  <Share2 className="w-5 h-5" />
                  <span>Partager</span>
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  <span>Email</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-900/20 to-black border border-blue-600/30 rounded-xl p-4 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">{stats.completedReferrals}</p>
            <p className="text-sm text-gray-400">Amis inscrits</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/20 to-black border border-yellow-600/30 rounded-xl p-4 text-center">
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" fill="currentColor" />
            <p className="text-3xl font-bold text-white">{stats.totalPoints}</p>
            <p className="text-sm text-gray-400">Points gagnés</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/90 to-black border border-red-600/20 rounded-2xl overflow-hidden mb-6">
          <div className="p-4 border-b border-red-600/20">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Gift className="w-5 h-5 text-red-400" />
              Comment ça marche ?
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="text-white font-medium mb-1">Partage ton code</p>
                <p className="text-gray-400 text-sm">
                  Envoie ton code de parrainage à tes amis par message, email ou réseaux sociaux
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="text-white font-medium mb-1">Ton ami s'inscrit</p>
                <p className="text-gray-400 text-sm">
                  Il utilise ton code lors de l'inscription et reçoit 3 Super Likes gratuits
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="text-white font-medium mb-1">Tu es récompensé !</p>
                <p className="text-gray-400 text-sm">
                  Tu reçois 5 Super Likes et 100 points de parrainage pour chaque ami inscrit
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-600/30 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-400" fill="currentColor" />
            Récompenses par palier
          </h3>
          <div className="space-y-3">
            {[
              { count: 1, reward: '5 Super Likes', points: 100 },
              { count: 5, reward: '1 Boost gratuit', points: 500 },
              { count: 10, reward: '1 mois Premium offert', points: 1000 },
              { count: 25, reward: 'Badge Elite + 3 mois Premium', points: 2500 }
            ].map((tier, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  stats.completedReferrals >= tier.count
                    ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/50'
                    : 'bg-gray-800/50 border border-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    stats.completedReferrals >= tier.count
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {tier.count}
                  </div>
                  <div>
                    <p className={`font-medium ${
                      stats.completedReferrals >= tier.count ? 'text-white' : 'text-gray-400'
                    }`}>
                      {tier.reward}
                    </p>
                    <p className="text-xs text-gray-500">{tier.points} points</p>
                  </div>
                </div>
                {stats.completedReferrals >= tier.count && (
                  <Check className="w-6 h-6 text-green-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
