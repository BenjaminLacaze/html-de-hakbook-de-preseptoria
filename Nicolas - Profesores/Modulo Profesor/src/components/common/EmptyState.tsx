import React from 'react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
}) => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '3rem 1.5rem',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--color-border-medium)',
        margin: '1.5rem 0',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#F1F5F9',
          color: 'var(--isf-blue-primary)',
          marginBottom: '1rem',
        }}
        aria-hidden="true"
      >
        {icon || <SearchX size={28} />}
      </div>
      <h3 style={{ fontSize: '1.15rem', color: 'var(--isf-blue-primary)', marginBottom: '0.35rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
        {description}
      </p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="btn btn-secondary btn-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
