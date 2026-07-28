/**
 * Verify Product Prices
 * Checks that prices are in the correct Naira range
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const productsPath = resolve(__dirname, '../src/data/products.js');

const content = readFileSync(productsPath, 'utf-8');

// Extract all price values
const priceMatches = [...content.matchAll(/"price":\s*(\d+)/g)];
const oldPriceMatches = [...content.matchAll(/"oldPrice":\s*(\d+)/g)];

const prices = priceMatches.map(m => parseInt(m[1]));
const oldPrices = oldPriceMatches.map(m => parseInt(m[1]));

console.log('=== PRICE VERIFICATION ===\n');
console.log(`Total products: ${prices.length}`);
console.log(`Products with oldPrice: ${oldPrices.length}\n`);

// Check for any remaining inflated prices (> 1,000,000)
const inflated = prices.filter(p => p > 1000000);
if (inflated.length > 0) {
  console.log(`⚠️  Found ${inflated.length} prices still > ₦1,000,000:`);
  inflated.slice(0, 10).forEach(p => console.log(`   ₦${p.toLocaleString()}`));
} else {
  console.log('✅ No prices above ₦1,000,000');
}

// Check for any prices that are 0
const zeroPrices = prices.filter(p => p === 0);
if (zeroPrices.length > 0) {
  console.log(`⚠️  Found ${zeroPrices.length} zero prices`);
}

// Price range
const minPrice = Math.min(...prices);
const maxPrice = Math.max(...prices);
console.log(`\n📊 Price range: ₦${minPrice.toLocaleString()} - ₦${maxPrice.toLocaleString()}`);

// Sample some specific products
const samples = [
  { name: 'LONART TABLETS', expected: 4000 },
  { name: 'BRIM WATER 50CL', expected: 300 },
  { name: 'POSTINOR 2', expected: 4000 },
  { name: 'ROCEPHIN CEFTRIAXONE', expected: 18500 },
  { name: 'METOCLOPRAMIDE', expected: 1000 },
  { name: 'DELEJECT SYRINGE 2ML', expected: 200 },
  { name: 'PANADOL EXTRA', expected: 1500 },
  { name: 'GAVISCON PEPPERMINT 200ML', expected: 14000 },
];

console.log('\n🔍 Sample product verification:');
samples.forEach(({ name, expected }) => {
  const regex = new RegExp(`"${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]{0,300}"price":\\s*(\\d+)`);
  const match = content.match(regex);
  if (match) {
    const actual = parseInt(match[1]);
    const status = actual === expected ? '✅' : '⚠️';
    console.log(`  ${status} ${name}: ₦${actual.toLocaleString()} (expected: ₦${expected.toLocaleString()})`);
  } else {
    console.log(`  ❌ ${name}: not found`);
  }
});

console.log('\n✅ Verification complete!');

