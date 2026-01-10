import { supabase } from './supabase';

export type HoroscopeTier = 'free' | 'premium' | 'elite';

export interface HybridHoroscopeResponse {
  tier: HoroscopeTier;
  date: string;
  zodiacSign: string;
  description: string;
  mood?: string;
  color?: string;
  luckyNumber?: string;
  luckyTime?: string;
  compatibility?: string;
  majorTransits?: string[];
  minorTransits?: string[];
  planetaryPositions?: any;
  personalizedMessage?: string;
  birthChartAnalysis?: any;
  isPremiumContent?: boolean;
  isEliteContent?: boolean;
  upgradeMessage?: string;
}

export interface HoroscopeRequestParams {
  zodiacSign: string;
  tier: HoroscopeTier;
  userName?: string;
  birthDate?: string;
}

export class HybridHoroscopeService {
  private static instance: HybridHoroscopeService;
  private cache: Map<string, { data: HybridHoroscopeResponse; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 60 * 60 * 1000;

  private constructor() {}

  static getInstance(): HybridHoroscopeService {
    if (!HybridHoroscopeService.instance) {
      HybridHoroscopeService.instance = new HybridHoroscopeService();
    }
    return HybridHoroscopeService.instance;
  }

  async fetchHoroscope(params: HoroscopeRequestParams): Promise<HybridHoroscopeResponse> {
    const cacheKey = `${params.zodiacSign}_${params.tier}_${new Date().toDateString()}`;

    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('User must be authenticated');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-hybrid-horoscope`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch horoscope');
      }

      const data: HybridHoroscopeResponse = await response.json();

      this.cache.set(cacheKey, { data, timestamp: Date.now() });

      return data;
    } catch (error) {
      console.error('❌ Error fetching hybrid horoscope:', error);
      return this.getFallbackHoroscope(params.zodiacSign, params.tier);
    }
  }

  private getFallbackHoroscope(zodiacSign: string, tier: HoroscopeTier): HybridHoroscopeResponse {
    const baseHoroscope = {
      tier,
      date: new Date().toISOString().split('T')[0],
      zodiacSign,
      description: this.getGenericHoroscope(zodiacSign),
      mood: 'balanced',
      color: this.getSignColor(zodiacSign),
      luckyNumber: String(Math.floor(Math.random() * 100)),
    };

    if (tier === 'free') {
      return {
        ...baseHoroscope,
        isPremiumContent: false,
        upgradeMessage: 'Passez à Premium pour la compatibilité, les transits planétaires et des conseils personnalisés par IA.',
      };
    }

    return {
      ...baseHoroscope,
      luckyTime: 'afternoon',
      compatibility: this.getCompatibleSigns(zodiacSign),
      majorTransits: ['Flux d\'énergie positive', 'Opportunités de croissance'],
      isPremiumContent: true,
      isEliteContent: tier === 'elite',
    };
  }

  private getGenericHoroscope(sign: string): string {
    const horoscopes: Record<string, string> = {
      aries: "Votre leadership naturel brille aujourd'hui. Prenez l'initiative dans les projets qui comptent pour vous.",
      taurus: "La patience et la persévérance mènent au succès. Concentrez-vous sur vos objectifs à long terme et la stabilité.",
      gemini: "La communication est votre super-pouvoir aujourd'hui. Partagez vos idées et connectez-vous avec les autres.",
      cancer: "Faites confiance à votre intuition et cultivez des relations significatives. La maison apporte réconfort.",
      leo: "Votre confiance attire des opportunités positives. Soyez audacieux et exprimez-vous authentiquement.",
      virgo: "L'attention aux détails vous sert bien. Organisez, planifiez et perfectionnez votre art.",
      libra: "L'équilibre et l'harmonie sont à portée de main. Recherchez la beauté et l'équité dans toutes vos interactions.",
      scorpio: "Votre intensité et votre passion conduisent à la transformation. Embrassez les connexions émotionnelles profondes.",
      sagittarius: "L'aventure vous appelle. Élargissez vos horizons par l'apprentissage et l'exploration.",
      capricorn: "La discipline et l'ambition ouvrent votre chemin vers le succès. Restez concentré sur vos objectifs.",
      aquarius: "L'innovation et l'originalité vous distinguent. Pensez différemment et inspirez les autres.",
      pisces: "Votre empathie et créativité coulent abondamment. Faites confiance à vos rêves et votre intuition.",
    };

    return horoscopes[sign.toLowerCase()] || "Les étoiles s'alignent en votre faveur aujourd'hui. Faites confiance à votre parcours.";
  }

  private getSignColor(sign: string): string {
    const colors: Record<string, string> = {
      aries: 'red',
      taurus: 'green',
      gemini: 'yellow',
      cancer: 'silver',
      leo: 'gold',
      virgo: 'navy',
      libra: 'pink',
      scorpio: 'maroon',
      sagittarius: 'purple',
      capricorn: 'brown',
      aquarius: 'blue',
      pisces: 'sea green',
    };

    return colors[sign.toLowerCase()] || 'white';
  }

  private getCompatibleSigns(sign: string): string {
    const compatibility: Record<string, string> = {
      aries: 'Lion, Sagittaire, Gémeaux',
      taurus: 'Vierge, Capricorne, Cancer',
      gemini: 'Balance, Verseau, Bélier',
      cancer: 'Scorpion, Poissons, Taureau',
      leo: 'Bélier, Sagittaire, Balance',
      virgo: 'Taureau, Capricorne, Scorpion',
      libra: 'Gémeaux, Verseau, Lion',
      scorpio: 'Cancer, Poissons, Vierge',
      sagittarius: 'Bélier, Lion, Verseau',
      capricorn: 'Taureau, Vierge, Poissons',
      aquarius: 'Gémeaux, Balance, Sagittaire',
      pisces: 'Cancer, Scorpion, Capricorne',
    };

    return compatibility[sign.toLowerCase()] || 'Tous les signes';
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const hybridHoroscopeService = HybridHoroscopeService.getInstance();
