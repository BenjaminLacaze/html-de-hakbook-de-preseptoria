import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[var(--radius-current)] border border-dashed border-subtle-custom bg-[var(--bg-surface-elevated)]/40',
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-full bg-surface border border-subtle-custom flex items-center justify-center text-secondary-custom mb-3">
          {icon}
        </div>
      )}
      <h4 className="text-sm font-semibold text-primary-custom tracking-tight mb-1">{title}</h4>
      <p className="text-xs text-secondary-custom max-w-sm mb-4">{description}</p>
      {actionText && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
