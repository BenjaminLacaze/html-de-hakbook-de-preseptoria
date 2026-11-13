// Cálculo único del resumen de asistencia (lo usan /attendance/summary y /me/*).
// Regla institucional en institution_settings: mínimo de asistencia, peso de la llegada tarde
// y umbral de riesgo. Las faltas con justificación aprobada no cuentan en contra.
import type { AttendanceSummary } from '../../shared/types.js';
import { prisma } from './db.js';

/** ¿La justificación cubre esa clase? Sin materia, cubre todas las materias de esas fechas. */
export const covers = (j: { fromDate: Date; toDate: Date; subjectId: string | null }, date: Date, subjectId: string) =>
  j.fromDate <= date && j.toDate >= date && (!j.subjectId || j.subjectId === subjectId);

export async function attendanceSummary(studentId: string, commissionId?: string): Promise<AttendanceSummary> {
  const settings = await prisma.institutionSettings.findUnique({ where: { id: 1 } });
  const min = settings?.minAttendancePercent ?? 75;
  const lateWeight = Number(settings?.lateArrivalAbsenceWeight ?? 0);
  const riskAt = settings?.attendanceRiskThresholdPercent ?? 80;

  const records = await prisma.attendanceRecord.findMany({
    where: { studentId, ...(commissionId ? { session: { commissionId } } : {}) },
    include: { session: { include: { commission: { select: { subjectId: true } } } } },
  });
  const justs = records.length
    ? await prisma.justification.findMany({ where: { studentId, status: 'APPROVED' } })
    : [];
  const isJustified = (d: Date, subjectId: string) => justs.some((j) => covers(j, d, subjectId));

  let present = 0, absent = 0, late = 0, justified = 0;
  for (const r of records) {
    if (r.status === 'PRESENT') present++;
    else if (r.status === 'LATE') late++;
    else if (isJustified(r.session.date, r.session.commission.subjectId)) justified++;
    else absent++;
  }
  const counted = records.length - justified;
  const attendedUnits = present + late * (1 - lateWeight);
  const percentage = counted > 0 ? Math.round((attendedUnits / counted) * 1000) / 10 : 100;
  const allowedAbsences = Math.floor(counted * (1 - min / 100));
  const usedAbsences = absent + late * lateWeight;
  return {
    studentId,
    commissionId,
    totalSessions: records.length,
    presentCount: present,
    absentCount: absent,
    lateCount: late,
    justifiedAbsenceCount: justified,
    percentage,
    minimumRequired: min,
    risk: percentage < min ? 'BELOW_MINIMUM' : percentage < riskAt ? 'AT_RISK' : 'OK',
    remainingAbsencesAllowed: Math.max(0, Math.floor(allowedAbsences - usedAbsences)),
  };
}
