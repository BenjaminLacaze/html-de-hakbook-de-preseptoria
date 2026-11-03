import React, { useEffect, useState } from 'react';
import {
  CalendarBlank,
  CaretLeft,
  CaretRight,
  Clock,
  User,
  ArrowsLeftRight,
  Sparkle,
  CheckCircle,
  Info,
} from '@phosphor-icons/react';
import { useAuxiliares } from '../context/AuxiliaresContext';
import { StatusBadge } from '../components/StatusBadge';
import { api, errorMessage, shiftTimeLabel, type StaffShiftDTO } from '../api';
import type { Shift } from '../types';
import { format, addWeeks, subWeeks, isToday, parseISO, startOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

type DayCard = {
  date: string;
  dayName: string;
  fullDate: Date;
  isCurrentDay: boolean;
  /** Sin turno cargado ese día en el cronograma. */
  empty: boolean;
  type: Shift['type'];
  timeLabel: string;
  swappedWith?: string;
  colleagues: string[];
  notes?: string;
};

export const TurnosScreen: React.FC = () => {
  const { setCurrentScreen, mapMyShifts, shiftsVersion } = useAuxiliares();
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [weekDtos, setWeekDtos] = useState<StaffShiftDTO[]>([]);
  const [loadingWeek, setLoadingWeek] = useState(true);
  const [weekError, setWeekError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Reference date based on offset
  const today = new Date();
  const baseDate = weekOffset === 0 ? today : weekOffset > 0 ? addWeeks(today, weekOffset) : subWeeks(today, Math.abs(weekOffset));
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 }); // Lunes
  const fromStr = format(weekStart, 'yyyy-MM-dd');
  const toStr = format(addDays(weekStart, 6), 'yyyy-MM-dd');

  // Turnos de todo el equipo en la semana visible (para saber con quién coincidís).
  useEffect(() => {
    let active = true;
    setLoadingWeek(true);
    setWeekError(null);
    api
      .getShifts({ from: fromStr, to: toStr })
      .then((rows) => active && setWeekDtos(rows))
      .catch((e) => active && setWeekError(errorMessage(e, 'No se pudieron cargar los turnos.')))
      .finally(() => active && setLoadingWeek(false));
    return () => {
      active = false;
    };
  }, [fromStr, toStr, shiftsVersion, retryKey]);

  const myShifts = mapMyShifts(weekDtos);

  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const weekShifts: DayCard[] = dayNames.map((name, index) => {
    const dayDate = addDays(weekStart, index);
    const dayDateStr = format(dayDate, 'yyyy-MM-dd');
    const mine = myShifts.filter((s) => s.date === dayDateStr);
    const base = {
      date: dayDateStr,
      dayName: name,
      fullDate: dayDate,
      isCurrentDay: isToday(dayDate),
    };
    if (mine.length === 0) {
      return { ...base, empty: true, type: 'libre', timeLabel: 'Sin turno', colleagues: [] };
    }
    const main = mine.find((s) => s.type === 'normal' || s.type === 'cambio') ?? mine[0];
    return {
      ...base,
      empty: false,
      type: main.type,
      timeLabel: mine.map((s) => shiftTimeLabel(s)).join(' / '),
      swappedWith: mine.find((s) => s.swappedWith)?.swappedWith,
      colleagues: [...new Set(mine.flatMap((s) => s.colleagues))],
      notes: mine.map((s) => s.notes).filter(Boolean).join(' · ') || undefined,
    };
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#C8A14D] uppercase tracking-wider block">
            Cronograma institucional
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
            Horarios y <span className="text-[#C8A14D]">Turnos</span>
          </h1>
          <div className="w-12 h-0.5 bg-[#C8A14D] mt-1" />
        </div>

        {/* Action: Pedir cambio de turno */}
        <button
          type="button"
          onClick={() => setCurrentScreen('justificaciones', { tab: 'cambio' })}
          className="touch-target px-4 py-2.5 rounded-lg bg-[#C8A14D] hover:brightness-110 active:brightness-95 text-[#0A1124] font-bold text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <ArrowsLeftRight size={18} weight="bold" />
          <span>Solicitar cambio de turno</span>
        </button>
      </div>

      {/* Week Navigator Bar */}
      <div className="bg-[#0E1730] p-4 rounded-xl border border-[#1C2E56] shadow-xs flex items-center justify-between">
        <button
          type="button"
          onClick={() => setWeekOffset((w) => w - 1)}
          className="touch-target px-3 py-1.5 rounded-lg border border-[#1C2E56] hover:bg-[#132042] text-xs font-bold text-slate-300 flex items-center gap-1 cursor-pointer"
        >
          <CaretLeft size={16} />
          <span>Semana anterior</span>
        </button>

        <div className="text-center">
          <span className="text-xs font-bold text-[#C8A14D] uppercase tracking-wider block">
            {weekOffset === 0
              ? 'Semana en curso'
              : weekOffset > 0
              ? `En +${weekOffset} semanas`
              : `Hace ${Math.abs(weekOffset)} semanas`}
          </span>
          <h2 className="font-heading font-extrabold text-base text-white">
            {format(weekStart, "d 'de' MMMM", { locale: es })} al{' '}
            {format(addDays(weekStart, 6), "d 'de' MMMM yyyy", { locale: es })}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setWeekOffset((w) => w + 1)}
          className="touch-target px-3 py-1.5 rounded-lg border border-[#1C2E56] hover:bg-[#132042] text-xs font-bold text-slate-300 flex items-center gap-1 cursor-pointer"
        >
          <span>Semana siguiente</span>
          <CaretRight size={16} />
        </button>
      </div>

      {loadingWeek && (
        <p role="status" className="text-xs text-slate-400">
          Cargando el cronograma de la semana…
        </p>
      )}
      {weekError && (
        <div role="alert" className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-xs text-red-200 flex items-center justify-between gap-3">
          <span>{weekError}</span>
          <button
            type="button"
            onClick={() => setRetryKey((k) => k + 1)}
            className="px-3 py-1 rounded-md bg-red-900/60 hover:bg-red-800 text-white font-bold"
          >
            Reintentar
          </button>
        </div>
      )}
      <p className="text-[11px] text-slate-500">
        El cronograma lo carga Dirección. Para cambiar un turno, pedíselo a un compañero desde
        "Solicitar cambio de turno".
      </p>

      {/* ============================================================== */}
      {/* DESKTOP VIEW: 7-COLUMN GRID (≥1024px)                          */}
      {/* ============================================================== */}
      <div className="hidden lg:grid grid-cols-7 gap-3">
        {weekShifts.map((day) => {
          const isOff = day.empty || day.type === 'libre';
          const isSwapped = day.type === 'cambio';
          const isHoliday = day.type === 'feriado';

          return (
            <div
              key={day.date}
              className={`p-4 rounded-xl border flex flex-col justify-between min-h-[220px] transition-all ${
                day.isCurrentDay
                  ? 'bg-[#15234A] border-2 border-[#C8A14D] shadow-md ring-2 ring-[#C8A14D]/20'
                  : 'bg-[#0E1730] border-[#1C2E56] shadow-xs hover:border-[#284074]'
              }`}
            >
              <div className="space-y-2">
                {/* Day name and date */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                    {day.dayName}
                  </span>
                  {day.isCurrentDay && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#C8A14D] text-[#0A1124] uppercase">
                      Hoy
                    </span>
                  )}
                </div>

                <div className="font-mono text-sm text-slate-400">
                  {format(day.fullDate, 'dd/MM')}
                </div>

                {/* Shift status badge */}
                <div>
                  <StatusBadge
                    variant={
                      isOff
                        ? 'turno_libre'
                        : isSwapped
                        ? 'turno_cambio'
                        : isHoliday
                        ? 'turno_feriado'
                        : 'turno_normal'
                    }
                    size="sm"
                    label={day.empty ? 'Sin turno' : undefined}
                  />
                </div>

                {/* Large time display (JetBrains Mono) */}
                <div className="pt-2">
                  {isOff ? (
                    <span className="text-base font-bold text-slate-400">{day.empty ? 'Sin turno' : 'Franco'}</span>
                  ) : (
                    <span className="font-mono font-extrabold text-lg text-[#14214F] dark:text-white block">
                      {day.timeLabel}
                    </span>
                  )}
                </div>

                {/* Swapped with note */}
                {isSwapped && day.swappedWith && (
                  <p className="text-[11px] text-[#14214F] dark:text-sky-300 font-medium bg-indigo-50 dark:bg-indigo-950/40 p-1.5 rounded border border-indigo-200 dark:border-indigo-800">
                    Intercambiado con: <strong>{day.swappedWith}</strong>
                  </p>
                )}
              </div>

              {/* Colleagues */}
              {!isOff && day.colleagues.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-500">
                  <span className="font-bold block text-slate-400 text-[10px] uppercase">
                    Compañeros:
                  </span>
                  <p className="truncate">{day.colleagues.join(', ')}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* MOBILE VIEW: VERTICAL DAY CARDS (<1024px)                      */}
      {/* ============================================================== */}
      <div className="lg:hidden space-y-3">
        {weekShifts.map((day) => {
          const isOff = day.empty || day.type === 'libre';
          const isSwapped = day.type === 'cambio';
          const isHoliday = day.type === 'feriado';

          return (
            <div
              key={day.date}
              className={`p-4 rounded-xl border transition-all ${
                day.isCurrentDay
                  ? 'bg-[#15234A] border-2 border-[#C8A14D] shadow-sm'
                  : 'bg-[#0E1730] border-[#1C2E56] shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-extrabold text-base text-white">
                      {day.dayName}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {format(day.fullDate, 'dd/MM/yyyy')}
                    </span>
                    {day.isCurrentDay && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C8A14D] text-[#0A1124] uppercase">
                        Hoy
                      </span>
                    )}
                  </div>

                  {/* Schedule in JetBrains Mono */}
                  <div className="pt-1">
                    {isOff ? (
                      <span className="text-sm font-bold text-slate-400">
                        {day.empty ? 'Sin turno cargado en el cronograma' : 'Día libre'}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-[#3F78B6]" />
                        <span className="font-mono font-extrabold text-lg text-[#14214F] dark:text-white">
                          {day.timeLabel} hs
                        </span>
                      </div>
                    )}
                  </div>

                  {isSwapped && day.swappedWith && (
                    <p className="text-xs text-indigo-900 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/40 p-2 rounded border border-indigo-200 dark:border-indigo-800 mt-1">
                      Intercambiado con <strong>{day.swappedWith}</strong>
                    </p>
                  )}

                  {!isOff && day.colleagues.length > 0 && (
                    <p className="text-xs text-slate-500 pt-1">
                      En turno con: <strong>{day.colleagues.join(', ')}</strong>
                    </p>
                  )}
                </div>

                <StatusBadge
                  variant={
                    isOff
                      ? 'turno_libre'
                      : isSwapped
                      ? 'turno_cambio'
                      : isHoliday
                      ? 'turno_feriado'
                      : 'turno_normal'
                  }
                  size="md"
                  label={day.empty ? 'Sin turno' : undefined}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
