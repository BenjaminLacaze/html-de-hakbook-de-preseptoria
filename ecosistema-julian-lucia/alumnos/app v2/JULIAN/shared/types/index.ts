/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from "zod";

// 1. Esquema del Alumno (A4: Coherencia de trayectoria - Ingreso marzo 2025 -> 2° año en 2026)
export const AlumnoSchema = z.object({
  id: z.string(),
  dni: z.string(),
  legajo: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  email: z.string().email(),
  telefono: z.string(),
  carrera: z.string(),
  resolucionPlan: z.string(),
  anio: z.number().int().min(1).max(5),
  turno: z.enum(["Mañana", "Tarde", "Vespertino"]),
  condicion: z.enum(["Regular", "Condicional", "Libre", "Sin datos"]),
  sede: z.string(),
  fotoUrl: z.string().optional(),
  fechaIngreso: z.string(), // "15/03/2025"
});
export type Alumno = z.infer<typeof AlumnoSchema>;

// 2. Esquema de Materia (base de cursada; métricas derivadas calculadas por metrics.ts)
export const MateriaSchema = z.object({
  id: z.string(),
  codigo: z.string(),
  nombre: z.string(),
  docente: z.string(),
  comision: z.string(),
  anio: z.number().int(),
  cuatrimestre: z.enum(["1° Cuatrimestre", "2° Cuatrimestre", "Anual"]),
  horario: z.string(),
  diaSemana: z.string().optional(),
  aula: z.string(),
  horasSemanales: z.number().nullable(),
  correlativas: z.array(z.string()),
  programaContenidos: z.array(z.string()).optional(),
  estadoCursada: z.enum(["En Cursada", "Regularizada", "Promocionada", "Libre"]),
});
export type Materia = z.infer<typeof MateriaSchema>;

// 3. Esquema de Evaluación
export const EvaluacionSchema = z.object({
  id: z.string(),
  materiaId: z.string(),
  materiaNombre: z.string(),
  tipo: z.enum(["1° Parcial", "2° Parcial", "Recuperatorio", "Trabajo Práctico", "TPI", "Examen Final"]),
  titulo: z.string(),
  fecha: z.string(), // YYYY-MM-DD
  fechaPublicacion: z.string().nullable(),
  nota: z.number().min(1).max(10).nullable(),
  observaciones: z.string().optional(),
  estado: z.enum(["publicada", "en_correccion", "proxima"]),
  pesoPorcentual: z.number().optional(),
  instanciaRecuperatorio: z.string().optional(),
});
export type Evaluacion = z.infer<typeof EvaluacionSchema>;

// 4. Esquema de Registro de Asistencia (Fuente de verdad atómica)
export const RegistroAsistenciaSchema = z.object({
  id: z.string(),
  materiaId: z.string(),
  materiaNombre: z.string(),
  fecha: z.string(), // YYYY-MM-DD
  hora: z.string(),  // HH:mm
  estado: z.enum(["presente", "ausente", "tardanza", "justificada"]),
  metodo: z.enum(["QR", "Docente", "Preceptor"]),
  motivoJustificacion: z.string().optional(),
  moduloClase: z.string(),
  solicitudJustificacionId: z.string().optional(),
});
export type RegistroAsistencia = z.infer<typeof RegistroAsistenciaSchema>;

// 5. Esquema de Evento de Agenda
export const EventoSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  tipo: z.enum(["parcial", "entrega", "feriado", "jornada", "academico"]),
  fecha: z.string(), // YYYY-MM-DD
  horaInicio: z.string(),
  horaFin: z.string(),
  materiaNombre: z.string().optional(),
  lugar: z.string(),
  descripcion: z.string(),
  obligatorio: z.boolean(),
  recordatorioActivo: z.boolean().optional(),
});
export type Evento = z.infer<typeof EventoSchema>;

