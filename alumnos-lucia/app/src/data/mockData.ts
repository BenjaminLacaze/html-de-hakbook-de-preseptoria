/**
 * Datos ficticios y coherentes de demostración para el Módulo Alumno
 * Sistema de Asistencia Escolar
 * Responsable: Lucia Salgado
 */

import { StudentProfile, AttendanceRecord } from '../types';

export const DEMO_STUDENT: StudentProfile = {
  id: 'std_01',
  legajo: 'ALU-2024-8841',
  dni: '41.982.314',
  firstName: 'Lucia',
  lastName: 'Salgado',
  email: 'lucia.salgado@alumnos.i26.edu.ar',
  career: 'Tecnicatura Superior en Desarrollo de Software',
  institution: 'Instituto Superior de Educación Técnica N° 26',
  institutionShort: 'I26',
  year: '2° Año',
  division: 'División B',
  shift: 'Turno Tarde (13:30 a 18:00 hs)',
  academicYear: 2026,
  enrollmentStatus: 'ACTIVO',
  minimumAttendanceRequired: 75,
  minimumJustifiedAttendanceRequired: 60,
  preceptorContact: {
    name: 'Prof. Marcelo Gómez',
    email: 'preceptoria.tarde@i26.edu.ar',
    office: 'Oficina de Preceptoría - Planta Baja, Ala Este'
  }
};

export const DEMO_STUDENT_AT_RISK: StudentProfile = {
  id: 'std_02',
  legajo: 'ALU-2024-8902',
  dni: '43.104.552',
  firstName: 'Agustín',
  lastName: 'Méndez',
  email: 'agustin.mendez@alumnos.i26.edu.ar',
  career: 'Tecnicatura Superior en Desarrollo de Software',
  institution: 'Instituto Superior de Educación Técnica N° 26',
  institutionShort: 'I26',
  year: '2° Año',
  division: 'División B',
  shift: 'Turno Tarde (13:30 a 18:00 hs)',
  academicYear: 2026,
  enrollmentStatus: 'CONDICIONAL',
  minimumAttendanceRequired: 75,
  minimumJustifiedAttendanceRequired: 60,
  preceptorContact: {
    name: 'Prof. Marcelo Gómez',
    email: 'preceptoria.tarde@i26.edu.ar',
    office: 'Oficina de Preceptoría - Planta Baja, Ala Este'
  }
};

