// ═══════════════════════════════════════════════════════════════════════
// ASTRO CALCULATOR SERVICE - Calculs astrologiques complets
// ═══════════════════════════════════════════════════════════════════════

import { supabase } from '@/config/supabase';
import type { NatalChartData } from '@/types';

// Signes du zodiaque
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Éléments par signe
const SIGN_ELEMENTS: Record<string, string> = {
  Aries: 'fire', Taurus: 'earth', Gemini: 'air', Cancer: 'water',
  Leo: 'fire', Virgo: 'earth', Libra: 'air', Scorpio: 'water',
  Sagittarius: 'fire', Capricorn: 'earth', Aquarius: 'air', Pisces: 'water'
};

// Poids des planètes pour énergies élémentaires
const PLANET_WEIGHTS: Record<string, number> = {
  sun: 0.25, moon: 0.20, mercury: 0.10, venus: 0.10,
  mars: 0.10, jupiter: 0.08, saturn: 0.07, uranus: 0.03,
  neptune: 0.03, pluto: 0.02, ascendant: 0.02
};

export const astroCalculatorService = {
  /**
   * Calcule le thème natal complet
   * IMPORTANT: Implémentation simplifiée. En production, utiliser Swiss Ephemeris.
   */
  async calculateNatalChart(
    birthDate: string,
    birthTime: string,
    birthPlace: string
  ): Promise<NatalChartData> {
    try {
      // Parse date et heure
      const date = new Date(`${birthDate}T${birthTime}:00`);
      const julianDay = this.dateToJulianDay(date);

      // Calculer positions planétaires (approximation)
      const sun = this.calculatePlanetPosition(julianDay, 'sun');
      const moon = this.calculatePlanetPosition(julianDay, 'moon');
      const mercury = this.calculatePlanetPosition(julianDay, 'mercury');
      const venus = this.calculatePlanetPosition(julianDay, 'venus');
      const mars = this.calculatePlanetPosition(julianDay, 'mars');
      const jupiter = this.calculatePlanetPosition(julianDay, 'jupiter');
      const saturn = this.calculatePlanetPosition(julianDay, 'saturn');
      const uranus = this.calculatePlanetPosition(julianDay, 'uranus');
      const neptune = this.calculatePlanetPosition(julianDay, 'neptune');
      const pluto = this.calculatePlanetPosition(julianDay, 'pluto');

      // Calculer Ascendant (simplifié - besoin coordonnées exactes en prod)
      const ascendant = this.calculateAscendant(julianDay, birthTime);

      // Calculer Midheaven
      const midheaven = this.calculateMidheaven(julianDay);

      // Calculer maisons (système Placidus simplifié)
      const houses = this.calculateHouses(ascendant.degree);

      // Calculer aspects
      const aspects = this.calculateAspects({
        sun, moon, mercury, venus, mars, jupiter,
        saturn, uranus, neptune, pluto, ascendant, midheaven
      });

      // Calculer énergies élémentaires
      const elementEnergies = this.calculateElementEnergies({
        sun, moon, mercury, venus, mars, jupiter,
        saturn, uranus, neptune, pluto, ascendant
      });

      return {
        sun,
        moon,
        mercury,
        venus,
        mars,
        jupiter,
        saturn,
        uranus,
        neptune,
        pluto,
        ascendant,
        midheaven,
        houses,
        aspects,
        elementEnergies
      };
    } catch (error) {
      console.error('Error calculating natal chart:', error);
      throw new Error('Impossible de calculer le thème natal');
    }
  },

  /**
   * Sauvegarde le thème dans le profil
   */
  async saveProfileWithAstro(userId: string, chart: NatalChartData): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          natal_chart_data: chart,
          sun_sign: chart.sun.sign,
          moon_sign: chart.moon.sign,
          ascendant_sign: chart.ascendant.sign,
          energy_fire: chart.elementEnergies.fire,
          energy_earth: chart.elementEnergies.earth,
          energy_air: chart.elementEnergies.air,
          energy_water: chart.elementEnergies.water,
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving astro profile:', error);
      throw new Error('Impossible de sauvegarder le thème');
    }
  },

  /**
   * Convertit une date en jour julien
   */
  dateToJulianDay(date: Date): number {
    const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
    const y = date.getFullYear() + 4800 - a;
    const m = (date.getMonth() + 1) + 12 * a - 3;
    
    let jd = date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y +
             Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    
    const hours = date.getHours() + date.getMinutes() / 60;
    jd += (hours - 12) / 24;
    
    return jd;
  },

  /**
   * Calcule la position approximative d'une planète
   * NOTE: Formules simplifiées. Production = Swiss Ephemeris.
   */
  calculatePlanetPosition(jd: number, planet: string): {
    sign: string;
    degree: number;
    house: number;
    isRetrograde: boolean;
  } {
    const basePositions: Record<string, number> = {
      sun: 280.46, moon: 218.32, mercury: 252.25,
      venus: 181.98, mars: 355.43, jupiter: 34.35,
      saturn: 50.08, uranus: 314.05, neptune: 304.35, pluto: 238.96
    };

    const dailyMotions: Record<string, number> = {
      sun: 0.9856, moon: 13.1764, mercury: 1.38, venus: 1.60,
      mars: 0.5240, jupiter: 0.0831, saturn: 0.0335,
      uranus: 0.0117, neptune: 0.0061, pluto: 0.0041
    };

    const daysSinceEpoch = jd - 2451545.0;
    const basePos = basePositions[planet] || 0;
    const motion = dailyMotions[planet] || 1;
    
    let degree = (basePos + motion * daysSinceEpoch) % 360;
    if (degree < 0) degree += 360;

    const signIndex = Math.floor(degree / 30);
    const sign = ZODIAC_SIGNS[signIndex];
    const degreeInSign = degree % 30;

    // Approximation rétrogradation
    const isRetrograde = planet !== 'sun' && planet !== 'moon' && 
                         Math.sin(daysSinceEpoch / 100) < -0.5;

    return {
      sign,
      degree: degreeInSign,
      house: 1, // Calculé après avec ascendant
      isRetrograde
    };
  },

  /**
   * Calcule l'Ascendant (simplifié)
   */
  calculateAscendant(jd: number, birthTime: string): {
    sign: string;
    degree: number;
    house: number;
    isRetrograde: boolean;
  } {
    const [hours, minutes] = birthTime.split(':').map(Number);
    const timeDecimal = hours + minutes / 60;
    
    // Formule simplifiée basée sur l'heure
    let degree = (timeDecimal * 15) % 360;
    
    const signIndex = Math.floor(degree / 30);
    const sign = ZODIAC_SIGNS[signIndex];
    const degreeInSign = degree % 30;

    return { sign, degree: degreeInSign, house: 1, isRetrograde: false };
  },

  /**
   * Calcule le Midheaven (MC)
   */
  calculateMidheaven(jd: number): {
    sign: string;
    degree: number;
    house: number;
    isRetrograde: boolean;
  } {
    const dayOfYear = (jd - Math.floor(jd / 365.25) * 365.25) % 365.25;
    let degree = (dayOfYear / 365.25 * 360) % 360;
    
    const signIndex = Math.floor(degree / 30);
    const sign = ZODIAC_SIGNS[signIndex];
    
    return { sign, degree: degree % 30, house: 10, isRetrograde: false };
  },

  /**
   * Calcule les 12 maisons (système Equal House simplifié)
   */
  calculateHouses(ascendantDegree: number): Array<{
    sign: string;
    degree: number;
  }> {
    const houses = [];
    for (let i = 0; i < 12; i++) {
      let degree = (ascendantDegree + i * 30) % 360;
      const signIndex = Math.floor(degree / 30);
      houses.push({
        sign: ZODIAC_SIGNS[signIndex],
        degree: degree % 30
      });
    }
    return houses;
  },

  /**
   * Calcule les aspects entre planètes
   */
  calculateAspects(planets: any): Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
  }> {
    const aspects = [];
    const aspectTypes = [
      { name: 'conjunction', angle: 0, orb: 8 },
      { name: 'sextile', angle: 60, orb: 6 },
      { name: 'square', angle: 90, orb: 8 },
      { name: 'trine', angle: 120, orb: 8 },
      { name: 'opposition', angle: 180, orb: 8 }
    ];

    const planetNames = ['sun', 'moon', 'mercury', 'venus', 'mars', 
                         'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

    for (let i = 0; i < planetNames.length; i++) {
      for (let j = i + 1; j < planetNames.length; j++) {
        const p1 = planetNames[i];
        const p2 = planetNames[j];
        const angle = Math.abs(planets[p1].degree - planets[p2].degree);
        
        for (const aspectType of aspectTypes) {
          const diff = Math.abs(angle - aspectType.angle);
          if (diff <= aspectType.orb) {
            aspects.push({
              planet1: p1,
              planet2: p2,
              aspect: aspectType.name,
              orb: diff
            });
          }
        }
      }
    }

    return aspects;
  },

  /**
   * Calcule les énergies élémentaires
   */
  calculateElementEnergies(planets: any): {
    fire: number;
    earth: number;
    air: number;
    water: number;
  } {
    const energies = { fire: 0, earth: 0, air: 0, water: 0 };

    for (const [planetName, weight] of Object.entries(PLANET_WEIGHTS)) {
      if (planets[planetName]) {
        const sign = planets[planetName].sign;
        const element = SIGN_ELEMENTS[sign];
        if (element && energies[element as keyof typeof energies] !== undefined) {
          energies[element as keyof typeof energies] += weight;
        }
      }
    }

    // Normaliser à 100%
    const total = energies.fire + energies.earth + energies.air + energies.water;
    return {
      fire: Math.round((energies.fire / total) * 100),
      earth: Math.round((energies.earth / total) * 100),
      air: Math.round((energies.air / total) * 100),
      water: Math.round((energies.water / total) * 100)
    };
  }
};
