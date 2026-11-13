import React from 'react';
import type { ActiveScreen } from '../../types';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardCheck,
  MessageSquare,
  GraduationCap,
  Calendar,
  Mail,
} from 'lucide-react';

interface SidebarProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  commissionCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeScreen,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
  commissionCount,
}) => {
  const navItems: { id: ActiveScreen; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Panel', icon: <LayoutDashboard size={18} aria-hidden="true" /> },
    { id: 'commissions', label: 'Comisiones', icon: <BookOpen size={18} aria-hidden="true" />, badge: `${commissionCount}` },
    { id: 'students', label: 'Estudiantes', icon: <Users size={18} aria-hidden="true" /> },
    { id: 'attendance', label: 'Asistencia', icon: <ClipboardCheck size={18} aria-hidden="true" /> },
    { id: 'grades', label: 'Calificaciones', icon: <GraduationCap size={18} aria-hidden="true" /> },
    { id: 'agenda', label: 'Agenda', icon: <Calendar size={18} aria-hidden="true" /> },
    { id: 'messages', label: 'Mensajes', icon: <Mail size={18} aria-hidden="true" /> },
    { id: 'observations', label: 'Observaciones', icon: <MessageSquare size={18} aria-hidden="true" /> },
  ];

  const handleSelect = (screen: ActiveScreen) => {
    onNavigate(screen);
    if (isMobileOpen) onCloseMobile();
  };

  return (
    <>
      {isMobileOpen && <div onClick={onCloseMobile} aria-hidden="true" className="sidebar-overlay" />}

      <aside
        id="app-sidebar"
        className={`sidebar ${isMobileOpen ? 'open' : ''}`}
        aria-label="Menú de navegación del módulo docente"
      >
        <div className="sidebar-brand">
          <img src="/logo-profesores.jpg" alt="" aria-hidden="true" />
          <div>
            <span className="sidebar-brand-title">Módulo Docente</span>
            <span className="sidebar-brand-sub">ISFDyT N.° 26</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Secciones del módulo">
          {navItems.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`sidebar-link ${isActive ? 'is-active' : ''}`}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span className="sidebar-link-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                {item.badge && <span className="sidebar-badge">{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <strong>Sistema de Gestión Académica</strong>
          Ciclo lectivo 2026
        </div>
      </aside>
    </>
  );
};
