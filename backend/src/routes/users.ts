// /users: cuentas de ingreso. Se gestionan desde el panel de Directivos.
//
// Quién puede asignar qué rol: ASSIGNABLE_ROLES en shared/types.ts.
import { Hono } from 'hono';
import { z } from 'zod';
import {
  ASSIGNABLE_ROLES,
  ROLES,
  USER_STATUSES,
  type Role,
  type UserDTO,
  type UserWithTemporaryPassword,
} from '../../../shared/types.js';
import { audit } from '../audit.js';
import { requireAuth, requireRoles, type AppEnv, type CurrentUser } from '../auth/middleware.js';
import { generateTemporaryPassword, hashPassword } from '../auth/password.js';
import { destroyUserSessions } from '../auth/session.js';
import { prisma } from '../db.js';
import { AppError, forbidden, notFound } from '../errors.js';
import type { Prisma } from '../generated/prisma/client.js';
import { parseBody } from '../validation.js';

const MANAGERS: Role[] = ['SUPER_ADMIN', 'DIRECTOR', 'ADMINISTRATIVE'];

const userInclude = { student: { select: { id: true } }, teacher: { select: { id: true } } } as const;
type UserRow = Prisma.UserGetPayload<{ include: typeof userInclude }>;

function toDTO(u: UserRow): UserDTO {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    roles: u.roles,
    status: u.status,
    lastLoginAt: u.lastLoginAt?.toISOString(),
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
    mustChangePassword: u.mustChangePassword,
    studentId: u.student?.id ?? null,
    teacherId: u.teacher?.id ?? null,
  };
}

/** Roles que el usuario actual puede asignar (unión de lo que permite cada uno de sus roles). */
function assignableBy(actor: CurrentUser): Set<Role> {
  return new Set(actor.roles.flatMap((r) => ASSIGNABLE_ROLES[r] ?? []));
}

function checkCanAssign(actor: CurrentUser, roles: Role[]) {
  const allowed = assignableBy(actor);
  const denied = roles.filter((r) => !allowed.has(r));
  if (denied.length) throw forbidden(`No podés asignar estos roles: ${denied.join(', ')}.`);
}

/** Para tocar una cuenta, el actor tiene que poder asignar todos los roles que esa cuenta ya tiene. */
function checkCanManage(actor: CurrentUser, target: { roles: Role[] }) {
  const allowed = assignableBy(actor);
  if (!target.roles.every((r) => allowed.has(r))) throw forbidden('No podés modificar esta cuenta.');
}

const name = z.string().trim().min(1, 'Obligatorio.').max(80);
const roles = z.array(z.enum(ROLES)).min(1, 'Elegí al menos un rol.');

