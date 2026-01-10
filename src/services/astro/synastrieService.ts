// ═══════════════════════════════════════════════════════════════════════
// SYNASTRIE SERVICE - Calcul compatibilité
// ═══════════════════════════════════════════════════════════════════════

import type { NatalChartData, CompatibilityScore } from '@/types';
import { getElementalCompatibility, isHarmoniousAspect } from '@/utils/astroHelpers';

export const synastrieService = {
  calculateCompatibility(
    chart1: NatalChartData,
    chart2: NatalChartData
  ): CompatibilityScore {
    const elementalScore = getElementalCompatibility(chart1.sun.sign, chart2.sun.sign);
    const sunMoonScore = this.calculateSunMoonAspect(chart1, chart2);
    const venusScore = this.calculateVenusAspect(chart1, chart2);
    const marsScore = this.calculateMarsAspect(chart1, chart2);
    const ascScore = getElementalCompatibility(chart1.ascendant.sign, chart2.ascendant.sign);
    
    const overall = Math.round(
      (elementalScore * 0.2) +
      (sunMoonScore * 0.25) +
      (venusScore * 0.25) +
      (marsScore * 0.15) +
      (ascScore * 0.15)
    );
    
    return {
      overall,
      details: {
        elementalHarmony: elementalScore,
        sunMoonAspect: sunMoonScore,
        venusAspect: venusScore,
        marsAspect: marsScore,
        ascendantCompatibility: ascScore,
      },
      strengths: this.getStrengths(overall),
      challenges: this.getChallenges(overall),
      synastryAspects: [],
    };
  },

  calculateSunMoonAspect(chart1: NatalChartData, chart2: NatalChartData): number {
    const elemCompat = getElementalCompatibility(chart1.sun.sign, chart2.moon.sign);
    return elemCompat;
  },

  calculateVenusAspect(chart1: NatalChartData, chart2: NatalChartData): number {
    return getElementalCompatibility(chart1.venus.sign, chart2.venus.sign);
  },

  calculateMarsAspect(chart1: NatalChartData, chart2: NatalChartData): number {
    return getElementalCompatibility(chart1.mars.sign, chart2.mars.sign);
  },

  getStrengths(score: number): string[] {
    if (score >= 80) {
      return ['Connexion profonde', 'Compréhension mutuelle', 'Harmonie naturelle'];
    }
    if (score >= 60) {
      return ['Bonne base', 'Potentiel de croissance'];
    }
    return ['Opportunités d\'apprentissage'];
  },

  getChallenges(score: number): string[] {
    if (score < 60) {
      return ['Différences marquées', 'Efforts de communication nécessaires'];
    }
    return ['Quelques ajustements mineurs'];
  },
};
