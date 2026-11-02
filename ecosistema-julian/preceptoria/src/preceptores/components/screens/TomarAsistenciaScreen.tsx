/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  CheckSquare, 
  FileArrowDown, 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileText, 
  Question, 
  WarningCircle, 
  Prohibit,
  FloppyDisk, 
  ArrowsCounterClockwise,
  User,
  Info,
  Calendar,
  Warning,
  QrCode
} from '@phosphor-icons/react';
import { usePreceptor } from '../../context/PreceptorContext';
import { AttendanceStatus, Student } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { RuleBadge, FormulaTooltip } from '../common/RuleBadge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { toast } from 'sonner';
import { QrAttendanceModal } from '../common/QrAttendanceModal';
import { RollCallSummary } from '../../context/PreceptorContext';
import { isoToDisplay } from '../../api';

export const TomarAsistenciaScreen: React.FC = () => {
  const { 
    currentCourse, 
    subjects, 
    selectedSubjectId, 
    setSelectedSubjectId, 
    selectedSubject, 
    students,
    rollCallDraft,
    setRollCallStatus,
    markAllPresent,
    hasUnsavedRollCall,
    saveRollCall,
    discardRollCallChanges,
    rollCallDate,
    setRollCallDate,
    rollCallBaseline,
    rollCallLoading,
    rollCallSaving,
    courseLoading,
    openStudentProfile
  } = usePreceptor();

  // Keyboard navigation active index
  const [focusedStudentIndex, setFocusedStudentIndex] = useState<number>(0);
  const studentRowsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Modals
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState<boolean>(false);
  const [showDiscardConfirmModal, setShowDiscardConfirmModal] = useState<boolean>(false);
  const [showSaveSummaryModal, setShowSaveSummaryModal] = useState<boolean>(false);
  const [savedSummaryData, setSavedSummaryData] = useState<RollCallSummary | null>(null);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // Inscriptos en la comisión elegida, por apellido (no se reordena mientras se marca)
  const sortedStudents = useMemo(() => {
    return students
      .filter(s => selectedSubjectId && s.subjects[selectedSubjectId])
      .sort((a, b) => a.apellido.localeCompare(b.apellido, 'es'));
  }, [students, selectedSubjectId]);

  const savedRecordsCount = useMemo(
    () => sortedStudents.filter(s => rollCallBaseline[s.id]).length,
    [sortedStudents, rollCallBaseline]
  );
  const rollCallDateLabel = isoToDisplay(rollCallDate);

  // Live counters calculation
  const liveCounts = useMemo(() => {
    let p = 0, t = 0, a = 0, j = 0, unreg = 0;
    sortedStudents.forEach(s => {
      const st = rollCallDraft[s.id];
      if (st === 'presente') p++;
      else if (st === 'tardanza') t++;
      else if (st === 'ausente') a++;
      else if (st === 'justificado') j++;
      else unreg++;
    });
    return { p, t, a, j, unreg };
  }, [sortedStudents, rollCallDraft]);

  // Keyboard navigation: Arrows + P, T, A, J
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in an input, do not capture
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedStudentIndex(prev => {
          const next = Math.min(prev + 1, sortedStudents.length - 1);
          studentRowsRef.current[next]?.focus();
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedStudentIndex(prev => {
          const next = Math.max(prev - 1, 0);
          studentRowsRef.current[next]?.focus();
          return next;
        });
      } else {
        const currentStudent = sortedStudents[focusedStudentIndex];
        if (!currentStudent) return;

        const key = e.key.toUpperCase();
        if (key === 'P') {
          e.preventDefault();
          setRollCallStatus(currentStudent.id, 'presente');
        } else if (key === 'T') {
          e.preventDefault();
          setRollCallStatus(currentStudent.id, 'tardanza');
        } else if (key === 'A') {
          e.preventDefault();
          setRollCallStatus(currentStudent.id, 'ausente');
        } else if (key === 'J') {
          e.preventDefault();
          setRollCallStatus(currentStudent.id, 'justificado');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedStudentIndex, sortedStudents, setRollCallStatus]);

  // Export CSV (UTF-8 with BOM for Excel compatibility)
  const handleExportCSV = () => {
    const header = ['Legajo', 'Apellido y Nombre', 'DNI', 'Condicion_Materia', 'Asistencia_Fecha', 'Estado_Registrado'];
    const rows = sortedStudents.map(s => {
      const condition = s.subjects[selectedSubjectId]?.condition || 'regular';
      const status = rollCallDraft[s.id] || 'sin_registrar';
      return [
        `"${s.legajo}"`,
        `"${s.apellido}, ${s.nombre}"`,
        `"${s.dni}"`,
        `"${condition}"`,
        `"${rollCallDateLabel}"`,
        `"${status}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [header.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Format sanitized filename: asistencia_{carrera}_{año}_{materia}_{dd-MM-yyyy}.csv
    const cleanCareer = currentCourse.careerName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const cleanYear = `${currentCourse.year}ano`;
    const cleanSubject = (selectedSubject?.shortCode ?? 'materia').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const cleanDate = rollCallDateLabel.replace(/\//g, '-');
    link.href = url;
    link.setAttribute('download', `asistencia_${cleanCareer}_${cleanYear}_${cleanSubject}_${cleanDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Planilla de asistencia exportada en CSV (Excel UTF-8 con BOM)");
  };

  const handleConfirmSave = async () => {
    setShowSaveConfirmModal(false);
    const summary = await saveRollCall();
    if (summary) {
      setSavedSummaryData(summary);
      setShowSaveSummaryModal(true);
    }
  };

  if (!selectedSubject) {
    return (
      <div className="py-16 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl">
        No tenés comisiones asignadas en este curso. Pedí a Dirección que te asigne como preceptor/a de la comisión.
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-150">
      {/* 1. Header con Selectores */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-data text-[#89743A] uppercase font-semibold">
                {currentCourse.fullLabel}
              </span>
              <RuleBadge compact type="formulaPresentismo" />
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-[var(--text-primary)] mt-1">
              Tomar <span className="text-[#89743A]">Asistencia</span>
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Marcado rápido de un toque para celulares, tablets y computadoras de preceptoría.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] hover:border-[#89743A] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Generar un código para que los alumnos registren su presente"
            >
              <QrCode size={16} weight="bold" />
              <span>Asistencia QR</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] hover:border-[#89743A] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Descargar planilla compatible con Excel"
            >
              <FileArrowDown size={16} weight="bold" />
              <span>Exportar CSV</span>
            </button>

            <button
              type="button"
              onClick={markAllPresent}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--brand-navy)] text-white hover:opacity-95 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <CheckCircle size={16} weight="bold" />
              <span>Marcar todos presentes</span>
            </button>
          </div>
        </div>

        {/* Filters bar: Subject & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-heading font-semibold text-[var(--text-muted)] uppercase mb-1">
              Materia
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                if (hasUnsavedRollCall) {
                  if (window.confirm("Tenés cambios sin guardar en la materia actual. ¿Deseás cambiar de materia de todos modos?")) {
                    discardRollCallChanges();
                    setSelectedSubjectId(e.target.value);
                  }
                } else {
                  setSelectedSubjectId(e.target.value);
                }
              }}
              className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-[#3F78B6] cursor-pointer"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.shortCode} ({s.teacherName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-heading font-semibold text-[var(--text-muted)] uppercase mb-1">
              Fecha de la Clase
            </label>
            <div className="relative">
              <input
                type="date"
                value={rollCallDate}
                onChange={(e) => {
                  if (!e.target.value) return;
                  if (hasUnsavedRollCall && !window.confirm("Tenés cambios sin guardar en esta fecha. ¿Deseás cambiar de fecha de todos modos?")) return;
                  setRollCallDate(e.target.value);
                }}
                className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-lg px-3 py-2 text-xs font-mono-data font-semibold focus:ring-2 focus:ring-[#3F78B6]"
              />
            </div>
          </div>

          <div className="sm:col-span-2 md:col-span-1 flex flex-col justify-end">
            <div className="bg-[var(--bg-page)] rounded-lg p-2 px-3 border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] flex items-center justify-between">
              <span>Horario asignado:</span>
              <strong className="text-[var(--text-primary)] font-mono-data">{selectedSubject.scheduleDays}</strong>
            </div>
          </div>
        </div>

        {/* Registros ya guardados para esa fecha (docente, QR o preceptoría: es la misma planilla) */}
        {savedRecordsCount > 0 && (
          <div className="mt-4 p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 rounded-lg flex items-start gap-2.5 text-xs text-sky-900 dark:text-sky-200">
            <Info size={18} weight="fill" className="text-sky-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">
                Esta clase ya tiene {savedRecordsCount} registro{savedRecordsCount === 1 ? '' : 's'} guardado{savedRecordsCount === 1 ? '' : 's'}
              </p>
              <p className="mt-0.5 text-sky-800 dark:text-sky-300">
                Docentes y preceptoría comparten la misma planilla. Si cambiás un estado ya guardado, queda registrado como corrección en el historial.
              </p>
            </div>
          </div>
        )}
        {(rollCallLoading || courseLoading) && (
          <p className="mt-3 text-xs text-[var(--text-muted)]" role="status">Cargando la planilla…</p>
        )}
      </section>

      {/* 2. Barra de Conteo en Vivo */}
      <section 
        className="sticky top-[60px] lg:top-[68px] z-10 bg-[var(--brand-navy)] text-white p-3 px-4 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-3 text-xs"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex items-center gap-3 flex-wrap font-mono-data">
          <span className="font-heading font-bold text-slate-300 text-xs uppercase tracking-wider">
            Relevamiento en vivo:
          </span>
          <span className="text-emerald-400 font-bold">{liveCounts.p} presentes</span>
          <span className="text-slate-400">·</span>
          <span className="text-amber-300 font-bold">{liveCounts.t} tardanzas</span>
          <span className="text-slate-400">·</span>
          <span className="text-red-400 font-bold">{liveCounts.a} ausentes</span>
          <span className="text-slate-400">·</span>
          <span className="text-sky-300 font-bold">{liveCounts.j} justificados</span>
          {liveCounts.unreg > 0 && (
            <>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300 italic">{liveCounts.unreg} sin registrar</span>
            </>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-300 font-mono-data">
          <span>Atajos: [P] Presente · [T] Tardanza · [A] Ausente · [J] Justificado</span>
        </div>
      </section>

      {/* 3. Lista de Alumnos */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xs overflow-hidden">
        <div className="p-3 px-4 bg-[var(--bg-surface-elevated)] border-b border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)] font-heading font-semibold uppercase">
          <span>Nómina de Alumnos ({sortedStudents.length})</span>
          <span>Registro de un toque</span>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]" role="list">
          {sortedStudents.map((student, index) => {
            const currentStatus = rollCallDraft[student.id] || 'sin_registrar';
            const stats = student.subjects[selectedSubjectId] || { condition: 'regular' as const };
            const isLibre = stats.condition === 'libre';
            const isEnRiesgo = stats.condition === 'en_riesgo';

            return (
              <div
                key={student.id}
                ref={el => { studentRowsRef.current[index] = el; }}
                tabIndex={0}
                onFocus={() => setFocusedStudentIndex(index)}
                className={`p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors outline-none focus:bg-[#3F78B6]/10 ${
                  isLibre 
                    ? 'bg-red-50/70 dark:bg-red-950/20 border-l-4 border-l-red-600' 
                    : isEnRiesgo
                    ? 'bg-amber-50/40 dark:bg-amber-950/15'
                    : 'hover:bg-[var(--bg-surface-elevated)]'
                }`}
              >
                {/* Student Info */}
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[var(--brand-navy)] text-white font-mono-data text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => openStudentProfile(student)}
                        className="font-heading font-bold text-sm sm:text-base text-[var(--text-primary)] hover:text-[#89743A] hover:underline transition-colors text-left truncate"
                        title="Ver ficha completa del alumno"
                      >
                        {student.apellido}, {student.nombre}
                      </button>
                      <StatusBadge status={stats.condition} size="sm" />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono-data mt-0.5">
                      <span>{student.legajo}</span>
                      <span>·</span>
                      <span>DNI {student.dni}</span>
                      {stats.riskReason && (
                        <>
                          <span>·</span>
                          <span className="text-red-600 dark:text-red-400 font-semibold">{stats.riskReason}</span>
                        </>
                      )}
                    </div>

                    {isLibre && (
                      <p className="text-[11px] text-red-700 dark:text-red-300 font-medium mt-1 flex items-center gap-1">
                        <Warning size={13} weight="bold" />
                        <span>Alumno libre: Queda registrado para actas; la condición académica no cambia.</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Touch-Optimized Segmented Control (≥44x44px touch targets) */}
                <div 
                  className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-[var(--border-subtle)] shrink-0 self-stretch sm:self-center"
                  role="group"
                  aria-label={`Asistencia de ${student.apellido}`}
                >
                  {/* Presente */}
                  <button
                    type="button"
                    onClick={() => setRollCallStatus(student.id, 'presente')}
                    aria-pressed={currentStatus === 'presente'}
                    className={`flex-1 sm:flex-none min-h-[44px] min-w-[52px] px-3 py-2 rounded-lg text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                      currentStatus === 'presente'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <CheckCircle size={16} weight="bold" />
                    <span>P</span>
                  </button>

                  {/* Tardanza */}
                  <button
                    type="button"
                    onClick={() => setRollCallStatus(student.id, 'tardanza')}
                    aria-pressed={currentStatus === 'tardanza'}
                    className={`flex-1 sm:flex-none min-h-[44px] min-w-[52px] px-3 py-2 rounded-lg text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                      currentStatus === 'tardanza'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <Clock size={16} weight="bold" />
                    <span>T</span>
                  </button>

                  {/* Ausente */}
                  <button
                    type="button"
                    onClick={() => setRollCallStatus(student.id, 'ausente')}
                    aria-pressed={currentStatus === 'ausente'}
                    className={`flex-1 sm:flex-none min-h-[44px] min-w-[52px] px-3 py-2 rounded-lg text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                      currentStatus === 'ausente'
                        ? 'bg-red-700 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <XCircle size={16} weight="bold" />
                    <span>A</span>
                  </button>

                  {/* Justificado */}
                  <button
                    type="button"
                    onClick={() => setRollCallStatus(student.id, 'justificado')}
                    aria-pressed={currentStatus === 'justificado'}
                    className={`flex-1 sm:flex-none min-h-[44px] min-w-[52px] px-3 py-2 rounded-lg text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                      currentStatus === 'justificado'
                        ? 'bg-sky-700 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <FileText size={16} weight="bold" />
                    <span>J</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Barra Fija Inferior Persistente de "Cambios sin Guardar" y Botón Guardar */}
      {hasUnsavedRollCall && (
        <div 
          className="fixed bottom-16 lg:bottom-4 left-4 right-4 lg:left-72 lg:right-8 z-40 bg-[var(--brand-navy)] text-white p-4 rounded-xl shadow-2xl border border-[#AF9B63] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-bottom duration-200"
          role="alert"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
              <WarningCircle size={22} weight="bold" />
            </div>
            <div>
              <p className="font-heading font-bold text-sm leading-tight text-white">
                Tenés registros sin guardar en el libro de asistencia
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                Materia: <strong className="text-white">{selectedSubject.name}</strong> · Fecha: <span className="font-mono-data">{rollCallDateLabel}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={() => setShowDiscardConfirmModal(true)}
              className="px-3 py-2 rounded-lg border border-slate-500 text-slate-200 hover:bg-white/10 text-xs font-semibold transition-colors cursor-pointer"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={() => setShowSaveConfirmModal(true)}
              disabled={rollCallSaving}
              className="disabled:opacity-60 px-5 py-2 rounded-lg bg-[#89743A] hover:bg-[#73612F] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FloppyDisk size={16} weight="bold" />
              <span>{rollCallSaving ? 'Guardando…' : 'Guardar asistencia'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirm Save Dialog */}
      <ConfirmDialog
        isOpen={showSaveConfirmModal}
        title="Guardar planilla de asistencia oficial"
        description={`Estás por asentar el registro de asistencia para ${selectedSubject.name} correspondiente a la fecha ${rollCallDateLabel}. Los justificados se guardan como ausentes con una justificación aprobada.`}
        changesSummary={[
          { label: 'Presentes', value: `${liveCounts.p} alumnos` },
          { label: 'Tardanzas', value: `${liveCounts.t} alumnos` },
          { label: 'Ausentes', value: `${liveCounts.a} alumnos` },
          { label: 'Justificados', value: `${liveCounts.j} alumnos` },
          { label: 'Sin registrar', value: `${liveCounts.unreg} alumnos` },
        ]}
        confirmLabel="Confirmar y Guardar"
        cancelLabel="Revisar antes"
        onConfirm={() => void handleConfirmSave()}
        onCancel={() => setShowSaveConfirmModal(false)}
      />

      <QrAttendanceModal
        isOpen={showQrModal}
        commissionId={selectedSubject.id}
        subjectName={`${selectedSubject.name} · ${selectedSubject.shortCode}`}
        date={rollCallDate}
        onClose={() => setShowQrModal(false)}
      />

      {/* Confirm Discard Dialog */}
      <ConfirmDialog
        isOpen={showDiscardConfirmModal}
        title="¿Descartar cambios de la toma de asistencia?"
        description="Se perderán las marcas sin guardar y la planilla volverá a lo que está guardado."
        confirmLabel="Sí, descartar cambios"
        cancelLabel="Continuar cargando"
        isDestructive={true}
        onConfirm={() => {
          discardRollCallChanges();
          setShowDiscardConfirmModal(false);
        }}
        onCancel={() => setShowDiscardConfirmModal(false)}
      />

      {/* Summary Dialog after Save */}
      {showSaveSummaryModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} weight="bold" />
            </div>

            <h3 className="font-heading font-extrabold text-lg text-center text-[var(--text-primary)]">
              Asistencia guardada con éxito
            </h3>
            <p className="text-xs text-center text-[var(--text-secondary)] mt-1 font-mono-data">
              Guardado en el sistema institucional · ISFDyT N° 26
            </p>

            <div className="my-4 bg-[var(--bg-surface-elevated)] p-4 rounded-xl border border-[var(--border-subtle)] space-y-2 text-xs font-mono-data">
              <div className="flex justify-between">
                <span>Materia:</span>
                <strong className="text-[var(--text-primary)] font-sans">{selectedSubject.name}</strong>
              </div>
              <div className="flex justify-between">
                <span>Fecha:</span>
                <strong className="text-[var(--text-primary)]">{rollCallDateLabel}</strong>
              </div>
              <div className="border-t border-[var(--border-subtle)] pt-2 flex justify-between text-emerald-700">
                <span>Presentes:</span>
                <strong>{savedSummaryData?.presents}</strong>
              </div>
              <div className="flex justify-between text-amber-700">
                <span>Tardanzas:</span>
                <strong>{savedSummaryData?.tardies}</strong>
              </div>
              <div className="flex justify-between text-red-700">
                <span>Ausentes:</span>
                <strong>{savedSummaryData?.absents}</strong>
              </div>
              <div className="flex justify-between text-sky-700">
                <span>Justificados:</span>
                <strong>{savedSummaryData?.justified}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSaveSummaryModal(false)}
              className="w-full py-2.5 bg-[var(--brand-navy)] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:opacity-95 cursor-pointer"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
