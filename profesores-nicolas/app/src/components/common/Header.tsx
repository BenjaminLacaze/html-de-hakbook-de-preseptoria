import React from 'react';
import type { Teacher } from '../../types';
import { Menu, X, UserCheck } from 'lucide-react';

interface HeaderProps {
  teacher: Teacher;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  teacher,
  isMobileMenuOpen,
  onToggleMobileMenu,
}) => {
  return (
    <header
      style={{
        backgroundColor: 'var(--isf-blue-primary)',
        color: 'var(--isf-white)',
        borderBottom: '3px solid var(--isf-gold-sand)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.5rem',
          maxWidth: '1440px',
          margin: '0 auto',
        }}
      >
        {/* Identidad Institucional */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={onToggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="app-sidebar"
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              color: 'var(--isf-white)',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {isMobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            {/* Isotipo institucional con tipografía oficial de marca */}
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: 'var(--isf-white)',
                color: 'var(--isf-blue-primary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-family-logo)',
                fontWeight: 800,
                fontSize: '0.75rem',
                lineHeight: 1.1,
                border: '2px solid var(--isf-gold-sand)',
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              <span style={{ fontSize: '0.65rem', color: 'var(--isf-gold-text)', fontWeight: 700 }}>ISFDyT</span>
              <span style={{ fontSize: '1rem', color: 'var(--isf-blue-primary)', fontWeight: 800 }}>26</span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: 'var(--isf-white)',
                  }}
                >
                  ISFDyT N.° 26
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    backgroundColor: 'rgba(175, 155, 99, 0.25)',
                    color: '#E6DCB8',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(175, 155, 99, 0.5)',
                    fontWeight: 600,
                  }}
                >
                  SGA
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.8rem',
                  color: '#CBD5E1',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Módulo Docente — Gestión Académica
              </p>
            </div>
          </div>
        </div>

        {/* Perfil del docente */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              textAlign: 'right',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--isf-white)',
                }}
              >
                {teacher.name}
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '0.1rem 0.35rem',
                  borderRadius: '3px',
                  color: '#F1F5F9',
                  fontFamily: 'var(--font-family-mono)',
                }}
                title="Legajo docente institucional"
              >
                {teacher.legajo}
              </span>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#94A3B8',
                maxWidth: '280px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {teacher.department}
            </span>
          </div>

          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'var(--isf-blue-hover)',
              border: '2px solid var(--isf-gold-sand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--isf-white)',
              flexShrink: 0,
            }}
            title="Usuario docente autenticado"
            aria-label="Perfil de usuario docente"
          >
            <UserCheck size={20} aria-hidden="true" />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </header>
  );
};
