import { Lock, Sparkles, Crown } from 'lucide-react';
import { PlanTier, PLAN_NAMES, PLAN_PRICES, TIER_FEATURES } from '../config/subscriptionLimits';
import { supabase } from '../lib/supabase';

interface FeatureLockedProps {
  featureName: string;
  requiredTier: PlanTier;
  currentUsage?: number;
  limit?: number;
  onClose?: () => void;
  inline?: boolean;
}

export default function FeatureLocked({
  featureName,
  requiredTier,
  currentUsage,
  limit,
  onClose,
  inline = false,
}: FeatureLockedProps) {
  
  const handleUpgrade = async (tier: PlanTier) => {
    if (tier === 'free') return;

    try {
      const priceId = tier === 'premium'
        ? import.meta.env.VITE_STRIPE_PRICE_PREMIUM
        : import.meta.env.VITE_STRIPE_PRICE_ELITE;

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });

      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      console.error('Erreur Stripe:', err);
      alert('Erreur lors du paiement. Réessayez.');
    }
  };

  const getIcon = () => {
    switch (requiredTier) {
      case 'premium':
        return <Sparkles className="text-red-500" size={24} />;
      case 'premium_elite':
        return <Crown className="text-yellow-500" size={24} />;
      default:
        return <Lock className="text-gray-500" size={24} />;
    }
  };

  const getColor = () => {
    switch (requiredTier) {
      case 'premium':
        return {
          bg: 'rgba(230, 57, 70, 0.1)',
          border: '#E63946',
          text: '#E63946',
        };
      case 'premium_elite':
        return {
          bg: 'rgba(255, 215, 0, 0.1)',
          border: '#FFD700',
          text: '#FFD700',
        };
      default:
        return {
          bg: 'rgba(122, 122, 122, 0.1)',
          border: '#7A7A7A',
          text: '#7A7A7A',
        };
    }
  };

  const colors = getColor();

  // Version inline (petite)
  if (inline) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          cursor: 'pointer',
        }}
        onClick={() => handleUpgrade(requiredTier)}
      >
        {getIcon()}
        <span style={{ color: colors.text, fontSize: '14px', fontWeight: '600' }}>
          {PLAN_NAMES[requiredTier]}
        </span>
      </div>
    );
  }

  // Version modal (complète)
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#0A0A0A',
          border: `2px solid ${colors.border}`,
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              border: 'none',
              color: colors.text,
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px 10px',
            }}
          >
            ✕
          </button>
        )}

        {/* Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          {getIcon()}
        </div>

        {/* Titre */}
        <h2
          style={{
            color: '#FFFFFF',
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '10px',
            textAlign: 'center',
          }}
        >
          {featureName}
        </h2>

        {/* Sous-titre */}
        <p
          style={{
            color: '#7A7A7A',
            fontSize: '15px',
            textAlign: 'center',
            marginBottom: '10px',
          }}
        >
          {currentUsage !== undefined && limit !== undefined ? (
            <>
              Limite atteinte : {currentUsage}/{limit}
            </>
          ) : (
            <>Réservé aux abonnés {PLAN_NAMES[requiredTier]}</>
          )}
        </p>

        {/* Reset info si limite atteinte */}
        {currentUsage !== undefined && limit !== undefined && (
          <p
            style={{
              color: '#4A4A4A',
              fontSize: '13px',
              textAlign: 'center',
              marginBottom: '30px',
            }}
          >
            ⏰ Réinitialisation quotidienne à minuit
          </p>
        )}

        {/* Features du plan */}
        <div
          style={{
            background: '#0D0D0D',
            border: '1px solid #1A1A1A',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <h3
            style={{
              color: colors.text,
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '12px',
            }}
          >
            Avec {PLAN_NAMES[requiredTier]} :
          </h3>
          <ul
            style={{
              color: '#AAAAAA',
              fontSize: '14px',
              margin: 0,
              padding: '0 0 0 20px',
              lineHeight: 1.8,
            }}
          >
            {TIER_FEATURES[requiredTier].slice(0, 6).map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
          </ul>
        </div>

        {/* Bouton upgrade */}
        <button
          onClick={() => handleUpgrade(requiredTier)}
          style={{
            width: '100%',
            padding: '16px',
            background: `linear-gradient(135deg, ${colors.border}, ${colors.text})`,
            border: 'none',
            borderRadius: '16px',
            color: '#000000',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Passer à {PLAN_NAMES[requiredTier]} • {PLAN_PRICES[requiredTier]}
        </button>
      </div>
    </div>
  );
}
