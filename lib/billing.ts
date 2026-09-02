import Stripe from 'stripe';
import crypto from 'crypto';

export interface CheckoutOptions {
  planId: 'monthly_pro' | 'lifetime_pro';
  userId?: string;
  userEmail?: string;
  promoCode?: string;
  returnUrl?: string;
}

export interface CheckoutSessionResult {
  provider: 'stripe' | 'lemonsqueezy' | 'sandbox';
  checkoutUrl?: string;
  sessionId?: string;
  discountApplied?: number;
  finalPriceUsd: number;
  message?: string;
}

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const LEMONSQUEEZY_KEY = process.env.LEMONSQUEEZY_API_KEY;
const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;

export const stripe = STRIPE_KEY
  ? new Stripe(STRIPE_KEY, {
      apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
    })
  : null;

export function calculatePlanPrice(
  planId: 'monthly_pro' | 'lifetime_pro',
  promoCode?: string
): { basePrice: number; discountPercent: number; finalPrice: number } {
  const basePrice = planId === 'monthly_pro' ? 19 : 99;
  let discountPercent = 0;

  if (promoCode) {
    const code = promoCode.trim().toUpperCase();
    if (code === 'LAUNCH50' || code === 'HALFOFF') {
      discountPercent = 50;
    } else if (code === 'EARLYBIRD' || code === 'FOUNDER') {
      discountPercent = 25;
    }
  }

  const finalPrice = Math.round(basePrice * (1 - discountPercent / 100));
  return { basePrice, discountPercent, finalPrice };
}

export async function createCheckoutSession(
  options: CheckoutOptions
): Promise<CheckoutSessionResult> {
  const { planId, userId, userEmail, promoCode, returnUrl } = options;
  const { discountPercent, finalPrice } = calculatePlanPrice(planId, promoCode);

  const planName =
    planId === 'monthly_pro'
      ? 'DocToSheet AI - Pro Unlimited ($19/mo)'
      : 'DocToSheet AI - Pro Lifetime Pass ($99 one-time)';

  // 1. Stripe Live/Test Mode Checkout
  if (stripe && STRIPE_KEY) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: planId === 'monthly_pro' ? 'subscription' : 'payment',
        customer_email: userEmail,
        client_reference_id: userId,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: planName,
                description:
                  'Unlimited document-to-sheet conversions, Gemini Flash Vision OCR, direct Excel & CSV exports.',
              },
              unit_amount: finalPrice * 100, // in cents
              ...(planId === 'monthly_pro'
                ? { recurring: { interval: 'month' } }
                : {}),
            },
            quantity: 1,
          },
        ],
        success_url: `${returnUrl || 'http://localhost:3000'}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${returnUrl || 'http://localhost:3000'}/?checkout=cancel`,
        metadata: {
          userId: userId || 'anonymous',
          planId,
          promoCode: promoCode || 'NONE',
        },
      });

      return {
        provider: 'stripe',
        checkoutUrl: session.url || undefined,
        sessionId: session.id,
        discountApplied: discountPercent,
        finalPriceUsd: finalPrice,
      };
    } catch (err: unknown) {
      console.warn('[Billing] Stripe checkout session error:', err);
    }
  }

  // 2. LemonSqueezy Live Checkout
  if (LEMONSQUEEZY_KEY && LEMONSQUEEZY_STORE_ID) {
    try {
      const variantId =
        planId === 'monthly_pro'
          ? process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID
          : process.env.LEMONSQUEEZY_LIFETIME_VARIANT_ID;

      if (variantId) {
        const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${LEMONSQUEEZY_KEY}`,
            Accept: 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json',
          },
          body: JSON.stringify({
            data: {
              type: 'checkouts',
              attributes: {
                checkout_data: {
                  email: userEmail,
                  custom: {
                    user_id: userId,
                  },
                },
              },
              relationships: {
                store: {
                  data: {
                    type: 'stores',
                    id: LEMONSQUEEZY_STORE_ID,
                  },
                },
                variant: {
                  data: {
                    type: 'variants',
                    id: variantId,
                  },
                },
              },
            },
          }),
        });

        const data = await response.json();
        if (data?.data?.attributes?.url) {
          return {
            provider: 'lemonsqueezy',
            checkoutUrl: data.data.attributes.url,
            discountApplied: discountPercent,
            finalPriceUsd: finalPrice,
          };
        }
      }
    } catch (err) {
      console.warn('[Billing] LemonSqueezy checkout session error:', err);
    }
  }

  // 3. Sandbox / Developer Fallback Simulation
  return {
    provider: 'sandbox',
    sessionId: `sandbox_session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    discountApplied: discountPercent,
    finalPriceUsd: finalPrice,
    message: 'Processed via Developer Sandbox (Zero charges applied).',
  };
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(payload).digest('hex'), 'utf8');
    const checksum = Buffer.from(signature, 'utf8');
    return crypto.timingSafeEqual(digest, checksum);
  } catch {
    return false;
  }
}
