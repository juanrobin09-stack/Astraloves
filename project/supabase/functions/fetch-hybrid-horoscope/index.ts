import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface HoroscopeRequest {
  zodiacSign: string;
  tier: "free" | "premium" | "elite";
  userName?: string;
  birthDate?: string;
}

interface AztroResponse {
  date_range: string;
  current_date: string;
  description: string;
  compatibility: string;
  mood: string;
  color: string;
  lucky_number: string;
  lucky_time: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { zodiacSign, tier, userName, birthDate }: HoroscopeRequest = await req.json();

    if (!zodiacSign || !tier) {
      throw new Error("Missing required fields");
    }

    const today = new Date().toISOString().split('T')[0];
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Check cache first
    let { data: cachedData } = await supabase
      .from('horoscope_cache')
      .select('*')
      .eq('zodiac_sign', zodiacSign.toLowerCase())
      .eq('date', today)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    // If no cache or expired, fetch real data
    if (!cachedData) {
      console.log('Fetching fresh horoscope data for', zodiacSign);
      
      try {
        // Fetch from Aztro API
        const aztroResponse = await fetch(`https://aztro.sameerkumar.website/?sign=${zodiacSign.toLowerCase()}&day=today`, {
          method: 'POST'
        });

        if (!aztroResponse.ok) {
          throw new Error('Failed to fetch from Aztro API');
        }

        const aztroData: AztroResponse = await aztroResponse.json();

        // Generate planetary positions (simulated for now)
        const planetaryPositions = {
          sun: { sign: getSignNameFr(zodiacSign), degree: Math.floor(Math.random() * 30) },
          moon: { sign: getSignNameFr(getRandomSign()), degree: Math.floor(Math.random() * 30) },
          mercury: { sign: getSignNameFr(getRandomSign()), degree: Math.floor(Math.random() * 30) },
          venus: { sign: getSignNameFr(getRandomSign()), degree: Math.floor(Math.random() * 30) },
          mars: { sign: getSignNameFr(getRandomSign()), degree: Math.floor(Math.random() * 30) },
        };

        // Generate transits in French
        const transits = {
          major: [
            `La Lune en ${planetaryPositions.moon.sign} influence la clarté émotionnelle`,
            `Vénus en ${planetaryPositions.venus.sign} ${getVenusEffect()}`,
            `Mars en ${planetaryPositions.mars.sign} apporte ${getMarsEffect()}`,
          ],
          minor: [
            `Mercure en ${planetaryPositions.mercury.sign} favorise la communication`,
            'Aspects favorables pour la croissance personnelle',
          ],
        };

        // Store in cache
        const { data: newCache } = await supabase
          .from('horoscope_cache')
          .insert({
            zodiac_sign: zodiacSign.toLowerCase(),
            date: today,
            daily_data: {
              description: aztroData.description,
              compatibility: aztroData.compatibility,
              mood: aztroData.mood,
              color: aztroData.color,
              lucky_number: aztroData.lucky_number,
              lucky_time: aztroData.lucky_time,
              date_range: aztroData.date_range,
            },
            planetary_positions: planetaryPositions,
            transits: transits,
            expires_at: endOfDay.toISOString(),
          })
          .select()
          .single();

        cachedData = newCache;
      } catch (apiError) {
        console.error('Error fetching from API:', apiError);
        // Fallback to generated content
        cachedData = {
          zodiac_sign: zodiacSign.toLowerCase(),
          date: today,
          daily_data: {
            description: generateFallbackHoroscope(zodiacSign),
            mood: getMood(),
            color: getLuckyColor(),
            lucky_number: String(Math.floor(Math.random() * 100)),
            lucky_time: getRandomTime(),
          },
          planetary_positions: {},
          transits: {},
        };
      }
    }

    // Check if user already has a personalized message for today
    let { data: userMessage } = await supabase
      .from('user_horoscope_messages')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    // Generate personalized message if needed and OpenAI is available
    if (!userMessage && openaiKey && tier !== 'free') {
      const personalizedMessage = await generatePersonalizedMessage(
        zodiacSign,
        tier,
        cachedData.daily_data,
        cachedData.transits,
        userName || 'vous',
        openaiKey
      );

      const { data: newMessage } = await supabase
        .from('user_horoscope_messages')
        .insert({
          user_id: user.id,
          zodiac_sign: zodiacSign.toLowerCase(),
          date: today,
          tier: tier,
          personalized_message: personalizedMessage,
        })
        .select()
        .single();

      userMessage = newMessage;
    }

