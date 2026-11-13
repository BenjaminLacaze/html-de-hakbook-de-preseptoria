import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { SectionHeader } from '../components/SectionHeader';
import { LoadingState, EmptyState, ErrorState } from '../components/States';
import * as noticesApi from '../api/notices';
import { Notice } from '../types/api';
import { formatDate, formatDateTime } from '../types/dictionaries';
import { toast } from 'sonner';
import { 
  Bell, 
  WarningCircle, 
  CheckCircle, 
  Clock, 
  ArrowClockwise,
  Buildings
} from '@phosphor-icons/react';

export const NoticesScreen: React.FC = () => {
  const { refreshBadges } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [readingId, setReadingId] = useState<string | null>(null);

  const loadNotices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await noticesApi.getNotices();
      // Ordenar urgentes primero, y luego por fecha más reciente
      data.sort((a, b) => {
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;
        return b.date.localeCompare(a.date);
      });
      setNotices(data);
    } catch (err: any) {
      setError(err.message || 'Error al recuperar los comunicados institucionales.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  const handleMarkAsRead = async (noticeId: string) => {
    setReadingId(noticeId);
    try {
      const updated = await noticesApi.markNoticeRead(noticeId);
      setNotices((prev) =>
        prev.map((n) => (n.id === noticeId ? updated : n))
      );
      toast.success('Quedaste formalmente notificado/a de este comunicado.');
      await refreshBadges();
    } catch (err: any) {
      toast.error(err.message || 'No se pudo registrar la notificación.');
    } finally {
      setReadingId(null);
    }
  };

  if (loading) {
    return <LoadingState message="Consultando avisos y circulares institucionales..." />;
  }

  if (error) {
    return <ErrorState message="No se pudieron cargar los comunicados" details={error} onRetry={loadNotices} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <SectionHeader
        kicker="Circulares y Notificaciones Oficiales"
        title="Comunicados Institucionales"
        subtitle="Avisos emitidos por el Equipo Directivo, Secretaría y Preceptoría del ISFDyT N° 26."
        action={
          <button
            type="button"
            onClick={loadNotices}
            className="p-2 rounded-xl border border-[var(--border)] bg-[var(--surface-card)] hover:bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Actualizar comunicados"
          >
            <ArrowClockwise className="w-4 h-4" />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        }
      />

      {notices.length === 0 ? (
        <EmptyState
          title="No hay comunicados activos"
          description="En este momento no hay circulares institucionales dirigidas a las familias."
        />
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => {
            const isRead = notice.readByGuardian;

            return (
              <article
                key={notice.id}
                className={`rounded-2xl border p-5 md:p-6 transition-all ${
                  notice.isUrgent
                    ? 'border-red-300 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20 shadow-xs'
                    : 'border-[var(--border)] bg-[var(--surface-card)] shadow-xs'
                }`}
                aria-labelledby={`notice-title-${notice.id}`}
              >
                {/* Cabecera del comunicado */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]/60">
                  <div className="flex items-center gap-2 flex-wrap">
                    {notice.isUrgent && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-tight bg-red-600 text-white">
                        <WarningCircle className="w-3.5 h-3.5" weight="fill" />
                        Urgente
                      </span>
                    )}
                    <span className="text-xs font-bold text-[var(--text)] flex items-center gap-1">
                      <Buildings className="w-3.5 h-3.5 text-[#89743A]" />
                      {notice.author}
                    </span>
                    <span className="text-[var(--text-muted)]">·</span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">
                      {formatDate(notice.date)} a las {notice.time} hs
                    </span>
                  </div>

                  {/* Estado de notificación previa */}
                  {isRead ? (
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle className="w-4 h-4" weight="fill" />
                      <span>Notificado/a el {notice.readAt || formatDate(notice.date)}</span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      Pendiente de firma
                    </span>
                  )}
                </div>

                {/* Título y Cuerpo */}
                <div className="mt-3">
                  <h2
                    id={`notice-title-${notice.id}`}
                    className="text-base sm:text-lg font-bold text-[var(--text)] leading-snug"
                  >
                    {notice.title}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--text)] leading-relaxed whitespace-pre-line">
                    {notice.content}
                  </p>
                </div>

                {/* Botón de darse por notificado/a (Requisito §4.5) */}
                <div className="mt-4 pt-3 border-t border-[var(--border)]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[11px] text-[var(--text-muted)]">
                    * Al pulsar el botón queda asentada tu conformidad y fecha en el servidor central.
                  </span>

                  {!isRead ? (
                    <button
                      type="button"
                      disabled={readingId === notice.id}
                      onClick={() => handleMarkAsRead(notice.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#14214F] hover:bg-[#1D2D63] text-white flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4 text-[#AF9B63]" weight="bold" />
                      <span>
                        {readingId === notice.id ? 'Registrando firma...' : 'Me di por notificado/a'}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[var(--surface-subtle)] text-[var(--text-muted)] border border-[var(--border)] cursor-default flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Notificación registrada</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
