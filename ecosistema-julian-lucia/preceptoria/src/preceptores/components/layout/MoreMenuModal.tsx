/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  CalendarCheck,
  Megaphone,
  ChatCircleDots,
  ChartLineUp,
  UsersThree,
  Gear,
  User,
  SignOut,
  Sparkle
} from '@phosphor-icons/react';
import { usePreceptor, ScreenId } from '../../context/PreceptorContext';

export const MoreMenuModal: React.FC = () => {
  const {
    isMobileMoreMenuOpen,
    setIsMobileMoreMenuOpen,
    setActiveScreen,
    counts,
    profile
  } = usePreceptor();

  if (!isMobileMoreMenuOpen) return null;

  const handleNav = (screen: ScreenId) => {
    setActiveScreen(screen);
    setIsMobileMoreMenuOpen(false);
  };

  const menuSections = [
    { id: 'historial' as ScreenId, label: 'Historial de asistencia', icon: CalendarCheck, desc: 'Matriz alumnos × fechas y correcciones' },
    { id: 'anuncios' as ScreenId, label: 'Anuncios', icon: Megaphone, desc: 'Comunicados oficiales a cursos' },
    { id: 'mensajes' as ScreenId, label: 'Mensajes con alumnos', icon: ChatCircleDots, desc: 'Bandeja de mensajería directa', badge: counts.unreadMessages },
    { id: 'analisis' as ScreenId, label: 'Análisis y alertas', icon: ChartLineUp, desc: 'Alumnos en riesgo y por debajo del mínimo', badge: counts.atRiskStudents },
    { id: 'comunidad' as ScreenId, label: 'Foros y Centro de Estudiantes', icon: UsersThree, desc: 'Canales de debate y eventos' },
    { id: 'opciones' as ScreenId, label: 'Opciones', icon: Gear, desc: 'Planilla compartida y notificaciones' },
    { id: 'perfil' as ScreenId, label: 'Mi perfil y Apariencia', icon: User, desc: 'Datos del preceptor y 6 temas visuales' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="more-menu-title"
    >
      <div
        className="w-full bg-[var(--bg-surface)] border-t border-[var(--border-strong)] rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
      >
        {/* Handle / Header */}
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#14214F] text-white flex items-center justify-center font-heading font-bold text-xs">
              {`${profile.nombre.charAt(0)}${profile.apellido.charAt(0)}`.toUpperCase()}
            </div>
            <div>
              <h3 id="more-menu-title" className="font-heading font-bold text-sm text-[var(--text-primary)]">
                {profile.nombre} {profile.apellido}
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] font-mono-data">
                {profile.roleLabel} · ISFDyT N° 26
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMoreMenuOpen(false)}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Options List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuSections.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-surface-elevated)] transition-colors text-left border border-transparent hover:border-[var(--border-subtle)]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--brand-navy)]/10 text-[var(--brand-navy)] dark:bg-white/10 dark:text-white shrink-0">
                    <Icon size={20} weight="bold" />
                  </div>
                  <div>
                    <span className="font-heading font-semibold text-sm text-[var(--text-primary)] block">
                      {item.label}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] block">
                      {item.desc}
                    </span>
                  </div>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full font-mono-data text-xs font-bold bg-[#89743A] text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-center text-xs text-[var(--text-muted)]">
          <p className="font-mono-data">ISFDyT N° 26 · Gestión Terciaria</p>
        </div>
      </div>
    </div>
  );
};
