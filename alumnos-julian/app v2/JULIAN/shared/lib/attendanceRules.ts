/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// PENDIENTE DE CONFIRMAR CON BEDELÍA
// Reglas institucionales de cómputo de asistencia académica para el ISFDyT N° 26.
// Basado en el Régimen Académico Marco (Res. N° 4043/09 DGCyE).
export const REGLAS_ASISTENCIA = {
  nombreRegla: "Régimen Académico Marco - Criterio Terciario Provisorio",
  estadoConfiguracion: "PENDIENTE DE CONFIRMAR CON BEDELÍA",
  
  // Ponderación de estados:
  // - Tardanza: se computa como presente para el cálculo porcentual general y se audita de forma diferenciada.
  // - Justificada: no se computa como inasistencia (se descuenta del divisor de clases computables o se toma como cumplida).
  // - Ausente: computa como inasistencia plena.
  ponderacion: {
    presente: 1.0,
    tardanzaEquivalePresente: true,
    justificadaNoComputaAusencia: true,
  },

  // Umbrales de regularidad
  porcentajeMinimoRegularidad: 80, // % requerido de asistencia obligatoria
  porcentajeMinimoPromocion: 85,  // % para acceder a régimen de promoción sin examen final

  // Texto explicativo para tooltips
  formulaTooltip:
    "Fórmula de Asistencia: (Presentes + Tardanzas + Justificadas) / Total Clases Dictadas × 100. Tardanza cuenta como presente; la falta justificada no penaliza el porcentaje.",
} as const;
