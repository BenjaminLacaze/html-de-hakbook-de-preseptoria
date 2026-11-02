// @ts-nocheck -- Datos de muestra del prototipo de AI Studio. Ya NO se importan: el panel usa la API.
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Datos de demostración completos y coherentes
 */

import {
  Comunicado,
  Evento,
  ForoHilo,
  MiembroCentro,
  NotificacionItem,
  Reclamo,
} from '../types';

export const CURRENT_USER: MiembroCentro = {
  id: 'm1',
  nombre: 'Martina Rossi',
  cargo: 'Presidencia',
  carrera: 'Tecnicatura Superior en Análisis de Sistemas (3° año)',
  areas: ['Coordinación General', 'Representación en CAI', 'Gestión Institucional'],
  biografia:
    'Estudiante apasionada por la educación pública terciaria y la democratización del acceso a la tecnología. Comprometida con escuchar a cada carrera del Instituto.',
  iniciales: 'MR',
  colorAvatar: '#14214F',
  contactoInstitucional: 'centroestudiantes@isfdyt26.edu.ar',
};

export const INITIAL_MEMBERS: MiembroCentro[] = [
  CURRENT_USER,
  {
    id: 'm2',
    nombre: 'Tomás Benítez',
    cargo: 'Vicepresidencia',
    carrera: 'Profesorado de Educación Secundaria en Historia (4° año)',
    areas: ['Articulación Pedagógica', 'Relaciones con la Comunidad', 'Edificio Anexo'],
    biografia: 'Futuro docente de historia. Defensor de la memoria, la participación colectiva y el acompañamiento a ingresantes.',
    iniciales: 'TB',
    colorAvatar: '#89743A',
    contactoInstitucional: 'vicepresidencia.ce@isfdyt26.edu.ar',
  },
  {
    id: 'm3',
    nombre: 'Lucía Fernández',
    cargo: 'Secretaría General y Actas',
    carrera: 'Profesorado de Educación Primaria (2° año)',
    areas: ['Libro de Actas', 'Comunicación Interna', 'Certificados y Asambleas'],
    biografia: 'Organizada y dispuesta a mantener la transparencia de todas las asambleas y reuniones del Centro.',
    iniciales: 'LF',
    colorAvatar: '#3F78B6',
    contactoInstitucional: 'secretaria.general.ce@isfdyt26.edu.ar',
  },
  {
    id: 'm4',
    nombre: 'Santiago Gómez',
    cargo: 'Secretaría de Asuntos Académicos',
    carrera: 'Tecnicatura Superior en Administración (3° año)',
    areas: ['Mesa de Exámenes', 'Correlatividades', 'Régimen Académico Marco (RAM)'],
    biografia: 'Canal directo para resolver dudas de inscripciones, correlatividades y reclamos de cursada ante Bedelía.',
    iniciales: 'SG',
    colorAvatar: '#2E7D32',
    contactoInstitucional: 'academicos.ce@isfdyt26.edu.ar',
  },
  {
    id: 'm5',
    nombre: 'Camila Morales',
    cargo: 'Secretaría de Cultura y DDHH',
    carrera: 'Profesorado en Artes Visuales (3° año)',
    areas: ['Muestras Artísticas', 'Ciclo de Cine Debate', 'Cartelera Cultural'],
    biografia: 'Impulsando espacios de expresión cultural, talleres abiertos y jornadas de reflexión en el instituto.',
    iniciales: 'CM',
    colorAvatar: '#AF9B63',
    contactoInstitucional: 'cultura.ce@isfdyt26.edu.ar',
  },
  {
    id: 'm6',
    nombre: 'Franco Di Marco',
    cargo: 'Secretaría de Deportes y Recreación',
    carrera: 'Profesorado de Educación Física (2° año)',
    areas: ['Torneo Intercarreras', 'Pausas Activas', 'Salud Estudiantil'],
    biografia: 'Promotor de hábitos saludables y encuentros deportivos para integrar a los turnos tarde y vespertino.',
    iniciales: 'FD',
    colorAvatar: '#14214F',
    contactoInstitucional: 'deportes.ce@isfdyt26.edu.ar',
  },
  {
    id: 'm7',
    nombre: 'Julieta Méndez',
    cargo: 'Secretaría de Finanzas y Tesorería',
    carrera: 'Tecnicatura Superior en Gestión Ambiental (3° año)',
    areas: ['Fotocopiadora Estudiantil', 'Fondos Solidarios', 'Rendición de Cuentas'],
    biografia: 'A cargo de garantizar fotocopias a precio justo y balances mensuales abiertos para toda la comunidad.',
    iniciales: 'JM',
    colorAvatar: '#89743A',
    contactoInstitucional: 'tesoreria.ce@isfdyt26.edu.ar',
  },
  {
    id: 'm8',
    nombre: 'Lucas Paredes',
    cargo: 'Primera Vocalía',
    carrera: 'Tecnicatura Superior en Higiene y Seguridad en el Trabajo (2° año)',
    areas: ['Infraestructura y Edificio', 'Seguridad Edilicia', 'Calefacción y Luz'],
    biografia: 'Relevando periódicamente el estado de las aulas, ventilación, sanitarios y botiquines del instituto.',
    iniciales: 'LP',
    colorAvatar: '#3F78B6',
    contactoInstitucional: 'infraestructura.ce@isfdyt26.edu.ar',
  },
  {
    id: 'm9',
    nombre: 'Sofía Castro',
    cargo: 'Segunda Vocalía',
    carrera: 'Profesorado de Inglés (1° año)',
    areas: ['Acompañamiento a Ingresantes', 'Tutorías de Pares', 'Turno Vespertino'],
    biografia: 'La voz de los que recién arrancan la carrera terciaria, coordinando grupos de estudio y orientación.',
    iniciales: 'SC',
    colorAvatar: '#AF9B63',
    contactoInstitucional: 'ingresantes.ce@isfdyt26.edu.ar',
  },
];

