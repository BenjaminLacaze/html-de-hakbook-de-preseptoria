import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AcademicPeriod, GradeRecord } from '../../types';
import {
  GraduationCap,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  FileText,
  Printer,
  Edit2,
  Plus,
  BookOpen,
  Award,
  X,
  Save,
} from 'lucide-react';

export const GradesView: React.FC = () => {
  const {
    courses,
    students,
    subjects,
    gradeRecords,
    users,
    activeCycleId,
    institutionSettings,
    addGradeRecord,
    updateGradeRecord,
  } = useApp();

  const currentCourses = courses.filter((c) => c.cycleId === activeCycleId);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    currentCourses[0]?.id || ''
  );
  const [selectedPeriod, setSelectedPeriod] = useState<AcademicPeriod>('1_TRIMESTRE');
  const [viewMode, setViewMode] = useState<'CURSO' | 'BOLETIN'>('CURSO');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Course Students & Subjects
  const courseStudents = useMemo(() => {
    return students.filter(
      (s) => s.courseId === selectedCourseId && s.cycleId === activeCycleId
    );
  }, [students, selectedCourseId, activeCycleId]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const courseSubjects = useMemo(() => {
    if (!selectedCourse) return subjects;
    return subjects.filter((s) => s.yearLevel === selectedCourse.yearLevel);
  }, [subjects, selectedCourse]);

  // Edit/Add Grade Modal
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeRecord | null>(null);
  const [modalStudentId, setModalStudentId] = useState('');
  const [modalSubjectId, setModalSubjectId] = useState('');
  const [modalScore, setModalScore] = useState(7);
  const [modalNotes, setModalNotes] = useState('');

  // Selected student for Boletín Digital
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    courseStudents[0]?.id || ''
  );

  const openGradeModal = (studentId: string, subjectId: string) => {
    const existing = gradeRecords.find(
      (g) =>
        g.studentId === studentId &&
        g.subjectId === subjectId &&
        g.period === selectedPeriod &&
        g.cycleId === activeCycleId
    );

    if (existing) {
      setEditingGrade(existing);
      setModalStudentId(existing.studentId);
      setModalSubjectId(existing.subjectId);
      setModalScore(existing.score);
      setModalNotes(existing.teacherNotes || '');
    } else {
      setEditingGrade(null);
      setModalStudentId(studentId);
      setModalSubjectId(subjectId);
      setModalScore(7);
      setModalNotes('');
    }
    setIsGradeModalOpen(true);
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    const isApproved = modalScore >= institutionSettings.minPassingGrade;

    if (editingGrade) {
      updateGradeRecord(editingGrade.id, {
        score: Number(modalScore),
        isApproved,
        teacherNotes: modalNotes.trim(),
        date: new Date().toISOString().split('T')[0],
      });
    } else {
      addGradeRecord({
        cycleId: activeCycleId,
        period: selectedPeriod,
        studentId: modalStudentId,
        courseId: selectedCourseId,
        subjectId: modalSubjectId,
        score: Number(modalScore),
        isApproved,
        teacherNotes: modalNotes.trim(),
        date: new Date().toISOString().split('T')[0],
      });
    }
    setIsGradeModalOpen(false);
  };

  // Boletín Data for selected student
  const boletinStudent = students.find((s) => s.id === selectedStudentId);
  const studentGrades = useMemo(() => {
    if (!selectedStudentId) return [];
    return gradeRecords.filter(
      (g) => g.studentId === selectedStudentId && g.cycleId === activeCycleId
    );
  }, [gradeRecords, selectedStudentId, activeCycleId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#89743A]">
            Evaluación y Acreditación de Saberes
          </div>
          <h1 className="text-xl font-bold text-[#14214F] mt-0.5">
            Seguimiento Académico y Calificaciones
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Libro de calificaciones digital, actas por materia y emisión de boletines de calificaciones.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setViewMode('CURSO')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              viewMode === 'CURSO'
                ? 'bg-[#14214F] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sábana de Calificaciones
          </button>
          <button
            onClick={() => setViewMode('BOLETIN')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              viewMode === 'BOLETIN'
                ? 'bg-[#14214F] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Boletín por Estudiante
          </button>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
              División Escolar
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                const firstStd = students.find(
                  (s) => s.courseId === e.target.value && s.cycleId === activeCycleId
                );
                if (firstStd) setSelectedStudentId(firstStd.id);
              }}
              className="text-xs font-semibold py-1.5 px-3 rounded border border-slate-300 focus:outline-none focus:border-[#14214F] text-[#14214F]"
            >
              {currentCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.yearLevel}° {c.division} ({c.shift} — {c.orientation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
              Período de Calificación
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as AcademicPeriod)}
              className="text-xs font-semibold py-1.5 px-3 rounded border border-slate-300 focus:outline-none focus:border-[#14214F] text-[#14214F]"
            >
              <option value="1_TRIMESTRE">1° Trimestre</option>
              <option value="2_TRIMESTRE">2° Trimestre</option>
              <option value="3_TRIMESTRE">3° Trimestre</option>
              <option value="DICIEMBRE_FEBRERO">Período de Intensificación (Dic/Feb)</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>Escala oficial: 1 a 10</span>
          <span aria-hidden="true">·</span>
          <span>
            Nota de aprobación mínima:{' '}
            <strong className="text-slate-800">{institutionSettings.minPassingGrade}</strong>
          </span>
        </div>
      </div>

      {viewMode === 'CURSO' ? (
        /* Course matrix view */
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-[#14214F]">
              Planilla de Calificaciones · {selectedCourse ? `${selectedCourse.yearLevel}° ${selectedCourse.division}` : ''} ({selectedPeriod.replace('_', ' ')})
            </span>
            <span className="text-slate-500 text-[11px]">
              Haga clic en cualquier calificación para rectificar o asentar notas con observación
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4 font-semibold sticky left-0 bg-slate-50">
                    Estudiante
                  </th>
                  {courseSubjects.map((sub) => (
                    <th key={sub.id} className="py-2.5 px-3 font-semibold text-center min-w-[130px]">
                      <div className="truncate max-w-[120px]" title={sub.name}>
                        {sub.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono normal-case">
                        {sub.code}
                      </div>
                    </th>
                  ))}
                  <th className="py-2.5 px-4 font-semibold text-right">Promedio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {courseStudents.map((std) => {
                  let totalScore = 0;
                  let gradedCount = 0;

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 sticky left-0 bg-white font-medium text-slate-900 border-r border-slate-100">
                        <div>
                          {std.lastName}, {std.firstName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {std.legajo}
                        </div>
                      </td>

                      {courseSubjects.map((sub) => {
                        const grade = gradeRecords.find(
                          (g) =>
                            g.studentId === std.id &&
                            g.subjectId === sub.id &&
                            g.period === selectedPeriod &&
                            g.cycleId === activeCycleId
                        );

                        if (grade) {
                          totalScore += grade.score;
                          gradedCount += 1;
                        }

                        return (
                          <td
                            key={sub.id}
                            className="py-3 px-3 text-center cursor-pointer hover:bg-slate-100 transition-colors"
                            onClick={() => openGradeModal(std.id, sub.id)}
                            title="Haga clic para editar calificación"
                          >
                            {grade ? (
                              <div className="inline-block">
                                <span
                                  className={`text-sm font-bold font-mono tabular-nums ${
                                    grade.score >= institutionSettings.minPassingGrade
                                      ? 'text-emerald-700'
                                      : 'text-red-700'
                                  }`}
                                >
                                  {grade.score}
                                </span>
                                {grade.teacherNotes && (
                                  <div className="text-[9px] text-slate-400 truncate max-w-[100px]">
                                    {grade.teacherNotes}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300 font-mono text-xs hover:text-[#14214F]">
                                + Cargar
                              </span>
                            )}
                          </td>
                        );
                      })}

                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-800">
                        {gradedCount > 0 ? (totalScore / gradedCount).toFixed(2) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Boletín Digital View */
        <div className="space-y-4">
          {/* Student picker */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-600">
                Seleccionar Estudiante:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="text-xs py-1.5 px-3 rounded border border-slate-300 font-medium text-[#14214F]"
              >
                {courseStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.lastName}, {s.firstName} ({s.legajo})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-[#14214F] hover:bg-[#0A1128] text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-[#D4C08A]" />
              <span>Imprimir Boletín Oficial</span>
            </button>
          </div>

          {/* Official Printable Report Card */}
          {boletinStudent && (
            <div className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-6">
              {/* Membrete oficial */}
              <div className="border-b-2 border-[#14214F] pb-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-[#89743A] uppercase tracking-wider">
                    Dirección General de Cultura y Educación · Región 18
                  </div>
                  <h2 className="text-lg font-bold text-[#14214F] font-heading mt-0.5">
                    {institutionSettings.name}
                  </h2>
                  <p className="text-xs text-slate-600">
                    Distrito Dolores · CUE: {institutionSettings.cue}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#14214F]">
                    BOLETÍN OFICIAL DE CALIFICACIONES
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Ciclo Lectivo {activeCycleId}
                  </div>
                </div>
              </div>

              {/* Student info box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded border border-slate-200 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">
                    Estudiante
                  </div>
                  <div className="font-bold text-slate-900">
                    {boletinStudent.lastName}, {boletinStudent.firstName}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">
                    DNI / Legajo
                  </div>
                  <div className="font-mono text-slate-800">
                    {boletinStudent.dni} ({boletinStudent.legajo})
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">
                    Curso y División
                  </div>
                  <div className="text-slate-800">
                    {selectedCourse ? `${selectedCourse.yearLevel}° ${selectedCourse.division} (${selectedCourse.shift})` : ''}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">
                    Condición
                  </div>
                  <div className="font-semibold text-emerald-800">
                    {boletinStudent.status}
                  </div>
                </div>
              </div>

              {/* Grades Table */}
              <table className="w-full text-left text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2 px-3">Espacio Curricular / Materia</th>
                    <th className="py-2 px-3 text-center">1° Trim.</th>
                    <th className="py-2 px-3 text-center">2° Trim.</th>
                    <th className="py-2 px-3 text-center">3° Trim.</th>
                    <th className="py-2 px-3 text-center">Calificación Final</th>
                    <th className="py-2 px-3">Acreditación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {courseSubjects.map((sub) => {
                    const g1 = studentGrades.find((g) => g.subjectId === sub.id && g.period === '1_TRIMESTRE');
                    const g2 = studentGrades.find((g) => g.subjectId === sub.id && g.period === '2_TRIMESTRE');
                    const g3 = studentGrades.find((g) => g.subjectId === sub.id && g.period === '3_TRIMESTRE');

                    const scores = [g1?.score, g2?.score, g3?.score].filter((s): s is number => typeof s === 'number');
                    const finalAvg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '—';
                    const isApproved = scores.length > 0 && Number(finalAvg) >= institutionSettings.minPassingGrade;

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-medium text-slate-900">
                          {sub.name}
                        </td>
                        <td className="py-2 px-3 text-center font-mono tabular-nums">
                          {g1 ? g1.score : '—'}
                        </td>
                        <td className="py-2 px-3 text-center font-mono tabular-nums">
                          {g2 ? g2.score : '—'}
                        </td>
                        <td className="py-2 px-3 text-center font-mono tabular-nums">
                          {g3 ? g3.score : '—'}
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold tabular-nums">
                          {finalAvg}
                        </td>
                        <td className="py-2 px-3 text-[11px]">
                          {scores.length === 0 ? (
                            <span className="text-slate-400">En curso</span>
                          ) : isApproved ? (
                            <span className="text-emerald-800 font-semibold">Acreditado</span>
                          ) : (
                            <span className="text-red-700 font-semibold">En intensificación</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs text-slate-500">
                <div className="border-t border-slate-300 pt-2">
                  <div className="font-semibold text-slate-800">{institutionSettings.principalName}</div>
                  <div>Directora ISFDyT N.° 26</div>
                </div>
                <div className="border-t border-slate-300 pt-2">
                  <div className="font-semibold text-slate-800">{selectedCourse ? users.find(u => u.id === selectedCourse.preceptorId)?.name : 'Preceptor'}</div>
                  <div>Preceptor/a de la División</div>
                </div>
                <div className="border-t border-slate-300 pt-2">
                  <div className="font-semibold text-slate-800">{boletinStudent.tutorName}</div>
                  <div>Firma del Tutor / Responsable</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit / Add Grade Modal */}
      {isGradeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in">
            <div className="px-5 py-4 bg-[#14214F] text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingGrade ? 'Rectificar Calificación' : 'Asentar Calificación'}
                </h3>
                <p className="text-xs text-[#D4C08A]">{selectedPeriod.replace('_', ' ')} · Escala 1-10</p>
              </div>
              <button
                onClick={() => setIsGradeModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Estudiante
                </label>
                <div className="p-2 bg-slate-50 rounded border border-slate-200 font-bold text-slate-900">
                  {students.find((s) => s.id === modalStudentId)?.lastName},{' '}
                  {students.find((s) => s.id === modalStudentId)?.firstName}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Espacio Curricular / Materia
                </label>
                <div className="p-2 bg-slate-50 rounded border border-slate-200 text-slate-800 font-medium">
                  {subjects.find((s) => s.id === modalSubjectId)?.name}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Calificación Numérica (1 a 10) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  step={1}
                  required
                  value={modalScore}
                  onChange={(e) => setModalScore(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-[#14214F] text-base font-mono font-bold text-[#14214F]"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {modalScore >= institutionSettings.minPassingGrade ? (
                    <span className="text-emerald-700 font-medium">✓ Acreditado satisfactoriamente</span>
                  ) : (
                    <span className="text-red-700 font-medium">✗ Requiere período de intensificación</span>
                  )}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Observación Pedagógica del Docente
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalle de trabajos prácticos, participación o recomendaciones de intensificación..."
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:border-[#14214F] text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGradeModalOpen(false)}
                  className="px-3 py-2 text-slate-700 hover:bg-slate-100 rounded text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#14214F] hover:bg-[#0A1128] text-white rounded text-xs font-medium transition-colors shadow-xs"
                >
                  {editingGrade ? 'Guardar Rectificación' : 'Asentar Nota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
