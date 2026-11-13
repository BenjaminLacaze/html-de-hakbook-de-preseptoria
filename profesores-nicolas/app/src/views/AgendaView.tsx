import React, { useEffect, useState } from 'react';
import { EVENT_TYPE_LABELS, EVENT_TYPES } from '@shared/types';
import type { EventType } from '@shared/types';
import type { Commission, AgendaEvent } from '../types';
import { academicService } from '../services/academicService';
import { AlertNotification } from '../components/common/AlertNotification';
import { Calendar as CalendarIcon, Filter, Info, ShieldCheck } from 'lucide-react';

interface AgendaViewProps {
  commissions: Commission[];
}

const EVENT_TYPE_COLORS: Record<EventType, { bg: string; text: string; border: string }> = {
  INSTITUTIONAL_DAY: { bg: 'rgba(124, 58, 237, 0.1)', text: '#6D28D9', border: '#C4B5FD' },
  CEREMONY: { bg: 'rgba(137, 116, 58, 0.15)', text: '#89743A', border: '#AF9B63' },
  EXAM_PERIOD: { bg: 'rgba(239, 68, 68, 0.1)', text: '#B91C1C', border: '#FCA5A5' },
  GRADES_DEADLINE: { bg: 'rgba(245, 158, 11, 0.1)', text: '#B45309', border: '#FCD34D' },
  HOLIDAY: { bg: 'rgba(16, 185, 129, 0.1)', text: '#047857', border: '#6EE7B7' },
  CLASS: { bg: 'rgba(59, 130, 246, 0.1)', text: '#1D4ED8', border: '#93C5FD' },
  OTHER: { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' },
};

export const AgendaView: React.FC<AgendaViewProps> = ({ commissions }) => {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCommission, setSelectedCommission] = useState<string>('TODAS');
  const [selectedType, setSelectedType] = useState<string>('TODOS');
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(
    null,
  );

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const data = await academicService.getAgendaEvents({
          commissionId: selectedCommission,
          type: selectedType,
        });
        setEvents(data);
      } catch (err) {
        setNotification({
          type: 'error',
          message: err instanceof Error ? err.message : 'No se pudo cargar la agenda académica.',
        });
      } finally {
        setLoading(false);
      }
    };
    void loadEvents();
  }, [selectedCommission, selectedType]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--isf-blue-primary)', margin: 0 }}>
            Agenda Académica y Exámenes
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Fechas de exámenes, mesas de final, entregas y jornadas institucionales del ciclo vigente.
          </p>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#047857',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #6EE7B7',
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
          }}
        >
          <ShieldCheck size={16} aria-hidden="true" />
          Calendario institucional
        </span>
      </div>

      {notification && (
        <AlertNotification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}

      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: 'var(--color-text-muted)',
          fontSize: '0.9rem',
        }}
      >
        <Info size={18} style={{ color: 'var(--isf-blue-secondary)', flexShrink: 0 }} aria-hidden="true" />
        <span>
          Las fechas las carga Dirección o Secretaría. Desde el portal docente se consultan; si necesitás agregar una
          fecha, pedila a Dirección.
        </span>
      </div>

      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--isf-blue-primary)', fontWeight: 600 }}>
          <Filter size={18} aria-hidden="true" />
          <span>Filtrar agenda:</span>
        </div>

        <div style={{ flex: '1 1 220px' }}>
          <label htmlFor="filter-comm" className="sr-only">
            Comisión
          </label>
          <select
            id="filter-comm"
            className="form-select"
            value={selectedCommission}
            onChange={(e) => setSelectedCommission(e.target.value)}
          >
            <option value="TODAS">Todas las cátedras</option>
            {commissions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.subjectName}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <label htmlFor="filter-type" className="sr-only">
            Tipo de evento
          </label>
          <select
            id="filter-type"
            className="form-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="TODOS">Todos los tipos</option>
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {EVENT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Cargando cronograma académico...
        </div>
      ) : events.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <CalendarIcon size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1rem' }} aria-hidden="true" />
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--isf-blue-primary)' }}>No hay fechas cargadas</h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '440px', margin: '0 auto' }}>
            No se encontraron eventos para los filtros seleccionados. Las fechas del ciclo las publica Dirección.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '1.25rem' }}>
          {events.map((ev) => {
            const colors = EVENT_TYPE_COLORS[ev.type] ?? EVENT_TYPE_COLORS.OTHER;
            const isToday = ev.date === new Date().toISOString().slice(0, 10);

            return (
              <article
                key={ev.id}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: `5px solid ${colors.text}`,
                  boxShadow: isToday ? '0 0 0 2px var(--isf-blue-secondary)' : undefined,
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
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      {EVENT_TYPE_LABELS[ev.type]}
                    </span>
                    {ev.mandatory && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#B91C1C' }}>Obligatorio</span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--isf-blue-primary)', margin: '0 0 0.5rem' }}>
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

                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#374151' }}>
                  <CalendarIcon size={15} style={{ color: 'var(--isf-blue-secondary)' }} aria-hidden="true" />
                  <span>
                    <strong>Fecha:</strong> {ev.date}
                    {ev.endDate && ev.endDate !== ev.date ? ` al ${ev.endDate}` : ''}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
