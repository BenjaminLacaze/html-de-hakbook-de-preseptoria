/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Tipos para el Panel del Centro de Estudiantes
 *
 * Son los tipos propios de la pantalla. Los datos llegan de la API institucional
 * (/api/v1) y se traducen en src/centro-estudiantes/api/centro.ts.
 */

export type ScreenId =
  | 'inicio'
  | 'eventos'
  | 'comunicados'
  | 'foros'
  | 'reclamos'
  | 'miembros'
  | 'perfil';

export type EventCategory = 'academico' | 'cultural' | 'deportivo' | 'reunion';

/** Inscripto a un evento (GET /centro/events/:id/participants). */
export interface EventAttendee {
  id: string;
  nombre: string;
  carrera: string; // vacío si la cuenta no es de alumno
  email: string;
  fechaInscripcion: string; // ISO date-time
}

export interface Evento {
  id: string;
  titulo: string;
  categoria: EventCategory;
  fecha: string; // ISO date YYYY-MM-DD
  horaInicio: string; // HH:mm o vacío
  horaFin: string; // HH:mm o vacío
  lugar: string;
  descripcion: string;
  organizador: string;
  portadaUrl?: string;
  cupoMaximo?: number;
  cantidadInscriptos: number;
  esPasado: boolean;
}

/** Datos que carga el formulario de evento. */
export type EventoInput = Omit<Evento, 'id' | 'cantidadInscriptos' | 'esPasado'>;

export type ComunicadoEstado = 'publicado' | 'programado' | 'borrador';

/** Adjunto por enlace: todavía no hay subida de archivos en la API. */
export interface AdjuntoItem {
  id: string; // solo para la lista en pantalla
  nombre: string;
  tipo: 'imagen' | 'pdf' | 'documento';
  url: string;
  tamanioBytes?: number;
}

export interface Comunicado {
  id: string;
  titulo: string;
  extracto: string;
  contenido: string;
  portadaUrl?: string;
  estado: ComunicadoEstado;
  fijado: boolean;
  fechaCreacion: string;
  /** Fecha de publicación (YYYY-MM-DD). Si es futura, el comunicado está programado. */
  fechaPublicacion?: string;
  autorNombre: string;
  autorCargo?: string;
  adjuntos: AdjuntoItem[];
}

export interface ComunicadoInput {
  titulo: string;
  extracto: string;
  contenido: string;
  portadaUrl?: string;
  fijado: boolean;
  adjuntos: AdjuntoItem[];
  estado: ComunicadoEstado;
  /** Solo para 'programado'. */
  fechaPublicacion?: string;
}

export type ReclamoEstado = 'recibido' | 'en_revision' | 'derivado' | 'respondido' | 'archivado';
export type ReclamoCategoria = 'academico' | 'infraestructura' | 'administrativo' | 'sugerencia';
export type DestinoDerivacion = 'Bedelía' | 'Dirección' | 'Preceptoría' | 'Auxiliares';

export interface TimelineEvent {
  id: string;
  fecha: string;
  titulo: string;
  descripcion: string;
  autor: string;
  tipo: 'creacion' | 'estado' | 'derivacion' | 'respuesta' | 'archivo';
}

export interface Reclamo {
  id: string;
  codigo: string; // e.g. "REC-2026-042"
  categoria: ReclamoCategoria;
  titulo: string;
  descripcion: string;
  esAnonimo: boolean;
  autorNombre?: string;
  autorCarrera?: string;
  autorEmail?: string;
  estado: ReclamoEstado;
  fechaCreacion: string;
  derivadoA?: DestinoDerivacion;
  notaDerivacion?: string;
  respuestaAlAutor?: string;
  motivoArchivo?: string;
  timeline: TimelineEvent[];
}

export type ForoCanal = 'general' | 'propuestas' | 'eventos';

export interface ForoRespuesta {
  id: string;
  autorNombre: string;
  autorCargo?: string;
  esMiembroCentro: boolean;
  contenido: string;
  fecha: string;
}

export interface ForoHilo {
  id: string;
  canal: ForoCanal;
  titulo: string;
  contenido: string;
  autorId: string;
  autorNombre: string;
  autorCargo?: string;
  esMiembroCentro: boolean;
  fecha: string;
  fijado: boolean;
  oculto: boolean;
  motivoOculto?: string;
  denunciado: boolean;
  motivoDenuncia?: string;
  cantidadRespuestas: number;
}

export interface MiembroCentro {
  id: string;
  nombre: string;
  /** Cargo en el Centro (perfil.position). Vacío si no lo cargó. */
  cargo: string;
  biografia?: string;
  iniciales: string;
  colorAvatar: string;
  avatarUrl?: string;
}

/** La persona con la sesión iniciada. */
export interface UsuarioActual extends MiembroCentro {
  email: string;
  roles: string[];
}

export interface NotificacionItem {
  id: string;
  tipo: 'reclamo' | 'inscripcion' | 'foro' | 'denuncia' | 'mensaje' | 'general';
  titulo: string;
  descripcion: string;
  fecha: string;
  leida: boolean;
  linkScreen?: ScreenId;
  itemId?: string;
}

export type ThemeName = 'celestial' | 'oscuro' | 'ensonacion' | 'moderno' | 'fantasma' | 'rebelde';
