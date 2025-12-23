import { useState } from 'react';
import { SlidersHorizontal, X, Check, Star, MapPin, Heart } from 'lucide-react';

interface FilterOptions {
  ageMin: number;
  ageMax: number;
  distance: number;
  zodiacSigns: string[];
  gender: string;
  seeking: string;
  verified: boolean;
  premium: boolean;
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  onClose?: () => void;
}

const ZODIAC_SIGNS = [
  '♈ Bélier', '♉ Taureau', '♊ Gémeaux', '♋ Cancer',
  '♌ Lion', '♍ Vierge', '♎ Balance', '♏ Scorpion',
  '♐ Sagittaire', '♑ Capricorne', '♒ Verseau', '♓ Poissons'
];

export default function AdvancedFilters({ filters, onChange, onClose }: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const handleApply = () => {
    onChange(localFilters);
    onClose?.();
  };

  const handleReset = () => {
    const defaultFilters: FilterOptions = {
      ageMin: 18,
      ageMax: 99,
      distance: 100,
      zodiacSigns: [],
      gender: 'all',
      seeking: 'all',
      verified: false,
      premium: false
    };
    setLocalFilters(defaultFilters);
  };

  const toggleZodiac = (sign: string) => {
    const newSigns = localFilters.zodiacSigns.includes(sign)
      ? localFilters.zodiacSigns.filter(s => s !== sign)
      : [...localFilters.zodiacSigns, sign];
    setLocalFilters({ ...localFilters, zodiacSigns: newSigns });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border-2 border-red-500/30 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-black border-b border-red-500/30 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold text-white">Filtres avancés</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-white font-semibold mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Âge : {localFilters.ageMin} - {localFilters.ageMax} ans
            </label>
            <div className="flex gap-4 items-center">
              <input
                type="range"
                min="18"
                max="99"
                value={localFilters.ageMin}
                onChange={(e) => setLocalFilters({ ...localFilters, ageMin: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-red"
              />
              <input
                type="range"
                min="18"
                max="99"
                value={localFilters.ageMax}
                onChange={(e) => setLocalFilters({ ...localFilters, ageMax: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-red"
              />
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              Distance maximale : {localFilters.distance} km
            </label>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={localFilters.distance}
              onChange={(e) => setLocalFilters({ ...localFilters, distance: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-red"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5 km</span>
              <span>200 km</span>
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold mb-3">Je cherche :</label>
            <div className="grid grid-cols-3 gap-3">
              {['Une femme', 'Un homme', 'Les deux'].map((option) => (
                <button
                  key={option}
                  onClick={() => setLocalFilters({ ...localFilters, seeking: option })}
                  className={`py-3 px-4 rounded-xl font-medium transition-all ${
                    localFilters.seeking === option
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Signes astrologiques compatibles
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {ZODIAC_SIGNS.map((sign) => (
                <button
                  key={sign}
                  onClick={() => toggleZodiac(sign)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all relative ${
                    localFilters.zodiacSigns.includes(sign)
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-md'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {sign}
                  {localFilters.zodiacSigns.includes(sign) && (
                    <Check className="w-3 h-3 absolute top-1 right-1" />
                  )}
                </button>
              ))}
            </div>
            {localFilters.zodiacSigns.length > 0 && (
              <button
                onClick={() => setLocalFilters({ ...localFilters, zodiacSigns: [] })}
                className="mt-2 text-xs text-red-400 hover:text-red-300"
              >
                Effacer la sélection
              </button>
            )}
          </div>

          <div>
            <label className="block text-white font-semibold mb-3">Options</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-800 transition-colors">
                <input
                  type="checkbox"
                  checked={localFilters.verified}
                  onChange={(e) => setLocalFilters({ ...localFilters, verified: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-gray-600 bg-gray-700 checked:bg-red-600 checked:border-red-600"
                />
                <div className="flex-1">
                  <span className="text-white font-medium">Profils vérifiés uniquement</span>
                  <p className="text-xs text-gray-400">Afficher seulement les comptes vérifiés</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-800 transition-colors">
                <input
                  type="checkbox"
                  checked={localFilters.premium}
                  onChange={(e) => setLocalFilters({ ...localFilters, premium: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-gray-600 bg-gray-700 checked:bg-yellow-600 checked:border-yellow-600"
                />
                <div className="flex-1">
                  <span className="text-white font-medium">Membres Premium uniquement</span>
                  <p className="text-xs text-gray-400">Filtrer les utilisateurs premium</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gradient-to-t from-black via-black to-transparent p-6 border-t border-red-500/30 flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all"
          >
            Réinitialiser
          </button>
          <button
            onClick={handleApply}
            className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg"
          >
            Appliquer les filtres
          </button>
        </div>
      </div>

      <style>{`
        .slider-red::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #dc2626, #ec4899);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
        }

        .slider-red::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #dc2626, #ec4899);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
        }
      `}</style>
    </div>
  );
}
