import React from "react";
import { SignOut, X } from "@phosphor-icons/react";

interface LogoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
}

export const LogoutDialog: React.FC<LogoutDialogProps> = ({ isOpen, onClose, onConfirmLogout }) => {
  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="logout-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <section className="relative w-full max-w-md space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-6 shadow-2xl sm:p-8">
        <button type="button" onClick={onClose} aria-label="Cancelar" className="absolute right-5 top-5 rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text)]">
          <X size={20} />
        </button>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#14214F]/10 text-[#14214F] dark:text-[#3F78B6]"><SignOut size={24} /></div>
        <div className="space-y-1">
          <h2 id="logout-title" className="text-xl font-bold text-[var(--text)]" style={{ fontFamily: "var(--font-display)" }}>¿Cerrar sesión del Panel?</h2>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">Se cerrará tu sesión institucional en este navegador.</p>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5">Seguir en el Panel</button>
          <button type="button" onClick={onConfirmLogout} className="rounded-lg bg-[#14214F] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#1D2E68]">Cerrar sesión</button>
        </div>
      </section>
    </div>
  );
};
