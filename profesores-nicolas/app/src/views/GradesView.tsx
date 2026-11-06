import React, { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { apiFetch } from '@shared/api';
import type { Commission, Student } from '../types';
import { academicService } from '../services/academicService';
import { AlertNotification } from '../components/common/AlertNotification';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  GraduationCap,
  Award,
  CheckCircle,
  AlertTriangle,
  Send,
  RefreshCw,
  Edit3,
  FileSpreadsheet,
  Layers
} from 'lucide-react';

interface GradesViewProps {
  commissions: Commission[];
}

export type EvaluationKey = 'PARCIAL_1' | 'PARCIAL_2' | 'RECUPERATORIO_1' | 'RECUPERATORIO_2' | 'FINAL';

const EVALUATION_LABELS: Record<EvaluationKey, string> = {
  PARCIAL_1: '1° Examen Parcial',
  PARCIAL_2: '2° Examen Parcial',
  RECUPERATORIO_1: 'Recuperatorio 1° Parcial',
  RECUPERATORIO_2: 'Recuperatorio 2° Parcial',
  FINAL: 'Examen Final / Acreditación'
};

interface GradeRecord {
  id: string;
  commissionId: string;
  studentId: string;
  type: EvaluationKey;
  instance: number;
  date: string;
  value: number | null;
  absent: boolean;
  published: boolean;
  publishedAt?: string;
  notes?: string;
}

