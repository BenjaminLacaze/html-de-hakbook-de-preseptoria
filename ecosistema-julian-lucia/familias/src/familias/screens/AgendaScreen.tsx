import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SectionHeader } from '../components/SectionHeader';
import { Modal } from '../components/Modal';
import { LoadingState, EmptyState, ErrorState } from '../components/States';
import * as agendaApi from '../api/agenda';
import { AgendaEvent, EventCategory } from '../types/api';
import { formatDate, EVENT_CATEGORY_LABELS } from '../types/dictionaries';
import { 
  CaretLeft, 
  CaretRight, 
  CalendarBlank, 
  Clock, 
  MapPin, 
  GraduationCap, 
  BookmarkSimple,
  Info
} from '@phosphor-icons/react';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const AgendaScreen: React.FC = () => {
  const { selectedChildId, selectedChild } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<AgendaEvent[]>([]);

  // Mes y año actual del calendario navegable (inicializado en Noviembre 2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10); // 0-indexed: 10 = Noviembre

  // Evento seleccionado para diálogo modal
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);

  // Filtro de categoría
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const loadAgenda = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await agendaApi.getChildAgenda(selectedChildId || undefined);
      setEvents(data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener la agenda institucional.');
    } finally {
      setLoading(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    loadAgenda();
  }, [loadAgenda]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Días del mes para el grid del calendario
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Domingo
    // Ajustar a Lunes como primer día de la semana (estándar argentino)
    const startOffset = (firstDayIndex + 6) % 7;
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push({ dayNumber: null, dateStr: null });
    }
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const monthStr = (currentMonth + 1).toString().padStart(2, '0');
      const dayStr = d.toString().padStart(2, '0');
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
      days.push({ dayNumber: d, dateStr });
    }
    return days;
  }, [currentYear, currentMonth]);

  // Filtrar eventos por mes y categoría
  const monthEvents = useMemo(() => {
    const monthPrefix = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`;
    return events.filter((e) => {
      if (!e.date.startsWith(monthPrefix)) return false;
      if (categoryFilter !== 'ALL' && e.category !== categoryFilter) return false;
      return true;
    });
  }, [events, currentYear, currentMonth, categoryFilter]);

  if (loading) {
    return <LoadingState message="Cargando calendario y actividades del ciclo 2026..." />;
  }

  if (error) {
    return <ErrorState message="No se pudo cargar la agenda" details={error} onRetry={loadAgenda} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <SectionHeader
        kicker={selectedChild ? `Agenda para: ${selectedChild.firstName} ${selectedChild.lastName}` : 'Agenda Institucional'}
        title="Calendario y Actividades"
        subtitle="Exámenes, clases especiales, feriados, actos y salidas didácticas programadas."
      />

      {/* Controles del Calendario Mensual */}
      <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
          {/* Navegación de mes */}
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black uppercase tracking-tight text-[var(--text)] font-display">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <div className="flex items-center gap-1 border border-[var(--border)] rounded-xl p-0.5 bg-[var(--surface-subtle)]">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-card)] cursor-pointer"
                aria-label="Mes anterior"
              >
                <CaretLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-card)] cursor-pointer"
                aria-label="Mes siguiente"
              >
                <CaretRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filtro por tipo de evento */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-muted)] hidden sm:inline">
              Filtrar:
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
            >
              <option value="ALL">Todos los eventos</option>
              <option value="EXAM">Exámenes / Parciales</option>
              <option value="FIELD_TRIP">Salidas didácticas</option>
              <option value="SPECIAL_CLASS">Clases especiales</option>
              <option value="COMMEMORATIVE_ACT">Actos institucionales</option>
              <option value="HOLIDAY">Feriados / Asuetos</option>
            </select>
          </div>
        </div>

        {/* Grilla visual del calendario (Lunes a Domingo) */}
        <div className="mt-4">
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            <div>Lun</div>
            <div>Mar</div>
            <div>Mié</div>
            <div>Jue</div>
            <div>Vie</div>
            <div>Sáb</div>
            <div>Dom</div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cd, index) => {
              if (!cd.dateStr) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[64px] sm:min-h-[80px] p-1 rounded-xl bg-[var(--surface-subtle)]/30 border border-transparent opacity-20"
                  />
                );
              }

              // Eventos que caen en este día
              const dayEvents = events.filter((e) => e.date === cd.dateStr);

              return (
                <div
                  key={cd.dateStr}
                  className={`min-h-[64px] sm:min-h-[80px] p-1 sm:p-1.5 rounded-xl border transition-colors flex flex-col justify-between ${
                    dayEvents.length > 0
                      ? 'border-[#89743A]/40 bg-[var(--surface-subtle)]/70'
                      : 'border-[var(--border)] bg-[var(--surface)]'
                  }`}
                >
                  <span className="text-xs font-mono font-bold text-[var(--text)] self-start">
                    {cd.dayNumber}
                  </span>

                  <div className="space-y-1 mt-1">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => setSelectedEvent(ev)}
                        className="w-full text-left px-1 py-0.5 rounded text-[9px] sm:text-[10px] font-bold truncate bg-[#14214F] text-white hover:bg-[#1D2D63] transition-colors cursor-pointer block"
                        title={ev.title}
                      >
                        {ev.title}
                      </button>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-[#89743A] font-bold block">
                        +{dayEvents.length - 2} más
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lista detallada de eventos del mes */}
      <section aria-label="Lista de eventos del mes">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
          Eventos programados para {MONTH_NAMES[currentMonth]} {currentYear} ({monthEvents.length})
        </h3>

        {monthEvents.length === 0 ? (
          <EmptyState
            title={`No hay eventos agendados en ${MONTH_NAMES[currentMonth]} ${currentYear}`}
            description="Podés consultar meses anteriores o posteriores utilizando las flechas de navegación."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {monthEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => setSelectedEvent(ev)}
                className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] hover:border-[#89743A] shadow-xs cursor-pointer transition-colors flex items-start gap-3.5 group"
              >
                <div className="w-14 h-14 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] flex flex-col items-center justify-center shrink-0 font-mono text-center">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                    {formatDate(ev.date).slice(3, 5)}
                  </span>
                  <span className="text-lg font-black text-[var(--text)]">
                    {ev.date.split('-')[2]}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#89743A]">
                      {EVENT_CATEGORY_LABELS[ev.category]}
                    </span>
                    {ev.childName && (
                      <span className="text-[10px] text-[var(--text-muted)]">
                        · {ev.childName}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-[var(--text)] group-hover:text-[#89743A] transition-colors mt-0.5">
                    {ev.title}
                  </h4>

                  <p className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
                    <span>{ev.startTime ? `${ev.startTime} hs` : 'Todo el día'} {ev.endTime ? `a ${ev.endTime} hs` : ''} · {ev.location}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Diálogo Modal con detalle del evento (Requisito §4.4) */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || 'Detalle del Evento'}
        subtitle={selectedEvent ? `${EVENT_CATEGORY_LABELS[selectedEvent.category]} · ${formatDate(selectedEvent.date)}` : undefined}
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#89743A] shrink-0" weight="bold" />
                <span>
                  <strong>Horario:</strong> {selectedEvent.startTime ? `${selectedEvent.startTime} hs` : 'Todo el día'} {selectedEvent.endTime ? `a ${selectedEvent.endTime} hs` : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#89743A] shrink-0" weight="bold" />
                <span>
                  <strong>Lugar / Espacio:</strong> {selectedEvent.location}
                </span>
              </div>
              {selectedEvent.subjectName && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#89743A] shrink-0" weight="bold" />
                  <span>
                    <strong>Unidad Curricular:</strong> {selectedEvent.subjectName}
                  </span>
                </div>
              )}
              {selectedEvent.childName && (
                <div className="flex items-center gap-2">
                  <BookmarkSimple className="w-4 h-4 text-[#89743A] shrink-0" weight="bold" />
                  <span>
                    <strong>Estudiante convocado/a:</strong> {selectedEvent.childName}
                  </span>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Descripción Institucional
              </h4>
              <p className="text-xs text-[var(--text)] leading-relaxed">
                {selectedEvent.description}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
