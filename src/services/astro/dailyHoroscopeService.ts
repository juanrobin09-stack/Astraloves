// ═══════════════════════════════════════════════════════════════════════
// DAILY HOROSCOPE SERVICE - Horoscopes temps réel via OpenAI
// ═══════════════════════════════════════════════════════════════════════

import { openai, isOpenAIConfigured, ASTRA_MODEL } from '@/config/openai';

export interface DailyHoroscope {
  general: string;
  love: string;
  energy: number; // 1-100
  luckyNumber: number;
  advice: string;
  warning?: string;
}

export interface WeeklyForecast {
  days: {
    day: string;
    energy: number;
    focus: string;
  }[];
  summary: string;
}

const HOROSCOPE_CACHE: Record<string, { data: DailyHoroscope; date: string }> = {};

export const dailyHoroscopeService = {
  /**
   * Génère l'horoscope du jour personnalisé via OpenAI
   */
  async getDailyHoroscope(
    sunSign: string,
    moonSign?: string,
    ascendantSign?: string
  ): Promise<DailyHoroscope> {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `${sunSign}-${moonSign}-${ascendantSign}-${today}`;

    // Check cache first
    if (HOROSCOPE_CACHE[cacheKey]?.date === today) {
      return HOROSCOPE_CACHE[cacheKey].data;
    }

    if (!isOpenAIConfigured || !openai) {
      return this.getFallbackHoroscope(sunSign);
    }

    try {
      const prompt = this.buildDailyPrompt(sunSign, moonSign, ascendantSign);

      const completion = await openai.chat.completions.create({
        model: ASTRA_MODEL,
        messages: [
          {
            role: 'system',
            content: `Tu es un astrologue expert. Génère des horoscopes personnalisés, directs et inspirants.

RÈGLES:
- Sois précis et actionnable
- Pas de généralités vagues
- Utilise le tutoiement
- Adapte le ton au signe
- Date d'aujourd'hui: ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}

RETOURNE UNIQUEMENT UN JSON VALIDE (pas de markdown, pas de texte avant/après):
{
  "general": "Message général du jour (2-3 phrases)",
  "love": "Prévision amoureuse (2 phrases)",
  "energy": 75,
  "luckyNumber": 7,
  "advice": "Conseil actionnable (1 phrase)",
  "warning": "Point d'attention optionnel (1 phrase ou null)"
}`
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.8,
      });

      const content = completion.choices[0].message.content || '';

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const horoscope = JSON.parse(jsonMatch[0]) as DailyHoroscope;

        // Cache the result
        HOROSCOPE_CACHE[cacheKey] = { data: horoscope, date: today };

        return horoscope;
      }
    } catch (error) {
      console.error('Horoscope generation error:', error);
    }

    return this.getFallbackHoroscope(sunSign);
  },

  /**
   * Génère la prévision hebdomadaire
   */
  async getWeeklyForecast(
    sunSign: string,
    moonSign?: string
  ): Promise<WeeklyForecast> {
    if (!isOpenAIConfigured || !openai) {
      return this.getFallbackWeekly();
    }

    try {
      const completion = await openai.chat.completions.create({
        model: ASTRA_MODEL,
        messages: [
          {
            role: 'system',
            content: `Tu es un astrologue expert. Génère une prévision hebdomadaire.

RETOURNE UNIQUEMENT UN JSON VALIDE:
{
  "days": [
    {"day": "Lundi", "energy": 70, "focus": "mot-clé"},
    {"day": "Mardi", "energy": 85, "focus": "mot-clé"},
    {"day": "Mercredi", "energy": 60, "focus": "mot-clé"},
    {"day": "Jeudi", "energy": 90, "focus": "mot-clé"},
    {"day": "Vendredi", "energy": 80, "focus": "mot-clé"},
    {"day": "Samedi", "energy": 95, "focus": "mot-clé"},
    {"day": "Dimanche", "energy": 75, "focus": "mot-clé"}
  ],
  "summary": "Résumé de la semaine en 2 phrases"
}`
          },
          {
            role: 'user',
            content: `Prévision hebdomadaire pour ${sunSign}${moonSign ? ` (Lune en ${moonSign})` : ''}`
          }
        ],
        max_tokens: 400,
        temperature: 0.7,
      });

      const content = completion.choices[0].message.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as WeeklyForecast;
      }
    } catch (error) {
      console.error('Weekly forecast error:', error);
    }

    return this.getFallbackWeekly();
  },

  /**
   * Génère la compatibilité détaillée avec un autre signe
   */
  async getCompatibilityReading(
    mySign: string,
    theirSign: string
  ): Promise<{ score: number; chemistry: string; challenges: string; advice: string }> {
    if (!isOpenAIConfigured || !openai) {
      return {
        score: 75,
        chemistry: 'Une belle connexion potentielle.',
        challenges: 'Quelques ajustements nécessaires.',
        advice: 'Communiquez ouvertement.',
      };
    }

    try {
      const completion = await openai.chat.completions.create({
        model: ASTRA_MODEL,
        messages: [
          {
            role: 'system',
            content: `Tu es un astrologue expert en synastrie. Analyse la compatibilité entre deux signes.

RETOURNE UNIQUEMENT UN JSON VALIDE:
{
  "score": 85,
  "chemistry": "Description de la chimie (2 phrases)",
  "challenges": "Les défis potentiels (1-2 phrases)",
  "advice": "Conseil pour la relation (1 phrase)"
}`
          },
          {
            role: 'user',
            content: `Compatibilité entre ${mySign} et ${theirSign}`
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const content = completion.choices[0].message.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Compatibility error:', error);
    }

    return {
      score: 75,
      chemistry: 'Une connexion intéressante à explorer.',
      challenges: 'Apprenez de vos différences.',
      advice: 'Restez ouverts et curieux.',
    };
  },

  buildDailyPrompt(sunSign: string, moonSign?: string, ascendantSign?: string): string {
    let prompt = `Horoscope du jour pour ${sunSign}`;

    if (moonSign) {
      prompt += `\nLune en ${moonSign} (émotions)`;
    }
    if (ascendantSign) {
      prompt += `\nAscendant ${ascendantSign} (image sociale)`;
    }

    return prompt;
  },

  getFallbackHoroscope(sunSign: string): DailyHoroscope {
    const messages: Record<string, DailyHoroscope> = {
      aries: {
        general: "L'énergie de Mars te pousse à l'action. C'est le moment de prendre des initiatives audacieuses.",
        love: "Ton magnétisme attire les regards. Une rencontre peut survenir si tu oses sortir de ta zone de confort.",
        energy: 85,
        luckyNumber: 9,
        advice: "Canalise ton impulsivité vers des projets constructifs.",
        warning: "Évite les décisions trop rapides en matière de cœur."
      },
      taurus: {
        general: "Vénus t'enveloppe de douceur. Prends le temps de savourer les petits plaisirs du quotidien.",
        love: "La stabilité attire ton regard. Cherche quelqu'un qui partage ta vision du confort.",
        energy: 70,
        luckyNumber: 6,
        advice: "Ouvre-toi à de nouvelles expériences sensorielles.",
      },
      gemini: {
        general: "Mercure stimule ton esprit. Les conversations profondes t'apporteront de nouvelles perspectives.",
        love: "L'intellect est ta zone érogène. Une connexion mentale peut mener à plus.",
        energy: 80,
        luckyNumber: 5,
        advice: "Pose plus de questions, écoute les réponses.",
      },
      cancer: {
        general: "La Lune intensifie tes émotions. Accueille-les sans jugement, elles t'enseignent.",
        love: "Ton besoin de sécurité émotionnelle est légitime. N'aie pas peur de l'exprimer.",
        energy: 65,
        luckyNumber: 2,
        advice: "Crée un espace de réconfort pour toi et tes proches.",
      },
      leo: {
        general: "Le Soleil illumine ta présence. C'est ton moment de briller et d'inspirer les autres.",
        love: "Tu mérites d'être admiré(e). Attire quelqu'un qui célèbre ta lumière.",
        energy: 90,
        luckyNumber: 1,
        advice: "Partage ta chaleur sans attendre de validation.",
      },
      virgo: {
        general: "Mercure affine ton analyse. Les détails que d'autres ignorent te révèlent des vérités.",
        love: "Au-delà de l'apparence, cherche la substance. L'authenticité t'attire.",
        energy: 75,
        luckyNumber: 4,
        advice: "Accepte l'imperfection comme partie de la beauté.",
      },
      libra: {
        general: "Vénus équilibre tes relations. L'harmonie que tu crées rayonne autour de toi.",
        love: "Tu cherches un partenaire, pas un miroir. L'équilibre vient de la complémentarité.",
        energy: 78,
        luckyNumber: 7,
        advice: "Ose exprimer tes préférences, même si ça dérange.",
      },
      scorpio: {
        general: "Pluton intensifie tout. Tes transformations intérieures préparent de grands changements.",
        love: "L'intensité de ta passion peut effrayer ou fasciner. Assume-la.",
        energy: 88,
        luckyNumber: 8,
        advice: "Laisse mourir ce qui doit mourir pour renaître plus fort.",
      },
      sagittarius: {
        general: "Jupiter élargit tes horizons. L'aventure t'appelle, que ce soit physique ou spirituelle.",
        love: "Cherche quelqu'un qui partage ta soif de découverte et de liberté.",
        energy: 82,
        luckyNumber: 3,
        advice: "La sagesse vient de l'expérience, pas des livres.",
      },
      capricorn: {
        general: "Saturne structure tes ambitions. Ta discipline d'aujourd'hui construit ton succès de demain.",
        love: "Tu mérites quelqu'un qui respecte tes objectifs et ta détermination.",
        energy: 72,
        luckyNumber: 10,
        advice: "Accorde-toi du repos sans culpabiliser.",
      },
      aquarius: {
        general: "Uranus électrise ta vision. Tes idées avant-gardistes trouvent enfin leur moment.",
        love: "L'originalité t'attire. Cherche quelqu'un qui célèbre ta différence.",
        energy: 84,
        luckyNumber: 11,
        advice: "Ta rébellion est un cadeau, pas un défaut.",
      },
      pisces: {
        general: "Neptune amplifie ton intuition. Fais confiance à ces pressentiments subtils.",
        love: "Ta sensibilité est une force. Quelqu'un saura la chérir.",
        energy: 68,
        luckyNumber: 12,
        advice: "Protège ton énergie des influences négatives.",
      },
    };

    const sign = sunSign.toLowerCase();
    return messages[sign] || messages.aries;
  },

  getFallbackWeekly(): WeeklyForecast {
    return {
      days: [
        { day: 'Lundi', energy: 70, focus: 'Focus' },
        { day: 'Mardi', energy: 85, focus: 'Action' },
        { day: 'Mercredi', energy: 60, focus: 'Repos' },
        { day: 'Jeudi', energy: 90, focus: 'Social' },
        { day: 'Vendredi', energy: 80, focus: 'Créatif' },
        { day: 'Samedi', energy: 95, focus: 'Amour' },
        { day: 'Dimanche', energy: 75, focus: 'Réflexion' },
      ],
      summary: 'Une semaine équilibrée avec un pic d\'énergie en fin de semaine. Profite du weekend pour les connexions sociales.',
    };
  },
};
