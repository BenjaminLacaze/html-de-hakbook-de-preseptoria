/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { Warning, X, Check } from '@phosphor-icons/react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  changesSummary?: { label: string; value: string }[];
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  changesSummary,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDestructive = false,
  onConfirm,
  onCancel,
  children,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      confirmBtnRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div 
        ref={dialogRef}
        className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-start gap-4">
          <div 
            className={`p-2.5 rounded-lg shrink-0 ${
              isDestructive 
                ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400' 
                : 'bg-[#89743A]/15 text-[#89743A]'
            }`}
          >
            <Warning size={24} weight="bold" />
          </div>

          <div className="flex-1">
            <h3 id="confirm-dialog-title" className="font-heading font-bold text-base text-[var(--text-primary)]">
              {title}
            </h3>
            <p id="confirm-dialog-desc" className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
              {description}
            </p>

            {changesSummary && changesSummary.length > 0 && (
              <div className="mt-3.5 bg-[var(--bg-page)] rounded-lg border border-[var(--border-subtle)] p-3 text-xs space-y-1.5">
                <span className="font-semibold text-[var(--text-primary)] block mb-1">
                  Resumen de cambios a registrar:
                </span>
                {changesSummary.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[var(--text-secondary)]">
                    <span>{item.label}:</span>
                    <strong className="text-[var(--text-primary)] font-mono-data">{item.value}</strong>
                  </div>
                ))}
              </div>
            )}

            {children && <div className="mt-3">{children}</div>}

            <div className="mt-2 text-[11px] text-[var(--text-muted)] italic">
              * Se guarda en el sistema institucional del ISFDyT N° 26.
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-md"
            aria-label="Cerrar diálogo"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-[var(--brand-navy)] text-[var(--brand-navy)] bg-white dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              isDestructive 
                ? 'bg-red-700 hover:bg-red-800' 
                : 'bg-[var(--cta-btn)] hover:bg-[var(--cta-btn-hover)]'
            }`}
          >
            <Check size={16} weight="bold" />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
