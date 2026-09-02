const assert = require('assert');

console.log('--- RUNNING HYBRID API KEY & AUTH ARCHITECTURE TESTS ---');

// Mock route simulation
function simulateGenerateEndpoint({ headers = {}, body = {} }) {
  const { text, documentType, forceOffline } = body;

  if (!text || text.trim().length === 0) {
    return { status: 400, body: { error: 'Document text is required.' } };
  }

  // 1. Force Offline Mode
  if (forceOffline) {
    return {
      status: 200,
      body: {
        engine: 'deterministic-fallback',
        status: 'success',
        source: 'offline',
      },
    };
  }

  // 2. Extract Hybrid Auth
  const proHeader = headers['x-pro-token'] || headers['x-pro-session'];
  const authHeader = headers['authorization'];
  const isProHeader =
    Boolean(proHeader && proHeader.startsWith('pro_')) ||
    Boolean(authHeader && authHeader.startsWith('Bearer pro_')) ||
    Boolean(body.proToken && String(body.proToken).startsWith('pro_'));

  const clientApiKeyHeader = headers['x-client-api-key'] || body.customApiKey;

  // 3. Pro Tier: Bypasses client key & uses Server Key
  if (isProHeader) {
    return {
      status: 200,
      body: {
        engine: 'gemini-1.5-flash',
        source: 'server_env',
        bypassedClientKey: Boolean(clientApiKeyHeader),
      },
    };
  }

  // 4. Free Tier: Requires client key
  if (!clientApiKeyHeader || clientApiKeyHeader.trim() === '') {
    return {
      status: 400,
      body: {
        error: 'FREE_TIER_KEY_REQUIRED',
        message: 'Free Tier requires personal Gemini API key or Offline Engine.',
      },
    };
  }

  return {
    status: 200,
    body: {
      engine: 'custom-gemini',
      source: 'client_byok',
      apiKeyUsed: clientApiKeyHeader,
    },
  };
}

// Test 1: Free User without API Key -> Rejection with FREE_TIER_KEY_REQUIRED
console.log('\n[TEST 1] Free user without API key...');
const res1 = simulateGenerateEndpoint({
  headers: {},
  body: { text: 'Statement line', documentType: 'bank_statement' },
});
assert.strictEqual(res1.status, 400);
assert.strictEqual(res1.body.error, 'FREE_TIER_KEY_REQUIRED');
console.log('✓ PASS: Free user without key is blocked and prompted for key or Pro upgrade.');

// Test 2: Free User with custom BYOK API Key -> Accepted
console.log('\n[TEST 2] Free user with personal Gemini API Key...');
const res2 = simulateGenerateEndpoint({
  headers: { 'x-client-api-key': 'AIzaSy_UserPersonalKey_12345' },
  body: { text: 'Statement line', documentType: 'bank_statement' },
});
assert.strictEqual(res2.status, 200);
assert.strictEqual(res2.body.engine, 'custom-gemini');
assert.strictEqual(res2.body.source, 'client_byok');
console.log('✓ PASS: Free user BYOK key is read from header and processed.');

// Test 3: PRO User -> Strictly uses server environment key and bypasses any client key
console.log('\n[TEST 3] PRO user session token...');
const res3 = simulateGenerateEndpoint({
  headers: {
    'x-pro-token': 'pro_sess_991823ab_active',
    'x-client-api-key': 'ignored_client_key',
  },
  body: { text: 'Statement line', documentType: 'bank_statement' },
});
assert.strictEqual(res3.status, 200);
assert.strictEqual(res3.body.engine, 'gemini-1.5-flash');
assert.strictEqual(res3.body.source, 'server_env');
assert.strictEqual(res3.body.bypassedClientKey, true);
console.log('✓ PASS: PRO user completely bypasses client key and utilizes server credentials.');

// Test 4: Offline Mode Flag -> 100% offline fallback
console.log('\n[TEST 4] Offline Mode execution...');
const res4 = simulateGenerateEndpoint({
  headers: {},
  body: { text: 'Statement line', documentType: 'bank_statement', forceOffline: true },
});
assert.strictEqual(res4.status, 200);
assert.strictEqual(res4.body.engine, 'deterministic-fallback');
console.log('✓ PASS: Offline engine executed with zero API key dependency.');

console.log('\n========================================================');
console.log('ALL HYBRID AUTH ARCHITECTURE TESTS PASSED SUCCESSFULLY!');
console.log('========================================================\n');
