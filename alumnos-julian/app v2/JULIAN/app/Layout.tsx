/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  House,
  User,
  Calendar,
  BookOpen,
  GraduationCap,
  ClockCounterClockwise,
  UsersThree,
  ChatsCircle,
  Gear,
  Palette,
  QrCode,
  SignOut,
  List,
  X,
  CheckCircle,
  WarningCircle,
  Bell,
  Sun,
  Moon,
  Play,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import {
  NavigationSection,
  Materia,
  Evaluacion,
  Evento,
  Aviso,
  PublicacionForo,
  NotificacionItem,
} from "../shared/types";
import { Logo } from "../shared/ui/Logo";
import { AlumnosIcon } from "../shared/ui/AlumnosIcon";
import { useAppTheme } from "../shared/lib/theme";
import { GlobalSearch } from "../shared/ui/GlobalSearch";
import { NotificationsPopover } from "../shared/ui/NotificationsPopover";

interface LayoutProps {
  currentSection: NavigationSection;
  onNavigate: (section: NavigationSection, param?: string) => void;
  onShowIntro?: () => void;
  children: React.ReactNode;
  unreadAvisosCount?: number;
  materias?: Materia[];
  evaluaciones?: Evaluacion[];
  agenda?: Evento[];
  avisos?: Aviso[];
  foros?: PublicacionForo[];
  notificaciones?: NotificacionItem[];
  onMarcarNotificacionLeida?: (id: string, referenciaId?: string, tipo?: string) => void;
  onMarcarTodasNotificacionesLeidas?: () => void;
}

