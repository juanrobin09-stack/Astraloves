import { useState, useEffect } from 'react';
import { Heart, Lock, Crown, ArrowLeft, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import VerificationBadge from './VerificationBadge';

interface LikesReceivedPageProps {
  onBack: () => void;
  onNavigate?: (page: string, data?: any) => void;
}

interface Like {
  id: string;
  user: {
    id: string;
    first_name: string;
    age: number;
    avatar_url: string;
    ville: string;
    signe_solaire: string;
    is_premium: boolean;
    bio: string;
  };
  created_at: string;
}

export default function LikesReceivedPage({ onBack, onNavigate }: LikesReceivedPageProps) {
  const { user } = useAuth();
  const [likes, setLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    loadPremiumStatus();
    if (user) {
      loadLikes();
    }
  }, [user]);

  const loadPremiumStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('astra_profiles')
      .select('is_premium')
      .eq('id', user.id)
      .maybeSingle();

    setIsPremium(data?.is_premium || false);
  };

  const loadLikes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('swipes')
        .select(`
          id,
          created_at,
          user_id,
          astra_profiles!swipes_user_id_fkey (
            id,
            first_name,
            age,
            avatar_url,
            ville,
            signe_solaire,
            is_premium,
            bio
          )
        `)
        .eq('target_id', user.id)
        .in('action', ['like', 'super_like'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedLikes: Like[] = (data || []).map((like: any) => ({
        id: like.id,
        user: like.astra_profiles,
        created_at: like.created_at
      }));

      setLikes(formattedLikes);
    } catch (error) {
      console.error('Error loading likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeBack = async (targetId: string) => {
    if (!user) return;

    try {
      await supabase.from('swipes').insert({
        user_id: user.id,
        target_id: targetId,
        action: 'like'
      });

      await supabase.from('matches').insert({
        user1_id: user.id,
        user2_id: targetId
      });

      loadLikes();
    } catch (error) {
      console.error('Error liking back:', error);
    }
  };

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-black overflow-y-auto overflow-x-hidden">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className="mb-6 text-white/80 hover:text-white flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Voir qui t'a liké</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Découvre instantanément qui t'a liké et matche plus rapidement avec les personnes intéressées
            </p>

            <div className="bg-gradient-to-br from-gray-900/90 to-black border border-yellow-500/30 rounded-2xl p-6 mb-8 max-w-md mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-6 h-6 text-yellow-500" />
                <h3 className="text-xl font-bold text-white">Fonctionnalité Premium</h3>
              </div>
              <ul className="space-y-3 text-left text-gray-300 text-sm mb-6">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span>Voir tous tes likes en temps réel</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span>Matche instantanément avec un like retour</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span>Filtrer par compatibilité astrologique</span>
                </li>
              </ul>
              <button
                onClick={() => onNavigate?.('premium')}
                className="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5" />
                Passer Premium - 9.99€/mois
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-y-auto overflow-x-hidden">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
        <button
          onClick={onBack}
          className="mb-6 text-white/80 hover:text-white flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500" fill="currentColor" />
            Ils t'ont liké
          </h1>
          <p className="text-gray-400">
            {likes.length} {likes.length > 1 ? 'personnes ont' : 'personne a'} liké ton profil
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : likes.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Aucun like pour le moment</p>
            <p className="text-gray-500 text-sm">Continue de swiper pour rencontrer de nouvelles personnes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {likes.map((like) => (
              <div
                key={like.id}
                className="bg-gradient-to-br from-gray-900/90 to-black border border-red-600/20 rounded-2xl overflow-hidden hover:border-red-500/40 transition-all group"
              >
                <div className="relative h-64">
                  {like.user.avatar_url ? (
                    <img
                      src={like.user.avatar_url}
                      alt={like.user.first_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-900/40 to-black flex items-center justify-center">
                      <div className="text-6xl">👤</div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white">
                        {like.user.first_name}, {like.user.age}
                      </h3>
                      <VerificationBadge isPremium={like.user.is_premium} size="sm" />
                    </div>
                    <p className="text-gray-300 text-sm mb-1">
                      📍 {like.user.ville || 'France'} • {like.user.signe_solaire || 'Balance'}
                    </p>
                    {like.user.bio && (
                      <p className="text-gray-400 text-xs line-clamp-2">{like.user.bio}</p>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <button
                    onClick={() => handleLikeBack(like.user.id)}
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:from-red-500 hover:to-pink-500 transition-all flex items-center justify-center gap-2"
                  >
                    <Heart className="w-5 h-5" fill="currentColor" />
                    Liker en retour
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
