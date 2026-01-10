import { ArrowLeft, Sparkles } from 'lucide-react';
import { parseAnalysisData, formatAnalysisSection } from '../lib/questionnaireHelpers';

interface QuestionnaireAnalysisProps {
  result: {
    id: string;
    questionnaire_id: string;
    title: string;
    icon: string;
    completed_at: string;
    analysis: any;
  };
  onBack: () => void;
}

export default function QuestionnaireAnalysis({ result, onBack }: QuestionnaireAnalysisProps) {
  // Parse analysis data properly
  let analysisData = parseAnalysisData(result.analysis);

  // Fallback si parsing échoue mais qu'on a des données
  if (!analysisData && result.analysis) {
    analysisData = {
      mainResult: 'Ton analyse personnalisée',
      description: typeof result.analysis === 'string' ? result.analysis : 'Analyse disponible',
      strengths: '',
      attention: '',
      advice: '',
      improvements: ''
    };
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen velvet-bg flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white/80 mb-4">Erreur lors du chargement de l'analyse</p>
          <button onClick={onBack} className="text-red-500 hover:text-red-400">
            Retour
          </button>
        </div>
      </div>
    );
  }

  // Format sections
  const strengthsList = formatAnalysisSection(analysisData.strengths || '');
  const attentionList = formatAnalysisSection(analysisData.attention_points || analysisData.attention || '');
  const adviceList = formatAnalysisSection(analysisData.advice || '');
  const improvementsList = formatAnalysisSection(analysisData.improvements || '');

  return (
    <div className="min-h-screen velvet-bg relative overflow-hidden pb-24">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 40px rgba(239, 68, 68, 0.3);
          }
          50% {
            box-shadow: 0 0 60px rgba(239, 68, 68, 0.5);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .analysis-section {
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
        }

        .analysis-section:nth-child(1) { animation-delay: 0.1s; }
        .analysis-section:nth-child(2) { animation-delay: 0.2s; }
        .analysis-section:nth-child(3) { animation-delay: 0.3s; }
        .analysis-section:nth-child(4) { animation-delay: 0.4s; }

        .shimmer-effect {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      <div className="stars-bg absolute inset-0 opacity-30" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="mb-6 text-white/80 hover:text-white flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>

        <div className="bg-gradient-to-b from-black/80 to-black/60 backdrop-blur-lg rounded-3xl overflow-hidden border border-red-900/30 shadow-2xl">
          {/* Header avec dégradé rouge/noir */}
          <div className="relative bg-gradient-to-br from-red-600 via-red-800 to-black p-10 text-center overflow-hidden">
            <div className="absolute inset-0 shimmer-effect opacity-20" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-black/30 backdrop-blur-sm rounded-full mb-4" style={{ animation: 'pulseGlow 3s infinite' }}>
                <span className="text-6xl">{result.icon}</span>
              </div>

              <h1 className="text-4xl font-bold text-white mb-2" style={{ textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)' }}>
                {result.title}
              </h1>

              <p className="text-white/90 text-lg flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Ton analyse personnalisée
              </p>
            </div>

            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-red-300 rounded-full blur-3xl" />
            </div>
          </div>

          {/* Résultat principal */}
          <div className="p-8 bg-gradient-to-b from-red-950/20 to-transparent border-b border-red-900/20">
            <h2 className="text-3xl font-bold text-red-500 text-center mb-4">
              {analysisData.main_result || analysisData.mainResult || 'Ton analyse personnalisée'}
            </h2>
            <p className="text-white/90 text-lg text-center leading-relaxed max-w-2xl mx-auto">
              {analysisData.description || 'Découvre ton profil astrologique unique'}
            </p>
          </div>

          {/* Analyse IA complète si disponible */}
          {analysisData.ai_analysis && (
            <div className="p-8 bg-red-950/10 border-b border-red-900/20">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-red-500" />
                <h3 className="text-xl font-bold text-red-500">Analyse personnalisée par Astra</h3>
              </div>
              <div className="bg-black/40 border border-red-900/30 rounded-xl p-6">
                <p className="text-white/90 text-base leading-relaxed whitespace-pre-wrap">
                  {analysisData.ai_analysis}
                </p>
              </div>
            </div>
          )}

          {/* Sections d'analyse */}
          <div className="p-8 space-y-6">
            {/* Forces */}
            {strengthsList.length > 0 && (
              <div className="analysis-section bg-gradient-to-r from-red-950/20 to-transparent border-l-4 border-red-600 rounded-xl p-6 transition-all hover:bg-red-950/30 hover:translate-x-2 hover:shadow-lg hover:shadow-red-900/20">
                <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
                  ✨ Tes forces
                </h3>
                <div className="space-y-3">
                  {strengthsList.map((strength, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-3 rounded-lg bg-white/5 hover:bg-red-600/10 transition-all hover:translate-x-1"
                    >
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(255,0,0,0.6)]" />
                      <p className="text-white/90 text-base leading-relaxed flex-1">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Points d'attention */}
            {attentionList.length > 0 && (
              <div className="analysis-section bg-gradient-to-r from-orange-950/20 to-transparent border-l-4 border-orange-600 rounded-xl p-6 transition-all hover:bg-orange-950/30 hover:translate-x-2 hover:shadow-lg hover:shadow-orange-900/20">
                <h3 className="text-xl font-bold text-orange-500 mb-4 flex items-center gap-2">
                  💡 Points d'attention
                </h3>
                <div className="space-y-3">
                  {attentionList.map((point, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-3 rounded-lg bg-white/5 hover:bg-orange-600/10 transition-all hover:translate-x-1"
                    >
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(255,165,0,0.6)]" />
                      <p className="text-white/90 text-base leading-relaxed flex-1">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conseils */}
            {adviceList.length > 0 && (
              <div className="analysis-section bg-gradient-to-r from-yellow-950/20 to-transparent border-l-4 border-yellow-600 rounded-xl p-6 transition-all hover:bg-yellow-950/30 hover:translate-x-2 hover:shadow-lg hover:shadow-yellow-900/20">
                <h3 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
                  🎯 Conseils personnalisés
                </h3>
                <div className="space-y-3">
                  {adviceList.map((conseil, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-3 rounded-lg bg-white/5 hover:bg-yellow-600/10 transition-all hover:translate-x-1"
                    >
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(255,255,0,0.6)]" />
                      <p className="text-white/90 text-base leading-relaxed flex-1">{conseil}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pistes d'amélioration */}
            {improvementsList.length > 0 && (
              <div className="analysis-section bg-gradient-to-r from-green-950/20 to-transparent border-l-4 border-green-600 rounded-xl p-6 transition-all hover:bg-green-950/30 hover:translate-x-2 hover:shadow-lg hover:shadow-green-900/20">
                <h3 className="text-xl font-bold text-green-500 mb-4 flex items-center gap-2">
                  🚀 Pistes d'amélioration
                </h3>
                <div className="space-y-3">
                  {improvementsList.map((improvement, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-3 rounded-lg bg-white/5 hover:bg-green-600/10 transition-all hover:translate-x-1"
                    >
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(0,255,0,0.6)]" />
                      <p className="text-white/90 text-base leading-relaxed flex-1">{improvement}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 text-center border-t border-red-900/20 bg-black/40">
            <p className="text-white/60 text-sm">
              Complété le {new Date(result.completed_at).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
