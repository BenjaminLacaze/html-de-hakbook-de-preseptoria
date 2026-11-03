import React from 'react';
import {
  CheckCircle,
  Warning,
  WarningCircle,
  XCircle,
  Clock,
  ArrowsLeftRight,
  Sparkle,
  CalendarBlank,
  Flame,
} from '@phosphor-icons/react';

export type StatusBadgeVariant =
  | 'ok'
  | 'limpio'
  | 'completada'
  | 'en_progreso'
  | 'mantenimiento'
  | 'prioridad_media'
  | 'fuera_servicio'
  | 'abierta'
  | 'prioridad_alta'
  | 'prioridad_baja'
  | 'resuelta'
  | 'turno_normal'
  | 'turno_cambio'
  | 'turno_feriado'
  | 'turno_libre';

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  label,
  size = 'md',
  className = '',
}) => {
  let bgClass = '';
  let borderClass = '';
  let textClass = '';
  let defaultLabel = '';
  let IconComponent = CheckCircle;

  switch (variant) {
    case 'ok':
    case 'limpio':
    case 'completada':
    case 'resuelta':
      bgClass = 'bg-emerald-50 dark:bg-emerald-950/40';
      borderClass = 'border-emerald-300 dark:border-emerald-700';
      textClass = 'text-emerald-800 dark:text-emerald-200';
      defaultLabel = variant === 'limpio' ? 'Limpio' : variant === 'resuelta' ? 'Resuelta' : 'Completada';
      IconComponent = CheckCircle;
      break;

    case 'en_progreso':
    case 'mantenimiento':
    case 'prioridad_media':
      bgClass = 'bg-amber-50 dark:bg-amber-950/40';
      borderClass = 'border-amber-300 dark:border-amber-700';
      textClass = 'text-amber-800 dark:text-amber-200';
      defaultLabel =
        variant === 'en_progreso'
          ? 'En progreso'
          : variant === 'prioridad_media'
          ? 'Prioridad media'
          : 'En mantenimiento';
      IconComponent = variant === 'en_progreso' ? Clock : Warning;
      break;

    case 'fuera_servicio':
    case 'abierta':
    case 'prioridad_alta':
      bgClass = 'bg-red-50 dark:bg-red-950/40';
      borderClass = 'border-red-300 dark:border-red-700';
      textClass = 'text-red-800 dark:text-red-200';
      defaultLabel =
        variant === 'fuera_servicio'
          ? 'Fuera de servicio'
          : variant === 'prioridad_alta'
          ? 'Prioridad alta'
          : 'Abierta';
      IconComponent = variant === 'prioridad_alta' ? Flame : XCircle;
      break;

    case 'prioridad_baja':
    case 'turno_libre':
      bgClass = 'bg-slate-100 dark:bg-slate-800';
      borderClass = 'border-slate-300 dark:border-slate-600';
      textClass = 'text-slate-700 dark:text-slate-300';
      defaultLabel = variant === 'turno_libre' ? 'Día libre' : 'Prioridad baja';
      IconComponent = CalendarBlank;
      break;

    case 'turno_normal':
      bgClass = 'bg-sky-50 dark:bg-sky-950/40';
      borderClass = 'border-sky-300 dark:border-sky-700';
      textClass = 'text-sky-900 dark:text-sky-200';
      defaultLabel = 'Turno habitual';
      IconComponent = Clock;
      break;

    case 'turno_cambio':
      bgClass = 'bg-indigo-50 dark:bg-indigo-950/40';
      borderClass = 'border-indigo-300 dark:border-indigo-700';
      textClass = 'text-indigo-900 dark:text-indigo-200';
      defaultLabel = 'Con cambio';
      IconComponent = ArrowsLeftRight;
      break;

    case 'turno_feriado':
      bgClass = 'bg-[#FAF6EC] dark:bg-amber-950/20';
      borderClass = 'border-[#AF9B63]';
      textClass = 'text-[#725F2A] dark:text-[#E5C365]';
      defaultLabel = 'Feriado';
      IconComponent = Sparkle;
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs sm:text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-sm sm:text-base px-3 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 13,
    md: 16,
    lg: 18,
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${bgClass} ${borderClass} ${textClass} ${sizeClasses} ${className}`}
    >
      <IconComponent size={iconSizes} weight="bold" className="shrink-0" aria-hidden="true" />
      <span>{label || defaultLabel}</span>
    </span>
  );
};
