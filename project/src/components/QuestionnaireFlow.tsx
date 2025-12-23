import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface QuestionnaireFlowProps {
  onComplete: () => void;
}

const ZODIAC_SIGNS = {
  'Bélier': { emoji: '♈', dates: 'Mars 21 - Avril 19' },
  'Taureau': { emoji: '♉', dates: 'Avril 20 - Mai 20' },
  'Gémeaux': { emoji: '♊', dates: 'Mai 21 - Juin 20' },
  'Cancer': { emoji: '♋', dates: 'Juin 21 - Juillet 22' },
  'Lion': { emoji: '♌', dates: 'Juillet 23 - Août 22' },
  'Vierge': { emoji: '♍', dates: 'Août 23 - Sept 22' },
  'Balance': { emoji: '♎', dates: 'Sept 23 - Oct 22' },
  'Scorpion': { emoji: '♏', dates: 'Oct 23 - Nov 21' },
  'Sagittaire': { emoji: '♐', dates: 'Nov 22 - Déc 21' },
  'Capricorne': { emoji: '♑', dates: 'Déc 22 - Jan 19' },
  'Verseau': { emoji: '♒', dates: 'Jan 20 - Fév 18' },
  'Poissons': { emoji: '♓', dates: 'Fév 19 - Mars 20' },
};

const VALUES_OPTIONS = [
  { id: 'amour', emoji: '❤️', label: 'Amour' },
  { id: 'voyages', emoji: '🌍', label: 'Voyages' },
  { id: 'art', emoji: '🎨', label: 'Art' },
  { id: 'carriere', emoji: '💼', label: 'Carrière' },
  { id: 'famille', emoji: '🏡', label: 'Famille' },
  { id: 'education', emoji: '🎓', label: 'Éducation' },
  { id: 'spiritualite', emoji: '🧘', label: 'Spiritualité' },
  { id: 'fete', emoji: '🎉', label: 'Fête' },
  { id: 'sport', emoji: '⚽', label: 'Sport' },
  { id: 'nature', emoji: '🌳', label: 'Nature' },
  { id: 'culture', emoji: '📚', label: 'Culture' },
  { id: 'innovation', emoji: '💡', label: 'Innovation' },
];

const RELATIONSHIP_TYPES = [
  { id: 'serieuse', emoji: '💑', label: 'Relation sérieuse', desc: 'Je cherche l\'amour durable' },
  { id: 'amitie', emoji: '🌟', label: 'Amitié sincère', desc: 'Des connexions authentiques' },
  { id: 'legere', emoji: '🦋', label: 'Rencontres légères', desc: 'Sans pression, on verra' },
];

function calculateZodiacSign(birthDate: string): string {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Bélier';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taureau';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gémeaux';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Lion';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Vierge';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Balance';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpion';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittaire';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorne';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Verseau';
  return 'Poissons';
}

