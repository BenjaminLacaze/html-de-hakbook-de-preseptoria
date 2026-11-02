/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  Megaphone,
  Plus,
  Trash,
  Eye,
  CalendarBlank,
  Users,
  CheckCircle,
  Clock,
  Info
} from '@phosphor-icons/react';
import { usePreceptor } from '../../context/PreceptorContext';
import { NoticeCategory } from '../../types';
import { NOTICE_CATEGORY_LABELS, isoToDisplay, todayISO } from '../../api';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { toast } from 'sonner';

export const AnunciosScreen: React.FC = () => {
  const {
    announcements,
    createAnnouncement,
    deleteAnnouncement,
    currentCourse,
    availableCourses
  } = usePreceptor();

  // Carreras y años a cargo (un preceptor no puede publicar a toda la institución)
  const careers = useMemo(() => {
    const map = new Map<string, { id: string; name: string; years: number[] }>();
    availableCourses.forEach(c => {
      const prev = map.get(c.careerId) ?? { id: c.careerId, name: c.careerName, years: [] };
      if (!prev.years.includes(c.year)) prev.years.push(c.year);
      map.set(c.careerId, prev);
    });
    return [...map.values()].map(c => ({ ...c, years: c.years.sort() }));
  }, [availableCourses]);

  // Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<NoticeCategory | ''>('');
  const [targetCareerId, setTargetCareerId] = useState(currentCourse.careerId);
  const [targetYear, setTargetYear] = useState('Todos');
  const [expiresAt, setExpiresAt] = useState('');
  const [publishing, setPublishing] = useState(false);
  const selectedCareer = careers.find(c => c.id === targetCareerId);
  const targetCareer = selectedCareer?.name ?? 'Elegí una carrera';

  // Delete modal
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Completá el título y cuerpo del comunicado.");
      return;
    }
    if (!category) {
      toast.error("Elegí la categoría del comunicado.");
      return;
    }
    if (!selectedCareer) {
      toast.error("Elegí la carrera destinataria.");
      return;
    }

    setPublishing(true);
    const ok = await createAnnouncement({
      title: title.trim(),
      body: body.trim(),
      category,
      careerId: selectedCareer.id,
      year: targetYear === 'Todos' ? null : Number(targetYear),
      expiresAt: expiresAt || undefined,
    });
    setPublishing(false);
    if (ok) {
      setTitle('');
      setBody('');
      setExpiresAt('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono-data text-[#89743A] uppercase font-semibold">
              COMUNICACIÓN INSTITUCIONAL
            </span>
            <h1 className="font-heading font-extrabold text-2xl text-[var(--text-primary)] mt-1">
              Publicación de <span className="text-[#89743A]">Anuncios</span>
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Publicá novedades, fechas de parciales y convocatorias con vista previa en tiempo real.
            </p>
          </div>

          <span className="text-xs font-mono-data bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] px-3 py-1.5 rounded-lg text-[var(--text-muted)] self-start md:self-auto">
            {announcements.length} comunicados registrados
          </span>
        </div>
      </section>

      {/* Grid: Formulario & Vista Previa en Vivo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulario (7 cols) */}
        <section className="lg:col-span-7 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <h2 className="font-heading font-bold text-base text-[var(--text-primary)] uppercase tracking-wide">
              Nuevo Comunicado
            </h2>
            <span className="text-xs text-[var(--text-muted)]">Se publica al confirmar</span>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 text-xs">
            {/* Title */}
            <div>
              <label className="block font-heading font-bold uppercase text-[var(--text-muted)] mb-1">
                Título del Anuncio *
              </label>
              <input
                type="text"
                placeholder="Ej: Modificación de fecha del 2° Parcial de Programación..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#3F78B6]"
                required
              />
            </div>

            {/* Target Audience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-heading font-bold uppercase text-[var(--text-muted)] mb-1">
                  Carrera Destinataria
                </label>
                <select
                  value={targetCareerId}
                  onChange={(e) => {
                    setTargetCareerId(e.target.value);
                    setTargetYear('Todos');
                  }}
                  className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-lg p-2 text-xs font-semibold cursor-pointer"
                  required
                >
                  {careers.length === 0 && <option value="">Sin carreras a cargo</option>}
                  {careers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-heading font-bold uppercase text-[var(--text-muted)] mb-1">
                  Año Lectivo
                </label>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-lg p-2 text-xs font-semibold cursor-pointer"
                >
                  <option value="Todos">Todos los años</option>
                  {(selectedCareer?.years ?? []).map(y => (
                    <option key={y} value={String(y)}>{y}° Año</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className="block font-heading font-bold uppercase text-[var(--text-muted)] mb-1">
                Categoría *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NoticeCategory | '')}
                className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-lg p-2 text-xs font-semibold cursor-pointer"
                required
              >
                <option value="">Elegí una categoría…</option>
                {(Object.keys(NOTICE_CATEGORY_LABELS) as NoticeCategory[]).map(c => (
                  <option key={c} value={c}>{NOTICE_CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>

            {/* Message Body */}
            <div>
              <label className="block font-heading font-bold uppercase text-[var(--text-muted)] mb-1">
                Cuerpo del Mensaje *
              </label>
              <textarea
                rows={5}
                placeholder="Escribí el texto con lenguaje claro, respetuoso y conciso para los alumnos..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-lg p-2.5 text-xs leading-relaxed focus:ring-2 focus:ring-[#3F78B6]"
                required
              />
            </div>

            {/* Expiration date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block font-heading font-bold uppercase text-[var(--text-muted)] mb-1">
                  Vigente hasta (opcional)
                </label>
                <input
                  type="date"
                  min={todayISO()}
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-lg p-2 text-xs font-mono-data"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={publishing || careers.length === 0}
                  className="disabled:opacity-60 w-full sm:w-auto px-5 py-2.5 bg-[#89743A] hover:bg-[#73612F] text-white font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Megaphone size={16} weight="bold" />
                  <span>{publishing ? 'Publicando…' : 'Publicar comunicado'}</span>
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Vista previa en vivo para el estudiante (5 cols) */}
        <section className="lg:col-span-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-[#89743A]" />
                <h3 className="font-heading font-bold text-sm text-[var(--text-primary)] uppercase tracking-wide">
                  Vista Previa para el Estudiante
                </h3>
              </div>
              <span className="text-[11px] text-[var(--text-muted)] font-mono-data">App del Alumno</span>
            </div>

            {/* Card Mockup as seen by student */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-data font-bold uppercase bg-[#14214F] text-white">
                  {category ? NOTICE_CATEGORY_LABELS[category] : 'COMUNICADO OFICIAL'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono-data">Hoy</span>
              </div>

              <h4 className="font-heading font-bold text-base text-[var(--text-primary)]">
                {title.trim() || 'Título de ejemplo del anuncio'}
              </h4>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {body.trim() || 'Aquí aparecerá el cuerpo del mensaje tal como lo visualizarán los estudiantes en su panel personal...'}
              </p>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>Destinatarios: <strong>{targetCareer} ({targetYear === 'Todos' ? 'Todos los años' : `${targetYear}° Año`})</strong></span>
                {expiresAt && <span>Hasta: {isoToDisplay(expiresAt)}</span>}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] italic">
            * Lo ven los alumnos inscriptos en esa carrera (y año, si lo elegís) en sus paneles.
          </div>
        </section>
      </div>

      {/* Lista de Anuncios Publicados */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xs space-y-4">
        <h2 className="font-heading font-bold text-base text-[var(--text-primary)] uppercase tracking-wide pb-2 border-b border-[var(--border-subtle)]">
          Mis comunicados ({announcements.length})
        </h2>

        <div className="space-y-3">
          {announcements.length === 0 && (
            <p className="py-6 text-center text-xs text-[var(--text-muted)]">Todavía no publicaste comunicados.</p>
          )}
          {announcements.map(anc => (
            <div
              key={anc.id}
              className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">
                    {anc.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono-data ${
                      anc.status === 'vigente'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {anc.status}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono-data bg-[#AF9B63]/15 text-[#89743A]">
                    {NOTICE_CATEGORY_LABELS[anc.category] ?? anc.category}
                  </span>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                  {anc.body}
                </p>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-[var(--text-muted)] flex-wrap">
                  <span className="font-mono-data">Publicado: {anc.createdAt}</span>
                  <span>·</span>
                  <span>Destinatarios: <strong className="text-[var(--text-primary)]">{anc.targetCareer} (Año: {anc.targetYear})</strong></span>
                  {anc.expiresAt && (
                    <>
                      <span>·</span>
                      <span className="font-mono-data">Vence: {anc.expiresAt}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-start shrink-0">
                <button
                  type="button"
                  onClick={() => setDeletingId(anc.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                  title="Archivar comunicado"
                  aria-label="Eliminar anuncio"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Delete confirmation modal */}
      <ConfirmDialog
        isOpen={!!deletingId}
        title="¿Archivar este comunicado oficial?"
        description="El anuncio dejará de ser visible para los estudiantes en su panel institucional."
        confirmLabel="Sí, archivar"
        cancelLabel="Cancelar"
        isDestructive={true}
        onConfirm={() => {
          if (deletingId) void deleteAnnouncement(deletingId);
          setDeletingId(null);
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
