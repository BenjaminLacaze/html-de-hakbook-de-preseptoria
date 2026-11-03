/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Alumno,
  Materia,
  Evaluacion,
  RegistroAsistencia,
  Evento,
  Aviso,
  PublicacionForo,
  HitoHistorial,
  SolicitudCorreccion,
  SolicitudJustificacion,
  PreferenciasUsuario,
} from "../shared/types";

// Alumno institucional (A4: Coherencia de trayectoria: Ingreso 2025 -> 2° año en 2026)
export const MOCK_ALUMNO: Alumno = {
  id: "alu-2025-0842",
  dni: "42.819.304",
  legajo: "2025-ISFD26-0842",
  nombre: "Julián",
  apellido: "Cámara",
  email: "julian.camara@isfdyt26.edu.ar",
  telefono: "+54 9 11 4920-8812",
  carrera: "Tecnicatura Superior en Desarrollo de Software",
  resolucionPlan: "Res. N° 5847/19 - DGCyE",
  anio: 2,
  turno: "Vespertino",
  condicion: "Regular",
  sede: "Sede Central (Dolores, Pcia. de Buenos Aires)",
  fechaIngreso: "15/03/2025",
};

// 6 Materias activas del 2° cuatrimestre 2026
export const MOCK_MATERIAS: Materia[] = [
  {
    id: "mat-201",
    codigo: "TSDS-201",
    nombre: "Programación Web II",
    docente: "Prof. Lic. Marcelo Arregui",
    comision: "2° A - Turno Vespertino",
    anio: 2,
    cuatrimestre: "2° Cuatrimestre",
    horario: "Lunes y Miércoles 18:30 a 20:30 hs",
    diaSemana: "Lunes y Miércoles",
    aula: "Laboratorio de Informática 2",
    horasSemanales: 4,
    correlativas: ["Programación Web I (Aprobada)", "Algoritmos y Estructuras (Aprobada)"],
    programaContenidos: [
      "Unidad 1: Arquitecturas cliente-servidor, REST y estado en SPAs.",
      "Unidad 2: Componentes accesibles, WCAG 2.2 y diseño inclusivo.",
      "Unidad 3: Consumo asíncrono, cacheo con TanStack Query y sincronización.",
      "Unidad 4: Testing integral y despliegue continuo en entornos terciarios.",
    ],
    estadoCursada: "En Cursada",
  },
  {
    id: "mat-202",
    codigo: "TSDS-202",
    nombre: "Práctica Profesionalizante II",
    docente: "Prof. Ing. Valeria Benítez",
    comision: "2° A - Turno Vespertino",
    anio: 2,
    cuatrimestre: "2° Cuatrimestre",
    horario: "Martes 18:30 a 21:30 hs",
    diaSemana: "Martes",
    aula: "Aula Magna / Taller de Proyectos",
    horasSemanales: 4,
    correlativas: ["Práctica Profesionalizante I (Aprobada)"],
    programaContenidos: [
      "Unidad 1: Relevamiento y modelado de procesos en organizaciones públicas.",
      "Unidad 2: Diseño de soluciones de software de impacto social y comunitario.",
      "Unidad 3: Desarrollo ágil, control de versiones y entregas incrementales.",
      "Unidad 4: Presentación de MVP, documentación formal y defensa de proyectos.",
    ],
    estadoCursada: "En Cursada",
  },
  {
    id: "mat-203",
    codigo: "TSDS-203",
    nombre: "Base de Datos II",
    docente: "Prof. Esp. Daniel Soria",
    comision: "2° A - Turno Vespertino",
    anio: 2,
    cuatrimestre: "2° Cuatrimestre",
    horario: "Jueves 19:15 a 21:15 hs",
    diaSemana: "Jueves",
    aula: "Laboratorio de Informática 1",
    horasSemanales: 3,
    correlativas: ["Base de Datos I (Aprobada)"],
    programaContenidos: [
      "Unidad 1: Modelado relacional avanzado, índices B-Tree y normalización.",
      "Unidad 2: Procedimientos almacenados, triggers y funciones de agregación.",
      "Unidad 3: Integridad referencial, transacciones ACID y aislamiento.",
      "Unidad 4: Optimización de consultas y planes de ejecución.",
    ],
    estadoCursada: "En Cursada",
  },
  {
    id: "mat-204",
    codigo: "TSDS-204",
    nombre: "Redes y Comunicaciones",
    docente: "Prof. Tec. Esteban Morales",
    comision: "2° A - Turno Vespertino",
    anio: 2,
    cuatrimestre: "2° Cuatrimestre",
    horario: "Viernes 18:30 a 20:30 hs",
    diaSemana: "Viernes",
    aula: "Aula 6",
    horasSemanales: 3,
    correlativas: ["Sistemas Operativos (Aprobada)"],
    programaContenidos: [
      "Unidad 1: Modelo OSI y pila TCP/IP.",
      "Unidad 2: Direccionamiento IPv4/IPv6 y subnetting VLSM.",
      "Unidad 3: Enrutamiento estático y protocolos dinámicos.",
      "Unidad 4: Seguridad perimetral, firewalls y VPNs educativas.",
    ],
    estadoCursada: "En Cursada",
  },
  {
    id: "mat-205",
    codigo: "TSDS-205",
    nombre: "Inglés Técnico II",
    docente: "Prof. Trad. Silvina Castro",
    comision: "2° A - Turno Vespertino",
    anio: 2,
    cuatrimestre: "2° Cuatrimestre",
    horario: "Lunes 20:30 a 21:50 hs",
    diaSemana: "Lunes",
    aula: "Aula 4",
    horasSemanales: 2,
    correlativas: ["Inglés Técnico I (Aprobada)"],
    programaContenidos: [
      "Unidad 1: Lectura comprensiva de documentación técnica en inglés.",
      "Unidad 2: Glosario de ingeniería de software y especificaciones de APIs.",
      "Unidad 3: Redacción de issues, pull requests y manuales de usuario.",
    ],
    estadoCursada: "En Cursada",
  },
  {
    id: "mat-206",
    codigo: "TSDS-206",
    nombre: "Ética y Deontología Profesional",
    docente: "Prof. Lic. Horacio Romero",
    comision: "2° A - Turno Vespertino",
    anio: 2,
    cuatrimestre: "2° Cuatrimestre",
    horario: "Miércoles 20:30 a 21:50 hs",
    diaSemana: "Miércoles",
    aula: "Aula 8",
    horasSemanales: 2,
    correlativas: [],
    programaContenidos: [
      "Unidad 1: Marco normativo del ejercicio profesional informático.",
      "Unidad 2: Propiedad intelectual, licencias libres y derechos de autor.",
      "Unidad 3: Privacidad, protección de datos personales y Ley 25.326.",
      "Unidad 4: Ética algorítmica y responsabilidad social en la IA.",
    ],
    estadoCursada: "En Cursada",
  },
];

