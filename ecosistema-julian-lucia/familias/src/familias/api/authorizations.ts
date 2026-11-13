import { apiClient, isoDateTime } from './client';
import { Authorization } from '../types/api';

const toAuthorization = (a: Authorization): Authorization => ({ ...a, respondedAt: isoDateTime(a.respondedAt) });

/** Autorizaciones que pidió la institución (Preceptoría o Directivos) para los hijos a cargo. */
export async function getAuthorizations(): Promise<Authorization[]> {
  return (await apiClient<Authorization[]>('/guardian/authorizations', { method: 'GET' })).map(toAuthorization);
}

/** Se responde una sola vez: si ya estaba respondida, la API devuelve 409. */
export async function respondAuthorization(id: string, responseValue: 'APPROVED' | 'REJECTED'): Promise<Authorization> {
  const updated = await apiClient<Authorization>(`/guardian/authorizations/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ response: responseValue }),
  });
  return toAuthorization(updated);
}
