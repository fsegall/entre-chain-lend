
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
    'global': 'window',
    'process': {
      'browser': true,
      'env': {},
      'version': '',
      'nextTick': (cb: any) => setTimeout(cb, 0),
    },
    // Make sure Buffer is properly defined globally
    'global.Buffer': ['buffer', 'Buffer'],
    'Buffer': ['buffer', 'Buffer'],
  },
  optimizeDeps: {
    include: ['buffer'],
    esbuildOptions: {
      define: {
        global: 'window',
      },
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  }
}));
