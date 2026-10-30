// Estructura académica y personas: alta, edición y listados.
// Estructura académica: gestión global por Dirección/Administración/Superadmin.
// Preceptoría gestiona fichas e inscripciones de alumnos en alcance institucional; docentes y
// preceptores conservan el alcance asignado para comisiones y operación de cursada.
//
//   POST/PATCH /structure/careers[/:id]        POST /structure/plans
//   POST/PATCH /structure/subjects[/:id]       POST/PATCH /structure/cycles[/:id]  (activar = cierra el anterior)
//   GET/POST/PATCH /structure/commissions[/:id]
//   GET/POST/PATCH /structure/students[/:id]   GET/PUT /structure/students/:id/sensitive
//   GET/POST/PATCH /structure/teachers[/:id]
//   GET /structure/enrollments?commissionId|studentId   POST /structure/enrollments   PATCH|DELETE /structure/enrollments/:id
import { Hono } from 'hono';
import { z } from 'zod';
import {
  ACADEMIC_PERIODS,
  CYCLE_STATUSES,
  ENROLLMENT_CONDITIONS,
  SHIFTS,
  STUDENT_STATUSES,
  TEACHER_STATUSES,
  type Enrollment,
  type StudentSensitiveData,
} from '../../../shared/types.js';
import { audit } from '../audit.js';
import { requireAuth, requireRoles, type AppEnv } from '../auth/middleware.js';
import { prisma } from '../db.js';
import { commissionInclude, commissionView, studentDTO, teacherDTO } from '../dto.js';
import { AppError, forbidden, notFound } from '../errors.js';
import type { Prisma } from '../generated/prisma/client.js';
import { activeCycle, commissionScope, hasRole, isManagement, parseDate, toISO, toISODate } from '../scope.js';
import { parseBody } from '../validation.js';

const WRITE = ['SUPER_ADMIN', 'DIRECTOR', 'ADMINISTRATIVE'] as const;
const READ = [...WRITE, 'PRECEPTOR', 'TEACHER'] as const;
const STUDENT_MANAGERS = [...WRITE, 'PRECEPTOR'] as const;
/** Quién ve datos sensibles del alumno (domicilio, contacto de emergencia, salud). */
const SENSITIVE_READ = ['SUPER_ADMIN', 'DIRECTOR', 'ADMINISTRATIVE', 'PRECEPTOR'] as const;

const code = z.string().trim().min(1).max(40);
const text = (max = 200) => z.string().trim().min(1).max(max);
const scheduleSlot = z.object({
  weekday: z.number().int().min(1).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  classroom: z.string().max(60).optional(),
});

/** Prisma P2002 (único repetido) → 409 con mensaje claro. */
async function unique<T>(p: Promise<T>, what: string): Promise<T> {
  try {
    return await p;
  } catch (e) {
    if ((e as { code?: string }).code === 'P2002') throw new AppError('CONFLICT', `Ya existe ${what} con ese dato.`);
    throw e;
  }
}

async function assertPlanBelongsToCareer(planId: string, careerId: string): Promise<void> {
  const plan = await prisma.studyPlan.findFirst({ where: { id: planId, careerId }, select: { id: true } });
  if (!plan) throw new AppError('VALIDATION_ERROR', 'El plan de estudios no corresponde a la carrera seleccionada.');
}

