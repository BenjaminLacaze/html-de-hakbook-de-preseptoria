import React from 'react';
import { LucideIcon } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { getBorderRadiusClass } from '../../styles/themes';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  trend?: {
    text: string;
    positive?: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  onClick
}) => {
  const { appearance, themeColors } = usePortal();
  const radius = getBorderRadiusClass(appearance.borderStyle);

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: themeColors.bgCard,
        borderColor: themeColors.borderSubtle
      }}
      className={`p-5 border transition-all duration-150 ${radius.card} ${
        onClick ? 'cursor-pointer hover:border-slate-400 dark:hover:border-slate-600' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span
            style={{ color: themeColors.textMuted }}
            className="text-xs font-medium uppercase tracking-wider block mb-1"
          >
            {title}
          </span>
          <div
            style={{ color: themeColors.textPrimary }}
            className="text-2xl lg:text-3xl font-bold tracking-tight tabular-nums"
          >
            {value}
          </div>
        </div>
        <div
          style={{
            backgroundColor: themeColors.accentSurface,
            color: themeColors.accentGold
          }}
          className={`p-2.5 ${radius.inner} shrink-0`}
        >
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: themeColors.borderSubtle }}>
        <span style={{ color: themeColors.textSecondary }}>{subtitle}</span>
        {trend && (
          <span
            style={{
              color: trend.positive ? themeColors.positiveText : themeColors.negativeText
            }}
            className="font-medium tabular-nums"
          >
            {trend.text}
          </span>
        )}
      </div>
    </div>
  );
};
