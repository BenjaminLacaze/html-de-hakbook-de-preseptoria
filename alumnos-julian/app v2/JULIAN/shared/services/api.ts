import {
  AlumnoSchema,
  MateriaSchema,
  EvaluacionSchema,
  RegistroAsistenciaSchema,
  EventoSchema,
  AvisoSchema,
  PublicacionForoSchema,
  HitoHistorialSchema,
  SolicitudCorreccionSchema,
  SolicitudJustificacionSchema,
  type Alumno,
  type Materia,
  type Evaluacion,
  type RegistroAsistencia,
  type Evento,
  type Aviso,
  type PublicacionForo,
  type HitoHistorial,
  type SolicitudCorreccion,
  type SolicitudJustificacion,
  type PreferenciasUsuario,
  type NotificacionItem,
} from "../types";
import { apiFetch, getMe } from "./http";

type ApiStudent = {
  id: string; fileNumber: string; dni: string; firstName: string; lastName: string;
  email: string; phone?: string; admissionDate: string; status: string;
};
type ApiSlot = { weekday: number; startTime: string; endTime: string; classroom?: string };
type ApiSubject = {
  id: string; code: string; period: string; shift: string; schedule: ApiSlot[];
  subjectName: string; subjectYear: number; careerName: string; teacherNames: string[];
};
type ApiMySubject = {
  commission: ApiSubject;
  condition: string;
  attendance: { totalSessions: number; presentCount: number; absentCount: number; justifiedAbsenceCount: number; percentage: number };
};
type ApiAttendance = {
  id: string; date: string; status: "PRESENT" | "ABSENT" | "LATE"; source: string;
  notes?: string; subjectName: string; commissionId: string; justificationId?: string;
  justificationStatus?: string; justified: boolean;
};
type ApiGrade = {
  id: string; subjectName: string; commissionId: string; type: string; instance: number;
  date: string; value: number | null; absent: boolean; notes?: string;
};
type ApiNotice = { id: string; title: string; content: string; category: string; pinned: boolean; publishedAt?: string; createdAt: string };
type ApiSchoolEvent = { id: string; type: string; title: string; description?: string; startDate: string; endDate?: string; mandatory: boolean };
type ApiRepEvent = { id: string; title: string; date: string; time?: string; location?: string; description: string; type: string; joined: boolean };
type ApiAnnouncement = { id: string; title: string; content: string; publishDate?: string; createdAt: string; pinned: boolean };
type ApiForumThread = { id: string; authorId: string; authorName: string; title: string; content: string; category?: string; createdAt: string; replies?: ApiForumReply[] };
type ApiForumReply = { id: string; authorId: string; authorName: string; content: string; createdAt: string };
type ApiJustification = { id: string; fromDate: string; toDate: string; reason: string; documentUrl?: string; status: string; createdAt: string };
type ApiNotification = { id: string; type: string; text: string; details?: string; link?: string; readAt?: string; createdAt: string };

const PREFS_KEY = "i26.student.preferences.v1";
const READ_KEY = "i26.student.read-notices.v1";
const REMINDERS_KEY = "i26.student.event-reminders.v1";
const WEEKDAYS = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const dateOnly = (value: string) => value.slice(0, 10);
const dateBR = (value: string) => {
  const [year, month, day] = dateOnly(value).split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
};
const unsupported = (feature: string): never => {
  throw new Error(`${feature} todavía no tiene un endpoint institucional habilitado. No se guardó ningún dato.`);
};
const readSet = (key: string): Set<string> => {
  try { return new Set(JSON.parse(localStorage.getItem(key) || "[]") as string[]); }
  catch { return new Set(); }
};
const writeSet = (key: string, values: Set<string>) => localStorage.setItem(key, JSON.stringify([...values]));

