// Catálogo académico y alcance de cada rol (lecturas).
//   GET /academic/cycles/active
//   GET /academic/careers
//   GET /academic/subjects?careerId=&year=
//   GET /academic/scope        → carreras, años, materias y alumnos que el usuario puede gestionar
import { Hono } from 'hono';
import type { PreceptorScope, StudentView, SubjectView } from '../../../shared/types.js';
import { requireAuth, requireRoles, type AppEnv } from '../auth/middleware.js';
import { prisma } from '../db.js';
import { activeCycle, commissionScope, toISO, toISODate } from '../scope.js';

const STAFF_ROLES = ['SUPER_ADMIN', 'DIRECTOR', 'ADMINISTRATIVE', 'PRECEPTOR', 'TEACHER'] as const;

export const academicRoutes = new Hono<AppEnv>()
  .use(requireAuth)

  .get('/cycles/active', async (c) => {
    const cy = await activeCycle();
    return c.json({
      id: cy.id,
      year: cy.year,
      status: cy.status,
      startDate: toISODate(cy.startDate),
      endDate: toISODate(cy.endDate),
      firstTermEndDate: cy.firstTermEndDate ? toISODate(cy.firstTermEndDate) : undefined,
    });
  })

  .get('/careers', async (c) => {
    const careers = await prisma.career.findMany({ where: { active: true }, orderBy: { name: 'asc' } });
    return c.json(careers.map(({ id, code, name, durationYears }) => ({ id, code, name, durationYears })));
  })

  .get('/subjects', requireRoles(...STAFF_ROLES), async (c) => {
    const careerId = c.req.query('careerId');
    const year = c.req.query('year') ? Number(c.req.query('year')) : undefined;
    const subjects = await prisma.subject.findMany({
      where: { ...(careerId ? { plan: { careerId } } : {}), ...(year ? { year } : {}) },
      include: { plan: { include: { career: true } } },
      orderBy: [{ year: 'asc' }, { name: 'asc' }],
    });
    const out: SubjectView[] = subjects.map((s) => ({
      id: s.id,
      planId: s.planId,
      code: s.code,
      name: s.name,
      year: s.year,
      period: s.period,
      weeklyHours: s.weeklyHours ?? undefined,
      prerequisiteSubjectIds: [],
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      careerId: s.plan.careerId,
      careerCode: s.plan.career.code,
    }));
    return c.json(out);
  })

  /** Lo que el usuario puede gestionar: sus comisiones → materias, carreras, años y alumnos. */
  .get('/scope', requireRoles(...STAFF_ROLES), async (c) => {
    const where = await commissionScope(c.get('user'));
    const commissions = await prisma.commission.findMany({
      where,
      include: {
        subject: { include: { plan: { include: { career: true } } } },
        enrollments: { where: { condition: { not: 'DROPPED' } }, include: { student: true } },
      },
    });

    const careers = new Map<string, { id: string; code: string; name: string }>();
    const years = new Map<string, Set<number>>();
    const subjects = new Map<string, SubjectView>();
    const students = new Map<string, StudentView>();

    for (const cm of commissions) {
      const s = cm.subject;
      const career = s.plan.career;
      careers.set(career.id, { id: career.id, code: career.code, name: career.name });
      if (!years.has(career.id)) years.set(career.id, new Set());
      years.get(career.id)!.add(s.year);
      subjects.set(s.id, {
        id: s.id,
        planId: s.planId,
        code: s.code,
        name: s.name,
        year: s.year,
        period: s.period,
        weeklyHours: s.weeklyHours ?? undefined,
        prerequisiteSubjectIds: [],
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
        careerId: career.id,
        careerCode: career.code,
      });
      for (const en of cm.enrollments) {
        const st = en.student;
        const prev = students.get(st.id);
        if (prev) {
          if (!prev.years.includes(s.year)) prev.years.push(s.year);
          continue;
        }
        students.set(st.id, {
          id: st.id,
          userId: st.userId,
          fileNumber: st.fileNumber,
          dni: st.dni,
          firstName: st.firstName,
          lastName: st.lastName,
          email: st.email,
          phone: st.phone ?? undefined,
          careerId: st.careerId,
          planId: st.planId,
          admissionDate: toISODate(st.admissionDate),
          status: st.status,
          createdAt: st.createdAt.toISOString(),
          updatedAt: toISO(st.updatedAt)!,
          careerCode: career.code,
          years: [s.year],
        });
      }
    }

    const scope: PreceptorScope = {
      careers: [...careers.values()],
      years: [...years.entries()].map(([careerId, set]) => ({ careerId, years: [...set].sort() })),
      subjects: [...subjects.values()].sort((a, b) => a.year - b.year || a.name.localeCompare(b.name)),
      students: [...students.values()].sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)),
    };
    return c.json(scope);
  });
