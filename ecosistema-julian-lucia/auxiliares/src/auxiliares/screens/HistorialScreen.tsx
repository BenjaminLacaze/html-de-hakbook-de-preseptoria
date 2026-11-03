import React, { useState } from 'react';
import {
  ClockCounterClockwise,
  CheckCircle,
  Warning,
  Broom,
  Wrench,
  MagnifyingGlass,
  MapPin,
  User,
  Funnel,
} from '@phosphor-icons/react';
import { useAuxiliares } from '../context/AuxiliaresContext';
import { HistoryEvent, HistoryEventType } from '../types';
import { isToday, isYesterday, format } from 'date-fns';
import { es } from 'date-fns/locale';

export const HistorialScreen: React.FC = () => {
  const { historyEvents, sectors } = useAuxiliares();

  const [typeFilter, setTypeFilter] = useState<'todos' | HistoryEventType>('todos');
  const [sectorFilter, setSectorFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique responsible names
  const responsibles = Array.from(new Set(historyEvents.map((e) => e.responsibleName)));
  const [responsibleFilter, setResponsibleFilter] = useState<string>('todos');

  // Filter events
  const filteredEvents = historyEvents.filter((event) => {
    if (typeFilter !== 'todos' && event.type !== typeFilter) return false;
    if (sectorFilter !== 'todos' && event.sectorName !== sectorFilter) return false;
    if (responsibleFilter !== 'todos' && event.responsibleName !== responsibleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(q) ||
        event.sectorName.toLowerCase().includes(q) ||
        event.responsibleName.toLowerCase().includes(q) ||
        (event.details && event.details.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Group by day: "Hoy", "Ayer", or formatted date
  const groupedEvents: { groupTitle: string; events: HistoryEvent[] }[] = [];

  filteredEvents.forEach((ev) => {
    const d = new Date(ev.timestamp);
    let groupKey = '';
    if (isToday(d)) {
      groupKey = 'Hoy';
    } else if (isYesterday(d)) {
      groupKey = 'Ayer';
    } else {
      groupKey = format(d, 'dd/MM/yyyy');
    }

    const existingGroup = groupedEvents.find((g) => g.groupTitle === groupKey);
    if (existingGroup) {
      existingGroup.events.push(ev);
    } else {
      groupedEvents.push({ groupTitle: groupKey, events: [ev] });
    }
  });

  const getEventIcon = (type: HistoryEventType) => {
    switch (type) {
      case 'tarea':
        return <CheckCircle size={20} className="text-emerald-600" weight="fill" />;
      case 'incidencia_reportada':
        return <Warning size={20} className="text-red-500" weight="fill" />;
      case 'incidencia_resuelta':
        return <Wrench size={20} className="text-emerald-700" weight="fill" />;
      case 'limpieza':
        return <Broom size={20} className="text-[#3F78B6]" weight="fill" />;
      case 'mantenimiento':
        return <Wrench size={20} className="text-[#89743A]" weight="fill" />;
    }
  };

  const getEventTypeName = (type: HistoryEventType) => {
    switch (type) {
      case 'tarea':
        return 'Tarea completada';
      case 'incidencia_reportada':
        return 'Incidencia reportada';
      case 'incidencia_resuelta':
        return 'Incidencia solucionada';
      case 'limpieza':
        return 'Sanitización registrada';
      case 'mantenimiento':
        return 'Mantenimiento registrado';
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#89743A] uppercase tracking-wider block">
          Auditoría de operaciones
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-slate-100">
          Historial de <span className="text-[#89743A]">Mantenimiento</span>
        </h1>
        <div className="w-12 h-0.5 bg-[#89743A] mt-1" />
      </div>

      {/* Filter and search bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <div className="relative">
          <MagnifyingGlass size={18} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por descripción, sector o auxiliar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#3F78B6]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
          {/* Tipo de evento */}
          <div>
            <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">
              Tipo de acción
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            >
              <option value="todos">Todos los tipos</option>
              <option value="tarea">Tareas completadas</option>
              <option value="incidencia_reportada">Incidencias reportadas</option>
              <option value="incidencia_resuelta">Incidencias resueltas</option>
              <option value="limpieza">Limpiezas registradas</option>
              <option value="mantenimiento">Mantenimiento registrado</option>
            </select>
          </div>

          {/* Sector */}
          <div>
            <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">
              Sector
            </label>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            >
              <option value="todos">Todos los sectores</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Responsable */}
          <div>
            <label className="block font-bold text-slate-500 mb-1 uppercase text-[10px]">
              Responsable
            </label>
            <select
              value={responsibleFilter}
              onChange={(e) => setResponsibleFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            >
              <option value="todos">Todo el personal</option>
              {responsibles.map((resp) => (
                <option key={resp} value={resp}>
                  {resp}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-6">
        {groupedEvents.length === 0 ? (
          <div className="p-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center text-slate-400">
            <ClockCounterClockwise size={40} className="mx-auto mb-2 opacity-40" />
            <p className="font-bold text-sm text-slate-600 dark:text-slate-300">
              No hay eventos en el historial que coincidan con la búsqueda
            </p>
          </div>
        ) : (
          groupedEvents.map((group) => (
            <div key={group.groupTitle} className="space-y-3">
              {/* Day title badge */}
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-sm text-[#14214F] dark:text-sky-300 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                  {group.groupTitle}
                </span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </div>

              {/* Event cards in day */}
              <div className="space-y-2.5">
                {group.events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-start gap-3.5 hover:border-slate-300 transition-all"
                  >
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700 shrink-0 mt-0.5">
                      {getEventIcon(ev.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {getEventTypeName(ev.type)}
                        </span>
                        <span className="font-mono text-xs text-slate-400">
                          {new Date(ev.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          hs
                        </span>
                      </div>

                      <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                        {ev.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-[#3F78B6]" />
                          <span>{ev.sectorName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>Responsable: <strong>{ev.responsibleName}</strong></span>
                        </div>
                      </div>

                      {ev.details && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-1 bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
                          {ev.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
