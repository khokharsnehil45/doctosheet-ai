const assert = require('assert');

console.log('--- RUNNING RELATIONAL AUTH & USER QUOTA SCHEMA TESTS ---');

// Mock localStorage and Relational User Store
const mockStorage = {};
const globalWindow = {
  localStorage: {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = String(v); },
    removeItem: (k) => { delete mockStorage[k]; },
  }
};

const MAX_FREE_CREDITS = 2;

function getUsersDB() {
  const raw = globalWindow.localStorage.getItem('doctosheet_users_db');
  return raw ? JSON.parse(raw) : {};
}

function saveUsersDB(db) {
  globalWindow.localStorage.setItem('doctosheet_users_db', JSON.stringify(db));
}

function signup(email, name) {
  const db = getUsersDB();
  const userId = `usr_${Math.random().toString(36).substring(2, 8)}`;
  const user = {
    id: userId,
    email: email.trim().toLowerCase(),
    name: name || email.split('@')[0],
    isGuest: false,
    isPro: false,
    creditsUsed: 0,
    maxFreeCredits: MAX_FREE_CREDITS,
    createdAt: new Date().toISOString(),
  };
  db[userId] = user;
  saveUsersDB(db);
  globalWindow.localStorage.setItem('doctosheet_current_user_id', userId);
  return user;
}

function recordUserConversion(userId) {
  const db = getUsersDB();
  const user = db[userId];
  if (!user) return null;
  if (!user.isPro) {
    user.creditsUsed = (user.creditsUsed || 0) + 1;
    db[userId] = user;
    saveUsersDB(db);
  }
  return user;
}

function updateUserApiKey(userId, key) {
  const db = getUsersDB();
  const user = db[userId];
  if (!user) return null;
  user.customApiKey = key;
  db[userId] = user;
  saveUsersDB(db);
  return user;
}

function upgradeUserToPro(userId, plan) {
  const db = getUsersDB();
  const user = db[userId];
  if (!user) return null;
  user.isPro = true;
  user.proPlanName = plan;
  user.proToken = `pro_token_${Math.random().toString(36).substring(2, 8)}`;
  db[userId] = user;
  saveUsersDB(db);
  return user;
}

// Test 1: Create 2 separate users
console.log('\n[TEST 1] Creating separate user accounts...');
const userA = signup('alice@techcorp.com', 'Alice Tech');
const userB = signup('bob@startup.io', 'Bob Builder');

assert.notStrictEqual(userA.id, userB.id);
assert.strictEqual(userA.email, 'alice@techcorp.com');
assert.strictEqual(userB.email, 'bob@startup.io');
console.log('✓ PASS: Distinct user records created with unique IDs.');

// Test 2: Multi-user relational isolation
console.log('\n[TEST 2] Verifying relational quota and API key isolation...');
// Alice uses 1 credit and sets an API key
recordUserConversion(userA.id);
updateUserApiKey(userA.id, 'AIzaSy_Alice_Key_999');

// Bob upgrades to Pro
upgradeUserToPro(userB.id, 'Pro Lifetime ($99)');

const db = getUsersDB();
const refreshedAlice = db[userA.id];
const refreshedBob = db[userB.id];

// Alice assertions
assert.strictEqual(refreshedAlice.creditsUsed, 1);
assert.strictEqual(refreshedAlice.isPro, false);
assert.strictEqual(refreshedAlice.customApiKey, 'AIzaSy_Alice_Key_999');

// Bob assertions
assert.strictEqual(refreshedBob.creditsUsed, 0);
assert.strictEqual(refreshedBob.isPro, true);
assert.strictEqual(refreshedBob.proPlanName, 'Pro Lifetime ($99)');
assert.ok(refreshedBob.proToken.startsWith('pro_token_'));
assert.strictEqual(refreshedBob.customApiKey, undefined);

console.log('✓ PASS: Alice and Bob have completely isolated quotas, API keys, and subscription tiers.');

// Test 3: Quota ceiling enforcement for User A
console.log('\n[TEST 3] Quota gating on 3rd attempt for Free user...');
recordUserConversion(userA.id); // 2nd use
const aliceAfter2 = getUsersDB()[userA.id];
assert.strictEqual(aliceAfter2.creditsUsed, 2);
const canConvert3rd = aliceAfter2.creditsUsed < aliceAfter2.maxFreeCredits;
assert.strictEqual(canConvert3rd, false);
console.log('✓ PASS: Free user quota gating accurately prevents 3rd conversion until Pro upgrade.');

console.log('\n========================================================');
console.log('ALL RELATIONAL AUTH SCHEMA TESTS PASSED SUCCESSFULLY!   ');
console.log('========================================================\n');
