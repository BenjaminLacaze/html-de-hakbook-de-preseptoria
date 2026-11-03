/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface FilterChipProps {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  count,
  active,
  onClick,
  icon,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
        active
          ? 'bg-[var(--brand-navy)] text-white border-[var(--brand-navy)] shadow-xs font-semibold'
          : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--brand-blue)] hover:text-[var(--text-primary)]'
      }`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`px-1.5 py-0.2 rounded-full font-mono-data text-[11px] ${
            active ? 'bg-white/20 text-white' : 'bg-[var(--border-subtle)] text-[var(--text-secondary)]'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
