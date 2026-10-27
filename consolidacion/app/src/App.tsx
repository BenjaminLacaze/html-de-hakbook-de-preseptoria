// App consolidada: Preceptoría, Auxiliares y Centro de Estudiantes.
//
// Las tres secciones se rescataron de "julian appcompleta" sin reescribirlas
// (src/legacy/). Esta App reemplaza a la App.tsx original solo para estas secciones:
//   - Modo demo (por defecto): elegís la sección y trabaja con datos de ejemplo en memoria.
//   - Modo API (VITE_USE_MOCK="false"): usa la sesión real; la asistencia del preceptor se
//     lee y se guarda en la base común (la misma planilla que usa Profesores).
// Las pantallas de inicio de sesión se agregan en el próximo paso (ver docs/LOGIN_PANTALLAS.md).
import React, { useEffect, useState } from 'react';
import { getMe, logout as apiLogout } from '@shared/api';
import type { AuthMe, Role as ApiRole } from '@shared/types';
import { PreceptorDashboard } from './legacy/components/PreceptorDashboard';
import { StaffDashboard } from './legacy/components/StaffDashboard';
import { StudentRepDashboard } from './legacy/components/StudentRepDashboard';
import { CLASS_SCHEDULE, SUBJECTS } from './legacy/constants';
import { ForumThreadStatus, Role, type StudentRepClaim, type User } from './legacy/types';
import { useApiAttendance } from './data/useApiAttendance';
import { useLegacyStore, type LegacyStore } from './data/useLegacyStore';

export const USE_API = import.meta.env.VITE_USE_MOCK === 'false';

type Section = 'preceptoria' | 'auxiliares' | 'centro';

const SECTIONS: { id: Section; title: string; description: string; legacyRole: Role; apiRoles: ApiRole[] }[] = [
  {
    id: 'preceptoria',
    title: 'Preceptoría',
    description: 'Toma de asistencia, justificaciones, historial, alertas y comunicados.',
    legacyRole: Role.PRECEPTOR,
    apiRoles: ['PRECEPTOR', 'SUPER_ADMIN'],
  },
  {
    id: 'auxiliares',
    title: 'Auxiliares',
    description: 'Tareas del día, instalaciones, incidencias, mantenimiento y turnos.',
    legacyRole: Role.STAFF,
    apiRoles: ['STAFF', 'SUPER_ADMIN'],
  },
  {
    id: 'centro',
    title: 'Centro de Estudiantes',
    description: 'Eventos, comunicados, foros de la comunidad y reclamos.',
    legacyRole: Role.STUDENT_REP,
    apiRoles: ['STUDENT_REP', 'SUPER_ADMIN'],
  },
];

export const App: React.FC = () => {
  const store = useLegacyStore();
  const [section, setSection] = useState<Section | null>(null);
  const [me, setMe] = useState<AuthMe | null>(null);
  const [sessionState, setSessionState] = useState<'loading' | 'ready' | 'none' | 'error'>(USE_API ? 'loading' : 'ready');

  useEffect(() => {
    if (!USE_API) return;
    getMe()
      .then((m) => {
        setMe(m);
        setSessionState(m ? 'ready' : 'none');
      })
      .catch(() => setSessionState('error'));
  }, []);

  const allowed = USE_API ? SECTIONS.filter((s) => me && s.apiRoles.some((r) => me.user.roles.includes(r))) : SECTIONS;

  // Con una sola sección disponible, se entra directo.
  useEffect(() => {
    if (USE_API && sessionState === 'ready' && allowed.length === 1 && !section) setSection(allowed[0].id);
  }, [sessionState, allowed, section]);

  const leave = async () => {
    if (USE_API) {
      await apiLogout().catch(() => undefined);
      window.location.href = '/';
      return;
    }
    setSection(null);
  };

  if (USE_API && sessionState !== 'ready') {
    return (
      <CenteredMessage
        title={
          sessionState === 'loading'
            ? 'Cargando…'
            : sessionState === 'none'
              ? 'Tenés que iniciar sesión'
              : 'No se pudo conectar con el servidor'
        }
        detail={
          sessionState === 'none'
            ? 'La pantalla de ingreso de esta app se agrega en el próximo paso.'
            : sessionState === 'error'
              ? 'Revisá tu conexión y recargá la página.'
              : undefined
        }
      />
    );
  }

  if (!section) {
    return <SectionPicker sections={allowed} me={me} onPick={setSection} onLeave={leave} />;
  }

  return <SectionView section={section} store={store} me={me} onLeave={leave} />;
};

// ---------------------------------------------------------------------------