// Helper to create dates relative to today
const getRelativeDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_EVENTS: Evento[] = [
  {
    id: 'ev-1',
    titulo: 'Asamblea Abierta: Criterios para Mesas de Examen de Diciembre',
    categoria: 'reunion',
    fecha: getRelativeDate(2),
    horaInicio: '18:30',
    horaFin: '20:30',
    lugar: 'Salón de Actos (Sede Central)',
    descripcion:
      'Nos reunimos para debatir y consensuar la propuesta del Centro sobre el cronograma y llamado a mesas de examen final de diciembre. Traé las consultas de tu curso.',
    portadaUrl: '',
    cupoMaximo: 120,
    publicadoPor: 'Martina Rossi (Presidencia)',
    inscriptos: [
      { id: 'ins-1', nombre: 'Agustín Varela', carrera: 'Análisis de Sistemas', anio: '2°', email: 'a.varela@alumnos.isfdyt26.edu.ar', fechaInscripcion: '2026-10-30T10:15:00' },
      { id: 'ins-2', nombre: 'Florencia Suárez', carrera: 'Profesorado de Primaria', anio: '3°', email: 'f.suarez@alumnos.isfdyt26.edu.ar', fechaInscripcion: '2026-10-30T11:42:00' },
      { id: 'ins-3', nombre: 'Nicolás Giménez', carrera: 'Gestión Ambiental', anio: '1°', email: 'n.gimenez@alumnos.isfdyt26.edu.ar', fechaInscripcion: '2026-10-31T09:20:00' },
      { id: 'ins-4', nombre: 'Micaela Ríos', carrera: 'Profesorado de Historia', anio: '4°', email: 'm.rios@alumnos.isfdyt26.edu.ar', fechaInscripcion: '2026-10-31T14:10:00' },
      { id: 'ins-5', nombre: 'Joaquín Pereyra', carrera: 'Higiene y Seguridad', anio: '2°', email: 'j.pereyra@alumnos.isfdyt26.edu.ar', fechaInscripcion: '2026-11-01T08:05:00' },
    ],
  },
  {
    id: 'ev-2',
    titulo: 'Taller Práctico: Recursos Digitales para la Residencia Docente',
    categoria: 'academico',
    fecha: getRelativeDate(5),
    horaInicio: '17:00',
    horaFin: '19:00',
    lugar: 'Laboratorio de Informática 2',
    descripcion:
      'Organizado por la Secretaría de Asuntos Académicos. Aprenderemos armado de secuencias didácticas, plataformas interactivas y rúbricas de evaluación digital.',
    portadaUrl: '',
    cupoMaximo: 35,
    publicadoPor: 'Santiago Gómez (Asuntos Académicos)',
    inscriptos: [
      { id: 'ins-6', nombre: 'Romina Carrizo', carrera: 'Profesorado de Primaria', anio: '4°', email: 'r.carrizo@alumnos.isfdyt26.edu.ar', fechaInscripcion: '2026-10-29T16:00:00' },
      { id: 'ins-7', nombre: 'Paula Aguirre', carrera: 'Profesorado de Inglés', anio: '3°', email: 'p.aguirre@alumnos.isfdyt26.edu.ar', fechaInscripcion: '2026-10-30T12:00:00' },
      { id: 'ins-8', nombre: 'Esteban Sosa', carrera: 'Profesorado de Historia', anio: '3°', email: 'e.sosa@alumnos.isfdyt26.edu.ar', fechaInscripcion: '2026-10-31T18:40:00' },
    ],
  },
  {
    id: 'ev-3',
    titulo: 'Torneo Relámpago de Vóley Mixto Intercarreras',
    categoria: 'deportivo',
    fecha: getRelativeDate(9),
    horaInicio: '14:00',
    horaFin: '18:30',
    lugar: 'Playón Deportivo Municipal',
    descripcion:
      'Vení a compartir una tarde deportiva y de camaradería entre turnos. Equipos mixtos de 6 personas (mínimo 2 de diferente género). ¡Habrá premios y buffet solidario!',
    portadaUrl: '',
    cupoMaximo: 60,
    publicadoPor: 'Franco Di Marco (Deportes)',
    inscriptos: [
      { id: 'ins-9', nombre: 'Gonzalo Silva', carrera: 'Educación Física', anio: '2°', email: 'g.silva@alumnos.isfdyt26.edu.ar', fechaInscripcion: '2026-10-28T09:10:00' },
      { id: 'ins-10', nombre: 'Valeria Godoy', carrera: 'Análisis de Sistemas', anio: '1°', email: 'v.godoy@alumnos.isfdyt26.edu.ar', fechaInscripcion: '2026-10-29T15:20:00' },
    ],
  },
  {
    id: 'ev-4',
    titulo: 'Muestra Colectiva: "Voces y Trazos del ISFDyT 26"',
    categoria: 'cultural',
    fecha: getRelativeDate(14),
    horaInicio: '19:00',
    horaFin: '21:30',
    lugar: 'Galería Central del Instituto',
    descripcion:
      'Exposición de obras de pintura, fotografía, grabado y poesía producidas por estudiantes de todas las carreras. Con micrófono abierto y música en vivo.',
    portadaUrl: '',
    cupoMaximo: 80,
    publicadoPor: 'Camila Morales (Cultura)',
    inscriptos: [
      { id: 'ins-11', nombre: 'Bárbara Solís', carrera: 'Artes Visuales', anio: '3°', email: 'b.solis@alumnos.isfdyt26.edu.ar', fechaInscripcion: '2026-10-31T17:00:00' },
    ],
  },
  {
    id: 'ev-5',
    titulo: 'Jornada de Bienvenida a Estudiantes del Turno Tarde',
    categoria: 'cultural',
    fecha: getRelativeDate(-7),
    horaInicio: '15:00',
    horaFin: '17:00',
    lugar: 'Patio de los Naranjos',
    descripcion: 'Encuentro con merienda colectiva y charla informativa sobre derechos estudiantiles y boleto educativo terciario.',
    portadaUrl: '',
    cupoMaximo: 100,
    publicadoPor: 'Martina Rossi',
    esPasado: true,
    inscriptos: [
      { id: 'ins-12', nombre: 'Matías Luna', carrera: 'Administración', anio: '1°', email: 'm.luna@alumnos.isfdyt26.edu.ar', fechaInscripcion: '2026-10-20T10:00:00' },
    ],
  },
];

