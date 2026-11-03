/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ChatCircleDots,
  PaperPlaneRight,
  User,
  Info,
  ArrowLeft,
  Check,
  Checks,
  CalendarCheck,
  IdentificationCard
} from '@phosphor-icons/react';
import { usePreceptor } from '../../context/PreceptorContext';
import { Conversation, Student } from '../../types';
import { RuleBadge } from '../common/RuleBadge';

export const MensajesScreen: React.FC = () => {
  const {
    conversations,
    sendChatMessage,
    openStudentProfile,
    students,
    setActiveScreen,
    activeConversationId,
    setActiveConversationId,
    loadConversation
  } = usePreceptor();

  // Sin leer primero, después la más reciente
  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) =>
      (b.unreadCount > 0 ? 1 : 0) - (a.unreadCount > 0 ? 1 : 0) || b.lastMessageAt.localeCompare(a.lastMessageAt)
    );
  }, [conversations]);

  // Mobile detail view toggle
  const [mobileDetailOpen, setMobileDetailOpen] = useState<boolean>(Boolean(activeConversationId));
  const [sending, setSending] = useState<boolean>(false);

  // Message input
  const [inputText, setInputText] = useState<string>('');

  const activeConversation = useMemo(() => {
    return conversations.find(c => c.id === activeConversationId) || sortedConversations[0];
  }, [conversations, sortedConversations, activeConversationId]);

  // Carga el hilo al abrir una conversación (y lo marca leído en el servidor)
  const activeId = activeConversation?.id;
  const activeLoaded = activeConversation?.messages !== undefined;
  const activeUnread = activeConversation?.unreadCount ?? 0;
  useEffect(() => {
    if (activeId && (!activeLoaded || activeUnread > 0)) void loadConversation(activeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const associatedStudent = useMemo(() => {
    if (!activeConversation) return null;
    return students.find(s => s.id === activeConversation.studentId) ?? null;
  }, [students, activeConversation]);

  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId);
    setMobileDetailOpen(true);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation || sending) return;

    const text = inputText.trim();
    setSending(true);
    setInputText('');
    await sendChatMessage(activeConversation.id, text);
    setSending(false);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Header */}
      <section className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono-data text-[#89743A] uppercase font-semibold">
              CANAL DIRECTO CON ESTUDIANTES
            </span>
            <h1 className="font-heading font-extrabold text-2xl text-[var(--text-primary)] mt-0.5">
              Bandeja de <span className="text-[#89743A]">Mensajes</span>
            </h1>
          </div>

          {/* Mandatory notice from prompt */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 p-2.5 px-3 rounded-lg text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <Info size={16} weight="fill" className="text-amber-600 shrink-0" />
            <span>
              <strong>Aviso:</strong> Corregir asistencias <strong>NO</strong> se realiza desde el chat: para rectificaciones oficiales ingresá al
              <button
                type="button"
                onClick={() => setActiveScreen('historial')}
                className="ml-1 text-[var(--brand-navy)] dark:text-blue-300 font-bold underline"
              >
                Historial
              </button>.
            </span>
          </div>
        </div>
      </section>

      {/* Main Split Layout: Inbox (Left) & Chat Window (Right) */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xs overflow-hidden h-[620px] flex">
        {/* Left: Conversations List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-[var(--border-subtle)] flex flex-col shrink-0 ${
            mobileDetailOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-3 bg-[var(--bg-surface-elevated)] border-b border-[var(--border-subtle)] flex items-center justify-between">
            <span className="font-heading font-bold text-xs uppercase text-[var(--text-muted)] tracking-wider">
              Conversaciones ({sortedConversations.length})
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">Sin leer primero</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-subtle)]">
            {sortedConversations.length === 0 && (
              <p className="p-6 text-center text-xs text-[var(--text-muted)]">
                No tenés conversaciones. Podés escribirle a un alumno desde su ficha o desde Alumnos.
              </p>
            )}
            {sortedConversations.map(conv => {
              const isActive = conv.id === activeConversation?.id;
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`w-full p-3.5 text-left transition-colors cursor-pointer flex items-start gap-3 ${
                    isActive
                      ? 'bg-[var(--brand-navy)]/10 dark:bg-white/10'
                      : 'hover:bg-[var(--bg-surface-elevated)]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--brand-navy)] text-white font-heading font-bold text-xs flex items-center justify-center shrink-0">
                    {conv.studentName.charAt(0)}{conv.studentName.split(', ')[1]?.charAt(0) || ''}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-heading font-bold text-xs text-[var(--text-primary)] truncate">
                        {conv.studentName}
                      </h4>
                      <span className="font-mono-data text-[10px] text-[var(--text-muted)] shrink-0">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    <p className="font-mono-data text-[10px] text-[var(--text-muted)] truncate">
                      {conv.legajo} · {conv.courseLabel}
                    </p>

                    <p className="text-xs text-[var(--text-secondary)] truncate mt-1">
                      {conv.lastMessageText}
                    </p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#89743A] shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Chat Window */}
        <div
          className={`flex-1 flex flex-col bg-[var(--bg-page)] ${
            !mobileDetailOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-3 px-4 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileDetailOpen(false)}
                    className="md:hidden p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded"
                    aria-label="Volver a la bandeja"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div>
                    <h3 className="font-heading font-bold text-sm text-[var(--text-primary)]">
                      {activeConversation.studentName}
                    </h3>
                    <p className="text-[11px] font-mono-data text-[var(--text-muted)]">
                      {activeConversation.legajo} · {activeConversation.courseLabel}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {associatedStudent && (
                    <button
                      type="button"
                      onClick={() => openStudentProfile(associatedStudent)}
                      className="px-2.5 py-1.5 bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] hover:border-[#89743A] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Ver ficha académica completa del estudiante"
                    >
                      <IdentificationCard size={15} />
                      <span className="hidden sm:inline">Ver ficha</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeConversation.messages === undefined && (
                  <p className="text-center text-xs text-[var(--text-muted)]" role="status">Cargando mensajes…</p>
                )}
                {activeConversation.messages?.length === 0 && (
                  <p className="text-center text-xs text-[var(--text-muted)]">Todavía no hay mensajes. Escribí el primero.</p>
                )}
                {activeConversation.messages?.map((msg, idx, list) => {
                  const isPreceptor = msg.senderRole === 'preceptor';
                  const showDivider = idx === 0 || list[idx - 1].dateGroup !== msg.dateGroup;
                  return (
                    <React.Fragment key={msg.id}>
                    {showDivider && (
                      <div className="flex items-center justify-center my-2">
                        <span className="bg-slate-200 dark:bg-slate-800 text-[var(--text-muted)] px-3 py-0.5 rounded-full text-[11px] font-mono-data">
                          {msg.dateGroup}
                        </span>
                      </div>
                    )}
                    <div
                      className={`flex flex-col ${isPreceptor ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                          isPreceptor
                            ? 'bg-[var(--brand-navy)] text-white rounded-tr-none'
                            : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-tl-none'
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] font-mono-data mt-1 px-1">
                        <span>{msg.timestamp}</span>
                        {isPreceptor && <Checks size={13} weight="bold" className={msg.read ? 'text-[#89743A]' : 'text-[var(--text-muted)]'} />}
                      </div>
                    </div>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => void handleSend(e)}
                className="p-3 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Escribí tu mensaje..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#3F78B6]"
                />

                <button
                  type="submit"
                  disabled={sending}
                  className="disabled:opacity-60 px-4 py-2 bg-[#89743A] hover:bg-[#73612F] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <PaperPlaneRight size={16} weight="bold" />
                  <span className="hidden sm:inline">Enviar</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-[var(--text-muted)]">
              Seleccioná una conversación para ver los mensajes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
