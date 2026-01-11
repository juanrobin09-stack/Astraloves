// ═══════════════════════════════════════════════════════════════════════
// ASTRO V2 SERVICE - Avec OpenAI pour génération IA
// ═══════════════════════════════════════════════════════════════════════

import { supabase } from './supabase';
import {
  Tier,
  ZodiacSign,
  Horoscope,
  HoroscopeBase,
  HoroscopePremium,
  HoroscopeElite,
  DailyEnergies,
  Compatibility,
  CompatibilityBasic,
  CompatibilityDetailed,
  Challenge,
  HoroscopeInput,
  EnergiesInput,
} from '../types/astro-v2';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OPENAI CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

async function callOpenAI(prompt: string): Promise<string> {
  try {
    const response = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Tu es ASTRA, IA astrologique lucide et incarnée.

INTERDICTIONS ABSOLUES:
- Phrases vagues type magazine
- Promesses
- Flatterie
- Ésotérisme bullshit

OBLIGATIONS:
- Parler vrai
- Conseils actionnables
- Lien avec le vécu réel
- Parfois inconfortable

VOIX ASTRA:
"Cette période n'est pas confortable. Elle est nécessaire."
"Tu veux une réponse rapide. Ce cycle demande de la patience."
"Ce lien arrive trop tôt. Finis le tri d'abord."

Réponds UNIQUEMENT en JSON valide, sans markdown.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SIGN_EMOJIS: Record<ZodiacSign, string> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
};

const SIGN_NAMES: Record<ZodiacSign, string> = {
  aries: 'Bélier',
  taurus: 'Taureau',
  gemini: 'Gémeaux',
  cancer: 'Cancer',
  leo: 'Lion',
  virgo: 'Vierge',
  libra: 'Balance',
  scorpio: 'Scorpion',
  sagittarius: 'Sagittaire',
  capricorn: 'Capricorne',
  aquarius: 'Verseau',
  pisces: 'Poissons',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOROSCOPE GENERATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function generateDailyHoroscope(
  input: HoroscopeInput
): Promise<Horoscope> {
  const { userName, sunSign, tier, declaredMood } = input;
  const signName = SIGN_NAMES[sunSign];
  
  try {
    if (tier === 'free') {
      const prompt = `Génère un horoscope du jour pour ${userName}, signe ${signName}.
${declaredMood ? `Humeur déclarée: ${declaredMood}` : ''}

Format JSON attendu:
{
  "mainText": "2-3 phrases incarnées, pas vagues",
  "conseil": "1 conseil actionnable et clair"
}

Exemples voix ASTRA:
"Aujourd'hui, ${userName}, ton énergie ${signName} cherche l'équilibre dans un contexte relationnel tendu. Ce que tu appelles 'compromis' cache parfois de la fuite."

Conseil: "Pose une limite claire aujourd'hui. Une seule suffit."`;

      const response = await callOpenAI(prompt);
      const parsed = JSON.parse(response);
      
      return {
        mainText: parsed.mainText,
        conseil: parsed.conseil,
      } as HoroscopeBase;
    }
    
    if (tier === 'premium') {
      const prompt = `Génère un horoscope Premium pour ${userName}, signe ${signName}.
${declaredMood ? `Humeur: ${declaredMood}` : ''}

Format JSON:
{
  "mainText": "Texte principal incarné",
  "conseil": "Conseil actionnable",
  "amour": "Analyse amour (basée sur patterns relationnels)",
  "carriere": "Analyse carrière (stratégique)",
  "relations": "Analyse relations (patterns détectés)",
  "astraNote": "Explication POURQUOI ce transit/cycle"
}

ASTRA ne rassure pas, elle éclaire. Parfois inconfortable.`;

      const response = await callOpenAI(prompt);
      const parsed = JSON.parse(response);
      
      return {
        mainText: parsed.mainText,
        conseil: parsed.conseil,
        amour: parsed.amour,
        carriere: parsed.carriere,
        relations: parsed.relations,
        astraNote: parsed.astraNote,
      } as HoroscopePremium;
    }
    
    // Elite
    const prompt = `Génère un horoscope Elite pour ${userName}, signe ${signName}.
${declaredMood ? `Humeur: ${declaredMood}` : ''}

Format JSON:
{
  "mainText": "Texte principal",
  "conseil": "Conseil actionnable",
  "amour": "Analyse amour approfondie",
  "carriere": "Analyse carrière",
  "relations": "Analyse relations avec patterns",
  "astraNote": "POURQUOI (transit/cycle)",
  "guardianAlert": {
    "level": "low|medium|high",
    "title": "Titre alerte",
    "message": "Message Guardian (si pattern détecté)"
  }
}

Guardian peut détecter répétitions karmiques, patterns d'évitement.`;

    const response = await callOpenAI(prompt);
    const parsed = JSON.parse(response);
    
    const horoscope: HoroscopeElite = {
      mainText: parsed.mainText,
      conseil: parsed.conseil,
      amour: parsed.amour,
      carriere: parsed.carriere,
      relations: parsed.relations,
      astraNote: parsed.astraNote,
    };
    
    if (parsed.guardianAlert) {
      horoscope.guardianAlert = {
        id: `alert-${Date.now()}`,
        level: parsed.guardianAlert.level,
        type: 'pattern_warning',
        title: parsed.guardianAlert.title,
        message: parsed.guardianAlert.message,
        createdAt: new Date(),
      };
    }
    
    return horoscope;
    
  } catch (error) {
    console.error('Erreur génération horoscope:', error);
    
    // Fallback mock data en cas d'erreur
    return getFallbackHoroscope(input);
  }
}

function getFallbackHoroscope(input: HoroscopeInput): Horoscope {
  const { userName, sunSign, tier } = input;
  const signName = SIGN_NAMES[sunSign];
  
  if (tier === 'free') {
    return {
      mainText: `Aujourd'hui, ${userName}, ton énergie ${signName} cherche l'équilibre. Une journée pour poser des bases solides.`,
      conseil: "Prends une décision claire aujourd'hui.",
    };
  }
  
  if (tier === 'premium') {
    return {
      mainText: `Aujourd'hui, ${userName}, ton énergie ${signName} cherche l'équilibre.`,
      conseil: "Prends une décision claire aujourd'hui.",
      amour: "Période de clarification relationnelle.",
      carriere: "Consolide plutôt que lancer.",
      relations: "Les patterns deviennent visibles.",
      astraNote: "Ce transit demande de la patience.",
    };
  }
  
  return {
    mainText: `Aujourd'hui, ${userName}, ton énergie ${signName} cherche l'équilibre.`,
    conseil: "Prends une décision claire aujourd'hui.",
    amour: "Période de clarification relationnelle.",
    carriere: "Consolide plutôt que lancer.",
    relations: "Les patterns deviennent visibles.",
    astraNote: "Ce transit demande de la patience.",
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ÉNERGIES CALCUL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function calculateDailyEnergies(
  input: EnergiesInput
): Promise<DailyEnergies> {
  // TODO: Implémenter calcul réel basé sur transits
  // Pour MVP: valeurs pseudo-aléatoires mais cohérentes
  
  const seed = input.date.getDate() + input.date.getMonth() * 31;
  const rng = (n: number) => ((seed * n * 9301 + 49297) % 233280) / 233280;
  
  return {
    vitality: {
      value: Math.floor(rng(1) * 40 + 60),
      description: 'Haute énergie physique',
      icon: '💪',
    },
    creativity: {
      value: Math.floor(rng(2) * 40 + 60),
      description: 'Flux créatif actif',
      icon: '🎨',
    },
    love: {
      value: Math.floor(rng(3) * 40 + 60),
      description: 'Ouverture relationnelle',
      icon: '💖',
    },
    luck: {
      value: Math.floor(rng(4) * 40 + 60),
      description: 'Opportunités visibles',
      icon: '🍀',
    },
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPATIBILITÉ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const COMPATIBILITY_MAP: Record<ZodiacSign, { high: ZodiacSign[]; medium: ZodiacSign[]; low: ZodiacSign[] }> = {
  aries: {
    high: ['leo', 'sagittarius', 'gemini'],
    medium: ['aquarius', 'libra'],
    low: ['cancer', 'capricorn'],
  },
  taurus: {
    high: ['virgo', 'capricorn', 'cancer'],
    medium: ['pisces', 'scorpio'],
    low: ['leo', 'aquarius'],
  },
  gemini: {
    high: ['libra', 'aquarius', 'aries'],
    medium: ['leo', 'sagittarius'],
    low: ['virgo', 'pisces'],
  },
  cancer: {
    high: ['scorpio', 'pisces', 'taurus'],
    medium: ['virgo', 'capricorn'],
    low: ['aries', 'libra'],
  },
  leo: {
    high: ['aries', 'sagittarius', 'gemini'],
    medium: ['libra', 'aquarius'],
    low: ['taurus', 'scorpio'],
  },
  virgo: {
    high: ['taurus', 'capricorn', 'cancer'],
    medium: ['scorpio', 'pisces'],
    low: ['gemini', 'sagittarius'],
  },
  libra: {
    high: ['gemini', 'aquarius', 'leo'],
    medium: ['sagittarius', 'aries'],
    low: ['cancer', 'capricorn'],
  },
  scorpio: {
    high: ['cancer', 'pisces', 'virgo'],
    medium: ['capricorn', 'taurus'],
    low: ['leo', 'aquarius'],
  },
  sagittarius: {
    high: ['aries', 'leo', 'libra'],
    medium: ['aquarius', 'gemini'],
    low: ['virgo', 'pisces'],
  },
  capricorn: {
    high: ['taurus', 'virgo', 'scorpio'],
    medium: ['pisces', 'cancer'],
    low: ['aries', 'libra'],
  },
  aquarius: {
    high: ['gemini', 'libra', 'sagittarius'],
    medium: ['aries', 'leo'],
    low: ['taurus', 'scorpio'],
  },
  pisces: {
    high: ['cancer', 'scorpio', 'capricorn'],
    medium: ['taurus', 'virgo'],
    low: ['gemini', 'sagittarius'],
  },
};

export async function getCompatibility(
  sign: ZodiacSign,
  tier: Tier
): Promise<Compatibility[]> {
  const compat = COMPATIBILITY_MAP[sign];
  
  if (tier === 'free') {
    // Version simple: 3 signes max
    const results: CompatibilityBasic[] = [
      { sign: compat.high[0], emoji: SIGN_EMOJIS[compat.high[0]], level: 'high' },
      { sign: compat.medium[0], emoji: SIGN_EMOJIS[compat.medium[0]], level: 'medium' },
      { sign: compat.low[0], emoji: SIGN_EMOJIS[compat.low[0]], level: 'low' },
    ];
    return results;
  }
  
  // Premium/Elite: Version détaillée
  const highSign = compat.high[0];
  const result: CompatibilityDetailed = {
    sign: highSign,
    emoji: SIGN_EMOJIS[highSign],
    level: 'high',
    score: 92,
    analysis: {
      works: [
        'Communication fluide (Mercure harmonique)',
        'Compréhension intuitive',
        'Légèreté nécessaire aujourd\'hui',
      ],
      attention: [
        'Risque de superficialité si tu évites le fond',
      ],
    },
    universeLink: 'Voir dans Univers V2',
  };
  
  return [result];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CHALLENGE COSMIQUE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CHALLENGE_TEMPLATES = [
  "Pose une question directe au lieu de supposer. Une seule conversation claire vaut mieux que 10 non-dits.",
  "Dis non à quelque chose aujourd'hui. Sans te justifier.",
  "Reste 10 minutes dans l'inconfort sans chercher à le combler.",
  "Exprime un besoin clair à quelqu'un. Pas un souhait vague, un besoin précis.",
  "Choisis la solitude plutôt que la compagnie par défaut.",
];

export async function generateDailyChallenge(userId: string): Promise<Challenge> {
  // Vérifier si challenge du jour existe déjà
  const today = new Date().toISOString().split('T')[0];
  
  const { data: existing } = await supabase
    .from('astro_challenges')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', today)
    .maybeSingle();
  
  if (existing) {
    return existing as Challenge;
  }
  
  // Créer nouveau challenge
  const template = CHALLENGE_TEMPLATES[Math.floor(Math.random() * CHALLENGE_TEMPLATES.length)];
  
  const challenge: Challenge = {
    id: `challenge-${Date.now()}`,
    text: template,
    xp: 50,
    category: 'communication',
    completedAt: null,
    createdAt: new Date(),
  };
  
  // Sauvegarder en DB
  await supabase.from('astro_challenges').insert({
    id: challenge.id,
    user_id: userId,
    text: challenge.text,
    xp: challenge.xp,
    category: challenge.category,
    completed_at: null,
    created_at: challenge.createdAt.toISOString(),
  });
  
  return challenge;
}

export async function completeChallenge(challengeId: string): Promise<{ xp: number }> {
  const now = new Date().toISOString();
  
  const { error } = await supabase
    .from('astro_challenges')
    .update({ completed_at: now })
    .eq('id', challengeId);
  
  if (error) {
    console.error('Erreur complétion challenge:', error);
    throw error;
  }
  
  return { xp: 50 };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CYCLES (PREMIUM/ELITE)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import {
  CurrentCycle,
  LongCycle,
  CyclePhase,
  AstralMemory,
  HistoryData,
  EnergyHistory,
} from '../types/astro-v2';

export async function getCurrentCycle(userId: string): Promise<CurrentCycle> {
  // TODO: Calculer vraiment basé sur transits
  // Pour MVP: cycle mock basé sur date
  
  const currentPhase: CyclePhase = 'tri'; // Mock
  
  return {
    phase: currentPhase,
    daysActive: 4,
    daysRemaining: 6,
    meaning: {
      demands: [
        'Trier les liens réels des liens sociaux',
        'Clarifier tes priorités relationnelles',
        'Accepter que certains choix excluent d'autres'
      ],
      energy: 'Discriminante, parfois brutale',
      astraMessage: 'Tu sens le besoin de faire le ménage. C\'est juste. Ne culpabilise pas.'
    },
    practical: [
      'Réduis les interactions superficielles',
      'Dis non sans te justifier',
      'Garde l\'essentiel visible'
    ],
    nextPhase: {
      phase: 'retrait',
      startDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      preview: 'Phase de solitude choisie et régénération.'
    }
  };
}

export async function getLongCycles(userId: string): Promise<LongCycle[]> {
  // TODO: Calculer transits réels
  // Pour MVP: cycles mock
  
  return [
    {
      name: 'Saturne carré Vénus natal',
      type: 'saturn',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-03-31'),
      progress: 60,
      meaning: {
        soulWork: [
          'La valeur réelle vs la valeur perçue',
          'Relations par besoin vs par choix',
          'La solidité émotionnelle'
        ],
        whyRepeats: 'Ce transit revient tous les 7 ans. La dernière fois (2018), tu as quitté une relation par peur de l\'engagement. Cette fois, tu construis malgré la peur.'
      },
      pattern: 'ASTRA détecte: Tu répètes le pattern "fuite quand ça devient sérieux" depuis 3 cycles similaires. Cette fois, le défi est de rester.'
    }
  ];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MÉMOIRE ASTRALE (PREMIUM)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getAstralMemory(userId: string): Promise<AstralMemory[]> {
  const { data, error } = await supabase
    .from('astral_memory')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('Error loading astral memory:', error);
    return [];
  }
  
  return (data || []).map(d => ({
    id: d.id,
    date: new Date(d.date),
    transit: d.transit,
    pattern: d.pattern,
    advice: d.advice,
  }));
}

export async function addAstralMemory(
  userId: string,
  memory: Omit<AstralMemory, 'id'>
): Promise<void> {
  const { error } = await supabase
    .from('astral_memory')
    .insert({
      user_id: userId,
      date: memory.date.toISOString(),
      transit: memory.transit,
      pattern: memory.pattern,
      advice: memory.advice,
    });
  
  if (error) {
    console.error('Error adding astral memory:', error);
    throw error;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HISTORIQUE (PREMIUM)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getEnergyHistory(
  userId: string,
  period: '7d' | '30d' | '90d'
): Promise<HistoryData> {
  // TODO: Vraie implémentation avec DB
  // Pour MVP: génère données mock
  
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const data: EnergyHistory[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date,
      energies: await calculateDailyEnergies({
        sunSign: 'gemini', // TODO: get from user
        date,
      })
    });
  }
  
  return {
    period,
    data,
    insights: [
      '📈 Ton énergie Amour remonte depuis 3 jours. Corrélation avec fin Vénus rétrograde.',
      '📉 Créativité en baisse depuis le 5. Normal: Mercure quitte maison V. Retour prévu dans 10 jours.',
      '🔄 Pattern détecté: Tes énergies chutent systématiquement les lundis. Pas astrologique, c\'est ton rythme personnel.'
    ],
    evolution: {
      challengesCompleted: {
        total: 18,
        trend: 3,
      },
      alignmentAverage: {
        value: 72,
        trend: -5,
      },
    },
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THÈME ASTRAL (ELITE)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import {
  NatalChart,
  Planet,
  LiveUpdate,
  GuardianAlert,
  DetectedPattern,
  Guidance,
} from '../types/astro-v2';

export async function getNatalChart(userId: string): Promise<NatalChart> {
  // TODO: Calculer vraiment avec ephemeris
  // Pour MVP: Mock data
  
  return {
    sun: {
      symbol: '☉',
      sign: 'libra',
      house: 7,
      meaning: {
        core: 'Trouver ton équilibre dans le reflet de l\'autre',
        wound: 'Perdre qui tu es dans le "nous"',
        work: 'Exister pleinement sans dépendre du miroir'
      }
    },
    moon: {
      symbol: '☽',
      sign: 'scorpio',
      house: 8,
      meaning: {
        motor: 'La profondeur ou rien',
        trap: 'Confondre intensité et vérité',
        work: 'Accueillir la vulnérabilité sans fusion'
      }
    },
    ascendant: {
      sign: 'pisces',
      meaning: {
        mask: 'Empathie, porosité, fuite dans l\'imaginaire',
        avoidance: 'Les confrontations directes',
        challenge: 'Garder tes limites sans durcir'
      }
    },
    chiron: {
      symbol: '⚷',
      sign: 'aries',
      house: 1,
      meaning: {
        core: 'Blessure d\'exister, d\'affirmer, de prendre de la place',
        wound: 'S\'excuser d\'avance, se faire petit, donner sans limites',
        work: 'Accepter que ton existence ne nécessite pas de justification'
      }
    },
    northNode: {
      symbol: '☊',
      sign: 'aquarius',
      house: 11,
      meaning: {
        core: 'Appartenir sans fusionner, communauté sans perte',
        work: 'Garder ton cœur ouvert sans tout donner',
        challenge: 'Tu viens de fusion intense (Leo/V), tu vas vers appartenance libre'
      }
    },
    liveUpdates: [
      {
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        observation: 'ASTRA note: Ta Lune Scorpion se manifeste. Tu as coupé 2 liens qui "ne vont pas assez loin". Le pattern se confirme.'
      },
      {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        observation: 'Ascendant Poissons actif: Tu as évité une conversation difficile par "gentillesse". C\'était de la fuite.'
      }
    ]
  };
}

export async function updateLiveChart(
  userId: string,
  event: { observation: string }
): Promise<void> {
  // TODO: Auto-log via IA
  // Pour future: ASTRA détecte automatiquement et log
  console.log('Live chart update:', event);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GUARDIAN (ELITE)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getGuardianAlerts(userId: string): Promise<GuardianAlert[]> {
  // TODO: Vraie détection patterns
  // Pour MVP: Mock alerts
  
  return [
    {
      id: `alert-${Date.now()}`,
      level: 'high',
      type: 'karmic_repetition',
      title: 'Répétition karmique détectée',
      message: `ASTRA voit le pattern:

Depuis 18 jours, tu reproduis exactement le cycle de ton dernier lien:

1. Fusion intense (✓ fait)
2. Premiers doutes (✓ en cours)
3. Fuite émotionnelle (⚠️ risque imminent)

Guardian recommande: 🔕 Silence Actif

Reste dans l'inconfort au lieu de fuir. C'est maintenant que le pattern se brise.`,
      recommendation: {
        action: 'silence_actif',
        until: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      },
      createdAt: new Date()
    },
    {
      id: `alert-${Date.now() + 1}`,
      level: 'medium',
      type: 'sensitive_period',
      title: 'Période à risque relationnel',
      message: `Vénus rétrograde + Pleine Lune en Cancer:

Les 5 prochains jours, tes émotions seront amplifiées.

Guardian suggère:
→ Pas de décisions relationnelles importantes
→ Attends le 15 pour les conversations sérieuses
→ Les ressentis seront plus clairs après`,
      recommendation: {
        action: 'wait',
        until: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      },
      createdAt: new Date()
    }
  ];
}

export async function getDetectedPatterns(userId: string): Promise<DetectedPattern[]> {
  // TODO: Analyse patterns réels
  // Pour MVP: Mock patterns
  
  return [
    {
      name: 'Fuite lors de l\'intimité croissante',
      frequency: 4,
      lastOccurrence: new Date(),
      astrological: 'Corrélation: Saturne transite ta Vénus/maison VII + Lune Scorpion activée',
      nextRisk: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    },
    {
      name: 'Sur-engagement émotionnel en Nouvelle Lune',
      frequency: 8,
      lastOccurrence: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      astrological: 'Pattern lunaire établi sur 10 mois',
      nextRisk: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000)
    }
  ];
}

export async function activateSilenceActif(
  userId: string,
  duration: number
): Promise<void> {
  // TODO: Activer réellement Silence Actif
  // Bloquer actions dans Univers V2
  console.log('Silence Actif activated for', duration, 'hours');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GUIDANCE STRATÉGIQUE (ELITE)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getStrategicGuidance(userId: string): Promise<Guidance> {
  // TODO: Calculer guidance réelle
  // Pour MVP: Mock guidance
  
  return {
    currentPhase: 'tri',
    daysRemaining: 8,
    strategic: {
      notFor: [
        'Chercher de nouvelles connexions',
        'Forcer des réponses',
        'Combler le vide'
      ],
      isFor: [
        'Clarifier ce que tu veux vraiment',
        'Laisser partir ce qui ne résonne plus',
        'Accepter le vide comme espace de tri'
      ]
    },
    timing: {
      doNow: [
        'Conversations de clarification',
        'Poser des limites',
        'Solitude choisie'
      ],
      avoid: [
        'Nouvelles rencontres',
        'Décisions définitives',
        'Comblement émotionnel rapide'
      ]
    },
    astraVoice: 'Ce lien qui arrive? Il arrive trop tôt. Tu n\'as pas fini le tri. Dans 2 semaines, tu verras plus clair. Pour l\'instant, laisse respirer.',
    upcomingShift: {
      date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      phase: 'ouverture',
      preview: 'Jupiter entre en maison V: Les nouvelles connexions redeviennent favorables. Mais seulement si le tri est fait.'
    }
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { SIGN_EMOJIS, SIGN_NAMES };
