// Prueba HTTP de lo agregado para los paneles nuevos del ecosistema (Centro, Auxiliares y Preceptoría),
// migración 20261101200000_ecosistema_centro_auxiliares_preceptoria.
// Solo contra la API QA local (127.0.0.1:4052 → PostgreSQL 127.0.0.1:5452/qa_i26). Ver test/README.md.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';

const base = new URL(process.env.API_TEST_URL);
const m = JSON.parse(await readFile(process.env.TEST_FIXTURE_MANIFEST, 'utf8'));
assert.equal(base.hostname, '127.0.0.1');
assert.equal(base.port, '4052');
assert.equal(m.database, '127.0.0.1:5452/qa_i26');

async function login(email, password, label) {
  let cookie = '';
  async function req(path, method = 'GET', body, status = 200) {
    const r = await fetch(`${base.href.replace(/\/$/, '')}${path}`, {
      method,
      redirect: 'error',
      headers: { 'content-type': 'application/json', cookie },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await r.text();
    assert.equal(r.status, status, `${label} ${method} ${path}: HTTP ${r.status} ${text.slice(0, 200)}`);
    if (r.headers.get('set-cookie')) cookie = r.headers.get('set-cookie').split(';')[0];
    return text ? JSON.parse(text) : null;
  }
  await req('/auth/login', 'POST', { email, password });
  return req;
}
const client = (key) => login(m.accounts[key].email, m.accounts[key].password, key);
const [d, t, a, a2, staff, centro] = await Promise.all(['director', 'teacher1', 'student1', 'student2', 'staff', 'centro'].map(client));
const s1 = m.scenarios.find((s) => s.index === 1);
const run = randomBytes(3).toString('hex');
const today = new Date().toISOString().slice(0, 10);

// ------------------------------------------------------------------- Centro
const ev = await centro('/centro/events', 'POST', {
  title: `QA-I26 cupo ${run}`, date: today, time: '18:00', endTime: '20:00', description: 'Evento de prueba', type: 'MEETING', organizer: 'QA', capacity: 1,
}, 201);
await a(`/centro/events/${ev.id}/join`, 'POST', {});
await a(`/centro/events/${ev.id}/join`, 'POST', {}); // repetir no ocupa otro lugar
await a2(`/centro/events/${ev.id}/join`, 'POST', {}, 409);
const evRow = (await a('/centro/events')).find((e) => e.id === ev.id);
assert.deepEqual([evRow.capacity, evRow.endTime, evRow.participantCount, evRow.joined], [1, '20:00', 1, true]);
const participants = await centro(`/centro/events/${ev.id}/participants`);
assert.equal(participants.length, 1);
assert.match(participants[0].email, /@/);
await centro(`/centro/events/${ev.id}`, 'DELETE', undefined, 204);

const draft = await centro('/centro/announcements', 'POST', {
  title: `QA-I26 borrador ${run}`, content: 'Borrador', draft: true, attachments: [{ name: 'Reglamento', url: 'https://example.invalid/r.pdf', kind: 'pdf' }],
}, 201);
const future = await centro('/centro/announcements', 'POST', { title: `QA-I26 programado ${run}`, content: 'Programado', publishDate: '2099-01-01' }, 201);
const visibleToStudent = (await a('/centro/announcements')).map((x) => x.id);
assert.ok(!visibleToStudent.includes(draft.id) && !visibleToStudent.includes(future.id), 'el alumno no ve borradores ni programados');
const forRep = (await centro('/centro/announcements')).find((x) => x.id === draft.id);
assert.equal(forRep.attachments[0].kind, 'pdf');
await centro(`/centro/announcements/${draft.id}`, 'PATCH', { draft: false });
assert.ok((await a('/centro/announcements')).some((x) => x.id === draft.id), 'publicado, el alumno lo ve');
for (const id of [draft.id, future.id]) await centro(`/centro/announcements/${id}`, 'DELETE', undefined, 204);

const thread = await a('/centro/threads', 'POST', { title: `QA-I26 tema ${run}`, content: 'Contenido', category: 'GENERAL' }, 201);
await a2(`/centro/threads/${thread.id}/report`, 'POST', { reason: 'QA-I26 denuncia' });
assert.equal((await a('/centro/threads')).find((x) => x.id === thread.id).reported, false, 'la denuncia no se muestra a alumnos');
assert.equal((await centro('/centro/threads')).find((x) => x.id === thread.id).reported, true);
await centro(`/centro/threads/${thread.id}`, 'PATCH', { hidden: true, hiddenReason: 'QA-I26', reported: false });
assert.ok(!(await a('/centro/threads')).some((x) => x.id === thread.id), 'oculto para alumnos');
await a(`/centro/threads/${thread.id}/replies`, 'GET', undefined, 404);
await a(`/centro/threads/${thread.id}/report`, 'POST', { reason: 'otra vez' }, 404);

const claim = await a('/centro/claims', 'POST', { category: 'INFRASTRUCTURE', title: `QA-I26 ${run}`, description: 'Reclamo anónimo de prueba', anonymous: true }, 201);
assert.match(claim.code, /^REC-\d{4}-\d{3,}$/);
const seenByRep = (await centro('/centro/claims')).find((x) => x.id === claim.id);
assert.equal(seenByRep.authorName, undefined, 'anónimo: el Centro no ve el autor');
assert.equal((await a('/centro/claims')).find((x) => x.id === claim.id).authorName !== undefined, true, 'el autor se ve a sí mismo');
const fwd = await centro(`/centro/claims/${claim.id}`, 'PATCH', { forwardedTo: 'STAFF', forwardNote: 'QA-I26 derivado' });
assert.deepEqual([fwd.status, fwd.forwardedTo], ['FORWARDED', 'STAFF']);
const done = await centro(`/centro/claims/${claim.id}`, 'PATCH', { response: 'Resuelto en QA', status: 'RESOLVED' });
assert.deepEqual(done.history.map((h) => h.type), ['CREATED', 'FORWARDED', 'STATUS', 'RESPONSE']);
console.log('OK Centro: cupo, inscriptos con email, borradores/programados, denuncia y ocultar, reclamo anónimo con código, derivación e historial');

// --------------------------------------------------------------- Auxiliares
const inst = await staff('/staff/installations', 'POST', {
  name: `QA-I26 sector ${run}`, code: `Q${run.slice(0, 4)}`, floor: 'PB', layout: { col: 1, row: 1, colSpan: 1, rowSpan: 1 },
}, 201);
const task = await staff('/staff/tasks', 'POST', { date: today, startTime: '08:00', title: `QA-I26 tarea ${run}`, type: 'CLEANING', priority: 'HIGH', installationId: inst.id }, 201);
assert.deepEqual([task.location, task.priority, task.installationId], [inst.name, 'HIGH', inst.id]);
const doneTask = await staff(`/staff/tasks/${task.id}`, 'PATCH', { status: 'DONE' });
assert.ok(doneTask.completedByName, 'muestra quién la completó');
const cleaned = await staff(`/staff/installations/${inst.id}`, 'PATCH', { cleanedNow: true });
assert.ok(cleaned.lastCleanedByName && cleaned.code && cleaned.floor === 'PB');
const inc = await staff('/staff/incidents', 'POST', {
  description: 'QA-I26 pérdida de agua', priority: 'HIGH', sector: inst.name, installationId: inst.id, installationStatus: 'OUT_OF_SERVICE',
  imageUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2w==', notes: 'QA',
}, 201);
assert.ok(inc.reportedByName);
assert.equal((await staff('/staff/installations')).find((x) => x.id === inst.id).status, 'OUT_OF_SERVICE');
await staff('/staff/incidents', 'POST', { description: 'QA-I26 foto inválida', priority: 'LOW', sector: 'x', imageUrl: 'javascript:alert(1)' }, 400);
await staff(`/staff/incidents/${inc.id}`, 'PATCH', { status: 'RESOLVED', restoreInstallation: true });
assert.equal((await staff('/staff/installations')).find((x) => x.id === inst.id).status, 'OK');

const abs = await staff('/staff/absences', 'POST', { fromDate: '2031-03-02', toDate: '2031-03-03', reason: 'SICK_LEAVE', notes: 'QA-I26 licencia', documentName: 'certificado.pdf' }, 201);
assert.equal(abs.status, 'PENDING');
await staff('/staff/absences', 'POST', { fromDate: '2031-03-03', reason: 'FAMILY_CARE', notes: 'QA-I26 superpuesta' }, 409);
await staff(`/staff/absences/${abs.id}`, 'PATCH', { status: 'APPROVED' }, 403);
await a('/staff/absences', 'GET', undefined, 403);
assert.ok((await d('/staff/absences?status=PENDING')).some((x) => x.id === abs.id), 'Dirección ve las pendientes');
await d(`/staff/absences/${abs.id}`, 'PATCH', { status: 'APPROVED', reviewNotes: 'QA' });
await d(`/staff/absences/${abs.id}`, 'PATCH', { status: 'REJECTED' }, 409);
await staff(`/staff/absences/${abs.id}`, 'DELETE', undefined, 409); // ya resuelta
assert.equal((await staff('/staff/absences')).find((x) => x.id === abs.id).status, 'APPROVED');
await staff(`/staff/tasks/${task.id}`, 'DELETE', undefined, 204);
console.log('OK Auxiliares: tarea con sector y prioridad, nombres, limpieza, incidencia que cambia y restaura el sector, foto validada, ausencias del personal');

// --------------------------------------------------------------- Preceptoría
const subject = (await a('/me/subjects')).find((x) => x.commission.id === s1.commissionId);
const subjectId = subject.commission.subjectId;
assert.ok(subjectId);
const bulk = await t(`/attendance/summary/bulk?commissionId=${s1.commissionId}`);
assert.ok(bulk.some((x) => x.studentId === s1.studentId && typeof x.percentage === 'number'), 'resumen masivo de la comisión');
await t('/attendance/summary/bulk', 'GET', undefined, 400);

// Fecha libre posterior a las justificaciones existentes.
let day = new Date('2032-01-01T00:00:00Z');
for (const j of await a('/me/justifications')) { const end = new Date(j.toDate); if (end >= day) day = new Date(end.getTime() + 86400000); }
const date = day.toISOString().slice(0, 10);

const session = await d(`/attendance/commissions/${s1.commissionId}/sessions`, 'POST', { date, topic: `QA-I26 corrección ${run}` });
await t(`/attendance/sessions/${session.id}`, 'PUT', { records: [{ studentId: s1.studentId, status: 'PRESENT' }] });
await t(`/attendance/sessions/${session.id}`, 'PUT', { records: [{ studentId: s1.studentId, status: 'ABSENT', notes: 'QA-I26 corregido' }] });
const changes = await t(`/attendance/audit?commissionId=${s1.commissionId}`);
const change = changes.find((x) => x.studentId === s1.studentId && x.date === date);
assert.deepEqual([change?.previousStatus, change?.newStatus, change?.notes], ['PRESENT', 'ABSENT', 'QA-I26 corregido']);

const before = await a(`/me/summary?commissionId=${s1.commissionId}`);
await a('/me/justifications', 'POST', { fromDate: date, toDate: date, reason: 'QA-I26 otra materia', subjectId: '00000000-0000-4000-8000-000000000000' }, 400);
const j = await a('/me/justifications', 'POST', { fromDate: date, toDate: date, reason: `QA-I26 por materia ${run}`, subjectId, documentType: 'MEDICAL', documentName: 'certificado.pdf' }, 201);
const listed = (await t(`/attendance/justifications?studentId=${s1.studentId}`)).find((x) => x.id === j.id);
assert.deepEqual([listed.subjectId, listed.documentType, listed.documentName], [subjectId, 'MEDICAL', 'certificado.pdf']);
assert.ok(listed.subjectName);
await d(`/attendance/justifications/${j.id}`, 'PATCH', { status: 'APPROVED' });
await d(`/attendance/justifications/${j.id}`, 'PATCH', { status: 'REJECTED' }, 409);
const after = await a(`/me/summary?commissionId=${s1.commissionId}`);
assert.equal(after.justifiedAbsenceCount, before.justifiedAbsenceCount + 1, 'la justificación por materia cubre la falta de esa materia');
assert.ok((await a(`/me/attendance?commissionId=${s1.commissionId}`)).some((r) => r.date === date && r.justified));

const notice = await d('/records/notices', 'POST', { title: `QA-I26 propio ${run}`, content: 'Comunicado de prueba', category: 'ACADEMIC', audience: { roles: ['TEACHER'] }, publish: true }, 201);
await d(`/records/notices/${notice.id}`, 'PATCH', { status: 'ARCHIVED' });
assert.ok(!(await d('/records/notices')).some((x) => x.id === notice.id), 'archivado no aparece en el listado común');
assert.ok((await d('/records/notices?mine=1')).some((x) => x.id === notice.id), 'mine=1 trae los propios archivados');

const thread2 = await a('/social/forum', 'POST', { title: `QA-I26 consulta ${run}`, content: 'Contenido de prueba', channel: 'QUESTIONS' }, 201);
assert.equal(thread2.channel, 'QUESTIONS');
assert.ok((await a('/social/forum?channel=QUESTIONS')).some((x) => x.id === thread2.id));
assert.ok(!(await a('/social/forum?channel=PROPOSALS')).some((x) => x.id === thread2.id));
console.log('OK Preceptoría: resumen masivo, historial de correcciones, justificación por materia con comprobante, comunicados propios, canales del foro');

console.log(`Ecosistema 2026-11-01: todas las comprobaciones OK (corrida ${run})`);
