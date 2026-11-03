/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Check,
  Clock,
  FilePdf,
  FileImage,
  WarningCircle,
  User,
  Checks
} from '@phosphor-icons/react';
import { usePreceptor } from '../../context/PreceptorContext';
import { JustificationRequest } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { FilterChip } from '../common/FilterChip';
import { RuleBadge } from '../common/RuleBadge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { CertificateViewerModal } from '../common/CertificateViewerModal';
import { toast } from 'sonner';
import { CERTIFICATE_LABELS } from '../../api';

export const JustificacionesScreen: React.FC = () => {
  const {
    justificacionesTab,
    setJustificacionesTab,
    justifications,
    approveJustification,
    rejectJustification,
    batchApproveJustifications,
    openStudentProfile,
    students
  } = usePreceptor();

  // Multi-selection state for manual batch approval
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Certificate Viewer Modal
  const [activeCertificate, setActiveCertificate] = useState<JustificationRequest | null>(null);

  // Approval confirmation modal
  const [approvingItem, setApprovingItem] = useState<JustificationRequest | null>(null);

  // Rejection modal with mandatory reason
  const [rejectingItem, setRejectingItem] = useState<JustificationRequest | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');

  // Batch approve confirm modal
  const [showBatchConfirm, setShowBatchConfirm] = useState<boolean>(false);

  // Filtered and sorted list:
  // "Las pendientes, de la más antigua a la más nueva."
  const displayedRequests = useMemo(() => {
    const targetStatus =
      justificacionesTab === 'pendientes' ? 'pendiente' :
      justificacionesTab === 'aprobadas' ? 'aprobada' : 'rechazada';
    const filtered = justifications.filter(j => j.status === targetStatus);
    if (justificacionesTab === 'pendientes') {
      return [...filtered].sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
    }
    return filtered;
  }, [justifications, justificacionesTab]);

  const counts = useMemo(() => {
    return {
      pendientes: justifications.filter(j => j.status === 'pendiente').length,
      aprobadas: justifications.filter(j => j.status === 'aprobada').length,
      rechazadas: justifications.filter(j => j.status === 'rechazada').length,
    };
  }, [justifications]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === displayedRequests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedRequests.map(r => r.id));
    }
  };

  const [busy, setBusy] = useState<boolean>(false);

  const handleConfirmSingleApprove = async () => {
    if (!approvingItem) return;
    const id = approvingItem.id;
    setApprovingItem(null);
    setBusy(true);
    await approveJustification(id);
    setBusy(false);
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    if (!rejectionReasonInput.trim()) {
      toast.error("El motivo de rechazo es obligatorio para fundamentar la respuesta al alumno.");
      return;
    }
    const id = rejectingItem.id;
    const reason = rejectionReasonInput.trim();
    setRejectingItem(null);
    setRejectionReasonInput('');
    setBusy(true);
    await rejectJustification(id, reason);
    setBusy(false);
  };

  const handleConfirmBatchApprove = async () => {
    const ids = selectedIds;
    setSelectedIds([]);
    setShowBatchConfirm(false);
    setBusy(true);
    await batchApproveJustifications(ids);
    setBusy(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* 1. Header */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-data text-[#89743A] uppercase font-semibold">
                REGULARIZACIÓN Y FALTAS
              </span>
              <RuleBadge compact type="condicionLibre" />
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-[var(--text-primary)] mt-1">
              Gestión de <span className="text-[#89743A]">Justificaciones</span>
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Revisión de certificados médicos, laborales y de fuerza mayor presentados por los estudiantes.
            </p>
          </div>

          {/* Batch Actions if items selected */}
          {justificacionesTab === 'pendientes' && selectedIds.length > 0 && (
            <div className="flex items-center gap-2 bg-[#89743A]/10 border border-[#89743A]/30 p-2 px-3 rounded-lg">
              <span className="text-xs font-semibold text-[#89743A]">
                {selectedIds.length} seleccionadas
              </span>
              <button
                type="button"
                onClick={() => setShowBatchConfirm(true)}
                className="px-3 py-1.5 bg-[#89743A] hover:bg-[#73612F] text-white text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer"
              >
                Aprobar lote
              </button>
            </div>
          )}
        </div>

        {/* Tabs: Pendientes, Aprobadas, Rechazadas */}
        <div className="flex items-center gap-2 flex-wrap" role="tablist">
          <FilterChip
            label="Pendientes (más antiguas primero)"
            active={justificacionesTab === 'pendientes'}
            onClick={() => {
              setJustificacionesTab('pendientes');
              setSelectedIds([]);
            }}
            count={counts.pendientes}
          />
          <FilterChip
            label="Aprobadas"
            active={justificacionesTab === 'aprobadas'}
            onClick={() => {
              setJustificacionesTab('aprobadas');
              setSelectedIds([]);
            }}
            count={counts.aprobadas}
          />
          <FilterChip
            label="Rechazadas"
            active={justificacionesTab === 'rechazadas'}
            onClick={() => {
              setJustificacionesTab('rechazadas');
              setSelectedIds([]);
            }}
            count={counts.rechazadas}
          />
        </div>
      </section>

      {/* 2. Requests List */}
      <section className="space-y-3">
        {justificacionesTab === 'pendientes' && displayedRequests.length > 0 && (
          <div className="flex items-center justify-between px-2 text-xs text-[var(--text-muted)]">
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={selectedIds.length === displayedRequests.length && displayedRequests.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded text-[#89743A] focus:ring-[#89743A]"
              />
              <span>Seleccionar todas para aprobación por lote manual</span>
            </label>
            <span className="font-mono-data">{busy ? 'Guardando…' : 'Plazo de presentación: pendiente de confirmar con Bedelía'}</span>
          </div>
        )}

        <div className="space-y-3">
          {displayedRequests.map(req => {
            const isSelected = selectedIds.includes(req.id);
            const student = students.find(s => s.id === req.studentId);

            return (
              <div
                key={req.id}
                className={`p-4 bg-[var(--bg-surface)] border rounded-xl shadow-2xs transition-all ${
                  isSelected
                    ? 'border-[#89743A] ring-1 ring-[#89743A]/40 bg-[#AF9B63]/5'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Checkbox & Student info */}
                  <div className="flex items-start gap-3">
                    {justificacionesTab === 'pendientes' && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(req.id)}
                        className="w-4 h-4 rounded text-[#89743A] focus:ring-[#89743A] mt-1 cursor-pointer"
                        aria-label={`Seleccionar justificación de ${req.studentName}`}
                      />
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => student && openStudentProfile(student)}
                          className="font-heading font-bold text-base text-[var(--text-primary)] hover:text-[#89743A] hover:underline text-left cursor-pointer"
                        >
                          {req.studentName}
                        </button>
                        <span className="font-mono-data text-xs text-[var(--text-muted)] bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] px-2 py-0.5 rounded">
                          {req.legajo}
                        </span>
                        <StatusBadge status={req.status} size="sm" />
                      </div>

                      <div className="text-xs text-[var(--text-secondary)] space-y-0.5">
                        <p>
                          Materia: <strong>{req.subjectName}</strong> · Falta del <strong className="font-mono-data">{req.absenceDate}</strong>
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          Presentada {req.submittedAgo} · Comprobante: {req.certificateType ? CERTIFICATE_LABELS[req.certificateType] : 'sin tipo indicado'}{req.reviewedAt ? ` · Resuelta el ${req.reviewedAt}` : ''}
                        </p>
                      </div>

                      {/* Motivo declarado */}
                      <div className="mt-2.5 bg-[var(--bg-surface-elevated)] p-3 rounded-lg border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                        <strong className="text-[var(--text-primary)] block mb-0.5">Motivo declarado:</strong>
                        <p className="italic">"{req.reasonDeclared}"</p>
                      </div>

                      {/* Motivo de rechazo (if rejected) */}
                      {req.status === 'rechazada' && req.rejectionReason && (
                        <div className="mt-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-2.5 rounded-lg text-xs text-red-800 dark:text-red-300">
                          <strong>Motivo institucional notificado al alumno:</strong>
                          <p className="mt-0.5">{req.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Certificate Viewer button */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-2.5 shrink-0 pt-2 lg:pt-0">
                    <button
                      type="button"
                      onClick={() => setActiveCertificate(req)}
                      className="w-full sm:w-auto px-3 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] hover:border-[#3F78B6] text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye size={16} weight="bold" className="text-[#3F78B6]" />
                      <span>Ver comprobante</span>
                    </button>

                    {req.status === 'pendiente' && (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setRejectingItem(req)}
                          disabled={busy}
                          className="flex-1 sm:flex-none px-3.5 py-1.5 border border-red-300 text-red-700 dark:border-red-800 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Rechazar
                        </button>
                        <button
                          type="button"
                          onClick={() => setApprovingItem(req)}
                          disabled={busy}
                          className="flex-1 sm:flex-none px-4 py-1.5 bg-[#89743A] hover:bg-[#73612F] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Check size={14} weight="bold" />
                          <span>Aprobar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {displayedRequests.length === 0 && (
            <div className="py-16 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl">
              No hay solicitudes {justificacionesTab} en este momento.
            </div>
          )}
        </div>
      </section>

      {/* Certificate Viewer Modal */}
      <CertificateViewerModal
        request={activeCertificate}
        onClose={() => setActiveCertificate(null)}
      />

      {/* Single Approve Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!approvingItem}
        title="¿Aprobar justificación de inasistencia?"
        description={`Se justificará oficialmente la inasistencia del ${approvingItem?.absenceDate} para ${approvingItem?.studentName} en ${approvingItem?.subjectName}.`}
        confirmLabel="Aprobar y Registrar"
        cancelLabel="Cancelar"
        onConfirm={() => void handleConfirmSingleApprove()}
        onCancel={() => setApprovingItem(null)}
      />

      {/* Batch Approve Confirm Dialog */}
      <ConfirmDialog
        isOpen={showBatchConfirm}
        title="¿Aprobar solicitudes seleccionadas en lote?"
        description={`Estás por aprobar ${selectedIds.length} solicitudes de inasistencia seleccionadas manualmente.`}
        confirmLabel={`Aprobar ${selectedIds.length} solicitudes`}
        cancelLabel="Cancelar"
        onConfirm={() => void handleConfirmBatchApprove()}
        onCancel={() => setShowBatchConfirm(false)}
      />

      {/* Reject Modal with MANDATORY reason */}
      {rejectingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-dialog-title"
        >
          <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[var(--border-subtle)] pb-3">
              <div>
                <h3 id="reject-dialog-title" className="font-heading font-extrabold text-base text-[var(--text-primary)]">
                  Rechazar Justificación
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Estudiante: {rejectingItem.studentName} ({rejectingItem.legajo})
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-[var(--text-secondary)]">
                Para rechazar un comprobante debés ingresar un <strong>motivo respetuoso y claro</strong> que el estudiante leerá en su aplicación oficial.
              </p>

              <div>
                <label className="block text-xs font-heading font-bold uppercase text-[var(--text-muted)] mb-1">
                  Motivo institucional de rechazo (Obligatorio) <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Ej: 'Esta justificación no se pudo aprobar porque el certificado no cuenta con sello del centro de salud'..."
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#3F78B6]"
                  required
                />
              </div>

              <div className="text-[11px] text-[var(--text-muted)] italic">
                * Regla de honestidad: El estudiante será notificado en su panel con el fundamento ingresado.
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="px-4 py-2 border border-[var(--border-strong)] text-[var(--text-secondary)] text-xs font-semibold rounded-lg hover:bg-[var(--bg-surface-elevated)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmReject()}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
