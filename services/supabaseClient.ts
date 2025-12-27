import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 * 
 * SECURITY NOTE:
 * - Uses environment variables (VITE_* prefix for frontend access)
 * - Anon key is safe to expose (it's public by design)
 * - RLS policies protect your data
 * - Never expose service_role key in frontend
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.\n' +
    'Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});