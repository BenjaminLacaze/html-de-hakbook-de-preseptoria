import React, { useMemo, useState } from 'react';
import {
  ArrowsLeftRight,
  Paperclip,
  User,
  ShieldWarning,
  Trash,
  Info,
} from '@phosphor-icons/react';
import { useAuxiliares, todayISO } from '../context/AuxiliaresContext';
import {
  STAFF_ABSENCE_REASONS,
  STAFF_ABSENCE_REASON_LABELS,
  shiftTimeLabel,
  type StaffAbsenceReason,
} from '../api';
import type { AbsenceStatus, Shift, SwapStatus } from '../types';
import { toast } from 'sonner';

const SWAP_STATUS_LABELS: Record<SwapStatus, string> = {
  pendiente: 'Pendiente',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
};

const swapStatusClass = (status: SwapStatus) =>
  status === 'aceptada'
    ? 'bg-emerald-100 text-emerald-800'
    : status === 'rechazada'
    ? 'bg-red-100 text-red-800'
    : status === 'cancelada'
    ? 'bg-slate-200 text-slate-700'
    : 'bg-amber-100 text-amber-800';

const ABSENCE_STATUS_LABELS: Record<AbsenceStatus, string> = {
  en_revision: 'En revisión',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
};

const absenceStatusClass = (status: AbsenceStatus) =>
  status === 'aprobada'
    ? 'bg-emerald-100 text-emerald-800'
    : status === 'rechazada'
    ? 'bg-red-100 text-red-800'
    : 'bg-amber-100 text-amber-800';

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return d && m && y ? `${d}/${m}/${y}` : iso;
};

/** "Lun 03/11 · 07:00 – 13:00" */
const shiftOptionLabel = (s: Shift) => {
  const day = new Date(`${s.date}T12:00:00`).toLocaleDateString('es-AR', { weekday: 'short' });
  return `${day} ${formatDate(s.date)} · ${shiftTimeLabel(s)}`;
};

/** Solo se pueden intercambiar turnos de trabajo futuros (no francos ni feriados). */
const isSwappable = (s: Shift, today: string) =>
  s.date >= today && (s.type === 'normal' || s.type === 'cambio');

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

