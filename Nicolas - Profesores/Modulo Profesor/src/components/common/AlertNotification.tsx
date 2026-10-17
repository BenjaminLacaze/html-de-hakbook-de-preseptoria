import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

interface AlertNotificationProps {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  onClose?: () => void;
}

export const AlertNotification: React.FC<AlertNotificationProps> = ({
  type,
  message,
  onClose,
}) => {
  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          bg: '#ECFDF5',
          border: '#6EE7B7',
          color: '#065F46',
          icon: <CheckCircle2 size={20} aria-hidden="true" />,
        };
      case 'warning':
        return {
          bg: '#FFFBEB',
          border: '#FCD34D',
          color: '#92400E',
          icon: <AlertTriangle size={20} aria-hidden="true" />,
        };
      case 'error':
        return {
          bg: '#FEF2F2',
          border: '#FCA5A5',
          color: '#991B1B',
          icon: <XCircle size={20} aria-hidden="true" />,
        };
      default:
        return {
          bg: '#EFF6FF',
          border: '#93C5FD',
          color: '#1E40AF',
          icon: <Info size={20} aria-hidden="true" />,
        };
    }
  };

  const config = getConfig();

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.875rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
        marginBottom: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
        fontSize: '0.9375rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ flexShrink: 0 }}>{config.icon}</span>
        <span style={{ fontWeight: 500 }}>{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar notificación"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '0.25rem',
            marginLeft: '1rem',
          }}
        >
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
