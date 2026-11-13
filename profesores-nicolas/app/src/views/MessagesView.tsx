import React, { useEffect, useRef, useState } from 'react';
import type { ChatMessage, ConversationSummary, InstitutionalContact } from '../types';
import { academicService } from '../services/academicService';
import { AlertNotification } from '../components/common/AlertNotification';
import { Mail, Plus, Search, Send } from 'lucide-react';

interface MessagesViewProps {
  /** Id de la cuenta docente en sesión; lo usa el backend para armar los hilos. */
  currentUserId: string;
}

const formatDate = (iso: string, withTime = false): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
};

export const MessagesView: React.FC<MessagesViewProps> = ({ currentUserId }) => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [contacts, setContacts] = useState<InstitutionalContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<InstitutionalContact | null>(null);
  const [thread, setThread] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [threadLoading, setThreadLoading] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(
    null,
  );

  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>('');
  const [composeData, setComposeData] = useState({ recipientId: '', body: '' });
  // El listener de `focus` se registra una vez; el ref evita capturar el contacto inicial.
  const selectedContactRef = useRef<InstitutionalContact | null>(null);

  const loadConversations = async (): Promise<ConversationSummary[]> => {
    const rows = await academicService.getConversations();
    setConversations(rows);
    return rows;
  };

  const loadThread = async (contact: InstitutionalContact) => {
    setSelectedContact(contact);
    selectedContactRef.current = contact;
    setThreadLoading(true);
    try {
      const messages = await academicService.getConversation(contact);
      setThread(messages);
      setConversations((prev) =>
        prev.map((c) => (c.contact.id === contact.id ? { ...c, unreadCount: 0 } : c)),
      );
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'No se pudo cargar la conversación.',
      });
    } finally {
      setThreadLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [rows, directory] = await Promise.all([
          academicService.getConversations(),
          academicService.getInstitutionalContacts(),
        ]);
        setConversations(rows);
        setContacts(directory);
        if (rows.length > 0) {
          void loadThread(rows[0].contact);
        }
      } catch (err) {
        setNotification({
          type: 'error',
          message: err instanceof Error ? err.message : 'No se pudieron cargar los mensajes.',
        });
      } finally {
        setLoading(false);
      }
    };
    void loadData();
    // La recarga al volver al foco mantiene el hilo al día sin WebSocket.
    const refresh = () => {
      void loadConversations();
      if (selectedContactRef.current) void loadThread(selectedContactRef.current);
    };
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedContact || busy) return;
    setBusy(true);
    setNotification(null);
    try {
      await academicService.sendMessage({ recipientId: selectedContact.id, body: replyText.trim() });
      setReplyText('');
      await Promise.all([loadThread(selectedContact), loadConversations()]);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'No se pudo enviar la respuesta.',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleSendNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeData.recipientId || !composeData.body.trim() || busy) {
      setNotification({ type: 'error', message: 'Destinatario y mensaje son obligatorios.' });
      return;
    }
    const contact = contacts.find((c) => c.id === composeData.recipientId);
    if (!contact) return;
    setBusy(true);
    try {
      await academicService.sendMessage({ recipientId: contact.id, body: composeData.body.trim() });
      setNotification({ type: 'success', message: `Mensaje enviado a ${contact.name}.` });
      setIsComposeOpen(false);
      setComposeData({ recipientId: '', body: '' });
      await loadConversations();
      await loadThread(contact);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'No se pudo enviar el mensaje.',
      });
    } finally {
      setBusy(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return `${c.contact.name} ${c.lastMessage.body}`.toLowerCase().includes(q);
  });

  const staffContacts = contacts.filter((c) => c.category !== 'Alumno');
  const studentContacts = contacts.filter((c) => c.category === 'Alumno');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <span className="eyebrow">Comunicación</span>
          <h1 className="page-title">Mensajes</h1>
          <p className="page-subtitle">Conversaciones con estudiantes, Preceptoría y Dirección.</p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setIsComposeOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} />
          Nuevo mensaje
        </button>
      </div>

      {notification && (
        <AlertNotification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 360px) minmax(0, 1fr)',
          gap: '1.25rem',
          minHeight: '600px',
        }}
      >
        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}
              aria-hidden="true"
            />
            <input
              type="search"
              className="form-input"
              placeholder="Buscar por nombre o mensaje..."
              aria-label="Buscar conversaciones"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '2rem' }}>Cargando bandeja...</p>
            ) : filteredConversations.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '1.5rem' }}>
                <Mail size={32} style={{ margin: '0 auto 0.75rem' }} aria-hidden="true" />
                <p style={{ margin: 0 }}>No hay conversaciones todavía.</p>
                <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem' }}>
                  Usá “Nuevo mensaje” para iniciar una.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedContact?.id === conv.contact.id;
                return (
                  <button
                    key={conv.contact.id}
                    type="button"
                    onClick={() => void loadThread(conv.contact)}
                    style={{
                      textAlign: 'left',
                      padding: '0.85rem',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid var(--isf-blue-secondary)' : '1px solid #E5E7EB',
                      backgroundColor: isSelected
                        ? 'var(--color-bg-sidebar-active)'
                        : conv.unreadCount > 0
                          ? 'var(--color-bg-card-hover)'
                          : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--isf-blue-primary)' }}>
                        {conv.contact.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                        {formatDate(conv.lastMessage.createdAt, false)}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{conv.contact.role}</span>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        color: '#6B7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {conv.lastMessage.senderId === currentUserId ? 'Vos: ' : ''}
                      {conv.lastMessage.body}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          minWidth: '18px',
                          height: '18px',
                          padding: '0 4px',
                          borderRadius: '9px',
                          backgroundColor: '#EF4444',
                          color: '#FFFFFF',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title={`${conv.unreadCount} mensaje(s) sin leer`}
                      >
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {selectedContact ? (
            <>
              <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(20, 33, 79, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--isf-blue-primary)',
                  }}
                  aria-hidden="true"
                >
                  {selectedContact.avatar}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--isf-blue-primary)', fontWeight: 700 }}>
                    {selectedContact.name}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    <span>{selectedContact.role}</span>
                    {selectedContact.email && (
                      <>
                        <span>•</span>
                        <span>{selectedContact.email}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1rem 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  maxHeight: '420px',
                }}
              >
                {threadLoading ? (
                  <p style={{ textAlign: 'center', color: '#9CA3AF', margin: 'auto' }}>Cargando conversación...</p>
                ) : thread.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#9CA3AF', margin: 'auto' }}>
                    No hay mensajes en esta conversación. Escribí abajo para iniciar el intercambio.
                  </p>
                ) : (
                  thread.map((msg) => {
                    const isMine = msg.senderId === currentUserId;
                    return (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: isMine ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                        }}
                      >
                        <div
                          style={{
                            padding: '0.85rem 1.15rem',
                            borderRadius: isMine ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                            backgroundColor: isMine ? 'var(--isf-blue-primary)' : '#F3F4F6',
                            color: isMine ? '#FFFFFF' : '#1F2937',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              color: 'inherit',
                              fontSize: '0.9rem',
                              lineHeight: 1.5,
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {msg.body}
                          </p>
                        </div>
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: '#9CA3AF',
                            alignSelf: isMine ? 'flex-end' : 'flex-start',
                          }}
                        >
                          {formatDate(msg.createdAt, true)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                <textarea
                  className="form-textarea"
                  rows={2}
                  aria-label={`Respuesta para ${selectedContact.name}`}
                  placeholder={`Escribí una respuesta para ${selectedContact.name}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{ flex: 1, resize: 'none' }}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => void handleSendReply()}
                  disabled={!replyText.trim() || busy}
                  style={{ alignSelf: 'flex-end', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Send size={16} />
                  Enviar
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', margin: 'auto', color: '#9CA3AF' }}>
              <Mail size={48} style={{ margin: '0 auto 1rem' }} aria-hidden="true" />
              <p>Seleccioná una conversación o redactá un mensaje nuevo.</p>
            </div>
          )}
        </div>
      </div>

      {isComposeOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="compose-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 25, 45, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '540px', padding: '2rem', backgroundColor: '#FFFFFF' }}>
            <h2 id="compose-title" style={{ margin: '0 0 1rem', color: 'var(--isf-blue-primary)', fontSize: '1.35rem' }}>
              Nuevo mensaje
            </h2>

            <form onSubmit={handleSendNew} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="msg-to">
                  Destinatario *
                </label>
                <select
                  id="msg-to"
                  className="form-select"
                  required
                  value={composeData.recipientId}
                  onChange={(e) => setComposeData({ ...composeData, recipientId: e.target.value })}
                >
                  <option value="" disabled>
                    Seleccionar persona...
                  </option>
                  <optgroup label="Directivos, Preceptoría y docentes">
                    {staffContacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.role})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Estudiantes">
                    {studentContacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="msg-body">
                  Mensaje *
                </label>
                <textarea
                  id="msg-body"
                  className="form-textarea"
                  rows={5}
                  required
                  placeholder="Escribí el contenido del mensaje..."
                  value={composeData.body}
                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsComposeOpen(false)}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={busy}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Send size={16} />
                  Enviar mensaje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
