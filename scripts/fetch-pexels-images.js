/**
 * Fetch Pexels Images for All Products
 * 
 * This script reads all products from src/data/products.js,
 * fetches relevant images from Pexels API for each product,
 * and saves the image URLs to a cache file.
 * 
 * Usage: node scripts/fetch-pexels-images.js
 * 
 * Features:
 * - Rate-limited (3 requests/second to stay under free tier limit of 200 req/hour)
 * - Resume capability (saves progress after each batch)
 * - Deduplication (same product name = same image)
 * - Fallback to category-level search if product-specific fails
 */

import { writeFileSync, existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Configuration ──────────────────────────────────────────────
const PEXELS_API_KEY = 'qA1e1b9iMLYgLRc5ohhsrFrHTnztCPzFegfKhL99mg4Mm07xis5pHZmE';
const PEXELS_BASE_URL = 'https://api.pexels.com/v1';

const CACHE_FILE = path.resolve(__dirname, '../src/lib/product-images.json');

// Rate limiting: max requests per interval
const MAX_REQUESTS_PER_BATCH = 5;
const BATCH_DELAY_MS = 1500;

// ─── Helpers ────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Load products via dynamic import of the ESM module
 */
async function loadProducts() {
  const filePath = path.resolve(__dirname, '../src/data/products.js');
  const fileUrl = new URL(`file://${filePath.replace(/\\/g, '/')}`);
  const module = await import(fileUrl.href);
  return module.products;
}

/**
 * Fetch a single image from Pexels
 */
async function fetchPexelsImage(query) {
  const url = `${PEXELS_BASE_URL}/search?query=${encodeURIComponent(query)}&per_page=1`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': PEXELS_API_KEY,
    },
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('RATE_LIMITED');
    }
    throw new Error(`Pexels API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.photos && data.photos.length > 0) {
    const photo = data.photos[0];
    return {
      url: photo.src?.medium || photo.src?.small,
      original: photo.src?.original,
      alt: photo.alt || query,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
    };
  }
  
  return null;
}

/**
 * Load existing cache
 */
function loadCache() {
  if (existsSync(CACHE_FILE)) {
    try {
      const data = JSON.parse(readFileSync(CACHE_FILE, 'utf-8'));
      return data;
    } catch (e) {
      console.warn('⚠️ Could not parse existing cache, starting fresh');
    }
  }
  return {};
}

/**
 * Save cache
 */
function saveCache(cache) {
  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
}

/**
 * Generate a cache key from product name + category
 */
function makeCacheKey(name, category) {
  const normalized = `${name} ${category}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
  return normalized;
}

/**
 * Build multiple search queries for a product, from most specific to most general
 */
function buildQueries(name, category) {
  const cleanName = name
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = cleanName.split(' ');
  const shortName = words.slice(0, 3).join(' ');
  
  const catKeywords = {
    'Injections & Infusions': 'medicine injection vial',
    'Tablets & Capsules': 'medicine tablets pills',
    'Syrups & Suspensions': 'medicine syrup bottle',
    'Creams & Ointments': 'cream tube medicine',
    'Eye, Ear & Nasal Drops': 'eye drops medicine',
    'Oral Care': 'toothbrush toothpaste',
    'Contraceptives': 'condoms contraception',
    'Vitamins & Supplements': 'vitamins supplements pills',
    'Pain Relief': 'pain relief medicine pills',
    'Antibiotics & Anti-infectives': 'antibiotics medicine pills',
    'Medical Supplies': 'medical supplies equipment',
    'Diagnostic Tests': 'medical test kit',
    'Food & Beverages': 'food drink beverage',
    'Personal Care': 'personal care products',
    'Cough & Cold Syrups': 'cough syrup medicine',
    'Antacids & Digestive Health': 'digestive health medicine',
    'Cardiovascular Health': 'heart health medicine pills',
    'Diabetes Care': 'diabetes care medicine',
    'Fertility & Sexual Health': 'fertility health',
    'Antimalarials': 'antimalaria medicine pills',
    'Feminine Care': 'feminine hygiene products',
    'Respiratory': 'respiratory inhaler medicine',
    'First Aid': 'first aid kit bandage',
    'General Health': 'pharmacy medicine health',
  };
  
  const catKw = catKeywords[category] || 'pharmacy medicine';
  
  return [
    `${cleanName} pharmaceutical`,
    `${shortName} medicine`,
    `${shortName} ${catKw}`,
    `${category} ${catKw}`,
  ];
}

