import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function FirstStarTooltip() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show tooltip after 2 seconds on first visit to Univers
    const hasSeenTooltip = localStorage.getItem('hasSeenFirstStarTooltip');
    
    if (!hasSeenTooltip) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenFirstStarTooltip', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Tooltip */}
          <motion.div
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm w-full mx-4"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
          >
            <div className="glass-effect p-6 rounded-large border border-cosmic-purple/30 relative">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-blue flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-display font-bold text-center mb-3">
                Bienvenue dans ton Univers
              </h3>

              <div className="space-y-3 text-sm text-white/80 mb-6">
                <p className="flex gap-3">
                  <span className="text-cosmic-gold">⭐</span>
                  <span>Chaque étoile = une âme cosmiquement compatible</span>
                </p>
                <p className="flex gap-3">
                  <span className="text-cosmic-purple">💫</span>
                  <span>La luminosité = force de la résonance</span>
                </p>
                <p className="flex gap-3">
                  <span className="text-cosmic-blue">🌟</span>
                  <span>Clique sur une étoile pour voir le profil</span>
                </p>
                <p className="flex gap-3">
                  <span className="text-cosmic-green">✨</span>
                  <span>Signal cosmique = like mutuel = conversation</span>
                </p>
              </div>

              {/* CTA */}
              <Button
                onClick={handleClose}
                variant="primary"
                className="w-full"
              >
                J'ai compris
              </Button>

              <p className="text-xs text-white/40 text-center mt-4">
                💡 Tu peux explorer librement. ASTRA te guide si besoin.
              </p>
            </div>

            {/* Animated pointer to first star */}
            <motion.div
              className="absolute -bottom-16 left-1/2 -translate-x-1/2"
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              <div className="text-4xl">👇</div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
