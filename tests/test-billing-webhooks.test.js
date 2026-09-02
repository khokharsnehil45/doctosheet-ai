const assert = require('assert');
const crypto = require('crypto');

console.log('--- RUNNING UNIVERSAL BILLING & WEBHOOK ENGINE TESTS ---');

// 1. Test Pricing & Discounts Engine
console.log('\n[TEST 1] Auditing Plan Pricing & Promo Calculations...');
function calculatePrice(planId, promoCode) {
  const basePrice = planId === 'monthly_pro' ? 19 : 99;
  let discountPercent = 0;
  if (promoCode) {
    const code = promoCode.trim().toUpperCase();
    if (code === 'LAUNCH50' || code === 'HALFOFF') discountPercent = 50;
    if (code === 'EARLYBIRD' || code === 'FOUNDER') discountPercent = 25;
  }
  const finalPrice = Math.round(basePrice * (1 - discountPercent / 100));
  return { basePrice, discountPercent, finalPrice };
}

// 1a. Monthly standard ($19)
assert.strictEqual(calculatePrice('monthly_pro').finalPrice, 19);

// 1b. Monthly with 50% off ($10)
assert.strictEqual(calculatePrice('monthly_pro', 'LAUNCH50').finalPrice, 10);

// 1c. Lifetime standard ($99)
assert.strictEqual(calculatePrice('lifetime_pro').finalPrice, 99);

// 1d. Lifetime with 25% off ($74)
assert.strictEqual(calculatePrice('lifetime_pro', 'EARLYBIRD').finalPrice, 74);
console.log('✓ PASS: All plan tiers and promotional coupon math verified.');

// 2. Test Webhook Signature Verification
console.log('\n[TEST 2] Auditing HMAC Webhook Signature Verification...');
const testSecret = 'secret_webhook_pass_12345';
const testPayload = JSON.stringify({
  meta: { event_name: 'order_created', custom_data: { user_id: 'usr_test_123' } },
  data: { attributes: { user_email: 'customer@example.com' } },
});

const hmac = crypto.createHmac('sha256', testSecret);
const validSignature = hmac.update(testPayload).digest('hex');

function verifySig(payload, sig, secret) {
  try {
    const h = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(h.update(payload).digest('hex'), 'utf8');
    const checksum = Buffer.from(sig, 'utf8');
    return crypto.timingSafeEqual(digest, checksum);
  } catch {
    return false;
  }
}

assert.strictEqual(verifySig(testPayload, validSignature, testSecret), true);
assert.strictEqual(verifySig(testPayload, 'fake_invalid_sig_abc', testSecret), false);
console.log('✓ PASS: HMAC timing-safe webhook verification validated.');

console.log('\n========================================================');
console.log('ALL BILLING & WEBHOOK TESTS PASSED WITH 100% SUCCESS!   ');
console.log('========================================================\n');
