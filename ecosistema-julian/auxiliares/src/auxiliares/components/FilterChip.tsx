import React from 'react';

interface FilterChipProps {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  ariaLabel?: string;
  className?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  count,
  active,
  onClick,
  icon,
  ariaLabel,
  className = '',
}) => {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={ariaLabel || `${label}${count !== undefined ? ` (${count})` : ''}`}
      onClick={onClick}
      className={`touch-target px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all select-none gap-1.5 inline-flex items-center cursor-pointer border ${
        active
          ? 'bg-[#C8A14D] text-[#0A1124] border-[#C8A14D] shadow-xs font-bold'
          : 'bg-[#0E1730] text-slate-300 border-[#1C2E56] hover:bg-[#142247] hover:border-[#284074]'
      } ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            active
              ? 'bg-[#0A1124]/20 text-[#0A1124]'
              : 'bg-[#18274A] text-slate-300'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
