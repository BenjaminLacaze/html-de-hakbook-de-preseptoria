import { apiClient, isoDateTime } from './client';
import { CorrectionRequest, GuardianProfile } from '../types/api';
import { RELATIONSHIP_LABELS } from './children';

export async function getGuardianProfile(): Promise<GuardianProfile> {
  const p = await apiClient<GuardianProfile>('/guardian/profile', { method: 'GET' });
  return { ...p, children: p.children.map((c) => ({ ...c, relationship: RELATIONSHIP_LABELS[c.relationship] ?? c.relationship })) };
}

interface CorrectionDTO {
  id: string;
  date: string;
  requestedFields: CorrectionRequest['requestedFields'];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const toCorrection = (r: CorrectionDTO): CorrectionRequest => ({
  id: r.id,
  date: isoDateTime(r.date) ?? '',
  requestedFields: r.requestedFields,
  status: r.status === 'APPROVED' ? 'ACCEPTED' : r.status,
});

/** Pedidos de corrección ya enviados (los resuelve Preceptoría o Secretaría). */
export async function getCorrections(): Promise<CorrectionRequest[]> {
  return (await apiClient<CorrectionDTO[]>('/guardian/corrections', { method: 'GET' })).map(toCorrection);
}

/** No cambia la ficha en el momento: queda pendiente hasta que la institución lo acepte. */
export async function submitCorrection(data: { phone?: string; email?: string; address?: string; notes?: string }): Promise<CorrectionRequest> {
  const body = Object.fromEntries(Object.entries(data).filter(([, v]) => typeof v === 'string' && v.trim() !== ''));
  return toCorrection(await apiClient<CorrectionDTO>('/guardian/corrections', { method: 'POST', body: JSON.stringify(body) }));
}
