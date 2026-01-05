import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { questions, responses } = await req.json();

    console.log('[Astra Attachment] Analyzing', responses.length, 'responses');

    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Tu es Astra. Analyse ultra-concise et percutante en 300-350 mots maximum.

${questions.map((q: any, i: number) => `${q.emoji} Question ${i + 1}: ${q.text}\nRéponse: ${responses[i]}`).join('\n\n')}

4 paragraphes seulement :
1. Ton style principal + % en 2 phrases
2. Ce que ça dit de toi en amour (3 phrases max)
3. Ton comportement typique + déclencheur principal
4. Conseil clé + compatibilité idéale

Ton chaleureux, zéro *, zéro titre, zéro ###. Juste du texte fluide.

Format JSON :
{
  "style": "profil identifié avec %",
  "analysis": "analyse complète en 4 paragraphes (300-350 mots max)",
  "advice": "conseil ultra-court (30 mots max)"
}`;

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
            content: 'Tu es Astra, un coach en amour éthique et bienveillant. Tu analyses les styles d\'attachement avec sagesse et compassion.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Astra Attachment] OpenAI error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    const analysis = JSON.parse(analysisText);

    console.log('[Astra Attachment] Analysis generated successfully');

    return new Response(
      JSON.stringify(analysis),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('[Astra Attachment] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});