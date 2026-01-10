import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Sparkles } from 'lucide-react';
import { ZODIAC_SYMBOLS } from '@/utils/constants';

interface Step3UniverseProps {
  onComplete: () => void;
}

export function Step3Universe({ onComplete }: Step3UniverseProps) {
  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold mb-3">Ton Univers est prêt.</h1>
          </div>

          <div className="glass-effect p-8 rounded-large mb-6 relative overflow-hidden">
            {/* Mini preview Univers */}
            <div className="relative h-64 flex items-center justify-center">
              {/* Background stars */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/30 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
                />
              ))}

              {/* 3 sample stars */}
              <motion.div
                className="absolute"
                style={{ left: '30%', top: '40%' }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.6 }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/20 flex items-center justify-center text-xl">
                  {ZODIAC_SYMBOLS.Aries}
                </div>
              </motion.div>

              <motion.div
                className="absolute"
                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: 1
                }}
                transition={{ 
                  delay: 0.5,
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }
                }}
              >
                <div className="relative">
                  <div className="absolute inset-0 w-20 h-20 rounded-full bg-cosmic-gold/30 blur-xl" />
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-cosmic-gold to-yellow-600 border-2 border-cosmic-gold flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(252,211,77,0.5)]">
                    {ZODIAC_SYMBOLS.Leo}
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute"
                style={{ left: '70%', top: '30%' }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.6 }}
                transition={{ delay: 0.7 }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/20 flex items-center justify-center text-xl">
                  {ZODIAC_SYMBOLS.Pisces}
                </div>
              </motion.div>
            </div>

            {/* ASTRA message */}
            <motion.div
              className="p-4 bg-cosmic-purple/20 rounded-medium border border-cosmic-purple/30 mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-cosmic-purple flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-cosmic-purple mb-1">ASTRA</p>
                  <p className="text-sm italic">Chaque étoile est une âme compatible. La lumière indique la résonance. Observe... puis choisis.</p>
                </div>
              </div>
            </motion.div>
          </div>

          <Button variant="primary" className="w-full mb-3" onClick={onComplete}>
            ✨ Entrer dans l'Univers
          </Button>

          <button
            onClick={onComplete}
            className="w-full text-sm text-white/60 hover:text-white transition-colors"
          >
            Compléter mon profil plus tard
          </button>

          <p className="text-xs text-center text-white/40 mt-6">Tu peux explorer librement. En FREE, tu verras 5 âmes par jour.</p>
        </motion.div>
      </div>
    </div>
  );
}