export const userRoutes = new Hono<AppEnv>()
  .use(requireAuth, requireRoles(...MANAGERS))

  .get('/', async (c) => {
    const q = c.req.query();
    const where: Prisma.UserWhereInput = {};
    if (q.role && (ROLES as readonly string[]).includes(q.role)) where.roles = { has: q.role as Role };
    if (q.status && (USER_STATUSES as readonly string[]).includes(q.status)) where.status = q.status as never;
    if (q.search) {
      const s = q.search.trim();
      where.OR = [
        { email: { contains: s, mode: 'insensitive' } },
        { firstName: { contains: s, mode: 'insensitive' } },
        { lastName: { contains: s, mode: 'insensitive' } },
      ];
    }
    const users = await prisma.user.findMany({
      where,
      include: userInclude,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      take: 500,
    });
    return c.json(users.map(toDTO));
  })

  .post('/', async (c) => {
    const actor = c.get('user');
    const body = await parseBody(
      c,
      z.object({
        email: z.string().trim().toLowerCase().email('Email inválido.'),
        firstName: name,
        lastName: name,
        roles,
        studentId: z.string().uuid().optional(),
        teacherId: z.string().uuid().optional(),
      }),
    );
    checkCanAssign(actor, body.roles);

    if (await prisma.user.findUnique({ where: { email: body.email } })) {
      throw new AppError('CONFLICT', 'Ya existe una cuenta con ese email.', [
        { field: 'email', message: 'Ya existe una cuenta con ese email.' },
      ]);
    }
    if (body.studentId) {
      const s = await prisma.student.findUnique({ where: { id: body.studentId } });
      if (!s) throw notFound('No existe el alumno indicado.');
      if (s.userId) throw new AppError('CONFLICT', 'Ese alumno ya tiene una cuenta.');
    }
    if (body.teacherId) {
      const t = await prisma.teacher.findUnique({ where: { id: body.teacherId } });
      if (!t) throw notFound('No existe el docente indicado.');
      if (t.userId) throw new AppError('CONFLICT', 'Ese docente ya tiene una cuenta.');
    }

    const temporaryPassword = generateTemporaryPassword();
    const user = await prisma.user.create({
      data: {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        roles: [...new Set(body.roles)],
        passwordHash: await hashPassword(temporaryPassword),
        mustChangePassword: true,
        createdById: actor.id,
        ...(body.studentId ? { student: { connect: { id: body.studentId } } } : {}),
        ...(body.teacherId ? { teacher: { connect: { id: body.teacherId } } } : {}),
      },
      include: userInclude,
    });
    await audit(c, actor, {
      action: 'CREATE',
      entity: 'User',
      entityId: user.id,
      summary: `Alta de cuenta ${user.email} (${user.roles.join(', ')})`,
      newValue: { email: user.email, roles: user.roles },
    });
    const res: UserWithTemporaryPassword = { user: toDTO(user), temporaryPassword };
    return c.json(res, 201);
  })

  .patch('/:id', async (c) => {
    const actor = c.get('user');
    const body = await parseBody(
      c,
      z
        .object({ firstName: name, lastName: name, roles, status: z.enum(USER_STATUSES) })
        .partial()
        .refine((b) => Object.keys(b).length > 0, 'No hay cambios.'),
    );
    const target = await prisma.user.findUnique({ where: { id: c.req.param('id') } });
    if (!target) throw notFound('No existe la cuenta.');
    checkCanManage(actor, target);
    if (body.roles) checkCanAssign(actor, body.roles);
    if (target.id === actor.id && (body.status === 'INACTIVE' || body.roles)) {
      throw forbidden('No podés desactivar tu propia cuenta ni cambiar tus roles.');
    }

    const updated = await prisma.user.update({
      where: { id: target.id },
      data: { ...body, ...(body.roles ? { roles: [...new Set(body.roles)] } : {}) },
      include: userInclude,
    });
    if (body.status === 'INACTIVE') await destroyUserSessions(target.id);
    await audit(c, actor, {
      action: body.status && body.status !== target.status ? 'STATUS_CHANGE' : 'UPDATE',
      entity: 'User',
      entityId: target.id,
      summary: `Modificación de cuenta ${target.email}`,
      previousValue: { firstName: target.firstName, lastName: target.lastName, roles: target.roles, status: target.status },
      newValue: body,
    });
    return c.json(toDTO(updated));
  })

  .post('/:id/reset-password', async (c) => {
    const actor = c.get('user');
    const target = await prisma.user.findUnique({ where: { id: c.req.param('id') } });
    if (!target) throw notFound('No existe la cuenta.');
    checkCanManage(actor, target);

    const temporaryPassword = generateTemporaryPassword();
    const updated = await prisma.user.update({
      where: { id: target.id },
      data: {
        passwordHash: await hashPassword(temporaryPassword),
        mustChangePassword: true,
        failedLoginCount: 0,
        lockedUntil: null,
      },
      include: userInclude,
    });
    await destroyUserSessions(target.id);
    await audit(c, actor, {
      action: 'UPDATE',
      entity: 'User',
      entityId: target.id,
      summary: `Blanqueo de contraseña de ${target.email}`,
    });
    const res: UserWithTemporaryPassword = { user: toDTO(updated), temporaryPassword };
    return c.json(res);
  });
