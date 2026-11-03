import React from 'react';
import { cn } from '../../lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
  size = 'md',
}) => {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center p-1 bg-[var(--bg-surface-elevated)] border border-subtle-custom rounded-[var(--radius-current)] gap-1 overflow-x-auto max-w-full',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 font-medium transition-all select-none whitespace-nowrap shrink-0 rounded-[calc(var(--radius-current)-2px)]',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs sm:text-sm',
              isActive
                ? 'bg-surface text-primary-custom shadow-xs font-semibold'
                : 'text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5'
            )}
          >
            {tab.icon && <span className="w-4 h-4 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded text-[10px] tabular-nums',
                  isActive ? 'bg-[var(--bg-surface-elevated)] text-primary-custom' : 'bg-black/5 dark:bg-white/10 text-muted-custom'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
