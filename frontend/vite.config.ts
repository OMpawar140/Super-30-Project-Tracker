import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), './src'),
    },
  },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Explicitly tell Vite to ignore TypeScript errors during the build
    typescript: {
      ignoreBuildErrors: true,
    },
  },
})
