import React, { useState, useEffect } from 'react';
import type { ActiveScreen, Commission, Teacher, ClassSession, AcademicObservation } from './types';
import { academicService } from './services/academicService';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { DemoBanner } from './components/common/DemoBanner';
import { AlertNotification } from './components/common/AlertNotification';
import { DashboardView } from './views/DashboardView';
import { CommissionsView } from './views/CommissionsView';
import { StudentsView } from './views/StudentsView';
import { AttendanceView } from './views/AttendanceView';
import { ObservationsView } from './views/ObservationsView';
import './styles/global.css';

export const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('dashboard');
  const [navigationContext, setNavigationContext] = useState<{
    commissionId?: string;
    studentId?: string;
  }>({});

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [observations, setObservations] = useState<AcademicObservation[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [globalNotification, setGlobalNotification] = useState<string | null>(null);

  // Cargar datos iniciales
  const loadData = async () => {
    try {
      const [tch, comms, obs] = await Promise.all([
        academicService.getCurrentTeacher(),
        academicService.getCommissions(),
        academicService.getObservations(),
      ]);
      setTeacher(tch);
      setCommissions(comms);
      setObservations(obs);

      // Cargar sesiones de la primera comisión si existe
      if (comms.length > 0) {
        const sess = await academicService.getClassSessions(comms[0].id);
        setSessions(sess);
      }
    } catch (err) {
      console.error('Error al cargar datos institucionales:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNavigate = (
    screen: ActiveScreen,
    context?: { commissionId?: string; studentId?: string }
  ) => {
    if (context) {
      setNavigationContext(context);
    }
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetData = async () => {
    await academicService.resetDemoData();
    await loadData();
    setGlobalNotification(
      'Los datos de demostración han sido restablecidos con éxito a sus valores iniciales predeterminados.'
    );
  };

  if (!teacher) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--color-bg-app)',
          fontFamily: 'var(--font-family-body)',
          color: 'var(--isf-blue-primary)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            ISFDyT N.° 26 — SGA Módulo Docente
          </div>
          <p style={{ color: 'var(--color-text-muted)' }}>Cargando entorno institucional...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Barra Lateral de Navegación Accesible */}
      <Sidebar
        activeScreen={activeScreen}
        onNavigate={handleNavigate}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        commissionCount={commissions.length}
      />

      <div className="main-wrapper">
        {/* Encabezado Institucional */}
        <Header
          teacher={teacher}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Banner de Aviso de Demostración Local */}
        <DemoBanner onResetData={handleResetData} />

        {/* Notificación global al restablecer datos */}
        {globalNotification && (
          <div style={{ padding: '1rem 2rem 0' }}>
            <AlertNotification
              type="info"
              message={globalNotification}
              onClose={() => setGlobalNotification(null)}
            />
          </div>
        )}

        {/* Contenido Principal con Enlace de Salto */}
        <main id="main-content" tabIndex={-1} className="main-content">
          {activeScreen === 'dashboard' && (
            <DashboardView
              teacher={teacher}
              commissions={commissions}
              sessions={sessions}
              observations={observations}
              onNavigate={handleNavigate}
            />
          )}

          {activeScreen === 'commissions' && (
            <CommissionsView
              commissions={commissions}
              onNavigate={handleNavigate}
            />
          )}

          {activeScreen === 'students' && (
            <StudentsView
              commissions={commissions}
              initialCommissionId={navigationContext.commissionId}
              onNavigate={handleNavigate}
            />
          )}

          {activeScreen === 'attendance' && (
            <AttendanceView
              commissions={commissions}
              initialCommissionId={navigationContext.commissionId}
              onNavigate={handleNavigate}
            />
          )}

          {activeScreen === 'observations' && (
            <ObservationsView
              commissions={commissions}
              initialCommissionId={navigationContext.commissionId}
              initialStudentId={navigationContext.studentId}
              onNavigate={handleNavigate}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
