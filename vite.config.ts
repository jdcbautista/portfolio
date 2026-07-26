/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
// base is '/portfolio/' for the GitHub Pages project site, '/' for local dev.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/portfolio/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    // Split long-lived vendor code out of the app bundle so it caches independently.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          // Order matters: react-router paths also contain "react".
          if (id.includes('react-router')) return 'router-vendor'
          // three + r3f + drei are large and long-lived — cache them apart.
          if (
            id.includes('/three/') ||
            id.includes('@react-three') ||
            id.includes('/troika') ||
            id.includes('/its-fine/')
          ) {
            return 'three-vendor'
          }
          if (id.includes('/react/') || id.includes('/react-dom/')) {
            return 'react-vendor'
          }
          return undefined
        },
      },
    },
  },
}))
