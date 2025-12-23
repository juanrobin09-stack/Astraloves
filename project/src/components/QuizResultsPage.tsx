import { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Flame, TrendingUp, Circle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserQuizResults } from '../lib/quizResultsService';

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
    <div className="flex justify-center my-6">
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

interface QuizResultsPageProps {
  quizId: string;
  onBack: () => void;
  onNavigate: (page: string, data?: any) => void;
}

const getNormalizedData = (resultData: any) => {
  if (!resultData) return null;

  const isNestedFormat = resultData.analysis && typeof resultData.analysis === 'object';

  if (isNestedFormat) {
    return {
      title: resultData.analysis.seduction_style || 'Ton profil',
      description: resultData.analysis.seduction_style || '',
      mainScore: resultData.analysis.total_score || 75,
      strengths: Array.isArray(resultData.analysis.strengths) ? resultData.analysis.strengths : [],
      traits: Array.isArray(resultData.analysis.personality_traits) ? resultData.analysis.personality_traits : [],
      tips: Array.isArray(resultData.analysis.recommendations) ? resultData.analysis.recommendations : []
    };
  }

  return {
    title: resultData.mainResult || 'Ton profil',
    description: resultData.description || '',
    mainScore: resultData.mainScore || resultData.percentage || 75,
    strengths: Array.isArray(resultData.strengths) ? resultData.strengths : [],
    traits: Array.isArray(resultData.traits) ? resultData.traits : [],
    tips: Array.isArray(resultData.recommendations) ? resultData.recommendations : []
  };
};

export default function QuizResultsPage({ quizId, onBack, onNavigate }: QuizResultsPageProps) {
  const { user } = useAuth();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResult();
  }, [user, quizId]);

  const loadResult = async () => {
    if (!user) return;

    setLoading(true);
    const results = await getUserQuizResults(user.id);
    const quizResult = results.find((r: any) => r.quiz_id === quizId);

    if (quizResult) {
      setResult(quizResult);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F1419] to-[#1A1A2E] pb-24 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F1419] to-[#1A1A2E] pb-24 flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-white mb-4">Résultat non trouvé</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl text-white font-semibold hover:scale-105 transition-all"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const analysis = getNormalizedData(result.result_data);

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F1419] to-[#1A1A2E] pb-24 flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-white mb-4">Données incomplètes</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl text-white font-semibold hover:scale-105 transition-all"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const quizEmojis: Record<string, string> = {
    'first-impression': '👋',
    'seduction-test': '💋',
    'attachment-style': '💕',
    'love-archetype': '🌟',
    'compatibility-test': '❤️',
    'astral-theme': '✨'
  };

  const emoji = quizEmojis[quizId] || '🎉';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F1419] to-[#1A1A2E] pb-24">

      <div className="p-4 border-b border-red-500/10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour aux questionnaires
        </button>
      </div>

      <div className="p-6">

        <div className="flex justify-center mb-6">
          <div className="bg-purple-500/20 border border-purple-500/50 px-4 py-2 rounded-full flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 text-sm font-bold">
              Analysé par Astra IA
            </span>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="text-7xl mb-4">{emoji}</div>
          <h1 className="text-white text-3xl font-black mb-2">
            {analysis.title}
          </h1>
        </div>

        <div className="bg-gradient-to-br from-red-900/30 to-pink-900/20 border border-red-500/30 rounded-3xl p-6 sm:p-8 mb-6">

          <ProfileScoreBadge score={analysis.mainScore} />

          {analysis.description && (
            <p className="text-gray-300 text-center text-sm sm:text-base leading-relaxed mb-6">
              {analysis.description}
            </p>
          )}

          {analysis.strengths && analysis.strengths.length > 0 && (
            <div className="mb-6 pt-6 border-t border-white/10">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <span>✨</span> Points forts
              </h3>
              <div className="space-y-2">
                {analysis.strengths.map((strength: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 bg-white/5 rounded-xl p-3">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span className="text-gray-200 text-sm">{strength}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.traits && analysis.traits.length > 0 && (
            <div className="mb-6 pt-6 border-t border-white/10">
              <h3 className="text-white font-bold mb-3">⭐ Traits caractéristiques</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.traits.map((trait: string, i: number) => (
                  <span
                    key={i}
                    className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-white text-xs px-3 py-1.5 rounded-full"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysis.tips && analysis.tips.length > 0 && (
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <span>💡</span> Conseils personnalisés
              </h3>
              <div className="space-y-3">
                {analysis.tips.map((tip: string, i: number) => (
                  <div key={i} className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-gray-200 text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onNavigate('results')}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 rounded-xl text-white font-bold transition-all hover:scale-105"
          >
            📊 Voir tous mes résultats
          </button>

          <button
            onClick={onBack}
            className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-all"
          >
            Faire un autre questionnaire
          </button>
        </div>
      </div>
    </div>
  );
}
