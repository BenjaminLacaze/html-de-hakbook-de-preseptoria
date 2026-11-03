import React, { useState } from 'react';
import {
  WarningOctagon,
  Plus,
  Flame,
  Clock,
  CheckCircle,
  MapPin,
  User,
  Camera,
  ArrowsClockwise,
  Check,
  X,
  Buildings,
} from '@phosphor-icons/react';
import { useAuxiliares } from '../context/AuxiliaresContext';
import { Incident, IncidentPriority, IncidentStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { FilterChip } from '../components/FilterChip';
import { toast } from 'sonner';

export const IncidenciasScreen: React.FC = () => {
  const {
    incidents,
    updateIncidentStatus,
    setCurrentScreen,
    setActivePhotoViewerUrl,
    screenParams,
  } = useAuxiliares();

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>(
    screenParams?.filter === 'abiertas' ? 'abiertas' : 'todas'
  );
  const [priorityFilter, setPriorityFilter] = useState<string>('todas');

  // Modal for resolving: "¿El sector vuelve a estar en condiciones?"
  const [resolvingIncident, setResolvingIncident] = useState<Incident | null>(null);

  // Filter logic
  const filtered = incidents.filter((inc) => {
    if (statusFilter === 'abiertas' && inc.status !== 'abierta') return false;
    if (statusFilter === 'en_progreso' && inc.status !== 'en_progreso') return false;
    if (statusFilter === 'resueltas' && inc.status !== 'resuelta') return false;

    if (priorityFilter !== 'todas' && inc.priority !== priorityFilter) return false;

    return true;
  });

  // Sort: Abiertas -> En progreso -> Resueltas; inside each, newest to oldest
  const statusWeight: Record<IncidentStatus, number> = {
    abierta: 1,
    en_progreso: 2,
    resuelta: 3,
  };

  const sortedIncidents = [...filtered].sort((a, b) => {
    if (statusWeight[a.status] !== statusWeight[b.status]) {
      return statusWeight[a.status] - statusWeight[b.status];
    }
    return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
  });

  // Counters
  const countTotal = incidents.length;
  const countAbiertas = incidents.filter((i) => i.status === 'abierta').length;
  const countEnProgreso = incidents.filter((i) => i.status === 'en_progreso').length;
  const countResueltas = incidents.filter((i) => i.status === 'resuelta').length;

  const countAlta = incidents.filter((i) => i.priority === 'alta').length;
  const countMedia = incidents.filter((i) => i.priority === 'media').length;
  const countBaja = incidents.filter((i) => i.priority === 'baja').length;

  const [busyId, setBusyId] = useState<string | null>(null);

  const handleStatusChangeClick = async (incident: Incident, targetStatus: IncidentStatus) => {
    if (incident.status === targetStatus || busyId) return;

    if (targetStatus === 'resuelta') {
      // Trigger confirmation dialog for sector condition
      setResolvingIncident(incident);
    } else {
      setBusyId(incident.id);
      const ok = await updateIncidentStatus(incident.id, targetStatus);
      setBusyId(null);
      if (ok) {
        toast.success(
          targetStatus === 'en_progreso' ? 'Incidencia en progreso' : 'Incidencia reabierta'
        );
      }
    }
  };

  const handleConfirmResolution = async (restoreSector: boolean) => {
    if (!resolvingIncident) return;
    const target = resolvingIncident;
    setResolvingIncident(null);
    setBusyId(target.id);
    const ok = await updateIncidentStatus(target.id, 'resuelta', restoreSector);
    setBusyId(null);
    if (!ok) return;
    toast.success('Incidencia resuelta con éxito', {
      description: restoreSector
        ? target.sectorId
          ? `${target.sectorName} quedó en OK en el plano.`
          : `${target.sectorName} no está en el plano: no hay estado que restablecer.`
        : `${target.sectorName} continúa en estado especial para revisión.`,
    });
  };

  const formatRelativeTime = (iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const diffMin = Math.round(diffMs / 60000);
    if (diffMin < 1) return 'Recién';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    const diffDays = Math.round(diffHours / 24);
    return `Hace ${diffDays} d`;
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#C8A14D] uppercase tracking-wider block">
            Mantenimiento e infraestructura
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
            Gestión de <span className="text-[#C8A14D]">Incidencias</span>
          </h1>
          <div className="w-12 h-0.5 bg-[#C8A14D] mt-1" />
        </div>

        <button
          type="button"
          onClick={() => setCurrentScreen('reportar')}
          className="touch-target px-4 py-2.5 rounded-lg bg-[#C8A14D] hover:brightness-110 active:brightness-95 text-[#0A1124] font-bold text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus size={18} weight="bold" />
          <span>Reportar nueva incidencia</span>
        </button>
      </div>

      {/* Filter Chips Bar */}
      <div className="space-y-3 bg-[#0E1730] p-4 rounded-xl border border-[#1C2E56] shadow-xs">
        {/* Status filters */}
        <div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            Estado de resolución
          </span>
          <div className="flex flex-wrap gap-2">
            <FilterChip
              label="Todas"
              count={countTotal}
              active={statusFilter === 'todas'}
              onClick={() => setStatusFilter('todas')}
            />
            <FilterChip
              label="Abiertas"
              count={countAbiertas}
              active={statusFilter === 'abiertas'}
              onClick={() => setStatusFilter('abiertas')}
            />
            <FilterChip
              label="En progreso"
              count={countEnProgreso}
              active={statusFilter === 'en_progreso'}
              onClick={() => setStatusFilter('en_progreso')}
            />
            <FilterChip
              label="Resueltas"
              count={countResueltas}
              active={statusFilter === 'resueltas'}
              onClick={() => setStatusFilter('resueltas')}
            />
          </div>
        </div>

        {/* Priority filters */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            Prioridad de atención
          </span>
          <div className="flex flex-wrap gap-2">
            <FilterChip
              label="Todas las prioridades"
              active={priorityFilter === 'todas'}
              onClick={() => setPriorityFilter('todas')}
            />
            <FilterChip
              label="Alta"
              count={countAlta}
              active={priorityFilter === 'alta'}
              onClick={() => setPriorityFilter('alta')}
            />
            <FilterChip
              label="Media"
              count={countMedia}
              active={priorityFilter === 'media'}
              onClick={() => setPriorityFilter('media')}
            />
            <FilterChip
              label="Baja"
              count={countBaja}
              active={priorityFilter === 'baja'}
              onClick={() => setPriorityFilter('baja')}
            />
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        {sortedIncidents.length === 0 ? (
          <div className="p-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-2">
            <CheckCircle size={44} className="mx-auto text-emerald-600" weight="fill" />
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">
              No hay incidencias que coincidan con los filtros
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Probá restableciendo los filtros de estado o prioridad para ver todas las novedades registradas.
            </p>
          </div>
        ) : (
          sortedIncidents.map((incident) => {
            const isResolved = incident.status === 'resuelta';

            return (
              <div
                key={incident.id}
                className={`p-4 sm:p-5 rounded-xl border transition-all ${
                  isResolved
                    ? 'bg-[#0A1124] border-[#1C2E56] opacity-75 hover:opacity-100'
                    : incident.priority === 'alta'
                    ? 'bg-[#151B2E] border-l-4 border-l-red-500 border-[#1C2E56] shadow-sm'
                    : 'bg-[#0E1730] border-[#1C2E56] shadow-xs hover:border-[#243A6A]'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Priority badge */}
                      <StatusBadge
                        variant={
                          incident.priority === 'alta'
                            ? 'prioridad_alta'
                            : incident.priority === 'media'
                            ? 'prioridad_media'
                            : 'prioridad_baja'
                        }
                      />

                      {/* Sector condition tag */}
                      {incident.currentSectorStatus && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#132042] text-slate-300 border border-[#22355F]">
                          {incident.currentSectorStatus === 'fuera_servicio'
                            ? 'Sector clausurado'
                            : incident.currentSectorStatus === 'mantenimiento'
                            ? 'Sector en mantenimiento'
                            : 'Sector en uso'}
                        </span>
                      )}

                      <span className="text-xs font-mono text-slate-400">
                        {formatRelativeTime(incident.reportedAt)}
                      </span>
                    </div>

                    {/* Sector name */}
                    <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                      <MapPin size={17} className="text-[#3F78B6] shrink-0" weight="fill" />
                      <span>{incident.sectorName}</span>
                    </div>

                    {/* Description */}
                    <p className="text-base text-slate-200 leading-relaxed font-medium">
                      {incident.description}
                    </p>

                    {/* Meta info: reporter and notes */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>Reportado por: <strong>{incident.reportedBy}</strong></span>
                      </div>
                      {incident.resolvedBy && (
                        <span>
                          · Resuelto por: <strong>{incident.resolvedBy}</strong>
                        </span>
                      )}
                    </div>

                    {incident.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-700/50 p-2 rounded border border-slate-200 dark:border-slate-700">
                        Nota técnica: {incident.notes}
                      </p>
                    )}
                  </div>

                  {/* Right photo thumbnail */}
                  {incident.photoUrl && (
                    <div className="shrink-0 flex flex-col items-start sm:items-end">
                      <button
                        type="button"
                        onClick={() => setActivePhotoViewerUrl(incident.photoUrl!)}
                        className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 w-28 h-20 bg-slate-100 block"
                        aria-label="Ver foto ampliada de la incidencia"
                      >
                        <img
                          src={incident.photoUrl}
                          alt="Evidencia fotográfica"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold gap-1">
                          <Camera size={16} />
                          <span>Ampliar</span>
                        </div>
                      </button>
                      <span className="text-[10px] text-slate-400 mt-1">
                        Tocá para ver en grande
                      </span>
                    </div>
                  )}
                </div>

                {/* Segmented Control for State Change */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Estado operativo:
                    </span>

                    {/* Segmented control */}
                    <div
                      role="radiogroup"
                      aria-label="Modificar estado de incidencia"
                      aria-busy={busyId === incident.id}
                      className={`${busyId === incident.id ? 'opacity-60 pointer-events-none ' : ''}inline-flex p-1 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 max-w-md w-full sm:w-auto`}
                    >
                      <button
                        type="button"
                        role="radio"
                        aria-checked={incident.status === 'abierta'}
                        onClick={() => handleStatusChangeClick(incident, 'abierta')}
                        className={`touch-target flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                          incident.status === 'abierta'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                        }`}
                      >
                        Abierta
                      </button>

                      <button
                        type="button"
                        role="radio"
                        aria-checked={incident.status === 'en_progreso'}
                        onClick={() => handleStatusChangeClick(incident, 'en_progreso')}
                        className={`touch-target flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                          incident.status === 'en_progreso'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                        }`}
                      >
                        En progreso
                      </button>

                      <button
                        type="button"
                        role="radio"
                        aria-checked={incident.status === 'resuelta'}
                        onClick={() => handleStatusChangeClick(incident, 'resuelta')}
                        className={`touch-target flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                          incident.status === 'resuelta'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                        }`}
                      >
                        Resuelta
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ============================================================== */}
      {/* RESOLUTION VERIFICATION MODAL                                  */}
      {/* "¿El sector vuelve a estar en condiciones? (Sí / No)"           */}
      {/* ============================================================== */}
      {resolvingIncident && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar resolución de incidencia"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
                <CheckCircle size={28} weight="fill" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Verificación de seguridad
                </span>
                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-slate-100">
                  ¿El sector vuelve a estar en condiciones?
                </h3>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Estás por marcar como resuelta la incidencia en{' '}
              <strong>{resolvingIncident.sectorName}</strong>.
            </p>

            <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-200 space-y-1">
              <p className="font-bold">Regla del plano:</p>
              <p>
                • Si elegís <strong>"Sí, reestablecer a OK"</strong>: el sector se coloreará como
                apto y limpio en el plano del edificio.
              </p>
              <p>
                • Si elegís <strong>"No, mantener en observación"</strong>: la incidencia quedará
                cerrada pero el sector seguirá señalado en mantenimiento.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmResolution(false)}
                className="touch-target w-full sm:flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                No, mantener aviso
              </button>
              <button
                type="button"
                onClick={() => handleConfirmResolution(true)}
                className="touch-target w-full sm:flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs"
              >
                Sí, reestablecer a OK
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setResolvingIncident(null)}
                className="touch-target text-xs text-slate-400 hover:text-slate-600 underline"
              >
                Cancelar y volver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
