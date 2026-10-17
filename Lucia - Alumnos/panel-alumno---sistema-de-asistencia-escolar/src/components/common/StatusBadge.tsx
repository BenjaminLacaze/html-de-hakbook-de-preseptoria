/**
 * Etiqueta de estado de asistencia accesible
 * Cumple con norma de no comunicar estados únicamente por color (incluye icono y texto explícito)
 */

import React from 'react';
import { AttendanceStatus } from '../../types';
import { CheckCircle2, XCircle, Clock, FileCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: AttendanceStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showIcon = true,
  size = 'md'
}) => {
  const sizeClasses = size === 'sm' ? 'text-xs py-0.5 px-2' : 'text-xs md:text-sm py-1 px-2.5';
  const iconSize = size === 'sm' ? 14 : 16;

  switch (status) {
    case 'PRESENTE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded border border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700 ${sizeClasses}`}
        >
          {showIcon && <CheckCircle2 size={iconSize} className="text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />}
          <span>Presente</span>
        </span>
      );

    case 'AUSENTE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded border border-rose-300 bg-rose-50 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-700 ${sizeClasses}`}
        >
          {showIcon && <XCircle size={iconSize} className="text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />}
          <span>Ausente</span>
        </span>
      );

    case 'TARDE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded border border-amber-300 bg-amber-50 text-amber-950 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700 ${sizeClasses}`}
        >
          {showIcon && <Clock size={iconSize} className="text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />}
          <span>Llegada tarde</span>
        </span>
      );

    case 'JUSTIFICADO':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded border border-blue-300 bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-700 ${sizeClasses}`}
        >
          {showIcon && <FileCheck size={iconSize} className="text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />}
          <span>Justificado</span>
        </span>
      );

    default:
      return null;
  }
};
