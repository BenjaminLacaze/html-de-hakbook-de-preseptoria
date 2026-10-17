import {
  AcademicNotice,
  AttendanceRecord,
  CalendarEvent,
  CommunityMember,
  ForumTopic,
  Grade,
  NotificationItem,
  StudentProfile,
  Subject
} from '../types';

export const MOCK_STUDENT: StudentProfile = {
  id: 'ALU-2024-00269',
  fullName: 'Julián Cámara',
  dni: '44.821.903',
  legajo: 'LEG-I26-8841',
  email: 'julian.camara@instituto26.edu.ar',
  career: 'Tecnicatura Superior en Desarrollo de Software',
  institution: 'Instituto de Educación Superior N° 26 (I26)',
  plan: 'Resolución Ministerial N° 5834/19',
  year: 2,
  division: 'Comisión B (2° B)',
  shift: 'Turno Vespertino / Noche (18:20 a 22:30)',
  status: 'Regular Activo',
  cohort: '2024',
  tutorPreceptor: 'Prof. Gabriela Santillán',
  preceptorEmail: 'preceptoria.vespertino@instituto26.edu.ar',
  emergencyContact: {
    name: 'Marta Cámara',
    relationship: 'Madre',
    phone: '+54 11 4892-1102'
  },
  address: 'Av. Corrientes 4521, CABA',
  avatarUrl: '/src/assets/images/student_avatar_julian_1792192525425.jpg'
};

export const MOCK_SUBJECTS: Subject[] = [
  {
    id: 'SUB-PROG2',
    code: 'TSDS-201',
    name: 'Programación II',
    professor: 'Lic. Martín Soria',
    professorEmail: 'm.soria@instituto26.edu.ar',
    commission: '2° B',
    year: 2,
    schedules: [
      { day: 'Lunes', startTime: '18:30', endTime: '21:00', classroom: 'Laboratorio de Software 3', modality: 'Presencial' },
      { day: 'Miércoles', startTime: '18:30', endTime: '20:10', classroom: 'Laboratorio de Software 3', modality: 'Presencial' }
    ],
    status: 'Cursando',
    attendancePercentage: 88.9,
    attendedClasses: 16,
    totalClasses: 18,
    absences: 2,
    maxAllowedAbsences: 5,
    currentAverage: 8.75,
    correlatives: ['Programación I (Aprobada)'],
    description: 'Estructuras de datos avanzadas, patrones de diseño, desarrollo orientado a componentes e integración con APIs RESTful.',
    nextExam: {
      title: '2° Examen Parcial Teórico-Práctico',
      date: '2026-11-04',
      classroom: 'Laboratorio de Software 3'
    }
  },
  {
    id: 'SUB-BBDD',
    code: 'TSDS-202',
    name: 'Bases de Datos Relacionales',
    professor: 'Prof. Valeria Rossi',
    professorEmail: 'v.rossi@instituto26.edu.ar',
    commission: '2° B',
    year: 2,
    schedules: [
      { day: 'Martes', startTime: '18:30', endTime: '21:40', classroom: 'Aula Magna 4', modality: 'Presencial' }
    ],
    status: 'Cursando',
    attendancePercentage: 90.0,
    attendedClasses: 9,
    totalClasses: 10,
    absences: 1,
    maxAllowedAbsences: 3,
    currentAverage: 8.5,
    correlatives: ['Modelado de Datos (Aprobada)'],
    description: 'Normalización de esquemas relacionales, consultas complejas SQL DQL/DML, transacciones ACID y optimización de índices.',
    nextExam: {
      title: 'Entrega Final TP Integrador SQL',
      date: '2026-10-28',
      classroom: 'Aula Magna 4'
    }
  },
  {
    id: 'SUB-REDES',
    code: 'TSDS-203',
    name: 'Arquitectura y Redes de Computadoras',
    professor: 'Ing. Carlos Méndez',
    professorEmail: 'c.mendez@instituto26.edu.ar',
    commission: '2° B',
    year: 2,
    schedules: [
      { day: 'Jueves', startTime: '18:30', endTime: '21:00', classroom: 'Laboratorio de Redes', modality: 'Presencial' }
    ],
    status: 'Cursando',
    attendancePercentage: 88.9,
    attendedClasses: 8,
    totalClasses: 9,
    absences: 1,
    maxAllowedAbsences: 3,
    currentAverage: 7.0,
    correlatives: ['Sistemas Operativos (Aprobada)'],
    description: 'Protocolos de capa de enlace, direccionamiento IPv4/IPv6, subredes, configuración de enrutadores y sockets TCP/UDP.'
  },
  {
    id: 'SUB-INGSOFT',
    code: 'TSDS-204',
    name: 'Ingeniería de Software I',
    professor: 'Dra. Elena Gómez',
    professorEmail: 'e.gomez@instituto26.edu.ar',
    commission: '2° B',
    year: 2,
    schedules: [
      { day: 'Viernes', startTime: '18:30', endTime: '21:00', classroom: 'Aula 12', modality: 'Presencial' }
    ],
    status: 'Cursando',
    attendancePercentage: 100.0,
    attendedClasses: 9,
    totalClasses: 9,
    absences: 0,
    maxAllowedAbsences: 3,
    currentAverage: 9.5,
    correlatives: ['Análisis de Sistemas (Aprobada)'],
    description: 'Ciclos de vida del software, metodologías ágiles (Scrum, Kanban), diagramas UML y especificación de requerimientos IEEE 830.'
  },
  {
    id: 'SUB-PRACTICA',
    code: 'TSDS-205',
    name: 'Práctica Profesionalizante I',
    professor: 'Lic. Roberto Benítez',
    professorEmail: 'r.benitez@instituto26.edu.ar',
    commission: '2° B',
    year: 2,
    schedules: [
      { day: 'Sábado', startTime: '09:00', endTime: '12:30', classroom: 'Laboratorio de Proyectos 1', modality: 'Presencial' }
    ],
    status: 'Cursando',
    attendancePercentage: 100.0,
    attendedClasses: 7,
    totalClasses: 7,
    absences: 0,
    maxAllowedAbsences: 2,
    currentAverage: 9.0,
    correlatives: ['1° Año Completo'],
    description: 'Desarrollo de proyectos colaborativos reales para organizaciones de la comunidad bajo estándares de la industria.'
  }
];

