import React, { useState } from 'react';
import {
  Bell,
  QrCode,
  Menu,
  GraduationCap,
  Sparkles,
  CheckCircle,
  X
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { getBorderRadiusClass } from '../../styles/themes';
import { ActiveSection } from '../../types';

interface TopBarProps {
  onOpenMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu }) => {
  const {
    activeSection,
    setActiveSection,
    student,
    notifications,
    markNotificationsAsRead,
    appearance,
    themeColors
  } = usePortal();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const radius = getBorderRadiusClass(appearance.borderStyle);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const sectionTitles: Record<ActiveSection, string> = {
    inicio: 'Inicio / Resumen General',
    perfil: 'Perfil del Alumno',
    agenda: 'Agenda y Calendario Académico',
    materias: 'Materias en Cursada',
    notas: 'Mis Calificaciones y Evaluaciones',
    faltas: 'Control de Asistencias e Inasistencias',
    historial: 'Historial Académico Completo',
    comunidad: 'Comunidad Educativa I26',
    foros: 'Foros de Debate Académico',
    opciones: 'Configuración de Cuenta',
    apariencia: 'Personalización Visual y Temas',
    'asistencia-qr': 'Registro de Asistencia QR'
  };

  return (
    <header
      style={{
        backgroundColor: themeColors.bgCard,
        borderColor: themeColors.borderSubtle
      }}
      className="sticky top-0 z-30 flex items-center justify-between gap-4 lg:gap-8 px-4 lg:px-8 py-3.5 border-b"
    >
      {/* Zone 1: Brand & Mobile Trigger */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveSection('inicio')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div
            style={{
              backgroundColor: themeColors.accentGold,
              color: '#FFFFFF'
            }}
            className={`w-8 h-8 ${radius.inner} flex items-center justify-center font-bold text-sm shadow-xs`}
          >
            I26
          </div>
          <div className="whitespace-nowrap">
            <span
              style={{ color: themeColors.textPrimary }}
              className="text-sm font-bold tracking-tight block"
            >
              Instituto 26
            </span>
            <span
              style={{ color: themeColors.textMuted }}
              className="text-[11px] font-medium hidden sm:block"
            >
              Asistencia Terciario · Alumno
            </span>
          </div>
        </button>
      </div>

      {/* Zone 2: Breadcrumb / Section Context */}
      <div className="hidden md:flex items-center gap-2 text-xs overflow-hidden shrink min-w-0">
        <span style={{ color: themeColors.textMuted }}>Portal Alumno</span>
        <span style={{ color: themeColors.textMuted }} aria-hidden="true">/</span>
        <span
          style={{ color: themeColors.accentGold }}
          className="font-semibold truncate max-w-xs"
        >
          {sectionTitles[activeSection] || 'Panel'}
        </span>
      </div>

      {/* Zone 3: Actions & Quick QR & Notifications */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Quick QR Attendance CTA */}
        <button
          onClick={() => setActiveSection('asistencia-qr')}
          style={{
            backgroundColor: themeColors.accentGold,
            color: '#FFFFFF'
          }}
          className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold hover:opacity-95 transition-opacity ${radius.button} shadow-xs whitespace-nowrap shrink-0`}
        >
          <QrCode className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Asistencia QR</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            style={{
              backgroundColor: themeColors.bgSubtle,
              color: themeColors.textPrimary,
              borderColor: themeColors.borderSubtle
            }}
            className={`p-2 border relative hover:border-slate-400 focus:outline-none transition-colors ${radius.button}`}
            aria-label={`Notificaciones ${unreadCount > 0 ? `(${unreadCount} no leídas)` : ''}`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span
                style={{
                  backgroundColor: themeColors.accentGold,
                  color: '#FFFFFF'
                }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center tabular-nums"
              >
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div
              style={{
                backgroundColor: themeColors.bgCard,
                borderColor: themeColors.borderStrong,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)'
              }}
              className={`absolute right-0 mt-2 w-80 sm:w-96 p-4 border z-50 ${radius.card}`}
            >
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: themeColors.borderSubtle }}>
                <div className="flex items-center gap-2">
                  <span style={{ color: themeColors.textPrimary }} className="text-sm font-semibold">
                    Notificaciones
                  </span>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        backgroundColor: themeColors.accentSurface,
                        color: themeColors.accentText
                      }}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                    >
                      {unreadCount} nuevas
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markNotificationsAsRead}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Marcar leídas
                    </button>
                  )}
                  <button
                    onClick={() => setIsNotifOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Cerrar panel de notificaciones"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="divide-y max-h-72 overflow-y-auto" style={{ borderColor: themeColors.borderSubtle }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (n.targetSection) setActiveSection(n.targetSection);
                      setIsNotifOpen(false);
                    }}
                    style={{
                      backgroundColor: n.read ? 'transparent' : themeColors.accentSurface + '40'
                    }}
                    className="py-2.5 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        style={{ color: themeColors.textPrimary }}
                        className={`text-xs ${n.read ? 'font-normal' : 'font-semibold'}`}
                      >
                        {n.title}
                      </span>
                      <span style={{ color: themeColors.textMuted }} className="text-[10px] whitespace-nowrap">
                        {n.timestamp}
                      </span>
                    </div>
                    <p style={{ color: themeColors.textSecondary }} className="text-xs mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2.5 border-t text-center" style={{ borderColor: themeColors.borderSubtle }}>
                <button
                  onClick={() => {
                    setActiveSection('inicio');
                    setIsNotifOpen(false);
                  }}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Ver centro de avisos en Inicio
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Quick Summary */}
        <button
          onClick={() => setActiveSection('perfil')}
          style={{
            backgroundColor: themeColors.bgSubtle,
            borderColor: themeColors.borderSubtle
          }}
          className={`flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 border hover:border-slate-400 transition-colors ${radius.button} text-left`}
        >
          <img
            src={student.avatarUrl}
            alt={student.fullName}
            referrerPolicy="no-referrer"
            className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
          />
          <div className="hidden lg:block whitespace-nowrap">
            <span
              style={{ color: themeColors.textPrimary }}
              className="text-xs font-semibold block leading-tight"
            >
              {student.fullName}
            </span>
            <span
              style={{ color: themeColors.textMuted }}
              className="text-[10px] block tabular-nums leading-tight"
            >
              {student.legajo} · {student.division}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};
