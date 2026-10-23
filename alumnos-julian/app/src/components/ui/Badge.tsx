import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-[var(--bg-muted)] text-[var(--text-secondary)]',
    success: 'bg-[var(--status-success-bg)] text-[var(--status-success)] font-medium',
    warning: 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] font-medium',
    danger: 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] font-medium',
    info: 'bg-[var(--status-info-bg)] text-[var(--status-info)] font-medium',
    gold: 'bg-[var(--gold-subtle)] text-[var(--gold-accent)] font-medium',
    outline: 'border border-subtle-custom text-[var(--text-secondary)] bg-transparent',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs rounded font-medium tracking-tight whitespace-nowrap',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
