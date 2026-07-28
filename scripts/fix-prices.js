/**
 * Fix Product Prices Script
 * 
 * The src/data/products.js file has all prices multiplied by 1000 (bug in generation).
 * This script reads the file and divides all price and oldPrice values by 1000,
 * restoring them to their actual Naira values from stocks.json.
 * 
 * Usage: node scripts/fix-prices.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const productsPath = resolve(__dirname, '../src/data/products.js');

console.log('🔧 Fixing product prices...\n');

// Read the file
let content = readFileSync(productsPath, 'utf-8');
console.log(`📄 Read ${content.length} characters`);

// Fix price values - divide by 1000
// Pattern: "price": <number> or "oldPrice": <number> or "oldPrice": null
let fixCount = 0;

content = content.replace(/("price":\s*)(\d+)/g, (match, prefix, numStr) => {
  const num = parseInt(numStr, 10);
  if (num >= 1000) {
    const fixed = Math.round(num / 1000);
    fixCount++;
    return `${prefix}${fixed}`;
  }
  return match;
});

content = content.replace(/("oldPrice":\s*)(\d+)/g, (match, prefix, numStr) => {
  const num = parseInt(numStr, 10);
  if (num >= 1000) {
    const fixed = Math.round(num / 1000);
    fixCount++;
    return `${prefix}${fixed}`;
  }
  return match;
});

// Write the fixed content
writeFileSync(productsPath, content, 'utf-8');
console.log(`✅ Fixed ${fixCount} price values (divided by 1000)`);
console.log('📝 File updated successfully!\n');

// Verify a few prices
const firstProductMatch = content.match(/"price":\s*(\d+)/);
if (firstProductMatch) {
  console.log(`🔍 First product price is now: ₦${parseInt(firstProductMatch[1]).toLocaleString()}`);
}

// Count total products
const productMatches = content.match(/"id":/g);
console.log(`📦 Total products: ${productMatches ? productMatches.length : 0}`);
console.log('\n✅ Done!');

