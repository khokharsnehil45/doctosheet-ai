import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/billing';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { message: 'Stripe webhook secret not configured, skipped verification' },
      { status: 200 }
    );
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id || session.metadata?.userId;
      const planId = session.metadata?.planId || 'monthly_pro';
      const proToken = `pro_token_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

      if (userId && isSupabaseConfigured && supabaseAdmin) {
        await supabaseAdmin.from('users').upsert({
          id: userId,
          email: session.customer_email || `${userId}@user.local`,
          is_pro: true,
          pro_plan: planId === 'monthly_pro' ? 'Pro Unlimited ($19/mo)' : 'Pro Lifetime Pass ($99)',
          pro_token: proToken,
        });
        console.log(`[Stripe Webhook] Successfully upgraded user ${userId} to PRO!`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook error';
    console.error('[Stripe Webhook Error]:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
