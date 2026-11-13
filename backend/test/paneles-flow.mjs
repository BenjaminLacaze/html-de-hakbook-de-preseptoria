// Prueba HTTP de lo agregado el 2026-11-01 para los paneles de Alumno, Preceptoría y Auxiliares:
// comunicados leídos, justificación pedida por el alumno, pedidos de corrección,
// asistencia por QR y turnos/cambios de turno.
// Solo contra la API QA local (127.0.0.1:4052 → PostgreSQL 127.0.0.1:5452/qa_i26). Ver test/README.md.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';

const base = new URL(process.env.API_TEST_URL);
const m = JSON.parse(await readFile(process.env.TEST_FIXTURE_MANIFEST, 'utf8'));
assert.equal(base.hostname, '127.0.0.1');
assert.equal(base.port, '4052');
assert.equal(m.database, '127.0.0.1:5452/qa_i26');
assert.equal(m.prefix, 'QA-I26');

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

const [d, p, t, a, a2, staff] = await Promise.all(['director', 'preceptor', 'teacher1', 'student1', 'student2', 'staff'].map(client));
const s1 = m.scenarios.find((s) => s.index === 1);
const run = randomBytes(3).toString('hex');

// Fecha libre: posterior a cualquier justificación previa del alumno, para poder repetir la prueba.
let day = new Date('2031-01-01T00:00:00Z');
for (const j of await a('/me/justifications')) {
  const end = new Date(j.toDate);
  if (end >= day) day = new Date(end.getTime() + 86400000);
}
const date = day.toISOString().slice(0, 10);

// ---------------------------------------------------------------- comunicados leídos
const notice = await d('/records/notices', 'POST', {
  title: `QA-I26 lectura ${run}`, content: 'Comunicado de prueba', category: 'INSTITUTIONAL', audience: { roles: ['STUDENT'] }, publish: true,
}, 201);
let seen = (await a('/records/notices')).find((n) => n.id === notice.id);
assert.ok(seen && seen.readAt === undefined, 'el comunicado aparece sin leer');
const read1 = await a(`/records/notices/${notice.id}/read`, 'POST', {});
const read2 = await a(`/records/notices/${notice.id}/read`, 'POST', {});
assert.equal(read1.readAt, read2.readAt, 'marcar dos veces conserva la primera fecha');
seen = (await a('/records/notices')).find((n) => n.id === notice.id);
assert.equal(seen.readAt, read1.readAt);
assert.equal((await a2('/records/notices')).find((n) => n.id === notice.id).readAt, undefined, 'la lectura es por usuario');
await staff(`/records/notices/${notice.id}/read`, 'POST', {}, 404);
console.log('OK comunicados: leído por usuario, idempotente y oculto para quien no es destinatario');

// ------------------------------------------------- justificación pedida por el alumno
await a('/me/justifications', 'POST', { fromDate: date, toDate: '2030-01-01', reason: 'QA-I26 fechas invertidas' }, 400);
const j = await a('/me/justifications', 'POST', { fromDate: date, toDate: date, reason: `QA-I26 pedido del alumno ${run}` }, 201);
assert.equal(j.status, 'PENDING');
await a('/me/justifications', 'POST', { fromDate: date, toDate: date, reason: 'QA-I26 superpuesta' }, 409);
assert.ok((await p(`/attendance/justifications?studentId=${s1.studentId}`)).some((x) => x.id === j.id && x.createdBy !== undefined));
await p(`/attendance/justifications/${j.id}`, 'PATCH', { status: 'APPROVED' });
assert.equal((await a('/me/justifications')).find((x) => x.id === j.id).status, 'APPROVED');
await staff('/me/justifications', 'POST', { fromDate: date, toDate: date, reason: 'QA-I26 sin permiso' }, 403);
console.log('OK justificación: el alumno la pide, superposición 409, Preceptoría la aprueba');

