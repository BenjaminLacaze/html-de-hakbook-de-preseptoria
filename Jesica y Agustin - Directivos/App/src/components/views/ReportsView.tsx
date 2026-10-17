import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Filter,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  School,
  Layers,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    courses,
    students,
    subjects,
    gradeRecords,
    attendanceRecords,
    activeCycleId,
    institutionSettings,
    getStudentAttendanceStats,
    getGlobalAttendanceStats,
    getAtRiskStudents,
  } = useApp();

  const [reportType, setReportType] = useState<'ASISTENCIA' | 'ACADEMICO' | 'MATRICULA'>('ASISTENCIA');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('TODOS');

  const currentCourses = courses.filter((c) => c.cycleId === activeCycleId);
  const currentStudents = students.filter((s) => s.cycleId === activeCycleId);

  // Filtered by course if not 'TODOS'
  const targetCourses = useMemo(() => {
    if (selectedCourseId === 'TODOS') return currentCourses;
    return currentCourses.filter((c) => c.id === selectedCourseId);
  }, [currentCourses, selectedCourseId]);

  const targetStudents = useMemo(() => {
    if (selectedCourseId === 'TODOS') return currentStudents;
    return currentStudents.filter((s) => s.courseId === selectedCourseId);
  }, [currentStudents, selectedCourseId]);

  // Attendance metrics
  const attendanceData = useMemo(() => {
    return targetCourses.map((c) => {
      const cStudents = students.filter((s) => s.courseId === c.id && s.cycleId === activeCycleId);
      const cRecords = attendanceRecords.filter((r) => r.courseId === c.id && r.cycleId === activeCycleId);

      const total = cRecords.length;
      const pres = cRecords.filter((r) => r.status === 'PRESENTE').length;
      const ausInj = cRecords.filter((r) => r.status === 'AUSENTE_INJUSTIFICADO').length;
      const ausJust = cRecords.filter((r) => r.status === 'AUSENTE_JUSTIFICADO').length;
      const tard = cRecords.filter((r) => r.status === 'TARDANZA').length;
      const rate = total > 0 ? Math.round(((pres + tard * 0.75) / total) * 100) : 100;

      return {
        course: c,
        studentCount: cStudents.length,
        totalRecords: total,
        presentes: pres,
        ausentesInjustificados: ausInj,
        ausentesJustificados: ausJust,
        tardanzas: tard,
        attendanceRate: rate,
      };
    });
  }, [targetCourses, students, attendanceRecords, activeCycleId]);

  // Academic metrics per subject
  const academicData = useMemo(() => {
    return subjects.map((sub) => {
      const subGrades = gradeRecords.filter(
        (g) => g.subjectId === sub.id && g.cycleId === activeCycleId
      );
      const scores = subGrades.map((g) => g.score);
      const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : '—';
      const approved = subGrades.filter((g) => g.isApproved).length;
      const failed = subGrades.filter((g) => !g.isApproved).length;
      const total = subGrades.length;
      const passRate = total > 0 ? Math.round((approved / total) * 100) : 100;

      return {
        subject: sub,
        totalGrades: total,
        average: avg,
        approved,
        failed,
        passRate,
      };
    });
  }, [subjects, gradeRecords, activeCycleId]);

  // CSV Export
  const exportToCSV = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM
    const timestamp = new Date().toISOString().split('T')[0];

    if (reportType === 'ASISTENCIA') {
      csvContent += `INFORME INSTITUCIONAL DE ASISTENCIA Y AUSENTISMO - ${institutionSettings.name}\n`;
      csvContent += `Ciclo Lectivo: ${activeCycleId};Fecha de Emisión: ${timestamp}\n\n`;
      csvContent += `Curso/División;Turno;Carrera/Orientación;Matrícula;Jornadas Evaluadas;Presentes;Aus. Injustificadas;Aus. Justificadas;Tardanzas;% Asistencia\n`;

      attendanceData.forEach((row) => {
        csvContent += `"${row.course.yearLevel}° ${row.course.division}";"${row.course.shift}";"${row.course.orientation}";${row.studentCount};${row.totalRecords};${row.presentes};${row.ausentesInjustificados};${row.ausentesJustificados};${row.tardanzas};${row.attendanceRate}%\n`;
      });
    } else if (reportType === 'ACADEMICO') {
      csvContent += `INFORME DE RENDIMIENTO ACADÉMICO Y CALIFICACIONES - ${institutionSettings.name}\n`;
      csvContent += `Ciclo Lectivo: ${activeCycleId};Fecha de Emisión: ${timestamp}\n\n`;
      csvContent += `Código;Espacio Curricular;Año Cursada;Horas Semanales;Régimen;Total Evaluaciones;Promedio Calificaciones;Aprobados;En Intensificación;% Acreditación\n`;

      academicData.forEach((row) => {
        csvContent += `"${row.subject.code}";"${row.subject.name}";"${row.subject.yearLevel}° Año";${row.subject.hoursWeekly};"${row.subject.regime}";${row.totalGrades};${row.average};${row.approved};${row.failed};${row.passRate}%\n`;
      });
    } else {
      csvContent += `ESTRUCTURA DE MATRÍCULA Y CAPACIDAD AÚLICA - ${institutionSettings.name}\n`;
      csvContent += `Ciclo Lectivo: ${activeCycleId};Fecha de Emisión: ${timestamp}\n\n`;
      csvContent += `Curso/División;Turno;Aula;Capacidad Máxima;Alumnos Inscriptos;% Ocupación;Preceptor Asignado\n`;

      targetCourses.forEach((c) => {
        const inscriptos = currentStudents.filter((s) => s.courseId === c.id).length;
        const ocup = Math.round((inscriptos / c.capacity) * 100);
        csvContent += `"${c.yearLevel}° ${c.division}";"${c.shift}";"${c.classroom}";${c.capacity};${inscriptos};${ocup}%;"${c.preceptorId}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Informe_${reportType}_ISFDyT26_${activeCycleId}_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#89743A]">
            Supervisión Estadística y Análisis
          </div>
          <h1 className="text-xl font-bold text-[#14214F] mt-0.5">
            Informes Estadísticos Institucionales
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consolidado de asistencia, matrices de rendimiento por cátedra y estado de matrícula para el CAI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-[#14214F] border border-slate-300 text-xs font-medium rounded transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Descargar CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-[#14214F] hover:bg-[#0A1128] text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#D4C08A]" />
            <span>Imprimir Informe Oficial</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector + Course Filter */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Tipo de Informe:</span>
          <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setReportType('ASISTENCIA')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                reportType === 'ASISTENCIA'
                  ? 'bg-[#14214F] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Asistencia y Ausentismo
            </button>
            <button
              onClick={() => setReportType('ACADEMICO')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                reportType === 'ACADEMICO'
                  ? 'bg-[#14214F] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rendimiento por Cátedra
            </button>
            <button
              onClick={() => setReportType('MATRICULA')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                reportType === 'MATRICULA'
                  ? 'bg-[#14214F] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Capacidad y Matrícula
            </button>
          </div>
        </div>

        {reportType !== 'ACADEMICO' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Filtrar Curso:</span>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="text-xs py-1.5 px-3 rounded border border-slate-300 font-medium text-[#14214F]"
            >
              <option value="TODOS">Todos los Cursos ({currentCourses.length})</option>
              {currentCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.yearLevel}° {c.division} ({c.shift})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Printable Official Document Container */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Institutional Formal Header (Shown always, prominent in print) */}
        <div className="border-b-2 border-[#14214F] pb-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-[#89743A] uppercase tracking-wider">
              Dirección General de Cultura y Educación · Provincia de Buenos Aires
            </div>
            <h2 className="text-lg font-bold text-[#14214F] font-heading mt-0.5">
              {institutionSettings.name}
            </h2>
            <div className="text-xs text-slate-500 font-mono">
              Distrito Dolores · Región 18 · CUE: {institutionSettings.cue}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-[#14214F] uppercase">
              {reportType === 'ASISTENCIA'
                ? 'INFORME OFICIAL DE ASISTENCIA Y AUSENTISMO'
                : reportType === 'ACADEMICO'
                ? 'INFORME DE RENDIMIENTO ACADÉMICO'
                : 'CENSO DE MATRÍCULA Y CAPACIDAD AÚLICA'}
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Ciclo Lectivo {activeCycleId} · Emitido el{' '}
              {new Date().toLocaleDateString('es-AR')}
            </div>
          </div>
        </div>

        {/* Report Content Table */}
        {reportType === 'ASISTENCIA' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-600">
              Cómputo integral de inasistencias justificadas, injustificadas y cómputo de tasa de regularidad escolar.
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">División</th>
                    <th className="py-2.5 px-3">Carrera / Orientación</th>
                    <th className="py-2.5 px-3">Turno</th>
                    <th className="py-2.5 px-3 text-right">Alumnos</th>
                    <th className="py-2.5 px-3 text-right">Presentes</th>
                    <th className="py-2.5 px-3 text-right text-red-700">Aus. Injust.</th>
                    <th className="py-2.5 px-3 text-right text-blue-700">Aus. Just.</th>
                    <th className="py-2.5 px-3 text-right text-amber-700">Tardanzas</th>
                    <th className="py-2.5 px-3 text-right font-bold">% Asistencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {attendanceData.map((row) => (
                    <tr key={row.course.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-[#14214F]">
                        {row.course.yearLevel}° {row.course.division}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">
                        {row.course.orientation}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {row.course.shift}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        {row.studentCount}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        {row.presentes}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-red-700 font-semibold">
                        {row.ausentesInjustificados}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-blue-700">
                        {row.ausentesJustificados}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-amber-700">
                        {row.tardanzas}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                        <span
                          className={
                            row.attendanceRate < 85
                              ? 'text-red-700'
                              : row.attendanceRate < 90
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          }
                        >
                          {row.attendanceRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'ACADEMICO' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-600">
              Desglose de calificaciones promedio, porcentaje de aprobación y alumnos derivados a períodos de intensificación por materia.
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Espacio Curricular</th>
                    <th className="py-2.5 px-3">Año / Cursada</th>
                    <th className="py-2.5 px-3 text-right">Hs Semanales</th>
                    <th className="py-2.5 px-3 text-right">Evaluaciones</th>
                    <th className="py-2.5 px-3 text-right">Promedio</th>
                    <th className="py-2.5 px-3 text-right text-emerald-700">Aprobados</th>
                    <th className="py-2.5 px-3 text-right text-red-700">Intensificación</th>
                    <th className="py-2.5 px-3 text-right font-bold">% Acreditación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {academicData.map((row) => (
                    <tr key={row.subject.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                        {row.subject.code}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#14214F]">
                        {row.subject.name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {row.subject.yearLevel}° Año ({row.subject.regime})
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        {row.subject.hoursWeekly} hs
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        {row.totalGrades}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold">
                        {row.average}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                        {row.approved}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-red-700 font-semibold">
                        {row.failed}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                        <span
                          className={
                            row.passRate < 70
                              ? 'text-red-700'
                              : row.passRate < 85
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          }
                        >
                          {row.passRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'MATRICULA' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-600">
              Distribución de la matrícula institucional por curso, división, turno y porcentaje de absorción de capacidad áulica.
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">División</th>
                    <th className="py-2.5 px-3">Turno</th>
                    <th className="py-2.5 px-3">Aula Asignada</th>
                    <th className="py-2.5 px-3 text-right">Capacidad</th>
                    <th className="py-2.5 px-3 text-right">Inscriptos</th>
                    <th className="py-2.5 px-3 text-right">Vacantes Libres</th>
                    <th className="py-2.5 px-3 text-right font-bold">% Ocupación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {targetCourses.map((c) => {
                    const count = currentStudents.filter((s) => s.courseId === c.id).length;
                    const libres = Math.max(0, c.capacity - count);
                    const ocup = Math.round((count / c.capacity) * 100);

                    return (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-[#14214F]">
                          {c.yearLevel}° {c.division} — {c.orientation}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {c.shift}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {c.classroom}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                          {c.capacity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                          {count}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500">
                          {libres}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                          {ocup}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Formal Institutional Signatures for printed distribution */}
        <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
          <div className="border-t border-slate-300 pt-2">
            <div className="font-bold text-slate-800">{institutionSettings.principalName}</div>
            <div>Directora · ISFDyT N.° 26</div>
          </div>
          <div className="border-t border-slate-300 pt-2">
            <div className="font-bold text-slate-800">{institutionSettings.vicePrincipalName}</div>
            <div>Vicedirector Institucional</div>
          </div>
        </div>
      </div>
    </div>
  );
};
