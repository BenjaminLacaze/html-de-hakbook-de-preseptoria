/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Pantalla de Foros y Moderación Estudiantil
 */

import React, { useEffect, useState } from 'react';
import {
  ChatsCircle,
  Plus,
  MagnifyingGlass,
  PushPin,
  EyeSlash,
  Eye,
  WarningCircle,
  PaperPlaneRight,
  ShieldCheck,
  CheckCircle,
  ArrowLeft,
} from '@phosphor-icons/react';
import { useCentro } from '../../context/CentroContext';
import { ForoCanal, ForoRespuesta } from '../../types';
import { errorMessage } from '../../api/http';
import { FilterChips } from '../common/FilterChips';
import { Button } from '../common/Button';
import { Dialog } from '../common/Dialog';
import { PinnedBadge, ReportedBadge } from '../common/Badge';

export const ForosScreen: React.FC = () => {
  const {
    hilos,
    addHilo,
    addRespuestaToHilo,
    fetchRespuestas,
    togglePinHilo,
    hideHilo,
    unhideHilo,
    dismissDenuncia,
    selectedDetailId,
    setSelectedDetailId,
    currentUser,
  } = useCentro();

  const [activeTab, setActiveTab] = useState<'todos' | ForoCanal | 'denunciados'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [newThreadModal, setNewThreadModal] = useState(false);

  // Form states for new thread
  const [newTitulo, setNewTitulo] = useState('');
  const [newCanal, setNewCanal] = useState<ForoCanal>('general');
  const [newContenido, setNewContenido] = useState('');

  // Moderation state: hide dialog
  const [hidingThreadId, setHidingThreadId] = useState<string | null>(null);
  const [hideReason, setHideReason] = useState('');

  // Reply state
  const [replyText, setReplyText] = useState('');
  const [saving, setSaving] = useState(false);

  // Respuestas del hilo abierto (se piden a la API al abrirlo)
  const [respuestas, setRespuestas] = useState<ForoRespuesta[]>([]);
  const [respuestasLoading, setRespuestasLoading] = useState(false);
  const [respuestasError, setRespuestasError] = useState<string | null>(null);
  const [respuestasReload, setRespuestasReload] = useState(0);

  useEffect(() => {
    if (!selectedDetailId) return;
    let cancelled = false;
    setRespuestasError(null);
    setRespuestasLoading(true);
    fetchRespuestas(selectedDetailId)
      .then((rows) => !cancelled && setRespuestas(rows))
      .catch((err) => !cancelled && setRespuestasError(errorMessage(err)))
      .finally(() => !cancelled && setRespuestasLoading(false));
    return () => {
      cancelled = true;
    };
  }, [selectedDetailId, respuestasReload, fetchRespuestas]);

  // Filter threads
  const filteredHilos = hilos
    .filter((h) => {
      // Tab filter
      if (activeTab === 'denunciados') {
        return h.denunciado;
      }
      if (activeTab !== 'todos') {
        if (h.canal !== activeTab) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          h.titulo.toLowerCase().includes(q) ||
          h.contenido.toLowerCase().includes(q) ||
          h.autorNombre.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      // Pinned first
      if (a.fijado && !b.fijado) return -1;
      if (!a.fijado && b.fijado) return 1;
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });

  const selectedHilo = hilos.find((h) => h.id === selectedDetailId);

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitulo.trim().length < 2 || newContenido.trim().length < 2) {
      alert('Por favor completá el título y contenido del hilo.');
      return;
    }
    setSaving(true);
    const ok = await addHilo(newCanal, newTitulo, newContenido);
    setSaving(false);
    if (!ok) return;
    setNewThreadModal(false);
    setNewTitulo('');
    setNewContenido('');
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedHilo) return;
    setSaving(true);
    const ok = await addRespuestaToHilo(selectedHilo.id, replyText);
    setSaving(false);
    if (!ok) return;
    setReplyText('');
    setRespuestasReload((n) => n + 1);
  };

  const executeHideThread = async () => {
    if (!hidingThreadId || !hideReason.trim()) {
      alert('El motivo de moderación es obligatorio.');
      return;
    }
    setSaving(true);
    const ok = await hideHilo(hidingThreadId, hideReason);
    setSaving(false);
    if (!ok) return;
    setHidingThreadId(null);
    setHideReason('');
  };

  const getRelativeTime = (iso: string) => {
    try {
      const now = Date.now();
      const past = new Date(iso).getTime();
      const diffMin = Math.max(0, Math.round((now - past) / (1000 * 60)));

      if (diffMin < 1) return 'hace instantes';
      if (diffMin < 60) return `hace ${diffMin} min`;
      const diffHours = Math.round(diffMin / 60);
      if (diffHours < 24) return `hace ${diffHours} h`;
      const diffDays = Math.round(diffHours / 24);
      if (diffDays === 1) return 'hace 1 día';
      return `hace ${diffDays} días`;
    } catch {
      return 'recientemente';
    }
  };

  // Detailed thread view
  if (selectedHilo) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-16">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDetailId(null)}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Volver a los foros
          </Button>

          {/* Moderation actions header */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<PushPin weight={selectedHilo.fijado ? 'fill' : 'bold'} className="w-4 h-4" />}
              onClick={() => togglePinHilo(selectedHilo.id)}
            >
              {selectedHilo.fijado ? 'Desfijar' : 'Fijar hilo'}
            </Button>

            {selectedHilo.oculto ? (
              <Button
                variant="secondary"
                size="sm"
                icon={<Eye weight="bold" className="w-4 h-4" />}
                onClick={() => unhideHilo(selectedHilo.id)}
              >
                Volver a mostrar
              </Button>
            ) : (
              <Button
                variant="danger"
                size="sm"
                icon={<EyeSlash weight="bold" className="w-4 h-4" />}
                onClick={() => setHidingThreadId(selectedHilo.id)}
              >
                Ocultar hilo
              </Button>
            )}
          </div>
        </div>

        {/* Thread Box */}
        <article className="bg-surface-card rounded-2xl border border-border-subtle p-5 sm:p-7 space-y-5">
          {/* Status Banners */}
          {selectedHilo.oculto && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
              <EyeSlash weight="bold" className="w-5 h-5 shrink-0 text-rose-600" />
              <div>
                <strong>Ocultado por moderación:</strong> {selectedHilo.motivoOculto || 'sin motivo registrado'}
              </div>
            </div>
          )}

          {selectedHilo.denunciado && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <WarningCircle weight="bold" className="w-5 h-5 shrink-0 text-amber-600" />
                <div>
                  <strong>Publicación con denuncia pendiente:</strong> {selectedHilo.motivoDenuncia || 'sin motivo registrado'}
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => dismissDenuncia(selectedHilo.id)}
              >
                Desestimar
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-surface text-foreground font-semibold uppercase tracking-wider text-[11px]">
                Canal #{selectedHilo.canal}
              </span>
              {selectedHilo.fijado && <PinnedBadge />}
              <span className="text-foreground-muted font-mono">
                {getRelativeTime(selectedHilo.fecha)}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground">
              {selectedHilo.titulo}
            </h1>

            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <span>Publicado por</span>
              <strong className="text-foreground">{selectedHilo.autorNombre}</strong>
              {selectedHilo.esMiembroCentro && (
                <span className="px-1.5 py-0.2 rounded bg-brand-gold/15 text-brand-gold font-bold text-[10px]">
                  CENTRO{selectedHilo.autorCargo ? ` (${selectedHilo.autorCargo})` : ''}
                </span>
              )}
            </div>
            <div className="brand-fillet" />
          </div>

          <div className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-wrap font-sans">
            {selectedHilo.contenido}
          </div>
        </article>

        {/* Chronological Replies Section */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-foreground tracking-wider uppercase">
            Respuestas ({respuestasLoading ? selectedHilo.cantidadRespuestas : respuestas.length})
          </h3>

          <div className="space-y-3">
            {respuestasLoading && (
              <div className="p-6 text-center bg-surface-card rounded-xl border border-border-subtle text-xs text-foreground-muted">
                Cargando respuestas…
              </div>
            )}
            {respuestasError && (
              <div className="p-4 text-center bg-rose-50 dark:bg-rose-950/40 rounded-xl text-xs text-rose-800 dark:text-rose-200 space-y-2">
                <div>No se pudieron cargar las respuestas: {respuestasError}</div>
                <Button size="sm" variant="secondary" onClick={() => setRespuestasReload((n) => n + 1)}>
                  Reintentar
                </Button>
              </div>
            )}
            {!respuestasLoading && !respuestasError && respuestas.map((resp) => (
              <div
                key={resp.id}
                className="p-4 bg-surface rounded-xl border border-border-subtle space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <strong className="text-foreground">{resp.autorNombre}</strong>
                    {resp.esMiembroCentro && (
                      <span className="px-1.5 py-0.2 rounded bg-brand-gold/15 text-brand-gold font-bold text-[10px]">
                        CENTRO{resp.autorCargo ? ` (${resp.autorCargo})` : ''}
                      </span>
                    )}
                  </div>
                  <span className="text-foreground-muted font-mono text-[11px]">
                    {getRelativeTime(resp.fecha)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {resp.contenido}
                </p>
              </div>
            ))}

            {!respuestasLoading && !respuestasError && respuestas.length === 0 && (
              <div className="p-6 text-center bg-surface-card rounded-xl border border-border-subtle text-xs text-foreground-muted">
                Todavía no hay respuestas. ¡Arrancá vos con el voseo cercano del Centro!
              </div>
            )}
          </div>

          {/* Quick reply form */}
          <form
            onSubmit={handleSendReply}
            className="p-4 bg-surface-card rounded-xl border border-border-subtle space-y-3"
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Responder como {currentUser.nombre}
                {currentUser.cargo && ` (${currentUser.cargo})`}
              </label>
              <span className="text-[11px] text-brand-gold font-mono">
                Respuesta oficial del Centro
              </span>
            </div>

            <textarea
              rows={3}
              required
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Escribí una respuesta clara, cercana y constructiva para la comunidad estudiantil..."
              className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border-subtle font-sans"
            />

            <div className="flex justify-end">
              <Button
                variant="accent-gold"
                size="sm"
                type="submit"
                loading={saving}
                disabled={saving}
                icon={<PaperPlaneRight weight="bold" className="w-4 h-4" />}
              >
                Enviar respuesta
              </Button>
            </div>
          </form>
        </section>

        {/* MODAL DE OCULTAR CON MOTIVO OBLIGATORIO */}
        <Dialog
          isOpen={!!hidingThreadId}
          onClose={() => setHidingThreadId(null)}
          title="Ocultar hilo por moderación"
          description="El motivo es obligatorio y queda registrado para el Centro. El hilo deja de verse para el resto de la comunidad."
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground uppercase">
                Motivo de moderación *
              </label>
              <textarea
                rows={3}
                required
                value={hideReason}
                onChange={(e) => setHideReason(e.target.value)}
                placeholder="Ej.: Incumplimiento del reglamento de convivencia: insultos o spam comercial."
                className="w-full px-3 py-2 text-xs bg-surface rounded-lg border border-border-subtle"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setHidingThreadId(null)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                disabled={!hideReason.trim() || saving}
                loading={saving}
                onClick={executeHideThread}
              >
                Confirmar y ocultar
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    );
  }

  // Thread list view
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-brand-gold uppercase tracking-widest">
            ESPACIO DE DEBATE Y MODERACIÓN
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">
            Foros del <span className="text-brand-gold">Estudiantado</span>
          </h1>
          <div className="brand-fillet mt-2" />
        </div>

        <Button
          variant="accent-gold"
          onClick={() => setNewThreadModal(true)}
          icon={<Plus weight="bold" className="w-4 h-4" />}
        >
          Crear Hilo
        </Button>
      </div>

      {/* Search & Channel Filters */}
      <div className="space-y-3">
        {/* Search input */}
        <div className="relative">
          <MagnifyingGlass
            weight="bold"
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, contenido o autor..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-surface-card rounded-xl border border-border-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          />
        </div>

        {/* Filter chips */}
        <FilterChips
          selected={activeTab}
          onChange={(val) => setActiveTab(val as any)}
          options={[
            { id: 'todos', label: 'Todos los canales', count: hilos.length },
            {
              id: 'general',
              label: 'General',
              count: hilos.filter((h) => h.canal === 'general').length,
            },
            {
              id: 'propuestas',
              label: 'Propuestas',
              count: hilos.filter((h) => h.canal === 'propuestas').length,
            },
            {
              id: 'eventos',
              label: 'Eventos',
              count: hilos.filter((h) => h.canal === 'eventos').length,
            },
            {
              id: 'denunciados',
              label: 'Denunciados (Moderación)',
              count: hilos.filter((h) => h.denunciado).length,
            },
          ]}
        />
      </div>

      {/* Threads List */}
      <div className="space-y-3">
        {filteredHilos.length > 0 ? (
          filteredHilos.map((hilo) => (
            <article
              key={hilo.id}
              onClick={() => setSelectedDetailId(hilo.id)}
              className="p-5 bg-surface-card hover:bg-surface-hover rounded-xl border border-border-subtle hover:border-brand-gold/60 transition-all cursor-pointer group space-y-2.5"
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-brand-navy dark:text-brand-gold uppercase tracking-wider">
                    #{hilo.canal}
                  </span>
                  {hilo.fijado && <PinnedBadge />}
                  {hilo.denunciado && <ReportedBadge />}
                  {hilo.oculto && (
                    <span className="px-2 py-0.5 rounded text-xs bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 font-semibold">
                      Ocultado
                    </span>
                  )}
                </div>

                <span className="text-xs text-foreground-muted font-mono">
                  {getRelativeTime(hilo.fecha)}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-heading font-bold text-foreground group-hover:text-brand-navy dark:group-hover:text-brand-gold transition-colors leading-snug">
                {hilo.titulo}
              </h2>

              <p className="text-xs sm:text-sm text-foreground-muted line-clamp-2 leading-relaxed">
                {hilo.oculto ? `[Ocultado por moderación: ${hilo.motivoOculto || 'sin motivo registrado'}]` : hilo.contenido}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs text-foreground-muted">
                <div>
                  Por <strong className="text-foreground">{hilo.autorNombre}</strong>
                  {hilo.esMiembroCentro && ' (Centro)'}
                </div>

                <div className="flex items-center gap-1 font-semibold text-brand-blue">
                  <span>{hilo.cantidadRespuestas} respuestas</span>
                  <span aria-hidden="true">→</span>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="p-12 text-center bg-surface-card rounded-xl border border-border-subtle space-y-3">
            <ChatsCircle weight="bold" className="w-10 h-10 text-brand-gold mx-auto" />
            <h3 className="text-base font-semibold text-foreground">
              No se encontraron publicaciones
            </h3>
            <p className="text-xs text-foreground-muted max-w-sm mx-auto">
              Probá cambiando los filtros o creá un hilo de debate para iniciar la conversación.
            </p>
            <Button size="sm" variant="accent-gold" onClick={() => setNewThreadModal(true)}>
              Crear hilo
            </Button>
          </div>
        )}
      </div>

      {/* CREATE THREAD DIALOG */}
      <Dialog
        isOpen={newThreadModal}
        onClose={() => setNewThreadModal(false)}
        title="Crear nuevo hilo de debate"
        description="Publicación en los foros participativos de la comunidad terciaria."
        maxWidth="md"
      >
        <form onSubmit={handleCreateThread} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Canal *
            </label>
            <select
              value={newCanal}
              onChange={(e) => setNewCanal(e.target.value as ForoCanal)}
              className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border-subtle"
            >
              <option value="general">Canal General</option>
              <option value="propuestas">Propuestas Estudiantiles</option>
              <option value="eventos">Debate sobre Eventos</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Título del hilo *
            </label>
            <input
              type="text"
              required
              value={newTitulo}
              onChange={(e) => setNewTitulo(e.target.value)}
              placeholder="Ej.: Propuesta para habilitar aulas de estudio los sábados"
              className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border-subtle"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Contenido o fundamentación *
            </label>
            <textarea
              rows={4}
              required
              value={newContenido}
              onChange={(e) => setNewContenido(e.target.value)}
              placeholder="Escribí con respeto y claridad la temática a debatir..."
              className="w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border-subtle font-sans"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button variant="secondary" onClick={() => setNewThreadModal(false)}>
              Cancelar
            </Button>
            <Button variant="accent-gold" type="submit" loading={saving} disabled={saving}>
              Publicar hilo
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
