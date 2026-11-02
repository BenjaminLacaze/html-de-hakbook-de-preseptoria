/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Info, ShieldWarning, X } from '@phosphor-icons/react';
import { buildRuleTexts, lateWeightLabel, PENDING_BEDELIA_RULES } from '../../config/bedeliaRules';
import { usePreceptor } from '../../context/PreceptorContext';

export const RuleBadge: React.FC<{
  type?: 'condicionLibre' | 'condicionEnRiesgo' | 'formulaPresentismo' | 'general';
  compact?: boolean;
}> = ({ type = 'general', compact = false }) => {
  const [showModal, setShowModal] = useState(false);
  const { ruleSettings } = usePreceptor();
  const texts = buildRuleTexts(ruleSettings);

  let explanation = texts.avisoInstitucional;
  if (type === 'condicionLibre') explanation = texts.condicionLibre;
  if (type === 'condicionEnRiesgo') explanation = texts.condicionEnRiesgo;
  if (type === 'formulaPresentismo') explanation = texts.formulaPresentismo;

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1 font-mono-data text-xs rounded border border-[#AF9B63]/60 bg-[#AF9B63]/10 text-[#89743A] hover:bg-[#AF9B63]/20 transition-colors cursor-pointer ${
          compact ? 'px-1.5 py-0.5' : 'px-2 py-0.5'
        }`}
        title="Ver la regla institucional de asistencia"
      >
        <Info size={13} weight="bold" className="shrink-0" />
        <span className="font-medium">Regla institucional</span>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rule-modal-title"
        >
          <div className="relative w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-[#89743A]">
                <ShieldWarning size={20} weight="fill" />
                <h4 id="rule-modal-title" className="font-heading font-bold text-sm text-[var(--text-primary)]">
                  Regla institucional de asistencia
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-md"
                aria-label="Cerrar diálogo"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-xs text-[var(--text-secondary)] space-y-3 font-sans">
              <p className="bg-[#AF9B63]/10 p-3 rounded-lg border border-[#AF9B63]/30 text-[var(--text-primary)] font-medium leading-relaxed">
                {explanation}
              </p>

              {ruleSettings && (
                <div className="space-y-1.5 text-xs text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-3">
                  <p>
                    <strong>Asistencia mínima:</strong> {ruleSettings.minAttendancePercent}% por materia. Debajo de eso el
                    alumno figura <em>por debajo del mínimo</em> (en pantalla: "Libre").
                  </p>
                  <p>
                    <strong>En riesgo:</strong> desde {ruleSettings.minAttendancePercent}% y por debajo de{' '}
                    {ruleSettings.attendanceRiskThresholdPercent}%.
                  </p>
                  <p>
                    <strong>Tardanzas:</strong> {lateWeightLabel(ruleSettings.lateArrivalAbsenceWeight)} (valor pendiente de
                    decisión institucional).
                  </p>
                  <p>
                    <strong>Faltas justificadas:</strong> no cuentan para el porcentaje.
                  </p>
                </div>
              )}

              <div className="space-y-1 text-[11px] text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-3">
                <p className="font-semibold text-[var(--text-secondary)]">Pendiente de confirmar con Bedelía (no se aplica):</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {PENDING_BEDELIA_RULES.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </div>

              <p className="text-[11px] text-[var(--text-muted)] italic">
                * Los porcentajes y condiciones los calcula el sistema institucional; este panel solo los muestra.
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 bg-[var(--brand-navy)] text-white text-xs font-medium rounded-lg hover:opacity-90"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const FormulaTooltip: React.FC<{ formulaText?: string }> = ({ formulaText }) => {
  const [show, setShow] = useState(false);
  const { ruleSettings } = usePreceptor();
  const texts = buildRuleTexts(ruleSettings);

  return (
    <div className="relative inline-block align-middle ml-1">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-[var(--text-muted)] hover:text-[#3F78B6] transition-colors p-0.5 rounded cursor-help"
        aria-label="Ver fórmula de cálculo"
      >
        <Info size={14} weight="bold" />
      </button>

      {show && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-40 w-64 p-2.5 bg-[var(--brand-navy)] text-white text-xs rounded-lg shadow-lg pointer-events-none normal-case font-sans text-left"
          role="tooltip"
        >
          <p className="font-mono-data text-[11px] text-[#AF9B63] font-semibold mb-1">FÓRMULA INSTITUCIONAL</p>
          <p className="leading-tight mb-1">{formulaText ?? texts.formulaPresentismo}</p>
          {texts.notaTardanza && <p className="text-[10px] text-slate-300 italic">{texts.notaTardanza}</p>}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[var(--brand-navy)]" />
        </div>
      )}
    </div>
  );
};
