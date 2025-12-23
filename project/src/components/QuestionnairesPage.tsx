import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { useQuizAccess } from '../hooks/useQuizAccess';
import { getUserQuizResults } from '../lib/quizResultsService';
import QuizCard from './QuizCard';
import QuizTestPage from './QuizTestPage';
import QuizResultsPage from './QuizResultsPage';

type QuestionnairesPageProps = {
  onBack: () => void;
  onNavigate?: (page: string, data?: any) => void;
};

export default function QuestionnairesPage({ onBack, onNavigate }: QuestionnairesPageProps) {
  const { user } = useAuth();
  const { tier, loading: premiumLoading } = usePremiumStatus();
  const { categorizedQuizzes } = useQuizAccess();
  const [completedQuizzes, setCompletedQuizzes] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'list' | 'test' | 'results'>('list');
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);

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
      if (onNavigate) {
        onNavigate('subscriptions');
      }
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
        onComplete={() => {
          setActiveView('results');
        }}
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
        background: 'linear-gradient(180deg, #0F1419 0%, #1A1A2E 100%)',
        paddingBottom: '96px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            width: '48px',
            height: '48px',
            border: '4px solid #E63946',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }} />
          <p style={{ color: '#fff', fontSize: '14px' }}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      paddingBottom: '96px',
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid rgba(230, 57, 70, 0.1)',
        width: '100%',
        maxWidth: '100%'
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#A0A0A0',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '16px',
            padding: '8px',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#A0A0A0'}
        >
          <ArrowLeft size={20} />
          <span style={{ fontSize: '14px' }}>Retour</span>
        </button>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 900,
          marginBottom: '8px',
          color: '#fff',
          wordWrap: 'break-word',
          overflowWrap: 'break-word'
        }}>
          📋 Questionnaires
        </h1>

        <p style={{
          color: '#A0A0A0',
          fontSize: '14px'
        }}>
          Découvre-toi et améliore ton profil
        </p>
      </div>

      {/* Questionnaires Gratuits */}
      {categorizedQuizzes.free.quizzes.length > 0 && (
        <div style={{
          padding: '16px',
          width: '100%',
          maxWidth: '100%'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{
              color: '#fff',
              fontSize: '18px',
              fontWeight: 700,
              marginBottom: '8px'
            }}>
              {categorizedQuizzes.free.icon} {categorizedQuizzes.free.title}
            </h2>
            <p style={{
              color: '#A0A0A0',
              fontSize: '13px'
            }}>
              {categorizedQuizzes.free.subtitle}
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {categorizedQuizzes.free.quizzes.map(quiz => {
              const completed = completedQuizzes.find(q => q.quiz_id === quiz.id);
              const progress = completed?.percentage || 0;

              return (
                <QuizCard
                  key={quiz.id}
                  quiz={{
                    id: quiz.id,
                    emoji: quiz.emoji,
                    title: quiz.name,
                    duration: quiz.duration,
                    questions: quiz.questions_count,
                    description: quiz.description,
                    tier: 'free',
                    badge: 'GRATUIT'
                  }}
                  completed={completed}
                  progress={progress}
                  canAccess={!quiz.is_locked}
                  onNavigate={handleNavigate}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Questionnaires Premium */}
      {categorizedQuizzes.premium.quizzes.length > 0 && (
        <div style={{
          padding: '16px',
          width: '100%',
          maxWidth: '100%'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{
              color: '#fff',
              fontSize: '18px',
              fontWeight: 700,
              marginBottom: '8px'
            }}>
              {categorizedQuizzes.premium.icon} {categorizedQuizzes.premium.title}
            </h2>
            <p style={{
              color: '#A0A0A0',
              fontSize: '13px'
            }}>
              {categorizedQuizzes.premium.subtitle}
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {categorizedQuizzes.premium.quizzes.map(quiz => {
              const completed = completedQuizzes.find(q => q.quiz_id === quiz.id);

              return (
                <QuizCard
                  key={quiz.id}
                  quiz={{
                    id: quiz.id,
                    emoji: quiz.emoji,
                    title: quiz.name,
                    duration: quiz.duration,
                    questions: quiz.questions_count,
                    description: quiz.description,
                    tier: 'premium',
                    badge: 'PREMIUM'
                  }}
                  completed={completed}
                  canAccess={!quiz.is_locked}
                  onNavigate={handleNavigate}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Questionnaires Elite */}
      {categorizedQuizzes.elite.quizzes.length > 0 && (
        <div style={{
          padding: '16px',
          width: '100%',
          maxWidth: '100%'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{
              color: '#fff',
              fontSize: '18px',
              fontWeight: 700,
              marginBottom: '8px'
            }}>
              {categorizedQuizzes.elite.icon} {categorizedQuizzes.elite.title}
            </h2>
            <p style={{
              color: '#A0A0A0',
              fontSize: '13px'
            }}>
              {categorizedQuizzes.elite.subtitle}
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {categorizedQuizzes.elite.quizzes.map(quiz => {
              const completed = completedQuizzes.find(q => q.quiz_id === quiz.id);

              return (
                <QuizCard
                  key={quiz.id}
                  quiz={{
                    id: quiz.id,
                    emoji: quiz.emoji,
                    title: quiz.name,
                    duration: quiz.duration,
                    questions: quiz.questions_count,
                    description: quiz.description,
                    tier: 'premium_elite',
                    badge: 'PREMIUM+'
                  }}
                  completed={completed}
                  canAccess={!quiz.is_locked}
                  onNavigate={handleNavigate}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
