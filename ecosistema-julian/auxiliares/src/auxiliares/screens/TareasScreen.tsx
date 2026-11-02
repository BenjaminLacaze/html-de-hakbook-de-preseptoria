import React, { useState } from 'react';
import {
  Broom,
  Wrench,
  CheckSquare,
  Clock,
  Plus,
  CheckCircle,
  CaretDown,
  CaretUp,
  MapPin,
  Flame,
  ArrowsClockwise,
  ArrowRight,
  X,
  MagnifyingGlass,
  Check,
  Buildings,
  Info,
  WarningOctagon,
  MapTrifold,
  ShieldCheck,
} from '@phosphor-icons/react';
import { useAuxiliares, todayISO } from '../context/AuxiliaresContext';
import { Task, TaskType } from '../types';
import { shiftTimeLabel } from '../api';
import { StatusBadge } from '../components/StatusBadge';
import { toast } from 'sonner';

export const TareasScreen: React.FC = () => {
  const {
    tasks,
    toggleTaskComplete,
    createTask,
    incidents,
    shifts,
    userProfile,
    setCurrentScreen,
    sectors,
    setActivePhotoViewerUrl,
  } = useAuxiliares();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [completedCollapsed, setCompletedCollapsed] = useState(true);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newSectorId, setNewSectorId] = useState(sectors[0]?.id || '');
  const [newLocation, setNewLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [newType, setNewType] = useState<TaskType>('limpieza');
  const [newTime, setNewTime] = useState('11:00');
  const [newNotes, setNewNotes] = useState('');
  const [sectorSearch, setSectorSearch] = useState('');

  // Calculations
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Next task (first pending sorted by time)
  const sortedPending = [...pendingTasks].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  const nextTaskId = sortedPending[0]?.id;

  // High priority open incidents
  const openIncidents = incidents.filter((i) => i.status !== 'resuelta');
  const highPriorityOpenIncidents = openIncidents.filter((i) => i.priority === 'alta');

  // Turno de hoy según el cronograma cargado por Dirección (puede no haber).
  const today = todayISO();
  const todayShift = shifts.find(
    (s) => s.date === today && (s.type === 'normal' || s.type === 'cambio')
  );
  const nowHHmm = new Date().toTimeString().slice(0, 5);
  const onDutyNow = Boolean(
    todayShift &&
      (todayShift.startTime ?? '00:00') <= nowHHmm &&
      nowHHmm < (todayShift.endTime ?? '24:00')
  );
  const shiftLabel = todayShift
    ? (todayShift.startTime ?? '00:00') < '13:00'
      ? 'TURNO MAÑANA'
      : 'TURNO TARDE'
    : 'SIN TURNO CARGADO HOY';
  const firstName = userProfile.firstName || userProfile.name.split(' ')[0];

  // Sector status summary
  const okSectorsCount = sectors.filter((s) => s.status === 'ok').length;
  const totalSectorsCount = sectors.length;

  const handleToggleTask = async (task: Task) => {
    const result = await toggleTaskComplete(task.id);
    if (!result) return;
    if (!task.completed) {
      toast.success('Listo, tarea completada', {
        description: `${task.title} en ${task.sectorName}`,
        action: {
          label: 'Deshacer',
          onClick: () => {
            void result.undo().then(() => toast.info('Se deshizo la acción'));
          },
        },
      });
    } else {
      toast.info('Tarea marcada como pendiente');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim().length < 2) {
      toast.error('Por favor ingresá un título para la tarea');
      return;
    }
    if (!newSectorId && !newLocation.trim()) {
      toast.error('Indicá el sector o el lugar de la tarea');
      return;
    }
    setSaving(true);
    const ok = await createTask({
      title: newTitle.trim(),
      sectorId: newSectorId || undefined,
      location: newSectorId ? undefined : newLocation.trim(),
      type: newType,
      scheduledTime: newTime,
      notes: newNotes.trim() || undefined,
    });
    setSaving(false);
    if (!ok) return;
    toast.success('Tarea programada con éxito', {
      description: 'Quedó en la jornada de hoy.',
    });
    setNewTitle('');
    setNewNotes('');
    setNewLocation('');
    setCreateModalOpen(false);
  };

  const getTypeIcon = (type: TaskType) => {
    switch (type) {
      case 'limpieza':
        return <Broom size={18} className="text-emerald-400" weight="fill" />;
      case 'mantenimiento':
        return <Wrench size={18} className="text-[#C8A14D]" weight="fill" />;
      case 'rutina':
        return <CheckSquare size={18} className="text-sky-400" weight="fill" />;
    }
  };

  const getTypeName = (type: TaskType) => {
    switch (type) {
      case 'limpieza':
        return 'Limpieza';
      case 'mantenimiento':
        return 'Mantenim.';
      case 'rutina':
        return 'Rutina';
    }
  };

  // Filtered sectors for search
  const filteredSectors = sectors.filter((s) =>
    s.name.toLowerCase().includes(sectorSearch.toLowerCase()) ||
    s.code.toLowerCase().includes(sectorSearch.toLowerCase())
  );
  const floorLabel = (floor: string) => (floor === 'PB' ? 'Planta Baja' : 'Primer Piso');

  return (
    <div className="space-y-6 pb-24 lg:pb-12 text-slate-100">
      {/* ============================================================== */}
      {/* 1. WELCOME SECTION (Exactly as in Reference Image 2)           */}
      {/* ============================================================== */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="space-y-1">
          <div className="text-[11px] font-bold text-[#C8A14D] tracking-widest uppercase">
            JORNADA {new Date().getFullYear()} · {shiftLabel}
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-white">
            ¡Buen día, <span className="text-[#C8A14D]">{firstName}</span>!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Acá tenés el estado actualizado de tu turno, tareas asignadas, incidencias y sectores en el ISFDyT N° 26.
          </p>
        </div>

        {/* Quick action button (Dorado ocre, matching Image 2 action button) */}
        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="touch-target px-4 py-2.5 rounded-lg bg-[#C8A14D] hover:brightness-110 active:brightness-95 text-[#0A1124] font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={18} weight="bold" />
            <span>Programar tarea</span>
          </button>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. HERO CARD (Asignación del Auxiliar + Avance del Día)        */}
      {/* ============================================================== */}
      <section className="rounded-2xl bg-[#0E1730] border border-[#1C2E56] p-5 sm:p-7 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: User assignment identity */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#172545] text-[#C8A14D] border border-[#243A6A]">
                <Buildings size={22} weight="bold" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                SERVICIOS GENERALES · SEDE CENTRAL
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
              {userProfile.name} · {userProfile.roleLabel}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {todayShift ? (
                <>
                  Horario de hoy:{' '}
                  <strong className="text-white font-mono">{shiftTimeLabel(todayShift)} hs</strong>.
                </>
              ) : (
                'No tenés un turno cargado para hoy en el cronograma.'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-slate-400 pt-1">
              <span>{userProfile.email}</span>
              <span>·</span>
              <span className={onDutyNow ? 'text-emerald-400 font-bold' : 'text-slate-400 font-bold'}>
                CONDICIÓN: {onDutyNow ? 'EN TURNO' : 'FUERA DE TURNO'}
              </span>
            </div>
          </div>

          {/* Right: Avance del Día Subcard (Image 2 style widget) */}
          <div className="lg:w-80 p-4 rounded-xl bg-[#132042] border border-[#243A6A] space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                AVANCE DEL DÍA
              </span>
              <Info size={16} className="text-slate-400" />
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-heading font-extrabold text-white">
                {progressPercent}%
              </span>
              <span className="text-xs font-semibold text-[#C8A14D]">
                {completedTasks.length} de {totalTasks} tareas
              </span>
            </div>

            {/* Linear Progress Bar */}
            <div className="w-full bg-[#0A1124] h-2 rounded-full overflow-hidden border border-[#243A6A]">
              <div
                className="bg-[#C8A14D] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-400">
              {pendingTasks.length > 0
                ? `${pendingTasks.length} restantes para completar la jornada.`
                : '¡Excelente! Todas las tareas fueron cumplidas.'}
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. GRID DE 4 KPIS (Exacto diseño horizontal de la Imagen 2)   */}
      {/* ============================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Métricas del día">
        {/* KPI 1: Tareas pendientes */}
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('lista-tareas');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="p-4 sm:p-5 rounded-xl bg-[#0E1730] border border-[#1C2E56] hover:border-[#3F78B6] transition-all text-left flex flex-col justify-between shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between w-full">
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <CheckCircle size={22} weight="bold" />
            </div>
            <Info size={16} className="text-slate-500 group-hover:text-slate-300" />
          </div>

          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-heading font-extrabold text-white block">
              {pendingTasks.length}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mt-1">
              TAREAS PENDIENTES
            </span>
            <span className="text-[11px] text-slate-500 block">
              de {totalTasks} programadas hoy
            </span>
          </div>
        </button>

        {/* KPI 2: Incidencias abiertas */}
        <button
          type="button"
          onClick={() => setCurrentScreen('incidencias', { filter: 'abiertas' })}
          className={`p-4 sm:p-5 rounded-xl border transition-all text-left flex flex-col justify-between shadow-xs cursor-pointer group ${
            highPriorityOpenIncidents.length > 0
              ? 'bg-[#181122] border-red-500/60 hover:border-red-400'
              : 'bg-[#0E1730] border-[#1C2E56] hover:border-[#3F78B6]'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="p-2 rounded-lg bg-red-950/60 border border-red-500/40 text-red-400">
              <Flame size={22} weight="bold" />
            </div>
            {highPriorityOpenIncidents.length > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 uppercase">
                {highPriorityOpenIncidents.length} Urgente
              </span>
            )}
          </div>

          <div className="mt-4">
            <span
              className={`text-3xl sm:text-4xl font-heading font-extrabold block ${
                highPriorityOpenIncidents.length > 0 ? 'text-red-400' : 'text-white'
              }`}
            >
              {openIncidents.length}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mt-1">
              INCIDENCIAS ABIERTAS
            </span>
            <span className="text-[11px] text-slate-500 block">
              {highPriorityOpenIncidents.length > 0
                ? 'Requieren atención urgente'
                : 'En seguimiento operativo'}
            </span>
          </div>
        </button>

        {/* KPI 3: Turno de hoy */}
        <button
          type="button"
          onClick={() => setCurrentScreen('turnos')}
          className="p-4 sm:p-5 rounded-xl bg-[#0E1730] border border-[#1C2E56] hover:border-[#3F78B6] transition-all text-left flex flex-col justify-between shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between w-full">
            <div className="p-2 rounded-lg bg-sky-950/60 border border-sky-500/40 text-sky-400">
              <Clock size={22} weight="bold" />
            </div>
            {onDutyNow && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 uppercase">
                Activo
              </span>
            )}
          </div>

          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white block">
              {todayShift ? shiftTimeLabel(todayShift) : '—'}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mt-1">
              TURNO DE HOY
            </span>
            <span className="text-[11px] text-slate-500 block">
              {todayShift ? (onDutyNow ? 'En curso' : 'Fuera de horario') : 'Sin turno cargado'}
            </span>
          </div>
        </button>

        {/* KPI 4: Sectores habilitados */}
        <button
          type="button"
          onClick={() => setCurrentScreen('plano')}
          className="p-4 sm:p-5 rounded-xl bg-[#0E1730] border border-[#1C2E56] hover:border-[#3F78B6] transition-all text-left flex flex-col justify-between shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between w-full">
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/40 text-[#C8A14D]">
              <MapTrifold size={22} weight="bold" />
            </div>
            <Info size={16} className="text-slate-500 group-hover:text-slate-300" />
          </div>

          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-heading font-extrabold text-white block">
              {okSectorsCount} / {totalSectorsCount}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mt-1">
              SECTORES OK
            </span>
            <span className="text-[11px] text-slate-500 block">
              {totalSectorsCount - okSectorsCount} en mantenimiento o revisión
            </span>
          </div>
        </button>
      </section>

      {/* ============================================================== */}
      {/* 4. DOS COLUMNAS PRINCIPALES (Tareas del Día & Incidencias)     */}
      {/* ============================================================== */}
      <div id="lista-tareas" className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Columna Izquierda: TAREAS DEL DÍA */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-[#1C2E56]">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-white uppercase tracking-wider">
                PRÓXIMAS TAREAS DEL DÍA
              </h3>
              <p className="text-xs text-slate-400">
                Rutinas y requerimientos para tu turno
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="text-xs font-bold text-[#C8A14D] hover:underline flex items-center gap-1"
            >
              <span>+ Nueva</span>
            </button>
          </div>

          {/* Pending Tasks */}
          {sortedPending.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#0E1730] border border-[#1C2E56] text-center space-y-2">
              <CheckCircle size={36} className="mx-auto text-emerald-400" weight="fill" />
              <p className="text-sm font-bold text-white">¡No tenés tareas pendientes!</p>
              <p className="text-xs text-slate-400">
                Todas las rutinas de tu turno fueron completadas.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedPending.map((task) => {
                const isNext = task.id === nextTaskId;
                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isNext
                        ? 'bg-[#121E3E] border-l-4 border-l-[#C8A14D] border-[#1E3362] shadow-sm'
                        : 'bg-[#0E1730] border-[#1C2E56] hover:border-[#284074]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-[#172545] border border-[#243A6A] shrink-0 mt-0.5">
                        {getTypeIcon(task.type)}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {isNext && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#C8A14D]/20 text-[#C8A14D] border border-[#C8A14D]/40 uppercase">
                              Siguiente
                            </span>
                          )}
                          <span className="text-[11px] font-mono font-bold text-sky-300 bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-800">
                            {task.scheduledTime} hs
                          </span>
                          <span className="text-xs text-slate-400">
                            {getTypeName(task.type)}
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-white">
                          {task.title}
                        </h4>

                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <MapPin size={14} className="text-[#3F78B6] shrink-0" weight="fill" />
                          <span>{task.sectorName}</span>
                        </div>

                        {task.notes && (
                          <p className="text-xs text-slate-400 italic pt-0.5">
                            "{task.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Button Completar */}
                    <div className="pt-2 sm:pt-0 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task)}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#18274A] hover:bg-emerald-600 border border-[#284074] hover:border-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                      >
                        <Check size={16} weight="bold" />
                        <span>Completar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Completed collapsible */}
          {completedTasks.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCompletedCollapsed((c) => !c)}
                className="w-full py-2 px-3 rounded-lg bg-[#0E1730] border border-[#1C2E56] text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center justify-between hover:bg-[#132042] transition-colors"
              >
                <span>Tareas completadas hoy ({completedTasks.length})</span>
                {completedCollapsed ? <CaretDown size={16} /> : <CaretUp size={16} />}
              </button>

              {!completedCollapsed && (
                <div className="space-y-2 mt-2">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-lg bg-[#0A1124] border border-[#1C2E56] opacity-60 hover:opacity-100 transition-opacity flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle size={18} className="text-emerald-500 shrink-0" weight="fill" />
                        <div>
                          <p className="font-medium line-through text-slate-300">
                            {task.title}
                          </p>
                          <span className="text-slate-500 font-mono text-[11px]">
                            {task.sectorName} · {task.scheduledTime} hs
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task)}
                        className="text-slate-400 hover:text-white underline text-[11px]"
                      >
                        Reabrir
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Columna Derecha: INCIDENCIAS RECIENTES EN SEGUIMIENTO */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-[#1C2E56]">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-white uppercase tracking-wider">
                INCIDENCIAS RECIENTES
              </h3>
              <p className="text-xs text-slate-400">
                Reportes y desperfectos en seguimiento
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentScreen('incidencias')}
              className="text-xs font-bold text-[#C8A14D] hover:underline flex items-center gap-1"
            >
              <span>Ver todas →</span>
            </button>
          </div>

          {openIncidents.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#0E1730] border border-[#1C2E56] text-center space-y-2">
              <CheckCircle size={36} className="mx-auto text-emerald-400" weight="fill" />
              <p className="text-sm font-bold text-white">No hay incidencias abiertas</p>
              <p className="text-xs text-slate-400">
                Todos los sectores del edificio se encuentran operativos.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {openIncidents.slice(0, 3).map((incident) => (
                <div
                  key={incident.id}
                  className="p-4 rounded-xl bg-[#0E1730] border border-[#1C2E56] hover:border-[#284074] transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge
                          variant={
                            incident.priority === 'alta'
                              ? 'prioridad_alta'
                              : incident.priority === 'media'
                              ? 'prioridad_media'
                              : 'prioridad_baja'
                          }
                          size="sm"
                        />
                        {incident.currentSectorStatus && incident.currentSectorStatus !== 'ok' && (
                          <span className="text-[11px] font-mono text-slate-400">
                            {incident.currentSectorStatus === 'fuera_servicio'
                              ? 'Sector clausurado'
                              : 'Sector en mant.'}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <MapPin size={15} className="text-[#3F78B6]" weight="fill" />
                        <span>{incident.sectorName}</span>
                      </h4>
                    </div>

                    {incident.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setActivePhotoViewerUrl(incident.photoUrl!)}
                        className="w-14 h-12 rounded-lg overflow-hidden border border-[#1C2E56] bg-slate-900 shrink-0"
                        title="Ver foto"
                      >
                        <img
                          src={incident.photoUrl}
                          alt="Foto"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {incident.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#162444] text-[11px] text-slate-400">
                    <span>Reportado por: <strong>{incident.reportedBy}</strong></span>
                    <button
                      type="button"
                      onClick={() => setCurrentScreen('incidencias')}
                      className="text-[#C8A14D] hover:underline font-bold"
                    >
                      Gestionar estado
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick link to floor plan */}
          <div className="p-4 rounded-xl bg-[#132042] border border-[#243A6A] flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <MapTrifold size={22} className="text-[#C8A14D]" weight="bold" />
              <div>
                <p className="font-bold text-white">¿Revisar estado en el plano?</p>
                <p className="text-slate-400 text-[11px]">Consultá la planta baja y el primer piso.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCurrentScreen('plano')}
              className="px-3 py-1.5 rounded-lg bg-[#1C2E56] hover:bg-[#284074] text-white font-bold"
            >
              Abrir plano
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. MODAL CREAR TAREA                                           */}
      {/* ============================================================== */}
      {createModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Programar nueva tarea"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#0E1730] border border-[#1C2E56] rounded-2xl shadow-2xl p-6 text-white space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1C2E56]">
              <div>
                <span className="text-[10px] font-bold text-[#C8A14D] uppercase tracking-wider block">
                  REGISTRO OPERATIVO
                </span>
                <h3 className="font-heading font-bold text-lg text-white">
                  Programar nueva tarea
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Título o acción <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Reposición de tizas y borradores"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A1124] border border-[#1C2E56] text-white text-sm focus:border-[#3F78B6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                  Tipo de tarea
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('limpieza')}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer ${
                      newType === 'limpieza'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                        : 'bg-[#0A1124] border-[#1C2E56] text-slate-400'
                    }`}
                  >
                    <Broom size={18} weight="fill" className="text-emerald-400" />
                    <span>Limpieza</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewType('mantenimiento')}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer ${
                      newType === 'mantenimiento'
                        ? 'bg-amber-950/80 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                        : 'bg-[#0A1124] border-[#1C2E56] text-slate-400'
                    }`}
                  >
                    <Wrench size={18} weight="fill" className="text-[#C8A14D]" />
                    <span>Mantenim.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewType('rutina')}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer ${
                      newType === 'rutina'
                        ? 'bg-sky-950/80 border-sky-500 text-sky-300 ring-1 ring-sky-500'
                        : 'bg-[#0A1124] border-[#1C2E56] text-slate-400'
                    }`}
                  >
                    <CheckSquare size={18} weight="fill" className="text-sky-400" />
                    <span>Rutina</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Sector del edificio
                </label>
                <div className="relative mb-2">
                  <MagnifyingGlass size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar aula o sector..."
                    value={sectorSearch}
                    onChange={(e) => setSectorSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0A1124] border border-[#1C2E56] text-xs text-white"
                  />
                </div>
                <select
                  value={newSectorId}
                  onChange={(e) => setNewSectorId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A1124] border border-[#1C2E56] text-white text-xs font-semibold"
                >
                  {filteredSectors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code ? `[${s.code}] ` : ''}
                      {s.name} ({floorLabel(s.floor)})
                    </option>
                  ))}
                  <option value="">Otro lugar (fuera del plano)</option>
                </select>
                {!newSectorId && (
                  <input
                    type="text"
                    placeholder="Ej: Vereda de entrada"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="mt-2 w-full px-3.5 py-2 rounded-lg bg-[#0A1124] border border-[#1C2E56] text-white text-xs"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Hora programada (HH:mm)
                </label>
                <input
                  type="time"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0A1124] border border-[#1C2E56] text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Indicaciones adicionales (opcional)
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Detalles específicos..."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0A1124] border border-[#1C2E56] text-white text-xs"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg border border-[#1C2E56] text-slate-300 text-xs font-bold hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg bg-[#C8A14D] hover:brightness-110 text-[#0A1124] text-xs font-bold shadow-md cursor-pointer disabled:opacity-60"
                >
                  {saving ? 'Guardando…' : 'Guardar tarea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
