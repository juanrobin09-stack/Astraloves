import { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Star, Zap, Target, Lightbulb, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserQuizResults } from '../lib/quizResultsService';

interface QuizResultsPageProps {
  quizId: string;
  onBack: () => void;
  onNavigate: (page: string, data?: any) => void;
}

const getNormalizedData = (resultData: any) => {
  if (!resultData) return null;

  // Nouveau format avec analysis
  if (resultData.analysis) {
    return {
      title: resultData.title || resultData.analysis.title || 'Ton Profil',
      subtitle: resultData.subtitle || resultData.analysis.subtitle || '',
      analysis: resultData.analysis.analysis || resultData.analysis || '',
      strengths: Array.isArray(resultData.analysis.strengths) ? resultData.analysis.strengths : 
                 Array.isArray(resultData.strengths) ? resultData.strengths : [],
      challenges: Array.isArray(resultData.analysis.challenges) ? resultData.analysis.challenges :
                  Array.isArray(resultData.challenges) ? resultData.challenges : [],
      recommendations: Array.isArray(resultData.analysis.recommendations) ? resultData.analysis.recommendations :
                       Array.isArray(resultData.recommendations) ? resultData.recommendations : [],
      percentage: resultData.percentage || resultData.analysis.percentage || 75
    };
  }

  // Format direct
  return {
    title: resultData.title || 'Ton Profil',
    subtitle: resultData.subtitle || '',
    analysis: resultData.analysis || '',
    strengths: Array.isArray(resultData.strengths) ? resultData.strengths : [],
    challenges: Array.isArray(resultData.challenges) ? resultData.challenges : [],
    recommendations: Array.isArray(resultData.recommendations) ? resultData.recommendations : [],
    percentage: resultData.percentage || 75
  };
};

export default function QuizResultsPage({ quizId, onBack, onNavigate }: QuizResultsPageProps) {
  const { user } = useAuth();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResult();
  }, [quizId, user]);

  const loadResult = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const results = await getUserQuizResults(user.id);
      const latestResult = results.find((r: any) => r.quiz_id === quizId) || results[0];
      
      console.log('[QuizResultsPage] Result:', latestResult);
      setResult(latestResult);
    } catch (error) {
      console.error('[QuizResultsPage] Error loading result:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToMyResults = () => {
    onNavigate('my-results');
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <div className="text-gray-400 font-semibold">Chargement de ton analyse...</div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">🔮</div>
        <h2 className="text-2xl font-black text-white mb-2">Résultat introuvable</h2>
        <p className="text-gray-400 mb-6">Aucune analyse n'a été trouvée pour ce questionnaire.</p>
        <button
          onClick={onBack}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold"
        >
          Retour
        </button>
      </div>
    );
  }

  const normalized = getNormalizedData(result.result_data);

  if (!normalized) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-black text-white mb-2">Erreur de format</h2>
        <p className="text-gray-400 mb-6">Les données du résultat sont invalides.</p>
        <button
          onClick={onBack}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold"
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-slate-800">
        <div className="flex items-center p-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h1 className="text-lg font-black bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                Analysé par ASTRA IA
              </h1>
            </div>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Titre principal */}
        <div className="text-center space-y-3 pt-6">
          <div className="text-5xl mb-4">👁️</div>
          <h2 className="text-3xl font-black text-white leading-tight">
            {normalized.title}
          </h2>
          {normalized.subtitle && (
            <p className="text-lg text-gray-400 italic">
              {normalized.subtitle}
            </p>
          )}
        </div>

        {/* Score */}
        {normalized.percentage && (
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400 font-semibold">Score Global</span>
              <span className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                {normalized.percentage}%
              </span>
            </div>
            <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 relative"
                style={{ width: `${normalized.percentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Analyse ASTRA */}
        {normalized.analysis && (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Analyse ASTRA
            </h3>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {normalized.analysis}
              </p>
            </div>
          </div>
        )}

        {/* Forces */}
        {normalized.strengths && normalized.strengths.length > 0 && (
          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-xl rounded-3xl p-6 border border-green-500/20">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-400" />
              💪 Tes Forces
            </h3>
            <div className="space-y-3">
              {normalized.strengths.map((strength: string, i: number) => (
                <div
                  key={i}
                  className="bg-green-950/30 text-green-300 px-4 py-3 rounded-xl border border-green-800/50 flex items-start gap-2"
                >
                  <span className="text-green-400 mt-0.5 flex-shrink-0">✨</span>
                  <span className="flex-1 text-sm leading-relaxed">{strength}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Défis */}
        {normalized.challenges && normalized.challenges.length > 0 && (
          <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-xl rounded-3xl p-6 border border-orange-500/20">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-400" />
              ⚠️ Tes Défis
            </h3>
            <div className="space-y-3">
              {normalized.challenges.map((challenge: string, i: number) => (
                <div
                  key={i}
                  className="bg-orange-950/30 text-orange-300 px-4 py-3 rounded-xl border border-orange-800/50 flex items-start gap-2"
                >
                  <span className="text-orange-400 mt-0.5 flex-shrink-0">→</span>
                  <span className="flex-1 text-sm leading-relaxed">{challenge}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommandations */}
        {normalized.recommendations && normalized.recommendations.length > 0 && (
          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-xl rounded-3xl p-6 border border-blue-500/20">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-400" />
              💡 Recommandations
            </h3>
            <div className="space-y-3">
              {normalized.recommendations.map((rec: string, i: number) => (
                <div
                  key={i}
                  className="bg-blue-950/30 text-blue-300 px-4 py-3 rounded-xl border border-blue-800/50 flex items-start gap-2"
                >
                  <span className="text-blue-400 mt-0.5 flex-shrink-0">💡</span>
                  <span className="flex-1 text-sm leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="space-y-3 pt-4">
          <button
            onClick={goToMyResults}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-4 rounded-2xl font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            📊 Voir tous mes résultats
          </button>
          
          <button
            onClick={onBack}
            className="w-full bg-slate-800/50 text-white px-6 py-4 rounded-2xl font-bold hover:bg-slate-700/50 transition-colors"
          >
            Faire un autre questionnaire
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 pt-6">
          <p>Analyse générée par ASTRA IA</p>
          <p className="mt-1">
            Complétée le {new Date(result.updated_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
