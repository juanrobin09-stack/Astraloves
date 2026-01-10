import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import Stripe from 'npm:stripe@17.4.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-11-20.acacia',
    });

    const { email, days } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const daysToAdd = days || 30;

    const { data: profile, error: profileError } = await supabase
      .from('astra_profiles')
      .select('id, email, is_premium, stripe_customer_id')
      .eq('email', email)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let stripeCustomerId = profile.stripe_customer_id;

    if (!stripeCustomerId) {
      console.log(`Creating Stripe customer for ${email}...`);
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          supabase_user_id: profile.id,
          manual_activation: 'true',
        },
      });
      stripeCustomerId = customer.id;
      console.log(`Created Stripe customer: ${stripeCustomerId}`);
    }

    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + daysToAdd);

    const { data: updated, error: updateError } = await supabase
      .from('astra_profiles')
      .update({
        is_premium: true,
        stripe_customer_id: stripeCustomerId,
        current_period_end: periodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)
      .select()
      .single();

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Premium activated for ${email} until ${periodEnd.toISOString()}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Premium activated for ${email}`,
        user: updated,
        stripe_customer_id: stripeCustomerId,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
