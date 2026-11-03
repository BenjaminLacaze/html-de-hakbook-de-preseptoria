/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Reglas de asistencia del ISFDyT N° 26.
 * El porcentaje, el riesgo y las faltas restantes los calcula SIEMPRE el backend
 * (GET /attendance/summary/bulk) con la configuración institucional
 * (GET /records/settings). Esta app solo los muestra: no hay cálculo local.
 */

import type { RuleSettings } from '../types';

export type StudentCondition = 'regular' | 'en_riesgo' | 'libre';

/** OK → regular · AT_RISK → en riesgo · BELOW_MINIMUM → libre (por debajo del mínimo). */
export function riskToCondition(risk: string): StudentCondition {
  if (risk === 'BELOW_MINIMUM') return 'libre';
  if (risk === 'AT_RISK') return 'en_riesgo';
  return 'regular';
}

/**
 * Reglas del prototipo que el backend NO aplica. Se muestran como pendientes
 * de confirmar con Bedelía y no se usan para calcular nada.
 */
export const PENDING_BEDELIA_RULES = [
  'Tope fijo de 5 faltas por materia para quedar libre.',
  'Mínimo de 8 clases dictadas antes de evaluar el porcentaje.',
  'Plazo de 48 h hábiles para presentar certificados.',
];

const pct = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)}%`;

export function lateWeightLabel(weight: number): string {
  if (weight <= 0) return 'La llegada tarde cuenta como presente (no descuenta).';
  if (weight >= 1) return 'La llegada tarde descuenta una falta entera.';
  return `Cada llegada tarde descuenta ${weight.toLocaleString('es-AR')} de falta.`;
}

export function buildRuleTexts(settings: RuleSettings | null) {
  if (!settings) {
    const loading = 'Cargando la configuración institucional…';
    return {
      condicionLibre: loading,
      condicionEnRiesgo: loading,
      formulaPresentismo: loading,
      notaTardanza: '',
      avisoInstitucional: loading,
    };
  }
  const min = settings.minAttendancePercent;
  const risk = settings.attendanceRiskThresholdPercent;
  return {
    condicionLibre: `Por debajo del mínimo: asistencia menor al ${pct(min)} en la materia (las faltas justificadas no se cuentan).`,
    condicionEnRiesgo: `En riesgo: asistencia de ${pct(min)} o más, pero menor al ${pct(risk)}.`,
    formulaPresentismo:
      'Asistencia = (presentes + tardanzas ponderadas) ÷ clases registradas sin contar las faltas justificadas × 100. La calcula el sistema institucional.',
    notaTardanza: lateWeightLabel(settings.lateArrivalAbsenceWeight),
    avisoInstitucional: `Valores tomados de la configuración institucional de ${settings.institutionName}.`,
  };
}
