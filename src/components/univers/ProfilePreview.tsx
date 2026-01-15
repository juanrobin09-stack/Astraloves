import { motion } from 'framer-motion';
import { X, Heart, Shield, Sparkles } from 'lucide-react';
import { ZODIAC_SYMBOLS } from '@/utils/constants';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { matchingService } from '@/services/matching/matchingService';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/config/supabase';

// Helper pour obtenir URL avatar correcte
const getAvatarUrl = (avatarUrl: string | null | undefined): string | null => {
  if (!avatarUrl) return null;

  // Si déjà une URL complète, retourner telle quelle
  if (avatarUrl.startsWith('http')) {
    return avatarUrl;
  }

  // Sinon, construire URL Supabase Storage
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(avatarUrl);

  return data.publicUrl;
};

interface ProfilePreviewProps {
  match: any; // Profile with compatibility field
  onClose: () => void;
}

export function ProfilePreview({ match, onClose }: ProfilePreviewProps) {
  const { profile: currentUser } = useAuthStore();
  const [isLiking, setIsLiking] = useState(false);

  // match IS the profile (from getPotentialMatches)
  const profile = match;

  if (!profile) return null;

  const handleLike = async () => {
    if (!currentUser?.id || !profile?.id) return;

    setIsLiking(true);
    try {
      // Create or get the match record
      const matchRecord = await matchingService.createMatch(currentUser.id, profile.id);

      if (matchRecord) {
        // Record the click (like)
        await matchingService.recordClick(matchRecord.id, currentUser.id);

        // Check if it's mutual
        const { data: updatedMatch } = await supabase
          .from('matches')
          .select('*')
          .eq('id', matchRecord.id)
          .single();

        if (updatedMatch?.status === 'mutual') {
          toast.success('Match mutuel ! 🌟 Conversation ouverte');
        } else {
          toast.success('Signal cosmique envoyé ✨');
        }
      } else {
        toast.success('Signal cosmique envoyé ✨');
      }

      onClose();
    } catch (error) {
      console.error('Like error:', error);
      toast.error('Erreur lors du match');
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass-effect rounded-large max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-64 overflow-hidden rounded-t-large">
          {getAvatarUrl(profile.avatar_url) || profile.photos?.[0]?.url ? (
            <img
              src={getAvatarUrl(profile.avatar_url) || profile.photos[0].url}
              alt={profile.first_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback si image ne charge pas
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-full h-full bg-gradient-to-br from-cosmic-purple to-cosmic-blue ${getAvatarUrl(profile.avatar_url) || profile.photos?.[0]?.url ? 'hidden' : ''}`} />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-cosmic-black via-transparent to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 glass-effect rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Profile info */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-display font-bold">
                {profile.first_name}
              </h2>
              <span className="text-2xl">
                {ZODIAC_SYMBOLS[profile.sun_sign as keyof typeof ZODIAC_SYMBOLS]}
              </span>
            </div>

            <p className="text-white/60 mb-4">
              {profile.sun_sign} ☀️ {profile.moon_sign} 🌙 {profile.ascendant_sign} ↗️
            </p>

            {profile.bio && (
              <p className="text-sm text-white/80 mb-4">{profile.bio}</p>
            )}

            {/* Compatibility */}
            <div className="glass-effect p-4 rounded-medium mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-white/60">Compatibilité</span>
                <span className="text-2xl font-bold text-cosmic-gold">
                  {profile.compatibility || 75}%
                </span>
              </div>

              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cosmic-purple to-cosmic-gold"
                  initial={{ width: 0 }}
                  animate={{ width: `${profile.compatibility || 75}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>

            {/* Synastrie summary - simplified version */}
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold mb-2">🌟 Compatibilité astrale</h4>
                <p className="text-sm text-white/80">
                  {(profile.compatibility || 75) >= 80 ? (
                    "Connexion cosmique exceptionnelle. Vos énergies sont en harmonie."
                  ) : (profile.compatibility || 75) >= 60 ? (
                    "Bonne compatibilité. Potentiel de croissance mutuelle."
                  ) : (
                    "Différences stimulantes. Opportunité d'apprentissage."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Fermer
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleLike}
            disabled={isLiking}
          >
            {isLiking ? '...' : '⭐ Envoyer un signal cosmique'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
