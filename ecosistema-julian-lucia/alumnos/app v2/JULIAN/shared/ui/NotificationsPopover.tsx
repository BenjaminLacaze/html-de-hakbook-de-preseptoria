/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Bell, Check, CheckCircle, Megaphone, Calendar, X, ArrowRight } from "@phosphor-icons/react";
import { NotificacionItem, NavigationSection } from "../types";
import { formatFecha } from "../lib/dateUtils";

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  notificaciones: NotificacionItem[];
  onMarcarLeida: (id: string, referenciaId?: string, tipo?: string) => void;
  onMarcarTodasLeidas: () => void;
  onNavigate: (section: NavigationSection, param?: string) => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  isOpen,
  onClose,
  notificaciones,
  onMarcarLeida,
  onMarcarTodasLeidas,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const noLeidas = notificaciones.filter((n) => !n.leida);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Panel de notificaciones"
      className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16 sm:p-6 sm:pt-20 bg-black/40 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm sm:max-w-md bg-[var(--surface-raised)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-[rgba(20,33,79,0.02)]">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-[#89743A]" />
            <span className="font-bold text-sm text-[var(--text)]">Notificaciones</span>
            {noLeidas.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#B91C1C] text-white">
                {noLeidas.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {noLeidas.length > 0 && (
              <button
                type="button"
                onClick={onMarcarTodasLeidas}
                className="text-xs font-semibold text-[#3F78B6] hover:underline"
              >
                Marcar todas leídas
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Listado */}
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
          {notificaciones.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--text-muted)]">
              No tenés notificaciones pendientes.
            </div>
          ) : (
            notificaciones.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 transition-colors flex items-start justify-between gap-3 ${
                  !notif.leida ? "bg-[rgba(63,120,182,0.06)]" : "hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <div
                  className="flex items-start gap-3 min-w-0 cursor-pointer flex-1"
                  onClick={() => {
                    if (!notif.leida) onMarcarLeida(notif.id, notif.referenciaId, notif.tipo);
                    if (notif.accionSection) onNavigate(notif.accionSection, notif.referenciaId);
                    onClose();
                  }}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      notif.tipo === "aviso"
                        ? "bg-[rgba(137,116,58,0.12)] text-[#89743A]"
                        : "bg-[rgba(63,120,182,0.12)] text-[#3F78B6]"
                    }`}
                  >
                    {notif.tipo === "aviso" ? <Megaphone size={16} /> : <Calendar size={16} />}
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-xs text-[var(--text)] line-clamp-1">{notif.titulo}</h5>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.detalle}
                    </p>
                    <span className="text-xs font-mono text-[var(--text-muted)] opacity-80 mt-1 block">
                      {formatFecha(notif.fecha)}
                    </span>
                  </div>
                </div>

                {!notif.leida && (
                  <button
                    type="button"
                    onClick={() => onMarcarLeida(notif.id, notif.referenciaId, notif.tipo)}
                    title="Marcar como leída"
                    className="p-1 rounded-full text-[var(--text-muted)] hover:text-[#1E7E34] hover:bg-black/5 shrink-0"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
