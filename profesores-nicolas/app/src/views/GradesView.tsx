import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { apiFetch } from '@shared/api';
import { ASSESSMENT_TYPES, ASSESSMENT_TYPE_LABELS } from '@shared/types';
import type { AssessmentType, Enrollment, Grade, SaveGradeRequest } from '@shared/types';
import type { Commission, Student } from '../types';
import { academicService } from '../services/academicService';
import { AlertNotification } from '../components/common/AlertNotification';
import { ConfirmModal } from '../components/common/ConfirmModal';

export function GradesView({ commissions }: { commissions: Commission[] }) {
  const [commissionId, setCommissionId] = useState(commissions[0]?.id ?? '');
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [enrollmentId, setEnrollmentId] = useState('');
  const [type, setType] = useState<AssessmentType>('PARTIAL');
  const [instance, setInstance] = useState(1);
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [value, setValue] = useState('');
  const [absent, setAbsent] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [confirmPublish, setConfirmPublish] = useState(false);
  useEffect(() => {
    const refresh = () => setRevision(n => n + 1);
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);
  useEffect(() => {
    let active = true;
    setError(null); setLoading(true); setStudents([]); setEnrollments([]); setGrades([]);
    if (!commissionId) { setLoading(false); return; }
    Promise.all([
      academicService.getStudentsByCommission(commissionId),
      apiFetch<Enrollment[]>('/structure/enrollments', { query: { commissionId } }),
      apiFetch<Grade[]>('/records/grades', { query: { commissionId } }),
    ]).then(([people, rows, marks]) => {
      if (!active) return;
      setStudents(people); setEnrollments(rows); setGrades(marks);
      setEnrollmentId(previous => rows.some(e => e.id === previous && people.some(s => s.id === e.studentId)) ? previous : rows.find(e => people.some(s => s.id === e.studentId))?.id ?? '');
    }).catch(err => { if (active) setError(err instanceof Error ? err.message : 'No se pudieron cargar las notas.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [commissionId, revision]);
  useEffect(() => {
    const current = grades.find(g => g.enrollmentId === enrollmentId && g.type === type && g.instance === instance);
    setValue(current?.value == null ? '' : String(current.value)); setAbsent(current?.absent ?? false);
    setNotes(current?.notes ?? '');
    setDate(current?.date ?? new Date().toLocaleDateString('en-CA'));
  }, [grades, enrollmentId, type, instance]);
  const selectedGrades = grades.filter(g => g.type === type && g.instance === instance);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(null); setMessage(null);
    try {
      const body: SaveGradeRequest = { enrollmentId, type, instance, date, value: absent || value === '' ? null : Number(value), absent, notes };
      const saved = await apiFetch<Grade>('/records/grades', { method: 'PUT', body });
      setGrades(old => [...old.filter(g => g.id !== saved.id), saved]);
      setMessage(saved.published ? 'Corrección guardada. Esta nota ya está publicada y el alumno puede verla.' : 'Nota guardada. Para que el alumno la vea, publicá la evaluación.');
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo guardar la nota.'); }
    finally { setBusy(false); }
  }
  async function publish() {
    setConfirmPublish(false); setBusy(true); setError(null); setMessage(null);
    try {
      const result = await apiFetch<{ published: number }>('/records/grades/publish', { method: 'POST', body: { commissionId, type, instance } });
      setGrades(old => old.map(g => g.type === type && g.instance === instance ? { ...g, published: true } : g));
      setMessage(`Se publicaron ${result.published} notas. Los alumnos ya pueden consultarlas.`);
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudieron publicar las notas.'); }
    finally { setBusy(false); }
  }
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    <div><h1>Calificaciones</h1><p>Cargá las notas y publicá cada evaluación para que los alumnos puedan verla.</p></div>
    {error && <AlertNotification type="error" message={error} onClose={() => setError(null)} />}
    {message && <AlertNotification type="success" message={message} onClose={() => setMessage(null)} />}
    <section className="card" style={{ padding: '1.5rem' }} aria-label="Selección de evaluación">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem' }}>
        <label className="form-group">Comisión<select className="form-select" value={commissionId} disabled={busy} onChange={e => { setCommissionId(e.target.value); setMessage(null); }}><option value="" disabled>Seleccionar comisión</option>{commissions.map(c => <option key={c.id} value={c.id}>{c.code} — {c.subjectName}</option>)}</select></label>
        <label className="form-group">Tipo de evaluación<select className="form-select" value={type} disabled={busy} onChange={e => setType(e.target.value as AssessmentType)}>{ASSESSMENT_TYPES.map(t => <option key={t} value={t}>{ASSESSMENT_TYPE_LABELS[t]}</option>)}</select></label>
        <label className="form-group">Instancia (1 a 10)<input className="form-input" type="number" min={1} max={10} step={1} value={instance} disabled={busy} onChange={e => setInstance(Math.max(1, Math.min(10, Number(e.target.value) || 1)))} /></label>
      </div>
      <button className="btn btn-secondary" disabled={busy || loading} onClick={() => setRevision(n => n + 1)}>Recargar</button>
    </section>
    {loading ? <p role="status">Cargando notas...</p> : !commissionId ? <p>No hay comisiones asignadas.</p> : <>
      <form className="card" style={{ padding: '1.5rem' }} onSubmit={save}>
        <h2>Cargar o corregir nota</h2>
        <fieldset disabled={busy || !!error || !students.length} style={{ border: 0, padding: 0, display: 'grid', gap: '1rem' }}>
          <label className="form-group">Alumno<select className="form-select" required value={enrollmentId} onChange={e => setEnrollmentId(e.target.value)}><option value="" disabled>Seleccionar alumno</option>{enrollments.filter(e => students.some(s => s.id === e.studentId)).map(e => { const s = students.find(s => s.id === e.studentId)!; return <option key={e.id} value={e.id}>{s.lastName}, {s.firstName} — {s.legajo}</option>; })}</select></label>
          <label className="form-group">Fecha<input className="form-input" type="date" required value={date} onChange={e => setDate(e.target.value)} /></label>
          <label><input type="checkbox" checked={absent} onChange={e => setAbsent(e.target.checked)} /> Ausente en la evaluación</label>
          <label className="form-group">Nota (1 a 10)<input className="form-input" type="number" min={1} max={10} step="any" required={!absent} disabled={absent} value={value} onChange={e => setValue(e.target.value)} /></label>
          <label className="form-group">Observaciones de la evaluación<textarea className="form-textarea" maxLength={1000} value={notes} onChange={e => setNotes(e.target.value)} /></label>
          <p className="form-hint">Se actualiza la nota del alumno para el tipo y la instancia seleccionados. Si ya está publicada, la corrección será visible inmediatamente.</p>
          <button className="btn btn-primary" type="submit">{busy ? 'Procesando...' : 'Guardar nota'}</button>
        </fieldset>
      </form>
      <section className="card" style={{ padding: '1.5rem' }}><h2>{ASSESSMENT_TYPE_LABELS[type]} — Instancia {instance}</h2>
        {!selectedGrades.length ? <p>Todavía no hay notas guardadas para esta evaluación.</p> : <div style={{ overflowX: 'auto' }}><table style={{ width: '100%' }}><thead><tr><th scope="col">Alumno</th><th scope="col">Fecha</th><th scope="col">Nota</th><th scope="col">Publicación</th></tr></thead><tbody>{selectedGrades.map(g => { const en = enrollments.find(e => e.id === g.enrollmentId); const s = students.find(s => s.id === en?.studentId); return <tr key={g.id}><td>{s ? `${s.lastName}, ${s.firstName}` : 'Alumno sin ficha disponible'}</td><td>{g.date}</td><td>{g.absent ? 'Ausente' : g.value ?? 'Sin nota'}</td><td>{g.published ? 'Publicada' : 'Pendiente'}</td></tr>; })}</tbody></table></div>}
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={busy || !!error || !selectedGrades.some(g => !g.published)} onClick={() => setConfirmPublish(true)}>Publicar evaluación de la comisión</button>
      </section>
    </>}
    <ConfirmModal isOpen={confirmPublish} onCancel={() => setConfirmPublish(false)} description="Las notas pasarán a estar disponibles en el portal del alumno." onConfirm={publish} title="Publicar notas" confirmLabel="Publicar notas"><p>Se publicarán todas las notas guardadas de {ASSESSMENT_TYPE_LABELS[type]}, instancia {instance}, para esta comisión. Los alumnos recibirán una notificación.</p></ConfirmModal>
  </div>;
}