// ─── Main ───────────────────────────────────────────────────────

async function main() {
  console.log('📸 Pexels Image Fetcher for Medster Pharmacy\n');
  console.log(`Cache file: ${CACHE_FILE}\n`);
  
  // Load products via dynamic import
  let products;
  try {
    products = await loadProducts();
  } catch (err) {
    console.error('❌ Failed to load products module:', err.message);
    process.exit(1);
  }
  
  console.log(`📦 Found ${products.length} products\n`);
  
  // Load existing cache
  const cache = loadCache();
  const cachedKeys = Object.keys(cache).length;
  if (cachedKeys > 0) {
    console.log(`💾 Loaded ${cachedKeys} cached image entries\n`);
  }
  
  // Statistics
  let fetched = 0;
  let skipped = 0;
  let failed = 0;
  let rateLimited = false;
  
  // Process products in batches
  for (let i = 0; i < products.length; i += MAX_REQUESTS_PER_BATCH) {
    if (rateLimited) {
      console.log('⏸️  Rate limited. Waiting 60 seconds before retry...');
      await sleep(60000);
      rateLimited = false;
    }
    
    const batch = products.slice(i, i + MAX_REQUESTS_PER_BATCH);
    const batchPromises = batch.map(async (product) => {
      const cacheKey = makeCacheKey(product.name, product.category);
      
      // Skip if already cached with a real image
      if (cache[cacheKey] && cache[cacheKey].url && !cache[cacheKey].url.includes('placeholder')) {
        skipped++;
        return;
      }
      
      const queries = buildQueries(product.name, product.category);
      
      for (const query of queries) {
        try {
          const result = await fetchPexelsImage(query);
          if (result) {
            cache[cacheKey] = {
              productId: product.id,
              productName: product.name,
              category: product.category,
              ...result,
              query,
              fetchedAt: new Date().toISOString(),
            };
            fetched++;
            return;
          }
        } catch (err) {
          if (err.message === 'RATE_LIMITED') {
            rateLimited = true;
            return;
          }
          continue;
        }
      }
      
      if (!cache[cacheKey] || !cache[cacheKey].url) {
        cache[cacheKey] = {
          productId: product.id,
          productName: product.name,
          category: product.category,
          url: null,
          failed: true,
          fetchedAt: new Date().toISOString(),
        };
        failed++;
      }
    });
    
    await Promise.all(batchPromises);
    
    saveCache(cache);
    
    const progress = Math.min(i + MAX_REQUESTS_PER_BATCH, products.length);
    const pct = ((progress / products.length) * 100).toFixed(1);
    process.stdout.write(`\r⏳ Progress: ${progress}/${products.length} (${pct}%) | Fetched: ${fetched} | Skipped: ${skipped} | Failed: ${failed}    `);
    
    if (i + MAX_REQUESTS_PER_BATCH < products.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }
  
  console.log('\n');
  console.log('✅ Done!');
  console.log(`   Total products: ${products.length}`);
  
  const withImages = Object.values(cache).filter(v => v.url && !v.url.includes('placeholder')).length;
  const withoutImages = Object.values(cache).filter(v => !v.url || v.url.includes('placeholder')).length;
  console.log(`   With images: ${withImages}`);
  console.log(`   Without images: ${withoutImages}`);
  console.log(`\n   Cache saved to: ${CACHE_FILE}`);
  
  if (withoutImages > 0) {
    console.log(`\n📋 Products without images:`);
    Object.entries(cache)
      .filter((entry) => !entry[1].url || entry[1].url.includes('placeholder'))
      .slice(0, 10)
      .forEach((entry) => {
        console.log(`   - ${entry[1].productName} (${entry[1].category})`);
      });
    if (withoutImages > 10) {
      console.log(`   ... and ${withoutImages - 10} more`);
    }
  }
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

