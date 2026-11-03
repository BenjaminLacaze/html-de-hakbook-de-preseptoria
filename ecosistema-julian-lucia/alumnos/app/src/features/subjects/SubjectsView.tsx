import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  Search,
  Filter,
  Users,
  Clock,
  ArrowRight,
  ClipboardList,
  GraduationCap,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { subjectsService } from '../../services/subjectsService';
import { SubjectDetailModal } from './SubjectDetailModal';
import type { Subject } from '../../types';

export const SubjectsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsService.getSubjects(),
  });

  const filterTabs = [
    { id: 'todos', label: 'Todas las Materias' },
    { id: 'En Curso', label: 'En Curso' },
    { id: 'Promocionada', label: 'Promocionadas' },
  ];

  const filteredSubjects = subjects?.filter((sub) => {
    const matchesSearch =
      sub.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.docentes.some((d) => d.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'todos' || sub.estadoCursada === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header and Search / Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-primary-custom tracking-tight">
            Materias Inscriptas
          </h2>
          <p className="text-xs text-secondary-custom mt-0.5">
            2° Año · 2° Cuatrimestre · Tecnicatura Superior en Desarrollo de Software
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Buscar por materia, código o docente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs tabs={filterTabs} activeTab={statusFilter} onChange={setStatusFilter} />

      {/* Subjects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : filteredSubjects.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-6 h-6 text-muted-custom" />}
          title="No se encontraron materias"
          description="Probá ajustando el término de búsqueda o cambiando el filtro de estado."
          actionText="Limpiar búsqueda"
          onAction={() => {
            setSearchTerm('');
            setStatusFilter('todos');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((sub) => {
            const isWarning = sub.attendanceRisk === 'BELOW_MINIMUM';

            return (
              <Card
                key={sub.id}
                onClick={() => setSelectedSubject(sub)}
                className="flex flex-col justify-between hover:border-strong-custom hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="p-5 space-y-3">
                  {/* Code & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-muted-custom font-semibold">
                      {sub.codigo}
                    </span>
                    <Badge variant={sub.estadoCursada === 'Promocionada' ? 'success' : isWarning ? 'danger' : 'default'}>
                      {sub.estadoCursada}
                    </Badge>
                  </div>

                  {/* Title & Teacher */}
                  <div>
                    <h3 className="text-sm font-bold text-primary-custom group-hover:text-[var(--accent-primary)] transition-colors leading-snug">
                      {sub.nombre}
                    </h3>
                    <p className="text-xs text-secondary-custom mt-1 truncate">
                      {sub.docentes[0]?.nombre} {sub.docentes.length > 1 && `+${sub.docentes.length - 1}`}
                    </p>
                  </div>

                  {/* Metrics summary */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-[calc(var(--radius-current)-2px)] bg-[var(--bg-surface-elevated)]/60 text-xs">
                    <div>
                      <span className="text-muted-custom block text-[10px]">Asistencia</span>
                      <span className={`font-mono font-bold tabular-nums ${isWarning ? 'text-red-500' : 'text-primary-custom'}`}>
                        {sub.porcentajeAsistencia.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-custom block text-[10px]">Promedio</span>
                      <span className="font-mono font-bold tabular-nums text-primary-custom">
                        {sub.promedioParciales ? sub.promedioParciales.toFixed(2) : 'S/D'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="p-3.5 px-5 border-t border-subtle-custom bg-[var(--bg-surface-elevated)]/30 flex items-center justify-between text-xs text-secondary-custom rounded-b-[var(--radius-current)]">
                  <span className="text-[11px] font-mono text-muted-custom">
                    {sub.horarios[0]?.dia} {sub.horarios[0]?.horarioInicio} hs
                  </span>
                  <span className="text-xs font-semibold text-[var(--accent-primary)] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Ver ficha <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <SubjectDetailModal
        subject={selectedSubject}
        isOpen={!!selectedSubject}
        onClose={() => setSelectedSubject(null)}
      />
    </div>
  );
};
