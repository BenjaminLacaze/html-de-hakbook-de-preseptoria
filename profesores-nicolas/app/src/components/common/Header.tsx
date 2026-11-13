import React from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

/** Barra superior solo para mobile: en escritorio la navegación vive en el sidebar. */
export const Header: React.FC<HeaderProps> = ({ isMobileMenuOpen, onToggleMobileMenu }) => (
  <header className="mobile-topbar">
    <button
      type="button"
      onClick={onToggleMobileMenu}
      aria-label={isMobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
      aria-expanded={isMobileMenuOpen}
      aria-controls="app-sidebar"
    >
      {isMobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
    </button>
    <strong>Módulo Docente</strong>
  </header>
);
