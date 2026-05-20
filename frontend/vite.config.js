// frontend/vite.config.js contains project logic or configuration with inline comments for maintainability.
// Imports vite so this file can use its exported functionality.
import { defineConfig } from 'vite'
// Imports @vitejs/plugin-react so this file can use its exported functionality.
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.jsx',
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/**/*.test.{js,jsx}', 'src/test/**']
    }
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/admin/': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/db-test': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})
