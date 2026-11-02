/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Endpoints que usa el Panel del Centro y traducción API ↔ pantalla
 *
 * Única capa que conoce las rutas y los códigos de la API. Las pantallas trabajan
 * con los tipos de ../types (en castellano) y nunca con los DTO.
 */

import { apiFetch } from './http';
import type {
  AppNotification,
  AuthMe,
  DirectoryEntry,
  PrivateMessage,
  RepAnnouncement,
  RepAnnouncementBody,
  RepAttachment,
  RepClaim,
  RepClaimDestination,
  RepClaimHistoryItem,
  RepClaimPatch,
  RepClaimStatus,
  RepClaimCategory,
  RepEvent,
  RepEventBody,
  RepEventParticipantView,
  RepEventType,
  RepForumCategory,
  RepReply,
  RepThread,
  UserProfile,
} from './dto';
import type {
  AdjuntoItem,
  Comunicado,
  ComunicadoInput,
  DestinoDerivacion,
  EventAttendee,
  EventCategory,
  Evento,
  EventoInput,
  ForoCanal,
  ForoHilo,
  ForoRespuesta,
  MiembroCentro,
  NotificacionItem,
  Reclamo,
  ReclamoCategoria,
  ReclamoEstado,
  ScreenId,
  TimelineEvent,
  UsuarioActual,
} from '../types';

// ===================================================================== utilidades

/** Fecha de hoy en Buenos Aires (YYYY-MM-DD), igual que la calcula el backend. */
export const todayISO = (): string =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });

const invert = <K extends string, V extends string>(m: Record<K, V>) =>
  Object.fromEntries(Object.entries(m).map(([k, v]) => [v, k])) as Record<V, K>;

const iniciales = (nombre: string) =>
  nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');

/** Color de avatar estable por persona (solo presentación, dentro de la paleta de marca). */
const AVATAR_COLORS = ['#14214F', '#89743A', '#3F78B6', '#1C2E6B', '#6B5A2D', '#245487'];
const colorPara = (id: string) => {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length]!;
};

// ===================================================================== catálogos

const CATEGORIA_EVENTO: Record<EventCategory, RepEventType> = {
  academico: 'ACADEMIC',
  cultural: 'CULTURAL',
  deportivo: 'SPORTS',
  reunion: 'MEETING',
};
const CATEGORIA_EVENTO_API = invert(CATEGORIA_EVENTO);

const CANAL_FORO: Record<ForoCanal, RepForumCategory> = {
  general: 'GENERAL',
  propuestas: 'PROPOSALS',
  eventos: 'EVENTS',
};
const CANAL_FORO_API = invert(CANAL_FORO);

const ESTADO_RECLAMO: Record<ReclamoEstado, RepClaimStatus> = {
  recibido: 'PENDING',
  en_revision: 'IN_REVIEW',
  derivado: 'FORWARDED',
  respondido: 'RESOLVED',
  archivado: 'ARCHIVED',
};
const ESTADO_RECLAMO_API = invert(ESTADO_RECLAMO);

const CATEGORIA_RECLAMO_API: Record<RepClaimCategory, ReclamoCategoria> = {
  ACADEMIC: 'academico',
  INFRASTRUCTURE: 'infraestructura',
  ADMINISTRATIVE: 'administrativo',
  SUGGESTION: 'sugerencia',
};

const DESTINO: Record<DestinoDerivacion, RepClaimDestination> = {
  Bedelía: 'BEDELIA',
  Dirección: 'DIRECTION',
  Preceptoría: 'PRECEPTORSHIP',
  Auxiliares: 'STAFF',
};
const DESTINO_API = invert(DESTINO);

const TIPO_ADJUNTO: Record<AdjuntoItem['tipo'], RepAttachment['kind']> = {
  imagen: 'image',
  pdf: 'pdf',
  documento: 'document',
};
const TIPO_ADJUNTO_API = invert(TIPO_ADJUNTO);

const TIPO_HISTORIAL: Record<RepClaimHistoryItem['type'], TimelineEvent['tipo']> = {
  CREATED: 'creacion',
  STATUS: 'estado',
  FORWARDED: 'derivacion',
  RESPONSE: 'respuesta',
  ARCHIVED: 'archivo',
};

// ===================================================================== usuario y miembros

