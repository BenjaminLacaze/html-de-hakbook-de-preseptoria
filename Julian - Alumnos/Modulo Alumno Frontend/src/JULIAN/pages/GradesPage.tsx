import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Filter,
  FileCheck,
  Search,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import { getBorderRadiusClass } from '../styles/themes';
import { StatusBadge } from '../components/common/StatusBadge';
import { Grade } from '../types';

export const GradesPage: React.FC = () => {
  const { grades, subjects, currentGpa, appearance, themeColors } = usePortal();
  const radius = getBorderRadiusClass(appearance.borderStyle);

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('todas');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('todos');

  const filteredGrades = grades.filter((g) => {
    const matchSub = selectedSubjectFilter === 'todas' || g.subjectId === selectedSubjectFilter;
    const matchType = selectedTypeFilter === 'todos' || g.type.toLowerCase() === selectedTypeFilter.toLowerCase();
    return matchSub && matchType;
  });

  const publishedCount = grades.filter((g) => g.status === 'Publicada').length;
  const pendingCount = grades.filter((g) => g.status === 'Pendiente de Publicación').length;

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary */}
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
              Registro Académico Oficial · Instituto 26
            </span>
            <h1 style={{ color: themeColors.textPrimary }} className="text-2xl font-extrabold tracking-tight">
              Mis Calificaciones
            </h1>
            <p style={{ color: themeColors.textMuted }} className="text-xs mt-1">
              Notas de parciales, trabajos prácticos y exámenes finales (Escala numérica 1 a 10 · Aprobación con 4)
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div
              style={{ backgroundColor: themeColors.bgSubtle }}
              className={`p-3 text-center ${radius.inner} min-w-28`}
            >
              <span style={{ color: themeColors.textMuted }} className="text-[10px] uppercase font-bold block">
                Promedio General
              </span>
              <span style={{ color: themeColors.accentGold }} className="text-2xl font-extrabold tabular-nums">
                {currentGpa}
              </span>
              <span className="text-[10px] text-slate-400 block">/ 10</span>
            </div>

            <div
              style={{ backgroundColor: themeColors.bgSubtle }}
              className={`p-3 text-center ${radius.inner} min-w-28`}
            >
              <span style={{ color: themeColors.textMuted }} className="text-[10px] uppercase font-bold block">
                Evaluaciones
              </span>
              <span style={{ color: themeColors.textPrimary }} className="text-2xl font-extrabold tabular-nums">
                {publishedCount}
              </span>
              <span className="text-[10px] text-slate-400 block">{pendingCount} pendiente(s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span style={{ color: themeColors.textMuted }} className="font-medium">
            Materia:
          </span>
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            style={{
              backgroundColor: themeColors.bgCard,
              borderColor: themeColors.borderSubtle,
              color: themeColors.textPrimary
            }}
            className={`p-2 border text-xs focus:outline-none ${radius.button}`}
          >
            <option value="todas">Todas las materias cursadas</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span style={{ color: themeColors.textMuted }} className="font-medium">
            Tipo:
          </span>
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            style={{
              backgroundColor: themeColors.bgCard,
              borderColor: themeColors.borderSubtle,
              color: themeColors.textPrimary
            }}
            className={`p-2 border text-xs focus:outline-none ${radius.button}`}
          >
            <option value="todos">Todos los tipos</option>
            <option value="parcial">Exámenes Parciales</option>
            <option value="trabajo práctico">Trabajos Prácticos</option>
            <option value="examen final">Exámenes Finales</option>
          </select>
        </div>
      </div>

      {/* Grades Table */}
      <div
        style={{
          backgroundColor: themeColors.bgCard,
          borderColor: themeColors.borderSubtle
        }}
        className={`border overflow-hidden shadow-xs ${radius.card}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr
                className="border-b"
                style={{
                  backgroundColor: themeColors.bgSubtle,
                  borderColor: themeColors.borderSubtle,
                  color: themeColors.textMuted
                }}
              >
                <th className="py-3 px-4 font-semibold">Cátedra / Materia</th>
                <th className="py-3 px-4 font-semibold">Evaluación</th>
                <th className="py-3 px-4 font-semibold">Tipo</th>
                <th className="py-3 px-4 font-semibold">Fecha</th>
                <th className="py-3 px-4 font-semibold text-right">Nota Obtenida</th>
                <th className="py-3 px-4 font-semibold text-center">Estado Oficial</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: themeColors.borderSubtle }}>
              {filteredGrades.map((grade: Grade) => (
                <tr
                  key={grade.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3.5 px-4 font-semibold" style={{ color: themeColors.textPrimary }}>
                    {grade.subjectName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span style={{ color: themeColors.textPrimary }} className="font-medium block">
                      {grade.evaluationName}
                    </span>
                    {grade.feedback && (
                      <span style={{ color: themeColors.textMuted }} className="text-[11px] block mt-0.5 italic">
                        "{grade.feedback}"
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4" style={{ color: themeColors.textSecondary }}>
                    {grade.type}
                  </td>
                  <td className="py-3.5 px-4 tabular-nums" style={{ color: themeColors.textMuted }}>
                    {grade.date}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {grade.score !== null ? (
                      <div className="font-extrabold text-sm tabular-nums">
                        <span
                          style={{
                            color: grade.score >= 4 ? themeColors.positiveText : themeColors.negativeText
                          }}
                        >
                          {grade.score}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal"> / 10</span>
                      </div>
                    ) : (
                      <span style={{ color: themeColors.warningText }} className="font-semibold text-xs">
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {grade.status === 'Pendiente de Publicación' ? (
                      <span
                        style={{
                          backgroundColor: themeColors.warningBg,
                          color: themeColors.warningText,
                          borderColor: themeColors.warningBorder
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 border rounded"
                      >
                        <Clock className="w-3 h-3" /> En corrección
                      </span>
                    ) : grade.score !== null && grade.score >= 4 ? (
                      <StatusBadge status="Aprobado" size="sm" />
                    ) : (
                      <StatusBadge status="Desaprobado" size="sm" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Institutional Disclaimer */}
      <div
        style={{ backgroundColor: themeColors.bgSubtle, borderColor: themeColors.borderSubtle }}
        className={`p-4 border flex items-start gap-3 text-xs ${radius.inner}`}
      >
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span style={{ color: themeColors.textMuted }} className="leading-relaxed">
          <strong>Régimen de Evaluación Terciaria:</strong> La nota mínima de aprobación reglamentaria es 4 (cuatro).
          Las calificaciones registradas corresponden al libro matriz del docente. Ante cualquier duda o discrepancia,
          comunicate durante el horario de consulta de la cátedra antes del cierre de actas.
        </span>
      </div>
    </div>
  );
};
