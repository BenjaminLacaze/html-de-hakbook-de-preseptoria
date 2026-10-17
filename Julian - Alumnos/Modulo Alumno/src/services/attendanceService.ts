import { apiClient } from '../lib/apiClient';
import { IS_MOCK_MODE, simulateNetworkLatency } from './apiConfig';
import { mockAttendanceRecords } from '../mocks/mockData';
import type { AttendanceRecord } from '../types';

let attendanceStore: AttendanceRecord[] = [...mockAttendanceRecords];

export const attendanceService = {
  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    if (IS_MOCK_MODE) {
      await simulateNetworkLatency(200);
      return [...attendanceStore];
    }
    const { data } = await apiClient.get<AttendanceRecord[]>('/student/attendance');
    return data;
  },

  async requestJustification(recordId: string, reason: string): Promise<AttendanceRecord> {
    if (IS_MOCK_MODE) {
      await simulateNetworkLatency(400);
      const index = attendanceStore.findIndex((r) => r.id === recordId);
      if (index !== -1) {
        attendanceStore[index] = {
          ...attendanceStore[index],
          estadoJustificacion: 'En Revisión',
          justificacionDetalle: reason,
        };
        return { ...attendanceStore[index] };
      }
      throw new Error('Registro de inasistencia no encontrado');
    }
    const { data } = await apiClient.post<AttendanceRecord>(`/student/attendance/${recordId}/justify`, { reason });
    return data;
  },

  async registerQRAttendance(token: string, materiaId: string): Promise<{ success: boolean; message: string; timestamp: string }> {
    if (IS_MOCK_MODE) {
      await simulateNetworkLatency(500);
      const timestamp = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

      // Añadimos el registro local a la demo
      const newRecord: AttendanceRecord = {
        id: `att-demo-${Date.now()}`,
        materiaId: materiaId || 'sub-prog3',
        materiaNombre: 'Programación III',
        fecha: new Date().toISOString().split('T')[0],
        estado: 'Presente',
        metodoRegistro: 'QR Aula',
        observacion: `Presentismo registrado exitosamente vía Token QR Dinámico a las ${timestamp} hs.`,
      };
      attendanceStore = [newRecord, ...attendanceStore];

      return {
        success: true,
        message: `Asistencia validada correctamente para token ${token.slice(0, 8)}...`,
        timestamp,
      };
    }
    const { data } = await apiClient.post('/student/attendance/qr/validate', { token, materiaId });
    return data;
  },
};
