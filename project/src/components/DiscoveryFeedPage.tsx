import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, X, Crown, Sparkles, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import MatchCard from './MatchCard';
import PremiumUpsellModal from './PremiumUpsellModal';
import EmailVerificationModal from './EmailVerificationModal';

interface Profile {
  id: string;
  pseudo: string;
  age: number;
  signe_solaire?: string;
  ascendant?: string;
  lune?: string;
  ville?: string;
  bio?: string;
  photos?: string[];
  avatar_url?: string;
  valeurs?: string[];
  interets?: string[];
  looking_for?: string;
}

interface DiscoveryFeedPageProps {
  onNavigate: (page: string) => void;
}

export default function DiscoveryFeedPage({ onNavigate }: DiscoveryFeedPageProps) {
  const { user } = useAuth();
  const { isPremium } = usePremiumStatus();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [swipeCount, setSwipeCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [compatibility, setCompatibility] = useState<{
    score: number;
    analyse_ia: string;
  } | null>(null);

  const DAILY_SWIPE_LIMIT = 20; // 20 swipes per day for free users

  useEffect(() => {
    loadProfiles();
    loadSwipeCount();
  }, [user]);

  useEffect(() => {
    if (profiles[currentIndex]) {
      analyzeCompatibility(profiles[currentIndex]);
    }
  }, [currentIndex, profiles]);

  const loadSwipeCount = async () => {
    if (!user) return;

    const { data } = await supabase.rpc('get_daily_swipe_count', {
      p_user_id: user.id,
    });

    if (data !== null) {
      setSwipeCount(data);
    }
  };

  const loadProfiles = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: alreadySwipedIds } = await supabase
        .from('swipes')
        .select('target_id')
        .eq('user_id', user.id);

      const swipedIds = alreadySwipedIds?.map((s) => s.target_id) || [];

      const { data: myProfile } = await supabase
        .from('astra_profiles')
        .select('age_min, age_max, preference')
        .eq('id', user.id)
        .maybeSingle();

      let query = supabase
        .from('astra_profiles')
        .select('*')
        .neq('id', user.id)
        .eq('visible_in_matching', true)
        .not('pseudo', 'is', null);

      if (swipedIds.length > 0) {
        query = query.not('id', 'in', `(${swipedIds.join(',')})`);
      }

      if (myProfile?.age_min) {
        query = query.gte('age', myProfile.age_min);
      }

      if (myProfile?.age_max) {
        query = query.lte('age', myProfile.age_max);
      }

      query = query.limit(20);

      const { data, error } = await query;

      if (error) throw error;

      setProfiles(data || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeCompatibility = async (targetProfile: Profile) => {
    if (!user) return;

    try {
      setAnalyzing(true);

      const { data: myProfile } = await supabase
        .from('astra_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!myProfile) return;

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-compatibility`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user1: myProfile,
          user2: targetProfile,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setCompatibility({
          score: result.score,
          analyse_ia: result.analyse_ia,
        });
      }
    } catch (error) {
      console.error('Error analyzing compatibility:', error);
      setCompatibility({
        score: 70,
        analyse_ia: 'Profils intéressants avec un potentiel de connexion.',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddFriend = async () => {
    if (!user || !profiles[currentIndex]) return;

    try {
      const targetProfile = profiles[currentIndex];

      const { data: existingRequest } = await supabase
        .from('friends')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetProfile.id}),and(sender_id.eq.${targetProfile.id},receiver_id.eq.${user.id})`)
        .maybeSingle();

      if (existingRequest) {
        alert('Une demande d\'ami existe déjà avec cet utilisateur');
        return;
      }

      await supabase.from('friends').insert({
        sender_id: user.id,
        receiver_id: targetProfile.id,
        statut: 'pending',
      });

      alert(`Demande d'ami envoyée à ${targetProfile.pseudo}!`);
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Erreur lors de l\'envoi de la demande');
    }
  };

  const handleSwipe = async (action: 'like' | 'pass') => {
    if (!user || !profiles[currentIndex]) return;

    if (!user.email_confirmed_at) {
      setUserEmail(user.email || '');
      setShowEmailModal(true);
      return;
    }

    if (!isPremium && swipeCount >= DAILY_SWIPE_LIMIT) {
      setShowLimitModal(true);
      return;
    }

    try {
      const targetProfile = profiles[currentIndex];

      await supabase.from('swipes').insert({
        user_id: user.id,
        target_id: targetProfile.id,
        action,
      });

      if (action === 'like') {
        const { data: mutualLike } = await supabase
          .from('swipes')
          .select('*')
          .eq('user_id', targetProfile.id)
          .eq('target_id', user.id)
          .in('action', ['like', 'super_like'])
          .maybeSingle();

        if (mutualLike) {
          const user1Id = user.id < targetProfile.id ? user.id : targetProfile.id;
          const user2Id = user.id < targetProfile.id ? targetProfile.id : user.id;

          await supabase.from('matches').upsert({
            user1_id: user1Id,
            user2_id: user2Id,
            score: compatibility?.score || 75,
            analyse_ia: compatibility?.analyse_ia || 'Compatible',
            user1_liked: true,
            user2_liked: true,
            statut: 'mutual'
          }, {
            onConflict: 'user1_id,user2_id'
          });
        }
      }

      setSwipeCount((prev) => prev + 1);
      setCompatibility(null);

      if (currentIndex < profiles.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        loadProfiles();
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error swiping:', error);
    }
  };

  const currentProfile = profiles[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen velvet-bg flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Chargement des profils...</p>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen velvet-bg flex flex-col pb-24">
        <header className="bg-black/90 backdrop-blur-lg border-b border-red-600/30 px-4 py-4">
          <div className="max-w-screen-xl mx-auto flex items-center gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-2 hover:bg-red-900/20 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">Découverte</h1>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Plus de profils pour le moment
            </h2>
            <p className="text-gray-400 mb-6">
              Reviens plus tard pour découvrir de nouvelles personnes compatibles avec toi.
            </p>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-medium hover:from-red-700 hover:to-pink-700 transition-all"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen velvet-bg flex flex-col pb-24">
      <header className="bg-black/90 backdrop-blur-lg border-b border-red-600/30 px-4 py-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-2 hover:bg-red-900/20 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">Découverte</h1>
          </div>

          <div className="flex items-center gap-3">
            {!isPremium && (
              <span className="text-sm text-gray-400">
                {swipeCount}/{DAILY_SWIPE_LIMIT} swipes
              </span>
            )}
            {isPremium && (
              <span className="text-xs text-yellow-400 flex items-center gap-1">
                <Crown className="w-4 h-4" />
                Premium
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-md">
          {analyzing ? (
            <div className="text-center py-8">
              <Loader className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Analyse de compatibilité...</p>
            </div>
          ) : (
            <MatchCard
              profile={currentProfile}
              score={compatibility?.score}
              analyseIA={compatibility?.analyse_ia}
              onLike={() => handleSwipe('like')}
              onPass={() => handleSwipe('pass')}
              onAddFriend={handleAddFriend}
              showActions={true}
            />
          )}
        </div>
      </div>

      {showEmailModal && (
        <EmailVerificationModal
          email={userEmail}
          onClose={() => setShowEmailModal(false)}
        />
      )}

      <PremiumUpsellModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onUpgrade={() => onNavigate('premium')}
        title="Limite quotidienne atteinte"
        context="swipes"
        currentUsage={{
          current: swipeCount,
          limit: DAILY_SWIPE_LIMIT,
          resetIn: 'demain',
        }}
      />
    </div>
  );
}
