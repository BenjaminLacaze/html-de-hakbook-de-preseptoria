/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from "vitest";
import {
  calcularAsistenciaMateria,
  calcularAsistenciaGlobal,
  calcularMetricasPanel,
} from "./metrics";
import { formatFecha, formatFechaCorta, formatFechaLarga, parseLocalDate } from "./dateUtils";
import {
  MOCK_ASISTENCIAS,
  MOCK_MATERIAS,
  MOCK_EVALUACIONES,
  MOCK_AVISOS,
  MOCK_ALUMNO,
} from "../../mocks/dataset";
import { REGLAS_ASISTENCIA } from "./attendanceRules";

describe("Módulo de Métricas y Cálculos de Asistencia (A1, A2)", () => {
  it("debe contar con exactamente 84 registros atómicos en el mock de clases dictadas", () => {
    expect(MOCK_ASISTENCIAS.length).toBe(84);
  });

  it("debe calcular la asistencia global de forma idéntica a la suma agregada de materias", () => {
    const global = calcularAsistenciaGlobal(MOCK_ASISTENCIAS);

    expect(global.totalClases).toBe(84);

    let sumPresentes = 0;
    let sumAusentes = 0;
    let sumTardanzas = 0;
    let sumJustificadas = 0;

    MOCK_MATERIAS.forEach((m) => {
      const matMetrics = calcularAsistenciaMateria(m.id, MOCK_ASISTENCIAS);
      sumPresentes += matMetrics.presentes;
      sumAusentes += matMetrics.ausentes;
      sumTardanzas += matMetrics.tardanzas;
      sumJustificadas += matMetrics.justificadas;
      expect(matMetrics.totalClases).toBe(
        matMetrics.presentes + matMetrics.ausentes + matMetrics.tardanzas + matMetrics.justificadas
      );
    });

    expect(sumPresentes).toBe(global.presentes);
    expect(sumAusentes).toBe(global.ausentes);
    expect(sumTardanzas).toBe(global.tardanzas);
    expect(sumJustificadas).toBe(global.justificadas);
    expect(sumPresentes + sumAusentes + sumTardanzas + sumJustificadas).toBe(84);
  });

  it("aplica la regla de asistencia explícita (tardanza = presente, justificada = computable)", () => {
    const metricas = calcularAsistenciaGlobal(MOCK_ASISTENCIAS);
    const computables = metricas.presentes + metricas.tardanzas + metricas.justificadas;
    const esperadoPct = Math.round((computables / 84) * 100 * 10) / 10;

    expect(metricas.porcentaje).toBe(esperadoPct);
    expect(metricas.porcentajeTexto).toBe(esperadoPct.toFixed(1));
    expect(REGLAS_ASISTENCIA.porcentajeMinimoRegularidad).toBe(80);
    expect(REGLAS_ASISTENCIA.porcentajeMinimoPromocion).toBe(85);
  });

  it("debe calcular métricas del panel con pureza y sin mutación de estado", () => {
    const panel = calcularMetricasPanel({
      registros: MOCK_ASISTENCIAS,
      materias: MOCK_MATERIAS,
      evaluaciones: MOCK_EVALUACIONES,
      avisos: MOCK_AVISOS,
    });

    expect(panel.materiasActivas).toBe(MOCK_MATERIAS.length);
    expect(panel.asistenciaGlobal.totalClases).toBe(84);
    expect(panel.inasistenciasTotales).toBe(panel.asistenciaGlobal.ausentes);
  });
});

describe("Gestión de Fechas y Prevención de Desplazamientos UTC (A3)", () => {
  it("formatea '2026-11-16' exactamente como '16/11/2026' en hora local", () => {
    const res = formatFecha("2026-11-16");
    expect(res).toBe("16/11/2026");
  });

  it("parseLocalDate descompone la fecha sin desplazamiento de día hacia atrás", () => {
    const d = parseLocalDate("2026-05-18");
    expect(d.getDate()).toBe(18);
    expect(d.getMonth()).toBe(4); // mayo (0-indexed)
    expect(d.getFullYear()).toBe(2026);
  });

  it("formatFechaCorta produce el día y mes abreviado correcto", () => {
    const res = formatFechaCorta("2026-03-24");
    expect(res.dia).toBe("24");
    expect(res.mes).toBe("MAR");
  });

  it("formatFechaLarga formatea en lenguaje natural institucional en español", () => {
    const res = formatFechaLarga("2026-11-16");
    expect(res).toContain("16 de noviembre de 2026");
  });
});

describe("Coherencia de Trayectoria Institucional (A4)", () => {
  it("el alumno Julián Cámara ingresó en marzo 2025 y cursa 2° año en 2026", () => {
    expect(MOCK_ALUMNO.fechaIngreso).toBe("15/03/2025");
    expect(MOCK_ALUMNO.anio).toBe(2);
    expect(MOCK_ALUMNO.legajo).toBe("2025-ISFD26-0842");
    expect(MOCK_ALUMNO.nombre).toBe("Julián");
    expect(MOCK_ALUMNO.apellido).toBe("Cámara");
  });
});
