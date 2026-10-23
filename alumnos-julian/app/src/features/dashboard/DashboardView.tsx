import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  GraduationCap,
  ClipboardCheck,
  AlertTriangle,
  QrCode,
  ArrowRight,
  BookOpen,
  MessageSquare,
  Sparkles,
  Clock,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { studentService } from '../../services/studentService';
import { subjectsService } from '../../services/subjectsService';
import { gradesService } from '../../services/gradesService';
import { agendaService } from '../../services/agendaService';
import { formatDate } from '../../lib/utils';

export const DashboardView: React.FC = () => {
  const navigate = useNavigate();

  const { data: student, isLoading: isStudentLoading } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: () => studentService.getProfile(),
  });

  const { data: subjects, isLoading: isSubjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsService.getSubjects(),
  });

  const { data: grades, isLoading: isGradesLoading } = useQuery({
    queryKey: ['grades'],
    queryFn: () => gradesService.getGrades(),
  });

  const { data: events, isLoading: isEventsLoading } = useQuery({
    queryKey: ['academicEvents'],
    queryFn: () => agendaService.getAcademicEvents(),
  });

  const { data: timeline, isLoading: isTimelineLoading } = useQuery({
    queryKey: ['timelineEvents'],
    queryFn: () => agendaService.getTimelineEvents(),
  });

  // Saludo contextual según hora
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  // Identificar materias en zona de atención (asistencia <= 80%)
  const warningSubjects = subjects?.filter((s) => s.porcentajeAsistencia <= 80) || [];

  // Próximas evaluaciones o entregas
  const upcomingAssessments = events?.filter((e) => e.tipo === 'Examen' || e.tipo === 'Entrega TP').slice(0, 3) || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[var(--radius-current)] border border-subtle-custom bg-surface p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-secondary-custom">
              <span className="font-semibold text-primary-custom">{greeting}</span>
              <span aria-hidden="true">·</span>
              <span>{student?.carrera || 'Tecnicatura Superior en Desarrollo de Software'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary-custom">
              {student ? `${student.nombre} ${student.apellido}` : 'Cargando perfil...'}
            </h2>
            <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed">
              Comisión {student?.comision || '2° A'} · Estado académico: <strong className="text-emerald-600 dark:text-emerald-400">Regular</strong>.
              Tenés 2 actividades académicas programadas para esta semana.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button variant="primary" size="md" onClick={() => navigate('/asistencia-qr')}>
              <QrCode className="w-4 h-4" />
              <span>Marcar Asistencia QR</span>
            </Button>
            <Button variant="secondary" size="md" onClick={() => navigate('/agenda')}>
              <Calendar className="w-4 h-4" />
              <span>Ver Agenda</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Overview Strip (Single level elevation with tabular numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Presentismo Global */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-secondary-custom">Presentismo Global</span>
            <div className="w-7 h-7 rounded bg-[var(--bg-surface-elevated)] flex items-center justify-center text-[var(--accent-primary)]">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-primary-custom font-mono tabular-nums">
              {student ? `${student.porcentajeAsistenciaGlobal.toFixed(1)}%` : '87.5%'}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Mínimo: 75%
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 w-full bg-[var(--bg-muted)] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${student?.porcentajeAsistenciaGlobal || 87.5}%` }}
            />
          </div>
          <span className="text-[11px] text-muted-custom mt-2 block">
            En regla institucional general
          </span>
        </Card>

        {/* Promedio General */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-secondary-custom">Promedio Parciales</span>
            <div className="w-7 h-7 rounded bg-[var(--bg-surface-elevated)] flex items-center justify-center text-amber-500">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-primary-custom font-mono tabular-nums">
              {student ? student.promedioGeneral.toFixed(2) : '8.42'}
            </span>
            <span className="text-xs text-secondary-custom">/ 10.00</span>
          </div>
          <p className="text-[11px] text-muted-custom mt-3">
            Calculado sobre 11 evaluaciones cargadas
          </p>
        </Card>

        {/* Materias en Curso */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-secondary-custom">Materias en Curso</span>
            <div className="w-7 h-7 rounded bg-[var(--bg-surface-elevated)] flex items-center justify-center text-[var(--accent-primary)]">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-primary-custom font-mono tabular-nums">
              {subjects?.length || 6}
            </span>
            <span className="text-xs text-emerald-600 font-medium">1 Promocionada</span>
          </div>
          <p className="text-[11px] text-muted-custom mt-3">
            Comisión 2° A · 2° Cuatrimestre
          </p>
        </Card>

        {/* Alerta de Asistencias */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-secondary-custom">Atención de Faltas</span>
            <div className="w-7 h-7 rounded bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-600 font-mono tabular-nums">
              1 Materia
            </span>
            <span className="text-xs text-secondary-custom">Redes (75.0%)</span>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-3 font-medium">
            3 de 4 faltas acumuladas
          </p>
        </Card>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Status por Materia & Próximas Evaluaciones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Materias & Resumen de Asistencia */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Estado Actual de Materias</CardTitle>
                <p className="text-xs text-secondary-custom mt-0.5">
                  Presentismo y condición académica por cátedra
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/materias')}>
                Ver todas <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {isSubjectsLoading ? (
                <div className="p-5 space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="divide-y divide-subtle-custom">
                  {subjects?.map((sub) => {
                    const isWarning = sub.porcentajeAsistencia <= 75;
                    const isCaution = sub.porcentajeAsistencia > 75 && sub.porcentajeAsistencia <= 85;

                    return (
                      <div
                        key={sub.id}
                        onClick={() => navigate('/materias')}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--bg-surface-elevated)]/50 transition-colors cursor-pointer"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-primary-custom truncate">
                              {sub.nombre}
                            </span>
                            <Badge
                              variant={
                                sub.estadoCursada === 'Promocionada'
                                  ? 'success'
                                  : isWarning
                                  ? 'danger'
                                  : 'default'
                              }
                            >
                              {sub.estadoCursada}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-secondary-custom">
                            <span>{sub.docentes[0]?.nombre}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">{sub.codigo}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                          {/* Presentismo metric */}
                          <div className="text-right">
                            <span className="text-xs text-muted-custom block">Asistencia</span>
                            <span
                              className={`text-sm font-bold font-mono tabular-nums ${
                                isWarning
                                  ? 'text-red-500 font-semibold'
                                  : isCaution
                                  ? 'text-amber-500'
                                  : 'text-primary-custom'
                              }`}
                            >
                              {sub.porcentajeAsistencia.toFixed(1)}%
                            </span>
                          </div>

                          {/* Faltas count */}
                          <div className="text-right">
                            <span className="text-xs text-muted-custom block">Faltas</span>
                            <span className="text-xs font-mono tabular-nums text-secondary-custom">
                              {sub.asistenciasAusentes} / {sub.limiteFaltas} máx
                            </span>
                          </div>

                          {/* Promedio parcial */}
                          <div className="text-right min-w-16">
                            <span className="text-xs text-muted-custom block">Promedio</span>
                            <span className="text-xs font-bold font-mono tabular-nums text-primary-custom">
                              {sub.promedioParciales ? sub.promedioParciales.toFixed(2) : 'S/D'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Próximas Evaluaciones y Entregas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Próximas Evaluaciones & Entregas</CardTitle>
                <p className="text-xs text-secondary-custom mt-0.5">
                  Fechas confirmadas por las cátedras
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/agenda')}>
                Calendario <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {isEventsLoading ? (
                <div className="p-5 space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : upcomingAssessments.length === 0 ? (
                <div className="p-6 text-center text-xs text-secondary-custom">
                  No hay exámenes programados para los próximos días.
                </div>
              ) : (
                <div className="divide-y divide-subtle-custom">
                  {upcomingAssessments.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-[var(--bg-surface-elevated)]/30 transition-colors"
                    >
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-[var(--radius-current)] bg-[var(--bg-surface-elevated)] border border-subtle-custom flex flex-col items-center justify-center shrink-0 text-center font-mono">
                          <span className="text-[10px] text-muted-custom uppercase leading-none">
                            {formatDate(evt.fecha, { month: 'short' })}
                          </span>
                          <span className="text-sm font-bold text-primary-custom leading-tight">
                            {formatDate(evt.fecha, { day: '2-digit' })}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs sm:text-sm font-semibold text-primary-custom">
                            {evt.titulo}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-secondary-custom">
                            <span>{evt.materiaNombre}</span>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-muted-custom" /> {evt.horarioInicio} hs
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-muted-custom" /> {evt.ubicacion}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Badge variant={evt.tipo === 'Examen' ? 'danger' : 'info'}>
                        {evt.tipo}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Accesos rápidos y Actividad Reciente */}
        <div className="space-y-6">
          {/* Accesos Rápidos */}
          <Card>
            <CardHeader>
              <CardTitle>Accesos Rápidos</CardTitle>
              <p className="text-xs text-secondary-custom">Gestión académica directa</p>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <button
                onClick={() => navigate('/asistencia-qr')}
                className="w-full p-3 rounded-[var(--radius-current)] bg-[var(--accent-subtle)]/40 hover:bg-[var(--accent-subtle)] border border-subtle-custom text-left transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[var(--accent-primary)] text-[var(--accent-foreground)] flex items-center justify-center shrink-0">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-primary-custom block">
                      Registrar Asistencia QR
                    </span>
                    <span className="text-[11px] text-secondary-custom">
                      Validación presencial en aula
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-secondary-custom group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/notas')}
                className="w-full p-3 rounded-[var(--radius-current)] bg-surface hover:bg-[var(--bg-surface-elevated)] border border-subtle-custom text-left transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-primary-custom block">
                      Consultar Notas Oficiales
                    </span>
                    <span className="text-[11px] text-secondary-custom">
                      Parciales, TPs y estado de cursada
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-secondary-custom group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/faltas')}
                className="w-full p-3 rounded-[var(--radius-current)] bg-surface hover:bg-[var(--bg-surface-elevated)] border border-subtle-custom text-left transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] flex items-center justify-center shrink-0">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-primary-custom block">
                      Mis Faltas & Justificaciones
                    </span>
                    <span className="text-[11px] text-secondary-custom">
                      Control reglamentario de asistencia
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-secondary-custom group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/foros')}
                className="w-full p-3 rounded-[var(--radius-current)] bg-surface hover:bg-[var(--bg-surface-elevated)] border border-subtle-custom text-left transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-primary-custom block">
                      Espacio de Foros
                    </span>
                    <span className="text-[11px] text-secondary-custom">
                      Consultas de cátedra y compañeros
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-secondary-custom group-hover:translate-x-0.5 transition-transform" />
              </button>
            </CardContent>
          </Card>

          {/* Actividad Académica Reciente (Timeline) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Actividad Reciente</CardTitle>
                <p className="text-xs text-secondary-custom">Últimos movimientos del legajo</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/historial')}>
                Historial <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {isTimelineLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {timeline?.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex gap-3 text-left">
                      <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] mt-1.5 shrink-0" />
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-primary-custom truncate">
                            {item.titulo}
                          </span>
                          <Badge variant={item.badgeVariant as any}>
                            {item.badgeTexto}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-secondary-custom line-clamp-2">
                          {item.descripcion}
                        </p>
                        <span className="text-[10px] text-muted-custom block font-mono">
                          {item.fecha}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
