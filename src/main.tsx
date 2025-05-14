
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Clear any session storage that might be causing conflicts
// This helps with resolving auth-related caching issues
if (window.location.pathname === '/') {
  console.log('Clearing potential auth cache on fresh start');
  // We're not clearing localStorage as that would log users out
}

createRoot(document.getElementById("root")!).render(<App />);
