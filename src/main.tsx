
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Debug information for auth flow
console.log('App starting on path:', window.location.pathname);
console.log('Full URL:', window.location.href);

// Clear any potential stale auth state on fresh start
// but don't clear localStorage as that would log users out
if (window.location.pathname === '/') {
  console.log('Fresh start detected - ready for authentication');
}

// Log OAuth state for debugging
if (window.location.pathname === '/auth-callback') {
  console.log('Auth callback detected - location hash:', window.location.hash);
  console.log('Auth callback detected - location search:', window.location.search);
  console.log('Auth callback detected - preparing to process authentication result');
}

createRoot(document.getElementById("root")!).render(<App />);
