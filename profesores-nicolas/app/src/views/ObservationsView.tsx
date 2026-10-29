import React, { useState, useEffect, useMemo } from 'react';
import type { Commission, Student, AcademicObservation, ActiveScreen } from '../types';
import { academicService } from '../services/academicService';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { AlertNotification } from '../components/common/AlertNotification';
import { EmptyState } from '../components/common/EmptyState';
import {
  MessageSquare,
  Calendar,
  Clock,
  User,
  PlusCircle,
  Search,
  Filter,
  ArrowLeft,
  FileText,
} from 'lucide-react';

interface ObservationsViewProps {
  commissions: Commission[];
  initialCommissionId?: string;
  initialStudentId?: string;
  onNavigate: (screen: ActiveScreen, context?: { commissionId?: string }) => void;
}

export const ObservationsView: React.FC<ObservationsViewProps> = ({
  commissions,
  initialCommissionId,
  initialStudentId,
  onNavigate,
}) => {
  // Estado para el formulario de nueva observación
  const [formCommissionId, setFormCommissionId] = useState<string>(
    initialCommissionId || (commissions.length > 0 ? commissions[0].id : '')
  );
  const [formStudentId, setFormStudentId] = useState<string>(initialStudentId || '');
  const [pedagogicalDate, setPedagogicalDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [category, setCategory] = useState<AcademicObservation['category']>('Seguimiento pedagógico');
  const [content, setContent] = useState<string>('');

  // Estudiantes disponibles para la comisión del formulario
  const [formStudents, setFormStudents] = useState<Student[]>([]);

  // Listado de observaciones existentes y filtros
  const [observations, setObservations] = useState<AcademicObservation[]>([]);
  const [filterCommissionId, setFilterCommissionId] = useState<string>('TODAS');
  const [filterSearchQuery, setFilterSearchQuery] = useState<string>('');

  // Estados de control
  const [focusRevision, setFocusRevision] = useState(0);
  useEffect(() => {
    const refresh = () => setFocusRevision(n => n + 1);
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(true);

  // Cargar estudiantes para la comisión seleccionada en el formulario
  useEffect(() => {
    const loadStudents = async () => {
      if (!formCommissionId) return;
      try {
        const list = await academicService.getStudentsByCommission(formCommissionId);
        setFormStudents(list);
        if (initialStudentId && list.some((s) => s.id === initialStudentId)) {
          setFormStudentId(initialStudentId);
        } else if (list.length > 0 && !list.some((s) => s.id === formStudentId)) {
          setFormStudentId(list[0].id);
        }
      } catch (err) {
        setValidationError(err instanceof Error ? err.message : 'No se pudieron cargar los datos.');
      }
    };

    loadStudents();
  }, [formCommissionId, initialStudentId, focusRevision]);

  // Cargar listado de observaciones
  const fetchObservations = async () => {
    setIsLoading(true);
    try {
      const list = await academicService.getObservations({
        commissionId: filterCommissionId,
        searchQuery: filterSearchQuery,
      });
      setObservations(list);
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'No se pudieron cargar los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchObservations();
  }, [filterCommissionId, filterSearchQuery, focusRevision]);

  // Obtener datos del estudiante seleccionado en el formulario
  const selectedStudentObj = useMemo(() => {
    return formStudents.find((s) => s.id === formStudentId);
  }, [formStudents, formStudentId]);

  const selectedCommissionObj = useMemo(() => {
    return commissions.find((c) => c.id === formCommissionId);
  }, [commissions, formCommissionId]);

  // Validar y abrir confirmación
  const handleInitiateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formCommissionId) {
      setValidationError('Debe seleccionar una comisión.');
      return;
    }

    if (!formStudentId) {
      setValidationError('Debe seleccionar un estudiante.');
      return;
    }

    if (!pedagogicalDate) {
      setValidationError('Debe indicar la fecha en que ocurrió el hecho pedagógico.');
      return;
    }

    if (!content.trim() || content.trim().length < 15) {
      setValidationError('El texto de la observación debe contener al menos 15 caracteres descriptivos.');
      return;
    }

    setIsConfirmModalOpen(true);
  };

  // Confirmar y registrar
  const handleConfirmSubmit = async () => {
    if (!selectedStudentObj || !selectedCommissionObj) return;

    try {
      setIsLoading(true);
      setIsConfirmModalOpen(false);

      const teacher = await academicService.getCurrentTeacher();

      await academicService.createObservation({
        commissionId: selectedCommissionObj.id,
        commissionName: `${selectedCommissionObj.name} (${selectedCommissionObj.subjectName})`,
        studentId: selectedStudentObj.id,
        studentName: `${selectedStudentObj.lastName}, ${selectedStudentObj.firstName}`,
        studentLegajo: selectedStudentObj.legajo,
        pedagogicalDate,
        content: content.trim(),
        category,
        teacherId: teacher.id,
      });

      setSuccessMessage(
        `Observación cualitativa registrada correctamente para ${selectedStudentObj.lastName}, ${selectedStudentObj.firstName}.`
      );

      // Limpiar formulario
      setContent('');
      await fetchObservations();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'No se pudieron cargar los datos.');

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Volver al Panel</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={24} color="var(--isf-blue-primary)" aria-hidden="true" />
            <h1 style={{ margin: 0 }}>Observaciones Académicas</h1>
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0' }}>
            Registro y seguimiento cualitativo del proceso formativo de los estudiantes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="btn btn-primary"
        >
          <PlusCircle size={18} aria-hidden="true" />
          <span>{isFormVisible ? 'Ocultar Formulario' : 'Nueva Observación'}</span>
        </button>
      </div>

      {/* Alertas */}
      {successMessage && (
        <AlertNotification
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {validationError && (
        <AlertNotification
          type="error"
          message={validationError}
          onClose={() => setValidationError(null)}
        />
      )}

      {/* Formulario de Nueva Observación */}
      {isFormVisible && (
        <section aria-labelledby="section-new-observation" className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <FileText size={20} color="var(--isf-gold-ochre)" aria-hidden="true" />
            <h2 id="section-new-observation" style={{ fontSize: '1.15rem', margin: 0, color: 'var(--isf-blue-primary)' }}>
              Registrar Observación Cualitativa
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            Las observaciones son formativas y cualitativas. No ingresar calificaciones numéricas, notas de parciales ni promedios.
          </p>

          <form onSubmit={handleInitiateSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              {/* Selección de Comisión */}
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="obs-commission" className="form-label">
                  Comisión: <span style={{ color: '#B91C1C' }}>*</span>
                </label>
                <select
                  id="obs-commission"
                  value={formCommissionId}
                  onChange={(e) => setFormCommissionId(e.target.value)}
                  className="form-select"
                  required
                >
                  {commissions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selección de Estudiante */}
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="obs-student" className="form-label">
                  Estudiante: <span style={{ color: '#B91C1C' }}>*</span>
                </label>
                <select
                  id="obs-student"
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="form-select"
                  required
                  disabled={formStudents.length === 0}
                >
                  {formStudents.length === 0 && <option value="">Sin estudiantes disponibles</option>}
                  {formStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.lastName}, {s.firstName} ({s.legajo})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha del Hecho Pedagógico */}
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="obs-date" className="form-label">
                  Fecha del Hecho Pedagógico: <span style={{ color: '#B91C1C' }}>*</span>
                </label>
                <input
                  id="obs-date"
                  type="date"
                  value={pedagogicalDate}
                  onChange={(e) => setPedagogicalDate(e.target.value)}
                  className="form-input"
                  required
                />
                <span className="form-hint">
                  Día en que se produjo la situación o desempeño en el aula
                </span>
              </div>

              {/* Categoría Pedagógica */}
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="obs-category" className="form-label">
                  Dimensión Pedagógica:
                </label>
                <select
                  id="obs-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AcademicObservation['category'])}
                  className="form-select"
                >
                  <option value="Seguimiento pedagógico">Seguimiento pedagógico</option>
                  <option value="Participación y desempeño">Participación y desempeño</option>
                  <option value="Adecuación / Apoyo">Adecuación / Apoyo formativo</option>
                  <option value="General">General / Institucional</option>
                </select>
              </div>
            </div>

            {/* Texto de la Observación */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="obs-content" className="form-label">
                  Descripción Cualitativa de la Observación: <span style={{ color: '#B91C1C' }}>*</span>
                </label>
                <span style={{ fontSize: '0.8rem', color: content.length < 15 ? '#B91C1C' : 'var(--color-text-muted)' }}>
                  {content.length} caracteres (mínimo 15)
                </span>
              </div>
              <textarea
                id="obs-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describí los aspectos formativos observados, fortalezas, aspectos a reforzar, acuerdos pedagógicos o adecuaciones realizadas..."
                className="form-textarea"
                rows={4}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setContent('')}
                className="btn btn-secondary"
                disabled={!content}
              >
                Limpiar Texto
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || content.trim().length < 15}
              >
                Guardar Observación
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Historial de Observaciones Registradas */}
      <section aria-labelledby="section-observations-history">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h2 id="section-observations-history" style={{ fontSize: '1.2rem', margin: 0, color: 'var(--isf-blue-primary)' }}>
              Historial de Observaciones Cargadas ({observations.length})
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Consultá las anotaciones cualitativas asentadas para el seguimiento de tus estudiantes.
            </p>
          </div>
        </div>

        {/* Filtros del Historial */}
        <div
          className="card"
          style={{
            padding: '1rem 1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', flex: 1, minWidth: '240px', position: 'relative' }}>
            <label htmlFor="search-observation" className="sr-only">
              Buscar en observaciones
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search
                size={18}
                color="var(--color-text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                aria-hidden="true"
              />
              <input
                id="search-observation"
                type="search"
                placeholder="Buscar por estudiante, contenido o categoría..."
                value={filterSearchQuery}
                onChange={(e) => setFilterSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} color="var(--color-text-muted)" aria-hidden="true" />
            <label htmlFor="filter-obs-commission" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--isf-blue-primary)' }}>
              Comisión:
            </label>
            <select
              id="filter-obs-commission"
              value={filterCommissionId}
              onChange={(e) => setFilterCommissionId(e.target.value)}
              className="form-select"
              style={{ width: 'auto', minWidth: '180px' }}
            >
              <option value="TODAS">Todas las comisiones</option>
              {commissions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Listado de Tarjetas de Observaciones */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            Cargando observaciones...
          </div>
        ) : observations.length === 0 ? (
          <EmptyState
            title="No se registran observaciones"
            description="No existen observaciones académicas que coincidan con la búsqueda o la comisión seleccionada."
            action={{
              label: 'Restablecer filtros',
              onClick: () => {
                setFilterSearchQuery('');
                setFilterCommissionId('TODAS');
              },
            }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {observations.map((obs) => (
              <article
                key={obs.id}
                className="card"
                style={{
                  padding: '1.25rem 1.5rem',
                  borderLeft: '4px solid var(--isf-gold-sand)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <User size={16} color="var(--isf-blue-primary)" aria-hidden="true" />
                      <strong style={{ fontSize: '1.05rem', color: 'var(--isf-blue-primary)' }}>
                        {obs.studentName}
                      </strong>
                      <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.78rem', color: 'var(--color-text-muted)', backgroundColor: '#F1F5F9', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        {obs.studentLegajo}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                      {obs.commissionName}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--isf-gold-light)',
                      color: 'var(--isf-gold-text)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--isf-gold-border)',
                    }}
                  >
                    {obs.category}
                  </span>
                </div>

                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-primary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {obs.content}
                </p>

                {/* Diferenciación explícita de Fechas: Pedagógica vs. Registro */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1.5rem',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)',
                    borderTop: '1px solid var(--color-border-light)',
                    paddingTop: '0.625rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} color="var(--isf-blue-sky)" aria-hidden="true" />
                    <span>
                      <strong>Fecha del hecho pedagógico:</strong> {obs.pedagogicalDate}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={14} color="var(--isf-blue-sky)" aria-hidden="true" />
                    <span>
                      <strong>Registrado en el SGA:</strong> {obs.createdAt}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Modal de Confirmación Previa para Observación */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="Confirmar Registro de Observación"
        description={`¿Deseás guardar esta observación pedagógica para el estudiante ${selectedStudentObj?.lastName}, ${selectedStudentObj?.firstName}?`}
        confirmLabel="Guardar Observación"
        cancelLabel="Revisar"
        onConfirm={handleConfirmSubmit}
        onCancel={() => setIsConfirmModalOpen(false)}
      >
        <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', fontSize: '0.875rem' }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            <strong>Fecha pedagógica indicada:</strong> {pedagogicalDate}
          </p>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            <strong>Dimensión:</strong> {category}
          </p>
          <div style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)', borderLeft: '3px solid var(--isf-gold-ochre)', paddingLeft: '0.5rem', margin: '0.5rem 0 0' }}>
            "{content}"
          </div>
        </div>
      </ConfirmModal>
    </div>
  );
};
