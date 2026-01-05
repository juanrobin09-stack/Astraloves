import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { questionnaires, Question, QuestionType } from '../data/questionnaires';
import QuizResults from './QuizResults';
import { calculateLocalProfile, generateFullLocalAnalysis, getEmergencyResult } from '../lib/questionnaireLocalAnalysis';
import { saveQuizResult } from '../lib/quizResultsService';

interface PremiumQuestionnaireFlowProps {
  questionnaireId: string;
  onBack: () => void;
}

export default function PremiumQuestionnaireFlow({ questionnaireId, onBack }: PremiumQuestionnaireFlowProps) {
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const questionnaire = questionnaires[questionnaireId];

  if (!questionnaire) {
    console.error('[PremiumQuestionnaire] Questionnaire not found:', questionnaireId);
    console.log('[PremiumQuestionnaire] Available IDs:', Object.keys(questionnaires));
    return (
      <div className="min-h-screen velvet-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Questionnaire introuvable</p>
          <p className="text-white/60 text-sm mt-2">ID recherché : {questionnaireId}</p>
          <button onClick={onBack} className="mt-4 text-red-500 hover:text-red-400">
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (analysisResult) {
    console.log('[PremiumQuestionnaire] Affichage résultats:', analysisResult);
    console.log('[PremiumQuestionnaire] Type de résultat:', typeof analysisResult);
    console.log('[PremiumQuestionnaire] Clés du résultat:', Object.keys(analysisResult || {}));

    return (
      <QuizResults
        quizId={questionnaireId}
        result={analysisResult}
        onClose={onBack}
        onRetake={() => {
          setAnalysisResult(null);
          setCurrentQuestionIndex(0);
          setAnswers({});
          setError(null);
        }}
      />
    );
  }

  if (isGeneratingAnalysis) {
    return (
      <div className="fixed inset-0 velvet-bg flex items-center justify-center p-4">
        <style>{`
          @keyframes starPulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.3); opacity: 1; }
          }
          @keyframes loading {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes dotPulse {
            0%, 20% { opacity: 0.2; }
            40% { opacity: 1; }
            100% { opacity: 0.2; }
          }
        `}</style>
        <div className="stars-bg absolute inset-0 opacity-30" />
        <div className="relative z-10 w-full max-w-md mx-auto">
          <div className="bg-gradient-to-b from-black/80 to-black/60 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-red-900/30">
            {/* Animation étoiles */}
            <div className="flex justify-center gap-3 sm:gap-4 mb-5 sm:mb-6" style={{ animation: 'float 3s infinite' }}>
              <span className="text-4xl sm:text-5xl" style={{ animation: 'starPulse 1.5s infinite' }}>✨</span>
              <span className="text-4xl sm:text-5xl" style={{ animation: 'starPulse 1.5s infinite 0.3s' }}>⭐</span>
              <span className="text-4xl sm:text-5xl" style={{ animation: 'starPulse 1.5s infinite 0.6s' }}>🌟</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-red-500 mb-3 sm:mb-4">
              <span>Analyse en cours</span>
              <span className="inline-flex gap-1 ml-1">
                <span style={{ animation: 'dotPulse 1.4s infinite' }}>.</span>
                <span style={{ animation: 'dotPulse 1.4s infinite 0.2s' }}>.</span>
                <span style={{ animation: 'dotPulse 1.4s infinite 0.4s' }}>.</span>
              </span>
            </h2>
            <p className="text-white/80 text-base sm:text-lg mb-3 sm:mb-4">
              Les étoiles révèlent ton profil...
            </p>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-400"
                style={{ animation: 'loading 2s infinite' }}
              />
            </div>
            <p className="text-white/50 text-xs sm:text-sm mt-4 sm:mt-5 italic">
              Préparation de ton analyse détaillée...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questionnaire.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questionnaire.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questionnaire.questions.length - 1;
  const hasAnswer = answers[currentQuestion.id] !== undefined && answers[currentQuestion.id] !== null && answers[currentQuestion.id] !== '';

  const handleAnswer = (answer: any) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questionnaire.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const generateAIAnalysis = async () => {
    if (!user) return getEmergencyResult(questionnaireId);

    // ÉTAPE 1: Calculer le profil local d'abord (fallback garanti)
    const localProfile = calculateLocalProfile(answers);
    console.log('[PremiumQuestionnaire] Local profile calculated:', localProfile);

    // ÉTAPE 2: Tenter l'analyse IA
    try {
      const { data: profileData } = await supabase
        .from('astra_profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();

      const firstName = profileData?.username || 'toi';

      const answersText = questionnaire.questions.map((q, idx) => {
        const answer = answers[q.id];
        const selectedOption = questionnaire.questions[idx]?.options?.[answer as number];
        return `Q${idx + 1}: ${q.text}\nR: ${selectedOption || answer}`;
      }).join('\n\n');

      const prompt = `IMPORTANT: Réponds UNIQUEMENT en français, c'est absolument obligatoire.

Analyse les réponses du questionnaire "${questionnaire.title}" pour ${firstName}:

${answersText}

Tu dois retourner un objet JSON en FRANÇAIS avec exactement cette structure:
{
  "mainResult": "Le titre principal du résultat (ex: 'Attachement Sécure')",
  "description": "Une description détaillée en français sur 2-3 paragraphes expliquant le profil",
  "strengths": "• Force 1\n• Force 2\n• Force 3\n• Force 4",
  "attention": "• Point d'attention 1\n• Point d'attention 2\n• Point d'attention 3",
  "advice": "• Conseil 1\n• Conseil 2\n• Conseil 3\n• Conseil 4",
  "improvements": "• Amélioration 1\n• Amélioration 2\n• Amélioration 3"
}

RÈGLES STRICTES:
- Tout doit être en FRANÇAIS
- Les listes doivent utiliser des puces (•) suivies d'un retour à la ligne (\n)
- Minimum 3 points par catégorie
- Sois précis, concret et bienveillant
- Base-toi sur les réponses données`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Tu es un psychologue expert en relations amoureuses qui parle UNIQUEMENT en FRANÇAIS. Tu réponds EXCLUSIVEMENT en JSON valide, sans aucun texte supplémentaire. Toutes tes réponses doivent être en langue française. Tu utilises des listes à puces (•) séparées par des retours à la ligne (\n) pour les champs strengths, attention, advice et improvements. JAMAIS en anglais, TOUJOURS en français.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        console.log('[PremiumQuestionnaire] OpenAI API error, using local analysis');
        throw new Error('OpenAI API error');
      }

      const data = await response.json();
      console.log('[PremiumQuestionnaire] OpenAI response received');

      const analysisText = data.choices[0].message.content;
      const analysis = JSON.parse(analysisText);

      console.log('[PremiumQuestionnaire] AI analysis successful:', analysis);
      return {
        ...analysis,
        percentage: localProfile.percentage
      };

    } catch (err) {
      console.log('[PremiumQuestionnaire] Falling back to local analysis');
      // ÉTAPE 3: Fallback - Utiliser l'analyse locale complète
      const localAnalysis = generateFullLocalAnalysis(questionnaireId, localProfile);
      console.log('[PremiumQuestionnaire] Local analysis generated:', localAnalysis);
      return localAnalysis;
    }
  };

  // Fonction utilitaire pour parser les listes avec puces
  const parseBulletList = (text: string | string[]): string[] => {
    if (Array.isArray(text)) return text;
    if (!text || typeof text !== 'string') return [];

    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[•\-\*]\s*/, '')) // Enlever les puces
      .filter(line => line.length > 0);
  };

  const handleComplete = async () => {
    setIsGeneratingAnalysis(true);
    setError(null);

    console.log('[PremiumQuestionnaire] ▶️ Début du handleComplete');

    try {
      console.log('[PremiumQuestionnaire] 🔄 Génération de l\'analyse IA...');
      const aiAnalysis = await Promise.race([
        generateAIAnalysis(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout: L\'analyse prend trop de temps')), 30000)
        )
      ]);
      console.log('[PremiumQuestionnaire] ✅ Analyse générée:', aiAnalysis);

      const icons: Record<string, string> = {
        'attachment': '💕',
        'compatibility': '❤️',
        'archetype': '🌟',
        'astral': '🔮'
      };

      const titles: Record<string, string> = {
        'attachment': "Style d'attachement",
        'compatibility': 'Compatibilité amoureuse',
        'archetype': 'Archétype amoureux',
        'astral': 'Thème astral'
      };

      // Parser les listes pour les convertir en tableaux
      const analysis = typeof aiAnalysis === 'object' ? aiAnalysis : {
        mainResult: "Ton profil unique",
        description: aiAnalysis || "Analyse en cours de traitement...",
        strengths: [],
        attention: [],
        advice: [],
        improvements: []
      };

      const strengthsArray = parseBulletList(analysis.strengths);
      const attentionArray = parseBulletList(analysis.attention);
      const adviceArray = parseBulletList(analysis.advice);
      const improvementsArray = parseBulletList(analysis.improvements);

      // Préparer les résultats pour l'affichage
      const displayResult = {
        id: `${questionnaireId}-${Date.now()}`,
        questionnaire_id: questionnaireId,
        title: questionnaire.title,
        icon: icons[questionnaireId] || '✨',
        completed_at: new Date().toISOString(),
        main_result: analysis.mainResult,
        description: analysis.description,
        strengths: strengthsArray,
        attention_points: attentionArray,
        advice: adviceArray,
        improvements: improvementsArray,
        ai_analysis: typeof aiAnalysis === 'string' ? aiAnalysis : JSON.stringify(aiAnalysis, null, 2)
      };

      // Sauvegarder dans les deux tables (non-bloquant pour l'affichage)
      try {
        console.log('[PremiumQuestionnaire] 💾 Sauvegarde dans astra_questionnaire_results...');
        const canRetakeAt = new Date();
        canRetakeAt.setDate(canRetakeAt.getDate() + 7);

        const resultData = {
          user_id: user?.id,
          questionnaire_id: questionnaireId,
          title: titles[questionnaireId] || 'Questionnaire',
          icon: icons[questionnaireId] || '✨',
          answers: answers,
          analysis: aiAnalysis,
          completed_at: new Date().toISOString(),
          can_retake_at: canRetakeAt.toISOString()
        };

        const { error: saveError } = await supabase
          .from('astra_questionnaire_results')
          .insert([resultData]);

        if (saveError) {
          console.error('[PremiumQuestionnaire] ⚠️ Erreur sauvegarde astra_questionnaire_results:', saveError);
        } else {
          console.log('[PremiumQuestionnaire] ✅ Sauvegardé dans astra_questionnaire_results');
        }
      } catch (saveErr) {
        console.error('[PremiumQuestionnaire] ❌ Exception sauvegarde astra_questionnaire_results:', saveErr);
      }

      // Sauvegarder aussi dans quiz_results pour la page "Mes Résultats"
      try {
        console.log('[PremiumQuestionnaire] 💾 Sauvegarde dans quiz_results...');
        if (user) {
          const quizResultData = {
            title: analysis.mainResult,
            subtitle: questionnaire.title,
            description: analysis.description,
            strengths: strengthsArray,
            challenges: attentionArray,
            recommendations: adviceArray,
            improvements: improvementsArray,
            percentage: 85
          };

          await saveQuizResult(
            user.id,
            questionnaireId,
            questionnaire.title,
            quizResultData,
            answers
          );
          console.log('[PremiumQuestionnaire] ✅ Sauvegardé dans quiz_results');
        }
      } catch (saveErr) {
        console.error('[PremiumQuestionnaire] ⚠️ Exception sauvegarde quiz_results:', saveErr);
      }

      // Afficher les résultats QUOI QU'IL ARRIVE
      console.log('[PremiumQuestionnaire] 🎉 Affichage des résultats');
      setAnalysisResult(displayResult);

    } catch (err) {
      console.error('[PremiumQuestionnaire] ❌ Erreur critique:', err);

      // Même en cas d'erreur, essayer d'afficher un résultat de secours
      const emergencyResult = getEmergencyResult(questionnaireId);
      console.log('[PremiumQuestionnaire] 🚨 Utilisation du résultat de secours:', emergencyResult);

      setAnalysisResult({
        id: `${questionnaireId}-emergency-${Date.now()}`,
        questionnaire_id: questionnaireId,
        title: questionnaire.title,
        icon: '✨',
        completed_at: new Date().toISOString(),
        main_result: emergencyResult.mainResult || 'Ton profil unique',
        description: emergencyResult.description || 'Merci d\'avoir complété ce questionnaire.',
        strengths: [],
        attention_points: [],
        advice: [],
        improvements: [],
        ai_analysis: 'Résultat de secours'
      });
    } finally {
      console.log('[PremiumQuestionnaire] 🏁 Fin du handleComplete');
      setIsGeneratingAnalysis(false);
    }
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'single':
        return (
          <div className="space-y-3">
            {question.options?.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  answers[question.id] === option
                    ? 'border-red-600 bg-red-600/20 text-white'
                    : 'border-white/10 bg-black/40 text-white/80 hover:border-red-600/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all mt-0.5 ${
                    answers[question.id] === option
                      ? 'border-red-600 bg-red-600'
                      : 'border-white/30'
                  }`}>
                    {answers[question.id] === option && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-sm sm:text-base font-medium leading-relaxed break-words flex-1">{option}</span>
                </div>
              </button>
            ))}
          </div>
        );

      case 'scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-2 sm:gap-3">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleAnswer(value)}
                  className={`flex-1 aspect-square rounded-xl border-2 font-bold text-base sm:text-lg transition-all ${
                    answers[question.id] === value
                      ? 'border-red-600 bg-red-600 text-white'
                      : 'border-white/20 bg-black/40 text-white/60 hover:border-red-600/60'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] sm:text-xs text-white/70 px-1">
              <span className="text-left max-w-[45%] break-words">{question.scaleLabels?.min}</span>
              <span className="text-right max-w-[45%] break-words">{question.scaleLabels?.max}</span>
            </div>
          </div>
        );

      case 'multiple':
        const selectedOptions = answers[question.id] || [];
        return (
          <div className="space-y-3">
            {question.options?.map((option, idx) => {
              const isSelected = selectedOptions.includes(option);
              return (
                <button
                  key={idx}
                  onClick={() => {
                    const newSelection = isSelected
                      ? selectedOptions.filter((o: string) => o !== option)
                      : [...selectedOptions, option];
                    handleAnswer(newSelection);
                  }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-red-600 bg-red-600/20 text-white'
                      : 'border-white/10 bg-black/40 text-white/80 hover:border-red-600/50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isSelected ? 'border-red-600 bg-red-600' : 'border-white/30'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm sm:text-base break-words flex-1 leading-relaxed">{option}</span>
                </button>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 velvet-bg" style={{ display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .question-icon-float {
          animation: float 3s ease-in-out infinite;
        }
        .question-slide-in {
          animation: slideIn 0.5s ease-out;
        }
      `}</style>
      <div className="stars-bg absolute inset-0 opacity-30 pointer-events-none" />

      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'thin',
        scrollbarColor: '#ef4444 #1a1a1a',
        position: 'relative',
        zIndex: 10
      }}>

      <div className="min-h-full w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 20px)' }}>
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2.5 bg-white/10 hover:bg-red-600/20 border border-white/20 hover:border-red-600 text-white rounded-lg transition-all flex items-center gap-2 text-sm w-fit flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <div className="bg-black/60 backdrop-blur-lg border border-white/10 rounded-xl sm:rounded-2xl shadow-2xl flex-1 flex flex-col overflow-hidden">
          {/* Progress Bar - Sticky */}
          <div className="p-5 sm:p-6 pb-4 flex-shrink-0 sticky top-0 bg-black/80 backdrop-blur-lg z-10 border-b border-white/5">
            <div className="flex justify-between items-center mb-2 gap-3">
              <h2 className="text-white font-bold text-sm sm:text-base truncate flex-shrink">{questionnaire.title}</h2>
              <span className="text-red-500 font-semibold text-xs px-2.5 py-1 bg-red-600/20 rounded-full whitespace-nowrap flex-shrink-0">
                {currentQuestionIndex + 1}/{questionnaire.questions.length}
              </span>
            </div>
            <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4" style={{ WebkitOverflowScrolling: 'touch', paddingBottom: '160px' }}>
            {/* Question Icon */}
            <div className="text-center mb-4">
              <div className="text-3xl sm:text-4xl question-icon-float inline-block">
                {questionnaire.id === 'first_impression' && '👋'}
                {questionnaire.id === 'attachment' && '💕'}
                {questionnaire.id === 'compatibility' && '❤️'}
                {questionnaire.id === 'archetype' && '🌟'}
                {questionnaire.id === 'astral' && '🔮'}
              </div>
            </div>

            {/* Question */}
            <div className="question-slide-in" key={currentQuestionIndex}>
              <h3 className="text-white text-base sm:text-lg font-bold mb-6 leading-relaxed text-center px-1">
                {currentQuestion.text}
              </h3>
              {renderQuestion(currentQuestion)}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-600/50 rounded-lg">
                <p className="text-red-400 text-xs sm:text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Navigation - Fixed Bottom */}
          <div className="p-5 sm:p-6 pt-4 bg-black/90 backdrop-blur-lg border-t border-white/10 flex-shrink-0">
            <div className="flex flex-col gap-3">
              {isLastQuestion ? (
                <button
                  onClick={handleComplete}
                  disabled={!hasAnswer || isGeneratingAnalysis}
                  className="w-full px-4 py-3 sm:py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg text-sm min-h-[48px]"
                >
                  {isGeneratingAnalysis ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyse...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Voir analyse
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!hasAnswer}
                  className="w-full px-4 py-3 sm:py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg text-sm min-h-[48px]"
                >
                  Suivant
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {currentQuestionIndex > 0 && (
                <button
                  onClick={handlePrevious}
                  className="w-full px-4 py-3 sm:py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border border-white/20 text-sm min-h-[48px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Précédent
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
