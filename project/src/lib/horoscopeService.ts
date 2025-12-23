import { supabase } from './supabase';
import { getSignDateRange } from '../data/zodiacSigns';

export interface DailyHoroscope {
  sign: string;
  date: string;
  description: string;
  mood?: string;
  color?: string;
  luckyNumber?: number;
  luckyTime?: string;
  compatibility?: string;
  dateRange: string;
  currentDate: string;
  error?: boolean;
}

interface HoroscopeCache {
  horoscope: DailyHoroscope;
  timestamp: number;
  expiresAt: number;
}

const convertSignToEnglish = (frenchSign: string): string => {
  const signMap: Record<string, string> = {
    'bélier': 'aries',
    'taureau': 'taurus',
    'gémeaux': 'gemini',
    'cancer': 'cancer',
    'lion': 'leo',
    'vierge': 'virgo',
    'balance': 'libra',
    'scorpion': 'scorpio',
    'sagittaire': 'sagittarius',
    'capricorne': 'capricorn',
    'verseau': 'aquarius',
    'poissons': 'pisces'
  };

  return signMap[frenchSign.toLowerCase()] || frenchSign.toLowerCase();
};

const fetchFromAztroAPI = async (sign: string): Promise<DailyHoroscope | null> => {
  try {
    console.log('[Horoscope] Tentative Aztro API...');
    const englishSign = convertSignToEnglish(sign);

    const response = await fetch(`https://aztro.sameerkumar.website/?sign=${englishSign}&day=today`, {
      method: 'POST'
    });

    if (!response.ok) throw new Error('Aztro API error');

    const data = await response.json();

    return {
      sign: sign,
      date: new Date().toLocaleDateString('fr-FR'),
      description: data.description,
      mood: data.mood,
      color: data.color,
      luckyNumber: parseInt(data.lucky_number) || Math.floor(Math.random() * 100),
      luckyTime: data.lucky_time,
      compatibility: data.compatibility,
      dateRange: data.date_range || getSignDateRange(sign),
      currentDate: data.current_date || new Date().toISOString()
    };
  } catch (error) {
    console.error('[Horoscope] Aztro API échouée:', error);
    return null;
  }
};

const fetchFromHoroscopeAPI = async (sign: string): Promise<DailyHoroscope | null> => {
  try {
    console.log('[Horoscope] Tentative Horoscope App API...');
    const englishSign = convertSignToEnglish(sign);

    const response = await fetch(
      `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${englishSign}&day=TODAY`
    );

    if (!response.ok) throw new Error('Horoscope API error');

    const data = await response.json();

    if (!data.data || !data.data.horoscope_data) {
      throw new Error('Invalid response format');
    }

    return {
      sign: sign,
      date: new Date().toLocaleDateString('fr-FR'),
      description: data.data.horoscope_data,
      mood: 'Positif',
      color: '#E94057',
      luckyNumber: Math.floor(Math.random() * 100),
      luckyTime: 'Toute la journée',
      compatibility: 'Voir compatibilité',
      dateRange: getSignDateRange(sign),
      currentDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Horoscope] Horoscope API échouée:', error);
    return null;
  }
};

const saveToSupabaseCache = async (sign: string, horoscope: DailyHoroscope): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    await supabase
      .from('horoscope_cache')
      .upsert({
        zodiac_sign: sign.toLowerCase(),
        date: today,
        daily_data: horoscope,
        expires_at: new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
      }, {
        onConflict: 'zodiac_sign,date'
      });

    console.log('[Horoscope] Sauvegardé dans Supabase cache');
  } catch (error) {
    console.error('[Horoscope] Erreur sauvegarde Supabase:', error);
  }
};

