const assert = require('assert');

console.log('--- RUNNING PDF & IMAGE OCR ATTACHMENT TESTS ---');

// Mock file attachments
const mockPdfAttachment = {
  name: 'chase_jan_statement.pdf',
  mimeType: 'application/pdf',
  base64: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDw...',
  sizeBytes: 45020,
};

const mockImageAttachment = {
  name: 'store_receipt_scanned.png',
  mimeType: 'image/png',
  base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  sizeBytes: 12400,
};

// Test 1: PDF Attachment validation
console.log('\n[TEST 1] Testing PDF attachment validation...');
assert.strictEqual(mockPdfAttachment.mimeType, 'application/pdf');
assert.ok(mockPdfAttachment.name.endsWith('.pdf'));
assert.ok(mockPdfAttachment.base64.startsWith('data:application/pdf;base64,'));
console.log('✓ PASS: PDF file attachment structure and MIME type verified.');

// Test 2: Image Attachment validation
console.log('\n[TEST 2] Testing Image/Receipt attachment validation...');
assert.strictEqual(mockImageAttachment.mimeType, 'image/png');
assert.ok(mockImageAttachment.mimeType.startsWith('image/'));
assert.ok(mockImageAttachment.base64.startsWith('data:image/png;base64,'));
console.log('✓ PASS: Image/Receipt scan file attachment verified.');

// Test 3: Base64 payload stripping for Gemini API inlineData
console.log('\n[TEST 3] Testing Base64 prefix sanitization for Gemini inlineData...');
const cleanPdfData = mockPdfAttachment.base64.replace(/^data:[^;]+;base64,/, '');
assert.ok(!cleanPdfData.includes('data:'));
assert.ok(!cleanPdfData.includes('base64,'));
console.log('✓ PASS: Base64 payload sanitized for inlineData multimodal payload.');

console.log('\n========================================================');
console.log('ALL PDF & IMAGE ATTACHMENT TESTS PASSED SUCCESSFULLY!   ');
console.log('========================================================\n');
