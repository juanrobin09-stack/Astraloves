import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { MapPin } from 'lucide-react';
import type { BirthPlace } from '@/types';

interface Screen1IdentityProps {
  onComplete: (data: {
    firstName: string;
    birthDate: string;
    birthTime: string;
    birthPlace: BirthPlace;
    gender: 'man' | 'woman' | 'non-binary';
    lookingFor: ('man' | 'woman' | 'non-binary')[];
  }) => void;
}

export function Screen1Identity({ onComplete }: Screen1IdentityProps) {
  const [firstName, setFirstName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthCity, setBirthCity] = useState('');
  const [gender, setGender] = useState<'man' | 'woman' | 'non-binary'>('man');
  const [lookingFor, setLookingFor] = useState<('man' | 'woman' | 'non-binary')[]>(['woman']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !birthDate || !birthTime || !birthCity) {
      return;
    }

    onComplete({
      firstName: firstName.trim(),
      birthDate,
      birthTime,
      birthPlace: {
        city: birthCity,
        lat: 48.8566, // Mock - à remplacer par geocoding réel
        lng: 2.3522,
        timezone: 'Europe/Paris',
      },
      gender,
      lookingFor,
    });
  };

  const isValid = firstName && birthDate && birthTime && birthCity;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* ASTRA speaks */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-blue flex items-center justify-center text-4xl">
            ⭐
          </div>
          <p className="text-white/80 text-lg font-medium italic">
            "Donne-moi les clés de ton ciel.<br />Je m'occupe du reste."
          </p>
          <p className="text-white/40 text-sm mt-2">— ASTRA</p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-effect p-8 rounded-large"
        >
          <h1 className="text-2xl font-display font-bold mb-6 text-center">
            Qui es-tu dans cet univers ?
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium mb-2">Prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Comment t'appelles-tu ?"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-medium focus:outline-none focus:border-cosmic-purple transition-colors"
                required
              />
            </div>

            {/* Date de naissance */}
            <div>
              <label className="block text-sm font-medium mb-2">Date de naissance</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-medium focus:outline-none focus:border-cosmic-purple transition-colors"
                required
              />
            </div>

            {/* Heure de naissance */}
            <div>
              <label className="block text-sm font-medium mb-2">Heure de naissance</label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-medium focus:outline-none focus:border-cosmic-purple transition-colors"
                required
              />
              <p className="text-xs text-white/40 mt-1">
                Pour un thème précis. Si tu ne sais pas, mets 12:00.
              </p>
            </div>

            {/* Lieu de naissance */}
            <div>
              <label className="block text-sm font-medium mb-2">Lieu de naissance</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={birthCity}
                  onChange={(e) => setBirthCity(e.target.value)}
                  placeholder="Ville de naissance"
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-medium focus:outline-none focus:border-cosmic-purple transition-colors"
                  required
                />
              </div>
            </div>

            {/* Genre */}
            <div>
              <label className="block text-sm font-medium mb-2">Je suis</label>
              <div className="grid grid-cols-3 gap-2">
                {(['man', 'woman', 'non-binary'] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`px-4 py-2 rounded-medium text-sm font-medium transition-all ${
                      gender === g
                        ? 'bg-cosmic-purple text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {g === 'man' && 'Homme'}
                    {g === 'woman' && 'Femme'}
                    {g === 'non-binary' && 'Non-binaire'}
                  </button>
                ))}
              </div>
            </div>

            {/* Recherche */}
            <div>
              <label className="block text-sm font-medium mb-2">Je recherche</label>
              <div className="grid grid-cols-3 gap-2">
                {(['man', 'woman', 'non-binary'] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      if (lookingFor.includes(g)) {
                        setLookingFor(lookingFor.filter(x => x !== g));
                      } else {
                        setLookingFor([...lookingFor, g]);
                      }
                    }}
                    className={`px-4 py-2 rounded-medium text-sm font-medium transition-all ${
                      lookingFor.includes(g)
                        ? 'bg-cosmic-purple text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {g === 'man' && 'Hommes'}
                    {g === 'woman' && 'Femmes'}
                    {g === 'non-binary' && 'Non-binaires'}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-6"
              disabled={!isValid}
            >
              ✨ Continuer
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