const SectionView: React.FC<{ section: Section; store: LegacyStore; me: AuthMe | null; onLeave: () => void }> = ({
  section,
  store,
  me,
  onLeave,
}) => {
  const def = SECTIONS.find((s) => s.id === section)!;
  // Usuario de ejemplo de esa sección (modo demo). En modo API, el preceptor se arma desde la sesión.
  const demoUser = store.users.find((u) => u.role === def.legacyRole) as User;
  const api = useApiAttendance(section === 'preceptoria' && USE_API ? me : null);

  if (section === 'preceptoria') {
    if (USE_API && api.state !== 'ready') {
      return <CenteredMessage title={api.state === 'loading' ? 'Cargando asistencia…' : 'No se pudo cargar la asistencia'} detail={api.error} />;
    }
    const user = USE_API ? api.preceptor! : demoUser;
    const attendance = USE_API ? api.attendance! : store.demoAttendance;
    const students = USE_API ? api.students! : store.users.filter((u) => u.role === Role.STUDENT);
    const subjects = USE_API ? api.subjects! : SUBJECTS;
    return (
      <PreceptorDashboard
        {...store.commonProps(user, onLeave)}
        students={students}
        attendanceRecords={attendance.attendanceRecords}
        addAttendanceRecord={attendance.addAttendanceRecord}
        updateAttendanceStatus={attendance.updateAttendanceStatus}
        resolveJustificationRequest={attendance.resolveJustificationRequest}
        subjects={subjects}
        newsItems={store.newsItems}
        addNewsItem={(item) => store.setNewsItems((p) => [{ ...item, id: `news-${Date.now()}` }, ...p])}
        deleteNewsItem={(id) => store.setNewsItems((p) => p.filter((i) => i.id !== id))}
        privateMessages={store.privateMessages}
        sendPrivateMessage={(senderId, receiverId, text) =>
          store.setPrivateMessages((p) => [
            ...p,
            { id: `msg-${Date.now()}`, senderId, receiverId, text, timestamp: new Date().toISOString(), read: false },
          ])
        }
        markMessagesAsRead={(readerId, chatterId) =>
          store.setPrivateMessages((p) => p.map((m) => (m.receiverId === readerId && m.senderId === chatterId ? { ...m, read: true } : m)))
        }
        onCreateQRSession={async (subjectId) => ({
          id: `qr-${Date.now()}`,
          subjectId,
          preceptorId: user.id,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          location: { latitude: 0, longitude: 0 },
          radius: 100,
        })}
        forumThreads={store.forumThreads}
        forumReplies={store.forumReplies}
        onUpdateForumThreadStatus={(threadId, status, reason) =>
          store.setForumThreads((p) => p.map((t) => (t.id === threadId ? { ...t, status, rejectionReason: reason } : t)))
        }
        onAddForumReply={(reply) =>
          store.setForumReplies((p) => [{ ...reply, id: `reply-${Date.now()}`, timestamp: new Date().toISOString() }, ...p])
        }
        onDeleteForumThread={(threadId) => store.setForumThreads((p) => p.filter((t) => t.id !== threadId))}
        onDeleteForumReply={(replyId) => store.setForumReplies((p) => p.filter((r) => r.id !== replyId))}
        onEditThread={(threadId, title, content) =>
          store.setForumThreads((p) => p.map((t) => (t.id === threadId ? { ...t, title, content, status: ForumThreadStatus.PENDING } : t)))
        }
        onToggleLockThread={(threadId) => store.setForumThreads((p) => p.map((t) => (t.id === threadId ? { ...t, isLocked: !t.isLocked } : t)))}
        classSchedule={CLASS_SCHEDULE}
        customEvents={store.customEvents}
        onAddEvent={(event) => store.setCustomEvents((p) => [...p, { ...event, id: `custom-${Date.now()}` }])}
        studentRepEvents={store.studentRepEvents}
        eventParticipants={store.eventParticipants}
        onJoinEvent={(eventId, userId) =>
          store.setEventParticipants((p) => {
            const cur = p[eventId] || [];
            return cur.includes(userId) ? p : { ...p, [eventId]: [...cur, userId] };
          })
        }
        studentRepThreads={store.studentRepThreads}
        studentRepReplies={store.studentRepReplies}
        onUpdateStudentRepReplies={store.setStudentRepReplies}
        studentRepClaims={store.studentRepClaims}
        onAddStudentRepClaim={(claim: Omit<StudentRepClaim, 'id' | 'authorId' | 'timestamp' | 'status'>) =>
          store.setStudentRepClaims((p) => [
            { ...claim, id: `src-${Date.now()}`, authorId: user.id, timestamp: new Date().toISOString(), status: 'pendiente' },
            ...p,
          ])
        }
      />
    );
  }

  if (section === 'auxiliares') {
    return (
      <StaffDashboard
        {...store.commonProps(demoUser, onLeave)}
        dailyTasks={store.dailyTasks}
        onUpdateTasks={store.setDailyTasks}
        maintenanceHistory={store.maintenanceHistory}
        onUpdateMaintenanceHistory={store.setMaintenanceHistory}
        installations={store.installations}
        onUpdateInstallations={store.setInstallations}
        incidents={store.incidents}
        onUpdateIncidents={store.setIncidents}
      />
    );
  }

  return (
    <StudentRepDashboard
      {...store.commonProps(demoUser, onLeave)}
      studentRepEvents={store.studentRepEvents}
      onUpdateStudentRepEvents={store.setStudentRepEvents}
      studentRepThreads={store.studentRepThreads}
      onUpdateStudentRepThreads={store.setStudentRepThreads}
      studentRepReplies={store.studentRepReplies}
      onUpdateStudentRepReplies={store.setStudentRepReplies}
      studentRepAnnouncements={store.studentRepAnnouncements}
      onUpdateStudentRepAnnouncements={store.setStudentRepAnnouncements}
      studentRepClaims={store.studentRepClaims}
      onUpdateStudentRepClaims={store.setStudentRepClaims}
      eventParticipants={store.eventParticipants}
    />
  );
};

