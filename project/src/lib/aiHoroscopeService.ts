import { supabase } from './supabase';

export interface AIHoroscope {
  sign: string;
  date: string;
  description: string;
  mood?: string;
  color?: string;
  luckyNumber?: number;
  luckyTime?: string;
  compatibility?: string | {
    highest?: string[];
    percentages?: Record<string, number>;
    analysis?: string;
  };
  planets?: string | {
    venus?: string;
    mars?: string;
    mercury?: string;
  };
  houses?: string;
  energy?: string;
  timeline?: {
    morning?: string;
    afternoon?: string;
    evening?: string;
  };
  loveAdvice?: string;
  advice?: string;
  astraAdvice?: string;
  astraStrategy?: string;
  cosmic_warning?: string;
  dailyAdvice?: string;
  energies?: {
    vitality?: number;
    creativity?: number;
    love?: number;
    luck?: number;
  };
  timeSlots?: {
    morning?: 'excellent' | 'good' | 'neutral' | 'low';
    afternoon?: 'excellent' | 'good' | 'neutral' | 'low';
    evening?: 'excellent' | 'good' | 'neutral' | 'low';
  };
  inspirationalQuote?: string;
  career?: string;
  finances?: string;
  health?: string;
  wellbeing?: string;
  subscriptionTier: 'free' | 'premium' | 'premium_elite';
  generatedAt: string;
  generatedBy: 'AI';
  source: string;
}

interface CachedHoroscope {
  horoscope: AIHoroscope;
  expiresAt: number;
}

const convertSignToEnglish = (frenchSign: string): string => {
  const signMap: Record<string, string> = {
    'bélier': 'Aries',
    'taureau': 'Taurus',
    'gémeaux': 'Gemini',
    'cancer': 'Cancer',
    'lion': 'Leo',
    'vierge': 'Virgo',
    'balance': 'Libra',
    'scorpion': 'Scorpio',
    'sagittaire': 'Sagittarius',
    'capricorne': 'Capricorn',
    'verseau': 'Aquarius',
    'poissons': 'Pisces'
  };

  return signMap[frenchSign.toLowerCase()] || frenchSign;
};

