import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  GraduationCap,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  AlertCircle,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { gradesService } from '../../services/gradesService';
import { subjectsService } from '../../services/subjectsService';
import { formatDate } from '../../lib/utils';
import type { GradeItem } from '../../types';

export const GradesView: React.FC = () => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('todas');
  const [selectedStatusTab, setSelectedStatusTab] = useState('todas');

  const { data: grades, isLoading: isGradesLoading } = useQuery({
    queryKey: ['grades'],
    queryFn: () => gradesService.getGrades(),
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsService.getSubjects(),
  });

  const statusTabs = [
    { id: 'todas', label: 'Todas las Notas' },
    { id: 'Aprobado', label: 'Aprobados' },
    { id: 'Promocionado', label: 'Promocionados' },
    { id: 'Pendiente', label: 'Pendientes' },
  ];

  const filteredGrades = grades?.filter((g) => {
    const matchesSubject = selectedSubjectFilter === 'todas' || g.materiaId === selectedSubjectFilter;
    const matchesStatus = selectedStatusTab === 'todas' || g.estado === selectedStatusTab;
    return matchesSubject && matchesStatus;
  }) || [];

  // Calcular promedio con notas numéricas válidas
  const publishedGrades = grades?.filter((g) => g.nota !== null) || [];
  const overallAverage =
    publishedGrades.length > 0
      ? publishedGrades.reduce((acc, curr) => acc + (curr.nota || 0), 0) / publishedGrades.length
      : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-primary-custom tracking-tight">
            Mis Calificaciones Oficiales
          </h2>
          <p className="text-xs text-secondary-custom mt-0.5">
            Registro de actas y notas cargadas por los equipos docentes de cátedra
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="print:hidden">
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Analítico Provisorio</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-5">
          <span className="text-xs font-medium text-secondary-custom block">Promedio General Ponderado</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-primary-custom">
              {overallAverage.toFixed(2)}
            </span>
            <span className="text-xs text-secondary-custom">/ 10.00</span>
          </div>
          <span className="text-[11px] text-muted-custom mt-2 block">
            Sobre {publishedGrades.length} evaluaciones registradas
          </span>
        </Card>

        <Card className="p-4 sm:p-5">
          <span className="text-xs font-medium text-secondary-custom block">Evaluaciones Aprobadas</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {publishedGrades.length}
            </span>
            <span className="text-xs text-secondary-custom">de {grades?.length || 0} totales</span>
          </div>
          <span className="text-[11px] text-muted-custom mt-2 block">
            100% de efectividad en parciales rendidos
          </span>
        </Card>

        <Card className="p-4 sm:p-5">
          <span className="text-xs font-medium text-secondary-custom block">Calificaciones Pendientes</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-500">
              {grades?.filter((g) => g.estado === 'Pendiente').length || 1}
            </span>
            <span className="text-xs text-secondary-custom">en corrección</span>
          </div>
          <span className="text-[11px] text-muted-custom mt-2 block">
            2do Parcial Programación III
          </span>
        </Card>
      </div>

      {/* Filters Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Tabs tabs={statusTabs} activeTab={selectedStatusTab} onChange={setSelectedStatusTab} size="sm" />

        <div className="w-full sm:w-64">
          <Select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
          >
            <option value="todas">Todas las materias</option>
            {subjects?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Grades Table / List with responsive adaptation */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-subtle-custom flex flex-row items-center justify-between">
          <div>
            <CardTitle>Historial de Exámenes y Trabajos</CardTitle>
            <p className="text-xs text-secondary-custom mt-0.5">
              Solo lectura · Las actas se homologan al cierre de cuatrimestre
            </p>
          </div>
          <span className="text-xs text-muted-custom font-mono">
            {filteredGrades.length} registro(s)
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {isGradesLoading ? (
            <div className="p-5 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredGrades.length === 0 ? (
            <EmptyState
              icon={<GraduationCap className="w-6 h-6 text-muted-custom" />}
              title="No hay calificaciones para este filtro"
              description="Seleccioná otra materia o restablecé los filtros para ver las notas disponibles."
              actionText="Ver todas las notas"
              onAction={() => {
                setSelectedSubjectFilter('todas');
                setSelectedStatusTab('todas');
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-subtle-custom bg-[var(--bg-surface-elevated)]/50 text-secondary-custom font-semibold">
                    <th className="py-3 px-4">Materia</th>
                    <th className="py-3 px-4">Evaluación</th>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Observaciones de Cátedra</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Nota Oficial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle-custom">
                  {filteredGrades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-[var(--bg-surface-elevated)]/30 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-primary-custom max-w-xs">
                        <div className="truncate">{grade.materiaNombre}</div>
                        {grade.ponderacion && (
                          <span className="text-[10px] text-muted-custom">Pondera: {grade.ponderacion}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-primary-custom whitespace-nowrap">
                        {grade.tipoEvaluacion}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-secondary-custom whitespace-nowrap">
                        {formatDate(grade.fechaEvaluacion)}
                      </td>
                      <td className="py-3.5 px-4 text-secondary-custom max-w-sm">
                        {grade.observaciones || '—'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge
                          variant={
                            grade.estado === 'Promocionado' || grade.estado === 'Aprobado'
                              ? 'success'
                              : grade.estado === 'Pendiente'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {grade.estado}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {grade.nota !== null ? (
                          <span className="text-sm font-bold font-mono tabular-nums text-primary-custom">
                            {grade.nota.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-amber-500 font-medium">
                            En espera
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
