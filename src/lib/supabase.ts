
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with environment variables
// These values are now automatically injected since you've connected your Supabase project
const supabaseUrl = "https://gkikgsfbwhlzassknnun.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdraWtnc2Zid2hsemFzc2tubnVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMzQ3NTMsImV4cCI6MjA2MjgxMDc1M30.mxBjQwgBxljnf_8HBe8Zc9VTuANvKIZ0-7fj6oCv9cQ";

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
      },
    }
  : createClient(supabaseUrl, supabaseAnonKey);
