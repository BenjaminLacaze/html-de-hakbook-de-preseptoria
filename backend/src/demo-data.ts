// Datos de EJEMPLO para probar la integración de punta a punta.
//
//   npm run db:demo-data       carga (o recarga) los datos de ejemplo
//   npm run db:demo-data:off   los borra (todo lo marcado demo = true)
//   npm run db:demo-data -- --shifts   solo (re)carga los turnos de ejemplo de Auxiliares
//   npm run db:demo-data -- --family   solo (re)carga los datos de ejemplo del Panel de Familias
//
// Salen de la app "julian appcompleta" (consolidacion/app/src/legacy/constants.ts): 2 carreras,
// sus materias, los alumnos de ejemplo y sus asistencias, más tareas, instalaciones,
// incidencias, eventos, foro, comunicados y reclamos del Centro.
//
// Todo queda marcado con demo = true (o cuelga de una carrera demo), así se borra sin tocar
// datos reales. Asignaciones: prueba.preceptor → comisiones de "dev"; prueba.profesor → 2.º año
// de "dev"; prueba.alumno → primer alumno de 1.º de "dev"; prueba.centro → autor del Centro.
import 'dotenv/config';
import {
  CAREERS,
  INITIAL_ATTENDANCE,
  INITIAL_DAILY_TASKS,
  INITIAL_INCIDENTS,
  INITIAL_INSTALLATIONS,
  INITIAL_MAINTENANCE_HISTORY,
  INITIAL_STUDENT_REP_ANNOUNCEMENTS,
  INITIAL_STUDENT_REP_CLAIMS,
  INITIAL_STUDENT_REP_EVENTS,
  INITIAL_STUDENT_REP_REPLIES,
  INITIAL_STUDENT_REP_THREADS,
  INITIAL_USERS,
  SUBJECTS,
} from '../../consolidacion/app/src/legacy/constants.js';
import { AttendanceStatus, Role } from '../../consolidacion/app/src/legacy/types.js';

import { randomBytes } from 'node:crypto';
import { TEST_USERS_PASSWORD } from '../../shared/testUsers.js';
import { hashPassword } from './auth/password.js';

const { prisma } = await import('./db.js');
const off = process.argv.includes('--off');
/** --shifts: solo (re)carga los turnos de ejemplo de Auxiliares, sin tocar el resto. */
const onlyShifts = process.argv.includes('--shifts');
/** --family: solo (re)carga los datos de ejemplo del Panel de Familias, sin tocar el resto. */
const onlyFamily = process.argv.includes('--family');

/** Código de carrera en la base ↔ id de carrera en las pantallas rescatadas. */
export const DEMO_CAREER_CODES: Record<string, string> = { dev: 'DEMO-DEV', design: 'DEMO-DIS' };

const day = (s: string) => new Date(`${s}T00:00:00Z`);
const today = () => day(new Date().toISOString().slice(0, 10));

/**
 * Compañero/a de ejemplo para los cambios de turno. Con una base local entra con la clave de los
 * usuarios de prueba (para poder aceptar un cambio desde la pantalla); con cualquier otra base,
 * la clave es al azar y nadie puede iniciar sesión.
 */
const DEMO_STAFF2_EMAIL = 'demo.auxiliar2@example.invalid';
const localDatabase = /@(127\.0\.0\.1|localhost)[:/]/.test(process.env.DATABASE_URL ?? '');

async function removeDemoShifts() {
  await prisma.staffShift.deleteMany({ where: { demo: true } }); // los pedidos de cambio se borran en cascada
}

