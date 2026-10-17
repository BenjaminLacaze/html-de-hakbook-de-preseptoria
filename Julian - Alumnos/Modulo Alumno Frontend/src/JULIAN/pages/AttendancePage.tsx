import React, { useState } from 'react';
import {
  ClockAlert,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  FileText,
  AlertTriangle,
  Upload,
  Calendar,
  Filter
} from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import { getBorderRadiusClass } from '../styles/themes';
import { StatusBadge } from '../components/common/StatusBadge';
import { AttendanceRecord } from '../types';

export const AttendancePage: React.FC = () => {
  const {
    attendanceRecords,
    subjects,
    setJustifyingRecord,
    totalAbsences,
    totalPresent,
    overallAttendanceRate,
    appearance,
    themeColors
  } = usePortal();

  const radius = getBorderRadiusClass(appearance.borderStyle);

  const [selectedSubject, setSelectedSubject] = useState<string>('todas');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');

  const filteredRecords = attendanceRecords.filter((r) => {
    const matchSub = selectedSubject === 'todas' || r.subjectId === selectedSubject;
    const matchStat = selectedStatus === 'todos' || r.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchSub && matchStat;
  });

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary */}
      <div
        style={{
          backgroundColor: themeColors.bgCard,
          borderColor: themeColors.borderSubtle
        }}
        className={`p-6 border shadow-xs ${radius.card}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span
              style={{ color: themeColors.accentGold }}
              className="text-xs font-bold uppercase tracking-wider block mb-1"
            >
              Control de Asistencia · Módulo Alumno
            </span>
            <h1 style={{ color: themeColors.textPrimary }} className="text-2xl font-extrabold tracking-tight">
              Mis Faltas y Presentismo
            </h1>
            <p style={{ color: themeColors.textMuted }} className="text-xs mt-1">
              Registro biométrico y código QR oficial · Exigencia de regularidad institucional: 75%
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div
              style={{ backgroundColor: themeColors.bgSubtle }}
              className={`p-3 text-center ${radius.inner} min-w-24`}
            >
              <span style={{ color: themeColors.textMuted }} className="text-[10px] uppercase font-bold block">
                Presentismo
              </span>
              <span
                style={{
                  color: overallAttendanceRate >= 75 ? themeColors.positiveText : themeColors.negativeText
                }}
                className="text-2xl font-extrabold tabular-nums"
              >
                {overallAttendanceRate}%
              </span>
            </div>

            <div
              style={{ backgroundColor: themeColors.bgSubtle }}
              className={`p-3 text-center ${radius.inner} min-w-24`}
            >
              <span style={{ color: themeColors.textMuted }} className="text-[10px] uppercase font-bold block">
                Total Faltas
              </span>
              <span style={{ color: themeColors.negativeText }} className="text-2xl font-extrabold tabular-nums">
                {totalAbsences}
              </span>
            </div>

            <div
              style={{ backgroundColor: themeColors.bgSubtle }}
              className={`p-3 text-center ${radius.inner} min-w-24`}
            >
              <span style={{ color: themeColors.textMuted }} className="text-[10px] uppercase font-bold block">
                Presentes
              </span>
              <span style={{ color: themeColors.positiveText }} className="text-2xl font-extrabold tabular-nums">
                {totalPresent}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Attendance Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((sub) => {
          const isAtRisk = sub.absences >= sub.maxAllowedAbsences;
          const remainingAbsences = Math.max(0, sub.maxAllowedAbsences - sub.absences);

          return (
            <div
              key={sub.id}
              style={{
                backgroundColor: themeColors.bgCard,
                borderColor: isAtRisk ? themeColors.negativeBorder : themeColors.borderSubtle
              }}
              className={`p-4 border ${radius.card} space-y-3`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 block">
                    {sub.code}
                  </span>
                  <h4 style={{ color: themeColors.textPrimary }} className="text-xs font-bold truncate max-w-[180px]">
                    {sub.name}
                  </h4>
                </div>
                <span
                  style={{
                    color: sub.attendancePercentage >= 75 ? themeColors.positiveText : themeColors.negativeText
                  }}
                  className="text-base font-extrabold tabular-nums"
                >
                  {sub.attendancePercentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, sub.attendancePercentage)}%`,
                    backgroundColor: sub.attendancePercentage >= 75 ? themeColors.positiveText : themeColors.negativeText
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1" style={{ color: themeColors.textMuted }}>
                <span>{sub.absences} faltas registradas</span>
                <span className="tabular-nums font-semibold" style={{ color: isAtRisk ? themeColors.negativeText : themeColors.textSecondary }}>
                  {remainingAbsences === 0 ? 'Sin margen' : `Restan ${remainingAbsences} para límite`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters and Individual Records */}
      <div
        style={{
          backgroundColor: themeColors.bgCard,
          borderColor: themeColors.borderSubtle
        }}
        className={`p-6 border shadow-xs ${radius.card} space-y-4`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: themeColors.borderSubtle }}>
          <h3 style={{ color: themeColors.textPrimary }} className="text-sm font-bold">
            Registros Individuales de Asistencia
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{
                backgroundColor: themeColors.bgPage,
                borderColor: themeColors.borderSubtle,
                color: themeColors.textPrimary
              }}
              className={`p-1.5 text-xs border ${radius.button}`}
            >
              <option value="todas">Todas las materias</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                backgroundColor: themeColors.bgPage,
                borderColor: themeColors.borderSubtle,
                color: themeColors.textPrimary
              }}
              className={`p-1.5 text-xs border ${radius.button}`}
            >
              <option value="todos">Todos los estados</option>
              <option value="presente">Solo Presentes</option>
              <option value="ausente">Solo Ausencias</option>
              <option value="tardanza">Tardanzas</option>
            </select>
          </div>
        </div>

        {/* Table of Records */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b" style={{ borderColor: themeColors.borderSubtle, color: themeColors.textMuted }}>
                <th className="py-2.5 px-3 font-semibold">Materia</th>
                <th className="py-2.5 px-3 font-semibold">Fecha y Hora</th>
                <th className="py-2.5 px-3 font-semibold">Horas Cátedra</th>
                <th className="py-2.5 px-3 font-semibold">Método</th>
                <th className="py-2.5 px-3 font-semibold">Estado</th>
                <th className="py-2.5 px-3 font-semibold text-right">Justificación</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: themeColors.borderSubtle }}>
              {filteredRecords.map((record: AttendanceRecord) => (
                <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                  <td className="py-3 px-3 font-semibold" style={{ color: themeColors.textPrimary }}>
                    {record.subjectName}
                  </td>
                  <td className="py-3 px-3 tabular-nums" style={{ color: themeColors.textSecondary }}>
                    {record.date} · {record.time} hs
                  </td>
                  <td className="py-3 px-3 tabular-nums" style={{ color: themeColors.textMuted }}>
                    {record.hoursCount} hs ({record.classroom})
                  </td>
                  <td className="py-3 px-3" style={{ color: themeColors.textMuted }}>
                    <span className="flex items-center gap-1.5">
                      {record.method === 'Código QR' ? (
                        <QrCode className="w-3.5 h-3.5 text-amber-500" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>{record.method}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={record.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right">
                    {record.status === 'Ausente' ? (
                      record.justificationStatus === 'Aprobada' ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Justificada
                        </span>
                      ) : record.justificationStatus === 'Pendiente' ? (
                        <span className="text-amber-600 dark:text-amber-400 font-medium text-[11px] flex items-center justify-end gap-1">
                          <Clock className="w-3.5 h-3.5" /> En auditoría
                        </span>
                      ) : (
                        <button
                          onClick={() => setJustifyingRecord(record)}
                          style={{
                            backgroundColor: themeColors.accentSurface,
                            color: themeColors.accentText
                          }}
                          className={`px-2.5 py-1 text-[11px] font-semibold hover:opacity-90 transition-opacity ${radius.button}`}
                        >
                          Justificar Falta
                        </button>
                      )
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
