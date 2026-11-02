import React from 'react';
import {
  X,
  CheckCircle,
  Warning,
  ArrowsLeftRight,
  Bell,
  Checks,
} from '@phosphor-icons/react';
import { useAuxiliares } from '../context/AuxiliaresContext';
import { isToday } from 'date-fns';

export const NotificationsDrawer: React.FC = () => {
  const {
    notificationsOpen,
    setNotificationsOpen,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setCurrentScreen,
  } = useAuxiliares();

  if (!notificationsOpen) return null;

  const todayNotifs = notifications.filter((n) => isToday(new Date(n.timestamp)));
  const olderNotifs = notifications.filter((n) => !isToday(new Date(n.timestamp)));
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleItemClick = (notif: typeof notifications[0]) => {
    markNotificationRead(notif.id);
    setNotificationsOpen(false);
    if (notif.targetScreen) {
      setCurrentScreen(notif.targetScreen, notif.targetParams ?? {});
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'tarea':
        return <CheckCircle size={20} className="text-emerald-600 shrink-0" weight="fill" />;
      case 'incidencia':
        return <Warning size={20} className="text-red-500 shrink-0" weight="fill" />;
      case 'cambio_turno':
        return <ArrowsLeftRight size={20} className="text-[#3F78B6] shrink-0" weight="bold" />;
      default:
        return <Bell size={20} className="text-[#89743A] shrink-0" weight="fill" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Centro de notificaciones"
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity"
      onClick={() => setNotificationsOpen(false)}
    >
      <div
        className="w-full sm:max-w-md bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#14214F] text-white p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <Bell size={22} weight="fill" className="text-[#AF9B63]" />
            <h2 className="font-heading font-bold text-lg">Notificaciones</h2>
            {unreadCount > 0 && (
              <span className="bg-[#89743A] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {unreadCount} nuevas
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setNotificationsOpen(false)}
            className="touch-target p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
            aria-label="Cerrar notificaciones"
          >
            <X size={22} />
          </button>
        </div>

        {/* Action bar */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            {notifications.length} avisos en total
          </span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="touch-target text-[#3F78B6] dark:text-sky-400 hover:underline font-semibold flex items-center gap-1"
            >
              <Checks size={16} />
              Marcar todas como leídas
            </button>
          )}
        </div>

        {/* List of notifications */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell size={40} className="mx-auto mb-2 opacity-40" />
              <p className="font-medium">No tenés notificaciones</p>
              <p className="text-xs text-slate-400 mt-1">
                Los pedidos de cambio de turno y las respuestas de Dirección aparecerán acá.
              </p>
            </div>
          ) : (
            <>
              {/* Hoy */}
              {todayNotifs.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Hoy
                  </h3>
                  <div className="space-y-2">
                    {todayNotifs.map((notif) => (
                      <div
                        key={notif.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleItemClick(notif)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleItemClick(notif);
                          }
                        }}
                        className={`p-3 rounded-lg border transition-all text-left flex items-start gap-3 cursor-pointer ${
                          notif.read
                            ? 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-80 hover:opacity-100'
                            : 'bg-sky-50/70 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800 shadow-xs'
                        }`}
                      >
                        {getIcon(notif.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {notif.title}
                            </h4>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-[#3F78B6] shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                          <span className="text-[11px] font-mono text-slate-400 mt-1 block">
                            {new Date(notif.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Antes */}
              {olderNotifs.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Anteriores
                  </h3>
                  <div className="space-y-2">
                    {olderNotifs.map((notif) => (
                      <div
                        key={notif.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleItemClick(notif)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleItemClick(notif);
                          }
                        }}
                        className={`p-3 rounded-lg border transition-all text-left flex items-start gap-3 cursor-pointer ${
                          notif.read
                            ? 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-75'
                            : 'bg-sky-50/70 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800'
                        }`}
                      >
                        {getIcon(notif.type)}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {notif.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                          <span className="text-[11px] font-mono text-slate-400 mt-1 block">
                            {new Date(notif.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
