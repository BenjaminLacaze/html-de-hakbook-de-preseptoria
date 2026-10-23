// Servidor local de la API: npm run dev:api  →  http://localhost:4000/api/v1
// Las apps (npm run dev en cada una) le mandan /api por el proxy de Vite.
import 'dotenv/config';
import { serve } from '@hono/node-server';

const { app } = await import('./app.js');
const port = Number(process.env.API_PORT ?? 4000);

serve({ fetch: app.fetch, port }, () => {
  console.log(`API lista en http://localhost:${port}/api/v1  (salud: /api/v1/health)`);
});
