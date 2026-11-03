/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  UsersThree,
  ChatTeardropText,
  CalendarCheck,
  Heart,
  Plus,
  MagnifyingGlass,
  MapPin,
  Clock,
  Info,
  PaperPlaneRight
} from '@phosphor-icons/react';
import { usePreceptor } from '../../context/PreceptorContext';
import { FilterChip } from '../common/FilterChip';
import { toast } from 'sonner';

export const ComunidadScreen: React.FC = () => {
  const {
    forumThreads,
    createForumThread,
    addForumReply,
    loadThreadReplies,
    studentCenterEvents
  } = usePreceptor();

  const [openThreads, setOpenThreads] = useState<Record<string, boolean>>({});
  const toggleReplies = (threadId: string, hasLoaded: boolean) => {
    const next = !openThreads[threadId];
    setOpenThreads(prev => ({ ...prev, [threadId]: next }));
    if (next && !hasLoaded) void loadThreadReplies(threadId);
  };
  const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Pendiente de revisión',
    REJECTED: 'Rechazado',
    NEEDS_REVISION: 'Necesita cambios',
  };

  // Active channel
  const [activeChannel, setActiveChannel] = useState<'general' | 'consultas' | 'propuestas'>('general');
  const [searchQuery, setSearchQuery] = useState('');

  // New thread form state
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadBody, setNewThreadBody] = useState('');

  // Active thread reply inputs
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  const filteredThreads = forumThreads
    .filter(th => th.channelId === activeChannel)
    .filter(th => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return th.title.toLowerCase().includes(q) || th.body.toLowerCase().includes(q);
    });

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadBody.trim()) {
      toast.error("Completá el título y la descripción del tema.");
      return;
    }
    const ok = await createForumThread(activeChannel, newThreadTitle.trim(), newThreadBody.trim());
    if (!ok) return;
    setNewThreadTitle('');
    setNewThreadBody('');
    setShowNewThreadModal(false);
  };

  const handleSendReply = (threadId: string) => {
    const text = replyInputs[threadId]?.trim();
    if (!text) return;
    setReplyInputs(prev => ({ ...prev, [threadId]: '' }));
    setOpenThreads(prev => ({ ...prev, [threadId]: true }));
    void addForumReply(threadId, text);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono-data text-[#89743A] uppercase font-semibold">
              VIDA INSTITUCIONAL Y PARTICIPACIÓN
            </span>
            <h1 className="font-heading font-extrabold text-2xl text-[var(--text-primary)] mt-1">
              Foros y <span className="text-[#89743A]">Centro de Estudiantes</span>
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Canales de debate con la comunidad educativa y cartelera de actividades del centro estudiantil.
            </p>
          </div>

          <div className="bg-slate-100 dark:bg-slate-900 border border-[var(--border-subtle)] px-3 py-1.5 rounded-lg text-xs text-[var(--text-muted)] flex items-center gap-1.5">
            <Info size={16} />
            <span>La gestión del Centro de Estudiantes corresponde a su propio módulo.</span>
          </div>
        </div>
      </section>

      {/* Grid: 2 Columns (Foros Left 7 cols, Centro de Estudiantes Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Foros (7 cols) */}
        <section className="lg:col-span-7 space-y-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Channel filter chips */}
              <div className="flex items-center gap-2">
                <FilterChip
                  label="General"
                  active={activeChannel === 'general'}
                  onClick={() => setActiveChannel('general')}
                />
                <FilterChip
                  label="Consultas de Cursada"
                  active={activeChannel === 'consultas'}
                  onClick={() => setActiveChannel('consultas')}
                />
                <FilterChip
                  label="Propuestas"
                  active={activeChannel === 'propuestas'}
                  onClick={() => setActiveChannel('propuestas')}
                />
              </div>

              <button
                type="button"
                onClick={() => setShowNewThreadModal(true)}
                className="px-3 py-1.5 bg-[#89743A] hover:bg-[#73612F] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 shrink-0"
              >
                <Plus size={15} weight="bold" />
                <span>Nuevo tema</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar temas o publicaciones en este canal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-[#3F78B6]"
              />
              <MagnifyingGlass size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>

          {/* Threads list */}
          <div className="space-y-4">
            {filteredThreads.length === 0 && (
              <p className="py-8 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl">
                No hay temas en este canal.
              </p>
            )}
            {filteredThreads.map(thread => (
              <div
                key={thread.id}
                className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">
                      {thread.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] font-mono-data mt-0.5">
                      Iniciado por <strong>{thread.authorName}</strong> · {thread.createdAt}
                    </p>
                    {thread.status !== 'APPROVED' && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono-data bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {STATUS_LABELS[thread.status] ?? thread.status}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-mono-data bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] px-2 py-0.5 rounded text-[var(--text-muted)]">
                    {thread.replyCount} respuestas
                  </span>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                  {thread.body}
                </p>

                {thread.replyCount > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleReplies(thread.id, thread.replies !== undefined)}
                    className="text-xs font-semibold text-[#3F78B6] hover:underline cursor-pointer"
                  >
                    {openThreads[thread.id] ? 'Ocultar respuestas' : `Ver respuestas (${thread.replyCount})`}
                  </button>
                )}

                {/* Replies container */}
                {openThreads[thread.id] && thread.replies && thread.replies.length > 0 && (
                  <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
                    <p className="text-[11px] font-heading font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Respuestas:
                    </p>
                    {thread.replies.map(rep => (
                      <div
                        key={rep.id}
                        className="p-2.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono-data">
                          <strong>{rep.authorName}</strong>
                          <span>{rep.createdAt}</span>
                        </div>
                        <p className="text-[var(--text-secondary)]">{rep.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply box */}
                {thread.locked ? (
                  <p className="pt-2 text-[11px] text-[var(--text-muted)] italic">Tema cerrado: no admite respuestas.</p>
                ) : (
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Escribir respuesta oficial de preceptoría..."
                    value={replyInputs[thread.id] || ''}
                    onChange={(e) => setReplyInputs({ ...replyInputs, [thread.id]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendReply(thread.id);
                      }
                    }}
                    className="flex-1 bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-[#3F78B6]"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendReply(thread.id)}
                    className="px-3 py-1.5 bg-[var(--brand-navy)] text-white text-xs font-semibold rounded-lg hover:opacity-90 cursor-pointer flex items-center gap-1"
                  >
                    <PaperPlaneRight size={14} weight="bold" />
                    <span>Responder</span>
                  </button>
                </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Centro de Estudiantes (5 cols) */}
        <section className="lg:col-span-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UsersThree size={20} className="text-[#89743A]" />
              <h2 className="font-heading font-bold text-base text-[var(--text-primary)] uppercase tracking-wide">
                Centro de Estudiantes (ISFDyT 26)
              </h2>
            </div>
            <span className="text-[11px] font-mono-data text-[var(--text-muted)]">Modo consulta</span>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Cartelera de eventos del Centro de Estudiantes. Preceptoría la consulta en modo lectura: la inscripción es solo para estudiantes.
          </p>
          {studentCenterEvents.length === 0 && (
            <p className="text-xs text-[var(--text-muted)]">No hay eventos publicados.</p>
          )}

          <div className="space-y-3.5">
            {studentCenterEvents.map(event => (
              <div
                key={event.id}
                className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] space-y-2 hover:border-[#89743A]/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading font-bold text-sm text-[var(--text-primary)]">
                    {event.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono-data bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {event.category}
                  </span>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {event.description}
                </p>

                <div className="pt-1 text-xs text-[var(--text-muted)] space-y-1 font-mono-data">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-[#89743A]" />
                    <span>{event.date} · {event.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#3F78B6]" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between font-mono-data text-xs text-[var(--text-muted)]">
                  <span>{event.interestedCount} anotados</span>
                  <span>Organiza: {event.organizer}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* New Thread Modal */}
      {showNewThreadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl p-6 shadow-2xl space-y-4">
            <h3 className="font-heading font-bold text-base text-[var(--text-primary)]">
              Iniciar tema en el canal {activeChannel === 'general' ? 'General' : activeChannel === 'consultas' ? 'Consultas' : 'Propuestas'}
            </h3>

            <form onSubmit={(e) => void handleCreateThread(e)} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold uppercase text-[var(--text-muted)] mb-1">
                  Título del Tema *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Aclaración sobre regularidades del 2° cuatrimestre..."
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                  className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-lg p-2 text-xs focus:ring-2 focus:ring-[#3F78B6]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-[var(--text-muted)] mb-1">
                  Mensaje o Consulta *
                </label>
                <textarea
                  rows={4}
                  placeholder="Describí el asunto con claridad..."
                  value={newThreadBody}
                  onChange={(e) => setNewThreadBody(e.target.value)}
                  className="w-full bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-lg p-2 text-xs focus:ring-2 focus:ring-[#3F78B6]"
                  required
                />
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewThreadModal(false)}
                  className="px-4 py-2 border border-[var(--border-strong)] text-[var(--text-secondary)] font-semibold rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#89743A] hover:bg-[#73612F] text-white font-bold uppercase tracking-wider rounded-lg"
                >
                  Publicar tema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
