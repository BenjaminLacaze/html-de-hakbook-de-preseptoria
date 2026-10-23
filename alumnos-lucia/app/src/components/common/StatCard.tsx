/**
 * Tarjeta de métrica estadística individual
 * Diseño sin pills superfluos, con números tabulares y contraste accesible
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default'
}) => {
  const variantStyles = {
    default: 'text-slate-900 dark:text-slate-100',
    success: 'text-emerald-700 dark:text-emerald-400',
    warning: 'text-amber-700 dark:text-amber-400',
    danger: 'text-rose-700 dark:text-rose-400',
    info: 'text-blue-700 dark:text-blue-400'
  };

  const iconStyles = {
    default: 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400',
    success: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300',
    warning: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300',
    danger: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300',
    info: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300'
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 sm:p-5 flex flex-col justify-between transition-colors">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-2 rounded-md ${iconStyles[variant]} shrink-0`}>
          <Icon size={18} aria-hidden="true" />
        </div>
      </div>

      <div>
        <div className={`text-2xl sm:text-3xl font-bold tracking-tight tabular-nums ${variantStyles[variant]}`}>
          {value}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
