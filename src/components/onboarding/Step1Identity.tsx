import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/config/supabase';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Step1IdentityProps {
  onNext: () => void;
}

export function Step1Identity({ onNext }: Step1IdentityProps) {
  const { profile } = useAuthStore();
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [birthDate, setBirthDate] = useState(profile?.birth_date || '');
  const [birthTime, setBirthTime] = useState(profile?.birth_time || '');
  const [birthPlace, setBirthPlace] = useState(profile?.birth_place || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!firstName || !birthDate || !birthPlace) {
      toast.error('Prénom, date et lieu sont requis');
      return;
    }

    if (!profile?.id) {
      toast.error('Erreur: profil non trouvé');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('profiles').update({
        first_name: firstName,
        birth_date: birthDate,
        birth_time: birthTime || null,
        birth_place: birthPlace,
      }).eq('id', profile.id);

      if (error) throw error;

      onNext();
    } catch (error) {
      console.error('Error saving identity:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="text-center mb-8">
            <motion.div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-blue flex items-center justify-center" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
              <Sparkles className="w-10 h-10" />
            </motion.div>
            <h1 className="text-3xl font-display font-bold mb-3">Qui es-tu dans cet univers ?</h1>
            <p className="text-white/60 mb-8">Donne-moi les clés de ton ciel. Je m'occupe du reste.</p>
          </div>

          <div className="glass-effect p-8 rounded-large space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Prénom</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Comment t'appelle-t-on ?" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-medium focus:border-cosmic-purple focus:outline-none transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date de naissance</label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-medium focus:border-cosmic-purple focus:outline-none transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Heure de naissance <span className="text-white/40">(optionnel mais recommandé)</span></label>
              <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-medium focus:border-cosmic-purple focus:outline-none transition-colors" />
              <p className="text-xs text-white/40 mt-1">Pour un thème précis (Ascendant, Maisons)</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Lieu de naissance</label>
              <input type="text" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} placeholder="Ville, Pays" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-medium focus:border-cosmic-purple focus:outline-none transition-colors" />
            </div>

            <Button variant="primary" className="w-full mt-6" onClick={handleContinue} disabled={isSubmitting}>
              {isSubmitting ? 'Sauvegarde...' : '✨ Continuer'}
            </Button>
          </div>

          <p className="text-xs text-center text-white/40 mt-6">Ces données sont privées et servent uniquement au calcul de ton thème astral</p>
        </motion.div>
      </div>
    </div>
  );
}
