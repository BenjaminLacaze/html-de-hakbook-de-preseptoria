import { apiFetch } from '@shared/api';
import type { RepEvent, RepAnnouncement, RepThread, RepReply, RepClaim, RepClaimCategory, RepForumCategory, DirectoryEntry, PrivateMessage, Conversation, AppNotification } from '@shared/types';
const pathId = (id: string) => encodeURIComponent(id);
export const communicationService = {
  events: () => apiFetch<RepEvent[]>('/centro/events'),
  join: (id: string, joined: boolean) => apiFetch<{joined:boolean}>(`/centro/events/${pathId(id)}/join`, {method: joined ? 'DELETE' : 'POST'}),
  announcements: () => apiFetch<RepAnnouncement[]>('/centro/announcements'),
  claims: () => apiFetch<RepClaim[]>('/centro/claims'),
  createClaim: (category: RepClaimCategory, description: string) => apiFetch<{id:string}>('/centro/claims', {method:'POST',body:{category,description}}),
  threads: () => apiFetch<RepThread[]>('/centro/threads'),
  createThread: (title: string, content: string, category: RepForumCategory) => apiFetch<{id:string}>('/centro/threads', {method:'POST',body:{title,content,category}}),
  replies: (id: string) => apiFetch<RepReply[]>(`/centro/threads/${pathId(id)}/replies`),
  reply: (id: string, content: string) => apiFetch<{id:string}>(`/centro/threads/${pathId(id)}/replies`,{method:'POST',body:{content}}),
  directory: () => apiFetch<DirectoryEntry[]>('/social/directory'),
  conversations: () => apiFetch<Conversation[]>('/social/messages/conversations'),
  messages: (id: string) => apiFetch<PrivateMessage[]>(`/social/messages/with/${pathId(id)}`),
  sendMessage: (receiverId: string, text: string) => apiFetch<PrivateMessage>('/social/messages',{method:'POST',body:{receiverId,text}}),
  notifications: () => apiFetch<AppNotification[]>('/social/notifications'),
  readNotifications: (ids: string[]) => apiFetch<{updated:number}>('/social/notifications/read',{method:'POST',body:{ids}}),
};