function mapSubject(row: ApiMySubject): Materia {
  const c = row.commission;
  const horario = c.schedule.map((s) => `${WEEKDAYS[s.weekday] ?? ""} ${s.startTime}–${s.endTime}${s.classroom ? ` · ${s.classroom}` : ""}`).join(" / ");
  const condition: Materia["estadoCursada"] = row.condition === "PROMOTED" ? "Promocionada" : row.condition === "FREE" ? "Libre" : row.condition === "REGULAR" ? "Regularizada" : "En Cursada";
  return MateriaSchema.parse({
    id: c.id, codigo: c.id, nombre: c.subjectName, docente: c.teacherNames.join(", ") || "Sin docente asignado",
    comision: c.id, anio: c.subjectYear,
    cuatrimestre: c.period === "FIRST_TERM" ? "1° Cuatrimestre" : c.period === "SECOND_TERM" ? "2° Cuatrimestre" : "Anual",
    horario: horario || "Horario no informado", diaSemana: c.schedule.map((s) => WEEKDAYS[s.weekday]).filter(Boolean).join(", "),
    aula: c.schedule.map((s) => s.classroom).filter(Boolean).join(", ") || "Sin informar",
    horasSemanales: null, correlativas: [], estadoCursada: condition,
  });
}

function mapGrade(g: ApiGrade): Evaluacion {
  const type: Evaluacion["tipo"] = g.type === "FINAL_EXAM" ? "Examen Final" : g.type === "MAKEUP" ? "Recuperatorio" : g.type === "ASSIGNMENT" ? "Trabajo Práctico" : g.type === "COLLOQUIUM" ? "TPI" : g.instance > 1 ? "2° Parcial" : "1° Parcial";
  return EvaluacionSchema.parse({ id: g.id, materiaId: g.commissionId, materiaNombre: g.subjectName, tipo: type,
    titulo: type, fecha: dateOnly(g.date), fechaPublicacion: dateOnly(g.date), nota: g.value,
    observaciones: g.notes, estado: "publicada", instanciaRecuperatorio: g.type === "MAKEUP" ? String(g.instance) : undefined });
}

function mapAttendance(r: ApiAttendance): RegistroAsistencia {
  const status: RegistroAsistencia["estado"] = r.justified ? "justificada" : r.status === "PRESENT" ? "presente" : r.status === "LATE" ? "tardanza" : "ausente";
  return RegistroAsistenciaSchema.parse({ id: r.id, materiaId: r.commissionId, materiaNombre: r.subjectName,
    fecha: dateOnly(r.date), hora: "", estado: status,
    metodo: r.source === "TEACHER" ? "Docente" : r.source === "QR" ? "QR" : "Preceptor",
    motivoJustificacion: r.notes, moduloClase: "Registro institucional", solicitudJustificacionId: r.justificationId });
}

function mapSchoolEvent(e: ApiSchoolEvent): Evento {
  const tipo: Evento["tipo"] = e.type === "HOLIDAY" ? "feriado" : ["EXAM_PERIOD", "GRADES_DEADLINE"].includes(e.type) ? "parcial" : e.type === "CLASS" ? "academico" : "jornada";
  return EventoSchema.parse({ id: `school:${e.id}`, titulo: e.title, tipo, fecha: dateOnly(e.startDate), horaInicio: "", horaFin: "",
    lugar: "", descripcion: e.description ?? "", obligatorio: e.mandatory });
}

function mapRepEvent(e: ApiRepEvent): Evento {
  const tipo: Evento["tipo"] = e.type === "ACADEMIC" ? "academico" : e.type === "MEETING" ? "jornada" : "jornada";
  return EventoSchema.parse({ id: `center:${e.id}`, titulo: e.title, tipo, fecha: dateOnly(e.date), horaInicio: e.time ?? "", horaFin: "",
    lugar: e.location ?? "", descripcion: e.description, obligatorio: false });
}

