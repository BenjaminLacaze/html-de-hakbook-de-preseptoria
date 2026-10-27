// Notificaciones por usuario. Las genera el backend cuando pasa algo que le importa a alguien
// (justificación resuelta, respuesta a un reclamo, mensaje nuevo, tema moderado…).
// Si falla, no frena la operación principal: se registra y sigue.
import type { NotificationType } from '../../shared/types.js';
import { prisma } from './db.js';

export async function notify(
  userIds: (string | null | undefined)[],
  n: { type: NotificationType; text: string; details?: string; link?: string },
): Promise<void> {
  const ids = [...new Set(userIds.filter((x): x is string => Boolean(x)))];
  if (ids.length === 0) return;
  try {
    await prisma.notification.createMany({ data: ids.map((userId) => ({ userId, ...n })) });
  } catch (e) {
    console.error('No se pudo crear la notificación:', e);
  }
}
