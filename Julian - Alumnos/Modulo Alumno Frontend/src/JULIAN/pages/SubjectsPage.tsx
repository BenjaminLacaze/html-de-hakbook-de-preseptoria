import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  Search,
  ExternalLink,
  Award,
  AlertCircle
} from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import { getBorderRadiusClass } from '../styles/themes';
import { StatusBadge } from '../components/common/StatusBadge';
import { Subject } from '../types';

export const SubjectsPage: React.FC = () => {
  const { subjects, setSelectedSubject, appearance, themeColors } = usePortal();
  const radius = getBorderRadiusClass(appearance.borderStyle);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.professor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Search */}
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
              Ciclo Académico 2026 · Comisión 2° B
            </span>
            <h1 style={{ color: themeColors.textPrimary }} className="text-2xl font-extrabold tracking-tight">
              Materias en Cursada
            </h1>
            <p style={{ color: themeColors.textMuted }} className="text-xs mt-1">
              Información de cátedras, docentes a cargo, asistencia y calificaciones oficiales
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar materia o docente..."
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

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredSubjects.map((sub: Subject) => (
          <div
            key={sub.id}
            style={{
              backgroundColor: themeColors.bgCard,
              borderColor: themeColors.borderSubtle
            }}
            className={`p-6 border transition-all hover:border-slate-400 dark:hover:border-slate-600 ${radius.card} flex flex-col justify-between gap-5`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span
                    style={{
                      backgroundColor: themeColors.accentSurface,
                      color: themeColors.accentText
                    }}
                    className="text-[11px] font-mono font-bold px-2 py-0.5 rounded"
                  >
                    {sub.code}
                  </span>
                  <h3 style={{ color: themeColors.textPrimary }} className="text-base font-bold">
                    {sub.name}
                  </h3>
                </div>
                <StatusBadge status={sub.status} size="sm" />
              </div>

              <div className="flex items-center gap-2 text-xs" style={{ color: themeColors.textSecondary }}>
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium">{sub.professor}</span>
                <span className="text-slate-400">({sub.commission})</span>
              </div>

              <p style={{ color: themeColors.textMuted }} className="text-xs line-clamp-2 leading-relaxed">
                {sub.description}
              </p>

              {/* Schedules Box */}
              <div
                style={{ backgroundColor: themeColors.bgSubtle }}
                className={`p-3 text-xs ${radius.inner} space-y-1`}
              >
                {sub.schedules.map((sch, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span style={{ color: themeColors.textPrimary }} className="font-semibold">
                      {sch.day}
                    </span>
                    <span style={{ color: themeColors.textMuted }} className="tabular-nums">
                      {sch.startTime} a {sch.endTime} hs · {sch.classroom}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Metrics & Action */}
            <div className="pt-4 border-t space-y-3" style={{ borderColor: themeColors.borderSubtle }}>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span style={{ color: themeColors.textMuted }} className="text-[10px] block">
                    Asistencia
                  </span>
                  <span
                    style={{
                      color: sub.attendancePercentage >= 75 ? themeColors.positiveText : themeColors.negativeText
                    }}
                    className="font-bold tabular-nums text-sm"
                  >
                    {sub.attendancePercentage}%
                  </span>
                </div>
                <div>
                  <span style={{ color: themeColors.textMuted }} className="text-[10px] block">
                    Faltas
                  </span>
                  <span style={{ color: themeColors.textPrimary }} className="font-bold tabular-nums text-sm">
                    {sub.absences} / {sub.maxAllowedAbsences}
                  </span>
                </div>
                <div>
                  <span style={{ color: themeColors.textMuted }} className="text-[10px] block">
                    Promedio
                  </span>
                  <span style={{ color: themeColors.accentGold }} className="font-bold tabular-nums text-sm">
                    {sub.currentAverage}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedSubject(sub)}
                style={{
                  backgroundColor: themeColors.bgSubtle,
                  borderColor: themeColors.borderSubtle,
                  color: themeColors.textPrimary
                }}
                className={`w-full py-2 px-3 text-xs font-semibold border flex items-center justify-center gap-1.5 hover:border-slate-400 transition-colors ${radius.button}`}
              >
                <span>Ver Ficha y Calificaciones de Cátedra</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