const getAIPrompt = (sign: string, tier: 'free' | 'premium' | 'premium_elite'): string => {
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const englishSign = convertSignToEnglish(sign);

  const prompts = {
    free: `Tu es un astrologue expert. Génère un horoscope COMPLET pour le signe ${englishSign} du ${today}.

Format JSON uniquement (sans balises markdown):
{
  "description": "2-3 phrases courtes et positives sur la journée",
  "mood": "Happy",
  "color": "#E94057",
  "luckyNumber": 42,
  "luckyTime": "matin",
  "compatibility": "Gémeaux, Balance",
  "advice": "Un conseil court et encourageant pour les rencontres",
  "dailyAdvice": "Conseil pratique et actionnable pour aujourd'hui",
  "energies": {
    "vitality": 85,
    "creativity": 92,
    "love": 78,
    "luck": 88
  },
  "timeSlots": {
    "morning": "good",
    "afternoon": "excellent",
    "evening": "good"
  },
  "inspirationalQuote": "Citation inspirante courte et percutante sur l'astrologie ou la vie"
}

Sois positif, encourageant et motivant. Maximum 120 mots pour description.`,

    premium: `Tu es un astrologue professionnel. Génère un horoscope DÉTAILLÉ pour le signe ${englishSign} du ${today}.

Analyse approfondie pour une app de rencontre astrologique.

Format JSON uniquement (sans balises markdown):
{
  "description": "4-5 phrases détaillées avec analyse astrologique approfondie",
  "mood": "Optimistic",
  "color": "#E94057",
  "luckyNumber": 42,
  "luckyTime": "18h-20h",
  "compatibility": "Gémeaux (85%), Balance (78%), Verseau (72%)",
  "planets": "Vénus en harmonie avec Mars favorise les rencontres passionnées",
  "energy": "Énergies romantiques et communicatives au plus haut",
  "loveAdvice": "C'est le moment idéal pour faire le premier pas. Les astres favorisent les connexions authentiques et profondes.",
  "astraAdvice": "Optimise ton profil aujourd'hui, swipe en soirée, privilégie les conversations profondes",
  "dailyAdvice": "Conseil pratique et actionnable pour optimiser ta journée",
  "energies": {
    "vitality": 88,
    "creativity": 95,
    "love": 82,
    "luck": 91
  },
  "timeSlots": {
    "morning": "good",
    "afternoon": "excellent",
    "evening": "excellent"
  },
  "inspirationalQuote": "Citation inspirante profonde et motivante",
  "career": "Analyse professionnelle détaillée avec opportunités du jour",
  "finances": "Prévisions financières et conseils d'investissement émotionnel",
  "health": "Conseils santé personnalisés basés sur les transits",
  "wellbeing": "Recommandations bien-être pour équilibrer les énergies"
}

Sois précis, professionnel et inspirant. Maximum 250 mots pour description.`,

    premium_elite: `Tu es un astrologue de renommée mondiale. Génère une ANALYSE COMPLÈTE ultra-personnalisée pour le signe ${englishSign} du ${today}.

Analyse cosmique approfondie pour maximiser les rencontres amoureuses.

Format JSON uniquement (sans balises markdown):
{
  "description": "Analyse narrative complète de 6-8 phrases avec insights astrologiques profonds",
  "mood": "Énergique et confiant",
  "color": "#E94057",
  "luckyNumber": 42,
  "luckyTime": "17h30-19h00",
  "compatibility": {
    "highest": ["Gémeaux", "Balance"],
    "percentages": {"Gémeaux": 92, "Balance": 87, "Verseau": 78},
    "analysis": "Excellente synergie avec les signes d'Air aujourd'hui grâce à Mercure direct"
  },
  "planets": {
    "venus": "En Poissons, favorise l'intimité émotionnelle",
    "mars": "En Gémeaux, stimule la communication séductrice",
    "mercury": "Direct en Verseau, clarifie les intentions"
  },
  "houses": "Maison 5 (romance) et 7 (relations) particulièrement activées",
  "energy": "Puissante énergie de connexion authentique. Jour idéal pour sortir de ta zone de confort",
  "timeline": {
    "morning": "Énergie calme, parfait pour peaufiner ton profil",
    "afternoon": "Pic de créativité, envoie des messages originaux",
    "evening": "Moment magique pour les premières rencontres"
  },
  "loveAdvice": "Les astres s'alignent pour favoriser des connexions profondes. Sois vulnérable et authentique. Partage tes passions. L'univers récompense l'honnêteté émotionnelle aujourd'hui.",
  "astraStrategy": "Stratégie optimale: Swipe entre 18h-20h quand Vénus culmine. Cible les profils qui valorisent la communication. Envoie des premiers messages entre 19h-21h. Utilise tes Super Likes sur des profils compatibles astrologiquement.",
  "cosmic_warning": "Évite les décisions impulsives avant 15h. Mercure peut créer des malentendus matinaux",
  "dailyAdvice": "Conseil stratégique complet pour maximiser toutes les sphères de ta journée",
  "energies": {
    "vitality": 94,
    "creativity": 98,
    "love": 89,
    "luck": 96
  },
  "timeSlots": {
    "morning": "good",
    "afternoon": "excellent",
    "evening": "excellent"
  },
  "inspirationalQuote": "Citation profonde et transformationnelle qui résonne avec l'énergie cosmique du jour",
  "career": "Analyse carrière ultra-détaillée avec timing précis pour actions clés et négociations",
  "finances": "Prévisions financières stratégiques avec fenêtres d'opportunités cosmiques",
  "health": "Plan santé holistique basé sur les influences planétaires spécifiques du jour",
  "wellbeing": "Programme bien-être complet aligné sur les cycles cosmiques pour maximiser ton énergie"
}

Sois extrêmement détaillé, unique et stratégique. Maximum 400 mots pour description.`
  };

  return prompts[tier] || prompts.free;
};

