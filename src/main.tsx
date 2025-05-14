
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Debug information for auth flow
console.log('App starting on path:', window.location.pathname);
console.log('Full URL:', window.location.href);

// Help detect and fix redirect loops by logging auth state
if (window.location.pathname === '/auth-callback') {
  console.log('Auth callback detected - location hash:', window.location.hash);
  console.log('Auth callback detected - location search:', window.location.search);
  console.log('Auth callback detected - preparing to process authentication result');
  
  // Allow only one processing of each auth callback to prevent loops
  const callbackCount = parseInt(sessionStorage.getItem('auth_callback_count') || '0', 10);
  console.log('Current auth callback count:', callbackCount);
  sessionStorage.setItem('auth_callback_count', String(callbackCount + 1));
  
  // If we've processed too many callbacks in a short time, there might be a loop
  if (callbackCount > 5) {
    console.warn('Potential redirect loop detected! Clearing auth state...');
    sessionStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('auth_callback_count');
  }
}

// Clear auth callback processing flag on fresh start at root
if (window.location.pathname === '/') {
  console.log('Fresh start at root - resetting auth callback state');
  sessionStorage.removeItem('auth_callback_processed');
  sessionStorage.removeItem('auth_callback_count');
}

createRoot(document.getElementById("root")!).render(<App />);