export const structureRoutes = new Hono<AppEnv>()
  .use(requireAuth)

  // ------------------------------------------------------- carreras y planes
  .get('/careers', requireRoles(...READ), async (c) => {
    const rows = await prisma.career.findMany({ orderBy: { name: 'asc' } });
    return c.json(rows.map(({ id, code, name, durationYears, active }) => ({ id, code, name, durationYears, active })));
  })
  .post('/careers', requireRoles(...WRITE), async (c) => {
    const b = await parseBody(c, z.object({ code, name: text(), durationYears: z.number().int().min(1).max(8) }));
    const r = await unique(prisma.career.create({ data: b }), 'una carrera');
    await audit(c, c.get('user'), { action: 'CREATE', entity: 'Career', entityId: r.id, summary: `Carrera ${r.code}` });
    return c.json({ id: r.id }, 201);
  })
  .patch('/careers/:id', requireRoles(...WRITE), async (c) => {
    const b = await parseBody(c, z.object({ name: text(), durationYears: z.number().int().min(1).max(8), active: z.boolean() }).partial());
    const r = await prisma.career.update({ where: { id: c.req.param('id') }, data: b }).catch(() => null);
    if (!r) throw notFound('No existe la carrera.');
    return c.json({ id: r.id });
  })
  .get('/plans', requireRoles(...READ), async (c) => {
    const careerId = c.req.query('careerId');
    const rows = await prisma.studyPlan.findMany({ where: careerId ? { careerId } : {}, orderBy: { startYear: 'desc' } });
    return c.json(rows.map((p) => ({ id: p.id, careerId: p.careerId, code: p.code, name: p.name, startYear: p.startYear, active: p.active })));
  })
  .post('/plans', requireRoles(...WRITE), async (c) => {
    const b = await parseBody(c, z.object({ careerId: z.string().uuid(), code, name: text(), startYear: z.number().int().min(1990).max(2100) }));
    const r = await unique(prisma.studyPlan.create({ data: b }), 'un plan');
    return c.json({ id: r.id }, 201);
  })

  // ---------------------------------------------------------------- materias
  .post('/subjects', requireRoles(...WRITE), async (c) => {
    const b = await parseBody(
      c,
      z.object({
        planId: z.string().uuid(),
        code,
        name: text(),
        year: z.number().int().min(1).max(8),
        period: z.enum(ACADEMIC_PERIODS),
        weeklyHours: z.number().int().min(1).max(40).optional(),
        prerequisiteSubjectIds: z.array(z.string().uuid()).optional(),
      }),
    );
    const { prerequisiteSubjectIds, ...data } = b;
    const r = await unique(
      prisma.subject.create({
        data: { ...data, ...(prerequisiteSubjectIds?.length ? { prerequisites: { connect: prerequisiteSubjectIds.map((id) => ({ id })) } } : {}) },
      }),
      'una materia',
    );
    return c.json({ id: r.id }, 201);
  })
  .patch('/subjects/:id', requireRoles(...WRITE), async (c) => {
    const b = await parseBody(
      c,
      z
        .object({
          name: text(),
          year: z.number().int().min(1).max(8),
          period: z.enum(ACADEMIC_PERIODS),
          weeklyHours: z.number().int().min(1).max(40).nullable(),
          prerequisiteSubjectIds: z.array(z.string().uuid()),
        })
        .partial(),
    );
    const { prerequisiteSubjectIds, ...data } = b;
    const r = await prisma.subject
      .update({
        where: { id: c.req.param('id') },
        data: { ...data, ...(prerequisiteSubjectIds ? { prerequisites: { set: prerequisiteSubjectIds.map((id) => ({ id })) } } : {}) },
      })
      .catch(() => null);
    if (!r) throw notFound('No existe la materia.');
    return c.json({ id: r.id });
  })

  // ---------------------------------------------------------- ciclos lectivos
  .get('/cycles', requireRoles(...READ), async (c) => {
    const rows = await prisma.academicCycle.findMany({ orderBy: { year: 'desc' } });
    return c.json(
      rows.map((y) => ({
        id: y.id,
        year: y.year,
        status: y.status,
        startDate: toISODate(y.startDate),
        endDate: toISODate(y.endDate),
        firstTermEndDate: y.firstTermEndDate ? toISODate(y.firstTermEndDate) : undefined,
      })),
    );
  })
  .post('/cycles', requireRoles(...WRITE), async (c) => {
    const b = await parseBody(
      c,
      z.object({ year: z.number().int().min(2000).max(2100), startDate: z.string(), endDate: z.string(), firstTermEndDate: z.string().optional() }),
    );
    const r = await unique(
      prisma.academicCycle.create({
        data: {
          year: b.year,
          startDate: parseDate(b.startDate, 'startDate'),
          endDate: parseDate(b.endDate, 'endDate'),
          firstTermEndDate: b.firstTermEndDate ? parseDate(b.firstTermEndDate, 'firstTermEndDate') : null,
        },
      }),
      'un ciclo',
    );
    return c.json({ id: r.id }, 201);
  })
  .patch('/cycles/:id', requireRoles(...WRITE), async (c) => {
    const user = c.get('user');
    const b = await parseBody(c, z.object({ status: z.enum(CYCLE_STATUSES) }));
    const cy = await prisma.academicCycle.findUnique({ where: { id: c.req.param('id') } });
    if (!cy) throw notFound('No existe el ciclo.');
    // Un solo ciclo vigente: al activar uno, el que estaba vigente se cierra.
    await prisma.$transaction([
      ...(b.status === 'ACTIVE' ? [prisma.academicCycle.updateMany({ where: { status: 'ACTIVE', NOT: { id: cy.id } }, data: { status: 'CLOSED' } })] : []),
      prisma.academicCycle.update({ where: { id: cy.id }, data: { status: b.status } }),
    ]);
    await audit(c, user, { action: 'SETTINGS_CHANGE', entity: 'AcademicCycle', entityId: cy.id, summary: `Ciclo ${cy.year}: ${cy.status} → ${b.status}` });
    return c.json({ id: cy.id, status: b.status });
  })

  // --------------------------------------------------------------- comisiones
  .get('/commissions', requireRoles(...READ), async (c) => {
    const q = c.req.query();
    const scope = await commissionScope(c.get('user'));
    const rows = await prisma.commission.findMany({
      where: {
        AND: [
          scope,
          q.subjectId ? { subjectId: q.subjectId } : {},
          q.careerId ? { subject: { plan: { careerId: q.careerId } } } : {},
          q.year ? { subject: { year: Number(q.year) } } : {},
        ],
      },
      include: commissionInclude,
      orderBy: [{ subject: { year: 'asc' } }, { code: 'asc' }],
    });
    return c.json(rows.map(commissionView));
  })
  .post('/commissions', requireRoles(...WRITE), async (c) => {
    const b = await parseBody(
      c,
      z.object({
        code,
        subjectId: z.string().uuid(),
        cycleId: z.string().uuid().optional(),
        period: z.enum(ACADEMIC_PERIODS),
        shift: z.enum(SHIFTS),
        teacherIds: z.array(z.string().uuid()).default([]),
        preceptorUserId: z.string().uuid().optional(),
        schedule: z.array(scheduleSlot).default([]),
        capacity: z.number().int().min(1).max(500).optional(),
      }),
    );
    const cycleId = b.cycleId ?? (await activeCycle()).id;
    const r = await unique(
      prisma.commission.create({
        data: {
          code: b.code,
          subjectId: b.subjectId,
          cycleId,
          period: b.period,
          shift: b.shift,
          preceptorUserId: b.preceptorUserId,
          schedule: b.schedule,
          capacity: b.capacity,
          teachers: { create: b.teacherIds.map((teacherId, position) => ({ teacherId, position })) },
        },
        include: commissionInclude,
      }),
      'una comisión',
    );
    await audit(c, c.get('user'), { action: 'CREATE', entity: 'Commission', entityId: r.id, summary: `Comisión ${r.code}` });
    return c.json(commissionView(r), 201);
  })
  .patch('/commissions/:id', requireRoles(...WRITE), async (c) => {
    const b = await parseBody(
      c,
      z
        .object({
          shift: z.enum(SHIFTS),
          period: z.enum(ACADEMIC_PERIODS),
          teacherIds: z.array(z.string().uuid()),
          preceptorUserId: z.string().uuid().nullable(),
          schedule: z.array(scheduleSlot),
          capacity: z.number().int().min(1).max(500).nullable(),
        })
        .partial(),
    );
    const cm = await prisma.commission.findUnique({ where: { id: c.req.param('id') } });
    if (!cm) throw notFound('No existe la comisión.');
    const { teacherIds, ...data } = b;
    await prisma.$transaction([
      ...(teacherIds
        ? [
            prisma.commissionTeacher.deleteMany({ where: { commissionId: cm.id } }),
            prisma.commissionTeacher.createMany({ data: teacherIds.map((teacherId, position) => ({ commissionId: cm.id, teacherId, position })) }),
          ]
        : []),
      prisma.commission.update({ where: { id: cm.id }, data }),
    ]);
    const r = await prisma.commission.findUniqueOrThrow({ where: { id: cm.id }, include: commissionInclude });
    await audit(c, c.get('user'), { action: 'UPDATE', entity: 'Commission', entityId: cm.id, summary: `Comisión ${cm.code} modificada` });
    return c.json(commissionView(r));
  })

  // ------------------------------------------------------------------ alumnos
  .get('/students', requireRoles(...READ), async (c) => {
    const q = c.req.query();
    const user = c.get('user');
    const where: Prisma.StudentWhereInput = {
      ...(q.careerId ? { careerId: q.careerId } : {}),
      ...(q.status ? { status: q.status as never } : {}),
      ...(q.commissionId ? { enrollments: { some: { commissionId: q.commissionId } } } : {}),
      ...(q.search
        ? {
            OR: [
              { lastName: { contains: q.search, mode: 'insensitive' } },
              { firstName: { contains: q.search, mode: 'insensitive' } },
              { fileNumber: { contains: q.search } },
              { dni: { contains: q.search } },
            ],
          }
        : {}),
    };
    // Preceptoría administra el padrón institucional; Profesor conserva alcance por comisión.
    if (!isManagement(user) && !hasRole(user, 'PRECEPTOR')) where.enrollments = { some: { commission: await commissionScope(user) } };
    const rows = await prisma.student.findMany({ where, orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }], take: 2000 });
    return c.json(rows.map(studentDTO));
  })
  .post('/students', requireRoles(...STUDENT_MANAGERS), async (c) => {
    const b = await parseBody(
      c,
      z.object({
        fileNumber: code,
        dni: z.string().trim().regex(/^[0-9A-Za-z.-]{6,15}$/, 'DNI inválido.'),
        firstName: text(80),
        lastName: text(80),
        email: z.string().trim().toLowerCase().email(),
        phone: z.string().max(40).optional(),
        careerId: z.string().uuid(),
        planId: z.string().uuid(),
        admissionDate: z.string(),
        status: z.enum(STUDENT_STATUSES).default('ACTIVE'),
      }),
    );
    await assertPlanBelongsToCareer(b.planId, b.careerId);
    const r = await unique(prisma.student.create({ data: { ...b, admissionDate: parseDate(b.admissionDate, 'admissionDate') } }), 'un alumno (legajo o DNI)');
    await audit(c, c.get('user'), { action: 'CREATE', entity: 'Student', entityId: r.id, summary: `Alumno ${r.lastName}, ${r.firstName} (${r.fileNumber})` });
    return c.json(studentDTO(r), 201);
  })
  .patch('/students/:id', requireRoles(...STUDENT_MANAGERS), async (c) => {
    const b = await parseBody(
      c,
      z
        .object({
          fileNumber: code,
          dni: z.string().trim().regex(/^[0-9A-Za-z.-]{6,15}$/, 'DNI inválido.'),
          firstName: text(80),
          lastName: text(80),
          email: z.string().trim().toLowerCase().email(),
          phone: z.string().max(40).nullable(),
          careerId: z.string().uuid(),
          planId: z.string().uuid(),
          admissionDate: z.string(),
          status: z.enum(STUDENT_STATUSES),
          userId: z.string().uuid().nullable(),
        })
        .partial(),
    );
    const user = c.get('user');
    if (!isManagement(user) && Object.prototype.hasOwnProperty.call(b, 'userId')) {
      throw forbidden('Solo Dirección o Administración puede vincular una cuenta de acceso al legajo.');
    }
    const before = await prisma.student.findUnique({ where: { id: c.req.param('id') } });
    if (!before) throw notFound('No existe el alumno.');
    if (b.careerId || b.planId) await assertPlanBelongsToCareer(b.planId ?? before.planId, b.careerId ?? before.careerId);
    const { admissionDate, ...fields } = b;
    const r = await unique(prisma.student.update({
      where: { id: before.id },
      data: { ...fields, ...(admissionDate ? { admissionDate: parseDate(admissionDate, 'admissionDate') } : {}) },
    }), 'otro alumno con ese legajo, DNI o cuenta');
    await audit(c, c.get('user'), {
      action: b.status && b.status !== before.status ? 'STATUS_CHANGE' : 'UPDATE',
      entity: 'Student',
      entityId: r.id,
      summary: `Alumno ${r.fileNumber} modificado`,
    });
    return c.json(studentDTO(r));
  })
  .get('/students/:id/sensitive', requireRoles(...SENSITIVE_READ), async (c) => {
    const id = c.req.param('id');
    const user = c.get('user');
    if (!isManagement(user) && !hasRole(user, 'PRECEPTOR')) {
      const ok = await prisma.enrollment.findFirst({ where: { studentId: id, commission: await commissionScope(user) } });
      if (!ok) throw notFound();
    }
    const s = await prisma.studentSensitiveData.findUnique({ where: { studentId: id } });
    const out: StudentSensitiveData = {
      studentId: id,
      birthDate: s?.birthDate ? toISODate(s.birthDate) : undefined,
      address: s?.address ?? undefined,
      emergencyContactName: s?.emergencyContactName ?? undefined,
      emergencyContactPhone: s?.emergencyContactPhone ?? undefined,
      emergencyContactEmail: s?.emergencyContactEmail ?? undefined,
      healthNotes: s?.healthNotes ?? undefined,
    };
    return c.json(out);
  })
  .put('/students/:id/sensitive', requireRoles(...WRITE), async (c) => {
    const b = await parseBody(
      c,
      z
        .object({
          birthDate: z.string().nullable(),
          address: z.string().max(300).nullable(),
          emergencyContactName: z.string().max(120).nullable(),
          emergencyContactPhone: z.string().max(40).nullable(),
          emergencyContactEmail: z.string().email().nullable(),
          healthNotes: z.string().max(2000).nullable(),
        })
        .partial(),
    );
    const id = c.req.param('id');
    if (!(await prisma.student.findUnique({ where: { id } }))) throw notFound('No existe el alumno.');
    const data = { ...b, birthDate: b.birthDate ? parseDate(b.birthDate, 'birthDate') : b.birthDate === null ? null : undefined };
    await prisma.studentSensitiveData.upsert({ where: { studentId: id }, create: { studentId: id, ...data }, update: data });
    // No se guardan los valores en la auditoría (son datos sensibles).
    await audit(c, c.get('user'), { action: 'UPDATE', entity: 'StudentSensitiveData', entityId: id, summary: 'Datos sensibles actualizados' });
    return c.json({ studentId: id });
  })

  // ----------------------------------------------------------------- docentes
  .get('/teachers', requireRoles(...READ), async (c) => {
    const search = c.req.query('search');
    const rows = await prisma.teacher.findMany({
      where: search
        ? { OR: [{ lastName: { contains: search, mode: 'insensitive' } }, { firstName: { contains: search, mode: 'insensitive' } }] }
        : {},
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
    return c.json(rows.map(teacherDTO));
  })
  .post('/teachers', requireRoles(...WRITE), async (c) => {
    const b = await parseBody(
      c,
      z.object({
        fileNumber: code,
        dni: z.string().trim().regex(/^[0-9A-Za-z.-]{6,15}$/, 'DNI inválido.'),
        firstName: text(80),
        lastName: text(80),
        email: z.string().trim().toLowerCase().email(),
        phone: z.string().max(40).optional(),
        title: z.string().max(60).optional(),
      }),
    );
    const r = await unique(prisma.teacher.create({ data: b }), 'un docente (legajo o DNI)');
    await audit(c, c.get('user'), { action: 'CREATE', entity: 'Teacher', entityId: r.id, summary: `Docente ${r.lastName}, ${r.firstName}` });
    return c.json(teacherDTO(r), 201);
  })
  .patch('/teachers/:id', requireRoles(...WRITE), async (c) => {
    const b = await parseBody(
      c,
      z
        .object({
          firstName: text(80),
          lastName: text(80),
          email: z.string().trim().toLowerCase().email(),
          phone: z.string().max(40).nullable(),
          title: z.string().max(60).nullable(),
          status: z.enum(TEACHER_STATUSES),
          userId: z.string().uuid().nullable(),
        })
        .partial(),
    );
    const r = await unique(
      prisma.teacher.update({ where: { id: c.req.param('id') }, data: b }).catch((e) => {
        if ((e as { code?: string }).code === 'P2025') throw notFound('No existe el docente.');
        throw e;
      }),
      'otro docente vinculado a esa cuenta',
    );
    return c.json(teacherDTO(r));
  })

  // ------------------------------------------------------------ inscripciones
  .get('/enrollments', requireRoles(...READ), async (c) => {
    const q = c.req.query();
    if (!q.commissionId && !q.studentId) throw new AppError('VALIDATION_ERROR', 'Indicá commissionId o studentId.');
    const user = c.get('user');
    const scope = isManagement(user) || hasRole(user, 'PRECEPTOR') ? {} : await commissionScope(user);
    const rows = await prisma.enrollment.findMany({
      where: { commission: scope, ...(q.commissionId ? { commissionId: q.commissionId } : {}), ...(q.studentId ? { studentId: q.studentId } : {}) },
      orderBy: { createdAt: 'asc' },
    });
    const out: Enrollment[] = rows.map((e) => ({
      id: e.id,
      studentId: e.studentId,
      commissionId: e.commissionId,
      condition: e.condition,
      enrolledAt: toISODate(e.enrolledAt),
      conditionChangedAt: toISO(e.conditionChangedAt),
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }));
    return c.json(out);
  })
  .post('/enrollments', requireRoles(...STUDENT_MANAGERS), async (c) => {
    const b = await parseBody(c, z.object({ studentId: z.string().uuid(), commissionId: z.string().uuid() }));
    const [student, commission] = await Promise.all([
      prisma.student.findUnique({ where: { id: b.studentId }, select: { id: true, planId: true } }),
      prisma.commission.findUnique({ where: { id: b.commissionId }, select: { id: true, subject: { select: { planId: true } } } }),
    ]);
    if (!student || !commission) throw notFound('No existe el alumno o la comisión.');
    if (student.planId !== commission.subject.planId) {
      throw new AppError('VALIDATION_ERROR', 'La comisión no pertenece al plan de estudios del alumno.');
    }
    const r = await unique(prisma.enrollment.create({ data: b }), 'una inscripción del alumno en esa comisión');
    await audit(c, c.get('user'), { action: 'CREATE', entity: 'Enrollment', entityId: r.id, summary: 'Inscripción a comisión' });
    return c.json({ id: r.id }, 201);
  })
  .patch('/enrollments/:id', requireRoles(...STUDENT_MANAGERS, 'TEACHER'), async (c) => {
    const user = c.get('user');
    const b = await parseBody(c, z.object({ condition: z.enum(ENROLLMENT_CONDITIONS) }));
    const e = await prisma.enrollment.findFirst({
      where: { id: c.req.param('id'), ...(!isManagement(user) && !hasRole(user, 'PRECEPTOR') ? { commission: await commissionScope(user) } : {}) },
    });
    if (!e) throw notFound('No existe la inscripción o no la tenés a cargo.');
    await prisma.enrollment.update({ where: { id: e.id }, data: { condition: b.condition, conditionChangedAt: new Date() } });
    await audit(c, user, { action: 'STATUS_CHANGE', entity: 'Enrollment', entityId: e.id, summary: `Condición ${e.condition} → ${b.condition}` });
    return c.json({ id: e.id, condition: b.condition });
  })
  .delete('/enrollments/:id', requireRoles(...WRITE), async (c) => {
    const e = await prisma.enrollment.findUnique({ where: { id: c.req.param('id') }, include: { _count: { select: { grades: true } } } });
    if (!e) throw notFound('No existe la inscripción.');
    if (e._count.grades > 0) throw new AppError('CONFLICT', 'Tiene notas cargadas: marcala como baja (DROPPED) en vez de borrarla.');
    await prisma.enrollment.delete({ where: { id: e.id } });
    await audit(c, c.get('user'), { action: 'DELETE', entity: 'Enrollment', entityId: e.id, summary: 'Inscripción eliminada' });
    return c.body(null, 204);
  });
