import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface Profile {
  id: string;
  pseudo: string;
  signe_solaire: string;
  ascendant: string;
  lune: string;
  valeurs: string[];
  interets: string[];
  age: number;
  looking_for: string;
}

interface CompatibilityAnalysis {
  score: number;
  analyse_ia: string;
  points_forts: string[];
  defis: string[];
  conseil: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { user1, user2 } = await req.json();

    if (!user1 || !user2) {
      return new Response(
        JSON.stringify({ error: "Missing user profiles" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const prompt = `Tu es un expert en astrologie et relations amoureuses. Réponds UNIQUEMENT en JSON valide.

Analyse la compatibilité amoureuse entre :

Profil 1: ${user1.pseudo}
- Âge: ${user1.age} ans
- Signe solaire: ${user1.signe_solaire || 'Non renseigné'}
- Ascendant: ${user1.ascendant || 'Non renseigné'}
- Lune: ${user1.lune || 'Non renseigné'}
- Recherche: ${user1.looking_for || 'Non renseigné'}
- Valeurs: ${user1.valeurs?.join(', ') || 'Non renseignées'}
- Centres d'intérêt: ${user1.interets?.join(', ') || 'Non renseignés'}

Profil 2: ${user2.pseudo}
- Âge: ${user2.age} ans
- Signe solaire: ${user2.signe_solaire || 'Non renseigné'}
- Ascendant: ${user2.ascendant || 'Non renseigné'}
- Lune: ${user2.lune || 'Non renseigné'}
- Recherche: ${user2.looking_for || 'Non renseigné'}
- Valeurs: ${user2.valeurs?.join(', ') || 'Non renseignées'}
- Centres d'intérêt: ${user2.interets?.join(', ') || 'Non renseignés'}

Réponds en JSON avec cette structure exacte:
{
  "score": 85,
  "analyse_ia": "Paragraphe d'analyse générale de 3-4 phrases sur la compatibilité globale",
  "points_forts": ["Point fort 1", "Point fort 2", "Point fort 3"],
  "defis": ["Défi 1", "Défi 2"],
  "conseil": "Conseil personnalisé pour ce couple en 2-3 phrases"
}

Base ton analyse sur:
1. La compatibilité astrologique (synastrie des signes solaires, lunaires, ascendants)
2. L'alignement des valeurs et objectifs de vie
3. La complémentarité des centres d'intérêt
4. Le type de relation recherchée

Sois encourageant mais honnête. Le score doit refléter la compatibilité globale.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en astrologie et relations amoureuses. Réponds UNIQUEMENT en JSON valide.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    let analysis: CompatibilityAnalysis;
    try {
      analysis = JSON.parse(content);
      
      if (!analysis.score || !analysis.analyse_ia || !analysis.points_forts || !analysis.defis || !analysis.conseil) {
        throw new Error('Missing required fields in AI response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      analysis = {
        score: 70,
        analyse_ia: 'Profils intéressants avec un potentiel de connexion. Vos valeurs semblent alignées et vos personnalités pourraient se compléter.',
        points_forts: ['Connexion potentielle', 'Complémentarité', 'Alignement des valeurs'],
        defis: ['Communication à développer', 'Rythmes différents'],
        conseil: 'Prenez le temps de vous découvrir mutuellement et de construire une communication ouverte.',
      };
    }

    return new Response(
      JSON.stringify(analysis),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Error analyzing compatibility:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});