/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  Users,
  MagnifyingGlass,
  ChatCircleDots,
  Eye,
  WarningCircle,
  Prohibit,
  CheckCircle,
  FileArrowDown,
  Info
} from '@phosphor-icons/react';
import { usePreceptor } from '../../context/PreceptorContext';
import { Student } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { FilterChip } from '../common/FilterChip';
import { RuleBadge, FormulaTooltip } from '../common/RuleBadge';
import { toast } from 'sonner';

export const AlumnosScreen: React.FC = () => {
  const {
    students,
    currentCourse,
    subjects,
    alumnosFilterCondition,
    setAlumnosFilterCondition,
    alumnosSearchQuery,
    setAlumnosSearchQuery,
    openStudentProfile,
    startConversationWithStudent,
    courseLoading,
    courseError
  } = usePreceptor();

  // Selected subject filter
  const [selectedSubjectFilter, setSelectedSubjectFilter] = React.useState<string>('todas');

  // Filter logic
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Condition filter
      if (alumnosFilterCondition !== 'todas') {
        const hasCondition = Object.values(student.subjects).some(
          stat => stat.condition === alumnosFilterCondition
        );
        if (!hasCondition) return false;
      }

      // Subject specific filter
      if (selectedSubjectFilter !== 'todas') {
        const subStat = student.subjects[selectedSubjectFilter];
        if (!subStat) return false;
      }

      // Text query
      if (alumnosSearchQuery.trim()) {
        const q = alumnosSearchQuery.toLowerCase();
        const fullName = `${student.apellido} ${student.nombre}`.toLowerCase();
        const matchesLegajo = student.legajo.toLowerCase().includes(q);
        const matchesDni = student.dni.includes(q);
        if (!fullName.includes(q) && !matchesLegajo && !matchesDni) return false;
      }

      return true;
    });
  }, [students, alumnosFilterCondition, selectedSubjectFilter, alumnosSearchQuery]);

  // Find most critical subject stats for each student
  const getMostCriticalSubject = (student: Student) => {
    const list = Object.entries(student.subjects).map(([subjId, stat]) => {
      const subj = subjects.find(s => s.id === subjId);
      return {
        subjectName: subj?.name || subjId,
        shortCode: subj?.shortCode || subjId,
        stat,
      };
    });

    // Sort by condition: libre first, then en_riesgo, then highest absences
    list.sort((a, b) => {
      if (a.stat.condition === 'libre') return -1;
      if (b.stat.condition === 'libre') return 1;
      if (a.stat.condition === 'en_riesgo') return -1;
      if (b.stat.condition === 'en_riesgo') return 1;
      return b.stat.absents - a.stat.absents;
    });

    return list[0];
  };

  const handleOpenChat = (student: Student) => {
    startConversationWithStudent(student);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* 1. Header */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-data text-[#89743A] uppercase font-semibold">
                {currentCourse.fullLabel}
              </span>
              <RuleBadge compact type="condicionLibre" />
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-[var(--text-primary)] mt-1">
              Directorio de <span className="text-[#89743A]">Alumnos</span>
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Gestión individual, seguimiento de ausencias acumuladas por materia y acceso a fichas académicas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-data bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] px-3 py-1.5 rounded-lg text-[var(--text-muted)]">
              {filteredStudents.length} de {students.length} alumnos
            </span>
          </div>
        </div>

        {/* Filter Chips & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filtro de regularidad">
            <FilterChip
              label="Todos"
              active={alumnosFilterCondition === 'todas'}
              onClick={() => setAlumnosFilterCondition('todas')}
              count={students.length}
            />
            <FilterChip
              label="Regulares"
              active={alumnosFilterCondition === 'regular'}
              onClick={() => setAlumnosFilterCondition('regular')}
              count={students.filter(s => Object.values(s.subjects).every(st => st.condition === 'regular')).length}
            />
            <FilterChip
              label="En riesgo"
              active={alumnosFilterCondition === 'en_riesgo'}
              onClick={() => setAlumnosFilterCondition('en_riesgo')}
              count={students.filter(s => Object.values(s.subjects).some(st => st.condition === 'en_riesgo') && !Object.values(s.subjects).some(st => st.condition === 'libre')).length}
            />
            <FilterChip
              label="Libres"
              active={alumnosFilterCondition === 'libre'}
              onClick={() => setAlumnosFilterCondition('libre')}
              count={students.filter(s => Object.values(s.subjects).some(st => st.condition === 'libre')).length}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Subject dropdown */}
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer"
            >
              <option value="todas">Todas las materias</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por apellido, nombre, legajo o DNI..."
                value={alumnosSearchQuery}
                onChange={(e) => setAlumnosSearchQuery(e.target.value)}
                className="bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-lg pl-8 pr-3 py-1.5 text-xs w-64 focus:ring-2 focus:ring-[#3F78B6]"
              />
              <MagnifyingGlass size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Table for Desktop & Structured Cards for Mobile */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xs overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] border-b border-[var(--border-subtle)] font-heading uppercase">
              <tr>
                <th className="py-3 px-4 font-semibold">Estudiante</th>
                <th className="py-3 px-3 font-semibold">Legajo / DNI</th>
                <th className="py-3 px-3 font-semibold w-48">
                  Materia Más Crítica
                </th>
                <th className="py-3 px-3 font-semibold text-center">Desglose %</th>
                <th className="py-3 px-3 font-semibold text-center">Materias en Alerta</th>
                <th className="py-3 px-4 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredStudents.map(student => {
                const critical = getMostCriticalSubject(student);
                if (!critical) return null;
                const progressWidth = Math.max(0, Math.min(100, critical.stat.attendanceRate));

                // Compromised subjects badges
                const compromisedSubjects = Object.entries(student.subjects)
                  .filter(([_, st]) => st.condition === 'libre' || st.condition === 'en_riesgo')
                  .map(([sId, st]) => ({
                    code: subjects.find(s => s.id === sId)?.shortCode || sId,
                    condition: st.condition,
                  }));

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-[var(--bg-surface-elevated)] transition-colors"
                  >
                    {/* Name */}
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => openStudentProfile(student)}
                        className="font-heading font-bold text-sm text-[var(--text-primary)] hover:text-[#89743A] hover:underline text-left block"
                      >
                        {student.apellido}, {student.nombre}
                      </button>
                      <span className="text-[11px] text-[var(--text-muted)] font-mono-data truncate block max-w-xs">
                        {student.email}
                      </span>
                    </td>

                    {/* Legajo / DNI */}
                    <td className="py-3 px-3 font-mono-data text-[var(--text-secondary)]">
                      <span className="font-semibold text-[var(--text-primary)] block">{student.legajo}</span>
                      <span className="text-[11px] text-[var(--text-muted)]">DNI {student.dni}</span>
                    </td>

                    {/* Ausencias en materia más crítica */}
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <strong className="text-[var(--text-primary)] truncate max-w-[130px]">
                            {critical.shortCode}
                          </strong>
                          <span className="font-mono-data font-bold text-[var(--text-primary)]">
                            {critical.stat.remainingAbsencesAllowed === 0 ? 'sin faltas disponibles' : `le quedan ${critical.stat.remainingAbsencesAllowed}`}
                          </span>
                        </div>

                        {/* Absence progress bar with limit marker */}
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden relative">
                          <div
                            className={`h-full rounded-full transition-all ${
                              critical.stat.condition === 'libre'
                                ? 'bg-red-600'
                                : critical.stat.condition === 'en_riesgo'
                                ? 'bg-amber-500'
                                : 'bg-emerald-600'
                            }`}
                            style={{ width: `${progressWidth}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Breakdown % */}
                    <td className="py-3 px-3 text-center font-mono-data text-[11px]">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-emerald-700 font-bold" title="Presentes">
                          {critical.stat.presents}P
                        </span>
                        <span>·</span>
                        <span className="text-amber-700 font-bold" title="Tardanzas">
                          {critical.stat.tardies}T
                        </span>
                        <span>·</span>
                        <span className="text-red-600 font-bold" title="Ausentes">
                          {critical.stat.absents}A
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[var(--text-primary)] block mt-0.5">
                        {critical.stat.attendanceRate}% Asist.
                      </span>
                    </td>

                    {/* Compromised subjects badges */}
                    <td className="py-3 px-3 text-center">
                      {compromisedSubjects.length > 0 ? (
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {compromisedSubjects.map((cs, i) => (
                            <span
                              key={i}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono-data font-bold border ${
                                cs.condition === 'libre'
                                  ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300'
                                  : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {cs.code}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-medium font-sans">
                          Todas regulares
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openStudentProfile(student)}
                          className="px-2.5 py-1.5 bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] hover:border-[#89743A] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          title="Abrir ficha académica completa"
                        >
                          Ver ficha
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenChat(student)}
                          className="p-1.5 bg-[var(--brand-navy)] text-white hover:opacity-90 rounded-lg transition-colors cursor-pointer"
                          title="Enviar mensaje directo al alumno"
                        >
                          <ChatCircleDots size={16} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden divide-y divide-[var(--border-subtle)]">
          {filteredStudents.map(student => {
            const critical = getMostCriticalSubject(student);
            if (!critical) return null;

            return (
              <div key={student.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-heading font-bold text-sm text-[var(--text-primary)]">
                      {student.apellido}, {student.nombre}
                    </h3>
                    <p className="font-mono-data text-xs text-[var(--text-muted)]">
                      {student.legajo} · DNI {student.dni}
                    </p>
                  </div>
                  <StatusBadge status={critical.stat.condition} size="sm" />
                </div>

                <div className="bg-[var(--bg-surface-elevated)] p-2.5 rounded-lg border border-[var(--border-subtle)] text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)]">Materia crítica:</span>
                    <strong className="text-[var(--text-primary)]">{critical.subjectName}</strong>
                  </div>
                  <div className="flex justify-between items-center font-mono-data">
                    <span className="text-[var(--text-muted)]">Inasistencias:</span>
                    <strong className="text-red-600 font-bold">{critical.stat.absents} (le quedan {critical.stat.remainingAbsencesAllowed})</strong>
                  </div>
                  <div className="flex justify-between items-center font-mono-data">
                    <span className="text-[var(--text-muted)]">Presentismo:</span>
                    <strong className="text-[var(--text-primary)]">{critical.stat.attendanceRate}%</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openStudentProfile(student)}
                    className="flex-1 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs font-semibold rounded-lg text-center"
                  >
                    Ver ficha
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenChat(student)}
                    className="flex-1 py-2 bg-[var(--brand-navy)] text-white text-xs font-semibold rounded-lg text-center flex items-center justify-center gap-1.5"
                  >
                    <ChatCircleDots size={16} weight="bold" />
                    <span>Mensaje</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredStudents.length === 0 && (
          <div className="py-12 text-center text-xs text-[var(--text-muted)]">
            {courseLoading ? 'Cargando alumnos del curso…' : courseError || 'No se encontraron alumnos con los filtros seleccionados.'}
          </div>
        )}
      </section>
    </div>
  );
};