export const MOCK_GRADES: Grade[] = [
  {
    id: 'GRD-01',
    subjectId: 'SUB-PROG2',
    subjectName: 'Programación II',
    evaluationName: '1° Examen Parcial: POO y Algoritmos',
    type: 'Parcial',
    score: 9.0,
    minPassingScore: 4.0,
    maxScore: 10.0,
    date: '2026-09-14',
    isApproved: true,
    status: 'Publicada',
    feedback: 'Excelente dominio de polimorfismo y manejo de colecciones.',
    weightPercentage: 30
  },
  {
    id: 'GRD-02',
    subjectId: 'SUB-PROG2',
    subjectName: 'Programación II',
    evaluationName: 'Trabajo Práctico N° 1: Patrón MVC',
    type: 'Trabajo Práctico',
    score: 8.5,
    minPassingScore: 4.0,
    maxScore: 10.0,
    date: '2026-10-05',
    isApproved: true,
    status: 'Publicada',
    feedback: 'Modularización limpia; considerar tipar de forma más estricta los DTO.',
    weightPercentage: 20
  },
  {
    id: 'GRD-03',
    subjectId: 'SUB-BBDD',
    subjectName: 'Bases de Datos Relacionales',
    evaluationName: '1° Parcial: Álgebra Relacional y SQL DDL/DQL',
    type: 'Parcial',
    score: 8.5,
    minPassingScore: 4.0,
    maxScore: 10.0,
    date: '2026-09-22',
    isApproved: true,
    status: 'Publicada',
    feedback: 'Subconsultas complejas resueltas de manera óptima.',
    weightPercentage: 35
  },
  {
    id: 'GRD-04',
    subjectId: 'SUB-REDES',
    subjectName: 'Arquitectura y Redes de Computadoras',
    evaluationName: '1° Parcial: Capa de Enlace y Subnetting VLSM',
    type: 'Parcial',
    score: 7.0,
    minPassingScore: 4.0,
    maxScore: 10.0,
    date: '2026-09-17',
    isApproved: true,
    status: 'Publicada',
    feedback: 'Aprobado satisfactoriamente. Repasar cálculo de broadcast en máscaras variables.',
    weightPercentage: 30
  },
  {
    id: 'GRD-05',
    subjectId: 'SUB-INGSOFT',
    subjectName: 'Ingeniería de Software I',
    evaluationName: '1° Parcial: Historias de Usuario & Requerimientos',
    type: 'Parcial',
    score: 9.5,
    minPassingScore: 4.0,
    maxScore: 10.0,
    date: '2026-09-25',
    isApproved: true,
    status: 'Publicada',
    feedback: 'Criterios de aceptación escritos bajo estándar Gherkin impecables.',
    weightPercentage: 30
  },
  {
    id: 'GRD-06',
    subjectId: 'SUB-PRACTICA',
    subjectName: 'Práctica Profesionalizante I',
    evaluationName: 'Sprint Review 1: Arquitectura y Wireframes',
    type: 'Trabajo Práctico',
    score: 9.0,
    minPassingScore: 4.0,
    maxScore: 10.0,
    date: '2026-10-03',
    isApproved: true,
    status: 'Publicada',
    feedback: 'Presentación profesional y fundamentación sólida.',
    weightPercentage: 25
  },
  {
    id: 'GRD-07',
    subjectId: 'SUB-BBDD',
    subjectName: 'Bases de Datos Relacionales',
    evaluationName: 'TP 2: Procedimientos Almacenados y Triggers',
    type: 'Trabajo Práctico',
    score: null,
    minPassingScore: 4.0,
    maxScore: 10.0,
    date: '2026-10-14',
    isApproved: null,
    status: 'Pendiente de Publicación',
    feedback: 'Evaluación entregada. La docente se encuentra corrigiendo.',
    weightPercentage: 15
  }
];

