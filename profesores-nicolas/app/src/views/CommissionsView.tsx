import React, { useState, useMemo } from 'react';
import type { Commission, ActiveScreen } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import {
  Search,
  Filter,
  Users,
  Clock,
  MapPin,
  AlertCircle,
} from 'lucide-react';

interface CommissionsViewProps {
  commissions: Commission[];
  onNavigate: (screen: ActiveScreen, context?: { commissionId?: string }) => void;
}

export const CommissionsView: React.FC<CommissionsViewProps> = ({
  commissions,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShift, setSelectedShift] = useState<string>('TODOS');

  const filteredCommissions = useMemo(() => {
    return commissions.filter((comm) => {
      const matchesShift = selectedShift === 'TODOS' || comm.shift === selectedShift;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        comm.subjectName.toLowerCase().includes(q) ||
        comm.careerName.toLowerCase().includes(q) ||
        comm.name.toLowerCase().includes(q) ||
        comm.code.toLowerCase().includes(q);

      return matchesShift && matchesQuery;
    });
  }, [commissions, searchQuery, selectedShift]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Encabezado de la pantalla */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <span className="eyebrow">Ciclo lectivo 2026</span>
          <h1 className="page-title">Comisiones</h1>
          <p className="page-subtitle">Materias y comisiones asignadas a tu legajo.</p>
        </div>
      </div>

      <p className="section-hint" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '-0.75rem' }}>
        <AlertCircle size={15} aria-hidden="true" />
        Las asignaciones las administra Secretaría Académica. El módulo docente solo consulta.
      </p>

      {/* Barra de Filtros y Búsqueda */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flex: 1, minWidth: '260px', gap: '0.5rem', position: 'relative' }}>
          <label htmlFor="search-commissions" className="sr-only">
            Buscar materia o carrera
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search
              size={18}
              color="var(--color-text-muted)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              aria-hidden="true"
            />
            <input
              id="search-commissions"
              type="search"
              placeholder="Buscar por materia, carrera o código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: '200px' }}>
          <Filter size={18} color="var(--color-text-muted)" aria-hidden="true" />
          <label htmlFor="filter-shift" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--isf-blue-primary)', whiteSpace: 'nowrap' }}>
            Turno:
          </label>
          <select
            id="filter-shift"
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '140px' }}
          >
            <option value="TODOS">Todos los turnos</option>
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
            <option value="Vespertino">Vespertino</option>
          </select>
        </div>
      </div>

      {/* Listado de Comisiones */}
      {filteredCommissions.length === 0 ? (
        <EmptyState
          title="No se encontraron comisiones"
          description="No existen materias ni comisiones que coincidan con los criterios de búsqueda o turno seleccionados."
          action={{
            label: 'Restablecer filtros',
            onClick: () => {
              setSearchQuery('');
              setSelectedShift('TODOS');
            },
          }}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {filteredCommissions.map((comm) => (
            <article key={comm.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span className="commission-code">{comm.code}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{comm.shift}</span>
                </div>

                <h2 style={{ fontSize: '1.05rem', color: 'var(--isf-blue-primary)', margin: '0.35rem 0 0.25rem' }}>
                  {comm.subjectName}
                </h2>

                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0 0 0.35rem' }}>{comm.careerName}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '0 0 1rem' }}>
                  {comm.name} · {comm.academicYear}
                </p>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    fontSize: '0.82rem',
                    color: 'var(--color-text-secondary)',
                    backgroundColor: 'var(--color-bg-card-hover)',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Clock size={14} color="var(--color-text-muted)" aria-hidden="true" />
                    {comm.schedule}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <MapPin size={14} color="var(--color-text-muted)" aria-hidden="true" />
                    {comm.classroom || 'Sin aula asignada'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Users size={14} color="var(--color-text-muted)" aria-hidden="true" />
                    {comm.studentCount} estudiantes
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--color-border-light)', paddingTop: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => onNavigate('students', { commissionId: comm.id })}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  Estudiantes
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('attendance', { commissionId: comm.id })}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                  Asistencia
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
