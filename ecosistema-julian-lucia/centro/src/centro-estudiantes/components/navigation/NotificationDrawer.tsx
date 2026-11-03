/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Centro de notificaciones (hoja móvil y panel lateral escritorio)
 */

import React from 'react';
import {
  X,
  Check,
  Checks,
  ChatCircleDots,
  CalendarCheck,
  ChatsCircle,
  WarningCircle,
  ArrowRight,
  EnvelopeSimple,
  Bell,
} from '@phosphor-icons/react';
import { useCentro } from '../../context/CentroContext';
import { NotificacionItem } from '../../types';
import { todayISO } from '../../api/centro';

const TZ = 'America/Argentina/Buenos_Aires';
const diaLocal = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ });
const horaLocal = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-AR', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false });
const fechaLocal = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', { timeZone: TZ, day: '2-digit', month: '2-digit' });
const TIPO_LABEL: Record<NotificacionItem['tipo'], string> = {
  reclamo: 'RECLAMO',
  inscripcion: 'INSCRIPCIÓN',
  foro: 'FORO',
  denuncia: 'DENUNCIA',
  mensaje: 'MENSAJE',
  general: 'AVISO',
};

export const NotificationDrawer: React.FC = () => {
  const {
    openNotificationDrawer,
    setOpenNotificationDrawer,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setCurrentScreen,
    setSelectedDetailId,
  } = useCentro();

  if (!openNotificationDrawer) return null;

  // Agrupadas en "Hoy" y "Antes"
  const hoy = todayISO();
  const hoyList = notifications.filter((n) => diaLocal(n.fecha) === hoy);
  const antesList = notifications.filter((n) => diaLocal(n.fecha) !== hoy);

  const getIcon = (tipo: NotificacionItem['tipo']) => {
    switch (tipo) {
      case 'reclamo':
        return <ChatCircleDots weight="bold" className="w-4 h-4 text-brand-gold" />;
      case 'inscripcion':
        return <CalendarCheck weight="bold" className="w-4 h-4 text-emerald-600" />;
      case 'foro':
        return <ChatsCircle weight="bold" className="w-4 h-4 text-brand-blue" />;
      case 'denuncia':
        return <WarningCircle weight="bold" className="w-4 h-4 text-rose-600" />;
      case 'mensaje':
        return <EnvelopeSimple weight="bold" className="w-4 h-4 text-brand-navy dark:text-brand-gold-sand" />;
      default:
        return <Bell weight="bold" className="w-4 h-4 text-foreground-muted" />;
    }
  };

  const handleNotificationClick = (item: NotificacionItem) => {
    if (!item.leida) markNotificationAsRead(item.id);
    if (item.linkScreen) {
      setCurrentScreen(item.linkScreen);
      if (item.itemId) {
        setSelectedDetailId(item.itemId);
      }
    }
    setOpenNotificationDrawer(false);
  };

  const renderGroup = (title: string, list: NotificacionItem[]) => {
    if (list.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-foreground-muted tracking-wider uppercase px-1">
          {title}
        </div>
        <div className="space-y-1.5">
          {list.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              role="button"
              tabIndex={0}
              className={`p-3 rounded-xl border transition-colors cursor-pointer text-left flex items-start gap-3 select-none ${
                item.leida
                  ? 'bg-surface border-border-subtle hover:bg-surface-hover text-foreground-muted'
                  : 'bg-surface-card border-brand-gold/40 hover:border-brand-gold shadow-xs text-foreground'
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  item.leida
                    ? 'bg-surface-hover'
                    : 'bg-brand-navy/5 dark:bg-white/10'
                }`}
              >
                {getIcon(item.tipo)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className={`text-xs font-semibold truncate ${item.leida ? 'text-foreground' : 'text-brand-navy dark:text-brand-gold'}`}>
                    {item.titulo}
                  </div>
                  {!item.leida && (
                    <span className="w-2 h-2 rounded-full bg-brand-gold shrink-0" />
                  )}
                </div>
                <div className="text-xs text-foreground-muted mt-0.5 line-clamp-2">
                  {item.descripcion}
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-border-subtle/40 text-[10px] text-foreground-muted font-mono">
                  <span>
                    {diaLocal(item.fecha) === hoy ? '' : `${fechaLocal(item.fecha)} · `}
                    {horaLocal(item.fecha)} hs · {TIPO_LABEL[item.tipo]}
                  </span>
                  {item.linkScreen && (
                    <span className="flex items-center gap-1 text-brand-blue hover:underline font-sans">
                      Ver detalle <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-navy/60 dark:bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={() => setOpenNotificationDrawer(false)}
        aria-hidden="true"
      />

      {/* Drawer: Bottom sheet on mobile, slide-over on desktop */}
      <div
        role="dialog"
        aria-label="Centro de Notificaciones"
        className="fixed inset-x-0 bottom-0 lg:inset-y-0 lg:right-0 lg:left-auto lg:w-96 bg-surface-card border-t lg:border-t-0 lg:border-l border-border-subtle shadow-2xl rounded-t-3xl lg:rounded-none flex flex-col max-h-[85vh] lg:max-h-full z-10 transition-transform duration-200"
      >
        {/* Mobile Drag Handle */}
        <div className="lg:hidden w-10 h-1.5 bg-border-strong rounded-full mx-auto my-3" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <div>
            <div className="text-[10px] font-bold text-brand-gold uppercase tracking-wider">
              AVISOS INSTITUCIONALES
            </div>
            <h2 className="text-base font-heading font-bold text-foreground">
              Notificaciones
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              title="Marcar todas como leídas"
              className="text-xs text-brand-blue hover:underline flex items-center gap-1 p-2 rounded-md hover:bg-surface-hover min-h-[44px]"
            >
              <Checks weight="bold" className="w-4 h-4" />
              <span className="hidden sm:inline">Marcar leídas</span>
            </button>

            <button
              type="button"
              onClick={() => setOpenNotificationDrawer(false)}
              aria-label="Cerrar panel"
              className="p-2 text-foreground-muted hover:text-foreground rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            >
              <X weight="bold" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {renderGroup('Hoy', hoyList)}
          {renderGroup('Antes', antesList)}

          {notifications.length === 0 && (
            <div className="py-12 text-center text-sm text-foreground-muted">
              No hay notificaciones pendientes. ¡Todo al día!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
