import { motion } from 'framer-motion';
import { ZODIAC_SYMBOLS } from '@/utils/constants';
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

interface StarNodeProps {
  match: any; // Profile with compatibility field from matchingService
  position: { x: number; y: number };
  isBlurred: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function StarNode({
  match,
  position,
  isBlurred,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: StarNodeProps) {
  // match IS the profile (from getPotentialMatches)
  const profile = match;
  if (!profile) return null;

  const compatibility = profile.compatibility || 75;
  
  // Aura color based on compatibility
  const getAuraColor = () => {
    if (compatibility >= 85) return 'rgba(252, 211, 77, 0.4)'; // Gold
    if (compatibility >= 70) return 'rgba(139, 92, 246, 0.4)'; // Purple
    if (compatibility >= 50) return 'rgba(96, 165, 250, 0.3)'; // Blue
    return 'rgba(255, 255, 255, 0.2)'; // White
  };

  // Brightness based on compatibility
  const brightness = 0.5 + (compatibility / 100) * 0.5;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isHovered ? 1.2 : 1, 
        opacity: isBlurred ? 0.3 : brightness,
      }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Aura ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          width: isHovered ? '120px' : '80px',
          height: isHovered ? '120px' : '80px',
          background: `radial-gradient(circle, ${getAuraColor()} 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Star core (avatar) */}
      <div className="relative z-10 w-16 h-16 rounded-full overflow-hidden border-2 border-white/20">
        {getAvatarUrl(profile.avatar_url) ? (
          <img
            src={getAvatarUrl(profile.avatar_url)!}
            alt={profile.first_name}
            className={`w-full h-full object-cover ${isBlurred ? 'blur-sm' : ''}`}
            onError={(e) => {
              // Fallback si image ne charge pas
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cosmic-purple to-cosmic-blue flex items-center justify-center text-2xl">
            {ZODIAC_SYMBOLS[profile.sun_sign as keyof typeof ZODIAC_SYMBOLS]}
          </div>
        )}
      </div>

      {/* Compatibility badge */}
      {!isBlurred && (
        <motion.div
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-cosmic-black/90 px-2 py-0.5 rounded-full border border-white/10"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : -5 }}
        >
          <span className="text-xs font-bold text-cosmic-gold">
            {compatibility}%
          </span>
        </motion.div>
      )}

      {/* Guardian badge - shown for verified profiles */}
      {profile.is_verified && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-cosmic-gold rounded-full flex items-center justify-center text-xs">
          ✓
        </div>
      )}

      {/* Hover tooltip */}
      {isHovered && !isBlurred && (
        <motion.div
          className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 glass-effect px-3 py-2 rounded-medium whitespace-nowrap"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm font-medium">{profile.first_name}</p>
          <p className="text-xs text-white/60">
            {ZODIAC_SYMBOLS[profile.sun_sign as keyof typeof ZODIAC_SYMBOLS]} {profile.sun_sign} • {compatibility}%
          </p>
        </motion.div>
      )}

      {/* Blur overlay for FREE users */}
      {isBlurred && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs text-white/40">🔒</div>
        </div>
      )}
    </motion.div>
  );
}
