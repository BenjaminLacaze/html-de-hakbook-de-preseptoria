import React from 'react';
import { 
  AttendanceState, 
  JustificationStatus, 
  AuthorizationResponse, 
  AttendanceRisk 
} from '../types/api';
import { 
  ATTENDANCE_STATE_LABELS, 
  JUSTIFICATION_STATUS_LABELS, 
  AUTHORIZATION_RESPONSE_LABELS, 
  ATTENDANCE_RISK_LABELS 
} from '../types/dictionaries';

interface StatusBadgeProps {
  type: 'attendance' | 'justification' | 'authorization' | 'risk';
  value: AttendanceState | JustificationStatus | AuthorizationResponse | AttendanceRisk;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value }) => {
  let label = '';
  let colorClasses = '';

  if (type === 'attendance') {
    const val = value as AttendanceState;
    label = ATTENDANCE_STATE_LABELS[val] || val;
    switch (val) {
      case 'PRESENT':
        colorClasses = 'bg-[var(--badge-ok-bg)] text-[var(--badge-ok-text)] border border-emerald-200/50';
        break;
      case 'ABSENT':
        colorClasses = 'bg-[var(--badge-below-bg)] text-[var(--badge-below-text)] border border-red-200/50';
        break;
      case 'LATE':
        colorClasses = 'bg-[var(--badge-risk-bg)] text-[var(--badge-risk-text)] border border-amber-200/50';
        break;
      case 'JUSTIFIED_ABSENT':
        colorClasses = 'bg-blue-50 text-blue-800 border border-blue-200/50 dark:bg-blue-950/60 dark:text-blue-200';
        break;
    }
  } else if (type === 'justification') {
    const val = value as JustificationStatus;
    label = JUSTIFICATION_STATUS_LABELS[val]?.label || val;
    switch (val) {
      case 'APPROVED':
        colorClasses = 'bg-[var(--badge-ok-bg)] text-[var(--badge-ok-text)] border border-emerald-200/50';
        break;
      case 'UNDER_REVIEW':
        colorClasses = 'bg-[var(--badge-risk-bg)] text-[var(--badge-risk-text)] border border-amber-200/50';
        break;
      case 'REJECTED':
        colorClasses = 'bg-[var(--badge-below-bg)] text-[var(--badge-below-text)] border border-red-200/50';
        break;
    }
  } else if (type === 'authorization') {
    const val = value as AuthorizationResponse;
    label = AUTHORIZATION_RESPONSE_LABELS[val] || val;
    switch (val) {
      case 'APPROVED':
        colorClasses = 'bg-[var(--badge-ok-bg)] text-[var(--badge-ok-text)] border border-emerald-200/50';
        break;
      case 'PENDING':
        colorClasses = 'bg-[var(--badge-risk-bg)] text-[var(--badge-risk-text)] border border-amber-200/50';
        break;
      case 'REJECTED':
        colorClasses = 'bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-200';
        break;
    }
  } else if (type === 'risk') {
    const val = value as AttendanceRisk;
    label = ATTENDANCE_RISK_LABELS[val]?.label || val;
    switch (val) {
      case 'OK':
        colorClasses = 'bg-[var(--badge-ok-bg)] text-[var(--badge-ok-text)] border border-emerald-200/50';
        break;
      case 'AT_RISK':
        colorClasses = 'bg-[var(--badge-risk-bg)] text-[var(--badge-risk-text)] border border-amber-200/50';
        break;
      case 'BELOW_MINIMUM':
        colorClasses = 'bg-[var(--badge-below-bg)] text-[var(--badge-below-text)] border border-red-200/50';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md tracking-tight ${colorClasses}`}
    >
      {label}
    </span>
  );
};
