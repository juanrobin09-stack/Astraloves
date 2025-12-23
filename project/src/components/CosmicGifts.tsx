import { useState, useEffect } from 'react';
import { Lock, Crown, Star, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { processGiftTransaction } from '../lib/giftTransactions';

interface CosmicGiftsProps {
  targetUserId?: string;
  onGiftSent?: (gift: CosmicGift) => void;
}

interface CosmicGift {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  tier: 'free' | 'premium' | 'elite';
  animation: string;
  description?: string;
}

const COSMIC_GIFTS: CosmicGift[] = [
  // GRATUIT - Pour tous
  { id: 'crescent', name: 'Croissant de Lune', emoji: '🌙', cost: 10, tier: 'free', animation: 'float' },
  { id: 'zodiac', name: 'Symbole Zodiaque', emoji: '♎', cost: 25, tier: 'free', animation: 'spin' },
  { id: 'shooting-star', name: 'Étoile Filante', emoji: '⭐', cost: 50, tier: 'free', animation: 'shoot' },
  { id: 'crystal', name: 'Boule de Cristal', emoji: '🔮', cost: 100, tier: 'free', animation: 'glow' },
  { id: 'constellation', name: 'Constellation', emoji: '🌟', cost: 200, tier: 'free', animation: 'twinkle' },
  { id: 'comet', name: 'Comète', emoji: '💫', cost: 250, tier: 'free', animation: 'trail' },

  // PREMIUM
  { id: 'full-moon', name: 'Pleine Lune', emoji: '🌕', cost: 500, tier: 'premium', animation: 'pulse-big' },
  { id: 'saturn', name: 'Saturne', emoji: '🪐', cost: 750, tier: 'premium', animation: 'orbit' },
  { id: 'star-rain', name: 'Pluie d\'Étoiles', emoji: '🌠', cost: 1000, tier: 'premium', animation: 'rain' },
  { id: 'meteorite', name: 'Météorite', emoji: '☄️', cost: 1500, tier: 'premium', animation: 'impact' },

  // ELITE
  { id: 'galaxy', name: 'Voie Lactée', emoji: '🌌', cost: 2500, tier: 'elite', animation: 'spiral', description: 'Écran complet 10 sec' },
  { id: 'solar-system', name: 'Système Solaire', emoji: '💎', cost: 5000, tier: 'elite', animation: '3d-rotate', description: 'Planètes 3D animées' },
  { id: 'supernova', name: 'Supernova', emoji: '✨', cost: 10000, tier: 'elite', animation: 'explode', description: 'Explosion cosmique' },
  { id: 'aurora', name: 'Aurore Boréale', emoji: '🌠', cost: 15000, tier: 'elite', animation: 'wave', description: 'Effet magique complet' },
  { id: 'portal', name: 'Portail Astral', emoji: '🔮', cost: 25000, tier: 'elite', animation: 'portal', description: 'Téléportation cosmique' },
];

export default function CosmicGifts({ targetUserId, onGiftSent }: CosmicGiftsProps) {
  const { user } = useAuth();
  const { isPremium, premiumTier } = usePremiumStatus();
  const [balance, setBalance] = useState(0);
  const [sending, setSending] = useState<string | null>(null);

  const isPremiumPlus = premiumTier === 'premium+elite';
  const canAccessPremiumGifts = isPremium;
  const canAccessEliteGifts = isPremiumPlus;

  useEffect(() => {
    loadBalance();
  }, [user]);

  const loadBalance = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('astra_profiles')
        .select('stars_balance')
        .eq('id', user.id)
        .maybeSingle();

      setBalance(data?.stars_balance || 0);
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const handleSendGift = async (gift: CosmicGift) => {
    if (!user || sending || balance < gift.cost) return;

    if (gift.tier === 'premium' && !canAccessPremiumGifts) {
      alert('🔒 Cadeaux Premium réservés aux membres Premium');
      return;
    }

    if (gift.tier === 'elite' && !canAccessEliteGifts) {
      alert('🔒 Cadeaux Elite réservés aux membres Premium+ Elite');
      return;
    }

    setSending(gift.id);

    try {
      if (!targetUserId) {
        alert('Erreur : destinataire non spécifié');
        setSending(null);
        return;
      }

      const result = await processGiftTransaction(
        user.id,
        targetUserId,
        gift.id,
        gift.name,
        gift.cost
      );

      if (result.success) {
        await loadBalance();
        onGiftSent?.(gift);
        alert(`✨ ${gift.emoji} ${gift.name} envoyé !\n\nCréateur reçoit ${result.creatorGain} ⭐`);
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending gift:', error);
      alert('Erreur lors de l\'envoi. Réessaye !');
    } finally {
      setSending(null);
    }
  };

  const renderGiftCard = (gift: CosmicGift, locked: boolean) => (
    <div
      key={gift.id}
      className={`relative p-4 rounded-xl border-2 transition-all ${
        locked
          ? 'border-gray-700 bg-gray-900/30 opacity-50'
          : gift.tier === 'elite'
          ? 'border-purple-500/50 bg-gradient-to-br from-purple-900/20 to-pink-900/20 hover:border-purple-500'
          : gift.tier === 'premium'
          ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 hover:border-yellow-500'
          : 'border-red-600/50 bg-gray-900/50 hover:border-red-600'
      }`}
    >
      {locked && (
        <div className="absolute top-2 right-2">
          <Lock className="w-4 h-4 text-gray-500" />
        </div>
      )}

      {gift.tier === 'premium' && !locked && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
          💎
        </div>
      )}

      {gift.tier === 'elite' && !locked && (
        <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full">
          👑
        </div>
      )}

      <div className="text-center space-y-2">
        <div className={`text-5xl ${!locked && 'animate-bounce'}`}>
          {gift.emoji}
        </div>

        <div className="text-white font-semibold text-sm">
          {gift.name}
        </div>

        {gift.description && (
          <div className="text-gray-400 text-xs">
            {gift.description}
          </div>
        )}

        <div className="text-yellow-400 font-bold">
          {gift.cost} ⭐
        </div>

        <button
          onClick={() => handleSendGift(gift)}
          disabled={locked || sending !== null || balance < gift.cost}
          className={`w-full py-2 rounded-lg font-bold text-xs transition-all ${
            locked
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : balance < gift.cost
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : gift.tier === 'elite'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              : gift.tier === 'premium'
              ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
              : 'bg-red-600 hover:bg-red-700 text-white'
          } disabled:opacity-50`}
        >
          {locked ? '🔒 Verrouillé' : sending === gift.id ? 'Envoi...' : 'Envoyer'}
        </button>
      </div>
    </div>
  );

  const freeGifts = COSMIC_GIFTS.filter(g => g.tier === 'free');
  const premiumGifts = COSMIC_GIFTS.filter(g => g.tier === 'premium');
  const eliteGifts = COSMIC_GIFTS.filter(g => g.tier === 'elite');

  return (
    <div className="space-y-8">

      {/* Balance */}
      <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-600/30 rounded-xl p-4 text-center">
        <p className="text-gray-300 text-sm mb-1">Ton solde cosmique</p>
        <p className="text-3xl font-bold text-yellow-400">{balance} ⭐</p>
      </div>

      {/* GRATUIT */}
      <div>
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-gray-400" />
          Pour tous
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {freeGifts.map(gift => renderGiftCard(gift, false))}
        </div>
      </div>

      {/* PREMIUM */}
      <div>
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          💎 Premium
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {premiumGifts.map(gift => renderGiftCard(gift, !canAccessPremiumGifts))}
        </div>
      </div>

      {/* ELITE */}
      <div>
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-500" />
          👑 Elite (Premium+ uniquement)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {eliteGifts.map(gift => renderGiftCard(gift, !canAccessEliteGifts))}
        </div>

        {!canAccessEliteGifts && (
          <div className="mt-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-600/30 rounded-xl p-6 text-center">
            <Lock className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <p className="text-white font-semibold mb-2">🔒 Cadeaux Elite réservés aux membres Premium+</p>
            <p className="text-gray-400 text-sm mb-4">Débloque des cadeaux légendaires et impacts d'écran complet</p>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-6 py-3 rounded-xl transition-all">
              Passer Premium+ Elite - 14,99€/mois
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
