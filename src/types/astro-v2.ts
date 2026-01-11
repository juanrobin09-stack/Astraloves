// ═══════════════════════════════════════════════════════════════════════
// ASTRO V2 - TYPES TYPESCRIPT
// ═══════════════════════════════════════════════════════════════════════

export type Tier = 'free' | 'premium' | 'elite';

export type ZodiacSign = 
  | 'aries' | 'taurus' | 'gemini' | 'cancer' 
  | 'leo' | 'virgo' | 'libra' | 'scorpio' 
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export type CyclePhase = 'ouverture' | 'expansion' | 'tri' | 'retrait' | 'intégration';

export type LunarPhase = 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' 
  | 'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOROSCOPE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface HoroscopeBase {
  mainText: string;
  conseil: string;
}

export interface HoroscopePremium extends HoroscopeBase {
  amour: string;
  carriere: string;
  relations: string;
  astraNote: string;
}

export interface HoroscopeElite extends HoroscopePremium {
  guardianAlert?: GuardianAlert;
}

export type Horoscope = HoroscopeBase | HoroscopePremium | HoroscopeElite;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ÉNERGIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface DailyEnergies {
  vitality: Energy;
  creativity: Energy;
  love: Energy;
  luck: Energy;
}

export interface Energy {
  value: number; // 0-100
  description: string;
  icon: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPATIBILITÉ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface CompatibilityBasic {
  sign: ZodiacSign;
  emoji: string;
  level: 'high' | 'medium' | 'low';
}

export interface CompatibilityDetailed extends CompatibilityBasic {
  score: number;
  analysis: {
    works: string[];
    attention: string[];
  };
  universeLink?: string;
}

export type Compatibility = CompatibilityBasic | CompatibilityDetailed;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CHALLENGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Challenge {
  id: string;
  text: string;
  xp: number;
  category: 'communication' | 'boundaries' | 'introspection' | 'action';
  completedAt: Date | null;
  createdAt: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CYCLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface CurrentCycle {
  phase: CyclePhase;
  daysActive: number;
  daysRemaining: number;
  meaning: {
    demands: string[];
    energy: string;
    astraMessage: string;
  };
  practical: string[];
  nextPhase: {
    phase: CyclePhase;
    startDate: Date;
    preview: string;
  };
}

export interface LongCycle {
  name: string;
  type: 'saturn' | 'jupiter' | 'uranus' | 'neptune' | 'pluto';
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  meaning: {
    soulWork: string[];
    whyRepeats: string;
  };
  pattern?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MÉMOIRE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface AstralMemory {
  id: string;
  date: Date;
  transit: string;
  pattern: string;
  advice: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HISTORIQUE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface EnergyHistory {
  date: Date;
  energies: DailyEnergies;
}

export interface HistoryData {
  period: '7d' | '30d' | '90d';
  data: EnergyHistory[];
  insights: string[];
  evolution: {
    challengesCompleted: {
      total: number;
      trend: number;
    };
    alignmentAverage: {
      value: number;
      trend: number;
    };
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THÈME ASTRAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Planet {
  symbol: string;
  sign: ZodiacSign;
  house: number;
  meaning: {
    core: string;
    wound?: string;
    work?: string;
    motor?: string;
    trap?: string;
    challenge?: string;
  };
}

export interface NatalChart {
  sun: Planet;
  moon: Planet;
  ascendant: {
    sign: ZodiacSign;
    meaning: {
      mask: string;
      avoidance: string;
      challenge: string;
    };
  };
  chiron?: Planet; // Blessure
  northNode?: Planet; // Direction de l'âme
  liveUpdates: LiveUpdate[];
}

export interface LiveUpdate {
  date: Date;
  observation: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GUARDIAN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface GuardianAlert {
  id: string;
  level: 'low' | 'medium' | 'high';
  type: 'karmic_repetition' | 'sensitive_period' | 'pattern_warning';
  title: string;
  message: string;
  recommendation?: {
    action: 'silence_actif' | 'wait' | 'clarify' | 'pause';
    until?: Date;
  };
  createdAt: Date;
}

export interface DetectedPattern {
  name: string;
  frequency: number;
  lastOccurrence: Date;
  astrological: string;
  nextRisk?: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GUIDANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Guidance {
  currentPhase: CyclePhase;
  daysRemaining: number;
  strategic: {
    notFor: string[];
    isFor: string[];
  };
  timing: {
    doNow: string[];
    avoid: string[];
  };
  astraVoice: string;
  upcomingShift?: {
    date: Date;
    phase: CyclePhase;
    preview: string;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SERVICE INPUTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface HoroscopeInput {
  userId: string;
  sunSign: ZodiacSign;
  moonSign?: ZodiacSign;
  ascendant?: ZodiacSign;
  userName: string;
  tier: Tier;
  declaredMood?: string;
}

export interface EnergiesInput {
  sunSign: ZodiacSign;
  moonSign?: ZodiacSign;
  date: Date;
}
