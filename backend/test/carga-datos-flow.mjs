// Recorrido: Preceptoría carga carrera → plan → materia → docente → ciclo → curso → alumno →
// inscripción → tutor, y se comprueba que lo vean el profesor y el alumno. Un docente no puede cargar.
const API = (process.env.API_URL ?? 'http://127.0.0.1:4053') + '/api/v1';
const PASSWORD = 'Prueba-I26-2026';
let fallas = 0;

const ok = (nombre, cond, detalle = '') => {
  console.log(`${cond ? '  ok  ' : 'FALLA '} ${nombre}${detalle ? `  (${detalle})` : ''}`);
  if (!cond) fallas++;
};

function cliente() {
  let cookie = '';
  return {
    async call(method, path, body) {
      const r = await fetch(API + path, {
        method,
        headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const set = r.headers.get('set-cookie');
      if (set) cookie = set.split(';')[0];
      let data = null;
      try { data = await r.json(); } catch {}
      return { status: r.status, data };
    },
    get(p) { return this.call('GET', p); },
    post(p, b) { return this.call('POST', p, b); },
    put(p, b) { return this.call('PUT', p, b); },
    patch(p, b) { return this.call('PATCH', p, b); },
    login(email) { return this.call('POST', '/auth/login', { email, password: PASSWORD }); },
  };
}

const lista = (d) => (Array.isArray(d) ? d : (d?.items ?? []));
const err = (r) => `HTTP ${r.status}${r.data?.error?.message ? ' ' + r.data.error.message : ''}${r.data?.error?.details ? ' ' + JSON.stringify(r.data.error.details).slice(0, 130) : ''}`;

const preceptor = cliente(), docente = cliente(), direccion = cliente(), alumno = cliente();
const sufijo = Date.now().toString().slice(-6);

let r = await preceptor.login('prueba.preceptor@isfdyt26.edu.ar');
ok('Preceptoria inicia sesion', r.status === 200, err(r));
r = await docente.login('prueba.profesor@isfdyt26.edu.ar');
ok('un docente inicia sesion', r.status === 200, err(r));
r = await direccion.login('prueba.directivo@isfdyt26.edu.ar');
ok('Direccion inicia sesion', r.status === 200, err(r));

// ---------- Estructura academica cargada por Preceptoria (lo nuevo) ----------
r = await preceptor.post('/structure/careers', { code: 'TST' + sufijo, name: 'Carrera de prueba ' + sufijo, durationYears: 3 });
ok('Preceptoria crea una CARRERA', r.status === 201, err(r));
const careerId = r.data?.id;

r = await preceptor.post('/structure/plans', { careerId, code: 'PL' + sufijo, name: 'Plan 2026', startYear: 2026 });
ok('Preceptoria crea un PLAN', r.status === 201, err(r));
const planId = r.data?.id;

r = await preceptor.post('/structure/subjects', { planId, code: 'MAT' + sufijo, name: 'Materia de prueba ' + sufijo, year: 1, period: 'FIRST_TERM', weeklyHours: 4 });
ok('Preceptoria crea una MATERIA', r.status === 201, err(r));
const subjectId = r.data?.id;

r = await preceptor.post('/structure/teachers', { fileNumber: 'LEG' + sufijo, dni: '40' + sufijo, firstName: 'Ana', lastName: 'Docente', email: 'ana.docente.' + sufijo + '@isfdyt26.edu.ar', title: 'Profesora' });
ok('Preceptoria crea un DOCENTE', r.status === 201, err(r));

// Ciclo lectivo: se crea sin estado y se activa con un PATCH aparte.
let cycleId = (await preceptor.get('/academic/cycles/active')).data?.id;
if (!cycleId) {
  r = await preceptor.post('/structure/cycles', { year: 2026, startDate: '2026-03-02', endDate: '2026-12-18', firstTermEndDate: '2026-07-10' });
  if (r.status === 409) {
    const todos = await direccion.get('/structure/cycles');
    cycleId = lista(todos.data).find((x) => x.year === 2026)?.id;
    ok('el ciclo lectivo 2026 ya existia', Boolean(cycleId));
  } else {
    ok('Preceptoria crea el CICLO LECTIVO', r.status === 201, err(r));
    cycleId = r.data?.id;
  }
  r = await preceptor.patch('/structure/cycles/' + cycleId, { status: 'ACTIVE' });
  ok('Preceptoria ACTIVA el ciclo lectivo', r.status === 200, err(r));
} else {
  ok('hay un ciclo lectivo activo', true);
}

// El docente de prueba, para que el curso quede a su nombre y lo vea en su panel.
// Ficha del docente de prueba, vinculada a su cuenta (para comprobar que vea el curso en su panel).
const yo = (await docente.get('/auth/me')).data;
const docenteUserId = yo?.user?.id ?? yo?.id;
r = await direccion.get('/structure/teachers');
let docentePrueba = lista(r.data).find((t) => t.email === 'prueba.profesor@isfdyt26.edu.ar');
if (!docentePrueba) {
  const alta = await preceptor.post('/structure/teachers', { fileNumber: 'PRF' + sufijo, dni: '20' + sufijo, firstName: 'Profesor', lastName: 'De Prueba', email: 'prueba.profesor@isfdyt26.edu.ar', title: 'Profesor' });
  ok('se crea la ficha del docente de prueba', alta.status === 201, err(alta));
  docentePrueba = alta.data;
}
if (docentePrueba && !docentePrueba.userId && docenteUserId) {
  const v = await direccion.patch('/structure/teachers/' + docentePrueba.id, { userId: docenteUserId });
  ok('la ficha del docente queda vinculada a su cuenta', v.status === 200, err(v));
}
ok('existe la ficha del docente de prueba', Boolean(docentePrueba));

r = await preceptor.post('/structure/commissions', {
  code: 'CUR' + sufijo, cycleId, subjectId, period: 'FIRST_TERM', shift: 'EVENING',
  teacherIds: docentePrueba ? [docentePrueba.id] : [],
  capacity: 30,
  schedule: [{ weekday: 3, startTime: '18:00', endTime: '20:00', classroom: 'Aula 3' }],
});
ok('Preceptoria crea un CURSO con horario y docente', r.status === 201, err(r));
const commissionId = r.data?.id;

// ---------- Un docente NO puede cargar estructura ----------
r = await docente.post('/structure/careers', { code: 'NO' + sufijo, name: 'No deberia entrar', durationYears: 1 });
ok('un docente NO puede crear una carrera (403)', r.status === 403, err(r));
r = await docente.post('/structure/commissions', { code: 'NO' + sufijo, cycleId, subjectId, period: 'FIRST_TERM', shift: 'EVENING', schedule: [] });
ok('un docente NO puede crear un curso (403)', r.status === 403, err(r));

// ---------- Alumno e inscripcion ----------
r = await preceptor.post('/structure/students', {
  fileNumber: 'AL' + sufijo, dni: '45' + sufijo, firstName: 'Nuevo', lastName: 'Alumno' + sufijo,
  email: 'alumno.' + sufijo + '@isfdyt26.edu.ar', careerId, planId, admissionDate: '2026-03-02',
});
ok('Preceptoria crea un ALUMNO', r.status === 201, err(r));
const studentId = r.data?.id;

r = await preceptor.post('/structure/enrollments', { studentId, commissionId });
ok('Preceptoria INSCRIBE al alumno en el curso', r.status === 201, err(r));

// ---------- Lo cargado se ve en los otros paneles ----------
// Vuelve a iniciar sesion: su ficha quedo vinculada despues del primer ingreso.
await docente.login('prueba.profesor@isfdyt26.edu.ar');
r = await docente.get('/academic/scope');
const enScope = JSON.stringify(r.data ?? {}).includes('Materia de prueba ' + sufijo);
ok('el PROFESOR ve la materia nueva entre las suyas', enScope, enScope ? '' : 'no aparece en /academic/scope');
// Prueba fuerte: puede abrir la planilla de ese curso (si no fuera suyo, daria 403).
const clases = await docente.get('/attendance/commissions/' + commissionId + '/sessions');
ok('el PROFESOR puede abrir la planilla de ese curso', clases.status === 200, err(clases));
const suCurso = await docente.get('/structure/commissions');
const loVe = JSON.stringify(lista(suCurso.data)).includes(commissionId);
ok('el curso nuevo figura entre los del profesor', loVe, loVe ? '' : 'no figura en /structure/commissions');

r = await alumno.login('prueba.alumno@isfdyt26.edu.ar');
const studentIdPrueba = r.data?.studentId;
if (studentIdPrueba) {
  const ins = await preceptor.post('/structure/enrollments', { studentId: studentIdPrueba, commissionId });
  ok('inscribe tambien al alumno de prueba', [201, 409].includes(ins.status), err(ins));
  r = await alumno.get('/me/subjects');
  const texto = JSON.stringify(lista(r.data));
  const laVe = texto.includes(commissionId) || texto.includes('Materia de prueba ' + sufijo);
  ok('el ALUMNO ve la materia nueva en su panel', laVe, laVe ? '' : texto.slice(0, 160));
}

// ---------- Padre o tutor cargado por Preceptoria (lo nuevo) ----------
r = await direccion.post('/users', { email: 'tutor.' + sufijo + '@isfdyt26.edu.ar', firstName: 'Carla', lastName: 'Tutora' + sufijo, roles: ['GUARDIAN'] });
ok('Direccion crea la cuenta del tutor', r.status === 201, err(r));
const tutorUserId = r.data?.id ?? r.data?.user?.id;
const claveTemporal = r.data?.temporaryPassword ?? r.data?.password;

r = await preceptor.put('/families/guardians/' + tutorUserId, {
  dni: '30' + sufijo, phone: '2245-400000', address: 'Calle falsa 123', occupation: 'Empleada',
  children: [{ studentId, relationship: 'MOTHER' }],
});
ok('Preceptoria carga la ficha del TUTOR y le asigna el alumno', [200, 201].includes(r.status), err(r));

r = await preceptor.get('/families/guardians');
const fichas = lista(r.data);
const ficha = fichas.find((g) => g.userId === tutorUserId || g.email === 'tutor.' + sufijo + '@isfdyt26.edu.ar');
const tieneAlHijo = JSON.stringify(ficha ?? {}).includes(studentId) || JSON.stringify(ficha ?? {}).includes('Alumno' + sufijo);
ok('el vinculo tutor-alumno queda guardado', tieneAlHijo, tieneAlHijo ? '' : JSON.stringify(ficha ?? fichas).slice(0, 220));

// El tutor entra con su clave temporal y ve al alumno a su cargo.
if (claveTemporal) {
  const tutor = cliente();
  const login = await tutor.call('POST', '/auth/login', { email: 'tutor.' + sufijo + '@isfdyt26.edu.ar', password: claveTemporal });
  ok('el tutor inicia sesion con su clave temporal', login.status === 200, err(login));
  if (login.data?.mustChangePassword) {
    await tutor.post('/auth/change-password', { currentPassword: claveTemporal, newPassword: 'Tutor-I26-2026!' });
  }
  const hijos = await tutor.get('/guardian/children');
  const losVe = JSON.stringify(lista(hijos.data)).includes('Alumno' + sufijo);
  ok('el TUTOR ve al alumno a su cargo', hijos.status === 200 && losVe, losVe ? '' : err(hijos) + ' ' + JSON.stringify(hijos.data).slice(0, 160));
} else {
  console.log('  --   (la creacion de la cuenta no devolvio clave temporal; no se probo el ingreso del tutor)');
}

console.log(fallas === 0 ? '\nTodo en orden.' : '\n' + fallas + ' comprobacion(es) fallaron.');
process.exit(fallas === 0 ? 0 : 1);
