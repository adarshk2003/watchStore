import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Ensure built files are served with long‑term caching
  build: {
    // Vite already uses esbuild for minification; keep it fast
    minify: 'esbuild',
    // Generate source maps only in development
    sourcemap: mode !== 'production',
    rollupOptions: {
      output: {
        // Chunk naming for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
}))
