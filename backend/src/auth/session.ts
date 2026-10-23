// Sesiones por cookie HttpOnly.
//
// El navegador guarda un token aleatorio en la cookie `sga_session`; la base guarda solo su
// hash. Todas las apps viven en el mismo dominio, así que una sola cookie sirve para las 4.
import { createHash, randomBytes } from 'node:crypto';
import type { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { prisma } from '../db.js';

export const SESSION_COOKIE = 'sga_session';
const TTL_HOURS = Number(process.env.SESSION_TTL_HOURS ?? 12);
/** Cada cuánto se actualiza "última actividad" (para no escribir en cada pedido). */
const TOUCH_EVERY_MS = 5 * 60 * 1000;

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

/** En Vercel (https) la cookie es Secure; en local (http://localhost) no hace falta. */
const isSecure = () => Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';

export async function createSession(c: Context, userId: string): Promise<void> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + TTL_HOURS * 3600 * 1000);
  await prisma.authSession.create({
    data: {
      id: hashToken(token),
      userId,
      expiresAt,
      userAgent: c.req.header('user-agent')?.slice(0, 300),
      ip: clientIp(c),
    },
  });
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isSecure(),
    sameSite: 'Lax',
    path: '/',
    maxAge: TTL_HOURS * 3600,
  });
}

/** Devuelve la sesión válida del pedido (con su usuario) o null. */
export async function readSession(c: Context) {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return null;
  const id = hashToken(token);
  const session = await prisma.authSession.findUnique({
    where: { id },
    include: { user: { include: { student: { select: { id: true } }, teacher: { select: { id: true } } } } },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now() || session.user.status !== 'ACTIVE') {
    await prisma.authSession.delete({ where: { id } }).catch(() => undefined);
    return null;
  }
  if (Date.now() - session.lastSeenAt.getTime() > TOUCH_EVERY_MS) {
    await prisma.authSession.update({ where: { id }, data: { lastSeenAt: new Date() } });
  }
  return session;
}

export async function destroySession(c: Context): Promise<void> {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) {
    await prisma.authSession.delete({ where: { id: hashToken(token) } }).catch(() => undefined);
  }
  deleteCookie(c, SESSION_COOKIE, { path: '/', secure: isSecure() });
}

/** Cierra todas las sesiones de un usuario, salvo (opcionalmente) la actual. */
export async function destroyUserSessions(userId: string, exceptCurrentOf?: Context): Promise<void> {
  const token = exceptCurrentOf ? getCookie(exceptCurrentOf, SESSION_COOKIE) : undefined;
  await prisma.authSession.deleteMany({
    where: { userId, ...(token ? { NOT: { id: hashToken(token) } } : {}) },
  });
}

export function clientIp(c: Context): string | undefined {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || c.req.header('x-real-ip') || undefined;
}
