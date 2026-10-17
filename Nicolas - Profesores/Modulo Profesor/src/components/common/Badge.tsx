import React from 'react';
import type { StudentStatus, AttendanceStatus } from '../../types';
import { CheckCircle2, XCircle, Clock, HelpCircle, GraduationCap, AlertTriangle } from 'lucide-react';

type BadgeType = StudentStatus | AttendanceStatus | 'SIN_REGISTRAR' | 'CERRADA' | 'ABIERTA';

interface BadgeProps {
  status: BadgeType;
  label?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, label }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'PRESENTE':
        return {
          icon: <CheckCircle2 size={14} aria-hidden="true" />,
          text: label || 'Presente',
          bg: 'var(--status-present-bg)',
          color: 'var(--status-present-text)',
          border: 'var(--status-present-border)',
        };
      case 'AUSENTE':
        return {
          icon: <XCircle size={14} aria-hidden="true" />,
          text: label || 'Ausente',
          bg: 'var(--status-absent-bg)',
          color: 'var(--status-absent-text)',
          border: 'var(--status-absent-border)',
        };
      case 'TARDE':
        return {
          icon: <Clock size={14} aria-hidden="true" />,
          text: label || 'Tarde',
          bg: 'var(--status-late-bg)',
          color: 'var(--status-late-text)',
          border: 'var(--status-late-border)',
        };
      case 'SIN_REGISTRAR':
        return {
          icon: <HelpCircle size={14} aria-hidden="true" />,
          text: label || 'Sin registrar',
          bg: 'var(--status-unassigned-bg)',
          color: 'var(--status-unassigned-text)',
          border: 'var(--status-unassigned-border)',
        };
      case 'REGULAR':
        return {
          icon: <GraduationCap size={14} aria-hidden="true" />,
          text: label || 'Regular',
          bg: '#EFF6FF',
          color: '#1E40AF',
          border: '#93C5FD',
        };
      case 'LIBRE':
        return {
          icon: <AlertTriangle size={14} aria-hidden="true" />,
          text: label || 'Libre',
          bg: '#FEF2F2',
          color: '#991B1B',
          border: '#FCA5A5',
        };
      case 'PROMOCIONADO':
        return {
          icon: <CheckCircle2 size={14} aria-hidden="true" />,
          text: label || 'Promocionado',
          bg: '#F0FDF4',
          color: '#15803D',
          border: '#86EFAC',
        };
      case 'CERRADA':
        return {
          icon: <CheckCircle2 size={14} aria-hidden="true" />,
          text: label || 'Asistencia Registrada',
          bg: '#ECFDF5',
          color: '#065F46',
          border: '#6EE7B7',
        };
      case 'ABIERTA':
        return {
          icon: <Clock size={14} aria-hidden="true" />,
          text: label || 'Pendiente de Registro',
          bg: '#FFFBEB',
          color: '#B45309',
          border: '#FCD34D',
        };
      default:
        return {
          icon: null,
          text: label || status,
          bg: '#F1F5F9',
          color: '#334155',
          border: '#CBD5E1',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.2rem 0.6rem',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.8125rem',
        fontWeight: 600,
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      {config.icon}
      <span>{config.text}</span>
    </span>
  );
};
