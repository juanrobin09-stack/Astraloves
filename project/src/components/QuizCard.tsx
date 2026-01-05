import { Lock } from 'lucide-react';
import { useQuizAccess } from '../hooks/useQuizAccess';

interface QuizCardProps {
  quiz: {
    id: string;
    emoji: string;
    title: string;
    duration: string;
    questions: number;
    description: string;
    tier: 'free' | 'premium' | 'premium_elite';
    badge: string;
    recommended?: boolean;
    availableIn?: string | null;
  };
  completed?: any;
  canAccess?: boolean;
  progress?: number;
  onNavigate: (page: string, data?: any) => void;
}

export default function QuizCard({ quiz, completed, canAccess: propCanAccess, progress = 0, onNavigate }: QuizCardProps) {
  const { checkAccess, getLockedReason, getBadge } = useQuizAccess();

  const canAccess = propCanAccess !== undefined ? propCanAccess : checkAccess(quiz.id);
  const isCompleted = !!completed;
  const lockReason = getLockedReason(quiz.id);
  const badge = getBadge(quiz.id, isCompleted);

  const handleStartQuiz = () => {
    if (!canAccess) {
      onNavigate('subscriptions');
      return;
    }
    onNavigate('quiz-test', { quizId: quiz.id });
  };

  const handleRetakeQuiz = () => {
    onNavigate('quiz-test', { quizId: quiz.id });
  };

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        background: canAccess
          ? 'linear-gradient(135deg, #1A1A1A 0%, #121212 100%)'
          : 'linear-gradient(135deg, rgba(26, 26, 26, 0.5) 0%, rgba(18, 18, 18, 0.3) 100%)',
        border: `1px solid ${
          canAccess
            ? completed
              ? 'rgba(230, 57, 70, 0.3)'
              : quiz.tier === 'premium' || quiz.tier === 'premium_elite'
              ? 'rgba(255, 215, 0, 0.2)'
              : 'rgba(230, 57, 70, 0.15)'
            : 'rgba(107, 107, 107, 0.3)'
        }`,
        transition: 'all 0.3s ease',
        width: '100%',
        maxWidth: '100%'
      }}
    >
      {/* Top Indicator */}
      {completed && canAccess && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #E63946, #C1121F)'
        }} />
      )}

      {!canAccess && (quiz.tier === 'premium' || quiz.tier === 'premium_elite') && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #FFD700, #E63946, #FFD700)'
        }} />
      )}

      {/* Recommended Badge */}
      {quiz.recommended && canAccess && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          zIndex: 10
        }}>
          <div style={{
            background: 'linear-gradient(90deg, #FFD700, #FFA500)',
            padding: '4px 12px',
            borderRadius: '20px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)'
          }}>
            <span style={{
              color: '#000',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>
              ⭐ RECOMMANDÉ
            </span>
          </div>
        </div>
      )}

      <div className="p-3 sm:p-4">
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: '12px',
          width: '100%'
        }}>
          {/* Emoji */}
          <div className="text-3xl sm:text-4xl flex-shrink-0" style={{
            opacity: canAccess ? 1 : 0.5
          }}>
            {quiz.emoji}
          </div>

          {/* Content */}
          <div style={{
            flex: 1,
            minWidth: 0,
            width: '100%'
          }}>
            {/* Title and Badges */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <h3 className="text-sm sm:text-base font-bold text-white m-0 break-words truncate">
                {quiz.title}
              </h3>

              {badge && (
                <span className="py-0.5 px-2 sm:px-2.5 rounded-full text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap flex-shrink-0" style={{
                  background:
                    badge.type === 'completed'
                      ? 'rgba(34, 197, 94, 0.2)'
                      : badge.type === 'included-premium'
                      ? 'rgba(230, 57, 70, 0.2)'
                      : badge.type === 'included-elite'
                      ? 'rgba(255, 215, 0, 0.2)'
                      : 'rgba(107, 107, 107, 0.2)',
                  border: `1px solid ${
                    badge.type === 'completed'
                      ? 'rgba(34, 197, 94, 0.3)'
                      : badge.type === 'included-premium'
                      ? 'rgba(230, 57, 70, 0.3)'
                      : badge.type === 'included-elite'
                      ? 'rgba(255, 215, 0, 0.3)'
                      : 'rgba(107, 107, 107, 0.3)'
                  }`,
                  color:
                    badge.type === 'completed'
                      ? '#22C55E'
                      : badge.type === 'included-premium'
                      ? '#FF6B6B'
                      : badge.type === 'included-elite'
                      ? '#FFD700'
                      : '#A0A0A0'
                }}>
                  {badge.text}
                </span>
              )}

              {!badge && quiz.badge === 'GRATUIT' && (
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  background: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  color: '#22C55E',
                  whiteSpace: 'nowrap'
                }}>
                  🎁 GRATUIT
                </span>
              )}
            </div>

            {/* Meta Info */}
            <p className="text-gray-400 text-[10px] sm:text-xs mb-2 m-0">
              {quiz.duration} • {quiz.questions} questions
            </p>

            {/* Description */}
            <p className="text-gray-400 text-[11px] sm:text-xs leading-relaxed m-0 break-words line-clamp-2">
              {quiz.description}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {completed && progress > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px'
            }}>
              <span style={{
                color: '#A0A0A0',
                fontSize: '11px'
              }}>
                Votre profil :
              </span>
              <span style={{
                color: '#E63946',
                fontSize: '13px',
                fontWeight: 700
              }}>
                {progress}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              background: '#242424',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #E63946, #C1121F)',
                borderRadius: '10px',
                transition: 'width 1s ease'
              }} />
            </div>
          </div>
        )}

        {/* Available In Notice */}
        {quiz.availableIn && !completed && canAccess && (
          <div style={{
            marginBottom: '12px',
            background: 'rgba(249, 115, 22, 0.1)',
            border: '1px solid rgba(249, 115, 22, 0.3)',
            borderRadius: '12px',
            padding: '10px 12px'
          }}>
            <p style={{
              color: '#FB923C',
              fontSize: '13px',
              margin: 0
            }}>
              ⏰ Disponible dans {quiz.availableIn}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {completed ? (
          <div>
            <p style={{
              color: '#A0A0A0',
              fontSize: '13px',
              textAlign: 'center',
              marginBottom: '12px'
            }}>
              Consultez vos résultats dans <span style={{ color: '#E63946', fontWeight: 600 }}>Mes Résultats</span>
            </p>
            <button
              onClick={handleRetakeQuiz}
              className="w-full py-2.5 sm:py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm text-gray-400 bg-transparent border-2 border-gray-600 cursor-pointer transition-all min-h-[44px]"
              style={{}}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(230, 57, 70, 0.5)';
                e.currentTarget.style.background = 'rgba(230, 57, 70, 0.1)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#6B6B6B';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#A0A0A0';
              }}
            >
              🔄 Refaire le test
            </button>
          </div>
        ) : (
          <button
            onClick={handleStartQuiz}
            disabled={!!quiz.availableIn}
            className="w-full py-3 sm:py-3.5 px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all min-h-[44px] flex items-center justify-center gap-2"
            style={{
              color: !canAccess || quiz.availableIn ? '#6B6B6B' : '#fff',
              background: !canAccess
                ? '#242424'
                : quiz.availableIn
                ? 'rgba(36, 36, 36, 0.5)'
                : 'linear-gradient(135deg, #E63946, #C1121F)',
              border: !canAccess ? '1px solid #6B6B6B' : 'none',
              cursor: quiz.availableIn ? 'not-allowed' : 'pointer',
              boxShadow: !canAccess || quiz.availableIn ? 'none' : '0 4px 15px rgba(230, 57, 70, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (canAccess && !quiz.availableIn) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #FF6B6B, #E63946)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(230, 57, 70, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (canAccess && !quiz.availableIn) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #E63946, #C1121F)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(230, 57, 70, 0.3)';
              }
            }}
          >
            {!canAccess ? (
              <>
                <Lock size={16} />
                <span>{lockReason || `Débloque avec ${quiz.badge}`}</span>
              </>
            ) : quiz.availableIn ? (
              <>⏰ Bientôt disponible</>
            ) : (
              <>▶️ Commencer le questionnaire</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
