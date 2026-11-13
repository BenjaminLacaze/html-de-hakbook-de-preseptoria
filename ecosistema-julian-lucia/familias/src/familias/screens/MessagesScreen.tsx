import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { SectionHeader } from '../components/SectionHeader';
import { LoadingState, EmptyState, ErrorState } from '../components/States';
import * as messagesApi from '../api/messages';
import { Conversation, Message } from '../types/api';
import { formatDateTime } from '../types/dictionaries';
import { toast } from 'sonner';
import { 
  PaperPlaneRight, 
  ChatCircleText, 
  User, 
  ShieldCheck, 
  ArrowLeft,
  CircleNotch
} from '@phosphor-icons/react';

export const MessagesScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Mensajes del hilo activo
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const convs = await messagesApi.getConversations();
      setConversations(convs);
      if (convs.length > 0 && !activeConversationId) {
        setActiveConversationId(convs[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Error al recuperar las conversaciones.');
    } finally {
      setLoading(false);
    }
  }, [activeConversationId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Cargar hilo de mensajes al cambiar de conversación activa
  const loadThread = useCallback(async (convId: string) => {
    setLoadingMessages(true);
    try {
      const msgs = await messagesApi.getMessagesWith(convId);
      setMessages(msgs);
    } catch (err: any) {
      toast.error('No se pudieron cargar los mensajes.');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      loadThread(activeConversationId);
    }
  }, [activeConversationId, loadThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversationId || !newMessageText.trim() || sending) return;

    const text = newMessageText.trim();
    setSending(true);
    try {
      const sent = await messagesApi.sendMessage(activeConversationId, text);
      setMessages((prev) => [...prev, sent]);
      setNewMessageText('');

      // Actualizar último mensaje en la lista lateral
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, lastMessage: { content: sent.content, sentAt: sent.sentAt } }
            : c
        )
      );
    } catch (err: any) {
      toast.error(err.message || 'Error al enviar el mensaje.');
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  if (loading) {
    return <LoadingState message="Cargando canal de comunicación institucional..." />;
  }

  if (error) {
    return (
      <ErrorState
        message="No se pudieron cargar los mensajes"
        details={error}
        onRetry={loadConversations}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <SectionHeader
        kicker="Canal Directo de Comunicación"
        title="Mensajes con Preceptoría y Tutores"
        subtitle="Conversación institucional con el equipo de preceptoría y tutores de curso."
      />

      {conversations.length === 0 ? (
        <EmptyState
          title="No hay conversaciones activas"
          description="Los canales de consulta se habilitan automáticamente según los cursos de tus hijos."
        />
      ) : (
        <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border)] shadow-xs overflow-hidden flex flex-col md:flex-row h-[600px]">
          {/* Columna izquierda: Lista de conversaciones */}
          <div
            className={`w-full md:w-80 border-r border-[var(--border)] flex flex-col bg-[var(--surface-subtle)]/40 ${
              activeConversationId ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="p-3.5 border-b border-[var(--border)] bg-[var(--surface-card)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Canales Habilitados ({conversations.length})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
              {conversations.map((conv) => {
                const isCurrent = conv.id === activeConversationId;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`w-full text-left p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                      isCurrent
                        ? 'bg-[var(--surface-card)] border-l-3 border-[#89743A]'
                        : 'hover:bg-[var(--surface-subtle)]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#14214F] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {conv.participantName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-[var(--text)] truncate">
                          {conv.participantName}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#89743A] text-white shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#89743A] font-semibold block truncate">
                        {conv.participantRole} {conv.childName ? `· ${conv.childName}` : ''}
                      </span>
                      {conv.lastMessage && (
                        <p className="text-[11px] text-[var(--text-muted)] truncate mt-1">
                          {conv.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Columna derecha: Hilo de mensajes */}
          <div
            className={`flex-1 flex flex-col bg-[var(--surface-card)] ${
              !activeConversationId ? 'hidden md:flex items-center justify-center' : 'flex'
            }`}
          >
            {activeConv ? (
              <>
                {/* Header del chat */}
                <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-card)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveConversationId(null)}
                      className="md:hidden p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] cursor-pointer"
                      aria-label="Volver a lista de mensajes"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text)]">
                        {activeConv.participantName}
                      </h4>
                      <p className="text-[10px] text-[#89743A] font-semibold">
                        {activeConv.participantRole} {activeConv.childName ? `(Seguimiento de ${activeConv.childName})` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mensajes */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[var(--surface)]/50">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <CircleNotch className="w-6 h-6 animate-spin text-[#89743A]" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-xs text-[var(--text-muted)]">
                      No hay mensajes previos en este canal. Podés enviar tu primera consulta.
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                              isMe
                                ? 'bg-[#14214F] text-white rounded-br-xs'
                                : 'bg-[var(--surface-card)] text-[var(--text)] border border-[var(--border)] rounded-bl-xs'
                            }`}
                          >
                            {!isMe && (
                              <p className="text-[10px] font-bold text-[#89743A] mb-1">
                                {msg.senderName} ({msg.senderRole})
                              </p>
                            )}
                            <p className="whitespace-pre-line">{msg.content}</p>
                            <span
                              className={`text-[9px] block text-right mt-1 font-mono ${
                                isMe ? 'text-slate-300' : 'text-[var(--text-muted)]'
                              }`}
                            >
                              {msg.sentAt}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Compositor de mensaje */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-[var(--border)] bg-[var(--surface-card)] flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    placeholder="Escribí un mensaje formal para Preceptoría..."
                    disabled={sending}
                    className="flex-1 py-2 px-3.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
                  />
                  <button
                    type="submit"
                    disabled={!newMessageText.trim() || sending}
                    className="p-2.5 rounded-xl bg-[#14214F] hover:bg-[#1D2D63] text-white disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                    title="Enviar mensaje"
                    aria-label="Enviar mensaje"
                  >
                    <PaperPlaneRight className="w-4 h-4 text-[#AF9B63]" weight="bold" />
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center text-xs text-[var(--text-muted)] p-8">
                Seleccioná una conversación para ver los mensajes.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
