// Entrada de la API en Vercel. vercel.json manda todo /api/* a esta función.
// La lógica está en backend/src/app.ts (la misma que corre en local con npm run dev:api).
import { handle } from 'hono/vercel';
import { app } from '../backend/src/app.js';

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
