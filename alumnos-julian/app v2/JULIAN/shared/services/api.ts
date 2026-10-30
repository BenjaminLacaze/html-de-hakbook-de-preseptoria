/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Alumno,
  AlumnoSchema,
  Materia,
  MateriaSchema,
  Evaluacion,
  EvaluacionSchema,
  RegistroAsistencia,
  RegistroAsistenciaSchema,
  Evento,
  EventoSchema,
  Aviso,
  AvisoSchema,
  PublicacionForo,
  PublicacionForoSchema,
  HitoHistorial,
  HitoHistorialSchema,
  SolicitudCorreccion,
  SolicitudJustificacion,
  PreferenciasUsuario,
  NotificacionItem,
} from "../types";
import { demoDB } from "../../mocks/db";

export const StudentApi = {
  // 1. Perfil del alumno autenticado
  async getAlumno(): Promise<Alumno> {
    await demoDB.simulateNetwork();
    return AlumnoSchema.parse(demoDB.getAlumno());
  },

  // 2. Materias en curso
  async getMaterias(): Promise<Materia[]> {
    await demoDB.simulateNetwork();
    return demoDB.getMaterias().map((m) => MateriaSchema.parse(m));
  },

  // 3. Detalle de materia específica
  async getMateriaDetail(id: string): Promise<Materia | undefined> {
    await demoDB.simulateNetwork();
    const item = demoDB.getMateriaById(id);
    return item ? MateriaSchema.parse(item) : undefined;
  },

  // 4. Registros atómicos de asistencia (Fuente de verdad: 84+ clases)
  async getAsistencias(): Promise<RegistroAsistencia[]> {
    await demoDB.simulateNetwork();
    return demoDB.getAsistencias().map((a) => RegistroAsistenciaSchema.parse(a));
  },

  // 5. Evaluaciones y calificaciones
  async getEvaluaciones(): Promise<Evaluacion[]> {
    await demoDB.simulateNetwork();
    return demoDB.getEvaluaciones().map((e) => EvaluacionSchema.parse(e));
  },

  // 6. Agenda de eventos
  async getAgenda(): Promise<Evento[]> {
    await demoDB.simulateNetwork();
    return demoDB.getAgenda().map((ev) => EventoSchema.parse(ev));
  },

  // 7. Avisos
  async getAvisos(): Promise<Aviso[]> {
    await demoDB.simulateNetwork();
    return demoDB.getAvisos().map((av) => AvisoSchema.parse(av));
  },

  // 8. Foros y comunidad
  async getForos(): Promise<PublicacionForo[]> {
    await demoDB.simulateNetwork();
    return demoDB.getForos().map((f) => PublicacionForoSchema.parse(f));
  },

  // 9. Historial
  async getHistorial(): Promise<HitoHistorial[]> {
    await demoDB.simulateNetwork();
    return demoDB.getHistorial().map((h) => HitoHistorialSchema.parse(h));
  },

  // 10. Solicitudes de rectificación
  async getSolicitudesCorreccion(): Promise<SolicitudCorreccion[]> {
    await demoDB.simulateNetwork();
    return demoDB.getSolicitudesCorreccion();
  },

  // 11. Solicitudes de justificación
  async getSolicitudesJustificacion(): Promise<SolicitudJustificacion[]> {
    await demoDB.simulateNetwork();
    return demoDB.getSolicitudesJustificacion();
  },

  // 12. Notificaciones del sistema
  async getNotificaciones(): Promise<NotificacionItem[]> {
    await demoDB.simulateNetwork();
    return demoDB.getNotificaciones();
  },

  // 13. Preferencias de usuario
  async getPreferencias(): Promise<PreferenciasUsuario> {
    return demoDB.getPreferencias();
  },

  // --- MUTACIONES INTERACTIVAS ---

  async addSolicitudCorreccion(data: {
    campo: string;
    valorPropuesto: string;
    motivo: string;
    archivoAdjuntoNombre?: string;
  }): Promise<SolicitudCorreccion> {
    return demoDB.addSolicitudCorreccion(data);
  },

  async addJustificacionFalta(data: {
    asistenciaId: string;
    motivo: string;
    certificadoNombre: string;
  }): Promise<SolicitudJustificacion> {
    return demoDB.addJustificacionFalta(data);
  },

  async registrarAsistenciaQR(codigoQR: string) {
    return demoDB.registrarAsistenciaQR(codigoQR);
  },

  async toggleAvisoLeido(id: string): Promise<Aviso> {
    return demoDB.toggleAvisoLeido(id);
  },

  async marcarTodosAvisosLeidos(): Promise<void> {
    return demoDB.marcarTodosAvisosLeidos();
  },

  async toggleRecordatorioEvento(id: string): Promise<Evento> {
    return demoDB.toggleRecordatorioEvento(id);
  },

  async crearPublicacionForo(data: {
    titulo: string;
    canal: PublicacionForo["canal"];
    contenido: string;
    materiaRelacionada?: string;
  }): Promise<PublicacionForo> {
    return demoDB.crearPublicacionForo(data);
  },

  async responderForo(pubId: string, contenido: string): Promise<PublicacionForo> {
    return demoDB.responderForo(pubId, contenido);
  },

  async editarMensajeForo(pubId: string, respId: string, nuevoContenido: string): Promise<PublicacionForo> {
    return demoDB.editarMensajeForo(pubId, respId, nuevoContenido);
  },

  async borrarMensajeForo(pubId: string, respId: string): Promise<PublicacionForo> {
    return demoDB.borrarMensajeForo(pubId, respId);
  },

  async actualizarPreferencias(nuevas: Partial<PreferenciasUsuario>): Promise<PreferenciasUsuario> {
    return demoDB.actualizarPreferencias(nuevas);
  },

  async resetearDemoDB(): Promise<void> {
    demoDB.resetToInitial();
  },
};