export const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: 'ATT-20261014-PROG2',
    subjectId: 'SUB-PROG2',
    subjectName: 'Programación II',
    date: '2026-10-14',
    time: '18:32',
    status: 'Presente',
    hoursCount: 2,
    classroom: 'Laboratorio de Software 3',
    method: 'Código QR'
  },
  {
    id: 'ATT-20261013-BBDD',
    subjectId: 'SUB-BBDD',
    subjectName: 'Bases de Datos Relacionales',
    date: '2026-10-13',
    time: '18:30',
    status: 'Presente',
    hoursCount: 3,
    classroom: 'Aula Magna 4',
    method: 'Código QR'
  },
  {
    id: 'ATT-20261012-PROG2',
    subjectId: 'SUB-PROG2',
    subjectName: 'Programación II',
    date: '2026-10-12',
    time: '18:35',
    status: 'Presente',
    hoursCount: 3,
    classroom: 'Laboratorio de Software 3',
    method: 'Planilla Docente'
  },
  {
    id: 'ATT-20261009-INGSOFT',
    subjectId: 'SUB-INGSOFT',
    subjectName: 'Ingeniería de Software I',
    date: '2026-10-09',
    time: '18:25',
    status: 'Presente',
    hoursCount: 3,
    classroom: 'Aula 12',
    method: 'Código QR'
  },
  {
    id: 'ATT-20261008-REDES',
    subjectId: 'SUB-REDES',
    subjectName: 'Arquitectura y Redes de Computadoras',
    date: '2026-10-08',
    time: '18:48',
    status: 'Tardanza',
    hoursCount: 3,
    classroom: 'Laboratorio de Redes',
    method: 'Planilla Docente',
    justificationStatus: 'No Requerida'
  },
  {
    id: 'ATT-20261005-PROG2',
    subjectId: 'SUB-PROG2',
    subjectName: 'Programación II',
    date: '2026-10-05',
    time: '18:30',
    status: 'Ausente',
    hoursCount: 3,
    classroom: 'Laboratorio de Software 3',
    method: 'Planilla Docente',
    justificationStatus: 'Aprobada',
    justificationReason: 'Trámite laboral impostergable certificado por empleador.',
    justificationAttachment: 'constancia_laboral_octubre.pdf',
    justificationSubmittedAt: '2026-10-06'
  },
  {
    id: 'ATT-20260929-BBDD',
    subjectId: 'SUB-BBDD',
    subjectName: 'Bases de Datos Relacionales',
    date: '2026-09-29',
    time: '18:30',
    status: 'Ausente',
    hoursCount: 3,
    classroom: 'Aula Magna 4',
    method: 'Planilla Docente',
    justificationStatus: 'Pendiente',
    justificationReason: 'Certificado médico por consulta odontológica de urgencia.',
    justificationAttachment: 'certificado_medico_29sep.pdf',
    justificationSubmittedAt: '2026-09-30'
  },
  {
    id: 'ATT-20260924-REDES',
    subjectId: 'SUB-REDES',
    subjectName: 'Arquitectura y Redes de Computadoras',
    date: '2026-09-24',
    time: '18:30',
    status: 'Ausente',
    hoursCount: 3,
    classroom: 'Laboratorio de Redes',
    method: 'Planilla Docente',
    justificationStatus: 'Pendiente'
  },
  {
    id: 'ATT-20260921-PROG2',
    subjectId: 'SUB-PROG2',
    subjectName: 'Programación II',
    date: '2026-09-21',
    time: '18:30',
    status: 'Ausente',
    hoursCount: 2,
    classroom: 'Laboratorio de Software 3',
    method: 'Planilla Docente',
    justificationStatus: 'Pendiente'
  },
  {
    id: 'ATT-20260919-PRACTICA',
    subjectId: 'SUB-PRACTICA',
    subjectName: 'Práctica Profesionalizante I',
    date: '2026-09-19',
    time: '08:58',
    status: 'Presente',
    hoursCount: 4,
    classroom: 'Laboratorio de Proyectos 1',
    method: 'Código QR'
  }
];

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'EVT-01',
    title: 'Clase: Programación II (React y TypeScript)',
    type: 'Clase',
    subjectId: 'SUB-PROG2',
    subjectName: 'Programación II',
    date: '2026-10-19',
    startTime: '18:30',
    endTime: '21:00',
    classroom: 'Laboratorio de Software 3',
    description: 'Arquitectura de componentes, custom hooks y gestión de estado con contexto.',
    priority: 'Media'
  },
  {
    id: 'EVT-02',
    title: 'Clase: Bases de Datos Relacionales (Vistas y Transacciones)',
    type: 'Clase',
    subjectId: 'SUB-BBDD',
    subjectName: 'Bases de Datos Relacionales',
    date: '2026-10-20',
    startTime: '18:30',
    endTime: '21:40',
    classroom: 'Aula Magna 4',
    description: 'Niveles de aislamiento de transacciones y optimización mediante vistas materializadas.',
    priority: 'Media'
  },
  {
    id: 'EVT-03',
    title: 'Entrega Final TP Integrador SQL',
    type: 'Entrega TP',
    subjectId: 'SUB-BBDD',
    subjectName: 'Bases de Datos Relacionales',
    date: '2026-10-28',
    startTime: '23:59',
    endTime: '23:59',
    classroom: 'Campus Virtual I26',
    description: 'Subir repositorio Git con scripts DDL, DML y procedimientos almacenados documentados.',
    priority: 'Alta'
  },
  {
    id: 'EVT-04',
    title: '2° Examen Parcial Teórico-Práctico',
    type: 'Examen',
    subjectId: 'SUB-PROG2',
    subjectName: 'Programación II',
    date: '2026-11-04',
    startTime: '18:30',
    endTime: '21:00',
    classroom: 'Laboratorio de Software 3',
    description: 'Evaluación presencial en máquinas. POO avanzada, async/await, APIs y patrones de software.',
    priority: 'Alta'
  },
  {
    id: 'EVT-05',
    title: 'Apertura de Inscripción a Mesas de Finales (Nov/Dic)',
    type: 'Mesa Final',
    date: '2026-10-26',
    startTime: '09:00',
    endTime: '21:00',
    description: 'Habilitación del sistema de autogestión para registrarse a exámenes finales turno 1 y 2.',
    priority: 'Alta'
  },
  {
    id: 'EVT-06',
    title: 'Feriado Nacional / Receso Institucional',
    type: 'Institucional',
    date: '2026-11-20',
    startTime: '00:00',
    endTime: '23:59',
    description: 'Sin actividad académica presencial ni virtual.',
    priority: 'Baja'
  }
];

