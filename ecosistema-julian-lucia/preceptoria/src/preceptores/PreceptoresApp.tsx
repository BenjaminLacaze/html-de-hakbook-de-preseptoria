/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { PreceptorProvider, usePreceptor } from './context/PreceptorContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { MoreMenuModal } from './components/layout/MoreMenuModal';
import { FichaAlumnoModal } from './components/common/FichaAlumnoModal';
import { InicioScreen } from './components/screens/InicioScreen';
import { TomarAsistenciaScreen } from './components/screens/TomarAsistenciaScreen';
import { HistorialScreen } from './components/screens/HistorialScreen';
import { AlumnosScreen } from './components/screens/AlumnosScreen';
import { JustificacionesScreen } from './components/screens/JustificacionesScreen';
import { AnunciosScreen } from './components/screens/AnunciosScreen';
import { MensajesScreen } from './components/screens/MensajesScreen';
import { AnalisisScreen } from './components/screens/AnalisisScreen';
import { ComunidadScreen } from './components/screens/ComunidadScreen';
import { OpcionesScreen } from './components/screens/OpcionesScreen';
import { PerfilScreen } from './components/screens/PerfilScreen';
import { initAppearance } from './config/theme';
import { Toaster } from 'sonner';
import { SessionGate } from './auth/SessionGate';
import { ArrowClockwise } from '@phosphor-icons/react';

import { IntroScreen } from './components/screens/IntroScreen';

const MainScreenDispatcher: React.FC = () => {
  const { activeScreen } = usePreceptor();

  switch (activeScreen) {
    case 'inicio':
      return <InicioScreen />;
    case 'asistencia':
      return <TomarAsistenciaScreen />;
    case 'historial':
      return <HistorialScreen />;
    case 'alumnos':
      return <AlumnosScreen />;
    case 'justificaciones':
      return <JustificacionesScreen />;
    case 'anuncios':
      return <AnunciosScreen />;
    case 'mensajes':
      return <MensajesScreen />;
    case 'analisis':
      return <AnalisisScreen />;
    case 'comunidad':
      return <ComunidadScreen />;
    case 'opciones':
      return <OpcionesScreen />;
    case 'perfil':
      return <PerfilScreen />;
    default:
      return <InicioScreen />;
  }
};

const PreceptoresAppContent: React.FC = () => {
  const { showIntroVideo, setShowIntroVideo, loadState, loadError, reload, logout } = usePreceptor();

  if (showIntroVideo) {
    return <IntroScreen onEnter={() => setShowIntroVideo(false)} />;
  }

  if (loadState !== 'ready') {
    return (
      <main className="min-h-screen grid place-items-center bg-[var(--bg-page)] text-[var(--text-primary)] p-4">
        {loadState === 'loading' ? (
          <p role="status" className="text-sm text-[var(--text-secondary)]">Cargando tus cursos, alumnos y asistencia…</p>
        ) : (
          <section className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-xl space-y-4 text-center">
            <h1 className="font-heading font-extrabold text-lg">No se pudo cargar el panel</h1>
            <p role="alert" className="text-xs text-[var(--text-secondary)]">{loadError}</p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={reload}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#89743A] hover:bg-[#73612F] text-white text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer"
              >
                <ArrowClockwise size={16} weight="bold" />
                <span>Reintentar</span>
              </button>
              <button
                type="button"
                onClick={() => void logout()}
                className="px-4 py-2 border border-[var(--border-strong)] text-[var(--text-secondary)] text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cerrar sesión
              </button>
            </div>
          </section>
        )}
      </main>
    );
  }

  return (
    <div className="min-h-screen flex bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors antialiased">
      {/* Desktop solid navy sidebar */}
      <Sidebar />

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          <MainScreenDispatcher />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />

      {/* Drawers & Modals */}
      <NotificationDrawer />
      <MoreMenuModal />
      <FichaAlumnoModal />

    </div>
  );
};

export const PreceptoresApp: React.FC = () => {
  useEffect(() => {
    initAppearance();
  }, []);

  return (
    <>
      <SessionGate>
        <PreceptorProvider>
          <PreceptoresAppContent />
        </PreceptorProvider>
      </SessionGate>
      {/* Toast Notifications */}
      <Toaster position="top-right" richColors closeButton />
    </>
  );
};

export default PreceptoresApp;
