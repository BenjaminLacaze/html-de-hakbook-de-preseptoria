import React, { useState, useEffect } from 'react';
import type { ChatMessage, InstitutionalContact, MessageCategory } from '../types';
import { academicService } from '../services/academicService';
import { AlertNotification } from '../components/common/AlertNotification';
import {
  Mail,
  Send,
  Search,
  CheckCheck,
  UserCheck,
  Shield,
  GraduationCap,
  MessageSquare,
  Plus
} from 'lucide-react';

const CATEGORY_COLORS: Record<MessageCategory, { bg: string; text: string }> = {
  ACADEMICO: { bg: 'rgba(59, 130, 246, 0.1)', text: '#1D4ED8' },
  INSTITUCIONAL: { bg: 'rgba(16, 185, 129, 0.1)', text: '#047857' },
  DIRECTIVO: { bg: 'rgba(239, 68, 68, 0.1)', text: '#B91C1C' }
};

export const MessagesView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [contacts, setContacts] = useState<InstitutionalContact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Formulario nuevo mensaje
  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>('');
  const [composeData, setComposeData] = useState({
    recipientId: '',
    subject: '',
    body: '',
    category: 'ACADEMICO' as MessageCategory
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [msgs, conts] = await Promise.all([
        academicService.getMessages(),
        academicService.getInstitutionalContacts()
      ]);
      setMessages(msgs);
      setContacts(conts);
      if (conts.length > 0 && !selectedContactId) {
        setSelectedContactId(conts[0].id);
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'No se pudieron cargar los mensajes.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeData.body.trim() || !composeData.recipientId) {
      setNotification({ type: 'error', message: 'Destinatario y mensaje son obligatorios.' });
      return;
    }

    try {
      const newMsg = await academicService.sendMessage(composeData);
      setMessages(prev => [newMsg, ...prev]);
      setNotification({ type: 'success', message: 'Mensaje enviado correctamente.' });
      setIsComposeOpen(false);
      setComposeData({
        recipientId: contacts[0]?.id || '',
        subject: '',
        body: '',
        category: 'ACADEMICO'
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al enviar el mensaje.'
      });
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedContactId) return;
    const contact = contacts.find(c => c.id === selectedContactId);

    try {
      const newMsg = await academicService.sendMessage({
        recipientId: selectedContactId,
        subject: selectedMessage ? `Re: ${selectedMessage.subject}` : 'Consulta académica',
        body: replyText,
        category: 'ACADEMICO'
      });
      setMessages(prev => [newMsg, ...prev]);
      setReplyText('');
      setNotification({ type: 'success', message: `Respuesta enviada a ${contact?.name || 'destinatario'}.` });
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'No se pudo enviar la respuesta.'
      });
    }
  };

  const handleSelectMessage = async (msg: ChatMessage) => {
    setSelectedMessage(msg);
    // Establecer el contacto de la conversación
    const otherId = msg.senderId === 'tch-8492' ? msg.recipientId : msg.senderId;
    setSelectedContactId(otherId);

    if (!msg.isRead && msg.recipientId === 'tch-8492') {
      try {
        await academicService.markMessageAsRead(msg.id);
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
      } catch {
        // Silencioso
      }
    }
  };

  // Filtrado de mensajes
  const filteredMessages = messages.filter(m => {
    const q = searchQuery.toLowerCase();
    return (
      m.subject.toLowerCase().includes(q) ||
      m.body.toLowerCase().includes(q) ||
      m.senderName.toLowerCase().includes(q) ||
      m.recipientName.toLowerCase().includes(q)
    );
  });

  const activeContact = contacts.find(c => c.id === selectedContactId);
  const activeConversation = messages.filter(
    m => (m.senderId === selectedContactId && m.recipientId === 'tch-8492') ||
         (m.senderId === 'tch-8492' && m.recipientId === selectedContactId)
  ).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--isf-blue-primary)', margin: 0 }}>
            Mensajería Institucional
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Comunicate de forma directa con estudiantes de tus cátedras, Preceptoría y el Equipo Directivo.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setIsComposeOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} />
          Nuevo Mensaje
        </button>
      </div>

      {notification && (
        <AlertNotification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Contenedor Principal: Lista de Chats y Conversación Activa */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 360px) 1fr',
          gap: '1.25rem',
          minHeight: '600px'
        }}
      >
        {/* Columna Izquierda: Bandeja de Entrada y Búsqueda */}
        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Buscar por nombre o tema..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '2rem' }}>Cargando bandeja...</p>
            ) : filteredMessages.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '2rem' }}>No hay mensajes que coincidan.</p>
            ) : (
              filteredMessages.map(msg => {
                const isSelected = selectedMessage?.id === msg.id;
                const isMine = msg.senderId === 'tch-8492';
                const catColor = CATEGORY_COLORS[msg.category] || { bg: '#F3F4F6', text: '#374151' };

                return (
                  <button
                    key={msg.id}
                    onClick={() => void handleSelectMessage(msg)}
                    style={{
                      textAlign: 'left',
                      padding: '0.85rem',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid var(--isf-blue-secondary)' : '1px solid #E5E7EB',
                      backgroundColor: isSelected ? 'rgba(63, 120, 182, 0.08)' : (msg.isRead || isMine ? '#FFFFFF' : 'rgba(20, 33, 79, 0.04)'),
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--isf-blue-primary)' }}>
                        {isMine ? `Para: ${msg.recipientName}` : msg.senderName}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                        {msg.createdAt.slice(0, 10)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          backgroundColor: catColor.bg,
                          color: catColor.text
                        }}
                      >
                        {msg.category}
                      </span>
                      <strong style={{ fontSize: '0.85rem', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {msg.subject}
                      </strong>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.body}
                    </p>

                    {!msg.isRead && !isMine && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#EF4444'
                        }}
                        title="Mensaje sin leer"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Columna Derecha: Hilo de la Conversación */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {activeContact ? (
            <>
              {/* Encabezado del contacto */}
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
                    fontSize: '1.25rem'
                  }}
                >
                  {activeContact.avatar}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--isf-blue-primary)', fontWeight: 700 }}>
                    {activeContact.name}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    <span>{activeContact.role}</span>
                    <span>•</span>
                    <span>{activeContact.email}</span>
                  </div>
                </div>
              </div>

              {/* Mensajes del Hilo */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1rem 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  maxHeight: '420px'
                }}
              >
                {activeConversation.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#9CA3AF', margin: 'auto' }}>
                    No hay mensajes en esta conversación. Escribí abajo para iniciar el intercambio.
                  </p>
                ) : (
                  activeConversation.map(msg => {
                    const isMine = msg.senderId === 'tch-8492';
                    return (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: isMine ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem'
                        }}
                      >
                        <div
                          style={{
                            padding: '0.85rem 1.15rem',
                            borderRadius: isMine ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                            backgroundColor: isMine ? 'var(--isf-blue-primary)' : '#F3F4F6',
                            color: isMine ? '#FFFFFF' : '#1F2937',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                          }}
                        >
                          {msg.subject && msg.subject !== 'Sin asunto' && (
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem', color: isMine ? '#E0E7FF' : '#374151' }}>
                              {msg.subject}
                            </div>
                          )}
                          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                            {msg.body}
                          </p>
                        </div>
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: '#9CA3AF',
                            alignSelf: isMine ? 'flex-end' : 'flex-start',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <span>{msg.createdAt.slice(0, 16).replace('T', ' ')}</span>
                          {isMine && <CheckCheck size={14} style={{ color: 'var(--isf-blue-secondary)' }} />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Caja de Respuesta */}
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder={`Escribí una respuesta para ${activeContact.name}...`}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  style={{ flex: 1, resize: 'none' }}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => void handleSendReply()}
                  disabled={!replyText.trim()}
                  style={{ alignSelf: 'flex-end', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Send size={16} />
                  Enviar
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', margin: 'auto', color: '#9CA3AF' }}>
              <Mail size={48} style={{ margin: '0 auto 1rem' }} />
              <p>Seleccioná un mensaje o redactá uno nuevo para ver la conversación.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Redactar Nuevo Mensaje */}
      {isComposeOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 25, 45, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '540px',
              padding: '2rem',
              backgroundColor: '#FFFFFF'
            }}
          >
            <h2 style={{ margin: '0 0 1rem', color: 'var(--isf-blue-primary)', fontSize: '1.35rem' }}>
              Redactar Mensaje Institucional
            </h2>

            <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="msg-to">Destinatario *</label>
                <select
                  id="msg-to"
                  className="form-select"
                  required
                  value={composeData.recipientId}
                  onChange={e => setComposeData({ ...composeData, recipientId: e.target.value })}
                >
                  <option value="" disabled>Seleccionar persona o cargo...</option>
                  <optgroup label="Directivos y Preceptoría">
                    {contacts.filter(c => c.category !== 'Alumno').map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Estudiantes">
                    {contacts.filter(c => c.category === 'Alumno').map(c => (
                      <option key={c.id} value={c.id}>{c.name} — {c.role}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="msg-subj">Asunto</label>
                  <input
                    id="msg-subj"
                    className="form-input"
                    type="text"
                    placeholder="Ej. Consulta sobre cursada / Mesa de examen"
                    value={composeData.subject}
                    onChange={e => setComposeData({ ...composeData, subject: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="msg-cat">Categoría</label>
                  <select
                    id="msg-cat"
                    className="form-select"
                    value={composeData.category}
                    onChange={e => setComposeData({ ...composeData, category: e.target.value as MessageCategory })}
                  >
                    <option value="ACADEMICO">Académico</option>
                    <option value="INSTITUCIONAL">Institucional</option>
                    <option value="DIRECTIVO">Directivo</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="msg-body">Mensaje *</label>
                <textarea
                  id="msg-body"
                  className="form-textarea"
                  rows={5}
                  required
                  placeholder="Escribí el contenido del comunicado o consulta..."
                  value={composeData.body}
                  onChange={e => setComposeData({ ...composeData, body: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsComposeOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Send size={16} />
                  Enviar Mensaje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