export default function QuestionnaireFlow({ onComplete }: QuestionnaireFlowProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [pseudoAvailable, setPseudoAvailable] = useState<boolean | null>(null);
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');

  const [ageMin, setAgeMin] = useState(23);
  const [ageMax, setAgeMax] = useState(35);
  const [seekingGender, setSeekingGender] = useState('');
  const [distanceMax, setDistanceMax] = useState(50);

  const [zodiacSign, setZodiacSign] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');

  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const [relationshipType, setRelationshipType] = useState('');

  useEffect(() => {
    if (birthDate) {
      const sign = calculateZodiacSign(birthDate);
      setZodiacSign(sign);
    }
  }, [birthDate]);

  useEffect(() => {
    const checkPseudo = async () => {
      if (!pseudo || pseudo.length < 3) {
        setPseudoAvailable(null);
        return;
      }

      const { data } = await supabase
        .from('astra_profiles')
        .select('pseudo')
        .eq('pseudo', pseudo)
        .maybeSingle();

      setPseudoAvailable(data === null);
    };

    const timer = setTimeout(checkPseudo, 500);
    return () => clearTimeout(timer);
  }, [pseudo]);

  const totalSteps = 5;

  const canContinue = () => {
    switch (currentStep) {
      case 1:
        return firstName && pseudo && pseudoAvailable && birthDate && gender;
      case 2:
        return seekingGender && ageMin && ageMax;
      case 3:
        return zodiacSign;
      case 4:
        return selectedValues.length === 3;
      case 5:
        return relationshipType;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      await saveProgress();
      setCurrentStep(currentStep + 1);
    } else {
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveProgress = async () => {
    if (!user?.id) return;

    const updates: any = {};

    if (currentStep >= 1) {
      updates.username = firstName;
      updates.pseudo = pseudo;
      updates.birth_date = birthDate;
      updates.gender = gender;
    }
    if (currentStep >= 2) {
      updates.age_min = ageMin;
      updates.age_max = ageMax;
      updates.gender_preference = seekingGender;
      updates.distance_max = distanceMax;
    }
    if (currentStep >= 3) {
      updates.signe_solaire = zodiacSign;
      updates.birth_time = birthTime || null;
      updates.birth_place = birthPlace || null;
    }
    if (currentStep >= 4) {
      updates.valeurs = selectedValues;
    }
    if (currentStep >= 5) {
      updates.looking_for = relationshipType;
    }

    await supabase
      .from('astra_profiles')
      .update(updates)
      .eq('id', user.id);
  };

  const handleComplete = async () => {
    setLoading(true);
    await saveProgress();
    setLoading(false);
    onComplete();
  };

  const toggleValue = (valueId: string) => {
    if (selectedValues.includes(valueId)) {
      setSelectedValues(selectedValues.filter(v => v !== valueId));
    } else if (selectedValues.length < 3) {
      setSelectedValues([...selectedValues, valueId]);
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center gap-2 mb-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-all ${
              i + 1 <= currentStep ? 'bg-red-500' : 'bg-gray-800'
            }`}
          />
        ))}
      </div>
      <p className="text-center text-gray-400 text-sm">Étape {currentStep}/{totalSteps}</p>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Faisons connaissance</h2>
        <p className="text-gray-400">Quelques informations de base</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Prénom</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Ton prénom"
          className="w-full bg-[#252525] border-2 border-[#2a2a2a] rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Pseudo unique</label>
        <div className="relative">
          <input
            type="text"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="ton_pseudo"
            className="w-full bg-[#252525] border-2 border-[#2a2a2a] rounded-xl py-3 px-4 pr-12 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
          />
          {pseudoAvailable !== null && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {pseudoAvailable ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <span className="text-red-500 text-xl">✗</span>
              )}
            </div>
          )}
        </div>
        {pseudoAvailable === false && (
          <p className="text-red-400 text-xs mt-1">Ce pseudo est déjà pris</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Date de naissance</label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          max={new Date(Date.now() - 567648000000).toISOString().split('T')[0]}
          className="w-full bg-[#252525] border-2 border-[#2a2a2a] rounded-xl py-3 px-4 text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Je suis</label>
        <div className="grid grid-cols-3 gap-3">
          {['Homme', 'Femme', 'Autre'].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`p-4 rounded-xl border-2 transition-all ${
                gender === g
                  ? 'bg-red-500/20 border-red-500 shadow-lg shadow-red-500/30'
                  : 'bg-[#252525] border-[#2a2a2a] hover:border-red-500/50'
              }`}
            >
              <div className="text-2xl mb-1">
                {g === 'Homme' ? '🕺' : g === 'Femme' ? '💃' : '✨'}
              </div>
              <div className="text-white text-sm font-medium">{g}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Préférences de matching</h2>
        <p className="text-gray-400">Qui aimerais-tu rencontrer ?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Je recherche</label>
        <div className="grid grid-cols-3 gap-3">
          {['Homme', 'Femme', 'Les deux'].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setSeekingGender(g)}
              className={`p-4 rounded-xl border-2 transition-all ${
                seekingGender === g
                  ? 'bg-red-500/20 border-red-500 shadow-lg shadow-red-500/30'
                  : 'bg-[#252525] border-[#2a2a2a] hover:border-red-500/50'
              }`}
            >
              <div className="text-2xl mb-1">
                {g === 'Homme' ? '🕺' : g === 'Femme' ? '💃' : '✨'}
              </div>
              <div className="text-white text-sm font-medium">{g}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Tranche d'âge : {ageMin} - {ageMax} ans
        </label>
        <div className="space-y-4">
          <div>
            <input
              type="range"
              min="18"
              max="65"
              value={ageMin}
              onChange={(e) => setAgeMin(Math.min(parseInt(e.target.value), ageMax - 1))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>
          <div>
            <input
              type="range"
              min="18"
              max="65"
              value={ageMax}
              onChange={(e) => setAgeMax(Math.max(parseInt(e.target.value), ageMin + 1))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Distance maximale : {distanceMax} km
        </label>
        <input
          type="range"
          min="5"
          max="100"
          step="5"
          value={distanceMax}
          onChange={(e) => setDistanceMax(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-500"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Astrologie</h2>
        <p className="text-gray-400">L'univers nous révèle qui tu es</p>
      </div>

      {zodiacSign && (
        <div className="bg-gradient-to-br from-red-500/20 to-purple-500/20 border-2 border-red-500/50 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">{ZODIAC_SIGNS[zodiacSign as keyof typeof ZODIAC_SIGNS]?.emoji}</div>
          <h3 className="text-2xl font-bold text-white mb-1">{zodiacSign}</h3>
          <p className="text-gray-400 text-sm">
            {ZODIAC_SIGNS[zodiacSign as keyof typeof ZODIAC_SIGNS]?.dates}
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Heure de naissance <span className="text-gray-500">(optionnel)</span>
        </label>
        <input
          type="time"
          value={birthTime}
          onChange={(e) => setBirthTime(e.target.value)}
          className="w-full bg-[#252525] border-2 border-[#2a2a2a] rounded-xl py-3 px-4 text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
        />
        <p className="text-xs text-gray-500 mt-1">Pour calculer ton ascendant</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Ville de naissance <span className="text-gray-500">(optionnel)</span>
        </label>
        <input
          type="text"
          value={birthPlace}
          onChange={(e) => setBirthPlace(e.target.value)}
          placeholder="Paris, France"
          className="w-full bg-[#252525] border-2 border-[#2a2a2a] rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
        />
        <p className="text-xs text-gray-500 mt-1">Pour ta carte natale complète</p>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Tes valeurs</h2>
        <p className="text-gray-400">Sélectionne 3 valeurs importantes pour toi</p>
        <p className="text-red-400 text-sm mt-2">{selectedValues.length}/3 sélectionnées</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {VALUES_OPTIONS.map((value) => (
          <button
            key={value.id}
            type="button"
            onClick={() => toggleValue(value.id)}
            disabled={!selectedValues.includes(value.id) && selectedValues.length >= 3}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedValues.includes(value.id)
                ? 'bg-red-500/20 border-red-500 shadow-lg shadow-red-500/30 scale-105'
                : 'bg-[#252525] border-[#2a2a2a] hover:border-red-500/50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="text-3xl mb-2">{value.emoji}</div>
            <div className="text-white text-xs font-medium">{value.label}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Type de relation</h2>
        <p className="text-gray-400">Que recherches-tu sur Astra ?</p>
      </div>

      <div className="space-y-4">
        {RELATIONSHIP_TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setRelationshipType(type.id)}
            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
              relationshipType === type.id
                ? 'bg-red-500/20 border-red-500 shadow-lg shadow-red-500/30'
                : 'bg-[#252525] border-[#2a2a2a] hover:border-red-500/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">{type.emoji}</div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-1">{type.label}</h3>
                <p className="text-gray-400 text-sm">{type.desc}</p>
              </div>
              {relationshipType === type.id && (
                <Check className="w-6 h-6 text-red-500" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Photo de profil <span className="text-gray-500">(optionnel)</span>
        </label>
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-red-500/50 transition-all cursor-pointer">
          <div className="text-4xl mb-2">📸</div>
          <p className="text-gray-400 text-sm">Clique pour ajouter une photo</p>
          <p className="text-gray-600 text-xs mt-1">Tu pourras en ajouter plus tard</p>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-[#1a1a1a] border-2 border-[#2a2a2a] rounded-3xl p-8 md:p-12">
          {renderProgressBar()}
          {renderCurrentStep()}

          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 py-3 px-6 bg-[#252525] border-2 border-[#2a2a2a] text-white rounded-xl hover:border-red-500/50 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Retour
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canContinue() || loading}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Finalisation...
                </>
              ) : currentStep === totalSteps ? (
                <>
                  Terminer
                  <Check className="w-5 h-5" />
                </>
              ) : (
                <>
                  Continuer
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
