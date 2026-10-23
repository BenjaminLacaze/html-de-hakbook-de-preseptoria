import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Clock,
  QrCode,
  FileText,
  Send,
  HelpCircle,
  Filter,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { attendanceService } from '../../services/attendanceService';
import { subjectsService } from '../../services/subjectsService';
import { formatDate } from '../../lib/utils';
import type { AttendanceRecord } from '../../types';

export const AttendanceView: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedMateriaFilter, setSelectedMateriaFilter] = useState('todas');
  const [justifyingRecord, setJustifyingRecord] = useState<AttendanceRecord | null>(null);
  const [justificationReason, setJustificationReason] = useState('');
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  const { data: records, isLoading: isRecordsLoading } = useQuery({
    queryKey: ['attendanceRecords'],
    queryFn: () => attendanceService.getAttendanceRecords(),
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsService.getSubjects(),
  });

  const justifyMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      attendanceService.requestJustification(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendanceRecords'] });
      setJustifyingRecord(null);
      setJustificationReason('');
      setSubmissionFeedback('Solicitud de justificación enviada a Preceptoría (modo demostración).');
      setTimeout(() => setSubmissionFeedback(null), 4000);
    },
  });

  const handleJustifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justifyingRecord || !justificationReason.trim()) return;
    justifyMutation.mutate({ id: justifyingRecord.id, reason: justificationReason });
  };

  const filteredRecords = records?.filter((r) => {
    if (selectedMateriaFilter !== 'todas' && r.materiaId !== selectedMateriaFilter) {
      return false;
    }
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-primary-custom tracking-tight">
            Control de Asistencia & Faltas
          </h2>
          <p className="text-xs text-secondary-custom mt-0.5">
            Régimen institucional: mínimo 75% de presentismo por asignatura para mantener regularidad
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Select
            value={selectedMateriaFilter}
            onChange={(e) => setSelectedMateriaFilter(e.target.value)}
          >
            <option value="todas">Todas las asignaturas</option>
            {subjects?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Global & Per Subject Threshold Monitor */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects?.map((sub) => {
          const isWarning = sub.porcentajeAsistencia <= 75;
          const isCaution = sub.porcentajeAsistencia > 75 && sub.porcentajeAsistencia <= 85;

          return (
            <Card key={sub.id} className="p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-muted-custom font-semibold">
                    {sub.codigo}
                  </span>
                  <Badge variant={isWarning ? 'danger' : isCaution ? 'warning' : 'success'}>
                    {sub.porcentajeAsistencia.toFixed(1)}%
                  </Badge>
                </div>
                <h3 className="text-xs font-bold text-primary-custom mt-1.5 leading-snug line-clamp-1">
                  {sub.nombre}
                </h3>
                <p className="text-[11px] text-secondary-custom mt-0.5">
                  Faltas: <strong className="font-mono text-primary-custom">{sub.asistenciasAusentes}</strong> de <strong className="font-mono text-primary-custom">{sub.limiteFaltas}</strong> permitidas
                </p>

                {/* Progress bar */}
                <div className="mt-3 w-full bg-[var(--bg-muted)] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isWarning ? 'bg-red-500' : isCaution ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, sub.porcentajeAsistencia)}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-subtle-custom flex items-center justify-between text-[11px] text-muted-custom">
                <span>{sub.clasesDictadas} de {sub.totalClasesPrevistas} clases</span>
                <span className={isWarning ? 'text-red-500 font-bold' : ''}>
                  {sub.limiteFaltas - sub.asistenciasAusentes} falta(s) de margen
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {submissionFeedback && (
        <div className="p-3.5 rounded-[var(--radius-current)] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{submissionFeedback}</span>
        </div>
      )}

      {/* Chronological Table of Attendance Records */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Historial Cronológico de Clases & Faltas</CardTitle>
            <p className="text-xs text-secondary-custom mt-0.5">
              Registros presenciales, escaneos QR y trámites de justificación
            </p>
          </div>
          <span className="text-xs text-muted-custom font-mono">
            {filteredRecords.length} registros
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {isRecordsLoading ? (
            <div className="p-5 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-subtle-custom bg-[var(--bg-surface-elevated)]/50 text-secondary-custom font-semibold">
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Asignatura</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Método</th>
                    <th className="py-3 px-4">Observaciones / Trámite</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle-custom">
                  {filteredRecords.map((rec) => {
                    const isAusente = rec.estado === 'Ausente';
                    const hasJustification = !!rec.estadoJustificacion;

                    return (
                      <tr key={rec.id} className="hover:bg-[var(--bg-surface-elevated)]/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-primary-custom whitespace-nowrap">
                          {formatDate(rec.fecha)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-primary-custom">
                          {rec.materiaNombre}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <Badge
                            variant={
                              rec.estado === 'Presente'
                                ? 'success'
                                : rec.estado === 'Justificada'
                                ? 'info'
                                : rec.estado === 'Tardanza'
                                ? 'warning'
                                : 'danger'
                            }
                          >
                            {rec.estado}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-secondary-custom whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                            {rec.metodoRegistro === 'QR Aula' && <QrCode className="w-3 h-3 text-[var(--accent-primary)]" />}
                            {rec.metodoRegistro}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-secondary-custom max-w-sm">
                          {rec.observacion || rec.justificacionDetalle || '—'}
                          {rec.estadoJustificacion && (
                            <span className="block text-[10px] text-amber-500 font-semibold mt-0.5">
                              Estado Trámite: {rec.estadoJustificacion}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {isAusente && (!rec.estadoJustificacion || rec.estadoJustificacion === 'Sin Trámite') ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => setJustifyingRecord(rec)}
                            >
                              Justificar
                            </Button>
                          ) : (
                            <span className="text-[11px] text-muted-custom">
                              {rec.estado === 'Presente' ? 'Registrado' : rec.estadoJustificacion || '—'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Justification Request Modal */}
      <Modal
        isOpen={!!justifyingRecord}
        onClose={() => setJustifyingRecord(null)}
        title="Solicitud de Justificación de Inasistencia"
        description="Trámite oficial sujeto a revisión y aprobación por Preceptoría"
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setJustifyingRecord(null)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleJustifySubmit}
              isLoading={justifyMutation.isPending}
              disabled={!justificationReason.trim()}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar a Preceptoría</span>
            </Button>
          </>
        }
      >
        {justifyingRecord && (
          <form onSubmit={handleJustifySubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded-[calc(var(--radius-current)-2px)] bg-[var(--bg-surface-elevated)] border border-subtle-custom space-y-1">
              <span className="text-secondary-custom">Asignatura: <strong className="text-primary-custom">{justifyingRecord.materiaNombre}</strong></span>
              <span className="block text-secondary-custom">Fecha de inasistencia: <strong className="text-primary-custom font-mono">{formatDate(justifyingRecord.fecha)}</strong></span>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-primary-custom block">
                Motivo de la inasistencia y documentación respaldatoria
              </label>
              <textarea
                value={justificationReason}
                onChange={(e) => setJustificationReason(e.target.value)}
                placeholder="Describí el motivo (e.g., certificado médico odontológico, constancia de horas extras laborales) y adjuntá el número de constancia..."
                rows={4}
                required
                className="w-full rounded-[var(--radius-current)] border border-subtle-custom bg-surface p-3 text-xs text-primary-custom placeholder:text-muted-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
              />
              <p className="text-[11px] text-muted-custom">
                Nota: La justificación de inasistencia es una solicitud administrativa y no modifica automáticamente el registro hasta su resolución oficial.
              </p>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
