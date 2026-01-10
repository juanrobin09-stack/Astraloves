import { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Lock, Crown, Star, Zap, TrendingUp, Award, Trophy, Target, Calendar, Brain, Lightbulb, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserQuizResults, QuizResult } from '../lib/quizResultsService';
import { useFeatureAccess } from '../hooks/useFeatureAccess';

// Types
interface CosmicLevel {
  title: string;
  description: string;
  progress: number;
  icon: string;
}

interface CosmicBadge {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  date?: string;
}

export default function MyResultsPage() {
  const { user } = useAuth();
  const { tier, limits } = useFeatureAccess();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    loadResults();
  }, [user]);

  const loadResults = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await getUserQuizResults(user.id);
    setResults(data);
    setLoading(false);
  };

  // Calculer le niveau cosmique
  const getCosmicLevel = (): CosmicLevel => {
    const quizCount = results.length;
    const totalQuizzes = 10; // Nombre total de quiz disponibles
    const progress = Math.min((quizCount / totalQuizzes) * 100, 100);

    if (tier === 'premium_elite') {
      return {
        title: '👑 Maître Cosmique',
        description: 'Conscience ultime débloquée',
        progress,
        icon: '👑'
      };
    } else if (tier === 'premium') {
      return {
        title: '💎 Connaisseur',
        description: 'Tu explores les profondeurs',
        progress,
        icon: '💎'
      };
    } else {
      return {
        title: '🌙 Explorateur',
        description: 'Tu commences ton voyage',
        progress,
        icon: '🌙'
      };
    }
  };

  // Calculer les badges
  const getBadges = (): CosmicBadge[] => {
    const badges: CosmicBadge[] = [
      {
        id: 'first_quiz',
        icon: '🌟',
        title: 'Premier Pas',
        description: 'Premier questionnaire complété',
        unlocked: results.length >= 1,
        date: results[0]?.updated_at
      },
      {
        id: 'three_quizzes',
        icon: '🌙',
        title: 'Explorateur Complet',
        description: '3 questionnaires complétés',
        unlocked: results.length >= 3
      },
      {
        id: 'premium',
        icon: '💎',
        title: 'Éveil Premium',
        description: 'Accès Premium débloqué',
        unlocked: tier === 'premium' || tier === 'premium_elite'
      },
      {
        id: 'elite',
        icon: '👑',
        title: 'Maître Cosmique',
        description: 'Tous les questionnaires Elite',
        unlocked: tier === 'premium_elite' && results.length >= 10
      },
      {
        id: 'astral_theme',
        icon: '🌌',
        title: 'Révélation Cosmique',
        description: 'Thème astral débloqué',
        unlocked: tier === 'premium_elite'
      }
    ];

    return badges;
  };

  const goBack = () => {
    window.dispatchEvent(new CustomEvent('navigate', {
      detail: { page: 'chat' }
    }));
  };

  const goToQuiz = () => {
    window.dispatchEvent(new CustomEvent('navigate', {
      detail: { page: 'questionnaires' }
    }));
  };

  const cosmicLevel = getCosmicLevel();
  const badges = getBadges();
  const unlockedBadges = badges.filter(b => b.unlocked);

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="flex gap-3 text-4xl mb-4 animate-pulse">
            <span>🌙</span>
            <span>✨</span>
            <span>🌟</span>
          </div>
          <div className="text-gray-400 font-semibold">Chargement de ton univers...</div>
        </div>
      </div>
    );
  }

  // État vide
  if (results.length === 0) {
    return (
      <div className="h-screen bg-gradient-to-b from-black via-slate-950 to-black overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-slate-800">
          <div className="flex items-center p-4">
            <button
              onClick={goBack}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-xl font-black bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
                Mes Résultats
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Ton activité boostée par Astra IA</p>
            </div>
            <div className="w-10" />
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] px-6">
          <div className="text-7xl mb-6 animate-pulse">
            🔮
          </div>
          <h2 className="text-2xl font-black text-white mb-3 text-center">
            Aucun quiz complété
          </h2>
          <p className="text-gray-400 text-center mb-8 max-w-sm">
            Fais des quiz pour découvrir ton profil et obtenir des analyses personnalisées !
          </p>
          <button
            onClick={goToQuiz}
            className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
          >
            Découvrir les Quiz <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-slate-800">
        <div className="flex items-center p-4">
          <button
            onClick={goBack}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-black bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
              Mes Résultats
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Ton activité boostée par Astra IA</p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Niveau Cosmique */}
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/20 relative overflow-hidden">
          {/* Effet de fond */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">
                  Niveau Cosmique
                </div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  {cosmicLevel.icon} {cosmicLevel.title}
                </h2>
                <p className="text-sm text-gray-400 mt-1">{cosmicLevel.description}</p>
              </div>
              
              {/* Badge Tier */}
              {tier !== 'free' && (
                <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                  tier === 'premium_elite' 
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30' 
                    : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                }`}>
                  {tier === 'premium_elite' ? (
                    <Crown className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Star className="w-5 h-5 text-purple-400" />
                  )}
                  <span className={`font-bold text-sm ${
                    tier === 'premium_elite' ? 'text-amber-400' : 'text-purple-400'
                  }`}>
                    {tier === 'premium_elite' ? 'Elite' : 'Premium'}
                  </span>
                </div>
              )}
            </div>

            {/* Barre de progression */}
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span>Progression</span>
                <span className="font-bold">{results.length}/10</span>
              </div>
              <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 relative"
                  style={{ width: `${cosmicLevel.progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              {results.length} questionnaire{results.length > 1 ? 's' : ''} complété{results.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Badges de progression */}
        {unlockedBadges.length > 0 && (
          <div>
            <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Badges Débloqués
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`rounded-2xl p-4 border transition-all ${
                    badge.unlocked
                      ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-500/30'
                      : 'bg-slate-900/30 border-slate-700/30 opacity-40'
                  }`}
                >
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <h4 className="text-sm font-bold text-white mb-1">{badge.title}</h4>
                  <p className="text-xs text-gray-400">{badge.description}</p>
                  {badge.unlocked && badge.date && (
                    <div className="mt-2 pt-2 border-t border-amber-500/20">
                      <p className="text-xs text-amber-400/70">
                        {new Date(badge.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                  {!badge.unlocked && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                      <Lock className="w-3 h-3" />
                      <span>Verrouillé</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questionnaires complétés */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Questionnaires
            </h3>
            <button
              onClick={goToQuiz}
              className="text-xs text-purple-400 font-bold flex items-center gap-1 hover:text-purple-300 transition-colors"
            >
              Voir tous
              <Sparkles className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {results.map((result) => (
              <QuizResultCard
                key={result.id}
                result={result}
                tier={tier}
                onClick={() => setSelectedResult(result)}
              />
            ))}
          </div>
        </div>

        {/* Timeline d'évolution */}
        {results.length >= 2 && (
          <div>
            <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Ton Évolution
            </h3>
            <div className="space-y-4">
              {results.slice(0, 5).map((result, index) => (
                <TimelineItem
                  key={result.id}
                  emoji={index === 0 ? '🎯' : index === 1 ? '🌟' : '✨'}
                  title={result.result_title || 'Questionnaire'}
                  description={`Complété le ${new Date(result.updated_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long'
                  })}`}
                  color="from-blue-600 to-cyan-600"
                />
              ))}
            </div>
          </div>
        )}

        {/* CTA Upgrade si Free */}
        {tier === 'free' && results.length >= 2 && (
          <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/30 blur-3xl" />
            
            <div className="relative">
              <div className="text-3xl mb-3">👑</div>
              <h3 className="text-xl font-black text-white mb-2">
                Débloque ton Thème Astral
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Passe à Elite pour obtenir ton thème astral complet avec analyses croisées et coaching stratégique.
              </p>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('navigate', {
                    detail: { page: 'subscription' }
                  }));
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                Passer à Elite
                <Crown className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal détails */}
      {selectedResult && (
        <ResultDetailModal
          result={selectedResult}
          tier={tier}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </div>
  );
}

// Composant Card Quiz
function QuizResultCard({ result, tier, onClick }: {
  result: QuizResult;
  tier: string;
  onClick: () => void;
}) {
  const getQuizIcon = (quizId: string) => {
    const icons: Record<string, string> = {
      'astral': '🌟',
      'attachment': '💗',
      'archetype': '👑',
      'first-impression': '👁️',
      'first_impression': '👁️'
    };
    return icons[quizId] || '✨';
  };

  const getQuizColor = (quizId: string) => {
    const colors: Record<string, string> = {
      'astral': 'from-purple-600 to-indigo-600',
      'attachment': 'from-pink-600 to-rose-600',
      'archetype': 'from-amber-600 to-orange-600',
      'first-impression': 'from-blue-600 to-cyan-600',
      'first_impression': 'from-blue-600 to-cyan-600'
    };
    return colors[quizId] || 'from-purple-600 to-pink-600';
  };

  const icon = getQuizIcon(result.quiz_id);
  const color = getQuizColor(result.quiz_id);

  return (
    <div
      onClick={onClick}
      className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50 hover:border-slate-600/80 transition-all cursor-pointer active:scale-[0.98] hover:scale-[1.01] relative overflow-hidden group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

      <div className="relative">
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl flex-shrink-0 shadow-lg`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-black text-base leading-tight mb-1">
              {result.result_title || 'Résultat'}
            </h3>
            {result.result_subtitle && (
              <p className="text-gray-400 text-sm leading-snug">
                {result.result_subtitle}
              </p>
            )}
          </div>
        </div>

        {result.percentage && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium">Score</span>
              <span className={`text-xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                {result.percentage}%
              </span>
            </div>
            <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
                style={{ width: `${result.percentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {new Date(result.updated_at).toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'short' 
            })}
          </span>
          <span className={`text-sm font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent group-hover:opacity-80 transition-opacity flex items-center gap-1`}>
            Voir détails
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// Composant Timeline Item
function TimelineItem({ emoji, title, description, color }: {
  emoji: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="flex items-start gap-3 group">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 text-xl group-hover:scale-110 transition-transform`}>
        {emoji}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
        <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// Modal détails (simplifié - à compléter selon besoin)
function ResultDetailModal({ result, tier, onClose }: {
  result: QuizResult;
  tier: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-white">{result.result_title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-400 mb-4">{result.result_subtitle}</p>
          
          {/* Contenu du résultat - à adapter selon la structure */}
          {tier === 'free' && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center">
              <Lock className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Analyse complète verrouillée</h3>
              <p className="text-sm text-gray-400 mb-4">
                Passe à Premium pour obtenir l'analyse IA détaillée
              </p>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('navigate', {
                    detail: { page: 'subscription' }
                  }));
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
              >
                Découvrir Premium
              </button>
            </div>
          )}
          
          {tier !== 'free' && (
            <div className="prose prose-invert max-w-none">
              {/* Afficher le contenu complet selon le tier */}
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-4 mb-4">
                <h3 className="text-sm font-bold text-purple-400 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Analyse Premium Disponible
                </h3>
                <p className="text-sm text-gray-300">
                  Ton analyse détaillée est accessible !
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
