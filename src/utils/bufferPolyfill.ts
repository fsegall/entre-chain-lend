
import { Buffer } from 'buffer';

// Make Buffer available globally
window.Buffer = window.Buffer || Buffer;

// Augment the Window interface
declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

export default Buffer;
