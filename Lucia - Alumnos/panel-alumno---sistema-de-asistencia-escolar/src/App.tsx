/**
 * Aplicación Principal - Módulo Alumno
 * Sistema de Asistencia Escolar
 * Responsable: Lucia Salgado
 * Tecnicatura en Desarrollo de Software
 */

import React, { useState } from 'react';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavView } from './types';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { LoginView } from './components/views/LoginView';
import { HomeView } from './components/views/HomeView';
import { AttendanceView } from './components/views/AttendanceView';
import { ProfileView } from './components/views/ProfileView';
import { HelpView } from './components/views/HelpView';
import { AccessibilityView } from './components/views/AccessibilityView';

const AppContent: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const [activeView, setActiveView] = useState<NavView>('inicio');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  if (!isLoggedIn) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Navegación lateral (Sidebar) */}
      <Sidebar
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Área principal de contenido */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeView={activeView}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onNavigate={(view) => setActiveView(view)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeView === 'inicio' && <HomeView onNavigate={(view) => setActiveView(view)} />}
          {activeView === 'asistencia' && <AttendanceView />}
          {activeView === 'perfil' && <ProfileView />}
          {activeView === 'ayuda' && <HelpView onNavigate={(view) => setActiveView(view)} />}
          {activeView === 'accesibilidad' && <AccessibilityView />}
        </main>

        {/* Pie de página institucional */}
        <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>
            Sistema de Asistencia Escolar · <strong>Módulo Alumno</strong>
          </p>
          <p className="mt-0.5">
            Responsable del Módulo: <strong>Lucia Salgado</strong> · Tecnicatura en Desarrollo de Software
          </p>
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </AccessibilityProvider>
  );
}
