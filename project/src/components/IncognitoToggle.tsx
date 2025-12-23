import { useState } from 'react';
import { EyeOff, Eye, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PremiumUpgradeModal from './PremiumUpgradeModal';

interface IncognitoToggleProps {
  userId: string;
  premiumTier?: 'free' | 'premium' | 'premium_elite' | null;
  isIncognito: boolean;
  onToggle?: (newState: boolean) => void;
  onNavigate?: (page: string) => void;
  className?: string;
}

export default function IncognitoToggle({
  userId,
  premiumTier,
  isIncognito,
  onToggle,
  onNavigate,
  className = ''
}: IncognitoToggleProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const isElite = premiumTier === 'premium_elite';

  const handleToggle = async () => {
    if (!isElite) {
      setShowUpgradeModal(true);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('astra_profiles')
        .update({ incognito_mode: !isIncognito })
        .eq('id', userId);

      if (!error) {
        onToggle?.(!isIncognito);
      }
    } catch (error) {
      console.error('Error toggling incognito:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`
          relative inline-flex items-center gap-3 px-4 py-3 rounded-xl
          ${isElite && isIncognito
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
            : isElite
            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
          }
          font-medium shadow-lg transition-all duration-200
          ${isElite ? 'hover:scale-105 active:scale-95' : ''}
          ${className}
        `}
        title={isElite ? 'Mode Incognito Elite' : 'Fonctionnalité réservée aux Elite'}
      >
        {isIncognito ? <EyeOff size={20} /> : <Eye size={20} />}
        <div className="flex flex-col items-start">
          <span className="text-sm font-bold">
            Mode Incognito
            {!isElite && <Crown size={14} className="inline ml-1 text-yellow-500" />}
          </span>
          <span className="text-xs opacity-80">
            {isElite
              ? isIncognito
                ? 'Activé - Tu es invisible'
                : 'Désactivé - Visible par tous'
              : 'Elite uniquement'}
          </span>
        </div>
      </button>

      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Mode Incognito Elite 🕶️"
        message="Le mode incognito est une fonctionnalité exclusive Elite !"
        feature="Navigue de manière invisible et contrôle qui voit ton profil"
        onUpgrade={() => {
          if (onNavigate) {
            onNavigate('subscription');
          } else {
            window.location.href = '/subscription';
          }
        }}
      />
    </>
  );
}
