// ═══════════════════════════════════════════════════════════════════════
// HOROSCOPE GENERATOR - Génère horoscopes via IA
// ═══════════════════════════════════════════════════════════════════════

import { openai, ASTRA_MODEL } from '@/config/openai';
import type { NatalChartData, HoroscopeType } from '@/types';

export const horoscopeGenerator = {
  async generate(
    natalChart: NatalChartData,
    type: HoroscopeType
  ): Promise<string> {
    const prompt = this.buildPrompt(natalChart, type);
    
    const completion = await openai.chat.completions.create({
      model: ASTRA_MODEL,
      messages: [
        {
          role: 'system',
          content: 'Tu es un astrologue expert qui génère des horoscopes personnalisés basés sur les thèmes natals. Sois direct, précis, et actionnable.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });
    
    return completion.choices[0].message.content || '';
  },

  buildPrompt(natalChart: NatalChartData, type: HoroscopeType): string {
    const period = type === 'daily' ? 'aujourd\'hui' : type === 'weekly' ? 'cette semaine' : 'ce mois-ci';
    
    return `Génère un horoscope ${period} pour:
- Soleil ${natalChart.sun.sign}
- Lune ${natalChart.moon.sign}
- Ascendant ${natalChart.ascendant.sign}

Format:
1. Focus principal (1 phrase)
2. Conseil actionnable (1 phrase)
3. Domaine à surveiller (1 phrase)

Max 150 mots, ton direct.`;
  },
};
