import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/billing';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, promoCode, userEmail, userId } = body;

    const origin = req.headers.get('origin') || req.headers.get('referer') || 'http://localhost:3000';

    const result = await createCheckoutSession({
      planId: planId === 'lifetime_pro' ? 'lifetime_pro' : 'monthly_pro',
      userId,
      userEmail,
      promoCode,
      returnUrl: origin,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
