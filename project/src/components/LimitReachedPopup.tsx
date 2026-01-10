import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Lock, Flame } from 'lucide-react';

interface LimitReachedPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  type: 'signals' | 'super_nova' | 'distance' | 'visibility';
  current?: number;
  limit?: number;
  resetTime?: string;
}

const popupContent = {
  signals: {
    icon: Flame,
    title: 'Plus de signaux aujourd\'hui',
    description: 'Tu as utilisé tous tes signaux cosmiques quotidiens',
    buttonText: 'Passer illimité',
    secondaryText: 'Revenir demain'
  },
  super_nova: {
    icon: Sparkles,
    title: 'Fonctionnalité Premium',
    description: 'Les Super Nova sont réservés aux membres Premium et Elite',
    buttonText: 'Découvrir Premium',
    secondaryText: 'Plus tard'
  },
  distance: {
    icon: Lock,
    title: 'Fonctionnalité Premium',
    description: 'Voir la distance et la localisation exacte des utilisateurs est réservé aux membres Premium',
    buttonText: 'Découvrir Premium - 9.99€',
    secondaryText: 'Plus tard'
  },
  visibility: {
    icon: Lock,
    title: 'Limite de visibilité atteinte',
    description: 'Tu as atteint la limite de 15 étoiles. Passe Premium pour voir jusqu\'à 50 étoiles',
    buttonText: 'Découvrir Premium',
    secondaryText: 'Plus tard'
  }
};

export default function LimitReachedPopup({
  isOpen,
  onClose,
  onUpgrade,
  type,
  current,
  limit,
  resetTime
}: LimitReachedPopupProps) {
  const content = popupContent[type];
  const Icon = content.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-gradient-to-b from-zinc-900 to-black border border-red-600/20 rounded-3xl p-8 max-w-sm w-full"
              style={{ boxShadow: '0 20px 60px rgba(220, 38, 38, 0.3)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              <div className="flex flex-col items-center text-center">
                <motion.div
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600/20 to-red-700/20 border border-red-600/30 flex items-center justify-center mb-4"
                  animate={{
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      '0 0 20px rgba(220, 38, 38, 0.2)',
                      '0 0 30px rgba(220, 38, 38, 0.4)',
                      '0 0 20px rgba(220, 38, 38, 0.2)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Icon className="w-8 h-8 text-red-500" />
                </motion.div>

                <h3 className="text-2xl font-semibold text-white mb-3">
                  {content.title}
                </h3>

                <p className="text-gray-400 text-sm mb-2 leading-relaxed">
                  {content.description}
                </p>

                {current !== undefined && limit !== undefined && (
                  <div className="mt-2 mb-4 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                    <span className="text-white font-semibold">{current}</span>
                    <span className="text-gray-500">/{limit}</span>
                  </div>
                )}

                {resetTime && (
                  <p className="text-gray-500 text-xs mb-6">
                    Recharge dans : {resetTime}
                  </p>
                )}

                <motion.button
                  onClick={onUpgrade}
                  className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold mb-3 relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {content.buttonText}
                  </span>
                </motion.button>

                <button
                  onClick={onClose}
                  className="text-gray-500 text-sm hover:text-gray-400 transition-colors"
                >
                  {content.secondaryText}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
