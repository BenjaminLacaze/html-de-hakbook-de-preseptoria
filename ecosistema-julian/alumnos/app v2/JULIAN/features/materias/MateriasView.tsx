/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  BookOpen,
  User,
  Clock,
  MapPin,
  CheckCircle,
  GraduationCap,
  X,
  FileText,
  ListChecks,
  ArrowRight,
  ArrowsDownUp,
  Funnel,
  ShieldCheck,
  WarningCircle,
} from "@phosphor-icons/react";
import { Materia, Evaluacion, RegistroAsistencia, NavigationSection } from "../../shared/types";
import { PageTitle, SectionTitle, ContextLabel } from "../../shared/ui/Titles";
import { Card, ProgressBar, AttendanceFormulaTooltip, Chip } from "../../shared/ui/Components";
import { calcularAsistenciaMateria } from "../../shared/lib/metrics";
import { formatFecha } from "../../shared/lib/dateUtils";

interface MateriasViewProps {
  materias: Materia[];
  evaluaciones: Evaluacion[];
  asistencias: RegistroAsistencia[];
  initialMateriaId?: string | null;
  onNavigate: (section: NavigationSection, param?: string) => void;
}

export const MateriasView: React.FC<MateriasViewProps> = ({
  materias,
  evaluaciones,
  asistencias,
  initialMateriaId,
  onNavigate,
}) => {
  const [selectedMateriaId, setSelectedMateriaId] = useState<string | null>(initialMateriaId || null);
  const [detalleTab, setDetalleTab] = useState<"resumen" | "evaluaciones" | "asistencia" | "programa">("resumen");
  const [sortBy, setSortBy] = useState<"nombre" | "asistencia" | "horario">("nombre");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (initialMateriaId) {
      setSelectedMateriaId(initialMateriaId);
    }
  }, [initialMateriaId]);

  // Materias con métricas calculadas en tiempo real a partir de la fuente de verdad (A1)
  const materiasConMetricas = useMemo(() => {
    return materias.map((m) => {
      const metricas = calcularAsistenciaMateria(m.id, asistencias);
      return {
        ...m,
        metricas,
      };
    });
  }, [materias, asistencias]);

  // Filtrado y ordenamiento
  const materiasFiltradas = useMemo(() => {
    let list = materiasConMetricas.filter((m) => {
      const q = searchTerm.toLowerCase();
      return (
        m.nombre.toLowerCase().includes(q) ||
        m.docente.toLowerCase().includes(q) ||
        m.codigo.toLowerCase().includes(q)
      );
    });

    if (sortBy === "nombre") {
      list.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (sortBy === "asistencia") {
      list.sort((a, b) => b.metricas.porcentaje - a.metricas.porcentaje);
    } else if (sortBy === "horario") {
      list.sort((a, b) => a.horario.localeCompare(b.horario));
    }

    return list;
  }, [materiasConMetricas, searchTerm, sortBy]);

  const selectedMateria = useMemo(() => {
    if (!selectedMateriaId) return null;
    return materiasConMetricas.find((m) => m.id === selectedMateriaId) || null;
  }, [selectedMateriaId, materiasConMetricas]);

  const evaluacionesMateria = useMemo(() => {
    if (!selectedMateriaId) return [];
    return evaluaciones.filter((e) => e.materiaId === selectedMateriaId);
  }, [selectedMateriaId, evaluaciones]);

  const asistenciasMateria = useMemo(() => {
    if (!selectedMateriaId) return [];
    return asistencias.filter((a) => a.materiaId === selectedMateriaId);
  }, [selectedMateriaId, asistencias]);

  return (
    <div className="space-y-8 animate-fadeIn min-w-0">
      {/* 1. TÍTULO */}
      <div className="min-w-0">
        <ContextLabel color="gold">CURSADAS DEL CICLO LECTIVO 2026</ContextLabel>
        <PageTitle
          title="Mis"
          highlightWord="Materias"
          description="Espacios curriculares en curso, equipo docente asignado, horarios y cómputo de asistencia verificado."
        />
      </div>

      {/* 2. BARRA DE CONTROL: BÚSQUEDA Y ORDEN */}
      <Card className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por materia, docente o código..."
          className="w-full sm:w-80 text-xs p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus-visible"
        />

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase font-bold text-[var(--text-muted)] flex items-center gap-1 shrink-0">
            <ArrowsDownUp size={14} /> Ordenar por:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus-visible font-medium"
          >
            <option value="nombre">Nombre de materia</option>
            <option value="asistencia">Porcentaje de asistencia</option>
            <option value="horario">Horario de cursada</option>
          </select>
        </div>
      </Card>

      {/* 3. GRILLA DE MATERIAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0">
        {materiasFiltradas.map((materia) => {
          const { metricas } = materia;

          return (
            <Card
              key={materia.id}
              variant="interactive"
              onClick={() => {
                setSelectedMateriaId(materia.id);
                setDetalleTab("resumen");
              }}
              className="flex flex-col justify-between p-6 h-full group"
            >
              <div className="space-y-3 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[rgba(20,33,79,0.06)] text-[var(--text)] border border-[var(--border)]">
                    {materia.codigo}
                  </span>
                  <span
                    className={`text-xs font-mono uppercase font-bold px-2 py-0.5 rounded ${
                      metricas.porcentaje >= 80
                        ? "bg-[rgba(30,126,52,0.1)] text-[#1E7E34]"
                        : "bg-[rgba(185,28,28,0.1)] text-[#B91C1C]"
                    }`}
                  >
                    {metricas.condicion}
                  </span>
                </div>

                <div className="min-w-0">
                  <h3
                    className="text-lg font-bold text-[var(--text)] group-hover:text-[#3F78B6] transition-colors leading-snug truncate"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {materia.nombre}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-1 font-medium truncate">
                    <User size={14} className="shrink-0 text-[#89743A]" />
                    <span className="truncate">{materia.docente}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)] font-mono">
                  <div className="flex items-center gap-2 truncate">
                    <Clock size={14} className="text-[#3F78B6] shrink-0" />
                    <span className="truncate">{materia.horario}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <MapPin size={14} className="text-[#89743A] shrink-0" />
                    <span className="truncate">{materia.aula}</span>
                  </div>
                </div>
              </div>

              {/* Métricas inferiores: Asistencia pura */}
              <div className="pt-5 mt-4 border-t border-[var(--border)] space-y-3 min-w-0">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[var(--text-muted)] font-medium">Asistencia</span>
                      <AttendanceFormulaTooltip />
                    </div>
                    <span className="font-mono font-bold text-[var(--text)] tabular-nums">
                      {metricas.porcentajeTexto}% ({metricas.presentes + metricas.tardanzas + metricas.justificadas}/{metricas.totalClases})
                    </span>
                  </div>
                  <ProgressBar
                    value={metricas.porcentaje}
                    showValueText={false}
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-[var(--text-muted)] font-mono pt-1">
                  <span>Faltas: {metricas.ausentes}</span>
                  <span>Tardanzas: {metricas.tardanzas}</span>
                  <span>Justificadas: {metricas.justificadas}</span>
                </div>

                <div className="text-right pt-2">
                  <span className="text-xs font-bold text-[#89743A] inline-flex items-center gap-1 group-hover:underline cursor-pointer">
                    <span>Ver ficha y desglose</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 4. DIALOG DETALLE DE MATERIA CON PESTAÑAS (Parte C) */}
      {selectedMateria && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Ficha de ${selectedMateria.nombre}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setSelectedMateriaId(null)}
        >
          <div
            className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedMateriaId(null)}
              className="absolute top-5 right-5 p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-black/5"
            >
              <X size={20} />
            </button>

            {/* Encabezado */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#14214F] text-white">
                  {selectedMateria.codigo}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  {selectedMateria.comision}
                </span>
              </div>
              <h2
                className="text-2xl font-bold text-[var(--text)] mt-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {selectedMateria.nombre}
              </h2>
              <p className="text-xs text-[#89743A] font-bold mt-0.5">
                {selectedMateria.docente}
              </p>
            </div>

            {/* Pestañas de detalle */}
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2 overflow-x-auto scrollbar-none">
              <Chip active={detalleTab === "resumen"} onClick={() => setDetalleTab("resumen")}>
                Resumen
              </Chip>
              <Chip
                active={detalleTab === "evaluaciones"}
                onClick={() => setDetalleTab("evaluaciones")}
                count={evaluacionesMateria.length}
              >
                Evaluaciones
              </Chip>
              <Chip
                active={detalleTab === "asistencia"}
                onClick={() => setDetalleTab("asistencia")}
                count={asistenciasMateria.length}
              >
                Asistencia ({selectedMateria.metricas.porcentajeTexto}%)
              </Chip>
              <Chip active={detalleTab === "programa"} onClick={() => setDetalleTab("programa")}>
                Programa Oficial
              </Chip>
            </div>

            {/* Contenido según pestaña */}
            {detalleTab === "resumen" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[rgba(20,33,79,0.03)] border border-[var(--border)] font-mono">
                  <div>
                    <span className="text-[var(--text-muted)] block font-bold">Carga Semanal</span>
                    <span className="font-bold text-[var(--text)]">{selectedMateria.horasSemanales ?? "No informadas"}{selectedMateria.horasSemanales === null ? "" : " horas"}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block font-bold">Período</span>
                    <span className="font-bold text-[var(--text)]">{selectedMateria.cuatrimestre}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block font-bold">Clases Dictadas</span>
                    <span className="font-bold text-[var(--text)]">{selectedMateria.metricas.totalClases} módulos</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block font-bold">Aula</span>
                    <span className="font-bold text-[var(--text)]">{selectedMateria.aula}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 font-mono">
                    Régimen de Correlatividades Acreditadas
                  </h4>
                  {selectedMateria.correlativas.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedMateria.correlativas.map((c, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded bg-[rgba(30,126,52,0.1)] text-[#1E7E34] border border-[rgba(30,126,52,0.25)] flex items-center gap-1.5 font-medium"
                        >
                          <CheckCircle size={14} />
                          {c}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[var(--text-muted)]">Espacio sin correlativas previas requeridas.</p>
                  )}
                </div>
              </div>
            )}

            {detalleTab === "evaluaciones" && (
              <div className="space-y-3 text-xs">
                {evaluacionesMateria.length === 0 ? (
                  <p className="text-center py-6 text-[var(--text-muted)]">No hay evaluaciones registradas en esta materia.</p>
                ) : (
                  evaluacionesMateria.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3.5 rounded-xl border border-[var(--border)] flex items-center justify-between gap-3"
                    >
                      <div>
                        <span className="font-bold text-sm text-[var(--text)] block">{ev.titulo}</span>
                        <span className="text-[var(--text-muted)] font-mono">{ev.tipo} · Rendida el {formatFecha(ev.fecha)}</span>
                      </div>
                      <div className="text-right shrink-0">
                        {ev.nota !== null ? (
                          <>
                            <div className="text-xl font-bold font-mono text-[#14214F] dark:text-white tabular-nums">
                              {ev.nota.toFixed(1)}
                            </div>
                            <span className="text-xs uppercase font-bold text-[#1E7E34]">
                              {ev.nota >= 7 ? "Aprobado" : "Desaprobado"}
                            </span>
                          </>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-[rgba(137,116,58,0.12)] text-[#89743A] font-mono font-bold">
                            {ev.estado === "en_correccion" ? "En Corrección" : "Pendiente"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {detalleTab === "asistencia" && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[rgba(20,33,79,0.02)] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-[var(--text)]">Cómputo Total de Asistencia</span>
                    <span className="font-mono font-bold text-base text-[#14214F] dark:text-white tabular-nums">
                      {selectedMateria.metricas.porcentajeTexto}%
                    </span>
                  </div>
                  <ProgressBar value={selectedMateria.metricas.porcentaje} showValueText={false} />
                  <div className="flex flex-wrap gap-4 font-mono text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
                    <span>Presentes: {selectedMateria.metricas.presentes}</span>
                    <span>Ausencias: {selectedMateria.metricas.ausentes}</span>
                    <span>Tardanzas: {selectedMateria.metricas.tardanzas}</span>
                    <span>Justificadas: {selectedMateria.metricas.justificadas}</span>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-[var(--border)] border border-[var(--border)] rounded-xl">
                  {asistenciasMateria.map((reg) => (
                    <div key={reg.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-mono font-bold text-[var(--text)] block">{formatFecha(reg.fecha)}</span>
                        <span className="text-[var(--text-muted)] font-mono">{reg.hora} hs · Método {reg.metodo}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold uppercase text-xs ${
                          reg.estado === "presente"
                            ? "bg-[rgba(30,126,52,0.1)] text-[#1E7E34]"
                            : reg.estado === "tardanza"
                            ? "bg-[rgba(137,116,58,0.12)] text-[#89743A]"
                            : reg.estado === "justificada"
                            ? "bg-[rgba(63,120,182,0.12)] text-[#3F78B6]"
                            : "bg-[rgba(185,28,28,0.1)] text-[#B91C1C]"
                        }`}
                      >
                        {reg.estado}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detalleTab === "programa" && (
              <div className="space-y-3 text-xs leading-relaxed">
                <h4 className="font-bold text-sm text-[var(--text)]">Contenidos del Programa de Cátedra</h4>
                {selectedMateria.programaContenidos && selectedMateria.programaContenidos.length > 0 ? (
                  <ul className="space-y-2 list-disc pl-5 text-[var(--text)]">
                    {selectedMateria.programaContenidos.map((unidad, idx) => (
                      <li key={idx}>{unidad}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[var(--text-muted)]">El programa analítico completo está a disposición en la fotocopiadora institucional y en la biblioteca del ISFDyT N° 26.</p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setSelectedMateriaId(null)}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-[#14214F] text-white hover:bg-[#1D2E68] cursor-pointer"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