export const INITIAL_ANNOUNCEMENTS: Comunicado[] = [
  {
    id: 'com-1',
    titulo: 'Apertura de Solicitudes para el Régimen de Estudiantes Trabajadores y con Personas a Cargo',
    extracto:
      'Se encuentra habilitado el formulario para solicitar la adecuación de asistencia y turnos según la normativa marco provincial.',
    contenido: `Estimada comunidad estudiantil del ISFDyT N° 26:

Les informamos que a partir de hoy y hasta el próximo viernes 15 de noviembre se encuentra abierto el período para presentar las solicitudes de **adecuación de asistencia y régimen especial para estudiantes trabajadores/as y con familiares a cargo**, conforme a la Resolución 4043/09.

### ¿Qué documentación tenés que adjuntar?
1. Constancia laboral formal o declaración jurada de trabajo informal firmada.
2. Certificado de nacimiento o constancia de vínculo familiar en caso de personas a cargo.
3. Horario de cursada y materias solicitadas.

Acercate a la mesita del Centro en el hall central de 18:00 a 20:00 hs para asesoramiento gratuito en el llenado de la planilla.

*El derecho a estudiar no puede ser un privilegio.*`,
    estado: 'publicado',
    fijado: true,
    fechaCreacion: '2026-10-31T14:30:00',
    autorNombre: 'Martina Rossi',
    autorCargo: 'Presidencia',
    adjuntos: [
      {
        id: 'adj-1',
        nombre: 'Formulario_Regimen_Especial_2026.pdf',
        tipo: 'pdf',
        tamanioBytes: 342000,
      },
      {
        id: 'adj-2',
        nombre: 'Instructivo_Paso_a_Paso_Resolucion4043.pdf',
        tipo: 'pdf',
        tamanioBytes: 512000,
      },
    ],
  },
  {
    id: 'com-2',
    titulo: 'Resultado de la Gestión ante Dirección: Nuevo dispenser de agua en el Anexo',
    extracto:
      'Tras el relevamiento de la Secretaría de Infraestructura, se instaló el dispenser de agua frío/calor en el primer piso del anexo.',
    contenido: `¡Buenas tardes a todos y todas!

Les queremos contar con mucha alegría que el reclamo canalizado la semana pasada dio sus frutos: el equipo de Auxiliares y Dirección confirmó la instalación y conexión del **dispenser de agua frío/calor** en el pasillo del primer piso del anexo.

Ya podés recargar tu termo para el mate o tu botella de agua fresca sin necesidad de bajar al patio central. Les pedimos a todas las carreras colaborar con el cuidado y la limpieza del sector.

Seguimos relevando las necesidades del edificio para elevarlas en cada reunión de CAI.`,
    estado: 'publicado',
    fijado: false,
    fechaCreacion: '2026-10-29T18:15:00',
    autorNombre: 'Lucas Paredes',
    autorCargo: 'Vocalía de Infraestructura',
    adjuntos: [],
  },
  {
    id: 'com-3',
    titulo: 'Cronograma Provisorio de Mesas de Diciembre 2026',
    extracto:
      'Borrador elevado por Bedelía sujeto a las observaciones de la asamblea estudiantil del jueves.',
    contenido: `Compartimos el borrador provisorio recibido desde Secretaría y Bedelía para el llamado ordinario de finales de diciembre 2026.

Recordá que este cronograma está en etapa de revisión: si tenés superposición de materias correlativas o del mismo año en el mismo llamado, traé el caso a la Asamblea del jueves o escribinos por la pestaña de Reclamos.`,
    estado: 'programado',
    fijado: false,
    fechaCreacion: '2026-11-01T08:00:00',
    fechaProgramada: '2026-11-03T09:00:00',
    autorNombre: 'Santiago Gómez',
    autorCargo: 'Asuntos Académicos',
    adjuntos: [
      {
        id: 'adj-3',
        nombre: 'Borrador_Mesas_Diciembre_ISFDyT26.pdf',
        tipo: 'pdf',
        tamanioBytes: 780000,
      },
    ],
  },
  {
    id: 'com-4',
    titulo: 'Convocatoria a Voluntarios para la Feria del Libro Usado',
    extracto:
      'Borrador para coordinar la recepción de manuales, fotocopias y libros de texto para el intercambio solidario.',
    contenido: `Estamos armando la tradicional Feria Solidaria de Libros y Apuntes del ISFDyT 26.
Buscamos compas de todas las carreras que puedan sumar una hora antes de entrar a cursar para catalogar y etiquetar el material donado.`,
    estado: 'borrador',
    fijado: false,
    fechaCreacion: '2026-10-28T16:20:00',
    autorNombre: 'Camila Morales',
    autorCargo: 'Cultura y DDHH',
    adjuntos: [],
  },
];

