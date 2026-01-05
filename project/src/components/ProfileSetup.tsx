import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User, Calendar, Heart, Target } from 'lucide-react';

type ProfileSetupProps = {
  onComplete: () => void;
  isEditing?: boolean;
};

export default function ProfileSetup({ onComplete, isEditing = false }: ProfileSetupProps) {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [genderPreference, setGenderPreference] = useState('');
  const [goals, setGoals] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (parseInt(age) < 18) {
      setError('Tu dois avoir au moins 18 ans pour utiliser Astra.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('astra_profiles')
        .update({
          username,
          age: parseInt(age),
          gender_preference: genderPreference,
          goals,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user!.id);

      if (updateError) throw updateError;

      onComplete();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde du profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen velvet-bg relative overflow-hidden flex items-center justify-center p-4">
      <div className="stars-bg absolute inset-0 opacity-30" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="premium-card rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 premium-text-sm">
            Parlons un peu de toi
          </h2>
          <p className="text-gray-300 text-center text-sm md:text-base mb-6">
            Pour te donner les meilleurs conseils, Astra a besoin de mieux te connaître
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-red-600" />
                Comment veux-tu qu'on t'appelle ?
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                maxLength={30}
                className="w-full px-4 py-3 premium-input rounded-lg text-white placeholder-gray-500"
                placeholder="Ton pseudo"
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" />
                Quel âge as-tu ?
              </label>
              <input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                min={18}
                max={120}
                className="w-full px-4 py-3 premium-input rounded-lg text-white placeholder-gray-500"
                placeholder="18+"
              />
            </div>

            <div>
              <label htmlFor="genderPreference" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-600" />
                Tu cherches à séduire...
              </label>
              <select
                id="genderPreference"
                value={genderPreference}
                onChange={(e) => setGenderPreference(e.target.value)}
                required
                className="w-full px-4 py-3 premium-input rounded-lg text-white"
              >
                <option value="">Sélectionne une option</option>
                <option value="women">Des femmes</option>
                <option value="men">Des hommes</option>
                <option value="all">Tout le monde</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div>
              <label htmlFor="goals" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-red-600" />
                Quels sont tes objectifs ?
              </label>
              <textarea
                id="goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                required
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 premium-input rounded-lg text-white placeholder-gray-500 resize-none"
                placeholder="Ex: Améliorer ma confiance, trouver une relation sérieuse, mieux communiquer..."
              />
              <p className="text-xs text-gray-500 mt-1">{goals.length}/500 caractères</p>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-600 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full premium-button text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enregistrement...' : 'Commencer avec Astra'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
            <p className="text-xs text-gray-300 text-center">
              Toutes tes informations sont chiffrées et confidentielles. Tu peux les modifier ou les supprimer à tout moment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
