import { apiClient } from './client';
import { AgendaEvent } from '../types/api';

type AgendaDTO = Omit<AgendaEvent, 'startTime' | 'location'> & { startTime?: string; location?: string };

/** Agenda de un hijo (o de todos): calendario institucional, salidas con autorización y eventos del Centro. */
export async function getChildAgenda(childId?: string, params?: { from?: string; to?: string }): Promise<AgendaEvent[]> {
  const q = new URLSearchParams();
  if (params?.from) q.set('from', params.from);
  if (params?.to) q.set('to', params.to);
  const qs = q.toString();
  const endpoint =
    childId && childId !== 'ALL'
      ? `/guardian/children/${encodeURIComponent(childId)}/agenda${qs ? `?${qs}` : ''}`
      : `/guardian/agenda${qs ? `?${qs}` : ''}`;
  const rows = await apiClient<AgendaDTO[]>(endpoint, { method: 'GET' });
  // Sin hora cargada = actividad de todo el día (startTime vacío; la pantalla muestra "Todo el día").
  return rows.map((e) => ({ ...e, startTime: e.startTime ?? '', location: e.location ?? 'ISFDyT N° 26' }));
}
