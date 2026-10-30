/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  ClockCounterClockwise,
  CheckCircle,
  WarningCircle,
  Clock,
  QrCode,
  User,
  ShieldCheck,
  Funnel,
  DownloadSimple,
  X,
  FileText,
  ArrowsDownUp,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { RegistroAsistencia, Materia } from "../../shared/types";
import { PageTitle, SectionTitle, ContextLabel } from "../../shared/ui/Titles";
import { Card, StatFigure, ProgressBar, Chip, AttendanceFormulaTooltip } from "../../shared/ui/Components";
import { calcularAsistenciaGlobal, calcularAsistenciaMateria } from "../../shared/lib/metrics";
import { formatFecha, formatHora } from "../../shared/lib/dateUtils";
import { StudentApi } from "../../shared/services/api";

interface FaltasViewProps {
  asistencias: RegistroAsistencia[];
  materias: Materia[];
  onAsistenciaMutated?: () => void;
}

export const FaltasView: React.FC<FaltasViewProps> = ({
  asistencias,
  materias,
  onAsistenciaMutated,
}) => {
  const [filtroEstado, setFiltroEstado] = useState<string>("todas");
  const [selectedMateriaId, setSelectedMateriaId] = useState<string>("todas");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Estado del modal de justificación de inasistencia
  const [modalJustificar, setModalJustificar] = useState<RegistroAsistencia | null>(null);
  const [motivoJustificacion, setMotivoJustificacion] = useState("");
  const [archivoAdjunto, setArchivoAdjunto] = useState("certificado_medico.pdf");
  const [enviando, setEnviando] = useState(false);

  // A1: Cálculo puro a partir de la fuente única de verdad
  const metricasGlobales = useMemo(() => {
    return calcularAsistenciaGlobal(asistencias);
  }, [asistencias]);

  // Registros filtrados y ordenados
  const registrosFiltrados = useMemo(() => {
    const list = asistencias.filter((a) => {
      const matchEstado =
        filtroEstado === "todas" || a.estado === filtroEstado;
      const matchMateria =
        selectedMateriaId === "todas" || a.materiaId === selectedMateriaId;
      return matchEstado && matchMateria;
    });

    list.sort((a, b) => {
      const cmp = a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora);
      return sortOrder === "desc" ? -cmp : cmp;
    });

    return list;
  }, [asistencias, filtroEstado, selectedMateriaId, sortOrder]);

  // Exportar registros a CSV
  const handleExportCSV = () => {
    const headers = ["Fecha", "Hora", "Espacio Curricular", "Módulo", "Método", "Estado", "Motivo / Observaciones"];
    const rows = registrosFiltrados.map((a) => [
      formatFecha(a.fecha),
      formatHora(a.hora),
      `"${a.materiaNombre}"`,
      `"${a.moduloClase}"`,
      `"${a.metodo}"`,
      `"${a.estado}"`,
      `"${(a.motivoJustificacion || (a.solicitudJustificacionId ? "En revisión (Demo)" : "")).replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `asistencias_isfdyt26_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Listado de asistencia exportado en formato CSV (UTF-8).");
  };

  // Enviar justificación de inasistencia (Modo Demo)
  const handleSubmitJustificacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalJustificar || !motivoJustificacion.trim()) return;

    setEnviando(true);
    try {
      await StudentApi.addJustificacionFalta({
        asistenciaId: modalJustificar.id,
        motivo: motivoJustificacion.trim(),
        certificadoNombre: archivoAdjunto.trim() || "certificado_adjunto.pdf",
      });

      toast.success("Justificación enviada en modo DEMO. Quedó registrada como 'En revisión'.");
      setModalJustificar(null);
      setMotivoJustificacion("");
      if (onAsistenciaMutated) onAsistenciaMutated();
    } catch (err: any) {
      toast.error(err.message || "Error al presentar justificación.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn min-w-0">
      {/* 1. TÍTULO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
        <div>
          <ContextLabel color="gold">RÉGIMEN DE ASISTENCIA Y PUNTUALIDAD</ContextLabel>
          <PageTitle
            title="Mis"
            highlightWord="Faltas"
            description="Cómputo detallado de clases dictadas, inasistencias, tardanzas y porcentaje de asistencia por materia."
            className="mb-0 mt-1"
          />
        </div>
        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text)] hover:border-[#14214F] transition-all cursor-pointer shadow-2xs shrink-0"
        >
          <DownloadSimple size={16} />
          <span>Exportar Asistencias CSV</span>
        </button>
      </div>

      {/* 2. STATS GLOBALES CON FUENTE ÚNICA DE VERDAD (A1) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <StatFigure
              value={`${metricasGlobales.porcentajeTexto}%`}
              label="Asistencia General"
              sublabel={`${metricasGlobales.presentes + metricasGlobales.tardanzas + metricasGlobales.justificadas} de ${metricasGlobales.totalClases} clases`}
              tone="navy"
            />
            <AttendanceFormulaTooltip />
          </div>
        </Card>
        <Card className="flex flex-col justify-between">
          <StatFigure
            value={metricasGlobales.ausentes}
            label="Inasistencias"
            sublabel="Ausencias injustificadas"
            tone="gold"
          />
        </Card>
        <Card className="flex flex-col justify-between">
          <StatFigure
            value={metricasGlobales.tardanzas}
            label="Tardanzas"
            sublabel="Ingresos con demora"
            tone="blue"
          />
        </Card>
        <Card className="flex flex-col justify-between">
          <StatFigure
            value={metricasGlobales.justificadas}
            label="Justificadas"
            sublabel="Certificados aceptados"
            tone="success"
          />
        </Card>
      </div>

      {/* 3. DESGLOSE POR MATERIA CON CÁLCULO PURO (A1 Y A2) */}
      <div className="space-y-4">
        <SectionTitle subtitle="Porcentaje de presentismo individual por cada espacio curricular calculado desde registros atómicos">
          Porcentaje de Asistencia por Materia
        </SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materias.map((materia) => {
            const metricasMateria = calcularAsistenciaMateria(materia.id, asistencias);

            return (
              <Card key={materia.id} className="p-5 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h4
                      className="text-sm font-bold text-[var(--text)] truncate"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {materia.nombre}
                    </h4>
                    <span className="text-[11px] font-mono text-[var(--text-muted)] truncate block">
                      {materia.docente}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs font-mono font-bold text-[var(--text)] tabular-nums">
                      {metricasMateria.porcentajeTexto}%
                    </span>
                    <AttendanceFormulaTooltip />
                  </div>
                </div>

                <ProgressBar
                  value={metricasMateria.porcentaje}
                  showValueText={false}
                />

                <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
                  <span>Presentes: {metricasMateria.presentes}</span>
                  <span>Faltas: {metricasMateria.ausentes}</span>
                  <span>Tardanzas: {metricasMateria.tardanzas}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 4. TABLA DETALLADA DE REGISTROS POR FECHA */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <SectionTitle subtitle="Historial cronológico de registros de asistencia del ciclo lectivo (84+ clases registradas)">
            Registros por Fecha
          </SectionTitle>
          <div className="flex items-center gap-2">
            <select
              value={selectedMateriaId}
              onChange={(e) => setSelectedMateriaId(e.target.value)}
              className="text-xs p-2 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text)] focus-visible font-medium"
            >
              <option value="todas">Todas las materias</option>
              {materias.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium border border-[var(--border)] rounded-lg bg-[var(--surface-raised)] text-[var(--text)] hover:border-[#14214F]"
              title="Cambiar orden cronológico"
            >
              <ArrowsDownUp size={14} />
              <span>{sortOrder === "desc" ? "Más recientes" : "Más antiguas"}</span>
            </button>
          </div>
        </div>

        {/* Chips de filtro de estado (A9: Estado activo inequívoco) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-mono uppercase font-bold text-[var(--text-muted)] mr-2 shrink-0">
            Filtro:
          </span>
          <Chip active={filtroEstado === "todas"} onClick={() => setFiltroEstado("todas")}>
            Todos ({asistencias.length})
          </Chip>
          <Chip active={filtroEstado === "presente"} onClick={() => setFiltroEstado("presente")}>
            Presentes ({asistencias.filter((a) => a.estado === "presente").length})
          </Chip>
          <Chip active={filtroEstado === "ausente"} onClick={() => setFiltroEstado("ausente")}>
            Ausentes ({asistencias.filter((a) => a.estado === "ausente").length})
          </Chip>
          <Chip active={filtroEstado === "tardanza"} onClick={() => setFiltroEstado("tardanza")}>
            Tardanzas ({asistencias.filter((a) => a.estado === "tardanza").length})
          </Chip>
          <Chip active={filtroEstado === "justificada"} onClick={() => setFiltroEstado("justificada")}>
            Justificadas ({asistencias.filter((a) => a.estado === "justificada").length})
          </Chip>
        </div>

        {/* Contenedor de tabla con scroll horizontal interno propio (A8: Sin desborde en 375px) */}
        <div className="w-full overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-[var(--border)] bg-black/5 dark:bg-white/5 text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                <th className="p-3.5 pl-4 font-semibold">Fecha y Hora</th>
                <th className="p-3.5 font-semibold">Espacio Curricular</th>
                <th className="p-3.5 font-semibold">Método</th>
                <th className="p-3.5 font-semibold">Estado</th>
                <th className="p-3.5 font-semibold">Detalle / Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-xs">
              {registrosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--text-muted)]">
                    No hay registros de asistencia coincidentes con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                registrosFiltrados.map((item) => (
                  <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3.5 pl-4 font-mono text-[var(--text)] whitespace-nowrap">
                      <span className="font-bold block">{formatFecha(item.fecha)}</span>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {formatHora(item.hora)} hs · {item.moduloClase}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-sm text-[var(--text)] block">
                        {item.materiaNombre}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-mono whitespace-nowrap">
                        {item.metodo === "QR" ? (
                          <QrCode size={14} className="text-[#89743A]" />
                        ) : (
                          <User size={14} className="text-[#3F78B6]" />
                        )}
                        <span>{item.metodo}</span>
                      </div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {item.estado === "presente" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-[rgba(30,126,52,0.12)] text-[#1E7E34]">
                          <CheckCircle size={12} weight="bold" /> Presente
                        </span>
                      )}
                      {item.estado === "tardanza" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-[rgba(137,116,58,0.12)] text-[#89743A]">
                          <Clock size={12} weight="bold" /> Tardanza
                        </span>
                      )}
                      {item.estado === "justificada" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-[rgba(63,120,182,0.12)] text-[#3F78B6]">
                          <ShieldCheck size={12} weight="bold" /> Justificada
                        </span>
                      )}
                      {item.estado === "ausente" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-[rgba(185,28,28,0.12)] text-[#B91C1C]">
                          <WarningCircle size={12} weight="bold" /> Ausente
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {item.estado === "ausente" && !item.solicitudJustificacionId && (
                        <button
                          type="button"
                          onClick={() => {
                            setModalJustificar(item);
                            setMotivoJustificacion("");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-[#14214F] text-white hover:bg-[#1D2E68] transition-colors cursor-pointer"
                        >
                          <FileText size={14} />
                          <span>Justificar (Demo)</span>
                        </button>
                      )}
                      {item.solicitudJustificacionId && (
                        <span className="text-[11px] font-mono text-[#89743A] bg-[rgba(137,116,58,0.1)] px-2 py-0.5 rounded border border-[rgba(137,116,58,0.2)]">
                          En revisión (Demo)
                        </span>
                      )}
                      {item.motivoJustificacion && (
                        <span className="text-xs text-[var(--text-muted)] italic font-mono block">
                          {item.motivoJustificacion}
                        </span>
                      )}
                      {item.estado === "presente" && !item.motivoJustificacion && (
                        <span className="text-xs text-[var(--text-muted)] font-mono">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PARA JUSTIFICAR INASISTENCIA */}
      {modalJustificar && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setModalJustificar(null)}
        >
          <div
            className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalJustificar(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <ContextLabel color="gold">BEDELÍA · TRÁMITE DE ALUMNOS</ContextLabel>
              <h3
                className="text-xl font-bold text-[var(--text)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Presentar Justificación de Inasistencia
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Registro del <strong>{formatFecha(modalJustificar.fecha)}</strong> ({modalJustificar.hora} hs) en <strong>{modalJustificar.materiaNombre}</strong>.
              </p>
            </div>

            <form onSubmit={handleSubmitJustificacion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  Motivo de la Inasistencia
                </label>
                <textarea
                  required
                  rows={3}
                  value={motivoJustificacion}
                  onChange={(e) => setMotivoJustificacion(e.target.value)}
                  placeholder="Ej: Certificado médico por consulta odontológica con reposo."
                  className="w-full text-sm p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus-visible font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  Archivo Adjunto de Comprobante (Simulado)
                </label>
                <input
                  type="text"
                  value={archivoAdjunto}
                  onChange={(e) => setArchivoAdjunto(e.target.value)}
                  placeholder="Nombre de archivo adjunto (ej: certificado_medico.pdf)"
                  className="w-full text-xs p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus-visible font-mono"
                />
                <span className="text-[11px] text-[var(--text-muted)] font-mono mt-1 block">
                  Formatos válidos: PDF, JPG, PNG (hasta 5MB según Bedelía).
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[rgba(137,116,58,0.08)] border border-[rgba(137,116,58,0.25)] text-xs text-[#89743A] leading-relaxed">
                <strong>Aviso de honestidad (DEMO):</strong> Esta solicitud se almacena en el estado local del navegador. No envía correo ni notifica a preceptoría real.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalJustificar(null)}
                  className="px-4 py-2.5 rounded-lg text-xs font-semibold border border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando || !motivoJustificacion.trim()}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#14214F] text-white hover:bg-[#1D2E68] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {enviando ? "Enviando..." : "Presentar Justificación (Demo)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
