
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Debug information for auth flow
console.log('App starting on path:', window.location.pathname);

// Clear any potential stale auth state on fresh start
// but don't clear localStorage as that would log users out
if (window.location.pathname === '/') {
  console.log('Fresh start detected - ready for authentication');
}

// Provide information about the auth flow stage
if (window.location.pathname === '/auth-callback') {
  console.log('Auth callback detected, preparing to process authentication result');
}

createRoot(document.getElementById("root")!).render(<App />);
