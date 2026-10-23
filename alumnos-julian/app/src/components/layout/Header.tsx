import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  QrCode,
  Bell,
  Sun,
  Moon,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../../lib/themeContext';
import { navigationGroups } from './Sidebar';

interface HeaderProps {
  onOpenMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  // Determinar título contextual según la ruta activa
  const allNavItems = navigationGroups.flatMap((g) => g.items);
  const currentNav = allNavItems.find((item) => item.path === location.pathname);
  const pageTitle = currentNav?.name || 'Panel de Alumno';

  const isDark = theme === 'oscuro' || theme === 'fantasma' || theme === 'rebelde';

  const toggleThemeMode = () => {
    if (isDark) {
      setTheme('celestial');
    } else {
      setTheme('oscuro');
    }
  };

  const simulatedNotifications = [
    {
      id: 'notif-1',
      title: 'Nota de Parcial publicada',
      time: 'Hace 2 horas',
      text: 'Se publicó la calificación de Programación III (8.50 / 10).',
      icon: GraduationCap,
      type: 'success',
    },
    {
      id: 'notif-2',
      title: 'Límite de inasistencias',
      time: 'Ayer',
      text: 'Redes y Telecomunicaciones: 3 faltas registradas de 4 permitidas.',
      icon: AlertTriangle,
      type: 'warning',
    },
    {
      id: 'notif-3',
      title: 'Próxima entrega de TP',
      time: '18 Oct',
      text: 'Bases de Datos II: Entrega de agregaciones MongoDB el 20/10.',
      icon: Calendar,
      type: 'info',
    },
  ];

  return (
    <header className="h-16 border-b border-subtle-custom bg-surface sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 gap-4">
      {/* Zone 1: Mobile Menu Trigger + Context Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          aria-label="Abrir menú de navegación"
          className="md:hidden w-9 h-9 rounded-[var(--radius-current)] flex items-center justify-center text-secondary-custom hover:text-primary-custom hover:bg-[var(--bg-surface-elevated)] border border-subtle-custom"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-muted-custom">
            <span>Asistencia Terciario</span>
            <span aria-hidden="true">/</span>
            <span className="text-secondary-custom font-medium truncate">{pageTitle}</span>
          </div>
          <h1 className="text-sm sm:text-base font-bold text-primary-custom tracking-tight leading-tight">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Zone 2: Academic Period Context (Middle) */}
      <div className="hidden lg:flex items-center gap-2 text-xs text-secondary-custom">
        <span className="font-semibold text-primary-custom">Período Académico 2026</span>
        <span aria-hidden="true">·</span>
        <span>2° Cuatrimestre</span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" /> Alumno Regular
        </span>
      </div>

      {/* Zone 3: Actions (Quick QR, Notifications, Theme toggle) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick QR Attendance CTA */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/asistencia-qr')}
          className="hidden sm:inline-flex"
        >
          <QrCode className="w-4 h-4" />
          <span>Presentismo QR</span>
        </Button>

        {/* Theme quick toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleThemeMode}
          title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          aria-label="Cambiar tema visual"
          className="text-secondary-custom hover:text-primary-custom h-9 w-9"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications((prev) => !prev)}
            title="Avisos y notificaciones"
            aria-label="Ver avisos y notificaciones"
            className="text-secondary-custom hover:text-primary-custom h-9 w-9 relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" />
          </Button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowNotifications(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-subtle-custom rounded-[var(--radius-current)] shadow-xl z-40 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-subtle-custom pb-2.5">
                  <span className="text-xs font-bold text-primary-custom">Avisos Académicos</span>
                  <span className="text-[11px] text-muted-custom">3 no leídos</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {simulatedNotifications.map((notif) => {
                    const Icon = notif.icon;
                    return (
                      <div
                        key={notif.id}
                        className="p-2.5 rounded-[calc(var(--radius-current)-2px)] bg-[var(--bg-surface-elevated)]/60 border border-subtle-custom hover:border-strong-custom transition-colors flex gap-3 text-left"
                      >
                        <div
                          className="w-7 h-7 rounded flex items-center justify-center shrink-0 mt-0.5 bg-surface border border-subtle-custom text-[var(--accent-primary)]"
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-primary-custom truncate">
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-muted-custom shrink-0">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-secondary-custom mt-0.5 leading-snug">
                            {notif.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-subtle-custom text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/historial');
                    }}
                  >
                    Ver historial completo de eventos
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
