import { useState } from 'react';
import { Sparkles, Flame, Shield, Crown, Star, TrendingUp, Circle } from 'lucide-react';

interface QuizResultsProps {
  quizId: string;
  result: any;
  onClose: () => void;
  onRetake: () => void;
}

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
      icon: <Flame className="w-6 h-6" />,
      color: '#E63946',
      bgColor: 'rgba(230, 57, 70, 0.1)',
      borderColor: '#E63946',
      description: 'Intensité forte'
    };
  } else if (percentage >= 40) {
    return {
      level: 'Modéré',
      icon: <TrendingUp className="w-6 h-6" />,
      color: '#F77F00',
      bgColor: 'rgba(247, 127, 0, 0.1)',
      borderColor: '#F77F00',
      description: 'Équilibre naturel'
    };
  } else {
    return {
      level: 'Léger',
      icon: <Circle className="w-6 h-6" />,
      color: '#06B6D4',
      bgColor: 'rgba(6, 182, 212, 0.1)',
      borderColor: '#06B6D4',
      description: 'Approche douce'
    };
  }
};

function ProfileBadge({ percentage }: { percentage: number }) {
  const profileLevel = getProfileLevel(percentage);

  return (
    <div
      className="profile-badge-container"
      style={{
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        margin: '24px 0'
      }}
    >
      <div
        className="profile-badge"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          padding: '24px 40px',
          borderRadius: '20px',
          backgroundColor: profileLevel.bgColor,
          border: `2px solid ${profileLevel.borderColor}`,
          boxShadow: `0 8px 32px ${profileLevel.bgColor}`,
          transition: 'all 0.3s ease',
          animation: 'fadeInScale 0.6s ease-out'
        }}
      >
        <div style={{ color: profileLevel.color, animation: 'pulse 2s ease-in-out infinite' }}>
          {profileLevel.icon}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: profileLevel.color,
              marginBottom: '4px',
              letterSpacing: '0.5px'
            }}
          >
            {profileLevel.level}
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#9CA3AF',
              fontWeight: '500'
            }}
          >
            {profileLevel.description}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuizResults({ quizId, result, onClose, onRetake }: QuizResultsProps) {
  console.log('[QuizResults] Props reçues:', { quizId, result });
  console.log('[QuizResults] Type de résultat:', typeof result);
  console.log('[QuizResults] Clés du résultat:', Object.keys(result || {}));

  if (!result) {
    return (
      <div className="quiz-results-loading">
        <div className="loading-stars">
          <span>✨</span>
          <span>⭐</span>
          <span>🌟</span>
        </div>
        <p>Analyse en cours...</p>
      </div>
    );
  }

  // Afficher le bon template selon le quiz
  switch (quizId) {
    case 'first-impression':
      return <FirstImpressionResults result={result} onClose={onClose} onRetake={onRetake} />;
    case 'astral':
      return <AstralResults result={result} onClose={onClose} onRetake={onRetake} />;
    case 'attachment':
      return <AttachmentResults result={result} onClose={onClose} onRetake={onRetake} />;
    case 'archetype':
      return <ArchetypeResults result={result} onClose={onClose} onRetake={onRetake} />;
    default:
      return <GenericResults result={result} onClose={onClose} onRetake={onRetake} />;
  }
}

// ============ PREMIÈRE IMPRESSION ============
function FirstImpressionResults({ result, onClose, onRetake }: { result: any; onClose: () => void; onRetake: () => void }) {
  return (
    <div className="quiz-results first-impression">
      <div className="results-header">
        <div className="results-icon pulse">👁️</div>
        <h1>{result.title || "Ton Impact"}</h1>
        <p className="results-subtitle">{result.subtitle || "Comment les autres te perçoivent"}</p>
      </div>

      <ProfileBadge percentage={result.percentage || 75} />

      <div className="results-card main">
        <p className="results-description">{result.description}</p>
      </div>

      {result.strengths && (
        <div className="results-card">
          <h3>💪 Tes points forts</h3>
          <div className="traits-list">
            {result.strengths.map((strength: string, i: number) => (
              <span key={i} className="trait-tag strength">{strength}</span>
            ))}
          </div>
        </div>
      )}

      {result.advice && (
        <div className="results-card advice">
          <h3>💡 Conseil d'Astra</h3>
          <p>{result.advice}</p>
        </div>
      )}

      {result.compatibility && (
        <div className="results-card">
          <h3>💕 Compatibilité</h3>
          <p>{result.compatibility}</p>
        </div>
      )}

      <div className="results-actions">
        <button className="btn-primary" onClick={onClose}>
          Continuer à explorer ✨
        </button>
        <button className="btn-secondary" onClick={onRetake}>
          Refaire le quiz
        </button>
      </div>
    </div>
  );
}

