import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  BookOpen,
  User,
  Clock,
  MapPin,
  GraduationCap,
  ClipboardList,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import type { Subject, GradeItem } from '../../types';
import { mockGrades } from '../../mocks/mockData';

interface SubjectDetailModalProps {
  subject: Subject | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({
  subject,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<string>('info');

  if (!subject) return null;

  // Filtrar notas asociadas a esta materia
  const subjectGrades = mockGrades.filter((g) => g.materiaId === subject.id);

  const tabs = [
    { id: 'info', label: 'Información General' },
    { id: 'notas', label: `Calificaciones (${subjectGrades.length})` },
    { id: 'asistencia', label: 'Asistencia & Faltas' },
    { id: 'horarios', label: 'Horarios & Aulas' },
  ];

  const isWarning = subject.porcentajeAsistencia <= 75;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={subject.nombre}
      description={`Código: ${subject.codigo} · Comisión ${subject.comision}`}
      maxWidth="xl"
      footer={
        <Button variant="outline" size="sm" onClick={onClose}>
          Cerrar Detalle
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Modal Segmented Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} size="sm" />

        {/* Tab 1: Info General */}
        {activeTab === 'info' && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-[calc(var(--radius-current)-2px)] bg-[var(--bg-surface-elevated)] border border-subtle-custom space-y-1">
                <span className="text-muted-custom block font-medium">Condición de Cursada</span>
                <div className="flex items-center gap-2">
                  <Badge variant={subject.estadoCursada === 'Promocionada' ? 'success' : 'default'}>
                    {subject.estadoCursada}
                  </Badge>
                  <span className="text-secondary-custom">2° Cuatrimestre</span>
                </div>
              </div>

              <div className="p-3 rounded-[calc(var(--radius-current)-2px)] bg-[var(--bg-surface-elevated)] border border-subtle-custom space-y-1">
                <span className="text-muted-custom block font-medium">Promedio Parcial</span>
                <span className="text-base font-bold text-primary-custom font-mono tabular-nums">
                  {subject.promedioParciales ? subject.promedioParciales.toFixed(2) : 'Sin evaluaciones'}
                </span>
              </div>
            </div>

            {/* Docentes a cargo */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-primary-custom">Equipo Docente a Cargo</h4>
              <div className="divide-y divide-subtle-custom border border-subtle-custom rounded-[calc(var(--radius-current)-2px)] bg-surface">
                {subject.docentes.map((doc) => (
                  <div key={doc.id} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-[var(--bg-surface-elevated)] flex items-center justify-center text-secondary-custom">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-semibold text-primary-custom block">{doc.nombre}</span>
                        <span className="text-[11px] text-secondary-custom">{doc.rol}</span>
                      </div>
                    </div>
                    <span className="text-muted-custom font-mono text-[11px]">{doc.email}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Correlatividades */}
            <div className="p-3 rounded-[calc(var(--radius-current)-2px)] bg-[var(--bg-surface-elevated)]/60 border border-subtle-custom text-xs space-y-1">
              <span className="font-semibold text-primary-custom block">Correlatividades Requeridas:</span>
              <div className="flex flex-wrap gap-2 text-secondary-custom">
                {subject.correlativas.map((c) => (
                  <span key={c} className="px-2 py-0.5 rounded bg-surface border border-subtle-custom text-[11px]">
                    ✓ {c} (Aprobada)
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Calificaciones */}
        {activeTab === 'notas' && (
          <div className="space-y-3 pt-1">
            {subjectGrades.length === 0 ? (
              <p className="text-xs text-secondary-custom p-6 text-center">
                No hay calificaciones registradas aún en esta materia.
              </p>
            ) : (
              <div className="divide-y divide-subtle-custom border border-subtle-custom rounded-[calc(var(--radius-current)-2px)] bg-surface">
                {subjectGrades.map((grade) => (
                  <div key={grade.id} className="p-3.5 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary-custom">{grade.tipoEvaluacion}</span>
                        <Badge variant={grade.estado === 'Aprobado' || grade.estado === 'Promocionado' ? 'success' : 'warning'}>
                          {grade.estado}
                        </Badge>
                      </div>
                      <p className="text-secondary-custom text-[11px]">{grade.observaciones}</p>
                      <span className="text-[10px] text-muted-custom block font-mono">
                        Evaluado: {grade.fechaEvaluacion}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-lg font-bold font-mono tabular-nums text-primary-custom block">
                        {grade.nota !== null ? grade.nota.toFixed(2) : 'Pendiente'}
                      </span>
                      {grade.ponderacion && (
                        <span className="text-[10px] text-muted-custom">Pondera: {grade.ponderacion}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Asistencia & Faltas */}
        {activeTab === 'asistencia' && (
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-[calc(var(--radius-current)-2px)] border border-subtle-custom bg-[var(--bg-surface-elevated)]/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-secondary-custom block">Porcentaje de Presentismo</span>
                  <span className={`text-2xl font-bold font-mono tabular-nums ${isWarning ? 'text-red-500' : 'text-primary-custom'}`}>
                    {subject.porcentajeAsistencia.toFixed(1)}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-secondary-custom block">Faltas Acumuladas</span>
                  <span className="text-base font-bold font-mono tabular-nums text-primary-custom">
                    {subject.asistenciasAusentes} <span className="text-xs font-normal text-muted-custom">/ máx {subject.limiteFaltas}</span>
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[var(--bg-muted)] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isWarning ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, subject.porcentajeAsistencia)}%` }}
                />
              </div>

              {isWarning && (
                <div className="p-2.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-2 text-xs text-red-600 dark:text-red-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Atención: te encontrás al límite del porcentaje reglamentario del 75%.</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded bg-surface border border-subtle-custom">
                <span className="text-muted-custom block text-[11px]">Presentes</span>
                <span className="font-bold text-emerald-600 font-mono text-sm">{subject.asistenciasPresentes}</span>
              </div>
              <div className="p-2.5 rounded bg-surface border border-subtle-custom">
                <span className="text-muted-custom block text-[11px]">Ausentes</span>
                <span className="font-bold text-red-500 font-mono text-sm">{subject.asistenciasAusentes}</span>
              </div>
              <div className="p-2.5 rounded bg-surface border border-subtle-custom">
                <span className="text-muted-custom block text-[11px]">Justificadas</span>
                <span className="font-bold text-amber-500 font-mono text-sm">{subject.asistenciasJustificadas}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Horarios & Aulas */}
        {activeTab === 'horarios' && (
          <div className="space-y-3 pt-1">
            {subject.horarios.map((h, i) => (
              <div
                key={i}
                className="p-3.5 rounded-[calc(var(--radius-current)-2px)] border border-subtle-custom bg-surface flex items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary-custom">{h.dia}</span>
                    <Badge variant={h.modalidad === 'Presencial' ? 'default' : 'info'}>
                      {h.modalidad}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-secondary-custom">
                    <MapPin className="w-3.5 h-3.5 text-muted-custom" />
                    <span>{h.aula}</span>
                  </div>
                </div>

                <div className="text-right font-mono text-primary-custom font-semibold">
                  {h.horarioInicio} - {h.horarioFin} hs
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
