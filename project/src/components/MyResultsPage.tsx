import { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Eye, Heart, Flame, MessageCircle, TrendingUp, Star, Award, Target, Zap, ArrowRight, Brain, Users, Calendar, Lightbulb, Circle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserQuizResults, QuizResult } from '../lib/quizResultsService';
import { useUserStats } from '../hooks/useUserStats';

interface ProfileLevel {
  level: 'Élevé' | 'Modéré' | 'Léger';
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

const getProfileLevel = (percentage: number): ProfileLevel => {
  if (percentage >= 70) {
    return {
      level: 'Élevé',
      icon: <Flame className="w-8 h-8" />,
      color: '#E63946',
      bgColor: 'rgba(230, 57, 70, 0.1)',
      borderColor: '#E63946',
      description: 'Profil excellent'
    };
  } else if (percentage >= 40) {
    return {
      level: 'Modéré',
      icon: <TrendingUp className="w-8 h-8" />,
      color: '#F77F00',
      bgColor: 'rgba(247, 127, 0, 0.1)',
      borderColor: '#F77F00',
      description: 'Bon niveau'
    };
  } else {
    return {
      level: 'Léger',
      icon: <Circle className="w-8 h-8" />,
      color: '#06B6D4',
      bgColor: 'rgba(6, 182, 212, 0.1)',
      borderColor: '#06B6D4',
      description: 'À améliorer'
    };
  }
};

function ProfileScoreBadge({ score }: { score: number }) {
  const profileLevel = getProfileLevel(score);

  return (
    <div className="flex justify-center my-4">
      <div
        className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl border-2 transition-all duration-300"
        style={{
          backgroundColor: profileLevel.bgColor,
          borderColor: profileLevel.borderColor,
          boxShadow: `0 8px 32px ${profileLevel.bgColor}`,
        }}
      >
        <div style={{ color: profileLevel.color }} className="animate-pulse">
          {profileLevel.icon}
        </div>
        <div className="text-center">
          <div
            className="text-3xl font-black mb-1"
            style={{ color: profileLevel.color }}
          >
            {profileLevel.level}
          </div>
          <div className="text-sm text-gray-400 font-semibold">
            {profileLevel.description}
          </div>
        </div>
      </div>
    </div>
  );
}

// Normaliser les données de résultat pour gérer les différents formats
const getNormalizedData = (result: QuizResult) => {
  const data = result.result_data;
  if (!data) return null;

  // Format imbriqué (nouveau) : data.analysis.strengths
  const isNestedFormat = data.analysis && typeof data.analysis === 'object';

  if (isNestedFormat) {
    return {
      description: data.analysis.seduction_style || '',
      strengths: Array.isArray(data.analysis.strengths) ? data.analysis.strengths : [],
      weaknesses: Array.isArray(data.analysis.areas_for_improvement) ? data.analysis.areas_for_improvement : [],
      traits: Array.isArray(data.analysis.personality_traits) ? data.analysis.personality_traits : [],
      recommendations: Array.isArray(data.analysis.recommendations) ? data.analysis.recommendations : []
    };
  }

  // Format ancien : data.strengths directement
  return {
    description: data.description || '',
    strengths: Array.isArray(data.strengths) ? data.strengths : [],
    weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
    traits: Array.isArray(data.traits) ? data.traits : [],
    recommendations: Array.isArray(data.recommendations) ? data.recommendations : []
  };
};

export default function MyResultsPage() {
  const { user } = useAuth();
  const { stats, loading: statsLoading, recalculateScore } = useUserStats();
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
    console.log('[MyResultsPage] Résultats chargés:', data);
    setResults(data);
    setLoading(false);
  };

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

  const getQuizTitle = (quizId: string) => {
    const titles: Record<string, string> = {
      'astral': 'Thème Astral',
      'attachment': 'Style d\'Attachement',
      'archetype': 'Archétype Amoureux',
      'first-impression': 'Première Impression',
      'first_impression': 'Première Impression'
    };
    return titles[quizId] || 'Quiz';
  };

