import { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, ChevronRight, Check, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { useQuizAccess } from '../hooks/useQuizAccess';
import { getUserQuizResults } from '../lib/quizResultsService';
import QuizTestPage from './QuizTestPage';
import QuizResultsPage from './QuizResultsPage';

type QuestionnairesPageProps = {
  onBack: () => void;
  onNavigate?: (page: string, data?: any) => void;
};

// Descriptions premium pour chaque questionnaire
const premiumDescriptions: Record<string, string> = {
  'first_impression': "Ce que les autres perçoivent de toi avant même que tu ne parles.",
  'seduction': "Ton langage silencieux. Ce qui attire sans que tu le saches.",
  'attachment': "Comment tu te lies. Et pourquoi certaines relations t'échappent.",
  'archetype': "Le schéma profond qui guide tes choix romantiques.",
  'astral': "Ta configuration céleste. Calculée à la minute près.",
  'compatibility': "Les dynamiques invisibles entre deux personnalités.",
  'love_language': "Comment tu donnes et reçois l'amour.",
  'emotional_intelligence': "Ta capacité à lire et naviguer les émotions."
};

// Questionnaires avec analyse IA
const aiAnalysisQuizzes = ['attachment', 'archetype', 'astral', 'compatibility', 'emotional_intelligence'];

export default function QuestionnairesPage({ onBack, onNavigate }: QuestionnairesPageProps) {
  const { user } = useAuth();
  const { tier, loading: premiumLoading } = usePremiumStatus();
  const { categorizedQuizzes, checkAccess } = useQuizAccess();
  const [completedQuizzes, setCompletedQuizzes] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'list' | 'test' | 'results'>('list');
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    loadCompletedQuizzes();
  }, [user]);

  const loadCompletedQuizzes = async () => {
    if (!user) return;
    const results = await getUserQuizResults(user.id);
    setCompletedQuizzes(results);
  };

  const handleNavigate = (page: string, data?: any) => {
    if (page === 'subscriptions') {
      if (onNavigate) onNavigate('subscriptions');
      return;
    }
    if (page === 'quiz-test') {
      setActiveQuizId(data.quizId);
      setActiveView('test');
    } else if (page === 'quiz-results') {
      setActiveQuizId(data.quizId);
      setActiveView('results');
    }
  };

  const handleBackToList = () => {
    setActiveView('list');
    setActiveQuizId(null);
    loadCompletedQuizzes();
  };

  if (activeView === 'test' && activeQuizId) {
    return (
      <QuizTestPage
        quizId={activeQuizId}
        onBack={handleBackToList}
        onComplete={() => setActiveView('results')}
      />
    );
  }

  if (activeView === 'results' && activeQuizId) {
    return (
      <QuizResultsPage
        quizId={activeQuizId}
        onBack={handleBackToList}
        onNavigate={onNavigate || (() => {})}
      />
    );
  }

  if (premiumLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid rgba(230, 57, 70, 0.3)',
          borderTopColor: '#E63946',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  // Combiner tous les quizzes
  const allQuizzes = [
    ...categorizedQuizzes.free.quizzes,
    ...categorizedQuizzes.premium.quizzes,
    ...categorizedQuizzes.elite.quizzes
  ];

  // Séparer en Fondations et Analyses Approfondies
  const foundationQuizzes = allQuizzes.filter(q => 
    ['first_impression', 'seduction'].includes(q.id)
  );
  const advancedQuizzes = allQuizzes.filter(q => 
    !['first_impression', 'seduction'].includes(q.id)
  );

  const renderQuizCard = (quiz: any) => {
    const completed = completedQuizzes.find(q => q.quiz_id === quiz.id);
    const canAccess = checkAccess(quiz.id);
    const isHovered = hoveredCard === quiz.id;
    const hasAI = aiAnalysisQuizzes.includes(quiz.id);
    const description = premiumDescriptions[quiz.id] || quiz.description;

    return (
      <div
        key={quiz.id}
        onMouseEnter={() => setHoveredCard(quiz.id)}
        onMouseLeave={() => setHoveredCard(null)}
        style={{
          background: '#0D0D0D',
          border: `1px solid ${isHovered ? 'rgba(230, 57, 70, 0.3)' : '#1A1A1A'}`,
          borderRadius: '16px',
          padding: '24px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'translateY(-2px)' : 'none',
        }}
        onClick={() => {
          if (!canAccess) {
            handleNavigate('subscriptions');
          } else if (completed) {
            // Voir les résultats ou refaire
          } else {
            handleNavigate('quiz-test', { quizId: quiz.id });
          }
        }}
      >
        {/* Header avec icône */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          {/* Icône minimaliste */}
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: completed 
              ? 'rgba(230, 57, 70, 0.15)' 
              : hasAI 
                ? 'rgba(230, 57, 70, 0.08)'
                : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${completed ? 'rgba(230, 57, 70, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            position: 'relative'
          }}>
            {completed ? (
              <Check size={20} style={{ color: '#E63946' }} />
            ) : hasAI ? (
              <Sparkles size={18} style={{ color: 'rgba(230, 57, 70, 0.7)' }} />
            ) : (
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.4)'
              }} />
            )}
            {/* Halo subtil pour IA */}
            {hasAI && !completed && (
              <div style={{
                position: 'absolute',
                inset: '-2px',
                borderRadius: '14px',
                background: 'radial-gradient(circle, rgba(230, 57, 70, 0.15) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />
            )}
          </div>

          {/* Contenu */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Titre */}
            <h3 style={{
              color: '#FFFFFF',
              fontSize: '17px',
              fontWeight: 500,
              margin: '0 0 4px 0',
              letterSpacing: '-0.01em'
            }}>
              {quiz.name}
            </h3>

            {/* Tag IA discret */}
            {hasAI && (
              <p style={{
                color: 'rgba(230, 57, 70, 0.7)',
                fontSize: '11px',
                fontWeight: 500,
                margin: '0 0 8px 0',
                letterSpacing: '0.02em'
              }}>
                Analyse IA
              </p>
            )}

            {/* Description */}
            <p style={{
              color: '#7A7A7A',
              fontSize: '14px',
              lineHeight: 1.5,
              margin: '0 0 12px 0'
            }}>
              {description}
            </p>

            {/* Métadonnées */}
            <p style={{
              color: '#4A4A4A',
              fontSize: '12px',
              margin: 0
            }}>
              {quiz.questions_count} questions · ~{quiz.duration}
            </p>
          </div>

          {/* Action */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0
          }}>
            {completed ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate('quiz-test', { quizId: quiz.id });
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid #2A2A2A',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#7A7A7A',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(230, 57, 70, 0.4)';
                  e.currentTarget.style.color = '#E63946';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2A2A2A';
                  e.currentTarget.style.color = '#7A7A7A';
                }}
              >
                <RotateCcw size={14} />
                Refaire
              </button>
            ) : canAccess ? (
              <div style={{
                color: isHovered ? '#E63946' : '#5A5A5A',
                transition: 'color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px'
              }}>
                Commencer
                <ChevronRight size={18} />
              </div>
            ) : (
              <div style={{
                background: 'rgba(230, 57, 70, 0.1)',
                border: '1px solid rgba(230, 57, 70, 0.2)',
                borderRadius: '8px',
                padding: '8px 14px',
                color: 'rgba(230, 57, 70, 0.8)',
                fontSize: '12px',
                fontWeight: 500
              }}>
                Profil avancé
              </div>
            )}
          </div>
        </div>

        {/* Barre de progression si complété */}
        {completed && completed.percentage > 0 && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #1A1A1A' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ color: '#5A5A5A', fontSize: '12px' }}>Résultat</span>
              <span style={{ color: '#E63946', fontSize: '14px', fontWeight: 600 }}>{completed.percentage}%</span>
            </div>
            <div style={{
              height: '4px',
              background: '#1A1A1A',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${completed.percentage}%`,
                background: '#E63946',
                borderRadius: '2px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      paddingBottom: '120px'
    }}>
      {/* Header minimaliste */}
      <div style={{ padding: '20px 20px 32px' }}>
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
            fontSize: '14px',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#5A5A5A'}
        >
          <ArrowLeft size={18} />
          Retour
        </button>

        <h1 style={{
          color: '#FFFFFF',
          fontSize: '32px',
          fontWeight: 600,
          margin: '24px 0 12px',
          letterSpacing: '-0.02em'
        }}>
          Analyses
        </h1>

        <p style={{
          color: '#5A5A5A',
          fontSize: '15px',
          margin: 0,
          fontWeight: 400
        }}>
          Explore les dimensions de ta personnalité.
        </p>
      </div>

      {/* Section Fondations */}
      {foundationQuizzes.length > 0 && (
        <div style={{ padding: '0 20px', marginBottom: '40px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <h2 style={{
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              margin: 0,
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              Fondations
            </h2>
            <div style={{
              flex: 1,
              height: '1px',
              background: 'linear-gradient(90deg, #1A1A1A, transparent)'
            }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {foundationQuizzes.map(renderQuizCard)}
          </div>
        </div>
      )}

      {/* Section Analyses Approfondies */}
      {advancedQuizzes.length > 0 && (
        <div style={{ padding: '0 20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <h2 style={{
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              margin: 0,
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              Analyses approfondies
            </h2>
            <div style={{
              flex: 1,
              height: '1px',
              background: 'linear-gradient(90deg, #1A1A1A, transparent)'
            }} />
          </div>

          <p style={{
            color: '#3A3A3A',
            fontSize: '13px',
            margin: '0 0 20px 0',
            lineHeight: 1.5
          }}>
            Modélisation avancée par intelligence artificielle.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {advancedQuizzes.map(renderQuizCard)}
          </div>
        </div>
      )}

      {/* Style pour l'animation de spin */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
