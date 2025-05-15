
import { Buffer } from 'buffer';

// Make Buffer available globally with all its methods
if (typeof window !== 'undefined') {
  // Create a complete Buffer implementation
  window.Buffer = Buffer;
  
  // Double-check that Buffer.from exists
  console.log("Buffer polyfill loaded. Buffer.from available:", 
              typeof window.Buffer?.from === 'function' ? "Yes" : "No");
}

// Augment the Window interface
declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

export default Buffer;