// --------------------------------------------------------- pedidos de corrección
const before = await a('/me/student');
const corr = await a('/me/corrections', 'POST', { field: 'PHONE', proposedValue: `+54 9 0000 ${run}`, reason: 'QA-I26 corrección' }, 201);
assert.equal(corr.status, 'PENDING');
assert.equal(corr.currentValue, before.phone ?? undefined, 'el valor actual sale de la ficha');
await a('/me/corrections', 'POST', { field: 'PHONE', proposedValue: 'otro', reason: 'QA-I26 duplicado' }, 409);
await t('/structure/corrections', 'GET', undefined, 403);
assert.ok((await p('/structure/corrections?status=PENDING')).some((x) => x.id === corr.id));
const done = await p(`/structure/corrections/${corr.id}`, 'PATCH', { status: 'REJECTED', reviewNotes: 'QA-I26' });
assert.equal(done.status, 'REJECTED');
await p(`/structure/corrections/${corr.id}`, 'PATCH', { status: 'APPROVED' }, 409);
assert.equal((await a('/me/corrections')).find((x) => x.id === corr.id).status, 'REJECTED');
assert.equal((await a('/me/student')).phone, before.phone, 'resolver el pedido no cambia la ficha');
await staff('/me/corrections', 'GET', undefined, 403);
console.log('OK corrección: valor actual desde la ficha, duplicado 409, Docente 403, resuelta una sola vez');

// --------------------------------------------------------------- asistencia por QR
const session = await d(`/attendance/commissions/${s1.commissionId}/sessions`, 'POST', { date, topic: `QA-I26 QR ${run}` });
const qr1 = await t(`/attendance/sessions/${session.id}/qr`, 'POST', { minutes: 5 }, 201);
assert.match(qr1.code, /^[A-Z2-9]{5}-[A-Z2-9]{5}$/);
await a('/me/attendance/qr', 'POST', { code: 'ZZZZZ-ZZZZZ' }, 404);
await a2('/me/attendance/qr', 'POST', { code: qr1.code }, 404); // no está inscripto en esa comisión
const tipeado = qr1.code.toLowerCase().replace('-', ' ');
const ok = await a('/me/attendance/qr', 'POST', { code: tipeado }, 201);
assert.deepEqual([ok.status, ok.alreadyRegistered, ok.sessionId], ['PRESENT', false, session.id]);
const again = await a('/me/attendance/qr', 'POST', { code: qr1.code });
assert.equal(again.alreadyRegistered, true, 'el segundo escaneo no duplica');
const sheet = await t(`/attendance/sessions/${session.id}`);
assert.equal(sheet.records.filter((r) => r.studentId === s1.studentId).length, 1);
assert.ok((await a(`/me/attendance?commissionId=${s1.commissionId}`)).some((r) => r.sessionId === session.id && r.source === 'QR'));
const qr2 = await t(`/attendance/sessions/${session.id}/qr`, 'POST', {}, 201);
await a('/me/attendance/qr', 'POST', { code: qr1.code }, 404); // el código anterior quedó anulado
await t(`/attendance/sessions/${session.id}/qr`, 'DELETE', undefined, 204);
await a('/me/attendance/qr', 'POST', { code: qr2.code }, 404);
await a(`/attendance/sessions/${session.id}/qr`, 'POST', {}, 403);
console.log('OK QR: registra PRESENT con origen QR, sin duplicar; códigos anulados e inscripción validados');

// ------------------------------------------------------------ turnos de Auxiliares
const email = `qa-i26-staff2-${run}@example.invalid`;
const created = await d('/users', 'POST', { email, firstName: 'QA-I26', lastName: `Auxiliar ${run}`, roles: ['STAFF'] }, 201);
const staff2pass = `QA-${randomBytes(9).toString('base64url')}`;
const staff2first = await login(email, created.temporaryPassword, 'staff2');
await staff2first('/auth/change-password', 'POST', { currentPassword: created.temporaryPassword, newPassword: staff2pass });
const staff2 = await login(email, staff2pass, 'staff2');
const staffMe = await staff('/auth/me');
const staffId = (staffMe.user ?? staffMe).id;
const staff2Id = created.user.id;
assert.ok((await staff('/staff/people')).some((x) => x.id === staff2Id));

const dayA = date;
const dayB = new Date(day.getTime() + 86400000).toISOString().slice(0, 10);
const mine = await d('/staff/shifts', 'POST', { userId: staffId, date: dayA, startTime: '07:00', endTime: '13:00' }, 201);
const theirs = await d('/staff/shifts', 'POST', { userId: staff2Id, date: dayB, startTime: '13:00', endTime: '19:00' }, 201);
await d('/staff/shifts', 'POST', { userId: staffId, date: dayA }, 409); // sin horario = todo el día: se superpone
await d('/staff/shifts', 'POST', { userId: staffId, date: dayA, startTime: '12:00', endTime: '14:00' }, 409);
await d('/staff/shifts', 'POST', { userId: staffId, date: dayA, startTime: '15:00', endTime: '14:00' }, 400);
await staff('/staff/shifts', 'POST', { userId: staffId, date: dayB }, 403);
await d('/staff/shifts', 'POST', { userId: s1.studentId, date: dayA }, 404);

