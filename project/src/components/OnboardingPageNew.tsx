import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getZodiacSign, calculateAge } from '../lib/zodiacHelper';
import FrenchCityAutocomplete from './FrenchCityAutocomplete';
import PhotoUpload from './PhotoUpload';
import { ChevronLeft, Star } from 'lucide-react';
import type { FrenchCity } from '../lib/frenchCitiesService';

type OnboardingPageNewProps = {
  onComplete: () => void;
};

const GENDER_OPTIONS = [
  { label: 'Un homme', emoji: '👨', value: 'homme' },
  { label: 'Une femme', emoji: '👩', value: 'femme' },
];

const SEEKING_OPTIONS = [
  { label: 'Un homme', emoji: '👨', value: 'homme' },
  { label: 'Une femme', emoji: '👩', value: 'femme' },
  { label: 'Les deux', emoji: '💫', value: 'both' },
];

const GOAL_OPTIONS = [
  { value: 'amour', label: 'Trouver l\'amour', emoji: '❤️' },
  { value: 'serieux', label: 'Relation serieuse', emoji: '💕' },
  { value: 'aventure', label: 'Aventure / fun', emoji: '🔥' },
  { value: 'sais_pas', label: 'Je sais pas encore', emoji: '🤷' },
];

const WEEKEND_OPTIONS = [
  { value: 'fetard', label: 'Soirees et sorties', emoji: '🎉' },
  { value: 'casanier', label: 'Netflix et chill', emoji: '🏠' },
  { value: 'aventurier', label: 'Aventure, rando', emoji: '🏔️' },
  { value: 'culturel', label: 'Culture : musee, cine', emoji: '🎨' },
];

const LIFESTYLE_OPTIONS = [
  { value: 'fetard', label: 'Presque tous les soirs', emoji: '🦁' },
  { value: 'equilibre', label: '1-2 fois par semaine', emoji: '⚖️' },
  { value: 'casanier', label: 'Rarement, je prefere rester home', emoji: '🐨' },
  { value: 'flexible', label: 'Ca depend de mon mood', emoji: '🎲' },
];

const VALEURS_OPTIONS = [
  { value: 'loyal', label: 'La loyaute et la confiance', emoji: '🤝' },
  { value: 'independant', label: 'La liberte et l\'independance', emoji: '🦅' },
  { value: 'humour', label: 'L\'humour et la legerete', emoji: '😂' },
  { value: 'ambitieux', label: 'L\'ambition et les projets', emoji: '🚀' },
];

