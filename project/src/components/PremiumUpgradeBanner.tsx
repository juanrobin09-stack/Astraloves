import { Crown, Sparkles, Lock } from 'lucide-react';

interface PremiumUpgradeBannerProps {
  message: string;
  onUpgrade?: () => void;
}

export default function PremiumUpgradeBanner({ message, onUpgrade }: PremiumUpgradeBannerProps) {
  return (
    <div className="premium-upgrade-banner">
      <style>{`
        .premium-upgrade-banner {
          position: relative;
          background: linear-gradient(135deg,
            rgba(20, 5, 30, 0.95) 0%,
            rgba(40, 10, 50, 0.95) 50%,
            rgba(20, 5, 30, 0.95) 100%
          );
          background-size: 200% 200%;
          border: 2px solid rgba(168, 85, 247, 0.6);
          border-radius: 20px;
          padding: 32px 24px;
          margin-top: 20px;
          overflow: hidden;
          animation: gradient-shift 8s ease infinite;
          box-shadow:
            0 0 30px rgba(147, 51, 234, 0.4),
            0 10px 40px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(168, 85, 247, 0.3);
        }

        .premium-upgrade-banner::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(147, 51, 234, 0.05) 50%,
            transparent 70%
          );
          animation: shine 6s linear infinite;
          pointer-events: none;
        }

        .premium-icon-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
          position: relative;
        }

        .premium-lock {
          animation: lock-pulse 2.5s ease-in-out infinite;
          filter: drop-shadow(0 4px 20px rgba(236, 72, 153, 0.6));
        }

        .premium-content {
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .premium-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #9333EA, #EC4899);
          color: #FFF;
          font-size: 14px;
          font-weight: 700;
          padding: 6px 16px;
          border-radius: 20px;
          margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(147, 51, 234, 0.5);
          animation: float 3s ease-in-out infinite;
        }

        .premium-title {
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(135deg, #A855F7, #EC4899, #9333EA);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 12px;
          text-shadow: 0 0 20px rgba(147, 51, 234, 0.3);
        }

        .premium-subtitle {
          font-size: 15px;
          color: #E5E5E5;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .premium-cta-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #9333EA, #EC4899, #A855F7);
          background-size: 200% 200%;
          color: #FFF;
          font-size: 16px;
          font-weight: 700;
          padding: 14px 32px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow:
            0 4px 15px rgba(147, 51, 234, 0.5),
            0 0 20px rgba(168, 85, 247, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          animation: gradient-shift 3s ease infinite;
          overflow: hidden;
        }

        .premium-cta-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .premium-cta-button:hover {
          transform: scale(1.05) translateY(-2px);
          box-shadow:
            0 6px 25px rgba(147, 51, 234, 0.7),
            0 0 40px rgba(168, 85, 247, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }

        .premium-cta-button:hover::before {
          width: 300px;
          height: 300px;
        }

        .premium-cta-button:active {
          transform: scale(0.98) translateY(0);
        }

        .button-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: button-shine 3s ease-in-out infinite;
        }

        .sparkle-icon {
          animation: sparkle 2s ease-in-out infinite;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes lock-pulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 4px 20px rgba(236, 72, 153, 0.6));
          }
          50% {
            transform: scale(1.08);
            filter: drop-shadow(0 6px 30px rgba(236, 72, 153, 0.9));
          }
        }

        @keyframes shine {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes button-shine {
          0% { left: -100%; }
          50% { left: 150%; }
          100% { left: 150%; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes sparkle {
          0%, 100% {
            transform: rotate(0deg) scale(1);
            opacity: 1;
          }
          25% {
            transform: rotate(-10deg) scale(1.1);
            opacity: 0.8;
          }
          75% {
            transform: rotate(10deg) scale(1.1);
            opacity: 0.8;
          }
        }

        @media (max-width: 640px) {
          .premium-upgrade-banner {
            padding: 24px 16px;
          }

          .premium-title {
            font-size: 20px;
          }

          .premium-subtitle {
            font-size: 14px;
          }

          .premium-cta-button {
            font-size: 15px;
            padding: 12px 24px;
          }
        }
      `}</style>

      <div className="premium-icon-wrapper">
        <Lock
          size={72}
          strokeWidth={2.5}
          color="#EC4899"
          className="premium-lock"
        />
      </div>

      <div className="premium-content">
        <div className="premium-badge">
          <Crown size={16} />
          <span>Premium</span>
        </div>

        <h3 className="premium-title">
          Débloque ton Thème Astral Complet
        </h3>

        <p className="premium-subtitle">
          {message}
        </p>

        {onUpgrade && (
          <button onClick={onUpgrade} className="premium-cta-button">
            <Crown size={20} />
            <span>Débloquer maintenant</span>
            <Sparkles size={18} className="sparkle-icon" />
            <div className="button-shine"></div>
          </button>
        )}
      </div>
    </div>
  );
}