export function GradesView({ commissions }: GradesViewProps) {
  const [commissionId, setCommissionId] = useState<string>(commissions[0]?.id ?? '');
  const [activeTab, setActiveTab] = useState<'matrix' | 'form'>('matrix');
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);

  // Estado del formulario de edición / carga
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [evalType, setEvalType] = useState<EvaluationKey>('PARCIAL_1');
  const [instance, setInstance] = useState<number>(1);
  const [evalDate, setEvalDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [evalValue, setEvalValue] = useState<string>('');
  const [isAbsent, setIsAbsent] = useState<boolean>(false);
  const [evalNotes, setEvalNotes] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmPublish, setConfirmPublish] = useState<boolean>(false);

  const loadGradesData = async () => {
    if (!commissionId) return;
    try {
      setLoading(true);
      setError(null);
      const [people, gradeList] = await Promise.all([
        academicService.getStudentsByCommission(commissionId),
        apiFetch<GradeRecord[]>('/grades', { query: { commissionId } }).catch(async () => {
          // Fallback a /records/grades si el backend compartido está activo
          return apiFetch<GradeRecord[]>('/records/grades', { query: { commissionId } });
        })
      ]);
      setStudents(people);
      setGrades(gradeList || []);
      if (people.length > 0 && !selectedStudentId) {
        setSelectedStudentId(people[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las calificaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGradesData();
  }, [commissionId]);

  // Actualizar valores del formulario cuando cambia el estudiante o tipo seleccionado
  useEffect(() => {
    const found = grades.find(
      g => g.studentId === selectedStudentId && g.type === evalType && g.instance === instance
    );
    if (found) {
      setEvalValue(found.value !== null ? String(found.value) : '');
      setIsAbsent(found.absent);
      setEvalNotes(found.notes || '');
      setEvalDate(found.date || new Date().toISOString().slice(0, 10));
    } else {
      setEvalValue('');
      setIsAbsent(false);
      setEvalNotes('');
      setEvalDate(new Date().toISOString().slice(0, 10));
    }
  }, [selectedStudentId, evalType, instance, grades]);

  const handleSaveGrade = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !commissionId) return;

    setBusy(true);
    setError(null);
    setMessage(null);

    const numValue = isAbsent || evalValue === '' ? null : Number(evalValue);
    if (!isAbsent && numValue !== null && (numValue < 1 || numValue > 10)) {
      setError('La calificación debe estar entre 1 y 10.');
      setBusy(false);
      return;
    }

    try {
      const payload = {
        studentId: selectedStudentId,
        commissionId,
        type: evalType,
        instance,
        date: evalDate,
        value: numValue,
        absent: isAbsent,
        notes: evalNotes
      };

      await academicService.saveGrade(payload);
      setMessage(`Nota de ${EVALUATION_LABELS[evalType]} guardada exitosamente.`);
      await loadGradesData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la calificación.');
    } finally {
      setBusy(false);
    }
  };

  const handlePublishAll = async () => {
    setConfirmPublish(false);
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const res = await academicService.publishGrades(commissionId, evalType, instance);
      setMessage(`Se publicaron las notas de ${EVALUATION_LABELS[evalType]} para toda la comisión (${res.published} registros actualizados).`);
      await loadGradesData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron publicar las notas.');
    } finally {
      setBusy(false);
    }
  };

  const openFormForStudent = (studentId: string, type: EvaluationKey) => {
    setSelectedStudentId(studentId);
    setEvalType(type);
    setActiveTab('form');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--isf-blue-primary)', margin: 0 }}>
            Calificaciones: Parciales y Finales
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Registro integral de 1.° y 2.° parcial, instancias de recuperatorio, cálculo de promedios, condición de cursada y acreditación final.
          </p>
        </div>
        <button
          className="btn btn-secondary"
          disabled={busy || loading}
          onClick={() => void loadGradesData()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} />
          Actualizar Notas
        </button>
      </div>

      {error && <AlertNotification type="error" message={error} onClose={() => setError(null)} />}
      {message && <AlertNotification type="success" message={message} onClose={() => setMessage(null)} />}

      {/* Selector de Comisión y Pestañas */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 300px' }}>
            <label htmlFor="comm-select" style={{ fontWeight: 700, color: 'var(--isf-blue-primary)', whiteSpace: 'nowrap' }}>
              Cátedra / Comisión:
            </label>
            <select
              id="comm-select"
              className="form-select"
              value={commissionId}
              disabled={busy}
              onChange={e => { setCommissionId(e.target.value); setMessage(null); }}
            >
              {commissions.map(c => (
                <option key={c.id} value={c.id}>{c.code} — {c.subjectName} ({c.shift})</option>
              ))}
            </select>
          </div>

          {/* Navegación por Pestañas */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`btn ${activeTab === 'matrix' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('matrix')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FileSpreadsheet size={16} />
              Planilla General de Cursada
            </button>
            <button
              className={`btn ${activeTab === 'form' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('form')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Edit3 size={16} />
              Cargar / Corregir Evaluación
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>
          Cargando sábana de calificaciones...
        </div>
      ) : activeTab === 'matrix' ? (
        /* PESTAÑA 1: PLANILLA COMPLETA DE PARCIALES, RECUPERATORIOS Y FINALES */
        <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--isf-blue-primary)', margin: 0 }}>
              Sábana Académica: {commissions.find(c => c.id === commissionId)?.subjectName}
            </h2>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#059669', fontWeight: 600 }}>
                ● Promoción ($\ge$ 7)
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#2563EB', fontWeight: 600 }}>
                ● Regular ($\ge$ 4)
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#DC2626', fontWeight: 600 }}>
                ● Desaprobado (&lt; 4)
              </span>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: 'var(--isf-blue-primary)' }}>
                <th style={{ padding: '0.75rem' }}>Estudiante</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>1° Parcial</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>2° Parcial</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Recup. 1 / 2</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Promedio</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Condición Cursada</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Mesa Final</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>
                    No hay estudiantes matriculados en esta comisión.
                  </td>
                </tr>
              ) : (
                students.map(st => {
                  const p1 = grades.find(g => g.studentId === st.id && g.type === 'PARCIAL_1');
                  const p2 = grades.find(g => g.studentId === st.id && g.type === 'PARCIAL_2');
                  const r1 = grades.find(g => g.studentId === st.id && g.type === 'RECUPERATORIO_1');
                  const r2 = grades.find(g => g.studentId === st.id && g.type === 'RECUPERATORIO_2');
                  const fn = grades.find(g => g.studentId === st.id && g.type === 'FINAL');

                  // Nota efectiva
                  const n1 = (r1 && r1.value !== null) ? r1.value : (p1?.value ?? null);
                  const n2 = (r2 && r2.value !== null) ? r2.value : (p2?.value ?? null);

                  let avg: number | null = null;
                  let cond: 'PROMOCIONADO' | 'REGULAR' | 'LIBRE' | 'CURSANDO' = 'CURSANDO';

                  if (n1 !== null && n2 !== null) {
                    avg = Number(((n1 + n2) / 2).toFixed(1));
                    if (n1 >= 7 && n2 >= 7 && !p1?.absent && !p2?.absent) {
                      cond = 'PROMOCIONADO';
                    } else if (n1 >= 4 && n2 >= 4) {
                      cond = 'REGULAR';
                    } else {
                      cond = 'LIBRE';
                    }
                  } else if ((p1?.absent && !r1) || (p2?.absent && !r2)) {
                    cond = 'LIBRE';
                  }

                  const badgeCondStyle = {
                    PROMOCIONADO: { bg: 'rgba(16, 185, 129, 0.1)', text: '#059669', border: '#A7F3D0' },
                    REGULAR: { bg: 'rgba(59, 130, 246, 0.1)', text: '#2563EB', border: '#BFDBFE' },
                    LIBRE: { bg: 'rgba(239, 68, 68, 0.1)', text: '#DC2626', border: '#FECACA' },
                    CURSANDO: { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' }
                  }[cond];

                  return (
                    <tr key={st.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--isf-blue-primary)' }}>
                          {st.lastName}, {st.firstName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          Legajo: {st.legajo} | DNI: {st.dni}
                        </div>
                      </td>

                      {/* 1° Parcial */}
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        {p1 ? (
                          <span style={{ fontWeight: 700, color: p1.absent ? '#9CA3AF' : (p1.value! >= 7 ? '#059669' : p1.value! >= 4 ? '#2563EB' : '#DC2626') }}>
                            {p1.absent ? 'Ausente' : p1.value}
                          </span>
                        ) : (
                          <span style={{ color: '#CBD5E1' }}>—</span>
                        )}
                      </td>

                      {/* 2° Parcial */}
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        {p2 ? (
                          <span style={{ fontWeight: 700, color: p2.absent ? '#9CA3AF' : (p2.value! >= 7 ? '#059669' : p2.value! >= 4 ? '#2563EB' : '#DC2626') }}>
                            {p2.absent ? 'Ausente' : p2.value}
                          </span>
                        ) : (
                          <span style={{ color: '#CBD5E1' }}>—</span>
                        )}
                      </td>

                      {/* Recuperatorios */}
                      <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.85rem' }}>
                        {r1 || r2 ? (
                          <div>
                            {r1 && <div>R1: <strong>{r1.value}</strong></div>}
                            {r2 && <div>R2: <strong>{r2.value}</strong></div>}
                          </div>
                        ) : (
                          <span style={{ color: '#CBD5E1' }}>—</span>
                        )}
                      </td>

                      {/* Promedio */}
                      <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 800 }}>
                        {avg !== null ? avg : '—'}
                      </td>

                      {/* Condición */}
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: badgeCondStyle.bg,
                            color: badgeCondStyle.text,
                            border: `1px solid ${badgeCondStyle.border}`
                          }}
                        >
                          {cond}
                        </span>
                      </td>

                      {/* Mesa Final */}
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        {fn ? (
                          <span style={{ fontWeight: 700, color: '#89743A', backgroundColor: 'rgba(137, 116, 58, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                            {fn.value !== null ? fn.value : 'Aus.'}
                          </span>
                        ) : (
                          <span style={{ color: '#CBD5E1' }}>—</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => openFormForStudent(st.id, 'PARCIAL_1')}
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        >
                          Calificar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* PESTAÑA 2: CARGA INDIVIDUAL Y PUBLICACIÓN POR EVALUACIÓN */
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 420px) 1fr', gap: '1.5rem' }}>
          {/* Formulario de Carga */}
          <form className="card" style={{ padding: '1.5rem' }} onSubmit={handleSaveGrade}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--isf-blue-primary)', margin: '0 0 1rem' }}>
              Registrar o Corregir Calificación
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="grade-student">Estudiante *</label>
                <select
                  id="grade-student"
                  className="form-select"
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  required
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.lastName}, {s.firstName} ({s.legajo})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="grade-eval-type">Instancia de Evaluación *</label>
                <select
                  id="grade-eval-type"
                  className="form-select"
                  value={evalType}
                  onChange={e => setEvalType(e.target.value as EvaluationKey)}
                >
                  <option value="PARCIAL_1">1° Examen Parcial</option>
                  <option value="PARCIAL_2">2° Examen Parcial</option>
                  <option value="RECUPERATORIO_1">Recuperatorio 1° Parcial</option>
                  <option value="RECUPERATORIO_2">Recuperatorio 2° Parcial</option>
                  <option value="FINAL">Examen Final / Acreditación en Mesa</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="grade-date">Fecha de Examen</label>
                  <input
                    id="grade-date"
                    className="form-input"
                    type="date"
                    required
                    value={evalDate}
                    onChange={e => setEvalDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="grade-val">Nota (1 a 10)</label>
                  <input
                    id="grade-val"
                    className="form-input"
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    disabled={isAbsent}
                    required={!isAbsent}
                    placeholder="Ej. 8.5"
                    value={evalValue}
                    onChange={e => setEvalValue(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0' }}>
                <input
                  id="grade-absent"
                  type="checkbox"
                  checked={isAbsent}
                  onChange={e => {
                    setIsAbsent(e.target.checked);
                    if (e.target.checked) setEvalValue('');
                  }}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="grade-absent" style={{ fontWeight: 600, color: '#4B5563', cursor: 'pointer' }}>
                  Ausente en la fecha de evaluación
                </label>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="grade-notes">Observaciones pedagógicas</label>
                <textarea
                  id="grade-notes"
                  className="form-textarea"
                  rows={3}
                  placeholder="Devolución cualitativa para el estudiante..."
                  value={evalNotes}
                  onChange={e => setEvalNotes(e.target.value)}
                />
              </div>

              <button
                className="btn btn-primary"
                type="submit"
                disabled={busy}
                style={{ marginTop: '0.5rem' }}
              >
                {busy ? 'Guardando...' : 'Guardar Calificación'}
              </button>
            </div>
          </form>

          {/* Listado de Notas para la Evaluación y Botón de Publicación */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--isf-blue-primary)' }}>
                  Notas de: {EVALUATION_LABELS[evalType]}
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  Instancia {instance}
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B' }}>
                      <th style={{ padding: '0.5rem' }}>Estudiante</th>
                      <th style={{ padding: '0.5rem' }}>Fecha</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Nota</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => {
                      const g = grades.find(
                        x => x.studentId === s.id && x.type === evalType && x.instance === instance
                      );
                      return (
                        <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '0.5rem' }}>{s.lastName}, {s.firstName}</td>
                          <td style={{ padding: '0.5rem', color: '#64748B' }}>{g?.date || '—'}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 700 }}>
                            {g ? (g.absent ? 'Ausente' : g.value) : <span style={{ color: '#CBD5E1' }}>Sin nota</span>}
                          </td>
                          <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                            {g?.published ? (
                              <span style={{ color: '#059669', fontWeight: 600, fontSize: '0.75rem' }}>● Publicada</span>
                            ) : g ? (
                              <span style={{ color: '#F59E0B', fontWeight: 600, fontSize: '0.75rem' }}>● Pendiente</span>
                            ) : (
                              <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                Al publicar, las notas se harán visibles inmediatamente en el portal de cada estudiante.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setConfirmPublish(true)}
                disabled={busy}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
              >
                <Send size={16} />
                Publicar Evaluación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para publicar */}
      <ConfirmModal
        isOpen={confirmPublish}
        title="Publicar Calificaciones de la Cátedra"
        description="Esta acción notificará y hará públicas las notas en los portales de los estudiantes."
        confirmLabel="Confirmar Publicación"
        onConfirm={handlePublishAll}
        onCancel={() => setConfirmPublish(false)}
      >
        <p>
          ¿Deseás publicar formalmente las notas de <strong>{EVALUATION_LABELS[evalType]}</strong> para la comisión seleccionada?
        </p>
      </ConfirmModal>
    </div>
  );
}
