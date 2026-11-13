// Prueba por HTTP del Panel de Familias y sus cruces con Preceptoría y Alumnos.
// Necesita la API levantada con los datos de ejemplo (npm run db:demo-data).
//
//   node backend/test/familias-flow.mjs                      → http://127.0.0.1:4000 con la clave de prueba local
//   API_URL=https://... ACCOUNTS_PASSWORD=... node backend/test/familias-flow.mjs
const API = (process.env.API_URL ?? 'http://127.0.0.1:4000') + '/api/v1';
const PASSWORD = process.env.ACCOUNTS_PASSWORD ?? 'Prueba-I26-2026';

let failed = 0;
const check = (name, ok, extra = '') => {
  if (!ok) failed++;
  console.log(`${ok ? '  ok ' : 'FALLA'}  ${name}${extra ? `  (${extra})` : ''}`);
};

function client() {
  let cookie = '';
  const call = async (method, path, body) => {
    const res = await fetch(API + path, {
      method,
      headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const set = res.headers.getSetCookie?.() ?? [];
    if (set.length) cookie = set.map((c) => c.split(';')[0]).join('; ');
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    return { status: res.status, data };
  };
  return {
    login: (email) => call('POST', '/auth/login', { email, password: PASSWORD }),
    get: (p) => call('GET', p),
    post: (p, b) => call('POST', p, b ?? {}),
    patch: (p, b) => call('PATCH', p, b),
  };
}

const family = client();
const preceptor = client();
const student = client();

let r = await family.login('prueba.familia@isfdyt26.edu.ar');
check('la familia inicia sesión', r.status === 200 && r.data.user.roles.includes('GUARDIAN'), `HTTP ${r.status}`);
r = await preceptor.login('prueba.preceptor@isfdyt26.edu.ar');
check('Preceptoría inicia sesión', r.status === 200);
r = await student.login('prueba.alumno@isfdyt26.edu.ar');
check('el alumno inicia sesión', r.status === 200);
const studentId = r.data.studentId;

r = await family.get('/guardian/children');
const children = r.data;
check('ve a sus hijos', r.status === 200 && children.length === 2, children.map?.((c) => c.firstName).join(', '));
const own = children.find((c) => c.id === studentId);
check('uno de sus hijos es el alumno de prueba (misma ficha que el Panel de Alumnos)', Boolean(own));
const child = own ?? children[0];

r = await family.get(`/guardian/children/${child.id}/summary`);
const mine = await student.get('/me/summary');
check('el resumen de asistencia coincide con el que ve el alumno', r.status === 200 && r.data.percentage === mine.data.percentage, `${r.data.percentage}% / ${mine.data.percentage}%`);

r = await family.get(`/guardian/children/${child.id}/attendance`);
check('ve los registros de asistencia', r.status === 200 && Array.isArray(r.data), `${r.data.length} registros`);
r = await family.get(`/guardian/children/${child.id}/grades`);
check('ve las notas publicadas por materia', r.status === 200 && r.data.some((s) => s.items.length > 0), `${r.data.length} materias`);
r = await family.get('/guardian/agenda');
check('ve la agenda (institución, salidas y Centro)', r.status === 200 && r.data.length > 0, [...new Set(r.data.map((e) => e.source))].join(', '));
r = await family.get('/guardian/profile');
check('ve su ficha', r.status === 200 && r.data.children.length === 2);
r = await family.get('/guardian/contacts');
check('tiene contactos para escribir (preceptor/docentes)', r.status === 200 && r.data.length > 0, r.data.map((x) => x.role).join(', '));

// Aislamiento
const other = await preceptor.get('/structure/students');
const stranger = (other.data?.items ?? other.data ?? []).find?.((s) => !children.some((c) => c.id === s.id));
if (stranger) {
  r = await family.get(`/guardian/children/${stranger.id}/summary`);
  check('no puede ver a un alumno que no es su hijo (404)', r.status === 404, `HTTP ${r.status}`);
}
r = await student.get('/guardian/children');
check('un alumno no entra a las rutas de Familias (403)', r.status === 403, `HTTP ${r.status}`);
r = await family.get('/me/student');
check('la familia no entra a las rutas del alumno (403)', r.status === 403, `HTTP ${r.status}`);

// Comunicados
r = await family.get('/guardian/notices');
const notice = r.data.find((n) => !n.readByGuardian) ?? r.data[0];
check('recibe comunicados', r.status === 200 && r.data.length > 0, `${r.data.length}`);
if (notice) {
  r = await family.post(`/guardian/notices/${notice.id}/read`);
  const again = await family.get('/guardian/notices');
  check('el acuse de lectura queda guardado', r.status === 200 && again.data.find((n) => n.id === notice.id).readByGuardian);
}

// Cruce 1: Familia → Preceptoría → Familia y Alumno (justificación)
const far = new Date(Date.now() + (200 + Math.floor(Math.random() * 3000)) * 86400000).toISOString().slice(0, 10);
r = await family.post(`/guardian/children/${child.id}/justifications`, { fromDate: far, toDate: far, reason: 'Turno médico (prueba automática).', documentType: 'MEDICAL', documentName: 'certificado.pdf' });
check('la familia presenta una justificación', r.status === 201, `HTTP ${r.status}`);
const justId = r.data?.id;
r = await preceptor.get('/attendance/justifications?status=PENDING');
check('Preceptoría la recibe como pendiente', (r.data ?? []).some((j) => j.id === justId));
r = await preceptor.patch(`/attendance/justifications/${justId}`, { status: 'APPROVED', reviewNotes: 'Recibido.' });
check('Preceptoría la aprueba', r.status === 200, `HTTP ${r.status}`);
r = await family.get(`/guardian/children/${child.id}/justifications`);
check('la familia la ve aprobada', r.data.find((j) => j.id === justId)?.status === 'APPROVED');
if (own) {
  r = await student.get('/me/justifications');
  check('el alumno también la ve en su panel', r.data.some((j) => j.id === justId && j.status === 'APPROVED'));
}

// Cruce 2: Preceptoría → Familia → Preceptoría (autorización)
r = await preceptor.post('/families/authorizations', { title: `Salida de prueba ${far}`, type: 'FIELD_TRIP', description: 'Autorización creada por la prueba automática.', deadlineDate: far, dateOfEvent: far, destination: 'Museo', studentIds: [child.id] });
check('Preceptoría pide una autorización', r.status === 201, `HTTP ${r.status}`);
const requestId = r.data?.id;
r = await family.get('/guardian/authorizations');
const auth = r.data.find((a) => a.title === `Salida de prueba ${far}`);
check('la familia la recibe pendiente', auth?.response === 'PENDING');
r = await family.patch(`/guardian/authorizations/${auth.id}`, { response: 'APPROVED' });
check('la familia la autoriza', r.status === 200 && r.data.response === 'APPROVED');
r = await family.patch(`/guardian/authorizations/${auth.id}`, { response: 'REJECTED' });
check('no se puede responder dos veces (409)', r.status === 409, `HTTP ${r.status}`);
r = await preceptor.get('/families/authorizations');
check('Preceptoría ve la respuesta', r.data.find((a) => a.id === requestId)?.counts.approved === 1);

// Cruce 3: mensajes Familia ↔ Preceptoría
const contacts = (await family.get('/guardian/contacts')).data;
const prec = contacts.find((x) => x.role === 'PRECEPTOR');
r = await family.post('/social/messages', { receiverId: prec.userId, text: `Consulta de prueba ${far}` });
check('la familia le escribe a Preceptoría', r.status === 201);
r = await preceptor.get('/social/messages/conversations');
check('Preceptoría recibe el mensaje', r.data.some((cv) => cv.lastMessage.text === `Consulta de prueba ${far}`));

// Corrección de datos
r = await family.post('/guardian/corrections', { phone: '2245 15-411111', notes: 'Cambié de número.' });
check('pide corregir sus datos (201, o 409 si ya tenía uno pendiente)', r.status === 201 || r.status === 409, `HTTP ${r.status}`);
r = await preceptor.get('/families/corrections');
const pending = r.data.find((x) => x.status === 'PENDING');
check('Preceptoría ve el pedido', Boolean(pending));
if (pending) {
  r = await preceptor.patch(`/families/corrections/${pending.id}`, { status: 'APPROVED' });
  const profile = await family.get('/guardian/profile');
  check('al aceptarlo, la ficha queda actualizada', r.status === 200 && profile.data.phone === pending.requestedFields.phone, profile.data.phone);
}

console.log(failed ? `\n${failed} verificación(es) fallaron.` : '\nTodo en orden.');
process.exit(failed ? 1 : 0);
