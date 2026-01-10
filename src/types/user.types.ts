// ═══════════════════════════════════════════════════════════════════════
// USER TYPES
// ═══════════════════════════════════════════════════════════════════════

export type Gender = 'man' | 'woman' | 'non-binary';

export type SubscriptionTier = 'free' | 'premium' | 'elite';

export interface BirthPlace {
  city: string;
  lat: number;
  lng: number;
  timezone: string;
}

export interface Photo {
  url: string;
  order: number;
  isPrimary: boolean;
}

export interface Profile {
  id: string;
  
  // Infos de base
  firstName: string;
  birthDate: string; // ISO date
  birthTime: string; // HH:MM format
  birthPlace: BirthPlace;
  gender: Gender;
  lookingFor: Gender[];
  bio?: string;
  
  // Localisation actuelle
  currentCity?: string;
  currentLat?: number;
  currentLng?: number;
  searchRadiusKm: number;
  
  // Photos
  photos: Photo[];
  avatarUrl?: string;
  
  // Astro (calculé)
  sunSign: string;
  moonSign: string;
  ascendantSign: string;
  natalChartData: NatalChartData;
  
  // Énergies
  energyFire: number;
  energyEarth: number;
  energyAir: number;
  energyWater: number;
  
  // Métadonnées
  isProfileComplete: boolean;
  onboardingCompleted: boolean;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
  
  // Modération
  isVerified: boolean;
  isBanned: boolean;
  banReason?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  startsAt: string;
  endsAt?: string;
  cancelledAt?: string;
  amountCents?: number;
  currency: string;
  billingPeriod?: 'monthly' | 'yearly';
  isTrial: boolean;
  trialEndsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quota {
  id: string;
  userId: string;
  astraMessagesUsed: number;
  astraMessagesLimit: number;
  universClicksUsed: number;
  universClicksLimit: number;
  resetsAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface NatalChartData {
  // Planètes personnelles
  sun: PlanetPosition;
  moon: PlanetPosition;
  mercury: PlanetPosition;
  venus: PlanetPosition;
  mars: PlanetPosition;
  
  // Planètes sociales
  jupiter: PlanetPosition;
  saturn: PlanetPosition;
  
  // Planètes transcendantes
  uranus: PlanetPosition;
  neptune: PlanetPosition;
  pluto: PlanetPosition;
  
  // Ascendant
  ascendant: PlanetPosition;
  
  // Maisons (12)
  houses: HousePosition[];
  
  // Aspects majeurs
  aspects: Aspect[];
}

export interface PlanetPosition {
  sign: string;
  degree: number;
  house: number;
  isRetrograde: boolean;
}

export interface HousePosition {
  number: number;
  sign: string;
  degree: number;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
  degree: number;
  orb: number;
}