interface NavItem {
  id: NavigationSection;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  isAction?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  currentSection,
  onNavigate,
  onShowIntro,
  children,
  unreadAvisosCount = 0,
  materias = [],
  evaluaciones = [],
  agenda = [],
  avisos = [],
  foros = [],
  notificaciones = [],
  onMarcarNotificacionLeida,
  onMarcarTodasNotificacionesLeidas,
}) => {
  const { theme, setTheme } = useAppTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);

  // Atajo de teclado global Ctrl+K / Cmd+K para abrir buscador
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const mainNavItems: NavItem[] = [
    { id: "inicio", label: "Inicio", icon: <House size={20} weight="regular" /> },
    { id: "perfil", label: "Mi Perfil", icon: <User size={20} weight="regular" /> },
    { id: "agenda", label: "Agenda Académica", icon: <Calendar size={20} weight="regular" /> },
    { id: "materias", label: "Mis Materias", icon: <BookOpen size={20} weight="regular" />, badge: materias.length || 6 },
    { id: "notas", label: "Mis Notas", icon: <GraduationCap size={20} weight="regular" /> },
    { id: "faltas", label: "Mis Faltas", icon: <ClockCounterClockwise size={20} weight="regular" /> },
    { id: "historial", label: "Historial", icon: <CheckCircle size={20} weight="regular" /> },
    { id: "asistencia-qr", label: "Asistencia QR", icon: <QrCode size={20} weight="regular" />, isAction: true },
    { id: "comunidad", label: "Comunidad", icon: <UsersThree size={20} weight="regular" />, badge: unreadAvisosCount > 0 ? unreadAvisosCount : undefined },
    { id: "foros", label: "Foros de Cursada", icon: <ChatsCircle size={20} weight="regular" /> },
  ];

  const secondaryNavItems: NavItem[] = [
    { id: "apariencia", label: "Apariencia", icon: <Palette size={20} weight="regular" /> },
    { id: "opciones", label: "Opciones", icon: <Gear size={20} weight="regular" /> },
    { id: "logout", label: "Cerrar Sesión", icon: <SignOut size={20} weight="regular" /> },
  ];

  const handleNavClick = (section: NavigationSection) => {
    onNavigate(section);
    setMobileMenuOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === "oscuro" ? "celestial" : "oscuro");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--surface)] text-[var(--text)] min-w-0">
      {/* 1. SIDEBAR ESCRITORIO (Navy sólido persistente #14214F) */}
      <aside
        className="hidden md:flex flex-col w-64 lg:w-72 bg-[#14214F] text-white shrink-0 border-r border-[#24356E] select-none h-screen sticky top-0"
        aria-label="Navegación principal"
      >
        {/* Cabecera con Marca Oficial Alumnos: A7: alumnos-logo-negativo.png completo con alto ~56px, object-fit contain */}
        <div className="p-5 border-b border-[#24356E]/60 flex flex-col gap-2">
          <div className="flex items-center justify-start">
            <Logo variant="negativo" height={56} />
          </div>
          <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#24356E]/40">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#AF9B63]" />
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#AF9B63]">
                Portal del Alumno · 2026
              </span>
            </div>
            {onShowIntro && (
              <button
                type="button"
                onClick={onShowIntro}
                title="Ver transición institucional de marca"
                className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white/80 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <Play size={10} weight="fill" />
                <span>Intro</span>
              </button>
            )}
          </div>
        </div>

        {/* Lista de navegación principal */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-white/40 font-mono">
            Académico
          </div>
          {mainNavItems.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group text-left relative cursor-pointer ${
                  isActive
                    ? "bg-white/10 text-white font-semibold"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {/* Filete lateral dorado ocre para el ítem activo */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#89743A] rounded-r" />
                )}
                <div className="flex items-center gap-3">
                  <span
                    className={`${
                      isActive ? "text-[#AF9B63]" : "text-white/70 group-hover:text-white"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      item.isAction
                        ? "bg-[#89743A] text-white"
                        : isActive
                        ? "bg-white/20 text-white"
                        : "bg-white/10 text-white/70"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-white/40 font-mono">
            Configuración
          </div>
          {secondaryNavItems.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group text-left relative cursor-pointer ${
                  isActive
                    ? "bg-white/10 text-white font-semibold"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#89743A] rounded-r" />
                )}
                <div className="flex items-center gap-3">
                  <span
                    className={`${
                      isActive ? "text-[#AF9B63]" : "text-white/70 group-hover:text-white"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Tarjeta inferior del alumno con el legajo A4 corregido a 2025 */}
        <div className="p-4 border-t border-[#24356E]/60 bg-[#0E1738]/50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#89743A] text-white flex items-center justify-center font-bold text-xs tracking-wider shrink-0 border border-white/20">
                JC
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">
                  Julián Cámara
                </span>
                <span className="text-[10px] text-[#AF9B63] truncate font-mono">
                  Leg. 2025-ISFD26-0842
                </span>
              </div>
            </div>
            <AlumnosIcon size={22} variant="negativo" className="opacity-80 shrink-0" />
          </div>
        </div>
      </aside>

      {/* 2. BARRA SUPERIOR MÓVIL */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#14214F] text-white sticky top-0 z-40 border-b border-[#24356E]">
        <Logo variant="negativo" height={34} />
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Buscar en el portal"
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            title="Buscador global"
          >
            <MagnifyingGlass size={18} />
          </button>
          <button
            type="button"
            onClick={() => setNotifPopoverOpen(true)}
            aria-label="Ver notificaciones"
            className="relative p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <Bell size={18} />
            {unreadAvisosCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B91C1C] text-white text-[9px] font-bold flex items-center justify-center">
                {unreadAvisosCount}
              </span>
            )}
          </button>
          {onShowIntro && (
            <button
              type="button"
              onClick={onShowIntro}
              aria-label="Ver video de introducción institucional"
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              title="Ver video intro"
            >
              <Play size={16} weight="fill" />
            </button>
          )}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Cambiar tema de color"
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            {theme === "oscuro" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú de navegación"
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </header>

      {/* MODAL / DRAWER DE MENÚ MÓVIL */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="md:hidden fixed inset-0 z-50 bg-[#14214F] text-white flex flex-col p-6 overflow-y-auto"
        >
          <div className="flex items-center justify-between pb-6 border-b border-[#24356E]">
            <Logo variant="negativo" height={40} />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-white/10 text-white"
            >
              <X size={24} />
            </button>
          </div>

          <div className="py-6 space-y-2 flex-1">
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#AF9B63] mb-3">
              Módulos Académicos
            </div>
            {[...mainNavItems, ...secondaryNavItems].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium cursor-pointer ${
                  currentSection === item.id
                    ? "bg-[#89743A] text-white font-bold"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}

            {onShowIntro && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onShowIntro();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-[#AF9B63] bg-white/5 hover:bg-white/10 mt-4 cursor-pointer"
              >
                <Play size={20} weight="fill" />
                <span>Ver Transición de Marca (Intro)</span>
              </button>
            )}
          </div>

          <div className="pt-4 border-t border-[#24356E] text-xs text-[#AF9B63] flex justify-between items-center font-mono">
            <span>ISFDyT N° 26 · Dolores</span>
            <span>Versión 2026.2</span>
          </div>
        </div>
      )}

      {/* 3. CONTENEDOR PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra superior de escritorio */}
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-[var(--surface-raised)] border-b border-[var(--border)] shrink-0 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <AlumnosIcon size={24} variant="marca" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] font-mono shrink-0">
              ISFDyT N° 26
            </span>
            <span className="text-[var(--border)]">|</span>
            <span className="text-xs text-[var(--text-muted)] font-medium truncate">
              Desarrollo de Software · Turno Vespertino · 2° Año
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Buscador global con acceso rápido Ctrl+K */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[#14214F] transition-colors cursor-pointer"
              title="Buscar en todo el portal (Ctrl + K)"
            >
              <MagnifyingGlass size={15} />
              <span>Buscar...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-black/5 dark:bg-white/10 rounded border border-[var(--border)]">
                Ctrl+K
              </kbd>
            </button>

            {/* Botón rápido de Asistencia QR */}
            <button
              type="button"
              onClick={() => onNavigate("asistencia-qr")}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#14214F] text-white hover:bg-[#1D2E68] transition-colors cursor-pointer focus-visible shadow-2xs"
            >
              <QrCode size={16} />
              <span>Registrar Asistencia QR</span>
            </button>

            {/* Alternador de tema / Apariencia */}
            <button
              type="button"
              onClick={() => onNavigate("apariencia")}
              title="Personalizar tema de color y accesibilidad"
              className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[#14214F] transition-colors cursor-pointer"
            >
              <Palette size={18} />
            </button>

            {/* Campana de avisos / Notificaciones con Popover interactivo */}
            <button
              type="button"
              onClick={() => setNotifPopoverOpen(true)}
              title="Ver notificaciones del portal"
              className="relative p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[#14214F] transition-colors cursor-pointer"
            >
              <Bell size={18} />
              {unreadAvisosCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B91C1C] text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadAvisosCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Viewport de contenido principal con min-w-0 estricto para evitar scroll horizontal (A8) */}
        <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 max-w-7xl w-full mx-auto min-w-0 pb-20 md:pb-8">
          {children}
        </main>

        {/* Pie de página institucional */}
        <footer className="mt-auto px-4 sm:px-6 md:px-8 py-6 border-t border-[var(--border)] text-xs text-[var(--text-muted)] bg-[var(--surface-raised)] min-w-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <AlumnosIcon size={26} variant="marca" />
              <div className="min-w-0">
                <p className="font-semibold text-[var(--text)] truncate">
                  ISFDyT N° 26 — Dirección General de Cultura y Educación
                </p>
                <p className="mt-0.5 truncate">
                  Dolores, Provincia de Buenos Aires · Formación Superior Docente y Técnica
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono shrink-0">
              <span className="text-[var(--accent)] font-bold">PORTAL DEL ALUMNO</span>
              <span>·</span>
              <span>Régimen Académico Marco Res. 4043/09</span>
            </div>
          </div>
        </footer>

        {/* 4. BARRA DE ACCESO RÁPIDO INFERIOR PARA MÓVIL */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 bg-[#14214F] text-white border-t border-[#24356E] flex justify-around py-2 px-2 z-30"
          aria-label="Acceso rápido móvil"
        >
          <button
            type="button"
            onClick={() => onNavigate("inicio")}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] cursor-pointer ${
              currentSection === "inicio" ? "text-[#AF9B63] font-bold" : "text-white/70"
            }`}
          >
            <House size={20} />
            <span>Inicio</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate("materias")}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] cursor-pointer ${
              currentSection === "materias" ? "text-[#AF9B63] font-bold" : "text-white/70"
            }`}
          >
            <BookOpen size={20} />
            <span>Materias</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate("asistencia-qr")}
            className="flex flex-col items-center gap-1 p-1 text-[10px] text-[#AF9B63] font-bold cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#89743A] text-white flex items-center justify-center -mt-3 shadow-md">
              <QrCode size={18} />
            </div>
            <span>Escanear QR</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate("notas")}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] cursor-pointer ${
              currentSection === "notas" ? "text-[#AF9B63] font-bold" : "text-white/70"
            }`}
          >
            <GraduationCap size={20} />
            <span>Notas</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate("faltas")}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] cursor-pointer ${
              currentSection === "faltas" ? "text-[#AF9B63] font-bold" : "text-white/70"
            }`}
          >
            <ClockCounterClockwise size={20} />
            <span>Faltas</span>
          </button>
        </nav>
      </div>

      {/* MODAL DE BÚSQUEDA GLOBAL (Ctrl+K) */}
      <GlobalSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(sec, param) => {
          onNavigate(sec, param);
          setSearchOpen(false);
        }}
        materias={materias}
        evaluaciones={evaluaciones}
        agenda={agenda}
        avisos={avisos}
        foros={foros}
      />

      {/* POPOVER DE NOTIFICACIONES */}
      <NotificationsPopover
        isOpen={notifPopoverOpen}
        onClose={() => setNotifPopoverOpen(false)}
        notificaciones={notificaciones}
        onMarcarLeida={(id, refId, tipo) => {
          if (onMarcarNotificacionLeida) onMarcarNotificacionLeida(id, refId, tipo);
        }}
        onMarcarTodasLeidas={() => {
          if (onMarcarTodasNotificacionesLeidas) onMarcarTodasNotificacionesLeidas();
        }}
        onNavigate={(sec, param) => {
          onNavigate(sec, param);
          setNotifPopoverOpen(false);
        }}
      />
    </div>
  );
};
