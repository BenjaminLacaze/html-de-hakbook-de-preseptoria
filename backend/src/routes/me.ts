// Portal del alumno: lo propio, siempre resuelto desde la sesión (nunca desde un id que mande la app).
// Lo usan los dos portales de Alumno (Julián y Lucía).
//
//   GET /me/student          ficha del alumno
//   GET /me/subjects         materias que cursa (comisión, condición y resumen de asistencia)
//   GET /me/attendance       registros de asistencia (?commissionId)
//   GET /me/summary          resumen de asistencia (?commissionId)
//   GET /me/grades           notas publicadas
//   GET /me/justifications   sus justificaciones
import { Hono } from 'hono';
import type { AttendanceRecordView, JustificationView, MyGrade, MySubject } from '../../../shared/types.js';
import { requireAuth, requireRoles, type AppEnv } from '../auth/middleware.js';
import { prisma } from '../db.js';
import { commissionInclude, commissionView, studentDTO } from '../dto.js';
import { AppError } from '../errors.js';
import { toISO, toISODate } from '../scope.js';
import { attendanceSummary } from '../summary.js';

const noStudent = () => new AppError('NOT_FOUND', 'Tu cuenta no está vinculada a un alumno. Pedile a Secretaría que la vincule.');

export const meRoutes = new Hono<AppEnv>()
  .use(requireAuth, requireRoles('STUDENT', 'STUDENT_REP'))

  .get('/student', async (c) => {
    const id = c.get('user').studentId;
    if (!id) throw noStudent();
    const s = await prisma.student.findUniqueOrThrow({ where: { id } });
    return c.json(studentDTO(s));
  })

  .get('/subjects', async (c) => {
    const id = c.get('user').studentId;
    if (!id) throw noStudent();
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: id, condition: { not: 'DROPPED' } },
      include: { commission: { include: commissionInclude } },
      orderBy: { commission: { subject: { year: 'asc' } } },
    });
    const out: MySubject[] = [];
    for (const e of enrollments) {
      out.push({
        enrollmentId: e.id,
        commission: commissionView(e.commission),
        condition: e.condition,
        attendance: await attendanceSummary(id, e.commissionId),
      });
    }
    return c.json(out);
  })

  .get('/attendance', async (c) => {
    const id = c.get('user').studentId;
    if (!id) throw noStudent();
    const commissionId = c.req.query('commissionId');
    const records = await prisma.attendanceRecord.findMany({
      where: { studentId: id, ...(commissionId ? { session: { commissionId } } : {}) },
      include: { session: { include: { commission: { include: { subject: true } } } }, student: true },
      orderBy: { session: { date: 'desc' } },
    });
    const justs = await prisma.justification.findMany({ where: { studentId: id } });
    const out: AttendanceRecordView[] = records.map((r) => {
      const d = r.session.date;
      const j = justs.find((x) => x.fromDate <= d && x.toDate >= d);
      return {
        id: r.id,
        sessionId: r.sessionId,
        studentId: r.studentId,
        status: r.status,
        minutesLate: r.minutesLate ?? undefined,
        notes: r.notes ?? undefined,
        source: r.source,
        recordedBy: r.recordedBy,
        recordedAt: r.recordedAt.toISOString(),
        justified: r.status === 'ABSENT' && j?.status === 'APPROVED',
        date: toISODate(d),
        commissionId: r.session.commissionId,
        subjectId: r.session.commission.subjectId,
        subjectName: r.session.commission.subject.name,
        studentName: `${r.student.lastName}, ${r.student.firstName}`,
        studentFileNumber: r.student.fileNumber,
        justificationId: j?.id,
        justificationStatus: j?.status,
      };
    });
    return c.json(out);
  })

  .get('/summary', async (c) => {
    const id = c.get('user').studentId;
    if (!id) throw noStudent();
    return c.json(await attendanceSummary(id, c.req.query('commissionId')));
  })

  .get('/grades', async (c) => {
    const id = c.get('user').studentId;
    if (!id) throw noStudent();
    const rows = await prisma.grade.findMany({
      where: { published: true, enrollment: { studentId: id } },
      include: { enrollment: { include: { commission: { include: { subject: true } } } } },
      orderBy: { date: 'desc' },
    });
    const out: MyGrade[] = rows.map((g) => ({
      id: g.id,
      subjectName: g.enrollment.commission.subject.name,
      commissionId: g.enrollment.commissionId,
      type: g.type,
      instance: g.instance,
      date: toISODate(g.date),
      value: g.value === null ? null : Number(g.value),
      absent: g.absent,
      notes: g.notes ?? undefined,
    }));
    return c.json(out);
  })

  .get('/justifications', async (c) => {
    const id = c.get('user').studentId;
    if (!id) throw noStudent();
    const rows = await prisma.justification.findMany({ where: { studentId: id }, include: { student: true }, orderBy: { createdAt: 'desc' } });
    const out: JustificationView[] = rows.map((j) => ({
      id: j.id,
      studentId: j.studentId,
      fromDate: toISODate(j.fromDate),
      toDate: toISODate(j.toDate),
      reason: j.reason,
      documentUrl: j.documentUrl ?? undefined,
      status: j.status,
      createdBy: j.createdBy,
      reviewedBy: j.reviewedBy ?? undefined,
      reviewedAt: toISO(j.reviewedAt),
      reviewNotes: j.reviewNotes ?? undefined,
      createdAt: j.createdAt.toISOString(),
      updatedAt: j.updatedAt.toISOString(),
      studentName: `${j.student.lastName}, ${j.student.firstName}`,
      studentFileNumber: j.student.fileNumber,
    }));
    return c.json(out);
  });
