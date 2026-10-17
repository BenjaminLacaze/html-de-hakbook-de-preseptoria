import React from 'react';
import {
  Calendar,
  CheckCircle2,
  ClockAlert,
  Award,
  BookOpen,
  QrCode,
  ArrowRight,
  Bell,
  AlertTriangle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import { getBorderRadiusClass } from '../styles/themes';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';

export const DashboardPage: React.FC = () => {
  const {
    student,
    subjects,
    grades,
    attendanceRecords,
    calendarEvents,
    notices,
    setActiveSection,
    setSelectedSubject,
    totalAbsences,
    overallAttendanceRate,
    currentGpa,
    appearance,
    themeColors
  } = usePortal();

  const radius = getBorderRadiusClass(appearance.borderStyle);

  const upcomingEvents = calendarEvents.slice(0, 3);
  const recentGrades = grades.filter((g) => g.status === 'Publicada').slice(0, 3);
  const unreadNotices = notices.filter((n) => !n.isRead);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div
        style={{
          backgroundColor: themeColors.bgCard,
          borderColor: themeColors.borderSubtle
        }}
        className={`p-6 lg:p-8 border shadow-xs ${radius.card}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                style={{
                  backgroundColor: themeColors.accentSurface,
                  color: themeColors.accentText
                }}
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
              >
                {student.status} · Cohorte {student.cohort}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span style={{ color: themeColors.textMuted }} className="text-xs">
                {student.division} ({student.shift})
              </span>
            </div>
            <h1
              style={{ color: themeColors.textPrimary }}
              className="text-2xl lg:text-3xl font-extrabold tracking-tight"
            >
              ¡Hola, {student.fullName}!
            </h1>
            <p style={{ color: themeColors.textSecondary }} className="text-xs lg:text-sm">
              {student.career} · {student.institution}
            </p>
          </div>

          {/* Quick CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveSection('asistencia-qr')}
              style={{
                backgroundColor: themeColors.accentGold,
                color: '#FFFFFF'
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold shadow-xs hover:opacity-95 transition-opacity ${radius.button}`}
            >
              <QrCode className="w-4 h-4" />
              <span>Registrar Asistencia QR</span>
            </button>
            <button
              onClick={() => setActiveSection('agenda')}
              style={{
                backgroundColor: themeColors.bgSubtle,
                color: themeColors.textPrimary,
                borderColor: themeColors.borderSubtle
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border hover:border-slate-400 transition-colors ${radius.button}`}
            >
              <Calendar className="w-4 h-4" />
              <span>Ver Agenda</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Presentismo Global"
          value={`${overallAttendanceRate}%`}
          subtitle="Mínimo exigido: 75%"
          icon={CheckCircle2}
          trend={{ text: 'Cumple regularidad', positive: true }}
          onClick={() => setActiveSection('faltas')}
        />
        <StatCard
          title="Faltas Registradas"
          value={totalAbsences}
          subtitle="Total acumulado del ciclo"
          icon={ClockAlert}
          trend={{ text: '2 justificaciones enviadas', positive: false }}
          onClick={() => setActiveSection('faltas')}
        />
        <StatCard
          title="Promedio Académico"
          value={currentGpa}
          subtitle="Sobre escala de 1 a 10"
          icon={Award}
          trend={{ text: '6 evaluaciones rendidas', positive: true }}
          onClick={() => setActiveSection('notas')}
        />
        <StatCard
          title="Materias en Cursada"
          value={subjects.length}
          subtitle="Comisión 2° B · Vespertino"
          icon={BookOpen}
          trend={{ text: 'Todas regulares', positive: true }}
          onClick={() => setActiveSection('materias')}
        />
      </div>

      {/* Notices Alert (if any unread) */}
      {unreadNotices.length > 0 && (
        <div
          style={{
            backgroundColor: themeColors.accentSurface,
            borderColor: themeColors.accentGold
          }}
          className={`p-4 border flex items-start justify-between gap-4 ${radius.card}`}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 mt-0.5 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  style={{ color: themeColors.accentText }}
                  className="text-xs font-bold uppercase tracking-wide"
                >
                  Aviso de Preceptoría
                </span>
                <span className="text-[10px] text-slate-400">·</span>
                <span className="text-[11px] text-slate-500">{unreadNotices[0].date}</span>
              </div>
              <h4 style={{ color: themeColors.textPrimary }} className="text-sm font-bold mt-0.5">
                {unreadNotices[0].title}
              </h4>
              <p style={{ color: themeColors.textSecondary }} className="text-xs mt-1 leading-relaxed">
                {unreadNotices[0].summary}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveSection('inicio')}
            className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline shrink-0 hidden sm:block"
          >
            Ver comunicado
          </button>
        </div>
      )}

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Enrolled Subjects & Quick Status (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div
            style={{
              backgroundColor: themeColors.bgCard,
              borderColor: themeColors.borderSubtle
            }}
            className={`p-6 border ${radius.card}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 style={{ color: themeColors.textPrimary }} className="text-base font-bold">
                  Materias en Cursada
                </h3>
                <p style={{ color: themeColors.textMuted }} className="text-xs">
                  Estado de asistencia y evaluaciones por cátedra
                </p>
              </div>
              <button
                onClick={() => setActiveSection('materias')}
                style={{ color: themeColors.accentGold }}
                className="text-xs font-semibold flex items-center gap-1 hover:underline"
              >
                <span>Ver todas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {subjects.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub)}
                  style={{
                    backgroundColor: themeColors.bgSubtle,
                    borderColor: themeColors.borderSubtle
                  }}
                  className={`p-3.5 border transition-all hover:border-slate-400 cursor-pointer ${radius.inner} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-500 font-medium">
                        {sub.code}
                      </span>
                      <h4 style={{ color: themeColors.textPrimary }} className="text-xs font-bold">
                        {sub.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: themeColors.textMuted }}>
                      <span>{sub.professor}</span>
                      <span>·</span>
                      <span>{sub.schedules[0]?.day} {sub.schedules[0]?.startTime} hs</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="text-xs font-semibold tabular-nums" style={{ color: themeColors.textPrimary }}>
                        {sub.attendancePercentage}% Asistencia
                      </div>
                      <div className="text-[11px] text-slate-400 tabular-nums">
                        {sub.absences} de {sub.maxAllowedAbsences} faltas
                      </div>
                    </div>
                    <StatusBadge status={sub.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Grades Summary */}
          <div
            style={{
              backgroundColor: themeColors.bgCard,
              borderColor: themeColors.borderSubtle
            }}
            className={`p-6 border ${radius.card}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 style={{ color: themeColors.textPrimary }} className="text-base font-bold">
                  Calificaciones Recientes
                </h3>
                <p style={{ color: themeColors.textMuted }} className="text-xs">
                  Últimas notas oficiales publicadas por los docentes
                </p>
              </div>
              <button
                onClick={() => setActiveSection('notas')}
                style={{ color: themeColors.accentGold }}
                className="text-xs font-semibold flex items-center gap-1 hover:underline"
              >
                <span>Ver historial de notas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y" style={{ borderColor: themeColors.borderSubtle }}>
              {recentGrades.map((grade) => (
                <div key={grade.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span style={{ color: themeColors.textPrimary }} className="font-semibold block">
                      {grade.subjectName} · {grade.evaluationName}
                    </span>
                    <span style={{ color: themeColors.textMuted }} className="text-[11px] tabular-nums">
                      Fecha: {grade.date} · {grade.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      style={{
                        color: grade.score && grade.score >= 4 ? themeColors.positiveText : themeColors.negativeText
                      }}
                      className="text-base font-extrabold tabular-nums"
                    >
                      {grade.score}
                    </span>
                    <StatusBadge status={grade.score && grade.score >= 4 ? 'Aprobado' : 'Desaprobado'} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Events & Quick Links */}
        <div className="space-y-6">
          {/* Upcoming Academic Agenda */}
          <div
            style={{
              backgroundColor: themeColors.bgCard,
              borderColor: themeColors.borderSubtle
            }}
            className={`p-6 border ${radius.card}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ color: themeColors.textPrimary }} className="text-base font-bold">
                Próximas Fechas
              </h3>
              <button
                onClick={() => setActiveSection('agenda')}
                style={{ color: themeColors.accentGold }}
                className="text-xs font-semibold hover:underline"
              >
                Agenda completa
              </button>
            </div>

            <div className="space-y-3">
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  style={{
                    backgroundColor: themeColors.bgSubtle,
                    borderColor: themeColors.borderSubtle
                  }}
                  className={`p-3 border ${radius.inner} space-y-1`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      style={{
                        color: evt.type === 'Examen' ? themeColors.negativeText : themeColors.accentText
                      }}
                      className="font-bold uppercase tracking-wider"
                    >
                      {evt.type}
                    </span>
                    <span style={{ color: themeColors.textMuted }} className="tabular-nums">
                      {evt.date}
                    </span>
                  </div>
                  <h4 style={{ color: themeColors.textPrimary }} className="text-xs font-semibold">
                    {evt.title}
                  </h4>
                  <div style={{ color: themeColors.textMuted }} className="text-[11px] flex items-center justify-between">
                    <span>{evt.startTime} hs</span>
                    {evt.classroom && <span>{evt.classroom}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div
            style={{
              backgroundColor: themeColors.bgCard,
              borderColor: themeColors.borderSubtle
            }}
            className={`p-6 border ${radius.card}`}
          >
            <h3 style={{ color: themeColors.textPrimary }} className="text-base font-bold mb-3">
              Accesos Rápidos
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveSection('faltas')}
                style={{
                  backgroundColor: themeColors.bgSubtle,
                  borderColor: themeColors.borderSubtle
                }}
                className={`w-full p-2.5 text-xs text-left border flex items-center justify-between hover:border-slate-400 transition-colors ${radius.button}`}
              >
                <div className="flex items-center gap-2.5">
                  <ClockAlert className="w-4 h-4 text-amber-500" />
                  <span style={{ color: themeColors.textPrimary }} className="font-semibold">
                    Justificar una falta
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveSection('foros')}
                style={{
                  backgroundColor: themeColors.bgSubtle,
                  borderColor: themeColors.borderSubtle
                }}
                className={`w-full p-2.5 text-xs text-left border flex items-center justify-between hover:border-slate-400 transition-colors ${radius.button}`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span style={{ color: themeColors.textPrimary }} className="font-semibold">
                    Consultar Foros de Cátedra
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveSection('apariencia')}
                style={{
                  backgroundColor: themeColors.bgSubtle,
                  borderColor: themeColors.borderSubtle
                }}
                className={`w-full p-2.5 text-xs text-left border flex items-center justify-between hover:border-slate-400 transition-colors ${radius.button}`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span style={{ color: themeColors.textPrimary }} className="font-semibold">
                    Personalizar Tema y Apariencia
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
