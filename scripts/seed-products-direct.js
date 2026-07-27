// =====================================================
// Medster Pharmacy - Direct Product Seeder
// =====================================================
// Run: node scripts/seed-products-direct.js
// Seeds all 469 products from local data into Supabase
// =====================================================

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Import local products
let localProducts;
try {
  localProducts = (await import('../src/data/products.js')).products;
  console.log(`📦 Loaded ${localProducts.length} products from local data`);
} catch (err) {
  console.error('❌ Failed to load local products:', err.message);
  process.exit(1);
}

const CATEGORY_MAP = {
  'Antimalarials': 'Antimalarials',
  'Syrups & Suspensions': 'Syrups & Suspensions',
  'General Health': 'General Health',
  'Injections & Infusions': 'Injections & Infusions',
  'Medical Supplies': 'Medical Supplies',
  'Tablets & Capsules': 'Tablets & Capsules',
  'Food & Beverages': 'Food & Beverages',
  'Contraceptives': 'Contraceptives',
  'Pain Relief': 'Pain Relief',
  'Creams & Ointments': 'Creams & Ointments',
  'Antibiotics & Anti-infectives': 'Antibiotics & Anti-infectives',
  'First Aid': 'First Aid',
  'Eye, Ear & Nasal Drops': 'Eye, Ear & Nasal Drops',
  'Oral Care': 'Oral Care',
  'Personal Care': 'Personal Care',
  'Vitamins & Supplements': 'Vitamins & Supplements',
  'Cough & Cold Syrups': 'Cough & Cold Syrups',
  'Antacids & Digestive Health': 'Antacids & Digestive Health',
  'Cardiovascular Health': 'Cardiovascular Health',
  'Diabetes Care': 'Diabetes Care',
  'Fertility & Sexual Health': 'Fertility & Sexual Health',
  'Feminine Care': 'Feminine Care',
  'Respiratory': 'Respiratory',
  'Diagnostic Tests': 'Diagnostic Tests',
};

async function seedProducts() {
  console.log('\n🔧 Medster Pharmacy - Product Seeder');
  console.log('==========================================\n');

  // Clear existing products first
  console.log('🧹 Clearing existing products...');
  const { error: delError } = await supabase
    .from('products')
    .delete()
    .neq('irec_id', 'PLACEHOLDER_DELETE_ALL'); // Delete all
  
  if (delError) {
    console.error('⚠️  Could not clear products:', delError.message);
  } else {
    console.log('✅ Existing products cleared');
  }

  let success = 0;
  let failed = 0;
  const BATCH_SIZE = 50;

  // Transform local products to DB format
  const dbProducts = localProducts.map((p, index) => ({
    irec_id: p.sku || p.id || `local-${index}`,
    name: p.name || 'Unknown Product',
    description: p.description || '',
    category: CATEGORY_MAP[p.category] || p.category || 'General Health',
    brand: p.brand || 'Generic',
    price: typeof p.price === 'number' ? p.price : parseFloat(String(p.price).replace(/[₦,]/g, '')) || 0,
    compare_at_price: p.oldPrice ? (typeof p.oldPrice === 'number' ? p.oldPrice : parseFloat(String(p.oldPrice).replace(/[₦,]/g, '')) || null) : null,
    currency: 'NGN',
    stock_quantity: p.quantity || (p.inStock ? 10 : 0),
    is_rx: p.isRx || false,
    images: p.images || [p.image || '/images/placeholder.jpg'],
    thumbnail_url: p.image || '/images/placeholder.jpg',
    manufacturer: p.manufacturer || null,
    is_active: true,
    last_synced_at: new Date().toISOString(),
  }));

  // Insert in batches
  for (let i = 0; i < dbProducts.length; i += BATCH_SIZE) {
    const batch = dbProducts.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('products').upsert(batch, {
      onConflict: 'irec_id',
      ignoreDuplicates: false,
    });

    if (error) {
      console.error(`❌ Batch ${Math.floor(i/BATCH_SIZE) + 1} failed:`, error.message);
      failed += batch.length;
    } else {
      success += batch.length;
      console.log(`✅ Batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(dbProducts.length/BATCH_SIZE)}: ${batch.length} products`);
    }
  }

  console.log('\n==========================================');
  console.log(`📊 Results:`);
  console.log(`   ✅ ${success} products seeded successfully`);
  console.log(`   ❌ ${failed} products failed`);
  console.log(`   📦 ${dbProducts.length} total products`);
  console.log('==========================================');

  // Verify by counting
  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  if (!countError) {
    console.log(`\n🔍 Verification: ${count} products in database`);
  }

  // Get unique categories
  const { data: categories } = await supabase
    .from('products')
    .select('category')
    .not('category', 'is', null);

  if (categories) {
    const uniqueCats = [...new Set(categories.map(c => c.category))];
    console.log(`📂 Categories (${uniqueCats.length}): ${uniqueCats.join(', ')}`);
  }
}

seedProducts().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
