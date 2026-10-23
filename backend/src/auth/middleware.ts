// Protección de rutas: exige sesión y, si corresponde, ciertos roles.
// El usuario y sus roles salen SIEMPRE de la sesión, nunca de lo que mande la app.
import { createMiddleware } from 'hono/factory';
import type { Role } from '../../../shared/types.js';
import { forbidden, unauthenticated } from '../errors.js';
import { readSession } from './session.js';

export interface CurrentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  mustChangePassword: boolean;
  studentId: string | null;
  teacherId: string | null;
}

export type AppEnv = { Variables: { user: CurrentUser; traceId: string } };

/**
 * Exige sesión. Si la cuenta tiene que cambiar la contraseña, solo deja pasar a
 * /auth/me, /auth/logout y /auth/change-password.
 */
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const session = await readSession(c);
  if (!session) throw unauthenticated();
  const u = session.user;
  c.set('user', {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    roles: u.roles,
    mustChangePassword: u.mustChangePassword,
    studentId: u.student?.id ?? null,
    teacherId: u.teacher?.id ?? null,
  });
  const allowedWhilePending = ['/auth/me', '/auth/logout', '/auth/change-password'];
  if (u.mustChangePassword && !allowedWhilePending.some((p) => c.req.path.endsWith(p))) {
    throw forbidden('Tenés que cambiar tu contraseña antes de continuar.');
  }
  await next();
});

/** Exige al menos uno de los roles indicados (usar después de requireAuth). */
export const requireRoles = (...roles: Role[]) =>
  createMiddleware<AppEnv>(async (c, next) => {
    if (!c.get('user').roles.some((r) => roles.includes(r))) throw forbidden();
    await next();
  });