const loadFromSupabaseCache = async (sign: string): Promise<DailyHoroscope | null> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('horoscope_cache')
      .select('*')
      .eq('zodiac_sign', sign.toLowerCase())
      .eq('date', today)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error || !data) return null;

    console.log('[Horoscope] Chargé depuis Supabase cache');
    return data.daily_data as DailyHoroscope;
  } catch (error) {
    console.error('[Horoscope] Erreur lecture Supabase cache:', error);
    return null;
  }
};

const getFromLocalStorageCache = (sign: string): DailyHoroscope | null => {
  try {
    const today = new Date().toDateString();
    const cacheKey = `horoscope_${sign}_${today}`;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return null;

    const cacheData: HoroscopeCache = JSON.parse(cached);

    if (Date.now() < cacheData.expiresAt) {
      console.log('[Horoscope] Chargé depuis localStorage cache');
      return cacheData.horoscope;
    }

    localStorage.removeItem(cacheKey);
    return null;
  } catch (error) {
    console.error('[Horoscope] Erreur lecture localStorage:', error);
    return null;
  }
};

const saveToLocalStorageCache = (sign: string, horoscope: DailyHoroscope): void => {
  try {
    const today = new Date().toDateString();
    const cacheKey = `horoscope_${sign}_${today}`;

    const cache: HoroscopeCache = {
      horoscope: horoscope,
      timestamp: Date.now(),
      expiresAt: new Date().setHours(23, 59, 59, 999)
    };

    localStorage.setItem(cacheKey, JSON.stringify(cache));
    console.log('[Horoscope] Sauvegardé dans localStorage cache');
  } catch (error) {
    console.error('[Horoscope] Erreur sauvegarde localStorage:', error);
  }
};

export const fetchDailyHoroscope = async (sign: string): Promise<DailyHoroscope> => {
  try {
    console.log(`[Horoscope] Récupération horoscope pour ${sign}...`);

    const localCache = getFromLocalStorageCache(sign);
    if (localCache) return localCache;

    const supabaseCache = await loadFromSupabaseCache(sign);
    if (supabaseCache) {
      saveToLocalStorageCache(sign, supabaseCache);
      return supabaseCache;
    }

    let horoscope = await fetchFromAztroAPI(sign);

    if (!horoscope) {
      horoscope = await fetchFromHoroscopeAPI(sign);
    }

    if (!horoscope) {
      throw new Error('Toutes les APIs ont échoué');
    }

    saveToLocalStorageCache(sign, horoscope);
    await saveToSupabaseCache(sign, horoscope);

    return horoscope;
  } catch (error) {
    console.error('[Horoscope] Erreur complète:', error);

    return {
      sign: sign,
      date: new Date().toLocaleDateString('fr-FR'),
      description: "L'horoscope du jour n'est pas disponible pour le moment. Réessaie dans quelques instants ! ✨",
      dateRange: getSignDateRange(sign),
      currentDate: new Date().toISOString(),
      error: true
    };
  }
};

export const clearHoroscopeCache = (sign: string): void => {
  try {
    const today = new Date().toDateString();
    const cacheKey = `horoscope_${sign}_${today}`;
    localStorage.removeItem(cacheKey);
    console.log('[Horoscope] Cache local supprimé');
  } catch (error) {
    console.error('[Horoscope] Erreur suppression cache:', error);
  }
};

export const getAstraAdvice = (mood?: string): string => {
  if (!mood) {
    return "Suis ton intuition aujourd'hui sur Astra. L'univers te guidera vers les bonnes connexions ! ✨";
  }

  const positiveModds = ['happy', 'optimistic', 'joyful', 'cheerful', 'excited'];
  const isPositive = positiveModds.some(m => mood.toLowerCase().includes(m));

  if (isPositive) {
    return "C'est un excellent jour pour être proactif(ve) sur Astra ! Envoie des messages, utilise tes Super Likes. L'énergie cosmique est avec toi ! 🚀";
  }

  return "Prends ton temps aujourd'hui. Concentre-toi sur la qualité plutôt que la quantité. Réponds à tes matchs avec attention. Les astres te conseillent la patience. ✨";
};
