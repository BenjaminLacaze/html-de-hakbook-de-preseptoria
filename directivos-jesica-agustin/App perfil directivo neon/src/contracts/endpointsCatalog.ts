/**
 * @file endpointsCatalog.ts
 * @description Catálogo documentado de todos los endpoints de la API del Perfil Directivo.
 * Sirve como especificación técnica viva y como base para el explorador de contrato en la UI.
 */

export interface EndpointDefinition {
  id: string;
  module: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  summary: string;
  description: string;
  requiredRoles: Array<'DIRECTIVO' | 'VICEDIRECTOR' | 'SECRETARIA' | 'PRECEPTORIA' | 'DOCENTE' | 'TODOS'>;
  requestBodyExample?: Record<string, any>;
  responseExample: Record<string, any>;
}

export const ENDPOINTS_CATALOG: EndpointDefinition[] = [
  // --- USUARIOS ---
  {
    id: 'get-users',
    module: 'Usuarios y Permisos',
    method: 'GET',
    path: '/api/v1/users',
    summary: 'Listar usuarios institucionales',
    description: 'Devuelve la nómina de usuarios con filtros opcionales por rol, estado y búsqueda por nombre/DNI.',
    requiredRoles: ['DIRECTIVO', 'VICEDIRECTOR', 'SECRETARIA'],
    responseExample: {
      success: true,
      data: [
        {
          id: 'usr-1',
          name: 'Lic. María Elena Rossi',
          email: 'directora.rossi@isfdyt26.edu.ar',
          role: 'DIRECTIVO',
          dni: '18.452.310',
          status: 'ACTIVO',
        },
      ],
      timestamp: '2026-10-16T12:00:00.000Z',
      version: 'v1',
    },
  },
  {
    id: 'create-user',
    module: 'Usuarios y Permisos',
    method: 'POST',
    path: '/api/v1/users',
    summary: 'Dar de alta un nuevo usuario institucional',
    description: 'Registra un usuario con su rol, DNI y correo @isfdyt26.edu.ar o @abc.gob.ar verificado.',
    requiredRoles: ['DIRECTIVO', 'SECRETARIA'],
    requestBodyExample: {
      name: 'Prof. Marcelo Benítez',
      email: 'mbenitez@isfdyt26.edu.ar',
      dni: '28.910.420',
      phone: '2245-420911',
      role: 'DOCENTE',
      status: 'ACTIVO',
    },
    responseExample: {
      success: true,
      data: {
        id: 'usr-174208000',
        name: 'Prof. Marcelo Benítez',
        role: 'DOCENTE',
        status: 'ACTIVO',
      },
      timestamp: '2026-10-16T12:01:00.000Z',
      version: 'v1',
    },
  },

  // --- CURSOS Y MATRÍCULA ---
  {
    id: 'get-courses',
    module: 'Cursos y Divisiones',
    method: 'GET',
    path: '/api/v1/courses',
    summary: 'Listar cursos y divisiones del ciclo lectivo',
    description: 'Obtiene las secciones áulicas por turno, aula asignada, preceptor y capacidad.',
    requiredRoles: ['TODOS'],
    responseExample: {
      success: true,
      data: [
        {
          id: 'c-1-1',
          cycleId: '2026',
          yearLevel: 1,
          division: '1ra',
          shift: 'MAÑANA',
          orientation: 'Profesorado en Historia',
          capacity: 35,
        },
      ],
      timestamp: '2026-10-16T12:00:00.000Z',
      version: 'v1',
    },
  },
  {
    id: 'create-student',
    module: 'Alumnos y Matrícula',
    method: 'POST',
    path: '/api/v1/students',
    summary: 'Matricular alumno en una división',
    description: 'Genera el legajo institucional único e inscribe al alumno en la división indicada.',
    requiredRoles: ['DIRECTIVO', 'SECRETARIA'],
    requestBodyExample: {
      dni: '45.109.821',
      lastName: 'Gómez',
      firstName: 'Federico',
      birthDate: '2004-03-15',
      courseId: 'c-1-1',
      cycleId: '2026',
      tutorName: 'Mariana Gómez (Madre)',
      tutorPhone: '2245-491200',
      address: 'San Martín 150, Dolores',
    },
    responseExample: {
      success: true,
      data: {
        id: 'std-174208111',
        legajo: 'LEG-2026-013',
        lastName: 'Gómez',
        firstName: 'Federico',
        status: 'REGULAR',
      },
      timestamp: '2026-10-16T12:02:00.000Z',
      version: 'v1',
    },
  },

  // --- ASISTENCIA ---
  {
    id: 'save-attendance-batch',
    module: 'Seguimiento de Asistencia',
    method: 'POST',
    path: '/api/v1/attendance/batch',
    summary: 'Asentar parte diario de asistencia en lote',
    description: 'Guarda los estados de asistencia (Presente, Ausente Injustificado, Justificado, Tardanza) para toda la división.',
    requiredRoles: ['DIRECTIVO', 'PRECEPTORIA'],
    requestBodyExample: {
      cycleId: '2026',
      courseId: 'c-1-1',
      date: '2026-10-16',
      records: [
        { studentId: 'std-1', status: 'PRESENTE' },
        { studentId: 'std-3', status: 'AUSENTE_INJUSTIFICADO', notes: 'Sin aviso de tutor' },
        { studentId: 'std-4', status: 'TARDANZA', notes: 'Ingreso 08:15 hs' },
      ],
    },
    responseExample: {
      success: true,
      data: {
        courseId: 'c-1-1',
        date: '2026-10-16',
        processedCount: 3,
        presentes: 1,
        ausentesInjustificados: 1,
        ausentesJustificados: 0,
        tardanzas: 1,
        updatedAt: '2026-10-16T12:05:00.000Z',
      },
      timestamp: '2026-10-16T12:05:00.000Z',
      version: 'v1',
    },
  },

  // --- CALIFICACIONES ---
  {
    id: 'save-grade',
    module: 'Seguimiento Académico',
    method: 'POST',
    path: '/api/v1/grades',
    summary: 'Asentar o rectificar calificación oficial',
    description: 'Registra nota numérica de 1 a 10 con observación pedagógica y validación de aprobación.',
    requiredRoles: ['DIRECTIVO', 'DOCENTE'],
    requestBodyExample: {
      cycleId: '2026',
      period: '1_TRIMESTRE',
      studentId: 'std-1',
      courseId: 'c-1-1',
      subjectId: 'sub-1',
      score: 8,
      teacherNotes: 'Excelente desempeño en monografía integradora',
    },
    responseExample: {
      success: true,
      data: {
        id: 'grd-174208999',
        score: 8,
        isApproved: true,
        period: '1_TRIMESTRE',
        date: '2026-10-16',
      },
      timestamp: '2026-10-16T12:06:00.000Z',
      version: 'v1',
    },
  },

  // --- HORARIOS ---
  {
    id: 'create-schedule-slot',
    module: 'Organización y Horarios',
    method: 'POST',
    path: '/api/v1/schedules',
    summary: 'Asignar cátedra en grilla horaria',
    description: 'Asigna profesor y materia a un módulo semanal con comprobación automática de no solapamiento.',
    requiredRoles: ['DIRECTIVO', 'VICEDIRECTOR'],
    requestBodyExample: {
      cycleId: '2026',
      courseId: 'c-1-1',
      dayOfWeek: 1,
      module: 1,
      startTime: '07:45',
      endTime: '08:45',
      subjectId: 'sub-1',
      teacherId: 'tch-3',
      classroom: 'Aula Magna 101',
    },
    responseExample: {
      success: true,
      data: {
        id: 'sch-174208444',
        courseId: 'c-1-1',
        dayOfWeek: 1,
        module: 1,
      },
      timestamp: '2026-10-16T12:07:00.000Z',
      version: 'v1',
    },
  },

  // --- CIRCULARES ---
  {
    id: 'create-notice',
    module: 'Circulares y Comunicados',
    method: 'POST',
    path: '/api/v1/notices',
    summary: 'Emitir circular oficial',
    description: 'Crea una disposición o comunicado con destinatarios y estado.',
    requiredRoles: ['DIRECTIVO', 'VICEDIRECTOR'],
    requestBodyExample: {
      cycleId: '2026',
      title: 'Circular N.° 16/2026: Acto de Cierre Lectivo',
      content: 'Pautas organizativas y designación de banderas de ceremonia.',
      category: 'INSTITUCIONAL',
      recipients: 'TODOS',
      status: 'PUBLICADO',
      isPinned: true,
    },
    responseExample: {
      success: true,
      data: {
        id: 'not-174208555',
        title: 'Circular N.° 16/2026: Acto de Cierre Lectivo',
        publishDate: '2026-10-16',
        readCount: 0,
      },
      timestamp: '2026-10-16T12:08:00.000Z',
      version: 'v1',
    },
  },

  // --- INFORMES ---
  {
    id: 'get-attendance-report',
    module: 'Informes y Estadísticas',
    method: 'GET',
    path: '/api/v1/reports/attendance?cycleId=2026',
    summary: 'Generar reporte institucional consolidado de asistencia',
    description: 'Calcula totales de presentes, inasistencias y tasas de regularidad para el Consejo Académico.',
    requiredRoles: ['DIRECTIVO', 'VICEDIRECTOR', 'SECRETARIA'],
    responseExample: {
      success: true,
      data: {
        cycleId: '2026',
        globalRate: 88,
        totalCoursesEvaluated: 6,
        generatedAt: '2026-10-16T12:09:00.000Z',
      },
      timestamp: '2026-10-16T12:09:00.000Z',
      version: 'v1',
    },
  },

  // --- BITÁCORA ---
  {
    id: 'get-audit-logs',
    module: 'Supervisión y Auditoría',
    method: 'GET',
    path: '/api/v1/audit?limit=50',
    summary: 'Consultar bitácora inmutable de auditoría',
    description: 'Devuelve los eventos administrativos registrados con marcas temporales y valores previos/nuevos.',
    requiredRoles: ['DIRECTIVO'],
    responseExample: {
      success: true,
      data: [
        {
          id: 'aud-1',
          timestamp: '2026-10-16T08:35:12.000Z',
          userName: 'Lic. María Elena Rossi',
          userRole: 'DIRECTIVO',
          module: 'Comunicados',
          action: 'CREACION',
          details: 'Emisión de Circular N.° 14/2026',
        },
      ],
      timestamp: '2026-10-16T12:10:00.000Z',
      version: 'v1',
    },
  },
];
