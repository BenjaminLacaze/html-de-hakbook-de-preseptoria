/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RegistroAsistencia, Materia, Evaluacion, Aviso } from "../types";
import { REGLAS_ASISTENCIA } from "./attendanceRules";

export interface MetricasAsistencia {
  totalClases: number;
  presentes: number;
  ausentes: number;
  tardanzas: number;
  justificadas: number;
  porcentaje: number;
  porcentajeTexto: string;
  condicion: "Regular" | "Promoción" | "En Riesgo" | "Sin Datos";
}

/**
 * Función pura: Calcula la asistencia para una materia específica
 * estrictamente a partir de los registros base.
 */
export function calcularAsistenciaMateria(
  materiaId: string,
  registros: RegistroAsistencia[]
): MetricasAsistencia {
  const registrosMateria = registros.filter((r) => r.materiaId === materiaId);
  return calcularMetricasDesdeRegistros(registrosMateria);
}

/**
 * Función pura: Calcula la asistencia general global de todas las materias
 * usando exactamente la misma fórmula que la asistencia por materia.
 */
export function calcularAsistenciaGlobal(
  registros: RegistroAsistencia[]
): MetricasAsistencia {
  return calcularMetricasDesdeRegistros(registros);
}

/**
 * Núcleo unificado de cálculo de asistencia
 */
function calcularMetricasDesdeRegistros(
  registros: RegistroAsistencia[]
): MetricasAsistencia {
  const totalClases = registros.length;
  if (totalClases === 0) {
    return {
      totalClases: 0,
      presentes: 0,
      ausentes: 0,
      tardanzas: 0,
      justificadas: 0,
      porcentaje: 0,
      porcentajeTexto: "0.0",
      condicion: "Sin Datos",
    };
  }

  let presentes = 0;
  let ausentes = 0;
  let tardanzas = 0;
  let justificadas = 0;

  for (const reg of registros) {
    switch (reg.estado) {
      case "presente":
        presentes++;
        break;
      case "ausente":
        ausentes++;
        break;
      case "tardanza":
        tardanzas++;
        break;
      case "justificada":
        justificadas++;
        break;
    }
  }

  // Regla provisoria configurable (REGLAS_ASISTENCIA):
  // - Tardanza = computa como presente en el porcentaje
  // - Justificada = no computa como ausencia (se suma a las asistidas cumplidas)
  const asistenciasComputables = presentes + tardanzas + justificadas;
  const porcentaje = (asistenciasComputables / totalClases) * 100;
  const porcentajeRedondeado = Math.round(porcentaje * 10) / 10;

  let condicion: MetricasAsistencia["condicion"] = "Regular";
  if (porcentajeRedondeado >= REGLAS_ASISTENCIA.porcentajeMinimoPromocion) {
    condicion = "Promoción";
  } else if (porcentajeRedondeado < REGLAS_ASISTENCIA.porcentajeMinimoRegularidad) {
    condicion = "En Riesgo";
  }

  return {
    totalClases,
    presentes,
    ausentes,
    tardanzas,
    justificadas,
    porcentaje: porcentajeRedondeado,
    porcentajeTexto: porcentajeRedondeado.toFixed(1),
    condicion,
  };
}

/**
 * Función pura: Calcula métricas agregadas del panel
 */
export function calcularMetricasPanel(params: {
  registros: RegistroAsistencia[];
  materias: Materia[];
  evaluaciones: Evaluacion[];
  avisos: Aviso[];
}) {
  const { registros, materias, evaluaciones, avisos } = params;

  const asistenciaGlobal = calcularAsistenciaGlobal(registros);
  const examenesProximos = evaluaciones.filter((e) => e.estado === "proxima").length;
  const avisosNoLeidos = avisos.filter((a) => !a.leido).length;
  const materiasActivas = materias.length;

  return {
    asistenciaGlobal,
    inasistenciasTotales: asistenciaGlobal.ausentes,
    tardanzasTotales: asistenciaGlobal.tardanzas,
    justificadasTotales: asistenciaGlobal.justificadas,
    materiasActivas,
    examenesProximos,
    avisosNoLeidos,
  };
}
