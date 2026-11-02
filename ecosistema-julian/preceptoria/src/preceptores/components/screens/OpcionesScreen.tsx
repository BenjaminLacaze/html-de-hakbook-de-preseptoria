/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bell, Info, ChalkboardTeacher, ArrowClockwise } from '@phosphor-icons/react';
import { usePreceptor } from '../../context/PreceptorContext';

export const OpcionesScreen: React.FC = () => {
  const { subjects, currentCourse, reload } = usePreceptor();

  const notificationKinds = [
    { label: 'Nuevas solicitudes de justificación', desc: 'Cuando un alumno presenta una justificación.' },
    { label: 'Mensajes directos', desc: 'Consultas recibidas en la bandeja de mensajería.' },
    { label: 'Foro académico', desc: 'Respuestas y novedades de los temas que moderás.' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono-data text-[#89743A] uppercase font-semibold">
              PREFERENCIAS DEL SISTEMA
            </span>
            <h1 className="font-heading font-extrabold text-2xl text-[var(--text-primary)] mt-1">
              <span className="text-[#89743A]">Opciones</span>
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Cómo se comparte la planilla con docentes y qué notificaciones recibís.
            </p>
          </div>

          <button
            type="button"
            onClick={reload}
            className="flex items-center gap-1.5 px-3 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] hover:border-[#89743A] rounded-lg text-xs font-semibold transition-colors cursor-pointer self-start md:self-auto"
          >
            <ArrowClockwise size={16} weight="bold" />
            <span>Recargar datos del servidor</span>
          </button>
        </div>
      </section>

      {/* 1. Planilla compartida con docentes */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <ChalkboardTeacher size={20} className="text-[#89743A]" />
            <h2 className="font-heading font-bold text-base text-[var(--text-primary)] uppercase tracking-wide">
              Planilla compartida con docentes
            </h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
            Docentes y preceptoría cargan sobre la <strong>misma planilla</strong>: una clase por comisión y fecha, y un registro por
            alumno. No hace falta sincronizar nada. Si alguien cambia un estado ya guardado, el sistema lo registra como corrección
            con quién la hizo y el motivo (ver Historial).
          </p>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {subjects.map(subj => (
            <div key={subj.id} className="py-3 text-xs">
              <strong className="font-heading font-bold text-sm text-[var(--text-primary)] block">
                {subj.name} <span className="font-mono-data text-[11px] text-[var(--text-muted)]">· {subj.shortCode}</span>
              </strong>
              <p className="text-[var(--text-secondary)]">
                Docente: {subj.teacherName} · <span className="font-mono-data">{subj.scheduleDays}</span> · {subj.studentCount} inscriptos
              </p>
            </div>
          ))}
          {subjects.length === 0 && (
            <p className="py-3 text-xs text-[var(--text-muted)]">No hay comisiones en {currentCourse.fullLabel}.</p>
          )}
        </div>
      </section>

      {/* 2. Notificaciones */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-[#3F78B6]" />
            <h2 className="font-heading font-bold text-base text-[var(--text-primary)] uppercase tracking-wide">
              Centro de Notificaciones
            </h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Por ahora recibís todas estas notificaciones en la campana.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          {notificationKinds.map(n => (
            <div key={n.label} className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-b-0">
              <div>
                <strong className="text-[var(--text-primary)] block">{n.label}</strong>
                <span className="text-[var(--text-muted)]">{n.desc}</span>
              </div>
              <span className="font-mono-data text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">Activa</span>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-secondary)] flex items-center gap-2">
          <Info size={18} className="text-[#89743A] shrink-0" />
          <span>Elegir qué notificaciones recibir todavía no está disponible en el sistema institucional.</span>
        </div>
      </section>
    </div>
  );
};
