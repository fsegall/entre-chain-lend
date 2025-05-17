import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

// Create a mock client if no environment variables are available
// This allows the app to at least render without crashing
export const supabase = !supabaseUrl || !supabaseAnonKey
  ? {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: () => Promise.resolve({ data: {}, error: new Error('Supabase is not connected') }),
        signUp: () => Promise.resolve({ data: {}, error: new Error('Supabase is not connected') }),
        signOut: () => Promise.resolve({ error: null }),
        signInWithOAuth: () => Promise.resolve({ data: {}, error: new Error('Supabase is not connected') }),
      },
    }
  : createClient(supabaseUrl, supabaseAnonKey);
