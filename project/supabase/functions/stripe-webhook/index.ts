import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import Stripe from 'npm:stripe@14.10.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, stripe-signature',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      await supabase.from('stripe_webhook_logs').insert({
        event_id: 'config_error',
        event_type: 'config_error',
        payload: {},
        processing_result: 'STRIPE_SECRET_KEY not configured'
      });
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      await supabase.from('stripe_webhook_logs').insert({
        event_id: 'no_signature',
        event_type: 'no_signature',
        payload: {},
        processing_result: 'No signature header'
      });
      return new Response(
        JSON.stringify({ error: 'No signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret!);
      console.log('[WEBHOOK] Received event:', event.type, 'ID:', event.id);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      await supabase.from('stripe_webhook_logs').insert({
        event_id: 'signature_error',
        event_type: 'signature_error',
        payload: { error: err.message },
        processing_result: `Signature verification failed: ${err.message}`
      });
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const type = session.metadata?.type;

        console.log('[WEBHOOK] checkout.session.completed:', {
          session_id: session.id,
          user_id: userId,
          type,
          customer: session.customer,
          subscription: session.subscription,
          metadata: session.metadata
        });

        if (!userId) {
          const errorMsg = 'No user_id in checkout.session.completed metadata';
          console.error('[WEBHOOK ERROR]', errorMsg);
          await supabase.from('stripe_webhook_logs').insert({
            event_id: event.id,
            event_type: event.type,
            payload: event.data.object,
            processing_result: `ERROR: ${errorMsg}`,
            user_id: null
          });
          break;
        }

        console.log('[WEBHOOK] Processing checkout for user:', userId);

        if (type === 'stars') {
          const starsAmount = parseInt(session.metadata?.stars || '0');

          if (starsAmount > 0) {
            const { data: currentBalance } = await supabase
              .from('stars_balance')
              .select('balance')
              .eq('user_id', userId)
              .maybeSingle();

            if (currentBalance) {
              await supabase
                .from('stars_balance')
                .update({
                  balance: currentBalance.balance + starsAmount,
                  updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);
            } else {
              await supabase
                .from('stars_balance')
                .insert({
                  user_id: userId,
                  balance: starsAmount
                });
            }

            await supabase.from('stars_transactions').insert({
              user_id: userId,
              type: 'purchase',
              amount: starsAmount,
              price_paid: session.amount_total ? session.amount_total / 100 : 0,
              metadata: { session_id: session.id }
            });

            console.log(`[WEBHOOK SUCCESS] ${starsAmount} stars added for user ${userId}`);
            await supabase.from('stripe_webhook_logs').insert({
              event_id: event.id,
              event_type: event.type,
              payload: event.data.object,
              processing_result: `SUCCESS: ${starsAmount} stars added`,
              user_id: userId
            });
          }
        } else {
          const subscriptionId = session.subscription as string;
          const tier = session.metadata?.tier || 'premium';
          let subscription: Stripe.Subscription | null = null;

          if (subscriptionId) {
            try {
              subscription = await stripe.subscriptions.retrieve(subscriptionId);
              console.log('[WEBHOOK] Subscription retrieved:', subscription.id, 'status:', subscription.status);
            } catch (err: any) {
              console.error('[WEBHOOK] Failed to retrieve subscription:', err.message);
            }
          }

          const updateData: any = {
            is_premium: true,
            premium_tier: tier,
            stripe_customer_id: session.customer as string,
            subscription_id: subscriptionId,
            updated_at: new Date().toISOString(),
          };

          if (subscription) {
            updateData.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();
          }

          console.log('[WEBHOOK] Updating profile with data:', updateData);

          const { error: updateError } = await supabase
            .from('astra_profiles')
            .update(updateData)
            .eq('id', userId);

          if (updateError) {
            console.error('[WEBHOOK ERROR] Failed to update profile:', updateError);
            await supabase.from('stripe_webhook_logs').insert({
              event_id: event.id,
              event_type: event.type,
              payload: event.data.object,
              processing_result: `ERROR updating profile: ${updateError.message}`,
              user_id: userId
            });
          } else {
            console.log('[WEBHOOK SUCCESS] Premium activated for user:', userId);
            await supabase.from('stripe_webhook_logs').insert({
              event_id: event.id,
              event_type: event.type,
              payload: event.data.object,
              processing_result: 'SUCCESS: Premium activated',
              user_id: userId
            });
          }

          if (subscription) {
            await supabase
              .from('astra_subscriptions')
              .upsert({
                user_id: userId,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subscriptionId,
                status: subscription.status === 'active' ? 'active' : 'canceled',
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              });
          }
        }

        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;

        const { data: profile } = await supabase
          .from('astra_profiles')
          .select('id')
          .eq('stripe_customer_id', subscription.customer as string)
          .maybeSingle();

        if (profile) {
          const isPremium = subscription.status === 'active' ||
                           (subscription.status === 'canceled' && subscription.cancel_at_period_end &&
                            new Date(subscription.current_period_end * 1000) > new Date());

          await supabase
            .from('astra_profiles')
            .update({
              is_premium: isPremium,
              subscription_id: subscription.id,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);

          console.log(`Subscription updated for user ${profile.id}: status=${subscription.status}, cancel_at_period_end=${subscription.cancel_at_period_end}, is_premium=${isPremium}`);
        }

        await supabase
          .from('astra_subscriptions')
          .upsert({
            user_id: profile?.id,
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            status: subscription.status === 'active' ? 'active' : 'canceled',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        const { data: profile } = await supabase
          .from('astra_profiles')
          .select('id')
          .eq('stripe_customer_id', subscription.customer as string)
          .maybeSingle();

        if (profile) {
          await supabase
            .from('astra_profiles')
            .update({
              is_premium: false,
              subscription_id: null,
              current_period_end: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);

          await supabase
            .from('astra_subscriptions')
            .update({
              status: 'canceled',
            })
            .eq('stripe_subscription_id', subscription.id);
        }

        break;
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});