// 6. Esquema de Aviso Institucional
export const AvisoSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  resumen: z.string(),
  cuerpo: z.string(),
  fecha: z.string(), // YYYY-MM-DD o dd/MM/yyyy
  remitente: z.string(),
  categoria: z.enum(["Institucional", "Bedelía", "Jornadas", "Docente"]),
  prioridad: z.enum(["alta", "normal"]),
  leido: z.boolean(),
});
export type Aviso = z.infer<typeof AvisoSchema>;

// 7. Esquema de Publicación de Foro / Comunidad
export const RespuestaForoSchema = z.object({
  id: z.string(),
  autor: z.string(),
  rol: z.enum(["Docente", "Alumno", "Bedelía", "Coordinación", "Participante"]),
  fecha: z.string(),
  contenido: z.string(),
  esPropia: z.boolean().optional(),
});
export type RespuestaForo = z.infer<typeof RespuestaForoSchema>;

export const PublicacionForoSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  autor: z.string(),
  rol: z.enum(["Docente", "Alumno", "Bedelía", "Coordinación", "Participante"]),
  fecha: z.string(),
  canal: z.enum(["Avisos Generales", "Consultas Académicas", "Proyectos y Prácticas", "Jornadas e Intercambio"]),
  contenido: z.string(),
  materiaRelacionada: z.string().optional(),
  esPropia: z.boolean().optional(),
  respuestas: z.array(RespuestaForoSchema),
});
export type PublicacionForo = z.infer<typeof PublicacionForoSchema>;

// 8. Hito del Historial Académico (A4: Coherencia de trayectoria)
export const HitoHistorialSchema = z.object({
  id: z.string(),
  periodo: z.string(),
  anioLectivo: z.union([z.number(), z.string()]),
  tipo: z.enum(["cursada", "final", "inscripcion", "equivalencia"]),
  titulo: z.string(),
  detalle: z.string(),
  calificacion: z.number().nullable().optional(),
  condicion: z.string(),
  fecha: z.string(),
});
export type HitoHistorial = z.infer<typeof HitoHistorialSchema>;

// 9. Solicitudes de rectificación a Bedelía
export const SolicitudCorreccionSchema = z.object({
  id: z.string(),
  fechaSolicitud: z.string(),
  campo: z.string(),
  valorPropuesto: z.string(),
  motivo: z.string(),
  archivoAdjuntoNombre: z.string().optional(),
  estado: z.enum(["Pendiente", "En Revisión", "Rechazada", "Aprobada"]),
});
export type SolicitudCorreccion = z.infer<typeof SolicitudCorreccionSchema>;

// 10. Solicitud de justificación de inasistencia
export const SolicitudJustificacionSchema = z.object({
  id: z.string(),
  asistenciaId: z.string(),
  fechaSolicitud: z.string(),
  motivo: z.string(),
  certificadoNombre: z.string(),
  estado: z.enum(["En revisión", "Aprobada", "Observada"]),
});
export type SolicitudJustificacion = z.infer<typeof SolicitudJustificacionSchema>;

// 11. Notificaciones derivadas
export interface NotificacionItem {
  id: string;
  titulo: string;
  detalle: string;
  fecha: string;
  tipo: "aviso" | "evento" | "asistencia";
  leida: boolean;
  accionSection?: NavigationSection;
  referenciaId?: string;
}

// 12. Preferencias de usuario
export interface PreferenciasUsuario {
  notifInasistencia: boolean;
  notifExamenes: boolean;
  notifAvisos: boolean;
  canalEmail: boolean;
  canalPush: boolean;
  tamanoTexto: "normal" | "grande";
  reducirMovimiento: boolean;
  densidadTabla: "comoda" | "compacta";
  modoDemoEstable: boolean;
}

// 13. Temas disponibles
export type AppTheme = "celestial" | "oscuro" | "ensoniacion" | "moderno" | "fantasma" | "rebelde";

// 14. Secciones de navegación
export type NavigationSection = 
  | "inicio"
  | "perfil"
  | "agenda"
  | "materias"
  | "notas"
  | "faltas"
  | "historial"
  | "comunidad"
  | "foros"
  | "opciones"
  | "apariencia"
  | "asistencia-qr"
  | "logout";
