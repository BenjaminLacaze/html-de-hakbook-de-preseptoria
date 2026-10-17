import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Filter,
  Layers
} from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import { getBorderRadiusClass } from '../styles/themes';
import { CalendarEvent } from '../types';

export const AgendaPage: React.FC = () => {
  const { calendarEvents, subjects, appearance, themeColors } = usePortal();
  const radius = getBorderRadiusClass(appearance.borderStyle);

  const [activeTab, setActiveTab] = useState<'cronograma' | 'horario-semanal' | 'mesas'>('cronograma');
  const [filterType, setFilterType] = useState<string>('todos');

  const filteredEvents = calendarEvents.filter((evt) => {
    if (filterType === 'todos') return true;
    return evt.type.toLowerCase() === filterType.toLowerCase();
  });

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

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
              Calendario Académico · 2° Cuatrimestre 2026
            </span>
            <h1 style={{ color: themeColors.textPrimary }} className="text-2xl font-extrabold tracking-tight">
              Agenda y Cronograma de Cursada
            </h1>
            <p style={{ color: themeColors.textMuted }} className="text-xs mt-1">
              Consulta de fechas de cursada, exámenes parciales, entregas prácticas y mesas de finales
            </p>
          </div>

          {/* View Mode Tabs */}
          <div
            style={{ backgroundColor: themeColors.bgSubtle }}
            className={`p-1 flex items-center gap-1 ${radius.inner} shrink-0`}
          >
            <button
              onClick={() => setActiveTab('cronograma')}
              style={{
                backgroundColor: activeTab === 'cronograma' ? themeColors.bgCard : 'transparent',
                color: activeTab === 'cronograma' ? themeColors.textPrimary : themeColors.textMuted
              }}
              className={`px-3 py-1.5 text-xs font-semibold transition-all ${radius.button} ${
                activeTab === 'cronograma' ? 'shadow-xs' : ''
              }`}
            >
              Próximos Vencimientos
            </button>
            <button
              onClick={() => setActiveTab('horario-semanal')}
              style={{
                backgroundColor: activeTab === 'horario-semanal' ? themeColors.bgCard : 'transparent',
                color: activeTab === 'horario-semanal' ? themeColors.textPrimary : themeColors.textMuted
              }}
              className={`px-3 py-1.5 text-xs font-semibold transition-all ${radius.button} ${
                activeTab === 'horario-semanal' ? 'shadow-xs' : ''
              }`}
            >
              Horario Semanal
            </button>
            <button
              onClick={() => setActiveTab('mesas')}
              style={{
                backgroundColor: activeTab === 'mesas' ? themeColors.bgCard : 'transparent',
                color: activeTab === 'mesas' ? themeColors.textPrimary : themeColors.textMuted
              }}
              className={`px-3 py-1.5 text-xs font-semibold transition-all ${radius.button} ${
                activeTab === 'mesas' ? 'shadow-xs' : ''
              }`}
            >
              Mesas de Finales
            </button>
          </div>
        </div>
      </div>

      {/* View 1: Cronograma */}
      {activeTab === 'cronograma' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span style={{ color: themeColors.textMuted }} className="text-xs font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtrar:
            </span>
            {['todos', 'clase', 'examen', 'entrega tp', 'institucional'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                style={{
                  backgroundColor: filterType === f ? themeColors.accentGold : themeColors.bgCard,
                  color: filterType === f ? '#FFFFFF' : themeColors.textSecondary,
                  borderColor: filterType === f ? themeColors.accentGold : themeColors.borderSubtle
                }}
                className={`px-3 py-1 text-xs font-semibold border transition-colors ${radius.button} capitalize`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                style={{
                  backgroundColor: themeColors.bgCard,
                  borderColor: evt.priority === 'Alta' ? themeColors.accentGold : themeColors.borderSubtle
                }}
                className={`p-5 border transition-shadow hover:shadow-xs ${radius.card} flex flex-col justify-between gap-4`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      style={{
                        backgroundColor:
                          evt.type === 'Examen'
                            ? themeColors.negativeBg
                            : evt.type === 'Entrega TP'
                            ? themeColors.warningBg
                            : themeColors.accentSurface,
                        color:
                          evt.type === 'Examen'
                            ? themeColors.negativeText
                            : evt.type === 'Entrega TP'
                            ? themeColors.warningText
                            : themeColors.accentText
                      }}
                      className="px-2.5 py-0.5 rounded font-bold uppercase text-[10px] tracking-wider"
                    >
                      {evt.type}
                    </span>
                    <span style={{ color: themeColors.textMuted }} className="font-semibold tabular-nums">
                      {evt.date}
                    </span>
                  </div>

                  <h3 style={{ color: themeColors.textPrimary }} className="text-sm font-bold">
                    {evt.title}
                  </h3>

                  <p style={{ color: themeColors.textSecondary }} className="text-xs leading-relaxed">
                    {evt.description}
                  </p>
                </div>

                <div
                  className="pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-xs"
                  style={{ borderColor: themeColors.borderSubtle, color: themeColors.textMuted }}
                >
                  <div className="flex items-center gap-1.5 tabular-nums">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{evt.startTime} a {evt.endTime} hs</span>
                  </div>

                  {evt.classroom && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.classroom}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 2: Horario Semanal Grid */}
      {activeTab === 'horario-semanal' && (
        <div
          style={{
            backgroundColor: themeColors.bgCard,
            borderColor: themeColors.borderSubtle
          }}
          className={`p-6 border ${radius.card} space-y-4`}
        >
          <div className="border-b pb-3" style={{ borderColor: themeColors.borderSubtle }}>
            <h3 style={{ color: themeColors.textPrimary }} className="text-sm font-bold">
              Grilla Semanal de Clases Presenciales · Turno Vespertino
            </h3>
            <p style={{ color: themeColors.textMuted }} className="text-xs">
              Horario oficial comisiones 2° B - Tecnicatura Superior en Desarrollo de Software
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {daysOfWeek.map((day) => {
              const daySchedules = subjects.flatMap((s) =>
                s.schedules
                  .filter((sch) => sch.day === day)
                  .map((sch) => ({ ...sch, subjectName: s.name, subjectCode: s.code, prof: s.professor }))
              );

              return (
                <div
                  key={day}
                  style={{
                    backgroundColor: themeColors.bgSubtle,
                    borderColor: themeColors.borderSubtle
                  }}
                  className={`p-4 border ${radius.inner} space-y-3`}
                >
                  <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: themeColors.borderSubtle }}>
                    <span style={{ color: themeColors.textPrimary }} className="font-bold text-xs">
                      {day}
                    </span>
                    <span style={{ color: themeColors.textMuted }} className="text-[11px]">
                      {daySchedules.length > 0 ? `${daySchedules.length} cátedra(s)` : 'Sin clases'}
                    </span>
                  </div>

                  {daySchedules.length === 0 ? (
                    <p style={{ color: themeColors.textMuted }} className="text-xs italic py-4 text-center">
                      Día libre de cursada presencial
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {daySchedules.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            backgroundColor: themeColors.bgCard,
                            borderColor: themeColors.borderSubtle
                          }}
                          className={`p-3 border ${radius.inner} text-xs space-y-1`}
                        >
                          <div className="flex items-center justify-between">
                            <span style={{ color: themeColors.accentGold }} className="font-mono text-[10px] font-bold">
                              {item.subjectCode}
                            </span>
                            <span style={{ color: themeColors.textMuted }} className="tabular-nums text-[11px] font-semibold">
                              {item.startTime} - {item.endTime}
                            </span>
                          </div>
                          <div style={{ color: themeColors.textPrimary }} className="font-bold">
                            {item.subjectName}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                            <span>{item.prof}</span>
                            <span className="font-medium text-slate-500">{item.classroom}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View 3: Mesas de Finales */}
      {activeTab === 'mesas' && (
        <div
          style={{
            backgroundColor: themeColors.bgCard,
            borderColor: themeColors.borderSubtle
          }}
          className={`p-6 border ${radius.card} space-y-4`}
        >
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-amber-800 dark:text-amber-200 block">
                Turno Noviembre / Diciembre 2026
              </span>
              <p className="text-amber-900/80 dark:text-amber-300/80">
                Inscripciones mediante sistema del 26/10/2026 al 31/10/2026. Es requisito indispensable contar con regularidad
                aprobada (75% asistencia mínima y parciales aprobados con nota ≥ 4).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: themeColors.borderSubtle, color: themeColors.textMuted }}>
                  <th className="py-2.5 px-3 font-semibold">Materia</th>
                  <th className="py-2.5 px-3 font-semibold">Tribunal Examinador</th>
                  <th className="py-2.5 px-3 font-semibold">1° Llamado</th>
                  <th className="py-2.5 px-3 font-semibold">2° Llamado</th>
                  <th className="py-2.5 px-3 font-semibold">Condición</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: themeColors.borderSubtle }}>
                {subjects.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                    <td className="py-3 px-3">
                      <span style={{ color: themeColors.textPrimary }} className="font-bold block">
                        {s.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{s.code}</span>
                    </td>
                    <td className="py-3 px-3" style={{ color: themeColors.textSecondary }}>
                      {s.professor} (Presidente)
                    </td>
                    <td className="py-3 px-3 tabular-nums font-semibold" style={{ color: themeColors.textPrimary }}>
                      24/11/2026 18:30
                    </td>
                    <td className="py-3 px-3 tabular-nums font-semibold" style={{ color: themeColors.textPrimary }}>
                      07/12/2026 18:30
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Habilitado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
