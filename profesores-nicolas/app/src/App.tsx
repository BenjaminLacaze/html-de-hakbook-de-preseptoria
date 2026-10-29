import { GradesView } from './views/GradesView';
import React, { useState, useEffect } from 'react';
import type { ActiveScreen, Commission, Teacher, ClassSession, AcademicObservation } from './types';
import { academicService } from './services/academicService';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { SessionGate } from '@shared/auth/SessionGate';
import type { AuthMe } from '@shared/types';
import { AlertNotification } from './components/common/AlertNotification';
import { DashboardView } from './views/DashboardView';
import { CommissionsView } from './views/CommissionsView';
import { StudentsView } from './views/StudentsView';
import { AttendanceView } from './views/AttendanceView';
import { ObservationsView } from './views/ObservationsView';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import './styles/global.css';

const TeacherApp: React.FC<{ me: AuthMe }> = ({ me }) => {
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
        academicService.getCurrentTeacher(me),
        academicService.getCommissions(),
        academicService.getObservations(),
      ]);
      setTeacher(tch);
      setCommissions(comms);
      setObservations(obs);

      // Cargar sesiones de todas las comisiones asignadas al docente
      if (comms.length > 0) {
        const commIds = new Set(comms.map((c) => c.id));
        const allSessions = await academicService.getClassSessions();
        const teacherSessions = allSessions.filter((s) => commIds.has(s.commissionId));
        setSessions(teacherSessions);
      } else {
        setSessions([]);
      }
    } catch (err) {
      setGlobalNotification(err instanceof Error ? err.message : 'No se pudieron cargar los datos.');
    }
  };

  useEffect(() => {
    void loadData();
    const refresh = () => { void loadData(); };
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [me]);

  const handleNavigate = (
    screen: ActiveScreen,
    context?: { commissionId?: string; studentId?: string }
  ) => {
    if (context) {
      setNavigationContext(context);
    }
    setActiveScreen(screen);
    // Sincronizar métricas y bitácora en vivo cuando el docente regresa al panel principal
    if (screen === 'dashboard') {
      loadData();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const shouldReduceMotion = useReducedMotion();

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
          <p style={{ color: 'var(--color-text-muted)' }}>{globalNotification ?? 'Cargando entorno institucional...'}</p>
          {globalNotification && <button onClick={() => { setGlobalNotification(null); void loadData(); }}>Reintentar</button>}
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

        {/* Contenido Principal con Enlace de Salto y Transición Discreta */}
        <main id="main-content" tabIndex={-1} className="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScreen}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
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

              {activeScreen === 'grades' && <GradesView commissions={commissions} />}

              {activeScreen === 'observations' && (
                <ObservationsView
                  commissions={commissions}
                  initialCommissionId={navigationContext.commissionId}
                  initialStudentId={navigationContext.studentId}
                  onNavigate={handleNavigate}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => <SessionGate apps={["profesores"]}>{me => <TeacherApp key={me.user.id} me={me} />}</SessionGate>;

export default App;
