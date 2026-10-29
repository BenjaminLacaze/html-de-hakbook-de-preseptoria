import React, { useState, useEffect, useMemo } from 'react';
import type { Commission, Student, ActiveScreen } from '../types';
import { academicService } from '../services/academicService';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  MessageSquare,
  AlertCircle,
  ArrowLeft,
  Mail,
} from 'lucide-react';

interface StudentsViewProps {
  commissions: Commission[];
  initialCommissionId?: string;
  onNavigate: (screen: ActiveScreen, context?: { commissionId?: string; studentId?: string }) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  commissions,
  initialCommissionId,
  onNavigate,
}) => {
  const [selectedCommissionId, setSelectedCommissionId] = useState<string>(
    initialCommissionId || (commissions.length > 0 ? commissions[0].id : '')
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [focusRevision, setFocusRevision] = useState(0);
  useEffect(() => {
    const refresh = () => setFocusRevision(n => n + 1);
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [sortBy, setSortBy] = useState<'name' | 'legajo'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (initialCommissionId) {
      setSelectedCommissionId(initialCommissionId);
    }
  }, [initialCommissionId]);

  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedCommissionId) return;
      setIsLoading(true); setLoadError(null);
      try {
        const data = await academicService.getStudentsByCommission(selectedCommissionId, {
          searchQuery,
          status: statusFilter,
          sortBy,
          sortOrder,
        });
        setStudents(data);
      } catch (err) {
        setStudents([]); setLoadError(err instanceof Error ? err.message : 'No se pudieron cargar los alumnos.');
      } finally {
        setIsLoading(false);
      }
    };

    loadStudents();
  }, [selectedCommissionId, searchQuery, statusFilter, sortBy, sortOrder, focusRevision]);

  const currentCommission = useMemo(() => {
    return commissions.find((c) => c.id === selectedCommissionId);
  }, [commissions, selectedCommissionId]);

  const toggleSort = (field: 'name' | 'legajo') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {loadError && <p role="alert">{loadError}</p>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button
            type="button"
            onClick={() => onNavigate('commissions')}
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Volver a Comisiones</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={24} color="var(--isf-blue-primary)" aria-hidden="true" />
            <h1 style={{ margin: 0 }}>Listado de Estudiantes</h1>
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0' }}>
            Nómina de alumnos matriculados por comisión para seguimiento pedagógico y asistencia.
          </p>
        </div>

        {/* Acceso Rápido a Asistencia de la comisión activa */}
        {currentCommission && (
          <button
            type="button"
            onClick={() => onNavigate('attendance', { commissionId: currentCommission.id })}
            className="btn btn-primary"
          >
            <Calendar size={18} aria-hidden="true" />
            <span>Tomar Asistencia ({currentCommission.name})</span>
          </button>
        )}
      </div>

      {/* Selector de Comisión Activa */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          backgroundColor: '#FFFFFF',
          borderLeft: '4px solid var(--isf-gold-ochre)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <label htmlFor="commission-select" className="form-label" style={{ marginBottom: '0.25rem' }}>
              Comisión y Materia Seleccionada:
            </label>
            <select
              id="commission-select"
              value={selectedCommissionId}
              onChange={(e) => setSelectedCommissionId(e.target.value)}
              className="form-select"
              style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--isf-blue-primary)' }}
            >
              {commissions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.subjectName} ({c.careerName})
                </option>
              ))}
            </select>
          </div>

          {currentCommission && (
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                fontSize: '0.85rem',
                color: 'var(--color-text-secondary)',
                backgroundColor: '#F8FAFC',
                padding: '0.625rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-light)',
              }}
            >
              <div>
                <strong>Turno:</strong> {currentCommission.shift}
              </div>
              <div>•</div>
              <div>
                <strong>Aula:</strong> {currentCommission.classroom}
              </div>
              <div>•</div>
              <div>
                <strong>Total Comisión:</strong> {currentCommission.studentCount} estudiantes
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Aclaración de Privacidad y Rol */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#F8FAFC',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.83rem',
          color: 'var(--color-text-secondary)',
          border: '1px solid var(--color-border-light)',
        }}
      >
        <AlertCircle size={16} color="var(--isf-blue-sky)" aria-hidden="true" style={{ flexShrink: 0 }} />
        <span>
          <strong>Nota institucional:</strong> Los datos provienen del registro institucional. La matriculación oficial, altas y bajas son gestionadas por la Preceptoría del instituto.
        </span>
      </div>

      {/* Controles de Búsqueda, Filtro y Orden */}
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
        <div style={{ display: 'flex', flex: 1, minWidth: '260px', position: 'relative' }}>
          <label htmlFor="search-student" className="sr-only">
            Buscar estudiante por nombre, apellido, legajo o DNI
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search
              size={18}
              color="var(--color-text-muted)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              aria-hidden="true"
            />
            <input
              id="search-student"
              type="search"
              placeholder="Buscar por apellido, nombre, legajo o DNI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} color="var(--color-text-muted)" aria-hidden="true" />
            <label htmlFor="filter-student-status" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--isf-blue-primary)' }}>
              Condición:
            </label>
            <select
              id="filter-student-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', minWidth: '130px' }}
            >
              <option value="TODOS">Todos los estados</option>
              <option value="REGULAR">Regular</option>
              <option value="LIBRE">Libre</option>
              <option value="PROMOCIONADO">Promocionado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Estudiantes */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          Cargando nómina de estudiantes...
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          title="No se encontraron estudiantes"
          description="No hay estudiantes que coincidan con la búsqueda o el filtro de condición seleccionado."
          action={{
            label: 'Restablecer filtros',
            onClick: () => {
              setSearchQuery('');
              setStatusFilter('TODOS');
            },
          }}
        />
      ) : (
        <div className="table-container">
          <table aria-label={`Nómina de estudiantes de la comisión ${currentCommission?.name || ''}`}>
            <caption>
              Mostrando {students.length} estudiantes en {currentCommission?.name} — {currentCommission?.subjectName}
            </caption>
            <thead>
              <tr>
                <th scope="col" style={{ width: '60px', textAlign: 'center' }}>#</th>
                <th scope="col">
                  <button
                    type="button"
                    onClick={() => toggleSort('legajo')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      color: 'inherit',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: 0,
                    }}
                    title="Ordenar por legajo"
                  >
                    <span>Legajo</span>
                    <ArrowUpDown size={14} aria-hidden="true" />
                  </button>
                </th>
                <th scope="col">
                  <button
                    type="button"
                    onClick={() => toggleSort('name')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      color: 'inherit',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: 0,
                    }}
                    title="Ordenar por apellido y nombre"
                  >
                    <span>Apellido y Nombre</span>
                    <ArrowUpDown size={14} aria-hidden="true" />
                  </button>
                </th>
                <th scope="col">DNI</th>
                <th scope="col">Contacto Institucional</th>
                <th scope="col">Condición</th>
                <th scope="col" style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id}>
                  <td style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    {index + 1}
                  </td>
                  <td style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 600, color: 'var(--isf-blue-primary)' }}>
                    {student.legajo}
                  </td>
                  <td>
                    <strong style={{ color: 'var(--color-text-primary)' }}>
                      {student.lastName}, {student.firstName}
                    </strong>
                  </td>
                  <td style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.875rem' }}>
                    {student.dni}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      <Mail size={14} aria-hidden="true" />
                      <span>{student.email}</span>
                    </div>
                  </td>
                  <td>
                    <Badge status={student.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() =>
                        onNavigate('observations', {
                          commissionId: student.commissionId,
                          studentId: student.id,
                        })
                      }
                      className="btn btn-secondary btn-sm"
                      title={`Registrar observación pedagógica para ${student.lastName}`}
                      style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                    >
                      <MessageSquare size={14} aria-hidden="true" />
                      <span>Observación</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
