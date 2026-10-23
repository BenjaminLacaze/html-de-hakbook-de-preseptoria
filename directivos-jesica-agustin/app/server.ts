import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  ApiResponse,
  ApiErrorResponse,
  SaveBatchAttendanceRequest,
  SaveBatchAttendanceResponse,
  CreateStudentRequest,
  CreateUserRequest,
  SaveGradeRequest,
  CreateNoticeRequest,
} from './src/contracts/apiContract';
import { ENDPOINTS_CATALOG } from './src/contracts/endpointsCatalog';
import {
  initialUsers,
  initialCourses,
  initialStudents,
  initialTeachers,
  initialSubjects,
  initialAttendanceRecords,
  initialGradeRecords,
  initialNotices,
  initialAuditLogs,
  initialInstitutionSettings,
} from './src/data/mockData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // In-memory data store for backend API routes
  let usersDb = [...initialUsers];
  let coursesDb = [...initialCourses];
  let studentsDb = [...initialStudents];
  let attendanceDb = [...initialAttendanceRecords];
  let gradesDb = [...initialGradeRecords];
  let noticesDb = [...initialNotices];
  let auditDb = [...initialAuditLogs];
  let settingsDb = { ...initialInstitutionSettings };

  // ==========================================
  // RUTAS DEL CONTRATO DE BACKEND (/api/v1/*)
  // ==========================================

  // Endpoint para descarga directa del paquete ZIP listo para Git
  app.get('/api/download-zip', (req: Request, res: Response) => {
    const zipPath = path.resolve(__dirname, 'public', 'perfil-directivo-isfdyt26.zip');
    res.download(zipPath, 'perfil-directivo-isfdyt26.zip');
  });

  // 1. Catálogo de especificación OpenAPI / Contrato vivo
  app.get('/api/v1/spec', (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        title: 'API Perfil Directivo — ISFDyT N.° 26',
        version: '1.0.0',
        institution: settingsDb.name,
        cue: settingsDb.cue,
        endpoints: ENDPOINTS_CATALOG,
      },
      timestamp: new Date().toISOString(),
      version: 'v1',
    });
  });

  // 2. Usuarios
  app.get('/api/v1/users', (req: Request, res: Response<ApiResponse<typeof usersDb>>) => {
    const { role, status, search } = req.query;
    let filtered = [...usersDb];

    if (role && role !== 'TODOS') {
      filtered = filtered.filter((u) => u.role === role);
    }
    if (status && status !== 'TODOS') {
      filtered = filtered.filter((u) => u.status === status);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.dni.includes(q)
      );
    }

    res.json({
      success: true,
      data: filtered,
      timestamp: new Date().toISOString(),
      version: 'v1',
    });
  });

  app.post(
    '/api/v1/users',
    (req: Request<{}, {}, CreateUserRequest>, res: Response<ApiResponse<any> | ApiErrorResponse>) => {
      const { name, email, dni, role, phone, status } = req.body;

      if (!name || !email || !dni || !role) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Nombre, correo electrónico, DNI y rol son campos obligatorios.',
            field: !name ? 'name' : !email ? 'email' : !dni ? 'dni' : 'role',
          },
          timestamp: new Date().toISOString(),
          version: 'v1',
        });
      }

      // Check duplicate email
      if (usersDb.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_ENTRY',
            message: 'Ya existe un usuario con este correo electrónico institucional.',
            field: 'email',
          },
          timestamp: new Date().toISOString(),
          version: 'v1',
        });
      }

      const newUser = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        dni: dni.trim(),
        phone: phone || '',
        role,
        status: status || 'ACTIVO',
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: 'Nunca',
      };

      usersDb.unshift(newUser);

      res.status(201).json({
        success: true,
        data: newUser,
        timestamp: new Date().toISOString(),
        version: 'v1',
      });
    }
  );

  // 3. Cursos
  app.get('/api/v1/courses', (req: Request, res: Response) => {
    const cycleId = (req.query.cycleId as string) || '2026';
    const courses = coursesDb.filter((c) => c.cycleId === cycleId);
    res.json({
      success: true,
      data: courses,
      timestamp: new Date().toISOString(),
      version: 'v1',
    });
  });

  // 4. Estudiantes
  app.get('/api/v1/students', (req: Request, res: Response) => {
    const { courseId, cycleId = '2026' } = req.query;
    let filtered = studentsDb.filter((s) => s.cycleId === cycleId);
    if (courseId) {
      filtered = filtered.filter((s) => s.courseId === courseId);
    }
    res.json({
      success: true,
      data: filtered,
      timestamp: new Date().toISOString(),
      version: 'v1',
    });
  });

  app.post(
    '/api/v1/students',
    (req: Request<{}, {}, CreateStudentRequest>, res: Response<ApiResponse<any> | ApiErrorResponse>) => {
      const { dni, lastName, firstName, courseId, birthDate, tutorName, tutorPhone } = req.body;

      if (!dni || !lastName || !firstName || !courseId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'DNI, apellido, nombre y división asignada son obligatorios.',
          },
          timestamp: new Date().toISOString(),
          version: 'v1',
        });
      }

      const newStudent = {
        id: `std-${Date.now()}`,
        legajo: `LEG-2026-${String(studentsDb.length + 1).padStart(3, '0')}`,
        dni,
        lastName,
        firstName,
        birthDate: birthDate || '2004-01-01',
        tutorName: tutorName || 'A designar',
        tutorPhone: tutorPhone || '',
        tutorEmail: '',
        courseId,
        cycleId: '2026' as const,
        status: 'REGULAR' as const,
        address: 'Dolores',
      };

      studentsDb.push(newStudent);

      res.status(201).json({
        success: true,
        data: newStudent,
        timestamp: new Date().toISOString(),
        version: 'v1',
      });
    }
  );

  // 5. Asistencia en Lote
  app.post(
    '/api/v1/attendance/batch',
    (
      req: Request<{}, {}, SaveBatchAttendanceRequest>,
      res: Response<ApiResponse<SaveBatchAttendanceResponse> | ApiErrorResponse>
    ) => {
      const { courseId, date, records, cycleId = '2026' } = req.body;

      if (!courseId || !date || !Array.isArray(records)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Se requiere courseId, date y el arreglo de records de asistencia.',
          },
          timestamp: new Date().toISOString(),
          version: 'v1',
        });
      }

      let pres = 0;
      let ausInj = 0;
      let ausJust = 0;
      let tard = 0;

      records.forEach((r) => {
        if (r.status === 'PRESENTE') pres++;
        if (r.status === 'AUSENTE_INJUSTIFICADO') ausInj++;
        if (r.status === 'AUSENTE_JUSTIFICADO') ausJust++;
        if (r.status === 'TARDANZA') tard++;
      });

      res.status(200).json({
        success: true,
        data: {
          courseId,
          date,
          processedCount: records.length,
          presentes: pres,
          ausentesInjustificados: ausInj,
          ausentesJustificados: ausJust,
          tardanzas: tard,
          recordedByUserId: 'usr-1',
          updatedAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
        version: 'v1',
      });
    }
  );

  // 6. Calificaciones
  app.post(
    '/api/v1/grades',
    (req: Request<{}, {}, SaveGradeRequest>, res: Response<ApiResponse<any> | ApiErrorResponse>) => {
      const { studentId, subjectId, courseId, period, score, teacherNotes } = req.body;

      if (!studentId || !subjectId || score === undefined || score < 1 || score > 10) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'La calificación debe ser un valor numérico entre 1 y 10.',
          },
          timestamp: new Date().toISOString(),
          version: 'v1',
        });
      }

      const isApproved = score >= settingsDb.minPassingGrade;
      const gradeEntry = {
        id: `grd-${Date.now()}`,
        cycleId: '2026' as const,
        studentId,
        subjectId,
        courseId,
        period,
        score,
        isApproved,
        teacherNotes: teacherNotes || '',
        date: new Date().toISOString().split('T')[0],
      };

      gradesDb.push(gradeEntry);

      res.status(201).json({
        success: true,
        data: gradeEntry,
        timestamp: new Date().toISOString(),
        version: 'v1',
      });
    }
  );

  // 7. Circulares y Comunicados
  app.get('/api/v1/notices', (req: Request, res: Response) => {
    const cycleId = (req.query.cycleId as string) || '2026';
    res.json({
      success: true,
      data: noticesDb.filter((n) => n.cycleId === cycleId),
      timestamp: new Date().toISOString(),
      version: 'v1',
    });
  });

  app.post(
    '/api/v1/notices',
    (req: Request<{}, {}, CreateNoticeRequest>, res: Response<ApiResponse<any> | ApiErrorResponse>) => {
      const { title, content, category, recipients, status } = req.body;

      if (!title || !content) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Título y contenido son obligatorios para emitir una circular.',
          },
          timestamp: new Date().toISOString(),
          version: 'v1',
        });
      }

      const newNotice = {
        id: `not-${Date.now()}`,
        cycleId: '2026' as const,
        title,
        content,
        category: category || 'INSTITUCIONAL',
        recipients: recipients || 'TODOS',
        status: status || 'PUBLICADO',
        publishDate: new Date().toISOString().split('T')[0],
        authorName: settingsDb.principalName,
        authorRole: 'Directora',
        readCount: 0,
        isPinned: req.body.isPinned || false,
      };

      noticesDb.unshift(newNotice);

      res.status(201).json({
        success: true,
        data: newNotice,
        timestamp: new Date().toISOString(),
        version: 'v1',
      });
    }
  );

  // 8. Bitácora de Auditoría
  app.get('/api/v1/audit', (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 50;
    res.json({
      success: true,
      data: auditDb.slice(0, limit),
      timestamp: new Date().toISOString(),
      version: 'v1',
    });
  });

  // 9. Configuración Institucional
  app.get('/api/v1/settings', (req: Request, res: Response) => {
    res.json({
      success: true,
      data: settingsDb,
      timestamp: new Date().toISOString(),
      version: 'v1',
    });
  });

  // ==========================================
  // VITE DEV SERVER O STATIC FILES
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Perfil Directivo Backend] Servidor activo y escuchando en el puerto ${PORT}`);
    console.log(`[API Contract] Especificación y endpoints listados en /api/v1/spec`);
  });
}

startServer();
