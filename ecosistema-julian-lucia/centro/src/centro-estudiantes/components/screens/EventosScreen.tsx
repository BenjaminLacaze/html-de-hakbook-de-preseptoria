/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Pantalla de Eventos (Lista y Calendario mensual) con Exportación CSV
 */

import React, { useEffect, useState } from 'react';
import {
  CalendarBlank,
  ListDashes,
  Plus,
  MapPin,
  Clock,
  UsersThree,
  DownloadSimple,
  Pencil,
  Copy,
  Trash,
  X,
  Check,
  Eye,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';
import { useCentro } from '../../context/CentroContext';
import { EventAttendee, EventCategory, Evento, EventoInput } from '../../types';
import { todayISO } from '../../api/centro';
import { errorMessage } from '../../api/http';
import { NoUploadNotice, isHttpUrl } from '../common/LinkAttachmentEditor';
import { FilterChips } from '../common/FilterChips';
import { Button } from '../common/Button';
import { Dialog } from '../common/Dialog';
import { EventCategoryBadge } from '../common/Badge';

/** "18:00 a 20:00 hs", "18:00 hs" o "Horario a confirmar". */
const horario = (inicio: string, fin: string) =>
  inicio ? (fin ? `${inicio} a ${fin} hs` : `${inicio} hs`) : 'Horario a confirmar';

const ORGANIZADOR_DEFAULT = 'Centro de Estudiantes';

export const EventosScreen: React.FC = () => {
  const {
    eventos,
    addEvento,
    updateEvento,
    deleteEvento,
    duplicateEvento,
    fetchInscriptos,
    selectedDetailId,
    setSelectedDetailId,
  } = useCentro();
  const hoy = todayISO();

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [categoryFilter, setCategoryFilter] = useState<'todas' | EventCategory>('todas');

  // Create / Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPreviewInForm, setShowPreviewInForm] = useState(false);

  // Form state
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<EventCategory>('reunion');
  const [fecha, setFecha] = useState(hoy);
  const [horaInicio, setHoraInicio] = useState('18:00');
  const [horaFin, setHoraFin] = useState('20:00');
  const [lugar, setLugar] = useState('Salón de Actos (Sede Central)');
  const [descripcion, setDescripcion] = useState('');
  const [portadaUrl, setPortadaUrl] = useState('');
  const [cupoMaximo, setCupoMaximo] = useState<string>('');
  const [organizador, setOrganizador] = useState(ORGANIZADOR_DEFAULT);
  const [saving, setSaving] = useState(false);

  // Calendar month state (arranca en el mes actual)
  const [calendarMonth, setCalendarMonth] = useState(() => Number(hoy.slice(5, 7)) - 1); // 0-indexed
  const [calendarYear, setCalendarYear] = useState(() => Number(hoy.slice(0, 4)));

  // Inscriptos del evento abierto (se piden a la API al abrir el detalle)
  const [inscriptos, setInscriptos] = useState<EventAttendee[]>([]);
  const [inscriptosLoading, setInscriptosLoading] = useState(false);
  const [inscriptosError, setInscriptosError] = useState<string | null>(null);
  const [inscriptosReload, setInscriptosReload] = useState(0);

  // Delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Selected event detail
  const selectedEvent = eventos.find((e) => e.id === selectedDetailId);

  useEffect(() => {
    if (!selectedDetailId) return;
    let cancelled = false;
    setInscriptos([]);
    setInscriptosError(null);
    setInscriptosLoading(true);
    fetchInscriptos(selectedDetailId)
      .then((rows) => !cancelled && setInscriptos(rows))
      .catch((err) => !cancelled && setInscriptosError(errorMessage(err)))
      .finally(() => !cancelled && setInscriptosLoading(false));
    return () => {
      cancelled = true;
    };
  }, [selectedDetailId, inscriptosReload, fetchInscriptos]);

  // Filtered by category
  const filteredEventos = eventos.filter((e) => {
    if (categoryFilter === 'todas') return true;
    return e.categoria === categoryFilter;
  });

  const proximosEventos = filteredEventos
    .filter((e) => !e.esPasado)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  const pasadosEventos = filteredEventos
    .filter((e) => e.esPasado)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const openNewEventModal = () => {
    setEditingId(null);
    setTitulo('');
    setCategoria('reunion');
    setFecha(hoy);
    setHoraInicio('18:00');
    setHoraFin('20:00');
    setLugar('');
    setDescripcion('');
    setPortadaUrl('');
    setCupoMaximo('');
    setOrganizador(ORGANIZADOR_DEFAULT);
    setShowPreviewInForm(false);
    setModalOpen(true);
  };

  const openEditEventModal = (ev: Evento) => {
    setEditingId(ev.id);
    setTitulo(ev.titulo);
    setCategoria(ev.categoria);
    setFecha(ev.fecha);
    setHoraInicio(ev.horaInicio);
    setHoraFin(ev.horaFin);
    setLugar(ev.lugar);
    setDescripcion(ev.descripcion);
    setPortadaUrl(ev.portadaUrl || '');
    setCupoMaximo(ev.cupoMaximo ? String(ev.cupoMaximo) : '');
    setOrganizador(ev.organizador);
    setShowPreviewInForm(false);
    setModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      titulo.trim().length < 2 ||
      !fecha ||
      !horaInicio ||
      !lugar.trim() ||
      descripcion.trim().length < 2 ||
      organizador.trim().length < 2
    ) {
      setShowPreviewInForm(false);
      alert('Por favor completá los campos obligatorios (incluida la descripción).');
      return;
    }
    if (horaFin && horaFin <= horaInicio) {
      alert('La hora de fin tiene que ser posterior a la de inicio.');
      return;
    }
    if (portadaUrl.trim() && !isHttpUrl(portadaUrl)) {
      alert('La portada tiene que ser un enlace que empiece con https://');
      return;
    }

    const payload: EventoInput = {
      titulo,
      categoria,
      fecha,
      horaInicio,
      horaFin,
      lugar,
      descripcion,
      organizador,
      portadaUrl: portadaUrl.trim() || undefined,
      cupoMaximo: cupoMaximo ? parseInt(cupoMaximo, 10) : undefined,
    };

    setSaving(true);
    const ok = editingId ? await updateEvento(editingId, payload) : await addEvento(payload);
    setSaving(false);
    if (!ok) return;

    setModalOpen(false);
    setEditingId(null);
  };

  // CSV Export
  const handleExportCSV = (ev: Evento) => {
    const headers = ['Nombre Completo', 'Carrera', 'Email Institucional', 'Fecha Inscripción'];
    const q = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = inscriptos.map((ins) => [
      q(ins.nombre),
      q(ins.carrera),
      q(ins.email),
      q(formatInscripcion(ins.fechaInscripcion)),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Inscriptos_${ev.titulo.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatInscripcion = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatEventDate = (dateStr: string) => {
    try {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = parts[2];
        const m = months[parseInt(parts[1], 10) - 1];
        return `${d} ${m}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Calendar calculations
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 is Sunday
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Title and Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-brand-gold uppercase tracking-widest">
            ENCUENTROS Y ACTIVIDADES
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">
            Agenda de <span className="text-brand-gold">Actividades</span>
          </h1>
          <div className="brand-fillet mt-2" />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View mode toggle */}
          <div className="flex items-center p-1 bg-surface-card rounded-lg border border-border-subtle">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="Vista de lista"
              className={`p-2 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                viewMode === 'list'
                  ? 'bg-brand-navy text-white shadow-xs'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              <ListDashes weight="bold" className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              aria-label="Vista de calendario"
              className={`p-2 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                viewMode === 'calendar'
                  ? 'bg-brand-navy text-white shadow-xs'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              <CalendarBlank weight="bold" className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="accent-gold"
            icon={<Plus weight="bold" className="w-4 h-4" />}
            onClick={openNewEventModal}
          >
            Nueva Actividad
          </Button>
        </div>
      </div>

      {/* Filter chips with category badges and counts */}
      <FilterChips
        selected={categoryFilter}
        onChange={(val) => setCategoryFilter(val as any)}
        options={[
          { id: 'todas', label: 'Todas las categorías', count: eventos.length },
          {
            id: 'academico',
            label: 'Académico',
            count: eventos.filter((e) => e.categoria === 'academico').length,
          },
          {
            id: 'cultural',
            label: 'Cultural',
            count: eventos.filter((e) => e.categoria === 'cultural').length,
          },
          {
            id: 'deportivo',
            label: 'Deportivo',
            count: eventos.filter((e) => e.categoria === 'deportivo').length,
          },
          {
            id: 'reunion',
            label: 'Reunión',
            count: eventos.filter((e) => e.categoria === 'reunion').length,
          },
        ]}
      />

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-8">
          {/* Próximos Eventos */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground tracking-wider uppercase">
                Próximas Actividades ({proximosEventos.length})
              </h2>
            </div>

            {proximosEventos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {proximosEventos.map((ev) => (
                  <article
                    key={ev.id}
                    onClick={() => setSelectedDetailId(ev.id)}
                    className="bg-surface-card hover:bg-surface-hover rounded-xl border border-border-subtle hover:border-brand-gold/60 p-5 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                    role="button"
                    tabIndex={0}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <EventCategoryBadge category={ev.categoria} />
                        <div className="text-xs font-mono font-bold text-brand-navy dark:text-brand-gold px-2 py-0.5 rounded bg-surface">
                          {formatEventDate(ev.fecha)}
                        </div>
                      </div>

                      <h3 className="text-base sm:text-lg font-heading font-bold text-foreground group-hover:text-brand-navy dark:group-hover:text-brand-gold transition-colors leading-snug">
                        {ev.titulo}
                      </h3>

                      <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">
                        {ev.descripcion}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border-subtle space-y-2 text-xs text-foreground-muted">
                      <div className="flex items-center gap-2">
                        <Clock weight="bold" className="w-4 h-4 text-brand-gold shrink-0" />
                        <span className="font-mono">{horario(ev.horaInicio, ev.horaFin)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin weight="bold" className="w-4 h-4 text-brand-gold shrink-0" />
                        <span className="truncate">{ev.lugar || 'Lugar a confirmar'}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="font-semibold text-foreground text-xs">
                          <span className="font-mono text-brand-gold font-bold">
                            {ev.cantidadInscriptos}
                          </span>{' '}
                          inscriptos
                          {ev.cupoMaximo && (
                            <span className="text-foreground-muted text-[11px] font-normal">
                              {' '}/ cupo {ev.cupoMaximo}
                            </span>
                          )}
                        </div>

                        <span className="text-xs text-brand-blue font-semibold group-hover:underline">
                          Ver detalle y gestión →
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-surface-card rounded-xl border border-border-subtle text-xs text-foreground-muted">
                No hay actividades programadas con este filtro.
              </div>
            )}
          </section>

          {/* Pasados Eventos */}
          {pasadosEventos.length > 0 && (
            <section className="space-y-4 pt-4 border-t border-border-subtle">
              <h2 className="text-xs font-bold text-foreground-muted tracking-wider uppercase">
                Actividades Pasadas ({pasadosEventos.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75">
                {pasadosEventos.map((ev) => (
                  <article
                    key={ev.id}
                    onClick={() => setSelectedDetailId(ev.id)}
                    className="bg-surface-card rounded-xl border border-border-subtle p-4 cursor-pointer hover:opacity-100 transition-opacity"
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <EventCategoryBadge category={ev.categoria} />
                      <span className="text-xs text-foreground-muted font-mono">
                        {formatEventDate(ev.fecha)} (Finalizado)
                      </span>
                    </div>
                    <h3 className="text-sm font-heading font-bold text-foreground">
                      {ev.titulo}
                    </h3>
                    <div className="text-xs text-foreground-muted mt-2">
                      {ev.cantidadInscriptos} inscriptos registrados
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* CALENDAR MONTHLY VIEW */}
      {viewMode === 'calendar' && (
        <section className="bg-surface-card rounded-2xl border border-border-subtle p-4 sm:p-6 space-y-4">
          {/* Month Header Controller */}
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-heading font-bold text-foreground">
              {monthNames[calendarMonth]} {calendarYear}
            </h2>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  if (calendarMonth === 0) {
                    setCalendarMonth(11);
                    setCalendarYear((y) => y - 1);
                  } else {
                    setCalendarMonth((m) => m - 1);
                  }
                }}
                className="p-2 rounded-md hover:bg-surface-hover min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Mes anterior"
              >
                <CaretLeft weight="bold" className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (calendarMonth === 11) {
                    setCalendarMonth(0);
                    setCalendarYear((y) => y + 1);
                  } else {
                    setCalendarMonth((m) => m + 1);
                  }
                }}
                className="p-2 rounded-md hover:bg-surface-hover min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Mes siguiente"
              >
                <CaretRight weight="bold" className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-foreground-muted py-2 border-b border-border-subtle">
            <span>Dom</span>
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 sm:h-24 bg-surface/30 rounded-lg p-1" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateIso = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(
                dayNum
              ).padStart(2, '0')}`;
              const dayEvents = eventos.filter((e) => e.fecha === dateIso);
              const isToday = dateIso === hoy;

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`min-h-[70px] sm:min-h-[100px] rounded-lg border p-1.5 flex flex-col justify-between transition-colors ${
                    isToday
                      ? 'border-brand-gold bg-brand-gold/5'
                      : dayEvents.length > 0
                      ? 'border-border-subtle bg-surface-card hover:border-brand-navy/40'
                      : 'border-border-subtle/50 bg-surface/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-semibold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-brand-gold text-white flex items-center justify-center font-bold'
                          : 'text-foreground'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-brand-blue" />
                    )}
                  </div>

                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayEvents.map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => setSelectedDetailId(ev.id)}
                        className="w-full text-left truncate text-[10px] p-1 rounded bg-brand-navy/10 text-brand-navy dark:bg-white/10 dark:text-white font-medium hover:underline block"
                        title={ev.titulo}
                      >
                        {ev.titulo}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* DETAIL MODAL WITH ATTENDEE LIST AND CSV EXPORT */}
      {selectedEvent && (
        <Dialog
          isOpen={!!selectedEvent}
          onClose={() => setSelectedDetailId(null)}
          title={selectedEvent.titulo}
          description={`Detalle del evento · ${selectedEvent.lugar || 'Lugar a confirmar'}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <EventCategoryBadge category={selectedEvent.categoria} />
              <div className="text-xs text-foreground-muted font-mono">
                {selectedEvent.fecha.split('-').reverse().join('/')} · {horario(selectedEvent.horaInicio, selectedEvent.horaFin)}
              </div>
            </div>

            <div className="text-xs text-foreground-muted">
              Organiza: <strong className="text-foreground">{selectedEvent.organizador}</strong>
            </div>

            {selectedEvent.portadaUrl && (
              <div className="rounded-xl overflow-hidden border border-border-subtle max-h-56">
                <img src={selectedEvent.portadaUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {selectedEvent.descripcion}
            </p>

            {/* Attendance & Cupo Meter */}
            <div className="p-4 bg-surface rounded-xl border border-border-subtle space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">
                  Inscriptos registrados: {selectedEvent.cantidadInscriptos}
                </span>
                {selectedEvent.cupoMaximo && (
                  <span className="text-foreground-muted font-mono">
                    Cupo: {selectedEvent.cupoMaximo} (
                    {Math.round((selectedEvent.cantidadInscriptos / selectedEvent.cupoMaximo) * 100)}%)
                  </span>
                )}
              </div>

              {selectedEvent.cupoMaximo && (
                <div className="w-full h-2.5 bg-border-subtle rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-gold rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        (selectedEvent.cantidadInscriptos / selectedEvent.cupoMaximo) * 100
                      )}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* ORGANIZACIÓN EXCLUSIVA: Tabla de Inscriptos con Exportación CSV */}
            <div className="pt-4 border-t border-border-subtle space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground tracking-wider uppercase">
                    Lista de Inscriptos (Solo Organización)
                  </h4>
                  <p className="text-[11px] text-foreground-muted">
                    Información interna de la Comisión Directiva para control de acreditación.
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={<DownloadSimple weight="bold" className="w-4 h-4" />}
                  onClick={() => handleExportCSV(selectedEvent)}
                  disabled={inscriptosLoading || inscriptos.length === 0}
                >
                  Exportar CSV
                </Button>
              </div>

              {inscriptosLoading ? (
                <div className="p-4 text-center bg-surface rounded-lg text-xs text-foreground-muted">
                  Cargando inscriptos…
                </div>
              ) : inscriptosError ? (
                <div className="p-4 text-center bg-rose-50 dark:bg-rose-950/40 rounded-lg text-xs text-rose-800 dark:text-rose-200 space-y-2">
                  <div>No se pudo cargar la lista: {inscriptosError}</div>
                  <Button size="sm" variant="secondary" onClick={() => setInscriptosReload((n) => n + 1)}>
                    Reintentar
                  </Button>
                </div>
              ) : inscriptos.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-border-subtle">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface border-b border-border-subtle text-foreground-muted">
                      <tr>
                        <th className="p-2.5 font-semibold">Estudiante</th>
                        <th className="p-2.5 font-semibold">Carrera</th>
                        <th className="p-2.5 font-semibold">Email</th>
                        <th className="p-2.5 font-semibold">Inscripción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {inscriptos.map((ins) => (
                        <tr key={ins.id} className="hover:bg-surface/50">
                          <td className="p-2.5 font-medium text-foreground">{ins.nombre}</td>
                          <td className="p-2.5 text-foreground-muted">{ins.carrera || '—'}</td>
                          <td className="p-2.5 font-mono text-[11px] text-brand-blue">{ins.email}</td>
                          <td className="p-2.5 font-mono text-[11px] text-foreground-muted">
                            {formatInscripcion(ins.fechaInscripcion)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center bg-surface rounded-lg text-xs text-foreground-muted">
                  Aún no hay inscripciones registradas en esta actividad.
                </div>
              )}
            </div>

            {/* Actions for organization */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border-subtle">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Pencil weight="bold" className="w-4 h-4" />}
                  onClick={() => {
                    setSelectedDetailId(null);
                    openEditEventModal(selectedEvent);
                  }}
                >
                  Editar
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Copy weight="bold" className="w-4 h-4" />}
                  onClick={async () => {
                    if (await duplicateEvento(selectedEvent.id)) setSelectedDetailId(null);
                  }}
                >
                  Duplicar
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  icon={<Trash weight="bold" className="w-4 h-4" />}
                  onClick={() => setDeleteConfirmId(selectedEvent.id)}
                >
                  Eliminar
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setSelectedDetailId(null)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* CREATE / EDIT EVENT MODAL WITH PREVIEW */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Actividad' : 'Nueva Actividad Comunitaria'}
        description="Publicación de asambleas, talleres, actividades culturales o deportivas del Centro."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEvent} className="space-y-4">
          {showPreviewInForm ? (
            /* PREVIEW VIEWPORT */
            <div className="p-4 bg-surface rounded-xl border border-border-subtle space-y-3">
              <div className="flex items-center justify-between">
                <EventCategoryBadge category={categoria} />
                <span className="text-xs text-foreground-muted font-mono">
                  {fecha} · {horario(horaInicio, horaFin)}
                </span>
              </div>
              <h3 className="text-lg font-heading font-bold text-foreground">
                {titulo || 'Título de ejemplo'}
              </h3>
              <p className="text-xs text-foreground-muted leading-relaxed">
                {descripcion || 'Sin descripción todavía.'}
              </p>
              <div className="text-xs text-foreground-muted font-medium">
                Lugar: <strong>{lugar || 'a confirmar'}</strong> · Organiza: {organizador || '—'} · Cupo máximo:{' '}
                {cupoMaximo || 'Ilimitado'}
              </div>
            </div>
          ) : (
            /* FORM INPUTS */
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Título de la actividad *
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej.: Taller de Preparación para Finales y RAM"
                  className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border-subtle"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    Categoría *
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border-subtle"
                  >
                    <option value="academico">Académico (azul cielo)</option>
                    <option value="cultural">Cultural (arena dorada)</option>
                    <option value="deportivo">Deportivo (verde)</option>
                    <option value="reunion">Reunión / Asamblea (navy)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    required
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border-subtle"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    Hora inicio *
                  </label>
                  <input
                    type="time"
                    required
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border-subtle font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    Hora fin
                  </label>
                  <input
                    type="time"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border-subtle font-mono"
                  />
                </div>

                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    Cupo máx.
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={cupoMaximo}
                    onChange={(e) => setCupoMaximo(e.target.value)}
                    placeholder="Opcional"
                    className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border-subtle font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Lugar o Aula *
                </label>
                <input
                  type="text"
                  required
                  value={lugar}
                  onChange={(e) => setLugar(e.target.value)}
                  placeholder="Ej.: Salón de Actos o Laboratorio 1"
                  className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border-subtle"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Organiza *
                </label>
                <input
                  type="text"
                  required
                  value={organizador}
                  onChange={(e) => setOrganizador(e.target.value)}
                  placeholder="Ej.: Secretaría de Cultura del Centro"
                  className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border-subtle"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Enlace (URL) de imagen de portada (opcional)
                </label>
                <input
                  type="url"
                  value={portadaUrl}
                  onChange={(e) => setPortadaUrl(e.target.value)}
                  placeholder="https://…"
                  className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border-subtle font-mono"
                />
                <NoUploadNotice what="imágenes" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Descripción completa *
                </label>
                <textarea
                  rows={4}
                  required
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detallá los objetivos, requisitos y modalidad del encuentro..."
                  className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border-subtle font-sans"
                />
              </div>
            </>
          )}

          <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowPreviewInForm(!showPreviewInForm)}
              className="text-xs text-brand-blue hover:underline flex items-center gap-1 min-h-[44px]"
            >
              <Eye weight="bold" className="w-4 h-4" />
              <span>{showPreviewInForm ? 'Volver al formulario' : 'Vista previa de tarjeta'}</span>
            </button>

            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="accent-gold" type="submit" loading={saving} disabled={saving}>
                {editingId ? 'Guardar Cambios' : 'Publicar Evento'}
              </Button>
            </div>
          </div>
        </form>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="¿Eliminar actividad?"
        description="El evento se borra del sistema junto con su lista de inscriptos."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-foreground-muted">
            ¿Confirmás la eliminación del evento? Se borrará de la agenda y de las métricas.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (deleteConfirmId && (await deleteEvento(deleteConfirmId))) {
                  setSelectedDetailId(null);
                  setDeleteConfirmId(null);
                }
              }}
            >
              Sí, eliminar
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
