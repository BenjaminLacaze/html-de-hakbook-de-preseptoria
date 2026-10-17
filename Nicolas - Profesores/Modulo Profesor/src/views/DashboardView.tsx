import React from 'react';
import type { Teacher, Commission, ClassSession, AcademicObservation, ActiveScreen } from '../types';
import { Badge } from '../components/common/Badge';
import {
  BookOpen,
  Users,
  ClipboardCheck,
  MessageSquare,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
} from 'lucide-react';

interface DashboardViewProps {
  teacher: Teacher;
  commissions: Commission[];
  sessions: ClassSession[];
  observations: AcademicObservation[];
  onNavigate: (screen: ActiveScreen, context?: { commissionId?: string }) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  teacher,
  commissions,
  sessions,
  observations,
  onNavigate,
}) => {
  const totalStudents = commissions.reduce((acc, c) => acc + c.studentCount, 0);
  const closedSessions = sessions.filter((s) => s.isClosed);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Banner de Bienvenida Institucional */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--isf-blue-primary) 0%, var(--isf-blue-hover) 100%)',
          color: 'var(--isf-white)',
          border: 'none',
          padding: '1.75rem 2rem',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                backgroundColor: 'rgba(175, 155, 99, 0.3)',
                color: '#F4ECCC',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                border: '1px solid rgba(175, 155, 99, 0.5)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Ciclo Lectivo 2026
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>•</span>
            <span style={{ fontSize: '0.82rem', color: '#CBD5E1' }}>ISFDyT N.° 26</span>
          </div>

          <h1 style={{ color: 'var(--isf-white)', fontSize: '1.65rem', marginBottom: '0.5rem' }}>
            Bienvenido, {teacher.name}
          </h1>
          <p style={{ color: '#E2E8F0', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
            Desde este panel podés gestionar el seguimiento de tus comisiones, registrar la asistencia en clases presenciales y asentar observaciones cualitativas pedagógicas.
          </p>
        </div>

        {/* Detalle visual sutil de fondo */}
        <div
          style={{
            position: 'absolute',
            right: '-20px',
            bottom: '-30px',
            opacity: 0.08,
            fontSize: '12rem',
            fontWeight: 900,
            color: '#FFFFFF',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
          aria-hidden="true"
        >
          26
        </div>
      </div>

      {/* Tarjetas de Métricas de Resumen */}
      <section aria-labelledby="section-summary-title">
        <h2 id="section-summary-title" className="sr-only">
          Resumen cuantitativo del profesor
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                Comisiones Asignadas
              </span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--isf-blue-sky-light)',
                  color: 'var(--isf-blue-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-hidden="true"
              >
                <BookOpen size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--isf-blue-primary)' }}>
              {commissions.length}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Materias de grado regular
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                Total Estudiantes
              </span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#EFF6FF',
                  color: '#1D4ED8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-hidden="true"
              >
                <Users size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--isf-blue-primary)' }}>
              {totalStudents}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              En tus comisiones simuladas
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                Clases con Asistencia
              </span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-hidden="true"
              >
                <ClipboardCheck size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--isf-blue-primary)' }}>
              {closedSessions.length}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Registros históricos activos
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                Observaciones Cargadas
              </span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#FEF3C7',
                  color: '#B45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-hidden="true"
              >
                <MessageSquare size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--isf-blue-primary)' }}>
              {observations.length}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Anotaciones formativas
            </span>
          </div>
        </div>
      </section>

      {/* Accesos Rápidos Operativos */}
      <section aria-labelledby="section-quick-actions">
        <h2 id="section-quick-actions" style={{ fontSize: '1.2rem', marginBottom: '0.85rem' }}>
          Acciones Frecuentes
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => onNavigate('attendance')}
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              border: '1px solid var(--color-border-light)',
              backgroundColor: '#FFFFFF',
              textAlign: 'left',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--isf-blue-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ClipboardCheck size={22} aria-hidden="true" />
              </div>
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--isf-blue-primary)', display: 'block' }}>
                  Tomar Asistencia del Día
                </strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  Registrar Presente, Ausente o Tarde por estudiante
                </span>
              </div>
            </div>
            <ArrowRight size={18} color="var(--isf-blue-primary)" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('observations')}
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              border: '1px solid var(--color-border-light)',
              backgroundColor: '#FFFFFF',
              textAlign: 'left',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--isf-gold-ochre)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MessageSquare size={22} aria-hidden="true" />
              </div>
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--isf-blue-primary)', display: 'block' }}>
                  Registrar Observación
                </strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  Anotar seguimiento cualitativo del estudiante
                </span>
              </div>
            </div>
            <ArrowRight size={18} color="var(--isf-gold-ochre)" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Mis Comisiones Asignadas */}
      <section aria-labelledby="section-commissions-title">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div>
            <h2 id="section-commissions-title" style={{ fontSize: '1.2rem', margin: 0 }}>
              Mis Comisiones Asignadas
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Asignadas formalmente a tu identidad docente en el ciclo actual
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('commissions')}
            className="btn btn-secondary btn-sm"
          >
            Ver todas ({commissions.length})
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {commissions.map((comm) => (
            <div
              key={comm.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.25rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-family-mono)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--isf-gold-ochre)',
                      backgroundColor: 'var(--isf-gold-light)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      border: '1px solid var(--isf-gold-border)',
                    }}
                  >
                    {comm.code}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--color-text-secondary)',
                      backgroundColor: '#F1F5F9',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                    }}
                  >
                    Turno {comm.shift}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', color: 'var(--isf-blue-primary)', marginBottom: '0.25rem' }}>
                  {comm.subjectName}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                  {comm.careerName} — <strong>{comm.name}</strong>
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={14} color="var(--isf-blue-sky)" aria-hidden="true" />
                    <span>{comm.schedule}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={14} color="var(--isf-blue-sky)" aria-hidden="true" />
                    <span>{comm.classroom}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Users size={14} color="var(--isf-blue-sky)" aria-hidden="true" />
                    <span>{comm.studentCount} estudiantes matriculados</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--color-border-light)', paddingTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => onNavigate('students', { commissionId: comm.id })}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  Estudiantes
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('attendance', { commissionId: comm.id })}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                  Asistencia
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Actividad Académica Reciente Simulada */}
      <section aria-labelledby="section-recent-activity">
        <h2 id="section-recent-activity" style={{ fontSize: '1.2rem', marginBottom: '0.85rem' }}>
          Actividad Académica Registrada en el Período
        </h2>
        <div className="card" style={{ padding: '1rem' }}>
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table aria-label="Historial reciente de clases del docente">
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Comisión y Materia</th>
                  <th scope="col">Tema de la Clase</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Acción</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((ses) => {
                  const comm = commissions.find((c) => c.id === ses.commissionId);
                  return (
                    <tr key={ses.id}>
                      <td style={{ fontWeight: 600, color: 'var(--isf-blue-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Calendar size={14} color="var(--color-text-muted)" aria-hidden="true" />
                          <span>{ses.date}</span>
                        </div>
                      </td>
                      <td>
                        <strong>{comm?.name || ses.commissionId}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          {comm?.subjectName}
                        </div>
                      </td>
                      <td style={{ maxWidth: '300px' }}>
                        <span style={{ fontSize: '0.85rem' }}>{ses.topic || 'Clase regular'}</span>
                      </td>
                      <td>
                        <Badge status={ses.isClosed ? 'CERRADA' : 'ABIERTA'} />
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => onNavigate('attendance', { commissionId: ses.commissionId })}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.8rem', minHeight: '32px' }}
                        >
                          {ses.isClosed ? 'Ver Asistencia' : 'Tomar Asistencia'}
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
