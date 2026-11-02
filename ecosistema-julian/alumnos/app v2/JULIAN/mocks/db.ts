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
  NotificacionItem,
} from "../shared/types";
import {
  MOCK_ALUMNO,
  MOCK_MATERIAS,
  MOCK_ASISTENCIAS,
  MOCK_EVALUACIONES,
  MOCK_EVENTOS,
  MOCK_AVISOS,
  MOCK_FOROS,
  MOCK_HISTORIAL,
  MOCK_SOLICITUDES_CORRECCION,
  MOCK_JUSTIFICACIONES,
  MOCK_PREFERENCIAS,
} from "./dataset";
import { formatFecha } from "../shared/lib/dateUtils";

const STORAGE_KEY = "alumno-demo-db-v1";

interface DemoDatabaseSchema {
  alumno: Alumno;
  materias: Materia[];
  asistencias: RegistroAsistencia[];
  evaluaciones: Evaluacion[];
  agenda: Evento[];
  avisos: Aviso[];
  foros: PublicacionForo[];
  historial: HitoHistorial[];
  solicitudesCorreccion: SolicitudCorreccion[];
  solicitudesJustificacion: SolicitudJustificacion[];
  preferencias: PreferenciasUsuario;
}

function getInitialState(): DemoDatabaseSchema {
  return {
    alumno: { ...MOCK_ALUMNO },
    materias: JSON.parse(JSON.stringify(MOCK_MATERIAS)),
    asistencias: JSON.parse(JSON.stringify(MOCK_ASISTENCIAS)),
    evaluaciones: JSON.parse(JSON.stringify(MOCK_EVALUACIONES)),
    agenda: JSON.parse(JSON.stringify(MOCK_EVENTOS)),
    avisos: JSON.parse(JSON.stringify(MOCK_AVISOS)),
    foros: JSON.parse(JSON.stringify(MOCK_FOROS)),
    historial: JSON.parse(JSON.stringify(MOCK_HISTORIAL)),
    solicitudesCorreccion: JSON.parse(JSON.stringify(MOCK_SOLICITUDES_CORRECCION)),
    solicitudesJustificacion: JSON.parse(JSON.stringify(MOCK_JUSTIFICACIONES)),
    preferencias: { ...MOCK_PREFERENCIAS },
  };
}

class DemoDatabase {
  private data: DemoDatabaseSchema;

  constructor() {
    this.data = this.loadFromStorage();
  }

