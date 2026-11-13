import { apiClient, isoDateTime } from './client';
import { Justification, DocumentType } from '../types/api';

export interface CreateJustificationPayload {
  fromDate: string;
  toDate: string;
  reason: string;
  documentType: DocumentType;
  documentName: string;
}

interface JustificationDTO {
  id: string;
  childId: string;
  childName: string;
  submissionDate: string;
  fromDate: string;
  toDate: string;
  reason: string;
  documentType?: DocumentType;
  documentName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedAt?: string;
  rejectionReason?: string;
}

const toJustification = (j: JustificationDTO): Justification => ({
  id: j.id,
  childId: j.childId,
  childName: j.childName,
  submissionDate: isoDateTime(j.submissionDate) ?? '',
  fromDate: j.fromDate,
  toDate: j.toDate,
  reason: j.reason,
  documentType: j.documentType ?? 'FORCE_MAJEURE',
  documentName: j.documentName ?? 'Sin comprobante declarado',
  // En la base el estado inicial se llama PENDING; el panel lo muestra como "En revisión".
  status: j.status === 'PENDING' ? 'UNDER_REVIEW' : j.status,
  reviewedAt: isoDateTime(j.reviewedAt),
  rejectionReason: j.rejectionReason,
});

/** Incluye las que presentó la familia, las que pidió el propio alumno y las que cargó Preceptoría. */
export async function getChildJustifications(childId: string): Promise<Justification[]> {
  const rows = await apiClient<JustificationDTO[]>(`/guardian/children/${encodeURIComponent(childId)}/justifications`, { method: 'GET' });
  return rows.map(toJustification);
}

/** Queda en revisión: la aprueba o rechaza Preceptoría desde su panel. */
export async function createJustification(childId: string, payload: CreateJustificationPayload): Promise<Justification> {
  const created = await apiClient<{ id: string }>(`/guardian/children/${encodeURIComponent(childId)}/justifications`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const all = await getChildJustifications(childId);
  return all.find((j) => j.id === created.id) ?? all[0];
}
