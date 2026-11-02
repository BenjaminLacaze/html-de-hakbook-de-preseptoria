/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  CheckSquare,
  WarningCircle,
  Prohibit,
  FileText,
  ChatCircleDots,
  CalendarBlank,
  ArrowRight,
  Clock,
  Sparkle,
  ShieldCheck,
  ChalkboardTeacher
} from '@phosphor-icons/react';
import { usePreceptor } from '../../context/PreceptorContext';
import { AR_TZ, isoToDisplay, todayISO } from '../../api';
import { FormulaTooltip, RuleBadge } from '../common/RuleBadge';
import { StatusBadge } from '../common/StatusBadge';

export const InicioScreen: React.FC = () => {
  const {
    currentCourse,
    counts,
    setActiveScreen,
    goTakeAttendance,
    todayClasses,
    subjects,
    profile,
    ruleSettings,
    courseLoading,
    students,
    justifications,
    openStudentProfile,
    setAlumnosFilterCondition,
    setJustificacionesTab
  } = usePreceptor();

  // Find priority items "Para atender"
  const atRiskStudents = students.filter(s =>
    Object.values(s.subjects).some(stat => stat.condition === 'en_riesgo')
  ).slice(0, 3);

  const pendingJustifications = justifications
    .filter(j => j.status === 'pendiente')
    .slice(0, 2);

  const handleKpiClick = (type: 'justificaciones' | 'riesgo' | 'libres' | 'mensajes') => {
    switch (type) {
      case 'justificaciones':
        setJustificacionesTab('pendientes');
        setActiveScreen('justificaciones');
        break;
      case 'riesgo':
        setAlumnosFilterCondition('en_riesgo');
        setActiveScreen('alumnos');
        break;
      case 'libres':
        setAlumnosFilterCondition('libre');
        setActiveScreen('alumnos');
        break;
      case 'mensajes':
        setActiveScreen('mensajes');
        break;
    }
  };

  const todayLabel = new Intl.DateTimeFormat('es-AR', {
    timeZone: AR_TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date());

  // Promedio de los porcentajes que informa el backend, por materia del curso (alumnos con clases registradas).
  const averageBySubject = subjects.map(subj => {
    const rates = students
      .map(s => s.subjects[subj.id])
      .filter(st => st && st.classesHeld > 0)
      .map(st => st.attendanceRate);
    const rate = rates.length ? Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 10) / 10 : null;
    return { id: subj.id, label: subj.shortCode, name: subj.name, rate };
  });
  const chartBars = averageBySubject.filter(b => b.rate !== null).slice(0, 8);
  const minPct = ruleSettings?.minAttendancePercent ?? null;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Franja Navy Sólida de Bienvenida */}
      <section className="bg-[var(--brand-navy)] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-data text-[#AF9B63] uppercase tracking-wider mb-1.5">
              <CalendarBlank size={15} />
              <span className="capitalize">{todayLabel}{currentCourse.shift ? ` · ${currentCourse.shift}` : ''}</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-white">
              Hola, <span className="text-[#AF9B63]">{profile.nombre}</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
              Gestionando <strong className="text-white">{currentCourse.fullLabel}</strong>. La asistencia de hoy impacta directamente en las regularidades académicas.{courseLoading ? ' Actualizando datos…' : ''}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setActiveScreen('asistencia')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#89743A] hover:bg-[#73612F] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer active:scale-98"
            >
              <CheckSquare size={18} weight="bold" />
              <span>Tomar asistencia</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative geometric overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/[0.02] pointer-events-none transform -skew-x-12" />
      </section>

      {/* 2. Cuatro Cifras Clicables con Filtros Directos */}
      <section aria-label="Indicadores clave de gestión">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Justificaciones */}
          <button
            type="button"
            onClick={() => handleKpiClick('justificaciones')}
            className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[#89743A] rounded-xl text-left transition-all group shadow-2xs cursor-pointer hover:shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Justificaciones
              </span>
              <FileText size={18} className="text-sky-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-heading font-extrabold text-2xl md:text-3xl text-[var(--text-primary)] font-mono-data">
                {counts.pendingJustifications}
              </span>
              <span className="text-xs text-sky-700 font-medium">pendientes</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1 group-hover:text-[#89743A]">
              <span>Revisar certificados</span>
              <ArrowRight size={11} />
            </p>
          </button>

          {/* Card 2: En Riesgo */}
          <button
            type="button"
            onClick={() => handleKpiClick('riesgo')}
            className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-amber-500 rounded-xl text-left transition-all group shadow-2xs cursor-pointer hover:shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Alumnos en riesgo
              </span>
              <WarningCircle size={18} weight="bold" className="text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-heading font-extrabold text-2xl md:text-3xl text-amber-700 dark:text-amber-400 font-mono-data">
                {counts.atRiskStudents}
              </span>
              <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">{ruleSettings ? `bajo el ${ruleSettings.attendanceRiskThresholdPercent}%` : 'en riesgo'}</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1 group-hover:text-amber-600">
              <span>Filtrar lista de riesgo</span>
              <ArrowRight size={11} />
            </p>
          </button>

          {/* Card 3: Libres */}
          <button
            type="button"
            onClick={() => handleKpiClick('libres')}
            className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-red-500 rounded-xl text-left transition-all group shadow-2xs cursor-pointer hover:shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Alumnos libres
              </span>
              <Prohibit size={18} weight="bold" className="text-red-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-heading font-extrabold text-2xl md:text-3xl text-red-700 dark:text-red-400 font-mono-data">
                {counts.libreStudents}
              </span>
              <span className="text-xs text-red-600 font-medium">bajo el mínimo en ≥1 materia</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1 group-hover:text-red-600">
              <span>Ver materias afectadas</span>
              <ArrowRight size={11} />
            </p>
          </button>

          {/* Card 4: Mensajes */}
          <button
            type="button"
            onClick={() => handleKpiClick('mensajes')}
            className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--brand-blue)] rounded-xl text-left transition-all group shadow-2xs cursor-pointer hover:shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Mensajes sin leer
              </span>
              <ChatCircleDots size={18} className="text-[#3F78B6] group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-heading font-extrabold text-2xl md:text-3xl text-[var(--text-primary)] font-mono-data">
                {counts.unreadMessages}
              </span>
              <span className="text-xs text-[#3F78B6] font-medium">conversaciones</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1 group-hover:text-[#3F78B6]">
              <span>Abrir mensajería</span>
              <ArrowRight size={11} />
            </p>
          </button>
        </div>
      </section>

      {/* 3. Grid: Clases de Hoy & Gráfico SVG de Asistencia */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Clases de Hoy (7 cols) */}
        <section className="lg:col-span-7 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border-subtle)]">
            <div>
              <h2 className="font-heading font-bold text-base text-[var(--text-primary)] uppercase tracking-wide">
                Clases de Hoy
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Tus comisiones con horario para hoy (todos los cursos)
              </p>
            </div>
            <span className="font-mono-data text-xs text-[#89743A] font-semibold bg-[#89743A]/10 px-2.5 py-1 rounded-md">
              {isoToDisplay(todayISO())}
            </span>
          </div>

          <div className="space-y-3">
            {todayClasses.length === 0 && (
              <p className="py-6 text-center text-xs text-[var(--text-muted)]">
                No tenés comisiones con horario cargado para hoy.
              </p>
            )}
            {todayClasses.map(cls => (
              <div
                key={cls.commissionId}
                className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[var(--brand-blue)]/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-sm text-[var(--text-primary)]">
                      {cls.subjectName}
                    </h3>
                    {cls.status === 'cargada' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                        Cargada
                      </span>
                    )}
                    {cls.status === 'pendiente' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
                        Pendiente
                      </span>
                    )}
                    {cls.status === 'cargada_por_docente' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-400">
                        Cargada por docente
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {cls.teacherName} · <span className="font-mono-data">{cls.timeSlot}</span>
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {cls.courseLabel}
                    {cls.status !== 'pendiente' && cls.totalStudents ? ` · ${cls.presentsCount} de ${cls.totalStudents} presentes` : ''}
                  </p>
                  {cls.teacherLoggedAt && (
                    <p className="text-[11px] text-sky-700 dark:text-sky-400 italic">
                      Registrada por el docente a las {cls.teacherLoggedAt}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => goTakeAttendance(cls.commissionId)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      cls.status === 'pendiente'
                        ? 'bg-[#89743A] text-white hover:bg-[#73612F]'
                        : 'border border-[var(--brand-navy)] text-[var(--brand-navy)] dark:text-slate-200 dark:border-slate-500 hover:bg-[var(--brand-navy)] hover:text-white'
                    }`}
                  >
                    <CheckSquare size={15} weight="bold" />
                    <span>{cls.status === 'cargada' ? 'Ver / Editar' : 'Tomar asistencia'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Gráfico de Barras SVG Nativo (5 cols) */}
        <section className="lg:col-span-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-heading font-bold text-base text-[var(--text-primary)] uppercase tracking-wide">
                Asistencia Promedio por Materia
              </h2>
              <FormulaTooltip />
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Promedio de los porcentajes calculados por el sistema · {currentCourse.fullLabel}
            </p>

            {chartBars.length === 0 ? (
              <div className="w-full h-52 flex items-center justify-center p-4 bg-[var(--bg-surface-elevated)] rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] text-center">
                {courseLoading ? 'Cargando asistencia del curso…' : 'Todavía no hay clases con asistencia registrada en este curso.'}
              </div>
            ) : (
              <div className="w-full h-52 flex items-center justify-center p-2 bg-[var(--bg-surface-elevated)] rounded-xl border border-[var(--border-subtle)]">
                <svg
                  viewBox="0 0 320 180"
                  className="w-full h-full"
                  role="img"
                  aria-label={`Asistencia promedio por materia: ${chartBars.map(b => `${b.name} ${b.rate}%`).join(', ')}`}
                >
                  <line x1="40" y1="30" x2="300" y2="30" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                  <line x1="40" y1="90" x2="300" y2="90" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                  <line x1="40" y1="150" x2="300" y2="150" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
                  <text x="32" y="34" fontSize="10" textAnchor="end" fill="currentColor" opacity="0.6" className="font-mono-data">100%</text>
                  <text x="32" y="94" fontSize="10" textAnchor="end" fill="currentColor" opacity="0.6" className="font-mono-data">50%</text>
                  {minPct !== null && (
                    <>
                      <line x1="40" y1={150 - (minPct / 100) * 120} x2="300" y2={150 - (minPct / 100) * 120} stroke="#89743A" strokeWidth="1.2" strokeDasharray="4 2" />
                      <text x="298" y={146 - (minPct / 100) * 120} fontSize="9" textAnchor="end" fill="#89743A" fontWeight="600" className="font-mono-data">Mínimo {minPct}%</text>
                    </>
                  )}
                  {chartBars.map((bar, i) => {
                    const slot = 260 / chartBars.length;
                    const barWidth = Math.min(44, slot * 0.6);
                    const x = 40 + i * slot + (slot - barWidth) / 2;
                    const barHeight = ((bar.rate ?? 0) / 100) * 120;
                    const y = 150 - barHeight;
                    const below = minPct !== null && (bar.rate ?? 0) < minPct;
                    return (
                      <g key={bar.id}>
                        <title>{`${bar.name}: ${bar.rate}%`}</title>
                        <rect x={x} y={y} width={barWidth} height={barHeight} rx="5" fill={below ? '#B91C1C' : '#14214F'} />
                        <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize="10" fontWeight="700" fill="currentColor" className="font-mono-data">
                          {bar.rate}%
                        </text>
                        <text x={x + barWidth / 2} y="166" textAnchor="middle" fontSize="8" fill="currentColor" className="font-sans">
                          {bar.label.length > 10 ? `${bar.label.slice(0, 9)}…` : bar.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)]">
              Curso activo: <strong>{currentCourse.yearLabel} ({counts.atRiskStudents} en riesgo)</strong>
            </span>
            <RuleBadge compact type="condicionLibre" />
          </div>
        </section>
      </div>

      {/* 4. Lista Corta "Para Atender" */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-bold text-base text-[var(--text-primary)] uppercase tracking-wide">
              Para Atender Prioritario
            </h2>
            <span className="text-[11px] font-mono-data bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded font-semibold">
              Casos urgentes
            </span>
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            Acceso directo a regularizaciones y certificaciones
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Col 1: Alumnos en riesgo */}
          <div className="space-y-2">
            <h3 className="font-heading font-semibold text-xs text-[var(--text-muted)] uppercase tracking-wider">
              Alumnos al límite de inasistencias
            </h3>
            <div className="space-y-2">
              {atRiskStudents.length === 0 && (
                <p className="text-xs text-[var(--text-muted)]">No hay alumnos en riesgo en este curso.</p>
              )}
              {atRiskStudents.map(student => {
                const criticalEntry = Object.entries(student.subjects).find(
                  ([_, stat]) => stat.condition === 'en_riesgo'
                );
                return (
                  <div
                    key={student.id}
                    className="p-3 rounded-lg border border-amber-300 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-heading font-bold text-[var(--text-primary)]">
                        {student.apellido}, {student.nombre}
                      </p>
                      <p className="font-mono-data text-[11px] text-[var(--text-muted)]">
                        {student.legajo} · {criticalEntry ? criticalEntry[1].riskReason : 'En riesgo'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => openStudentProfile(student)}
                      className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-[var(--border-strong)] text-[var(--text-primary)] rounded-md hover:border-[#89743A] font-medium shrink-0 cursor-pointer text-xs"
                    >
                      Ver ficha
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Col 2: Justificaciones más antiguas pendientes */}
          <div className="space-y-2">
            <h3 className="font-heading font-semibold text-xs text-[var(--text-muted)] uppercase tracking-wider">
              Justificaciones esperando resolución
            </h3>
            <div className="space-y-2">
              {pendingJustifications.length === 0 && (
                <p className="text-xs text-[var(--text-muted)]">No hay justificaciones pendientes.</p>
              )}
              {pendingJustifications.map(just => (
                <div
                  key={just.id}
                  className="p-3 rounded-lg border border-sky-300 dark:border-sky-800/60 bg-sky-50/40 dark:bg-sky-950/20 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-heading font-bold text-[var(--text-primary)] truncate">
                      {just.studentName}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">
                      {just.subjectName} · Falta del <span className="font-mono-data font-semibold">{just.absenceDate}</span> ({just.submittedAgo})
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setJustificacionesTab('pendientes');
                      setActiveScreen('justificaciones');
                    }}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-[var(--border-strong)] text-[var(--text-primary)] rounded-md hover:border-[#3F78B6] font-medium shrink-0 cursor-pointer text-xs"
                  >
                    Evaluar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
