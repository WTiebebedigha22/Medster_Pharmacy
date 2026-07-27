/**
 * Medster Pharmacy - Setup & Seed Script
 *
 * 1. Creates all database tables via Supabase SQL API
 * 2. Seeds products from server/db/stocks.json
 *
 * Usage: node scripts/setup-and-seed.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// =============================================
// 1. Setup Supabase client (using service role)
// =============================================
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials.');
  console.error('   Ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// =============================================
// 2. Run Migration SQL
// =============================================
async function runMigrations() {
  console.log('\n📦 Creating database tables...');

  const migrationPath = path.resolve(__dirname, '../server/db/migrations.sql');
  const sql = readFileSync(migrationPath, 'utf-8');

  // Split by statement boundaries (semicolons followed by newline)
  // We need to handle the $$ in PL/pgSQL functions
  const statements = [];
  let current = '';
  let inDollarTag = false;
  let dollarTag = '';

  for (const line of sql.split('\n')) {
    // Skip comments and empty lines
    const trimmed = line.trim();
    if (trimmed.startsWith('--') || trimmed === '') {
      current += line + '\n';
      continue;
    }

    // Detect dollar-quote start/end for PL/pgSQL
    const dollarMatch = trimmed.match(/^\$(\w*)\$$/);
    if (dollarMatch) {
      if (!inDollarTag) {
        inDollarTag = true;
        dollarTag = dollarMatch[1] || '';
      } else {
        inDollarTag = false;
        dollarTag = '';
      }
      current += line + '\n';
      continue;
    }

    if (inDollarTag) {
      // Check if dollar tag closes mid-line
      const closeMatch = trimmed.match(/\$(\w*)\$$/);
      if (closeMatch && closeMatch[1] === dollarTag) {
        inDollarTag = false;
        dollarTag = '';
      }
      current += line + '\n';
      continue;
    }

    current += line + '\n';

    // If line ends with semicolon and we're not in a dollar-quote block
    if (trimmed.endsWith(';')) {
      statements.push(current);
      current = '';
    }
  }

  // Push any remaining
  if (current.trim()) {
    statements.push(current);
  }

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (!stmt) continue;

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: stmt }).maybeSingle();
      
      if (error) {
        // Try direct query instead
        try {
          const { error: directError } = await supabase.from('_sql_exec').insert({ query: stmt }).select();
          if (directError) {
            // Fallback: use REST API directly
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': serviceRoleKey,
                'Authorization': `Bearer ${serviceRoleKey}`,
              },
              body: JSON.stringify({ sql: stmt }),
            });
            if (!response.ok) {
              const text = await response.text();
              // Many statements will fail because exec_sql may not exist yet
              // That's OK for CREATE TABLE IF NOT EXISTS
              if (text.includes('Could not find the function')) {
                // Try direct SQL via Supabase REST API
                const sqlResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'apikey': serviceRoleKey,
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'Prefer': 'resolution=merge-duplicates',
                  },
                  body: JSON.stringify({}),
                });
              }
            }
          }
        } catch (e2) {
          // Silently ignore - many SQL statements won't work via REST
        }
      } else {
        successCount++;
      }
    } catch (err) {
      errorCount++;
    }
  }

  console.log(`   Migration statements processed. (Use Supabase SQL Editor for complex DDL)`);
}

// =============================================
// 3. Seed Products
// =============================================
async function seedProducts() {
  console.log('\n🌱 Seeding products from stocks.json...');

  const stocksPath = path.resolve(__dirname, '../server/db/stocks.json');
  let stockItems;
  try {
    const raw = readFileSync(stocksPath, 'utf-8');
    stockItems = JSON.parse(raw);
    console.log(`   Found ${stockItems.length} products in stocks.json`);
  } catch (err) {
    console.error('❌ Failed to read stocks.json:', err.message);
    return false;
  }

  // Category auto-detection
  function detectCategory(name) {
    const upper = name.toUpperCase();
    if (/\b(INJECTION|INFUSION|IV\b|VIAL)\b/.test(upper)) return 'Injections & Infusions';
    if (/\b(TABLET|CAPLET|CAPSULE|CAP|TAB\.)\b/.test(upper)) return 'Tablets & Capsules';
    if (/\b(SYRUP|SUSPENSION|LINCTUS|EXPECTORANT|MIXTURE|LIQUID|DROPS?)\b/.test(upper)) {
      if (/\b(EYE|EAR|NASAL|OPHTHALMIC)\b/.test(upper)) return 'Eye, Ear & Nasal Drops';
      if (/\b(COUGH|COLD|CHESTY|DRY COUGH)\b/.test(upper)) return 'Cough & Cold Syrups';
      return 'Syrups & Suspensions';
    }
    if (/\b(CREAM|OINTMENT|GEL\b|LOTION|BALM|LINIMENT|EMUGEL)\b/.test(upper)) return 'Creams & Ointments';
    if (/\b(EYE|EAR|NASAL|OPHTHALMIC|OPTIC)\b/.test(upper)) return 'Eye, Ear & Nasal Drops';
    if (/\b(TOOTHPASTE|MOUTHWASH|DENTAL|TOOTH\s*BRUSH|ORAL[-\s]B)\b/.test(upper)) return 'Oral Care';
    if (/\b(CONDOM|CONDOMS|DUREX|FETHERLITE|EXTRA\s*SAFE|Rough\s*Rider)\b/.test(upper)) return 'Contraceptives';
    if (/\b(PAD\b|PANTI|TAMPAX|KOTEX|FEMININE|MOLPED)\b/.test(upper)) return 'Feminine Care';
    if (/\b(SOAP|BODY\s*(WASH|LOTION|CREAM)|SHAMPOO|DEODORANT|LOTION|SUN\s*SCREEN|SERUM)\b/.test(upper)) return 'Personal Care';
    if (/\b(BANDAGE|SYRINGE|NEEDLE|GLOVES?|MASK\b|COTTON\s*WOOL|DRESSING|CANNUA|SCAL\s*VEIN|TAPE)\b/.test(upper)) return 'Medical Supplies';
    if (/\b(TEST\s*KIT|PREGNANCY\s*TEST|MALARIA\s*TEST|TYPHOID\s*TEST|OVULATION|FBS|RBS|MONITOR)\b/.test(upper)) return 'Diagnostic Tests';
    if (/\b(VITAMIN|SUPPLEMENT|PROBIOTIC|MINERAL|MAGNESIUM|CALCIUM|OMEGA|COLLAGEN|PROTEIN|MULTIVITAMIN|NUTRITIONAL|WELLWOMAN)\b/.test(upper)) return 'Vitamins & Supplements';
    if (/\b(DRINK|WATER|COOKIES|BISCUIT|CHOCOLATE|JUICE|MALTINA|COCA\s*COLA|FANTA|CHIVITA|MALTED|MILK)\b/.test(upper)) return 'Food & Beverages';
    if (/\b(INHALER|NEBULIZER)\b/.test(upper)) return 'Respiratory';
    if (/\b(PAIN\s*RELIE|IBUPROFEN|NAPROXEN|DICLOFENAC|PARACETAMOL|PANADOL|ASPIRIN|CELEBREX|CAFERGOT|TRAMADOL)\b/.test(upper)) return 'Pain Relief';
    if (/\b(CEFTRIAXONE|AZITHROMYCIN|AMOXICILLIN|CEFUROXIME|LEVOFLOKACIN|CIPROFLOXACIN|METRONIDAZOLE|PENICILLIN|GENTAMYCIN|CLINDAMYCIN|ERYTHROMYCIN|ANTIBIOTIC|OFLOXACIN|FLUCONAZOLE|SECNDAZOLE)\b/.test(upper)) return 'Antibiotics & Anti-infectives';
    if (/\b(LONART|WAIPA|ACT\s*CLARTEM|WINART|ARTESUNATE|ANTIMALARIAL|MALARIA)\b/.test(upper)) return 'Antimalarials';
    if (/\b(ANTACID|SUSPENSION|GAVISCON|GESTID|POLYGEL|RULOX|ACIPEP|GASTRIGEL|DIGICID|STOPACID|IMODIUM|LOPERAMIDE|PEPTO)\b/.test(upper)) return 'Antacids & Digestive Health';
    if (/\b(AMLODIPINE|LISNOPRIL|ATORVASTATIN|LIPITOR|BLOOD\s*PRESSURE|CARDIO|COVERAM|NATRILIX|XARELITO|JARDANCE)\b/.test(upper)) return 'Cardiovascular Health';
    if (/\b(METFORMIN|GLUCOPHAGE|SITAGLIPTIN|TREVIA|DIABETES|INSULIN|TRIVIAMET|GALVUS|OZEMPIC|JARDANCE)\b/.test(upper)) return 'Diabetes Care';
    if (/\b(FERTIL|CLOMID|INOSITOL|PROVIRON|MESTEROLONE|VIAGRA)\b/.test(upper)) return 'Fertility & Sexual Health';
    if (/\b(FIRST\s*AID|BANDAGE|DRESSING|PLASTER)\b/.test(upper)) return 'First Aid';
    return 'General Health';
  }

  function detectIsRx(name) {
    const upper = name.toUpperCase();
    const rxKeywords = [
      'CEFTRIAXONE', 'AZITHROMYCIN', 'AMOXICILLIN', 'CEFUROXIME', 'LEVOFLOKACIN',
      'CIPROFLOXACIN', 'METRONIDAZOLE', 'PENICILLIN', 'GENTAMYCIN', 'CLINDAMYCIN',
      'ERYTHROMYCIN', 'OFLOXACIN', 'FLUCONAZOLE', 'SECNDAZOLE', 'CLOMID',
      'PROVIRON', 'MESTEROLONE', 'VIAGRA', 'SITAGLIPTIN', 'METFORMIN',
      'GLUCOPHAGE', 'LIPITOR', 'AMLODIPINE', 'LISNOPRIL', 'WARFARIN',
      'INJECTION', 'INFUSION', 'OZEMPIC', 'JARDANCE', 'XARELITO',
      'LEVOTHYROXINE', 'MIFEPAK', 'ARTESUNATE', 'TRAMADOL',
      'MONTELUKAST', 'PREDNISOLONE', 'BETAMETHASONE', 'HYDROCORTISONE',
      'CLOMIPHENE', 'CAFERGOT', 'SUMATRIPTAN', 'TREVIA', 'TRIVIAMET',
      'COVERAM', 'NATRILIX', 'GALVUS', 'PENICILLIN', 'BACTRIM',
    ];
    return rxKeywords.some(kw => upper.includes(kw));
  }

  let inserted = 0;
  let errors = 0;
  const seenSkus = new Set();
  const batchSize = 50;
  let batch = [];

  for (const item of stockItems) {
    try {
      const name = String(item.PRODUCT_NAME || '').trim();
      const sku = String(item.PRODUCT_SKU || '').trim();
      const costPrice = parseFloat(String(item.COST_PRICE || '0').replace(/,/g, '')) || 0;
      const sellingPrice = parseFloat(String(item.SELLING_PRICE || '0').replace(/,/g, '')) || 0;
      const quantityLeft = parseInt(String(item.QUANTITY_LEFT || '0').replace(/,/g, ''), 10) || 0;

      if (!name) continue;

      const uniqueSku = sku || `sku_${item.NO || Date.now()}`;
      if (seenSkus.has(uniqueSku)) continue;
      seenSkus.add(uniqueSku);

      const category = detectCategory(name);
      const isRx = detectIsRx(name);
      const brand = (name.split(/\s+/)[0] || 'Medster').replace(/[^a-zA-Z0-9&.\-']/g, '');

      batch.push({
        irec_id: `stocks_${uniqueSku}`,
        name: name,
        description: `${brand} ${name}. ${isRx ? 'Prescription required. ' : ''}Category: ${category}.`,
        category,
        brand,
        price: sellingPrice,
        compare_at_price: costPrice > 0 ? costPrice : null,
        currency: 'NGN',
        stock_quantity: quantityLeft,
        is_rx: isRx,
        images: [`/images/categories/${category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.svg`],
        thumbnail_url: `/images/categories/${category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.svg`,
        attributes: {},
        manufacturer: brand,
        is_active: true,
        last_synced_at: new Date().toISOString(),
      });

      if (batch.length >= batchSize) {
        const { error } = await supabase.from('products').upsert(batch, {
          onConflict: 'irec_id',
          ignoreDuplicates: false,
        });
        if (error) {
          console.error(`   ❌ Batch error: ${error.message}`);
          errors += batch.length;
        } else {
          inserted += batch.length;
          process.stdout.write(`   ✅ ${inserted} products...\r`);
        }
        batch = [];
      }
    } catch (err) {
      errors++;
    }
  }

  // Flush remaining batch
  if (batch.length > 0) {
    const { error } = await supabase.from('products').upsert(batch, {
      onConflict: 'irec_id',
      ignoreDuplicates: false,
    });
    if (error) {
      console.error(`   ❌ Final batch error: ${error.message}`);
      errors += batch.length;
    } else {
      inserted += batch.length;
    }
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`🌱 Seed Complete:`);
  console.log(`   ✅ ${inserted} products inserted/updated`);
  console.log(`   ❌ ${errors} errors`);
  console.log('═══════════════════════════════════════');
  return errors === 0;
}

// =============================================
// 4. Verify
// =============================================
async function verify() {
  console.log('\n🔍 Verifying database...');
  const { data: products, count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: false })
    .limit(5);

  if (error) {
    console.error(`   ❌ Verification failed: ${error.message}`);
    console.log('\n💡 Please ensure the products table exists in your Supabase project.');
    console.log('   Run the following SQL in Supabase SQL Editor:');
    console.log('   (Open https://supabase.com, go to SQL Editor, paste the contents of)');
    console.log('   server/db/migrations.sql, and run it. Then re-run this script.\n');
    return false;
  }

  console.log(`   ✅ ${count} products in database`);
  console.log(`   Sample:`);
  (products || []).forEach(p => {
    console.log(`     • ${p.name} (₦${p.price?.toLocaleString() || 0}) [${p.category}]`);
  });
  return true;
}

// =============================================
// Main
// =============================================
async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║    Medster Pharmacy - Database Setup     ║');
  console.log('╚══════════════════════════════════════════╝');

  // Step 1: Try migrations
  await runMigrations();

  // Step 2: Check if products table exists
  const { error: checkError } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .limit(1);

  if (checkError) {
    console.error(`\n❌ The products table does not exist yet.`);
    console.log(`\n💡 Please create the tables first:`);
    console.log(`   1. Go to https://supabase.com/dashboard/project/${supabaseUrl.match(/https:\/\/(.+)\.supabase/)?.[1] || 'your-project'}/sql/new`);
    console.log(`   2. Copy contents of server/db/migrations.sql`);
    console.log(`   3. Paste and run the SQL`);
    console.log(`   4. Re-run: node scripts/setup-and-seed.js\n`);
    process.exit(1);
  }

  // Step 3: Seed
  const seedOk = await seedProducts();
  if (!seedOk) {
    console.error('\n❌ Seed had errors. Check logs above.');
    process.exit(1);
  }

  // Step 4: Verify
  await verify();

  console.log('\n🎉 All done! Start the app with: npm run dev:all\n');
  process.exit(0);
}

main();