const change = await staff('/staff/shift-changes', 'POST', { requesterShiftId: mine.id, colleagueShiftId: theirs.id, reason: 'QA-I26' }, 201);
assert.equal(change.status, 'PENDING');
await staff('/staff/shift-changes', 'POST', { requesterShiftId: mine.id, colleagueShiftId: theirs.id }, 409);
await staff2('/staff/shift-changes', 'POST', { requesterShiftId: mine.id, colleagueShiftId: theirs.id }, 404); // no es su turno
await staff(`/staff/shift-changes/${change.id}`, 'PATCH', { status: 'ACCEPTED' }, 403); // responde el compañero
assert.ok((await staff2('/staff/shift-changes?status=PENDING')).some((x) => x.id === change.id));
const accepted = await staff2(`/staff/shift-changes/${change.id}`, 'PATCH', { status: 'ACCEPTED' });
assert.equal(accepted.status, 'ACCEPTED');
const shifts = await staff(`/staff/shifts?from=${dayA}&to=${dayB}`);
assert.equal(shifts.find((x) => x.id === mine.id).userId, staff2Id, 'el turno A pasó al compañero');
assert.equal(shifts.find((x) => x.id === theirs.id).userId, staffId, 'el turno B pasó a quien lo pidió');
assert.ok(shifts.filter((x) => [mine.id, theirs.id].includes(x.id)).every((x) => x.type === 'SWAP'));
await staff2(`/staff/shift-changes/${change.id}`, 'PATCH', { status: 'REJECTED' }, 409);
await a('/staff/shifts', 'GET', undefined, 403);

// Mismo día, mañana ↔ tarde (el caso más común): se permite y se intercambia.
const morning = await d('/staff/shifts', 'POST', { userId: staffId, date: dayA, startTime: '13:00', endTime: '15:00' }, 201); // staff ya no tiene dayA
const afternoon = await d('/staff/shifts', 'POST', { userId: staff2Id, date: dayA, startTime: '15:00', endTime: '19:00' }, 201); // staff2 tiene dayA 07–13
const sameDay = await staff('/staff/shift-changes', 'POST', { requesterShiftId: morning.id, colleagueShiftId: afternoon.id }, 201);
await staff2(`/staff/shift-changes/${sameDay.id}`, 'PATCH', { status: 'ACCEPTED' });
const dayAShifts = await staff(`/staff/shifts?from=${dayA}&to=${dayA}`);
assert.equal(dayAShifts.find((x) => x.id === morning.id).userId, staff2Id);
assert.equal(dayAShifts.find((x) => x.id === afternoon.id).userId, staffId);
// Un cambio que dejaría turnos superpuestos se rechaza al pedirlo: staff2 ya trabaja dayA 07–13.
const early = await d('/staff/shifts', 'POST', { userId: staffId, date: dayA, startTime: '08:00', endTime: '10:00' }, 201);
const clash = await d('/staff/shifts', 'POST', { userId: staff2Id, date: dayB, startTime: '08:00', endTime: '10:00' }, 201);
await staff2('/staff/shift-changes', 'POST', { requesterShiftId: clash.id, colleagueShiftId: early.id }, 409);

// Limpieza: los turnos de prueba se borran (los pedidos se van en cascada). La cuenta QA queda inactiva.
for (const id of [mine.id, theirs.id, morning.id, afternoon.id, early.id, clash.id]) await d(`/staff/shifts/${id}`, 'DELETE', undefined, 204);
await d(`/users/${staff2Id}`, 'PATCH', { status: 'INACTIVE' });
console.log('OK turnos: alta por Directivos, superposición 409, cambio entre días y mañana↔tarde intercambian titulares, permisos por rol');

console.log(`Paneles 2026-11-01: todas las comprobaciones OK (fecha de prueba ${date}, corrida ${run})`);
