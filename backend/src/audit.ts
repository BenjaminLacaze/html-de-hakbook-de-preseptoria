// Registro de auditoría: lo escribe solo el backend.
import type { Context } from 'hono';
import type { AuditAction } from '../../shared/types.js';
import { clientIp } from './auth/session.js';
import { prisma } from './db.js';
import type { Prisma } from './generated/prisma/client.js';

export async function audit(
  c: Context,
  actor: { id: string; firstName: string; lastName: string } | null,
  entry: {
    action: AuditAction;
    entity: string;
    entityId: string;
    summary: string;
    previousValue?: Prisma.InputJsonValue;
    newValue?: Prisma.InputJsonValue;
  },
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: actor?.id ?? null,
      userName: actor ? `${actor.firstName} ${actor.lastName}` : 'Sistema',
      ip: clientIp(c),
      ...entry,
    },
  });
}
