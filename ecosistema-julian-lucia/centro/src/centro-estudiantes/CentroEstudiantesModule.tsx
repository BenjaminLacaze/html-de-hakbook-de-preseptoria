/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Módulo Principal del Panel del Centro de Estudiantes
 */

import React from 'react';
import { Toaster } from 'sonner';
import { CentroProvider, useCentro } from './context/CentroContext';
import { DesktopSidebar } from './components/navigation/DesktopSidebar';
import { TopBar } from './components/navigation/TopBar';
import { MobileTopBar } from './components/navigation/MobileTopBar';
import { MobileBottomBar } from './components/navigation/MobileBottomBar';
import { NotificationDrawer } from './components/navigation/NotificationDrawer';
import { PublishChooserModal } from './components/common/PublishChooserModal';
import { LogoutModal } from './components/common/LogoutModal';
import { AuthGate } from './components/auth/AuthGate';
import { Button } from './components/common/Button';
import { ArrowClockwise, WarningCircle } from '@phosphor-icons/react';

import { InicioScreen } from './components/screens/InicioScreen';
import { EventosScreen } from './components/screens/EventosScreen';
import { ComunicadosScreen } from './components/screens/ComunicadosScreen';
import { ForosScreen } from './components/screens/ForosScreen';
import { ReclamosScreen } from './components/screens/ReclamosScreen';
import { MiembrosScreen } from './components/screens/MiembrosScreen';
import { PerfilScreen } from './components/screens/PerfilScreen';

import { PresentationIntroScreen } from './components/presentation/PresentationIntroScreen';

const ScreenContent: React.FC = () => {
  const { currentScreen, loading, loadError, reload } = useCentro();

  if (loading) {
    return (
      <div className="p-12 text-center bg-surface-card rounded-xl border border-border-subtle text-sm text-foreground-muted" role="status">
        Cargando los datos del Centro…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-10 text-center bg-surface-card rounded-xl border border-border-subtle space-y-3" role="alert">
        <WarningCircle weight="bold" className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-base font-semibold text-foreground">No pudimos cargar los datos del Centro</h2>
        <p className="text-xs text-foreground-muted max-w-md mx-auto">{loadError}</p>
        <Button variant="accent-gold" size="sm" icon={<ArrowClockwise weight="bold" className="w-4 h-4" />} onClick={() => void reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  switch (currentScreen) {
    case 'inicio':
      return <InicioScreen />;
    case 'eventos':
      return <EventosScreen />;
    case 'comunicados':
      return <ComunicadosScreen />;
    case 'foros':
      return <ForosScreen />;
    case 'reclamos':
      return <ReclamosScreen />;
    case 'miembros':
      return <MiembrosScreen />;
    case 'perfil':
      return <PerfilScreen />;
    default:
      return <InicioScreen />;
  }
};

const CentroEstudiantesAppContent: React.FC = () => {
  const { showPresentation, setShowPresentation } = useCentro();

  // Si está activa la presentación, se muestra la pantalla de bienvenida con video
  if (showPresentation) {
    return (
      <PresentationIntroScreen
        onEnterPanel={() => setShowPresentation(false)}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-surface text-foreground font-sans antialiased">
      {/* 1. Barra lateral sólida Navy para escritorio */}
      <DesktopSidebar />

      {/* 2. Área principal de contenido */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-6">
        {/* Barra superior Navy para celular / tablet */}
        <MobileTopBar />

        {/* Barra superior clara para escritorio */}
        <TopBar />

        {/* Vista principal dinámica */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <ScreenContent />
        </main>
      </div>

      {/* 3. Barra inferior fija para celular */}
      <MobileBottomBar />

      {/* 4. Diálogos globales y cajones */}
      <NotificationDrawer />
      <PublishChooserModal />
      <LogoutModal />

      {/* 5. Notificaciones Toast (Sonner) */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily: '"DM Sans", sans-serif',
            borderRadius: '12px',
          },
        }}
      />
    </div>
  );
};

export const CentroEstudiantesModule: React.FC = () => {
  return (
    <AuthGate>
      {(me, onLoggedOut) => (
        <CentroProvider key={me.user.id} me={me} onLoggedOut={onLoggedOut}>
          <CentroEstudiantesAppContent />
        </CentroProvider>
      )}
    </AuthGate>
  );
};
