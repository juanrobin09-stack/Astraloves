import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import Stripe from 'npm:stripe@14.10.0';

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
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('Starting subscription sync...');

    const { data: profiles, error: profilesError } = await supabase
      .from('astra_profiles')
      .select('id, email, stripe_customer_id, subscription_id, is_premium')
      .not('stripe_customer_id', 'is', null);

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    console.log(`Found ${profiles?.length || 0} profiles with Stripe customer IDs`);

    const results = {
      processed: 0,
      activated: 0,
      deactivated: 0,
      errors: [] as string[],
    };

    for (const profile of profiles || []) {
      try {
        console.log(`Processing user ${profile.id} (${profile.email})`);

        const subscriptions = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          limit: 10,
        });

        const activeSubscription = subscriptions.data.find(
          (sub) => sub.status === 'active' || sub.status === 'trialing'
        );

        if (activeSubscription) {
          console.log(`Found active subscription for user ${profile.id}`);

          const { error: updateError } = await supabase
            .from('astra_profiles')
            .update({
              is_premium: true,
              subscription_id: activeSubscription.id,
              current_period_end: new Date(activeSubscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);

          if (updateError) {
            throw new Error(`Failed to update profile: ${updateError.message}`);
          }

          await supabase
            .from('astra_subscriptions')
            .upsert({
              user_id: profile.id,
              stripe_customer_id: profile.stripe_customer_id,
              stripe_subscription_id: activeSubscription.id,
              status: 'active',
              current_period_start: new Date(activeSubscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(activeSubscription.current_period_end * 1000).toISOString(),
            });

          results.activated++;
          console.log(`✅ Activated premium for user ${profile.id}`);
        } else if (profile.is_premium) {
          console.log(`No active subscription found for user ${profile.id}, deactivating premium`);

          const { error: updateError } = await supabase
            .from('astra_profiles')
            .update({
              is_premium: false,
              subscription_id: null,
              current_period_end: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);

          if (updateError) {
            throw new Error(`Failed to update profile: ${updateError.message}`);
          }

          results.deactivated++;
          console.log(`❌ Deactivated premium for user ${profile.id}`);
        } else {
          console.log(`No changes needed for user ${profile.id}`);
        }

        results.processed++;
      } catch (error: any) {
        console.error(`Error processing user ${profile.id}:`, error.message);
        results.errors.push(`User ${profile.id}: ${error.message}`);
      }
    }

    console.log('Sync completed:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription sync completed',
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});