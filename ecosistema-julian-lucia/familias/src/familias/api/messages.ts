import { apiClient, isoDateTime } from './client';
import { Conversation, Message } from '../types/api';

// Mensajería común del sistema (/social/messages): una conversación = la otra persona.
// Por eso acá el id de la conversación es el id de usuario del interlocutor.

interface DirectoryEntry { id: string; firstName: string; lastName: string; roles: string[] }
interface PrivateMessageDTO { id: string; senderId: string; receiverId: string; text: string; readAt?: string; createdAt: string }
interface ConversationDTO { with: DirectoryEntry; lastMessage: PrivateMessageDTO; unreadCount: number }
interface ContactDTO { userId: string; name: string; role: 'PRECEPTOR' | 'TEACHER'; childNames: string[]; subjects: string[] }

const ROLE_LABELS: Record<string, string> = {
  PRECEPTOR: 'Preceptoría',
  TEACHER: 'Docente',
  DIRECTOR: 'Equipo Directivo',
  ADMINISTRATIVE: 'Secretaría',
  SUPER_ADMIN: 'Administración',
  STUDENT: 'Estudiante',
  STUDENT_REP: 'Centro de Estudiantes',
  STAFF: 'Auxiliar',
  GUARDIAN: 'Familia',
};
const roleLabel = (roles: string[]) => ROLE_LABELS[roles.find((r) => ROLE_LABELS[r]) ?? ''] ?? 'ISFDyT N° 26';

/** Nombre y rol de cada interlocutor, para rotular los mensajes del hilo. */
const people = new Map<string, { name: string; role: string }>();

/**
 * Conversaciones existentes + los contactos habilitados (preceptores y docentes de los hijos)
 * con los que todavía no se habló, para poder iniciar una consulta.
 */
export async function getConversations(): Promise<Conversation[]> {
  const [convs, contacts] = await Promise.all([
    apiClient<ConversationDTO[]>('/social/messages/conversations', { method: 'GET' }),
    apiClient<ContactDTO[]>('/guardian/contacts', { method: 'GET' }),
  ]);
  const contactById = new Map(contacts.map((c) => [c.userId, c]));
  const contactRole = (c: ContactDTO) =>
    c.role === 'PRECEPTOR' ? 'Preceptoría' : `Docente${c.subjects.length ? ` · ${c.subjects.slice(0, 2).join(', ')}` : ''}`;

  const out: Conversation[] = convs.map((cv) => {
    const contact = contactById.get(cv.with.id);
    const name = `${cv.with.firstName} ${cv.with.lastName}`;
    const role = contact ? contactRole(contact) : roleLabel(cv.with.roles);
    people.set(cv.with.id, { name, role });
    return {
      id: cv.with.id,
      participantId: cv.with.id,
      participantName: name,
      participantRole: role,
      childName: contact?.childNames.join(' y ') || undefined,
      unreadCount: cv.unreadCount,
      lastMessage: { content: cv.lastMessage.text, sentAt: isoDateTime(cv.lastMessage.createdAt) ?? '' },
    };
  });
  for (const c of contacts) {
    if (out.some((x) => x.id === c.userId)) continue;
    people.set(c.userId, { name: c.name, role: contactRole(c) });
    out.push({
      id: c.userId,
      participantId: c.userId,
      participantName: c.name,
      participantRole: contactRole(c),
      childName: c.childNames.join(' y ') || undefined,
      unreadCount: 0,
    });
  }
  return out;
}

const toMessage = (m: PrivateMessageDTO, otherId: string): Message => {
  const fromOther = m.senderId === otherId;
  const other = people.get(otherId);
  return {
    id: m.id,
    senderId: m.senderId,
    senderName: fromOther ? (other?.name ?? 'ISFDyT N° 26') : 'Vos',
    senderRole: fromOther ? (other?.role ?? '') : 'Familia',
    recipientId: m.receiverId,
    sentAt: isoDateTime(m.createdAt) ?? '',
    content: m.text,
    isRead: Boolean(m.readAt),
  };
};

/** Trae el hilo con esa persona (y la API marca como leídos los mensajes recibidos). */
export async function getMessagesWith(conversationId: string): Promise<Message[]> {
  const rows = await apiClient<PrivateMessageDTO[]>(`/social/messages/with/${encodeURIComponent(conversationId)}`, { method: 'GET' });
  return rows.map((m) => toMessage(m, conversationId));
}

export async function sendMessage(conversationId: string, content: string): Promise<Message> {
  const m = await apiClient<PrivateMessageDTO>('/social/messages', {
    method: 'POST',
    body: JSON.stringify({ receiverId: conversationId, text: content }),
  });
  return toMessage(m, conversationId);
}
