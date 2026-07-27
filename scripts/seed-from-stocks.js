/**
 * Seed Products from stocks.json
 *
 * Reads the real pharmacy inventory from server/db/stocks.json
 * and inserts/upserts into the Supabase products table.
 *
 * Usage: node scripts/seed-from-stocks.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ----------------------------------------------------------------
// Category auto-detection based on product name keywords
// ----------------------------------------------------------------
function detectCategory(name) {
  const upper = name.toUpperCase();

  // Injections / Infusions
  if (/\b(INJECTION|INFUSION|IV\b|VIAL)\b/.test(upper)) return 'Injections & Infusions';

  // Tablets / Capsules / Caplets
  if (/\b(TABLET|CAPLET|CAPSULE|CAP|TAB\.)\b/.test(upper)) return 'Tablets & Capsules';

  // Syrups / Suspensions / Liquids / Mixtures
  if (/\b(SYRUP|SUSPENSION|LINCTUS|EXPECTORANT|MIXTURE|LIQUID|DROPS?)\b/.test(upper)) {
    if (/\b(EYE|EAR|NASAL|OPHTHALMIC)\b/.test(upper)) return 'Eye, Ear & Nasal Drops';
    if (/\b(COUGH|COLD|CHESTY|DRY COUGH)\b/.test(upper)) return 'Cough & Cold Syrups';
    return 'Syrups & Suspensions';
  }

  // Creams / Ointments / Gels
  if (/\b(CREAM|OINTMENT|GEL\b|LOTION|BALM|LINIMENT|EMUGEL)\b/.test(upper)) return 'Creams & Ointments';

  // Eye / Ear / Nasal drops & sprays
  if (/\b(EYE|EAR|NASAL|OPHTHALMIC|OPTIC)\b/.test(upper)) return 'Eye, Ear & Nasal Drops';

  // Oral Care
  if (/\b(TOOTHPASTE|MOUTHWASH|DENTAL|TOOTH\s*BRUSH|ORAL[-\s]B)\b/.test(upper)) return 'Oral Care';

  // Contraceptives
  if (/\b(CONDOM|CONDOMS|DUREX|FETHERLITE|EXTRA\s*SAFE|Rough\s*Rider)\b/.test(upper)) return 'Contraceptives';

  // Feminine Care
  if (/\b(PAD\b|PANTI|TAMPAX|KOTEX|FEMININE|MOLPED)\b/.test(upper)) return 'Feminine Care';

  // Personal Care
  if (/\b(SOAP|BODY\s*(WASH|LOTION|CREAM)|SHAMPOO|DEODORANT|LOTION|SUN\s*SCREEN|SERUM)\b/.test(upper)) return 'Personal Care';

  // Medical Supplies
  if (/\b(BANDAGE|SYRINGE|NEEDLE|GLOVES?|MASK\b|COTTON\s*WOOL|DRESSING|CANNUA|SCAL\s*VEIN|TAPE)\b/.test(upper)) return 'Medical Supplies';

  // Diagnostic Tests
  if (/\b(TEST\s*KIT|PREGNANCY\s*TEST|MALARIA\s*TEST|TYPHOID\s*TEST|OVULATION|FBS|RBS|MONITOR)\b/.test(upper)) return 'Diagnostic Tests';

  // Vitamins & Supplements
  if (/\b(VITAMIN|SUPPLEMENT|PROBIOTIC|MINERAL|MAGNESIUM|CALCIUM|OMEGA|COLLAGEN|PROTEIN|MULTIVITAMIN|NUTRITIONAL|WELLWOMAN)\b/.test(upper)) return 'Vitamins & Supplements';

  // Food & Beverages
  if (/\b(DRINK|WATER|COOKIES|BISCUIT|CHOCOLATE|JUICE|MALTINA|COCA\s*COLA|FANTA|CHIVITA|MALTED|MILK)\b/.test(upper)) return 'Food & Beverages';

  // Respiratory
  if (/\b(INHALER|NEBULIZER)\b/.test(upper)) return 'Respiratory';

  // Pain Relief
  if (/\b(PAIN\s*RELIE|IBUPROFEN|NAPROXEN|DICLOFENAC|PARACETAMOL|PANADOL|ASPIRIN|CELEBREX|CAFERGOT|TRAMADOL)\b/.test(upper)) return 'Pain Relief';

  // Antibiotics / Anti-infectives
  if (/\b(CEFTRIAXONE|AZITHROMYCIN|AMOXICILLIN|CEFUROXIME|LEVOFLOKACIN|CIPROFLOXACIN|METRONIDAZOLE|PENICILLIN|GENTAMYCIN|CLINDAMYCIN|ERYTHROMYCIN|ANTIBIOTIC|OFLOXACIN|FLUCONAZOLE|SECNDAZOLE)\b/.test(upper)) return 'Antibiotics & Anti-infectives';

  // Antimalarials
  if (/\b(LONART|WAIPA|ACT\s*CLARTEM|WINART|ARTESUNATE|ANTIMALARIAL|MALARIA)\b/.test(upper)) return 'Antimalarials';

  // Wound Care
  if (/\b(WOUND|BANDAGE|DRESSING|TAPE\b|PLASTER)\b/.test(upper)) return 'Wound Care';

  // Antacids / Digestive
  if (/\b(ANTACID|SUSPENSION|GAVISCON|GESTID|POLYGEL|RULOX|ACIPEP|GASTRIGEL|DIGICID|STOPACID|IMODIUM|LOPERAMIDE|PEPTO)\b/.test(upper)) return 'Antacids & Digestive Health';

  // Cardiovascular
  if (/\b(AMLODIPINE|LISNOPRIL|ATORVASTATIN|LIPITOR|BLOOD\s*PRESSURE|CARDIO|COVERAM|NATRILIX|XARELITO|JARDANCE)\b/.test(upper)) return 'Cardiovascular Health';

  // Diabetes
  if (/\b(METFORMIN|GLUCOPHAGE|SITAGLIPTIN|TREVIA|DIABETES|INSULIN|TRIVIAMET|GALVUS|OZEMPIC|JARDANCE)\b/.test(upper)) return 'Diabetes Care';

  // Fertility / Sexual Health
  if (/\b(FERTIL|CLOMID|INOSITOL|PROVIRON|MESTEROLONE|VIAGRA|POWER\s*PLAY|ORGAZ|MUTUAL\s*CLIMAX|EROTICA|AFRO\s*MAMBA)\b/.test(upper)) return 'Fertility & Sexual Health';

  // First Aid
  if (/\b(FIRST\s*AID|BANDAGE|DRESSING|PLASTER)\b/.test(upper)) return 'First Aid';

  return 'General Health';
}

// ----------------------------------------------------------------
// Detect if product requires a prescription
// ----------------------------------------------------------------
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

// ----------------------------------------------------------------
// Determine brand from product name (first word often)
// ----------------------------------------------------------------
function detectBrand(name) {
  const upper = name.toUpperCase();
  const firstWord = name.split(/\s+/)[0] || 'Medster';
  const knownBrands = [
    'LONART', 'WAIPA', 'EMAL', 'AVENTRA', 'DMAL', 'PHILO', 'GRACE', 'TRIAXIN',
    'YELLOW', 'DERM', 'ROCEPHIN', 'PHILODIC', 'PARACLIM', 'GENTACLIM', 'NAZA',
    'N-GENTAMYCIN', 'GENTALEK', 'POSTINOR', 'CLARITHEK', 'DUCOLAX', 'MALTINA',
    'MC', 'PHILOCAINE', 'EMBASSY', 'NELBPLEX', 'DELEJECT', 'SALMAJECT',
    'DELEGECT', 'NEO', 'MENTOS', 'DUREX', 'FANTA', 'DICLOMOL', 'GAVISCON',
    'EMCAP', 'HYDRAC', 'RELEV', 'SALONPAS', 'JUCOPAN', 'BUSCOMAC', 'ORPHESIC',
    'TRIBOTAN', 'PIRITON', 'Cenpain', 'CAFERGOT', 'NAPROXEN', 'COXIGET',
    'REELS', 'SUMATRIPTAN', 'FEMINAX', 'ASPIRIN', 'CELEBREX', 'PANADOL',
    'FELVIN', 'TYENOL', 'BAYER', 'EMVITE', 'ABIDEC', 'MOPSON', 'BONABABE',
    'PANADA', 'BABYREX', 'WOODWARDS', 'REFUCI', 'HAWAII', 'NOSPAMIN',
    'PRANTRIIN', 'FLUCAMED', 'SWISEC', 'MOKO', 'HYDROGEN', 'METRONE',
    'VITAMILK', 'Calgovit', 'FOTMOLA', 'KISS', 'SWIPHA', 'FUNBACT-A',
    'NEOSKIN', 'CHEZFLOX', 'VISINE', 'VISITA', 'ROUGH', 'MENTOS',
    'MIXAGRIP', 'PROCOLCOLD', 'VIGOR', 'G-DERM', 'ABONIKI', 'HYPEREX-SR',
    'LORAT-10', 'LORATYN-10', 'ZYNCET', 'MAXIM', 'KLOVINAL', 'GOLD CIRCLE',
    'BUTTER', 'NUEL', 'IMODIUM', 'LODIUM', 'ANGEL', 'SOFTCARE', 'AMSTEL',
    'FAYROUZ', 'CHIVITA', 'NIVEA', 'DENTAL', 'COCA COLA', 'CETIDYN-L',
    'EARTH', 'FULGRIVIN', 'CLARITYNE', 'FLUCORDAY', 'XYZAL', 'EVANS',
    'GESTID', 'NIZORAL', 'FEXET', 'ST. IVES', 'JORDAN', 'ORAL-B',
    'MONTRAL', 'MECURE', 'XASTEN', 'MONTIGET', 'BILAXTEN', 'MULT-ACTION',
    'SINUFED', 'STOZZON', 'TUXIL', 'COFEX', 'EMZOLYN', 'KOFOL', 'NEOFYLIN',
    'CODOLIN', 'COFLIN', 'BENYLIN', 'BUTTERCUP', 'ATADYN', 'CLARITYN',
    'NOVALYN', 'SUDAFED', 'NGC', 'MELOTEAES', 'DUOSOPT', 'CALPOL',
    'OPTIMOL', 'OPTIVISC', 'TEARS', 'OTRIVINE', 'GENTAFAITH', 'ALPHAGAN',
    'TOBREX', 'OPTREX', 'ZAPZYT', 'ROBB', 'VICKS', 'POWERHEAT', 'SKIMATE',
    'CANESTEN', 'FINASIL', 'RATIN-A', 'ANUSOL', 'PODOPHYLLIN', 'NIXODERM',
    'CZOCAIN', 'NYSTATIN', 'VIREST', 'YTACAN', 'KLINFAST', 'GYNAMED',
    'NEIMETH', 'EURAX', 'ADVANTAN', 'VOLTAREN', 'DABUR', 'DEEP',
    'AQUASULF', 'DEEP FREEZE', 'DAKTRIN', 'NEOFIDROL', 'NZORAL', 'SUDOCREAM',
    'MENTHOLATUM', 'VASELINE', 'LEVOFEM', 'HUMBLE', 'BACK-UP', 'MOLPED',
    'MINTY', 'GOLD BRETT', 'FRESH MINT', 'LISTERINE', 'SPARTAN', 'COLGATE',
    'KANG', 'ROSE BELLE', 'VALVAS', 'DIPLOMAT', 'OGL', 'FAMILIA', 'LONGIRICH',
    'HAODA', 'SPORT', 'BLACK', 'KIDS', 'BLUE', 'WET N WILD', 'KING',
    'AFRO MAMBA', 'EROTICA', 'POWER PLAY', 'ORGAZ', 'FIRE', 'FIESTA',
    'LIFESTYLE', 'SKINS', 'ASCOCHEW', 'ADAMS', 'MENTHODEX', 'KRISHAT',
    'OLFEN', 'LIVOLIN', 'SYNRIAM', 'PENZOCINE', 'ALABUKUN', 'DRGREGTS',
    'STREPSILS', 'PFIZER', 'HALIBORANGE', 'PROLIFE', 'Garden', 'Elan',
    'Nature', 'Puritans', 'Mason', 'Hpv', 'Improved', 'Force', 'Intimate',
    'Fair', 'Gluta', 'Itsi', 'Reload', 'Hovid', 'RAID', 'BNC', 'PREMIER',
    'VITAMINSTORE', 'SILICONE', 'NUROFEN', 'MIFEPAK', 'MAGSL', 'POLYGEL',
    'DIGICID', 'AVROCID', 'STOPACID', 'GECROL', 'EVACID', 'RULOX', 'NUGEL-O',
    'ACIPEP', 'GASTRIGEL', 'LEVOTHYROXINE', 'TREVIA', 'LIPITOR', 'PROVIRON',
    'CLOMID', 'TRANEXAMIC', 'TRIVIAMET', 'COTTON', 'NATURESFILLED', 'OPTIMUM',
    'PHYTO', 'DIASTOP', 'XICEF', 'MEDIX', 'AQSA', 'ZETRO', 'GLOTHROX',
    'HALIB', 'PISCO', 'TARVID', 'PEPTO', 'CIPROXIN', 'DISPERSIBLE', 'LEVOTIL',
    'GOOD MOLECULE', 'COVERAM', 'AQUA SUN', 'GALVUS', 'GLUCOPHAGE', 'NATRILIX',
    'CLEAN & CLEAR', 'STIVES', 'NEOLAEVES', 'EMZOR', 'AVENTRA',
    'FOREVER', 'NUTRICOST', 'PANADOL', 'PLATO', 'UPPERIO', 'BAYER',
    'NARTINELLIS', 'CLOSEUP', 'JARDANCE', 'CATAFLAM', 'COLGATE',
    'Kinbrex', 'MOTIL', 'vital proteins', 'LISNOPRIL', 'FBS', 'THROTAL',
    'STORM', 'SARTOR', 'BEARD', 'MISOPT', 'SENSODYNE', 'LEVEER',
  ];
  const matched = knownBrands.find(b => upper.startsWith(b));
  return matched || firstWord;
}

// ----------------------------------------------------------------
// Main seed function
// ----------------------------------------------------------------
async function runSeed() {
  console.log('🌱 Starting seed from stocks.json...');

  // Read stocks.json
  const stocksPath = path.resolve(__dirname, '../server/db/stocks.json');
  let stockItems;
  try {
    const raw = readFileSync(stocksPath, 'utf-8');
    stockItems = JSON.parse(raw);
    console.log(`   Found ${stockItems.length} products in stocks.json`);
  } catch (err) {
    console.error('❌ Failed to read stocks.json:', err.message);
    process.exit(1);
  }

  let inserted = 0;
  let errors = 0;
  const seenSkus = new Set();

  for (const item of stockItems) {
    try {
      const name = String(item.PRODUCT_NAME || '').trim();
      const sku = String(item.PRODUCT_SKU || '').trim();
      const costPrice = parseFloat(String(item.COST_PRICE || '0').replace(/,/g, '')) || 0;
      const sellingPrice = parseFloat(String(item.SELLING_PRICE || '0').replace(/,/g, '')) || 0;
      const quantityLeft = parseInt(String(item.QUANTITY_LEFT || '0').replace(/,/g, ''), 10) || 0;

      if (!name) {
        console.warn('   ⚠️ Skipping entry with no PRODUCT_NAME');
        continue;
      }

      // Generate a unique ID
      const uniqueSku = sku || `sku_${item.NO || Date.now()}`;

      // Skip duplicates with same SKU
      if (seenSkus.has(uniqueSku)) {
        console.warn(`   ⚠️ Skipping duplicate SKU: ${uniqueSku} (${name})`);
        continue;
      }
      seenSkus.add(uniqueSku);

      const category = detectCategory(name);
      const isRx = detectIsRx(name);
      const brand = detectBrand(name);

      const transformed = {
        irec_id: `stock_${uniqueSku}`,
        name: name,
        description: `${brand} ${name}. ${isRx ? 'Prescription required. ' : ''}Category: ${category}. High-quality pharmaceutical product from Medster Pharmacy.`,
        category: category,
        brand: brand,
        price: sellingPrice,
        compare_at_price: costPrice > 0 ? costPrice : null,
        currency: 'NGN',
        stock_quantity: quantityLeft,
        is_rx: isRx,
        images: ['/images/placeholder.jpg'],
        thumbnail_url: '/images/placeholder.jpg',
        attributes: {
          strength: null,
          dosage_form: null,
          pack_size: null,
          manufacturer: brand,
          branch: item.BRANCH || 'Ruby Center Branch, Wuse 2',
          product_no: item.NO || null,
          cost_price: costPrice,
          total_stock_value: parseFloat(String(item.TOTAL_STOCK_VALUE || '0').replace(/,/g, '')) || 0,
        },
        manufacturer: brand,
        is_active: true,
        last_synced_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('products').upsert(transformed, {
        onConflict: 'irec_id',
        ignoreDuplicates: false,
      });

      if (error) {
        console.error(`   ❌ Error inserting ${name}:`, error.message);
        errors++;
      } else {
        console.log(`   ✅ [${category}] ${name} (₦${sellingPrice.toLocaleString()})`);
        inserted++;
      }
    } catch (err) {
      console.error(`   ❌ Unexpected error for product:`, err.message);
      errors++;
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log(`🌱 Seed Complete from stocks.json:`);
  console.log(`   ✅ ${inserted} products inserted/updated`);
  console.log(`   ❌ ${errors} errors`);
  console.log('═══════════════════════════════════════');
  process.exit(errors > 0 ? 1 : 0);
}

runSeed();