    // Build response based on tier
    const response = buildTieredResponse(tier, cachedData, userMessage);

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in fetch-hybrid-horoscope:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

function buildTieredResponse(tier: string, cachedData: any, userMessage: any) {
  const dailyData = cachedData.daily_data || {};
  const transits = cachedData.transits || {};
  const positions = cachedData.planetary_positions || {};

  const baseResponse = {
    tier,
    date: cachedData.date,
    zodiacSign: cachedData.zodiac_sign,
  };

  if (tier === 'free') {
    // Free tier: full horoscope but limited features
    return {
      ...baseResponse,
      description: dailyData.description,
      mood: dailyData.mood,
      color: dailyData.color,
      luckyNumber: dailyData.lucky_number,
      isPremiumContent: false,
      upgradeMessage: 'Passez à Premium pour la compatibilité, les transits planétaires et des conseils personnalisés par IA.',
    };
  }

  if (tier === 'premium') {
    // Premium tier: full content + basic personalization
    return {
      ...baseResponse,
      description: dailyData.description,
      compatibility: dailyData.compatibility,
      mood: dailyData.mood,
      color: dailyData.color,
      luckyNumber: dailyData.lucky_number,
      luckyTime: dailyData.lucky_time,
      majorTransits: transits.major || [],
      personalizedMessage: userMessage?.personalized_message,
      isPremiumContent: true,
    };
  }

  if (tier === 'elite') {
    // Elite tier: everything + weekly forecast + birth chart
    return {
      ...baseResponse,
      description: dailyData.description,
      compatibility: dailyData.compatibility,
      mood: dailyData.mood,
      color: dailyData.color,
      luckyNumber: dailyData.lucky_number,
      luckyTime: dailyData.lucky_time,
      majorTransits: transits.major || [],
      minorTransits: transits.minor || [],
      planetaryPositions: positions,
      personalizedMessage: userMessage?.personalized_message,
      birthChartAnalysis: userMessage?.birth_chart_analysis,
      isPremiumContent: true,
      isEliteContent: true,
    };
  }

  return baseResponse;
}

async function generatePersonalizedMessage(
  zodiacSign: string,
  tier: string,
  dailyData: any,
  transits: any,
  userName: string,
  openaiKey: string
): Promise<string> {
  try {
    const signNameFr = getSignNameFr(zodiacSign);
    const prompt = `Tu es un astrologue professionnel bienveillant. Génère un message d'horoscope personnalisé pour ${userName}, de signe ${signNameFr}.

Horoscope du jour : ${dailyData.description}
Humeur : ${dailyData.mood}
Transits majeurs : ${(transits.major || []).join(', ')}

Fournis des conseils spécifiques et actionnables pour aujourd'hui. Sois chaleureux, perspicace et encourageant.
Garde le message court : 2-3 phrases maximum.
Concentre-toi sur des conseils pratiques utilisables aujourd'hui.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Tu es un astrologue compassionnel et perspicace qui fournit des conseils personnalisés et actionnables en français.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API failed');
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating personalized message:', error);
    return getFallbackMessage(zodiacSign, dailyData.mood);
  }
}

function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function generateFallbackHoroscope(sign: string): string {
  const signNameFr = getSignNameFr(sign);
  const templates = [
    `Aujourd'hui apporte des opportunités pour les ${signNameFr} de briller de façon inattendue. Faites confiance à votre intuition et embrassez les nouvelles possibilités.`,
    `L'énergie cosmique favorise les ${signNameFr} aujourd'hui. Concentrez-vous sur les connexions significatives et la croissance personnelle.`,
    `${signNameFr}, les étoiles s'alignent pour soutenir vos ambitions aujourd'hui. Prenez des mesures confiantes vers vos objectifs.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function getFallbackMessage(sign: string, mood: string): string {
  const signNameFr = getSignNameFr(sign);
  return `Votre énergie ${mood} d'aujourd'hui est parfaitement alignée avec les forces naturelles des ${signNameFr}. Concentrez-vous sur ce qui vous apporte de la joie et n'hésitez pas à partager votre perspective unique avec les autres.`;
}

function getRandomSign(): string {
  const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  return signs[Math.floor(Math.random() * signs.length)];
}

function getSignNameFr(sign: string): string {
  const names: Record<string, string> = {
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
  return names[sign.toLowerCase()] || sign;
}

function getVenusEffect(): string {
  const effects = ['rehausse la romance et la créativité', 'favorise l\'harmonie relationnelle', 'éveille l\'appréciation esthétique', 'renforce les connexions sociales'];
  return effects[Math.floor(Math.random() * effects.length)];
}

function getMarsEffect(): string {
  const effects = ['une énergie dynamique', 'la motivation d\'agir', 'le courage de poursuivre vos objectifs', 'la passion dans vos entreprises'];
  return effects[Math.floor(Math.random() * effects.length)];
}

function getMood(): string {
  const moods = ['optimistic', 'reflective', 'energetic', 'peaceful', 'ambitious', 'creative'];
  return moods[Math.floor(Math.random() * moods.length)];
}

function getLuckyColor(): string {
  const colors = ['blue', 'red', 'green', 'purple', 'gold', 'silver', 'orange', 'pink'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomTime(): string {
  const times = ['morning', 'noon', 'afternoon', 'evening', 'night'];
  return times[Math.floor(Math.random() * times.length)];
}