import React from 'react';
import type { ActiveScreen } from '../../types';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardCheck,
  MessageSquare,
  GraduationCap,
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
    {
      id: 'dashboard',
      label: 'Panel Principal',
      icon: <LayoutDashboard size={20} aria-hidden="true" />,
    },
    {
      id: 'commissions',
      label: 'Mis Comisiones',
      icon: <BookOpen size={20} aria-hidden="true" />,
      badge: `${commissionCount}`,
    },
    {
      id: 'students',
      label: 'Listado de Estudiantes',
      icon: <Users size={20} aria-hidden="true" />,
    },
    {
      id: 'attendance',
      label: 'Toma de Asistencia',
      icon: <ClipboardCheck size={20} aria-hidden="true" />,
    },
    {
      id: 'grades',
      label: 'Calificaciones',
      icon: <GraduationCap size={20} aria-hidden="true" />,
    },
    {
      id: 'observations',
      label: 'Observaciones Académicas',
      icon: <MessageSquare size={20} aria-hidden="true" />,
    },
  ];

  const handleSelect = (screen: ActiveScreen) => {
    onNavigate(screen);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Overlay móvil accesible */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 18, 46, 0.6)',
            zIndex: 90,
          }}
        />
      )}

      <aside
        id="app-sidebar"
        className={`app-sidebar ${isMobileOpen ? 'open' : ''}`}
        aria-label="Menú de navegación del módulo docente"
        style={{
          width: '260px',
          backgroundColor: 'var(--isf-blue-primary)',
          color: 'var(--color-text-sidebar)',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          flexShrink: 0,
          transition: 'transform 0.25s ease',
        }}
      >
        <div
          style={{
            padding: '1.25rem 1rem 0.75rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <span
            style={{
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-text-sidebar-muted)',
              fontWeight: 700,
            }}
          >
            Navegación Académica
          </span>
        </div>

        <nav
          style={{
            flex: 1,
            padding: '0.75rem 0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          {navItems.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: isActive
                    ? 'var(--color-bg-sidebar-active)'
                    : 'transparent',
                  color: isActive ? 'var(--isf-white)' : 'var(--color-text-sidebar)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                  borderLeft: isActive
                    ? '3px solid var(--isf-gold-sand)'
                    : '3px solid transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      color: isActive ? 'var(--isf-gold-sand)' : 'var(--color-text-sidebar-muted)',
                    }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isActive
                        ? 'var(--isf-gold-sand)'
                        : 'rgba(255, 255, 255, 0.12)',
                      color: isActive ? 'var(--isf-blue-primary)' : 'var(--isf-white)',
                      fontWeight: 700,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Pie institucional del menú lateral */}
        <div
          style={{
            padding: '1.25rem 1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <GraduationCap size={16} color="var(--isf-gold-sand)" aria-hidden="true" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--isf-white)' }}>
              ISFDyT N.° 26
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0, lineHeight: 1.3 }}>
            Instituto Superior de Formación Docente y Técnica N.° 26
          </p>
          <span
            style={{
              display: 'inline-block',
              marginTop: '0.5rem',
              fontSize: '0.7rem',
              color: 'var(--isf-gold-sand)',
            }}
          >
            Sistema de Gestión Académica
          </span>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .app-sidebar {
            position: fixed;
            top: 60px;
            bottom: 0;
            left: 0;
            z-index: 95;
            transform: translateX(-100%);
          }
          .app-sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};
