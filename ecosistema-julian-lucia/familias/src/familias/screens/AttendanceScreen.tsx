import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SectionHeader } from '../components/SectionHeader';
import { AttendanceRiskBanner } from '../components/AttendanceRiskBanner';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState, EmptyState, ErrorState } from '../components/States';
import * as childrenApi from '../api/children';
import * as attendanceApi from '../api/attendance';
import { AttendanceRecord, AttendanceSummary, AttendanceState } from '../types/api';
import { formatDate } from '../types/dictionaries';
import { 
  Funnel, 
  ArrowClockwise, 
  FileText, 
  CheckCircle,
  Warning
} from '@phosphor-icons/react';

export const AttendanceScreen: React.FC = () => {
  const { selectedChild, selectedChildId, setActiveScreen, setPrefillJustificationDate } = useApp();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  // Filtros interactivos
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [filterState, setFilterState] = useState<string>('ALL');
  const [filterMonth, setFilterMonth] = useState<string>('ALL');

  const loadAttendance = useCallback(async () => {
    if (!selectedChildId) return;
    setLoading(true);
    setError(null);
    try {
      const [sum, recs] = await Promise.all([
        childrenApi.getChildSummary(selectedChildId),
        attendanceApi.getChildAttendance(selectedChildId),
      ]);
      setSummary(sum);
      setRecords(recs);
    } catch (err: any) {
      setError(err.message || 'Error al obtener los registros de asistencia.');
    } finally {
      setLoading(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  // Lista de materias únicas para el filtro
  const uniqueSubjects = useMemo(() => {
    const map = new Map<string, string>();
    records.forEach((r) => map.set(r.subjectId, r.subjectName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [records]);

  // Filtrado de registros
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (filterSubject !== 'ALL' && r.subjectId !== filterSubject) return false;
      if (filterState !== 'ALL' && r.state !== filterState) return false;
      if (filterMonth !== 'ALL') {
        const month = r.date.split('-')[1];
        if (month !== filterMonth) return false;
      }
      return true;
    });
  }, [records, filterSubject, filterState, filterMonth]);

  if (!selectedChild) {
    return (
      <EmptyState
        title="No hay estudiante seleccionado"
        description="Por favor seleccioná un estudiante en la barra superior."
      />
    );
  }

  if (loading) {
    return <LoadingState message={`Consultando registro de asistencia de ${selectedChild.firstName}...`} />;
  }

  if (error) {
    return (
      <ErrorState
        message="No se pudo cargar la asistencia institucional"
        details={error}
        onRetry={loadAttendance}
      />
    );
  }

  const handleJustifyClick = (date: string) => {
    setPrefillJustificationDate(date);
    setActiveScreen('justificaciones');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <SectionHeader
        kicker={`Estudiante: ${selectedChild.firstName} ${selectedChild.lastName} (${selectedChild.year})`}
        title="Régimen de Asistencia"
        subtitle="Registro oficial de clases dictadas, presencias e inasistencias computadas por Preceptoría."
        action={
          <button
            type="button"
            onClick={loadAttendance}
            className="p-2 rounded-xl border border-[var(--border)] bg-[var(--surface-card)] hover:bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Actualizar registro"
          >
            <ArrowClockwise className="w-4 h-4" />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        }
      />

      {/* Banner con el porcentaje calculado por el servidor y regla institucional */}
      {summary && (
        <AttendanceRiskBanner
          summary={summary}
          childName={`${selectedChild.firstName} ${selectedChild.lastName}`}
        />
      )}

      {/* Barra de Filtros (materia, estado, mes) */}
      <div className="p-4 rounded-xl bg-[var(--surface-card)] border border-[var(--border)] shadow-xs">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          <Funnel className="w-3.5 h-3.5 text-[var(--brand-gold)]" weight="bold" />
          <span>Filtros de Búsqueda</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Filtro por Materia */}
          <div>
            <label htmlFor="filter-subject" className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
              Unidad Curricular
            </label>
            <select
              id="filter-subject"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
            >
              <option value="ALL">Todas las materias</option>
              {uniqueSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado */}
          <div>
            <label htmlFor="filter-state" className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
              Estado de Asistencia
            </label>
            <select
              id="filter-state"
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
            >
              <option value="ALL">Todos los estados</option>
              <option value="PRESENT">Presente</option>
              <option value="ABSENT">Ausente</option>
              <option value="LATE">Llegada tarde</option>
              <option value="JUSTIFIED_ABSENT">Justificada</option>
            </select>
          </div>

          {/* Filtro por Mes */}
          <div>
            <label htmlFor="filter-month" className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
              Mes
            </label>
            <select
              id="filter-month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
            >
              <option value="ALL">Todo el ciclo lectivo</option>
              <option value="11">Noviembre 2026</option>
              <option value="10">Octubre 2026</option>
              <option value="09">Septiembre 2026</option>
              <option value="08">Agosto 2026</option>
              <option value="07">Julio 2026</option>
              <option value="06">Junio 2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista Cronológica de Asistencia */}
      <section aria-label="Lista cronológica de asistencias">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Registros Cronológicos ({filteredRecords.length})
          </h2>
        </div>

        {filteredRecords.length === 0 ? (
          <EmptyState
            title="Sin registros de asistencia para los filtros seleccionados"
            description="Probá ajustando la materia o el estado seleccionado."
            action={
              <button
                type="button"
                onClick={() => {
                  setFilterSubject('ALL');
                  setFilterState('ALL');
                  setFilterMonth('ALL');
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[var(--border)] hover:bg-[var(--surface-subtle)] text-[var(--text)] cursor-pointer"
              >
                Limpiar filtros
              </button>
            }
          />
        ) : (
          <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border)] shadow-xs divide-y divide-[var(--border)] overflow-hidden">
            {filteredRecords.map((record) => {
              const isUnexcusedAbsent = record.state === 'ABSENT' && !record.justified;

              return (
                <div
                  key={record.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--surface-subtle)]/40 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    {/* Fecha estilo calendario */}
                    <div className="w-12 h-12 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] flex flex-col items-center justify-center shrink-0 font-mono text-center">
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                        {record.date.split('-')[1]}
                      </span>
                      <span className="text-sm font-extrabold text-[var(--text)]">
                        {record.date.split('-')[2]}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[var(--text)]">
                          {record.subjectName}
                        </span>
                        {record.time && (
                          <span className="text-[11px] font-mono text-[var(--text-muted)]">
                            · {record.time} hs
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Fecha: <span className="font-mono">{formatDate(record.date)}</span>
                        {record.notes ? ` — ${record.notes}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <StatusBadge type="attendance" value={record.state} />

                    {/* Botón Justificar en ausencias sin justificar (Requisito §4.2) */}
                    {isUnexcusedAbsent && (
                      <button
                        type="button"
                        onClick={() => handleJustifyClick(record.date)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-[#89743A] hover:bg-[#6D5C2C] text-white shadow-xs transition-colors cursor-pointer"
                        title={`Presentar constancia para justificar falta del ${formatDate(record.date)}`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Justificar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
