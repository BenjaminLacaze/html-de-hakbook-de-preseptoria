/**
 * Servicio de lógica de negocio y cálculo de estadísticas de asistencia
 * Sistema de Asistencia Escolar - Módulo Alumno
 * Responsable: Lucia Salgado
 */

import { AttendanceRecord, AttendanceStatistics, AttendanceFilters, EnrollmentStatus } from '../types';

/**
 * Calcula las estadísticas de asistencia a partir de una lista de registros
 *
 * REGLA INSTITUCIONAL IMPLEMENTADA:
 * - Jornada computada: Cada registro oficial representa una jornada/módulo académico.
 * - Ponderación:
 *   * PRESENTE: 1.0 unidad de asistencia computable.
 *   * TARDE: 0.5 unidades de asistencia (según régimen académico técnico, dos llegadas tarde equivalen a media inasistencia).
 *   * JUSTIFICADO: Ausencia respaldada legalmente por certificado. No suma falta injustificada.
 *   * AUSENTE: 0.0 unidades de asistencia computable.
 * - Fórmula:
 *   Porcentaje = (Unidades Computables de Asistencia / Total de Jornadas Computables) * 100
 */
export function calculateAttendanceStatistics(
  records: AttendanceRecord[],
  minimumRegularityRequired: number = 75
): AttendanceStatistics {
  const totalSessions = records.length;

  if (totalSessions === 0) {
    return {
      totalSessions: 0,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      justifiedCount: 0,
      computableAttendanceUnits: 0,
      computableTotalUnits: 0,
      percentage: 100,
      regularityStatus: 'REGULAR',
      remainingAbsencesAllowed: 0
    };
  }

  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let justifiedCount = 0;

  for (const record of records) {
    switch (record.status) {
      case 'PRESENTE':
        presentCount++;
        break;
      case 'AUSENTE':
        absentCount++;
        break;
      case 'TARDE':
        lateCount++;
        break;
      case 'JUSTIFICADO':
        justifiedCount++;
        break;
    }
  }

  // Unidades asistidas: Presente (1.0) + Tarde (0.5) + Justificado (se contempla justificado como respaldo)
  // En el cómputo estricto de asistencia a clase:
  const computableAttendanceUnits = (presentCount * 1.0) + (lateCount * 0.5) + (justifiedCount * 0.5);
  const computableTotalUnits = totalSessions;

  const rawPercentage = (computableAttendanceUnits / computableTotalUnits) * 100;
  const percentage = Math.round(rawPercentage * 10) / 10; // 1 decimal

  let regularityStatus: EnrollmentStatus = 'REGULAR';
  if (percentage < minimumRegularityRequired) {
    regularityStatus = percentage >= 60 ? 'EN_RIESGO' : 'LIBRE';
  }

  // Margen de inasistencias antes de caer por debajo del 75%
  // Formula: (computableAttendanceUnits) / (totalSessions + X) >= 0.75
  // Para simplificar al alumno: cuántas inasistencias más tolera manteniendo >= 75%
  const maxPossibleSessionsForCurrentAttendance = computableAttendanceUnits / (minimumRegularityRequired / 100);
  const remainingAbsences = Math.max(0, Math.floor(maxPossibleSessionsForCurrentAttendance - totalSessions));

  return {
    totalSessions,
    presentCount,
    absentCount,
    lateCount,
    justifiedCount,
    computableAttendanceUnits,
    computableTotalUnits,
    percentage,
    regularityStatus,
    remainingAbsencesAllowed: remainingAbsences
  };
}

/**
 * Filtra registros según los criterios establecidos por el alumno
 */
export function filterAttendanceRecords(
  records: AttendanceRecord[],
  filters: AttendanceFilters
): AttendanceRecord[] {
  return records.filter((rec) => {
    // 1. Filtro por período
    if (filters.period === '1C' && rec.academicPeriod !== '1C') {
      return false;
    }
    if (filters.period === '2C' && rec.academicPeriod !== '2C') {
      return false;
    }
    if (filters.period === 'MONTH' && filters.selectedMonth !== undefined) {
      const recordDate = new Date(rec.date + 'T00:00:00');
      if (recordDate.getMonth() !== filters.selectedMonth) {
        return false;
      }
    }

    // 2. Filtro por estado
    if (filters.status !== 'ALL' && rec.status !== filters.status) {
      return false;
    }

    // 3. Filtro por rango de fechas
    if (filters.startDate && rec.date < filters.startDate) {
      return false;
    }
    if (filters.endDate && rec.date > filters.endDate) {
      return false;
    }

    // 4. Búsqueda textual
    if (filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      const inSubject = rec.subjectName.toLowerCase().includes(q);
      const inObs = (rec.observation || '').toLowerCase().includes(q);
      const inPreceptor = (rec.preceptorNote || '').toLowerCase().includes(q);
      const inRegisteredBy = rec.registeredBy.toLowerCase().includes(q);
      const inDate = rec.date.includes(q);

      if (!inSubject && !inObs && !inPreceptor && !inRegisteredBy && !inDate) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Formatea una fecha ISO (YYYY-MM-DD) a formato legible en español
 */
export function formatDateDisplay(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const dateObj = new Date(year, month, day);
  return dateObj.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}
