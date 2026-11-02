/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Código QR de la clase: abre (o reutiliza) la clase de la comisión en esa fecha
 * y genera un código temporal que el alumno ingresa desde su app.
 */

import React, { useEffect, useState } from 'react';
import { QrCode, X, Prohibit } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { attendanceApi, errorMessage, isoToDisplay } from '../../api';
import type { ApiQrCodeIssued } from '../../api';

interface QrAttendanceModalProps {
  isOpen: boolean;
  commissionId: string;
  subjectName: string;
  date: string; // YYYY-MM-DD
  onClose: () => void;
}

export const QrAttendanceModal: React.FC<QrAttendanceModalProps> = ({ isOpen, commissionId, subjectName, date, onClose }) => {
  const [minutes, setMinutes] = useState(10);
  const [busy, setBusy] = useState(false);
  const [issued, setIssued] = useState<ApiQrCodeIssued | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!issued) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [issued]);

  useEffect(() => {
    if (!isOpen) setIssued(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const remaining = issued ? Math.max(0, Math.round((new Date(issued.expiresAt).getTime() - now) / 1000)) : 0;
  const expired = Boolean(issued) && remaining === 0;

  const generate = async () => {
    setBusy(true);
    try {
      const session = await attendanceApi.openSession(commissionId, date);
      setIssued(await attendanceApi.issueQr(session.id, minutes));
      setNow(Date.now());
    } catch (reason) {
      toast.error('No se pudo generar el código', { description: errorMessage(reason) });
    } finally {
      setBusy(false);
    }
  };

  const revoke = async () => {
    if (!issued) return;
    setBusy(true);
    try {
      await attendanceApi.revokeQr(issued.sessionId);
      setIssued(null);
      toast.info('Código anulado');
    } catch (reason) {
      toast.error('No se pudo anular el código', { description: errorMessage(reason) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" role="dialog" aria-modal="true" aria-labelledby="qr-modal-title">
      <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl p-6 shadow-2xl space-y-4">
        <div className="flex items-start justify-between border-b border-[var(--border-subtle)] pb-3">
          <div>
            <h3 id="qr-modal-title" className="font-heading font-extrabold text-base text-[var(--text-primary)] flex items-center gap-2">
              <QrCode size={20} className="text-[#89743A]" />
              Asistencia por código QR
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {subjectName} · <span className="font-mono-data">{isoToDisplay(date)}</span>
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        {issued && !expired ? (
          <div className="text-center space-y-2">
            <p className="text-xs text-[var(--text-muted)]">Los alumnos ingresan este código en su app:</p>
            <p className="font-mono-data font-extrabold text-4xl tracking-[0.3em] text-[var(--text-primary)] bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl py-4 select-all">
              {issued.code}
            </p>
            <p className="font-mono-data text-xs text-[#89743A] font-semibold" aria-live="polite">
              Vence en {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
            </p>
            <button
              type="button"
              onClick={() => void revoke()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-300 text-red-700 dark:border-red-800 dark:text-red-300 text-xs font-semibold rounded-lg cursor-pointer disabled:opacity-60"
            >
              <Prohibit size={14} weight="bold" />
              <span>Anular código</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            {expired && <p className="text-amber-700 dark:text-amber-300 font-medium">El código anterior venció.</p>}
            <label className="block font-heading font-bold uppercase text-[var(--text-muted)]">
              Vigencia (minutos)
              <input
                type="number"
                min={1}
                max={30}
                value={minutes}
                onChange={(e) => setMinutes(Math.min(30, Math.max(1, Number(e.target.value) || 1)))}
                className="mt-1 w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-lg px-3 py-2 text-xs font-mono-data"
              />
            </label>
            <p className="text-[11px] text-[var(--text-muted)]">
              Generar un código nuevo anula el anterior de esta clase. Los registros por QR aparecen en la planilla al recargarla.
            </p>
            <button
              type="button"
              onClick={() => void generate()}
              disabled={busy}
              className="w-full py-2.5 bg-[#89743A] hover:bg-[#73612F] text-white text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer disabled:opacity-60"
            >
              {busy ? 'Generando…' : 'Generar código'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
