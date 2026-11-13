import React, { useState } from 'react';
import { useApp, ScreenId } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ChildSelector } from './ChildSelector';
import { Modal } from './Modal';
import { INSTITUTION_INFO, THEMES } from '../config/themes';
import { FamiliasBrandIcon } from './FamiliasBrandIcon';
import { 
  House, 
  CalendarCheck, 
  GraduationCap, 
  CalendarBlank, 
  Bell, 
  FileText, 
  CheckSquare, 
  ChatCircleText, 
  User, 
  Gear, 
  SignOut, 
  DotsThreeOutline, 
  X,
  Flask,
  ShieldCheck,
  WarningCircle,
  Clock,
  Play
} from '@phosphor-icons/react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { 
    activeScreen, 
    setActiveScreen, 
    unreadNoticesCount, 
    pendingAuthorizationsCount,
    replayPresentation,
    refreshChildren,
  } = useApp();

  const { user, logout, refreshUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navegación principal
  const navItems: { id: ScreenId; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'inicio', label: 'Inicio', icon: <House className="w-5 h-5" /> },
    { id: 'asistencia', label: 'Asistencia', icon: <CalendarCheck className="w-5 h-5" /> },
    { id: 'calificaciones', label: 'Calificaciones', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'agenda', label: 'Agenda', icon: <CalendarBlank className="w-5 h-5" /> },
    { 
      id: 'comunicados', 
      label: 'Comunicados', 
      icon: <Bell className="w-5 h-5" />, 
      badge: unreadNoticesCount > 0 ? unreadNoticesCount : undefined 
    },
    { id: 'justificaciones', label: 'Justificaciones', icon: <FileText className="w-5 h-5" /> },
    { 
      id: 'autorizaciones', 
      label: 'Autorizaciones', 
      icon: <CheckSquare className="w-5 h-5" />, 
      badge: pendingAuthorizationsCount > 0 ? pendingAuthorizationsCount : undefined 
    },
    { id: 'mensajes', label: 'Mensajes', icon: <ChatCircleText className="w-5 h-5" /> },
    { id: 'perfil', label: 'Mi Perfil', icon: <User className="w-5 h-5" /> },
    { id: 'opciones', label: 'Apariencia y Opciones', icon: <Gear className="w-5 h-5" /> },
  ];

  const primaryMobileNav: ScreenId[] = ['inicio', 'asistencia', 'calificaciones', 'agenda'];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface)] text-[var(--text)]">

      <div className="flex-1 flex overflow-hidden">
        {/* Barra Lateral Navy Sólida en Escritorio (conforme a §1: Identidad visual) */}
        <aside
          aria-label="Navegación principal"
          className="hidden lg:flex flex-col w-64 bg-[#14214F] text-white shrink-0 border-r border-[#24336B] select-none"
        >
          {/* Cabecera institucional del Sidebar con el icono oficial de Familias */}
          <div className="p-5 border-b border-[#24336B]/60">
            <div className="flex items-center gap-3">
              <FamiliasBrandIcon variant="dark" size="md" />
              <div className="leading-tight">
                <span className="font-extrabold text-sm tracking-wide block font-display">
                  {INSTITUTION_INFO.name}
                </span>
                <span className="text-[10px] text-[#AF9B63] tracking-widest uppercase block font-semibold">
                  Panel de Familias
                </span>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-[#24336B]/40 text-[10px] text-slate-300 flex items-center justify-between">
              <span>{INSTITUTION_INFO.academicYear}</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-mono text-[9px] border border-emerald-700/50">
                MÓDULO V
              </span>
            </div>
          </div>

          {/* Lista de Navegación Lateral */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveScreen(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer group ${
                    isActive
                      ? 'bg-white/15 text-white shadow-xs font-bold border-l-2 border-[#89743A]'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-[#AF9B63]' : 'text-slate-400 group-hover:text-white'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#89743A] text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer de Usuario en Sidebar */}
          <div className="p-3 border-t border-[#24336B]/60 bg-[#0F1B40]">
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#89743A] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user?.firstName?.[0] || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-[10px] text-slate-300 truncate font-mono">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <SignOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Contenido Principal */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Barra Superior con Selector de Hijo siempre visible */}
          <header className="h-16 px-4 md:px-6 bg-[var(--surface-card)] border-b border-[var(--border)] flex items-center justify-between gap-3 shrink-0 shadow-xs z-20">
            {/* Logo en Mobile con icono oficial de Familias */}
            <div className="flex items-center gap-2.5 lg:hidden">
              <FamiliasBrandIcon variant="dark" size="sm" />
              <div className="leading-tight">
                <span className="font-extrabold text-xs tracking-tight block font-display">
                  ISFDyT N° 26
                </span>
                <span className="text-[9px] text-[var(--brand-gold)] font-bold tracking-widest uppercase block">
                  Familias
                </span>
              </div>
            </div>

            {/* Módulo activo en desktop */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-[var(--text-muted)]">
                Portal de Familias
              </span>
              <span className="text-[var(--border)]">/</span>
              <span className="text-xs font-bold text-[var(--text)] capitalize">
                {activeScreen}
              </span>
            </div>

            {/* Selector de Hijo y Acciones de Cabecera */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Botón para reproducir video de presentación */}
              <button
                type="button"
                onClick={replayPresentation}
                className="px-2.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-card)] text-[var(--text)] transition-colors cursor-pointer hidden sm:flex items-center gap-1.5 text-xs font-semibold"
                title="Reproducir video de presentación institucional"
                aria-label="Reproducir video de presentación"
              >
                <Play className="w-3.5 h-3.5 text-[#89743A]" weight="fill" />
                <span>Presentación</span>
              </button>

              <ChildSelector />

              {/* Botón rápido de Opciones en barra */}
              <button
                type="button"
                onClick={() => setActiveScreen('opciones')}
                className="p-2 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer hidden sm:flex items-center justify-center"
                title="Configuración de apariencia y accesibilidad"
                aria-label="Configurar apariencia"
              >
                <Gear className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Área de Pantalla con scroll vertical limpio */}
          <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-24 lg:pb-8">
            <div className="max-w-5xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Barra de Navegación Inferior en Móvil (Mobile First conforme a §2) */}
      <nav
        aria-label="Navegación móvil"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface-card)] border-t border-[var(--border)] px-2 py-1.5 shadow-lg flex items-center justify-around"
      >
        {primaryMobileNav.map((screenId) => {
          const item = navItems.find((n) => n.id === screenId);
          if (!item) return null;
          const isActive = activeScreen === screenId;
          return (
            <button
              key={screenId}
              type="button"
              onClick={() => setActiveScreen(screenId)}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[46px] py-1 px-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                isActive
                  ? 'text-[var(--brand-navy)] dark:text-[#E2C374] font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-[#89743A] text-white text-[8px] flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-0.5 truncate">{item.label}</span>
              {isActive && (
                <div className="w-4 h-0.5 bg-[var(--brand-gold)] rounded-full mt-0.5" />
              )}
            </button>
          );
        })}

        {/* Botón "Más" para abrir drawer móvil con el resto de pantallas */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[46px] py-1 px-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            !primaryMobileNav.includes(activeScreen)
              ? 'text-[var(--brand-navy)] dark:text-[#E2C374] font-bold'
              : 'text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
          aria-label="Más secciones"
        >
          <div className="relative">
            <DotsThreeOutline className="w-5 h-5" weight="fill" />
            {(unreadNoticesCount > 0 || pendingAuthorizationsCount > 0) && (
              <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-[#89743A]" />
            )}
          </div>
          <span className="mt-0.5">Más</span>
        </button>
      </nav>

      {/* Drawer Móvil de "Más secciones" */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex flex-col bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="bg-[var(--surface-card)] rounded-t-3xl border-t border-[var(--border)] p-5 pb-8 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="font-bold text-base text-[var(--text)]">
                  Menú del Panel
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {INSTITUTION_INFO.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-[var(--text-muted)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {navItems.map((item) => {
                const isActive = activeScreen === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveScreen(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'border-[var(--brand-gold)] bg-[var(--surface-subtle)] text-[var(--text)] font-bold'
                        : 'border-[var(--border)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    <span className="text-[var(--brand-gold)]">{item.icon}</span>
                    <span className="truncate flex-1">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#89743A] text-white">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <div className="text-xs text-[var(--text-muted)]">
                {user?.firstName} {user?.lastName}
              </div>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 text-xs text-red-600 font-semibold cursor-pointer"
              >
                <SignOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
