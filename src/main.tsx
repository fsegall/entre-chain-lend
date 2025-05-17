// Import Buffer polyfill first - must be before any other imports
import './utils/bufferPolyfill';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Verify Buffer is available with all needed methods
console.log("Buffer check in main.tsx:", typeof window.Buffer !== 'undefined' ? "Buffer is available" : "Buffer is NOT available");
console.log("Buffer.from check:", typeof window.Buffer?.from === 'function' ? "Buffer.from is available" : "Buffer.from is NOT available");
console.log("Buffer instanceof check:", window.Buffer ? "Buffer constructor exists" : "Buffer constructor missing");

console.log("React root rendering/re-mounting");

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
