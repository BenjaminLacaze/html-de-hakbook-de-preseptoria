import React, { useState } from 'react';
import {
  House,
  ListChecks,
  WarningOctagon,
  Plus,
  MapTrifold,
  CalendarBlank,
  ArrowsLeftRight,
  ClockCounterClockwise,
  Megaphone,
  User,
  Gear,
  SignOut,
  Bell,
  PaintBrush,
  MagnifyingGlass,
  SlidersHorizontal,
  X,
  ShieldCheck,
  CheckCircle,
  Buildings,
  WarningCircle,
} from '@phosphor-icons/react';
import { useAuxiliares } from '../context/AuxiliaresContext';
import { ScreenType } from '../types';
import { ModuleMark } from './ModuleMark';

// ============================================================================
// DESKTOP SIDEBAR (Matches Image 2 reference style)
// ============================================================================
export const DesktopSidebar: React.FC = () => {
  const {
    currentScreen,
    setCurrentScreen,
    userProfile,
    incidents,
    communityNotices,
    logout,
    setShowIntro,
  } = useAuxiliares();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const openIncidentsCount = incidents.filter((i) => i.status !== 'resuelta').length;
  const unreadNoticesCount = communityNotices.filter((n) => !n.read).length;

  const navJourney: { id: ScreenType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'tareas', label: 'Inicio', icon: <House size={20} weight={currentScreen === 'tareas' ? 'fill' : 'regular'} /> },
    { id: 'perfil', label: 'Mi Perfil', icon: <User size={20} weight={currentScreen === 'perfil' ? 'fill' : 'regular'} /> },
    { id: 'turnos', label: 'Horarios y Turnos', icon: <CalendarBlank size={20} weight={currentScreen === 'turnos' ? 'fill' : 'regular'} /> },
    {
      id: 'incidencias',
      label: 'Incidencias',
      icon: <WarningOctagon size={20} weight={currentScreen === 'incidencias' ? 'fill' : 'regular'} />,
      badge: openIncidentsCount > 0 ? openIncidentsCount : undefined,
    },
    { id: 'plano', label: 'Instalaciones', icon: <MapTrifold size={20} weight={currentScreen === 'plano' ? 'fill' : 'regular'} /> },
  ];

  const navManagement: { id: ScreenType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'justificaciones', label: 'Justificaciones y Cambios', icon: <ArrowsLeftRight size={20} weight="regular" /> },
    { id: 'historial', label: 'Historial', icon: <ClockCounterClockwise size={20} weight="regular" /> },
    {
      id: 'comunidad',
      label: 'Comunidad',
      icon: <Megaphone size={20} weight="regular" />,
      badge: unreadNoticesCount > 0 ? unreadNoticesCount : undefined,
    },
  ];

  const navConfig: { id: ScreenType; label: string; icon: React.ReactNode }[] = [
    { id: 'opciones', label: 'Apariencia', icon: <PaintBrush size={20} weight="regular" /> },
    { id: 'opciones', label: 'Opciones', icon: <SlidersHorizontal size={20} weight="regular" /> },
  ];

  return (
    <aside
      aria-label="Barra lateral de navegación"
      className="hidden lg:flex flex-col w-64 shrink-0 bg-[#0A1124] text-white h-screen sticky top-0 overflow-y-auto z-30 border-r border-[#162444] select-none text-xs"
    >
      {/* Top Header / Portal indicator (Exact brother app style) */}
      <div className="p-5 pb-4 border-b border-[#162444]">
        {/* Short golden ochre line */}
        <div className="w-9 h-0.5 bg-[#C8A14D] mb-3" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8A14D]" />
            <span>PORTAL AUXILIARES · 2026</span>
          </div>
          <button
            type="button"
            onClick={() => setShowIntro(true)}
            className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#172545] hover:bg-[#203463] text-slate-200 border border-[#22355F] transition-colors cursor-pointer flex items-center gap-1"
            title="Ver video de presentación"
          >
            <span>► INTRO</span>
          </button>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3 py-4 space-y-5">
        {/* 1. OPERATIVO / MI JORNADA */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.16em] px-3 mb-1.5">
            OPERATIVO
          </div>
          <nav className="space-y-0.5">
            {navJourney.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id + item.label}
                  type="button"
                  onClick={() => setCurrentScreen(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#18274A] text-white border border-[#263C70] shadow-xs'
                      : 'text-slate-300 hover:bg-[#111C35] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-[#C8A14D]' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#1C2C52] text-slate-200 border border-[#263C70]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 2. GESTIÓN */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.16em] px-3 mb-1.5">
            GESTIÓN
          </div>
          <nav className="space-y-0.5">
            {navManagement.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentScreen(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#18274A] text-white border border-[#263C70] shadow-xs'
                      : 'text-slate-300 hover:bg-[#111C35] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-[#C8A14D]' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#1C2C52] text-slate-200 border border-[#263C70]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 3. CONFIGURACIÓN */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.16em] px-3 mb-1.5">
            CONFIGURACIÓN
          </div>
          <nav className="space-y-0.5">
            {navConfig.map((item, idx) => {
              const isActive = currentScreen === item.id && idx === 0;
              return (
                <button
                  key={item.label + idx}
                  type="button"
                  onClick={() => setCurrentScreen(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#18274A] text-white border border-[#263C70]'
                      : 'text-slate-300 hover:bg-[#111C35] hover:text-white'
                  }`}
                >
                  <span className="text-slate-400">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-red-950/40 hover:text-red-200 transition-all text-left cursor-pointer"
            >
              <SignOut size={20} className="text-slate-400" />
              <span>Cerrar Sesión</span>
            </button>
          </nav>
        </div>
      </div>

      {/* User profile footer (Image 2 exact style) */}
      <div className="p-3 border-t border-[#162444] bg-[#070D1D] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setCurrentScreen('perfil')}
          className="flex items-center gap-2.5 text-left flex-1 min-w-0 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-[#C8A14D] text-[#0A1124] flex items-center justify-center font-bold text-xs shrink-0 font-heading">
            {userProfile.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate leading-tight">
              {userProfile.name}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {userProfile.roleLabel} · {userProfile.email}
            </p>
          </div>
        </button>
        <span className="text-slate-500 text-xs">·</span>
      </div>

      {/* Logout confirmation */}
      {showLogoutConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-[#0E1730] border border-[#1C2E56] rounded-xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-white">
            <h3 className="font-heading font-bold text-lg text-white">
              ¿Querés cerrar la sesión?
            </h3>
            <p className="text-xs text-slate-300">
              Se cierra tu sesión institucional en este dispositivo. Podés volver a entrar con tu cuenta en cualquier momento.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 rounded-lg border border-[#1C2E56] text-slate-300 text-xs font-bold hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  void logout();
                }}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

// ============================================================================
// DESKTOP TOP HEADER (Horizontal bar across content top)
// ============================================================================
export const DesktopHeader: React.FC = () => {
  const { notifications, setNotificationsOpen, setCurrentScreen } = useAuxiliares();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="hidden lg:flex items-center justify-between px-8 py-3 bg-[#0A1124] border-b border-[#162444] sticky top-0 z-20">
      {/* Left breadcrumb/institution title */}
      <div className="flex items-center gap-3">
        <Buildings size={18} className="text-[#C8A14D]" weight="bold" />
        <span className="font-heading font-extrabold text-sm text-white tracking-wider">
          ISFDYT N° 26
        </span>
        <span className="text-slate-600">|</span>
        <span className="text-xs text-slate-300 font-medium">
          Servicios Generales · Sede Central
        </span>
      </div>

      {/* Right control group */}
      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <div className="relative">
          <MagnifyingGlass size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar... Ctrl+K"
            className="pl-8 pr-3 py-1.5 rounded-lg bg-[#0E1730] border border-[#1C2E56] text-xs text-slate-200 placeholder-slate-400 w-44 focus:w-60 transition-all focus:outline-none focus:border-[#3F78B6]"
          />
        </div>

        {/* Quick Action Button: Reportar Incidencia (golden ochre) */}
        <button
          type="button"
          onClick={() => setCurrentScreen('reportar')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#C8A14D] hover:brightness-110 active:brightness-95 text-[#0A1124] font-bold text-xs shadow-xs transition-all cursor-pointer"
        >
          <Plus size={15} weight="bold" />
          <span>Reportar Incidencia</span>
        </button>

        {/* Theme quick trigger */}
        <button
          type="button"
          onClick={() => setCurrentScreen('opciones')}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#132042] transition-colors"
          title="Apariencia y temas"
          aria-label="Apariencia y temas"
        >
          <PaintBrush size={18} />
        </button>

        {/* Notifications bell with badge */}
        <button
          type="button"
          onClick={() => setNotificationsOpen(true)}
          className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#132042] transition-colors"
          aria-label={`Notificaciones ${unreadCount > 0 ? `(${unreadCount} no leídas)` : ''}`}
        >
          <Bell size={19} weight="bold" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

// ============================================================================
// BANNER DE CONEXIÓN: avisa qué partes no se pudieron cargar de la API
// ============================================================================
export const ConnectionBanner: React.FC = () => {
  const { loadErrors, reload } = useAuxiliares();
  const [retrying, setRetrying] = useState(false);
  if (loadErrors.length === 0) return null;

  const retry = async () => {
    setRetrying(true);
    await reload();
    setRetrying(false);
  };

  return (
    <div
      role="alert"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 lg:px-8 py-2 bg-[#2A1518] border-b border-red-900 text-xs text-red-200"
    >
      <div className="flex items-start gap-2">
        <WarningCircle size={16} className="shrink-0 mt-0.5" weight="fill" />
        <span>
          No se pudo cargar: {loadErrors.join(' · ')}
        </span>
      </div>
      <button
        type="button"
        onClick={() => void retry()}
        disabled={retrying}
        className="shrink-0 px-3 py-1 rounded-md bg-red-900/60 hover:bg-red-800 text-white font-bold disabled:opacity-60"
      >
        {retrying ? 'Reintentando…' : 'Reintentar'}
      </button>
    </div>
  );
};

// ============================================================================
// MOBILE NAVIGATION (Top bar & Bottom bar)
// Preserved exactly as praised by user ("la version mobile es excelente")
// ============================================================================
export const MobileNavigation: React.FC = () => {
  const {
    currentScreen,
    setCurrentScreen,
    userProfile,
    notifications,
    setNotificationsOpen,
    logout,
  } = useAuxiliares();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="lg:hidden bg-[#0A1124] text-white px-4 py-3 sticky top-0 z-30 flex items-center justify-between border-b border-[#162444] shadow-xs">
        <ModuleMark isCompact />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            className="touch-target p-2 text-slate-200 hover:text-white rounded-lg relative"
            aria-label={`Notificaciones ${unreadCount > 0 ? `(${unreadCount} no leídas)` : ''}`}
          >
            <Bell size={24} weight="bold" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-4.5 h-4.5 px-1 bg-[#C8A14D] text-[#0A1124] text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="touch-target p-1.5 rounded-lg flex items-center gap-2 text-slate-200 hover:text-white"
            aria-label="Abrir menú"
          >
            <div className="w-8 h-8 rounded-full bg-[#C8A14D] text-[#0A1124] flex items-center justify-center font-bold text-xs">
              {userProfile.initials}
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Bottom Fixed Bar */}
      <nav
        aria-label="Navegación principal móvil"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0A1124] border-t border-[#162444] shadow-lg px-2 flex items-center justify-around select-none"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 6px)' }}
      >
        <button
          type="button"
          onClick={() => setCurrentScreen('tareas')}
          className={`flex-1 flex flex-col items-center justify-center py-2 transition-colors ${
            currentScreen === 'tareas' ? 'text-[#C8A14D] font-bold' : 'text-slate-400'
          }`}
        >
          <ListChecks size={24} weight={currentScreen === 'tareas' ? 'fill' : 'regular'} />
          <span className="text-[12px] mt-0.5">Tareas</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentScreen('incidencias')}
          className={`flex-1 flex flex-col items-center justify-center py-2 transition-colors ${
            currentScreen === 'incidencias' ? 'text-[#C8A14D] font-bold' : 'text-slate-400'
          }`}
        >
          <WarningOctagon size={24} weight={currentScreen === 'incidencias' ? 'fill' : 'regular'} />
          <span className="text-[12px] mt-0.5">Incidencias</span>
        </button>

        {/* Central button */}
        <div className="flex-1 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setCurrentScreen('reportar')}
            className="w-13 h-13 -mt-5 rounded-full bg-[#C8A14D] text-[#0A1124] flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform border-3 border-[#080E1E]"
            aria-label="Reportar incidencia rápida"
          >
            <Plus size={26} weight="bold" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setCurrentScreen('plano')}
          className={`flex-1 flex flex-col items-center justify-center py-2 transition-colors ${
            currentScreen === 'plano' ? 'text-[#C8A14D] font-bold' : 'text-slate-400'
          }`}
        >
          <MapTrifold size={24} weight={currentScreen === 'plano' ? 'fill' : 'regular'} />
          <span className="text-[12px] mt-0.5">Plano</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentScreen('turnos')}
          className={`flex-1 flex flex-col items-center justify-center py-2 transition-colors ${
            currentScreen === 'turnos' ? 'text-[#C8A14D] font-bold' : 'text-slate-400'
          }`}
        >
          <CalendarBlank size={24} weight={currentScreen === 'turnos' ? 'fill' : 'regular'} />
          <span className="text-[12px] mt-0.5">Turnos</span>
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-80 max-w-full bg-[#0A1124] text-white h-full flex flex-col shadow-2xl p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C8A14D] text-[#0A1124] flex items-center justify-center font-bold text-sm">
                  {userProfile.initials}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base">{userProfile.name}</h3>
                  <p className="text-xs text-slate-400">{userProfile.roleLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="touch-target p-2 text-slate-300"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-1 flex-1 py-4">
              <button
                type="button"
                onClick={() => {
                  setCurrentScreen('justificaciones');
                  setMobileMenuOpen(false);
                }}
                className="touch-target w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-white/10 text-left font-medium"
              >
                <ArrowsLeftRight size={20} className="text-[#3F78B6]" />
                <span>Justificaciones y cambios</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentScreen('historial');
                  setMobileMenuOpen(false);
                }}
                className="touch-target w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-white/10 text-left font-medium"
              >
                <ClockCounterClockwise size={20} className="text-[#C8A14D]" />
                <span>Historial de mantenimiento</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentScreen('comunidad');
                  setMobileMenuOpen(false);
                }}
                className="touch-target w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-white/10 text-left font-medium"
              >
                <Megaphone size={20} className="text-sky-400" />
                <span>Comunidad y avisos</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentScreen('perfil');
                  setMobileMenuOpen(false);
                }}
                className="touch-target w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-white/10 text-left font-medium"
              >
                <User size={20} className="text-slate-300" />
                <span>Mi perfil de auxiliar</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentScreen('opciones');
                  setMobileMenuOpen(false);
                }}
                className="touch-target w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-white/10 text-left font-medium"
              >
                <SlidersHorizontal size={20} className="text-slate-300" />
                <span>Apariencia y Opciones</span>
              </button>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  void logout();
                }}
                className="touch-target w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-950/40 text-left font-semibold"
              >
                <SignOut size={20} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