export const JustificacionesScreen: React.FC = () => {
  const {
    me,
    turnSwaps,
    absences,
    requestTurnSwap,
    respondToTurnSwap,
    cancelTurnSwap,
    submitAbsence,
    withdrawAbsence,
    shifts,
    teamShifts,
    people,
    screenParams,
  } = useAuxiliares();

  type TabType = 'justificar' | 'pedir_cambio' | 'recibidas' | 'enviadas';
  const [activeTab, setActiveTab] = useState<TabType>(
    screenParams?.tab === 'cambio'
      ? 'pedir_cambio'
      : screenParams?.tab === 'recibidas'
      ? 'recibidas'
      : 'justificar'
  );
  const [busy, setBusy] = useState(false);
  const today = todayISO();
  const isStaff = me.user.roles.includes('STAFF');

  // Tab 1: Justificar ausencia state
  const [absenceFrom, setAbsenceFrom] = useState(today);
  const [absenceTo, setAbsenceTo] = useState('');
  const [absenceReason, setAbsenceReason] = useState<StaffAbsenceReason>('SICK_LEAVE');
  const [absenceNotes, setAbsenceNotes] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');

  // Tab 2: Pedir cambio state (IDs reales de /staff/shifts)
  const myOptions = useMemo(
    () => shifts.filter((s) => isSwappable(s, today)),
    [shifts, today]
  );
  const colleagues = useMemo(() => people.filter((p) => p.id !== me.user.id), [people, me]);
  const [myShiftId, setMyShiftId] = useState('');
  const [colleagueId, setColleagueId] = useState('');
  const [colleagueShiftId, setColleagueShiftId] = useState('');
  const [swapReason, setSwapReason] = useState('');

  const colleagueOptions = useMemo(
    () =>
      teamShifts.filter(
        (s) =>
          s.userId !== me.user.id &&
          (!colleagueId || s.userId === colleagueId) &&
          isSwappable(s, today)
      ),
    [teamShifts, colleagueId, me, today]
  );

  const myShift = myOptions.find((s) => s.id === myShiftId);
  const theirShift = colleagueOptions.find((s) => s.id === colleagueShiftId);

  // Turn swaps filtered
  const receivedSwaps = turnSwaps.filter((s) => s.direction === 'recibida');
  const sentSwaps = turnSwaps.filter((s) => s.direction === 'enviada');

  const handleAbsenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (absenceNotes.trim().length < 3) {
      toast.error('Por favor describí el motivo de la justificación');
      return;
    }
    if (absenceTo && absenceTo < absenceFrom) {
      toast.error('La fecha "hasta" es anterior a "desde"');
      return;
    }
    if (documentUrl.trim() && !isValidUrl(documentUrl.trim())) {
      toast.error('El enlace del comprobante no es válido (tiene que empezar con https://)');
      return;
    }

    setBusy(true);
    const ok = await submitAbsence({
      fromDate: absenceFrom,
      toDate: absenceTo || undefined,
      reason: absenceReason,
      notes: absenceNotes.trim(),
      documentName: documentName.trim() || undefined,
      documentUrl: documentUrl.trim() || undefined,
    });
    setBusy(false);
    if (!ok) return;

    toast.success('Justificación enviada a Dirección', {
      description: 'Estado: En revisión.',
    });
    setAbsenceNotes('');
    setAbsenceTo('');
    setDocumentName('');
    setDocumentUrl('');
  };

  const handleWithdrawAbsence = async (id: string) => {
    if (!confirm('¿Retirar este pedido de justificación?')) return;
    if (await withdrawAbsence(id)) toast.info('Pedido retirado');
  };

  const handleSwapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myShift || !theirShift) {
      toast.error('Elegí tu turno y el turno de tu compañero/a');
      return;
    }
    setBusy(true);
    const ok = await requestTurnSwap({
      requesterShiftId: myShift.id,
      colleagueShiftId: theirShift.id,
      reason: swapReason.trim() || undefined,
    });
    setBusy(false);
    if (!ok) return;

    toast.success('Solicitud de cambio enviada', {
      description: `Se notificó a ${theirShift.userName}.`,
    });
    setSwapReason('');
    setMyShiftId('');
    setColleagueShiftId('');
    setActiveTab('enviadas');
  };

  const handleRespondSwap = async (swapId: string, accept: boolean) => {
    setBusy(true);
    const ok = await respondToTurnSwap(swapId, accept);
    setBusy(false);
    if (!ok) return;
    if (accept) {
      toast.success('Intercambio aceptado', {
        description: 'Los turnos ya quedaron cambiados en el cronograma.',
      });
    } else {
      toast.info('Solicitud rechazada');
    }
  };

  const handleCancelSwap = async (swapId: string) => {
    setBusy(true);
    const ok = await cancelTurnSwap(swapId);
    setBusy(false);
    if (ok) toast.info('Solicitud cancelada');
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#89743A] uppercase tracking-wider block">
          Administración de personal
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-slate-100">
          Justificaciones y <span className="text-[#89743A]">Cambios</span>
        </h1>
        <div className="w-12 h-0.5 bg-[#89743A] mt-1" />
      </div>

      {!isStaff && (
        <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-200 flex items-center gap-2">
          <Info size={18} className="shrink-0" />
          <span>
            Pedir justificaciones o cambios de turno es solo para cuentas de auxiliar. Con esta
            cuenta podés consultar, pero el sistema rechazará los pedidos nuevos.
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('justificar')}
          className={`touch-target px-4 py-2.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'justificar'
              ? 'border-[#14214F] text-[#14214F] dark:border-sky-400 dark:text-sky-300'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Justificar ausencia
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pedir_cambio')}
          className={`touch-target px-4 py-2.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'pedir_cambio'
              ? 'border-[#14214F] text-[#14214F] dark:border-sky-400 dark:text-sky-300'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Pedir cambio de turno
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('recibidas')}
          className={`touch-target px-4 py-2.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'recibidas'
              ? 'border-[#14214F] text-[#14214F] dark:border-sky-400 dark:text-sky-300'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <span>Recibidas</span>
          {receivedSwaps.filter((s) => s.status === 'pendiente').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#89743A]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('enviadas')}
          className={`touch-target px-4 py-2.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'enviadas'
              ? 'border-[#14214F] text-[#14214F] dark:border-sky-400 dark:text-sky-300'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Enviadas ({sentSwaps.length})
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: JUSTIFICAR AUSENCIA                                     */}
      {/* ============================================================== */}
      {activeTab === 'justificar' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-slate-100">
              Registrar comprobante o justificación
            </h3>

            <form onSubmit={handleAbsenceSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Desde <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={absenceFrom}
                    onChange={(e) => setAbsenceFrom(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Hasta (si fue más de un día)
                  </label>
                  <input
                    type="date"
                    min={absenceFrom}
                    value={absenceTo}
                    onChange={(e) => setAbsenceTo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  Motivo institucional <span className="text-red-500">*</span>
                </label>
                <select
                  value={absenceReason}
                  onChange={(e) => setAbsenceReason(e.target.value as StaffAbsenceReason)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium"
                >
                  {STAFF_ABSENCE_REASONS.map((code) => (
                    <option key={code} value={code}>
                      {STAFF_ABSENCE_REASON_LABELS[code]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  Detalle explicativo <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={absenceNotes}
                  onChange={(e) => setAbsenceNotes(e.target.value)}
                  placeholder="Explicá brevemente la situación para Dirección..."
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                />
              </div>

              {/* Comprobante: por ahora solo nombre y enlace (no hay subida de archivos) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                  Certificado o comprobante (opcional)
                </label>
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <Info size={15} className="shrink-0 mt-0.5" />
                  <span>
                    Todavía no se pueden subir archivos desde el panel. Anotá qué comprobante
                    tenés (y, si está en la nube, pegá el enlace) y entregá el original en
                    Dirección.
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={200}
                  placeholder="Ej: Certificado médico del 03/11"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                />
                <input
                  type="url"
                  placeholder="Enlace al comprobante (opcional) — https://..."
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="touch-target w-full py-3 rounded-lg bg-[#89743A] hover:brightness-110 active:brightness-95 text-white font-bold text-sm shadow-md disabled:opacity-60"
                >
                  {busy ? 'Enviando…' : 'Enviar justificación a Dirección'}
                </button>
                <p className="text-center text-xs text-slate-400 mt-2">
                  Quedará con estado "En revisión" hasta que Dirección la apruebe o rechace.
                </p>
              </div>
            </form>
          </div>

          {/* Historial de ausencias registradas */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3 h-fit">
            <h4 className="font-heading font-bold text-base text-slate-900 dark:text-slate-100">
              Justificaciones recientes
            </h4>
            {absences.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No tenés ausencias registradas.</p>
            ) : (
              <div className="space-y-3">
                {absences.map((abs) => (
                  <div
                    key={abs.id}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {formatDate(abs.fromDate)}
                        {abs.toDate !== abs.fromDate ? ` al ${formatDate(abs.toDate)}` : ''}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${absenceStatusClass(
                          abs.status
                        )}`}
                      >
                        {ABSENCE_STATUS_LABELS[abs.status]}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {abs.reasonLabel}
                    </p>
                    <p className="text-slate-500 italic">"{abs.notes}"</p>
                    {(abs.documentName || abs.documentUrl) && (
                      <div className="flex items-center gap-1 text-[11px] text-[#3F78B6] pt-1">
                        <Paperclip size={14} />
                        {abs.documentUrl ? (
                          <a
                            href={abs.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            {abs.documentName || 'Ver comprobante'}
                          </a>
                        ) : (
                          <span>{abs.documentName}</span>
                        )}
                      </div>
                    )}
                    {abs.reviewNotes && (
                      <p className="text-slate-500">Dirección: {abs.reviewNotes}</p>
                    )}
                    {abs.status === 'en_revision' && (
                      <button
                        type="button"
                        onClick={() => void handleWithdrawAbsence(abs.id)}
                        className="touch-target text-[11px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 pt-1"
                      >
                        <Trash size={14} />
                        Retirar pedido
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: PEDIR CAMBIO DE TURNO                                   */}
      {/* ============================================================== */}
      {activeTab === 'pedir_cambio' && (
        <div className="max-w-2xl bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-slate-100">
              Intercambio de turno entre auxiliares
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Elegí uno de tus turnos y uno de un compañero/a. Cuando lo acepte, el cronograma se
              actualiza solo.
            </p>
          </div>

          <form onSubmit={handleSwapSubmit} className="space-y-4">
            {/* Turno propio que se cede */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-xs font-bold text-[#14214F] dark:text-sky-300 uppercase tracking-wider block">
                1. Mi turno (el que cedés)
              </span>
              {myOptions.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  No tenés turnos de trabajo cargados en las próximas semanas.
                </p>
              ) : (
                <select
                  required
                  value={myShiftId}
                  onChange={(e) => setMyShiftId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs"
                >
                  <option value="">Elegí tu turno…</option>
                  {myOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {shiftOptionLabel(s)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Compañero y turno recibido */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-xs font-bold text-[#89743A] uppercase tracking-wider block">
                2. Turno del compañero/a (el que recibís)
              </span>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Auxiliar con quien intercambiar
                </label>
                <select
                  value={colleagueId}
                  onChange={(e) => {
                    setColleagueId(e.target.value);
                    setColleagueShiftId('');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold"
                >
                  <option value="">Todo el equipo</option>
                  {colleagues.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Turno que recibís
                </label>
                {colleagueOptions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    No hay turnos de compañeros cargados en las próximas semanas.
                  </p>
                ) : (
                  <select
                    required
                    value={colleagueShiftId}
                    onChange={(e) => setColleagueShiftId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs"
                  >
                    <option value="">Elegí el turno…</option>
                    {colleagueOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {colleagueId ? '' : `${s.userName} · `}
                        {shiftOptionLabel(s)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* VISTA PREVIA DEL INTERCAMBIO */}
            {myShift && theirShift && (
              <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border-2 border-sky-300 dark:border-sky-800 text-xs text-sky-950 dark:text-sky-100 space-y-1">
                <span className="font-bold text-[#14214F] dark:text-sky-300 uppercase tracking-wider block text-[11px]">
                  Vista previa del acuerdo:
                </span>
                <p className="text-sm font-mono font-bold">
                  Vos: {shiftOptionLabel(myShift)} ➔ {theirShift.userName}:{' '}
                  {shiftOptionLabel(theirShift)}
                </p>
              </div>
            )}

            {/* Motivo opcional */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Motivo del cambio (opcional)
              </label>
              <input
                type="text"
                maxLength={500}
                placeholder="Ej: Turno médico / Trámite familiar"
                value={swapReason}
                onChange={(e) => setSwapReason(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={busy || !myShift || !theirShift}
                className="touch-target w-full py-3 rounded-lg bg-[#89743A] hover:brightness-110 active:brightness-95 text-white font-bold text-sm shadow-md disabled:opacity-60"
              >
                {busy
                  ? 'Enviando…'
                  : theirShift
                  ? `Enviar solicitud a ${theirShift.userName}`
                  : 'Enviar solicitud'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: SOLICITUDES RECIBIDAS                                   */}
      {/* ============================================================== */}
      {activeTab === 'recibidas' && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-300 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <ShieldWarning size={18} className="shrink-0 text-[#89743A]" />
            <span>
              Al aceptar, los dos turnos se intercambian en el cronograma. Dirección puede ver
              todos los cambios.
            </span>
          </div>

          {receivedSwaps.length === 0 ? (
            <div className="p-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center text-slate-400">
              <ArrowsLeftRight size={40} className="mx-auto mb-2 opacity-40" />
              <p className="font-bold text-sm text-slate-600 dark:text-slate-300">
                No tenés solicitudes de cambio recibidas
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Cuando un compañero te proponga intercambiar un turno, aparecerá acá.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {receivedSwaps.map((swap) => (
                <div
                  key={swap.id}
                  className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User size={18} className="text-[#3F78B6]" />
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {swap.targetColleague} te propone un cambio
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${swapStatusClass(
                        swap.status
                      )}`}
                    >
                      {SWAP_STATUS_LABELS[swap.status]}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono space-y-1">
                    <p className="text-slate-600 dark:text-slate-300">
                      Entregás tu turno:{' '}
                      <strong>
                        {formatDate(swap.myShiftDate)} ({swap.myShiftTime})
                      </strong>
                    </p>
                    <p className="text-[#89743A] font-bold">
                      A cambio recibís: {formatDate(swap.targetShiftDate)} ({swap.targetShiftTime})
                    </p>
                  </div>

                  {swap.reason && (
                    <p className="text-xs text-slate-500 italic">Motivo: "{swap.reason}"</p>
                  )}

                  {swap.status === 'pendiente' && (
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleRespondSwap(swap.id, false)}
                        className="touch-target flex-1 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-60"
                      >
                        Rechazar
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleRespondSwap(swap.id, true)}
                        className="touch-target flex-1 py-2 rounded-lg bg-[#14214F] hover:bg-[#1E2E5D] text-white text-xs font-bold shadow-xs disabled:opacity-60"
                      >
                        Aceptar intercambio
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: SOLICITUDES ENVIADAS                                    */}
      {/* ============================================================== */}
      {activeTab === 'enviadas' && (
        <div className="space-y-3">
          {sentSwaps.length === 0 ? (
            <div className="p-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center text-slate-400">
              <p className="font-bold text-sm text-slate-600 dark:text-slate-300">
                No tenés solicitudes enviadas
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Podés pedir un cambio en la pestaña "Pedir cambio de turno".
              </p>
            </div>
          ) : (
            sentSwaps.map((swap) => (
              <div
                key={swap.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      Para: {swap.targetColleague}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${swapStatusClass(
                        swap.status
                      )}`}
                    >
                      {SWAP_STATUS_LABELS[swap.status]}
                    </span>
                  </div>
                  <p className="font-mono text-slate-500">
                    Vos ofrecés: {formatDate(swap.myShiftDate)} ({swap.myShiftTime}) ➔ A cambio:{' '}
                    {formatDate(swap.targetShiftDate)} ({swap.targetShiftTime})
                  </p>
                </div>

                {swap.status === 'pendiente' && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleCancelSwap(swap.id)}
                    className="touch-target text-xs text-red-600 hover:text-red-700 font-bold underline shrink-0 px-2 py-1 disabled:opacity-60"
                  >
                    Cancelar solicitud
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
