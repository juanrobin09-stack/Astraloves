// ═══════════════════════════════════════════════════════════════════════
// ASTRO HELPERS
// ═══════════════════════════════════════════════════════════════════════

import type { Element, ZodiacSign } from '@/types';

const SIGN_ELEMENTS: Record<ZodiacSign, Element> = {
  aries: 'fire',
  leo: 'fire',
  sagittarius: 'fire',
  taurus: 'earth',
  virgo: 'earth',
  capricorn: 'earth',
  gemini: 'air',
  libra: 'air',
  aquarius: 'air',
  cancer: 'water',
  scorpio: 'water',
  pisces: 'water',
};

export const getSignElement = (sign: string): Element => {
  return SIGN_ELEMENTS[sign as ZodiacSign] || 'air';
};

export const getElementalCompatibility = (sign1: string, sign2: string): number => {
  const element1 = getSignElement(sign1);
  const element2 = getSignElement(sign2);
  
  // Même élément = 100%
  if (element1 === element2) return 100;
  
  // Éléments compatibles
  const compatible: Record<Element, Element[]> = {
    fire: ['air'],
    air: ['fire'],
    earth: ['water'],
    water: ['earth'],
  };
  
  if (compatible[element1]?.includes(element2)) return 80;
  
  // Éléments conflictuels
  return 50;
};

export const calculateAspectOrb = (degree1: number, degree2: number): number => {
  const diff = Math.abs(degree1 - degree2);
  return Math.min(diff, 360 - diff);
};

export const getAspectType = (orb: number): string | null => {
  if (orb <= 10) return 'conjunction';
  if (orb >= 50 && orb <= 70) return 'sextile';
  if (orb >= 80 && orb <= 100) return 'square';
  if (orb >= 110 && orb <= 130) return 'trine';
  if (orb >= 170 && orb <= 190) return 'opposition';
  return null;
};

export const isHarmoniousAspect = (aspectType: string): boolean => {
  return ['conjunction', 'sextile', 'trine'].includes(aspectType);
};

export const calculateElementalEnergies = (
  planets: Record<string, { sign: string }>
): { fire: number; earth: number; air: number; water: number } => {
  const counts = { fire: 0, earth: 0, air: 0, water: 0 };
  
  Object.values(planets).forEach((planet) => {
    const element = getSignElement(planet.sign);
    counts[element]++;
  });
  
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  
  return {
    fire: Math.round((counts.fire / total) * 100),
    earth: Math.round((counts.earth / total) * 100),
    air: Math.round((counts.air / total) * 100),
    water: Math.round((counts.water / total) * 100),
  };
};
