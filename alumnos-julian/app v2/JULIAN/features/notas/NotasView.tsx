/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import {
  GraduationCap,
  MagnifyingGlass,
  CheckCircle,
  Clock,
  DownloadSimple,
  X,
  CaretLeft,
  CaretRight,
  ArrowsDownUp,
} from "@phosphor-icons/react";
import { Evaluacion, Materia } from "../../shared/types";
import { PageTitle, SectionTitle, ContextLabel } from "../../shared/ui/Titles";
import { Card, Chip } from "../../shared/ui/Components";
import { formatFecha } from "../../shared/lib/dateUtils";

interface NotasViewProps {
  evaluaciones: Evaluacion[];
  materias: Materia[];
  initialEvalId?: string | null;
}

export const NotasView: React.FC<NotasViewProps> = ({
  evaluaciones,
  materias,
  initialEvalId,
}) => {
  const [selectedMateriaId, setSelectedMateriaId] = useState<string>("todas");
  const [filtroEstado, setFiltroEstado] = useState<string>("todas");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [detalleModalEval, setDetalleModalEval] = useState<Evaluacion | null>(null);

  useEffect(() => {
    if (initialEvalId) {
      const target = evaluaciones.find((e) => e.id === initialEvalId);
      if (target) setDetalleModalEval(target);
    }
  }, [initialEvalId, evaluaciones]);

  // Evaluaciones filtradas
  const evaluacionesFiltradas = useMemo(() => {
    return evaluaciones.filter((ev) => {
      const matchMateria =
        selectedMateriaId === "todas" || ev.materiaId === selectedMateriaId;
      const matchEstado =
        filtroEstado === "todas" || ev.estado === filtroEstado;
      const matchSearch =
        ev.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.materiaNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.tipo.toLowerCase().includes(searchTerm.toLowerCase());
      return matchMateria && matchEstado && matchSearch;
    });
  }, [evaluaciones, selectedMateriaId, filtroEstado, searchTerm]);

  // Exportar a CSV (Parte C)
  const handleExportCSV = () => {
    const headers = ["Espacio Curricular", "Tipo", "Título", "Fecha", "Fecha Publicación", "Calificación", "Estado", "Observaciones"];
    const rows = evaluacionesFiltradas.map((e) => [
      `"${e.materiaNombre}"`,
      `"${e.tipo}"`,
      `"${e.titulo.replace(/"/g, '""')}"`,
      formatFecha(e.fecha),
      e.fechaPublicacion ? formatFecha(e.fechaPublicacion) : "—",
      e.nota !== null ? e.nota.toFixed(1) : "—",
      e.estado,
      `"${(e.observaciones || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `calificaciones_isfdyt26_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Columnas para TanStack Table (A6: Calificación oficial con formato estricto)
  const columns = useMemo<ColumnDef<Evaluacion>[]>(
    () => [
      {
        accessorKey: "materiaNombre",
        header: "Espacio Curricular",
        cell: (info) => (
          <div className="min-w-0">
            <span className="font-bold text-[var(--text)] block text-xs truncate">
              {info.getValue() as string}
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {info.row.original.tipo}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "titulo",
        header: "Evaluación / Trabajo",
        cell: (info) => (
          <div className="max-w-md min-w-0">
            <span className="font-semibold text-xs text-[var(--text)] block truncate">
              {info.getValue() as string}
            </span>
            {info.row.original.observaciones && (
              <span className="text-xs text-[var(--text-muted)] italic block mt-0.5 truncate">
                "{info.row.original.observaciones}"
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "fecha",
        header: "Fecha",
        cell: (info) => (
          <div className="font-mono text-xs text-[var(--text-muted)]">
            <span>Rendida: {formatFecha(info.getValue() as string)}</span>
            {info.row.original.fechaPublicacion && (
              <span className="block text-xs text-[var(--text-muted)] opacity-80">
                Pub: {formatFecha(info.row.original.fechaPublicacion)}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: (info) => {
          const estado = info.getValue() as string;
          if (estado === "publicada") {
            return (
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded bg-[rgba(30,126,52,0.1)] text-[#1E7E34]">
                <CheckCircle size={13} /> Publicada
              </span>
            );
          }
          if (estado === "en_correccion") {
            return (
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded bg-[rgba(137,116,58,0.12)] text-[#89743A]">
                <Clock size={13} /> En Corrección
              </span>
            );
          }
          return (
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[var(--text-muted)]">
              Próxima
            </span>
          );
        },
      },
      // A6: Columna Calificación Oficial (nota grande a la derecha + estado abajo)
      {
        accessorKey: "nota",
        header: () => <div className="text-right">Calificación Oficial</div>,
        cell: (info) => {
          const nota = info.getValue() as number | null;
          const estado = info.row.original.estado;

          if (nota === null || estado !== "publicada") {
            return (
              <div className="text-right">
                <span
                  className="font-mono font-black text-xl text-[var(--text-muted)] tabular-nums block"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  —
                </span>
                <span className="text-xs font-mono uppercase font-semibold text-[var(--text-muted)] block">
                  Pendiente
                </span>
              </div>
            );
          }

          const isAprobado = nota >= 7;
          return (
            <div className="text-right">
              <span
                className={`font-mono font-black text-xl tabular-nums block ${
                  isAprobado ? "text-[#14214F] dark:text-white" : "text-[#B91C1C]"
                }`}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {nota.toFixed(1)}
              </span>
              <span
                className={`text-xs font-mono uppercase font-bold block ${
                  isAprobado ? "text-[#1E7E34]" : "text-[#B91C1C]"
                }`}
              >
                {isAprobado ? "Aprobado" : "Desaprobado"}
              </span>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: evaluacionesFiltradas,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-8 animate-fadeIn min-w-0">
      {/* 1. TÍTULO */}
      <div className="min-w-0">
        <ContextLabel color="gold">CALIFICACIONES Y ACTAS EVALUATIVAS</ContextLabel>
        <PageTitle
          title="Mis"
          highlightWord="Notas"
          description="Planilla oficial de exámenes parciales, trabajos prácticos evaluativos y coloquios del 2° cuatrimestre 2026."
        />
      </div>

      {/* 2. FILTROS, BÚSQUEDA Y BOTÓN EXPORTAR */}
      <Card className="p-4 space-y-4 min-w-0">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between min-w-0">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-0">
            <MagnifyingGlass
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por evaluación, materia o contenido..."
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus-visible"
            />
          </div>

          {/* Selector de Materia */}
          <div className="w-full md:w-72">
            <select
              value={selectedMateriaId}
              onChange={(e) => setSelectedMateriaId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus-visible font-medium"
            >
              <option value="todas">Todas las materias ({materias.length})</option>
              {materias.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Botón Exportar CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold border border-[#14214F] text-[#14214F] dark:border-white dark:text-white hover:bg-black/5 cursor-pointer shrink-0"
          >
            <DownloadSimple size={15} />
            <span>Exportar CSV</span>
          </button>
        </div>

        {/* Chips de estado (A9) */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[var(--border)] scrollbar-none min-w-0">
          <span className="text-xs font-mono uppercase font-bold text-[var(--text-muted)] mr-2 shrink-0">
            Estado de Acta:
          </span>
          <Chip active={filtroEstado === "todas"} onClick={() => setFiltroEstado("todas")}>
            Todas ({evaluaciones.length})
          </Chip>
          <Chip active={filtroEstado === "publicada"} onClick={() => setFiltroEstado("publicada")}>
            Publicadas ({evaluaciones.filter((e) => e.estado === "publicada").length})
          </Chip>
          <Chip active={filtroEstado === "en_correccion"} onClick={() => setFiltroEstado("en_correccion")}>
            En Corrección ({evaluaciones.filter((e) => e.estado === "en_correccion").length})
          </Chip>
          <Chip active={filtroEstado === "proxima"} onClick={() => setFiltroEstado("proxima")}>
            Próximas ({evaluaciones.filter((e) => e.estado === "proxima").length})
          </Chip>
        </div>
      </Card>

      {/* 3. TABLA ORDENABLE CON PAGINACIÓN (A8: overflow-x-auto interno) */}
      <div className="space-y-4 min-w-0">
        <SectionTitle subtitle="Hacé clic en cualquier fila para ver la devolución pedagógica y fechas de recuperatorio">
          Planilla Oficial de Evaluaciones
        </SectionTitle>

        <div className="overflow-hidden border border-[var(--border)] rounded-xl bg-[var(--surface-raised)] shadow-xs">
          <div className="overflow-x-auto min-w-0">
            <table className="w-full text-left border-collapse app-table">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-[var(--border)] bg-[rgba(20,33,79,0.03)]">
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] select-none"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={`flex items-center gap-1.5 ${
                              header.column.getCanSort() ? "cursor-pointer hover:text-[var(--text)]" : ""
                            }`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              <ArrowsDownUp size={12} className="opacity-50" />
                            )}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="py-8 text-center text-xs text-[var(--text-muted)]">
                      No se encontraron calificaciones con los criterios seleccionados.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setDetalleModalEval(row.original)}
                      className="hover:bg-[rgba(20,33,79,0.03)] dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="py-3.5 px-4 text-xs text-[var(--text)] whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación si hay más de 10 filas */}
          {evaluacionesFiltradas.length > 10 && (
            <div className="p-3 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono">
              <span className="text-[var(--text-muted)]">
                Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()} ({evaluacionesFiltradas.length} evaluaciones)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}
                  className="p-1.5 rounded border border-[var(--border)] disabled:opacity-30 hover:bg-black/5 cursor-pointer"
                >
                  <CaretLeft size={16} />
                </button>
                <button
                  type="button"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.nextPage()}
                  className="p-1.5 rounded border border-[var(--border)] disabled:opacity-30 hover:bg-black/5 cursor-pointer"
                >
                  <CaretRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. MODAL DIALOG DETALLE DE NOTA */}
      {detalleModalEval && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Detalle de evaluación: ${detalleModalEval.titulo}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setDetalleModalEval(null)}
        >
          <div
            className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setDetalleModalEval(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              <X size={20} />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono uppercase font-bold px-2 py-0.5 rounded bg-[#14214F] text-white">
                  {detalleModalEval.tipo}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-semibold">
                  {detalleModalEval.materiaNombre}
                </span>
              </div>
              <h3
                className="text-xl font-bold text-[var(--text)] mt-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {detalleModalEval.titulo}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[rgba(20,33,79,0.03)] border border-[var(--border)] font-mono text-xs">
              <div>
                <span className="text-[var(--text-muted)] block">Fecha Rendida</span>
                <span className="font-bold text-[var(--text)]">{formatFecha(detalleModalEval.fecha)}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">Fecha Publicación</span>
                <span className="font-bold text-[var(--text)]">
                  {detalleModalEval.fechaPublicacion ? formatFecha(detalleModalEval.fechaPublicacion) : "Pendiente"}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">Ponderación</span>
                <span className="font-bold text-[var(--text)]">
                  {detalleModalEval.pesoPorcentual ? `${detalleModalEval.pesoPorcentual}% de cursada` : "Regular"}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">Calificación Oficial</span>
                <span className="text-base font-bold text-[#14214F] dark:text-white tabular-nums">
                  {detalleModalEval.nota !== null ? `${detalleModalEval.nota.toFixed(1)} pts` : "—"}
                </span>
              </div>
            </div>

            {detalleModalEval.observaciones && (
              <div className="space-y-1 text-xs">
                <span className="font-bold text-[var(--text)] uppercase tracking-wider font-mono">
                  Devolución del Docente:
                </span>
                <p className="p-3 rounded-lg bg-[rgba(137,116,58,0.06)] border border-[rgba(137,116,58,0.2)] text-[var(--text)] leading-relaxed italic">
                  "{detalleModalEval.observaciones}"
                </p>
              </div>
            )}

            {detalleModalEval.instanciaRecuperatorio && (
              <div className="p-3 rounded-lg bg-[rgba(63,120,182,0.08)] border border-[rgba(63,120,182,0.25)] text-xs text-[#3F78B6]">
                <strong>Instancia de Recuperatorio prevista:</strong> {detalleModalEval.instanciaRecuperatorio}.
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setDetalleModalEval(null)}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-[#14214F] text-white hover:bg-[#1D2E68] cursor-pointer"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
