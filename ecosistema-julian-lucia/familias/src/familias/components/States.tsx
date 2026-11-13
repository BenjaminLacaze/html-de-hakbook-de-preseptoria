import React from 'react';
import { 
  ArrowClockwise, 
  WarningCircle, 
  Tray, 
  CircleNotch,
  Flask,
  Info
} from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'Cargando información oficial...',
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center p-12 text-center"
      role="status"
      aria-live="polite"
    >
      <CircleNotch
        className="w-8 h-8 animate-spin text-[var(--brand-gold)] mb-3"
        weight="bold"
      />
      <p className="text-sm font-medium text-[var(--text-muted)]">{message}</p>
    </div>
  );
};

export const EmptyState: React.FC<{
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ title, description, action }) => {
  return (
    <div
      className="flex flex-col items-center justify-center p-10 text-center border border-dashed border-[var(--border)] rounded-xl bg-[var(--surface-subtle)]"
      role="region"
      aria-live="polite"
    >
      <div className="w-12 h-12 rounded-full bg-[var(--surface-card)] flex items-center justify-center text-[var(--text-muted)] border border-[var(--border)] mb-3 shadow-xs">
        <Tray className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[var(--text)]">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--text-muted)] max-w-md mt-1 mb-4">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

export const ErrorState: React.FC<{
  message?: string;
  details?: string;
  onRetry?: () => void;
}> = ({
  message = 'Ocurrió un error al cargar los datos.',
  details,
  onRetry,
}) => {
  return (
    <div
      className="p-6 border border-red-200 dark:border-red-900/40 rounded-xl bg-red-50/60 dark:bg-red-950/20 text-[var(--text)]"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <WarningCircle
          className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5"
          weight="fill"
        />
        <div className="flex-1">
          <h3 className="text-sm font-bold text-red-900 dark:text-red-200">
            {message}
          </h3>
          {details && (
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
              {details}
            </p>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
            >
              <ArrowClockwise className="w-3.5 h-3.5" />
              Reintentar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
