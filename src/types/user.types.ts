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
  first_name: string;
  birth_date: string; // ISO date
  birth_time: string; // HH:MM format
  birth_place: BirthPlace;
  gender: Gender;
  looking_for: Gender[];
  bio?: string;
  
  // Localisation actuelle
  current_city?: string;
  current_lat?: number;
  current_lng?: number;
  search_radius_km: number;
  
  // Photos
  photos: Photo[];
  avatar_url?: string;
  
  // Astro (calculé)
  sun_sign: string;
  moon_sign: string;
  ascendant_sign: string;
  natal_chart_data: NatalChartData;
  
  // Énergies
  energy_fire: number;
  energy_earth: number;
  energy_air: number;
  energy_water: number;
  
  // Métadonnées
  is_profile_complete: boolean;
  onboarding_completed: boolean;
  onboarding_step?: number;
  onboarding_completed_at?: string;
  last_active_at: string;
  created_at: string;
  updated_at: string;
  
  // Modération
  is_verified: boolean;
  is_banned: boolean;
  ban_reason?: string;
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
  // Snake_case aliases for Supabase compatibility
  astra_messages_used?: number;
  astra_messages_limit?: number;
  univers_clicks_used?: number;
  univers_clicks_limit?: number;
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
