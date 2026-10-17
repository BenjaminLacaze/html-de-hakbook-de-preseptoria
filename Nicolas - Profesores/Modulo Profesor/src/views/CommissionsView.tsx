import React, { useState, useMemo } from 'react';
import type { Commission, ActiveScreen } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import {
  BookOpen,
  Search,
  Filter,
  Users,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  GraduationCap,
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
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <BookOpen size={24} color="var(--isf-blue-primary)" aria-hidden="true" />
          <h1 style={{ margin: 0 }}>Comisiones y Materias Asignadas</h1>
        </div>
        <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', margin: 0 }}>
          Consultá las comisiones y materias asignadas a tu cargo para el presente ciclo lectivo en el ISFDyT N.° 26.
        </p>
      </div>

      {/* Aclaración institucional de alcance y permisos */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '0.875rem 1.25rem',
          backgroundColor: '#F8FAFC',
          borderRadius: 'var(--radius-md)',
          borderLeft: '4px solid var(--isf-blue-sky)',
          border: '1px solid var(--color-border-light)',
          borderLeftWidth: '4px',
          fontSize: '0.85rem',
          color: 'var(--color-text-secondary)',
        }}
      >
        <AlertCircle size={18} color="var(--isf-blue-sky)" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
        <div>
          <strong>Información sobre permisos docentes:</strong> Las asignaciones de cátedras y comisiones son administradas institucionalmente por la Secretaría Académica y la Dirección del ISFDyT N.° 26. El módulo docente permite la consulta de información académica, gestión de estudiantes a cargo y toma de asistencia.
        </div>
      </div>

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
            <div
              key={comm.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
                borderTop: '4px solid var(--isf-blue-primary)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-family-mono)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--isf-gold-ochre)',
                      backgroundColor: 'var(--isf-gold-light)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      border: '1px solid var(--isf-gold-border)',
                    }}
                  >
                    {comm.code}
                  </span>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--color-text-secondary)',
                      backgroundColor: '#F1F5F9',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                    }}
                  >
                    Turno {comm.shift}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.2rem', color: 'var(--isf-blue-primary)', marginBottom: '0.35rem' }}>
                  {comm.subjectName}
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--isf-gold-ochre)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <GraduationCap size={16} aria-hidden="true" />
                  <span>{comm.careerName}</span>
                </div>

                <div style={{ display: 'inline-block', backgroundColor: '#F8FAFC', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  Comisión: <strong>{comm.name}</strong> • {comm.academicYear}
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-secondary)',
                    backgroundColor: '#FAFCFE',
                    padding: '0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-light)',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} color="var(--isf-blue-sky)" aria-hidden="true" />
                    <span><strong>Horario:</strong> {comm.schedule}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} color="var(--isf-blue-sky)" aria-hidden="true" />
                    <span><strong>Espacio:</strong> {comm.classroom}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={16} color="var(--isf-blue-sky)" aria-hidden="true" />
                    <span>
                      <strong>Estudiantes inscritos:</strong> {comm.studentCount} alumnos
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--color-border-light)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => onNavigate('students', { commissionId: comm.id })}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  <Users size={16} aria-hidden="true" />
                  <span>Ver Estudiantes</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('attendance', { commissionId: comm.id })}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  <Calendar size={16} aria-hidden="true" />
                  <span>Tomar Asistencia</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
