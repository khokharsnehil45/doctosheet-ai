import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { planId, promoCode, userEmail } = await req.json();

    const plans: Record<string, { name: string; amount: number; interval: string }> = {
      monthly_pro: {
        name: 'DocToSheet Pro (Monthly)',
        amount: 1900, // $19.00
        interval: 'month',
      },
      lifetime_pro: {
        name: 'DocToSheet Pro (Lifetime Pass)',
        amount: 9900, // $99.00
        interval: 'one-time',
      },
    };

    const selectedPlan = plans[planId] || plans['monthly_pro'];
    let discountPercent = 0;

    if (promoCode) {
      const cleanPromo = String(promoCode).trim().toUpperCase();
      if (cleanPromo === 'LAUNCH50' || cleanPromo === 'HALFOFF') {
        discountPercent = 50;
      } else if (cleanPromo === 'EARLYBIRD' || cleanPromo === 'FOUNDER') {
        discountPercent = 25;
      }
    }

    const finalAmount = Math.round(selectedPlan.amount * (1 - discountPercent / 100));

    // Simulated Stripe Checkout Session Object
    const mockSession = {
      id: `cs_test_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`,
      object: 'checkout.session',
      status: 'open',
      payment_status: 'unpaid',
      customer_email: userEmail || 'developer@example.com',
      plan_name: selectedPlan.name,
      amount_total: finalAmount,
      currency: 'usd',
      discount_applied: discountPercent > 0 ? `${discountPercent}% OFF` : null,
      success_url: '/?payment=success&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: '/?payment=cancelled',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    };

    return NextResponse.json({
      success: true,
      session: mockSession,
      checkoutUrl: `/?session_id=${mockSession.id}&plan=${encodeURIComponent(selectedPlan.name)}&status=ready`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to initiate checkout.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
