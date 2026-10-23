import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ScheduleSlot, SchoolEvent } from '../../types';
import {
  Clock,
  Calendar,
  Plus,
  AlertCircle,
  MapPin,
  User,
  BookOpen,
  CalendarDays,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
} from 'lucide-react';

export const OrganizationView: React.FC = () => {
  const {
    courses,
    subjects,
    teachers,
    schedules,
    events,
    activeCycleId,
    addScheduleSlot,
    deleteScheduleSlot,
    addEvent,
    deleteEvent,
  } = useApp();

  const currentCourses = courses.filter((c) => c.cycleId === activeCycleId);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    currentCourses[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'HORARIOS' | 'CALENDARIO'>('HORARIOS');

  // Days and modules
  const days = [
    { dayNumber: 1, name: 'Lunes' },
    { dayNumber: 2, name: 'Martes' },
    { dayNumber: 3, name: 'Miércoles' },
    { dayNumber: 4, name: 'Jueves' },
    { dayNumber: 5, name: 'Viernes' },
  ];

  const modules = [
    { module: 1, time: '07:45 - 08:45' },
    { module: 2, time: '08:45 - 09:45' },
    { module: 3, time: '10:00 - 11:00' },
    { module: 4, time: '11:00 - 12:00' },
    { module: 5, time: '12:15 - 13:15' },
    { module: 6, time: '13:15 - 14:15' },
  ];

  // Course Schedules
  const courseSchedules = useMemo(() => {
    return schedules.filter(
      (s) => s.courseId === selectedCourseId && s.cycleId === activeCycleId
    );
  }, [schedules, selectedCourseId, activeCycleId]);

  // Check for teacher conflict across any other course in the same day & module
  const detectTeacherConflict = (dayOfWeek: number, moduleNum: number, teacherId: string, currentSlotId?: string) => {
    return schedules.find(
      (s) =>
        s.cycleId === activeCycleId &&
        s.dayOfWeek === dayOfWeek &&
        s.module === moduleNum &&
        s.teacherId === teacherId &&
        s.id !== currentSlotId &&
        s.courseId !== selectedCourseId
    );
  };

  // Schedule Modal
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotDay, setSlotDay] = useState<number>(1);
  const [slotModule, setSlotModule] = useState<number>(1);
  const [slotSubjectId, setSlotSubjectId] = useState('');
  const [slotTeacherId, setSlotTeacherId] = useState('');
  const [slotClassroom, setSlotClassroom] = useState('Aula 101');
  const [slotError, setSlotError] = useState('');

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const courseSubjects = useMemo(() => {
    if (!selectedCourse) return subjects;
    return subjects.filter((s) => s.yearLevel === selectedCourse.yearLevel);
  }, [subjects, selectedCourse]);

  const openSlotModal = (dayOfWeek: number, moduleNum: number) => {
    setSlotDay(dayOfWeek);
    setSlotModule(moduleNum);
    setSlotSubjectId(courseSubjects[0]?.id || subjects[0]?.id);
    setSlotTeacherId(teachers[0]?.id || '');
    setSlotClassroom(selectedCourse?.classroom || 'Aula 101');
    setSlotError('');
    setIsSlotModalOpen(true);
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotSubjectId || !slotTeacherId) {
      setSlotError('Seleccione materia y docente.');
      return;
    }

    // Check conflict
    const conflict = detectTeacherConflict(slotDay, slotModule, slotTeacherId);
    if (conflict) {
      const conflictCourse = courses.find((c) => c.id === conflict.courseId);
      const conflictTch = teachers.find((t) => t.id === slotTeacherId);
      setSlotError(
        `Conflicto horario: El docente ${conflictTch?.lastName} ya está asignado a ${conflictCourse?.yearLevel}° ${conflictCourse?.division} en este mismo módulo horario.`
      );
      return;
    }

    const modObj = modules.find((m) => m.module === slotModule);
    const times = modObj?.time.split(' - ') || ['07:45', '08:45'];

    addScheduleSlot({
      cycleId: activeCycleId,
      courseId: selectedCourseId,
      dayOfWeek: slotDay as 1 | 2 | 3 | 4 | 5,
      module: slotModule,
      startTime: times[0],
      endTime: times[1],
      subjectId: slotSubjectId,
      teacherId: slotTeacherId,
      classroom: slotClassroom,
    });

    setIsSlotModalOpen(false);
  };

  // Event Modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventDate, setEventDate] = useState('2026-10-25');
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<SchoolEvent['type']>('JORNADA_INSTITUCIONAL');
  const [eventDesc, setEventDesc] = useState('');
  const [eventMandatory, setEventMandatory] = useState(true);
  const [eventError, setEventError] = useState('');

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate) {
      setEventError('Complete el título y la fecha del evento.');
      return;
    }

    addEvent({
      cycleId: activeCycleId,
      date: eventDate,
      title: eventTitle.trim(),
      type: eventType,
      description: eventDesc.trim(),
      isMandatory: eventMandatory,
    });

    setIsEventModalOpen(false);
    setEventTitle('');
    setEventDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#89743A]">
            Coordinación y Agenda Escolar
          </div>
          <h1 className="text-xl font-bold text-[#14214F] mt-0.5">
            Organización Institucional y Horarios
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Grilla horaria semanal, asignaciones docentes áulicas y calendario oficial de actividades.
          </p>
        </div>

        {/* View toggle */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('HORARIOS')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'HORARIOS'
                ? 'bg-[#14214F] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Grilla Horaria
          </button>
          <button
            onClick={() => setActiveTab('CALENDARIO')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'CALENDARIO'
                ? 'bg-[#14214F] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Calendario Oficial ({events.length})
          </button>
        </div>
      </div>

      {activeTab === 'HORARIOS' ? (
        <div className="space-y-4">
          {/* Course selector */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-600">
                División Escolar:
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="text-xs py-1.5 px-3 rounded border border-slate-300 font-medium text-[#14214F]"
              >
                {currentCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.yearLevel}° {c.division} ({c.shift} — {c.orientation})
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-slate-500">
              Aula: <strong>{selectedCourse?.classroom}</strong> · Turno <strong>{selectedCourse?.shift}</strong>
            </div>
          </div>

          {/* Schedule Grid */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3 font-semibold w-28 border-r border-slate-200">
                      Módulo Horario
                    </th>
                    {days.map((d) => (
                      <th key={d.dayNumber} className="py-2.5 px-3 font-semibold text-center border-r border-slate-200">
                        {d.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {modules.map((m) => (
                    <tr key={m.module} className="h-20">
                      <td className="py-2 px-3 font-mono text-[11px] tabular-nums bg-slate-50 border-r border-slate-200 align-top">
                        <div className="font-bold text-[#14214F]">{m.module}° Módulo</div>
                        <div className="text-slate-400 text-[10px]">{m.time}</div>
                      </td>

                      {days.map((d) => {
                        const slot = courseSchedules.find(
                          (s) => s.dayOfWeek === d.dayNumber && s.module === m.module
                        );
                        const sub = slot ? subjects.find((sb) => sb.id === slot.subjectId) : null;
                        const tch = slot ? teachers.find((t) => t.id === slot.teacherId) : null;

                        return (
                          <td
                            key={d.dayNumber}
                            className="py-1.5 px-2 border-r border-slate-200 align-top hover:bg-slate-50/70 transition-colors"
                          >
                            {slot ? (
                              <div className="h-full p-2 rounded bg-blue-50/70 border border-blue-200 flex flex-col justify-between group relative">
                                <div>
                                  <div className="font-bold text-[#14214F] line-clamp-1 text-[11px]">
                                    {sub?.name || 'Materia'}
                                  </div>
                                  <div className="text-[10px] text-slate-600 line-clamp-1 mt-0.5">
                                    Prof. {tch ? `${tch.lastName}, ${tch.firstName.charAt(0)}.` : 'Docente'}
                                  </div>
                                </div>
                                <div className="text-[9px] text-slate-400 flex items-center justify-between mt-1">
                                  <span>{slot.classroom}</span>
                                  <button
                                    onClick={() => deleteScheduleSlot(slot.id)}
                                    className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Quitar de la grilla"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => openSlotModal(d.dayNumber, m.module)}
                                className="w-full h-full min-h-[50px] border border-dashed border-slate-200 hover:border-[#89743A] rounded flex items-center justify-center text-slate-300 hover:text-[#89743A] transition-colors"
                              >
                                <span className="text-[10px] font-medium">+ Asignar</span>
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Calendar view */
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-600">
              Agenda oficial del ciclo lectivo {activeCycleId}. Comprende actos, PNFP y períodos de examen.
            </div>
            <button
              onClick={() => setIsEventModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#14214F] hover:bg-[#0A1128] text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#D4C08A]" />
              <span>Incorporar Hito / Evento</span>
            </button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
            {events.map((evt) => (
              <div key={evt.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded bg-[#14214F]/5 border border-[#89743A]/20 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] uppercase font-bold text-[#89743A]">
                      {new Date(evt.date + 'T12:00:00Z').toLocaleDateString('es-AR', { month: 'short' })}
                    </span>
                    <span className="text-base font-mono font-bold text-[#14214F]">
                      {evt.date.split('-')[2]}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {evt.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold uppercase tracking-wide">
                        {evt.type.replace('_', ' ')}
                      </span>
                      {evt.isMandatory && (
                        <span className="text-[10px] text-amber-800 font-semibold">
                          · Asistencia Obligatoria
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {evt.description}
                    </p>
                    <div className="text-[11px] text-slate-400 font-mono mt-1">
                      Fecha fijada: {evt.date}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteEvent(evt.id)}
                  className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                  title="Eliminar evento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Slot Modal */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in">
            <div className="px-5 py-4 bg-[#14214F] text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Asignar Cátedra en Grilla Horaria
                </h3>
                <p className="text-xs text-[#D4C08A]">
                  {days.find((d) => d.dayNumber === slotDay)?.name} · {slotModule}° Módulo
                </p>
              </div>
              <button
                onClick={() => setIsSlotModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="p-5 space-y-3.5 text-xs">
              {slotError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{slotError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Espacio Curricular / Materia *
                </label>
                <select
                  value={slotSubjectId}
                  onChange={(e) => setSlotSubjectId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                >
                  {courseSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code} · {s.hoursWeekly} hs sem.)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Docente a Cargo *
                </label>
                <select
                  value={slotTeacherId}
                  onChange={(e) => setSlotTeacherId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      Prof. {t.lastName}, {t.firstName} ({t.title})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Aula / Espacio Físico *
                </label>
                <input
                  type="text"
                  required
                  value={slotClassroom}
                  onChange={(e) => setSlotClassroom(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="px-3 py-2 text-slate-700 hover:bg-slate-100 rounded text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#14214F] hover:bg-[#0A1128] text-white rounded text-xs font-medium transition-colors shadow-xs"
                >
                  Confirmar Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in">
            <div className="px-5 py-4 bg-[#14214F] text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Incorporar Evento al Calendario
                </h3>
                <p className="text-xs text-[#D4C08A]">Ciclo Lectivo {activeCycleId}</p>
              </div>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-5 space-y-3.5 text-xs">
              {eventError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{eventError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Título del Evento / Hito *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Acto del Día de la Soberanía Nacional"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Evento</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as SchoolEvent['type'])}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                  >
                    <option value="JORNADA_INSTITUCIONAL">Jornada PNFP</option>
                    <option value="ACTO_ESCOLAR">Acto Escolar</option>
                    <option value="MESA_EXAMEN">Mesa de Exámenes</option>
                    <option value="CIERRE_NOTAS">Cierre de Calificaciones</option>
                    <option value="FERIADO">Feriado Nacional / Asueto</option>
                    <option value="REUNION_PADRES">Reunión de Tutores</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Descripción / Disposiciones Específicas
                </label>
                <textarea
                  rows={2}
                  placeholder="Indicaciones sobre suspensión de actividades, comisiones evaluadoras..."
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mandatoryCheck"
                  checked={eventMandatory}
                  onChange={(e) => setEventMandatory(e.target.checked)}
                  className="rounded border-slate-300 text-[#14214F]"
                />
                <label htmlFor="mandatoryCheck" className="text-slate-700">
                  Actividad de carácter obligatorio para todo el personal
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-3 py-2 text-slate-700 hover:bg-slate-100 rounded text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#14214F] hover:bg-[#0A1128] text-white rounded text-xs font-medium transition-colors shadow-xs"
                >
                  Guardar Hito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