const callOpenAI = async (prompt: string, tier: 'free' | 'premium' | 'premium_elite'): Promise<AIHoroscope | null> => {
  const maxTokens = tier === 'premium_elite' ? 1500 : tier === 'premium' ? 800 : 500;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Tu es un astrologue expert qui génère des horoscopes personnalisés. Tu réponds UNIQUEMENT en JSON valide, sans texte additionnel ni balises markdown.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      console.error('[AI Horoscope] OpenAI error:', await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const cleanedContent = content.replace(/```json|```/g, '').trim();
    const horoscopeData = JSON.parse(cleanedContent);

    return horoscopeData;
  } catch (error) {
    console.error('[AI Horoscope] OpenAI call failed:', error);
    return null;
  }
};

const callSupabaseEdgeFunction = async (sign: string, tier: 'free' | 'premium' | 'premium_elite'): Promise<AIHoroscope | null> => {
  try {
    console.log('[AI Horoscope] Appel edge function...');

    const prompt = getAIPrompt(sign, tier);

    const { data, error } = await supabase.functions.invoke('astra-chat', {
      body: {
        message: prompt,
        conversationId: `horoscope_${sign}_${Date.now()}`,
        systemPrompt: 'Tu es un astrologue expert qui génère des horoscopes personnalisés en JSON.'
      }
    });

    if (error) {
      console.error('[AI Horoscope] Edge function error:', error);
      return null;
    }

    if (data && data.response) {
      const cleanedResponse = data.response.replace(/```json|```/g, '').trim();
      const horoscopeData = JSON.parse(cleanedResponse);
      return horoscopeData;
    }

    return null;
  } catch (error) {
    console.error('[AI Horoscope] Edge function call failed:', error);
    return null;
  }
};