export const INITIAL_THREADS: ForoHilo[] = [
  {
    id: 'th-1',
    canal: 'general',
    titulo: 'Pautas de convivencia en el buffet y espacio de estudio del 2° piso',
    contenido:
      'Hola a todos. Abrimos este hilo para compartir propuestas sobre cómo ordenar el uso de enchufes y mesas compartidas en el entrepiso durante los recreos del turno vespertino.',
    autorNombre: 'Martina Rossi',
    autorCargo: 'Presidencia',
    esMiembroCentro: true,
    fecha: '2026-10-30T16:45:00',
    fijado: true,
    oculto: false,
    denunciado: false,
    respuestas: [
      {
        id: 'resp-1',
        autorNombre: 'Facundo Morales',
        esMiembroCentro: false,
        contenido:
          'Estaría bueno poner una zapatilla fija más en la pared sur, muchas veces somos 5 con la compu y no alcanzan las tomas.',
        fecha: '2026-10-30T17:10:00',
      },
      {
        id: 'resp-2',
        autorNombre: 'Lucas Paredes',
        autorCargo: 'Vocalía de Infraestructura',
        esMiembroCentro: true,
        contenido:
          '¡Tomado Facu! Ya pasamos el pedido a los auxiliares para revisar la carga de esa térmica y colocar tomas dobles.',
        fecha: '2026-10-30T18:00:00',
      },
      {
        id: 'resp-3',
        autorNombre: 'Carolina B.',
        esMiembroCentro: false,
        contenido: 'Y por favor acordémonos de tirar la yerba en los tachos del patio y no en las piletas del baño.',
        fecha: '2026-10-31T11:20:00',
      },
    ],
  },
  {
    id: 'th-2',
    canal: 'propuestas',
    titulo: 'Crear un banco digital de apuntes y resúmenes libres por carrera',
    contenido:
      'Proponemos armar una carpeta colaborativa institucional donde podamos subir resúmenes aprobados, modelos de parciales y guías de lectura divididas por año y materia.',
    autorNombre: 'Tomás Benítez',
    autorCargo: 'Vicepresidencia',
    esMiembroCentro: true,
    fecha: '2026-10-29T14:15:00',
    fijado: false,
    oculto: false,
    denunciado: false,
    respuestas: [
      {
        id: 'resp-4',
        autorNombre: 'Gisela Duarte (Primaria 3°)',
        esMiembroCentro: false,
        contenido: '¡Excelente idea! En Primaria tenemos un drive autogestionado pero muchos no lo conocen, podemos unificarlo.',
        fecha: '2026-10-29T16:30:00',
      },
      {
        id: 'resp-5',
        autorNombre: 'Santiago Gómez',
        autorCargo: 'Asuntos Académicos',
        esMiembroCentro: true,
        contenido: 'Desde la secretaría podemos organizar moderadores por carrera para verificar que el material esté prolijo.',
        fecha: '2026-10-30T09:40:00',
      },
    ],
  },
  {
    id: 'th-3',
    canal: 'eventos',
    titulo: 'Ideas para el festejo de fin de ciclo lectivo 2026',
    contenido:
      'Queremos que la despedida de año sea abierta, familiar e integradora. ¿Qué bandas, feriantes o actividades les gustaría sumar?',
    autorNombre: 'Camila Morales',
    autorCargo: 'Cultura y DDHH',
    esMiembroCentro: true,
    fecha: '2026-10-27T19:00:00',
    fijado: false,
    oculto: false,
    denunciado: false,
    respuestas: [
      {
        id: 'resp-6',
        autorNombre: 'Lautaro Paz',
        esMiembroCentro: false,
        contenido: 'Un acústico en el patio con compas que toquen guitarra sería genial.',
        fecha: '2026-10-28T12:00:00',
      },
    ],
  },
  {
    id: 'th-4',
    canal: 'general',
    titulo: 'Venta comercial no autorizada en pasillos y grupos de WhatsApp',
    contenido:
      'Se detectaron ofertas de créditos y rifas ajenas a la institución con cobros dudosos.',
    autorNombre: 'Usuario Desconocido',
    esMiembroCentro: false,
    fecha: '2026-10-31T15:00:00',
    fijado: false,
    oculto: false,
    denunciado: true,
    motivoDenuncia: 'Contenido spam con enlaces externos dudosos no relacionados con la vida académica del Instituto.',
    respuestas: [],
  },
  {
    id: 'th-5',
    canal: 'propuestas',
    titulo: 'Publicación con agravios personales entre estudiantes de 2° año',
    contenido: 'Texto ocultado preventivamente por incumplimiento de las normas de convivencia del foro.',
    autorNombre: 'Estudiante Anónimo',
    esMiembroCentro: false,
    fecha: '2026-10-25T11:00:00',
    fijado: false,
    oculto: true,
    motivoOculto: 'Violación al reglamento de respeto mutuo: agravios personales hacia compañeros.',
    denunciado: false,
    respuestas: [],
  },
];

