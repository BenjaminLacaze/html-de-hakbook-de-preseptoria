/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Barra superior para escritorio (≥1024px)
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Plus,
  Megaphone,
  CalendarPlus,
  ChatCircleText,
  CaretDown,
} from '@phosphor-icons/react';
import { useCentro } from '../../context/CentroContext';

export const TopBar: React.FC = () => {
  const {
    currentScreen,
    notifications,
    setOpenNotificationDrawer,
    setOpenPublishModal,
    setPublishType,
  } = useCentro();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.leida).length;

  // Screen title format: Section titles in uppercase with brief context
  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'inicio':
        return { pre: 'PANEL GENERAL', main: 'Inicio y Resumen de Gestión' };
      case 'eventos':
        return { pre: 'AGENDA COMUNITARIA', main: 'Agenda de Actividades' };
      case 'comunicados':
        return { pre: 'CARTELERA DIGITAL', main: 'Panel de Comunicados' };
      case 'foros':
        return { pre: 'PARTICIPACIÓN Y DEBATE', main: 'Foros de Moderación' };
      case 'reclamos':
        return { pre: 'ATENCIÓN ESTUDIANTIL', main: 'Bandeja de Reclamos' };
      case 'miembros':
        return { pre: 'EQUIPO DE GESTIÓN', main: 'Miembros del Centro' };
      case 'perfil':
        return { pre: 'CONFIGURACIÓN Y ACCESIBILIDAD', main: 'Mi Perfil y Sistema' };
      default:
        return { pre: 'ISFDyT N° 26', main: 'Centro de Estudiantes' };
    }
  };

  const { pre, main } = getScreenTitle();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="hidden lg:flex items-center justify-between gap-6 px-8 py-3.5 bg-surface-card border-b border-border-subtle sticky top-0 z-20">
      {/* Zone 1: Current context */}
      <div>
        <div className="text-[11px] font-bold text-brand-gold tracking-widest uppercase">
          {pre}
        </div>
        <div className="text-base font-heading font-bold text-foreground">
          {main}
        </div>
      </div>

      {/* Zone 2: Actions & notifications */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          type="button"
          onClick={() => setOpenNotificationDrawer(true)}
          aria-label={`Notificaciones (${unreadCount} sin leer)`}
          className="relative p-2.5 text-foreground-muted hover:text-foreground hover:bg-surface-hover rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
        >
          <Bell weight="bold" className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-white font-mono">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Botón Publicar en dorado ocre #89743A con menú desplegable */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            className="flex items-center gap-2 px-4 py-2 bg-brand-gold hover:bg-[#766330] text-white rounded-lg text-sm font-semibold transition-colors shadow-xs min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue cursor-pointer"
          >
            <Plus weight="bold" className="w-4 h-4" />
            <span>Publicar</span>
            <CaretDown weight="bold" className={`w-3.5 h-3.5 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Menú: Comunicado · Evento · Hilo */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface-card rounded-xl border border-border-subtle shadow-lg py-1.5 z-30 focus:outline-none animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => {
                  setPublishType('comunicado');
                  setOpenPublishModal(true);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-foreground hover:bg-surface-hover text-left min-h-[44px]"
              >
                <div className="p-1.5 rounded-md bg-brand-navy/10 text-brand-navy dark:bg-white/10 dark:text-white">
                  <Megaphone weight="bold" className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold">Nuevo Comunicado</div>
                  <div className="text-[11px] text-foreground-muted">Cartelera digital y novedades</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPublishType('evento');
                  setOpenPublishModal(true);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-foreground hover:bg-surface-hover text-left min-h-[44px]"
              >
                <div className="p-1.5 rounded-md bg-brand-gold/15 text-brand-gold">
                  <CalendarPlus weight="bold" className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold">Nueva Actividad / Evento</div>
                  <div className="text-[11px] text-foreground-muted">Agenda comunitaria y asambleas</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPublishType('hilo');
                  setOpenPublishModal(true);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-foreground hover:bg-surface-hover text-left min-h-[44px]"
              >
                <div className="p-1.5 rounded-md bg-brand-blue/15 text-brand-blue">
                  <ChatCircleText weight="bold" className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold">Nuevo Hilo de Debate</div>
                  <div className="text-[11px] text-foreground-muted">Canal general o propuestas</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
