// Pexels API Service for Product Images
// Product images are already embedded in src/data/products.js via the build step.
// This service provides additional lookup/fallback capabilities.
const PEXELS_API_KEY = 'qA1e1b9iMLYgLRc5ohhsrFrHTnztCPzFegfKhL99mg4Mm07xis5pHZmE';
const PEXELS_BASE_URL = 'https://api.pexels.com/v1';

// Cache for fetched images (runtime)
const imageCache = new Map();

// Pre-fetched image cache - loaded from public/ directory at startup
let preFetchedCache = {};
let cacheLoadAttempted = false;

/**
 * Load the pre-fetched image cache from the JSON file.
 * Tries multiple paths for compatibility (dev, build, GitHub Pages).
 */
export async function loadImageCache() {
  if (cacheLoadAttempted) return preFetchedCache;
  cacheLoadAttempted = true;
  if (Object.keys(preFetchedCache).length > 0) return preFetchedCache;
  
  // Try multiple paths: Vite dev serves from src/, production from /
  const paths = ['/product-images.json', '/src/lib/product-images.json'];
  
  for (const path of paths) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        preFetchedCache = await response.json();
        console.log(`[Pexels] Loaded ${Object.keys(preFetchedCache).length} pre-fetched Pexels images`);
        return preFetchedCache;
      }
    } catch {
      // Try next path
    }
  }
  
  console.warn('[Pexels] No pre-fetched Pexels cache found. Run `node scripts/fetch-pexels-images.js` to generate.');
  return preFetchedCache;
}

/**
 * Generate a cache key matching the one in fetch-pexels-images.js
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
 * Look up a pre-fetched image URL from the cached Pexels data
 */
export function getCachedImage(productName, category = '') {
  if (!productName) return null;
  
  const key = makeCacheKey(productName, category);
  const entry = preFetchedCache[key];
  if (entry && entry.url && !entry.url.includes('placeholder')) {
    return entry.url;
  }
  return null;
}

/**
 * Search for product images on Pexels API (live fallback)
 */
export async function searchProductImages(query, count = 1) {
  const cacheKey = `${query}-${count}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  try {
    const response = await fetch(
      `${PEXELS_BASE_URL}/search?query=${encodeURIComponent(query)}&per_page=${count}`,
      {
        headers: {
          'Authorization': PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();
    const images = data.photos?.map(photo => ({
      url: photo.src?.medium || photo.src?.small,
      original: photo.src?.original,
      alt: photo.alt || query,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
    })) || [];

    const urls = images.map(img => img.url);
    imageCache.set(cacheKey, urls);
    return urls;
  } catch (error) {
    console.warn('Pexels API error:', error.message);
    return [];
  }
}

/**
 * Get a single product image - checks cache first, then falls back to API
 */
export async function getProductImage(productName, category = '') {
  // Try pre-fetched cache first
  const cached = getCachedImage(productName, category);
  if (cached) return cached;
  
  // Fall back to live API
  const query = `${productName} ${category} medicine pharmacy`.trim();
  const images = await searchProductImages(query, 1);
  return images[0] || null;
}

/**
 * Get multiple product images for a list of products
 * Uses pre-fetched cache where available, batched API otherwise
 */
export async function getProductImages(products) {
  const results = {};
  const toFetch = [];
  
  // First, check cache for all products
  for (const product of products) {
    const cached = getCachedImage(product.name, product.category);
    if (cached) {
      results[product.id] = cached;
    } else {
      toFetch.push(product);
    }
  }
  
  // Fetch remaining from API in batches
  if (toFetch.length > 0) {
    const batchSize = 5;
    for (let i = 0; i < toFetch.length; i += batchSize) {
      const batch = toFetch.slice(i, i + batchSize);
      const promises = batch.map(async (product) => {
        const query = `${product.name} ${product.category || ''} pharmaceutical`.trim();
        results[product.id] = await getProductImage(query);
      });
      await Promise.all(promises);
    }
  }

  return results;
}

/**
 * Get curated pharmacy/drugstore images for backgrounds
 */
export async function getPharmacyBackgrounds(count = 3) {
  const queries = ['pharmacy interior', 'medicine cabinet', 'pharmacist', 'drugstore'];
  const allImages = [];

  for (const query of queries) {
    const images = await searchProductImages(query, 2);
    allImages.push(...images);
    if (allImages.length >= count) break;
  }

  return allImages.slice(0, count);
}

export default {
  searchProductImages,
  getProductImage,
  getProductImages,
  getPharmacyBackgrounds,
  loadImageCache,
  getCachedImage,
};
