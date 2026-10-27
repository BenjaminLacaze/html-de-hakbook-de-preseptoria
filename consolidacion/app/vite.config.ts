import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Tipos, cliente de la API y diseño compartidos (ver shared/README.md en la raíz del repo)
      '@shared': path.resolve(import.meta.dirname, '../../shared'),
    },
  },
  server: {
    port: 5177,
    // Permite al servidor de desarrollo leer ../../shared
    fs: { allow: ['.', '../../shared'] },
    // /api va a la API local (npm run dev:api en la raíz del repo)
    proxy: { '/api': 'http://localhost:4000' },
  },
});
