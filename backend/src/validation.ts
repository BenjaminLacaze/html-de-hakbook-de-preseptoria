// Validación de lo que mandan las apps (zod). Un error devuelve 400 con el detalle por campo.
import type { Context } from 'hono';
import { z } from 'zod';
import { AppError } from './errors.js';

export async function parseBody<T extends z.ZodType>(c: Context, schema: T): Promise<z.infer<T>> {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    throw new AppError('VALIDATION_ERROR', 'El cuerpo del pedido tiene que ser JSON.');
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new AppError(
      'VALIDATION_ERROR',
      'Hay datos inválidos.',
      result.error.issues.map((i) => ({ field: i.path.join('.') || undefined, message: i.message })),
    );
  }
  return result.data;
}
