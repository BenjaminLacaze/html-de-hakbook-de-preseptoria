/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Barra superior Navy para móvil (<1024px)
 */

import React, { useState } from 'react';
import { Bell, User, SignOut, Palette, UsersThree, Megaphone, VideoCamera } from '@phosphor-icons/react';
import { useCentro } from '../../context/CentroContext';
import { Dialog } from '../common/Dialog';
import { ISOTIPO_NEGATIVO_SVG, LOGO_NEGATIVO_PNG } from '../../lib/assets';

export const MobileTopBar: React.FC = () => {
  const {
    currentUser,
    notifications,
    setOpenNotificationDrawer,
    setCurrentScreen,
    setOpenLogoutModal,
    setShowPresentation,
  } = useCentro();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.leida).length;

  return (
    <>
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-3 py-2 bg-brand-navy text-white shadow-xs border-b border-[#1C2E6B]">
        {/* Brand lockup móvil con el ícono oficial */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#14214F] border border-[#AF9B63] p-1 flex items-center justify-center shrink-0 shadow-sm">
            <img
              src={LOGO_NEGATIVO_PNG}
              alt="Centro de Estudiantes"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = ISOTIPO_NEGATIVO_SVG;
              }}
            />
          </div>
          <div>
            <div className="text-xs font-heading font-extrabold text-white uppercase tracking-tight leading-tight">
              ISFDyT N° 26
            </div>
            <div className="text-[9.5px] font-heading font-bold text-[#AF9B63] uppercase tracking-wider leading-tight">
              CENTRO DE ESTUDIANTES
            </div>
          </div>
        </div>

        {/* Right actions: Bell + Profile Trigger */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setOpenNotificationDrawer(true)}
            aria-label={`Notificaciones (${unreadCount} sin leer)`}
            className="relative p-2.5 text-white/80 hover:text-white rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          >
            <Bell weight="bold" className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-white font-mono">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setProfileMenuOpen(true)}
            aria-label="Abrir menú de usuario"
            className="p-1 rounded-full border border-brand-gold/60 hover:border-brand-gold min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          >
            <div className="w-8 h-8 rounded-full bg-brand-gold text-white font-bold text-xs flex items-center justify-center">
              {currentUser.iniciales}
            </div>
          </button>
        </div>
      </header>

      {/* Modal / Menú de perfil para móvil con las opciones que no están en la barra inferior */}
      <Dialog
        isOpen={profileMenuOpen}
        onClose={() => setProfileMenuOpen(false)}
        title="Menú del Centro"
        description="Gestión y accesos complementarios del módulo"
        maxWidth="sm"
      >
        <div className="space-y-4">
          {/* User card summary */}
          <div className="p-3.5 bg-surface rounded-xl border border-border-subtle flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-brand-navy text-brand-gold-sand font-bold text-sm flex items-center justify-center shrink-0">
              {currentUser.iniciales}
            </div>
            <div className="min-w-0">
              <div className="font-heading font-bold text-foreground text-sm truncate">
                {currentUser.nombre}
              </div>
              <div className="text-xs font-semibold text-brand-gold truncate">
                {currentUser.cargo || 'Integrante del Centro'}
              </div>
              <div className="text-[11px] text-foreground-muted truncate">
                {currentUser.email}
              </div>
            </div>
          </div>

          {/* Quick links to screens not in bottom bar */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                setCurrentScreen('comunicados');
                setProfileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm text-foreground hover:bg-surface-hover text-left min-h-[44px]"
            >
              <Megaphone weight="bold" className="w-5 h-5 text-brand-navy dark:text-brand-gold-sand" />
              <span>Comunicados y Cartelera</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentScreen('miembros');
                setProfileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm text-foreground hover:bg-surface-hover text-left min-h-[44px]"
            >
              <UsersThree weight="bold" className="w-5 h-5 text-brand-navy dark:text-brand-gold-sand" />
              <span>Miembros del Centro</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentScreen('perfil');
                setProfileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm text-foreground hover:bg-surface-hover text-left min-h-[44px]"
            >
              <Palette weight="bold" className="w-5 h-5 text-brand-gold" />
              <span>Apariencia, Temas y Accesibilidad</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setProfileMenuOpen(false);
                setShowPresentation(true);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-semibold text-brand-gold hover:bg-surface-hover text-left min-h-[44px]"
            >
              <VideoCamera weight="bold" className="w-5 h-5 text-brand-gold" />
              <span>Ver Video Presentación</span>
            </button>
          </div>

          <div className="pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => {
                setProfileMenuOpen(false);
                setOpenLogoutModal(true);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left min-h-[44px]"
            >
              <SignOut weight="bold" className="w-5 h-5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
};
