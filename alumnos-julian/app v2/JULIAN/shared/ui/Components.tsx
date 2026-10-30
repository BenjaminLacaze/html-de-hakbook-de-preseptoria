/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Info } from "@phosphor-icons/react";
import { REGLAS_ASISTENCIA } from "../lib/attendanceRules";

// 1. Card
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "interactive";
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  variant = "default",
  ...props
}) => {
  const variantStyles = {
    default: "bg-[var(--surface-raised)] border border-[var(--border)]",
    elevated: "bg-[var(--surface-raised)] border border-[var(--border)] shadow-xs",
    interactive:
      "bg-[var(--surface-raised)] border border-[var(--border)] hover:border-[var(--focus)] hover:shadow-xs transition-all duration-150 cursor-pointer",
  };

  return (
    <div
      className={`rounded-xl p-5 md:p-6 min-w-0 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// 2. BrandBlock (bloque navy sólido con texto blanco)
interface BrandBlockProps {
  children: React.ReactNode;
  className?: string;
}

export const BrandBlock: React.FC<BrandBlockProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`rounded-xl p-6 md:p-8 bg-[#14214F] text-white border border-[#24356E] shadow-sm relative overflow-hidden min-w-0 ${className}`}
    >
      {/* Filete superior dorado institucional */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#89743A]" />
      {children}
    </div>
  );
};

// 3. IconBadge (cuadrado de ~40px con fondo tintado e ícono fino)
interface IconBadgeProps {
  icon: React.ReactNode;
  tone?: "gold" | "blue" | "navy" | "green" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const IconBadge: React.FC<IconBadgeProps> = ({
  icon,
  tone = "gold",
  size = "md",
  className = "",
}) => {
  const toneStyles = {
    gold: "bg-[rgba(137,116,58,0.12)] text-[#89743A] border border-[rgba(137,116,58,0.25)]",
    blue: "bg-[rgba(63,120,182,0.12)] text-[#3F78B6] border border-[rgba(63,120,182,0.25)]",
    navy: "bg-[#14214F] text-white border border-[#24356E]",
    green: "bg-[rgba(30,126,52,0.12)] text-[#1E7E34] border border-[rgba(30,126,52,0.25)]",
    danger: "bg-[rgba(185,28,28,0.12)] text-[#B91C1C] border border-[rgba(185,28,28,0.25)]",
  };

  const sizeStyles = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div
      className={`rounded-lg flex items-center justify-center shrink-0 ${sizeStyles[size]} ${toneStyles[tone]} ${className}`}
    >
      {icon}
    </div>
  );
};

// 4. StatFigure (cifras destacadas con números grandes y etiqueta abajo)
interface StatFigureProps {
  value: string | number;
  label: string;
  sublabel?: string;
  tone?: "navy" | "gold" | "blue" | "success";
  className?: string;
}

export const StatFigure: React.FC<StatFigureProps> = ({
  value,
  label,
  sublabel,
  tone = "navy",
  className = "",
}) => {
  const toneClass = {
    navy: "text-[var(--text)]",
    gold: "text-[#89743A]",
    blue: "text-[#3F78B6]",
    success: "text-[#1E7E34]",
  }[tone];

  return (
    <div className={`flex flex-col min-w-0 ${className}`}>
      <span
        className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight tabular-nums ${toneClass}`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </span>
      <span className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] mt-1">
        {label}
      </span>
      {sublabel && (
        <span className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
          {sublabel}
        </span>
      )}
    </div>
  );
};

// 5. ProgressBar (A5: ancho con style={{ width: `${pct}%` }}, aria-valuenow, accesible)
interface ProgressBarProps {
  value: number; // 0 - 100
  max?: number;
  label?: string;
  showValueText?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValueText = true,
  className = "",
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  // Dorado para logro sobresaliente
  const isComplete = percentage >= 95;
  const barColor = isComplete
    ? "bg-[#89743A]"
    : percentage < 75
    ? "bg-[#B91C1C]"
    : "bg-[#14214F]";

  return (
    <div className={`w-full min-w-0 ${className}`}>
      {(label || showValueText) && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
          {label && <span className="text-[var(--text-muted)]">{label}</span>}
          {showValueText && (
            <span
              className="tabular-nums font-bold text-[var(--text)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      <div
        className="h-2.5 w-full bg-[#E5E9F0] dark:bg-[#1E293B] rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full transition-all duration-300 rounded-full ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// 6. Chip / Segmented Filter (A9: Estado activo inequívoco: solid navy o dorado con aria-pressed="true", inactivos con contorno)
interface ChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  active,
  onClick,
  children,
  count,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 inline-flex items-center gap-1.5 whitespace-nowrap border shrink-0 focus-visible cursor-pointer ${
        active
          ? "bg-[#14214F] text-white border-[#14214F] dark:bg-[#89743A] dark:border-[#89743A] dark:text-white shadow-xs"
          : "bg-[var(--surface-raised)] text-[var(--text)] border-[var(--border)] hover:border-[#14214F]"
      } ${className}`}
    >
      <span>{children}</span>
      {count !== undefined && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full tabular-nums font-bold ${
            active
              ? "bg-white/20 text-white"
              : "bg-black/5 dark:bg-white/10 text-[var(--text-muted)]"
          }`}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {count}
        </span>
      )}
    </button>
  );
};

// 7. Tooltip explicativo de la fórmula de asistencia (A2)
export const AttendanceFormulaTooltip: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        aria-label="Ver fórmula de asistencia"
        className="text-[var(--text-muted)] hover:text-[#89743A] transition-colors p-0.5 rounded inline-flex items-center"
      >
        <Info size={15} />
      </button>

      {visible && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 rounded-lg bg-[#14214F] text-white text-xs shadow-xl border border-[#24356E] pointer-events-none"
        >
          <div className="font-bold text-[#AF9B63] mb-1 font-mono text-xs uppercase">
            {REGLAS_ASISTENCIA.estadoConfiguracion}
          </div>
          <p className="leading-relaxed mb-1.5 text-xs text-white/90">
            {REGLAS_ASISTENCIA.formulaTooltip}
          </p>
          <div className="text-[11px] text-white/70 font-mono">
            Mínimo regularidad: {REGLAS_ASISTENCIA.porcentajeMinimoRegularidad}% · Promoción: {REGLAS_ASISTENCIA.porcentajeMinimoPromocion}%
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#14214F]" />
        </div>
      )}
    </div>
  );
};

// 8. DemoBanner (transparencia institucional)
export const DemoBanner: React.FC<{ message?: string; className?: string }> = ({
  message = "Entorno de demostración académica. Toda acción y dato simula la operativa del ISFDyT N° 26.",
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-2 rounded-lg bg-[rgba(137,116,58,0.08)] border border-[rgba(137,116,58,0.25)] text-xs text-[#89743A] min-w-0 ${className}`}
    >
      <div className="flex items-center gap-2 min-w-0 truncate">
        <span className="font-extrabold uppercase tracking-wider text-xs px-1.5 py-0.5 rounded bg-[#89743A] text-white shrink-0">
          DEMO
        </span>
        <span className="font-medium truncate">{message}</span>
      </div>
      <span className="hidden md:inline text-xs font-mono tracking-tight text-[var(--text-muted)] shrink-0">
        ISFDyT 26 · CICLO 2026
      </span>
    </div>
  );
};
