import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Sparkles } from 'lucide-react';

interface Screen3UniverseProps {
  onComplete: () => void;
}

export function Screen3Universe({ onComplete }: Screen3UniverseProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-display font-bold mb-3">
            Ton Univers est prêt.
          </h1>
          <p className="text-white/60">
            Les âmes compatibles t'attendent.
          </p>
        </motion.div>

        {/* Mini Universe Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative h-80 mb-8 rounded-large overflow-hidden glass-effect"
        >
          {/* Background stars */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* 3 sample stars */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="relative">
              {/* Center star (main) */}
              <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-blue border-2 border-white/20 flex items-center justify-center text-3xl"
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 20px rgba(139, 92, 246, 0.4)',
                    '0 0 40px rgba(139, 92, 246, 0.6)',
                    '0 0 20px rgba(139, 92, 246, 0.4)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ⭐
              </motion.div>

              {/* Left star */}
              <motion.div
                className="absolute -left-24 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-cosmic-gold to-yellow-600 border-2 border-white/20 flex items-center justify-center text-2xl"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                ✨
              </motion.div>

              {/* Right star */}
              <motion.div
                className="absolute -right-24 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-cosmic-blue to-blue-600 border-2 border-white/20 flex items-center justify-center text-2xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
              >
                💫
              </motion.div>

              {/* Aura ring */}
              <motion.div
                className="absolute inset-0 -m-4 rounded-full border-2 border-cosmic-purple/30"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* ASTRA speaks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="glass-effect p-6 rounded-large mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-blue flex items-center justify-center flex-shrink-0 text-xl">
              ⭐
            </div>
            <div className="text-left">
              <p className="text-sm text-white/60 mb-2">ASTRA te guide</p>
              <p className="text-white/90 italic leading-relaxed">
                "Chaque étoile est une âme compatible. La lumière indique la résonance. Observe… puis choisis."
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="space-y-3"
        >
          <Button
            onClick={onComplete}
            variant="primary"
            className="w-full"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Entrer dans l'Univers
          </Button>

          <button
            onClick={onComplete}
            className="w-full text-sm text-white/60 hover:text-white transition-colors"
          >
            Compléter mon profil plus tard →
          </button>
        </motion.div>

        {/* Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="text-center text-xs text-white/40 mt-6"
        >
          💡 Clique sur une étoile pour voir sa compatibilité
        </motion.p>
      </motion.div>
    </div>
  );
}
