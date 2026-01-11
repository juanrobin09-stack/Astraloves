// ═══════════════════════════════════════════════════════════════════════
// GUARDIAN CARD - Alertes Guardian + patterns historiques (ELITE)
// ═══════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { GuardianAlert, DetectedPattern, Tier } from '../../../types/astro-v2';
import UpgradePrompt from '../shared/UpgradePrompt';

interface GuardianCardProps {
  alerts: GuardianAlert[];
  patterns: DetectedPattern[];
  tier: Tier;
  onUpgrade: () => void;
  onActivateSilenceActif?: () => void;
}

export default function GuardianCard({
  alerts,
  patterns,
  tier,
  onUpgrade,
  onActivateSilenceActif
}: GuardianCardProps) {
  const [activeTab, setActiveTab] = useState<'alerts' | 'patterns'>('alerts');

  if (tier !== 'elite') {
    return (
      <div className="relative bg-zinc-900 border border-red-900/30 rounded-xl p-5 min-h-[400px]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🛡️</span>
          <h3 className="text-xl font-bold text-white">
            Guardian Astrologique
          </h3>
        </div>

        {/* Locked overlay */}
        <UpgradePrompt
          targetTier="elite"
          message="Guardian veille et détecte les répétitions karmiques, périodes à risque et patterns d'évitement. Il peut recommander Silence Actif."
          onUpgrade={onUpgrade}
        />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes guardianPulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.3),
                        0 0 40px rgba(239, 68, 68, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.6),
                        0 0 60px rgba(239, 68, 68, 0.4);
          }
        }

        @keyframes shieldPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      <div
        className="bg-gradient-to-br from-red-950/40 to-black border-2 border-red-500/70 rounded-xl p-5"
        style={{ 
          animation: 'slideUpFade 0.6s ease-out 0.8s backwards, guardianPulse 3s ease-in-out infinite' 
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span 
            className="text-2xl"
            style={{ animation: 'shieldPulse 2s ease-in-out infinite' }}
          >
            🛡️
          </span>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">
              Guardian Astrologique
            </h3>
            <p className="text-xs text-red-400 font-semibold">
              ⚡ ACTIF
            </p>
          </div>
          <div className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 rounded-full">
            <span className="text-xs font-bold text-white">👑 ELITE</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`
              flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all
              ${activeTab === 'alerts'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30'
                : 'bg-black/40 text-zinc-400 hover:text-white'}
            `}
          >
            Alertes ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('patterns')}
            className={`
              flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all
              ${activeTab === 'patterns'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30'
                : 'bg-black/40 text-zinc-400 hover:text-white'}
            `}
          >
            Patterns ({patterns.length})
          </button>
        </div>

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onActivateSilenceActif={onActivateSilenceActif}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">✨</div>
                <p className="text-sm text-zinc-400 mb-2">
                  Aucune alerte active
                </p>
                <p className="text-xs text-zinc-500">
                  Guardian veille. Il t'alertera si un pattern se répète.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Patterns Tab */}
        {activeTab === 'patterns' && (
          <div className="space-y-3">
            {patterns.length > 0 ? (
              patterns.map((pattern, i) => (
                <PatternCard key={i} pattern={pattern} />
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-sm text-zinc-400 mb-2">
                  Patterns en construction
                </p>
                <p className="text-xs text-zinc-500">
                  Guardian analyse tes cycles. Reviens dans quelques semaines.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Guardian settings */}
        <div className="mt-6 pt-4 border-t border-red-900/30">
          <h4 className="text-xs font-semibold text-red-400 mb-3">
            Paramètres Guardian
          </h4>

          <div className="space-y-2">
            <ToggleSetting
              label="Alertes répétitions karmiques"
              enabled={true}
            />
            <ToggleSetting
              label="Périodes sensibles"
              enabled={true}
            />
            <ToggleSetting
              label="Silence Actif automatique (avancé)"
              enabled={false}
            />
          </div>
        </div>
      </div>
    </>
  );
}

// Alert Card component
function AlertCard({
  alert,
  onActivateSilenceActif
}: {
  alert: GuardianAlert;
  onActivateSilenceActif?: () => void;
}) {
  const levelConfig = {
    low: {
      border: 'border-red-700/30',
      bg: 'bg-red-950/20',
      icon: '⚠️',
    },
    medium: {
      border: 'border-red-600/50',
      bg: 'bg-red-950/30',
      icon: '⚠️',
    },
    high: {
      border: 'border-red-500/70',
      bg: 'bg-red-950/40',
      icon: '🚨',
    },
  };

  const config = levelConfig[alert.level];

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-4`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-xl">{config.icon}</span>
        <div className="flex-1">
          <h5 className="text-sm font-bold text-white mb-1">
            {alert.title}
          </h5>
          <p className="text-xs text-zinc-500">
            {alert.type === 'karmic_repetition' && 'Répétition karmique'}
            {alert.type === 'sensitive_period' && 'Période sensible'}
            {alert.type === 'pattern_warning' && 'Pattern détecté'}
          </p>
        </div>
      </div>

      {/* Message */}
      <p className="text-xs text-zinc-300 leading-relaxed mb-3 whitespace-pre-line">
        {alert.message}
      </p>

      {/* Recommendation */}
      {alert.recommendation && (
        <div className="bg-black/40 border border-red-900/30 rounded p-3 mb-3">
          <p className="text-xs font-semibold text-red-400 mb-2">
            Guardian recommande:
          </p>
          <p className="text-xs text-white">
            {alert.recommendation.action === 'silence_actif' && '🔕 Silence Actif'}
            {alert.recommendation.action === 'wait' && '⏸️ Attends'}
            {alert.recommendation.action === 'clarify' && '💬 Clarifie'}
            {alert.recommendation.action === 'pause' && '🛑 Pause'}
          </p>
          {alert.recommendation.until && (
            <p className="text-xs text-zinc-500 mt-1">
              Jusqu'au {new Date(alert.recommendation.until).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      {alert.recommendation?.action === 'silence_actif' && onActivateSilenceActif && (
        <button
          onClick={onActivateSilenceActif}
          className="w-full py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-semibold rounded-lg transition-all"
        >
          Activer Silence Actif
        </button>
      )}
    </div>
  );
}

// Pattern Card component
function PatternCard({ pattern }: { pattern: DetectedPattern }) {
  return (
    <div className="bg-black/40 border border-red-900/20 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <h5 className="text-sm font-bold text-white">
          {pattern.name}
        </h5>
        <div className="text-xs text-red-400 font-semibold">
          {pattern.frequency}x
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <span className="text-zinc-500">Dernière occurrence:</span>
          <span className="text-white ml-2">
            {new Date(pattern.lastOccurrence).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long'
            })}
          </span>
        </div>

        <div>
          <span className="text-zinc-500">Corrélation:</span>
          <p className="text-zinc-300 mt-1">{pattern.astrological}</p>
        </div>

        {pattern.nextRisk && (
          <div className="pt-2 border-t border-red-900/20">
            <span className="text-red-400 font-semibold">Prochain risque:</span>
            <span className="text-white ml-2">
              {new Date(pattern.nextRisk).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long'
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Toggle Setting component
function ToggleSetting({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs text-zinc-300">{label}</span>
      <div
        className={`
          w-10 h-5 rounded-full transition-colors
          ${enabled ? 'bg-red-600' : 'bg-zinc-700'}
          relative cursor-pointer
        `}
      >
        <div
          className={`
            absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform
            ${enabled ? 'left-5' : 'left-0.5'}
          `}
        />
      </div>
    </div>
  );
}
