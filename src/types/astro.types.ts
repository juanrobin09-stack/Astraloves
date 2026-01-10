// ═══════════════════════════════════════════════════════════════════════
// ASTRO TYPES
// ═══════════════════════════════════════════════════════════════════════

export interface CompatibilityScore {
  overall: number; // 0-100
  details: {
    elementalHarmony: number; // 0-100
    sunMoonAspect: number;
    venusAspect: number;
    marsAspect: number;
    ascendantCompatibility: number;
  };
  strengths: string[];
  challenges: string[];
  synastryAspects: SynastryAspect[];
}

export interface SynastryAspect {
  person1Planet: string;
  person2Planet: string;
  aspectType: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
  description: string;
  isHarmonious: boolean;
}

export interface Transit {
  planetName: string;
  sign: string;
  degree: number;
  house: number; // Dans le thème natal user
  aspectsToNatal: {
    natalPlanet: string;
    aspectType: string;
    orb: number;
  }[];
  interpretation: string;
}

export type HoroscopeType = 'daily' | 'weekly' | 'monthly';

export interface Horoscope {
  id: string;
  userId: string;
  type: HoroscopeType;
  periodStart: string;
  periodEnd: string;
  content: string;
  generatedAt: string;
}

export type ZodiacSign = 
  | 'aries' | 'taurus' | 'gemini' | 'cancer' 
  | 'leo' | 'virgo' | 'libra' | 'scorpio' 
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export type Element = 'fire' | 'earth' | 'air' | 'water';

export type Modality = 'cardinal' | 'fixed' | 'mutable';

export interface SignInfo {
  name: ZodiacSign;
  symbol: string;
  element: Element;
  modality: Modality;
  rulingPlanet: string;
  traits: string[];
}
