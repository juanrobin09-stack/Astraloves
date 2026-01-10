import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const headers = { ...corsHeaders, 'Content-Type': 'application/json' };

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ message: "Connecte-toi ! 🔐" }), { status: 401, headers });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return new Response(JSON.stringify({ message: "Session expirée 🔄" }), { status: 401, headers });
    }

    const { data: limitCheck } = await supabase.rpc('check_astra_limit', { p_user_id: user.id });
    if (limitCheck && !limitCheck.allowed) {
      return new Response(JSON.stringify({ 
        message: `Tu as utilisé tes ${limitCheck.limit} messages Astra aujourd'hui ! Passe en Premium pour plus 💎`,
        limitReached: true 
      }), { headers });
    }

    const body = await req.json();
    const userMessage = body.message || body.messages?.[body.messages?.length - 1]?.content || 'Bonjour';

    await supabase.rpc('increment_astra_messages', { p_user_id: user.id });

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return new Response(JSON.stringify({ message: "Config en cours 🔧" }), { headers });
    }

    const { data: profile } = await supabase.from('astra_profiles').select('first_name, sun_sign').eq('id', user.id).single();

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `Tu es Astra, assistante IA bienveillante pour les rencontres et l'astrologie. Tu parles à ${profile?.first_name || 'ami(e)'}. Réponds en français, sois chaleureuse et concise.` },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 400,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify({ message: data.choices?.[0]?.message?.content || "Réessaie !" }), { headers });

  } catch (e) {
    return new Response(JSON.stringify({ message: "Erreur temporaire 🌟" }), { status: 500, headers });
  }
});
