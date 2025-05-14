
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with environment variables
// These values are automatically injected by the Lovable Supabase integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Make sure you have connected your Supabase project.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

