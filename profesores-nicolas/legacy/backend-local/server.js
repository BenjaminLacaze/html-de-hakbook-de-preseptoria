/**
 * ISFDyT N.° 26 - Sistema de Gestión Académica (SGA)
 * Backend Autónomo - Módulo Profesor / Docente
 *
 * Servidor REST HTTP autónomo desarrollado para ejecutar de forma independiente
 * o conectarse mediante contratos REST JSON estándar con el resto del ecosistema.
 *
 * Puerto por defecto: 4001 (configurable mediante PORT)
 */

import http from 'node:http';
import { URL } from 'node:url';
import { getStore, saveStore, resetStore } from './store.js';

const PORT = process.env.PORT || 4001;

// Helper para parsear JSON de la request
async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // Límite de seguridad de 2MB
      if (body.length > 2 * 1024 * 1024) {
        reject(new Error('Payload demasiado grande'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('JSON malformado'));
      }
    });
    req.on('error', reject);
  });
}

// Envío de respuestas JSON con cabeceras CORS
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(data));
}

// Envío de errores unificados
function sendError(res, statusCode, code, message, details = []) {
  sendJson(res, statusCode, {
    success: false,
    error: {
      code,
      message,
      details
    }
  });
}

// Servidor HTTP
const server = http.createServer(async (req, res) => {
  // Manejo de preflight CORS (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  const store = getStore();

  try {
    // 1. Health checks
    if (pathname === '/health' || pathname === '/api/v1/health') {
      return sendJson(res, 200, {
        success: true,
        ok: true,
        service: 'Backend Módulo Profesores - Nicolas',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    }

    // 2. Perfil del docente autenticado
    // Soporta tanto /api/v1/teachers/me como /api/v1/auth/me y /structure/teachers
    if (method === 'GET' && (pathname === '/api/v1/teachers/me' || pathname === '/api/v1/auth/me')) {
      return sendJson(res, 200, {
        success: true,
        data: store.teacher,
        user: {
          id: store.teacher.id,
          firstName: 'Martín',
          lastName: 'Soler',
          email: store.teacher.email,
          role: 'TEACHER'
        }
      });
    }

    if (method === 'GET' && pathname === '/api/v1/structure/teachers') {
      return sendJson(res, 200, [
        {
          id: store.teacher.id,
          userId: store.teacher.id,
          fileNumber: store.teacher.legajo,
          title: store.teacher.title
        }
      ]);
    }

    // 3. Comisiones
    if (method === 'GET' && (pathname === '/api/v1/commissions' || pathname === '/api/v1/structure/commissions')) {
      return sendJson(res, 200, store.commissions);
    }

    const commDetailMatch = pathname.match(/^\/api\/v1\/(?:structure\/)?commissions\/([^/]+)$/);
    if (method === 'GET' && commDetailMatch) {
      const commId = commDetailMatch[1];
      const comm = store.commissions.find(c => c.id === commId);
      if (!comm) return sendError(res, 404, 'NOT_FOUND', 'Comisión no encontrada');
      return sendJson(res, 200, comm);
    }

    // 4. Estudiantes por comisión
    const commStudentsMatch = pathname.match(/^\/api\/v1\/(?:structure\/)?commissions\/([^/]+)\/students$/);
    if (method === 'GET' && commStudentsMatch) {
      const commId = commStudentsMatch[1];
      const students = store.students.filter(s => s.commissionId === commId);
      return sendJson(res, 200, students);
    }

    // Soporte para GET /api/v1/structure/enrollments?commissionId=...
    if (method === 'GET' && pathname === '/api/v1/structure/enrollments') {
      const commId = parsedUrl.searchParams.get('commissionId');
      const filtered = commId ? store.students.filter(s => s.commissionId === commId) : store.students;
      const enrollments = filtered.map(s => ({
        id: `enr-${s.id}`,
        studentId: s.id,
        commissionId: s.commissionId,
        condition: s.status === 'REGULAR' ? 'REGULAR' : s.status === 'PROMOCIONADO' ? 'PROMOTED' : s.status === 'LIBRE' ? 'FREE' : 'IN_PROGRESS',
        enrolledAt: s.enrollmentDate
      }));
      return sendJson(res, 200, enrollments);
    }

    // Scope institucional para resolver fichas de alumnos
    if (method === 'GET' && pathname === '/api/v1/academic/scope') {
      return sendJson(res, 200, {
        students: store.students.map(s => ({
          id: s.id,
          fileNumber: s.legajo,
          dni: s.dni,
          firstName: s.firstName,
          lastName: s.lastName,
          email: s.email
        }))
      });
    }

    // 5. Clases / Sesiones de Asistencia
    const sessionsListMatch = pathname.match(/^\/api\/v1\/(?:attendance\/)?commissions\/([^/]+)\/sessions$/);
    if (method === 'GET' && sessionsListMatch) {
      const commId = sessionsListMatch[1];
      const list = store.sessions.filter(s => s.commissionId === commId);
      return sendJson(res, 200, list);
    }

    if (method === 'POST' && sessionsListMatch) {
      const commId = sessionsListMatch[1];
      const body = await parseJsonBody(req);
      if (!body.date) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'La fecha de la clase es obligatoria');
      }
      const newSession = {
        id: `ses-${Date.now()}`,
        commissionId: commId,
        date: body.date,
        topic: body.topic || '',
        isClosed: false,
        registeredCount: 0
      };
      store.sessions.push(newSession);
      saveStore(store);
      return sendJson(res, 201, newSession);
    }

    const sessionDetailMatch = pathname.match(/^\/api\/v1\/attendance\/sessions\/([^/]+)$/);
    if (method === 'GET' && sessionDetailMatch) {
      const sesId = sessionDetailMatch[1];
      const session = store.sessions.find(s => s.id === sesId);
      if (!session) return sendError(res, 404, 'NOT_FOUND', 'Sesión no encontrada');
      const records = store.attendance.filter(a => a.classSessionId === sesId);
      return sendJson(res, 200, {
        ...session,
        records: records.map(r => ({
          studentId: r.studentId,
          status: r.status === 'PRESENTE' ? 'PRESENT' : r.status === 'AUSENTE' ? 'ABSENT' : 'LATE'
        }))
      });
    }

    if (method === 'PUT' && sessionDetailMatch) {
      const sesId = sessionDetailMatch[1];
      const session = store.sessions.find(s => s.id === sesId);
      if (!session) return sendError(res, 404, 'NOT_FOUND', 'Sesión no encontrada');

      const body = await parseJsonBody(req);
      const records = body.records || [];

      // Quitar registros previos de esta sesión y agregar los nuevos
      store.attendance = store.attendance.filter(a => a.classSessionId !== sesId);
      for (const r of records) {
        store.attendance.push({
          id: `att-${sesId}-${r.studentId}`,
          classSessionId: sesId,
          studentId: r.studentId,
          status: r.status === 'PRESENT' ? 'PRESENTE' : r.status === 'ABSENT' ? 'AUSENTE' : r.status === 'LATE' ? 'TARDE' : r.status,
          recordedAt: new Date().toISOString(),
          recordedByTeacherId: store.teacher.id
        });
      }

      session.registeredCount = records.length;
      if (body.close !== undefined) {
        session.isClosed = Boolean(body.close);
      }
      saveStore(store);
      return sendJson(res, 200, {
        success: true,
        saved: records.length,
        closed: session.isClosed
      });
    }

    // 6. Observaciones Pedagógicas
    if (method === 'GET' && (pathname === '/api/v1/observations' || pathname === '/api/v1/records/observations')) {
      const commId = parsedUrl.searchParams.get('commissionId');
      const studentId = parsedUrl.searchParams.get('studentId');
      let filtered = store.observations;
      if (commId && commId !== 'TODAS') {
        filtered = filtered.filter(o => o.commissionId === commId);
      }
      if (studentId && studentId !== 'TODOS') {
        filtered = filtered.filter(o => o.studentId === studentId);
      }
      return sendJson(res, 200, filtered);
    }

    if (method === 'POST' && (pathname === '/api/v1/observations' || pathname === '/api/v1/records/observations')) {
      const body = await parseJsonBody(req);
      if (!body.commissionId || !body.studentId || !body.content) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Faltan campos obligatorios para registrar la observación');
      }
      const student = store.students.find(s => s.id === body.studentId);
      const comm = store.commissions.find(c => c.id === body.commissionId);

      const newObs = {
        id: `obs-${Date.now()}`,
        commissionId: body.commissionId,
        commissionName: comm ? comm.name : body.commissionId,
        studentId: body.studentId,
        studentName: student ? `${student.lastName}, ${student.firstName}` : 'Estudiante',
        studentLegajo: student ? student.legajo : '',
        pedagogicalDate: body.date || body.pedagogicalDate || new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
        content: body.content,
        category: body.category || 'General',
        teacherId: store.teacher.id
      };
      store.observations.push(newObs);
      saveStore(store);
      return sendJson(res, 201, newObs);
    }

    // 7. NOTAS DE PARCIALES Y FINALES (Calificaciones)
    if (method === 'GET' && (pathname === '/api/v1/grades' || pathname === '/api/v1/records/grades')) {
      const commId = parsedUrl.searchParams.get('commissionId');
      const studentId = parsedUrl.searchParams.get('studentId');
      let filtered = store.grades;
      if (commId) filtered = filtered.filter(g => g.commissionId === commId);
      if (studentId) filtered = filtered.filter(g => g.studentId === studentId);
      return sendJson(res, 200, filtered);
    }

    // Resumen consolidado de notas por comisión (1° Parcial, 2° Parcial, Recuperatorios, Final, Promedio, Condición)
    const gradesSummaryMatch = pathname.match(/^\/api\/v1\/grades\/summary\/([^/]+)$/);
    if (method === 'GET' && gradesSummaryMatch) {
      const commId = gradesSummaryMatch[1];
      const students = store.students.filter(s => s.commissionId === commId);
      const grades = store.grades.filter(g => g.commissionId === commId);

      const summary = students.map(st => {
        const p1 = grades.find(g => g.studentId === st.id && g.type === 'PARCIAL_1');
        const p2 = grades.find(g => g.studentId === st.id && g.type === 'PARCIAL_2');
        const rec1 = grades.find(g => g.studentId === st.id && g.type === 'RECUPERATORIO_1');
        const rec2 = grades.find(g => g.studentId === st.id && g.type === 'RECUPERATORIO_2');
        const finalExam = grades.find(g => g.studentId === st.id && g.type === 'FINAL');

        // Nota efectiva parcial 1 (o recuperatorio)
        const note1 = (rec1 && rec1.value !== null) ? rec1.value : (p1?.value ?? null);
        // Nota efectiva parcial 2 (o recuperatorio)
        const note2 = (rec2 && rec2.value !== null) ? rec2.value : (p2?.value ?? null);

        let average = null;
        let finalStatus = 'CURSANDO';

        if (note1 !== null && note2 !== null) {
          average = Number(((note1 + note2) / 2).toFixed(2));
          if (note1 >= 7 && note2 >= 7 && !p1?.absent && !p2?.absent) {
            finalStatus = 'PROMOCIONADO';
          } else if (note1 >= 4 && note2 >= 4) {
            finalStatus = 'REGULAR';
          } else {
            finalStatus = 'LIBRE';
          }
        } else if ((p1?.absent && !rec1) || (p2?.absent && !rec2)) {
          finalStatus = 'LIBRE';
        }

        return {
          student: st,
          parcial1: p1 || null,
          parcial2: p2 || null,
          recuperatorio1: rec1 || null,
          recuperatorio2: rec2 || null,
          finalExam: finalExam || null,
          average,
          finalStatus
        };
      });

      return sendJson(res, 200, {
        commissionId: commId,
        studentCount: students.length,
        summary
      });
    }

    if (method === 'PUT' && (pathname === '/api/v1/grades' || pathname === '/api/v1/records/grades')) {
      const body = await parseJsonBody(req);
      // Compatible con body de SaveGradeRequest: { enrollmentId o studentId, commissionId, type, instance, date, value, absent, notes }
      let studentId = body.studentId;
      let commissionId = body.commissionId;

      if (!studentId && body.enrollmentId) {
        studentId = body.enrollmentId.replace(/^enr-/, '');
      }

      if (!commissionId && studentId) {
        const st = store.students.find(s => s.id === studentId);
        if (st) commissionId = st.commissionId;
      }

      const existingIndex = store.grades.findIndex(
        g => g.studentId === studentId && g.type === body.type && g.instance === (body.instance || 1)
      );

      const gradeObj = {
        id: existingIndex >= 0 ? store.grades[existingIndex].id : `grd-${Date.now()}`,
        commissionId: commissionId || (existingIndex >= 0 ? store.grades[existingIndex].commissionId : ''),
        studentId,
        type: body.type,
        instance: body.instance || 1,
        date: body.date || new Date().toISOString().slice(0, 10),
        value: body.absent ? null : (body.value !== undefined && body.value !== null && body.value !== '' ? Number(body.value) : null),
        absent: Boolean(body.absent),
        published: existingIndex >= 0 ? store.grades[existingIndex].published : false,
        publishedAt: existingIndex >= 0 ? store.grades[existingIndex].publishedAt : null,
        notes: body.notes || ''
      };

      if (existingIndex >= 0) {
        store.grades[existingIndex] = gradeObj;
      } else {
        store.grades.push(gradeObj);
      }

      saveStore(store);
      return sendJson(res, 200, gradeObj);
    }

    if (method === 'POST' && (pathname === '/api/v1/grades/publish' || pathname === '/api/v1/records/grades/publish')) {
      const body = await parseJsonBody(req);
      const { commissionId, type, instance } = body;
      let count = 0;
      store.grades.forEach(g => {
        if ((!commissionId || g.commissionId === commissionId) && (!type || g.type === type) && (!instance || g.instance === instance)) {
          g.published = true;
          g.publishedAt = new Date().toISOString();
          count++;
        }
      });
      saveStore(store);
      return sendJson(res, 200, { success: true, published: count });
    }

    // 8. AGENDA ACADÉMICA (Calendario, parciales, finales, entregas)
    if (method === 'GET' && pathname === '/api/v1/agenda') {
      const commId = parsedUrl.searchParams.get('commissionId');
      const type = parsedUrl.searchParams.get('type');
      let list = store.agenda;
      if (commId && commId !== 'TODAS') {
        list = list.filter(e => e.commissionId === commId);
      }
      if (type && type !== 'TODOS') {
        list = list.filter(e => e.type === type);
      }
      // Ordenar por fecha ascendente
      list.sort((a, b) => a.date.localeCompare(b.date));
      return sendJson(res, 200, list);
    }

    if (method === 'POST' && pathname === '/api/v1/agenda') {
      const body = await parseJsonBody(req);
      if (!body.title || !body.date || !body.type) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Título, fecha y tipo de evento son obligatorios');
      }

      const comm = store.commissions.find(c => c.id === body.commissionId);

      const newEvent = {
        id: `ev-${Date.now()}`,
        commissionId: body.commissionId || 'com-mat-1a',
        commissionName: comm ? comm.name : (body.commissionName || 'General'),
        title: body.title,
        description: body.description || '',
        type: body.type, // 'PARCIAL' | 'FINAL' | 'RECUPERATORIO' | 'ENTREGA_TP' | 'CLASE' | 'EVENTO'
        date: body.date,
        time: body.time || '08:00',
        location: body.location || 'ISFDyT N.° 26',
        reminderDaysBefore: Number(body.reminderDaysBefore) || 2,
        isCompleted: Boolean(body.isCompleted)
      };

      store.agenda.push(newEvent);
      saveStore(store);
      return sendJson(res, 201, newEvent);
    }

    const agendaDetailMatch = pathname.match(/^\/api\/v1\/agenda\/([^/]+)$/);
    if (method === 'PUT' && agendaDetailMatch) {
      const eventId = agendaDetailMatch[1];
      const index = store.agenda.findIndex(e => e.id === eventId);
      if (index === -1) return sendError(res, 404, 'NOT_FOUND', 'Evento de agenda no encontrado');

      const body = await parseJsonBody(req);
      store.agenda[index] = {
        ...store.agenda[index],
        ...body,
        id: eventId // preservar ID
      };
      saveStore(store);
      return sendJson(res, 200, store.agenda[index]);
    }

    if (method === 'DELETE' && agendaDetailMatch) {
      const eventId = agendaDetailMatch[1];
      const prevLength = store.agenda.length;
      store.agenda = store.agenda.filter(e => e.id !== eventId);
      if (store.agenda.length === prevLength) {
        return sendError(res, 404, 'NOT_FOUND', 'Evento de agenda no encontrado');
      }
      saveStore(store);
      return sendJson(res, 200, { success: true, message: 'Evento eliminado correctamente' });
    }

    // 9. MENSAJERÍA INSTITUCIONAL
    if (method === 'GET' && pathname === '/api/v1/messages/contacts') {
      return sendJson(res, 200, store.contacts);
    }

    if (method === 'GET' && pathname === '/api/v1/messages') {
      // Retorna todos los mensajes donde participa el docente (como emisor o receptor)
      const myMessages = store.messages.filter(
        m => m.senderId === store.teacher.id || m.recipientId === store.teacher.id
      );
      // Ordenar cronológico inverso (los más recientes primero)
      myMessages.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return sendJson(res, 200, myMessages);
    }

    if (method === 'POST' && pathname === '/api/v1/messages') {
      const body = await parseJsonBody(req);
      if (!body.recipientId || !body.body) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Destinatario y contenido del mensaje son obligatorios');
      }

      const contact = store.contacts.find(c => c.id === body.recipientId);

      const newMsg = {
        id: `msg-${Date.now()}`,
        senderId: store.teacher.id,
        senderName: store.teacher.name,
        recipientId: body.recipientId,
        recipientName: contact ? contact.name : (body.recipientName || 'Destinatario'),
        subject: body.subject || 'Sin asunto',
        body: body.body,
        createdAt: new Date().toISOString(),
        isRead: false,
        category: body.category || 'ACADEMICO' // 'ACADEMICO' | 'INSTITUCIONAL' | 'DIRECTIVO'
      };

      store.messages.push(newMsg);
      saveStore(store);
      return sendJson(res, 201, newMsg);
    }

    const markReadMatch = pathname.match(/^\/api\/v1\/messages\/([^/]+)\/read$/);
    if (method === 'PATCH' && markReadMatch) {
      const msgId = markReadMatch[1];
      const msg = store.messages.find(m => m.id === msgId);
      if (!msg) return sendError(res, 404, 'NOT_FOUND', 'Mensaje no encontrado');
      msg.isRead = true;
      saveStore(store);
      return sendJson(res, 200, msg);
    }

    // 10. Restablecer datos semilla
    if (method === 'POST' && (pathname === '/api/v1/admin/reset' || pathname === '/api/v1/reset')) {
      const freshData = resetStore();
      return sendJson(res, 200, {
        success: true,
        message: 'Base de datos del Módulo Docente restablecida con éxito a la semilla inicial.',
        teacher: freshData.teacher
      });
    }

    // Ruta no encontrada
    return sendError(res, 404, 'NOT_FOUND', `Ruta inexistente: ${method} ${pathname}`);
  } catch (err) {
    console.error(`[Error 500 en ${method} ${pathname}]:`, err);
    return sendError(res, 500, 'INTERNAL_ERROR', 'Ocurrió un error inesperado en el servidor.');
  }
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  SGA ISFDyT N.° 26 - Backend Módulo Profesor / Docente`);
  console.log(`  Servidor activo en: http://localhost:${PORT}`);
  console.log(`  Health Check:       http://localhost:${PORT}/health`);
  console.log(`  Docente en sesión:  Prof. Lic. Martín Soler`);
  console.log(`=======================================================`);
});

