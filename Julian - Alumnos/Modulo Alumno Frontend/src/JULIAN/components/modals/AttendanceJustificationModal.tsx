import React, { useState } from 'react';
import { X, Upload, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { getBorderRadiusClass } from '../../styles/themes';

export const AttendanceJustificationModal: React.FC = () => {
  const {
    justifyingRecord,
    setJustifyingRecord,
    submitJustification,
    appearance,
    themeColors
  } = usePortal();

  const [reason, setReason] = useState('');
  const [fileSelected, setFileSelected] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  if (!justifyingRecord) return null;

  const radius = getBorderRadiusClass(appearance.borderStyle);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    const ok = await submitJustification(
      justifyingRecord.id,
      reason,
      fileSelected || 'constancia_justificacion.pdf'
    );
    setIsSubmitting(false);

    if (ok) {
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
        setJustifyingRecord(null);
        setReason('');
        setFileSelected(null);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        style={{
          backgroundColor: themeColors.bgCard,
          borderColor: themeColors.borderSubtle
        }}
        className={`w-full max-w-lg border p-6 shadow-2xl relative ${radius.card}`}
      >
        <button
          onClick={() => setJustifyingRecord(null)}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {successMessage ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 style={{ color: themeColors.textPrimary }} className="text-lg font-bold">
              Justificación enviada a Preceptoría
            </h3>
            <p style={{ color: themeColors.textMuted }} className="text-xs max-w-sm mx-auto">
              Tu solicitud quedó en estado "Pendiente" de auditoría. El preceptor notificará la resolución.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <span
                style={{ color: themeColors.accentGold }}
                className="text-xs font-bold uppercase tracking-wider block mb-1"
              >
                Módulo Preceptoría · Solicitud de Descargo
              </span>
              <h2 style={{ color: themeColors.textPrimary }} className="text-lg font-bold">
                Justificar Inasistencia
              </h2>
              <div
                style={{ backgroundColor: themeColors.bgSubtle }}
                className={`mt-3 p-3 text-xs ${radius.inner} space-y-1`}
              >
                <div className="flex justify-between">
                  <span style={{ color: themeColors.textMuted }}>Materia:</span>
                  <span style={{ color: themeColors.textPrimary }} className="font-semibold">
                    {justifyingRecord.subjectName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: themeColors.textMuted }}>Fecha y horario:</span>
                  <span style={{ color: themeColors.textPrimary }} className="tabular-nums">
                    {justifyingRecord.date} · {justifyingRecord.time} hs ({justifyingRecord.hoursCount} hs cátedra)
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  style={{ color: themeColors.textPrimary }}
                  className="block text-xs font-semibold mb-1"
                >
                  Motivo institucional o personal *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Detallá el motivo justificado (ej. certificado médico, superposición laboral con constancia de empleador, etc.)"
                  style={{
                    backgroundColor: themeColors.bgPage,
                    borderColor: themeColors.borderSubtle,
                    color: themeColors.textPrimary
                  }}
                  className={`w-full p-3 text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${radius.inner}`}
                />
              </div>

              <div>
                <label
                  style={{ color: themeColors.textPrimary }}
                  className="block text-xs font-semibold mb-1"
                >
                  Adjuntar Comprobante (Certificado / PDF / Imagen)
                </label>
                <div
                  style={{
                    borderColor: themeColors.borderStrong,
                    backgroundColor: themeColors.bgPage
                  }}
                  className={`border-2 border-dashed p-4 text-center ${radius.inner}`}
                >
                  {fileSelected ? (
                    <div className="flex items-center justify-between text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="truncate">{fileSelected}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFileSelected(null)}
                        className="text-red-500 text-xs font-bold px-1"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                      <div className="text-xs text-slate-500">
                        Arrastrá tu archivo o seleccioná una muestra de demostración:
                      </div>
                      <div className="mt-2 flex flex-wrap justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFileSelected('certificado_medico_laboral_octubre.pdf')}
                          className="text-[11px] px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                          + Certificado Médico.pdf
                        </button>
                        <button
                          type="button"
                          onClick={() => setFileSelected('constancia_empleador_jornada.pdf')}
                          className="text-[11px] px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                          + Constancia Laboral.pdf
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: themeColors.warningBg,
                  borderColor: themeColors.warningBorder
                }}
                className={`p-3 border text-[11px] flex items-start gap-2 ${radius.inner}`}
              >
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span style={{ color: themeColors.warningText }}>
                  Nota reglamentaria: Las justificaciones deben presentarse dentro de las 48 hs hábiles posteriores a la inasistencia.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setJustifyingRecord(null)}
                  style={{
                    backgroundColor: themeColors.bgSubtle,
                    color: themeColors.textSecondary
                  }}
                  className={`px-4 py-2 text-xs font-medium ${radius.button}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !reason.trim()}
                  style={{
                    backgroundColor: themeColors.accentGold,
                    color: '#FFFFFF'
                  }}
                  className={`px-4 py-2 text-xs font-semibold shadow-xs disabled:opacity-50 ${radius.button}`}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar a Preceptoría'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
