import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState, EmptyState, ErrorState } from '../components/States';
import * as authorizationsApi from '../api/authorizations';
import { Authorization } from '../types/api';
import { formatDate, AUTHORIZATION_TYPE_LABELS } from '../types/dictionaries';
import { toast } from 'sonner';
import { 
  CheckSquare, 
  Check, 
  X, 
  LockKey, 
  Calendar, 
  MapPin, 
  ArrowClockwise,
  ChatCircleText
} from '@phosphor-icons/react';

export const AuthorizationsScreen: React.FC = () => {
  const { setActiveScreen, refreshBadges } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorizations, setAuthorizations] = useState<Authorization[]>([]);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  const loadAuthorizations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authorizationsApi.getAuthorizations();
      setAuthorizations(data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener las autorizaciones institucionales.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuthorizations();
  }, [loadAuthorizations]);

  const handleRespond = async (id: string, response: 'APPROVED' | 'REJECTED') => {
    setActionInProgressId(id);
    try {
      const updated = await authorizationsApi.respondAuthorization(id, response);
      setAuthorizations((prev) =>
        prev.map((a) => (a.id === id ? updated : a))
      );
      toast.success(
        response === 'APPROVED'
          ? 'Autorización otorgada y registrada correctamente.'
          : 'Respuesta registrada: No autoriza la actividad.'
      );
      await refreshBadges();
    } catch (err: any) {
      toast.error(err.message || 'Error al registrar la respuesta.');
    } finally {
      setActionInProgressId(null);
    }
  };

  if (loading) {
    return <LoadingState message="Consultando solicitudes de autorización vigentes..." />;
  }

  if (error) {
    return (
      <ErrorState
        message="No se pudieron cargar las autorizaciones"
        details={error}
        onRetry={loadAuthorizations}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <SectionHeader
        kicker="Consentimientos y Salidas Pedagógicas"
        title="Autorizaciones Institucionales"
        subtitle="Consentimientos legales requeridos para salidas didácticas, viajes de estudio y derechos de imagen."
        action={
          <button
            type="button"
            onClick={loadAuthorizations}
            className="p-2 rounded-xl border border-[var(--border)] bg-[var(--surface-card)] hover:bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Actualizar autorizaciones"
          >
            <ArrowClockwise className="w-4 h-4" />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        }
      />

      {authorizations.length === 0 ? (
        <EmptyState
          title="No hay autorizaciones pendientes ni registradas"
          description="Cuando la institución programe un viaje, salida didáctica o solicitud legal, figurará en este panel."
        />
      ) : (
        <div className="space-y-4">
          {authorizations.map((auth) => {
            const isPending = auth.response === 'PENDING';

            return (
              <div
                key={auth.id}
                className="rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] p-5 md:p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Encabezado */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]/60">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#89743A]">
                        {AUTHORIZATION_TYPE_LABELS[auth.type]}
                      </span>
                      <span className="text-[var(--text-muted)]">·</span>
                      <span className="text-xs font-semibold text-[var(--text)]">
                        Estudiante: <strong>{auth.childName}</strong>
                      </span>
                    </div>

                    <StatusBadge type="authorization" value={auth.response} />
                  </div>

                  {/* Detalle */}
                  <div className="mt-3">
                    <h2 className="text-base font-bold text-[var(--text)]">
                      {auth.title}
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-[var(--text)] leading-relaxed">
                      {auth.description}
                    </p>

                    {/* Metadatos adicionales */}
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
                      {auth.destination && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-[#89743A]" />
                          <span>Destino: <strong>{auth.destination}</strong></span>
                        </div>
                      )}
                      {auth.dateOfEvent && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#89743A]" />
                          <span>Fecha actividad: <strong>{formatDate(auth.dateOfEvent)}</strong></span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <LockKey className="w-4 h-4 text-[#89743A]" />
                        <span>Fecha límite para responder: <strong>{formatDate(auth.deadlineDate)}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones o Bloqueo */}
                <div className="mt-5 pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {isPending ? (
                    <>
                      <span className="text-xs text-[var(--text-muted)]">
                        Seleccioná tu decisión antes de la fecha límite:
                      </span>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          disabled={actionInProgressId === auth.id}
                          onClick={() => handleRespond(auth.id, 'REJECTED')}
                          className="px-4 py-2 rounded-xl text-xs font-bold border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          <span>No autorizo</span>
                        </button>
                        <button
                          type="button"
                          disabled={actionInProgressId === auth.id}
                          onClick={() => handleRespond(auth.id, 'APPROVED')}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#14214F] hover:bg-[#1D2D63] text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                        >
                          <Check className="w-4 h-4 text-[#AF9B63]" weight="bold" />
                          <span>Autorizo</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Regla §4.7: Una vez respondida, queda registrada con fecha y no se puede cambiar sola */
                    <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs">
                      <div className="flex items-center gap-2">
                        <LockKey className="w-4 h-4 text-[#89743A] shrink-0" weight="bold" />
                        <span>
                          Respuesta registrada el <strong>{auth.respondedAt}</strong> por <strong>{auth.responsiblePersonName || 'Responsable'}</strong>.
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[var(--text-muted)] italic">
                          Para modificar esta respuesta, por favor contactate con Preceptoría.
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveScreen('mensajes')}
                          className="text-[11px] font-bold text-[#89743A] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <ChatCircleText className="w-3.5 h-3.5" />
                          <span>Escribir</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