const mapNotice = (n: ApiNotice, source: "institution" | "center", read: Set<string>): Aviso => AvisoSchema.parse({
  id: `${source}:${n.id}`, titulo: n.title, resumen: n.content.slice(0, 180), cuerpo: n.content,
  fecha: dateBR(n.publishedAt ?? n.createdAt), remitente: source === "center" ? "Centro de Estudiantes" : "Institución",
  categoria: source === "center" ? "Jornadas" : n.category === "ACADEMIC" || n.category === "PEDAGOGICAL" ? "Docente" : "Institucional",
  prioridad: n.category === "URGENT" ? "alta" : "normal", leido: read.has(`${source}:${n.id}`),
});

async function mapForumRows(rows: ApiForumThread[], source: "academic" | "center", currentUserId: string): Promise<PublicacionForo[]> {
  return Promise.all(rows.slice(0, 40).map(async (thread) => {
    const replies = thread.replies ?? await apiFetch<ApiForumReply[]>(source === "academic" ? `/social/forum/${thread.id}/replies` : `/centro/threads/${thread.id}/replies`);
    return PublicacionForoSchema.parse({
      id: `${source}:${thread.id}`, titulo: thread.title, autor: thread.authorName, rol: "Participante",
      fecha: dateBR(thread.createdAt), canal: source === "academic" ? "Consultas Académicas" : thread.category === "EVENTS" ? "Jornadas e Intercambio" : thread.category === "PROPOSALS" ? "Proyectos y Prácticas" : "Avisos Generales",
      contenido: thread.content, esPropia: thread.authorId === currentUserId,
      respuestas: replies.map((reply) => ({ id: reply.id, autor: reply.authorName, rol: "Participante", fecha: dateBR(reply.createdAt), contenido: reply.content, esPropia: reply.authorId === currentUserId })),
    });
  }));
}

const DEFAULT_PREFS: PreferenciasUsuario = {
  notifInasistencia: true, notifExamenes: true, notifAvisos: true, canalEmail: true, canalPush: false,
  tamanoTexto: "normal", reducirMovimiento: false, densidadTabla: "comoda", modoDemoEstable: true,
};