const generateFallbackHoroscope = (sign: string, tier: 'free' | 'premium' | 'premium_elite'): AIHoroscope => {
  const englishSign = convertSignToEnglish(sign);
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const fallbacks = {
    free: {
      description: `Aujourd'hui, ${englishSign}, l'univers t'invite à être authentique et ouvert(e) aux nouvelles rencontres. Les astres favorisent les connexions sincères et les échanges enrichissants. Fais confiance à ton intuition.`,
      mood: 'Optimiste',
      compatibility: 'Gémeaux, Balance',
      advice: "Reste toi-même et laisse ta personnalité briller. Les bonnes personnes seront naturellement attirées par ton authenticité.",
      dailyAdvice: "Prends le temps d'écouter ton intuition aujourd'hui. Les astres te guident vers les bonnes décisions.",
      energies: { vitality: 82, creativity: 88, love: 75, luck: 85 },
      timeSlots: { morning: 'good' as const, afternoon: 'excellent' as const, evening: 'good' as const },
      inspirationalQuote: "Les étoiles brillent pour ceux qui osent lever les yeux vers le ciel."
    },
    premium: {
      description: `${englishSign}, les configurations planétaires actuelles créent une atmosphère favorable aux rencontres significatives. Vénus influence positivement ta communication, tandis que Mars t'apporte l'audace nécessaire pour faire le premier pas. C'est un moment propice pour exprimer tes sentiments et créer des liens authentiques.`,
      mood: 'Confiant et inspiré',
      compatibility: 'Gémeaux (88%), Balance (82%), Verseau (75%)',
      planets: 'Vénus favorise la romance, Mars stimule ton courage relationnel',
      energy: 'Énergie créative et communicative au maximum',
      loveAdvice: "Les astres s'alignent pour favoriser des connexions profondes. Ose être vulnérable et partage tes vraies passions.",
      astraAdvice: "Swipe pendant les heures de soirée et privilégie les conversations qui révèlent ta vraie personnalité",
      dailyAdvice: "Concentre-toi sur l'authenticité dans tous tes échanges. C'est ta meilleure arme de séduction cosmique.",
      energies: { vitality: 90, creativity: 94, love: 85, luck: 91 },
      timeSlots: { morning: 'good' as const, afternoon: 'excellent' as const, evening: 'excellent' as const },
      inspirationalQuote: "L'univers conspire en faveur de ceux qui osent suivre leur cœur avec courage.",
      career: "Jupiter apporte des opportunités professionnelles inattendues. Ta créativité sera remarquée. C'est le moment de proposer tes idées innovantes.",
      finances: "Les énergies sont favorables aux investissements émotionnels qui porteront leurs fruits. Fais confiance à ton intuition financière.",
      health: "Ton énergie est au maximum. C'est le moment idéal pour initier une nouvelle routine de bien-être ou sport.",
      wellbeing: "Privilégie les activités qui nourrissent ton âme : méditation, musique, nature. L'équilibre cosmique favorise la régénération."
    },
    premium_elite: {
      description: `${englishSign}, analyse cosmique complète : les transits actuels créent une fenêtre exceptionnelle pour l'amour. Vénus en harmonie avec Jupiter amplifie ton charme naturel. Mars direct stimule ton assertivité romantique. Mercure favorise les conversations captivantes. Les maisons 5 et 7 de ton thème sont particulièrement activées, signalant des opportunités relationnelles majeures. C'est un moment rare où tous les éléments s'alignent pour favoriser une connexion authentique et durable.`,
      mood: 'Magnétique et inspiré',
      compatibility: {
        highest: ['Gémeaux', 'Balance'],
        percentages: { 'Gémeaux': 94, 'Balance': 89, 'Verseau': 81 },
        analysis: 'Synergie cosmique exceptionnelle avec les signes d\'Air grâce aux transits actuels'
      },
      planets: {
        venus: 'En aspect harmonieux avec Jupiter, amplifie l\'attraction',
        mars: 'En Gémeaux, stimule la communication séductrice',
        mercury: 'Direct en Verseau, favorise la clarté émotionnelle'
      },
      houses: 'Maison 5 (romance créative) et 7 (partenariats) exceptionnellement activées',
      energy: 'Puissante vague d\'énergie relationnelle et magnétisme personnel au sommet',
      timeline: {
        morning: 'Période de réflexion, affine ton approche',
        afternoon: 'Pic de créativité, moments parfaits pour les messages originaux',
        evening: 'Fenêtre magique 18h-21h pour les connexions profondes'
      },
      loveAdvice: "L'alignement cosmique actuel est rare et puissant. Sois courageux(se) dans ton authenticité. Partage tes vraies passions, tes rêves profonds. L'univers récompense la vulnérabilité émotionnelle aujourd'hui. Les connexions formées maintenant ont un potentiel exceptionnel de profondeur et de durabilité.",
      astraStrategy: "Stratégie optimale sur Astra : Swipe entre 17h30-20h quand ton magnétisme personnel culmine. Cible les profils qui valorisent l'authenticité et la profondeur. Utilise tes Super Likes stratégiquement sur des profils astrologiquement compatibles. Envoie des premiers messages personnalisés entre 19h-21h. Propose des rencontres en face à face rapidement si la connexion est forte.",
      cosmic_warning: 'Petite turbulence possible avant 14h due à Mercure. Attends l\'après-midi pour les décisions importantes.',
      dailyAdvice: "Jour exceptionnel pour l'action stratégique dans tous les domaines. Aligne tes décisions majeures sur les fenêtres cosmiques optimales pour maximiser ton succès.",
      energies: { vitality: 96, creativity: 99, love: 92, luck: 97 },
      timeSlots: { morning: 'good' as const, afternoon: 'excellent' as const, evening: 'excellent' as const },
      inspirationalQuote: "Dans le grand ballet cosmique, tu es à la fois le danseur et la danse. Aujourd'hui, l'univers chorégraphie ton chef-d'œuvre.",
      career: "Alignement planétaire majeur pour la carrière. Jupiter et Saturne créent une fenêtre d'opportunités professionnelles entre 10h-15h. Les négociations démarrées maintenant bénéficient d'un soutien cosmique exceptionnel. Mercure direct favorise la clarté dans tes communications professionnelles. C'est le moment de présenter tes projets ambitieux.",
      finances: "Configuration financière puissante. Vénus en harmonie avec Jupiter amplifie les opportunités d'abondance. Les investissements émotionnels et matériels initiés aujourd'hui sont favorisés par les astres. Évite toutefois les décisions impulsives avant 14h. La fenêtre optimale pour les transactions importantes : 15h-18h.",
      health: "Vitalité cosmique au maximum. Mars stimule ton énergie physique tandis que la Lune favorise l'équilibre émotionnel. Programme idéal : cardio matinal (7h-9h), nutrition consciente à midi, yoga ou étirements en soirée (19h-20h). Ton corps est exceptionnellement réceptif aux pratiques de bien-être aujourd'hui.",
      wellbeing: "Jour parfait pour une transformation holistique. Les maisons astrologiques de la régénération sont activées. Méditation guidée à l'aube maximise la connexion cosmique. La nature t'appelle entre 16h-18h pour une recharge énergétique profonde. Musique thérapeutique et bains rituels en soirée amplifient ta vibration spirituelle. L'univers t'offre une journée de renaissance."
    }
  };

  const fallback = fallbacks[tier];

  return {
    sign,
    date: today,
    description: fallback.description,
    mood: fallback.mood,
    color: '#E94057',
    luckyNumber: Math.floor(Math.random() * 100) + 1,
    luckyTime: tier === 'premium_elite' ? '18h-20h' : tier === 'premium' ? 'Soirée' : 'Toute la journée',
    compatibility: fallback.compatibility,
    planets: tier !== 'free' ? (fallback as any).planets : undefined,
    houses: tier === 'premium_elite' ? (fallback as any).houses : undefined,
    energy: tier !== 'free' ? (fallback as any).energy : undefined,
    timeline: tier === 'premium_elite' ? (fallback as any).timeline : undefined,
    loveAdvice: tier !== 'free' ? (fallback as any).loveAdvice : undefined,
    advice: tier === 'free' ? (fallback as any).advice : undefined,
    astraAdvice: tier !== 'free' ? (fallback as any).astraAdvice : undefined,
    astraStrategy: tier === 'premium_elite' ? (fallback as any).astraStrategy : undefined,
    cosmic_warning: tier === 'premium_elite' ? (fallback as any).cosmic_warning : undefined,
    subscriptionTier: tier,
    generatedAt: new Date().toISOString(),
    generatedBy: 'AI',
    source: 'Fallback astrological analysis'
  };
};

