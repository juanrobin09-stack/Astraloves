import { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { analyzeQuizWithAI, saveQuizResult } from '../lib/quizAnalysisService';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { questionnaires } from '../data/questionnaires';

interface QuizTestPageProps {
  quizId: string;
  onBack: () => void;
  onComplete: () => void;
}

const QUIZ_DATA: Record<string, any> = (() => {
  const mapped: Record<string, any> = {};

  Object.entries(questionnaires).forEach(([key, q]) => {
    mapped[key] = {
      id: key,
      title: q.title.replace(/[^\w\s]/g, '').trim(),
      emoji: q.title.match(/[^\w\s]/)?.[0] || '📝',
      questions: q.questions.map((question, idx) => ({
        id: question.id,
        question: question.text,
        options: question.options?.map((opt, optIdx) => ({
          text: opt,
          value: `option_${optIdx}`,
          score: optIdx + 1
        })) || []
      }))
    };
  });

  return mapped;
})();

export default function QuizTestPage({ quizId, onBack, onComplete }: QuizTestPageProps) {
  const { user } = useAuth();
  const { isPremiumElite, isPremium } = usePremiumStatus();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const quiz = QUIZ_DATA[quizId];

  if (!quiz) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#fff', marginBottom: '16px' }}>Quiz non trouvé</p>
          <button
            onClick={onBack}
            style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #E63946, #C1121F)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
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

  const handleSelectOption = (index: number) => {
    setSelectedOption(index);
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      const prevIndex = currentQuestion - 1;
      setCurrentQuestion(prevIndex);
      setSelectedOption(answers[prevIndex]?.optionIndex ?? null);
    }
  };

  const handleNext = async () => {
    if (selectedOption === null) return;

    const option = question.options[selectedOption];
    const newAnswers = {
      ...answers,
      [currentQuestion]: {
        questionId: question.id,
        optionIndex: selectedOption,
        ...option
      }
    };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      await handleFinish(newAnswers);
    } else {
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      setSelectedOption(newAnswers[nextIndex]?.optionIndex ?? null);
    }
  };

  const handleFinish = async (finalAnswers: Record<number, any>) => {
    setAnalyzing(true);

    try {
      // Déterminer le tier selon l'abonnement
      const tier = isPremiumElite ? 'premium_elite' : isPremium ? 'premium' : 'free';

      // Préparer les réponses au bon format
      const answersArray = Object.values(finalAnswers).map((answer, index) => ({
        questionId: `q${index + 1}`,
        value: answer.text || '',
        score: answer.score || 0
      }));

      // Préparer l'objet quiz au bon format
      const quizData = {
        id: quizId,
        name: quiz.title,
        questions: quiz.questions
      };

      console.log('🎯 [QuizAnalysis] Starting analysis:', { tier, quizId, answersCount: answersArray.length });

      // Analyser avec l'IA
      const analysis = await analyzeQuizWithAI(quizData, answersArray, tier);

      console.log('✅ [QuizAnalysis] Analysis complete:', analysis);

      // Sauvegarder les résultats
      if (user?.id) {
        await saveQuizResult(user.id, quizData, answersArray, analysis);
      }

      onComplete();
    } catch (error) {
      console.error('❌ [QuizAnalysis] Error analyzing quiz:', error);
      setAnalyzing(false);
      alert('Erreur lors de l\'analyse. Veuillez réessayer.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      width: '100%',
      maxWidth: '100vw',
      position: 'relative'
    }}>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes dotPulse {
          0%, 20% {
            opacity: 0.2;
          }
          40% {
            opacity: 1;
          }
          100% {
            opacity: 0.2;
          }
        }

        .quiz-option-card {
          animation: fadeIn 0.4s ease forwards;
          opacity: 0;
        }

        .quiz-option-card:nth-child(1) { animation-delay: 0.05s; }
        .quiz-option-card:nth-child(2) { animation-delay: 0.1s; }
        .quiz-option-card:nth-child(3) { animation-delay: 0.15s; }
        .quiz-option-card:nth-child(4) { animation-delay: 0.2s; }
        .quiz-option-card:nth-child(5) { animation-delay: 0.25s; }
        .quiz-option-card:nth-child(6) { animation-delay: 0.3s; }
      `}</style>

      {/* HEADER FIXE */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100000,
        background: 'rgba(10, 10, 10, 0.98)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(230, 57, 70, 0.1)',
        padding: '12px 16px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '10px',
          maxWidth: '100%'
        }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#A0A0A0',
              fontSize: '14px',
              padding: '8px 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <ArrowLeft size={18} />
            <span>Retour</span>
          </button>

          <span style={{
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            textAlign: 'center',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0
          }}>
            {quiz.title}
          </span>

          <span style={{
            color: '#E63946',
            fontSize: '14px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            {currentQuestion + 1}/{totalQuestions}
          </span>
        </div>

        <div style={{
          width: '100%',
          height: '3px',
          background: '#242424',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #E63946, #FF6B6B)',
            borderRadius: '2px',
            transition: 'width 0.3s ease',
            width: `${progress}%`
          }} />
        </div>
      </header>

      {/* CONTENU SCROLLABLE */}
      <main style={{
        flex: 1,
        paddingTop: '80px',
        paddingBottom: '140px',
        paddingLeft: '16px',
        paddingRight: '16px',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        width: '100%'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          width: '100%'
        }}>
          <h2 style={{
            color: '#fff',
            fontSize: '20px',
            fontWeight: 700,
            lineHeight: 1.4,
            marginBottom: '8px',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            animation: 'fadeIn 0.3s ease'
          }}>
            {question.question}
          </h2>

          <p style={{
            color: '#6B6B6B',
            fontSize: '13px',
            marginBottom: '24px'
          }}>
            Choisissez la réponse qui vous correspond le mieux
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            width: '100%'
          }}>
            {question.options.map((option: any, index: number) => {
              const isSelected = selectedOption === index;

              return (
                <div
                  key={index}
                  className="quiz-option-card"
                  onClick={() => handleSelectOption(index)}
                  style={{
                    background: isSelected ? 'rgba(230, 57, 70, 0.08)' : '#1A1A1A',
                    border: `2px solid ${isSelected ? '#E63946' : '#2A2A2A'}`,
                    borderRadius: '12px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    width: '100%',
                    boxShadow: isSelected ? '0 0 20px rgba(230, 57, 70, 0.15)' : 'none'
                  }}
                >
                  <div style={{
                    width: '22px',
                    height: '22px',
                    minWidth: '22px',
                    border: `2px solid ${isSelected ? '#E63946' : '#424242'}`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '2px',
                    background: isSelected ? '#E63946' : 'transparent',
                    transition: 'all 0.2s ease'
                  }}>
                    {isSelected && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        background: '#0A0A0A',
                        borderRadius: '50%',
                        animation: 'scaleIn 0.2s ease'
                      }} />
                    )}
                  </div>

                  <p style={{
                    color: isSelected ? '#fff' : '#E0E0E0',
                    fontSize: '15px',
                    lineHeight: 1.4,
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    flex: 1,
                    margin: 0
                  }}>
                    {option.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* FOOTER FIXE */}
      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100000,
        background: 'rgba(10, 10, 10, 0.98)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(230, 57, 70, 0.1)',
        padding: '12px 16px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '600px',
          margin: '0 auto',
          width: '100%'
        }}>
          <button
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            style={{
              flex: 1,
              maxWidth: '140px',
              background: 'transparent',
              border: `2px solid ${isFirstQuestion ? 'rgba(58, 58, 58, 0.5)' : '#3A3A3A'}`,
              color: isFirstQuestion ? '#5A5A5A' : '#A0A0A0',
              borderRadius: '10px',
              padding: '12px 8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isFirstQuestion ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              opacity: isFirstQuestion ? 0.4 : 1
            }}
          >
            <ChevronLeft size={18} />
            Précédent
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleNext}
              disabled={selectedOption === null}
              style={{
                flex: 1,
                maxWidth: '160px',
                background: selectedOption === null ? '#2A2A2A' : 'linear-gradient(135deg, #22C55E, #16A34A)',
                border: 'none',
                color: selectedOption === null ? '#5A5A5A' : '#fff',
                borderRadius: '10px',
                padding: '12px 8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: selectedOption === null ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: selectedOption !== null ? '0 4px 15px rgba(34, 197, 94, 0.3)' : 'none'
              }}
            >
              Terminer
              <Check size={18} />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={selectedOption === null}
              style={{
                flex: 1,
                maxWidth: '140px',
                background: selectedOption === null ? '#2A2A2A' : 'linear-gradient(135deg, #E63946, #C1121F)',
                border: 'none',
                color: selectedOption === null ? '#5A5A5A' : '#fff',
                borderRadius: '10px',
                padding: '12px 8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: selectedOption === null ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: selectedOption !== null ? '0 4px 15px rgba(230, 57, 70, 0.3)' : 'none'
              }}
            >
              Suivant
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </footer>

      {/* MODAL ANALYSE */}
      {analyzing && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{ textAlign: 'center', padding: '24px', maxWidth: '300px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              <div style={{
                fontSize: '64px',
                display: 'inline-block',
                animation: 'spinSlow 8s linear infinite'
              }}>✨</div>
            </div>
            <h3 style={{
              color: '#fff',
              fontSize: '24px',
              fontWeight: 700,
              marginBottom: '12px'
            }}>
              <span>Analyse en cours</span>
              <span style={{ display: 'inline-flex', gap: '2px', marginLeft: '4px' }}>
                <span style={{ animation: 'dotPulse 1.4s infinite', animationDelay: '0s' }}>.</span>
                <span style={{ animation: 'dotPulse 1.4s infinite', animationDelay: '0.2s' }}>.</span>
                <span style={{ animation: 'dotPulse 1.4s infinite', animationDelay: '0.4s' }}>.</span>
              </span>
            </h3>
            <p style={{
              color: '#A0A0A0',
              fontSize: '14px',
              marginBottom: '12px',
              lineHeight: '1.5'
            }}>
              Astra IA analyse tes réponses
            </p>
            <p style={{
              color: '#666',
              fontSize: '13px',
              fontStyle: 'italic',
              lineHeight: '1.5',
              marginTop: '16px'
            }}>
              Préparation de ton analyse détaillée...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
