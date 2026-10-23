import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Tipos compartidos del sistema (ver shared/README.md en la raíz del repo)
      '@shared': fileURLToPath(new URL('../../shared', import.meta.url)),
    },
  },
  server: {
    // Permite al servidor de desarrollo leer ../../shared
    fs: { allow: ['.', '../../shared'] },
  },
})
