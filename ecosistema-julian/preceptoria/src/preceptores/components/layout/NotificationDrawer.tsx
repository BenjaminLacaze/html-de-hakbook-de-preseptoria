/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  CheckCircle,
  FileText,
  ChatCircleDots,
  WarningCircle,
  ClockCounterClockwise,
  Checks
} from '@phosphor-icons/react';
import { usePreceptor, ScreenId } from '../../context/PreceptorContext';
import { NotificationItem } from '../../types';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveScreen
  } = usePreceptor();

  if (!isNotificationDrawerOpen) return null;

  const todayNotifications = notifications.filter(n => n.isToday);
  const beforeNotifications = notifications.filter(n => !n.isToday);

  const handleNotificationClick = (item: NotificationItem) => {
    markNotificationAsRead(item.id);
    if (item.targetScreen) {
      setActiveScreen(item.targetScreen as ScreenId);
      setIsNotificationDrawerOpen(false);
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'justificacion':
        return <FileText size={18} weight="fill" className="text-sky-600 dark:text-sky-400" />;
      case 'mensaje':
        return <ChatCircleDots size={18} weight="fill" className="text-indigo-600 dark:text-indigo-400" />;
      case 'riesgo':
        return <WarningCircle size={18} weight="fill" className="text-amber-600 dark:text-amber-400" />;
      case 'foro':
      case 'anuncio':
      case 'general':
        return <ClockCounterClockwise size={18} weight="fill" className="text-emerald-600 dark:text-emerald-400" />;
    }
  };

  const renderGroup = (title: string, list: NotificationItem[]) => {
    if (list.length === 0) return null;
    return (
      <div className="space-y-2">
        <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] px-1">
          {title}
        </h4>
        <div className="space-y-1.5">
          {list.map(item => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                item.isRead
                  ? 'bg-[var(--bg-surface)] border-[var(--border-subtle)] opacity-75 hover:opacity-100'
                  : 'bg-[var(--bg-surface-elevated)] border-[#89743A]/40 shadow-2xs hover:border-[#89743A]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-heading font-bold truncate ${item.isRead ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                      {item.title}
                    </p>
                    <span className="font-mono-data text-[10px] text-[var(--text-muted)] shrink-0">
                      {item.timeAgo}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-snug">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-drawer-title"
    >
      <div
        className="w-full sm:w-96 lg:w-[420px] bg-[var(--bg-surface)] border-l border-[var(--border-strong)] h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-4 px-5 border-b border-[var(--border-subtle)] bg-[var(--brand-navy)] text-white flex items-center justify-between">
          <div>
            <h3 id="notification-drawer-title" className="font-heading font-bold text-base leading-none">
              Centro de Notificaciones
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Novedades de alumnos, mensajes y foro
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Marcar todas como leídas"
            >
              <Checks size={20} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => setIsNotificationDrawerOpen(false)}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors"
              aria-label="Cerrar notificaciones"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {renderGroup('Hoy', todayNotifications)}
          {renderGroup('Antes', beforeNotifications)}

          {notifications.length === 0 && (
            <div className="py-12 text-center text-xs text-[var(--text-muted)]">
              No tenés notificaciones pendientes.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 px-5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] flex justify-between items-center text-xs text-[var(--text-muted)]">
          <span className="font-mono-data text-[11px]">ISFDyT N° 26</span>
          <button
            type="button"
            onClick={markAllNotificationsAsRead}
            className="text-[var(--brand-blue)] font-medium hover:underline cursor-pointer"
          >
            Marcar todas como leídas
          </button>
        </div>
      </div>
    </div>
  );
};
