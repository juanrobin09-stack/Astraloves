import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { astroCalculatorService } from '@/services/astro/astroCalculatorService';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Sparkles, Sun, Moon, ArrowUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Step2RevelationProps {
  onNext: () => void;
}

export function Step2Revelation({ onNext }: Step2RevelationProps) {
  const { profile, refreshProfile } = useAuthStore();
  const [isCalculating, setIsCalculating] = useState(true);
  const [chart, setChart] = useState<any>(null);
  const [astraMessage, setAstraMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      calculateChart();
    }
  }, [profile?.id]);

  const calculateChart = async () => {
    if (!profile?.birth_date || !profile?.birth_place) {
      setError('Données de naissance manquantes');
      setIsCalculating(false);
      return;
    }

    if (!profile?.id) {
      setError('Profil non trouvé');
      setIsCalculating(false);
      return;
    }

    setIsCalculating(true);
    setError(null);

    // Animation wow (3s)
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const natalChart = await astroCalculatorService.calculateNatalChart(
        profile.birth_date,
        profile.birth_time || '12:00',
        profile.birth_place
      );

      await astroCalculatorService.saveProfileWithAstro(profile.id, natalChart);
      
      // Refresh profile pour avoir les nouvelles données
      await refreshProfile();

      setChart(natalChart);
      
      // Message ASTRA basé sur élément dominant
      const { fire, earth, air, water } = natalChart.elementEnergies;
      const max = Math.max(fire, earth, air, water);
      
      if (fire === max) {
        setAstraMessage('Ton feu est dominant. Tu désires intensément, mais tu fuis la banalité.');
      } else if (earth === max) {
        setAstraMessage('Ta terre t\'ancre. Tu construis, mais tu redoutes le chaos.');
      } else if (air === max) {
        setAstraMessage('Ton air te libère. Tu penses vite, mais tu fuis l\'émotion brute.');
      } else {
        setAstraMessage('Ton eau te submerge. Tu ressens tout, mais tu protèges ton cœur.');
      }
    } catch (err: any) {
      console.error('Error calculating chart:', err);
      setError(err.message || 'Erreur lors du calcul du thème');
      toast.error('Impossible de calculer le thème natal');
    } finally {
      setIsCalculating(false);
    }
  };

  if (isCalculating) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <motion.div className="w-32 h-32 mx-auto mb-8" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
            <div className="w-full h-full rounded-full border-4 border-cosmic-purple/30 border-t-cosmic-purple" />
          </motion.div>
          <h2 className="text-2xl font-display font-bold mb-3">Calcul de ton thème natal...</h2>
          <p className="text-white/60">Les astres s'alignent</p>
        </div>
      </div>
    );
  }

  if (!chart && !isCalculating) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <p className="text-white/60 mb-4">{error || 'Erreur calcul thème'}</p>
          <Button onClick={calculateChart} className="mt-4">Réessayer</Button>
          <p className="text-xs text-white/40 mt-4">
            Assurez-vous d'avoir saisi votre date, heure et lieu de naissance
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold mb-3">Voilà pourquoi tu attires ce que tu attires.</h1>
          </div>

          <div className="glass-effect p-8 rounded-large mb-6">
            <div className="grid grid-cols-3 gap-6 mb-8">
              <motion.div className="text-center" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center"><Sun className="w-8 h-8" /></div>
                <p className="text-sm text-white/60 mb-1">Soleil</p>
                <p className="text-xl font-bold">{chart.sun.sign}</p>
              </motion.div>

              <motion.div className="text-center" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center"><Moon className="w-8 h-8" /></div>
                <p className="text-sm text-white/60 mb-1">Lune</p>
                <p className="text-xl font-bold">{chart.moon.sign}</p>
              </motion.div>

              <motion.div className="text-center" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center"><ArrowUp className="w-8 h-8" /></div>
                <p className="text-sm text-white/60 mb-1">Ascendant</p>
                <p className="text-xl font-bold">{chart.ascendant.sign}</p>
              </motion.div>
            </div>

            <motion.div className="p-4 bg-white/5 rounded-medium mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              <h4 className="text-sm font-semibold mb-3">Signature élémentaire</h4>
              <div className="space-y-2">
                <div><span className="text-white/60">🔥 Feu</span> <span className="float-right font-bold">{chart.elementEnergies.fire}%</span></div>
                <div><span className="text-white/60">🌍 Terre</span> <span className="float-right font-bold">{chart.elementEnergies.earth}%</span></div>
                <div><span className="text-white/60">💨 Air</span> <span className="float-right font-bold">{chart.elementEnergies.air}%</span></div>
                <div><span className="text-white/60">💧 Eau</span> <span className="float-right font-bold">{chart.elementEnergies.water}%</span></div>
              </div>
            </motion.div>

            <motion.div className="p-4 bg-cosmic-purple/20 rounded-medium border border-cosmic-purple/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-cosmic-purple flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-cosmic-purple mb-1">ASTRA</p>
                  <p className="text-sm italic">{astraMessage}</p>
                </div>
              </div>
            </motion.div>
          </div>

          <Button variant="primary" className="w-full" onClick={onNext}>🌌 Découvrir mon Univers</Button>
        </motion.div>
      </div>
    </div>
  );
}
