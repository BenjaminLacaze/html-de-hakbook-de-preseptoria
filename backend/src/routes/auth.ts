// /auth: ingreso, salida, sesión actual y cambio de contraseña.
import { Hono } from 'hono';
import { z } from 'zod';
import { MIN_PASSWORD_LENGTH, type AuthMe } from '../../../shared/types.js';
import { audit } from '../audit.js';
import { requireAuth, type AppEnv, type CurrentUser } from '../auth/middleware.js';
import { DUMMY_HASH, hashPassword, verifyPassword } from '../auth/password.js';
import { createSession, destroySession, destroyUserSessions } from '../auth/session.js';
import { prisma } from '../db.js';
import { AppError } from '../errors.js';
import { parseBody } from '../validation.js';

/** Intentos fallidos seguidos antes de bloquear la cuenta. */
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

const invalidCredentials = () => new AppError('UNAUTHENTICATED', 'Email o contraseña incorrectos.');

async function buildAuthMe(user: CurrentUser): Promise<AuthMe> {
  const cycle = await prisma.academicCycle.findFirst({ where: { status: 'ACTIVE' }, select: { id: true } });
  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
    },
    studentId: user.studentId ?? undefined,
    teacherId: user.teacherId ?? undefined,
    activeCycleId: cycle?.id ?? null,
    mustChangePassword: user.mustChangePassword,
  };
}

export const authRoutes = new Hono<AppEnv>()
  .post('/login', async (c) => {
    const body = await parseBody(
      c,
      z.object({ email: z.string().trim().toLowerCase().email('Email inválido.'), password: z.string().min(1) }),
    );
    const user = await prisma.user.findUnique({
      where: { email: body.email },
      include: { student: { select: { id: true } }, teacher: { select: { id: true } } },
    });

    if (!user) {
      await verifyPassword(body.password, DUMMY_HASH); // mismo tiempo de respuesta exista o no el email
      throw invalidCredentials();
    }
    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw new AppError(
        'TOO_MANY_ATTEMPTS',
        `Demasiados intentos fallidos. Probá de nuevo en ${LOCK_MINUTES} minutos o pedí que te blanqueen la contraseña.`,
      );
    }

    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok || user.status !== 'ACTIVE') {
      if (!ok) {
        const failed = user.failedLoginCount + 1;
        await prisma.user.update({
          where: { id: user.id },
          data:
            failed >= MAX_FAILED_ATTEMPTS
              ? { failedLoginCount: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60_000) }
              : { failedLoginCount: failed },
        });
      }
      throw invalidCredentials();
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    });
    await createSession(c, user.id);
    await audit(c, user, { action: 'LOGIN', entity: 'User', entityId: user.id, summary: 'Inicio de sesión' });

    return c.json(
      await buildAuthMe({
        ...user,
        studentId: user.student?.id ?? null,
        teacherId: user.teacher?.id ?? null,
      }),
    );
  })

  .post('/logout', async (c) => {
    await destroySession(c);
    return c.body(null, 204);
  })

  .get('/me', requireAuth, async (c) => c.json(await buildAuthMe(c.get('user'))))

  .post('/change-password', requireAuth, async (c) => {
    const body = await parseBody(
      c,
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z
          .string()
          .min(MIN_PASSWORD_LENGTH, `La contraseña nueva tiene que tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`),
      }),
    );
    if (body.currentPassword === body.newPassword) {
      throw new AppError('VALIDATION_ERROR', 'La contraseña nueva tiene que ser distinta de la actual.');
    }
    const me = c.get('user');
    const user = await prisma.user.findUniqueOrThrow({ where: { id: me.id } });
    if (!(await verifyPassword(body.currentPassword, user.passwordHash))) {
      throw new AppError('VALIDATION_ERROR', 'La contraseña actual no es correcta.', [
        { field: 'currentPassword', message: 'La contraseña actual no es correcta.' },
      ]);
    }
    await prisma.user.update({
      where: { id: me.id },
      data: { passwordHash: await hashPassword(body.newPassword), mustChangePassword: false },
    });
    // Por seguridad, se cierran las otras sesiones abiertas de la cuenta.
    await destroyUserSessions(me.id, c);
    await audit(c, me, { action: 'UPDATE', entity: 'User', entityId: me.id, summary: 'Cambio de contraseña' });
    return c.json(await buildAuthMe({ ...me, mustChangePassword: false }));
  });
