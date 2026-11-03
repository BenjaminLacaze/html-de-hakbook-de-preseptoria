import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Filter,
  GraduationCap,
  FileCheck,
  Building,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Skeleton } from '../../components/ui/Skeleton';
import { agendaService } from '../../services/agendaService';
import { formatDate } from '../../lib/utils';
import type { AcademicEvent } from '../../types';

export const AgendaView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('todos');

  const { data: events, isLoading } = useQuery({
    queryKey: ['academicEvents'],
    queryFn: () => agendaService.getAcademicEvents(),
  });

  const categoryTabs = [
    { id: 'todos', label: 'Todos los Eventos' },
    { id: 'Clase', label: 'Clases' },
    { id: 'Examen', label: 'Exámenes' },
    { id: 'Entrega TP', label: 'Entregas TP' },
    { id: 'Institucional', label: 'Institucional' },
  ];

  const filteredEvents = events?.filter((evt) => {
    if (selectedCategory !== 'todos' && evt.tipo !== selectedCategory) {
      return false;
    }
    return true;
  }) || [];

  const getEventBadgeVariant = (tipo: AcademicEvent['tipo']) => {
    switch (tipo) {
      case 'Examen':
        return 'danger';
      case 'Entrega TP':
        return 'warning';
      case 'Clase':
        return 'info';
      case 'Feriado':
        return 'gold';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-primary-custom tracking-tight">
            Agenda Académica Institucional
          </h2>
          <p className="text-xs text-secondary-custom mt-0.5">
            Cronograma de clases, evaluaciones parciales y entregas oficiales
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-2">
          <Tabs
            tabs={[
              { id: 'todos', label: 'Vista Completa' },
              { id: 'semana', label: 'Esta Semana' },
            ]}
            activeTab={selectedPeriod}
            onChange={setSelectedPeriod}
            size="sm"
          />
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="overflow-x-auto pb-1">
        <Tabs
          tabs={categoryTabs}
          activeTab={selectedCategory}
          onChange={setSelectedCategory}
        />
      </div>

      {/* Events List / Timeline view */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarIcon className="w-10 h-10 text-muted-custom mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-primary-custom">Sin actividades en este filtro</h4>
          <p className="text-xs text-secondary-custom mt-1">
            No se encontraron eventos programados para la categoría seleccionada.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setSelectedCategory('todos')}
          >
            Restablecer Filtros
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((evt) => {
            return (
              <Card
                key={evt.id}
                className="flex flex-col justify-between hover:border-strong-custom transition-all"
              >
                <div className="p-5 space-y-3">
                  {/* Top line: Date + Type badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-primary-custom font-mono">
                      {formatDate(evt.fecha, { weekday: 'short', day: '2-digit', month: 'short' })}
                    </span>
                    <Badge variant={getEventBadgeVariant(evt.tipo)}>
                      {evt.tipo}
                    </Badge>
                  </div>

                  {/* Title and Subject */}
                  <div>
                    <h3 className="text-sm font-bold text-primary-custom leading-snug">
                      {evt.titulo}
                    </h3>
                    {evt.materiaNombre && (
                      <p className="text-xs text-secondary-custom font-medium mt-1 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-muted-custom shrink-0" />
                        <span className="truncate">{evt.materiaNombre}</span>
                      </p>
                    )}
                  </div>

                  {evt.descripcion && (
                    <p className="text-xs text-secondary-custom leading-relaxed">
                      {evt.descripcion}
                    </p>
                  )}
                </div>

                {/* Footer metadata: Time & Location */}
                <div className="p-4 px-5 border-t border-subtle-custom bg-[var(--bg-surface-elevated)]/40 flex items-center justify-between text-xs text-secondary-custom rounded-b-[var(--radius-current)]">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-muted-custom" />
                    <span>{evt.horarioInicio} - {evt.horarioFin} hs</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate max-w-[45%] text-right">
                    <MapPin className="w-3.5 h-3.5 text-muted-custom shrink-0" />
                    <span className="truncate">{evt.ubicacion}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
