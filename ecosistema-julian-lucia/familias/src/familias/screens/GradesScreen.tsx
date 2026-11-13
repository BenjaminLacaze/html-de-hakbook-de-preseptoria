import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { SectionHeader } from '../components/SectionHeader';
import { LoadingState, EmptyState, ErrorState } from '../components/States';
import * as gradesApi from '../api/grades';
import { SubjectGrades } from '../types/api';
import { formatDate } from '../types/dictionaries';
import { 
  GraduationCap, 
  ArrowClockwise, 
  HourglassMedium, 
  CheckCircle,
  ChalkboardTeacher
} from '@phosphor-icons/react';

export const GradesScreen: React.FC = () => {
  const { selectedChild, selectedChildId } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjectsGrades, setSubjectsGrades] = useState<SubjectGrades[]>([]);

  const loadGrades = useCallback(async () => {
    if (!selectedChildId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await gradesApi.getChildGrades(selectedChildId);
      setSubjectsGrades(data);
    } catch (err: any) {
      setError(err.message || 'Error al recuperar las calificaciones académicas.');
    } finally {
      setLoading(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    loadGrades();
  }, [loadGrades]);

  if (!selectedChild) {
    return (
      <EmptyState
        title="No hay estudiante seleccionado"
        description="Por favor seleccioná un estudiante en la barra superior."
      />
    );
  }

  if (loading) {
    return <LoadingState message={`Consultando actas de calificaciones de ${selectedChild.firstName}...`} />;
  }

  if (error) {
    return (
      <ErrorState
        message="No se pudieron consultar las calificaciones oficiales"
        details={error}
        onRetry={loadGrades}
      />
    );
  }

  if (subjectsGrades.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader
          kicker={`Estudiante: ${selectedChild.firstName} ${selectedChild.lastName} (${selectedChild.year})`}
          title="Boletín de Calificaciones"
          subtitle="Notas oficiales emitidas por el equipo docente de cada unidad curricular."
        />
        <EmptyState
          title="Sin calificaciones registradas para este ciclo lectivo"
          description="Las instancias de evaluación se publicarán una vez cerradas las actas de examen por cada profesor/a."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <SectionHeader
        kicker={`Estudiante: ${selectedChild.firstName} ${selectedChild.lastName} (${selectedChild.year})`}
        title="Boletín de Calificaciones"
        subtitle="Visualización de evaluaciones publicadas y pendientes por unidad curricular. Conforme a las actas del ISFDyT N° 26."
        action={
          <button
            type="button"
            onClick={loadGrades}
            className="p-2 rounded-xl border border-[var(--border)] bg-[var(--surface-card)] hover:bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Recargar calificaciones"
          >
            <ArrowClockwise className="w-4 h-4" />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        }
      />

      {/* Tarjetas agrupadas por materia */}
      <div className="space-y-5">
        {subjectsGrades.map((subject) => (
          <div
            key={subject.subjectId}
            className="rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] shadow-xs overflow-hidden"
          >
            {/* Cabecera de la materia */}
            <div className="p-4 sm:p-5 bg-[var(--surface-subtle)]/60 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-[var(--text)]">
                  {subject.subjectName}
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-1.5">
                  <ChalkboardTeacher className="w-4 h-4 text-[var(--brand-gold)]" />
                  <span>Docente: {subject.teacherName}</span>
                </p>
              </div>

              {subject.finalCondition && (
                <div className="self-start sm:self-center">
                  <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                    {subject.finalCondition}
                  </span>
                </div>
              )}
            </div>

            {/* Lista de instancias de evaluación */}
            <div className="divide-y divide-[var(--border)]">
              {subject.items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--surface-subtle)]/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--text)]">
                        {item.instance}
                      </span>
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        · {formatDate(item.date)}
                      </span>
                    </div>

                    {item.teacherNotes && (
                      <p className="text-[11px] text-[var(--text-muted)] italic mt-1 bg-[var(--surface-subtle)] px-2.5 py-1 rounded-md border border-[var(--border)]">
                        Observación: "{item.teacherNotes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {item.isPublished && item.numericGrade !== null && item.numericGrade !== undefined ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--text-muted)]">Calificación:</span>
                        <div className="w-10 h-10 rounded-xl bg-[var(--brand-navy)] text-white flex items-center justify-center font-mono font-black text-lg shadow-xs">
                          {item.numericGrade}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-[var(--border)] text-xs text-[var(--text-muted)] bg-[var(--surface-subtle)]">
                        <HourglassMedium className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="font-semibold">Pendiente de publicación</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Nota de transparencia institucional (Regla de honestidad §6) */}
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] text-xs text-[var(--text-muted)]">
        <p className="font-bold text-[var(--text)] mb-1">
          Régimen de Calificaciones ISFDyT N° 26
        </p>
        <p className="leading-relaxed">
          Las notas se rigen por la escala numérica del 1 al 10 según la Res. 4043/09 de la DGCyE. La nota mínima de aprobación para parciales y cursadas regulares es 4 (cuatro). No se muestran promedios calculados por el navegador; únicamente constan las calificaciones validadas en actas institucionales.
        </p>
      </div>
    </div>
  );
};
