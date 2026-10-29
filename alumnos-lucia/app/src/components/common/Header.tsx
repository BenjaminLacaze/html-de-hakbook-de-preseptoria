/**
 * Encabezado de la aplicación (Top Bar Contract)
 * Sistema de Asistencia Escolar - Módulo Alumno
 * Responsable: Lucia Salgado
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { NavView } from '../../types';
import {
  LogOut,
  User,
  Menu,
  Sun,
  Moon,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  activeView: NavView;
  onMobileMenuToggle: () => void;
  onNavigate: (view: NavView) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onMobileMenuToggle,
  onNavigate
}) => {
  const { student, logout, isDemoMode } = useAuth();
  const { settings, setDarkMode } = useAccessibility();

  const viewTitles: Record<NavView, string> = {
    inicio: 'Inicio y Resumen',
    comunicacion: 'Centro y mensajes',
    asistencia: 'Historial de Asistencia',
    perfil: 'Información del Alumno',
    ayuda: 'Guía y Funcionamiento',
    accesibilidad: 'Preferencias de Accesibilidad'
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Zona 1: Identificación y botón móvil */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 -ml-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label="Abrir menú de navegación"
          >
            <Menu size={20} />
          </button>

          <button
            onClick={() => onNavigate('inicio')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="text-base sm:text-lg font-bold tracking-tight text-blue-900 dark:text-blue-400 group-hover:text-blue-700 transition-colors whitespace-nowrap">
              I26 · Asistencia Alumno
            </span>
          </button>
        </div>

        {/* Zona 2: Título de sección activa */}
        <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span>Módulo Alumno</span>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {viewTitles[activeView]}
          </span>
          {isDemoMode && (
            <span className="inline-flex items-center gap-1 ml-2 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5">
              <ShieldCheck size={12} className="text-blue-600 dark:text-blue-400" />
              Modo Demostración
            </span>
          )}
        </div>

        {/* Zona 3: Acciones de usuario y controles accesibles */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Alternador rápido claro/oscuro */}
          <button
            type="button"
            onClick={() => setDarkMode(!settings.darkMode)}
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
            title={settings.darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Alternar modo oscuro"
          >
            {settings.darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Botón de perfil */}
          <button
            type="button"
            onClick={() => onNavigate('perfil')}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
            title="Ver mi perfil académico"
          >
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
              {student.firstName.charAt(0)}{student.lastName.charAt(0)}
            </div>
            <span className="hidden sm:inline-block max-w-[120px] truncate">
              {student.firstName} {student.lastName}
            </span>
          </button>

          {/* Botón de salir */}
          <button
            type="button"
            onClick={logout}
            className="p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
            title="Cerrar sesión de consulta"
            aria-label="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
