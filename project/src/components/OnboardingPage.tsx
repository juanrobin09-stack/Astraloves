import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getZodiacSign, calculateAge } from '../lib/zodiacHelper';
import CitySearchInput from './CitySearchInput';
import PhotoUpload from './PhotoUpload';
import { Clock, Target } from 'lucide-react';

type OnboardingPageProps = {
  onComplete: () => void;
};

const GENDER_OPTIONS = [
  { label: 'Un homme', emoji: '🕺' },
  { label: 'Une femme', emoji: '💃' },
  { label: 'Autre', emoji: '✨' }
];

const SEEKING_OPTIONS = [
  { label: 'Une femme', emoji: '💃' },
  { label: 'Un homme', emoji: '🕺' },
  { label: 'Les deux', emoji: '✨' }
];

const GOAL_OPTIONS = [
  'Trouver l\'amour',
  'Meilleure version de moi',
  'Apprendre à séduire',
  'Gérer ma timidité',
  'Renforcer ma confiance',
  'Autre'
];

export default function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);

  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!user?.id) return;

      const { data: profile } = await supabase
        .from('astra_profiles')
        .select('first_name')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.first_name) {
        console.log('[Astra] User already has profile, redirecting to chat');
        onComplete();
      }
    };

    checkExistingProfile();
  }, [user, onComplete]);
  const [firstName, setFirstName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('');
  const [seeking, setSeeking] = useState('');
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(120);
  const [ville, setVille] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [goal, setGoal] = useState('');
  const [goalOther, setGoalOther] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalSteps = 8;

  const handleNext = () => {
    setError('');

    if (step === 1 && !firstName.trim()) {
      setError('Entre ton prénom ou pseudo');
      return;
    }

    if (step === 2 && !birthDate) {
      setError('Entre ta date de naissance');
      return;
    }

    if (step === 2 && birthDate) {
      const calculatedAge = calculateAge(birthDate);
      if (calculatedAge < 18) {
        setError('Tu dois avoir au moins 18 ans');
        return;
      }
      setAge(calculatedAge);
    }

    if (step === 4 && !gender) {
      setError('Sélectionne une option');
      return;
    }

    if (step === 5 && !seeking) {
      setError('Sélectionne une option');
      return;
    }

    if (step === 7 && !ville) {
      setError('Indique ta ville');
      return;
    }

    if (step === 8 && !goal) {
      setError('Sélectionne une option');
      return;
    }

    if (step === 8 && goal === 'Autre' && !goalOther.trim()) {
      setError('Précise ta réponse');
      return;
    }

    if (step === totalSteps) {
      handleSubmit();
    } else {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const baseUsername = firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      let username = baseUsername;
      let counter = 0;

      while (true) {
        const { data: existingUser } = await supabase
          .from('astra_profiles')
          .select('id')
          .eq('username', username)
          .maybeSingle();

        if (!existingUser) break;

        counter++;
        username = `${baseUsername}${counter}`;
      }

      const updateData: any = {
        first_name: firstName.trim(),
        username: username,
        birth_date: birthDate || null,
        birth_time: birthTime || null,
        birth_place: birthPlace || ville,
        age: age,
        gender: gender,
        seeking: seeking,
        age_min: ageMin,
        age_max: ageMax,
        ville: ville || null,
        bio: bio || null,
        goal: goal === 'Autre' ? goalOther.trim() : goal,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      };

      if (birthDate) {
        const zodiac = getZodiacSign(birthDate);
        updateData.sun_sign = zodiac.name;
        updateData.signe_solaire = zodiac.name;
      }

      if (photoUrl) {
        updateData.photos = [photoUrl];
        updateData.avatar_url = photoUrl;
      }

      const { error: updateError } = await supabase
        .from('astra_profiles')
        .update(updateData)
        .eq('id', user!.id);

      if (updateError) throw updateError;

      onComplete();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-y-auto overflow-x-hidden bg-black">
      <div className="starfield fixed inset-0 pointer-events-none" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 py-12">
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs sm:text-sm font-semibold tracking-wider text-white/60">
                Étape {step} / {totalSteps}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out relative"
                style={{
                  width: `${(step / totalSteps) * 100}%`,
                  background: 'linear-gradient(90deg, #E91E63 0%, #F06292 100%)',
                  boxShadow: '0 0 20px rgba(233, 30, 99, 0.6)'
                }}
              >
                <div className="absolute inset-0 shimmer" />
              </div>
            </div>
          </div>

          <div
            className="rounded-3xl p-8 sm:p-12 backdrop-blur-xl"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
          >
            {error && (
              <div
                className="mb-6 p-4 rounded-2xl text-center text-sm font-semibold animate-pulse"
                style={{
                  backgroundColor: 'rgba(233, 30, 99, 0.1)',
                  border: '1px solid #E91E63',
                  color: '#E91E63'
                }}
              >
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="text-center mb-10">
                <div className="text-6xl mb-6">❤️</div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                  Parle-nous de toi
                </h2>
                <p className="text-white/60 text-lg">
                  Pour te guider au mieux, Astra a besoin d'en savoir un peu plus ✨
                </p>
              </div>
            )}

            <div className="flex flex-col space-y-8">
              {step === 1 && (
                <>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 text-xl font-semibold text-white">
                      <span className="text-2xl">👤</span>
                      Ton prénom
                    </label>
                  </div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alex"
                    autoFocus
                    className="w-full px-6 py-5 text-xl sm:text-2xl font-semibold rounded-2xl outline-none transition-all duration-300 bg-white/5 text-white border-2 border-white/20 focus:border-[#E91E63] placeholder:text-white/30"
                    style={{ caretColor: '#E91E63' }}
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-3 mb-4">
                    <label className="flex items-center gap-3 text-xl font-semibold text-white">
                      <span className="text-2xl">📅</span>
                      Ta date de naissance
                    </label>
                    <p className="text-white/60 text-sm">Pour calculer ton signe astrologique</p>
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
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    className="w-full px-6 py-5 text-xl sm:text-2xl font-semibold rounded-2xl outline-none transition-all duration-300 bg-white/5 text-white border-2 border-white/20 focus:border-[#E91E63]"
                    style={{ caretColor: '#E91E63', colorScheme: 'dark' }}
                  />
                  {birthDate && (
                    <div className="mt-4 p-4 bg-red-600/10 border border-red-600/30 rounded-xl">
                      <div className="text-white text-center">
                        <div className="text-3xl mb-2">{getZodiacSign(birthDate).emoji}</div>
                        <div className="font-semibold">{getZodiacSign(birthDate).name}</div>
                        <div className="text-sm text-white/60 mt-1">{age} ans</div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-3 mb-4">
                    <label className="flex items-center gap-3 text-xl font-semibold text-white">
                      <Clock className="w-6 h-6 text-red-400" />
                      Heure de naissance (optionnel)
                    </label>
                    <p className="text-white/60 text-sm">Pour une analyse astrologique complète</p>
                  </div>
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-full px-6 py-5 text-xl sm:text-2xl font-semibold rounded-2xl outline-none transition-all duration-300 bg-white/5 text-white border-2 border-white/20 focus:border-[#E91E63]"
                    style={{ caretColor: '#E91E63', colorScheme: 'dark' }}
                  />
                  <button
                    onClick={() => setStep(step + 1)}
                    className="mt-4 w-full py-3 text-sm text-white/60 hover:text-white transition-colors"
                  >
                    Passer cette étape
                  </button>
                </>
              )}

              {step === 4 && (
                <>
                  <div className="space-y-3 mb-4">
                    <label className="flex items-center gap-3 text-xl font-semibold text-white">
                      <span className="text-2xl">🎭</span>
                      Tu es...
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {GENDER_OPTIONS.map((option) => (
                      <button
                        key={option.label}
                        onClick={() => setGender(option.label)}
                        className="p-6 rounded-2xl transition-all duration-300 flex flex-col items-center gap-3"
                        style={{
                          backgroundColor: gender === option.label ? '#E91E63' : 'rgba(255, 255, 255, 0.05)',
                          border: `2px solid ${gender === option.label ? '#E91E63' : 'rgba(255, 255, 255, 0.1)'}`,
                          boxShadow: gender === option.label ? '0 8px 32px rgba(233, 30, 99, 0.4)' : 'none'
                        }}
                      >
                        <span className="text-4xl">{option.emoji}</span>
                        <span className="text-base font-bold text-white text-center">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 5 && (
                <>
                  <div className="space-y-3 mb-4">
                    <label className="flex items-center gap-3 text-xl font-semibold text-white">
                      <span className="text-2xl">💕</span>
                      Tu cherches...
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {SEEKING_OPTIONS.map((option) => (
                      <button
                        key={option.label}
                        onClick={() => setSeeking(option.label)}
                        className="p-6 rounded-2xl transition-all duration-300 flex flex-col items-center gap-3"
                        style={{
                          backgroundColor: seeking === option.label ? '#E91E63' : 'rgba(255, 255, 255, 0.05)',
                          border: `2px solid ${seeking === option.label ? '#E91E63' : 'rgba(255, 255, 255, 0.1)'}`,
                          boxShadow: seeking === option.label ? '0 8px 32px rgba(233, 30, 99, 0.4)' : 'none'
                        }}
                      >
                        <span className="text-4xl">{option.emoji}</span>
                        <span className="text-base font-bold text-white text-center">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 6 && (
                <>
                  <div className="space-y-3 mb-4">
                    <label className="flex items-center gap-3 text-xl font-semibold text-white">
                      <span className="text-2xl">📊</span>
                      Tranche d'âge préférée
                    </label>
                    <p className="text-white/60 text-sm ml-11">
                      Quel âge doivent avoir tes matchs ?
                    </p>
                  </div>
                  <div className="space-y-8 py-4">
                    <div>
                      <label className="block text-white/80 text-base font-semibold mb-4">
                        Âge minimum : {ageMin} ans
                      </label>
                      <input
                        type="range"
                        min="18"
                        max="120"
                        value={ageMin}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setAgeMin(val);
                          if (val > ageMax) setAgeMax(val);
                        }}
                        className="w-full h-2 rounded-full cursor-pointer appearance-none bg-white/10"
                        style={{ accentColor: '#E91E63' }}
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-base font-semibold mb-4">
                        Âge maximum : {ageMax} ans
                      </label>
                      <input
                        type="range"
                        min="18"
                        max="120"
                        value={ageMax}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setAgeMax(val);
                          if (val < ageMin) setAgeMin(val);
                        }}
                        className="w-full h-2 rounded-full cursor-pointer appearance-none bg-white/10"
                        style={{ accentColor: '#E91E63' }}
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 7 && (
                <>
                  <div className="space-y-3 mb-4">
                    <label className="flex items-center gap-3 text-xl font-semibold text-white">
                      <span className="text-2xl">📍</span>
                      Ta ville
                    </label>
                    <p className="text-white/60 text-sm ml-11">
                      Où te trouves-tu ?
                    </p>
                  </div>
                  <CitySearchInput
                    value={ville}
                    onChange={setVille}
                    placeholder="Paris, Lyon, Marseille..."
                  />
                </>
              )}

              {step === 8 && (
                <>
                  <div className="space-y-3 mb-4">
                    <label className="flex items-center gap-3 text-xl font-semibold text-white">
                      <Target className="w-6 h-6 text-red-400" />
                      Ton objectif
                    </label>
                    <p className="text-white/60 text-sm ml-11">
                      Que recherches-tu sur Astra ?
                    </p>
                  </div>
                  <div className="space-y-3">
                    {GOAL_OPTIONS.map((option) => (
                      <button
                        key={option}
                        onClick={() => setGoal(option)}
                        className="w-full p-4 rounded-2xl transition-all duration-300 flex items-center gap-3 text-left"
                        style={{
                          backgroundColor: goal === option ? '#E91E63' : 'rgba(255, 255, 255, 0.05)',
                          border: `2px solid ${goal === option ? '#E91E63' : 'rgba(255, 255, 255, 0.1)'}`,
                          boxShadow: goal === option ? '0 8px 32px rgba(233, 30, 99, 0.4)' : 'none'
                        }}
                      >
                        <span className="text-2xl">🎯</span>
                        <span className="text-base font-semibold text-white">{option}</span>
                      </button>
                    ))}
                    {goal === 'Autre' && (
                      <input
                        type="text"
                        value={goalOther}
                        onChange={(e) => setGoalOther(e.target.value)}
                        placeholder="Précise..."
                        autoFocus
                        className="w-full px-5 py-4 text-base font-medium rounded-2xl outline-none transition-all duration-300 bg-white/5 text-white border-2 border-white/20 focus:border-[#E91E63] placeholder:text-white/30"
                        style={{ caretColor: '#E91E63' }}
                      />
                    )}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-red-600/20 p-6 safe-area-inset z-50">
        <div className="max-w-lg mx-auto flex gap-4">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-all"
            >
              Retour
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:from-red-700 hover:to-red-800 disabled:from-gray-700 disabled:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Chargement...' : (step === totalSteps ? 'Commencer' : 'Suivant')}
          </button>
        </div>
      </div>

      <style>{`
        .starfield {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #000000;
          overflow: hidden;
        }

        .starfield::before,
        .starfield::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background-image:
            radial-gradient(2px 2px at 20px 30px, white, transparent),
            radial-gradient(2px 2px at 60px 70px, white, transparent),
            radial-gradient(1px 1px at 50px 50px, white, transparent),
            radial-gradient(1px 1px at 130px 80px, white, transparent),
            radial-gradient(2px 2px at 90px 10px, white, transparent),
            radial-gradient(1px 1px at 20px 100px, rgba(233, 30, 99, 0.3), transparent),
            radial-gradient(1px 1px at 150px 150px, rgba(233, 30, 99, 0.2), transparent);
          background-size: 200px 200px;
          animation: stars 60s linear infinite;
        }

        .starfield::after {
          background-image:
            radial-gradient(2px 2px at 100px 120px, white, transparent),
            radial-gradient(1px 1px at 160px 60px, white, transparent),
            radial-gradient(1px 1px at 40px 80px, white, transparent),
            radial-gradient(2px 2px at 180px 30px, white, transparent),
            radial-gradient(1px 1px at 10px 140px, white, transparent),
            radial-gradient(1px 1px at 120px 180px, rgba(233, 30, 99, 0.2), transparent);
          background-size: 200px 200px;
          animation: stars 90s linear infinite;
        }

        @keyframes stars {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-200px);
          }
        }

        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #E91E63;
          cursor: pointer;
          box-shadow: 0 0 20px rgba(233, 30, 99, 0.6);
        }

        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #E91E63;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 20px rgba(233, 30, 99, 0.6);
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
