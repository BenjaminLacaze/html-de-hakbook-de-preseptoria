import React from "react";
import { ArrowClockwise } from "@phosphor-icons/react";
import { Logo } from "./Logo";

// 1. EmptyState (con alumnos-logo-marca en tamaño chico y opacidad reducida)
interface EmptyStateProps {
  title?: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No hay registros por el momento",
  description,
  actionText,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] ${className}`}
    >
      <div className="opacity-35 mb-4 grayscale hover:grayscale-0 transition-all duration-300">
        <Logo variant="marca" height={28} />
      </div>
      <h3
        className="text-base md:text-lg font-bold text-[var(--text)] mb-1"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h3>
      <p className="text-xs md:text-sm text-[var(--text-muted)] max-w-md mb-5 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#14214F] text-white hover:bg-[#1D2E68] transition-colors focus-visible"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

// 2. ErrorState con reintento accesible
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Tuvimos un inconveniente al cargar los datos",
  message = "No te preocupes: podés reintentar ahora o volver a consultar en unos instantes.",
  onRetry,
  className = "",
}) => {
  return (
    <div
      role="alert"
      className={`p-6 md:p-8 rounded-xl border border-[rgba(185,28,28,0.25)] bg-[rgba(185,28,28,0.04)] text-center ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-[rgba(185,28,28,0.12)] text-[#B91C1C] flex items-center justify-center mx-auto mb-3 font-bold text-lg">
        !
      </div>
      <h3
        className="text-base font-bold text-[#B91C1C] mb-1"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h3>
      <p className="text-xs md:text-sm text-[var(--text-muted)] max-w-md mx-auto mb-4">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#14214F] text-white hover:bg-[#1D2E68] transition-colors focus-visible"
        >
          <ArrowClockwise className="w-4 h-4" />
          <span>Reintentar carga</span>
        </button>
      )}
    </div>
  );
};

// 3. Skeletons
export const Skeleton: React.FC<{ className?: string; height?: string | number }> = ({
  className = "w-full h-4",
  height,
}) => {
  return (
    <div
      className={`animate-pulse bg-[rgba(20,33,79,0.08)] rounded-md ${className}`}
      style={height ? { height } : undefined}
      aria-hidden="true"
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] space-y-3">
      <Skeleton className="w-1/3 h-5" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-2/3 h-4" />
      <div className="pt-3 flex gap-2">
        <Skeleton className="w-16 h-8 rounded-lg" />
        <Skeleton className="w-24 h-8 rounded-lg" />
      </div>
    </div>
  );
};

// 4. Timeline para el Historial Académico
export interface TimelineItem {
  id: string;
  badge: string;
  title: string;
  subtitle?: string;
  content: string;
  date: string;
  highlight?: boolean;
}

export const Timeline: React.FC<{ items: TimelineItem[]; className?: string }> = ({
  items,
  className = "",
}) => {
  return (
    <div className={`relative pl-6 md:pl-8 border-l-2 border-[#DDE4ED] ml-3 md:ml-4 space-y-8 ${className}`}>
      {items.map((item) => (
        <div key={item.id} className="relative group">
          {/* Nodo del timeline */}
          <div
            className={`absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 border-white ${
              item.highlight ? "bg-[#89743A] ring-4 ring-[#89743A]/20" : "bg-[#14214F]"
            }`}
          />
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[rgba(137,116,58,0.12)] text-[#89743A]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {item.badge}
              </span>
              <h4
                className="text-base font-bold text-[var(--text)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {item.title}
              </h4>
            </div>
            <span
              className="text-xs text-[var(--text-muted)] font-mono shrink-0"
            >
              {item.date}
            </span>
          </div>
          {item.subtitle && (
            <p className="text-xs font-semibold text-[#3F78B6] mb-1">
              {item.subtitle}
            </p>
          )}
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            {item.content}
          </p>
        </div>
      ))}
    </div>
  );
};
