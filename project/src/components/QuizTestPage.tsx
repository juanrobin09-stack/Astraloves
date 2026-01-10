import { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { analyzeQuizWithAI, saveQuizResult } from '../lib/quizAnalysisService';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { getQuizById, analysisPrompts } from '../data/quizData';

interface QuizTestPageProps {
  quizId: string;
  onBack: () => void;
  onComplete: () => void;
}

export default function QuizTestPage({ quizId, onBack, onComplete }: QuizTestPageProps) {
  const { user } = useAuth();
  const { isPremiumElite, isPremium } = usePremiumStatus();
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const quiz = getQuizById(quizId);

  if (!quiz) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#0A0A0A', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '20px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#fff', marginBottom: '16px' }}>Analyse non trouvée</p>
          <button
            onClick={onBack}
            style={{ 
              padding: '12px 24px', 
              background: '#E63946', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: 500, 
              cursor: 'pointer' 
            }}
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const totalQuestions = quiz.questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const question = quiz.questions[currentQuestion];
  const isFirstQuestion = currentQuestion === 0;
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  // Écran d'introduction
  if (!started) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px'
      }}>
        {/* Header */}
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#5A5A5A',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 0',
            fontSize: '14px'
          }}
        >
          <ArrowLeft size={18} />
          Retour
        </button>

        {/* Contenu centré */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '400px',
          margin: '0 auto',
          padding: '40px 20px'
        }}>
          {/* Icône */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: quiz.isAIAnalysis 
              ? 'rgba(230, 57, 70, 0.1)' 
              : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${quiz.isAIAnalysis ? 'rgba(230, 57, 70, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px'
          }}>
            {quiz.isAIAnalysis ? (
              <span style={{ fontSize: '32px' }}>✦</span>
            ) : (
              <span style={{ fontSize: '32px' }}>○</span>
            )}
          </div>

          {/* Titre */}
          <h1 style={{
            color: '#FFFFFF',
            fontSize: '28px',
            fontWeight: 600,
            margin: '0 0 16px',
            letterSpacing: '-0.02em'
          }}>
            {quiz.name}
          </h1>

          {/* Introduction */}
          <p style={{
            color: '#7A7A7A',
            fontSize: '16px',
            lineHeight: 1.6,
            margin: '0 0 32px'
          }}>
            {quiz.introduction}
          </p>

          {/* Métadonnées */}
          <div style={{
            display: 'flex',
            gap: '24px',
            marginBottom: '48px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 600, margin: 0 }}>
                {quiz.questionCount}
              </p>
              <p style={{ color: '#5A5A5A', fontSize: '12px', margin: '4px 0 0' }}>
                questions
              </p>
            </div>
            {quiz.isAIAnalysis && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#E63946', fontSize: '20px', fontWeight: 600, margin: 0 }}>
                  IA
                </p>
                <p style={{ color: '#5A5A5A', fontSize: '12px', margin: '4px 0 0' }}>
                  analyse
                </p>
              </div>
            )}
          </div>

          {/* Bouton démarrer */}
          <button
            onClick={() => setStarted(true)}
            style={{
              padding: '16px 48px',
              background: '#E63946',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Commencer
          </button>
        </div>
      </div>
    );
  }

  const handleSelectOption = (value: string) => {
    setSelectedOption(value);
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      const prevIndex = currentQuestion - 1;
      setCurrentQuestion(prevIndex);
      setSelectedOption(answers[prevIndex]?.value ?? null);
    }
  };

  const handleNext = async () => {
    if (selectedOption === null) return;

    const option = question.options.find(o => o.value === selectedOption);
    const newAnswers = {
      ...answers,
      [currentQuestion]: {
        questionId: question.id,
        value: selectedOption,
        score: option?.score || 0,
        dimension: option?.dimension || ''
      }
    };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      await handleFinish(newAnswers);
    } else {
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      setSelectedOption(newAnswers[nextIndex]?.value ?? null);
    }
  };

  const handleFinish = async (finalAnswers: Record<number, any>) => {
    setAnalyzing(true);

    try {
      // Calculer le score total et les dimensions
      const totalScore = Object.values(finalAnswers).reduce((sum, a) => sum + (a.score || 0), 0);
      const maxScore = quiz.questions.length * 4;
      const percentage = Math.round((totalScore / maxScore) * 100);

      // Collecter les dimensions pour l'analyse IA
      const dimensions: Record<string, number> = {};
      Object.values(finalAnswers).forEach((answer: any) => {
        if (answer.dimension) {
          dimensions[answer.dimension] = (dimensions[answer.dimension] || 0) + 1;
        }
      });

      // Trouver la dimension dominante
      const dominantDimension = Object.entries(dimensions)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

      // Trouver l'archétype si disponible
      let archetype = null;
      if (quiz.analysisTemplate.archetypes) {
        archetype = quiz.analysisTemplate.archetypes.find(a => 
          a.id === dominantDimension || a.traits.some(t => dimensions[t])
        ) || quiz.analysisTemplate.archetypes[0];
      }

      // Préparer les données de résultat
      const resultData = {
        quiz_id: quizId,
        user_id: user?.id,
        answers: finalAnswers,
        total_score: totalScore,
        percentage,
        dimensions,
        archetype: archetype?.id || null,
        archetype_name: archetype?.name || null,
        archetype_description: archetype?.description || null,
        completed_at: new Date().toISOString()
      };

      // Sauvegarder le résultat
      if (user) {
        await saveQuizResult(user.id, quizId, resultData);
      }

      onComplete();
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      onComplete();
    } finally {
      setAnalyzing(false);
    }
  };

  // Écran de chargement pendant l'analyse
  if (analyzing) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          border: '3px solid rgba(230, 57, 70, 0.2)',
          borderTopColor: '#E63946',
          animation: 'spin 1s linear infinite',
          marginBottom: '24px'
        }} />
        <p style={{ color: '#FFFFFF', fontSize: '18px', marginBottom: '8px' }}>
          Analyse en cours...
        </p>
        <p style={{ color: '#5A5A5A', fontSize: '14px' }}>
          {quiz.isAIAnalysis ? 'Notre IA traite tes réponses' : 'Compilation des résultats'}
        </p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #1A1A1A'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#5A5A5A',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 0',
              fontSize: '14px'
            }}
          >
            <ArrowLeft size={18} />
            Quitter
          </button>
          <span style={{ color: '#5A5A5A', fontSize: '14px' }}>
            {currentQuestion + 1} / {totalQuestions}
          </span>
        </div>

        {/* Barre de progression */}
        <div style={{
          height: '4px',
          background: '#1A1A1A',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: '#E63946',
            borderRadius: '2px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Contenu de la question */}
      <div style={{
        flex: 1,
        padding: '32px 20px',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '600px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Question */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            color: '#FFFFFF',
            fontSize: '22px',
            fontWeight: 500,
            lineHeight: 1.4,
            margin: '0 0 8px'
          }}>
            {question.text}
          </h2>
          {question.subtext && (
            <p style={{
              color: '#5A5A5A',
              fontSize: '14px',
              margin: 0,
              fontStyle: 'italic'
            }}>
              {question.subtext}
            </p>
          )}
        </div>

        {/* Options */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          flex: 1
        }}>
          {question.options.map((option, index) => (
            <button
              key={option.value}
              onClick={() => handleSelectOption(option.value)}
              style={{
                padding: '18px 20px',
                background: selectedOption === option.value 
                  ? 'rgba(230, 57, 70, 0.15)' 
                  : '#0D0D0D',
                border: `1px solid ${selectedOption === option.value ? '#E63946' : '#1A1A1A'}`,
                borderRadius: '12px',
                color: selectedOption === option.value ? '#FFFFFF' : '#9A9A9A',
                fontSize: '15px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: `2px solid ${selectedOption === option.value ? '#E63946' : '#3A3A3A'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {selectedOption === option.value && (
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#E63946'
                  }} />
                )}
              </div>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer avec navigation */}
      <div style={{
        padding: '16px 20px 32px',
        borderTop: '1px solid #1A1A1A',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <button
          onClick={handlePrevious}
          disabled={isFirstQuestion}
          style={{
            padding: '14px 24px',
            background: 'transparent',
            border: '1px solid #2A2A2A',
            borderRadius: '10px',
            color: isFirstQuestion ? '#3A3A3A' : '#9A9A9A',
            fontSize: '14px',
            fontWeight: 500,
            cursor: isFirstQuestion ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <ChevronLeft size={18} />
          Précédent
        </button>

        <button
          onClick={handleNext}
          disabled={selectedOption === null}
          style={{
            padding: '14px 32px',
            background: selectedOption === null ? '#1A1A1A' : '#E63946',
            border: 'none',
            borderRadius: '10px',
            color: selectedOption === null ? '#5A5A5A' : '#FFFFFF',
            fontSize: '14px',
            fontWeight: 500,
            cursor: selectedOption === null ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          {isLastQuestion ? 'Terminer' : 'Suivant'}
          {isLastQuestion ? <Check size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
    </div>
  );
}