export const MOCK_NOTICES: AcademicNotice[] = [
  {
    id: 'NOT-01',
    title: 'Inscripción a Mesas de Exámenes Finales — Turno Noviembre/Diciembre 2026',
    category: 'Preceptoría',
    author: 'Gabriela Santillán',
    authorRole: 'Preceptora Turno Vespertino',
    date: '2026-10-15',
    summary: 'El período de solicitud de mesas permanecerá abierto del 26 al 31 de octubre.',
    content: 'Se recuerda a todos los estudiantes de la Tecnicatura Superior en Desarrollo de Software que para rendir materias correlativas deben tener regularizada la cursada anterior y no adeudar documentación en legajo físico.',
    isRead: false,
    priority: true
  },
  {
    id: 'NOT-02',
    title: 'Jornada Institucional de Vinculación Tecnológica y Empleo Terciario',
    category: 'Institucional',
    author: 'Secretaría de Extensión I26',
    authorRole: 'Dirección Académica',
    date: '2026-10-11',
    summary: 'Encuentro con empresas del polo tecnológico local y presentación de proyectos.',
    content: 'El próximo viernes 30 de octubre a las 19:00 hs se llevará a cabo en el Salón Auditorio la ronda anual de vinculación con empresas de software interesadas en pasantías y primer empleo IT.',
    isRead: true,
    priority: false
  },
  {
    id: 'NOT-03',
    title: 'Práctica Profesionalizante: Publicación de rúbricas para el Sprint 2',
    category: 'Materia',
    author: 'Lic. Roberto Benítez',
    authorRole: 'Docente Titular',
    date: '2026-10-08',
    summary: 'Se cargaron los criterios de evaluación de código limpio y cobertura de pruebas unitarias.',
    content: 'En la sección de materiales de Práctica Profesionalizante I se encuentra disponible la rúbrica detallada correspondiente a la entrega de la arquitectura de servicios.',
    isRead: true,
    priority: false
  }
];

