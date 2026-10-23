import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Course, Student, Shift } from '../../types';
import {
  BookOpen,
  Plus,
  Users,
  Search,
  UserCheck,
  UserPlus,
  Edit2,
  GraduationCap,
  Calendar,
  Layers,
  X,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export const CoursesView: React.FC = () => {
  const {
    courses,
    students,
    teachers,
    subjects,
    teacherAssignments,
    users,
    activeCycleId,
    addCourse,
    updateCourse,
    addStudent,
    updateStudent,
  } = useApp();

  const currentCourses = useMemo(
    () => courses.filter((c) => c.cycleId === activeCycleId),
    [courses, activeCycleId]
  );

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    currentCourses[0]?.id || ''
  );

  const [searchStudent, setSearchStudent] = useState('');

  // Course Modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseYear, setCourseYear] = useState(1);
  const [courseDivision, setCourseDivision] = useState('1ra');
  const [courseShift, setCourseShift] = useState<Shift>('MAÑANA');
  const [courseOrientation, setCourseOrientation] = useState('');
  const [courseClassroom, setCourseClassroom] = useState('');
  const [courseCapacity, setCourseCapacity] = useState(30);
  const [coursePreceptorId, setCoursePreceptorId] = useState(users[3]?.id || '');
  const [courseError, setCourseError] = useState('');

  // Student Modal
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [stdLastName, setStdLastName] = useState('');
  const [stdFirstName, setStdFirstName] = useState('');
  const [stdDni, setStdDni] = useState('');
  const [stdBirthDate, setStdBirthDate] = useState('2004-01-01');
  const [stdTutorName, setStdTutorName] = useState('');
  const [stdTutorPhone, setStdTutorPhone] = useState('');
  const [stdTutorEmail, setStdTutorEmail] = useState('');
  const [stdAddress, setStdAddress] = useState('');
  const [stdHealthAlert, setStdHealthAlert] = useState('');
  const [stdCourseId, setStdCourseId] = useState('');
  const [stdStatus, setStdStatus] = useState<Student['status']>('REGULAR');
  const [studentError, setStudentError] = useState('');

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || currentCourses[0];

  const courseStudents = useMemo(() => {
    if (!selectedCourse) return [];
    return students.filter(
      (s) => s.courseId === selectedCourse.id && s.cycleId === activeCycleId
    );
  }, [students, selectedCourse, activeCycleId]);

  const filteredStudents = useMemo(() => {
    return courseStudents.filter((s) => {
      const query = searchStudent.toLowerCase();
      return (
        s.lastName.toLowerCase().includes(query) ||
        s.firstName.toLowerCase().includes(query) ||
        s.dni.includes(query) ||
        s.legajo.toLowerCase().includes(query)
      );
    });
  }, [courseStudents, searchStudent]);

  const courseAssignments = useMemo(() => {
    if (!selectedCourse) return [];
    return teacherAssignments.filter(
      (ta) => ta.courseId === selectedCourse.id && ta.cycleId === activeCycleId
    );
  }, [teacherAssignments, selectedCourse, activeCycleId]);

  // Preceptors list
  const preceptors = users.filter((u) => u.role === 'PRECEPTORIA' || u.role === 'DIRECTIVO');

  // Open Course Modal
  const openNewCourseModal = () => {
    setEditingCourse(null);
    setCourseYear(1);
    setCourseDivision('1ra');
    setCourseShift('MAÑANA');
    setCourseOrientation('Profesorado de Educación Secundaria en Historia');
    setCourseClassroom('Aula 101');
    setCourseCapacity(30);
    setCoursePreceptorId(preceptors[0]?.id || users[0]?.id);
    setCourseError('');
    setIsCourseModalOpen(true);
  };

  const openEditCourseModal = (c: Course) => {
    setEditingCourse(c);
    setCourseYear(c.yearLevel);
    setCourseDivision(c.division);
    setCourseShift(c.shift);
    setCourseOrientation(c.orientation);
    setCourseClassroom(c.classroom);
    setCourseCapacity(c.capacity);
    setCoursePreceptorId(c.preceptorId);
    setCourseError('');
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseOrientation.trim() || !courseClassroom.trim()) {
      setCourseError('Complete todos los campos requeridos.');
      return;
    }

    if (editingCourse) {
      updateCourse(editingCourse.id, {
        yearLevel: Number(courseYear),
        division: courseDivision,
        shift: courseShift,
        orientation: courseOrientation.trim(),
        classroom: courseClassroom.trim(),
        capacity: Number(courseCapacity),
        preceptorId: coursePreceptorId,
      });
    } else {
      addCourse({
        cycleId: activeCycleId,
        yearLevel: Number(courseYear),
        division: courseDivision,
        shift: courseShift,
        orientation: courseOrientation.trim(),
        classroom: courseClassroom.trim(),
        capacity: Number(courseCapacity),
        preceptorId: coursePreceptorId,
      });
    }
    setIsCourseModalOpen(false);
  };

  // Open Student Modal
  const openNewStudentModal = () => {
    setEditingStudent(null);
    setStdLastName('');
    setStdFirstName('');
    setStdDni('');
    setStdBirthDate('2004-01-01');
    setStdTutorName('');
    setStdTutorPhone('');
    setStdTutorEmail('');
    setStdAddress('Dolores, Prov. de Buenos Aires');
    setStdHealthAlert('');
    setStdCourseId(selectedCourse?.id || currentCourses[0]?.id || '');
    setStdStatus('REGULAR');
    setStudentError('');
    setIsStudentModalOpen(true);
  };

  const openEditStudentModal = (s: Student) => {
    setEditingStudent(s);
    setStdLastName(s.lastName);
    setStdFirstName(s.firstName);
    setStdDni(s.dni);
    setStdBirthDate(s.birthDate);
    setStdTutorName(s.tutorName);
    setStdTutorPhone(s.tutorPhone);
    setStdTutorEmail(s.tutorEmail);
    setStdAddress(s.address);
    setStdHealthAlert(s.healthAlert || '');
    setStdCourseId(s.courseId);
    setStdStatus(s.status);
    setStudentError('');
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stdLastName.trim() || !stdFirstName.trim() || !stdDni.trim()) {
      setStudentError('Complete nombre, apellido y DNI del estudiante.');
      return;
    }

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        lastName: stdLastName.trim(),
        firstName: stdFirstName.trim(),
        dni: stdDni.trim(),
        birthDate: stdBirthDate,
        tutorName: stdTutorName.trim(),
        tutorPhone: stdTutorPhone.trim(),
        tutorEmail: stdTutorEmail.trim(),
        address: stdAddress.trim(),
        healthAlert: stdHealthAlert.trim() || undefined,
        courseId: stdCourseId,
        status: stdStatus,
      });
    } else {
      addStudent({
        lastName: stdLastName.trim(),
        firstName: stdFirstName.trim(),
        dni: stdDni.trim(),
        birthDate: stdBirthDate,
        tutorName: stdTutorName.trim() || 'A designar',
        tutorPhone: stdTutorPhone.trim() || 'Sin registrar',
        tutorEmail: stdTutorEmail.trim() || '',
        address: stdAddress.trim() || 'Dolores',
        healthAlert: stdHealthAlert.trim() || undefined,
        courseId: stdCourseId,
        cycleId: activeCycleId,
        status: stdStatus,
      });
    }
    setIsStudentModalOpen(false);
  };

  const assignedPreceptor = users.find((u) => u.id === selectedCourse?.preceptorId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#89743A]">
            Estructura Académica · Ciclo Lectivo {activeCycleId}
          </div>
          <h1 className="text-xl font-bold text-[#14214F] mt-0.5">
            Cursos, Divisiones y Matrícula Estudiantil
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organización de secciones áulicas, capacidad operativa y nómina oficial de alumnos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openNewStudentModal}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-[#14214F] border border-slate-300 text-xs font-medium rounded transition-colors flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#89743A]" />
            <span>Matricular Alumno</span>
          </button>
          <button
            onClick={openNewCourseModal}
            className="px-3.5 py-2 bg-[#14214F] hover:bg-[#0A1128] text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#D4C08A]" />
            <span>Crear División</span>
          </button>
        </div>
      </div>

      {/* Course Division Selector Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {currentCourses.map((c) => {
          const isSelected = c.id === selectedCourse?.id;
          const count = students.filter(
            (s) => s.courseId === c.id && s.cycleId === activeCycleId
          ).length;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCourseId(c.id)}
              className={`p-3 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'bg-[#14214F] text-white border-[#89743A] shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className={isSelected ? 'text-[#D4C08A]' : 'text-slate-500'}>
                  {c.shift}
                </span>
                <span className="font-mono tabular-nums text-[11px]">
                  {count}/{c.capacity}
                </span>
              </div>
              <div className="text-base font-bold font-mono">
                {c.yearLevel}° {c.division}
              </div>
              <div
                className={`text-[10px] truncate mt-1 ${
                  isSelected ? 'text-slate-300' : 'text-slate-500'
                }`}
                title={c.orientation}
              >
                {c.orientation.replace('Profesorado de Educación Secundaria en ', 'Prof. ')}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Course Header Banner */}
      {selectedCourse && (
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[#14214F]">
                  División {selectedCourse.yearLevel}° {selectedCourse.division}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                  Turno {selectedCourse.shift}
                </span>
                <span className="text-xs text-slate-500 font-sans">
                  · {selectedCourse.classroom}
                </span>
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Orientación: <span className="font-medium text-slate-900">{selectedCourse.orientation}</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Preceptor Asignado:{' '}
                <span className="font-medium text-slate-800">
                  {assignedPreceptor ? assignedPreceptor.name : 'Sin preceptor asignado'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openEditCourseModal(selectedCourse)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded border border-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar División</span>
              </button>
            </div>
          </div>

          {/* Academic & Teacher Assignments for this course */}
          <div className="mt-4 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Cátedras y Docentes Asignados a la División
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {courseAssignments.map((ta) => {
                const sub = subjects.find((s) => s.id === ta.subjectId);
                const tch = teachers.find((t) => t.id === ta.teacherId);
                return (
                  <div
                    key={ta.id}
                    className="p-2.5 rounded bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <div className="font-semibold text-slate-900 truncate">
                      {sub?.name || 'Materia'}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5 flex items-center justify-between">
                      <span>Prof. {tch ? `${tch.lastName}, ${tch.firstName.charAt(0)}.` : 'Vacante'}</span>
                      <span className="text-[10px] text-[#89743A] font-medium uppercase">
                        {ta.statusRevista}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Enrolled Students Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#14214F]" />
            <h3 className="text-sm font-bold text-[#14214F]">
              Nómina de Alumnos ({courseStudents.length} matriculados)
            </h3>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por alumno, DNI o legajo..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#14214F]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4 font-semibold">Legajo & DNI</th>
                <th className="py-2.5 px-4 font-semibold">Apellido y Nombre</th>
                <th className="py-2.5 px-4 font-semibold">Tutor / Contacto</th>
                <th className="py-2.5 px-4 font-semibold">Condición</th>
                <th className="py-2.5 px-4 font-semibold">Observaciones Médicas</th>
                <th className="py-2.5 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No hay estudiantes registrados en esta división con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] tabular-nums">
                      <div className="font-semibold text-slate-900">{std.legajo}</div>
                      <div className="text-slate-500 text-[10px]">DNI {std.dni}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">
                        {std.lastName}, {std.firstName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Nac.: {std.birthDate} · {std.address}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800">{std.tutorName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {std.tutorPhone}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-[11px] font-medium ${
                          std.status === 'REGULAR'
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {std.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {std.healthAlert ? (
                        <span className="text-red-700 font-medium">{std.healthAlert}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openEditStudentModal(std)}
                        className="px-2.5 py-1 text-slate-600 hover:text-[#14214F] hover:bg-slate-100 rounded text-xs transition-colors"
                      >
                        Editar Ficha
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Course Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in">
            <div className="px-5 py-4 bg-[#14214F] text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingCourse ? 'Editar División Escolar' : 'Crear Nueva División'}
                </h3>
                <p className="text-xs text-[#D4C08A]">Ciclo Lectivo {activeCycleId}</p>
              </div>
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="p-5 space-y-3.5 text-xs">
              {courseError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{courseError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Año de Cursada *</label>
                  <select
                    value={courseYear}
                    onChange={(e) => setCourseYear(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                  >
                    <option value={1}>1° Año</option>
                    <option value={2}>2° Año</option>
                    <option value={3}>3° Año</option>
                    <option value={4}>4° Año</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">División *</label>
                  <input
                    type="text"
                    required
                    placeholder="1ra"
                    value={courseDivision}
                    onChange={(e) => setCourseDivision(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Turno *</label>
                  <select
                    value={courseShift}
                    onChange={(e) => setCourseShift(e.target.value as Shift)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                  >
                    <option value="MAÑANA">Mañana</option>
                    <option value="TARDE">Tarde</option>
                    <option value="VESPERTINO">Vespertino</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacidad Máxima</label>
                  <input
                    type="number"
                    min={15}
                    max={50}
                    value={courseCapacity}
                    onChange={(e) => setCourseCapacity(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Carrera / Orientación *</label>
                <input
                  type="text"
                  required
                  placeholder="Profesorado de Educación Secundaria..."
                  value={courseOrientation}
                  onChange={(e) => setCourseOrientation(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Aula Asignada *</label>
                  <input
                    type="text"
                    required
                    placeholder="Aula 204"
                    value={courseClassroom}
                    onChange={(e) => setCourseClassroom(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preceptor/a</label>
                  <select
                    value={coursePreceptorId}
                    onChange={(e) => setCoursePreceptorId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                  >
                    {preceptors.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-3 py-2 text-slate-700 hover:bg-slate-100 rounded text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#14214F] hover:bg-[#0A1128] text-white rounded text-xs font-medium transition-colors shadow-xs"
                >
                  {editingCourse ? 'Guardar Cambios' : 'Crear División'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in">
            <div className="px-5 py-4 bg-[#14214F] text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingStudent ? 'Actualizar Ficha de Estudiante' : 'Matricular Nuevo Estudiante'}
                </h3>
                <p className="text-xs text-[#D4C08A]">Libro Matriz Oficial · ISFDyT N.° 26</p>
              </div>
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-5 space-y-3.5 text-xs">
              {studentError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{studentError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Apellido(s) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Albarracín"
                    value={stdLastName}
                    onChange={(e) => setStdLastName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre(s) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Joaquín Ignacio"
                    value={stdFirstName}
                    onChange={(e) => setStdFirstName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">DNI del Alumno *</label>
                  <input
                    type="text"
                    required
                    placeholder="44.892.102"
                    value={stdDni}
                    onChange={(e) => setStdDni(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={stdBirthDate}
                    onChange={(e) => setStdBirthDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Curso y División *</label>
                  <select
                    value={stdCourseId}
                    onChange={(e) => setStdCourseId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                  >
                    {currentCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.yearLevel}° {c.division} ({c.shift})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Condición Matrícula</label>
                  <select
                    value={stdStatus}
                    onChange={(e) => setStdStatus(e.target.value as Student['status'])}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                  >
                    <option value="REGULAR">Regular</option>
                    <option value="CONDICIONAL">Condicional</option>
                    <option value="PASIVADO">Pasivado / Baja</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tutor Legal / Responsable</label>
                  <input
                    type="text"
                    placeholder="Rosa Albarracín (Madre)"
                    value={stdTutorName}
                    onChange={(e) => setStdTutorName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono Tutor</label>
                  <input
                    type="text"
                    placeholder="2245-481920"
                    value={stdTutorPhone}
                    onChange={(e) => setStdTutorPhone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Domicilio</label>
                <input
                  type="text"
                  placeholder="Av. San Martín 320, Dolores"
                  value={stdAddress}
                  onChange={(e) => setStdAddress(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alerta Médica / Pedagógica (opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Asma leve, intolerancia alimentaria, etc."
                  value={stdHealthAlert}
                  onChange={(e) => setStdHealthAlert(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-3 py-2 text-slate-700 hover:bg-slate-100 rounded text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#14214F] hover:bg-[#0A1128] text-white rounded text-xs font-medium transition-colors shadow-xs"
                >
                  {editingStudent ? 'Guardar Cambios' : 'Registrar Matrícula'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
