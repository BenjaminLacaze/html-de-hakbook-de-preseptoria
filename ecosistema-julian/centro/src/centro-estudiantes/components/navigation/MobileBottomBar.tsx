/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Barra inferior fija para móvil con 5 ítems (<1024px)
 */

import React from 'react';
import {
  House,
  CalendarBlank,
  Plus,
  ChatsCircle,
  ChatCircleDots,
} from '@phosphor-icons/react';
import { useCentro } from '../../context/CentroContext';
import { ScreenId } from '../../types';

export const MobileBottomBar: React.FC = () => {
  const {
    currentScreen,
    setCurrentScreen,
    setOpenPublishModal,
    setPublishType,
    stats,
  } = useCentro();

  const handleTab = (screen: ScreenId) => {
    setCurrentScreen(screen);
  };

  return (
    <nav
      aria-label="Navegación inferior móvil"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-card/95 backdrop-blur-md border-t border-border-subtle shadow-lg"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 6px)' }}
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-1">
        {/* 1. Inicio */}
        <button
          type="button"
          onClick={() => handleTab('inicio')}
          aria-label="Inicio"
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[44px] transition-colors ${
            currentScreen === 'inicio'
              ? 'text-brand-navy dark:text-brand-gold font-bold'
              : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          <House
            weight={currentScreen === 'inicio' ? 'fill' : 'regular'}
            className="w-5 h-5"
          />
          <span className="text-[10px] mt-1 tracking-tight">Inicio</span>
        </button>

        {/* 2. Eventos */}
        <button
          type="button"
          onClick={() => handleTab('eventos')}
          aria-label="Eventos"
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[44px] transition-colors relative ${
            currentScreen === 'eventos'
              ? 'text-brand-navy dark:text-brand-gold font-bold'
              : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          <CalendarBlank
            weight={currentScreen === 'eventos' ? 'fill' : 'regular'}
            className="w-5 h-5"
          />
          <span className="text-[10px] mt-1 tracking-tight">Eventos</span>
          {stats.proximosEventos > 0 && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-brand-gold" />
          )}
        </button>

        {/* 3. Publicar (Botón central destacado en dorado ocre) */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => {
              setPublishType('comunicado');
              setOpenPublishModal(true);
            }}
            aria-label="Publicar comunicado o actividad"
            className="w-12 h-12 rounded-full bg-brand-gold hover:bg-[#766330] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue -mt-4 border-2 border-surface-card"
          >
            <Plus weight="bold" className="w-6 h-6" />
          </button>
        </div>

        {/* 4. Foros */}
        <button
          type="button"
          onClick={() => handleTab('foros')}
          aria-label="Foros"
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[44px] transition-colors relative ${
            currentScreen === 'foros'
              ? 'text-brand-navy dark:text-brand-gold font-bold'
              : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          <ChatsCircle
            weight={currentScreen === 'foros' ? 'fill' : 'regular'}
            className="w-5 h-5"
          />
          <span className="text-[10px] mt-1 tracking-tight">Foros</span>
          {stats.publicacionesDenunciadas > 0 && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        {/* 5. Reclamos */}
        <button
          type="button"
          onClick={() => handleTab('reclamos')}
          aria-label="Reclamos"
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[44px] transition-colors relative ${
            currentScreen === 'reclamos'
              ? 'text-brand-navy dark:text-brand-gold font-bold'
              : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          <ChatCircleDots
            weight={currentScreen === 'reclamos' ? 'fill' : 'regular'}
            className="w-5 h-5"
          />
          <span className="text-[10px] mt-1 tracking-tight">Reclamos</span>
          {stats.reclamosSinAtender > 0 && (
            <span className="absolute top-1 right-3 min-w-[14px] h-[14px] px-1 bg-brand-gold text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {stats.reclamosSinAtender}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};