  private loadFromStorage(): DemoDatabaseSchema {
    if (typeof window === "undefined") return getInitialState();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validar que tenga asistencias completas (84+)
        if (parsed && Array.isArray(parsed.asistencias) && parsed.asistencias.length >= 84) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Error al cargar localStorage para alumno-demo-db-v1, inicializando nuevo estado", e);
    }
    const initial = getInitialState();
    this.persist(initial);
    return initial;
  }

  private persist(data: DemoDatabaseSchema = this.data) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error("Error al persistir en localStorage", e);
      }
    }
  }

  public resetToInitial(): void {
    this.data = getInitialState();
    this.persist(this.data);
  }

  // Simulación de latencia (300 a 800 ms) y fallo aleatorio del 5% si el modo estable está deshabilitado
  public async simulateNetwork(): Promise<void> {
    const min = 300;
    const max = 700;
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise((resolve) => setTimeout(resolve, delay));

    if (!this.data.preferencias.modoDemoEstable) {
      const shouldFail = Math.random() < 0.05;
      if (shouldFail) {
        throw new Error("Fallo transitorio simulado de red en el entorno de prueba (5%).");
      }
    }
  }

  // --- GETTERS ---
  public getAlumno(): Alumno {
    return { ...this.data.alumno };
  }

  public getMaterias(): Materia[] {
    return [...this.data.materias];
  }

  public getMateriaById(id: string): Materia | undefined {
    return this.data.materias.find((m) => m.id === id);
  }

  public getAsistencias(): RegistroAsistencia[] {
    return [...this.data.asistencias];
  }

  public getEvaluaciones(): Evaluacion[] {
    return [...this.data.evaluaciones];
  }

  public getAgenda(): Evento[] {
    return [...this.data.agenda];
  }

  public getAvisos(): Aviso[] {
    return [...this.data.avisos];
  }

  public getForos(): PublicacionForo[] {
    return [...this.data.foros];
  }

  public getHistorial(): HitoHistorial[] {
    return [...this.data.historial];
  }

  public getSolicitudesCorreccion(): SolicitudCorreccion[] {
    return [...this.data.solicitudesCorreccion];
  }

  public getSolicitudesJustificacion(): SolicitudJustificacion[] {
    return [...this.data.solicitudesJustificacion];
  }

  public getPreferencias(): PreferenciasUsuario {
    return { ...this.data.preferencias };
  }

  public getNotificaciones(): NotificacionItem[] {
    const list: NotificacionItem[] = [];

    // Avisos no leídos
    this.data.avisos.forEach((av) => {
      list.push({
        id: `notif-av-${av.id}`,
        titulo: av.titulo,
        detalle: `${av.remitente} · ${formatFecha(av.fecha)}`,
        fecha: av.fecha,
        tipo: "aviso",
        leida: av.leido,
        accionSection: "comunidad",
        referenciaId: av.id,
      });
    });

    // Eventos con recordatorio activo
    this.data.agenda
      .filter((ev) => ev.recordatorioActivo)
      .forEach((ev) => {
        list.push({
          id: `notif-ev-${ev.id}`,
          titulo: `Recordatorio: ${ev.titulo}`,
          detalle: `${ev.lugar} a las ${ev.horaInicio} hs`,
          fecha: ev.fecha,
          tipo: "evento",
          leida: false,
          accionSection: "agenda",
          referenciaId: ev.id,
        });
      });

    return list.sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  // --- MUTACIONES ---

  public async addSolicitudCorreccion(data: {
    campo: string;
    valorPropuesto: string;
    motivo: string;
    archivoAdjuntoNombre?: string;
  }): Promise<SolicitudCorreccion> {
    await this.simulateNetwork();
    const nueva: SolicitudCorreccion = {
      id: `sol-${Date.now()}`,
      fechaSolicitud: new Date().toISOString().split("T")[0],
      campo: data.campo,
      valorPropuesto: data.valorPropuesto,
      motivo: data.motivo,
      archivoAdjuntoNombre: data.archivoAdjuntoNombre,
      estado: "Pendiente",
    };
    this.data.solicitudesCorreccion.unshift(nueva);
    this.persist();
    return nueva;
  }

  public async addJustificacionFalta(data: {
    asistenciaId: string;
    motivo: string;
    certificadoNombre: string;
  }): Promise<SolicitudJustificacion> {
    await this.simulateNetwork();
    const asistencia = this.data.asistencias.find((a) => a.id === data.asistenciaId);
    if (!asistencia) throw new Error("Registro de inasistencia no encontrado.");

    const solicitud: SolicitudJustificacion = {
      id: `just-${Date.now()}`,
      asistenciaId: data.asistenciaId,
      fechaSolicitud: new Date().toISOString().split("T")[0],
      motivo: data.motivo,
      certificadoNombre: data.certificadoNombre,
      estado: "En revisión",
    };

    // Vincular al registro (sin modificar la condición oficial)
    asistencia.solicitudJustificacionId = solicitud.id;
    this.data.solicitudesJustificacion.unshift(solicitud);
    this.persist();
    return solicitud;
  }

  public async registrarAsistenciaQR(codigoQR: string): Promise<{
    exito: boolean;
    mensaje: string;
    registro?: RegistroAsistencia;
    yaRegistrado?: boolean;
  }> {
    await this.simulateNetwork();

    if (!codigoQR || !codigoQR.includes("ISFD26")) {
      return {
        exito: false,
        mensaje: "El código no pertenece a una clase activa del ISFDyT N° 26.",
      };
    }

    if (codigoQR.includes("EXPIRED")) {
      return {
        exito: false,
        mensaje: "El código QR ha expirado (concluyeron los 15 minutos de tolerancia reglamentaria).",
      };
    }

    // Comprobar si ya se registró asistencia para este código hoy
    const fechaHoy = new Date().toISOString().split("T")[0];
    const yaExiste = this.data.asistencias.some(
      (a) => a.fecha === fechaHoy && a.metodo === "QR" && a.materiaId === "mat-201"
    );

    if (yaExiste) {
      return {
        exito: false,
        yaRegistrado: true,
        mensaje: "Ya registraste asistencia en esta clase.",
      };
    }

    // Registrar nuevo presente
    const materia = this.data.materias[0]; // Programación Web II
    const nuevoRegistro: RegistroAsistencia = {
      id: `asist-qr-${Date.now()}`,
      materiaId: materia.id,
      materiaNombre: materia.nombre,
      fecha: fechaHoy,
      hora: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      estado: "presente",
      metodo: "QR",
      moduloClase: "Módulos 1 y 2",
    };

    this.data.asistencias.unshift(nuevoRegistro);
    this.persist();

    return {
      exito: true,
      mensaje: `Asistencia confirmada para ${materia.nombre}. Guardado en la demo.`,
      registro: nuevoRegistro,
    };
  }

  public async toggleAvisoLeido(id: string): Promise<Aviso> {
    await this.simulateNetwork();
    const aviso = this.data.avisos.find((a) => a.id === id);
    if (!aviso) throw new Error("Aviso no encontrado");
    aviso.leido = !aviso.leido;
    this.persist();
    return aviso;
  }

  public async marcarTodosAvisosLeidos(): Promise<void> {
    await this.simulateNetwork();
    this.data.avisos.forEach((a) => (a.leido = true));
    this.persist();
  }

  public async toggleRecordatorioEvento(eventoId: string): Promise<Evento> {
    await this.simulateNetwork();
    const evento = this.data.agenda.find((e) => e.id === eventoId);
    if (!evento) throw new Error("Evento no encontrado");
    evento.recordatorioActivo = !evento.recordatorioActivo;
    this.persist();
    return evento;
  }

  public async crearPublicacionForo(data: {
    titulo: string;
    canal: PublicacionForo["canal"];
    contenido: string;
    materiaRelacionada?: string;
  }): Promise<PublicacionForo> {
    await this.simulateNetwork();
    const nueva: PublicacionForo = {
      id: `pub-${Date.now()}`,
      titulo: data.titulo,
      autor: `${this.data.alumno.nombre} ${this.data.alumno.apellido}`,
      rol: "Alumno",
      fecha: new Date().toISOString().split("T")[0],
      canal: data.canal,
      contenido: data.contenido,
      materiaRelacionada: data.materiaRelacionada,
      esPropia: true,
      respuestas: [],
    };
    this.data.foros.unshift(nueva);
    this.persist();
    return nueva;
  }

  public async responderForo(pubId: string, contenido: string): Promise<PublicacionForo> {
    await this.simulateNetwork();
    const pub = this.data.foros.find((f) => f.id === pubId);
    if (!pub) throw new Error("Publicación no encontrada");

    const nuevaRespuesta = {
      id: `resp-${Date.now()}`,
      autor: `${this.data.alumno.nombre} ${this.data.alumno.apellido}`,
      rol: "Alumno" as const,
      fecha: new Date().toISOString().replace("T", " ").slice(0, 16),
      contenido,
      esPropia: true,
    };
    pub.respuestas.push(nuevaRespuesta);
    this.persist();
    return pub;
  }

  public async editarMensajeForo(pubId: string, respId: string, nuevoContenido: string): Promise<PublicacionForo> {
    await this.simulateNetwork();
    const pub = this.data.foros.find((f) => f.id === pubId);
    if (!pub) throw new Error("Publicación no encontrada");

    const resp = pub.respuestas.find((r) => r.id === respId);
    if (!resp || !resp.esPropia) throw new Error("Solo podés editar tus propios mensajes.");

    resp.contenido = nuevoContenido;
    this.persist();
    return pub;
  }

  public async borrarMensajeForo(pubId: string, respId: string): Promise<PublicacionForo> {
    await this.simulateNetwork();
    const pub = this.data.foros.find((f) => f.id === pubId);
    if (!pub) throw new Error("Publicación no encontrada");

    const idx = pub.respuestas.findIndex((r) => r.id === respId);
    if (idx === -1 || !pub.respuestas[idx].esPropia) {
      throw new Error("Solo podés borrar tus propios mensajes.");
    }

    pub.respuestas.splice(idx, 1);
    this.persist();
    return pub;
  }

  public async actualizarPreferencias(nuevas: Partial<PreferenciasUsuario>): Promise<PreferenciasUsuario> {
    await this.simulateNetwork();
    this.data.preferencias = { ...this.data.preferencias, ...nuevas };
    this.persist();
    return this.data.preferencias;
  }
}

export const demoDB = new DemoDatabase();
