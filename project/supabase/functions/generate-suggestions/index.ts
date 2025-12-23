import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface Profile {
  id: string;
  first_name: string;
  age: number;
  gender: string;
  seeking: string;
  age_min: number;
  age_max: number;
  sun_sign: string | null;
  attachment_style: string | null;
  is_premium: boolean;
}

function calculateCompatibility(user: Profile, potential: Profile): number {
  let score = 70;

  if (user.age && potential.age) {
    const ageDiff = Math.abs(potential.age - user.age);
    if (ageDiff < 3) score += 15;
    else if (ageDiff < 5) score += 12;
    else if (ageDiff < 8) score += 8;
    else if (ageDiff < 12) score += 4;
  }

  if (potential.sun_sign && user.sun_sign && potential.sun_sign === user.sun_sign) {
    score += 8;
  }

  if (potential.attachment_style && user.attachment_style) {
    if (potential.attachment_style === 'Sécure' || user.attachment_style === 'Sécure') {
      score += 6;
    }
    if (potential.attachment_style === user.attachment_style) {
      score += 4;
    }
  }

  const randomBonus = Math.floor(Math.random() * 8);
  return Math.min(98, score + randomBonus);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: premiumUsers } = await supabase
      .from('astra_profiles')
      .select('id, first_name, age, gender, seeking, age_min, age_max, sun_sign, attachment_style, is_premium')
      .eq('is_premium', true);

    if (!premiumUsers || premiumUsers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No premium users found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let suggestionsCreated = 0;

    for (const user of premiumUsers) {
      const existingPendingCount = await supabase
        .from('astra_suggestions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if ((existingPendingCount.count || 0) >= 3) {
        continue;
      }

      let potentialMatches = premiumUsers.filter(p => {
        if (p.id === user.id) return false;
        if (user.seeking && p.gender !== user.seeking) return false;
        if (p.seeking && user.gender !== p.seeking) return false;
        if (user.age && (user.age < p.age_min || user.age > p.age_max)) return false;
        if (p.age && (p.age < user.age_min || p.age > user.age_max)) return false;
        return true;
      });

      const { data: existingSuggestions } = await supabase
        .from('astra_suggestions')
        .select('suggested_user_id')
        .eq('user_id', user.id);

      const alreadySuggestedIds = new Set(existingSuggestions?.map(s => s.suggested_user_id) || []);
      potentialMatches = potentialMatches.filter(p => !alreadySuggestedIds.has(p.id));

      const scoredMatches = potentialMatches
        .map(p => ({
          ...p,
          score: calculateCompatibility(user, p)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      for (const match of scoredMatches) {
        const { error } = await supabase
          .from('astra_suggestions')
          .insert({
            user_id: user.id,
            suggested_user_id: match.id,
            score: match.score,
            status: 'pending'
          });

        if (!error) {
          suggestionsCreated++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Suggestions generated successfully',
        suggestions_created: suggestionsCreated
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
