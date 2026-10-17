import React, { useState } from 'react';
import {
  History,
  Award,
  CheckCircle2,
  ClockAlert,
  Calendar,
  Bell,
  Search,
  Filter
} from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import { getBorderRadiusClass } from '../styles/themes';

interface TimelineEntry {
  id: string;
  category: 'asistencia' | 'calificacion' | 'evaluacion' | 'aviso';
  title: string;
  subtitle: string;
  date: string;
  detail: string;
  badge?: string;
  statusType?: 'positivo' | 'negativo' | 'alerta' | 'neutro';
}

export const HistoryPage: React.FC = () => {
  const {
    attendanceRecords,
    grades,
    calendarEvents,
    notices,
    appearance,
    themeColors
  } = usePortal();

  const radius = getBorderRadiusClass(appearance.borderStyle);

  const [categoryFilter, setCategoryFilter] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState('');

  // Combine items into a chronological stream
  const timelineItems: TimelineEntry[] = [
    ...attendanceRecords.map((a) => ({
      id: `hist-att-${a.id}`,
      category: 'asistencia' as const,
      title: `${a.status === 'Presente' ? 'Asistencia registrada' : a.status === 'Ausente' ? 'Inasistencia asentada' : 'Tardanza'}: ${a.subjectName}`,
      subtitle: `${a.method} · Aula: ${a.classroom} (${a.hoursCount} hs cátedra)`,
      date: a.date,
      detail: a.justificationStatus ? `Estado justificación: ${a.justificationStatus}` : 'Registro validado',
      badge: a.status,
      statusType: (a.status === 'Presente' ? 'positivo' : a.status === 'Ausente' ? 'negativo' : 'alerta') as TimelineEntry['statusType']
    })),
    ...grades.filter((g) => g.status === 'Publicada').map((g) => ({
      id: `hist-grd-${g.id}`,
      category: 'calificacion' as const,
      title: `Calificación oficial: ${g.subjectName}`,
      subtitle: `${g.evaluationName} (${g.type})`,
      date: g.date,
      detail: g.feedback || 'Nota asentada en libro matriz docente.',
      badge: `Nota: ${g.score}/10`,
      statusType: (g.score && g.score >= 4 ? 'positivo' : 'negativo') as TimelineEntry['statusType']
    })),
    ...calendarEvents.map((e) => ({
      id: `hist-evt-${e.id}`,
      category: 'evaluacion' as const,
      title: `${e.type}: ${e.title}`,
      subtitle: `${e.startTime} a ${e.endTime} hs ${e.classroom ? `· ${e.classroom}` : ''}`,
      date: e.date,
      detail: e.description,
      badge: e.type,
      statusType: 'neutro' as const
    })),
    ...notices.map((n) => ({
      id: `hist-not-${n.id}`,
      category: 'aviso' as const,
      title: `Comunicado: ${n.title}`,
      subtitle: `Emitido por ${n.author} (${n.authorRole})`,
      date: n.date,
      detail: n.summary,
      badge: n.category,
      statusType: 'alerta' as const
    }))
  ];

  // Sort by date descending
  timelineItems.sort((a, b) => b.date.localeCompare(a.date));

  const filteredItems = timelineItems.filter((item) => {
    const matchCategory = categoryFilter === 'todas' || item.category === categoryFilter;
    const matchSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.detail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        style={{
          backgroundColor: themeColors.bgCard,
          borderColor: themeColors.borderSubtle
        }}
        className={`p-6 border shadow-xs ${radius.card}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span
              style={{ color: themeColors.accentGold }}
              className="text-xs font-bold uppercase tracking-wider block mb-1"
            >
              Auditoría y Trazabilidad · Ciclo 2026
            </span>
            <h1 style={{ color: themeColors.textPrimary }} className="text-2xl font-extrabold tracking-tight">
              Historial Académico Completo
            </h1>
            <p style={{ color: themeColors.textMuted }} className="text-xs mt-1">
              Línea de tiempo cronológica de asistencias, calificaciones, evaluaciones y notificaciones
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar evento o materia..."
              style={{
                backgroundColor: themeColors.bgPage,
                borderColor: themeColors.borderSubtle,
                color: themeColors.textPrimary
              }}
              className={`w-full pl-9 pr-3 py-2 text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${radius.inner}`}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span style={{ color: themeColors.textMuted }} className="text-xs font-medium mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Categoría:
        </span>
        {['todas', 'asistencia', 'calificacion', 'evaluacion', 'aviso'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            style={{
              backgroundColor: categoryFilter === cat ? themeColors.accentGold : themeColors.bgCard,
              color: categoryFilter === cat ? '#FFFFFF' : themeColors.textSecondary,
              borderColor: categoryFilter === cat ? themeColors.accentGold : themeColors.borderSubtle
            }}
            className={`px-3 py-1.5 text-xs font-semibold border transition-colors ${radius.button} capitalize`}
          >
            {cat === 'todas' ? 'Todos los registros' : cat}
          </button>
        ))}
      </div>

      {/* Timeline Stream */}
      <div
        style={{
          backgroundColor: themeColors.bgCard,
          borderColor: themeColors.borderSubtle
        }}
        className={`p-6 border shadow-xs ${radius.card} space-y-6`}
      >
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
          {filteredItems.map((item) => (
            <div key={item.id} className="relative group">
              {/* Dot Anchor */}
              <div
                style={{
                  backgroundColor:
                    item.statusType === 'positivo'
                      ? themeColors.positiveText
                      : item.statusType === 'negativo'
                      ? themeColors.negativeText
                      : themeColors.accentGold
                }}
                className="absolute -left-6 sm:-left-8 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ring-2 ring-slate-200 dark:ring-slate-800"
              />

              <div
                style={{
                  backgroundColor: themeColors.bgSubtle,
                  borderColor: themeColors.borderSubtle
                }}
                className={`p-4 border ${radius.inner} space-y-1.5`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span
                    style={{
                      color:
                        item.statusType === 'positivo'
                          ? themeColors.positiveText
                          : item.statusType === 'negativo'
                          ? themeColors.negativeText
                          : themeColors.accentGold
                    }}
                    className="font-bold uppercase tracking-wider text-[10px]"
                  >
                    {item.badge}
                  </span>
                  <span style={{ color: themeColors.textMuted }} className="tabular-nums">
                    {item.date}
                  </span>
                </div>

                <h4 style={{ color: themeColors.textPrimary }} className="text-xs font-bold">
                  {item.title}
                </h4>

                <p style={{ color: themeColors.textSecondary }} className="text-xs">
                  {item.subtitle}
                </p>

                <p style={{ color: themeColors.textMuted }} className="text-[11px] pt-1">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
