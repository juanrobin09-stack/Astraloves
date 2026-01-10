import { useState, useRef, useEffect } from 'react';
import { MapPin, Loader, Navigation } from 'lucide-react';
import { searchCities, getCurrentLocation, type City } from '../lib/geolocation';

interface CitySearchInputProps {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  showGeolocation?: boolean;
}

export default function CitySearchInput({
  value,
  onChange,
  placeholder = 'Rechercher une ville...',
  showGeolocation = true
}: CitySearchInputProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      const cities = searchCities(query);
      setResults(cities);
    } else {
      setResults(searchCities(''));
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCity = (city: City) => {
    setQuery(city.displayName);
    onChange(city.displayName);
    setIsOpen(false);
  };

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    const location = await getCurrentLocation();
    setLoading(false);

    if (location) {
      const cityDisplay = `${location.city}, ${location.country}`;
      setQuery(cityDisplay);
      onChange(cityDisplay);
    } else {
      alert('Impossible de récupérer votre position. Veuillez saisir votre ville manuellement.');
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-600/50 transition-colors"
        />
      </div>

      {showGeolocation && (
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={loading}
          className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-600/30 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">Localisation en cours...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              <span className="text-sm">Utiliser ma position actuelle</span>
            </>
          )}
        </button>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-black/95 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
          {results.map((city, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectCity(city)}
              className="w-full px-4 py-3 text-left hover:bg-red-600/20 transition-colors flex items-center gap-3 border-b border-white/5 last:border-none"
            >
              <MapPin className="w-4 h-4 text-red-400 flex-shrink-0" />
              <div>
                <div className="text-white font-medium">{city.name}</div>
                <div className="text-gray-400 text-sm">{city.country}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
