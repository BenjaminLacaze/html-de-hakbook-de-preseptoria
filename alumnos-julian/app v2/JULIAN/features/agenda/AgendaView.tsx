/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  CaretLeft,
  CaretRight,
  MapPin,
  Clock,
  BookOpen,
  Warning,
  Funnel,
  DownloadSimple,
  Bell,
  X,
  Check,
} from "@phosphor-icons/react";
import { Evento } from "../../shared/types";
import { PageTitle, SectionTitle, ContextLabel } from "../../shared/ui/Titles";
import { Card, Chip } from "../../shared/ui/Components";
import { formatFecha, parseLocalDate, formatFechaLarga } from "../../shared/lib/dateUtils";

interface AgendaViewProps {
  eventos: Evento[];
  initialDate?: string | null;
  onToggleReminder: (eventoId: string) => Promise<void>;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  eventos,
  initialDate,
  onToggleReminder,
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (initialDate) {
      const d = parseLocalDate(initialDate);
      return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    return new Date(2026, 10, 1); // Noviembre 2026
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate || null);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [dialogEvent, setDialogEvent] = useState<Evento | null>(null);

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
      const d = parseLocalDate(initialDate);
      setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }, [initialDate]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 dom, 1 lun...
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  // Filtrado de eventos
  const eventosFiltrados = eventos.filter((ev) => {
    const matchesTipo = filtroTipo === "todos" || ev.tipo === filtroTipo;
    const matchesDate = !selectedDate || ev.fecha === selectedDate;
    return matchesTipo && matchesDate;
  });

  // Generador de archivo .ics en el cliente para "Agregar a mi calendario"
  const handleDownloadICS = (evento: Evento) => {
    const fechaClean = evento.fecha.replace(/-/g, "");
    const horaIniClean = evento.horaInicio.replace(":", "") + "00";
    const horaFinClean = evento.horaFin.replace(":", "") + "00";

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ISFDyT 26//Panel de Alumno//ES",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `SUMMARY:${evento.titulo}`,
      `DESCRIPTION:${evento.descripcion} - ISFDyT N° 26`,
      `LOCATION:${evento.lugar}`,
      `DTSTART:${fechaClean}T${horaIniClean}`,
      `DTEND:${fechaClean}T${horaFinClean}`,
      `STATUS:CONFIRMED`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${evento.titulo.replace(/[^a-zA-Z0-9]/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn min-w-0">
      {/* 1. TÍTULO */}
      <div className="min-w-0">
        <ContextLabel color="blue">CALENDARIO Y CRONOGRAMA OFICIAL</ContextLabel>
        <PageTitle
          title="Agenda"
          highlightWord="Académica"
          description="Fechas de exámenes parciales, entregas obligatorias de proyectos, feriados y jornadas del ISFDyT N° 26."
        />
      </div>

      {/* 2. BARRA DE FILTROS (A9) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none min-w-0">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1 shrink-0 mr-2 font-mono">
          <Funnel size={14} /> Filtrar:
        </span>
        <Chip active={filtroTipo === "todos"} onClick={() => setFiltroTipo("todos")}>
          Todos los eventos ({eventos.length})
        </Chip>
        <Chip active={filtroTipo === "parcial"} onClick={() => setFiltroTipo("parcial")}>
          Exámenes Parciales
        </Chip>
        <Chip active={filtroTipo === "entrega"} onClick={() => setFiltroTipo("entrega")}>
          Entregas de TPs
        </Chip>
        <Chip active={filtroTipo === "jornada"} onClick={() => setFiltroTipo("jornada")}>
          Jornadas Institucionales
        </Chip>
        <Chip active={filtroTipo === "feriado"} onClick={() => setFiltroTipo("feriado")}>
          Feriados
        </Chip>
      </div>

      {/* 3. DOS COLUMNAS: CALENDARIO MENSUAL Y LISTADO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-w-0">
        {/* Columna Izquierda: Calendario mensual (5 cols) */}
        <div className="lg:col-span-5 space-y-4 min-w-0">
          <Card className="p-5">
            {/* Cabecera del mes con navegación */}
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-base font-bold text-[var(--text)] uppercase tracking-wider font-mono"
              >
                {monthNames[month]} {year}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Mes anterior"
                  className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible cursor-pointer"
                >
                  <CaretLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Mes siguiente"
                  className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible cursor-pointer"
                >
                  <CaretRight size={16} />
                </button>
              </div>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[var(--text-muted)] uppercase mb-2 font-mono">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mié</span>
              <span>Jue</span>
              <span>Vie</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>

            {/* Grilla de días */}
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: startingOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="h-9" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const hasEvent = eventos.some((e) => e.fecha === dateStr);
                const isSelected = selectedDate === dateStr;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`h-9 rounded-lg text-xs font-mono font-medium flex flex-col items-center justify-center relative transition-all duration-150 focus-visible cursor-pointer ${
                      isSelected
                        ? "bg-[#14214F] text-white font-bold shadow-xs dark:bg-[#89743A]"
                        : hasEvent
                        ? "bg-[rgba(137,116,58,0.12)] text-[#89743A] font-bold border border-[rgba(137,116,58,0.3)] hover:bg-[rgba(137,116,58,0.2)]"
                        : "text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <span>{dayNum}</span>
                    {hasEvent && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? "bg-[#AF9B63]" : "bg-[#89743A]"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Leyenda y botón ver todo el mes */}
            <div className="mt-5 pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#89743A]" />
                  <span>Con actividad</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#14214F] dark:bg-[#89743A]" />
                  <span>Seleccionado</span>
                </div>
              </div>
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="font-bold text-[#89743A] hover:underline cursor-pointer"
                >
                  Ver todo el mes
                </button>
              )}
            </div>
          </Card>

          {selectedDate && (
            <div className="flex items-center justify-between text-xs px-3.5 py-2.5 rounded-lg bg-[rgba(63,120,182,0.1)] text-[#3F78B6]">
              <span>Mostrando eventos del <strong>{formatFecha(selectedDate)}</strong></span>
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="font-bold underline hover:text-[#14214F] cursor-pointer"
              >
                Limpiar filtro
              </button>
            </div>
          )}
        </div>

        {/* Columna Derecha: Listado de eventos (7 cols) */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          <SectionTitle
            subtitle={`${eventosFiltrados.length} actividad${eventosFiltrados.length === 1 ? "" : "es"} programada${eventosFiltrados.length === 1 ? "" : "s"}`}
          >
            Cronograma de Actividades
          </SectionTitle>

          {eventosFiltrados.length === 0 ? (
            <Card className="text-center py-10">
              <CalendarIcon size={36} className="text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-[var(--text)]">
                No hay actividades programadas para este filtro
              </p>
              <button
                type="button"
                onClick={() => {
                  setFiltroTipo("todos");
                  setSelectedDate(null);
                }}
                className="mt-3 text-xs text-[#89743A] font-bold hover:underline cursor-pointer"
              >
                Restablecer filtros y ver todas las fechas
              </button>
            </Card>
          ) : (
            <div className="space-y-4">
              {eventosFiltrados.map((ev) => (
                <Card
                  key={ev.id}
                  variant="interactive"
                  onClick={() => setDialogEvent(ev)}
                  className="p-5 border-l-4 border-l-[#14214F] hover:shadow-xs transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[rgba(137,116,58,0.12)] text-[#89743A] w-fit">
                      {ev.tipo}
                    </span>
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                      <Clock size={14} />
                      <span>{formatFecha(ev.fecha)} · {ev.horaInicio} a {ev.horaFin} hs</span>
                    </div>
                  </div>

                  <h4
                    className="text-base font-bold text-[var(--text)] mb-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {ev.titulo}
                  </h4>

                  {ev.materiaNombre && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3F78B6] mb-2 truncate">
                      <BookOpen size={14} className="shrink-0" />
                      <span>{ev.materiaNombre}</span>
                    </div>
                  )}

                  <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3 line-clamp-2">
                    {ev.descripcion}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] text-xs">
                    <div className="flex items-center gap-1.5 text-[var(--text-muted)] truncate">
                      <MapPin size={14} className="shrink-0" />
                      <span className="truncate">{ev.lugar}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {ev.recordatorioActivo && (
                        <span className="text-xs text-[#89743A] flex items-center gap-1 font-mono">
                          <Bell size={13} weight="fill" /> Recordatorio
                        </span>
                      )}
                      {ev.obligatorio && (
                        <span className="text-xs font-bold uppercase text-[#B91C1C] flex items-center gap-1">
                          <Warning size={13} /> Obligatorio
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. MODAL DIALOG DETALLE DE EVENTO + EXPORTAR .ICS + RECORDATORIO */}
      {dialogEvent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Detalle del evento: ${dialogEvent.titulo}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setDialogEvent(null)}
        >
          <div
            className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setDialogEvent(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-xs font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[rgba(137,116,58,0.12)] text-[#89743A]">
                {dialogEvent.tipo}
              </span>
              <h3
                className="text-xl font-bold text-[var(--text)] mt-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {dialogEvent.titulo}
              </h3>
              {dialogEvent.materiaNombre && (
                <p className="text-xs font-semibold text-[#3F78B6] mt-0.5">
                  {dialogEvent.materiaNombre}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[rgba(20,33,79,0.03)] border border-[var(--border)] text-xs font-mono">
              <div>
                <span className="text-[var(--text-muted)] block text-xs">Fecha</span>
                <span className="font-bold text-[var(--text)]">{formatFechaLarga(dialogEvent.fecha)}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block text-xs">Horario</span>
                <span className="font-bold text-[var(--text)]">{dialogEvent.horaInicio} a {dialogEvent.horaFin} hs</span>
              </div>
              <div className="col-span-2">
                <span className="text-[var(--text-muted)] block text-xs">Ubicación</span>
                <span className="font-bold text-[var(--text)]">{dialogEvent.lugar}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
              {dialogEvent.descripcion}
            </p>

            {/* Switch de recordatorio en campana */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
              <div className="flex items-center gap-2">
                <Bell size={18} className={dialogEvent.recordatorioActivo ? "text-[#89743A]" : "text-[var(--text-muted)]"} />
                <span className="text-xs font-bold text-[var(--text)]">Activar recordatorio en campana</span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(dialogEvent.recordatorioActivo)}
                onChange={async () => {
                  await onToggleReminder(dialogEvent.id);
                  setDialogEvent((prev) => (prev ? { ...prev, recordatorioActivo: !prev.recordatorioActivo } : null));
                }}
                className="w-4 h-4 accent-[#14214F] cursor-pointer"
              />
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => handleDownloadICS(dialogEvent)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border border-[#14214F] text-[#14214F] dark:text-white dark:border-white hover:bg-black/5 cursor-pointer"
              >
                <DownloadSimple size={16} />
                <span>Agregar a mi calendario (.ics)</span>
              </button>

              <button
                type="button"
                onClick={() => setDialogEvent(null)}
                className="w-full sm:w-auto px-5 py-2 rounded-lg text-xs font-bold bg-[#14214F] text-white hover:bg-[#1D2E68] cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
