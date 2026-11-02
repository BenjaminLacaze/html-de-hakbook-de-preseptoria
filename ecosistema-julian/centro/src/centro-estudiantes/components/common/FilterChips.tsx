/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Chips de filtro accesibles con aria-pressed
 */

import React from 'react';

export interface FilterOption<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface FilterChipsProps<T extends string> {
  options: FilterOption<T>[];
  selected: T;
  onChange: (id: T) => void;
  ariaLabel?: string;
}

export function FilterChips<T extends string>({
  options,
  selected,
  onChange,
  ariaLabel = 'Filtros de contenido',
}: FilterChipsProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none no-scrollbar"
    >
      {options.map((opt) => {
        const isSelected = selected === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(opt.id)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[44px] text-xs font-medium rounded-full transition-colors whitespace-nowrap shrink-0 border select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${
              isSelected
                ? 'bg-brand-navy text-white border-brand-navy shadow-xs font-semibold'
                : 'bg-surface-card text-foreground-muted border-border-subtle hover:border-brand-navy/40 hover:text-foreground'
            }`}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-mono tabular-nums ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-surface-hover text-foreground-muted'
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
