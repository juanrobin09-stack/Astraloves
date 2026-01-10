import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ZODIAC_SYMBOLS } from '@/utils/constants';
import type { NatalChartData } from '@/types';

interface Screen2RevelationProps {
  natalChart: NatalChartData;
  onComplete: () => void;
}

export function Screen2Revelation({ natalChart, onComplete }: Screen2RevelationProps) {
  const [stage, setStage] = useState<'calculating' | 'revealing' | 'complete'>('calculating');

  useEffect(() => {
    // Simulate calculation
    const timer1 = setTimeout(() => setStage('revealing'), 2000);
    const timer2 = setTimeout(() => setStage('complete'), 4000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const getDominantElement = () => {
    // Calculate from chart (simplified)
    const fire = (natalChart.sun.sign === 'Aries' || natalChart.sun.sign === 'Leo' || natalChart.sun.sign === 'Sagittarius') ? 40 : 20;
    const earth = (natalChart.sun.sign === 'Taurus' || natalChart.sun.sign === 'Virgo' || natalChart.sun.sign === 'Capricorn') ? 40 : 20;
    const air = (natalChart.sun.sign === 'Gemini' || natalChart.sun.sign === 'Libra' || natalChart.sun.sign === 'Aquarius') ? 40 : 20;
    const water = (natalChart.sun.sign === 'Cancer' || natalChart.sun.sign === 'Scorpio' || natalChart.sun.sign === 'Pisces') ? 40 : 20;

    const max = Math.max(fire, earth, air, water);
    if (fire === max) return { name: 'Feu', icon: '🔥', text: 'Tu désires intensément, mais tu fuis la banalité.' };
    if (earth === max) return { name: 'Terre', icon: '🌍', text: 'Tu construis lentement, mais tu bâtis pour durer.' };
    if (air === max) return { name: 'Air', icon: '💨', text: 'Tu communiques brillamment, mais tu crains l\'enfermement.' };
    return { name: 'Eau', icon: '💧', text: 'Tu ressens profondément, mais tu te protèges difficilement.' };
  };

  const dominant = getDominantElement();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {stage === 'calculating' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            className="text-8xl mb-6"
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⭐
          </motion.div>
          <h2 className="text-2xl font-display font-bold mb-2">Calcul en cours...</h2>
          <p className="text-white/60">Les planètes s'alignent</p>
        </motion.div>
      )}

      {stage === 'revealing' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-display font-bold mb-8">
              Voilà pourquoi tu attires<br />ce que tu attires.
            </h2>
          </motion.div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-effect p-6 rounded-large"
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">{ZODIAC_SYMBOLS[natalChart.sun.sign as keyof typeof ZODIAC_SYMBOLS]}</div>
                <div className="text-left">
                  <p className="text-sm text-white/60">Soleil</p>
                  <p className="text-xl font-bold">{natalChart.sun.sign}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="glass-effect p-6 rounded-large"
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">{ZODIAC_SYMBOLS[natalChart.moon.sign as keyof typeof ZODIAC_SYMBOLS]}</div>
                <div className="text-left">
                  <p className="text-sm text-white/60">Lune</p>
                  <p className="text-xl font-bold">{natalChart.moon.sign}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="glass-effect p-6 rounded-large"
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">{ZODIAC_SYMBOLS[natalChart.ascendant.sign as keyof typeof ZODIAC_SYMBOLS]}</div>
                <div className="text-left">
                  <p className="text-sm text-white/60">Ascendant</p>
                  <p className="text-xl font-bold">{natalChart.ascendant.sign}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {stage === 'complete' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{dominant.icon}</div>
            <h2 className="text-2xl font-display font-bold mb-4">
              Ton {dominant.name} est dominant.
            </h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-effect p-6 rounded-large mb-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-blue flex items-center justify-center flex-shrink-0 text-xl">
                ⭐
              </div>
              <div className="text-left">
                <p className="text-sm text-white/60 mb-1">ASTRA te voit</p>
                <p className="text-white/90 italic">"{dominant.text}"</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
              <div className="text-center">
                <div className="text-3xl mb-1">☀️</div>
                <p className="text-xs text-white/60">Soleil</p>
                <p className="text-sm font-bold">{natalChart.sun.sign}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-1">🌙</div>
                <p className="text-xs text-white/60">Lune</p>
                <p className="text-sm font-bold">{natalChart.moon.sign}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-1">↗️</div>
                <p className="text-xs text-white/60">Asc</p>
                <p className="text-sm font-bold">{natalChart.ascendant.sign}</p>
              </div>
            </div>
          </motion.div>

          <Button
            onClick={onComplete}
            variant="primary"
            className="w-full"
          >
            🌌 Découvrir mon Univers
          </Button>
        </motion.div>
      )}
    </div>
  );
}