export const MOCK_COMMUNITY: CommunityMember[] = [
  {
    id: 'COM-01',
    name: 'Lic. Martín Soria',
    role: 'Docente',
    roleDetail: 'Profesor Titular · Programación II',
    institutionalEmail: 'm.soria@instituto26.edu.ar',
    commission: 'Comisión 2° B',
    officeHours: 'Lunes 17:30 a 18:30 (Sala de Profesores)',
    status: 'Disponible'
  },
  {
    id: 'COM-02',
    name: 'Prof. Valeria Rossi',
    role: 'Docente',
    roleDetail: 'Profesora Titular · Bases de Datos',
    institutionalEmail: 'v.rossi@instituto26.edu.ar',
    commission: 'Comisión 2° B',
    officeHours: 'Martes 17:45 a 18:30 (Lab BBDD)',
    status: 'Disponible'
  },
  {
    id: 'COM-03',
    name: 'Gabriela Santillán',
    role: 'Preceptor',
    roleDetail: 'Preceptora General · Turno Vespertino',
    institutionalEmail: 'preceptoria.vespertino@instituto26.edu.ar',
    commission: 'Todas las comisiones 2° año',
    officeHours: 'Lunes a Viernes 18:00 a 22:00 (Oficina Preceptoría Planta Baja)',
    status: 'Disponible'
  },
  {
    id: 'COM-04',
    name: 'Ing. Carlos Méndez',
    role: 'Docente',
    roleDetail: 'Profesor Titular · Arquitectura y Redes',
    institutionalEmail: 'c.mendez@instituto26.edu.ar',
    commission: 'Comisión 2° B',
    officeHours: 'Jueves 17:30 a 18:30',
    status: 'En Clase'
  },
  {
    id: 'COM-05',
    name: 'Matías Villalba',
    role: 'Compañero',
    roleDetail: 'Delegado Estudiantil · Comisión 2° B',
    institutionalEmail: 'm.villalba@instituto26.edu.ar',
    commission: 'Comisión 2° B',
    status: 'Disponible'
  },
  {
    id: 'COM-06',
    name: 'Camila Fontana',
    role: 'Compañero',
    roleDetail: 'Estudiante · Comisión 2° B',
    institutionalEmail: 'c.fontana@instituto26.edu.ar',
    commission: 'Comisión 2° B',
    status: 'Disponible'
  },
  {
    id: 'COM-07',
    name: 'Lucas Pereyra',
    role: 'Compañero',
    roleDetail: 'Estudiante · Comisión 2° B',
    institutionalEmail: 'l.pereyra@instituto26.edu.ar',
    commission: 'Comisión 2° B',
    status: 'Disponible'
  }
];

