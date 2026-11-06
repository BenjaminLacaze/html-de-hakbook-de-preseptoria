import React, { useState, useEffect } from 'react';
import type { Commission, AgendaEvent, AgendaEventType } from '../types';
import { academicService } from '../services/academicService';
import { AlertNotification } from '../components/common/AlertNotification';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Filter,
  GraduationCap,
  BookOpen,
  FileCheck
} from 'lucide-react';

interface AgendaViewProps {
  commissions: Commission[];
}

const EVENT_TYPE_LABELS: Record<AgendaEventType, string> = {
  PARCIAL: 'Examen Parcial',
  RECUPERATORIO: 'Recuperatorio',
  FINAL: 'Mesa de Final',
  ENTREGA_TP: 'Entrega de TP',
  CLASE: 'Clase Especial / Consulta',
  EVENTO: 'Jornada Institucional'
};

const EVENT_TYPE_COLORS: Record<AgendaEventType, { bg: string; text: string; border: string }> = {
  PARCIAL: { bg: 'rgba(239, 68, 68, 0.1)', text: '#B91C1C', border: '#FCA5A5' },
  RECUPERATORIO: { bg: 'rgba(245, 158, 11, 0.1)', text: '#B45309', border: '#FCD34D' },
  FINAL: { bg: 'rgba(137, 116, 58, 0.15)', text: '#89743A', border: '#AF9B63' },
  ENTREGA_TP: { bg: 'rgba(59, 130, 246, 0.1)', text: '#1D4ED8', border: '#93C5FD' },
  CLASE: { bg: 'rgba(16, 185, 129, 0.1)', text: '#047857', border: '#6EE7B7' },
  EVENTO: { bg: 'rgba(124, 58, 237, 0.1)', text: '#6D28D9', border: '#C4B5FD' }
};

