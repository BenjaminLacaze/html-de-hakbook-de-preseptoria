import React, { useState } from 'react';
import { AttendanceSummary } from '../types/api';
import { StatusBadge } from './StatusBadge';
import { Info, Question } from '@phosphor-icons/react';

interface AttendanceRiskBannerProps {
  summary: AttendanceSummary;
  childName?: string;
}

export const AttendanceRiskBanner: React.FC<AttendanceRiskBannerProps> = ({
  summary,
  childName,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="p-5 md:p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] shadow-xs relative overflow-hidden">
      {/* Indicador de porcentaje destacado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Porcentaje Oficial de Asistencia {childName ? `· ${childName}` : ''}
            </span>
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setShowTooltip(!showTooltip)}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onFocus={() => setShowTooltip(true)}
                onBlur={() => setShowTooltip(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors p-0.5 rounded cursor-pointer"
                aria-label="Ver regla institucional de asistencia"
              >
                <Question className="w-4 h-4 text-[var(--brand-gold)]" weight="bold" />
              </button>

              {/* Tooltip con regla institucional */}
              {showTooltip && (
                <div
                  role="tooltip"
                  className="absolute left-0 bottom-full mb-2 w-72 md:w-80 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-30 border border-slate-700 animate-in fade-in"
                >
                  <p className="font-bold text-amber-300 mb-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 shrink-0" weight="bold" />
                    Regla Institucional de Asistencia
                  </p>
                  <p className="leading-relaxed text-slate-200">
                    {summary.ruleExplanation ||
                      'Régimen Académico Institucional ISFDyT N° 26: Se requiere un 80% mínimo de asistencia en unidades curriculares presenciales. Dos llegadas tarde computan como una falta.'}
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                    * El porcentaje y cómputo de faltas es emitido por el servidor central de preceptoría.
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-4xl md:text-5xl font-black tabular-nums tracking-tight text-[var(--text)]">
              {summary.percentage}%
            </span>
            <div className="flex items-center gap-2">
              <StatusBadge type="risk" value={summary.risk} />
              <span className="text-xs text-[var(--text-muted)]">
                (Mínimo exigido: {summary.minimumRequired}%)
              </span>
            </div>
          </div>
        </div>

        {/* Faltas restantes permitidas */}
        <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-[var(--border)] pt-3 md:pt-0 md:pl-6">
          <span className="text-xs text-[var(--text-muted)]">
            Inasistencias restantes permitidas:
          </span>
          <span className={`text-2xl md:text-3xl font-extrabold tabular-nums mt-0.5 ${
            summary.remainingAbsencesAllowed <= 1 ? 'text-red-600 dark:text-red-400' : 'text-[var(--text)]'
          }`}>
            {summary.remainingAbsencesAllowed}
          </span>
          {summary.risk === 'AT_RISK' && (
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mt-0.5">
              ¡Atención! En zona de riesgo
            </span>
          )}
        </div>
      </div>

      {/* Desglose de asistencias / inasistencias */}
      <div className="mt-5 pt-4 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-2.5 rounded-lg bg-[var(--surface-subtle)]">
          <span className="block text-[11px] font-semibold uppercase text-[var(--text-muted)]">
            Clases Dictadas
          </span>
          <span className="text-lg font-bold tabular-nums text-[var(--text)]">
            {summary.totalSessions}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-[var(--surface-subtle)]">
          <span className="block text-[11px] font-semibold uppercase text-emerald-700 dark:text-emerald-400">
            Presentes
          </span>
          <span className="text-lg font-bold tabular-nums text-emerald-800 dark:text-emerald-300">
            {summary.presentCount}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-[var(--surface-subtle)]">
          <span className="block text-[11px] font-semibold uppercase text-red-700 dark:text-red-400">
            Ausentes
          </span>
          <span className="text-lg font-bold tabular-nums text-red-800 dark:text-red-300">
            {summary.absentCount}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-[var(--surface-subtle)]">
          <span className="block text-[11px] font-semibold uppercase text-amber-700 dark:text-amber-400">
            Tardanzas
          </span>
          <span className="text-lg font-bold tabular-nums text-amber-800 dark:text-amber-300">
            {summary.lateCount}
          </span>
        </div>
      </div>
    </div>
  );
};
