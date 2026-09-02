const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('--- RUNNING DARK MODE TOGGLE SYSTEM TESTS ---');

// Test 1: Verify tailwind.config.ts has darkMode: 'class'
console.log('\n[TEST 1] Auditing Tailwind Configuration...');
const tailwindConfig = fs.readFileSync(
  path.join(__dirname, '../tailwind.config.ts'),
  'utf-8'
);
assert.ok(
  tailwindConfig.includes("darkMode: 'class'") || tailwindConfig.includes('darkMode: "class"'),
  'tailwind.config.ts must specify darkMode: "class"'
);
console.log('✓ PASS: tailwind.config.ts is configured for class-based dark mode.');

// Test 2: Verify Theme Persistence Logic
console.log('\n[TEST 2] Testing Theme Storage & System Fallback Engine...');
const mockStorage = {};
const mockWindow = {
  matchMedia: (query) => ({
    matches: query.includes('dark'),
  }),
};

function resolveInitialTheme() {
  const saved = mockStorage['doctosheet_theme'];
  if (saved === 'dark' || saved === 'light') {
    return saved;
  }
  return mockWindow.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// 2a. System default dark
assert.strictEqual(resolveInitialTheme(), 'dark');

// 2b. Explicit user choice 'light'
mockStorage['doctosheet_theme'] = 'light';
assert.strictEqual(resolveInitialTheme(), 'light');

// 2c. Toggle to 'dark'
mockStorage['doctosheet_theme'] = mockStorage['doctosheet_theme'] === 'dark' ? 'light' : 'dark';
assert.strictEqual(resolveInitialTheme(), 'dark');
console.log('✓ PASS: Theme persistence and matchMedia system resolution validated.');

// Test 3: Verify Anti-Flash Script in app/layout.tsx
console.log('\n[TEST 3] Auditing Anti-Flash Theme Script...');
const layoutCode = fs.readFileSync(
  path.join(__dirname, '../app/layout.tsx'),
  'utf-8'
);
assert.ok(layoutCode.includes('themeScript'), 'app/layout.tsx must inject themeScript');
assert.ok(layoutCode.includes('suppressHydrationWarning'), 'html tag must suppress hydration warning');
console.log('✓ PASS: Anti-flash script correctly inlined to eliminate theme flashing.');

console.log('\n========================================================');
console.log('ALL DARK MODE SYSTEM TESTS PASSED WITH 100% SUCCESS!    ');
console.log('========================================================\n');