/** Turnos de lunes a viernes de las próximas dos semanas: prueba.auxiliar a la mañana y el ejemplo a la tarde. */
async function loadDemoShifts() {
  await removeDemoShifts();
  const staffId = await userId('prueba.auxiliar@isfdyt26.edu.ar');
  const access = {
    passwordHash: await hashPassword(localDatabase ? TEST_USERS_PASSWORD : randomBytes(24).toString('base64url')),
    mustChangePassword: !localDatabase,
  };
  const staff2 = await prisma.user.upsert({
    where: { email: DEMO_STAFF2_EMAIL },
    update: { roles: ['STAFF'], status: 'ACTIVE', ...access },
    create: { email: DEMO_STAFF2_EMAIL, firstName: 'Auxiliar', lastName: 'Ejemplo', roles: ['STAFF'], ...access },
  });
  const days: Date[] = [];
  for (let i = 0; days.length < 10; i++) {
    const d = new Date(today().getTime() + i * 86400000);
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) days.push(d);
  }
  await prisma.staffShift.createMany({
    data: days.flatMap((date) => [
      { userId: staffId, date, startTime: '07:00', endTime: '13:00', createdBy: staffId, demo: true },
      { userId: staff2.id, date, startTime: '13:00', endTime: '19:00', createdBy: staffId, demo: true },
    ]),
  });
  console.log(`Turnos de ejemplo: ${days.length * 2} (prueba.auxiliar y ${DEMO_STAFF2_EMAIL}).`);
}

const FAMILY_EMAIL = 'prueba.familia@isfdyt26.edu.ar';
const FAMILY_MARK = '[Familias · ejemplo]';

async function removeDemoFamily() {
  await prisma.authorizationRequest.deleteMany({ where: { demo: true } }); // las respuestas se borran en cascada
  await prisma.guardian.deleteMany({ where: { demo: true } }); // vínculos y pedidos de corrección, en cascada
  await prisma.notice.deleteMany({ where: { title: { startsWith: FAMILY_MARK } } });
  await prisma.schoolEvent.deleteMany({ where: { description: { startsWith: FAMILY_MARK } } });
  const u = await prisma.user.findUnique({ where: { email: FAMILY_EMAIL }, select: { id: true } });
  if (u) await prisma.privateMessage.deleteMany({ where: { OR: [{ senderId: u.id }, { receiverId: u.id }] } });
}

/**
 * Familia de ejemplo: prueba.familia queda como responsable de dos alumnos demo de "dev"
 * (el de prueba.alumno, de 1.º, y uno de 2.º, que cursa con prueba.profesor). Carga además
 * autorizaciones, un comunicado, fechas de agenda, notas publicadas y una conversación con Preceptoría.
 * Necesita los datos de ejemplo generales ya cargados.
 */
