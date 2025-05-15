
// Import Buffer polyfill first - must be before any other imports
import './utils/bufferPolyfill';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Add a console log to verify Buffer is available
console.log("Buffer check in main.tsx:", typeof window.Buffer !== 'undefined' ? "Buffer is available" : "Buffer is NOT available");

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