export async function fetchUsuarioActual(me: AuthMe): Promise<UsuarioActual> {
  const perfil = await apiFetch<UserProfile>('/social/profiles/me');
  const nombre = `${me.user.firstName} ${me.user.lastName}`.trim();
  return {
    id: me.user.id,
    nombre,
    email: me.user.email,
    roles: me.user.roles,
    cargo: perfil.position ?? '',
    biografia: perfil.bio,
    avatarUrl: perfil.avatarUrl,
    iniciales: iniciales(nombre),
    colorAvatar: perfil.accentColor ?? colorPara(me.user.id),
  };
}

/** Integrantes del Centro: directorio filtrado por rol + la biografía de cada perfil. */
export async function fetchMiembros(): Promise<MiembroCentro[]> {
  const rows = await apiFetch<DirectoryEntry[]>('/social/directory?role=STUDENT_REP');
  const perfiles = await Promise.all(
    rows.map((r) => apiFetch<UserProfile>(`/social/profiles/${encodeURIComponent(r.id)}`).catch(() => null)),
  );
  return rows.map((r, i) => {
    const nombre = `${r.firstName} ${r.lastName}`.trim();
    const p = perfiles[i];
    return {
      id: r.id,
      nombre,
      cargo: r.position ?? '',
      biografia: p?.bio,
      avatarUrl: r.avatarUrl,
      iniciales: iniciales(nombre),
      colorAvatar: p?.accentColor ?? colorPara(r.id),
    };
  });
}

/** Cargo en el Centro y biografía del perfil propio (PUT /social/profiles/me). */
export const updatePerfil = (datos: { cargo: string; biografia: string }) =>
  apiFetch<{ ok: true }>('/social/profiles/me', {
    method: 'PUT',
    body: { position: datos.cargo.trim() || null, bio: datos.biografia.trim() || null },
  });

/** Mensaje privado interno (llega a la bandeja de mensajes de la persona). */
export const sendMessage = (receiverId: string, text: string) =>
  apiFetch<PrivateMessage>('/social/messages', { method: 'POST', body: { receiverId, text } });

// ===================================================================== eventos

const toEvento = (e: RepEvent, hoy: string): Evento => ({
  id: e.id,
  titulo: e.title,
  categoria: CATEGORIA_EVENTO_API[e.type] ?? 'reunion',
  fecha: e.date,
  horaInicio: e.time ?? '',
  horaFin: e.endTime ?? '',
  lugar: e.location ?? '',
  descripcion: e.description,
  organizador: e.organizer,
  portadaUrl: e.coverUrl,
  cupoMaximo: e.capacity,
  cantidadInscriptos: e.participantCount,
  esPasado: e.date < hoy,
});

const toEventBody = (i: EventoInput): RepEventBody => ({
  title: i.titulo.trim(),
  date: i.fecha,
  time: i.horaInicio || undefined,
  endTime: i.horaFin || null,
  location: i.lugar.trim() || undefined,
  description: i.descripcion.trim(),
  type: CATEGORIA_EVENTO[i.categoria],
  organizer: i.organizador.trim(),
  capacity: i.cupoMaximo ?? null,
  coverUrl: i.portadaUrl?.trim() || null,
});

export async function fetchEventos(): Promise<Evento[]> {
  const hoy = todayISO();
  return (await apiFetch<RepEvent[]>('/centro/events')).map((e) => toEvento(e, hoy));
}

export const createEvento = (i: EventoInput) =>
  apiFetch<{ id: string }>('/centro/events', { method: 'POST', body: toEventBody(i) });

export const updateEvento = (id: string, i: EventoInput) =>
  apiFetch<{ id: string }>(`/centro/events/${encodeURIComponent(id)}`, { method: 'PATCH', body: toEventBody(i) });

export const deleteEvento = (id: string) =>
  apiFetch<void>(`/centro/events/${encodeURIComponent(id)}`, { method: 'DELETE' });

export async function fetchInscriptos(eventId: string): Promise<EventAttendee[]> {
  const rows = await apiFetch<RepEventParticipantView[]>(`/centro/events/${encodeURIComponent(eventId)}/participants`);
  return rows.map((p) => ({
    id: p.id,
    nombre: `${p.firstName} ${p.lastName}`.trim(),
    carrera: p.careerName ?? '',
    email: p.email,
    fechaInscripcion: p.joinedAt,
  }));
}

// ===================================================================== comunicados

