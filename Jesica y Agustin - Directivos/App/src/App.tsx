import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/layout/TopBar';
import { SideBar } from './components/layout/SideBar';
import { DashboardView } from './components/views/DashboardView';
import { UsersView } from './components/views/UsersView';
import { CoursesView } from './components/views/CoursesView';
import { AttendanceView } from './components/views/AttendanceView';
import { GradesView } from './components/views/GradesView';
import { OrganizationView } from './components/views/OrganizationView';
import { NoticesView } from './components/views/NoticesView';
import { ReportsView } from './components/views/ReportsView';
import { AuditView } from './components/views/AuditView';
import { SettingsView } from './components/views/SettingsView';
import { BackendContractView } from './components/views/BackendContractView';
import {
  Menu,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  X,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeSection, systemNotification } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeSection) {
      case 'inicio':
        return <DashboardView />;
      case 'usuarios':
        return <UsersView />;
      case 'cursos':
        return <CoursesView />;
      case 'asistencia':
        return <AttendanceView />;
      case 'rendimiento':
        return <GradesView />;
      case 'organizacion':
        return <OrganizationView />;
      case 'comunicados':
        return <NoticesView />;
      case 'informes':
        return <ReportsView />;
      case 'auditoria':
        return <AuditView />;
      case 'configuracion':
        return <SettingsView />;
      case 'contrato':
        return <BackendContractView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#14214F] flex flex-col font-sans">
      {/* Top bar */}
      <TopBar />

      {/* Mobile subheader with menu button */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between no-print shadow-xs">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex items-center gap-2 text-xs font-semibold text-[#14214F] px-2.5 py-1.5 rounded hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-4 h-4 text-[#89743A]" />
          <span>Menú de Navegación</span>
        </button>
        <span className="text-[11px] font-mono text-slate-500 capitalize">
          {activeSection}
        </span>
      </div>

      {/* Main Body: Sidebar + Viewport */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <SideBar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <main className="flex-1 p-4 lg:p-8 min-w-0 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* System Toast Notification */}
      {systemNotification && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg border text-xs flex items-center gap-2.5 max-w-md ${
              systemNotification.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-900'
                : systemNotification.type === 'warning'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : systemNotification.type === 'info'
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            {systemNotification.type === 'error' && (
              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            {systemNotification.type === 'warning' && (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            {systemNotification.type === 'info' && (
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            {systemNotification.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span className="font-medium">{systemNotification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
