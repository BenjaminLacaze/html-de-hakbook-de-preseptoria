import React from "react";

interface SectionTitleProps {
  children: React.ReactNode;
  subtitle?: string;
  className?: string;
  action?: React.ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  subtitle,
  className = "",
  action,
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2
            className="text-lg md:text-xl font-bold uppercase tracking-[0.1em] text-[var(--text)] select-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {children}
          </h2>
          {subtitle && (
            <p className="text-xs md:text-sm text-[var(--text-muted)] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {/* Filete corto dorado ocre característico del manual institucional */}
      <div
        className="brand-fillet mt-2"
        role="presentation"
        aria-hidden="true"
      />
    </div>
  );
};

interface PageTitleProps {
  title: string;
  highlightWord?: string;
  description?: string;
  badge?: React.ReactNode;
  className?: string;
}

export const PageTitle: React.FC<PageTitleProps> = ({
  title,
  highlightWord,
  description,
  badge,
  className = "",
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}{" "}
          {highlightWord && (
            <span className="text-[var(--accent)] font-extrabold">
              {highlightWord}
            </span>
          )}
        </h1>
        {badge}
      </div>
      {description && (
        <p className="text-sm md:text-base text-[var(--text-muted)] mt-1.5 max-w-3xl">
          {description}
        </p>
      )}
    </div>
  );
};

interface ContextLabelProps {
  children: React.ReactNode;
  color?: "gold" | "blue" | "muted";
  className?: string;
}

export const ContextLabel: React.FC<ContextLabelProps> = ({
  children,
  color = "gold",
  className = "",
}) => {
  const colorClass =
    color === "gold"
      ? "text-[var(--accent)]"
      : color === "blue"
      ? "text-[var(--focus)]"
      : "text-[var(--text-muted)]";

  return (
    <span
      className={`text-[11px] font-bold uppercase tracking-[0.12em] ${colorClass} ${className}`}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
};
