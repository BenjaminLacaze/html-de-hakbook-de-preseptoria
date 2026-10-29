import type { AttendanceRecord, AttendanceStatistics, AttendanceFilters } from '../types';
import type { AttendanceSummary } from '@shared/types';
export function statisticsFromSummary(s: AttendanceSummary): AttendanceStatistics { return { totalSessions: s.totalSessions, presentCount: s.presentCount, absentCount: s.absentCount, lateCount: s.lateCount, justifiedCount: s.justifiedAbsenceCount, computableAttendanceUnits: s.percentage * (s.totalSessions - s.justifiedAbsenceCount) / 100, computableTotalUnits: s.totalSessions - s.justifiedAbsenceCount, percentage: s.percentage, regularityStatus: s.risk === 'BELOW_MINIMUM' ? 'LIBRE' : s.risk === 'AT_RISK' ? 'EN_RIESGO' : 'REGULAR', remainingAbsencesAllowed: s.remainingAbsencesAllowed }; }
// Vista informativa de un subconjunto filtrado: misma fórmula y configuración del servidor.
export function calculateAttendanceStatistics(records: AttendanceRecord[], minimum = 75, lateWeight = 0, riskAt = 80): AttendanceStatistics {
    const present = records.filter(r => r.status === 'PRESENTE').length, late = records.filter(r => r.status === 'TARDE').length, justified = records.filter(r => r.status === 'JUSTIFICADO').length, absent = records.filter(r => r.status === 'AUSENTE').length;
    const counted = records.length - justified, attended = present + late * (1 - lateWeight), percentage = counted ? Math.round(attended / counted * 1000) / 10 : 100;
    return { totalSessions: records.length, presentCount: present, absentCount: absent, lateCount: late, justifiedCount: justified, computableAttendanceUnits: attended, computableTotalUnits: counted, percentage, regularityStatus: percentage < minimum ? 'LIBRE' : percentage < riskAt ? 'EN_RIESGO' : 'REGULAR', remainingAbsencesAllowed: Math.max(0, Math.floor(Math.floor(counted * (1 - minimum / 100)) - absent - late * lateWeight)) };
}
/**
 * Filtra registros según los criterios establecidos por el alumno
 */
export function filterAttendanceRecords(records: AttendanceRecord[], filters: AttendanceFilters): AttendanceRecord[] {
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
    if (!isoDate)
        return '';
    const parts = isoDate.split('-');
    if (parts.length !== 3)
        return isoDate;
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
