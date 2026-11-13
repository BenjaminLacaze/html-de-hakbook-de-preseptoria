import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState, EmptyState, ErrorState } from '../components/States';
import * as childrenApi from '../api/children';
import * as agendaApi from '../api/agenda';
import * as noticesApi from '../api/notices';
import * as authorizationsApi from '../api/authorizations';
import * as messagesApi from '../api/messages';
import { AttendanceSummary, AgendaEvent, Notice, Authorization, Conversation } from '../types/api';
import { formatDate, formatTime, EVENT_CATEGORY_LABELS } from '../types/dictionaries';
import { 
  Student, 
  WarningCircle, 
  CheckSquare, 
  Bell, 
  ChatCircleText, 
  CalendarBlank, 
  ArrowRight,
  Clock,
  Sparkle,
  ArrowSquareOut
} from '@phosphor-icons/react';

interface ChildCardData {
  childId: string;
  firstName: string;
  lastName: string;
  courseName: string;
  year: string;
  shift: string;
  summary: AttendanceSummary | null;
}

export const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const { 
    childrenList, 
    setSelectedChildId, 
    setActiveScreen, 
    setPrefillJustificationDate,
    unreadNoticesCount,
    pendingAuthorizationsCount 
  } = useApp();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [childrenCards, setChildrenCards] = useState<ChildCardData[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<AgendaEvent[]>([]);
  const [unreadNotices, setUnreadNotices] = useState<Notice[]>([]);
  const [pendingAuths, setPendingAuths] = useState<Authorization[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<Conversation[]>([]);

  const loadHomeData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Cargar resúmenes de cada hijo
      const cards: ChildCardData[] = await Promise.all(
        childrenList.map(async (c) => {
          try {
            const summary = await childrenApi.getChildSummary(c.id);
            return {
              childId: c.id,
              firstName: c.firstName,
              lastName: c.lastName,
              courseName: c.courseName,
              year: c.year,
              shift: c.shift,
              summary,
            };
          } catch {
            return {
              childId: c.id,
              firstName: c.firstName,
              lastName: c.lastName,
              courseName: c.courseName,
              year: c.year,
              shift: c.shift,
              summary: null,
            };
          }
        })
      );
      setChildrenCards(cards);

      // 2. Próximos eventos combinados
      // Solo lo que viene: desde hoy (fecha de Argentina) en adelante.
      const todayAR = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date());
      const events = await agendaApi.getChildAgenda(undefined, { from: todayAR });
      setUpcomingEvents(events.slice(0, 4));

      // 3. Avisos no leídos
      const notices = await noticesApi.getNotices();
      setUnreadNotices(notices.filter((n) => !n.readByGuardian));

      // 4. Autorizaciones pendientes
      const auths = await authorizationsApi.getAuthorizations();
      setPendingAuths(auths.filter((a) => a.response === 'PENDING'));

      // 5. Mensajes no leídos
      const convs = await messagesApi.getConversations();
      setUnreadMessages(convs.filter((c) => c.unreadCount > 0));
    } catch (err: any) {
      setError(err.message || 'Error al cargar la información inicial.');
    } finally {
      setLoading(false);
    }
  }, [childrenList]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  if (loading) {
    return <LoadingState message="Recuperando estado de los estudiantes y avisos institucionales..." />;
  }

  if (error) {
    return <ErrorState message="No se pudo cargar el resumen general" details={error} onRetry={loadHomeData} />;
  }

  if (childrenList.length === 0) {
    return (
      <EmptyState
        title="Sin estudiantes vinculados a tu cargo"
        description="Si tenés hijos cursando en la institución y no figuran en este panel, por favor solicitá su vinculación a Preceptoría o Secretaría."
      />
    );
  }

  const totalItemsToAttend =
    unreadNotices.length +
    pendingAuths.length +
    unreadMessages.length +
    childrenCards.filter((c) => c.summary && c.summary.risk !== 'OK').length;

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Saludo Institucional */}
      <SectionHeader
        kicker="Resumen General Institucional"
        title={`Bienvenido/a, ${user?.firstName || 'Familia'}`}
        subtitle={`Panel central de consulta y seguimiento del ISFDyT N° 26. Tenés ${childrenList.length} ${
          childrenList.length === 1 ? 'estudiante a cargo' : 'estudiantes a cargo'
        }.`}
      />

      {/* Bloque "Para Atender" (urgencias, firmas, inasistencias) */}
      <section aria-labelledby="heading-para-atender">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 id="heading-para-atender" className="text-base font-extrabold uppercase tracking-tight text-[var(--text)]">
              Para Atender
            </h2>
            {totalItemsToAttend > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#89743A] text-white">
                {totalItemsToAttend} {totalItemsToAttend === 1 ? 'pendiente' : 'pendientes'}
              </span>
            ) : (
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                Al día
              </span>
            )}
          </div>
        </div>

        {totalItemsToAttend === 0 ? (
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] text-xs text-[var(--text-muted)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
              ✓
            </div>
            <div>
              <p className="font-bold text-[var(--text)]">Todo al día</p>
              <p>No tenés autorizaciones pendientes ni comunicados urgentes sin notificar.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Autorizaciones pendientes */}
            {pendingAuths.map((auth) => (
              <div
                key={auth.id}
                className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-[var(--surface-card)] flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5" />
                      Autorización requerida
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      Límite: {formatDate(auth.deadlineDate)}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-[var(--text)] leading-snug">
                    {auth.title}
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">
                    Estudiante: <strong>{auth.childName}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedChildId(auth.childId);
                    setActiveScreen('autorizaciones');
                  }}
                  className="mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-[#14214F] hover:bg-[#1D2D63] text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Responder ahora</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Comunicados sin leer */}
            {unreadNotices.map((notice) => (
              <div
                key={notice.id}
                className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-card)] flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5" />
                      {notice.isUrgent ? 'Comunicado Urgente' : 'Comunicado no leído'}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {formatDate(notice.date)}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-[var(--text)] leading-snug line-clamp-2">
                    {notice.title}
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">
                    Emisor: {notice.author}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveScreen('comunicados')}
                  className="mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-bold border border-[var(--border)] hover:bg-[var(--surface-subtle)] text-[var(--text)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Leer y darse por notificado/a</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Mensajes no leídos */}
            {unreadMessages.map((conv) => (
              <div
                key={conv.id}
                className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-card)] flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1">
                      <ChatCircleText className="w-3.5 h-3.5" />
                      Mensaje de {conv.participantName}
                    </span>
                    <span className="text-[10px] font-bold text-[#89743A]">
                      {conv.unreadCount} nuevo/s
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text)] italic line-clamp-2">
                    "{conv.lastMessage?.content}"
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveScreen('mensajes')}
                  className="mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-[var(--surface-subtle)] hover:bg-[var(--border)] text-[var(--text)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Ver conversación</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Inasistencias en riesgo */}
            {childrenCards
              .filter((c) => c.summary && c.summary.risk !== 'OK')
              .map((c) => (
                <div
                  key={c.childId}
                  className="p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400 mb-1">
                      <WarningCircle className="w-3.5 h-3.5" weight="fill" />
                      Alerta de asistencia
                    </div>
                    <h3 className="text-xs font-bold text-[var(--text)]">
                      {c.firstName} tiene asistencia en advertencia ({c.summary?.percentage}%)
                    </h3>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">
                      Le quedan únicamente {c.summary?.remainingAbsencesAllowed} inasistencias permitidas antes de perder la regularidad.
                    </p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChildId(c.childId);
                        setActiveScreen('asistencia');
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Ver Asistencia
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChildId(c.childId);
                        setActiveScreen('justificaciones');
                      }}
                      className="py-1.5 px-3 rounded-lg text-xs font-semibold border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 cursor-pointer"
                    >
                      Justificar
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Tarjeta por cada Hijo (Requisito §4: Inicio resume a todos juntos) */}
      <section aria-labelledby="heading-hijos">
        <h2 id="heading-hijos" className="text-base font-extrabold uppercase tracking-tight text-[var(--text)] mb-3">
          Estudiantes a Cargo ({childrenCards.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {childrenCards.map((card) => {
            const sum = card.summary;
            return (
              <div
                key={card.childId}
                className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] shadow-xs hover:border-[var(--brand-gold)] transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#14214F] text-white flex items-center justify-center font-extrabold text-base">
                        {card.firstName[0]}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-[var(--text)]">
                          {card.firstName} {card.lastName}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)]">
                          {card.courseName} · {card.year} ({card.shift})
                        </p>
                      </div>
                    </div>
                    {sum && <StatusBadge type="risk" value={sum.risk} />}
                  </div>

                  {/* Métricas clave */}
                  <div className="mt-4 pt-3 border-t border-[var(--border)] grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-[var(--surface-subtle)]">
                      <span className="block text-[10px] font-semibold uppercase text-[var(--text-muted)]">
                        Asistencia
                      </span>
                      <span className="text-base font-bold tabular-nums text-[var(--text)]">
                        {sum ? `${sum.percentage}%` : '—'}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--surface-subtle)]">
                      <span className="block text-[10px] font-semibold uppercase text-[var(--text-muted)]">
                        Faltas rest.
                      </span>
                      <span className={`text-base font-bold tabular-nums ${
                        sum && sum.remainingAbsencesAllowed <= 1 ? 'text-red-600 font-black' : 'text-[var(--text)]'
                      }`}>
                        {sum ? sum.remainingAbsencesAllowed : '—'}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--surface-subtle)]">
                      <span className="block text-[10px] font-semibold uppercase text-[var(--text-muted)]">
                        Condición
                      </span>
                      <span className="text-xs font-bold text-[var(--text)]">
                        {sum?.risk === 'OK' ? 'Regular' : 'En advert.'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedChildId(card.childId);
                      setActiveScreen('asistencia');
                    }}
                    className="text-xs font-semibold text-[var(--text)] hover:text-[#89743A] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Asistencia</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedChildId(card.childId);
                      setActiveScreen('calificaciones');
                    }}
                    className="text-xs font-semibold text-[var(--text)] hover:text-[#89743A] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Calificaciones</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedChildId(card.childId);
                      setActiveScreen('justificaciones');
                    }}
                    className="text-xs font-bold text-[#89743A] hover:underline cursor-pointer"
                  >
                    Justificar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Próximos Eventos Institucionales de todos los hijos */}
      <section aria-labelledby="heading-agenda-inicio">
        <div className="flex items-center justify-between mb-3">
          <h2 id="heading-agenda-inicio" className="text-base font-extrabold uppercase tracking-tight text-[var(--text)]">
            Próximos Eventos (Todos los Estudiantes)
          </h2>
          <button
            type="button"
            onClick={() => setActiveScreen('agenda')}
            className="text-xs font-bold text-[#89743A] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Ver agenda completa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {upcomingEvents.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] italic">
            No hay eventos programados en los próximos días.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcomingEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-card)] flex items-start gap-3 shadow-xs"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] flex flex-col items-center justify-center shrink-0 text-center font-mono">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                    {ev.date.split('-')[1]}
                  </span>
                  <span className="text-base font-extrabold text-[var(--text)]">
                    {ev.date.split('-')[2]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#89743A]">
                      {EVENT_CATEGORY_LABELS[ev.category]}
                    </span>
                    {ev.childName && (
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">
                        · {ev.childName}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-[var(--text)] truncate mt-0.5">
                    {ev.title}
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{ev.startTime ? `${ev.startTime} hs` : 'Todo el día'} · {ev.location}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
