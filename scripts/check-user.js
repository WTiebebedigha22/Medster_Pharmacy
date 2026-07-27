// =====================================================
// Check if admin user exists in Supabase
// =====================================================
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('🔍 Checking users table...\n');

  // List all users
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, role, is_active');

  if (error) {
    console.error('❌ Error querying users:', error.message);
    console.log('\n   This likely means RLS is blocking the query.');
    console.log('   Please run the SQL in Supabase SQL Editor to fix this.\n');
    
    // Check if table exists at all
    const { error: tableCheck } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
      
    if (tableCheck && tableCheck.message?.includes('does not exist')) {
      console.log('❌ The "users" table does not exist yet.');
      console.log('   Please run setup-full.sql in Supabase SQL Editor first.');
    }
    process.exit(1);
  }

  console.log(`✅ Found ${users.length} user(s):`);
  users.forEach(u => {
    console.log(`   • ${u.email} — Role: ${u.role} — Active: ${u.is_active}`);
  });

  const admin = users.find(u => u.email === 'admin@medster.com');
  if (admin) {
    console.log('\n✅ Admin user exists and is ready!');
    console.log('   Login with: admin@medster.com / admin123');
  } else {
    console.log('\n❌ Admin user not found. Run the seed SQL to create it.');
  }
}

check();

