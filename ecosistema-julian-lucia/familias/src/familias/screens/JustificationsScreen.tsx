import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState, EmptyState, ErrorState } from '../components/States';
import * as justificationsApi from '../api/justifications';
import { Justification, DocumentType } from '../types/api';
import { formatDate, formatDateTime, DOCUMENT_TYPE_LABELS, JUSTIFICATION_STATUS_LABELS } from '../types/dictionaries';
import { toast } from 'sonner';
import { 
  FileText, 
  PlusCircle, 
  WarningCircle, 
  CheckCircle, 
  Clock, 
  Info,
  Calendar,
  XCircle
} from '@phosphor-icons/react';

export const JustificationsScreen: React.FC = () => {
  const { 
    selectedChild, 
    selectedChildId, 
    childrenList, 
    setSelectedChildId, 
    prefillJustificationDate, 
    setPrefillJustificationDate 
  } = useApp();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [justifications, setJustifications] = useState<Justification[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Formulario
  const [formChildId, setFormChildId] = useState<string>(selectedChildId || '');
  const [fromDate, setFromDate] = useState<string>(prefillJustificationDate || '');
  const [toDate, setToDate] = useState<string>(prefillJustificationDate || '');
  const [isRange, setIsRange] = useState<boolean>(false);
  const [reason, setReason] = useState<string>('');
  const [documentType, setDocumentType] = useState<DocumentType>('MEDICAL');
  const [documentName, setDocumentName] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedChildId) {
      setFormChildId(selectedChildId);
    }
  }, [selectedChildId]);

  useEffect(() => {
    if (prefillJustificationDate) {
      setFromDate(prefillJustificationDate);
      setToDate(prefillJustificationDate);
    }
  }, [prefillJustificationDate]);

  const loadJustifications = useCallback(async () => {
    if (!selectedChildId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await justificationsApi.getChildJustifications(selectedChildId);
      setJustifications(data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener las justificaciones.');
    } finally {
      setLoading(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    loadJustifications();
  }, [loadJustifications]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formChildId) {
      setFormError('Por favor seleccioná el estudiante.');
      return;
    }
    if (!fromDate) {
      setFormError('Indicá la fecha de inasistencia.');
      return;
    }
    const finalToDate = isRange && toDate ? toDate : fromDate;
    if (finalToDate < fromDate) {
      setFormError('La fecha "hasta" no puede ser anterior a la fecha "desde".');
      return;
    }
    if (!reason || reason.trim().length < 5) {
      setFormError('Detallá el motivo de la inasistencia (mínimo 5 caracteres).');
      return;
    }
    if (!documentName || documentName.trim().length < 3) {
      setFormError('Por favor escribí el nombre identificador del comprobante.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await justificationsApi.createJustification(formChildId, {
        fromDate,
        toDate: finalToDate,
        reason: reason.trim(),
        documentType,
        documentName: documentName.trim(),
      });

      // Si coincide con el hijo seleccionado actualmente, agregarlo
      if (formChildId === selectedChildId) {
        setJustifications((prev) => [created, ...prev]);
      } else {
        setSelectedChildId(formChildId);
      }

      toast.success('Solicitud de justificación presentada ante Preceptoría.');
      // Limpiar formulario y prefill
      setPrefillJustificationDate(null);
      setReason('');
      setDocumentName('');
      setFromDate('');
      setToDate('');
      setIsRange(false);
    } catch (err: any) {
      setFormError(err.message || 'No se pudo registrar la justificación.');
      toast.error(err.message || 'Error al presentar.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Cargando registro de justificaciones..." />;
  }

  if (error) {
    return <ErrorState message="No se pudieron consultar las justificaciones" details={error} onRetry={loadJustifications} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      <SectionHeader
        kicker={selectedChild ? `Estudiante: ${selectedChild.firstName} ${selectedChild.lastName}` : 'Módulo de Justificaciones'}
        title="Justificación de Inasistencias"
        subtitle="Presentá la notificación de inasistencia dentro del plazo reglamentario de 48 hs hábiles."
      />

      {/* Formulario de presentación */}
      <section aria-labelledby="form-justificacion-title">
        <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border)] p-5 md:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <PlusCircle className="w-5 h-5 text-[#89743A]" weight="bold" />
            <h2 id="form-justificacion-title" className="text-sm font-bold uppercase tracking-tight text-[var(--text)]">
              Nueva Solicitud de Justificación
            </h2>
          </div>

          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-300">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selección de estudiante */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="form-child" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  Estudiante a cargo *
                </label>
                <select
                  id="form-child"
                  value={formChildId}
                  onChange={(e) => setFormChildId(e.target.value)}
                  required
                  className="w-full py-2.5 px-3 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] font-semibold"
                >
                  {childrenList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.courseName} - {c.year})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de comprobante */}
              <div>
                <label htmlFor="form-doc-type" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  Tipo de Comprobante *
                </label>
                <select
                  id="form-doc-type"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                  required
                  className="w-full py-2.5 px-3 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
                >
                  <option value="MEDICAL">Certificado Médico</option>
                  <option value="WORK">Constancia Laboral</option>
                  <option value="FORCE_MAJEURE">Fuerza Mayor / Trámite Impostergable</option>
                </select>
              </div>
            </div>

            {/* Fechas */}
            <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[var(--text)]">
                  Fecha o Período de Inasistencia *
                </span>
                <label className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRange}
                    onChange={(e) => setIsRange(e.target.checked)}
                    className="rounded text-[var(--brand-navy)]"
                  />
                  <span>Es un rango de varios días</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="date-from" className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                    {isRange ? 'Fecha Desde' : 'Fecha de la falta'}
                  </label>
                  <input
                    id="date-from"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    required
                    className="w-full py-2 px-3 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] font-mono"
                  />
                </div>

                {isRange && (
                  <div>
                    <label htmlFor="date-to" className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                      Fecha Hasta
                    </label>
                    <input
                      id="date-to"
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      required
                      className="w-full py-2 px-3 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Nombre del comprobante (Requisito §4.6) */}
            <div>
              <label htmlFor="doc-name" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Nombre o Identificación del Comprobante *
              </label>
              <input
                id="doc-name"
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Ej: Certificado Dr. Pérez - Matrícula N° 12459"
                required
                className="w-full py-2.5 px-3 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
              />
              {/* Cartel explicativo obligatorio: todavía no hay subida de archivos */}
              <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-[var(--text-muted)] bg-[var(--surface-subtle)] p-2 rounded-lg border border-[var(--border)]">
                <Info className="w-4 h-4 text-[#89743A] shrink-0 mt-0.5" />
                <span>
                  <strong>Aviso importante:</strong> El sistema actualmente no admite carga digital de archivos adjuntos. Escribí el nombre y emisor del certificado. <strong>El comprobante físico original debe presentarse en Preceptoría</strong> para su archivo oficial en el legajo del estudiante.
                </span>
              </div>
            </div>

            {/* Motivo de la inasistencia */}
            <div>
              <label htmlFor="doc-reason" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Motivo Detallado de la Inasistencia *
              </label>
              <textarea
                id="doc-reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describí brevemente la causa de la inasistencia..."
                required
                className="w-full py-2.5 px-3 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="py-2.5 px-5 rounded-xl text-xs font-bold bg-[#14214F] hover:bg-[#1D2D63] text-white flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4 text-[#AF9B63]" weight="bold" />
                <span>{submitting ? 'Enviando a Preceptoría...' : 'Enviar Justificación'}</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Lista de justificaciones presentadas */}
      <section aria-labelledby="historial-justificaciones-title">
        <h2 id="historial-justificaciones-title" className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
          Historial de Justificaciones Presentadas ({justifications.length})
        </h2>

        {justifications.length === 0 ? (
          <EmptyState
            title="Sin justificaciones registradas"
            description="No se registran trámites de justificación para este estudiante durante el ciclo lectivo."
          />
        ) : (
          <div className="space-y-3">
            {justifications.map((just) => (
              <div
                key={just.id}
                className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <StatusBadge type="justification" value={just.status} />
                    <span className="text-xs font-bold text-[#89743A]">
                      {DOCUMENT_TYPE_LABELS[just.documentType]}
                    </span>
                    <span className="text-[var(--text-muted)]">·</span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">
                      Período: {formatDate(just.fromDate)} {just.toDate && just.toDate !== just.fromDate ? `al ${formatDate(just.toDate)}` : ''}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-[var(--text)] mt-1">
                    Comprobante declarado: {just.documentName}
                  </p>
                  <p className="text-xs text-[var(--text)] mt-0.5 leading-relaxed">
                    Motivo: "{just.reason}"
                  </p>

                  {/* Motivo de rechazo en caso de no ser aceptada (Requisito §4.6) */}
                  {just.status === 'REJECTED' && just.rejectionReason && (
                    <div className="mt-2.5 p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 text-xs text-red-800 dark:text-red-300 flex items-start gap-1.5">
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" weight="fill" />
                      <span>
                        <strong>Motivo de rechazo de Preceptoría:</strong> {just.rejectionReason}
                      </span>
                    </div>
                  )}

                  <p className="text-[10px] text-[var(--text-muted)] mt-2">
                    Presentada el {just.submissionDate}
                    {just.reviewedAt ? ` · Evaluada el ${formatDate(just.reviewedAt)}` : ''}
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
