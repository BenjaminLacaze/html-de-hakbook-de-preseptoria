import React, { useState, useEffect, useMemo } from 'react';
import type { Commission, Student, ClassSession, AttendanceStatus, ActiveScreen } from '../types';
import { academicService } from '../services/academicService';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { AlertNotification } from '../components/common/AlertNotification';
import { EmptyState } from '../components/common/EmptyState';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Save,
  ArrowLeft,
} from 'lucide-react';

interface AttendanceViewProps {
  commissions: Commission[];
  initialCommissionId?: string;
  onNavigate: (screen: ActiveScreen, context?: { commissionId?: string }) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  commissions,
  initialCommissionId,
  onNavigate,
}) => {
  const [selectedCommissionId, setSelectedCommissionId] = useState<string>(
    initialCommissionId || (commissions.length > 0 ? commissions[0].id : '')
  );

  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [classTopic, setClassTopic] = useState<string>('Clase teórico-práctica regular');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

  // Estados de asistencia por estudiante: Record<studentId, AttendanceStatus | null>
  // Inicialmente null para cumplir la regla estricta: NO marcar a todos como presentes por defecto
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus | null>>({});

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  useEffect(() => {
    if (initialCommissionId) {
      setSelectedCommissionId(initialCommissionId);
    }
  }, [initialCommissionId]);

  // Cargar estudiantes y sesiones cuando cambia la comisión
  useEffect(() => {
    const loadCommissionData = async () => {
      if (!selectedCommissionId) return;
      setIsLoading(true);
      setValidationError(null);
      setSuccessMessage(null);

      try {
        const [studentList, sessionList] = await Promise.all([
          academicService.getStudentsByCommission(selectedCommissionId, { sortBy: 'name', sortOrder: 'asc' }),
          academicService.getClassSessions(selectedCommissionId),
        ]);

        setStudents(studentList);
        setSessions(sessionList);

        // Si hay una sesión existente para la fecha seleccionada, cargarla
        const match = sessionList.find((s) => s.date === date);
        if (match) {
          setSelectedSessionId(match.id);
          setClassTopic(match.topic || '');
          const existingRecords = await academicService.getAttendanceBySession(match.id);
          const initialMap: Record<string, AttendanceStatus | null> = {};
          studentList.forEach((st) => {
            const rec = existingRecords.find((r) => r.studentId === st.id);
            initialMap[st.id] = rec ? rec.status : null;
          });
          setAttendanceMap(initialMap);
        } else {
          setSelectedSessionId('');
          // Inicializar vacío (sin selección automática)
          const emptyMap: Record<string, AttendanceStatus | null> = {};
          studentList.forEach((st) => {
            emptyMap[st.id] = null;
          });
          setAttendanceMap(emptyMap);
        }
      } catch (err) {
        console.error('Error al inicializar asistencia:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCommissionData();
  }, [selectedCommissionId, date]);

  // Manejo de cambio de sesión desde el selector de sesiones históricas
  const handleSessionChange = async (sessionId: string) => {
    if (!sessionId) {
      setSelectedSessionId('');
      const emptyMap: Record<string, AttendanceStatus | null> = {};
      students.forEach((st) => {
        emptyMap[st.id] = null;
      });
      setAttendanceMap(emptyMap);
      return;
    }

    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setSelectedSessionId(session.id);
      setDate(session.date);
      setClassTopic(session.topic || '');
      const existingRecords = await academicService.getAttendanceBySession(session.id);
      const initialMap: Record<string, AttendanceStatus | null> = {};
      students.forEach((st) => {
        const rec = existingRecords.find((r) => r.studentId === st.id);
        initialMap[st.id] = rec ? rec.status : null;
      });
      setAttendanceMap(initialMap);
      setValidationError(null);
    }
  };

  const currentCommission = useMemo(() => {
    return commissions.find((c) => c.id === selectedCommissionId);
  }, [commissions, selectedCommissionId]);

  // Conteos en vivo
  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let unassigned = 0;

    students.forEach((s) => {
      const status = attendanceMap[s.id];
      if (status === 'PRESENTE') present++;
      else if (status === 'AUSENTE') absent++;
      else if (status === 'TARDE') late++;
      else unassigned++;
    });

    return {
      total: students.length,
      present,
      absent,
      late,
      unassigned,
      isComplete: unassigned === 0 && students.length > 0,
    };
  }, [students, attendanceMap]);

  // Cambiar estado individual de un estudiante
  const handleSetStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
    setValidationError(null);
  };

  // Acción rápida: Marcar todos como presentes (con aviso explicito)
  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus | null> = {};
    students.forEach((s) => {
      updated[s.id] = 'PRESENTE';
    });
    setAttendanceMap(updated);
    setValidationError(null);
  };

  // Limpiar todos los estados
  const handleClearAll = () => {
    const emptyMap: Record<string, AttendanceStatus | null> = {};
    students.forEach((st) => {
      emptyMap[st.id] = null;
    });
    setAttendanceMap(emptyMap);
    setIsResetConfirmOpen(false);
  };

  // Validar y abrir modal de confirmación
  const handleInitiateSave = () => {
    setValidationError(null);

    if (students.length === 0) {
      setValidationError('No hay estudiantes en la comisión para registrar asistencia.');
      return;
    }

    if (!summary.isComplete) {
      setValidationError(
        `Atención: Existen ${summary.unassigned} estudiantes sin estado de asistencia asignado. Debe indicar PRESENTE, AUSENTE o TARDE para cada estudiante antes de confirmar.`
      );
      return;
    }

    setIsConfirmModalOpen(true);
  };

  // Confirmar y guardar en el servicio
  const handleConfirmSave = async () => {
    try {
      setIsConfirmModalOpen(false);
      setIsLoading(true);

      // Crear o asegurar sesión de clase
      const session = await academicService.createOrOpenClassSession(
        selectedCommissionId,
        date,
        classTopic
      );

      // Preparar registros
      const recordsToSave = students.map((s) => ({
        studentId: s.id,
        status: attendanceMap[s.id] as AttendanceStatus,
      }));

      const teacher = await academicService.getCurrentTeacher();
      const res = await academicService.saveAttendance(session.id, recordsToSave, teacher.id);

      // Actualizar lista de sesiones
      const updatedSessions = await academicService.getClassSessions(selectedCommissionId);
      setSessions(updatedSessions);
      setSelectedSessionId(session.id);

      setSuccessMessage(res.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error al guardar asistencia:', err);
      setValidationError('Ocurrió un error inesperado al registrar la asistencia simulada.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Encabezado y navegación */}
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
            <ClipboardCheck size={24} color="var(--isf-blue-primary)" aria-hidden="true" />
            <h1 style={{ margin: 0 }}>Toma de Asistencia</h1>
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0' }}>
            Registrá la asistencia de cada estudiante para la clase seleccionada (Presente, Ausente o Tarde).
          </p>
        </div>
      </div>

      {/* Notificaciones de éxito o error */}
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

      {/* Paso 1: Configuración de la Instancia de Clase (Comisión, Fecha, Tema) */}
      <section aria-labelledby="section-session-setup" className="card" style={{ padding: '1.5rem' }}>
        <h2 id="section-session-setup" style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--isf-blue-primary)' }}>
          1. Selección de Comisión y Fecha de Clase
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* Selector de Comisión */}
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="attendance-commission" className="form-label">
              Comisión y Materia:
            </label>
            <select
              id="attendance-commission"
              value={selectedCommissionId}
              onChange={(e) => setSelectedCommissionId(e.target.value)}
              className="form-select"
            >
              {commissions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.subjectName}
                </option>
              ))}
            </select>
            {currentCommission && (
              <span className="form-hint">
                {currentCommission.careerName} • Turno {currentCommission.shift}
              </span>
            )}
          </div>

          {/* Selector de Fecha */}
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="attendance-date" className="form-label">
              Fecha de la Clase:
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="attendance-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
              />
            </div>
            <span className="form-hint">Fecha en la que se dictó la clase presencial</span>
          </div>

          {/* Clases Históricas Existentes */}
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="attendance-session-select" className="form-label">
              Clases registradas de esta comisión:
            </label>
            <select
              id="attendance-session-select"
              value={selectedSessionId}
              onChange={(e) => handleSessionChange(e.target.value)}
              className="form-select"
            >
              <option value="">-- Nueva clase / Fecha personalizada --</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.date} — {s.topic ? s.topic.slice(0, 35) + '...' : 'Clase regular'} ({s.isClosed ? 'Registrada' : 'Pendiente'})
                </option>
              ))}
            </select>
            <span className="form-hint">Permite revisar o actualizar una clase previa</span>
          </div>
        </div>

        {/* Tema / Observación de la clase */}
        <div style={{ marginTop: '1.25rem' }}>
          <label htmlFor="attendance-topic" className="form-label">
            Tema o Contenido Desarrollado:
          </label>
          <input
            id="attendance-topic"
            type="text"
            value={classTopic}
            onChange={(e) => setClassTopic(e.target.value)}
            placeholder="Ej: Análisis de prácticas pedagógicas y dinámicas de grupo..."
            className="form-input"
          />
        </div>
      </section>

      {/* Paso 2: Resumen en Vivo de Asistencias y Acciones Masivas */}
      <section aria-labelledby="section-attendance-summary" className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h2 id="section-attendance-summary" style={{ fontSize: '1.1rem', margin: 0, color: 'var(--isf-blue-primary)' }}>
              2. Resumen de Estados ({summary.total} estudiantes)
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
              La selección inicial es explícita. Cada estudiante debe tener un estado antes de guardar.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="btn btn-secondary btn-sm"
              title="Marcar todos los estudiantes como Presentes de forma rápida"
            >
              <CheckCircle2 size={16} color="var(--status-present-badge)" aria-hidden="true" />
              <span>Marcar todos Presentes</span>
            </button>
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="btn btn-secondary btn-sm"
              title="Reiniciar todos los estados a sin asignar"
            >
              <RotateCcw size={16} aria-hidden="true" />
              <span>Limpiar estados</span>
            </button>
          </div>
        </div>

        {/* Contadores accesibles con contraste y forma */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {/* Presentes */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--status-present-bg)',
              border: '1px solid var(--status-present-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--status-present-text)', textTransform: 'uppercase' }}>
                Presentes
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-present-text)' }}>
                {summary.present}
              </div>
            </div>
            <CheckCircle2 size={24} color="var(--status-present-badge)" aria-hidden="true" />
          </div>

          {/* Ausentes */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--status-absent-bg)',
              border: '1px solid var(--status-absent-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--status-absent-text)', textTransform: 'uppercase' }}>
                Ausentes
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-absent-text)' }}>
                {summary.absent}
              </div>
            </div>
            <XCircle size={24} color="var(--status-absent-badge)" aria-hidden="true" />
          </div>

          {/* Tarde */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--status-late-bg)',
              border: '1px solid var(--status-late-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--status-late-text)', textTransform: 'uppercase' }}>
                Tarde
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-late-text)' }}>
                {summary.late}
              </div>
            </div>
            <Clock size={24} color="var(--status-late-badge)" aria-hidden="true" />
          </div>

          {/* Sin Asignar */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: summary.unassigned > 0 ? '#FEE2E2' : 'var(--status-unassigned-bg)',
              border: summary.unassigned > 0 ? '1px solid #F87171' : '1px solid var(--status-unassigned-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: summary.unassigned > 0 ? '#991B1B' : 'var(--status-unassigned-text)',
                  textTransform: 'uppercase',
                }}
              >
                Sin Registrar
              </div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: summary.unassigned > 0 ? '#991B1B' : 'var(--status-unassigned-text)',
                }}
              >
                {summary.unassigned}
              </div>
            </div>
            <HelpCircle
              size={24}
              color={summary.unassigned > 0 ? '#DC2626' : 'var(--status-unassigned-text)'}
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      {/* Paso 3: Listado de Estudiantes y Botones de Asignación de Estado */}
      <section aria-labelledby="section-student-attendance-list">
        <h2 id="section-student-attendance-list" className="sr-only">
          Nómina de estudiantes para registrar asistencia
        </h2>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            Cargando estudiantes...
          </div>
        ) : students.length === 0 ? (
          <EmptyState
            title="Sin estudiantes"
            description="La comisión seleccionada no registra estudiantes matriculados."
          />
        ) : (
          <div className="table-container">
            <table aria-label="Asignación de asistencia de estudiantes">
              <caption>
                Clase del {date} — {currentCommission?.name} ({currentCommission?.subjectName})
              </caption>
              <thead>
                <tr>
                  <th scope="col" style={{ width: '50px', textAlign: 'center' }}>#</th>
                  <th scope="col">Estudiante</th>
                  <th scope="col">Legajo</th>
                  <th scope="col" style={{ textAlign: 'center' }}>Estado Actual</th>
                  <th scope="col" style={{ textAlign: 'center', width: '320px' }}>
                    Selección de Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  const currentStatus = attendanceMap[student.id];
                  const isUnassigned = currentStatus === null || currentStatus === undefined;

                  return (
                    <tr
                      key={student.id}
                      style={{
                        backgroundColor: isUnassigned ? 'rgba(254, 242, 242, 0.4)' : undefined,
                      }}
                    >
                      <td style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        {idx + 1}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--color-text-primary)' }}>
                          {student.lastName}, {student.firstName}
                        </strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          DNI: {student.dni}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.85rem', color: 'var(--isf-blue-primary)' }}>
                        {student.legajo}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {isUnassigned ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#B91C1C',
                              backgroundColor: '#FEF2F2',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              border: '1px solid #FCA5A5',
                            }}
                          >
                            <AlertTriangle size={12} aria-hidden="true" />
                            <span>Pendiente</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor:
                                currentStatus === 'PRESENTE'
                                  ? 'var(--status-present-bg)'
                                  : currentStatus === 'AUSENTE'
                                  ? 'var(--status-absent-bg)'
                                  : 'var(--status-late-bg)',
                              color:
                                currentStatus === 'PRESENTE'
                                  ? 'var(--status-present-text)'
                                  : currentStatus === 'AUSENTE'
                                  ? 'var(--status-absent-text)'
                                  : 'var(--status-late-text)',
                              border: `1px solid ${
                                currentStatus === 'PRESENTE'
                                  ? 'var(--status-present-border)'
                                  : currentStatus === 'AUSENTE'
                                  ? 'var(--status-absent-border)'
                                  : 'var(--status-late-border)'
                              }`,
                            }}
                          >
                            {currentStatus}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div
                          role="group"
                          aria-label={`Asistencia de ${student.lastName}, ${student.firstName}`}
                          style={{
                            display: 'inline-flex',
                            gap: '0.35rem',
                            backgroundColor: '#F1F5F9',
                            padding: '0.25rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border-light)',
                          }}
                        >
                          {/* Botón PRESENTE */}
                          <button
                            type="button"
                            onClick={() => handleSetStudentStatus(student.id, 'PRESENTE')}
                            aria-pressed={currentStatus === 'PRESENTE'}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.35rem 0.65rem',
                              borderRadius: 'var(--radius-sm)',
                              border: currentStatus === 'PRESENTE' ? '2px solid var(--status-present-border)' : '1px solid transparent',
                              backgroundColor: currentStatus === 'PRESENTE' ? 'var(--status-present-bg)' : '#FFFFFF',
                              color: currentStatus === 'PRESENTE' ? 'var(--status-present-text)' : 'var(--color-text-secondary)',
                              fontWeight: currentStatus === 'PRESENTE' ? 700 : 500,
                              fontSize: '0.8125rem',
                              cursor: 'pointer',
                              minHeight: '36px',
                            }}
                          >
                            <CheckCircle2 size={14} color="var(--status-present-badge)" aria-hidden="true" />
                            <span>Presente</span>
                          </button>

                          {/* Botón AUSENTE */}
                          <button
                            type="button"
                            onClick={() => handleSetStudentStatus(student.id, 'AUSENTE')}
                            aria-pressed={currentStatus === 'AUSENTE'}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.35rem 0.65rem',
                              borderRadius: 'var(--radius-sm)',
                              border: currentStatus === 'AUSENTE' ? '2px solid var(--status-absent-border)' : '1px solid transparent',
                              backgroundColor: currentStatus === 'AUSENTE' ? 'var(--status-absent-bg)' : '#FFFFFF',
                              color: currentStatus === 'AUSENTE' ? 'var(--status-absent-text)' : 'var(--color-text-secondary)',
                              fontWeight: currentStatus === 'AUSENTE' ? 700 : 500,
                              fontSize: '0.8125rem',
                              cursor: 'pointer',
                              minHeight: '36px',
                            }}
                          >
                            <XCircle size={14} color="var(--status-absent-badge)" aria-hidden="true" />
                            <span>Ausente</span>
                          </button>

                          {/* Botón TARDE */}
                          <button
                            type="button"
                            onClick={() => handleSetStudentStatus(student.id, 'TARDE')}
                            aria-pressed={currentStatus === 'TARDE'}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.35rem 0.65rem',
                              borderRadius: 'var(--radius-sm)',
                              border: currentStatus === 'TARDE' ? '2px solid var(--status-late-border)' : '1px solid transparent',
                              backgroundColor: currentStatus === 'TARDE' ? 'var(--status-late-bg)' : '#FFFFFF',
                              color: currentStatus === 'TARDE' ? 'var(--status-late-text)' : 'var(--color-text-secondary)',
                              fontWeight: currentStatus === 'TARDE' ? 700 : 500,
                              fontSize: '0.8125rem',
                              cursor: 'pointer',
                              minHeight: '36px',
                            }}
                          >
                            <Clock size={14} color="var(--status-late-badge)" aria-hidden="true" />
                            <span>Tarde</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Botón de Confirmación Principal */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          position: 'sticky',
          bottom: '1rem',
          boxShadow: 'var(--shadow-lg)',
          backgroundColor: '#FFFFFF',
          border: '2px solid var(--isf-blue-primary)',
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: summary.isComplete ? '#ECFDF5' : '#FEF2F2',
              color: summary.isComplete ? '#047857' : '#B91C1C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {summary.isComplete ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--isf-blue-primary)', fontSize: '0.95rem' }}>
              {summary.isComplete
                ? 'Todos los estudiantes tienen estado asignado'
                : `Faltan ${summary.unassigned} estudiantes por calificar asistencia`}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Comisión {currentCommission?.name} • Fecha: {date}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleInitiateSave}
          disabled={!summary.isComplete || isLoading}
          className="btn btn-primary"
          style={{ minWidth: '220px' }}
        >
          <Save size={18} aria-hidden="true" />
          <span>Confirmar Asistencia</span>
        </button>
      </div>

      {/* Modal de Confirmación Previa antes de Guardar */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="Confirmación de Asistencia de Clase"
        description={`¿Deseás registrar la asistencia de la clase del ${date} para la comisión ${currentCommission?.name} (${currentCommission?.subjectName})?`}
        confirmLabel="Guardar Registro Demostrativo"
        cancelLabel="Revisar"
        onConfirm={handleConfirmSave}
        onCancel={() => setIsConfirmModalOpen(false)}
      >
        <div
          style={{
            backgroundColor: '#F8FAFC',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-light)',
            fontSize: '0.875rem',
          }}
        >
          <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--isf-blue-primary)' }}>
            Resumen que será registrado:
          </h3>
          <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <li>
              <strong>Total de estudiantes procesados:</strong> {summary.total}
            </li>
            <li>
              <strong>Presentes:</strong> {summary.present}
            </li>
            <li>
              <strong>Ausentes:</strong> {summary.absent}
            </li>
            <li>
              <strong>Tardes:</strong> {summary.late}
            </li>
            <li>
              <strong>Tema registrado:</strong> {classTopic || 'Sin tema detallado'}
            </li>
          </ul>

          <div
            style={{
              marginTop: '0.75rem',
              padding: '0.5rem 0.75rem',
              backgroundColor: 'var(--isf-gold-light)',
              borderRadius: '4px',
              border: '1px solid var(--isf-gold-border)',
              fontSize: '0.78rem',
              color: '#554215',
            }}
          >
            <strong>Aviso de Demostración:</strong> Esta acción actualizará los datos en el estado del navegador. No se enviará a una base de datos de producción oficial.
          </div>
        </div>
      </ConfirmModal>

      {/* Modal de Confirmación para Limpiar Estados */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="¿Deseás limpiar los estados asignados?"
        description="Esta acción restablecerá a todos los estudiantes de la lista como 'Sin Registrar' para que puedas volver a calificar desde cero."
        confirmLabel="Sí, limpiar estados"
        cancelLabel="Cancelar"
        isDestructive={true}
        onConfirm={handleClearAll}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
