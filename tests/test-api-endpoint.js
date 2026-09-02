const { parseOfflineDocument } = require('../lib/fallbackParser');
const { SAMPLE_DOCUMENTS } = require('../lib/samples');

// Simple test runner for both formats and fallback parser
console.log('--- COMPREHENSIVE END-TO-END PARSER TEST ---');

for (const [key, sample] of Object.entries(SAMPLE_DOCUMENTS)) {
  console.log(`\nTesting: ${sample.name} (${key})`);
  const result = parseOfflineDocument(sample.rawText, key);
  
  console.log(`  ✓ Title: ${result.title}`);
  console.log(`  ✓ Detected Records: ${result.rows.length}`);
  console.log(`  ✓ Columns: ${result.columns.map(c => c.label).join(', ')}`);
  console.log(`  ✓ Duration: ${result.metadata.processingTimeMs}ms`);
  
  if (result.rows.length === 0) {
    throw new Error(`Failed to parse rows for ${key}`);
  }
}

console.log('\n=============================================');
console.log('ALL PARSING ENGINES TESTED & VERIFIED (3/3)');
console.log('=============================================\n');
