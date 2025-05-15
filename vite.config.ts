
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: 'buffer'
    },
  },
  define: {
    // Polyfill for Node.js globals
    'process.env': {},
    'global': 'globalThis',
    'process': {
      'browser': true,
      'env': {},
      'version': '',
      'nextTick': (cb: any) => setTimeout(cb, 0),
    },
    // Add Buffer polyfill properly
    'Buffer': 'Buffer',
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
}));
