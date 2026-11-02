/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Datos del comprobante de una justificación. Todavía no hay almacenamiento de archivos:
 * se muestra el nombre y tipo informados y, si hay URL, se abre en otra pestaña.
 */

import React from 'react';
import { X, ArrowSquareOut, FileText, Info } from '@phosphor-icons/react';
import { JustificationRequest } from '../../types';
import { CERTIFICATE_LABELS } from '../../api';

interface CertificateViewerModalProps {
  request: JustificationRequest | null;
  onClose: () => void;
}

export const CertificateViewerModal: React.FC<CertificateViewerModalProps> = ({ request, onClose }) => {
  if (!request) return null;

  const safeUrl = request.documentUrl && /^https?:\/\//i.test(request.documentUrl) ? request.documentUrl : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-modal-title"
    >
      <div className="w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 px-6 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--brand-navy)] text-white">
          <div className="flex items-center gap-2.5">
            <FileText size={24} weight="fill" className="text-[#AF9B63]" />
            <div>
              <h3 id="cert-modal-title" className="font-heading font-bold text-base leading-none">
                Comprobante de Justificación
              </h3>
              <p className="font-mono-data text-xs text-slate-300 mt-1">
                {request.documentName || 'Sin archivo informado'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors"
            aria-label="Cerrar visor"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-[var(--bg-surface-elevated)] p-3 px-6 border-b border-[var(--border-subtle)] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[var(--text-muted)] block text-[11px]">Estudiante</span>
            <strong className="text-[var(--text-primary)] font-medium truncate block">{request.studentName}</strong>
          </div>
          <div>
            <span className="text-[var(--text-muted)] block text-[11px]">Legajo</span>
            <strong className="text-[var(--text-primary)] font-mono-data">{request.legajo}</strong>
          </div>
          <div>
            <span className="text-[var(--text-muted)] block text-[11px]">Inasistencia</span>
            <strong className="text-[var(--text-primary)] font-mono-data">{request.absenceDate}</strong>
          </div>
          <div>
            <span className="text-[var(--text-muted)] block text-[11px]">Materia</span>
            <strong className="text-[var(--text-primary)] font-medium truncate block">{request.subjectName}</strong>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]">
              <span className="text-[var(--text-muted)] block text-[11px]">Tipo de comprobante</span>
              <strong className="text-[var(--text-primary)]">
                {request.certificateType ? CERTIFICATE_LABELS[request.certificateType] : 'No indicado'}
              </strong>
            </div>
            <div className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]">
              <span className="text-[var(--text-muted)] block text-[11px]">Archivo</span>
              <strong className="text-[var(--text-primary)] break-all">{request.documentName || 'No informado'}</strong>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)]">
            <strong className="text-[var(--text-primary)] block mb-0.5">Motivo declarado:</strong>
            <p className="italic">"{request.reasonDeclared}"</p>
          </div>

          {safeUrl ? (
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#89743A] hover:bg-[#73612F] text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <ArrowSquareOut size={15} weight="bold" />
              <span>Abrir comprobante en otra pestaña</span>
            </a>
          ) : (
            <div className="p-3 rounded-lg border border-[#AF9B63]/40 bg-[#AF9B63]/10 text-[#89743A] flex items-start gap-2">
              <Info size={16} className="shrink-0 mt-0.5" />
              <span>
                El sistema todavía no guarda archivos: el comprobante en papel o digital se revisa por fuera de este panel.
              </span>
            </div>
          )}
        </div>

        <div className="p-3 px-6 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[var(--brand-navy)] text-white text-xs font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