async function loadDemoFamily() {
  await removeDemoFamily();
  const familyId = await userId(FAMILY_EMAIL);
  const preceptorId = await userId('prueba.preceptor@isfdyt26.edu.ar');
  const cycle = await prisma.academicCycle.findFirstOrThrow({ where: { status: 'ACTIVE' } });
  const devStudents = await prisma.student.findMany({
    where: { demo: true, career: { code: DEMO_CAREER_CODES.dev } },
    include: { enrollments: { include: { commission: { include: { subject: true } } } } },
    orderBy: { fileNumber: 'asc' },
  });
  const yearOf = (st: (typeof devStudents)[number]) => Math.max(0, ...st.enrollments.map((e) => e.commission.subject.year));
  const first = devStudents.find((st) => st.userId) ?? devStudents.find((st) => yearOf(st) === 1);
  const second = devStudents.find((st) => st.id !== first?.id && yearOf(st) === 2);
  if (!first || !second) throw new Error('Faltan los alumnos de ejemplo: corré antes "npm run db:demo-data".');
  const children = [first, second];

  const guardian = await prisma.guardian.create({
    data: {
      userId: familyId,
      dni: 'DEMO-FAM-1',
      phone: '2245 15-400000',
      address: 'Calle de ejemplo 123, Dolores',
      occupation: 'Comerciante',
      demo: true,
      students: { create: [{ studentId: first.id, relationship: 'MOTHER' }, { studentId: second.id, relationship: 'LEGAL_GUARDIAN' }] },
    },
  });

  const inDays = (n: number) => new Date(today().getTime() + n * 86400000);
  const requests = [
    { title: 'Salida didáctica al Polo Tecnológico', type: 'FIELD_TRIP' as const, description: 'Visita guiada con docentes de la carrera. Salida y regreso en el horario de cursada.', deadline: 7, event: 12, destination: 'Polo Tecnológico de La Plata', to: children, answer: 'PENDING' as const },
    { title: 'Uso de imagen en actividades institucionales', type: 'IMAGE_USE' as const, description: 'Autoriza la publicación de fotos y videos de actos y jornadas en los canales del instituto.', deadline: 20, event: null, destination: null, to: [first], answer: 'PENDING' as const },
    { title: 'Jornada de programación en Mar del Plata', type: 'TRAVEL' as const, description: 'Viaje educativo de un día a la jornada regional de desarrollo de software.', deadline: -5, event: 25, destination: 'Mar del Plata', to: [second], answer: 'APPROVED' as const },
  ];
  for (const r of requests) {
    await prisma.authorizationRequest.create({
      data: {
        title: r.title,
        type: r.type,
        description: r.description,
        deadlineDate: inDays(r.deadline),
        eventDate: r.event === null ? null : inDays(r.event),
        destination: r.destination,
        responsible: 'Preceptor Prueba',
        createdBy: preceptorId,
        demo: true,
        responses: {
          create: r.to.map((st) => ({
            studentId: st.id,
            answer: r.answer,
            ...(r.answer === 'PENDING' ? {} : { respondedBy: familyId, respondedAt: inDays(-6) }),
          })),
        },
      },
    });
  }

  await prisma.notice.createMany({
    data: [
      { cycleId: cycle.id, title: `${FAMILY_MARK} Reunión informativa para familias`, content: 'Invitamos a las familias a la reunión informativa del segundo cuatrimestre. Se conversará sobre asistencia, mesas de examen y acompañamiento a las trayectorias.', category: 'INSTITUTIONAL', audience: { roles: ['GUARDIAN'] }, status: 'PUBLISHED', publishedAt: inDays(-2), createdBy: preceptorId },
      { cycleId: cycle.id, title: `${FAMILY_MARK} Recordatorio: asistencia mínima`, content: 'Recordamos que para mantener la regularidad se requiere el porcentaje mínimo de asistencia. Las inasistencias se pueden justificar desde el Panel de Familias o el de Alumnos.', category: 'URGENT', audience: { roles: ['GUARDIAN', 'STUDENT'] }, status: 'PUBLISHED', publishedAt: inDays(-1), createdBy: preceptorId },
    ],
  });

  const firstCommission = first.enrollments[0]?.commissionId ?? null;
  await prisma.schoolEvent.createMany({
    data: [
      { cycleId: cycle.id, type: 'EXAM_PERIOD', title: 'Parcial integrador', description: `${FAMILY_MARK} Evaluación escrita del segundo cuatrimestre.`, startDate: inDays(9), commissionId: firstCommission, mandatory: true },
      { cycleId: cycle.id, type: 'CEREMONY', title: 'Acto de fin de ciclo', description: `${FAMILY_MARK} Acto abierto a las familias en el salón de actos.`, startDate: inDays(18) },
      { cycleId: cycle.id, type: 'HOLIDAY', title: 'Feriado nacional', description: `${FAMILY_MARK} Sin actividad.`, startDate: inDays(24) },
    ],
  });

  // Notas publicadas para que la familia tenga qué ver (solo donde todavía no hay).
  let grades = 0;
  for (const st of children) {
    for (const [i, e] of st.enrollments.slice(0, 3).entries()) {
      const exists = await prisma.grade.findFirst({ where: { enrollmentId: e.id } });
      if (exists) continue;
      await prisma.grade.createMany({
        data: [
          { enrollmentId: e.id, type: 'PARTIAL', instance: 1, date: inDays(-40 + i), value: 7 + (i % 3), published: true, publishedAt: inDays(-35), notes: 'Buen desempeño (ejemplo).', recordedBy: preceptorId },
          { enrollmentId: e.id, type: 'ASSIGNMENT', instance: 1, date: inDays(-20 + i), value: 8, published: true, publishedAt: inDays(-15), recordedBy: preceptorId },
        ],
      });
      grades += 2;
    }
  }

  await prisma.privateMessage.createMany({
    data: [
      { senderId: preceptorId, receiverId: familyId, text: `Buenas tardes. Le escribo desde Preceptoría por la asistencia de ${first.firstName}. Cualquier consulta, estoy a disposición.`, createdAt: inDays(-3) },
      { senderId: familyId, receiverId: preceptorId, text: 'Muchas gracias por avisar. Esta semana presento el certificado.', createdAt: inDays(-2), readAt: inDays(-2) },
    ],
  });

  console.log(`Familia de ejemplo: ${FAMILY_EMAIL} responsable de ${first.firstName} ${first.lastName} y ${second.firstName} ${second.lastName}; ${requests.length} autorizaciones, 2 comunicados, 3 fechas de agenda, ${grades} notas (ficha ${guardian.id.slice(0, 8)}).`);
}