// Generación exacta de las 84 clases dictadas del ciclo lectivo (A1: Fuente única de verdad)
// Distribución:
// mat-201: 16 clases (14 presentes, 1 tardanza, 1 ausente)
// mat-202: 14 clases (13 presentes, 1 tardanza, 0 ausentes)
// mat-203: 15 clases (12 presentes, 0 tardanzas, 2 ausentes, 1 justificada)
// mat-204: 14 clases (13 presentes, 0 tardanzas, 1 ausente)
// mat-205: 12 clases (10 presentes, 1 tardanza, 1 ausente)
// mat-206: 13 clases (13 presentes, 0 tardanzas, 0 ausentes)
// Total = 16 + 14 + 15 + 14 + 12 + 13 = 84 registros
function generar84Clases(): RegistroAsistencia[] {
  const lista: RegistroAsistencia[] = [];

  // 1. Programación Web II (16 clases)
  const fechasWeb2 = [
    { f: "2026-08-10", e: "presente", m: "Docente" },
    { f: "2026-08-12", e: "presente", m: "Docente" },
    { f: "2026-08-19", e: "presente", m: "Docente" },
    { f: "2026-08-24", e: "presente", m: "Docente" },
    { f: "2026-08-26", e: "presente", m: "QR" },
    { f: "2026-08-31", e: "presente", m: "QR" },
    { f: "2026-09-02", e: "presente", m: "QR" },
    { f: "2026-09-07", e: "presente", m: "QR" },
    { f: "2026-09-09", e: "presente", m: "QR" },
    { f: "2026-09-14", e: "presente", m: "QR" },
    { f: "2026-09-16", e: "ausente",  m: "Preceptor" },
    { f: "2026-09-21", e: "presente", m: "QR" },
    { f: "2026-09-23", e: "presente", m: "QR" },
    { f: "2026-10-14", e: "presente", m: "QR" },
    { f: "2026-10-21", e: "presente", m: "QR" },
    { f: "2026-10-26", e: "tardanza", m: "QR" },
  ];
  fechasWeb2.forEach((item, idx) => {
    lista.push({
      id: `asist-web2-${idx + 1}`,
      materiaId: "mat-201",
      materiaNombre: "Programación Web II",
      fecha: item.f,
      hora: "18:30",
      estado: item.e as any,
      metodo: item.m as any,
      moduloClase: "Módulos 1 y 2",
    });
  });

  // 2. Práctica Profesionalizante II (14 clases)
  const fechasPP2 = [
    { f: "2026-08-11", e: "presente", m: "Docente" },
    { f: "2026-08-18", e: "presente", m: "Docente" },
    { f: "2026-08-25", e: "presente", m: "QR" },
    { f: "2026-09-01", e: "presente", m: "QR" },
    { f: "2026-09-08", e: "presente", m: "QR" },
    { f: "2026-09-15", e: "presente", m: "QR" },
    { f: "2026-09-22", e: "presente", m: "QR" },
    { f: "2026-09-29", e: "presente", m: "QR" },
    { f: "2026-10-06", e: "presente", m: "QR" },
    { f: "2026-10-13", e: "presente", m: "QR" },
    { f: "2026-10-20", e: "presente", m: "QR" },
    { f: "2026-10-27", e: "presente", m: "QR" },
    { f: "2026-10-28", e: "tardanza", m: "QR" },
    { f: "2026-10-29", e: "presente", m: "Docente" },
  ];
  fechasPP2.forEach((item, idx) => {
    lista.push({
      id: `asist-pp2-${idx + 1}`,
      materiaId: "mat-202",
      materiaNombre: "Práctica Profesionalizante II",
      fecha: item.f,
      hora: "18:30",
      estado: item.e as any,
      metodo: item.m as any,
      moduloClase: "Módulos 1 a 3",
    });
  });

  // 3. Base de Datos II (15 clases)
  const fechasBD2 = [
    { f: "2026-08-13", e: "presente", m: "Docente" },
    { f: "2026-08-20", e: "presente", m: "Docente" },
    { f: "2026-08-27", e: "presente", m: "QR" },
    { f: "2026-09-03", e: "presente", m: "QR" },
    { f: "2026-09-10", e: "presente", m: "QR" },
    { f: "2026-09-17", e: "presente", m: "QR" },
    { f: "2026-09-24", e: "presente", m: "QR" },
    { f: "2026-10-01", e: "presente", m: "QR" },
    { f: "2026-10-08", e: "presente", m: "QR" },
    { f: "2026-10-15", e: "justificada", m: "Preceptor", just: "Certificado laboral presentado en Bedelía (Exp. 142/26)" },
    { f: "2026-10-22", e: "ausente", m: "Preceptor" },
    { f: "2026-10-23", e: "presente", m: "QR" },
    { f: "2026-10-25", e: "presente", m: "QR" },
    { f: "2026-10-27", e: "presente", m: "QR" },
    { f: "2026-10-29", e: "ausente", m: "Preceptor" },
  ];
  fechasBD2.forEach((item, idx) => {
    lista.push({
      id: `asist-bd2-${idx + 1}`,
      materiaId: "mat-203",
      materiaNombre: "Base de Datos II",
      fecha: item.f,
      hora: "19:15",
      estado: item.e as any,
      metodo: item.m as any,
      motivoJustificacion: (item as any).just,
      moduloClase: "Módulos 2 y 3",
    });
  });

  // 4. Redes y Comunicaciones (14 clases)
  const fechasRedes = [
    { f: "2026-08-14", e: "presente", m: "Docente" },
    { f: "2026-08-21", e: "presente", m: "Docente" },
    { f: "2026-08-28", e: "presente", m: "QR" },
    { f: "2026-09-04", e: "presente", m: "QR" },
    { f: "2026-09-11", e: "presente", m: "QR" },
    { f: "2026-09-18", e: "presente", m: "QR" },
    { f: "2026-09-25", e: "presente", m: "QR" },
    { f: "2026-10-02", e: "presente", m: "QR" },
    { f: "2026-10-09", e: "presente", m: "QR" },
    { f: "2026-10-16", e: "presente", m: "QR" },
    { f: "2026-10-23", e: "presente", m: "QR" },
    { f: "2026-10-24", e: "ausente", m: "Preceptor" },
    { f: "2026-10-27", e: "presente", m: "Docente" },
    { f: "2026-10-30", e: "presente", m: "QR" },
  ];
  fechasRedes.forEach((item, idx) => {
    lista.push({
      id: `asist-red-${idx + 1}`,
      materiaId: "mat-204",
      materiaNombre: "Redes y Comunicaciones",
      fecha: item.f,
      hora: "18:30",
      estado: item.e as any,
      metodo: item.m as any,
      moduloClase: "Módulos 1 y 2",
    });
  });

  // 5. Inglés Técnico II (12 clases)
  const fechasIngles = [
    { f: "2026-08-10", e: "presente", m: "Docente" },
    { f: "2026-08-24", e: "presente", m: "Docente" },
    { f: "2026-08-31", e: "presente", m: "Docente" },
    { f: "2026-09-07", e: "presente", m: "Docente" },
    { f: "2026-09-14", e: "presente", m: "Docente" },
    { f: "2026-09-21", e: "ausente",  m: "Preceptor" },
    { f: "2026-09-28", e: "presente", m: "Docente" },
    { f: "2026-10-05", e: "presente", m: "Docente" },
    { f: "2026-10-12", e: "presente", m: "Docente" },
    { f: "2026-10-19", e: "presente", m: "Docente" },
    { f: "2026-10-26", e: "tardanza", m: "Docente" },
    { f: "2026-10-28", e: "presente", m: "Docente" },
  ];
  fechasIngles.forEach((item, idx) => {
    lista.push({
      id: `asist-ing-${idx + 1}`,
      materiaId: "mat-205",
      materiaNombre: "Inglés Técnico II",
      fecha: item.f,
      hora: "20:30",
      estado: item.e as any,
      metodo: item.m as any,
      moduloClase: "Módulo 3",
    });
  });

  // 6. Ética y Deontología Profesional (13 clases)
  const fechasEtica = [
    { f: "2026-08-12", e: "presente", m: "Docente" },
    { f: "2026-08-19", e: "presente", m: "Docente" },
    { f: "2026-08-26", e: "presente", m: "Docente" },
    { f: "2026-09-02", e: "presente", m: "Docente" },
    { f: "2026-09-09", e: "presente", m: "Docente" },
    { f: "2026-09-16", e: "presente", m: "Docente" },
    { f: "2026-09-23", e: "presente", m: "Docente" },
    { f: "2026-09-30", e: "presente", m: "Docente" },
    { f: "2026-10-07", e: "presente", m: "Docente" },
    { f: "2026-10-14", e: "presente", m: "Docente" },
    { f: "2026-10-21", e: "presente", m: "Docente" },
    { f: "2026-10-28", e: "presente", m: "Docente" },
    { f: "2026-10-29", e: "presente", m: "Docente" },
  ];
  fechasEtica.forEach((item, idx) => {
    lista.push({
      id: `asist-eti-${idx + 1}`,
      materiaId: "mat-206",
      materiaNombre: "Ética y Deontología Profesional",
      fecha: item.f,
      hora: "20:30",
      estado: item.e as any,
      metodo: item.m as any,
      moduloClase: "Módulo 3",
    });
  });

  // Ordenar cronológicamente descendente (más recientes primero)
  return lista.sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export const MOCK_ASISTENCIAS: RegistroAsistencia[] = generar84Clases();

// Evaluaciones y calificaciones oficiales (A6: Formato claro, calificaciones individuales sin promedios inventados)
export const MOCK_EVALUACIONES: Evaluacion[] = [
  {
    id: "eva-01",
    materiaId: "mat-201",
    materiaNombre: "Programación Web II",
    tipo: "1° Parcial",
    titulo: "Arquitectura Cliente-Servidor y APIs REST",
    fecha: "2026-09-18",
    fechaPublicacion: "2026-09-25",
    nota: 8.5,
    observaciones: "Excelente resolución del middleware y manejo de respuestas tipadas con Zod.",
    estado: "publicada",
    pesoPorcentual: 30,
    instanciaRecuperatorio: "Semana del 23 de noviembre",
  },
  {
    id: "eva-02",
    materiaId: "mat-201",
    materiaNombre: "Programación Web II",
    tipo: "Trabajo Práctico",
    titulo: "TP N° 1: SPA React con TypeScript y Accesibilidad",
    fecha: "2026-10-12",
    fechaPublicacion: "2026-10-19",
    nota: 9.0,
    observaciones: "Cumplió con todas las pautas WCAG 2.2 y navegación íntegra por teclado.",
    estado: "publicada",
    pesoPorcentual: 20,
  },
  {
    id: "eva-03",
    materiaId: "mat-201",
    materiaNombre: "Programación Web II",
    tipo: "2° Parcial",
    titulo: "Integración Full Stack y Persistencia de Sesión",
    fecha: "2026-11-16",
    fechaPublicacion: null,
    nota: null,
    observaciones: "Modalidad teórico-práctica en Laboratorio 2.",
    estado: "proxima",
    pesoPorcentual: 30,
    instanciaRecuperatorio: "Semana del 30 de noviembre",
  },
  {
    id: "eva-04",
    materiaId: "mat-202",
    materiaNombre: "Práctica Profesionalizante II",
    tipo: "Trabajo Práctico",
    titulo: "Etapa 1: Relevamiento y Diagrama de Dominio",
    fecha: "2026-09-29",
    fechaPublicacion: "2026-10-06",
    nota: 9.0,
    observaciones: "Propuesta aprobada por la comisión evaluadora de proyectos comunitarios.",
    estado: "publicada",
    pesoPorcentual: 40,
  },
  {
    id: "eva-05",
    materiaId: "mat-202",
    materiaNombre: "Práctica Profesionalizante II",
    tipo: "TPI",
    titulo: "Defensa MVP: Prototipo Funcional Comunitario",
    fecha: "2026-11-10",
    fechaPublicacion: null,
    nota: null,
    observaciones: "Defensa grupal ante tribunal en Aula Magna.",
    estado: "proxima",
    pesoPorcentual: 60,
  },
  {
    id: "eva-06",
    materiaId: "mat-203",
    materiaNombre: "Base de Datos II",
    tipo: "1° Parcial",
    titulo: "Modelado Relacional, Normalización e Índices",
    fecha: "2026-09-24",
    fechaPublicacion: "2026-10-02",
    nota: 7.5,
    observaciones: "Aprobado. Reforzar diseño de claves compuestas en tercera forma normal.",
    estado: "publicada",
    pesoPorcentual: 35,
    instanciaRecuperatorio: "19 de noviembre de 2026",
  },
  {
    id: "eva-07",
    materiaId: "mat-203",
    materiaNombre: "Base de Datos II",
    tipo: "Trabajo Práctico",
    titulo: "Scripting SQL, Vistas y Procedimientos Almacenados",
    fecha: "2026-10-22",
    fechaPublicacion: null,
    nota: null,
    observaciones: "Entregado a término en plataforma. En revisión por la cátedra.",
    estado: "en_correccion",
    pesoPorcentual: 25,
  },
  {
    id: "eva-08",
    materiaId: "mat-204",
    materiaNombre: "Redes y Comunicaciones",
    tipo: "1° Parcial",
    titulo: "Modelo OSI, TCP/IP y Subnetting VLSM",
    fecha: "2026-10-09",
    fechaPublicacion: "2026-10-16",
    nota: 8.0,
    observaciones: "Buen cálculo de máscaras de subred y direccionamiento IP.",
    estado: "publicada",
    pesoPorcentual: 40,
  },
  {
    id: "eva-09",
    materiaId: "mat-205",
    materiaNombre: "Inglés Técnico II",
    tipo: "Trabajo Práctico",
    titulo: "Lectocomprensión: Documentación Oficial de Frameworks",
    fecha: "2026-09-28",
    fechaPublicacion: "2026-10-05",
    nota: 8.0,
    observaciones: "Glosario técnico completado con precisión terminológica.",
    estado: "publicada",
    pesoPorcentual: 30,
  },
  {
    id: "eva-10",
    materiaId: "mat-206",
    materiaNombre: "Ética y Deontología Profesional",
    tipo: "1° Parcial",
    titulo: "Coloquio: Responsabilidad Civil y Ética en la IA",
    fecha: "2026-10-14",
    fechaPublicacion: "2026-10-21",
    nota: 9.5,
    observaciones: "Destacada argumentación sobre protección de datos y derechos de autor.",
    estado: "publicada",
    pesoPorcentual: 50,
  },
];

// Eventos de la agenda académica
export const MOCK_EVENTOS: Evento[] = [
  {
    id: "eve-01",
    titulo: "2° Parcial: Programación Web II",
    tipo: "parcial",
    fecha: "2026-11-16",
    horaInicio: "18:30",
    horaFin: "20:30",
    materiaNombre: "Programación Web II",
    lugar: "Laboratorio de Informática 2",
    descripcion: "Evaluación integradora de React, arquitectura por capas, TanStack Query y accesibilidad.",
    obligatorio: true,
    recordatorioActivo: true,
  },
  {
    id: "eve-02",
    titulo: "Defensa MVP: Práctica Profesionalizante II",
    tipo: "entrega",
    fecha: "2026-11-10",
    horaInicio: "18:30",
    horaFin: "21:30",
    materiaNombre: "Práctica Profesionalizante II",
    lugar: "Aula Magna",
    descripcion: "Presentación del prototipo funcional ante docentes tutores y comisión evaluadora.",
    obligatorio: true,
    recordatorioActivo: false,
  },
  {
    id: "eve-03",
    titulo: "Jornadas Institucionales ISFDyT N° 26",
    tipo: "jornada",
    fecha: "2026-11-06",
    horaInicio: "17:00",
    horaFin: "21:30",
    lugar: "Salón de Actos Central",
    descripcion: "Encuentro de carreras técnicas y docentes: charlas, talleres y feria de proyectos comunitarios.",
    obligatorio: false,
    recordatorioActivo: true,
  },
  {
    id: "eve-04",
    titulo: "Feriado Nacional: Día de la Soberanía Nacional",
    tipo: "feriado",
    fecha: "2026-11-23",
    horaInicio: "00:00",
    horaFin: "23:59",
    lugar: "Feriado Nacional",
    descripcion: "Sin actividad académica ni administrativa.",
    obligatorio: false,
    recordatorioActivo: false,
  },
  {
    id: "eve-05",
    titulo: "Cierre de Cursadas 2° Cuatrimestre",
    tipo: "academico",
    fecha: "2026-11-27",
    horaInicio: "18:00",
    horaFin: "22:00",
    lugar: "Todas las carreras",
    descripcion: "Publicación de condiciones finales de regularidad y acreditación.",
    obligatorio: true,
    recordatorioActivo: false,
  },
  {
    id: "eve-06",
    titulo: "Turno Exámenes Finales - Llamado Diciembre",
    tipo: "academico",
    fecha: "2026-12-01",
    horaInicio: "18:00",
    horaFin: "22:00",
    lugar: "Sede Central",
    descripcion: "Apertura del llamado a mesas de examen final según cronograma oficial de Bedelía.",
    obligatorio: false,
    recordatorioActivo: false,
  },
];

// Avisos institucionales
export const MOCK_AVISOS: Aviso[] = [
  {
    id: "avi-01",
    titulo: "Inscripción a Mesas de Exámenes Finales (Llamado Dic 2026)",
    resumen: "Se informa el cronograma oficial de inscripción para todas las tecnicaturas y profesorados.",
    cuerpo: "A partir del lunes 9 de noviembre estará habilitado el sistema de Bedelía para la inscripción a mesas de examen. Recordá verificar tus correlatividades antes de postularte y consultar las fechas de cada tribunal con anticipación.",
    fecha: "2026-10-28",
    remitente: "Bedelía Central - ISFDyT N° 26",
    categoria: "Bedelía",
    prioridad: "alta",
    leido: false,
  },
  {
    id: "avi-02",
    titulo: "Convocatoria a las Jornadas Institucionales 2026",
    resumen: "Espacio de intercambio, talleres prácticos y muestra de proyectos tecnológicos y educativos.",
    cuerpo: "Los días 5 y 6 de noviembre se desarrollarán las Jornadas Institucionales en el Salón de Actos y laboratorios del Instituto. Los estudiantes de 2° y 3° año que deseen presentar sus experiencias de prácticas pueden coordinar con sus docentes antes del 31 de octubre.",
    fecha: "2026-10-25",
    remitente: "Equipo Directivo y Coordinación de Carreras",
    categoria: "Jornadas",
    prioridad: "normal",
    leido: false,
  },
  {
    id: "avi-03",
    titulo: "Pautas de Cómputo de Asistencia con Sistema QR",
    resumen: "Recordatorio sobre los tiempos de validez del código en pantalla del aula.",
    cuerpo: "Cada docente proyecta el código QR durante los primeros 15 minutos del bloque horario. Pasado ese tiempo, el preceptor registrará la inasistencia o tardanza según corresponda reglamentariamente.",
    fecha: "2026-10-18",
    remitente: "Secretaría Académica",
    categoria: "Institucional",
    prioridad: "normal",
    leido: true,
  },
];

// Foros y comunidad estudiantil
export const MOCK_FOROS: PublicacionForo[] = [
  {
    id: "pub-01",
    titulo: "Consulta sobre entregas de Práctica Profesionalizante II: formato y documentación",
    autor: "Prof. Ing. Valeria Benítez",
    rol: "Docente",
    fecha: "2026-10-26",
    canal: "Proyectos y Prácticas",
    contenido: "Estimados estudiantes, en el repositorio del curso ya se encuentra la rúbrica oficial para la defensa del MVP de noviembre. Asegúrense de incluir el manual de instalación y la matriz de requerimientos con lenguaje accesible.",
    materiaRelacionada: "Práctica Profesionalizante II",
    esPropia: false,
    respuestas: [
      {
        id: "resp-01",
        autor: "Julián Cámara",
        rol: "Alumno",
        fecha: "2026-10-27 10:14",
        contenido: "Profesor, ¿la presentación ante la comisión incluye demostración en vivo con datos cargados o diapositivas con capturas?",
        esPropia: true,
      },
      {
        id: "resp-02",
        autor: "Prof. Ing. Valeria Benítez",
        rol: "Docente",
        fecha: "2026-10-27 14:30",
        contenido: "Hola Julián, la defensa contempla 10 minutos de demo funcional en vivo y 5 minutos para preguntas del tribunal.",
        esPropia: false,
      },
    ],
  },
  {
    id: "pub-02",
    titulo: "Grupo de estudio para 2° Parcial de Base de Datos II (Índices y Procedimientos)",
    autor: "Sofía Martínez",
    rol: "Alumno",
    fecha: "2026-10-24",
    canal: "Consultas Académicas",
    contenido: "Nos juntamos los martes a las 17 hs en la biblioteca antes de la clase de práctica para repasar ejercicios de normalización y transacciones ACID. ¡Están invitados!",
    materiaRelacionada: "Base de Datos II",
    esPropia: false,
    respuestas: [
      {
        id: "resp-03",
        autor: "Nicolás Gómez",
        rol: "Alumno",
        fecha: "2026-10-25 18:20",
        contenido: "Buenísimo Sofi, me sumo. Llevo los prácticos de la clase pasada resueltos.",
        esPropia: false,
      },
    ],
  },
  {
    id: "pub-03",
    titulo: "Taller Abierto de Accesibilidad Digital y Lectores de Pantalla en las Jornadas",
    autor: "Equipo de Coordinación",
    rol: "Coordinación",
    fecha: "2026-10-22",
    canal: "Jornadas e Intercambio",
    contenido: "En el marco de las Jornadas Institucionales, el viernes 6 de noviembre a las 18:00 hs se dictará un taller práctico sobre accesibilidad web WCAG 2.2 para aplicaciones educativas y de autogestión.",
    esPropia: false,
    respuestas: [],
  },
];

// Historial académico (A4: Coherencia cronológica estricta: Ingreso marzo 2025 -> 2° año en 2026)
// A6: Sin notas promediadas inventadas
export const MOCK_HISTORIAL: HitoHistorial[] = [
  {
    id: "his-01",
    periodo: "2° Cuatrimestre 2026",
    anioLectivo: 2026,
    tipo: "cursada",
    titulo: "6 Materias en Cursada Activa",
    detalle: "Cursada regular de 2° año en Tecnicatura Superior en Desarrollo de Software.",
    calificacion: null,
    condicion: "Regular Activo",
    fecha: "Agosto - Noviembre 2026",
  },
  {
    id: "his-02",
    periodo: "1° Cuatrimestre 2026",
    anioLectivo: 2026,
    tipo: "cursada",
    titulo: "Cursadas Aprobadas de 2° Año",
    detalle: "Acreditación de regularidad: Programación Web I, Base de Datos I, Sistemas Operativos y Matemática Aplicada.",
    calificacion: null,
    condicion: "Cursadas Aprobadas",
    fecha: "Marzo - Julio 2026",
  },
  {
    id: "his-03",
    periodo: "Turno Feb/Mar 2026",
    anioLectivo: 2026,
    tipo: "final",
    titulo: "Final Aprobado: Algoritmos y Estructuras de Datos",
    detalle: "Examen final oral y práctico ante tribunal docente.",
    calificacion: 9,
    condicion: "Acreditada",
    fecha: "04/03/2026",
  },
  {
    id: "his-04",
    periodo: "Turno Dic 2025",
    anioLectivo: 2025,
    tipo: "final",
    titulo: "Final Aprobado: Práctica Profesionalizante I",
    detalle: "Defensa del proyecto semestral de software comunitario.",
    calificacion: 9,
    condicion: "Acreditada",
    fecha: "18/12/2025",
  },
  {
    id: "his-05",
    periodo: "Turno Dic 2025",
    anioLectivo: 2025,
    tipo: "final",
    titulo: "Final Aprobado: Arquitectura de Computadoras",
    detalle: "Examen final escrito y defensa de laboratorio.",
    calificacion: 8,
    condicion: "Acreditada",
    fecha: "11/12/2025",
  },
  {
    id: "his-06",
    periodo: "Año Lectivo 2025",
    anioLectivo: 2025,
    tipo: "cursada",
    titulo: "Cursadas de 1° Año Completadas",
    detalle: "Cumplimiento del régimen de regularidad en todas las materias de 1° año.",
    calificacion: null,
    condicion: "Cursadas Aprobadas",
    fecha: "Marzo - Noviembre 2025",
  },
  {
    id: "his-07",
    periodo: "Marzo 2025",
    anioLectivo: 2025,
    tipo: "inscripcion",
    titulo: "Ingreso e Inscripción a la Carrera",
    detalle: "Alta de Legajo 2025-ISFD26-0842. Convalidación de estudios secundarios y curso introductorio completado.",
    calificacion: null,
    condicion: "Inscripción Formalizada",
    fecha: "15/03/2025",
  },
];

// Solicitudes iniciales de rectificación a Bedelía
export const MOCK_SOLICITUDES_CORRECCION: SolicitudCorreccion[] = [
  {
    id: "sol-01",
    fechaSolicitud: "2026-10-10",
    campo: "Teléfono de contacto",
    valorPropuesto: "+54 9 11 4920-8812",
    motivo: "Cambio de línea móvil principal.",
    archivoAdjuntoNombre: "constancia_linea.pdf",
    estado: "Aprobada",
  },
];

// Solicitudes iniciales de justificación de inasistencias
export const MOCK_JUSTIFICACIONES: SolicitudJustificacion[] = [
  {
    id: "just-01",
    asistenciaId: "asist-bd2-10",
    fechaSolicitud: "2026-10-16",
    motivo: "Superposición con jornada laboral extraordinaria.",
    certificadoNombre: "certificado_laboral_exp142.pdf",
    estado: "Aprobada",
  },
];

// Preferencias de usuario por defecto
export const MOCK_PREFERENCIAS: PreferenciasUsuario = {
  notifInasistencia: true,
  notifExamenes: true,
  notifAvisos: true,
  canalEmail: true,
  canalPush: false,
  tamanoTexto: "normal",
  reducirMovimiento: false,
  densidadTabla: "comoda",
  modoDemoEstable: true,
};
