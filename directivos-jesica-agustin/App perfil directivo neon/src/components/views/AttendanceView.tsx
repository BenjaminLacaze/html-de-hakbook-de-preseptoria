import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import {
  CalendarCheck2,
  Calendar,
  Search,
  Filter,
  Check,
  X,
  Clock,
  FileCheck,
  AlertTriangle,
  User,
  ArrowUpDown,
  Save,
  Info,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const {
    courses,
    students,
    attendanceRecords,
    activeCycleId,
    batchSaveAttendance,
    institutionSettings,
    getStudentAttendanceStats,
  } = useApp();

  const currentCourses = courses.filter((c) => c.cycleId === activeCycleId);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    currentCourses[0]?.id || ''
  );

  // Selected date for taking/checking attendance (default to today or latest recorded date)
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-16');
  const [viewMode, setViewMode] = useState<'CARGA' | 'HISTORIAL' | 'ALERTAS'>('CARGA');
  const [studentSearch, setStudentSearch] = useState('');

  // Course students
  const courseStudents = useMemo(() => {
    return students.filter(
      (s) => s.courseId === selectedCourseId && s.cycleId === activeCycleId
    );
  }, [students, selectedCourseId, activeCycleId]);

  // Existing records for the selected course and date
  const dayRecords = useMemo(() => {
    return attendanceRecords.filter(
      (r) => r.courseId === selectedCourseId && r.date === selectedDate
    );
  }, [attendanceRecords, selectedCourseId, selectedDate]);

  // Form state for taking attendance: studentId -> { status, notes }
  const [attendanceForm, setAttendanceForm] = useState<
    Record<string, { status: AttendanceStatus; notes: string }>
  >({});

  // Sync form when course or date changes
  React.useEffect(() => {
    const initialMap: Record<string, { status: AttendanceStatus; notes: string }> = {};
    courseStudents.forEach((student) => {
      const existing = dayRecords.find((r) => r.studentId === student.id);
      if (existing) {
        initialMap[student.id] = {
          status: existing.status,
          notes: existing.notes || '',
        };
      } else {
        // Default to PRESENTE
        initialMap[student.id] = {
          status: 'PRESENTE',
          notes: '',
        };
      }
    });
    setAttendanceForm(initialMap);
  }, [courseStudents, dayRecords]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceForm((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceForm((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes,
      },
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, { status: AttendanceStatus; notes: string }> = {};
    courseStudents.forEach((s) => {
      updated[s.id] = {
        status,
        notes: attendanceForm[s.id]?.notes || '',
      };
    });
    setAttendanceForm(updated);
  };

  const handleSaveAttendance = () => {
    const entries = courseStudents.map((s) => ({
      studentId: s.id,
      status: attendanceForm[s.id]?.status || 'PRESENTE',
      notes: attendanceForm[s.id]?.notes || '',
    }));
    batchSaveAttendance(selectedCourseId, selectedDate, entries);
  };

  // Detailed student for modal/sidebar
  const [inspectStudentId, setInspectStudentId] = useState<string | null>(null);
  const inspectedStudent = students.find((s) => s.id === inspectStudentId);
  const inspectedRecords = useMemo(() => {
    if (!inspectStudentId) return [];
    return attendanceRecords
      .filter((r) => r.studentId === inspectStudentId && r.cycleId === activeCycleId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [attendanceRecords, inspectStudentId, activeCycleId]);

  // Filtered students for history
  const studentsWithStats = useMemo(() => {
    return courseStudents
      .map((student) => {
        const stats = getStudentAttendanceStats(student.id);
        return {
          student,
          stats,
        };
      })
      .filter(({ student }) => {
        const query = studentSearch.toLowerCase();
        return (
          student.lastName.toLowerCase().includes(query) ||
          student.firstName.toLowerCase().includes(query) ||
          student.dni.includes(query) ||
          student.legajo.toLowerCase().includes(query)
        );
      });
  }, [courseStudents, getStudentAttendanceStats, studentSearch]);

  const selectedCourseObj = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#89743A]">
            Supervisión de Inasistencias y Regularidad
          </div>
          <h1 className="text-xl font-bold text-[#14214F] mt-0.5">
            Seguimiento de Asistencia Escolar
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Carga de partes diarios por curso, control de justificaciones y cómputo de ausentismo reiterado.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setViewMode('CARGA')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              viewMode === 'CARGA'
                ? 'bg-[#14214F] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Parte Diario
          </button>
          <button
            onClick={() => setViewMode('HISTORIAL')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              viewMode === 'HISTORIAL'
                ? 'bg-[#14214F] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Resumen Acumulado
          </button>
        </div>
      </div>

      {/* Control bar: Course selector + Date selector */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
              División Escolar
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="text-xs font-semibold py-1.5 px-3 rounded border border-slate-300 focus:outline-none focus:border-[#14214F] text-[#14214F]"
            >
              {currentCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.yearLevel}° {c.division} ({c.shift} — {c.orientation})
                </option>
              ))}
            </select>
          </div>

          {viewMode === 'CARGA' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                Fecha de la Jornada
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-mono py-1.5 px-2.5 rounded border border-slate-300 focus:outline-none focus:border-[#14214F]"
              />
            </div>
          )}
        </div>

        {viewMode === 'CARGA' ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 hidden sm:inline">Acción rápida:</span>
            <button
              onClick={() => handleMarkAll('PRESENTE')}
              className="px-2.5 py-1 text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors"
            >
              Todos Presentes
            </button>
            <button
              onClick={handleSaveAttendance}
              className="px-4 py-1.5 bg-[#14214F] hover:bg-[#0A1128] text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-[#D4C08A]" />
              <span>Asentar Asistencia</span>
            </button>
          </div>
        ) : (
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Filtrar alumno..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded border border-slate-300"
            />
          </div>
        )}
      </div>

      {/* Main Table view */}
      {viewMode === 'CARGA' ? (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-[#14214F]">
              Parte de Asistencia Diaria · {selectedCourseObj ? `${selectedCourseObj.yearLevel}° ${selectedCourseObj.division}` : ''}
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              Fecha: {selectedDate} · {courseStudents.length} alumnos en lista
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4 font-semibold">N° / Legajo</th>
                  <th className="py-2.5 px-4 font-semibold">Estudiante</th>
                  <th className="py-2.5 px-4 font-semibold">Estado de la Asistencia</th>
                  <th className="py-2.5 px-4 font-semibold">Observación / Certificado</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Historial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {courseStudents.map((std, idx) => {
                  const currentStatus = attendanceForm[std.id]?.status || 'PRESENTE';
                  const currentNotes = attendanceForm[std.id]?.notes || '';
                  const stats = getStudentAttendanceStats(std.id);

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] tabular-nums text-slate-500">
                        {idx + 1}. <span className="font-semibold text-slate-800">{std.legajo}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {std.lastName}, {std.firstName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          DNI {std.dni}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-50 text-[11px]">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(std.id, 'PRESENTE')}
                            className={`px-2 py-1 rounded transition-colors font-medium ${
                              currentStatus === 'PRESENTE'
                                ? 'bg-emerald-700 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            P
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(std.id, 'AUSENTE_INJUSTIFICADO')}
                            className={`px-2 py-1 rounded transition-colors font-medium ${
                              currentStatus === 'AUSENTE_INJUSTIFICADO'
                                ? 'bg-red-700 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                            title="Ausente Injustificado"
                          >
                            AI
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(std.id, 'AUSENTE_JUSTIFICADO')}
                            className={`px-2 py-1 rounded transition-colors font-medium ${
                              currentStatus === 'AUSENTE_JUSTIFICADO'
                                ? 'bg-blue-700 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                            title="Ausente Justificado (Certificado)"
                          >
                            AJ
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(std.id, 'TARDANZA')}
                            className={`px-2 py-1 rounded transition-colors font-medium ${
                              currentStatus === 'TARDANZA'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                            title="Tardanza (Ingreso tardío)"
                          >
                            T
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="Nota (motivo, ingreso tardío, etc.)..."
                          value={currentNotes}
                          onChange={(e) => handleNotesChange(std.id, e.target.value)}
                          className="w-full max-w-xs px-2.5 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-[#14214F]"
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setInspectStudentId(std.id)}
                          className="text-[#3F78B6] hover:underline text-xs font-medium"
                        >
                          Ver ficha ({stats.percentAttendance}%)
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Summary view per student */
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-[#14214F]">
              Resumen Acumulado de Inasistencias · Ciclo {activeCycleId}
            </span>
            <span className="text-slate-500 text-[11px]">
              Alerta de ausentismo configurada al {institutionSettings.attendanceAlertThresholdPercent}%
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4 font-semibold">Estudiante</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Presentes</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Aus. Injust.</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Aus. Just.</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Tardanzas</th>
                  <th className="py-2.5 px-4 font-semibold text-right">% Asistencia</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Estado</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {studentsWithStats.map(({ student, stats }) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">
                        {student.lastName}, {student.firstName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {student.legajo} · DNI {student.dni}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800">
                      {stats.presentes}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-red-700 font-semibold">
                      {stats.ausentesInjustificados}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-blue-700">
                      {stats.ausentesJustificados}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-amber-700">
                      {stats.tardanzas}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold">
                      <span
                        className={
                          stats.percentAttendance < 85
                            ? 'text-red-700'
                            : stats.percentAttendance < 90
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }
                      >
                        {stats.percentAttendance}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {stats.isAtRisk ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          Riesgo
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-800 font-medium">Regular</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setInspectStudentId(student.id)}
                        className="px-2.5 py-1 text-slate-700 hover:text-[#14214F] hover:bg-slate-100 rounded text-xs transition-colors"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Student Attendance Modal */}
      {inspectStudentId && inspectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in">
            <div className="px-5 py-4 bg-[#14214F] text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Historial de Asistencia: {inspectedStudent.lastName}, {inspectedStudent.firstName}
                </h3>
                <p className="text-xs text-[#D4C08A]">
                  Legajo {inspectedStudent.legajo} · DNI {inspectedStudent.dni}
                </p>
              </div>
              <button
                onClick={() => setInspectStudentId(null)}
                className="text-white/70 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded border border-slate-200 grid grid-cols-2 gap-3 text-slate-700">
                <div>
                  <span className="text-slate-500">Tutor Legal: </span>
                  <span className="font-semibold">{inspectedStudent.tutorName}</span>
                </div>
                <div>
                  <span className="text-slate-500">Teléfono: </span>
                  <span className="font-mono">{inspectedStudent.tutorPhone}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">
                  Registros del Ciclo Lectivo {activeCycleId} ({inspectedRecords.length} jornadas registradas)
                </h4>

                {inspectedRecords.length === 0 ? (
                  <p className="text-slate-400 py-4 text-center">
                    No hay registros de asistencia asentados para este estudiante.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded">
                    {inspectedRecords.map((r) => (
                      <div key={r.id} className="p-2.5 flex items-center justify-between">
                        <div>
                          <div className="font-mono font-medium text-slate-800">{r.date}</div>
                          {r.notes && (
                            <div className="text-[11px] text-slate-500 mt-0.5">{r.notes}</div>
                          )}
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            r.status === 'PRESENTE'
                              ? 'bg-emerald-50 text-emerald-800'
                              : r.status === 'AUSENTE_INJUSTIFICADO'
                              ? 'bg-red-50 text-red-800'
                              : r.status === 'AUSENTE_JUSTIFICADO'
                              ? 'bg-blue-50 text-blue-800'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {r.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => setInspectStudentId(null)}
                  className="px-4 py-2 bg-[#14214F] text-white rounded text-xs font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
