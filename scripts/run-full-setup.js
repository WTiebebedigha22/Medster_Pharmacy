// =====================================================
// Medster Pharmacy - Full Automatic Setup
// =====================================================
// Run: node scripts/run-full-setup.js
//
// This script:
//   1. Prompts you to run the SQL in Supabase SQL Editor
//   2. Seeds 469 products from local data
//   3. Seeds sample orders and customer
//   4. Creates the admin user if not exists
// =====================================================

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log(`
╔══════════════════════════════════════════════╗
║      MEDSTER PHARMACY - FULL SETUP          ║
╚══════════════════════════════════════════════╝
`);

async function checkSetup() {
  console.log('\n🔍 Checking current database state...\n');

  // Check if tables exist
  const checks = [
    { name: 'users', query: supabase.from('users').select('count', { count: 'exact', head: true }) },
    { name: 'products', query: supabase.from('products').select('count', { count: 'exact', head: true }) },
    { name: 'orders', query: supabase.from('orders').select('count', { count: 'exact', head: true }) },
    { name: 'prescriptions', query: supabase.from('prescriptions').select('count', { count: 'exact', head: true }) },
  ];

  const results = {};
  for (const check of checks) {
    try {
      const { count, error } = await check.query;
      results[check.name] = { exists: !error || !error.message?.includes('does not exist'), count: count || 0, error: error?.message };
    } catch (e) {
      results[check.name] = { exists: false, count: 0, error: e.message };
    }
  }

  let allGood = true;
  for (const [name, result] of Object.entries(results)) {
    const icon = result.exists ? '✅' : '❌';
    console.log(`   ${icon} ${name}: ${result.exists ? `${result.count} records` : `MISSING - ${result.error || 'table not found'}`}`);
    if (!result.exists) allGood = false;
  }

  return { allGood, results };
}

async function checkAdminUser() {
  const { data: admin } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('email', 'admin@medster.com')
    .maybeSingle();

  if (admin) {
    console.log(`\n✅ Admin user exists: ${admin.email} (role: ${admin.role})`);
    return true;
  }

  console.log('\n⚠️  Admin user not found. Attempting to create...');
  
  const { data: newAdmin, error } = await supabase
    .from('users')
    .insert({
      email: 'admin@medster.com',
      password_hash: '$2b$12$u4gu5pw50m/Y8xqfLisUnenv5VILmtOiwsTadh0eLiOf56NWIHHv2',
      full_name: 'Medster Admin',
      phone: '+234 800 000 0000',
      role: 'admin',
      is_active: true,
      email_verified: true,
    })
    .select('id, email, role')
    .single();

  if (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    console.log('   💡 This is likely due to RLS. Please run the SQL first (see instructions below).');
    return false;
  }

  console.log(`   ✅ Admin created: ${newAdmin.email} (role: ${newAdmin.role})`);
  return true;
}

async function seedProducts() {
  console.log('\n📦 Seeding 469 products...');
  
  try {
    const localProducts = (await import('../src/data/products.js')).products;
    console.log(`   📚 Loaded ${localProducts.length} products from local data`);

    const BATCH_SIZE = 50;
    let success = 0;
    let failed = 0;

    const dbProducts = localProducts.map((p, index) => ({
      irec_id: p.sku || p.id || `local-${index}`,
      name: p.name || 'Unknown Product',
      description: p.description || '',
      category: ['Antimalarials','Syrups & Suspensions','General Health','Injections & Infusions','Medical Supplies','Tablets & Capsules','Food & Beverages','Contraceptives','Pain Relief','Creams & Ointments','Antibiotics & Anti-infectives','First Aid','Eye, Ear & Nasal Drops','Oral Care','Personal Care','Vitamins & Supplements','Cough & Cold Syrups','Antacids & Digestive Health','Cardiovascular Health','Respiratory','Diagnostic Tests','Feminine Care','Fertility & Sexual Health','Diabetes Care'].includes(p.category) ? p.category : 'General',
      brand: p.brand || 'Generic',
      price: typeof p.price === 'number' ? p.price : parseFloat(String(p.price).replace(/[₦,]/g, '')) || 0,
      compare_at_price: p.oldPrice ? (typeof p.oldPrice === 'number' ? p.oldPrice : parseFloat(String(p.oldPrice).replace(/[₦,]/g, '')) || null) : null,
      currency: 'NGN',
      stock_quantity: p.quantity || (p.inStock ? Math.floor(Math.random() * 20) + 1 : 0),
      is_rx: p.isRx || false,
      images: p.images || [p.image || '/images/placeholder.jpg'],
      thumbnail_url: p.image || '/images/placeholder.jpg',
      manufacturer: p.manufacturer || null,
      is_active: true,
    }));

    for (let i = 0; i < dbProducts.length; i += BATCH_SIZE) {
      const batch = dbProducts.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from('products').upsert(batch, { onConflict: 'irec_id' });
      if (error) {
        failed += batch.length;
      } else {
        success += batch.length;
      }
    }

    console.log(`   ✅ ${success} products seeded`);
    if (failed > 0) console.log(`   ⚠️  ${failed} failed`);
    return success > 0;
  } catch (err) {
    console.log(`   ❌ Failed to seed products: ${err.message}`);
    return false;
  }
}

async function seedOrders() {
  console.log('\n📋 Seeding sample orders...');

  // Get customer user
  let customerId;
  const { data: existingCustomer } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'customer')
    .limit(1);

  if (existingCustomer?.length > 0)
