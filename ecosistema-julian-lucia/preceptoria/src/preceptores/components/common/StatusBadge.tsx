/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileText, 
  Question, 
  WarningCircle, 
  Prohibit,
  ShieldCheck
} from '@phosphor-icons/react';
import { AttendanceStatus } from '../../types';
import { StudentCondition } from '../../config/bedeliaRules';

interface StatusBadgeProps {
  status: AttendanceStatus | StudentCondition | 'aprobada' | 'rechazada' | 'pendiente';
  size?: 'sm' | 'md';
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md', 
  className = '',
  showIcon = true 
}) => {
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs gap-1' 
    : 'px-2.5 py-1 text-xs font-medium gap-1.5';

  switch (status) {
    case 'presente':
    case 'regular':
    case 'aprobada':
      return (
        <span 
          className={`inline-flex items-center rounded-md border font-sans ${sizeClasses} ${className}`}
          style={{
            backgroundColor: 'var(--status-present-bg)',
            color: 'var(--status-present-text)',
            borderColor: 'var(--status-present-border)',
          }}
          role="status"
        >
          {showIcon && <CheckCircle size={size === 'sm' ? 13 : 15} weight="bold" aria-hidden="true" />}
          <span>
            {status === 'presente' ? 'Presente' : status === 'regular' ? 'Regular' : 'Aprobada'}
          </span>
        </span>
      );

    case 'tardanza':
    case 'en_riesgo':
    case 'pendiente':
      return (
        <span 
          className={`inline-flex items-center rounded-md border font-sans ${sizeClasses} ${className}`}
          style={{
            backgroundColor: 'var(--status-tardy-bg)',
            color: 'var(--status-tardy-text)',
            borderColor: 'var(--status-tardy-border)',
          }}
          role="status"
        >
          {showIcon && (
            status === 'tardanza' 
              ? <Clock size={size === 'sm' ? 13 : 15} weight="bold" aria-hidden="true" />
              : <WarningCircle size={size === 'sm' ? 13 : 15} weight="bold" aria-hidden="true" />
          )}
          <span>
            {status === 'tardanza' ? 'Tardanza' : status === 'en_riesgo' ? 'En riesgo' : 'Pendiente'}
          </span>
        </span>
      );

    case 'ausente':
    case 'libre':
    case 'rechazada':
      return (
        <span 
          className={`inline-flex items-center rounded-md border font-sans ${sizeClasses} ${className}`}
          style={{
            backgroundColor: 'var(--status-absent-bg)',
            color: 'var(--status-absent-text)',
            borderColor: 'var(--status-absent-border)',
          }}
          role="status"
        >
          {showIcon && (
            status === 'libre' 
              ? <Prohibit size={size === 'sm' ? 13 : 15} weight="bold" aria-hidden="true" />
              : <XCircle size={size === 'sm' ? 13 : 15} weight="bold" aria-hidden="true" />
          )}
          <span>
            {status === 'ausente' ? 'Ausente' : status === 'libre' ? 'Libre' : 'Rechazada'}
          </span>
        </span>
      );

    case 'justificado':
      return (
        <span 
          className={`inline-flex items-center rounded-md border font-sans ${sizeClasses} ${className}`}
          style={{
            backgroundColor: 'var(--status-justified-bg)',
            color: 'var(--status-justified-text)',
            borderColor: 'var(--status-justified-border)',
          }}
          role="status"
        >
          {showIcon && <FileText size={size === 'sm' ? 13 : 15} weight="bold" aria-hidden="true" />}
          <span>Justificado</span>
        </span>
      );

    case 'sin_registrar':
    default:
      return (
        <span 
          className={`inline-flex items-center rounded-md border font-sans ${sizeClasses} ${className}`}
          style={{
            backgroundColor: 'var(--status-unregistered-bg)',
            color: 'var(--status-unregistered-text)',
            borderColor: 'var(--status-unregistered-border)',
          }}
          role="status"
        >
          {showIcon && <Question size={size === 'sm' ? 13 : 15} weight="bold" aria-hidden="true" />}
          <span>Sin registrar</span>
        </span>
      );
  }
};
