import React, { useState, useEffect } from 'react';
import {
  MapTrifold,
  ListDashes,
  MagnifyingGlass,
  CheckCircle,
  Warning,
  XCircle,
  Clock,
  Broom,
  WarningOctagon,
  ArrowsOut,
  ArrowsIn,
  Desktop,
  Plus,
  Trash,
  PencilSimple,
  X,
  CaretRight,
  ShieldWarning,
  Sliders,
  Check,
} from '@phosphor-icons/react';
import { useAuxiliares } from '../context/AuxiliaresContext';
import { Sector, SectorStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { toast } from 'sonner';

export const InstalacionesScreen: React.FC = () => {
  const {
    sectors,
    tasks,
    incidents,
    markSectorClean,
    setCurrentScreen,
    updateSectorLayout,
    addSector,
    removeSector,
    userProfile,
  } = useAuxiliares();

  // Floor selection (PB or P1)
  const [activeFloor, setActiveFloor] = useState<'PB' | 'P1'>('PB');

  // View mode: 'plano' (visual grid) or 'lista' (accessible searchable list)
  const [viewMode, setViewMode] = useState<'plano' | 'lista'>('plano');

  // Selected sector for inspection drawer (se guarda el id: los datos salen siempre de la API)
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const selectedSector = sectors.find((s) => s.id === selectedSectorId) ?? null;
  const setSelectedSector = (sector: Sector | null) => setSelectedSectorId(sector?.id ?? null);
  const [busy, setBusy] = useState(false);

  // Zoom scale for mobile touch map
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Fullscreen / Expanded states
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [isExpandedFallback, setIsExpandedFallback] = useState(false);

  // Modo Monitor (Kiosk for wall display)
  const [isMonitorMode, setIsMonitorMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modo Edición Supervisor ("Permiso a confirmar con la institución")
  const [isEditMode, setIsEditMode] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);

  // New sector form
  const [newSectorCode, setNewSectorCode] = useState('');
  const [newSectorName, setNewSectorName] = useState('');
  const [newSectorColSpan, setNewSectorColSpan] = useState<number>(1);
  const [newSectorRowSpan, setNewSectorRowSpan] = useState<number>(1);

  // List view search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusListFilter, setStatusListFilter] = useState<'todos' | SectorStatus>('todos');

  // Real-time clock for monitor mode
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtered sectors by floor
  const floorSectors = sectors.filter((s) => s.floor === activeFloor);

  // Fullscreen toggle with fallback
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement
          .requestFullscreen()
          .then(() => setIsNativeFullscreen(true))
          .catch(() => setIsExpandedFallback((prev) => !prev));
      } else {
        setIsExpandedFallback((prev) => !prev);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsNativeFullscreen(false));
      }
      setIsExpandedFallback(false);
    }
  };

  // Status counts for legend
  const okCount = sectors.filter((s) => s.status === 'ok').length;
  const maintCount = sectors.filter((s) => s.status === 'mantenimiento').length;
  const outCount = sectors.filter((s) => s.status === 'fuera_servicio').length;

  // Sector inspection details
  const sectorTasks = selectedSector ? tasks.filter((t) => t.sectorId === selectedSector.id) : [];
  const sectorIncidents = selectedSector
    ? incidents.filter((i) => i.sectorId === selectedSector.id && i.status !== 'resuelta')
    : [];

  const handleMarkClean = async (sector: Sector) => {
    setBusy(true);
    const ok = await markSectorClean(sector.id);
    setBusy(false);
    if (!ok) return;
    toast.success('Sector registrado como limpio', {
      description: `Registrado a nombre de ${userProfile.name}. Queda en el historial; no resuelve incidencias activas.`,
    });
  };

  const handleReportFromSector = (sector: Sector) => {
    setCurrentScreen('reportar', { prefilledSectorId: sector.id });
  };

  // Supervisor add sector validation
  const handleAddSectorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newSectorCode.trim().toUpperCase();
    const cleanName = newSectorName.trim();

    if (!cleanCode || !cleanName) {
      toast.error('Completá el código y el nombre del sector');
      return;
    }

    if (sectors.some((s) => s.code && s.code.toLowerCase() === cleanCode.toLowerCase())) {
      toast.error('Ya existe un sector con este código');
      return;
    }

    if (sectors.some((s) => s.name.toLowerCase() === cleanName.toLowerCase())) {
      toast.error('Ya existe un sector con este nombre');
      return;
    }

    setBusy(true);
    const ok = await addSector({
      code: cleanCode,
      name: cleanName,
      floor: activeFloor,
      colSpan: newSectorColSpan,
      rowSpan: newSectorRowSpan,
    });
    setBusy(false);
    if (!ok) return;
    toast.success('Nuevo sector agregado al plano');
    setNewSectorCode('');
    setNewSectorName('');
    setAddModalOpen(false);
  };

  // Supervisor update size
  const handleUpdateSectorSize = async (sec: Sector, colSpan: number, rowSpan: number) => {
    setBusy(true);
    const ok = await updateSectorLayout(sec.id, { ...sec.grid, colSpan, rowSpan });
    setBusy(false);
    if (ok) toast.success(`Tamaño de ${sec.code || sec.name} actualizado a ${colSpan}x${rowSpan}`);
  };

  const handleDeleteSector = async (sec: Sector) => {
    if (!confirm(`¿Eliminar el sector "${sec.name}" del plano?`)) return;
    setBusy(true);
    const ok = await removeSector(sec.id);
    setBusy(false);
    if (!ok) return;
    setSelectedSector(null);
    toast.info('Sector eliminado del plano');
  };

  const formatCleanedTime = (iso?: string) => {
    if (!iso) return 'Sin registro';
    const d = new Date(iso);
    return `${d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })} a las ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs`;
  };

  // Filtered sectors for list view
  const filteredListSectors = sectors.filter((s) => {
    if (statusListFilter !== 'todos' && s.status !== statusListFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.notes && s.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div
      className={`space-y-6 pb-24 lg:pb-12 ${
        isExpandedFallback
          ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900 p-4 overflow-y-auto'
          : ''
      }`}
    >
      {/* ============================================================== */}
      {/* 1. MODO MONITOR (KIOSK DE PORTERÍA / MAESTRANZA)               */}
      {/* ============================================================== */}
      {isMonitorMode && (
        <div className="bg-[#14214F] text-white p-4 rounded-xl border border-[#AF9B63] shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <span className="text-[11px] font-bold text-[#AF9B63] tracking-widest uppercase block">
                Modo Monitor Activo · Pantalla de Guardia
              </span>
              <h2 className="text-xl sm:text-2xl font-mono font-extrabold text-white">
                {currentTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}{' '}
                hs
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-bold">
              ✓ {okCount} Sectores OK
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-500 text-amber-300 font-bold">
              ⚠ {maintCount} En Mantenimiento
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-500 text-red-300 font-bold">
              ✕ {outCount} Fuera de Servicio
            </span>

            <button
              type="button"
              onClick={() => setIsMonitorMode(false)}
              className="touch-target px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold"
            >
              Salir de Modo Monitor
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. HEADER Y CONTROLES DEL PLANO                                */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#C8A14D] uppercase tracking-wider block">
            ISFDyT N° 26 · Edificio Sede
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
            Plano de <span className="text-[#C8A14D]">Instalaciones</span>
          </h1>
          <div className="w-12 h-0.5 bg-[#C8A14D] mt-1" />
        </div>

        {/* Action toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle */}
          <div className="inline-flex p-1 rounded-lg bg-[#0E1730] border border-[#1C2E56]">
            <button
              type="button"
              onClick={() => setViewMode('plano')}
              className={`touch-target px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'plano'
                  ? 'bg-[#18274A] text-white shadow-xs border border-[#263C70]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapTrifold size={16} />
              <span>Plano visual</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('lista')}
              className={`touch-target px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'lista'
                  ? 'bg-[#18274A] text-white shadow-xs border border-[#263C70]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListDashes size={16} />
              <span>Lista por sector</span>
            </button>
          </div>

          {/* Fullscreen / Monitor mode buttons */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="touch-target p-2 rounded-lg border border-[#1C2E56] bg-[#0E1730] text-slate-300 hover:bg-[#132042]"
            title="Pantalla completa"
            aria-label="Alternar pantalla completa"
          >
            {isNativeFullscreen || isExpandedFallback ? <ArrowsIn size={20} /> : <ArrowsOut size={20} />}
          </button>

          <button
            type="button"
            onClick={() => setIsMonitorMode((m) => !m)}
            className={`touch-target px-3 py-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isMonitorMode
                ? 'bg-[#C8A14D] text-[#0A1124] border-[#C8A14D]'
                : 'bg-[#0E1730] border-[#1C2E56] text-slate-300 hover:bg-[#132042]'
            }`}
          >
            <Desktop size={18} />
            <span>Modo Monitor</span>
          </button>

          {/* Modo edición supervisor */}
          <button
            type="button"
            onClick={() => setIsEditMode((e) => !e)}
            className={`touch-target px-3 py-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isEditMode
                ? 'bg-[#C8A14D] text-[#0A1124] border-[#C8A14D]'
                : 'bg-[#0E1730] border-[#1C2E56] text-slate-300 hover:bg-[#132042]'
            }`}
          >
            <Sliders size={18} />
            <span>Editar plano</span>
          </button>
        </div>
      </div>

      {/* Mandatory honesty notice: Plano de ejemplo */}
      <div className="p-3 rounded-lg bg-[#12192E] border border-[#243A6A] flex items-center justify-between gap-3 text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <ShieldWarning size={20} className="text-[#C8A14D] shrink-0" weight="bold" />
          <span className="font-semibold text-slate-200">
            Distribución cargada en el sistema: validar con el plano real del edificio del ISFDyT N° 26.
          </span>
        </div>
        {isEditMode && (
          <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 font-bold uppercase text-[10px]">
            Los permisos los controla el sistema
          </span>
        )}
      </div>

      {/* Floor selector: Planta Baja / Primer Piso */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveFloor('PB')}
            className={`touch-target px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeFloor === 'PB'
                ? 'bg-[#C8A14D] text-[#0A1124] shadow-xs'
                : 'bg-[#0E1730] border border-[#1C2E56] text-slate-300 hover:bg-[#132042]'
            }`}
          >
            Planta Baja (Aulas 1 a 4, SUM, Patios)
          </button>

          <button
            type="button"
            onClick={() => setActiveFloor('P1')}
            className={`touch-target px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeFloor === 'P1'
                ? 'bg-[#C8A14D] text-[#0A1124] shadow-xs'
                : 'bg-[#0E1730] border border-[#1C2E56] text-slate-300 hover:bg-[#132042]'
            }`}
          >
            Primer Piso (Aulas 5 a 12, Laboratorio)
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-[#0E1730] px-3.5 py-2 rounded-lg border border-[#1C2E56]">
          <span className="text-slate-400 font-semibold uppercase text-[11px]">Leyenda:</span>
          <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            OK / Limpio ({okCount})
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            En mant. ({maintCount})
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            Fuera servicio ({outCount})
          </span>
        </div>
      </div>

      {/* Supervisor toolbar when Edit Mode is active */}
      {isEditMode && (
        <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-[#AF9B63] uppercase tracking-wider block">
              Herramienta de Supervisor
            </span>
            <p className="text-xs text-slate-300">
              Modificá tamaños o agregá sectores en el piso {activeFloor}. Los cambios se guardan en el sistema; si tu cuenta no tiene permiso, se te avisa.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="touch-target px-4 py-2 rounded-lg bg-[#89743A] hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus size={16} weight="bold" />
            <span>Agregar nuevo sector</span>
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. VISTA PRINCIPAL: PLANO EN CSS GRID                          */}
      {/* ============================================================== */}
      {viewMode === 'plano' ? (
        <div className="bg-[#0E1730] rounded-xl border border-[#1C2E56] p-4 sm:p-6 shadow-xs space-y-4">
          {/* Zoom controls for mobile gestures */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Tocá cualquier sector para ver detalles o actuar</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
                className="touch-target px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 font-bold"
                aria-label="Reducir zoom del plano"
              >
                -
              </button>
              <span className="font-mono">{Math.round(zoomLevel * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                className="touch-target px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 font-bold"
                aria-label="Aumentar zoom del plano"
              >
                +
              </button>
              {zoomLevel !== 1 && (
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="touch-target px-2 py-1 text-[11px] underline text-[#3F78B6]"
                >
                  Restablecer
                </button>
              )}
            </div>
          </div>

          {/* Grid Container */}
          <div className="overflow-x-auto p-1">
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-[340px] sm:min-w-[620px] transition-transform duration-200 origin-top-left"
              style={{
                transform: `scale(${zoomLevel})`,
              }}
            >
              {floorSectors.map((sector) => {
                const isSelected = selectedSector?.id === sector.id;

                let bgStyle = '';
                let borderStyle = '';
                let iconComponent = CheckCircle;
                let statusLabel = 'OK';

                if (sector.status === 'ok') {
                  bgStyle = 'bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100';
                  borderStyle = 'border-emerald-300 dark:border-emerald-700 hover:border-emerald-500';
                  iconComponent = CheckCircle;
                  statusLabel = 'OK';
                } else if (sector.status === 'mantenimiento') {
                  bgStyle = 'bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100';
                  borderStyle = 'border-amber-300 dark:border-amber-700 hover:border-amber-500';
                  iconComponent = Warning;
                  statusLabel = 'En mant.';
                } else {
                  bgStyle = 'bg-red-50 dark:bg-red-950/40 text-red-950 dark:text-red-100';
                  borderStyle = 'border-red-300 dark:border-red-700 hover:border-red-500';
                  iconComponent = XCircle;
                  statusLabel = 'Clausurado';
                }

                // Grid spans
                const colSpanClass =
                  sector.grid.colSpan === 2
                    ? 'col-span-2'
                    : sector.grid.colSpan === 3
                    ? 'col-span-3'
                    : sector.grid.colSpan === 4
                    ? 'col-span-2 sm:col-span-4'
                    : 'col-span-1';

                const rowSpanClass = sector.grid.rowSpan === 2 ? 'row-span-2' : 'row-span-1';

                const StatusIcon = iconComponent;

                return (
                  <div
                    key={sector.id}
                    onClick={() => setSelectedSector(sector)}
                    className={`touch-target p-3.5 rounded-xl border-2 flex flex-col justify-between gap-2 cursor-pointer transition-all ${colSpanClass} ${rowSpanClass} ${bgStyle} ${borderStyle} ${
                      isSelected
                        ? 'ring-3 ring-[#3F78B6] shadow-md scale-[1.01]'
                        : 'shadow-xs hover:shadow-sm'
                    }`}
                  >
                    {/* Top: code + status icon and text */}
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="font-mono font-bold text-xs bg-white/70 dark:bg-black/30 px-2 py-0.5 rounded border border-black/10">
                        {sector.code}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold">
                        <StatusIcon size={14} weight="fill" />
                        <span>{statusLabel}</span>
                      </span>
                    </div>

                    {/* Middle: Sector name */}
                    <div>
                      <h3 className="font-bold text-sm leading-snug">{sector.name}</h3>
                      {sector.notes && (
                        <p className="text-[11px] opacity-75 line-clamp-1 mt-0.5">
                          {sector.notes}
                        </p>
                      )}
                    </div>

                    {/* Bottom: Last clean info */}
                    <div className="pt-1 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] opacity-80">
                      <span className="truncate">
                        {sector.lastCleanedAt
                          ? `Últ: ${new Date(sector.lastCleanedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs`
                          : 'Sin limpieza registrada'}
                      </span>
                      {isEditMode && (
                        <span className="font-mono text-[10px] font-bold bg-black/10 dark:bg-white/10 px-1 rounded">
                          {sector.grid.colSpan}×{sector.grid.rowSpan}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* 4. VISTA ALTERNATIVA: LISTA POR SECTOR                         */
        /* ============================================================== */
        <div className="space-y-4">
          {/* Search & filter */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlass size={18} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, aula o desperfecto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#3F78B6]"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatusListFilter('todos')}
                className={`touch-target px-3 py-1.5 rounded-lg text-xs font-bold ${
                  statusListFilter === 'todos'
                    ? 'bg-[#14214F] text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setStatusListFilter('ok')}
                className={`touch-target px-3 py-1.5 rounded-lg text-xs font-bold ${
                  statusListFilter === 'ok'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => setStatusListFilter('mantenimiento')}
                className={`touch-target px-3 py-1.5 rounded-lg text-xs font-bold ${
                  statusListFilter === 'mantenimiento'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Mantenim.
              </button>
              <button
                type="button"
                onClick={() => setStatusListFilter('fuera_servicio')}
                className={`touch-target px-3 py-1.5 rounded-lg text-xs font-bold ${
                  statusListFilter === 'fuera_servicio'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Fuera de serv.
              </button>
            </div>
          </div>

          {/* List items */}
          <div className="space-y-3">
            {filteredListSectors.map((sector) => (
              <div
                key={sector.id}
                onClick={() => setSelectedSector(sector)}
                className="touch-target p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between gap-4 cursor-pointer hover:border-[#3F78B6] transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-600">
                    {sector.code}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {sector.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Piso: {sector.floor === 'PB' ? 'Planta Baja' : 'Primer Piso'} · Última limpieza:{' '}
                      {formatCleanedTime(sector.lastCleanedAt)}
                      {sector.lastCleanedBy ? ` por ${sector.lastCleanedBy}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge
                    variant={
                      sector.status === 'ok'
                        ? 'ok'
                        : sector.status === 'mantenimiento'
                        ? 'mantenimiento'
                        : 'fuera_servicio'
                    }
                  />
                  <CaretRight size={18} className="text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. HOJA INFERIOR / PANEL LATERAL: DETALLE DEL SECTOR           */}
      {/* ============================================================== */}
      {selectedSector && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Detalle del sector ${selectedSector.name}`}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-end"
          onClick={() => setSelectedSector(null)}
        >
          <div
            className="w-full sm:max-w-md bg-white dark:bg-slate-900 h-[85vh] sm:h-full rounded-t-2xl sm:rounded-none flex flex-col shadow-2xl p-5 overflow-y-auto space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                    {selectedSector.code}
                  </span>
                  <span className="text-xs text-slate-500">
                    {selectedSector.floor === 'PB' ? 'Planta Baja' : 'Primer Piso'}
                  </span>
                </div>
                <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-slate-100">
                  {selectedSector.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSector(null)}
                className="touch-target p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                aria-label="Cerrar panel de detalle"
              >
                <X size={22} />
              </button>
            </div>

            {/* Estado actual */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Estado operativo del sector
              </span>
              <div className="flex items-center justify-between">
                <StatusBadge
                  variant={
                    selectedSector.status === 'ok'
                      ? 'ok'
                      : selectedSector.status === 'mantenimiento'
                      ? 'mantenimiento'
                      : 'fuera_servicio'
                  }
                  size="lg"
                />
              </div>

              {selectedSector.notes && (
                <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-1">
                  "{selectedSector.notes}"
                </p>
              )}
            </div>

            {/* Última limpieza */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Última limpieza registrada
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {formatCleanedTime(selectedSector.lastCleanedAt)}
              </p>
              {selectedSector.lastCleanedBy && (
                <p className="text-xs text-slate-500">
                  A cargo de: <strong>{selectedSector.lastCleanedBy}</strong>
                </p>
              )}
              {selectedSector.nextTask && (
                <p className="text-xs text-slate-500">
                  Próxima tarea: <strong>{selectedSector.nextTask}</strong>
                </p>
              )}
            </div>

            {/* Tareas de hoy en este sector */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Tareas programadas hoy ({sectorTasks.length})
              </span>
              {sectorTasks.length === 0 ? (
                <p className="text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg">
                  No hay tareas pendientes en este sector hoy.
                </p>
              ) : (
                <div className="space-y-2">
                  {sectorTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {t.title}
                        </span>
                        <span className="text-slate-400 font-mono">{t.scheduledTime} hs</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          t.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t.completed ? 'Completada' : 'Pendiente'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Incidencias activas en este sector */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Incidencias activas ({sectorIncidents.length})
              </span>
              {sectorIncidents.length === 0 ? (
                <p className="text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg">
                  No hay incidencias abiertas en este sector.
                </p>
              ) : (
                <div className="space-y-2">
                  {sectorIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      className="p-3 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <StatusBadge
                          variant={
                            inc.priority === 'alta'
                              ? 'prioridad_alta'
                              : inc.priority === 'media'
                              ? 'prioridad_media'
                              : 'prioridad_baja'
                          }
                          size="sm"
                        />
                        <span className="text-slate-400">Por {inc.reportedBy}</span>
                      </div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {inc.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ACCIONES SEPARADAS */}
            <div className="pt-2 space-y-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Acciones sobre el sector
              </span>

              {/* Acción 1: Marcar limpio */}
              <button
                type="button"
                onClick={() => void handleMarkClean(selectedSector)}
                disabled={busy}
                className="touch-target w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 disabled:opacity-60"
              >
                <Broom size={18} weight="fill" />
                <span>Marcar limpio (actualizar sanitización)</span>
              </button>

              {/* Acción 2: Reportar problema */}
              <button
                type="button"
                onClick={() => handleReportFromSector(selectedSector)}
                className="touch-target w-full py-3 rounded-xl bg-[#89743A] hover:brightness-110 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <WarningOctagon size={18} weight="fill" />
                <span>Reportar problema en este sector</span>
              </button>

              {/* Acción 3: Ver incidencias */}
              {sectorIncidents.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSector(null);
                    setCurrentScreen('incidencias');
                  }}
                  className="touch-target w-full py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 text-center"
                >
                  Ver incidencias de este sector ({sectorIncidents.length})
                </button>
              )}

              {/* Controles de edición de supervisor */}
              {isEditMode && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-[#AF9B63] uppercase tracking-wider block">
                    Modificar tamaño en grilla (Supervisor):
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => handleUpdateSectorSize(selectedSector, 1, 1)}
                      className="touch-target py-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                    >
                      1×1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateSectorSize(selectedSector, 2, 1)}
                      className="touch-target py-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                    >
                      2×1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateSectorSize(selectedSector, 1, 2)}
                      className="touch-target py-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                    >
                      1×2
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateSectorSize(selectedSector, 2, 2)}
                      className="touch-target py-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                    >
                      2×2
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteSector(selectedSector)}
                    className="touch-target w-full py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Trash size={16} />
                    <span>Eliminar este sector del plano</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MODAL AGREGAR SECTOR (SUPERVISOR)                           */}
      {/* ============================================================== */}
      {addModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Agregar sector al plano"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-[#89743A] uppercase tracking-wider">
                  Herramienta de supervisor
                </span>
                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-slate-100">
                  Agregar nuevo sector en {activeFloor === 'PB' ? 'Planta Baja' : 'Primer Piso'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="touch-target p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSectorSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  Código de sector (JetBrains Mono)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: A-13 o DEP-02"
                  value={newSectorCode}
                  onChange={(e) => setNewSectorCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-sm uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  Nombre descriptivo completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Aula 13 - Especialización"
                  value={newSectorName}
                  onChange={(e) => setNewSectorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Ancho (Columnas)
                  </label>
                  <select
                    value={newSectorColSpan}
                    onChange={(e) => setNewSectorColSpan(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm"
                  >
                    <option value={1}>1 columna (Estándar)</option>
                    <option value={2}>2 columnas (Doble)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Alto (Filas)
                  </label>
                  <select
                    value={newSectorRowSpan}
                    onChange={(e) => setNewSectorRowSpan(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm"
                  >
                    <option value={1}>1 fila (Estándar)</option>
                    <option value={2}>2 filas (Doble)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="touch-target flex-1 py-2.5 rounded-lg border border-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="touch-target flex-1 py-2.5 rounded-lg bg-[#89743A] text-white text-xs font-bold shadow-xs hover:brightness-110 disabled:opacity-60"
                >
                  {busy ? 'Guardando…' : 'Guardar sector'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