export const StudentApi = {
  async getAlumno(): Promise<Alumno> {
    const [s, subjects] = await Promise.all([apiFetch<ApiStudent>("/me/student"), apiFetch<ApiMySubject[]>("/me/subjects")]);
    const first = subjects[0]?.commission;
    return AlumnoSchema.parse({ id: s.id, dni: s.dni, legajo: s.fileNumber, nombre: s.firstName, apellido: s.lastName,
      email: s.email, telefono: s.phone ?? "", carrera: first?.careerName ?? "Sin cursadas activas", resolucionPlan: "No informada por la API",
      anio: Math.max(1, ...subjects.map((item) => item.commission.subjectYear)), turno: first?.shift === "MORNING" ? "Mañana" : first?.shift === "AFTERNOON" ? "Tarde" : "Vespertino",
      condicion: "Sin datos", sede: "ISFDyT N.° 26", fechaIngreso: dateBR(s.admissionDate) });
  },

  async getMaterias(): Promise<Materia[]> {
    return (await apiFetch<ApiMySubject[]>("/me/subjects")).map(mapSubject);
  },
  async getMateriaDetail(id: string): Promise<Materia | undefined> {
    return (await this.getMaterias()).find((item) => item.id === id);
  },
  async getAsistencias(): Promise<RegistroAsistencia[]> {
    return (await apiFetch<ApiAttendance[]>("/me/attendance")).map(mapAttendance);
  },
  async getEvaluaciones(): Promise<Evaluacion[]> {
    return (await apiFetch<ApiGrade[]>("/me/grades")).map(mapGrade);
  },
  async getAgenda(): Promise<Evento[]> {
    const [institutional, center] = await Promise.all([
      apiFetch<ApiSchoolEvent[]>("/records/events"),
      apiFetch<ApiRepEvent[]>("/centro/events"),
    ]);
    const reminders = readSet(REMINDERS_KEY);
    return [...institutional.map(mapSchoolEvent), ...center.map(mapRepEvent)]
      .map((event) => ({ ...event, recordatorioActivo: reminders.has(event.id) }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  },
  async getAvisos(): Promise<Aviso[]> {
    const [institutional, center] = await Promise.all([
      apiFetch<ApiNotice[]>("/records/notices"),
      apiFetch<ApiAnnouncement[]>("/centro/announcements"),
    ]);
    const read = readSet(READ_KEY);
    return [
      ...institutional.map((notice) => mapNotice(notice, "institution", read)),
      ...center.map((notice) => mapNotice({ ...notice, category: "INSTITUTIONAL" }, "center", read)),
    ].sort((a, b) => b.fecha.localeCompare(a.fecha));
  },
  async getForos(): Promise<PublicacionForo[]> {
    const [me, academic, center] = await Promise.all([
      getMe(), apiFetch<ApiForumThread[]>("/social/forum"), apiFetch<ApiForumThread[]>("/centro/threads"),
    ]);
    if (!me) throw new Error("La sesión venció. Volvé a ingresar.");
    const [academicRows, centerRows] = await Promise.all([
      mapForumRows(academic, "academic", me.user.id), mapForumRows(center, "center", me.user.id),
    ]);
    return [...academicRows, ...centerRows].sort((a, b) => b.fecha.localeCompare(a.fecha));
  },
  async getHistorial(): Promise<HitoHistorial[]> {
    const grades = await apiFetch<ApiGrade[]>("/me/grades");
    const gradeItems = grades.map((grade) => HitoHistorialSchema.parse({ id: grade.id, periodo: "Cursada", anioLectivo: Number(dateOnly(grade.date).slice(0, 4)),
      tipo: grade.type === "FINAL_EXAM" ? "final" : "cursada", titulo: grade.subjectName,
      detalle: grade.absent ? "Ausente" : grade.value === null ? "Sin calificación" : `Calificación ${grade.value}`,
      calificacion: grade.value, condicion: grade.absent ? "Ausente" : "Publicada", fecha: dateOnly(grade.date) }));
    return gradeItems.sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
  },
  async getSolicitudesCorreccion(): Promise<SolicitudCorreccion[]> { return []; },
  async getSolicitudesJustificacion(): Promise<SolicitudJustificacion[]> {
    const rows = await apiFetch<ApiJustification[]>("/me/justifications");
    return rows.map((j) => SolicitudJustificacionSchema.parse({ id: j.id, asistenciaId: `${j.fromDate}:${j.toDate}`,
      fechaSolicitud: dateBR(j.createdAt), motivo: j.reason, certificadoNombre: j.documentUrl ? "Comprobante cargado" : "Sin comprobante",
      estado: j.status === "APPROVED" ? "Aprobada" : j.status === "REJECTED" ? "Observada" : "En revisión" }));
  },
  async getNotificaciones(): Promise<NotificacionItem[]> {
    const rows = await apiFetch<ApiNotification[]>("/social/notifications");
    return rows.map((n) => ({ id: n.id, titulo: n.text, detalle: n.details ?? "", fecha: n.createdAt,
      tipo: n.type === "EVENT" ? "evento" : ["ABSENCE", "JUSTIFICATION_REQUEST", "JUSTIFICATION_APPROVED", "JUSTIFICATION_REJECTED"].includes(n.type) ? "asistencia" : "aviso",
      leida: Boolean(n.readAt), referenciaId: n.link }));
  },
  async getPreferencias(): Promise<PreferenciasUsuario> {
    try { return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") }; }
    catch { return DEFAULT_PREFS; }
  },

  async addSolicitudCorreccion(_data: { campo: string; valorPropuesto: string; motivo: string; archivoAdjuntoNombre?: string }): Promise<SolicitudCorreccion> {
    return unsupported("La rectificación del perfil");
  },
  async addJustificacionFalta(_data: { asistenciaId: string; motivo: string; certificadoNombre: string }): Promise<SolicitudJustificacion> {
    return unsupported("El envío de justificaciones por el alumno");
  },
  async registrarAsistenciaQR(_codigoQR: string): Promise<{ exito: boolean; mensaje: string; yaRegistrado?: boolean }> {
    return unsupported("El registro de asistencia por QR");
  },
  async toggleAvisoLeido(id: string): Promise<Aviso> {
    const read = readSet(READ_KEY);
    read.add(id);
    writeSet(READ_KEY, read);
    const item = (await this.getAvisos()).find((notice) => notice.id === id);
    if (!item) throw new Error("No se encontró el comunicado.");
    return item;
  },
  async marcarTodosAvisosLeidos(): Promise<void> {
    await apiFetch("/social/notifications/read", { method: "POST", body: {} });
  },
  async marcarNotificacionLeida(id: string): Promise<void> {
    await apiFetch("/social/notifications/read", { method: "POST", body: { ids: [id] } });
  },
  async toggleRecordatorioEvento(id: string): Promise<Evento> {
    const reminders = readSet(REMINDERS_KEY);
    reminders.has(id) ? reminders.delete(id) : reminders.add(id);
    writeSet(REMINDERS_KEY, reminders);
    const event = (await this.getAgenda()).find((item) => item.id === id);
    if (!event) throw new Error("No se encontró el evento.");
    return EventoSchema.parse({ ...event, recordatorioActivo: reminders.has(id) });
  },
  async crearPublicacionForo(data: { titulo: string; canal: PublicacionForo["canal"]; contenido: string; materiaRelacionada?: string }): Promise<PublicacionForo> {
    if (data.canal === "Consultas Académicas") {
      const row = await apiFetch<ApiForumThread>("/social/forum", { method: "POST", body: { title: data.titulo, content: data.contenido } });
      return PublicacionForoSchema.parse({ id: `academic:${row.id}`, titulo: row.title, autor: row.authorName, rol: "Participante", fecha: dateBR(row.createdAt),
        canal: data.canal, contenido: row.content, esPropia: true, respuestas: [] });
    }
    const category = data.canal === "Proyectos y Prácticas" ? "PROPOSALS" : data.canal === "Jornadas e Intercambio" ? "EVENTS" : "GENERAL";
    const row = await apiFetch<{ id: string }>("/centro/threads", { method: "POST", body: { title: data.titulo, content: data.contenido, category } });
    return PublicacionForoSchema.parse({ id: `center:${row.id}`, titulo: data.titulo, autor: "Vos", rol: "Participante", fecha: dateBR(new Date().toISOString()),
      canal: data.canal, contenido: data.contenido, esPropia: true, respuestas: [] });
  },
  async responderForo(pubId: string, contenido: string): Promise<PublicacionForo> {
    const [source, id] = pubId.split(":", 2);
    if (!id || (source !== "academic" && source !== "center")) return unsupported("La respuesta en este tema");
    const path = source === "academic" ? `/social/forum/${id}/replies` : `/centro/threads/${id}/replies`;
    await apiFetch(path, { method: "POST", body: { content: contenido } });
    const updated = (await this.getForos()).find((thread) => thread.id === pubId);
    if (!updated) throw new Error("La respuesta se guardó, pero no se pudo volver a cargar el tema.");
    return updated;
  },
  async editarMensajeForo(_pubId: string, _respId: string, _nuevoContenido: string): Promise<PublicacionForo> {
    return unsupported("La edición de respuestas del foro");
  },
  async borrarMensajeForo(_pubId: string, _respId: string): Promise<PublicacionForo> {
    return unsupported("La eliminación de respuestas del foro");
  },
  async actualizarPreferencias(nuevas: Partial<PreferenciasUsuario>): Promise<PreferenciasUsuario> {
    const updated = { ...(await this.getPreferencias()), ...nuevas };
    localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
    return updated;
  },
  async resetearDemoDB(): Promise<void> {
    return unsupported("El reinicio de los datos del alumno");
  },
};
