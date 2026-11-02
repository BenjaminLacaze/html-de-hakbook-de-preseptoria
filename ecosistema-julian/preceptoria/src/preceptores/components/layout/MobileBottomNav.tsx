/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  House, 
  CheckSquare, 
  Users, 
  FileText, 
  DotsThreeCircle 
} from '@phosphor-icons/react';
import { usePreceptor } from '../../context/PreceptorContext';

export const MobileBottomNav: React.FC = () => {
  const { 
    activeScreen, 
    setActiveScreen, 
    counts, 
    setIsMobileMoreMenuOpen 
  } = usePreceptor();

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-[#121A33] border-t border-[var(--border-subtle)] shadow-lg"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.25rem)' }}
      aria-label="Navegación principal móvil"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {/* 1. Inicio */}
        <button
          type="button"
          onClick={() => setActiveScreen('inicio')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
            activeScreen === 'inicio' 
              ? 'text-[var(--brand-navy)] dark:text-blue-400 font-bold' 
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <House size={22} weight={activeScreen === 'inicio' ? "fill" : "regular"} />
          <span className="text-[11px] mt-1">Inicio</span>
        </button>

        {/* 2. Asistencia (Central destacado) */}
        <button
          type="button"
          onClick={() => setActiveScreen('asistencia')}
          className="flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer relative -top-2"
          aria-label="Tomar asistencia en el aula"
        >
          <div className="w-12 h-12 rounded-full bg-[#89743A] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform border-2 border-white dark:border-[#121A33]">
            <CheckSquare size={24} weight="bold" />
          </div>
          <span className="text-[10px] font-bold text-[#89743A] dark:text-[#AF9B63] mt-0.5">
            Asistencia
          </span>
        </button>

        {/* 3. Alumnos */}
        <button
          type="button"
          onClick={() => setActiveScreen('alumnos')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
            activeScreen === 'alumnos' 
              ? 'text-[var(--brand-navy)] dark:text-blue-400 font-bold' 
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Users size={22} weight={activeScreen === 'alumnos' ? "fill" : "regular"} />
          <span className="text-[11px] mt-1">Alumnos</span>
        </button>

        {/* 4. Justificaciones */}
        <button
          type="button"
          onClick={() => setActiveScreen('justificaciones')}
          className={`relative flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
            activeScreen === 'justificaciones' 
              ? 'text-[var(--brand-navy)] dark:text-blue-400 font-bold' 
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <FileText size={22} weight={activeScreen === 'justificaciones' ? "fill" : "regular"} />
          <span className="text-[11px] mt-1 truncate max-w-full px-1">Justific.</span>
          {counts.pendingJustifications > 0 && (
            <span className="absolute top-1.5 right-3 bg-[#89743A] text-white font-mono-data text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
              {counts.pendingJustifications}
            </span>
          )}
        </button>

        {/* 5. Más */}
        <button
          type="button"
          onClick={() => setIsMobileMoreMenuOpen(true)}
          className="flex flex-col items-center justify-center h-full min-h-[44px] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <DotsThreeCircle size={24} />
          <span className="text-[11px] mt-0.5">Más</span>
        </button>
      </div>
    </nav>
  );
};