const toComunicado = (a: RepAnnouncement, hoy: string): Comunicado => ({
  id: a.id,
  titulo: a.title,
  extracto: a.summary ?? '',
  contenido: a.content,
  portadaUrl: a.coverUrl,
  estado: a.draft ? 'borrador' : a.publishDate && a.publishDate > hoy ? 'programado' : 'publicado',
  fijado: a.pinned,
  fechaCreacion: a.createdAt,
  fechaPublicacion: a.publishDate,
  autorNombre: a.authorName,
  autorCargo: a.authorPosition,
  adjuntos: (a.attachments ?? []).map((att, idx) => ({
    id: `${a.id}-${idx}`,
    nombre: att.name,
    url: att.url,
    tipo: TIPO_ADJUNTO_API[att.kind] ?? 'documento',
    tamanioBytes: att.sizeBytes,
  })),
});

const toAnnouncementBody = (i: ComunicadoInput): RepAnnouncementBody => ({
  title: i.titulo.trim(),
  content: i.contenido.trim(),
  summary: i.extracto.trim() || null,
  coverUrl: i.portadaUrl?.trim() || null,
  pinned: i.fijado,
  draft: i.estado === 'borrador',
  // Programado = fecha de publicación futura. Publicar ahora = sin fecha.
  publishDate: i.estado === 'programado' ? i.fechaPublicacion ?? null : null,
  attachments: i.adjuntos.map((a) => ({
    name: a.nombre.trim(),
    url: a.url.trim(),
    kind: TIPO_ADJUNTO[a.tipo],
    ...(a.tamanioBytes !== undefined ? { sizeBytes: a.tamanioBytes } : {}),
  })),
});

export async function fetchComunicados(): Promise<Comunicado[]> {
  const hoy = todayISO();
  return (await apiFetch<RepAnnouncement[]>('/centro/announcements')).map((a) => toComunicado(a, hoy));
}

export const createComunicado = (i: ComunicadoInput) =>
  apiFetch<{ id: string }>('/centro/announcements', { method: 'POST', body: toAnnouncementBody(i) });

export const updateComunicado = (id: string, i: ComunicadoInput) =>
  apiFetch<{ id: string }>(`/centro/announcements/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: toAnnouncementBody(i),
  });

export const deleteComunicado = (id: string) =>
  apiFetch<void>(`/centro/announcements/${encodeURIComponent(id)}`, { method: 'DELETE' });

// ===================================================================== foro

const toHilo = (t: RepThread): ForoHilo => ({
  id: t.id,
  canal: CANAL_FORO_API[t.category] ?? 'general',
  titulo: t.title,
  contenido: t.content,
  autorId: t.authorId,
  autorNombre: t.authorName,
  autorCargo: t.authorPosition,
  esMiembroCentro: t.authorIsRep,
  fecha: t.createdAt,
  fijado: t.pinned,
  oculto: t.hidden,
  motivoOculto: t.hiddenReason,
  denunciado: t.reported,
  motivoDenuncia: t.reportReason,
  cantidadRespuestas: t.replyCount,
});

export async function fetchHilos(): Promise<ForoHilo[]> {
  return (await apiFetch<RepThread[]>('/centro/threads')).map(toHilo);
}

export const createHilo = (canal: ForoCanal, titulo: string, contenido: string) =>
  apiFetch<{ id: string }>('/centro/threads', {
    method: 'POST',
    body: { category: CANAL_FORO[canal], title: titulo.trim(), content: contenido.trim() },
  });

export const patchHilo = (
  id: string,
  body: { pinned?: boolean; hidden?: boolean; hiddenReason?: string; reported?: false },
) => apiFetch<{ id: string }>(`/centro/threads/${encodeURIComponent(id)}`, { method: 'PATCH', body });

export async function fetchRespuestas(hiloId: string): Promise<ForoRespuesta[]> {
  const rows = await apiFetch<RepReply[]>(`/centro/threads/${encodeURIComponent(hiloId)}/replies`);
  return rows.map((r) => ({
    id: r.id,
    autorNombre: r.authorName,
    autorCargo: r.authorPosition,
    esMiembroCentro: r.authorIsRep,
    contenido: r.content,
    fecha: r.createdAt,
  }));
}

export const createRespuesta = (hiloId: string, contenido: string) =>
  apiFetch<{ id: string }>(`/centro/threads/${encodeURIComponent(hiloId)}/replies`, {
    method: 'POST',
    body: { content: contenido.trim() },
  });

// ===================================================================== reclamos

const toReclamo = (r: RepClaim): Reclamo => ({
  id: r.id,
  codigo: r.code ?? `#${r.id.slice(0, 8)}`,
  categoria: CATEGORIA_RECLAMO_API[r.category] ?? 'sugerencia',
  titulo: r.title ?? (r.description.length > 80 ? `${r.description.slice(0, 80)}…` : r.description),
  descripcion: r.description,
  esAnonimo: r.anonymous,
  autorNombre: r.authorName,
  autorCarrera: r.authorCareer,
  autorEmail: r.authorEmail,
  estado: ESTADO_RECLAMO_API[r.status] ?? 'recibido',
  fechaCreacion: r.createdAt,
  derivadoA: r.forwardedTo ? DESTINO_API[r.forwardedTo] : undefined,
  notaDerivacion: r.forwardNote,
  respuestaAlAutor: r.response,
  motivoArchivo: r.archiveReason,
  timeline: (r.history ?? []).map((h, idx) => ({
    id: `${r.id}-${idx}`,
    fecha: h.at,
    titulo: h.title,
    descripcion: h.note ?? '',
    autor: h.actorName,
    tipo: TIPO_HISTORIAL[h.type] ?? 'estado',
  })),
});

