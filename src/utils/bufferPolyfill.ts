
import { Buffer } from 'buffer';

// Make Buffer available globally
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

// Augment the Window interface
declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

export default Buffer;
