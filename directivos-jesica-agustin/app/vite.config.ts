import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, '.'),
        // Tipos compartidos del sistema (ver shared/README.md en la raíz del repo)
        '@shared': path.resolve(__dirname, '../../shared'),
      },
    },
    server: {
      // Permite al servidor de desarrollo leer ../../shared
      fs: { allow: ['.', '../../shared'] },
      // /api va a la API local (npm run dev:api en la raíz del repo)
      proxy: { '/api': 'http://localhost:4000' },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