// ============ THÈME ASTRAL ============
function AstralResults({ result, onClose, onRetake }: { result: any; onClose: () => void; onRetake: () => void }) {
  return (
    <div className="quiz-results astral">
      <div className="results-header astral-bg">
        <div className="results-icon cosmic">{result.elementEmoji || "🔥"}</div>
        <h1>{result.title || "Ton Élément"}</h1>
        <p className="results-subtitle">{result.subtitle || "Ta signature cosmique"}</p>
      </div>

      <div className="element-showcase">
        <div className="element-circle">
          <span className="element-emoji">{result.elementEmoji || "🔥"}</span>
        </div>
        <h2>{result.element || "Feu"}</h2>
        <p className="element-signs">{result.signs || "Bélier • Lion • Sagittaire"}</p>
      </div>

      <div className="results-card main">
        <p>{result.description}</p>
      </div>

      {result.traits && (
        <div className="results-card">
          <h3>⭐ Tes traits cosmiques</h3>
          <div className="traits-list">
            {result.traits.map((trait: string, i: number) => (
              <span key={i} className="trait-tag cosmic">{trait}</span>
            ))}
          </div>
        </div>
      )}

      {result.inLove && (
        <div className="results-card love">
          <h3>💕 En amour</h3>
          <p>{result.inLove}</p>
        </div>
      )}

      {result.compatibility && (
        <div className="results-card">
          <h3>🔮 Compatibilité</h3>
          <p>{result.compatibility}</p>
        </div>
      )}

      {result.advice && (
        <div className="results-card advice">
          <h3>🌟 Message des étoiles</h3>
          <p>{result.advice}</p>
        </div>
      )}

      <div className="results-actions">
        <button className="btn-primary" onClick={onClose}>
          Explorer mon thème ✨
        </button>
        <button className="btn-secondary" onClick={onRetake}>
          Refaire le quiz
        </button>
      </div>
    </div>
  );
}

// ============ STYLE D'ATTACHEMENT ============
function AttachmentResults({ result, onClose, onRetake }: { result: any; onClose: () => void; onRetake: () => void }) {
  return (
    <div className="quiz-results attachment">
      <div className="results-header">
        <div className="results-icon">{result.icon || "💗"}</div>
        <h1>{result.title || "Ton Style"}</h1>
        <p className="results-subtitle">{result.subtitle || "Comment tu aimes"}</p>
      </div>

      <ProfileBadge percentage={result.percentage || 75} />

      {result.pattern && (
        <div className="results-card">
          <h3>🔄 Ton pattern relationnel</h3>
          <p>{result.pattern}</p>
        </div>
      )}

      <div className="results-card main">
        <p>{result.description}</p>
      </div>

      {result.strengths && (
        <div className="results-card">
          <h3>💪 Tes forces</h3>
          <div className="traits-list">
            {result.strengths.map((s: string, i: number) => (
              <span key={i} className="trait-tag strength">{s}</span>
            ))}
          </div>
        </div>
      )}

      {result.challenges && (
        <div className="results-card">
          <h3>⚡ Tes défis</h3>
          <div className="traits-list">
            {result.challenges.map((c: string, i: number) => (
              <span key={i} className="trait-tag challenge">{c}</span>
            ))}
          </div>
        </div>
      )}

      {result.idealPartner && (
        <div className="results-card love">
          <h3>💕 Ton/Ta partenaire idéal(e)</h3>
          <p>{result.idealPartner}</p>
        </div>
      )}

      {result.advice && (
        <div className="results-card advice">
          <h3>💡 Pour évoluer</h3>
          <p>{result.advice}</p>
        </div>
      )}

      <div className="results-actions">
        <button className="btn-primary" onClick={onClose}>
          Comprendre mes matchs 💕
        </button>
        <button className="btn-secondary" onClick={onRetake}>
          Refaire le quiz
        </button>
      </div>
    </div>
  );
}

// ============ ARCHÉTYPE AMOUREUX ============
function ArchetypeResults({ result, onClose, onRetake }: { result: any; onClose: () => void; onRetake: () => void }) {
  return (
    <div className="quiz-results archetype">
      <div className="results-header archetype-bg">
        <div className="results-icon crown">{result.icon || "👑"}</div>
        <h1>{result.title || "Ton Archétype"}</h1>
        <p className="results-subtitle">{result.subtitle || "Ta personnalité profonde"}</p>
      </div>

      <div className="archetype-showcase">
        <div className="archetype-emblem">
          <span>{result.icon || "👑"}</span>
        </div>
        <h2>{result.archetype || "Le Roi"}</h2>
      </div>

      <div className="results-card main">
        <p>{result.description}</p>
      </div>

      {result.loveStyle && (
        <div className="results-card">
          <h3>💕 Ton style amoureux</h3>
          <p>{result.loveStyle}</p>
        </div>
      )}

      {result.attracts && (
        <div className="results-card">
          <h3>🧲 Tu attires</h3>
          <p>{result.attracts}</p>
        </div>
      )}

      {result.shadow && (
        <div className="results-card shadow">
          <h3>🌑 Ton ombre</h3>
          <p>{result.shadow}</p>
        </div>
      )}

      {result.growth && (
        <div className="results-card advice">
          <h3>🌱 Pour grandir</h3>
          <p>{result.growth}</p>
        </div>
      )}

      <div className="results-actions">
        <button className="btn-primary" onClick={onClose}>
          Trouver mon match 👑
        </button>
        <button className="btn-secondary" onClick={onRetake}>
          Refaire le quiz
        </button>
      </div>
    </div>
  );
}

// ============ RÉSULTATS GÉNÉRIQUES (fallback) ============
function GenericResults({ result, onClose, onRetake }: { result: any; onClose: () => void; onRetake: () => void }) {
  return (
    <div className="quiz-results generic">
      <div className="results-header">
        <div className="results-icon">✨</div>
        <h1>{result.title || "Ton Résultat"}</h1>
        <p className="results-subtitle">{result.subtitle || "Analyse complétée"}</p>
      </div>

      <ProfileBadge percentage={result.percentage || 75} />

      <div className="results-card main">
        <p>{result.description || "Ton profil unique a été analysé avec succès."}</p>
      </div>

      {result.advice && (
        <div className="results-card advice">
          <h3>💡 Conseil</h3>
          <p>{result.advice}</p>
        </div>
      )}

      <div className="results-actions">
        <button className="btn-primary" onClick={onClose}>Continuer</button>
        <button className="btn-secondary" onClick={onRetake}>Refaire</button>
      </div>
    </div>
  );
}
