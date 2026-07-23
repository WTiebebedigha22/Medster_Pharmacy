import { createClient } from '@supabase/supabase-js';
import config from '../config/index.js';

// Supabase client with service role for backend operations
const supabaseUrl = config.supabase.url;
const supabaseServiceKey = config.supabase.serviceRoleKey || config.supabase.anonKey;

if (!supabaseUrl || supabaseUrl.includes('your-project')) {
  console.warn('⚠️ Supabase URL not configured. Using placeholder.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Public client (for when we need anon access)
export const supabaseAnon = createClient(
  supabaseUrl,
  config.supabase.anonKey || 'anon-key-not-set'
);

export default supabase;
