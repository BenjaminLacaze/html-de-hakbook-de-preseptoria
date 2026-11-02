/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Pantalla y Editor de Comunicados con Vista Previa
 */

import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  PushPin,
  CalendarCheck,
  FileText,
  Pencil,
  Trash,
  Eye,
  DeviceMobile,
  Desktop,
  ArrowLeft,
  Calendar,
  Check,
} from '@phosphor-icons/react';
import { useCentro } from '../../context/CentroContext';
import { AdjuntoItem, Comunicado, ComunicadoEstado, ComunicadoInput } from '../../types';
import { FilterChips } from '../common/FilterChips';
import { Button } from '../common/Button';
import { Dialog } from '../common/Dialog';
import { AttachmentIcon, LinkAttachmentEditor, NoUploadNotice, isHttpUrl } from '../common/LinkAttachmentEditor';
import { todayISO } from '../../api/centro';
import { PinnedBadge, ScheduledBadge } from '../common/Badge';
import { LOGO_MARCA_PNG, LOGO_MARCA_SVG } from '../../lib/assets';

/** Mañana en Buenos Aires (YYYY-MM-DD), valor inicial para programar. */
const tomorrowISO = () => {
  const [y, m, d] = todayISO().split('-').map(Number);
  const t = new Date(Date.UTC(y!, m! - 1, d! + 1));
  return t.toISOString().slice(0, 10);
};

/** Resumen para listas cuando el comunicado no tiene extracto propio. */
const resumen = (c: Comunicado) =>
  c.extracto || (c.contenido.length > 160 ? `${c.contenido.slice(0, 160)}…` : c.contenido);

const fechaCorta = (iso?: string) => (iso ? iso.split('-').reverse().join('/') : '');

