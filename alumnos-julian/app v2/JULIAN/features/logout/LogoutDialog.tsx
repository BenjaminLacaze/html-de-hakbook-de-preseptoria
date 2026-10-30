/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { SignOut, WarningCircle, X, ArrowLeft, CheckCircle } from "@phosphor-icons/react";
import { AlumnosIcon } from "../../shared/ui/AlumnosIcon";

interface LogoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDemoLogout: () => void;
}

export const LogoutDialog: React.FC<LogoutDialogProps> = ({
  isOpen,
  onClose,
  onConfirmDemoLogout,
}) => {
  const [sessionEnded, setSessionEnded] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setSessionEnded(true);
  };

  const handleReturn = () => {
    setSessionEnded(false);
    onConfirmDemoLogout();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
    >
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 relative">
        {!sessionEnded ? (
          <>
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="w-12 h-12 rounded-full bg-[rgba(20,33,79,0.08)] text-[#14214F] dark:text-[#3F78B6] flex items-center justify-center">
              <SignOut size={24} />
            </div>

            <div className="space-y-1">
              <h3
                className="text-xl font-bold text-[var(--text)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                ¿Cerrar Sesión del Panel?
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Al no haber backend real, esta acción no cierra sesión en el servidor; reinicia la sesión de demostración.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[rgba(137,116,58,0.08)] border border-[rgba(137,116,58,0.25)] text-xs text-[#89743A] leading-relaxed">
              <strong>Regla de honestidad (DEMO):</strong> Toda acción sin backend real se presenta como DEMO, nunca como desconexión de servidor.
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg text-xs font-semibold border border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              >
                Continuar en el Panel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#14214F] text-white hover:bg-[#1D2E68] transition-colors cursor-pointer"
              >
                Cerrar Sesión (Demo)
              </button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-5 py-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#14214F] text-white flex items-center justify-center shadow-md">
              <AlumnosIcon size={36} variant="negativo" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#89743A] font-bold">
                ESTADO DEL NAVEGADOR
              </span>
              <h3
                className="text-2xl font-extrabold text-[var(--text)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Sesión finalizada (demo)
              </h3>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto leading-relaxed">
                La sesión local de Julián Cámara se ha cerrado de forma segura en este dispositivo. Las credenciales y actas oficiales permanecen resguardadas en el Instituto.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleReturn}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-[#14214F] text-white hover:bg-[#1D2E68] transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Volver a entrar al Panel</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
