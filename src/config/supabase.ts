// ═══════════════════════════════════════════════════════════════════════
// SUPABASE CONFIG
// ═══════════════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const handleSupabaseError = (error: any): never => {
  console.error('Supabase error:', error);
  throw new Error(error.message || 'Une erreur est survenue');
};