export const ComunicadosScreen: React.FC = () => {
  const {
    comunicados,
    addComunicado,
    updateComunicado,
    deleteComunicado,
    selectedDetailId,
    setSelectedDetailId,
  } = useCentro();

  const [filter, setFilter] = useState<'todos' | ComunicadoEstado>('todos');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [titulo, setTitulo] = useState('');
  const [extracto, setExtracto] = useState('');
  const [contenido, setContenido] = useState('');
  const [portadaUrl, setPortadaUrl] = useState('');
  const [fijado, setFijado] = useState(false);
  const [adjuntos, setAdjuntos] = useState<AdjuntoItem[]>([]);
  const [scheduledDate, setScheduledDate] = useState(tomorrowISO);
  const [saving, setSaving] = useState(false);

  // Preview & Confirmation Dialogs
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<'mobile' | 'desktop'>('mobile');
  const [pendingPublishAction, setPendingPublishAction] = useState<ComunicadoEstado | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Sorting: Pinned first, then by date descending
  const sortedComunicados = [...comunicados].sort((a, b) => {
    if (a.fijado && !b.fijado) return -1;
    if (!a.fijado && b.fijado) return 1;
    return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
  });

  const filteredComunicados = sortedComunicados.filter((c) => {
    if (filter === 'todos') return true;
    return c.estado === filter;
  });

  // Selected detail
  const selectedComunicado = comunicados.find((c) => c.id === selectedDetailId);

  const startNewComunicado = () => {
    setEditingId(null);
    setTitulo('');
    setExtracto('');
    setContenido('');
    setPortadaUrl('');
    setFijado(false);
    setAdjuntos([]);
    setScheduledDate(tomorrowISO());
    setIsEditing(true);
    setSelectedDetailId(null);
  };

  const startEditComunicado = (c: Comunicado) => {
    setEditingId(c.id);
    setTitulo(c.titulo);
    setExtracto(c.extracto);
    setContenido(c.contenido);
    setPortadaUrl(c.portadaUrl || '');
    setFijado(c.fijado);
    setAdjuntos(c.adjuntos);
    setScheduledDate(c.estado === 'programado' && c.fechaPublicacion ? c.fechaPublicacion : tomorrowISO());
    setIsEditing(true);
  };

  const handleTriggerPublish = (action: ComunicadoEstado) => {
    if (titulo.trim().length < 2 || contenido.trim().length < 2) {
      alert('Por favor completá el título y el contenido del comunicado.');
      return;
    }
    if (portadaUrl.trim() && !isHttpUrl(portadaUrl)) {
      alert('La portada tiene que ser un enlace que empiece con https://');
      return;
    }
    if (action === 'programado' && (!scheduledDate || scheduledDate <= todayISO())) {
      alert('Para programar, elegí una fecha posterior a hoy.');
      return;
    }
    setPendingPublishAction(action);
    setShowPreviewModal(true);
  };

  const executeConfirmedPublish = async () => {
    if (!pendingPublishAction) return;

    const payload: ComunicadoInput = {
      titulo,
      extracto,
      contenido,
      portadaUrl: portadaUrl.trim() || undefined,
      fijado,
      adjuntos,
      estado: pendingPublishAction,
      fechaPublicacion: pendingPublishAction === 'programado' ? scheduledDate : undefined,
    };

    setSaving(true);
    const ok = editingId ? await updateComunicado(editingId, payload) : await addComunicado(payload);
    setSaving(false);
    if (!ok) return;

    setShowPreviewModal(false);
    setIsEditing(false);
    setEditingId(null);
    setPendingPublishAction(null);
  };

  // Helper for formatting text
  const insertFormatting = (syntax: string) => {
    setContenido((prev) => prev + syntax);
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} · ${hours}:${mins} hs`;
    } catch {
      return iso;
    }
  };

  // Render detail view if a specific announcement is selected
  if (selectedComunicado && !isEditing) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDetailId(null)}
            icon={<ArrowLeft weight="bold" className="w-4 h-4" />}
          >
            Volver a comunicados
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Pencil weight="bold" className="w-4 h-4" />}
              onClick={() => startEditComunicado(selectedComunicado)}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash weight="bold" className="w-4 h-4" />}
              onClick={() => setDeleteConfirmId(selectedComunicado.id)}
            >
              Eliminar
            </Button>
          </div>
        </div>

        <article className="bg-surface-card rounded-2xl border border-border-subtle p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {selectedComunicado.fijado && <PinnedBadge />}
              {selectedComunicado.estado === 'programado' && <ScheduledBadge />}
              {selectedComunicado.estado === 'programado' && selectedComunicado.fechaPublicacion && (
                <span className="text-xs text-foreground-muted">
                  Se publica el {fechaCorta(selectedComunicado.fechaPublicacion)}
                </span>
              )}
              {selectedComunicado.estado === 'borrador' && (
                <span className="px-2 py-0.5 rounded text-xs bg-slate-200 text-slate-800">
                  Borrador (solo lo ve el Centro)
                </span>
              )}
              <span className="text-xs text-foreground-muted font-mono">
                {formatDate(selectedComunicado.fechaCreacion)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground leading-tight">
              {selectedComunicado.titulo}
            </h1>

            <div className="text-xs sm:text-sm text-foreground-muted font-medium">
              Publicado por <strong className="text-brand-navy dark:text-brand-gold">{selectedComunicado.autorNombre}</strong>
              {selectedComunicado.autorCargo && <> · {selectedComunicado.autorCargo}</>}
            </div>
            <div className="brand-fillet" />
          </div>

          {selectedComunicado.portadaUrl && (
            <div className="rounded-xl overflow-hidden border border-border-subtle max-h-72">
              <img
                src={selectedComunicado.portadaUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Body with formatting */}
          <div className="prose dark:prose-invert max-w-none text-foreground text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
            {selectedComunicado.contenido}
          </div>

          {/* Attachments */}
          {selectedComunicado.adjuntos.length > 0 && (
            <div className="pt-6 border-t border-border-subtle space-y-3">
              <h4 className="text-xs font-bold text-foreground tracking-wider uppercase">
                Documentos y Archivos Adjuntos ({selectedComunicado.adjuntos.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedComunicado.adjuntos.map((att) => (
                  <a
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-surface hover:bg-surface-hover rounded-xl border border-border-subtle flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <AttachmentIcon tipo={att.tipo} className="w-5 h-5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-foreground truncate">
                          {att.nombre}
                        </div>
                        <div className="text-[11px] text-foreground-muted font-mono">
                          {att.tamanioBytes !== undefined ? `${(att.tamanioBytes / 1024).toFixed(1)} KB · ` : ''}
                          {att.tipo.toUpperCase()} · enlace
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-brand-blue font-medium shrink-0">
                      Abrir enlace →
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Modal de confirmación de eliminación */}
        <Dialog
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          title="¿Eliminar comunicado?"
          description="El comunicado se borra del sistema y deja de verse en la cartelera."
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-foreground-muted">
              ¿Estás seguro/a de quitar este comunicado de la cartelera digital?
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  if (deleteConfirmId && (await deleteComunicado(deleteConfirmId))) {
                    setSelectedDetailId(null);
                    setDeleteConfirmId(null);
                  }
                }}
              >
                Sí, eliminar
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    );
  }

  // Render Full Screen Editor
  if (isEditing) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-16">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-brand-gold uppercase tracking-widest">
              EDITOR UNIFICADO
            </div>
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground">
              {editingId ? 'Editar Comunicado' : 'Nuevo Comunicado Institucional'}
            </h1>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(false)}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Cancelar
          </Button>
        </div>
        <div className="brand-fillet" />

        <div className="bg-surface-card rounded-2xl border border-border-subtle p-5 sm:p-7 space-y-5">
          {/* Título */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Título del comunicado *
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej.: Cronograma de Mesas de Exámenes Finales Diciembre 2026"
              className="w-full px-3.5 py-2.5 text-sm bg-surface rounded-lg border border-border-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            />
          </div>

          {/* Extracto breve */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Extracto breve para el inicio (resumen de 1 o 2 oraciones)
            </label>
            <input
              type="text"
              value={extracto}
              onChange={(e) => setExtracto(e.target.value)}
              placeholder="Ej.: Fechas provisorias elevadas por Bedelía sujetas a revisión asamblearia."
              className="w-full px-3.5 py-2 text-sm bg-surface rounded-lg border border-border-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            />
          </div>

          {/* Barra de herramientas para formato básico */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Contenido del comunicado *
              </label>
              <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                <span>Herramientas rápidas:</span>
                <button
                  type="button"
                  onClick={() => insertFormatting('**texto en negrita**')}
                  className="px-2 py-0.5 rounded bg-surface hover:bg-surface-hover border border-border-subtle font-bold"
                  title="Negrita"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('\n### Subtítulo\n')}
                  className="px-2 py-0.5 rounded bg-surface hover:bg-surface-hover border border-border-subtle font-semibold"
                  title="Subtítulo"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('\n- Elemento de lista\n- Segundo elemento')}
                  className="px-2 py-0.5 rounded bg-surface hover:bg-surface-hover border border-border-subtle"
                  title="Lista"
                >
                  • Lista
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('[Enlace](https://isfdyt26.edu.ar)')}
                  className="px-2 py-0.5 rounded bg-surface hover:bg-surface-hover border border-border-subtle underline"
                  title="Enlace"
                >
                  Link
                </button>
              </div>
            </div>

            <textarea
              rows={9}
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Escribí el texto completo del comunicado con tono claro, cercano y respetuoso..."
              className="w-full px-3.5 py-3 text-sm bg-surface rounded-lg border border-border-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue font-sans leading-relaxed"
            />
          </div>

          {/* Portada opcional */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Enlace (URL) de imagen de portada (opcional)
            </label>
            <NoUploadNotice what="imágenes" />
            <input
              type="url"
              value={portadaUrl}
              onChange={(e) => setPortadaUrl(e.target.value)}
              placeholder="https://ejemplo.com/foto_actividad.jpg"
              className="w-full px-3.5 py-2 text-sm bg-surface rounded-lg border border-border-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            />
          </div>

          {/* Fijar en cartelera */}
          <div className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border-subtle">
            <input
              type="checkbox"
              id="fijar-check"
              checked={fijado}
              onChange={(e) => setFijado(e.target.checked)}
              className="w-4 h-4 rounded text-brand-navy focus:ring-brand-blue"
            />
            <label htmlFor="fijar-check" className="text-xs sm:text-sm text-foreground cursor-pointer select-none">
              <strong>Fijar en la cartelera:</strong> Aparece arriba de todo para que nadie se lo pierda.
            </label>
          </div>

          {/* Adjuntos por enlace */}
          <LinkAttachmentEditor attachments={adjuntos} onChange={setAdjuntos} maxFiles={10} />

          {/* Programación de fecha y hora */}
          <div className="p-4 bg-surface rounded-xl border border-border-subtle space-y-3">
            <div className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
              <Calendar weight="bold" className="w-4 h-4 text-brand-gold" />
              <span>Programar publicación futura</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="text-[11px] text-foreground-muted block mb-1">Fecha de publicación</label>
                <input
                  type="date"
                  value={scheduledDate}
                  min={tomorrowISO()}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface-card rounded-md border border-border-subtle"
                />
              </div>
              <p className="text-[11px] text-foreground-muted">
                La comunidad lo ve desde las 0 h de ese día. Hasta entonces solo lo ve el Centro.
              </p>
            </div>
          </div>

          {/* 3 Botones de acción */}
          <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => handleTriggerPublish('borrador')}
            >
              Guardar borrador
            </Button>

            <Button
              variant="secondary"
              icon={<CalendarCheck weight="bold" className="w-4 h-4" />}
              onClick={() => handleTriggerPublish('programado')}
            >
              Programar
            </Button>

            <Button
              variant="accent-gold"
              icon={<Eye weight="bold" className="w-4 h-4" />}
              onClick={() => handleTriggerPublish('publicado')}
            >
              Vista previa y Publicar
            </Button>
          </div>
        </div>

        {/* DIALOG DE VISTA PREVIA OBLIGATORIA (Móvil vs Escritorio) */}
        <Dialog
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          title="Vista previa obligatoria de publicación"
          description="Revisá cómo lo verá un alumno en celular o en computadora antes de confirmar."
          maxWidth={previewViewport === 'mobile' ? 'md' : '2xl'}
        >
          <div className="space-y-4">
            {/* Viewport Selector */}
            <div className="flex items-center justify-between p-2 bg-surface rounded-lg border border-border-subtle">
              <span className="text-xs font-semibold text-foreground">Dispositivo:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewViewport('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    previewViewport === 'mobile'
                      ? 'bg-brand-navy text-white shadow-xs'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  <DeviceMobile weight="bold" className="w-4 h-4" />
                  <span>Celular (375px)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    previewViewport === 'desktop'
                      ? 'bg-brand-navy text-white shadow-xs'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  <Desktop weight="bold" className="w-4 h-4" />
                  <span>Escritorio</span>
                </button>
              </div>
            </div>

            {/* Container simulator */}
            <div
              className={`mx-auto bg-surface rounded-xl border border-border-subtle p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[50vh] ${
                previewViewport === 'mobile' ? 'max-w-[375px] shadow-sm' : 'w-full'
              }`}
            >
              <div className="flex items-center gap-2">
                <img
                  src={LOGO_MARCA_PNG}
                  alt="Centro de Estudiantes"
                  className="h-10 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = LOGO_MARCA_SVG;
                  }}
                />
              </div>

              <div className="space-y-2">
                {fijado && <PinnedBadge />}
                <h3 className="text-base sm:text-lg font-heading font-bold text-foreground">
                  {titulo || 'Sin título'}
                </h3>
                <div className="text-[11px] text-foreground-muted">
                  Por el Centro de Estudiantes · Hoy
                </div>
              </div>

              {portadaUrl && (
                <div className="rounded-lg overflow-hidden border border-border-subtle h-36">
                  <img src={portadaUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {contenido || 'Sin contenido aún...'}
              </div>

              {adjuntos.length > 0 && (
                <div className="pt-3 border-t border-border-subtle space-y-1.5">
                  <div className="text-[11px] font-bold text-foreground uppercase">
                    Adjuntos para descargar ({adjuntos.length}):
                  </div>
                  {adjuntos.map((a) => (
                    <div key={a.id} className="text-xs text-brand-blue flex items-center gap-1.5">
                      <AttachmentIcon tipo={a.tipo} className="w-3.5 h-3.5" />
                      <span className="truncate">{a.nombre}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirmation Banner */}
            <div className="p-3 bg-brand-gold/10 rounded-lg border border-brand-gold/20 text-xs text-foreground-muted space-y-1">
              <div className="font-semibold text-foreground">
                Estado seleccionado: {pendingPublishAction?.toUpperCase()}
                {pendingPublishAction === 'programado' && ` · ${fechaCorta(scheduledDate)}`}
              </div>
              <div>
                {pendingPublishAction === 'publicado'
                  ? 'Al confirmar, el comunicado se guarda en el sistema y lo ve toda la comunidad.'
                  : pendingPublishAction === 'programado'
                    ? 'Al confirmar, se guarda en el sistema y la comunidad lo ve desde la fecha elegida.'
                    : 'Al confirmar, se guarda como borrador: solo lo ve el Centro.'}
              </div>
            </div>

            {/* Confirm Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
                Modificar borrador
              </Button>
              <Button
                variant="accent-gold"
                icon={<Check weight="bold" className="w-4 h-4" />}
                onClick={executeConfirmedPublish}
                loading={saving}
                disabled={saving}
              >
                {pendingPublishAction === 'publicado'
                  ? 'Confirmar y publicar ahora'
                  : pendingPublishAction === 'programado'
                    ? 'Confirmar programación'
                    : 'Guardar borrador'}
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    );
  }

  // Render List View
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-brand-gold uppercase tracking-widest">
            COMUNICACIÓN DIRECTA
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">
            Cartelera de <span className="text-brand-gold">Comunicados</span>
          </h1>
          <div className="brand-fillet mt-2" />
        </div>

        <Button
          variant="accent-gold"
          onClick={startNewComunicado}
          icon={<Plus weight="bold" className="w-4 h-4" />}
        >
          Nuevo Comunicado
        </Button>
      </div>

      {/* Filter chips: Todos, Publicados, Programados, Borradores */}
      <FilterChips
        selected={filter}
        onChange={(val) => setFilter(val as any)}
        options={[
          { id: 'todos', label: 'Todos', count: sortedComunicados.length },
          {
            id: 'publicado',
            label: 'Publicados',
            count: sortedComunicados.filter((c) => c.estado === 'publicado').length,
          },
          {
            id: 'programado',
            label: 'Programados',
            count: sortedComunicados.filter((c) => c.estado === 'programado').length,
          },
          {
            id: 'borrador',
            label: 'Borradores',
            count: sortedComunicados.filter((c) => c.estado === 'borrador').length,
          },
        ]}
      />

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredComunicados.length > 0 ? (
          filteredComunicados.map((item) => (
            <article
              key={item.id}
              onClick={() => setSelectedDetailId(item.id)}
              className="bg-surface-card hover:bg-surface-hover rounded-xl border border-border-subtle hover:border-brand-gold/60 p-5 sm:p-6 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              role="button"
              tabIndex={0}
            >
              <div className="space-y-2.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {item.fijado && <PinnedBadge />}
                  {item.estado === 'programado' && <ScheduledBadge />}
                  {item.estado === 'programado' && item.fechaPublicacion && (
                    <span className="text-xs text-foreground-muted">
                      desde el {fechaCorta(item.fechaPublicacion)}
                    </span>
                  )}
                  {item.estado === 'borrador' && (
                    <span className="px-2 py-0.5 rounded text-xs bg-slate-200 dark:bg-slate-800 text-foreground-muted font-medium">
                      Borrador
                    </span>
                  )}
                  <span className="text-xs text-foreground-muted font-mono">
                    {formatDate(item.fechaCreacion)}
                  </span>
                  {item.adjuntos.length > 0 && (
                    <span className="text-xs text-brand-gold font-medium">
                      · {item.adjuntos.length} adjunto(s)
                    </span>
                  )}
                </div>

                <h2 className="text-lg sm:text-xl font-heading font-bold text-foreground group-hover:text-brand-navy dark:group-hover:text-brand-gold transition-colors leading-snug">
                  {item.titulo}
                </h2>

                <p className="text-xs sm:text-sm text-foreground-muted line-clamp-2 leading-relaxed">
                  {resumen(item)}
                </p>

                <div className="text-xs text-foreground-muted pt-1">
                  Por <strong className="text-foreground">{item.autorNombre}</strong>
                  {item.autorCargo && ` (${item.autorCargo})`}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <span className="text-xs text-brand-blue font-semibold group-hover:underline">
                  Leer completo →
                </span>
              </div>
            </article>
          ))
        ) : (
          <div className="p-12 text-center bg-surface-card rounded-xl border border-border-subtle space-y-3">
            <Megaphone weight="bold" className="w-10 h-10 text-brand-gold mx-auto" />
            <h3 className="text-base font-semibold text-foreground">
              No hay comunicados en esta sección
            </h3>
            <p className="text-xs text-foreground-muted max-w-sm mx-auto">
              Podés redactar un comunicado nuevo para mantener informados a los estudiantes de todas las carreras.
            </p>
            <Button size="sm" variant="accent-gold" onClick={startNewComunicado}>
              Redactar el primero
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