export default function OnboardingPageNew({ onComplete }: OnboardingPageNewProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);

  const [firstName, setFirstName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState(18);
  const [gender, setGender] = useState('');
  const [seeking, setSeeking] = useState('');
  const [ville, setVille] = useState<FrenchCity | null>(null);
  const [goal, setGoal] = useState('');

  const [weekend, setWeekend] = useState('');
  const [lifestyle, setLifestyle] = useState('');
  const [valeurs, setValeurs] = useState('');

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [zodiacSign, setZodiacSign] = useState('');

  const totalSteps = 11;

  useEffect(() => {
    let isMounted = true;

    const checkExistingProfile = async () => {
      if (!user?.id) {
        console.log('⏳ [ONBOARDING] Pas d\'utilisateur connecté');
        return;
      }

      console.log('🔍 [ONBOARDING] Vérification du statut onboarding pour userId:', user.id);

      const { data: profile, error } = await supabase
        .from('astra_profiles')
        .select('first_name, onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ [ONBOARDING] Erreur lors de la vérification:', error);
        return;
      }

      console.log('📊 [ONBOARDING] Profil actuel:', profile);

      if (profile?.onboarding_completed && profile?.first_name && isMounted) {
        console.log('✅ [ONBOARDING] Onboarding déjà complété, redirection vers l\'app...');
        onComplete();
        return;
      }

      console.log('🎯 [ONBOARDING] Onboarding non complété, affichage du questionnaire');
    };

    checkExistingProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleNext = () => {
    setError('');

    if (step === 1 && !firstName.trim()) {
      setError('Entre ton prénom');
      return;
    }

    if (step === 2) {
      if (!birthDate) {
        setError('Entre ta date de naissance');
        return;
      }
      const calculatedAge = calculateAge(birthDate);
      if (calculatedAge < 18) {
        setError('Tu dois avoir 18 ans minimum');
        return;
      }
      setAge(calculatedAge);
    }

    if (step === 3 && !gender) {
      setError('Sélectionne une option');
      return;
    }

    if (step === 4 && !seeking) {
      setError('Sélectionne une option');
      return;
    }

    if (step === 5 && !ville) {
      setError('Indique ta ville');
      return;
    }

    if (step === 6 && !goal) {
      setError('Sélectionne ton objectif');
      return;
    }

    if (step === 7 && !weekend) {
      setError('Sélectionne une option');
      return;
    }

    if (step === 8 && !lifestyle) {
      setError('Sélectionne une option');
      return;
    }

    if (step === 9 && !valeurs) {
      setError('Sélectionne une option');
      return;
    }

    // Étape 10 = photo (optionnelle), on sauvegarde et passe à l'écran de félicitations
    if (step === 10) {
      console.log('📸 [ONBOARDING] Étape photo terminée, sauvegarde des données...');
      handleSubmit();
      return;
    }

    // Pour toutes les autres étapes, on continue normalement
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🚀 [ONBOARDING] Début de la soumission du questionnaire');
      const zodiac = getZodiacSign(birthDate);

      const updateData: any = {
        first_name: firstName.trim(),
        birth_date: birthDate,
        age,
        gender,
        seeking,
        ville: ville?.nom || null,
        ville_data: ville
          ? {
              nom: ville.nom,
              codePostal: ville.codePostal,
              coordinates: ville.coordinates,
            }
          : null,
        goal,
        questionnaire: {
          objectif: goal,
          weekend,
          lifestyle,
          valeurs,
        },
        sun_sign: zodiac.name,
        signe_solaire: zodiac.name,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        age_min: 18,
        age_max: Math.min(age + 15, 65),
        updated_at: new Date().toISOString(),
      };

      if (photoUrl) {
        updateData.photos = [photoUrl];
        updateData.avatar_url = photoUrl;
      }

      console.log('💾 [ONBOARDING] Sauvegarde des données:', {
        userId: user!.id,
        firstName: firstName.trim(),
        onboarding_completed: true
      });

      const { error: updateError } = await supabase
        .from('astra_profiles')
        .update(updateData)
        .eq('id', user!.id);

      if (updateError) {
        console.error('❌ [ONBOARDING] Erreur de sauvegarde:', updateError);
        throw updateError;
      }

      console.log('✅ [ONBOARDING] Données sauvegardées avec succès');

      // Vérifier que les données ont bien été sauvegardées
      const { data: checkProfile } = await supabase
        .from('astra_profiles')
        .select('onboarding_completed, first_name')
        .eq('id', user!.id)
        .maybeSingle();

      console.log('🔍 [ONBOARDING] Vérification du profil après sauvegarde:', checkProfile);

      setZodiacSign(zodiac.name);
      setStep(11);
    } catch (err: any) {
      console.error('❌ [ONBOARDING] Erreur:', err);
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const renderOptionButton = (
    option: { value?: string; label: string; emoji: string },
    isSelected: boolean,
    onClick: () => void
  ) => (
    <button
      key={option.value || option.label}
      onClick={onClick}
      className={`w-full h-14 px-4 rounded-2xl transition-all duration-200 flex items-center gap-4 border ${
        isSelected
          ? 'bg-red-600/20 border-red-500'
          : 'bg-white/5 border-white/10 active:bg-white/10'
      }`}
    >
      <span className="text-2xl flex-shrink-0">{option.emoji}</span>
      <span className="text-base font-medium text-white text-left">
        {option.label}
      </span>
    </button>
  );

  return (
    <div
      className="min-h-screen min-h-[100dvh] overflow-y-auto overflow-x-hidden"
      style={{ background: 'linear-gradient(180deg, #0A0A0F 0%, #1A0A12 100%)' }}
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.2,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {step !== 11 && (
          <div className="flex-shrink-0 px-5 pt-8 pb-4 safe-area-top">
            <div className="flex items-center justify-between mb-4">
              {step > 1 ? (
                <button
                  onClick={() => {
                    setStep(step - 1);
                    setError('');
                  }}
                  className="flex items-center gap-2 px-4 h-10 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 active:bg-white/30 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Retour</span>
                </button>
              ) : (
                <div className="w-24" />
              )}
              <span className="text-sm font-semibold text-white/60">
                Étape {step}/{totalSteps}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${(step / totalSteps) * 100}%`,
                  background: 'linear-gradient(90deg, #DC2626, #EF4444)',
                  boxShadow: '0 0 10px rgba(220, 38, 38, 0.5)',
                }}
              />
            </div>
          </div>
        )}

        <div
          className="flex-1 px-5 pb-6"
        >
          {error && (
            <div className="mb-4 p-3 rounded-xl text-center text-sm font-medium bg-red-600/10 border border-red-500/30 text-red-400">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-5xl mb-4">👋</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Comment t'appelles-tu ?
                </h2>
                <p className="text-white/50 text-sm">
                  C'est ainsi que tu apparaitras dans l'univers Astra
                </p>
              </div>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ton prenom"
                autoFocus
                className="w-full h-14 px-5 text-lg font-medium rounded-2xl bg-white/5 text-white border border-white/10 focus:border-red-500 outline-none placeholder:text-white/30 transition-colors"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-5xl mb-4">🎂</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Ta date de naissance ?
                </h2>
                <p className="text-white/50 text-sm">
                  On calculera ton signe automatiquement
                </p>
              </div>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value);
                  if (e.target.value) {
                    setAge(calculateAge(e.target.value));
                  }
                }}
                max={
                  new Date(
                    new Date().setFullYear(new Date().getFullYear() - 18)
                  )
                    .toISOString()
                    .split('T')[0]
                }
                className="w-full h-14 px-5 text-lg font-medium rounded-2xl bg-white/5 text-white border border-white/10 focus:border-red-500 outline-none transition-colors"
                style={{ colorScheme: 'dark' }}
              />
              {birthDate && (
                <div className="text-center p-4 rounded-2xl bg-red-600/10 border border-red-500/30">
                  <div className="text-3xl mb-1">
                    {getZodiacSign(birthDate).emoji}
                  </div>
                  <div className="text-lg font-bold text-red-400">
                    {getZodiacSign(birthDate).name}
                  </div>
                </div>
              )}
              <p className="text-red-400/70 text-xs text-center">
                Tu dois avoir 18 ans minimum
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-5xl mb-4">👤</div>
                <h2 className="text-2xl font-bold text-white">Tu es...</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {GENDER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setGender(option.label)}
                    className={`aspect-square rounded-2xl transition-all duration-200 flex flex-col items-center justify-center gap-2 border ${
                      gender === option.label
                        ? 'bg-red-600/20 border-red-500'
                        : 'bg-white/5 border-white/10 active:bg-white/10'
                    }`}
                  >
                    <span className="text-4xl">{option.emoji}</span>
                    <span className="text-sm font-semibold text-white">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-5xl mb-4">💕</div>
                <h2 className="text-2xl font-bold text-white">Tu recherches...</h2>
              </div>
              <div className="space-y-3">
                {SEEKING_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSeeking(option.label)}
                    className={`w-full h-16 px-5 rounded-2xl transition-all duration-200 flex items-center gap-4 border ${
                      seeking === option.label
                        ? 'bg-red-600/20 border-red-500'
                        : 'bg-white/5 border-white/10 active:bg-white/10'
                    }`}
                  >
                    <span className="text-3xl">{option.emoji}</span>
                    <span className="text-lg font-semibold text-white">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-5xl mb-4">📍</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Ou te trouves-tu ?
                </h2>
                <p className="text-white/50 text-sm">
                  Pour te montrer des profils proches de toi
                </p>
              </div>
              <FrenchCityAutocomplete
                value={ville}
                onChange={setVille}
                showGeolocation={true}
              />
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-5xl mb-4">🎯</div>
                <h2 className="text-2xl font-bold text-white">
                  Tu cherches quoi ici ?
                </h2>
              </div>
              <div className="space-y-3">
                {GOAL_OPTIONS.map((option) =>
                  renderOptionButton(option, goal === option.value, () =>
                    setGoal(option.value)
                  )
                )}
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/20 border border-red-500/30 mb-4">
                  <Star className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">QUESTIONNAIRE</span>
                </div>
                <div className="text-4xl mb-3">🎉</div>
                <h2 className="text-xl font-bold text-white">
                  Ton week-end ideal ?
                </h2>
              </div>
              <div className="space-y-3">
                {WEEKEND_OPTIONS.map((option) =>
                  renderOptionButton(option, weekend === option.value, () =>
                    setWeekend(option.value)
                  )
                )}
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="text-4xl mb-3">🌙</div>
                <h2 className="text-xl font-bold text-white">
                  Tu sors combien de fois par semaine ?
                </h2>
              </div>
              <div className="space-y-3">
                {LIFESTYLE_OPTIONS.map((option) =>
                  renderOptionButton(option, lifestyle === option.value, () =>
                    setLifestyle(option.value)
                  )
                )}
              </div>
            </div>
          )}

          {step === 9 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="text-4xl mb-3">💎</div>
                <h2 className="text-xl font-bold text-white">
                  Ce qui compte le plus pour toi ?
                </h2>
              </div>
              <div className="space-y-3">
                {VALEURS_OPTIONS.map((option) =>
                  renderOptionButton(option, valeurs === option.value, () =>
                    setValeurs(option.value)
                  )
                )}
              </div>
            </div>
          )}

          {step === 10 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-5xl mb-4">📸</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Ta plus belle photo !
                </h2>
                <p className="text-white/50 text-sm">
                  Elle apparaitra sur ta planete dans l'univers
                </p>
              </div>
              <div className="flex justify-center">
                <PhotoUpload
                  userId={user!.id}
                  currentPhoto={photoUrl || undefined}
                  onPhotoChange={(url) => setPhotoUrl(url)}
                />
              </div>
            </div>
          )}

          {step === 11 && (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] -mt-4 space-y-8 px-4">
              <div className="relative">
                <div className="text-8xl mb-4 animate-bounce">🎉</div>
                <div className="absolute -top-4 -right-4 text-4xl animate-pulse">✨</div>
                <div className="absolute -top-4 -left-4 text-4xl animate-pulse delay-100">✨</div>
              </div>

              <h2 className="text-4xl font-bold text-white text-center leading-tight">
                Ton profil est pret !
              </h2>

              <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-amber-500/20 border-2 border-amber-500/40">
                <span className="text-4xl">{getZodiacSign(birthDate).emoji}</span>
                <span className="text-2xl font-bold text-amber-400">
                  {zodiacSign}
                </span>
              </div>

              <p className="text-white/70 text-center text-lg max-w-md leading-relaxed">
                Tu fais maintenant partie de l'univers Astra.
                <br />
                <span className="text-white/90 font-medium">Pret(e) a rencontrer ton ame soeur cosmique ?</span>
              </p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex-shrink-0 px-5 pb-6 pt-6 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/95 to-transparent safe-area-bottom z-20">
          <button
            onClick={() => {
              if (step === 11) {
                console.log('🚀 [ONBOARDING] Clic sur "Explorer l\'univers", appel de onComplete()');
                onComplete();
              } else {
                handleNext();
              }
            }}
            disabled={loading}
            className="w-full h-14 rounded-2xl font-bold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            style={{
              background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
              boxShadow: '0 4px 20px rgba(220, 38, 38, 0.3)',
            }}
          >
            {loading
              ? 'Chargement...'
              : step === 11
              ? '🚀 Explorer l\'univers'
              : step === 10
              ? 'Terminer'
              : 'Continuer'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        .safe-area-top {
          padding-top: max(12px, env(safe-area-inset-top));
        }
        .safe-area-bottom {
          padding-bottom: max(24px, env(safe-area-inset-bottom));
        }
      `}</style>
    </div>
  );
}
