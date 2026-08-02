import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const testSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('[Supabase] Connection error:', error.message);
      return false;
    }
    console.log('[Supabase] Connected successfully');
    return true;
  } catch (err) {
    console.error('[Supabase] Connection failed:', err.message);
    return false;
  }
};
