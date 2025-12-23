import { useState, useEffect } from 'react';
import { Trophy, ArrowLeft, Lock, Star, Sparkles, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AchievementsPageProps {
  onBack: () => void;
}

interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  is_premium: boolean;
  unlocked: boolean;
  unlocked_at?: string;
  progress?: number;
  requirement_count: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  engagement: 'Engagement',
  social: 'Social',
  communication: 'Communication',
  astrology: 'Astrologie',
  profile: 'Profil',
  premium: 'Premium'
};

const CATEGORY_COLORS: Record<string, string> = {
  engagement: 'from-red-600 to-orange-600',
  social: 'from-pink-600 to-rose-600',
  communication: 'from-blue-600 to-cyan-600',
  astrology: 'from-purple-600 to-indigo-600',
  profile: 'from-green-600 to-emerald-600',
  premium: 'from-yellow-600 to-amber-600'
};

export default function AchievementsPage({ onBack }: AchievementsPageProps) {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;

    try {
      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*')
        .order('category', { ascending: true })
        .order('requirement_count', { ascending: true });

      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at, progress')
        .eq('user_id', user.id);

      const achievementMap = new Map(
        userAchievements?.map(ua => [ua.achievement_id, ua]) || []
      );

      const formattedAchievements: Achievement[] = (allAchievements || []).map(a => {
        const userAchievement = achievementMap.get(a.id);
        return {
          ...a,
          unlocked: !!userAchievement,
          unlocked_at: userAchievement?.unlocked_at,
          progress: userAchievement?.progress || 0
        };
      });

      setAchievements(formattedAchievements);

      const points = formattedAchievements
        .filter(a => a.unlocked)
        .reduce((sum, a) => sum + a.points, 0);
      setTotalPoints(points);

    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = selectedCategory
    ? achievements.filter(a => a.category === selectedCategory)
    : achievements;

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  const categories = Array.from(new Set(achievements.map(a => a.category)));

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-y-auto overflow-x-hidden pb-28">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={onBack}
          className="mb-6 text-white/80 hover:text-white flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Trophées
          </h1>
          <p className="text-gray-400 mb-4">
            Débloque des trophées en utilisant l'application
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-yellow-900/20 to-black border border-yellow-600/30 rounded-xl p-4 text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{unlockedCount}/{totalCount}</p>
              <p className="text-xs text-gray-400">Trophées</p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-600/30 rounded-xl p-4 text-center">
              <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" fill="currentColor" />
              <p className="text-2xl font-bold text-white">{totalPoints}</p>
              <p className="text-xs text-gray-400">Points</p>
            </div>

            <div className="bg-gradient-to-br from-red-900/20 to-black border border-red-600/30 rounded-xl p-4 text-center">
              <Sparkles className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{Math.round((unlockedCount / totalCount) * 100)}%</p>
              <p className="text-xs text-gray-400">Complété</p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Tous
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {CATEGORY_LABELS[category] || category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredAchievements.map(achievement => (
            <div
              key={achievement.id}
              className={`rounded-2xl p-4 border transition-all ${
                achievement.unlocked
                  ? `bg-gradient-to-br ${CATEGORY_COLORS[achievement.category]} border-transparent shadow-lg`
                  : 'bg-gradient-to-br from-gray-900/50 to-black border-gray-700/50'
              } ${achievement.unlocked ? 'hover:scale-105' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`text-4xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                  {achievement.unlocked ? achievement.icon : <Lock className="w-10 h-10 text-gray-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className={`font-bold ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                      {achievement.title}
                    </h3>
                    {achievement.is_premium && (
                      <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className={`text-sm mb-2 ${achievement.unlocked ? 'text-white/80' : 'text-gray-500'}`}>
                    {achievement.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className={`w-4 h-4 ${achievement.unlocked ? 'text-yellow-300' : 'text-gray-600'}`} fill="currentColor" />
                      <span className={`text-sm font-bold ${achievement.unlocked ? 'text-yellow-300' : 'text-gray-600'}`}>
                        {achievement.points} pts
                      </span>
                    </div>
                    {achievement.unlocked && achievement.unlocked_at && (
                      <span className="text-xs text-white/60">
                        {new Date(achievement.unlocked_at).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                  {!achievement.unlocked && achievement.progress && achievement.progress > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Progression</span>
                        <span>{achievement.progress}/{achievement.requirement_count}</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-red-600 to-pink-600 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${(achievement.progress / achievement.requirement_count) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Aucun trophée dans cette catégorie</p>
          </div>
        )}
      </div>
    </div>
  );
}