export const INITIAL_CLAIMS: Reclamo[] = [
  {
    id: 'rec-1',
    codigo: 'REC-2026-042',
    categoria: 'academico',
    titulo: 'Superposición horaria entre Didáctica General y Sujetos de la Educación',
    descripcion:
      'En el Profesorado de Educación Primaria del turno tarde, los días miércoles quedaron asignadas dos materias obligatorias con 30 minutos de solapamiento en el aula 7 y aula 12. Varios estudiantes no podemos cumplir el 80% de asistencia exigido por el RAM.',
    esAnonimo: false,
    autorNombre: 'Mariana Peralta',
    autorCarrera: 'Profesorado de Primaria (2° año)',
    autorEmail: 'm.peralta@alumnos.isfdyt26.edu.ar',
    estado: 'recibido',
    fechaCreacion: '2026-11-01T08:15:00',
    adjuntos: [
      {
        id: 'adj-rec-1',
        nombre: 'Horario_Primaria_2_TurnoTarde.pdf',
        tipo: 'pdf',
        tamanioBytes: 215000,
      },
    ],
    timeline: [
      {
        id: 'tl-1',
        fecha: '2026-11-01T08:15:00',
        titulo: 'Reclamo recibido',
        descripcion: 'El reclamo ingresó a través de la plataforma estudiantil con documentación adjunta.',
        autor: 'Sistema',
        tipo: 'creacion',
      },
    ],
  },
  {
    id: 'rec-2',
    codigo: 'REC-2026-039',
    categoria: 'infraestructura',
    titulo: 'Falta de iluminación en el acceso peatonal sobre calle San Martín',
    descripcion:
      'A la salida del turno vespertino (22:15 hs) las luminarias exteriores de la vereda están apagadas. Es un peligro para la seguridad de quienes van caminando hasta la parada de colectivos.',
    esAnonimo: true,
    estado: 'en_revision',
    fechaCreacion: '2026-10-31T22:30:00',
    adjuntos: [],
    timeline: [
      {
        id: 'tl-2',
        fecha: '2026-10-31T22:30:00',
        titulo: 'Reclamo recibido (anónimo)',
        descripcion: 'Ingresó de manera anónima desde el turno vespertino.',
        autor: 'Estudiante anónimo/a',
        tipo: 'creacion',
      },
      {
        id: 'tl-3',
        fecha: '2026-11-01T09:00:00',
        titulo: 'Puesto en revisión',
        descripcion: 'Lucas Paredes (Infraestructura) constató el estado de las lámparas e inició el informe para elevar.',
        autor: 'Lucas Paredes',
        tipo: 'estado',
      },
    ],
  },
  {
    id: 'rec-3',
    codigo: 'REC-2026-035',
    categoria: 'administrativo',
    titulo: 'Demora en la firma de certificados de alumno regular para asignación familiar',
    descripcion:
      'Hace más de tres semanas presenté la solicitud en Preceptoría y aún figura en trámite. En ANSES me vence el plazo la semana próxima y necesito la constancia sellada.',
    esAnonimo: false,
    autorNombre: 'Rodrigo Benítez',
    autorCarrera: 'Tecnicatura en Gestión Ambiental (1° año)',
    autorEmail: 'r.benitez@alumnos.isfdyt26.edu.ar',
    estado: 'derivado',
    fechaCreacion: '2026-10-28T10:00:00',
    derivadoA: 'Preceptoría',
    notaDerivacion: 'Se elevó a la jefa de preceptores con carácter urgente por vencimiento de plazo ANSES.',
    adjuntos: [],
    timeline: [
      {
        id: 'tl-4',
        fecha: '2026-10-28T10:00:00',
        titulo: 'Reclamo recibido',
        descripcion: 'El estudiante detalló el riesgo de caducidad del beneficio.',
        autor: 'Rodrigo Benítez',
        tipo: 'creacion',
      },
      {
        id: 'tl-5',
        fecha: '2026-10-29T11:20:00',
        titulo: 'Derivado a Preceptoría',
        descripcion: 'Santiago Gómez presentó la nota en mesa de entradas de Preceptoría (Derivación simulada en la demo).',
        autor: 'Santiago Gómez',
        tipo: 'derivacion',
      },
    ],
  },
  {
    id: 'rec-4',
    codigo: 'REC-2026-028',
    categoria: 'sugerencia',
    titulo: 'Incorporar microondas para calentar viandas en el buffet estudiantil',
    descripcion:
      'Muchos compas que cursan de corrido o vienen directo del trabajo necesitan calentar la comida al mediodía o antes de entrar a las 18 hs. Un microondas sería de enorme ayuda.',
    esAnonimo: false,
    autorNombre: 'Estefanía Toledo',
    autorCarrera: 'Profesorado de Historia (3° año)',
    autorEmail: 'e.toledo@alumnos.isfdyt26.edu.ar',
    estado: 'respondido',
    fechaCreacion: '2026-10-22T14:00:00',
    respuestaAlAutor:
      '¡Hola Estefanía! Recibimos tu propuesta con mucho agrado. Te contamos que la Secretaría de Finanzas destinó una partida de la fotocopiadora para comprar un microondas de 20 litros. Estará operativo en el comedor a partir del próximo lunes.',
    adjuntos: [],
    timeline: [
      {
        id: 'tl-6',
        fecha: '2026-10-22T14:00:00',
        titulo: 'Sugerencia recibida',
        descripcion: 'Ingresó propuesta para mejorar las condiciones de cursada.',
        autor: 'Estefanía Toledo',
        tipo: 'creacion',
      },
      {
        id: 'tl-7',
        fecha: '2026-10-24T18:00:00',
        titulo: 'Respuesta formal enviada',
        descripcion: 'Se comunicó la aprobación de la compra del equipamiento con fondos propios del Centro.',
        autor: 'Julieta Méndez',
        tipo: 'respuesta',
      },
    ],
  },
  {
    id: 'rec-5',
    codigo: 'REC-2026-019',
    categoria: 'infraestructura',
    titulo: 'Cerradura rota en baño de planta baja del anexo',
    descripcion: 'El cerrojo no trababa bien. Caso resuelto por Auxiliares durante el receso.',
    esAnonimo: true,
    estado: 'archivado',
    motivoArchivo: 'Caso subsanado por personal auxiliar de mantenimiento en fecha 24/10/2026.',
    fechaCreacion: '2026-10-15T11:00:00',
    adjuntos: [],
    timeline: [
      {
        id: 'tl-8',
        fecha: '2026-10-15T11:00:00',
        titulo: 'Reclamo recibido',
        descripcion: 'Aviso sobre cerrojo trabado.',
        autor: 'Estudiante anónimo/a',
        tipo: 'creacion',
      },
      {
        id: 'tl-9',
        fecha: '2026-10-25T09:00:00',
        titulo: 'Archivado con resolución favorable',
        descripcion: 'El equipo auxiliar reemplazó el picaporte y la cerradura.',
        autor: 'Lucas Paredes',
        tipo: 'archivo',
      },
    ],
  },
];

