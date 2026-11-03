import React from 'react';
import { ArrowsClockwise, WarningCircle } from '@phosphor-icons/react';
import { AuxiliaresProvider, useAuxiliares } from './context/AuxiliaresContext';
import { SessionGate } from './auth/SessionGate';
import {
  DesktopSidebar,
  DesktopHeader,
  ConnectionBanner,
  MobileNavigation,
} from './components/Navigation';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { PhotoViewerModal } from './components/PhotoViewerModal';
import { TareasScreen } from './screens/TareasScreen';
import { IncidenciasScreen } from './screens/IncidenciasScreen';
import { ReportarIncidenciaScreen } from './screens/ReportarIncidenciaScreen';
import { InstalacionesScreen } from './screens/InstalacionesScreen';
import { TurnosScreen } from './screens/TurnosScreen';
import { JustificacionesScreen } from './screens/JustificacionesScreen';
import { HistorialScreen } from './screens/HistorialScreen';
import { ComunidadScreen } from './screens/ComunidadScreen';
import { PerfilScreen } from './screens/PerfilScreen';
import { OpcionesScreen } from './screens/OpcionesScreen';
import { IntroScreen } from './screens/IntroScreen';
import { Toaster } from 'sonner';

/** Primera carga: espera o error con reintento antes de mostrar las pantallas. */
const LoadState: React.FC = () => {
  const { loading, loadErrors, reload, logout } = useAuxiliares();
  return (
    <div className="min-h-screen bg-[#080E1E] text-white flex items-center justify-center p-4">
      {loading ? (
        <p role="status" className="text-sm text-slate-300 flex items-center gap-2">
          <ArrowsClockwise size={18} className="animate-spin text-[#C8A14D]" />
          Cargando tu jornada desde el sistema institucional…
        </p>
      ) : (
        <div className="max-w-md w-full rounded-2xl bg-[#0E1730] border border-[#1C2E56] p-6 space-y-4">
          <div className="flex items-center gap-2 text-red-300">
            <WarningCircle size={22} weight="fill" />
            <h1 className="font-heading font-bold text-lg">No se pudieron cargar los datos</h1>
          </div>
          <ul className="text-xs text-slate-300 list-disc pl-5 space-y-1">
            {loadErrors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void reload()}
              className="flex-1 py-2.5 rounded-lg bg-[#C8A14D] hover:brightness-110 text-[#0A1124] text-xs font-bold"
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="flex-1 py-2.5 rounded-lg border border-[#1C2E56] text-slate-300 text-xs font-bold hover:bg-white/5"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const MainLayout: React.FC = () => {
  const { currentScreen, showIntro, loading, allFailed } = useAuxiliares();

  if (showIntro) {
    return <IntroScreen />;
  }

  // Si fallaron todos los bloques no hay nada útil que mostrar.
  if (loading || allFailed) {
    return <LoadState />;
  }

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'tareas':
        return <TareasScreen />;
      case 'incidencias':
        return <IncidenciasScreen />;
      case 'reportar':
        return <ReportarIncidenciaScreen />;
      case 'plano':
        return <InstalacionesScreen />;
      case 'turnos':
        return <TurnosScreen />;
      case 'justificaciones':
        return <JustificacionesScreen />;
      case 'historial':
        return <HistorialScreen />;
      case 'comunidad':
        return <ComunidadScreen />;
      case 'perfil':
        return <PerfilScreen />;
      case 'opciones':
        return <OpcionesScreen />;
      default:
        return <TareasScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#080E1E] text-white flex flex-col lg:flex-row antialiased selection:bg-[#C8A14D] selection:text-[#0A1124]">
      {/* Mobile Top & Bottom Navigation */}
      <MobileNavigation />

      {/* Desktop Left Sidebar */}
      <DesktopSidebar />

      {/* Desktop & Mobile Main Column */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#080E1E]">
        {/* Desktop Top Header Bar */}
        <DesktopHeader />

        {/* Estado de la conexión con la API (errores parciales y reintento) */}
        <ConnectionBanner />

        {/* Screen Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveScreen()}
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationsDrawer />

      {/* Photo Viewer Modal */}
      <PhotoViewerModal />
    </div>
  );
};

export const AuxiliaresApp: React.FC = () => {
  return (
    <>
      <SessionGate>
        {({ me, logout }) => (
          // key: si cambia la cuenta, se descarta todo lo cargado de la anterior.
          <AuxiliaresProvider key={me.user.id} me={me} onLogout={logout}>
            <MainLayout />
          </AuxiliaresProvider>
        )}
      </SessionGate>

      {/* Sonner Toast Container (Accessible feedback) */}
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', sans-serif",
            borderRadius: '12px',
          },
        }}
      />
    </>
  );
};

export default AuxiliaresApp;