export const generateAIHoroscope = async (
  sign: string,
  subscriptionTier: 'free' | 'premium' | 'premium_elite'
): Promise<AIHoroscope> => {
  try {
    console.log(`[AI Horoscope] Génération pour ${sign} (${subscriptionTier})...`);

    const today = new Date().toDateString();
    const cacheKey = `ai_horoscope_${sign}_${subscriptionTier}_${today}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const { horoscope, expiresAt }: CachedHoroscope = JSON.parse(cached);
      if (Date.now() < expiresAt) {
        console.log('[AI Horoscope] Chargé depuis cache');
        return horoscope;
      }
    }

    const prompt = getAIPrompt(sign, subscriptionTier);

    let aiResult = await callSupabaseEdgeFunction(sign, subscriptionTier);

    if (!aiResult && import.meta.env.VITE_OPENAI_API_KEY) {
      aiResult = await callOpenAI(prompt, subscriptionTier);
    }

    let finalHoroscope: AIHoroscope;

    if (aiResult) {
      finalHoroscope = {
        ...aiResult,
        sign,
        date: new Date().toLocaleDateString('fr-FR'),
        subscriptionTier,
        generatedAt: new Date().toISOString(),
        generatedBy: 'AI',
        source: 'AI-powered astrological analysis'
      };
      console.log('[AI Horoscope] Généré par IA avec succès');
    } else {
      console.log('[AI Horoscope] Utilisation du fallback');
      finalHoroscope = generateFallbackHoroscope(sign, subscriptionTier);
    }

    const cache: CachedHoroscope = {
      horoscope: finalHoroscope,
      expiresAt: new Date().setHours(23, 59, 59, 999)
    };
    localStorage.setItem(cacheKey, JSON.stringify(cache));

    return finalHoroscope;
  } catch (error) {
    console.error('[AI Horoscope] Erreur complète:', error);
    return generateFallbackHoroscope(sign, subscriptionTier);
  }
};

export const clearAIHoroscopeCache = (sign: string, subscriptionTier: string): void => {
  try {
    const today = new Date().toDateString();
    const cacheKey = `ai_horoscope_${sign}_${subscriptionTier}_${today}`;
    localStorage.removeItem(cacheKey);
    console.log('[AI Horoscope] Cache supprimé');
  } catch (error) {
    console.error('[AI Horoscope] Erreur suppression cache:', error);
  }
};
