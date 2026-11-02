/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ChartLineUp,
  WarningCircle,
  Sparkle,
  ShieldWarning,
  ChatCircleDots,
  IdentificationCard,
  ArrowRight,
  Info,
  Lightbulb,
  CheckCircle,
  Copy
} from '@phosphor-icons/react';
import { usePreceptor } from '../../context/PreceptorContext';
import { Student } from '../../types';
import { RuleBadge, FormulaTooltip } from '../common/RuleBadge';
import { StatusBadge } from '../common/StatusBadge';

export const AnalisisScreen: React.FC = () => {
  const {
    students,
    currentCourse,
    subjects,
    openStudentProfile,
    startConversationWithStudent,
    ruleSettings,
    courseLoading
  } = usePreceptor();

  // Find students in risk based strictly on Bedelía config
  const riskStudentsList = students.flatMap(student => {
    return Object.entries(student.subjects)
      .filter(([_, stat]) => stat.condition === 'en_riesgo' || stat.condition === 'libre')
      .map(([subjId, stat]) => ({
        student,
        subjId,
        subjectName: subjects.find(s => s.id === subjId)?.name || subjId,
        stat,
      }));
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-data text-[#89743A] uppercase font-semibold">
                ANÁLISIS PREVENTIVO INSTITUCIONAL
              </span>
              <RuleBadge compact type="condicionEnRiesgo" />
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-[var(--text-primary)] mt-1">
              Análisis y <span className="text-[#89743A]">Alertas Tempranas</span>
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Alumnos en riesgo o por debajo del mínimo según el cálculo del sistema institucional · {currentCourse.fullLabel}.
            </p>
          </div>

          <span className="text-xs font-mono-data bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-3 py-1.5 rounded-lg font-semibold">
            {riskStudentsList.length} materias en alerta
          </span>
        </div>
      </section>

      {/* 1. Tarjetas de Alumnos en Riesgo Calculadas */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-base text-[var(--text-primary)] uppercase tracking-wide">
            Casos Identificados para Intervención
          </h2>
          <span className="text-xs text-[var(--text-muted)]">
            {ruleSettings ? `Mínimo: ${ruleSettings.minAttendancePercent}% · Riesgo: bajo el ${ruleSettings.attendanceRiskThresholdPercent}%` : ''}
          </span>
        </div>

        {riskStudentsList.length === 0 && (
          <div className="py-12 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl">
            {courseLoading ? 'Cargando asistencia del curso…' : 'No hay alumnos en riesgo ni por debajo del mínimo en este curso.'}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riskStudentsList.map((item, idx) => {
            const isLibre = item.stat.condition === 'libre';
            return (
              <div
                key={`${item.student.id}-${item.subjId}-${idx}`}
                className={`p-4 rounded-xl border shadow-2xs transition-all ${
                  isLibre
                    ? 'bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-900'
                    : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">
                      {item.student.apellido}, {item.student.nombre}
                    </h3>
                    <p className="font-mono-data text-xs text-[var(--text-muted)]">
                      {item.student.legajo} · DNI {item.student.dni}
                    </p>
                  </div>
                  <StatusBadge status={item.stat.condition} size="sm" />
                </div>

                {/* Motivo Concreto Calculado */}
                <div className="mt-3 bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg border border-[var(--border-subtle)] text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)]">Materia comprometida:</span>
                    <strong className="text-[var(--text-primary)]">{item.subjectName}</strong>
                  </div>
                  <div className="flex justify-between items-center font-mono-data">
                    <span className="text-[var(--text-muted)]">Inasistencias registradas:</span>
                    <strong className={isLibre ? 'text-red-600' : 'text-amber-700'}>
                      {item.stat.absents} faltas
                    </strong>
                  </div>
                  <div className="flex justify-between items-center font-mono-data">
                    <span className="text-[var(--text-muted)]">Faltas que le quedan:</span>
                    <strong className="text-[var(--text-primary)]">{item.stat.remainingAbsencesAllowed}</strong>
                  </div>
                  <div className="flex justify-between items-center font-mono-data">
                    <span className="text-[var(--text-muted)]">Presentismo acumulado:</span>
                    <strong className="text-[var(--text-primary)]">{item.stat.attendanceRate}%</strong>
                  </div>
                  <div className="pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--text-primary)] font-medium">
                    {item.stat.riskReason || `${item.stat.absents} ausencias registradas.`}
                  </div>
                </div>

                {/* Acciones Sugeridas */}
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openStudentProfile(item.student)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-[var(--border-strong)] text-[var(--text-primary)] rounded-lg text-xs font-semibold hover:border-[#89743A] cursor-pointer"
                  >
                    Ver ficha
                  </button>
                  <button
                    type="button"
                    onClick={() => startConversationWithStudent(item.student)}
                    className="px-3 py-1.5 bg-[var(--brand-navy)] text-white rounded-lg text-xs font-semibold hover:opacity-90 cursor-pointer flex items-center gap-1.5"
                  >
                    <ChatCircleDots size={15} weight="bold" />
                    <span>Enviar mensaje</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Sugerencias con IA: no disponibles (no hay servicio de IA institucional) */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <Sparkle size={18} className="text-[var(--text-muted)]" />
          <h2 className="font-heading font-bold text-sm text-[var(--text-primary)] uppercase tracking-wide">
            Sugerencias con IA · No disponible
          </h2>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Esta versión no envía datos de alumnos a servicios de IA. Para incorporarlo hace falta autorización institucional y
          cumplir la Ley de Protección de Datos Personales N° 25.326. Las decisiones sobre regularidad y justificaciones son
          de Preceptoría, docentes y Bedelía.
        </p>
      </section>
    </div>
  );
};
