import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Loader } from 'lucide-react';
import {
  searchFrenchCities,
  getUserLocation,
  getCityByCoordinates,
  type FrenchCity,
} from '../lib/frenchCitiesService';

interface FrenchCityAutocompleteProps {
  value: FrenchCity | null;
  onChange: (city: FrenchCity | null) => void;
  showGeolocation?: boolean;
}

export default function FrenchCityAutocomplete({
  value,
  onChange,
  showGeolocation = true,
}: FrenchCityAutocompleteProps) {
  const [query, setQuery] = useState(value?.nom || '');
  const [suggestions, setSuggestions] = useState<FrenchCity[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        const results = await searchFrenchCities(query);
        setSuggestions(results);
        setLoading(false);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const useMyLocation = async () => {
    setGeoLoading(true);
    const coords = await getUserLocation();

    if (coords) {
      const city = await getCityByCoordinates(coords.lat, coords.lng);
      if (city) {
        onChange(city);
        setQuery(city.nom);
        setShowSuggestions(false);
      }
    }

    setGeoLoading(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
          🔍
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Rechercher une ville..."
          className="w-full py-4 pl-12 pr-4 rounded-2xl
                     bg-[#111111] border border-[#333333]
                     text-white placeholder-[#666666]
                     focus:border-[#DC2626] focus:outline-none"
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader className="w-5 h-5 animate-spin text-red-600" />
          </span>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-2
                        bg-[#111111] border border-[#333333] rounded-2xl
                        overflow-hidden z-50 max-h-60 overflow-y-auto"
        >
          {suggestions.map((ville, index) => (
            <button
              key={index}
              onClick={() => {
                onChange(ville);
                setQuery(ville.nom);
                setShowSuggestions(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-[#1A1A1A]
                         flex items-center gap-3 border-b border-[#222222] last:border-0"
            >
              <span className="text-[#DC2626]">📍</span>
              <div>
                <div className="text-white">{ville.nom}</div>
                <div className="text-[#666666] text-sm">{ville.codePostal}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showGeolocation && (
        <button
          type="button"
          onClick={useMyLocation}
          disabled={geoLoading}
          className="mt-3 flex items-center gap-2 text-[#DC2626] hover:text-[#EF4444] disabled:opacity-50"
        >
          {geoLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Localisation en cours...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              <span>Utiliser ma position actuelle</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
