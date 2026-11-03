import { apiFetch } from '@shared/api';
import type { AttendanceRecordView } from '@shared/types';
import type { AttendanceRecord } from '../types';
import { attendance } from './adapters';
export const attendanceService = { async getAttendanceRecords() { return (await apiFetch<AttendanceRecordView[]>('/me/attendance')).map(attendance); }, async requestJustification(_id: string, _reason: string): Promise<AttendanceRecord> { throw new Error('Las justificaciones las carga Preceptoría. Contactá a tu preceptor.'); }, async registerQRAttendance(_token: string, _id: string): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }> { throw new Error('El backend no admite registro por QR.'); } };
