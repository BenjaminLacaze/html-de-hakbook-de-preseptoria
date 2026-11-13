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

const TYPE_DOT: Record<EventType, string> = {
  INSTITUTIONAL_DAY: '#6D28D9',
  CEREMONY: '#89743A',
  EXAM_PERIOD: '#B91C1C',
  GRADES_DEADLINE: '#B45309',
  HOLIDAY: '#047857',
  CLASS: '#1D4ED8',
  OTHER: '#64748B',
};

const formatDate = (iso: string): string => {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
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
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <span className="eyebrow">Calendario institucional</span>
          <h1 className="page-title">Agenda</h1>
          <p className="page-subtitle">Exámenes, entregas y jornadas del ciclo vigente.</p>
        </div>
        <span className="tag" aria-label="Agenda de solo lectura">
          <ShieldCheck size={14} aria-hidden="true" /> Solo lectura
        </span>
      </div>

      <p className="section-hint" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '-0.75rem' }}>
        <Info size={15} aria-hidden="true" />
        Las fechas las carga Dirección o Secretaría. Si necesitás agregar una, pedila a Dirección.
      </p>

      {notification && (
        <AlertNotification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}

      <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          <Filter size={16} aria-hidden="true" />
          Filtrar
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
          Cargando agenda...
        </div>
      ) : events.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <CalendarIcon size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 0.75rem' }} aria-hidden="true" />
          <h2 className="section-title" style={{ marginBottom: '0.35rem' }}>
            Sin fechas cargadas
          </h2>
          <p className="section-hint" style={{ margin: 0 }}>
            No hay eventos para los filtros seleccionados.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1rem' }}>
          {events.map((ev) => (
            <article key={ev.id} className="card" style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: TYPE_DOT[ev.type] }} aria-hidden="true" />
                  {EVENT_TYPE_LABELS[ev.type]}
                </span>
                {ev.mandatory && <span className="tag">Obligatorio</span>}
              </div>

              <h3 style={{ margin: 0, fontSize: '0.98rem', color: 'var(--isf-blue-primary)' }}>{ev.title}</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{ev.commissionName}</p>
              {ev.description && (
                <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{ev.description}</p>
              )}

              <div style={{ marginTop: 'auto', paddingTop: '0.65rem', borderTop: '1px solid var(--color-border-light)', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                {formatDate(ev.date)}
                {ev.endDate && ev.endDate !== ev.date ? ` — ${formatDate(ev.endDate)}` : ''}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