export const AgendaView: React.FC<AgendaViewProps> = ({ commissions }) => {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCommission, setSelectedCommission] = useState<string>('TODAS');
  const [selectedType, setSelectedType] = useState<string>('TODOS');
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Formulario nuevo evento
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    commissionId: commissions[0]?.id || '',
    title: '',
    description: '',
    type: 'PARCIAL' as AgendaEventType,
    date: new Date().toISOString().slice(0, 10),
    time: '08:00',
    location: 'Aula 4',
    reminderDaysBefore: 3
  });

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await academicService.getAgendaEvents({
        commissionId: selectedCommission,
        type: selectedType
      });
      setEvents(data);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'No se pudo cargar la agenda académica.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, [selectedCommission, selectedType]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setNotification({ type: 'error', message: 'El título del evento es obligatorio.' });
      return;
    }

    try {
      const comm = commissions.find(c => c.id === formData.commissionId);
      await academicService.createAgendaEvent({
        ...formData,
        commissionName: comm ? comm.name : 'General',
        isCompleted: false
      });
      setNotification({ type: 'success', message: 'Evento agregado a la agenda exitosamente.' });
      setIsModalOpen(false);
      // Reset form
      setFormData({
        commissionId: commissions[0]?.id || '',
        title: '',
        description: '',
        type: 'PARCIAL',
        date: new Date().toISOString().slice(0, 10),
        time: '08:00',
        location: 'Aula 4',
        reminderDaysBefore: 3
      });
      void loadEvents();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al guardar el evento.'
      });
    }
  };

  const handleToggleCompleted = async (event: AgendaEvent) => {
    try {
      await academicService.updateAgendaEvent(event.id, {
        isCompleted: !event.isCompleted
      });
      setEvents(prev => prev.map(e => e.id === event.id ? { ...e, isCompleted: !e.isCompleted } : e));
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'No se pudo actualizar el estado del evento.'
      });
    }
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    try {
      await academicService.deleteAgendaEvent(eventToDelete);
      setEvents(prev => prev.filter(e => e.id !== eventToDelete));
      setNotification({ type: 'success', message: 'Evento eliminado de la agenda.' });
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'No se pudo eliminar el evento.'
      });
    } finally {
      setEventToDelete(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Encabezado y acción principal */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--isf-blue-primary)', margin: 0 }}>
            Agenda Académica y Exámenes
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Planificá clases, fechas de exámenes parciales, recuperatorios, mesas de finales y entregas de trabajos prácticos.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} />
          Nuevo Evento / Examen
        </button>
      </div>

      {notification && (
        <AlertNotification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Barra de Filtros */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--isf-blue-primary)', fontWeight: 600 }}>
          <Filter size={18} />
          <span>Filtrar Agenda:</span>
        </div>

        <div style={{ flex: '1 1 220px' }}>
          <label htmlFor="filter-comm" className="sr-only">Comisión</label>
          <select
            id="filter-comm"
            className="form-select"
            value={selectedCommission}
            onChange={(e) => setSelectedCommission(e.target.value)}
          >
            <option value="TODAS">Todas las Cátedras</option>
            {commissions.map(c => (
              <option key={c.id} value={c.id}>{c.code} — {c.subjectName}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <label htmlFor="filter-type" className="sr-only">Tipo de Evento</label>
          <select
            id="filter-type"
            className="form-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="TODOS">Todos los tipos</option>
            <option value="PARCIAL">Exámenes Parciales</option>
            <option value="RECUPERATORIO">Recuperatorios</option>
            <option value="FINAL">Mesas de Finales</option>
            <option value="ENTREGA_TP">Entregas de TPs</option>
            <option value="CLASE">Clases Especiales</option>
            <option value="EVENTO">Jornadas Institucionales</option>
          </select>
        </div>
      </div>

      {/* Lista de Eventos */}
      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Cargando cronograma académico...
        </div>
      ) : events.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <CalendarIcon size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--isf-blue-primary)' }}>No hay eventos programados</h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            No se encontraron fechas registradas para los filtros seleccionados. Hacé clic en "Nuevo Evento / Examen" para agendar.
          </p>
          <button className="btn btn-secondary" onClick={() => setIsModalOpen(true)}>
            Agendar primer examen o clase
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '1.25rem' }}>
          {events.map((ev) => {
            const colors = EVENT_TYPE_COLORS[ev.type] || { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' };
            const isToday = ev.date === new Date().toISOString().slice(0, 10);

            return (
              <div
                key={ev.id}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: `5px solid ${colors.text}`,
                  opacity: ev.isCompleted ? 0.75 : 1,
                  boxShadow: isToday ? '0 0 0 2px var(--isf-blue-secondary)' : undefined
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        backgroundColor: colors.bg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                      }}
                    >
                      {EVENT_TYPE_LABELS[ev.type]}
                    </span>
                    <button
                      onClick={() => setEventToDelete(ev.id)}
                      title="Eliminar evento"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#9CA3AF',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: 'var(--isf-blue-primary)',
                      margin: '0 0 0.5rem',
                      textDecoration: ev.isCompleted ? 'line-through' : 'none'
                    }}
                  >
                    {ev.title}
                  </h3>

                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                    <strong>{ev.commissionName}</strong>
                  </div>

                  {ev.description && (
                    <p style={{ fontSize: '0.875rem', color: '#4B5563', margin: '0 0 1rem', lineHeight: 1.5 }}>
                      {ev.description}
                    </p>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#374151' }}>
                    <CalendarIcon size={15} style={{ color: 'var(--isf-blue-secondary)' }} />
                    <span><strong>Fecha:</strong> {ev.date}</span>
                    <Clock size={15} style={{ color: 'var(--isf-blue-secondary)', marginLeft: '0.5rem' }} />
                    <span>{ev.time} hs</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#374151' }}>
                    <MapPin size={15} style={{ color: 'var(--isf-blue-secondary)' }} />
                    <span>{ev.location}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => void handleToggleCompleted(ev)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: 'transparent',
                        border: 'none',
                        color: ev.isCompleted ? '#059669' : '#6B7280',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      <CheckCircle2 size={16} />
                      {ev.isCompleted ? 'Realizado / Completado' : 'Marcar como cumplido'}
                    </button>
                    {ev.reminderDaysBefore > 0 && !ev.isCompleted && (
                      <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                        Aviso: {ev.reminderDaysBefore} d antes
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Nuevo Evento */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 25, 45, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '540px',
              padding: '2rem',
              backgroundColor: '#FFFFFF',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h2 id="modal-title" style={{ margin: '0 0 1rem', color: 'var(--isf-blue-primary)', fontSize: '1.35rem' }}>
              Agendar Nuevo Evento o Examen
            </h2>

            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="ev-title">Título del Evento *</label>
                <input
                  id="ev-title"
                  className="form-input"
                  type="text"
                  required
                  placeholder="Ej. 1° Parcial Teórico-Práctico"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="ev-type">Tipo de Evento</label>
                  <select
                    id="ev-type"
                    className="form-select"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as AgendaEventType })}
                  >
                    <option value="PARCIAL">Examen Parcial</option>
                    <option value="RECUPERATORIO">Recuperatorio</option>
                    <option value="FINAL">Mesa de Examen Final</option>
                    <option value="ENTREGA_TP">Entrega de TP</option>
                    <option value="CLASE">Clase Especial</option>
                    <option value="EVENTO">Jornada Institucional</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="ev-comm">Cátedra / Comisión</label>
                  <select
                    id="ev-comm"
                    className="form-select"
                    value={formData.commissionId}
                    onChange={e => setFormData({ ...formData, commissionId: e.target.value })}
                  >
                    {commissions.map(c => (
                      <option key={c.id} value={c.id}>{c.code} — {c.subjectName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="ev-date">Fecha *</label>
                  <input
                    id="ev-date"
                    className="form-input"
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="ev-time">Hora</label>
                  <input
                    id="ev-time"
                    className="form-input"
                    type="time"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="ev-loc">Aula o Lugar</label>
                  <input
                    id="ev-loc"
                    className="form-input"
                    type="text"
                    placeholder="Ej. Aula 4 / Aula Magna"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="ev-rem">Aviso previo (días)</label>
                  <input
                    id="ev-rem"
                    className="form-input"
                    type="number"
                    min="0"
                    max="30"
                    value={formData.reminderDaysBefore}
                    onChange={e => setFormData({ ...formData, reminderDaysBefore: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ev-desc">Descripción y Contenidos a evaluar</label>
                <textarea
                  id="ev-desc"
                  className="form-textarea"
                  rows={3}
                  placeholder="Temas de la evaluación, modalidad, criterios pedagógicos..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar en Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={Boolean(eventToDelete)}
        title="Eliminar Evento de la Agenda"
        description="Esta acción quitará la fecha del cronograma del docente."
        confirmLabel="Eliminar Evento"
        onConfirm={handleDelete}
        onCancel={() => setEventToDelete(null)}
      >
        <p>¿Estás seguro de que deseás eliminar este evento de la agenda académica?</p>
      </ConfirmModal>
    </div>
  );
};