export async function fetchReclamos(): Promise<Reclamo[]> {
  return (await apiFetch<RepClaim[]>('/centro/claims')).map(toReclamo);
}

const patchReclamo = async (id: string, body: RepClaimPatch) =>
  toReclamo(await apiFetch<RepClaim>(`/centro/claims/${encodeURIComponent(id)}`, { method: 'PATCH', body }));

export const cambiarEstadoReclamo = (id: string, estado: ReclamoEstado, nota?: string) =>
  patchReclamo(id, { status: ESTADO_RECLAMO[estado], ...(nota?.trim() ? { note: nota.trim() } : {}) });

export const derivarReclamo = (id: string, destino: DestinoDerivacion, nota: string) =>
  patchReclamo(id, { forwardedTo: DESTINO[destino], forwardNote: nota.trim() });

/** Responder deja el reclamo como resuelto ("Respondido" en la pantalla). */
export const responderReclamo = (id: string, respuesta: string) =>
  patchReclamo(id, { status: 'RESOLVED', response: respuesta.trim() });

export const archivarReclamo = (id: string, motivo: string) =>
  patchReclamo(id, { archiveReason: motivo.trim() });

// ===================================================================== notificaciones

const TIPO_NOTIFICACION: Partial<Record<AppNotification['type'], NotificacionItem['tipo']>> = {
  CLAIM: 'reclamo',
  EVENT: 'inscripcion',
  FORUM: 'foro',
  MESSAGE: 'mensaje',
};

/** Traduce los enlaces que arma el backend (/centro/events/:id, /centro/threads/:id, /centro/claims/:id). */
const destinoDeEnlace = (link?: string): { linkScreen?: ScreenId; itemId?: string } => {
  const m = link?.match(/^\/centro\/(events|threads|claims|announcements)(?:\/([^/?#]+))?/);
  if (!m) return {};
  const screen: Record<string, ScreenId> = {
    events: 'eventos',
    threads: 'foros',
    claims: 'reclamos',
    announcements: 'comunicados',
  };
  return { linkScreen: screen[m[1]!], itemId: m[2] };
};

const toNotificacion = (n: AppNotification): NotificacionItem => {
  const esDenuncia = n.type === 'FORUM' && /denunci/i.test(n.text);
  return {
    id: n.id,
    tipo: esDenuncia ? 'denuncia' : TIPO_NOTIFICACION[n.type] ?? 'general',
    titulo: n.text,
    descripcion: n.details ?? '',
    fecha: n.createdAt,
    leida: !!n.readAt,
    ...destinoDeEnlace(n.link),
  };
};

export async function fetchNotificaciones(): Promise<NotificacionItem[]> {
  return (await apiFetch<AppNotification[]>('/social/notifications')).map(toNotificacion);
}

/** Sin ids marca todas como leídas. */
export const marcarNotificacionesLeidas = (ids?: string[]) =>
  apiFetch<{ updated: number }>('/social/notifications/read', { method: 'POST', body: ids ? { ids } : {} });
