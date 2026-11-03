/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  X,
  User,
  Envelope,
  Phone,
  FirstAid,
  IdentificationCard,
  GraduationCap,
  ChatCircleDots,
  ShieldCheck,
  Lock,
  ArrowRight
} from '@phosphor-icons/react';
import { Student } from '../../types';
import { usePreceptor } from '../../context/PreceptorContext';
import { StatusBadge } from './StatusBadge';
import { FormulaTooltip, RuleBadge } from './RuleBadge';
import { academicApi, errorMessage, isoToDisplay } from '../../api';
import type { ApiStudentSensitiveData } from '../../api';

export const FichaAlumnoModal: React.FC = () => {
  const {
    selectedStudentForProfile,
    closeStudentProfile,
    currentCourse,
    startConversationWithStudent,
    subjects,
    ruleSettings
  } = usePreceptor();

  // Contacto de emergencia: dato sensible, se pide solo a demanda (queda auditado en el backend).
  const [sensitive, setSensitive] = useState<ApiStudentSensitiveData | null>(null);
  const [sensitiveLoading, setSensitiveLoading] = useState(false);
  const [sensitiveError, setSensitiveError] = useState('');
  const studentId = selectedStudentForProfile?.id;
  useEffect(() => {
    setSensitive(null);
    setSensitiveError('');
  }, [studentId]);

  if (!selectedStudentForProfile) return null;

  const student = selectedStudentForProfile;
  const enrolledSubjects = subjects.filter(subj => student.subjects[subj.id]);

  const handleOpenChat = () => {
    startConversationWithStudent(student);
  };

  const loadSensitive = async () => {
    setSensitiveLoading(true);
    setSensitiveError('');
    try {
      setSensitive(await academicApi.studentSensitive(student.id));
    } catch (reason) {
      setSensitiveError(errorMessage(reason));
    } finally {
      setSensitiveLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-ficha-title"
    >
      <div className="w-full max-w-3xl bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 px-6 border-b border-[var(--border-subtle)] bg-[var(--brand-navy)] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-heading font-bold text-lg">
              {student.apellido.charAt(0)}{student.nombre.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="student-ficha-title" className="font-heading font-bold text-lg leading-tight">
                  {student.apellido}, {student.nombre}
                </h3>
                <span className="bg-[#89743A] text-white text-[11px] font-mono-data px-2 py-0.5 rounded font-semibold">
                  {student.legajo}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {currentCourse.fullLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeStudentProfile}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors"
            aria-label="Cerrar ficha"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Personal Information & Contacts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-surface-elevated)] p-4 rounded-xl border border-[var(--border-subtle)] space-y-2.5">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <IdentificationCard size={16} />
                <span>Datos Académicos y DNI</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[var(--text-muted)] block text-[11px]">DNI</span>
                  <span className="font-mono-data text-[var(--text-primary)] font-medium">{student.dni}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[11px]">Curso</span>
                  <span className="text-[var(--text-primary)] font-medium">{currentCourse.yearLabel}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[11px]">Turno</span>
                  <span className="text-[var(--text-primary)] font-medium">{currentCourse.shift}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[11px]">Materias del curso</span>
                  <span className="text-[var(--text-primary)] font-medium">{enrolledSubjects.length} inscriptas</span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-surface-elevated)] p-4 rounded-xl border border-[var(--border-subtle)] space-y-2.5">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <Phone size={16} />
                <span>Vías de Contacto y Emergencia</span>
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <Envelope size={14} className="text-[#3F78B6]" />
                  <span className="text-[var(--text-primary)] truncate font-mono-data text-[12px]">{student.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-[#3F78B6]" />
                  <span className="text-[var(--text-primary)] font-mono-data">{student.telefono || 'Sin teléfono cargado'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <FirstAid size={14} className="text-red-500 mt-0.5" />
                  {sensitive ? (
                    <span className="text-[var(--text-secondary)] text-[11px]">
                      Emergencia: {sensitive.emergencyContactName || 'Sin contacto cargado'}
                      {sensitive.emergencyContactPhone ? ` · ${sensitive.emergencyContactPhone}` : ''}
                      {sensitive.emergencyContactEmail ? ` · ${sensitive.emergencyContactEmail}` : ''}
                      {sensitive.birthDate ? ` · Nac. ${isoToDisplay(sensitive.birthDate)}` : ''}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[var(--text-secondary)]">
                      <button
                        type="button"
                        onClick={() => void loadSensitive()}
                        disabled={sensitiveLoading}
                        className="underline font-semibold text-[var(--text-primary)] cursor-pointer disabled:opacity-60"
                      >
                        {sensitiveLoading ? 'Consultando…' : 'Ver contacto de emergencia'}
                      </button>
                      <span className="block text-[10px] text-[var(--text-muted)]">La consulta queda registrada en auditoría.</span>
                      {sensitiveError && <span className="block text-[10px] text-red-600">{sensitiveError}</span>}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Academic Conditions per Subject Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-heading font-bold text-sm text-[var(--text-primary)]">
                  Régimen de Asistencia por Materia
                </h4>
                <RuleBadge compact type="condicionLibre" />
              </div>
              <span className="text-xs text-[var(--text-muted)]">
                {ruleSettings ? `Mínimo institucional: ${ruleSettings.minAttendancePercent}% de asistencia` : ''}
              </span>
            </div>

            <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-surface)]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Materia</th>
                    <th className="py-2.5 px-2 text-center font-semibold">Clases</th>
                    <th className="py-2.5 px-2 text-center font-semibold text-emerald-700">P</th>
                    <th className="py-2.5 px-2 text-center font-semibold text-amber-700">T</th>
                    <th className="py-2.5 px-2 text-center font-semibold text-red-700">A</th>
                    <th className="py-2.5 px-2 text-center font-semibold text-sky-700">J</th>
                    <th className="py-2.5 px-3 text-right font-semibold">
                      <span>Presentismo</span>
                      <FormulaTooltip />
                    </th>
                    <th className="py-2.5 px-3 text-right font-semibold">Condición</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {enrolledSubjects.map(subj => {
                    const stats = student.subjects[subj.id];

                    return (
                      <tr
                        key={subj.id}
                        className={stats.condition === 'libre' ? 'bg-red-500/5' : stats.condition === 'en_riesgo' ? 'bg-amber-500/5' : ''}
                      >
                        <td className="py-2.5 px-3 font-medium text-[var(--text-primary)]">
                          {subj.name}
                          {stats.riskReason && (
                            <span className="block text-[10px] text-red-600 dark:text-red-400 font-mono-data mt-0.5">
                              {stats.riskReason}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono-data">{stats.classesHeld}</td>
                        <td className="py-2.5 px-2 text-center font-mono-data font-semibold text-emerald-700">{stats.presents}</td>
                        <td className="py-2.5 px-2 text-center font-mono-data text-amber-700">{stats.tardies}</td>
                        <td className="py-2.5 px-2 text-center font-mono-data font-bold text-red-600">{stats.absents}</td>
                        <td className="py-2.5 px-2 text-center font-mono-data text-sky-700">{stats.justified}</td>
                        <td className="py-2.5 px-3 text-right font-mono-data font-bold">
                          {stats.attendanceRate}%
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <StatusBadge status={stats.condition} size="sm" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 px-6 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] flex items-center justify-between">
          <button
            type="button"
            onClick={handleOpenChat}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--brand-navy)] text-white text-xs font-semibold rounded-lg hover:opacity-95 transition-opacity"
          >
            <ChatCircleDots size={16} weight="bold" />
            <span>Enviar mensaje directo</span>
          </button>

          <button
            type="button"
            onClick={closeStudentProfile}
            className="px-4 py-2 border border-[var(--border-strong)] text-[var(--text-secondary)] text-xs font-medium rounded-lg hover:bg-[var(--bg-surface-elevated)] transition-colors"
          >
            Cerrar ficha
          </button>
        </div>
      </div>
    </div>
  );
};