export const MOCK_FORUMS: ForumTopic[] = [
  {
    id: 'FRM-01',
    subjectId: 'SUB-PROG2',
    subjectName: 'Programación II',
    title: 'Consulta sobre implementación de Inyección de Dependencias con TypeScript',
    authorName: 'Camila Fontana',
    authorRole: 'Estudiante (2° B)',
    isCurrentUser: false,
    createdAt: 'Hace 2 días',
    content: 'Hola a todos! Para el TP 2, ¿conviene usar un contenedor de inyección como InversifyJS o resolvemos la composición de clases manualmente en el punto de entrada de la aplicación?',
    tags: ['TypeScript', 'Arquitectura', 'TP 2'],
    isPinned: true,
    views: 84,
    replies: [
      {
        id: 'REP-01',
        topicId: 'FRM-01',
        authorName: 'Lic. Martín Soria',
        authorRole: 'Docente Titular',
        isCurrentUser: false,
        content: 'Excelente pregunta Camila. Para este práctico sugerimos composición manual en el constructor (Pure DI). De este modo afianzan el principio de Inversión de Dependencias (D de SOLID) sin depender de decoradores externos.',
        createdAt: 'Hace 1 día',
        likes: 7
      },
      {
        id: 'REP-02',
        topicId: 'FRM-01',
        authorName: 'Julián Cámara',
        authorRole: 'Estudiante (Tú)',
        isCurrentUser: true,
        content: 'Muchas gracias profesor, ya armamos la fábrica manual en el módulo de servicios y quedó clarísimo el desacople.',
        createdAt: 'Hace 18 horas',
        likes: 3
      }
    ]
  },
  {
    id: 'FRM-02',
    subjectId: 'SUB-BBDD',
    subjectName: 'Bases de Datos Relacionales',
    title: 'Duda sobre nivel de aislamiento REPEATABLE READ vs SERIALIZABLE en PostgreSQL',
    authorName: 'Lucas Pereyra',
    authorRole: 'Estudiante (2° B)',
    isCurrentUser: false,
    createdAt: 'Hace 4 días',
    content: 'Buenas tardes. Durante el laboratorio probé provocar lecturas fantasmas bajo nivel REPEATABLE READ y vi que PostgreSQL maneja MVCC evitando la anomalía. ¿En el examen entra la definición ANSI estándar o el comportamiento particular del motor?',
    tags: ['PostgreSQL', 'Transacciones', 'ACID'],
    isPinned: false,
    views: 62,
    replies: [
      {
        id: 'REP-03',
        topicId: 'FRM-02',
        authorName: 'Prof. Valeria Rossi',
        authorRole: 'Docente Titular',
        isCurrentUser: false,
        content: 'Hola Lucas. Deben conocer ambas: la definición teórica del estándar SQL-92 y la implementación práctica mediante instantáneas de PostgreSQL (Snapshot Isolation).',
        createdAt: 'Hace 3 días',
        likes: 5
      }
    ]
  },
  {
    id: 'FRM-03',
    subjectName: 'Comunidad Institucional I26',
    title: 'Grupo de estudio para preparar el 2° Parcial de Redes (Subnetting y VLANs)',
    authorName: 'Matías Villalba',
    authorRole: 'Delegado Estudiantil',
    isCurrentUser: false,
    createdAt: 'Hace 5 días',
    content: 'Compañeros, nos estamos juntando en la biblioteca los jueves de 17:00 a 18:15 antes de entrar al laboratorio de Redes para resolver ejercicios de enrutamiento estático y simulación en Packet Tracer. Los que quieran sumarse son bienvenidos.',
    tags: ['Estudio Grupal', 'Redes', 'Comisión 2° B'],
    isPinned: false,
    views: 110,
    replies: [
      {
        id: 'REP-04',
        topicId: 'FRM-03',
        authorName: 'Julián Cámara',
        authorRole: 'Estudiante (Tú)',
        isCurrentUser: true,
        content: '¡Me anoto! Llevo los resúmenes con tablas de potencias de 2 y ejercicios resueltos.',
        createdAt: 'Hace 4 días',
        likes: 4
      }
    ]
  }
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NTF-01',
    title: 'Asistencia registrada con éxito',
    message: 'Se confirmó tu presencia en Programación II (14/10/2026 - 18:32 hs)',
    timestamp: 'Hace 2 días',
    type: 'asistencia',
    read: true,
    targetSection: 'faltas'
  },
  {
    id: 'NTF-02',
    title: 'Nueva calificación publicada',
    message: 'Lic. Martín Soria publicó tu nota en TP N° 1: Patrón MVC (Nota: 8.5)',
    timestamp: 'Hace 5 días',
    type: 'calificacion',
    read: true,
    targetSection: 'notas'
  },
  {
    id: 'NTF-03',
    title: 'Aviso urgente de Preceptoría',
    message: 'Inscripción abierta a Mesas de Finales Nov/Dic 2026',
    timestamp: 'Hace 1 día',
    type: 'aviso',
    read: false,
    targetSection: 'inicio'
  },
  {
    id: 'NTF-04',
    title: 'Próxima entrega académica',
    message: 'TP Integrador SQL vence en 12 días (Bases de Datos Relacionales)',
    timestamp: 'Hoy 10:00',
    type: 'agenda',
    read: false,
    targetSection: 'agenda'
  }
];
