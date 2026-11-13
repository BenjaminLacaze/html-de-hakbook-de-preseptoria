import React from 'react';
import type { Teacher, Commission, ClassSession, AcademicObservation, ActiveScreen } from '../types';
import { Badge } from '../components/common/Badge';
import {
  Users,
  ClipboardCheck,
  MessageSquare,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  GraduationCap,
  Mail,
} from 'lucide-react';

interface DashboardViewProps {
  teacher: Teacher;
  commissions: Commission[];
  sessions: ClassSession[];
  observations: AcademicObservation[];
  onNavigate: (screen: ActiveScreen, context?: { commissionId?: string }) => void;
}

const formatDate = (iso: string): string => {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  teacher,
  commissions,
  sessions,
  observations,
  onNavigate,
}) => {
  const totalStudents = commissions.reduce((acc, c) => acc + c.studentCount, 0);
  const closedSessions = sessions.filter((s) => s.isClosed);
  const cycle = commissions[0]?.academicYear || 'Ciclo lectivo 2026';
  const subtitle = [teacher.title, teacher.department].filter(Boolean).join(' · ');

  const quickActions = [
    { label: 'Tomar asistencia', desc: 'Presente, ausente o tarde', icon: ClipboardCheck, screen: 'attendance' as const },
    { label: 'Registrar observación', desc: 'Seguimiento cualitativo', icon: MessageSquare, screen: 'observations' as const },
    { label: 'Calificaciones', desc: 'Parciales, recuperatorios y final', icon: GraduationCap, screen: 'grades' as const },
    { label: 'Agenda', desc: 'Fechas institucionales', icon: Calendar, screen: 'agenda' as const },
    { label: 'Mensajes', desc: 'Conversaciones institucionales', icon: Mail, screen: 'messages' as const },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <span className="eyebrow">{cycle} · ISFDyT N.° 26</span>
        <h1 className="page-title">Hola, {teacher.name}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </header>

      <section aria-label="Resumen de cátedras">
        <div className="stats-strip">
          <div className="stat-item">
            <span className="stat-label">Comisiones</span>
            <strong className="stat-value">{commissions.length}</strong>
            <span className="stat-hint">Materias a cargo</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Estudiantes</span>
            <strong className="stat-value">{totalStudents}</strong>
            <span className="stat-hint">Matrícula activa</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Clases con asistencia</span>
            <strong className="stat-value">{closedSessions.length}</strong>
            <span className="stat-hint">de {sessions.length} registradas</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Observaciones</span>
            <strong className="stat-value">{observations.length}</strong>
            <span className="stat-hint">Seguimientos asentados</span>
          </div>
        </div>
      </section>

      <section aria-labelledby="quick-actions-title">
        <div className="section-header">
          <div>
            <h2 id="quick-actions-title" className="section-title">
              Accesos
            </h2>
            <p className="section-hint">Las tareas que más usás en el día.</p>
          </div>
        </div>
        <div className="quick-grid">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                className="quick-action"
                onClick={() => onNavigate(action.screen)}
              >
                <span className="quick-icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span style={{ flex: 1 }}>
                  <span className="quick-title">{action.label}</span>
                  <span className="quick-desc">{action.desc}</span>
                </span>
                <ArrowRight size={16} color="var(--color-text-muted)" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="commissions-title">
        <div className="section-header">
          <div>
            <h2 id="commissions-title" className="section-title">
              Mis comisiones
            </h2>
            <p className="section-hint">Asignadas a tu legajo en el ciclo vigente.</p>
          </div>
          <button type="button" onClick={() => onNavigate('commissions')} className="btn btn-secondary btn-sm">
            Ver todas
          </button>
        </div>

        {commissions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No tenés comisiones asignadas en este ciclo.
          </div>
        ) : (
          <div className="commission-list">
            {commissions.map((comm) => (
              <div key={comm.id} className="commission-row">
                <div>
                  <span className="commission-code">{comm.code}</span>
                  <h3 className="commission-title">{comm.subjectName}</h3>
                  <p className="commission-career">{comm.careerName}</p>
                </div>
                <div className="commission-meta">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={14} aria-hidden="true" />
                    {comm.schedule}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} aria-hidden="true" />
                    {comm.classroom || 'Sin aula'} · {comm.studentCount} estudiantes
                  </span>
                </div>
                <div className="commission-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onNavigate('students', { commissionId: comm.id })}
                  >
                    <Users size={14} aria-hidden="true" />
                    Estudiantes
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => onNavigate('attendance', { commissionId: comm.id })}
                  >
                    <ClipboardCheck size={14} aria-hidden="true" />
                    Asistencia
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="recent-title">
        <div className="section-header">
          <div>
            <h2 id="recent-title" className="section-title">
              Actividad reciente
            </h2>
            <p className="section-hint">Últimas clases registradas.</p>
          </div>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container activity-table" style={{ border: 'none' }}>
            <table aria-label="Historial reciente de clases del docente">
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Comisión</th>
                  <th scope="col">Tema</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Acción</th>
                </tr>
              </thead>
              <tbody>
                {sessions.slice(0, 6).map((ses) => {
                  const comm = commissions.find((c) => c.id === ses.commissionId);
                  return (
                    <tr key={ses.id}>
                      <td data-label="Fecha" style={{ whiteSpace: 'nowrap' }}>{formatDate(ses.date)}</td>
                      <td data-label="Comisión">
                        <strong style={{ color: 'var(--isf-blue-primary)' }}>{comm?.name || ses.commissionId}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{comm?.subjectName}</div>
                      </td>
                      <td data-label="Tema" style={{ maxWidth: '320px' }}>{ses.topic || 'Clase regular'}</td>
                      <td data-label="Estado">
                        <Badge status={ses.isClosed ? 'CERRADA' : 'ABIERTA'} />
                      </td>
                      <td data-label="Acción">
                        <button
                          type="button"
                          onClick={() => onNavigate('attendance', { commissionId: ses.commissionId })}
                          className="btn btn-secondary btn-sm"
                        >
                          {ses.isClosed ? 'Ver' : 'Tomar asistencia'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
