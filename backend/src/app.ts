// API del Sistema de Gestión ISFDyT N.° 26.
// Se publica en /api/v1 del mismo dominio que las apps (api/index.ts en Vercel, src/dev.ts en local).
import { randomUUID } from 'node:crypto';
import { Hono } from 'hono';
import type { AppEnv } from './auth/middleware.js';
import { AppError } from './errors.js';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';

export const app = new Hono<AppEnv>().basePath('/api/v1');

app.use(async (c, next) => {
  c.set('traceId', randomUUID().slice(0, 8));
  await next();
  c.header('Cache-Control', 'no-store');
});

// Las mutaciones solo aceptan JSON: junto con la cookie SameSite=Lax, frena pedidos
// armados desde otros sitios (CSRF).
app.use(async (c, next) => {
  const method = c.req.method;
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method) && c.req.header('content-length') !== '0';
  if (hasBody && c.req.header('content-type') && !c.req.header('content-type')!.includes('application/json')) {
    throw new AppError('VALIDATION_ERROR', 'El pedido tiene que ser JSON.');
  }
  await next();
});

app.get('/health', (c) => c.json({ ok: true, time: new Date().toISOString() }));
app.route('/auth', authRoutes);
app.route('/users', userRoutes);

app.notFound((c) => c.json(new AppError('NOT_FOUND', 'Ruta inexistente.').toBody(c.get('traceId')), 404));

app.onError((err, c) => {
  const traceId = c.get('traceId');
  if (err instanceof AppError) {
    return c.json(err.toBody(traceId), err.status as 400);
  }
  console.error(`[${traceId}]`, err);
  return c.json(
    new AppError('INTERNAL_ERROR', 'Ocurrió un error inesperado. Probá de nuevo.').toBody(traceId),
    500,
  );
});
