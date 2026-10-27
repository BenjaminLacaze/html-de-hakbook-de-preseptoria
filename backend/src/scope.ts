// Alcance de cada rol sobre las comisiones, y utilidades de fechas.
//
//   Directivo / Administrativo / Superadmin → todas las comisiones del ciclo vigente
//   Preceptor                               → las comisiones donde es el preceptor asignado
//   Profesor                                → las comisiones que dicta
//   Resto                                   → ninguna (alumnos acceden solo a lo propio, por otras rutas)
import type { Role } from '../../shared/types.js';
import type { CurrentUser } from './auth/middleware.js';
import { prisma } from './db.js';
import { AppError } from './errors.js';
import type { Prisma } from './generated/prisma/client.js';

export const MANAGEMENT_ROLES: Role[] = ['SUPER_ADMIN', 'DIRECTOR', 'ADMINISTRATIVE'];
export const isManagement = (u: CurrentUser) => u.roles.some((r) => MANAGEMENT_ROLES.includes(r));
export const hasRole = (u: CurrentUser, ...roles: Role[]) => u.roles.some((r) => roles.includes(r));

/** Ciclo lectivo vigente (o error claro si no hay ninguno). */
export async function activeCycle() {
  const cycle = await prisma.academicCycle.findFirst({ where: { status: 'ACTIVE' }, orderBy: { year: 'desc' } });
  if (!cycle) throw new AppError('CONFLICT', 'No hay un ciclo lectivo vigente cargado.');
  return cycle;
}

/** Filtro de comisiones que el usuario puede ver o cargar (ciclo vigente). */
export async function commissionScope(user: CurrentUser): Promise<Prisma.CommissionWhereInput> {
  const cycle = await activeCycle();
  const base: Prisma.CommissionWhereInput = { cycleId: cycle.id };
  if (isManagement(user)) return base;
  const or: Prisma.CommissionWhereInput[] = [];
  if (hasRole(user, 'PRECEPTOR')) or.push({ preceptorUserId: user.id });
  if (hasRole(user, 'TEACHER') && user.teacherId) or.push({ teachers: { some: { teacherId: user.teacherId } } });
  if (or.length === 0) return { id: { in: [] } }; // nada
  return { ...base, OR: or };
}

// ---- Fechas (columnas DATE: se guardan a las 00:00 UTC) ----

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseDate(s: string, field = 'date'): Date {
  if (!DATE_RE.test(s)) {
    throw new AppError('VALIDATION_ERROR', 'Fecha inválida (formato AAAA-MM-DD).', [{ field, message: 'Formato AAAA-MM-DD.' }]);
  }
  const d = new Date(`${s}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) throw new AppError('VALIDATION_ERROR', 'Fecha inválida.', [{ field, message: 'Fecha inexistente.' }]);
  return d;
}

export const toISODate = (d: Date) => d.toISOString().slice(0, 10);
export const toISO = (d?: Date | null) => (d ? d.toISOString() : undefined);
