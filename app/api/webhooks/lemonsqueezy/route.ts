import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/billing';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { message: 'LemonSqueezy webhook secret not configured, skipped verification' },
      { status: 200 }
    );
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-signature');

    if (!signature || !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;
    const customData = payload.meta?.custom_data;
    const userId = customData?.user_id;

    if (
      (eventName === 'order_created' || eventName === 'subscription_created') &&
      userId &&
      isSupabaseConfigured &&
      supabaseAdmin
    ) {
      const userEmail = payload.data?.attributes?.user_email;
      const proToken = `pro_token_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

      await supabaseAdmin.from('users').upsert({
        id: userId,
        email: userEmail || `${userId}@user.local`,
        is_pro: true,
        pro_plan: 'Pro Unlimited (LemonSqueezy)',
        pro_token: proToken,
      });

      console.log(`[LemonSqueezy Webhook] Successfully upgraded user ${userId} to PRO!`);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook processing error';
    console.error('[LemonSqueezy Webhook Error]:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
