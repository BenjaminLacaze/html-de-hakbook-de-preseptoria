/**
 * Barra lateral de navegación principal (Escritorio y Móvil)
 * Sistema de Asistencia Escolar - Módulo Alumno
 * Responsable: Lucia Salgado
 */

import React from 'react';
import { NavView } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  User,
  HelpCircle,
  Sliders,
  X,
  GraduationCap,
  Users
} from 'lucide-react';

interface SidebarProps {
  activeView: NavView;
  onNavigate: (view: NavView) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  isMobileOpen,
  onCloseMobile
}) => {
  const { student, switchDemoProfile } = useAuth();

  const navItems: { id: NavView; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'inicio', label: 'Inicio', icon: LayoutDashboard },
    { id: 'asistencia', label: 'Mi asistencia', icon: CalendarCheck },
    { id: 'perfil', label: 'Mi perfil', icon: User },
    { id: 'ayuda', label: 'Ayuda', icon: HelpCircle },
    { id: 'accesibilidad', label: 'Accesibilidad', icon: Sliders }
  ];

  const handleNavClick = (view: NavView) => {
    onNavigate(view);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors">
      {/* Encabezado institucional */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
              <GraduationCap size={22} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {student.institutionShort}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Módulo Alumno
              </p>
            </div>
          </div>
          {isMobileOpen && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 rounded-md"
              aria-label="Cerrar navegación"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Ficha rápida de alumno conectado */}
        <div className="mt-4 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-700/60">
          <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
            {student.firstName} {student.lastName}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Legajo: {student.legajo}
          </div>
          <div className="text-[11px] text-blue-700 dark:text-blue-400 font-medium mt-0.5 truncate">
            {student.year} · {student.division}
          </div>
        </div>
      </div>

      {/* Enlaces de navegación */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Navegación principal">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                isActive
                  ? 'bg-blue-900 text-white dark:bg-blue-800'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Selector de perfiles de demostración (para evaluar estados) */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Users size={12} />
          <span>Caso de Demostración:</span>
        </label>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <button
            type="button"
            onClick={() => switchDemoProfile('std_01')}
            className={`px-2 py-1.5 rounded text-left truncate transition-colors border ${
              student.id === 'std_01'
                ? 'bg-blue-50 border-blue-300 text-blue-900 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-200 font-semibold'
                : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 hover:bg-slate-100'
            }`}
            title="Lucia Salgado - Regular (90% asistencia)"
          >
            Lucia (Regular)
          </button>
          <button
            type="button"
            onClick={() => switchDemoProfile('std_02')}
            className={`px-2 py-1.5 rounded text-left truncate transition-colors border ${
              student.id === 'std_02'
                ? 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-200 font-semibold'
                : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 hover:bg-slate-100'
            }`}
            title="Agustín Méndez - En riesgo de inasistencias"
          >
            Agustín (Riesgo)
          </button>
        </div>
      </div>

      {/* Pie institucional de crédito académico */}
      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          Tecnicatura en Desarrollo de Software
        </p>
        <p className="mt-0.5">
          Responsable: <span className="font-medium text-slate-900 dark:text-slate-200">Lucia Salgado</span>
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
          Ciclo Lectivo 2026
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Barra lateral en escritorio */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
        {navContent}
      </aside>

      {/* Cajón lateral en dispositivos móviles con backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
