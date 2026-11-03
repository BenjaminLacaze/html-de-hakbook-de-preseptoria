/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  ClockCounterClockwise,
  GraduationCap,
  CheckCircle,
  Funnel,
  CaretDown,
  CaretUp,
  Certificate,
  FileText,
} from "@phosphor-icons/react";
import { HitoHistorial } from "../../shared/types";
import { PageTitle, SectionTitle, ContextLabel } from "../../shared/ui/Titles";
import { Card, Chip } from "../../shared/ui/Components";
import { formatFecha } from "../../shared/lib/dateUtils";

interface HistorialViewProps {
  historial: HitoHistorial[];
}

export const HistorialView: React.FC<HistorialViewProps> = ({ historial }) => {
  // A4: Filtro de ciclos coherente con ingreso marzo 2025 (1° año 2025, 2° año 2026 en curso)
  const [filtroAnio, setFiltroAnio] = useState<string>("todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const hitosFiltrados = historial.filter((h) => {
    if (filtroAnio === "todos") return true;
    return String(h.anioLectivo) === filtroAnio;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-8 animate-fadeIn min-w-0">
      {/* 1. TÍTULO */}
      <div>
        <ContextLabel color="gold">TRAYECTORIA ESTUDIANTIL Y ANTECEDENTES</ContextLabel>
        <PageTitle
          title="Historial"
          highlightWord="Académico"
          description="Evolución cronológica de cursadas aprobadas, exámenes acreditados y certificaciones oficiales en el ISFDyT N° 26."
        />
      </div>

      {/* 2. FILTRO POR CICLO LECTIVO (A4: Coherencia con ingreso 2025) */}
      <Card className="p-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono uppercase font-bold text-[var(--text-muted)] mr-2 flex items-center gap-1">
          <Funnel size={14} /> Ciclo Lectivo:
        </span>
        <Chip active={filtroAnio === "todos"} onClick={() => setFiltroAnio("todos")}>
          Todos los ciclos ({historial.length})
        </Chip>
        <Chip active={filtroAnio === "2026"} onClick={() => setFiltroAnio("2026")}>
          Ciclo 2026 (2° Año en curso)
        </Chip>
        <Chip active={filtroAnio === "2025"} onClick={() => setFiltroAnio("2025")}>
          Ciclo 2025 (1° Año acreditado)
        </Chip>
      </Card>

      {/* 3. LÍNEA DE TIEMPO INTERACTIVA */}
      <div className="space-y-4">
        <SectionTitle subtitle="Hitos registrados en el legajo del estudiante (hacé clic para desplegar folio y detalles)">
          Línea de Tiempo de la Carrera
        </SectionTitle>

        <div className="space-y-3">
          {hitosFiltrados.length === 0 ? (
            <Card className="p-8 text-center text-xs text-[var(--text-muted)]">
              No hay hitos académicos registrados para el ciclo seleccionado.
            </Card>
          ) : (
            hitosFiltrados.map((item) => {
              const isExpanded = expandedId === item.id;

              return (
                <Card
                  key={item.id}
                  variant="interactive"
                  onClick={() => toggleExpand(item.id)}
                  className={`p-5 transition-all border ${
                    isExpanded
                      ? "border-[#14214F] ring-1 ring-[#14214F]/20 bg-[var(--surface-raised)]"
                      : "border-[var(--border)] hover:border-[#89743A]/60"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-[rgba(20,33,79,0.08)] dark:bg-white/10 text-[var(--text)] shrink-0">
                        {item.periodo}
                      </span>
                      <h4
                        className="text-sm sm:text-base font-bold text-[var(--text)] truncate"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {item.titulo}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {item.calificacion !== undefined && (
                        <span className="font-mono text-sm font-extrabold text-[var(--text)]">
                          Nota: {item.calificacion}
                        </span>
                      )}
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[rgba(30,126,52,0.12)] text-[#1E7E34]">
                        {item.condicion}
                      </span>
                      <button
                        type="button"
                        aria-label={isExpanded ? "Ocultar detalles" : "Ver detalles"}
                        className="text-[var(--text-muted)] hover:text-[var(--text)]"
                      >
                        {isExpanded ? <CaretUp size={16} /> : <CaretDown size={16} />}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                    {item.detalle}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] border-t border-[var(--border)] pt-2">
                    <span>Fecha de registro: {formatFecha(item.fecha)}</span>
                    <span className="text-[#89743A] font-semibold">
                      {isExpanded ? "Clic para contraer" : "Clic para ver folio y acta"}
                    </span>
                  </div>

                  {/* Detalle expandible con datos de folio y acta de secretaría */}
                  {isExpanded && (
                    <div className="mt-4 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border)] text-xs font-mono space-y-2 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[var(--text-muted)]">
                        <div>
                          <span className="font-semibold text-[var(--text)] block">Resolución Ministerial:</span>
                          <span>Res. DGCyE N° 5834/03 (Validez Nacional)</span>
                        </div>
                        <div>
                          <span className="font-semibold text-[var(--text)] block">Sede y Turno:</span>
                          <span>Dolores · Sede Central · Turno Vespertino</span>
                        </div>
                        <div>
                          <span className="font-semibold text-[var(--text)] block">Libro Matriz y Folio:</span>
                          <span>Libro 14 / Folio 128 · Acta Bedelía N° {item.id.replace("h-", "")}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-[var(--text)] block">Estado Administrativo:</span>
                          <span className="text-[#1E7E34] font-bold">Acta cerrada y homologada</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[var(--border)] text-[10px] text-[var(--text-muted)]">
                        Constancia electrónica emitida para consulta del estudiante. Válida como registro interno.
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* 4. INFORMACIÓN DE CERTIFICADO ANALÍTICO */}
      <Card className="border-[rgba(63,120,182,0.3)] bg-[rgba(63,120,182,0.04)] text-xs text-[var(--text-muted)] space-y-1">
        <span className="font-bold text-[var(--text)] block">
          Validez del Historial y Certificado Analítico Parcial
        </span>
        <p className="leading-relaxed">
          Esta visualización recopila las actas homologadas en el sistema informático. Para solicitar el certificado analítico parcial con firma y sello de Secretaría, dirigite a Bedelía en horario de atención.
        </p>
      </Card>
    </div>
  );
};
