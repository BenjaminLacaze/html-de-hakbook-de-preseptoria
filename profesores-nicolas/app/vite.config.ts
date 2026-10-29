import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      // Tipos compartidos del sistema (ver shared/README.md en la raíz del repo)
      '@shared': fileURLToPath(new URL('../../shared', import.meta.url)),
    },
  },
  server: {
    // Permite al servidor de desarrollo leer ../../shared
    fs: { allow: ['.', '../../shared'] },
    // /api va a la API local (npm run dev:api en la raíz del repo)
    proxy: { '/api': 'http://localhost:4000' },
    port: 5174,
  },
})
