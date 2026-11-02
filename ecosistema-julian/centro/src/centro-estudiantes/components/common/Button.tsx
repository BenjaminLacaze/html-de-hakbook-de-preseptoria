/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Botón accesible del sistema
 */

import React from 'react';

export type ButtonVariant = 'primary' | 'accent-gold' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium font-sans rounded-lg transition-colors cursor-pointer select-none whitespace-nowrap shrink-0 min-h-[44px] min-w-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 active:scale-[0.98] transition-transform duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[44px]',
    md: 'text-sm px-4 py-2 gap-2 min-h-[44px]',
    lg: 'text-base px-6 py-2.5 gap-2.5 min-h-[48px]',
  }[size];

  const variantClasses = {
    // Primario: Navy de marca sólido con texto blanco
    primary:
      'bg-brand-navy hover:bg-[#1C2E6B] text-white shadow-xs',
    // Acción principal de pantalla: Dorado ocre oficial #89743A con texto blanco
    'accent-gold':
      'bg-brand-gold hover:bg-[#766330] text-white shadow-xs font-semibold',
    // Secundario: Blanco con borde navy
    secondary:
      'bg-surface-card hover:bg-surface-hover text-brand-navy border border-brand-navy/30 hover:border-brand-navy',
    // Ghost
    ghost:
      'bg-transparent hover:bg-surface-hover text-foreground-muted hover:text-foreground',
    // Danger
    danger:
      'bg-rose-700 hover:bg-rose-800 text-white shadow-xs',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon
      )}
      {children}
      {!loading && iconRight}
    </button>
  );
};