export const INITIAL_NOTIFICATIONS: NotificacionItem[] = [
  {
    id: 'notif-1',
    tipo: 'reclamo',
    titulo: 'Nuevo reclamo académico recibido',
    descripcion: 'Mariana Peralta reportó superposición horaria en Didáctica General (REC-2026-042).',
    fecha: '2026-11-01T08:15:00',
    leida: false,
    linkScreen: 'reclamos',
    itemId: 'rec-1',
  },
  {
    id: 'notif-2',
    tipo: 'inscripcion',
    titulo: 'Nueva inscripción a Asamblea Abierta',
    descripcion: 'Joaquín Pereyra (Higiene y Seguridad) se anotó a la asamblea del jueves.',
    fecha: '2026-11-01T08:05:00',
    leida: false,
    linkScreen: 'eventos',
    itemId: 'ev-1',
  },
  {
    id: 'notif-3',
    tipo: 'denuncia',
    titulo: 'Publicación denunciada en Foros',
    descripcion: 'Se denunció un hilo por enlaces comerciales en el canal General.',
    fecha: '2026-10-31T15:00:00',
    leida: false,
    linkScreen: 'foros',
    itemId: 'th-4',
  },
  {
    id: 'notif-4',
    tipo: 'foro',
    titulo: 'Nueva respuesta en pautas de convivencia',
    descripcion: 'Carolina B. sumó un comentario en el hilo de buffet y espacio de estudio.',
    fecha: '2026-10-31T11:20:00',
    leida: true,
    linkScreen: 'foros',
    itemId: 'th-1',
  },
  {
    id: 'notif-5',
    tipo: 'inscripcion',
    titulo: '3 inscriptos nuevos en Taller de Recursos Digitales',
    descripcion: 'El cupo alcanzó el 30% para el laboratorio de informática.',
    fecha: '2026-10-30T18:00:00',
    leida: true,
    linkScreen: 'eventos',
    itemId: 'ev-2',
  },
];
