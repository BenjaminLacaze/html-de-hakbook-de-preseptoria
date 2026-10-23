import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  History as HistoryIcon,
  Filter,
  GraduationCap,
  ClipboardCheck,
  Calendar,
  FileCheck,
  Search,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { agendaService } from '../../services/agendaService';
import type { TimelineEvent } from '../../types';

export const HistoryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('todos');

  const { data: timelineEvents, isLoading } = useQuery({
    queryKey: ['timelineEvents'],
    queryFn: () => agendaService.getTimelineEvents(),
  });

  const filterTabs = [
    { id: 'todos', label: 'Todos los Eventos' },
    { id: 'calificacion', label: 'Calificaciones' },
    { id: 'asistencia', label: 'Asistencias' },
    { id: 'tramite', label: 'Trámites' },
  ];

  const filteredEvents = timelineEvents?.filter((evt) => {
    const matchesType = selectedType === 'todos' || evt.tipo === selectedType;
    const matchesSearch =
      evt.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evt.materiaNombre && evt.materiaNombre.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesType && matchesSearch;
  }) || [];

  const getEventIcon = (tipo: TimelineEvent['tipo']) => {
    switch (tipo) {
      case 'calificacion':
        return <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'asistencia':
        return <ClipboardCheck className="w-4 h-4 text-[var(--accent-primary)]" />;
      case 'tramite':
        return <FileCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <Calendar className="w-4 h-4 text-secondary-custom" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-primary-custom tracking-tight">
            Historial Académico Unificado
          </h2>
          <p className="text-xs text-secondary-custom mt-0.5">
            Registro cronológico consolidado de asistencias, notas, evaluaciones y trámites
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Buscar en el historial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs tabs={filterTabs} activeTab={selectedType} onChange={setSelectedType} />

      {/* Chronological Unified Timeline */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <EmptyState
              icon={<HistoryIcon className="w-6 h-6 text-muted-custom" />}
              title="No hay eventos en este período"
              description="No encontramos registros que coincidan con la búsqueda o filtro seleccionado."
              actionText="Restablecer filtros"
              onAction={() => {
                setSearchTerm('');
                setSelectedType('todos');
              }}
            />
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-subtle)]">
              {filteredEvents.map((evt) => (
                <div key={evt.id} className="relative group">
                  {/* Timeline Node Bullet */}
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-surface border-2 border-subtle-custom group-hover:border-strong-custom flex items-center justify-center transition-colors">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                  </div>

                  <div className="p-4 rounded-[calc(var(--radius-current)-2px)] bg-[var(--bg-surface-elevated)]/40 border border-subtle-custom hover:border-strong-custom transition-all space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        {getEventIcon(evt.tipo)}
                        <h4 className="text-xs sm:text-sm font-bold text-primary-custom">
                          {evt.titulo}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={evt.badgeVariant as any}>
                          {evt.badgeTexto}
                        </Badge>
                        <span className="text-[11px] font-mono text-muted-custom">
                          {evt.fecha}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-secondary-custom leading-relaxed">
                      {evt.descripcion}
                    </p>

                    {evt.materiaNombre && (
                      <div className="pt-1 text-[11px] text-muted-custom">
                        Asignatura: <span className="font-semibold text-secondary-custom">{evt.materiaNombre}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