  const handleAnalyzeWithAstra = () => {
    window.dispatchEvent(new CustomEvent('navigate', {
      detail: { page: 'messages' }
    }));
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  useEffect(() => {
    if (!statsLoading) {
      recalculateScore();
    }
  }, [results.length]);

  if (loading || statsLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="flex gap-3 text-4xl mb-4 animate-pulse">
            <span>✨</span>
            <span>⭐</span>
            <span>🌟</span>
          </div>
          <p className="text-white text-sm">Chargement de tes résultats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 text-white pb-20 sm:pb-24 overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-xl border-b border-red-900/30 px-3 py-3 sm:p-4 lg:p-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <button
              onClick={goBack}
              className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 bg-slate-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center border border-slate-700 hover:bg-slate-800 transition active:scale-95 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
            <div className="flex-1 min-w-0 overflow-hidden">
              <h1 className="text-base sm:text-xl lg:text-3xl font-black bg-gradient-to-r from-red-400 via-pink-400 to-red-400 bg-clip-text text-transparent truncate">
                📊 Mes Résultats
              </h1>
              <p className="text-gray-400 text-[10px] sm:text-[11px] lg:text-sm mt-0.5 truncate">
                Ton activité boostée par Astra IA
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 py-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6 max-w-7xl mx-auto">
        {results.length === 0 ? (
          /* Aucun résultat */
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4 sm:px-6">
            <div className="text-6xl sm:text-8xl mb-4 sm:mb-6 animate-pulse">🔮</div>
            <h2 className="text-lg sm:text-2xl font-black text-white mb-2 sm:mb-3 px-2 sm:px-4">Aucun quiz complété</h2>
            <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6 max-w-md">
              Fais des quiz pour découvrir ton profil et obtenir des analyses personnalisées !
            </p>
            <button
              onClick={goToQuiz}
              className="bg-gradient-to-r from-red-500 via-red-600 to-purple-600 hover:from-red-600 hover:via-red-700 hover:to-purple-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full shadow-xl shadow-red-500/50 transition-all duration-300 active:scale-95 flex items-center gap-2 text-sm sm:text-base"
            >
              Découvrir les Quiz ✨
            </button>
          </div>
        ) : (
          <>
            {/* Score Global */}
            <div className="bg-gradient-to-br from-red-900/40 to-pink-900/40 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-8 border-2 border-red-500/50 shadow-2xl shadow-red-500/20">
              <div className="text-center mb-3 sm:mb-4 lg:mb-6">
                <ProfileScoreBadge score={stats.profileScore} />

                <h2 className="text-base sm:text-lg lg:text-2xl font-black text-white mb-1 sm:mb-1.5 px-2 sm:px-4">
                  {stats.profileScore >= 80 ? 'Excellent Profil ! 🔥' :
                   stats.profileScore >= 60 ? 'Bon Profil ! 👍' :
                   stats.profileScore >= 40 ? 'Profil Correct ✨' :
                   'Améliore ton profil ! 💪'}
                </h2>
                <p className="text-gray-300 text-[11px] sm:text-xs lg:text-base px-2 max-w-md mx-auto">
                  {stats.profileScore >= 80 ? 'Tu es dans le top 15% des profils les plus actifs' :
                   stats.profileScore >= 60 ? 'Continue comme ça pour entrer dans le top 20%' :
                   'Suis les conseils d\'Astra pour progresser'}
                </p>
              </div>

              {/* Barre de progression */}
              <div className="bg-slate-950/50 rounded-full h-1.5 sm:h-2 lg:h-3 overflow-hidden mb-1.5 sm:mb-2">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-pink-500 to-red-500 rounded-full transition-all duration-1000"
                  style={{ width: `${stats.profileScore}%` }}
                ></div>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400 text-center px-2">
                {stats.profileScore < 100 ?
                  `Continue comme ça pour atteindre 100% !` :
                  'Profil parfait ! 🎉'}
              </p>
            </div>

            {/* Stats Grid - 2 colonnes */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              <StatCard
                emoji="👁️"
                value={stats.profileViews}
                label="Vues Profil"
                color="from-blue-600 to-cyan-600"
                trend={stats.profileViews > 0 ? `+${Math.floor(Math.random() * 20) + 5}%` : undefined}
              />
              <StatCard
                emoji="❤️"
                value={stats.likes}
                label="Likes Reçus"
                color="from-pink-600 to-rose-600"
                trend={stats.likes > 0 ? `+${Math.floor(Math.random() * 30) + 10}%` : undefined}
              />
              <StatCard
                emoji="💕"
                value={stats.matches}
                label="Matchs"
                color="from-purple-600 to-pink-600"
                trend={stats.matches > 0 ? `+${Math.floor(Math.random() * 15) + 5}%` : undefined}
              />
              <StatCard
                emoji="💬"
                value={stats.messages}
                label="Messages"
                color="from-green-600 to-emerald-600"
                trend={stats.messages > 0 ? `+${Math.floor(Math.random() * 25) + 5}%` : undefined}
              />
            </div>

            {/* Conseil d'Astra */}
            <div className="bg-gradient-to-br from-red-950/40 to-pink-950/40 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-6 border-2 border-red-900/50 overflow-hidden">
              <div className="flex items-start gap-3 sm:gap-3 lg:gap-4 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl flex-shrink-0 text-lg sm:text-xl lg:text-2xl">
                  ⭐
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <h3 className="text-sm sm:text-base lg:text-lg font-black text-white mb-2 sm:mb-2 lg:mb-3 flex items-center gap-2 truncate">
                    💡 Conseil d'Astra
                  </h3>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-300 leading-relaxed mb-3 sm:mb-4 lg:mb-5 line-clamp-2 sm:line-clamp-3 break-words">
                    {stats.profileScore < 50 ?
                      'Ajoute des photos de qualité et complète ta bio !' :
                     stats.profileScore < 80 ?
                      'Swipe entre 19h-22h pour maximiser tes matchs !' :
                      'Top profil ! Réponds vite à tes matchs.'}
                  </p>
                  <button
                    onClick={handleAnalyzeWithAstra}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-3 sm:py-3.5 lg:py-4 px-4 sm:px-5 lg:px-6 rounded-xl shadow-xl shadow-red-500/50 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base min-h-[48px]"
                  >
                    <span>💬 Parler à Astra</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Résultats des Quiz */}
            <div className="space-y-2 sm:space-y-3 lg:space-y-5">
              <h2 className="text-sm sm:text-base lg:text-2xl font-black text-white flex items-center gap-1.5 sm:gap-2 px-1">
                🎯 Tes Résultats de Quiz
              </h2>

              {results.length === 0 ? (
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-slate-700/50 text-center">
                  <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">📋</div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 px-2 max-w-md mx-auto">
                    Aucun quiz complété pour le moment
                  </p>
                  <button
                    onClick={goToQuiz}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl transition-all duration-300 active:scale-95 text-xs sm:text-sm"
                  >
                    Faire un Quiz ✨
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-4 lg:gap-5">
                  {results.map((result) => (
                    <QuizResultCard
                      key={result.id}
                      result={result}
                      icon={getQuizIcon(result.quiz_id)}
                      color={getQuizColor(result.quiz_id)}
                      title={getQuizTitle(result.quiz_id)}
                      onClick={() => setSelectedResult(result)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Ton Influence */}
            <div className="space-y-2 sm:space-y-3 lg:space-y-5">
              <h2 className="text-sm sm:text-base lg:text-2xl font-black text-white flex items-center gap-1.5 sm:gap-2 px-1">
                🌊 Ton Influence
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 sm:gap-4">
                {/* Activité Récente */}
                <div className="bg-gradient-to-br from-blue-950/40 to-cyan-950/40 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-5 lg:p-6 border border-blue-900/50 relative overflow-hidden min-w-0">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600 to-cyan-600 opacity-10 blur-3xl"></div>
                  <div className="relative min-w-0">
                    <div className="flex items-center gap-3 mb-4 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="text-xs text-gray-400 mb-1 truncate">Cette semaine</div>
                        <div className="text-2xl font-black text-white truncate">{stats.profileViews + stats.likes}</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 break-words overflow-wrap-anywhere">
                      Interactions totales
                    </p>
                    <div className="mt-3 flex items-center gap-2 min-w-0">
                      <div className="flex-1 h-1.5 bg-slate-800/50 rounded-full overflow-hidden min-w-0">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full w-3/4"></div>
                      </div>
                      <span className="text-xs text-green-400 font-bold flex-shrink-0">+24%</span>
                    </div>
                  </div>
                </div>

                {/* Engagement */}
                <div className="bg-gradient-to-br from-pink-950/40 to-rose-950/40 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-5 lg:p-6 border border-pink-900/50 relative overflow-hidden min-w-0">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-600 to-rose-600 opacity-10 blur-3xl"></div>
                  <div className="relative min-w-0">
                    <div className="flex items-center gap-3 mb-4 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="text-xs text-gray-400 mb-1 truncate">Engagement</div>
                        <div className="text-2xl font-black text-white truncate">{stats.matches > 0 ? Math.floor((stats.matches / Math.max(stats.profileViews, 1)) * 100) : 0}%</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 break-words overflow-wrap-anywhere">
                      Taux de conversion
                    </p>
                    <div className="mt-3 flex items-center gap-2 min-w-0">
                      <div className="flex-1 h-1.5 bg-slate-800/50 rounded-full overflow-hidden min-w-0">
                        <div
                          className="h-full bg-gradient-to-r from-pink-600 to-rose-600 rounded-full"
                          style={{ width: `${stats.matches > 0 ? Math.min((stats.matches / Math.max(stats.profileViews, 1)) * 100, 100) : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-400 font-bold flex-shrink-0">Top 30%</span>
                    </div>
                  </div>
                </div>

                {/* Popularité */}
                <div className="bg-gradient-to-br from-amber-950/40 to-orange-950/40 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-5 lg:p-6 border border-amber-900/50 relative overflow-hidden min-w-0">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-600 to-orange-600 opacity-10 blur-3xl"></div>
                  <div className="relative min-w-0">
                    <div className="flex items-center gap-3 mb-4 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="text-xs text-gray-400 mb-1 truncate">Popularité</div>
                        <div className="text-2xl font-black text-white truncate">{Math.min(stats.profileScore + 15, 100)}</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 break-words overflow-wrap-anywhere">
                      Score d'influence
                    </p>
                    <div className="mt-3 flex items-center gap-2 min-w-0">
                      <div className="flex-1 h-1.5 bg-slate-800/50 rounded-full overflow-hidden min-w-0">
                        <div
                          className="h-full bg-gradient-to-r from-amber-600 to-orange-600 rounded-full"
                          style={{ width: `${Math.min(stats.profileScore + 15, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-green-400 font-bold flex-shrink-0">+12%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline d'activité */}
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-3 sm:p-5 lg:p-6 border border-slate-700/50 overflow-hidden">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 min-w-0">
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
                  <h3 className="text-xs sm:text-base lg:text-lg font-black text-white truncate flex-1 min-w-0">
                    Analyse IA de ton profil
                  </h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <TimelineItem
                    emoji="🎯"
                    title="Profil optimisé"
                    description={`${results.length} quiz complétés - Ton profil est ${results.length >= 3 ? 'ultra' : 'partiellement'} optimisé`}
                    color="from-purple-600 to-pink-600"
                  />
                  <TimelineItem
                    emoji="💫"
                    title="Activité détectée"
                    description={`${stats.messages} messages envoyés - ${stats.matches} matchs actifs`}
                    color="from-blue-600 to-cyan-600"
                  />
                  <TimelineItem
                    emoji="⚡"
                    title="Visibilité"
                    description={`${stats.profileViews} vues cette semaine - Ton profil attire l'attention`}
                    color="from-amber-600 to-orange-600"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal détails résultat */}
      {selectedResult && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setSelectedResult(null)}
        >
          <div
            className="relative bg-gradient-to-b from-gray-900 via-gray-900 to-black rounded-t-2xl sm:rounded-3xl border-t-2 sm:border-2 border-purple-500/50 max-w-2xl w-full max-h-[90vh] sm:max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-b from-gray-900/98 to-gray-900/95 backdrop-blur-xl border-b border-purple-500/30 p-4 sm:p-6 z-10">
              <div className="flex items-center justify-between gap-3 mb-2 sm:mb-3 min-w-0">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 overflow-hidden">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${getQuizColor(selectedResult.quiz_id)} flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0 shadow-xl`}>
                    {getQuizIcon(selectedResult.quiz_id)}
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="text-xs sm:text-sm text-gray-400 mb-1 truncate">{getQuizTitle(selectedResult.quiz_id)}</div>
                    <h2 className="text-sm sm:text-xl font-black text-white leading-tight line-clamp-2 break-words mb-1">
                      {selectedResult.result_title}
                    </h2>
                    {selectedResult.percentage && (
                      <div className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r ${getQuizColor(selectedResult.quiz_id)} text-white truncate max-w-[140px]`}>
                        {selectedResult.percentage}%
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="w-11 h-11 sm:w-12 sm:h-12 bg-slate-800/80 rounded-xl flex items-center justify-center hover:bg-slate-700 transition flex-shrink-0 active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-6 pb-24 sm:pb-6 space-y-3 sm:space-y-6">
              {(() => {
                const normalized = getNormalizedData(selectedResult);
                if (!normalized) return null;

                return (
                  <>
                    {selectedResult.result_subtitle && (
                      <div className={`bg-gradient-to-br ${getQuizColor(selectedResult.quiz_id)}/10 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border ${getQuizColor(selectedResult.quiz_id).replace('from-', 'border-').split(' ')[0]}/30 overflow-hidden`}>
                        <p className="text-sm sm:text-base text-white font-semibold leading-relaxed break-words overflow-wrap-anywhere">
                          {selectedResult.result_subtitle}
                        </p>
                      </div>
                    )}

                    <div className="bg-slate-900/50 rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-700/50">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-400 mb-1.5 sm:mb-2 flex items-center gap-2 truncate">
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        📊 Analyse
                      </h3>
                      <p className="text-gray-300 text-xs sm:text-base leading-relaxed break-words">
                        {normalized.description || selectedResult.result_data?.mainResult || 'Analyse complétée avec succès. Consultez vos forces et traits ci-dessous.'}
                      </p>
                    </div>

                    {normalized.traits && normalized.traits.length > 0 && (
                      <div className="overflow-hidden">
                        <h3 className="text-xs sm:text-base font-bold text-white mb-2 sm:mb-3 flex items-center gap-2 truncate">
                          <Star className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
                          <span className="truncate">⭐ Traits</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {normalized.traits.map((trait: string, i: number) => (
                            <span
                              key={i}
                              className={`bg-gradient-to-r ${getQuizColor(selectedResult.quiz_id)} bg-opacity-20 text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border ${getQuizColor(selectedResult.quiz_id).replace('from-', 'border-').split(' ')[0]}/40 font-medium truncate max-w-[140px] sm:max-w-[180px]`}
                              title={trait}
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {normalized.strengths && normalized.strengths.length > 0 && (
                      <div>
                        <h3 className="text-xs sm:text-base font-bold text-white mb-2 sm:mb-3 flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-green-400" />
                          ✅ Vos Forces
                        </h3>
                        <div className="space-y-1.5 sm:space-y-3">
                          {normalized.strengths.map((s: string, i: number) => (
                            <div key={i} className="bg-green-950/30 text-green-300 px-2.5 sm:px-4 py-2 sm:py-3 rounded-xl border border-green-800/50 text-xs sm:text-base flex items-start gap-2">
                              <span className="text-green-400 mt-0.5">✓</span>
                              <span className="flex-1">{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-xs sm:text-base font-bold text-white mb-2 sm:mb-3 flex items-center gap-2">
                        <Target className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-orange-400" />
                        ⚠️ Vos Défis
                      </h3>
                      {normalized.weaknesses && normalized.weaknesses.length > 0 ? (
                        <div className="space-y-1.5 sm:space-y-3">
                          {normalized.weaknesses.map((w: string, i: number) => (
                            <div key={i} className="bg-orange-950/30 text-orange-300 px-2.5 sm:px-4 py-2 sm:py-3 rounded-xl border border-orange-800/50 text-xs sm:text-base flex items-start gap-2">
                              <span className="text-orange-400 mt-0.5">→</span>
                              <span className="flex-1">{w}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-slate-800/30 text-gray-400 px-2.5 sm:px-4 py-3 sm:py-4 rounded-xl border border-slate-700/50 text-xs sm:text-sm text-center">
                          🎉 Profil solide ! Aucun défi majeur identifié dans ce quiz.
                        </div>
                      )}
                    </div>

                    {normalized.recommendations && normalized.recommendations.length > 0 && (
                      <div>
                        <h3 className="text-xs sm:text-base font-bold text-white mb-2 sm:mb-3 flex items-center gap-2">
                          <Lightbulb className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-400" />
                          💡 Recommandations
                        </h3>
                        <div className="space-y-1.5 sm:space-y-3">
                          {normalized.recommendations.map((r: string, i: number) => (
                            <div key={i} className="bg-blue-950/30 text-blue-300 px-2.5 sm:px-4 py-2 sm:py-3 rounded-xl border border-blue-800/50 text-xs sm:text-base flex items-start gap-2">
                              <span className="text-blue-400 mt-0.5">💡</span>
                              <span className="flex-1">{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              <div className="pt-2 sm:pt-4 border-t border-slate-700/50">
                <p className="text-[10px] sm:text-xs text-gray-500 text-center">
                  Quiz complété le {new Date(selectedResult.updated_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuizResultCard({ result, icon, color, title, onClick }: {
  result: QuizResult;
  icon: string;
  color: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-slate-900/50 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-3 sm:p-5 lg:p-6 border border-slate-700/50 hover:border-slate-600/80 transition-all cursor-pointer active:scale-[0.98] hover:scale-[1.01] relative overflow-hidden group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      <div className={`absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br ${color} opacity-[0.03] blur-3xl`}></div>

      <div className="relative min-w-0">
        <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4 min-w-0">
          <div className={`w-11 h-11 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-xl sm:text-2xl lg:text-3xl flex-shrink-0 shadow-lg`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="text-[9px] sm:text-[10px] lg:text-xs text-gray-500 mb-0.5 sm:mb-1 uppercase tracking-wider font-semibold truncate">
              {title}
            </div>
            <h3 className="text-white font-black text-xs sm:text-sm lg:text-base leading-tight line-clamp-2 mb-1 sm:mb-2 break-words">
              {result.result_title || 'Résultat'}
            </h3>
            {result.result_subtitle && (
              <p className="text-gray-400 text-[10px] sm:text-xs lg:text-sm leading-snug line-clamp-2 break-words">
                {result.result_subtitle}
              </p>
            )}
          </div>
        </div>

        {result.percentage && (
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs lg:text-sm text-gray-400 font-medium">Score</span>
              <span className={`text-lg sm:text-xl lg:text-2xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                {result.percentage}%
              </span>
            </div>
            <div className="h-1.5 sm:h-2 bg-slate-800/50 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
                style={{ width: `${result.percentage}%` }}
              />
            </div>
          </div>
        )}

        {(() => {
          const normalized = getNormalizedData(result);
          const traits = normalized?.traits || [];
          return traits.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              {traits.slice(0, 2).map((trait: string, i: number) => (
                <span
                  key={i}
                  className="bg-slate-800/50 text-gray-300 text-[9px] sm:text-[10px] lg:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-slate-700/50 font-medium truncate max-w-[90px] sm:max-w-[110px]"
                >
                  {trait}
                </span>
              ))}
              {traits.length > 2 && (
                <span className="bg-slate-800/30 text-gray-500 text-[9px] sm:text-[10px] lg:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-slate-700/50 font-medium">
                  +{traits.length - 2}
                </span>
              )}
            </div>
          );
        })()}

        <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-slate-700/30">
          <span className="text-[9px] sm:text-[10px] lg:text-xs text-gray-500 flex items-center gap-1 truncate">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
            <span className="truncate">{new Date(result.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
          </span>
          <span className={`text-[10px] sm:text-xs lg:text-sm font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent group-hover:opacity-80 transition-opacity flex items-center gap-0.5 sm:gap-1 flex-shrink-0`}>
            Détails
            <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ emoji, value, label, color, trend }: {
  emoji: string;
  value: number;
  label: string;
  color: string;
  trend?: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${color}/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 border border-white/10 relative overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br ${color} opacity-20 blur-2xl`}></div>
      <div className="relative">
        <div className="flex items-start justify-between mb-1 sm:mb-1.5 lg:mb-3">
          <div className="text-xl sm:text-2xl lg:text-3xl">{emoji}</div>
          {trend && (
            <span className="bg-green-500/20 text-green-400 text-[8px] sm:text-[9px] lg:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full font-bold truncate">
              {trend}
            </span>
          )}
        </div>
        <div className="text-lg sm:text-xl lg:text-3xl font-black text-white mb-0.5 truncate">{value}</div>
        <div className="text-[9px] sm:text-[10px] lg:text-xs text-gray-400 font-semibold truncate">{label}</div>
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
    <div className="flex items-start gap-1.5 sm:gap-2 lg:gap-3 group min-w-0 overflow-hidden">
      <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 text-base sm:text-lg lg:text-xl group-hover:scale-110 transition-transform`}>
        {emoji}
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <h4 className="text-xs sm:text-sm lg:text-base font-bold text-white mb-0.5 sm:mb-1 truncate">{title}</h4>
        <p className="text-[10px] sm:text-xs lg:text-sm text-gray-400 leading-relaxed line-clamp-2">{description}</p>
      </div>
    </div>
  );
}
