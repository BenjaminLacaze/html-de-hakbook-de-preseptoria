import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  BookOpen,
  CalendarCheck2,
  GraduationCap,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  FileText,
  Clock,
  Send,
  Calendar,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    students,
    teachers,
    courses,
    activeCycleId,
    setActiveSection,
    getGlobalAttendanceStats,
    getAtRiskStudents,
    notices,
    events,
    auditLogs,
    institutionSettings,
  } = useApp();

  const globalAttendance = getGlobalAttendanceStats();
  const atRiskStudents = getAtRiskStudents();

  // Active counts for current cycle
  const currentStudents = students.filter((s) => s.cycleId === activeCycleId);
  const regularStudentsCount = currentStudents.filter((s) => s.status === 'REGULAR').length;
  const currentCourses = courses.filter((c) => c.cycleId === activeCycleId);
  const activeTeachersCount = teachers.filter((t) => t.status === 'ACTIVO').length;
  const licenseTeachersCount = teachers.filter((t) => t.status === 'LICENCIA').length;

  const publishedNotices = notices.filter(
    (n) => n.cycleId === activeCycleId && n.status === 'PUBLICADO'
  );

  const upcomingEvents = events
    .filter((e) => e.cycleId === activeCycleId && e.date >= '2026-10-01')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const recentLogs = auditLogs.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Institutional Banner */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-linear-to-l from-[#14214F]/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#89743A]">
              Panel de Supervisión y Toma de Decisiones
            </div>
            <h1 className="text-2xl font-bold text-[#14214F] mt-0.5">
              {institutionSettings.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Ciclo Lectivo {activeCycleId} · {institutionSettings.region} · Distrito {institutionSettings.district}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSection('asistencia')}
              className="px-3.5 py-2 bg-[#14214F] hover:bg-[#0A1128] text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CalendarCheck2 className="w-3.5 h-3.5 text-[#D4C08A]" />
              <span>Cargar Asistencia Diaria</span>
            </button>
            <button
              onClick={() => setActiveSection('comunicados')}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-[#14214F] border border-slate-300 text-xs font-medium rounded transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-[#89743A]" />
              <span>Emitir Circular</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip (Single-elevation, Tabular figures) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Matrícula */}
        <div
          onClick={() => setActiveSection('cursos')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-[#89743A]/40 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Matrícula Activa</span>
            <Users className="w-4 h-4 text-[#14214F] group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#14214F] font-mono tabular-nums">
              {currentStudents.length}
            </span>
            <span className="text-xs text-slate-500 font-sans">
              alumnos ({regularStudentsCount} regulares)
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>En {currentCourses.length} divisiones</span>
            <span className="text-[#3F78B6] font-medium group-hover:underline flex items-center gap-0.5">
              Ver división <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 2: Plantel Docente */}
        <div
          onClick={() => setActiveSection('usuarios')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-[#89743A]/40 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Plantel Docente</span>
            <GraduationCap className="w-4 h-4 text-[#89743A] group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#14214F] font-mono tabular-nums">
              {teachers.length}
            </span>
            <span className="text-xs text-slate-500 font-sans">
              profesores ({activeTeachersCount} en funciones)
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {licenseTeachersCount > 0
                ? `${licenseTeachersCount} con licencia activa`
                : 'Sin licencias registradas'}
            </span>
            <span className="text-[#3F78B6] font-medium group-hover:underline flex items-center gap-0.5">
              Planta orgánica <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 3: Asistencia Institucional */}
        <div
          onClick={() => setActiveSection('asistencia')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-[#89743A]/40 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Asistencia Acumulada</span>
            <CalendarCheck2 className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#14214F] font-mono tabular-nums">
              {globalAttendance.globalRate}%
            </span>
            <span className="text-xs text-emerald-700 font-medium font-sans">
              media institucional
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{globalAttendance.ausentesInjustificados} ausencias injustificadas</span>
            <span className="text-[#3F78B6] font-medium group-hover:underline flex items-center gap-0.5">
              Planillas <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 4: Alertas Pedagógicas */}
        <div
          onClick={() => setActiveSection('rendimiento')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-amber-400 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Alertas de Trayectoria</span>
            <AlertTriangle className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-700 font-mono tabular-nums">
              {atRiskStudents.length}
            </span>
            <span className="text-xs text-slate-500 font-sans">
              casos en seguimiento
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Inasistencias o riesgo académico</span>
            <span className="text-[#3F78B6] font-medium group-hover:underline flex items-center gap-0.5">
              Ver detalle <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Alerts & Course Progress) + Right Column (Notices & Calendar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alertas Directivas Prioritarias */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h2 className="text-base font-bold text-[#14214F]">
                  Estudiantes con Seguimiento Prioritario
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-sans">
                Umbral institucional: &gt;{institutionSettings.attendanceAlertThresholdPercent}% inasistencias o materias previas
              </span>
            </div>

            {atRiskStudents.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No hay alertas activas en el ciclo lectivo actual.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {atRiskStudents.map(({ student, course, attendanceRate, riskReasons }) => (
                  <div key={student.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                        <span>{student.lastName}, {student.firstName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">({student.legajo})</span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          · {course ? `${course.yearLevel}° ${course.division}` : 'Sin curso'} ({course?.shift})
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
                        {riskReasons.map((reason, idx) => (
                          <span key={idx} className="flex items-center gap-1 text-amber-800">
                            <span className="w-1 h-1 rounded-full bg-amber-500" />
                            {reason}
                          </span>
                        ))}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Tutor: {student.tutorName} · Tel: {student.tutorPhone}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setActiveSection('asistencia')}
                        className="px-2.5 py-1 text-xs font-medium text-[#14214F] hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                      >
                        Ver Asistencias
                      </button>
                      <button
                        onClick={() => setActiveSection('rendimiento')}
                        className="px-2.5 py-1 text-xs font-medium text-[#89743A] hover:bg-amber-50 rounded border border-amber-200 transition-colors"
                      >
                        Boletín Digital
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Estado de Cursos y Divisiones del Ciclo */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#14214F]" />
                <h2 className="text-base font-bold text-[#14214F]">
                  Estructura de Cursos y Distribución de Matrícula
                </h2>
              </div>
              <button
                onClick={() => setActiveSection('cursos')}
                className="text-xs text-[#3F78B6] hover:underline font-medium"
              >
                Administrar Cursos
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                    <th className="py-2 font-semibold">Curso / División</th>
                    <th className="py-2 font-semibold">Carrera / Orientación</th>
                    <th className="py-2 font-semibold">Turno</th>
                    <th className="py-2 font-semibold">Aula</th>
                    <th className="py-2 font-semibold text-right">Inscriptos</th>
                    <th className="py-2 font-semibold text-right">Capacidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {currentCourses.map((c) => {
                    const countInCourse = currentStudents.filter((s) => s.courseId === c.id).length;
                    const occupancy = Math.round((countInCourse / c.capacity) * 100);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 font-bold text-[#14214F]">
                          {c.yearLevel}° {c.division}
                        </td>
                        <td className="py-2.5 text-slate-800 max-w-[200px] truncate" title={c.orientation}>
                          {c.orientation}
                        </td>
                        <td className="py-2.5 text-slate-600 font-sans">
                          {c.shift}
                        </td>
                        <td className="py-2.5 text-slate-500">
                          {c.classroom}
                        </td>
                        <td className="py-2.5 text-right font-mono tabular-nums font-semibold text-slate-900">
                          {countInCourse}
                        </td>
                        <td className="py-2.5 text-right font-mono tabular-nums text-slate-500">
                          {c.capacity} ({occupancy}%)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Notices, Agenda & Audit */}
        <div className="space-y-6">
          {/* Circulares Institucionales Vigentes */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#89743A]" />
                <h3 className="text-sm font-bold text-[#14214F]">
                  Circulares Recientes
                </h3>
              </div>
              <button
                onClick={() => setActiveSection('comunicados')}
                className="text-xs text-[#3F78B6] hover:underline font-medium"
              >
                Ver todas
              </button>
            </div>

            <div className="space-y-3">
              {publishedNotices.slice(0, 3).map((n) => (
                <div key={n.id} className="p-3 rounded bg-slate-50 border border-slate-200/70 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold text-[#89743A] uppercase tracking-wide">
                      {n.category}
                    </span>
                    <span className="font-mono tabular-nums">{n.publishDate}</span>
                  </div>
                  <div className="font-semibold text-slate-900 mb-1 leading-snug">
                    {n.title}
                  </div>
                  <p className="text-slate-600 line-clamp-2 text-[11px]">
                    {n.content}
                  </p>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                    <span>Emisor: {n.authorRole}</span>
                    <span>{n.readCount} lecturas</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agenda Institucional Oficial */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#14214F]" />
                <h3 className="text-sm font-bold text-[#14214F]">
                  Próximos Hitos del Calendario
                </h3>
              </div>
              <button
                onClick={() => setActiveSection('organizacion')}
                className="text-xs text-[#3F78B6] hover:underline font-medium"
              >
                Agenda
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingEvents.map((e) => (
                <div key={e.id} className="flex gap-3 text-xs p-2 rounded hover:bg-slate-50 transition-colors">
                  <div className="w-12 h-12 rounded bg-[#14214F]/5 border border-[#89743A]/20 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] uppercase font-bold text-[#89743A]">
                      {new Date(e.date + 'T12:00:00Z').toLocaleDateString('es-AR', { month: 'short' })}
                    </span>
                    <span className="text-sm font-mono font-bold text-[#14214F]">
                      {e.date.split('-')[2]}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-800 leading-tight">
                      {e.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {e.description}
                    </div>
                    <div className="text-[10px] text-[#89743A] uppercase tracking-wide mt-0.5">
                      {e.type.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bitácora Reciente de Operaciones */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-[#14214F]">
                  Actividad Administrativa Reciente
                </h3>
              </div>
              <button
                onClick={() => setActiveSection('auditoria')}
                className="text-xs text-[#3F78B6] hover:underline font-medium"
              >
                Bitácora
              </button>
            </div>

            <div className="space-y-2.5">
              {recentLogs.map((log) => (
                <div key={log.id} className="text-xs border-l-2 border-[#89743A]/40 pl-2.5 py-0.5">
                  <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                    {new Date(log.timestamp).toLocaleTimeString('es-AR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    · {log.module}
                  </div>
                  <div className="text-slate-800 text-[11px] mt-0.5 leading-snug">
                    {log.details}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {log.userName} ({log.userRole})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
