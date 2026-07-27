/**
 * Fix prices in stocks.json
 *
 * Removes the extra 3 zeros from price values that are >= 100,000
 * and recalculates TOTAL_STOCK_VALUE = COST_PRICE * QUANTITY_LEFT
 */

import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stocksPath = path.resolve(__dirname, '../server/db/stocks.json');

const raw = readFileSync(stocksPath, 'utf-8');
const items = JSON.parse(raw);

let fixedCount = 0;

items.forEach((item) => {
  let changed = false;

  // Fix COST_PRICE >= 100,000 (has extra 3 zeros)
  if (item.COST_PRICE >= 100000) {
    item.COST_PRICE = Math.round(item.COST_PRICE / 1000);
    changed = true;
  }

  // Fix SELLING_PRICE >= 100,000 (has extra 3 zeros)
  if (item.SELLING_PRICE >= 100000) {
    item.SELLING_PRICE = Math.round(item.SELLING_PRICE / 1000);
    changed = true;
  }

  // Fix TOTAL_STOCK_VALUE >= 100,000 (has extra 3 zeros)
  if (item.TOTAL_STOCK_VALUE >= 100000) {
    item.TOTAL_STOCK_VALUE = Math.round(item.TOTAL_STOCK_VALUE / 1000);
    changed = true;
  }

  // Recalculate TOTAL_STOCK_VALUE to be consistent
  const properTotal = item.COST_PRICE * item.QUANTITY_LEFT;
  if (Math.abs(properTotal - item.TOTAL_STOCK_VALUE) > 1) {
    item.TOTAL_STOCK_VALUE = properTotal;
    changed = true;
  }

  if (changed) fixedCount++;
});

writeFileSync(stocksPath, JSON.stringify(items, null, 2), 'utf-8');

console.log(`\n✅ Fixed ${fixedCount} items in stocks.json\n`);

// Verification
console.log('--- Sample Verification (first 20 items) ---');
items.slice(0, 20).forEach(i => {
  const name = (i.PRODUCT_NAME || '').slice(0, 45).padEnd(45);
  console.log(`#${String(i.NO).padEnd(4)} ${name} COST:₦${String(i.COST_PRICE).padEnd(8)} SELL:₦${String(i.SELLING_PRICE).padEnd(8)} QTY:${String(i.QUANTITY_LEFT).padEnd(5)} TOTAL:₦${i.TOTAL_STOCK_VALUE}`);
});

console.log('\n--- Quick sanity check (small items should be unchanged) ---');
const smallItems = items.filter(i => i.SELLING_PRICE <= 10000);
console.log(`Items with selling price <= ₦10,000: ${smallItems.length}`);
smallItems.slice(0, 5).forEach(i => {
  console.log(`  #${i.NO} ${i.PRODUCT_NAME} → ₦${i.SELLING_PRICE}`);
});

