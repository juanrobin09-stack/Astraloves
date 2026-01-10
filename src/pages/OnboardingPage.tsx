import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/config/supabase';

export default function OnboardingPage() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Infos de base
  const [firstName, setFirstName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');

  // Step 2: Genre et préférences
  const [gender, setGender] = useState<'man' | 'woman' | 'non-binary'>('man');
  const [lookingFor, setLookingFor] = useState<string[]>(['woman']);

  // Step 3: Bio
  const [bio, setBio] = useState('');

  const handleStep1 = () => {
    if (!firstName || !birthDate) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    setStep(2);
  };

  const handleStep2 = () => {
    setStep(3);
  };

  const handleComplete = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          birth_date: birthDate,
          birth_time: birthTime,
          gender,
          looking_for: lookingFor,
          bio: bio || null,
          onboarding_completed: true,
          onboarding_step: 3,
        })
        .eq('id', profile.id);

      if (error) throw error;

      navigate('/univers', { replace: true });
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-950/20 to-black flex items-center justify-center p-4">
      {/* Particules d'étoiles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Star 
            className="w-12 h-12 mx-auto mb-4 animate-pulse" 
            fill="#dc2626" 
            strokeWidth={0}
            style={{ filter: 'drop-shadow(0 0 20px #dc2626)' }}
          />
          <h1 className="text-3xl font-bold text-white mb-2">Bienvenue sur ASTRA</h1>
          <p className="text-gray-400">Étape {step}/3</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8 bg-white/10 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Card */}
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-red-500/20 shadow-2xl">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Qui es-tu dans cet univers ?</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none text-white"
                  placeholder="Ton prénom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date de naissance
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Heure de naissance (optionnel)
                </label>
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none text-white"
                />
              </div>

              <button
                onClick={handleStep1}
                className="w-full py-3 rounded-xl font-semibold bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-500/30"
              >
                Continuer →
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Révèle ton essence</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Je suis...
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'man', label: 'Homme' },
                    { value: 'woman', label: 'Femme' },
                    { value: 'non-binary', label: 'Non-binaire' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setGender(option.value as any)}
                      className={`py-3 rounded-xl font-medium transition-all ${
                        gender === option.value
                          ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:border-red-500/50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Je recherche...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'man', label: 'Homme' },
                    { value: 'woman', label: 'Femme' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        if (lookingFor.includes(option.value)) {
                          setLookingFor(lookingFor.filter(g => g !== option.value));
                        } else {
                          setLookingFor([...lookingFor, option.value]);
                        }
                      }}
                      className={`py-3 rounded-xl font-medium transition-all ${
                        lookingFor.includes(option.value)
                          ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:border-red-500/50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl font-semibold bg-white/5 border border-white/10 hover:border-red-500/50 transition-all"
                >
                  ← Retour
                </button>
                <button
                  onClick={handleStep2}
                  className="flex-1 py-3 rounded-xl font-semibold bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-500/30"
                >
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Ton histoire cosmique</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio (optionnel)
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none text-white resize-none"
                  placeholder="Raconte-nous qui tu es..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  {bio.length}/500 caractères
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl font-semibold bg-white/5 border border-white/10 hover:border-red-500/50 transition-all"
                >
                  ← Retour
                </button>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-semibold bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-500/30 disabled:opacity-50"
                >
                  {loading ? 'Chargement...' : 'Entrer dans l\'univers ✨'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
