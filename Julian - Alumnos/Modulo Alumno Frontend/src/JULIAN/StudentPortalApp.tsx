import React, { useState } from 'react';
import { usePortal } from './context/PortalContext';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AgendaPage } from './pages/AgendaPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { GradesPage } from './pages/GradesPage';
import { AttendancePage } from './pages/AttendancePage';
import { HistoryPage } from './pages/HistoryPage';
import { CommunityPage } from './pages/CommunityPage';
import { ForumsPage } from './pages/ForumsPage';
import { OptionsPage } from './pages/OptionsPage';
import { AppearancePage } from './pages/AppearancePage';
import { QRAttendancePage } from './pages/QRAttendancePage';
import { AttendanceJustificationModal } from './components/modals/AttendanceJustificationModal';
import { SubjectDetailModal } from './components/modals/SubjectDetailModal';
import { LogoutConfirmModal } from './components/modals/LogoutConfirmModal';
import { getFontFamilyClass, getBorderRadiusClass } from './styles/themes';
import { LogIn, ShieldCheck } from 'lucide-react';

export const StudentPortalApp: React.FC = () => {
  const {
    activeSection,
    appearance,
    themeColors,
    isSessionActive,
    reloginDemo,
    student
  } = usePortal();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const radius = getBorderRadiusClass(appearance.borderStyle);
  const fontClass = getFontFamilyClass(appearance.fontFamily);

  // If student logged out, show clean return screen
  if (!isSessionActive) {
    return (
      <div
        style={{
          backgroundColor: themeColors.bgPage,
          color: themeColors.textPrimary
        }}
        className={`min-h-screen flex items-center justify-center p-4 ${fontClass}`}
      >
        <div
          style={{
            backgroundColor: themeColors.bgCard,
            borderColor: themeColors.borderSubtle
          }}
          className={`w-full max-w-md p-8 border text-center shadow-xl space-y-5 ${radius.card}`}
        >
          <img
            src="/src/assets/images/instituto26_shield_crest_1792192527347.jpg"
            alt="Instituto 26"
            referrerPolicy="no-referrer"
            className="w-16 h-16 mx-auto rounded-xl object-cover border border-[#D4AF37]/50 shadow-xs"
          />

          <div className="space-y-1">
            <h2 className="text-xl font-extrabold tracking-tight" style={{ color: themeColors.textPrimary }}>
              Sesión Finalizada
            </h2>
            <p className="text-xs" style={{ color: themeColors.textMuted }}>
              Has salido de forma segura del Panel de Alumno del Instituto 26.
            </p>
          </div>

          <div
            style={{ backgroundColor: themeColors.bgSubtle }}
            className={`p-3 text-xs ${radius.inner} space-y-1 text-left`}
          >
            <div className="flex justify-between">
              <span style={{ color: themeColors.textMuted }}>Estudiante:</span>
              <span className="font-semibold" style={{ color: themeColors.textPrimary }}>
                {student.fullName}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: themeColors.textMuted }}>Legajo:</span>
              <span className="font-mono text-slate-500">{student.legajo}</span>
            </div>
          </div>

          <button
            onClick={reloginDemo}
            style={{
              backgroundColor: themeColors.accentGold,
              color: '#FFFFFF'
            }}
            className={`w-full py-2.5 text-xs font-bold shadow-xs hover:opacity-95 transition-opacity flex items-center justify-center gap-2 ${radius.button}`}
          >
            <LogIn className="w-4 h-4" />
            <span>Reingresar al Panel de Demostración</span>
          </button>
        </div>
      </div>
    );
  }

  // Render current view
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'inicio':
        return <DashboardPage />;
      case 'perfil':
        return <ProfilePage />;
      case 'agenda':
        return <AgendaPage />;
      case 'materias':
        return <SubjectsPage />;
      case 'notas':
        return <GradesPage />;
      case 'faltas':
        return <AttendancePage />;
      case 'historial':
        return <HistoryPage />;
      case 'comunidad':
        return <CommunityPage />;
      case 'foros':
        return <ForumsPage />;
      case 'opciones':
        return <OptionsPage />;
      case 'apariencia':
        return <AppearancePage />;
      case 'asistencia-qr':
        return <QRAttendancePage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div
      style={{
        backgroundColor: themeColors.bgPage,
        color: themeColors.textPrimary
      }}
      className={`min-h-screen flex flex-col ${fontClass}`}
    >
      {/* Top Bar Navigation */}
      <TopBar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="hidden lg:block shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Navigation Drawer */}
        <MobileNav
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveSection()}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <AttendanceJustificationModal />
      <SubjectDetailModal />
      <LogoutConfirmModal />
    </div>
  );
};