// Registros de asistencia de demostración para el alumno principal (Lucia Salgado)
export const MOCK_ATTENDANCE_RECORDS_LUCIA: AttendanceRecord[] = [
  // Octubre 2026 (Recientes)
  {
    id: 'att_2026_10_16',
    studentId: 'std_01',
    date: '2026-10-16',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Práctica Profesionalizante I',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_10_15',
    studentId: 'std_01',
    date: '2026-10-15',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Programación Web II',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_10_14',
    studentId: 'std_01',
    date: '2026-10-14',
    time: '13:55',
    status: 'TARDE',
    subjectName: 'Bases de Datos Relacionales',
    academicPeriod: '2C',
    observation: 'Llegada tarde con aviso por demora de transporte público (Línea 102).',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_10_10',
    studentId: 'std_01',
    date: '2026-10-10',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Ingeniería de Software y Requerimientos',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_10_08',
    studentId: 'std_01',
    date: '2026-10-08',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Sistemas Operativos y Redes',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_10_03',
    studentId: 'std_01',
    date: '2026-10-03',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Práctica Profesionalizante I',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_10_01',
    studentId: 'std_01',
    date: '2026-10-01',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Programación Web II',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },

  // Septiembre 2026
  {
    id: 'att_2026_09_28',
    studentId: 'std_01',
    date: '2026-09-28',
    time: '13:30',
    status: 'JUSTIFICADO',
    subjectName: 'Bases de Datos Relacionales',
    academicPeriod: '2C',
    observation: 'Inasistencia por turno médico de control.',
    justificationDocNumber: 'CERT-MED-9921/2026',
    preceptorNote: 'Constancia médica recepcionada y aprobada en Secretaría.',
    registeredBy: 'Secretaría Académica'
  },
  {
    id: 'att_2026_09_24',
    studentId: 'std_01',
    date: '2026-09-24',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Ingeniería de Software y Requerimientos',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_09_22',
    studentId: 'std_01',
    date: '2026-09-22',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Sistemas Operativos y Redes',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_09_18',
    studentId: 'std_01',
    date: '2026-09-18',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Práctica Profesionalizante I',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_09_15',
    studentId: 'std_01',
    date: '2026-09-15',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Programación Web II',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_09_11',
    studentId: 'std_01',
    date: '2026-09-11',
    time: '13:30',
    status: 'AUSENTE',
    subjectName: 'Bases de Datos Relacionales',
    academicPeriod: '2C',
    observation: 'Inasistencia sin comprobante adjunto registrado.',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_09_08',
    studentId: 'std_01',
    date: '2026-09-08',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Ingeniería de Software y Requerimientos',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_09_04',
    studentId: 'std_01',
    date: '2026-09-04',
    time: '13:48',
    status: 'TARDE',
    subjectName: 'Sistemas Operativos y Redes',
    academicPeriod: '2C',
    observation: 'Ingreso 18 min demorada.',
    registeredBy: 'Preceptoría Turno Tarde'
  },

  // Agosto 2026
  {
    id: 'att_2026_08_27',
    studentId: 'std_01',
    date: '2026-08-27',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Práctica Profesionalizante I',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_08_25',
    studentId: 'std_01',
    date: '2026-08-25',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Programación Web II',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_08_20',
    studentId: 'std_01',
    date: '2026-08-20',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Bases de Datos Relacionales',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_08_14',
    studentId: 'std_01',
    date: '2026-08-14',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Ingeniería de Software y Requerimientos',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_08_11',
    studentId: 'std_01',
    date: '2026-08-11',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Sistemas Operativos y Redes',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_08_06',
    studentId: 'std_01',
    date: '2026-08-06',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Práctica Profesionalizante I',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },

  // 1° Cuatrimestre (Junio 2026)
  {
    id: 'att_2026_06_25',
    studentId: 'std_01',
    date: '2026-06-25',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Programación Web I',
    academicPeriod: '1C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_06_22',
    studentId: 'std_01',
    date: '2026-06-22',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Algoritmos y Estructuras de Datos',
    academicPeriod: '1C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_06_18',
    studentId: 'std_01',
    date: '2026-06-18',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Arquitectura de Computadores',
    academicPeriod: '1C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_06_12',
    studentId: 'std_01',
    date: '2026-06-12',
    time: '13:30',
    status: 'JUSTIFICADO',
    subjectName: 'Matemática Aplicada',
    academicPeriod: '1C',
    observation: 'Participación en Jornada de Capacitación Técnica Institucional.',
    justificationDocNumber: 'RES-I26-088/2026',
    registeredBy: 'Secretaría Académica'
  },
  {
    id: 'att_2026_06_08',
    studentId: 'std_01',
    date: '2026-06-08',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Programación Web I',
    academicPeriod: '1C',
    registeredBy: 'Preceptoría Turno Tarde'
  },

  // Mayo 2026
  {
    id: 'att_2026_05_28',
    studentId: 'std_01',
    date: '2026-05-28',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Algoritmos y Estructuras de Datos',
    academicPeriod: '1C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_05_21',
    studentId: 'std_01',
    date: '2026-05-21',
    time: '13:30',
    status: 'AUSENTE',
    subjectName: 'Arquitectura de Computadores',
    academicPeriod: '1C',
    observation: 'Inasistencia particular.',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_05_15',
    studentId: 'std_01',
    date: '2026-05-15',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Matemática Aplicada',
    academicPeriod: '1C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_05_11',
    studentId: 'std_01',
    date: '2026-05-11',
    time: '13:42',
    status: 'TARDE',
    subjectName: 'Programación Web I',
    academicPeriod: '1C',
    observation: 'Demora al inicio de clase.',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_05_06',
    studentId: 'std_01',
    date: '2026-05-06',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Algoritmos y Estructuras de Datos',
    academicPeriod: '1C',
    registeredBy: 'Preceptoría Turno Tarde'
  },

  // Abril 2026
  {
    id: 'att_2026_04_24',
    studentId: 'std_01',
    date: '2026-04-24',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Arquitectura de Computadores',
    academicPeriod: '1C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_04_20',
    studentId: 'std_01',
    date: '2026-04-20',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Matemática Aplicada',
    academicPeriod: '1C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_04_16',
    studentId: 'std_01',
    date: '2026-04-16',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Programación Web I',
    academicPeriod: '1C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_04_08',
    studentId: 'std_01',
    date: '2026-04-08',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Algoritmos y Estructuras de Datos',
    academicPeriod: '1C',
    registeredBy: 'Preceptoría Turno Tarde'
  },

  // Marzo 2026
  {
    id: 'att_2026_03_25',
    studentId: 'std_01',
    date: '2026-03-25',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Arquitectura de Computadores',
    academicPeriod: '1C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_03_20',
    studentId: 'std_01',
    date: '2026-03-20',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Matemática Aplicada',
    academicPeriod: '1C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_2026_03_16',
    studentId: 'std_01',
    date: '2026-03-16',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Inicio de Ciclo Lectivo 2026 - Presentación General',
    academicPeriod: '1C',
    registeredBy: 'Preceptoría Turno Tarde'
  }
];

// Registros de demostración para el estudiante en riesgo (Agustín Méndez)
export const MOCK_ATTENDANCE_RECORDS_RISK: AttendanceRecord[] = [
  {
    id: 'att_risk_10_16',
    studentId: 'std_02',
    date: '2026-10-16',
    time: '13:30',
    status: 'AUSENTE',
    subjectName: 'Práctica Profesionalizante I',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_risk_10_15',
    studentId: 'std_02',
    date: '2026-10-15',
    time: '13:30',
    status: 'AUSENTE',
    subjectName: 'Programación Web II',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_risk_10_14',
    studentId: 'std_02',
    date: '2026-10-14',
    time: '14:10',
    status: 'TARDE',
    subjectName: 'Bases de Datos Relacionales',
    academicPeriod: '2C',
    observation: 'Demora superior a 40 minutos.',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_risk_10_10',
    studentId: 'std_02',
    date: '2026-10-10',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Ingeniería de Software y Requerimientos',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_risk_10_08',
    studentId: 'std_02',
    date: '2026-10-08',
    time: '13:30',
    status: 'AUSENTE',
    subjectName: 'Sistemas Operativos y Redes',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_risk_10_03',
    studentId: 'std_02',
    date: '2026-10-03',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Práctica Profesionalizante I',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_risk_09_28',
    studentId: 'std_02',
    date: '2026-09-28',
    time: '13:30',
    status: 'AUSENTE',
    subjectName: 'Bases de Datos Relacionales',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_risk_09_24',
    studentId: 'std_02',
    date: '2026-09-24',
    time: '13:30',
    status: 'AUSENTE',
    subjectName: 'Ingeniería de Software y Requerimientos',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_risk_09_22',
    studentId: 'std_02',
    date: '2026-09-22',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Sistemas Operativos y Redes',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_risk_09_18',
    studentId: 'std_02',
    date: '2026-09-18',
    time: '13:30',
    status: 'PRESENTE',
    subjectName: 'Práctica Profesionalizante I',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_risk_09_15',
    studentId: 'std_02',
    date: '2026-09-15',
    time: '13:30',
    status: 'TARDE',
    subjectName: 'Programación Web II',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  },
  {
    id: 'att_risk_09_11',
    studentId: 'std_02',
    date: '2026-09-11',
    time: '13:30',
    status: 'AUSENTE',
    subjectName: 'Bases de Datos Relacionales',
    academicPeriod: '2C',
    registeredBy: 'Preceptoría Turno Tarde'
  }
];

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
