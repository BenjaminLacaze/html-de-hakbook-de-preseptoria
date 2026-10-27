// Conversión de filas de la base al formato de la API (shared/types.ts).
import type { CommissionView, ScheduleSlot, Student, Teacher } from '../../shared/types.js';
import type { Prisma } from './generated/prisma/client.js';
import { toISODate } from './scope.js';

export const commissionInclude = {
  subject: { include: { plan: { include: { career: true } } } },
  teachers: { include: { teacher: true }, orderBy: { position: 'asc' } },
  _count: { select: { enrollments: { where: { condition: { not: 'DROPPED' } } } } },
} as const satisfies Prisma.CommissionInclude;

type CommissionRow = Prisma.CommissionGetPayload<{ include: typeof commissionInclude }>;

export function commissionView(c: CommissionRow): CommissionView {
  return {
    id: c.id,
    code: c.code,
    cycleId: c.cycleId,
    subjectId: c.subjectId,
    period: c.period,
    shift: c.shift,
    teacherIds: c.teachers.map((t) => t.teacherId),
    preceptorUserId: c.preceptorUserId ?? undefined,
    schedule: (c.schedule ?? []) as unknown as ScheduleSlot[],
    capacity: c.capacity ?? undefined,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    subjectName: c.subject.name,
    subjectYear: c.subject.year,
    careerId: c.subject.plan.careerId,
    careerName: c.subject.plan.career.name,
    teacherNames: c.teachers.map((t) => `${t.teacher.firstName} ${t.teacher.lastName}`),
    studentCount: c._count.enrollments,
  };
}

export function studentDTO(s: Prisma.StudentGetPayload<object>): Student {
  return {
    id: s.id,
    userId: s.userId,
    fileNumber: s.fileNumber,
    dni: s.dni,
    firstName: s.firstName,
    lastName: s.lastName,
    email: s.email,
    phone: s.phone ?? undefined,
    careerId: s.careerId,
    planId: s.planId,
    admissionDate: toISODate(s.admissionDate),
    status: s.status,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export function teacherDTO(t: Prisma.TeacherGetPayload<object>): Teacher {
  return {
    id: t.id,
    userId: t.userId,
    fileNumber: t.fileNumber,
    dni: t.dni,
    firstName: t.firstName,
    lastName: t.lastName,
    email: t.email,
    phone: t.phone ?? undefined,
    title: t.title ?? undefined,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}