// ---------------------------------------------------------------------------

const SectionPicker: React.FC<{
  sections: typeof SECTIONS;
  me: AuthMe | null;
  onPick: (s: Section) => void;
  onLeave: () => void;
}> = ({ sections, me, onPick, onLeave }) => (
  <div className="min-h-screen" style={{ background: 'var(--i26-bg)' }}>
    <div className="consolidacion-bar">
      <div className="max-w-5xl mx-auto px-4 py-2 flex justify-between items-center">
        <span>ISFDyT N.° 26 · Sistema de Gestión</span>
        {USE_API ? (
          <button onClick={onLeave} className="underline">
            Cerrar sesión
          </button>
        ) : (
          <a href="/" className="underline">
            Volver al inicio
          </a>
        )}
      </div>
    </div>
    <main className="max-w-5xl mx-auto px-4 py-12">
      <p className="i26-eyebrow">Consolidación</p>
      <h1 style={{ font: '700 2.2rem/1.15 var(--i26-font-heading)', color: 'var(--i26-blue)', margin: '0.4rem 0 0.6rem' }}>
        {me ? `Hola, ${me.user.firstName}` : 'Elegí una sección'}
      </h1>
      <p style={{ color: 'var(--i26-text-muted)', maxWidth: '60ch' }}>
        {USE_API
          ? 'Secciones disponibles para tu cuenta.'
          : 'Modo demostración: cada sección usa datos de ejemplo y nada se guarda al recargar.'}
      </p>
      {sections.length === 0 ? (
        <div className="i26-card" style={{ padding: '1.5rem', marginTop: '2rem' }}>
          Tu cuenta no tiene acceso a ninguna de estas secciones.
        </div>
      ) : (
        <div className="grid gap-4 mt-8 md:grid-cols-3">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => onPick(s.id)}
              className="i26-card text-left p-6 hover:shadow-lg transition-shadow focus:outline-none focus-visible:ring-4"
            >
              <span className="i26-eyebrow">{s.id === 'preceptoria' ? 'Asistencia' : s.id === 'auxiliares' ? 'Edificio' : 'Comunidad'}</span>
              <h2 style={{ font: '700 1.3rem/1.3 var(--i26-font-heading)', color: 'var(--i26-blue)', margin: '0.3rem 0' }}>{s.title}</h2>
              <p style={{ color: 'var(--i26-text-muted)', fontSize: '0.92rem' }}>{s.description}</p>
              <span className="i26-btn i26-btn-primary" style={{ marginTop: '1rem' }}>
                Entrar →
              </span>
            </button>
          ))}
        </div>
      )}
    </main>
  </div>
);

const CenteredMessage: React.FC<{ title: string; detail?: string }> = ({ title, detail }) => (
  <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--i26-bg)' }}>
    <div className="i26-card text-center" style={{ padding: '2rem', maxWidth: 480 }}>
      <h1 style={{ font: '700 1.3rem/1.3 var(--i26-font-heading)', color: 'var(--i26-blue)' }}>{title}</h1>
      {detail && <p style={{ color: 'var(--i26-text-muted)', marginTop: '0.5rem' }}>{detail}</p>}
      <a href="/" className="i26-btn i26-btn-secondary" style={{ marginTop: '1.2rem' }}>
        Ir al inicio
      </a>
    </div>
  </div>
);
