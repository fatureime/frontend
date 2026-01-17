import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      usePolling: true
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  optimizeDeps: {
    include: ['@emotion/react', '@emotion/styled'],
    force: true
  },
  resolve: {
    dedupe: ['@emotion/react', '@emotion/styled', 'react', 'react-dom']
  }
})
