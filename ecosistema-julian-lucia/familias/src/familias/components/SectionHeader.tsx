import React from 'react';

interface SectionHeaderProps {
  title: string;
  kicker?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  kicker,
  subtitle,
  action,
}) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-3">
      <div>
        {kicker && (
          <span className="block text-xs font-semibold tracking-wider uppercase text-[var(--text-muted)] mb-1">
            {kicker}
          </span>
        )}
        <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-[var(--text)]">
          {title}
        </h1>
        {/* Filete dorado institucional obligatorio: 48 x 2 px */}
        <div
          className="mt-2.5 h-[2px] w-12 bg-[var(--brand-gold)]"
          aria-hidden="true"
        />
        {subtitle && (
          <p className="mt-2 text-sm text-[var(--text-muted)] max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
