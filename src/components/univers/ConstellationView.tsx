import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { matchingService } from '@/services/matching/matchingService';
import { supabase } from '@/config/supabase';
import { toast } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import type { Match } from '@/types';
import { StarNode } from './StarNode';
import { ProfilePreview } from './ProfilePreview';
import { GuardianBadge } from './GuardianBadge';
import { FilterPanel } from './FilterPanel';
import { EmptyUniversState } from './EmptyUniversState';
import { FirstStarTooltip } from './FirstStarTooltip';
import { Shield, X } from 'lucide-react';

export default function ConstellationView() {
  const { profile } = useAuthStore();
  const { tier } = useSubscriptionStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [hoveredMatch, setHoveredMatch] = useState<Match | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const visibleLimit = tier === 'free' ? 5 : tier === 'premium' ? 20 : -1;

  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      return matchingService.getPotentialMatches(profile.id, visibleLimit === -1 ? 100 : visibleLimit);
    },
    enabled: !!profile,
  });

  // Dessiner fond étoilé animé
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars: Array<{ x: number; y: number; radius: number; opacity: number; speed: number }> = [];

    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        speed: Math.random() * 0.002 + 0.001,
      });
    }

    let animationId: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.05)');
      gradient.addColorStop(1, 'rgba(10, 10, 20, 1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animate stars
      stars.forEach(star => {
        const twinkle = Math.sin(time * star.speed) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      time += 1;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleStarClick = async (match: Match) => {
    if (tier === 'free') {
      // Check quota
      const { data: quota } = await supabase
        .from('quotas')
        .select('*')
        .eq('user_id', profile?.id)
        .single();

      if (quota && quota.univers_clicks_used >= quota.univers_clicks_limit) {
        toast.error('Quota clics atteint. Revenez demain ou passez Premium.');
        return;
      }

      // Increment quota
      await supabase
        .from('quotas')
        .update({ univers_clicks_used: quota.univers_clicks_used + 1 })
        .eq('id', quota.id);
    }

    setSelectedMatch(match);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-2xl animate-cosmic-pulse">⭐</div>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return <EmptyUniversState />;
  }

  // Calculate star positions in constellation pattern
  const positions = calculateConstellationPositions(matches.length);

  return (
    <div className="relative h-full overflow-hidden">
      {/* Background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">🌌 Univers</h1>
          <p className="text-sm text-white/60">
            {matches.length} âmes cosmiques à portée
          </p>
        </div>

        <div className="flex gap-3">
          {tier === 'elite' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass-effect px-4 py-2 rounded-medium flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-cosmic-gold" />
              <span className="text-sm font-medium">Guardian</span>
            </motion.button>
          )}

          {(tier === 'premium' || tier === 'elite') && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="glass-effect px-4 py-2 rounded-medium"
            >
              <span className="text-sm font-medium">Filtres</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <FilterPanel onClose={() => setShowFilters(false)} />
        )}
      </AnimatePresence>

      {/* Constellation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full max-w-6xl max-h-[800px]">
          {matches.map((match, i) => {
            const pos = positions[i];
            const isBlurred = tier === 'free' && i >= 5;
            
            return (
              <StarNode
                key={match.id}
                match={match}
                position={pos}
                isBlurred={isBlurred}
                isHovered={hoveredMatch?.id === match.id}
                onClick={() => !isBlurred && handleStarClick(match)}
                onMouseEnter={() => setHoveredMatch(match)}
                onMouseLeave={() => setHoveredMatch(null)}
              />
            );
          })}
        </div>
      </div>

      {/* Guardian active indicator */}
      {tier === 'elite' && (
        <div className="absolute bottom-6 left-6 z-20">
          <GuardianBadge />
        </div>
      )}

      {/* Quota indicator (FREE only) */}
      {tier === 'free' && (
        <div className="absolute bottom-6 right-6 z-20 glass-effect px-4 py-2 rounded-medium">
          <p className="text-xs text-white/60">Clics restants: 1/jour</p>
        </div>
      )}

      {/* Profile preview modal */}
      <AnimatePresence>
        {selectedMatch && (
          <ProfilePreview
            match={selectedMatch}
            onClose={() => setSelectedMatch(null)}
          />
        )}
      </AnimatePresence>

      {/* First star tooltip (onboarding guide) */}
      <FirstStarTooltip />
    </div>
  );
}

// Calculate constellation positions (spiral pattern)
function calculateConstellationPositions(count: number): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];
  const centerX = 50;
  const centerY = 50;
  const maxRadius = 40;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 * 3; // 3 spirals
    const radius = (i / count) * maxRadius;
    
    positions.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    });
  }

  return positions;
}
