/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  ChatsCircle,
  MagnifyingGlass,
  PaperPlaneTilt,
  User,
  Plus,
  X,
  ChatText,
  Tag,
  PencilSimple,
  Trash,
  Check,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { PublicacionForo } from "../../shared/types";
import { PageTitle, SectionTitle, ContextLabel } from "../../shared/ui/Titles";
import { Card, Chip } from "../../shared/ui/Components";
import { StudentApi } from "../../shared/services/api";

interface ForosViewProps {
  foros: PublicacionForo[];
  onForosMutated?: () => void;
  onResponder?: (publicacionId: string, texto: string) => Promise<void>;
  onCrearPublicacion?: (data: {
    titulo: string;
    canal: PublicacionForo["canal"];
    contenido: string;
    materiaRelacionada?: string;
  }) => Promise<void>;
}

export const ForosView: React.FC<ForosViewProps> = ({
  foros,
  onForosMutated,
}) => {
  const [canalSeleccionado, setCanalSeleccionado] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalNuevaPub, setModalNuevaPub] = useState(false);

  // Edición de respuesta propia
  const [editingReply, setEditingReply] = useState<{ pubId: string; respId: string; text: string } | null>(null);
  // Confirmación de borrado
  const [deletingReply, setDeletingReply] = useState<{ pubId: string; respId: string } | null>(null);

  // Campos para nueva publicación
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevoCanal, setNuevoCanal] = useState<PublicacionForo["canal"]>("Consultas Académicas");
  const [nuevoContenido, setNuevoContenido] = useState("");
  const [nuevaMateria, setNuevaMateria] = useState("");

  const publicacionesFiltradas = foros.filter((f) => {
    const matchCanal =
      canalSeleccionado === "todos" || f.canal === canalSeleccionado;
    const matchSearch =
      f.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.contenido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.autor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCanal && matchSearch;
  });

  const handleSendReply = async (publicacionId: string) => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      await StudentApi.responderForo(publicacionId, replyText.trim());
      setReplyText("");
      setActiveReplyId(null);
      toast.success("Respuesta registrada en modo Demo.");
      if (onForosMutated) onForosMutated();
    } catch (e: any) {
      toast.error(e.message || "Error al responder.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCrearPub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTitulo.trim() || !nuevoContenido.trim()) return;
    setIsSubmitting(true);
    try {
      await StudentApi.crearPublicacionForo({
        titulo: nuevoTitulo.trim(),
        canal: nuevoCanal,
        contenido: nuevoContenido.trim(),
        materiaRelacionada: nuevaMateria.trim() || undefined,
      });
      setNuevoTitulo("");
      setNuevoContenido("");
      setNuevaMateria("");
      setModalNuevaPub(false);
      toast.success("Nueva consulta creada en modo Demo.");
      if (onForosMutated) onForosMutated();
    } catch (e: any) {
      toast.error(e.message || "Error al crear la consulta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingReply || !editingReply.text.trim()) return;
    setIsSubmitting(true);
    try {
      await StudentApi.editarMensajeForo(editingReply.pubId, editingReply.respId, editingReply.text.trim());
      setEditingReply(null);
      toast.success("Mensaje actualizado en modo Demo.");
      if (onForosMutated) onForosMutated();
    } catch (e: any) {
      toast.error(e.message || "Error al editar mensaje.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingReply) return;
    setIsSubmitting(true);
    try {
      await StudentApi.borrarMensajeForo(deletingReply.pubId, deletingReply.respId);
      setDeletingReply(null);
      toast.success("Mensaje eliminado en modo Demo.");
      if (onForosMutated) onForosMutated();
    } catch (e: any) {
      toast.error(e.message || "Error al eliminar mensaje.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn min-w-0">
      {/* 1. TÍTULO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
        <div>
          <ContextLabel color="gold">ESPACIO DE INTERCAMBIO Y CONSULTAS</ContextLabel>
          <PageTitle
            title="Foros de"
            highlightWord="Cursada"
            description="Canales temáticos para consultas con docentes, debates académicos y coordinación de prácticas."
            className="mb-0 mt-1"
          />
        </div>
        <button
          type="button"
          onClick={() => setModalNuevaPub(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-[#14214F] text-white hover:bg-[#1D2E68] transition-colors cursor-pointer shadow-2xs shrink-0"
        >
          <Plus size={16} weight="bold" />
          <span>Nueva Consulta (Demo)</span>
        </button>
      </div>

      {/* 2. BARRA DE HERRAMIENTAS: BÚSQUEDA Y CHIPS DE CANAL */}
      <div className="space-y-4">
        <div className="relative">
          <MagnifyingGlass
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por tema, palabra clave o autor en los foros..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] text-xs text-[var(--text)] focus-visible"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-mono uppercase font-bold text-[var(--text-muted)] mr-2 shrink-0">
            Canales:
          </span>
          <Chip active={canalSeleccionado === "todos"} onClick={() => setCanalSeleccionado("todos")}>
            Todos los canales ({foros.length})
          </Chip>
          <Chip
            active={canalSeleccionado === "Consultas Académicas"}
            onClick={() => setCanalSeleccionado("Consultas Académicas")}
          >
            Consultas Académicas
          </Chip>
          <Chip
            active={canalSeleccionado === "Proyectos y Prácticas"}
            onClick={() => setCanalSeleccionado("Proyectos y Prácticas")}
          >
            Proyectos y Prácticas
          </Chip>
          <Chip
            active={canalSeleccionado === "Jornadas e Intercambio"}
            onClick={() => setCanalSeleccionado("Jornadas e Intercambio")}
          >
            Jornadas e Intercambio
          </Chip>
          <Chip
            active={canalSeleccionado === "Avisos Generales"}
            onClick={() => setCanalSeleccionado("Avisos Generales")}
          >
            Avisos Generales
          </Chip>
        </div>
      </div>

      {/* 3. LISTADO DE PUBLICACIONES */}
      <div className="space-y-4">
        <SectionTitle subtitle="Hilos de discusión abiertos en la cursada">
          Publicaciones y Consultas
        </SectionTitle>

        <div className="space-y-5">
          {publicacionesFiltradas.length === 0 ? (
            <Card className="p-8 text-center text-xs text-[var(--text-muted)]">
              No se encontraron publicaciones con los criterios de búsqueda actuales.
            </Card>
          ) : (
            publicacionesFiltradas.map((pub) => (
              <Card key={pub.id} className="p-6 space-y-4 border-[var(--border)]">
                {/* Cabecera del hilo */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#14214F] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {pub.autor.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[var(--text)]">
                          {pub.autor}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[var(--text-muted)] font-semibold">
                          {pub.rol}
                        </span>
                        {pub.esPropia && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(137,116,58,0.15)] text-[#89743A] font-bold">
                            Tuya (Demo)
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[var(--text-muted)] font-mono">
                        {pub.fecha} · Canal: {pub.canal}
                      </span>
                    </div>
                  </div>

                  {pub.materiaRelacionada && (
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[rgba(20,33,79,0.05)] dark:bg-white/10 text-[var(--text)] border border-[var(--border)] w-fit shrink-0">
                      {pub.materiaRelacionada}
                    </span>
                  )}
                </div>

                {/* Contenido del hilo */}
                <div className="space-y-2">
                  <h3
                    className="text-base sm:text-lg font-bold text-[var(--text)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {pub.titulo}
                  </h3>
                  <p className="text-sm text-[var(--text)] leading-relaxed whitespace-pre-line">
                    {pub.contenido}
                  </p>
                </div>

                {/* Respuestas anidadas */}
                {pub.respuestas.length > 0 && (
                  <div className="space-y-3 pt-3 pl-3 sm:pl-5 border-l-2 border-[#89743A]/30">
                    <span className="text-[11px] font-mono uppercase font-bold text-[var(--text-muted)] block">
                      Respuestas del hilo ({pub.respuestas.length})
                    </span>
                    {pub.respuestas.map((r) => (
                      <div
                        key={r.id}
                        className="p-3.5 rounded-lg bg-[rgba(20,33,79,0.02)] dark:bg-white/5 border border-[var(--border)] space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--text)]">{r.autor}</span>
                            <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
                              ({r.rol})
                            </span>
                            {r.esPropia && (
                              <span className="text-[9px] font-mono font-bold text-[#89743A] bg-[rgba(137,116,58,0.1)] px-1.5 py-0.2 rounded">
                                Tu respuesta
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-[var(--text-muted)]">
                              {r.fecha}
                            </span>
                            {r.esPropia && (
                              <div className="flex items-center gap-1 ml-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingReply({ pubId: pub.id, respId: r.id, text: r.contenido })
                                  }
                                  title="Editar tu respuesta"
                                  className="p-1 rounded text-[var(--text-muted)] hover:text-[#14214F] dark:hover:text-white cursor-pointer"
                                >
                                  <PencilSimple size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingReply({ pubId: pub.id, respId: r.id })}
                                  title="Eliminar tu respuesta"
                                  className="p-1 rounded text-[var(--text-muted)] hover:text-[#B91C1C] cursor-pointer"
                                >
                                  <Trash size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Si estamos editando este mensaje */}
                        {editingReply && editingReply.respId === r.id ? (
                          <div className="space-y-2 pt-2">
                            <textarea
                              rows={2}
                              value={editingReply.text}
                              onChange={(e) =>
                                setEditingReply({ ...editingReply, text: e.target.value })
                              }
                              className="w-full text-xs p-2 rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus-visible"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingReply(null)}
                                className="px-2.5 py-1 text-xs border border-[var(--border)] rounded hover:bg-black/5"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                disabled={isSubmitting || !editingReply.text.trim()}
                                onClick={handleSaveEdit}
                                className="px-3 py-1 text-xs font-bold bg-[#14214F] text-white rounded hover:bg-[#1D2E68] disabled:opacity-50 inline-flex items-center gap-1"
                              >
                                <Check size={12} weight="bold" />
                                <span>Guardar</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed whitespace-pre-line">
                            {r.contenido}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulario de respuesta */}
                <div className="pt-2">
                  {activeReplyId === pub.id ? (
                    <div className="space-y-3 p-4 rounded-xl border border-[var(--border)] bg-[rgba(20,33,79,0.02)] dark:bg-white/5 animate-fadeIn">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[var(--text)]">Responder al hilo:</span>
                        <span className="text-[10px] font-mono text-[#89743A]">Acción en modo Demo</span>
                      </div>
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Escribí tu consulta o aporte para los docentes y compañeros..."
                        className="w-full text-xs p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus-visible"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReplyId(null);
                            setReplyText("");
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs border border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting || !replyText.trim()}
                          onClick={() => handleSendReply(pub.id)}
                          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#14214F] text-white hover:bg-[#1D2E68] disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <PaperPlaneTilt size={14} />
                          <span>{isSubmitting ? "Enviando..." : "Publicar Respuesta (Demo)"}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveReplyId(pub.id)}
                      className="text-xs font-bold text-[#14214F] dark:text-[#3F78B6] hover:underline inline-flex items-center gap-1.5 focus-visible cursor-pointer"
                    >
                      <ChatText size={16} />
                      <span>Añadir respuesta a este hilo</span>
                    </button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* MODAL PARA NUEVA CONSULTA */}
      {modalNuevaPub && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setModalNuevaPub(false)}
        >
          <div
            className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalNuevaPub(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <ContextLabel color="gold">FORO DE ESTUDIANTES</ContextLabel>
              <h3
                className="text-xl font-bold text-[var(--text)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Nueva Consulta de Cursada
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Tu publicación será visible para docentes y compañeros de comisión.
              </p>
            </div>

            <form onSubmit={handleCrearPub} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  Título de la Consulta
                </label>
                <input
                  type="text"
                  required
                  value={nuevoTitulo}
                  onChange={(e) => setNuevoTitulo(e.target.value)}
                  placeholder="Ej: Duda con el ejercicio 3 del trabajo integrador"
                  className="w-full text-sm p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus-visible"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Canal Temático
                  </label>
                  <select
                    value={nuevoCanal}
                    onChange={(e) => setNuevoCanal(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus-visible font-medium"
                  >
                    <option value="Consultas Académicas">Consultas Académicas</option>
                    <option value="Proyectos y Prácticas">Proyectos y Prácticas</option>
                    <option value="Jornadas e Intercambio">Jornadas e Intercambio</option>
                    <option value="Avisos Generales">Avisos Generales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Materia (Opcional)
                  </label>
                  <input
                    type="text"
                    value={nuevaMateria}
                    onChange={(e) => setNuevaMateria(e.target.value)}
                    placeholder="Ej: Programación Web II"
                    className="w-full text-xs p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus-visible"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  Detalle de la Consulta
                </label>
                <textarea
                  required
                  rows={4}
                  value={nuevoContenido}
                  onChange={(e) => setNuevoContenido(e.target.value)}
                  placeholder="Explicá con claridad tu pregunta o aporte..."
                  className="w-full text-sm p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus-visible"
                />
              </div>

              <div className="p-3 rounded-lg bg-[rgba(137,116,58,0.1)] border border-[rgba(137,116,58,0.2)] text-[11px] text-[#89743A]">
                <strong>Transparencia:</strong> Esta acción se guardará en la sesión local (Demo) con autor Julián Cámara y no afectará foros externos.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNuevaPub(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[#14214F] text-white hover:bg-[#1D2E68] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Publicando..." : "Publicar Consulta (Demo)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIÁLOGO DE CONFIRMACIÓN DE BORRADO DE MENSAJE */}
      {deletingReply && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setDeletingReply(null)}
        >
          <div
            className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-base text-[var(--text)]">¿Eliminar este mensaje?</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Esta acción borrará tu respuesta del hilo en la base de datos de demostración local.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingReply(null)}
                className="px-3 py-1.5 rounded-lg text-xs border border-[var(--border)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#B91C1C] text-white hover:bg-[#991B1B] disabled:opacity-50"
              >
                Eliminar (Demo)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
