/**
 * Panel de Familias — Sistema de Gestión Escolar ISFDyT N° 26
 * Módulo V: Panel de Familias y Tutores
 */

import React from 'react';
import { AuthProvider, useAuth } from './familias/context/AuthContext';
import { AppProvider, useApp } from './familias/context/AppContext';
import { Layout } from './familias/components/Layout';
import { LoginScreen } from './familias/auth/LoginScreen';
import { ChangePasswordScreen } from './familias/auth/ChangePasswordScreen';
import { UnauthorizedRoleScreen } from './familias/auth/UnauthorizedRoleScreen';

// Pantallas
import { HomeScreen } from './familias/screens/HomeScreen';
import { AttendanceScreen } from './familias/screens/AttendanceScreen';
import { GradesScreen } from './familias/screens/GradesScreen';
import { AgendaScreen } from './familias/screens/AgendaScreen';
import { NoticesScreen } from './familias/screens/NoticesScreen';
import { JustificationsScreen } from './familias/screens/JustificationsScreen';
import { AuthorizationsScreen } from './familias/screens/AuthorizationsScreen';
import { MessagesScreen } from './familias/screens/MessagesScreen';
import { ProfileScreen } from './familias/screens/ProfileScreen';
import { SettingsScreen } from './familias/screens/SettingsScreen';

import { Toaster } from 'sonner';
import { INSTITUTION_INFO } from './familias/config/themes';
import { PresentationIntro } from './familias/components/PresentationIntro';
import { FamiliasBrandIcon } from './familias/components/FamiliasBrandIcon';

const ScreenRouter: React.FC = () => {
  const { activeScreen } = useApp();

  switch (activeScreen) {
    case 'inicio':
      return <HomeScreen />;
    case 'asistencia':
      return <AttendanceScreen />;
    case 'calificaciones':
      return <GradesScreen />;
    case 'agenda':
      return <AgendaScreen />;
    case 'comunicados':
      return <NoticesScreen />;
    case 'justificaciones':
      return <JustificationsScreen />;
    case 'autorizaciones':
      return <AuthorizationsScreen />;
    case 'mensajes':
      return <MessagesScreen />;
    case 'perfil':
      return <ProfileScreen />;
    case 'opciones':
      return <SettingsScreen />;
    default:
      return <HomeScreen />;
  }
};

const MainController: React.FC = () => {
  const { user, isLoading, isGuardian, mustChangePassword } = useAuth();
  const { showPresentation, setShowPresentation } = useApp();

  // El video tiene que aparecer al refrescar esta pantalla: es la presentación oficial
  if (showPresentation) {
    return (
      <PresentationIntro
        onComplete={() => setShowPresentation(false)}
      />
    );
  }

  // Pantalla de carga inicial mientras verifica sesión HttpOnly
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#14214F] text-white p-4">
        <FamiliasBrandIcon size="xl" className="mb-4 shadow-lg animate-pulse" />
        <h1 className="text-lg font-bold uppercase tracking-wider font-display">
          {INSTITUTION_INFO.name}
        </h1>
        <p className="text-xs text-[#AF9B63] uppercase tracking-widest font-semibold mt-1">
          Panel de Familias
        </p>
        <div className="mt-6 flex items-center gap-2 text-xs text-slate-300">
          <div className="w-2 h-2 rounded-full bg-[#AF9B63] animate-ping" />
          <span>Verificando sesión institucional...</span>
        </div>
      </div>
    );
  }

  // Si no hay sesión iniciada, mostrar Login
  if (!user) {
    return <LoginScreen />;
  }

  // Si el usuario no tiene rol GUARDIAN (Requisito §3)
  if (!isGuardian) {
    return <UnauthorizedRoleScreen />;
  }

  // Si debe cambiar la contraseña obligatoriamente (Requisito §3)
  if (mustChangePassword) {
    return <ChangePasswordScreen />;
  }

  // Usuario autenticado con rol GUARDIAN y contraseña vigente
  return (
    <Layout>
      <ScreenRouter />
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainController />
        <Toaster position="top-right" richColors closeButton />
      </AppProvider>
    </AuthProvider>
  );
}
