import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

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
    const { user_id, email } = await req.json();

    if (!user_id || !email) {
      return new Response(
        JSON.stringify({ error: 'user_id and email required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const startTime = Date.now();

    const subscriptionId = `sub_test_${Date.now()}`;
    const customerId = `cus_test_${Date.now()}`;
    const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const { error: updateError } = await supabase
      .from('astra_profiles')
      .update({
        is_premium: true,
        stripe_customer_id: customerId,
        subscription_id: subscriptionId,
        current_period_end: currentPeriodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user_id);

    if (updateError) {
      throw updateError;
    }

    await supabase
      .from('astra_subscriptions')
      .upsert({
        user_id: user_id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
      });

    const endTime = Date.now();
    const duration = endTime - startTime;

    const { data: profile } = await supabase
      .from('astra_profiles')
      .select('is_premium, subscription_id, current_period_end')
      .eq('id', user_id)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        duration_ms: duration,
        profile: profile,
        message: `Premium activated in ${duration}ms`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Test activation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});