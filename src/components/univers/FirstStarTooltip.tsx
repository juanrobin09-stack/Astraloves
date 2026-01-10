import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function FirstStarTooltip() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  useEffect(() => {
    // Vérifier si tooltip déjà montré
    const shown = localStorage.getItem('first_star_tooltip_shown');
    if (shown) {
      setHasBeenShown(true);
      return;
    }

    // Attendre 2s puis afficher
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('first_star_tooltip_shown', 'true');
    setHasBeenShown(true);
  };

  if (hasBeenShown) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="glass-effect p-6 rounded-large max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-blue flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Bienvenue dans ton Univers</p>
                  <p className="text-xs text-white/60">Mini-guide</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex gap-3">
                <span className="text-cosmic-gold flex-shrink-0">⭐</span>
                <p>Chaque <strong>étoile</strong> représente une âme compatible selon ton thème astral.</p>
              </div>

              <div className="flex gap-3">
                <span className="text-cosmic-purple flex-shrink-0">✨</span>
                <p>L'<strong>aura</strong> indique le niveau de compatibilité (or = très élevé).</p>
              </div>

              <div className="flex gap-3">
                <span className="text-cosmic-blue flex-shrink-0">👆</span>
                <p><strong>Clique</strong> sur une étoile pour voir le profil complet et la synastrie.</p>
              </div>

              <div className="flex gap-3">
                <span className="text-cosmic-green flex-shrink-0">🛡️</span>
                <p><strong>Guardian</strong> (Elite) te protège des patterns toxiques.</p>
              </div>
            </div>

            <div className="p-3 bg-cosmic-purple/10 rounded-medium border border-cosmic-purple/20 mb-6">
              <p className="text-xs text-white/80">
                <strong>En FREE :</strong> 5 étoiles visibles, 1 clic/jour.<br />
                <strong>En Premium+ :</strong> Univers illimité, filtres avancés.
              </p>
            </div>

            <Button variant="primary" className="w-full" onClick={handleClose}>
              J'ai compris
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
