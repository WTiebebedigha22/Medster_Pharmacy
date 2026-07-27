// =====================================================
// Seed sample orders for admin dashboard visibility
// =====================================================
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function seedSampleData() {
  console.log('🔧 Seeding sample data for admin dashboard...\n');

  // 1. Check if admin user exists
  const { data: adminUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'admin@medster.com')
    .single();

  // 2. Check if we have a customer user, or create a dummy one
  let customerId;
  const { data: existingCustomer } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'customer')
    .limit(1);

  if (existingCustomer?.length > 0) {
    customerId = existingCustomer[0].id;
    console.log('👤 Found existing customer:', customerId);
  } else {
    console.log('👤 Creating sample customer...');
    const { data: newUser } = await supabase
      .from('users')
      .insert({
        email: 'customer@test.com',
        password_hash: '$2b$12$u4gu5pw50m/Y8xqfLisUnenv5VILmtOiwsTadh0eLiOf56NWIHHv2',
        full_name: 'John Doe',
        phone: '+234 800 000 0001',
        role: 'customer',
        is_active: true,
      })
      .select('id')
      .single();

    if (newUser) {
      customerId = newUser.id;
      console.log('✅ Created sample customer:', customerId);
    } else {
      console.log('⚠️  Using admin as customer fallback');
      customerId = adminUser?.id;
    }
  }

  // 3. Get some products for orders
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price')
    .limit(10);

  if (!products?.length) {
    console.log('⚠️  No products found, skipping order seeding');
    return;
  }

  // 4. Create sample orders with different statuses
  const statuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
  const ordersData = [];

  for (let i = 0; i < 12; i++) {
    const status = statuses[i % statuses.length];
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const items = [];
    let subtotal = 0;

    for (let j = 0; j < itemCount; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const qty = Math.floor(Math.random() * 3) + 1;
      const price = parseFloat(product.price);
      items.push({
        product_id: product.id,
        product_name: product.name,
        price,
        quantity: qty,
        subtotal: price * qty,
        is_rx: false,
      });
      subtotal += price * qty;
    }

    const deliveryFee = subtotal >= 10000 ? 0 : 1500;
    const total = subtotal + deliveryFee;

    const orderNumber = `MED-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    ordersData.push({
      user_id: customerId,
      order_number: orderNumber,
      status,
      subtotal,
      delivery_fee: deliveryFee,
      discount: 0,
      tax: 0,
      total,
      payment_method: 'card',
      notes: null,
      created_at: new Date(Date.now() - i * 86400000 * 2).toISOString(), // Spread over days
    });
  }

  // Insert orders
  let ordersCreated = 0;
  for (const order of ordersData) {
    const { data: newOrder, error } = await supabase
      .from('orders')
      .insert(order)
      .select('id')
      .single();

    if (error) {
      console.error(`❌ Failed to create order: ${error.message}`);
    } else {
      ordersCreated++;
    }
  }

  console.log(`✅ ${ordersCreated} sample orders created`);
  console.log('\n📊 Admin Dashboard will now show:');
  console.log('   - Total Orders');
  console.log('   - Pending Orders');
  console.log('   - Total Products: 469');
  console.log('   - Total Revenue');
  console.log('   - Recent Orders');
  console.log('\n✨ Sample data seeding complete!');
}

seedSampleData().catch(err => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});