async function removeDemo() {
  await removeDemoShifts();
  await removeDemoFamily();
  const careers = await prisma.career.findMany({ where: { demo: true }, select: { id: true } });
  const careerIds = careers.map((c) => c.id);
  const students = await prisma.student.findMany({ where: { demo: true }, select: { id: true } });
  const studentIds = students.map((s) => s.id);
  const commissions = await prisma.commission.findMany({
    where: { subject: { plan: { careerId: { in: careerIds } } } },
    select: { id: true },
  });
  const commissionIds = commissions.map((c) => c.id);

  await prisma.$transaction([
    prisma.attendanceRecord.deleteMany({ where: { OR: [{ studentId: { in: studentIds } }, { session: { commissionId: { in: commissionIds } } }] } }),
    prisma.classSession.deleteMany({ where: { commissionId: { in: commissionIds } } }),
    prisma.grade.deleteMany({ where: { enrollment: { commissionId: { in: commissionIds } } } }),
    prisma.enrollment.deleteMany({ where: { OR: [{ studentId: { in: studentIds } }, { commissionId: { in: commissionIds } }] } }),
    prisma.observation.deleteMany({ where: { commissionId: { in: commissionIds } } }),
    prisma.justification.deleteMany({ where: { studentId: { in: studentIds } } }),
    prisma.commissionTeacher.deleteMany({ where: { commissionId: { in: commissionIds } } }),
    prisma.commission.deleteMany({ where: { id: { in: commissionIds } } }),
    prisma.studentSensitiveData.deleteMany({ where: { studentId: { in: studentIds } } }),
    prisma.student.deleteMany({ where: { id: { in: studentIds } } }),
    prisma.teacher.deleteMany({ where: { demo: true } }),
    prisma.subject.deleteMany({ where: { plan: { careerId: { in: careerIds } } } }),
    prisma.studyPlan.deleteMany({ where: { careerId: { in: careerIds } } }),
    prisma.career.deleteMany({ where: { id: { in: careerIds } } }),
    prisma.staffTask.deleteMany({ where: { demo: true } }),
    prisma.incident.deleteMany({ where: { demo: true } }),
    prisma.maintenanceLog.deleteMany({ where: { demo: true } }),
    prisma.installation.deleteMany({ where: { demo: true } }),
    prisma.repEvent.deleteMany({ where: { demo: true } }),
    prisma.repThread.deleteMany({ where: { demo: true } }),
    prisma.repAnnouncement.deleteMany({ where: { demo: true } }),
    prisma.repClaim.deleteMany({ where: { demo: true } }),
    // Contra Neon (otra región) son 22 viajes de ida y vuelta: más que los 5 s por defecto.
  ], { maxWait: 20_000, timeout: 120_000 });
  console.log(`Datos de ejemplo borrados: ${careerIds.length} carreras, ${studentIds.length} alumnos, ${commissionIds.length} comisiones.`);
}

async function userId(email: string) {
  const u = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!u) throw new Error(`Falta el usuario ${email}: corré antes "npm run db:test-users".`);
  return u.id;
}

