import { useState, useEffect } from 'react';
import { Eye, Lock, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Avatar from './Avatar';
import PremiumUpgradeModal from './PremiumUpgradeModal';

interface Visitor {
  id: string;
  pseudo?: string;
  first_name?: string;
  avatar_url?: string;
  photos?: string[];
  visited_at: string;
  premium_tier?: string;
}

interface ProfileVisitorsProps {
  userId: string;
  premiumTier?: 'free' | 'premium' | 'premium_elite' | null;
  className?: string;
}

export default function ProfileVisitors({ userId, premiumTier, className = '' }: ProfileVisitorsProps) {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const isElite = premiumTier === 'premium_elite';

  useEffect(() => {
    if (isElite) {
      loadVisitors();
    } else {
      setLoading(false);
    }
  }, [userId, isElite]);

  const loadVisitors = async () => {
    try {
      // Note: Il faudrait créer une table profile_visits pour tracker les visites
      // Pour l'instant, on simule avec des données vides
      setVisitors([]);
    } catch (error) {
      console.error('Error loading visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    return `Il y a ${diffDays}j`;
  };

  if (!isElite) {
    return (
      <div
        className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border-2 border-yellow-500/30 cursor-pointer hover:border-yellow-500/50 transition ${className}`}
        onClick={() => setShowUpgradeModal(true)}
      >
        <div className="flex items-center gap-3 mb-4">
          <Lock className="text-yellow-500" size={24} />
          <h3 className="text-white font-bold text-lg">Qui a visité ton profil</h3>
          <Crown className="text-yellow-500 ml-auto" size={24} />
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Découvre qui s'intéresse à ton profil avec l'abonnement Elite
        </p>
        <div className="flex -space-x-2 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 border-2 border-gray-800 blur-sm"
            />
          ))}
          <div className="w-12 h-12 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-white font-bold text-sm">
            +9
          </div>
        </div>
        <button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-3 rounded-lg transition">
          Devenir Elite 👑
        </button>

        <PremiumUpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          title="Visiteurs du profil 👀"
          message="Découvre qui visite ton profil avec l'abonnement Elite !"
          feature="Accès illimité à la liste complète de tes visiteurs"
          onUpgrade={() => {
            window.location.href = '/subscription';
          }}
        />
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Eye className="text-purple-400" size={24} />
        <h3 className="text-white font-bold text-lg">Qui a visité ton profil</h3>
        <span className="ml-auto bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
          Elite
        </span>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        </div>
      ) : visitors.length === 0 ? (
        <div className="text-center py-8">
          <Eye className="text-gray-600 mx-auto mb-3" size={48} />
          <p className="text-gray-400 text-sm">Personne n'a encore visité ton profil</p>
          <p className="text-gray-500 text-xs mt-2">Les visiteurs apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visitors.map((visitor) => (
            <div
              key={visitor.id}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition cursor-pointer"
            >
              <Avatar
                src={visitor.avatar_url || visitor.photos?.[0]}
                name={visitor.pseudo || visitor.first_name}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {visitor.pseudo || visitor.first_name || 'Anonyme'}
                </p>
                <p className="text-gray-400 text-xs">{getTimeAgo(visitor.visited_at)}</p>
              </div>
              {visitor.premium_tier === 'premium_elite' && <Crown className="text-yellow-500" size={16} />}
              {visitor.premium_tier === 'premium' && <span className="text-red-500">💎</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
