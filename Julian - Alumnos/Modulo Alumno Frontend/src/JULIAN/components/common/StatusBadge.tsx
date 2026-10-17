import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { getBorderRadiusClass } from '../../styles/themes';

interface StatusBadgeProps {
  status:
    | 'Presente'
    | 'Ausente'
    | 'Tardanza'
    | 'Justificada'
    | 'Aprobado'
    | 'Desaprobado'
    | 'Pendiente'
    | 'Cursando'
    | 'Regular'
    | 'Promocionada'
    | 'En Riesgo'
    | 'Libre';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const { appearance, themeColors } = usePortal();
  const radius = getBorderRadiusClass(appearance.borderStyle);

  const getStyleAndIcon = () => {
    switch (status) {
      case 'Presente':
      case 'Aprobado':
      case 'Promocionada':
      case 'Regular':
        return {
          bg: themeColors.positiveBg,
          text: themeColors.positiveText,
          border: themeColors.positiveBorder,
          icon: <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
        };
      case 'Ausente':
      case 'Desaprobado':
      case 'Libre':
      case 'En Riesgo':
        return {
          bg: themeColors.negativeBg,
          text: themeColors.negativeText,
          border: themeColors.negativeBorder,
          icon: <XCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
        };
      case 'Tardanza':
      case 'Justificada':
      case 'Pendiente':
        return {
          bg: themeColors.warningBg,
          text: themeColors.warningText,
          border: themeColors.warningBorder,
          icon: <Clock className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
        };
      case 'Cursando':
      default:
        return {
          bg: themeColors.bgSubtle,
          text: themeColors.textSecondary,
          border: themeColors.borderSubtle,
          icon: <AlertCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
        };
    }
  };

  const config = getStyleAndIcon();
  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border
      }}
      className={`inline-flex items-center gap-1.5 font-medium border ${paddingClass} ${radius.badge} whitespace-nowrap shrink-0`}
    >
      {config.icon}
      <span>{status}</span>
    </span>
  );
};