async function loadDemo() {
  await removeDemo(); // recarga limpia

  const preceptorId = await userId('prueba.preceptor@isfdyt26.edu.ar');
  const teacherUserId = await userId('prueba.profesor@isfdyt26.edu.ar');
  const studentUserId = await userId('prueba.alumno@isfdyt26.edu.ar');
  const centroId = await userId('prueba.centro@isfdyt26.edu.ar');
  const staffId = await userId('prueba.auxiliar@isfdyt26.edu.ar');

  // Ciclo vigente: se usa el que haya; si no hay, se crea 2026 (no es dato demo: queda).
  let cycle = await prisma.academicCycle.findFirst({ where: { status: 'ACTIVE' } });
  if (!cycle) {
    cycle = await prisma.academicCycle.upsert({
      where: { year: 2026 },
      update: { status: 'ACTIVE' },
      create: { year: 2026, status: 'ACTIVE', startDate: day('2026-03-02'), endDate: day('2026-12-18'), firstTermEndDate: day('2026-07-10') },
    });
  }

  // Carreras, planes y materias
  const planByCareer = new Map<string, string>();
  const careerIdByLegacy = new Map<string, string>();
  for (const c of CAREERS) {
    const career = await prisma.career.create({
      data: { code: DEMO_CAREER_CODES[c.id], name: `${c.name} (ejemplo)`, durationYears: Math.max(...c.years), demo: true },
    });
    const plan = await prisma.studyPlan.create({
      data: { careerId: career.id, code: `${DEMO_CAREER_CODES[c.id]}-2024`, name: 'Plan de ejemplo', startYear: 2024 },
    });
    careerIdByLegacy.set(c.id, career.id);
    planByCareer.set(c.id, plan.id);
  }

  const teacher = await prisma.teacher.create({
    data: { userId: teacherUserId, fileNumber: 'DEMO-D-1', dni: 'DEMO-D-1', firstName: 'Profesor', lastName: 'Prueba', email: 'prueba.profesor@isfdyt26.edu.ar', demo: true },
  });

  const commissionBySubject = new Map<string, string>();
  for (const s of SUBJECTS) {
    const subject = await prisma.subject.create({
      data: { planId: planByCareer.get(s.careerId)!, code: s.id, name: s.name, year: s.year, period: 'ANNUAL' },
    });
    const commission = await prisma.commission.create({
      data: {
        code: `DEMO-${s.id}`,
        cycleId: cycle.id,
        subjectId: subject.id,
        period: 'ANNUAL',
        shift: 'EVENING',
        preceptorUserId: s.careerId === 'dev' ? preceptorId : null,
        ...(s.careerId === 'dev' && s.year === 2 ? { teachers: { create: { teacherId: teacher.id, position: 0 } } } : {}),
      },
    });
    commissionBySubject.set(s.id, commission.id);
  }

  // Alumnos (sin cuenta, salvo el primero de 1.º de dev, que se vincula a prueba.alumno)
  const legacyStudents = INITIAL_USERS.filter((u) => u.role === Role.STUDENT);
  const studentByLegacy = new Map<number, string>();
  let linked = false;
  for (const u of legacyStudents) {
    const careerKey = u.careerId ?? 'dev';
    const [firstName, ...rest] = u.name.split(' ');
    const linkThis = !linked && careerKey === 'dev' && u.year === 1;
    const st = await prisma.student.create({
      data: {
        userId: linkThis ? studentUserId : null,
        fileNumber: `DEMO-${u.id}`,
        dni: `DEMO-${u.id}`,
        firstName,
        lastName: rest.join(' ') || '-',
        email: u.email,
        careerId: careerIdByLegacy.get(careerKey)!,
        planId: planByCareer.get(careerKey)!,
        admissionDate: day('2026-03-02'),
        demo: true,
      },
    });
    if (linkThis) linked = true;
    studentByLegacy.set(u.id, st.id);
    const years = Array.isArray(u.year) ? u.year : [u.year ?? 1];
    const subjects = SUBJECTS.filter((s) => s.careerId === careerKey && years.includes(s.year));
    if (subjects.length) {
      await prisma.enrollment.createMany({
        data: subjects.map((s) => ({ studentId: st.id, commissionId: commissionBySubject.get(s.id)! })),
      });
    }
  }

  // Asistencias: una clase por comisión y fecha; justificados y pendientes → justificación
  const sessionKey = new Map<string, string>();
  const records: { sessionId: string; studentId: string; status: 'PRESENT' | 'ABSENT'; source: 'PRECEPTOR'; recordedBy: string }[] = [];
  const justs: { studentId: string; fromDate: Date; toDate: Date; reason: string; status: 'APPROVED' | 'PENDING'; createdBy: string }[] = [];
  for (const r of INITIAL_ATTENDANCE) {
    const studentId = studentByLegacy.get(r.studentId);
    const commissionId = commissionBySubject.get(r.subjectId);
    if (!studentId || !commissionId) continue;
    const key = `${commissionId}|${r.date}`;
    let sessionId = sessionKey.get(key);
    if (!sessionId) {
      sessionId = (await prisma.classSession.create({ data: { commissionId, date: day(r.date) } })).id;
      sessionKey.set(key, sessionId);
    }
    const present = r.status === AttendanceStatus.PRESENT;
    records.push({ sessionId, studentId, status: present ? 'PRESENT' : 'ABSENT', source: 'PRECEPTOR', recordedBy: preceptorId });
    if (r.status === AttendanceStatus.JUSTIFIED || r.status === AttendanceStatus.PENDING_JUSTIFICATION) {
      justs.push({
        studentId,
        fromDate: day(r.date),
        toDate: day(r.date),
        reason: r.justificationReason || 'Certificado médico (ejemplo).',
        status: r.status === AttendanceStatus.JUSTIFIED ? 'APPROVED' : 'PENDING',
        createdBy: preceptorId,
      });
    }
  }
  // Un mismo alumno puede repetir clase en el ejemplo: se queda con el último registro.
  const unique = new Map(records.map((r) => [`${r.sessionId}|${r.studentId}`, r]));
  await prisma.attendanceRecord.createMany({ data: [...unique.values()] });
  if (justs.length) await prisma.justification.createMany({ data: justs });

  // Auxiliares
  const seenNames = new Set<string>();
  const installationByName = new Map<string, string>();
  for (const i of INITIAL_INSTALLATIONS) {
    let name = i.name;
    if (seenNames.has(name)) name = `${name} (derecha)`;
    seenNames.add(name);
    const inst = await prisma.installation.create({
      data: {
        name,
        status: i.status === 'ok' ? 'OK' : i.status === 'maintenance' ? 'MAINTENANCE' : 'OUT_OF_SERVICE',
        layout: i.layout,
        nextTask: i.details.nextTask,
        notes: [i.details.incident, i.details.lastCleaned && `Última limpieza (ejemplo): ${i.details.lastCleaned}`].filter(Boolean).join(' · ') || null,
        demo: true,
      },
    });
    installationByName.set(i.name, inst.id);
  }
  const taskType = { limpieza: 'CLEANING', mantenimiento: 'MAINTENANCE', rutina: 'ROUTINE' } as const;
  await prisma.staffTask.createMany({
    data: INITIAL_DAILY_TASKS.map((t) => ({
      date: today(),
      startTime: t.startTime,
      title: t.title,
      type: taskType[t.type],
      status: t.status === 'completada' ? 'DONE' : 'PENDING',
      location: t.location,
      details: t.details,
      createdBy: staffId,
      demo: true,
    })),
  });
  const prio = { Baja: 'LOW', Media: 'MEDIUM', Alta: 'HIGH' } as const;
  const incStatus = { abierta: 'OPEN', en_progreso: 'IN_PROGRESS', resuelta: 'RESOLVED' } as const;
  await prisma.incident.createMany({
    data: INITIAL_INCIDENTS.map((i) => ({
      description: i.description,
      priority: prio[i.priority],
      sector: i.sector,
      installationId: installationByName.get(i.sector) ?? null,
      status: incStatus[i.status],
      reportedBy: staffId,
      createdAt: new Date(i.timestamp),
      demo: true,
    })),
  });
  await prisma.maintenanceLog.createMany({
    data: INITIAL_MAINTENANCE_HISTORY.map((m) => {
      const [dd, mm, yyyy] = m.date.split('/');
      return { date: day(`${yyyy}-${mm}-${dd}`), task: m.task, responsible: m.responsible, recordedBy: staffId, demo: true };
    }),
  });

  // Centro de Estudiantes (los autores de ejemplo pasan a ser prueba.centro / prueba.alumno)
  const evType = { académico: 'ACADEMIC', cultural: 'CULTURAL', deportivo: 'SPORTS', reunión: 'MEETING' } as const;
  for (const e of INITIAL_STUDENT_REP_EVENTS) {
    await prisma.repEvent.create({
      data: {
        title: e.title,
        date: day(e.date),
        time: e.time,
        location: e.location,
        description: e.description,
        type: evType[e.type],
        organizer: e.organizer,
        createdBy: centroId,
        demo: true,
      },
    });
  }
  const cat = { general: 'GENERAL', propuestas: 'PROPOSALS', eventos: 'EVENTS' } as const;
  const threadByLegacy = new Map<string, string>();
  for (const t of INITIAL_STUDENT_REP_THREADS) {
    const th = await prisma.repThread.create({
      data: { authorId: centroId, title: t.title, content: t.content, category: cat[t.category], pinned: Boolean(t.isPinned), createdAt: new Date(t.timestamp), demo: true },
    });
    threadByLegacy.set(t.id, th.id);
  }
  for (const r of INITIAL_STUDENT_REP_REPLIES) {
    const threadId = threadByLegacy.get(r.threadId);
    if (threadId) await prisma.repReply.create({ data: { threadId, authorId: studentUserId, content: r.content, createdAt: new Date(r.timestamp) } });
  }
  await prisma.repAnnouncement.createMany({
    data: INITIAL_STUDENT_REP_ANNOUNCEMENTS.map((a) => ({
      title: a.title,
      content: a.content,
      authorId: centroId,
      pinned: Boolean(a.isPinned),
      publishDate: a.publishDate ? day(a.publishDate.slice(0, 10)) : null,
      createdAt: new Date(a.timestamp),
      demo: true,
    })),
  });
  const claimCat = { académico: 'ACADEMIC', infraestructura: 'INFRASTRUCTURE', administrativo: 'ADMINISTRATIVE', sugerencia: 'SUGGESTION' } as const;
  const claimSt = { pendiente: 'PENDING', 'en revisión': 'IN_REVIEW', resuelto: 'RESOLVED', archivado: 'ARCHIVED' } as const;
  await prisma.repClaim.createMany({
    data: INITIAL_STUDENT_REP_CLAIMS.map((r) => ({
      authorId: studentUserId,
      category: claimCat[r.category],
      description: r.description,
      status: claimSt[r.status],
      response: r.response,
      createdAt: new Date(r.timestamp),
      demo: true,
    })),
  });

  console.log(
    `Datos de ejemplo cargados: ${CAREERS.length} carreras, ${SUBJECTS.length} materias/comisiones, ` +
      `${legacyStudents.length} alumnos, ${unique.size} registros de asistencia, ${justs.length} justificaciones, ` +
      `${INITIAL_INSTALLATIONS.length} instalaciones, ${INITIAL_DAILY_TASKS.length} tareas, ${INITIAL_STUDENT_REP_EVENTS.length} eventos.`,
  );
}

if (off) await removeDemo();
else if (onlyShifts) await loadDemoShifts();
else if (onlyFamily) await loadDemoFamily();
else {
  await loadDemo();
  await loadDemoShifts();
  await loadDemoFamily();
}
await prisma.$disconnect();
