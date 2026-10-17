import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Calendar,
  Clock,
  User,
  Mail,
  Award,
  AlertTriangle,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { getBorderRadiusClass } from '../../styles/themes';
import { StatusBadge } from '../common/StatusBadge';

export const SubjectDetailModal: React.FC = () => {
  const {
    selectedSubject,
    setSelectedSubject,
    grades,
    attendanceRecords,
    appearance,
    themeColors
  } = usePortal();

  const [activeTab, setActiveTab] = useState<'info' | 'notas' | 'asistencia'>('info');

  if (!selectedSubject) return null;

  const radius = getBorderRadiusClass(appearance.borderStyle);

  const subjectGrades = grades.filter((g) => g.subjectId === selectedSubject.id);
  const subjectAttendance = attendanceRecords.filter((a) => a.subjectId === selectedSubject.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        style={{
          backgroundColor: themeColors.bgCard,
          borderColor: themeColors.borderSubtle
        }}
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto border p-6 shadow-2xl relative ${radius.card}`}
      >
        <button
          onClick={() => setSelectedSubject(null)}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          aria-label="Cerrar detalle"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b pb-4 mb-4" style={{ borderColor: themeColors.borderSubtle }}>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              style={{
                backgroundColor: themeColors.accentSurface,
                color: themeColors.accentText
              }}
              className="text-xs font-semibold px-2 py-0.5 rounded font-mono"
            >
              {selectedSubject.code}
            </span>
            <StatusBadge status={selectedSubject.status} size="sm" />
          </div>
          <h2 style={{ color: themeColors.textPrimary }} className="text-xl font-bold">
            {selectedSubject.name}
          </h2>
          <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: themeColors.textMuted }}>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {selectedSubject.professor}
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              {selectedSubject.professorEmail}
            </span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 border-b mb-5" style={{ borderColor: themeColors.borderSubtle }}>
          <button
            onClick={() => setActiveTab('info')}
            style={{
              borderColor: activeTab === 'info' ? themeColors.accentGold : 'transparent',
              color: activeTab === 'info' ? themeColors.textPrimary : themeColors.textMuted
            }}
            className="pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap"
          >
            Información General
          </button>
          <button
            onClick={() => setActiveTab('notas')}
            style={{
              borderColor: activeTab === 'notas' ? themeColors.accentGold : 'transparent',
              color: activeTab === 'notas' ? themeColors.textPrimary : themeColors.textMuted
            }}
            className="pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap"
          >
            Calificaciones ({subjectGrades.length})
          </button>
          <button
            onClick={() => setActiveTab('asistencia')}
            style={{
              borderColor: activeTab === 'asistencia' ? themeColors.accentGold : 'transparent',
              color: activeTab === 'asistencia' ? themeColors.textPrimary : themeColors.textMuted
            }}
            className="pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap"
          >
            Asistencia ({selectedSubject.attendancePercentage}%)
          </button>
        </div>

        {/* Tab 1: Info */}
        {activeTab === 'info' && (
          <div className="space-y-4 text-xs">
            <div>
              <h4 style={{ color: themeColors.textPrimary }} className="font-semibold mb-1">
                Descripción y Alcance de la Cátedra
              </h4>
              <p style={{ color: themeColors.textSecondary }} className="leading-relaxed">
                {selectedSubject.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                style={{ backgroundColor: themeColors.bgSubtle }}
                className={`p-3.5 border border-slate-200 dark:border-slate-800 ${radius.inner}`}
              >
                <span style={{ color: themeColors.textMuted }} className="block text-[11px] mb-1 font-medium">
                  Horarios de Cursada
                </span>
                {selectedSubject.schedules.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1">
                    <span style={{ color: themeColors.textPrimary }} className="font-semibold">
                      {s.day}
                    </span>
                    <span style={{ color: themeColors.textSecondary }} className="tabular-nums">
                      {s.startTime} a {s.endTime} hs
                    </span>
                  </div>
                ))}
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-slate-500">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{selectedSubject.schedules[0]?.classroom}</span>
                </div>
              </div>

              <div
                style={{ backgroundColor: themeColors.bgSubtle }}
                className={`p-3.5 border border-slate-200 dark:border-slate-800 ${radius.inner}`}
              >
                <span style={{ color: themeColors.textMuted }} className="block text-[11px] mb-1 font-medium">
                  Régimen de Correlatividades
                </span>
                <div className="space-y-1">
                  {selectedSubject.correlatives.map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5" style={{ color: themeColors.textPrimary }}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span style={{ color: themeColors.textMuted }}>Promedio actual de cursada: </span>
                  <span style={{ color: themeColors.accentGold }} className="font-bold tabular-nums">
                    {selectedSubject.currentAverage} / 10
                  </span>
                </div>
              </div>
            </div>

            {selectedSubject.nextExam && (
              <div
                style={{
                  backgroundColor: themeColors.accentSurface,
                  borderColor: themeColors.accentGold
                }}
                className={`p-3.5 border ${radius.inner} flex items-start gap-3`}
              >
                <Calendar className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span style={{ color: themeColors.accentText }} className="font-bold block">
                    Próxima Evaluación / Vencimiento
                  </span>
                  <p style={{ color: themeColors.textPrimary }} className="font-semibold">
                    {selectedSubject.nextExam.title}
                  </p>
                  <p style={{ color: themeColors.textMuted }} className="tabular-nums">
                    Fecha: {selectedSubject.nextExam.date} · Aula: {selectedSubject.nextExam.classroom}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Grades */}
        {activeTab === 'notas' && (
          <div className="space-y-3">
            {subjectGrades.length === 0 ? (
              <p style={{ color: themeColors.textMuted }} className="text-xs text-center py-6">
                No hay calificaciones registradas para esta materia aún.
              </p>
            ) : (
              subjectGrades.map((grade) => (
                <div
                  key={grade.id}
                  style={{
                    backgroundColor: themeColors.bgSubtle,
                    borderColor: themeColors.borderSubtle
                  }}
                  className={`p-3.5 border ${radius.inner} flex items-center justify-between gap-3`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ color: themeColors.textPrimary }} className="text-xs font-bold">
                        {grade.evaluationName}
                      </span>
                      <span className="text-[10px] text-slate-500">({grade.type})</span>
                    </div>
                    <div style={{ color: themeColors.textMuted }} className="text-[11px] mt-0.5 tabular-nums">
                      Fecha: {grade.date} {grade.feedback && `· "${grade.feedback}"`}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {grade.score !== null ? (
                      <div
                        style={{
                          color: grade.score >= 4 ? themeColors.positiveText : themeColors.negativeText
                        }}
                        className="text-lg font-bold tabular-nums"
                      >
                        {grade.score}
                        <span className="text-xs text-slate-400">/10</span>
                      </div>
                    ) : (
                      <span style={{ color: themeColors.warningText }} className="text-xs font-medium">
                        Pendiente
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Attendance */}
        {activeTab === 'asistencia' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div style={{ backgroundColor: themeColors.bgSubtle }} className={`p-3 ${radius.inner}`}>
                <span style={{ color: themeColors.textMuted }} className="text-[10px] uppercase block">
                  Asistencia
                </span>
                <span style={{ color: themeColors.positiveText }} className="text-xl font-bold tabular-nums">
                  {selectedSubject.attendancePercentage}%
                </span>
              </div>
              <div style={{ backgroundColor: themeColors.bgSubtle }} className={`p-3 ${radius.inner}`}>
                <span style={{ color: themeColors.textMuted }} className="text-[10px] uppercase block">
                  Faltas
                </span>
                <span style={{ color: themeColors.negativeText }} className="text-xl font-bold tabular-nums">
                  {selectedSubject.absences}
                </span>
              </div>
              <div style={{ backgroundColor: themeColors.bgSubtle }} className={`p-3 ${radius.inner}`}>
                <span style={{ color: themeColors.textMuted }} className="text-[10px] uppercase block">
                  Límite Faltas
                </span>
                <span style={{ color: themeColors.textPrimary }} className="text-xl font-bold tabular-nums">
                  {selectedSubject.maxAllowedAbsences}
                </span>
              </div>
            </div>

            <div>
              <h5 style={{ color: themeColors.textPrimary }} className="text-xs font-semibold mb-2">
                Últimos registros en la materia
              </h5>
              <div className="space-y-1.5">
                {subjectAttendance.map((rec) => (
                  <div
                    key={rec.id}
                    style={{
                      backgroundColor: themeColors.bgPage,
                      borderColor: themeColors.borderSubtle
                    }}
                    className={`p-2.5 border flex items-center justify-between text-xs ${radius.inner}`}
                  >
                    <span style={{ color: themeColors.textPrimary }} className="tabular-nums">
                      {rec.date} ({rec.hoursCount} hs)
                    </span>
                    <StatusBadge status={rec.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-3 border-t flex justify-end" style={{ borderColor: themeColors.borderSubtle }}>
          <button
            onClick={() => setSelectedSubject(null)}
            style={{
              backgroundColor: themeColors.bgSubtle,
              color: themeColors.textSecondary
            }}
            className={`px-4 py-2 text-xs font-medium ${radius.button}`}
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
