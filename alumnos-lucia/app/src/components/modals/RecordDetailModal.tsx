/**
 * Modal de Detalle de Registro de Asistencia
 * Muestra información oficial completa en modo solo lectura
 */

import React, { useEffect } from 'react';
import { AttendanceRecord } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { formatDateDisplay } from '../../services/attendanceService';
import { X, Calendar, Clock, BookOpen, UserCheck, FileText, AlertCircle } from 'lucide-react';

interface RecordDetailModalProps {
  record: AttendanceRecord | null;
  onClose: () => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({ record, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!record) return null;

  const getComputationDescription = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'PRESENTE':
        return 'Computa 1.0 unidad de jornada asistida (100% computable).';
      case 'TARDE':
        return 'Computa 0.5 unidades de asistencia (media falta reglamentaria según pauta institucional).';
      case 'JUSTIFICADO':
        return 'Ausencia contemplada con certificado válido; no computa como inasistencia injustificada.';
      case 'AUSENTE':
        return 'Inasistencia no justificada; computa 0.0 unidades de asistencia.';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Encabezado del modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <div>
            <h2 id="modal-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              Detalle del Registro Oficial
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Identificador del registro: <span className="font-mono text-slate-700 dark:text-slate-300">{record.id}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label="Cerrar ventana de detalles"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-sm">
          {/* Materia y Estado */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <BookOpen size={14} />
                <span>Espacio Curricular</span>
              </div>
              <p className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                {record.subjectName}
              </p>
            </div>
            <div className="shrink-0">
              <StatusBadge status={record.status} size="md" />
            </div>
          </div>

          {/* Grilla de datos temporales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-md">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Calendar size={14} />
                <span>Fecha</span>
              </div>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {formatDateDisplay(record.date)}
              </p>
              <p className="text-xs font-mono text-slate-500 mt-0.5">{record.date}</p>
            </div>

            <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-md">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Clock size={14} />
                <span>Horario y Período</span>
              </div>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {record.time} hs · {record.academicPeriod === '1C' ? '1° Cuatrimestre' : '2° Cuatrimestre'}
              </p>
            </div>
          </div>

          {/* Criterio de cómputo reglamentario */}
          <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-md">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">
              Cómputo Reglamentario de Asistencia
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
              {getComputationDescription(record.status)}
            </p>
          </div>

          {/* Observaciones oficiales */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText size={14} />
              <span>Observaciones Oficiales</span>
            </label>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
              {record.observation || 'Sin observaciones registradas por la preceptoría para este día.'}
            </div>
          </div>

          {/* Justificación o constancia si existe */}
          {record.justificationDocNumber && (
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Constancia Legal Vinculada
              </p>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-0.5">
                N° Documento: {record.justificationDocNumber}
              </p>
              {record.preceptorNote && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                  Nota: {record.preceptorNote}
                </p>
              )}
            </div>
          )}

          {/* Asentado por */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
            <UserCheck size={14} />
            <span>Asentado en el libro por:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{record.registeredBy}</span>
          </div>

          {/* Nota de integridad y restricción de edición */}
          <div className="flex items-start gap-2.5 p-3 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
            <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Registro Institucional Oficial</p>
              <p className="mt-0.5 leading-relaxed text-amber-800 dark:text-amber-300">
                El Módulo Alumno opera bajo estricto modo de consulta. Si detectas alguna inconsistencia o necesitas presentar justificación médica, acércate a la oficina de Preceptoría o Secretaría con tu certificado correspondiente.
              </p>
            </div>
          </div>
        </div>

        {/* Pie del modal */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            Cerrar detalle
          </button>
        </div>
      </div>
    </div>
  );
};
