// =====================================================
// Medster Pharmacy - Admin Account Seeder
// =====================================================
// Run this with: node scripts/seed-admin.js
// It will create the admin account using Supabase service role key (bypasses RLS)
// =====================================================

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Use service role key to bypass RLS
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is not set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seedAdmin() {
  console.log('🔧 Medster Pharmacy - Admin Account Seeder');
  console.log('==========================================');
  console.log(`📡 Connecting to: ${supabaseUrl}`);
  console.log('');

  // Check if admin already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('email', 'admin@medster.com')
    .maybeSingle();

  if (existing) {
    console.log('✅ Admin user already exists, updating password...');
  } else {
    console.log('📝 Creating new admin user...');
  }

  // Hash password
  const passwordHash = await bcrypt.hash('admin123', 12);
  console.log('🔑 Password hash generated');

  // Upsert - service role key bypasses RLS
  const { data: user, error } = await supabase
    .from('users')
    .upsert({
      email: 'admin@medster.com',
      password_hash: passwordHash,
      full_name: 'Medster Admin',
      phone: '+234 800 000 0000',
      role: 'admin',
      is_active: true,
      email_verified: true,
    }, { onConflict: 'email', ignoreDuplicates: false })
    .select('id, email, full_name, role')
    .single();

  if (error) {
    console.error('❌ Failed:', error.message);
    console.error('');
    console.error('   Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env');
    console.error('   Or run the setup-full.sql in Supabase SQL Editor instead.');
    process.exit(1);
  }

  console.log(`✅ Admin ready: ${user.email} (${user.role})`);

  // Add admin_roles entry
  const { error: roleError } = await supabase
    .from('admin_roles')
    .upsert({
      user_id: user.id,
      role_label: 'super_admin',
      permissions: [
        'products.manage', 'orders.manage', 'users.manage',
        'admins.manage', 'prescriptions.manage', 'coupons.manage',
        'reports.view', 'settings.manage', 'audit.view',
        'inventory.manage', 'categories.manage'
      ],
    }, { onConflict: 'user_id' });

  if (roleError) {
    console.log('⚠️  admin_roles not configured (table may not exist):', roleError.message);
  } else {
    console.log('✅ Permissions granted');
  }

  console.log('');
  console.log('==========================================');
  console.log('🚀 Login: admin@medster.com / admin123');
  console.log('==========================================');
}

seedAdmin().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

