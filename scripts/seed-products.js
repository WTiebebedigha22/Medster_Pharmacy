/**
 * Seed Products Script
 *
 * Populates the local database with product data from the frontend data file.
 * This allows the application to function fully when iRECPlus API is unavailable.
 *
 * Usage: node scripts/seed-products.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { products as sourceProducts } from '../src/data/products.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSeed() {
  console.log('🌱 Starting product seed...');
  console.log(`   Source: src/data/products.js (${sourceProducts.length} products)`);

  let inserted = 0;
  let errors = 0;

  for (const product of sourceProducts) {
    try {
      const transformed = {
        irec_id: `seed_${product.id}`,
        name: product.name,
        description: product.description || `Quality ${product.name} from ${product.brand || 'Medster'}.`,
        category: product.category || 'General',
        brand: product.brand || 'Medster',
        price: parseFloat(product.price) || 0,
        compare_at_price: product.oldPrice ? parseFloat(String(product.oldPrice).replace(/[₦,]/g, '')) : null,
        currency: 'NGN',
        stock_quantity: 50,
        is_rx: product.isRx || false,
        images: [product.image || '/images/placeholder.jpg'],
        thumbnail_url: product.image || '/images/placeholder.jpg',
        attributes: {
          strength: null,
          dosage_form: null,
          pack_size: null,
          manufacturer: product.brand || null,
        },
        manufacturer: product.brand || null,
        is_active: true,
        last_synced_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('products').upsert(transformed, {
        onConflict: 'irec_id',
        ignoreDuplicates: false,
      });

      if (error) {
        console.error(`   ❌ Error inserting ${product.name}:`, error.message);
        errors++;
      } else {
        console.log(`   ✅ Inserted: ${product.name} (₦${product.price})`);
        inserted++;
      }
    } catch (err) {
      console.error(`   ❌ Unexpected error for ${product.name}:`, err.message);
      errors++;
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log(`🌱 Seed Complete: ${inserted} inserted, ${errors} errors`);
  console.log('═══════════════════════════════════════');
  process.exit(errors > 0 ? 1 : 0);
}

runSeed();
