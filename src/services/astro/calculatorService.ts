// ═══════════════════════════════════════════════════════════════════════
// CALCULATOR SERVICE - Calculs astrologiques
// ═══════════════════════════════════════════════════════════════════════

import * as astro from 'astrojs-core';
import type { NatalChartData, BirthPlace } from '@/types';
import { calculateElementalEnergies } from '@/utils/astroHelpers';

export const calculatorService = {
  calculateNatalChart(
    birthDate: Date,
    birthPlace: BirthPlace
  ): NatalChartData {
    const chart = new astro.Chart({
      year: birthDate.getFullYear(),
      month: birthDate.getMonth() + 1,
      day: birthDate.getDate(),
      hour: birthDate.getHours(),
      minute: birthDate.getMinutes(),
      latitude: birthPlace.lat,
      longitude: birthPlace.lng,
    });

    const planets = chart.get Planets();
    
    return {
      sun: this.convertPlanet(planets.sun),
      moon: this.convertPlanet(planets.moon),
      mercury: this.convertPlanet(planets.mercury),
      venus: this.convertPlanet(planets.venus),
      mars: this.convertPlanet(planets.mars),
      jupiter: this.convertPlanet(planets.jupiter),
      saturn: this.convertPlanet(planets.saturn),
      uranus: this.convertPlanet(planets.uranus),
      neptune: this.convertPlanet(planets.neptune),
      pluto: this.convertPlanet(planets.pluto),
      ascendant: this.convertPlanet(planets.ascendant),
      houses: this.calculateHouses(chart),
      aspects: this.calculateAspects(planets),
    };
  },

  convertPlanet(planet: any): any {
    return {
      sign: planet.sign.name.toLowerCase(),
      degree: planet.position.decimal,
      house: planet.house,
      isRetrograde: planet.isRetrograde || false,
    };
  },

  calculateHouses(chart: any): any[] {
    const houses = [];
    for (let i = 1; i <= 12; i++) {
      const house = chart.getHouse(i);
      houses.push({
        number: i,
        sign: house.sign.name.toLowerCase(),
        degree: house.position.decimal,
      });
    }
    return houses;
  },

  calculateAspects(planets: any): any[] {
    const aspects: any[] = [];
    const planetNames = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
    
    for (let i = 0; i < planetNames.length; i++) {
      for (let j = i + 1; j < planetNames.length; j++) {
        const p1 = planets[planetNames[i]];
        const p2 = planets[planetNames[j]];
        const aspect = this.detectAspect(p1.position.decimal, p2.position.decimal);
        
        if (aspect) {
          aspects.push({
            planet1: planetNames[i],
            planet2: planetNames[j],
            type: aspect.type,
            degree: aspect.degree,
            orb: aspect.orb,
          });
        }
      }
    }
    
    return aspects;
  },

  detectAspect(deg1: number, deg2: number): any | null {
    const diff = Math.abs(deg1 - deg2);
    const angle = Math.min(diff, 360 - diff);
    
    const aspects = [
      { type: 'conjunction', target: 0, orb: 8 },
      { type: 'sextile', target: 60, orb: 6 },
      { type: 'square', target: 90, orb: 8 },
      { type: 'trine', target: 120, orb: 8 },
      { type: 'opposition', target: 180, orb: 8 },
    ];
    
    for (const aspect of aspects) {
      const actualOrb = Math.abs(angle - aspect.target);
      if (actualOrb <= aspect.orb) {
        return {
          type: aspect.type,
          degree: angle,
          orb: actualOrb,
        };
      }
    }
    
    return null;
  },
};
