/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Respuestas de la API institucional
 *
 * Copia local (solo lo que usa este panel) de shared/types.ts del repo. Esta app no importa
 * archivos de fuera de su carpeta: si cambia el contrato, actualizar acá también.
 */

export type ID = string;
export type ISODate = string; // YYYY-MM-DD
export type ISODateTime = string;

export interface AuthMe {
  user: { id: ID; email: string; firstName: string; lastName: string; roles: string[] };
  studentId?: ID;
  teacherId?: ID;
  activeCycleId: ID | null;
  mustChangePassword: boolean;
}

// ------------------------------------------------------------ catálogos
export const REP_EVENT_TYPES = ['ACADEMIC', 'CULTURAL', 'SPORTS', 'MEETING'] as const;
export type RepEventType = (typeof REP_EVENT_TYPES)[number];

export const REP_FORUM_CATEGORIES = ['GENERAL', 'PROPOSALS', 'EVENTS'] as const;
export type RepForumCategory = (typeof REP_FORUM_CATEGORIES)[number];

export const REP_CLAIM_CATEGORIES = ['ACADEMIC', 'INFRASTRUCTURE', 'ADMINISTRATIVE', 'SUGGESTION'] as const;
export type RepClaimCategory = (typeof REP_CLAIM_CATEGORIES)[number];

export const REP_CLAIM_STATUSES = ['PENDING', 'IN_REVIEW', 'FORWARDED', 'RESOLVED', 'ARCHIVED'] as const;
export type RepClaimStatus = (typeof REP_CLAIM_STATUSES)[number];

export const REP_CLAIM_DESTINATIONS = ['BEDELIA', 'DIRECTION', 'PRECEPTORSHIP', 'STAFF'] as const;
export type RepClaimDestination = (typeof REP_CLAIM_DESTINATIONS)[number];

export type NotificationType =
  | 'ANNOUNCEMENT'
  | 'ABSENCE'
  | 'JUSTIFICATION_REQUEST'
  | 'JUSTIFICATION_APPROVED'
  | 'JUSTIFICATION_REJECTED'
  | 'MESSAGE'
  | 'FORUM'
  | 'EVENT'
  | 'CLAIM'
  | 'GENERAL';

// ------------------------------------------------------------ Centro
export interface RepEvent {
  id: ID;
  title: string;
  date: ISODate;
  time?: string;
  endTime?: string;
  location?: string;
  description: string;
  type: RepEventType;
  organizer: string;
  capacity?: number;
  coverUrl?: string;
  createdBy: ID;
  participantCount: number;
  joined: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface RepEventBody {
  title: string;
  date: ISODate;
  time?: string;
  endTime?: string | null;
  location?: string;
  description: string;
  type: RepEventType;
  organizer: string;
  capacity?: number | null;
  coverUrl?: string | null;
}

export interface RepEventParticipantView {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  careerName?: string;
  joinedAt: ISODateTime;
}

export interface RepThread {
  id: ID;
  authorId: ID;
  authorName: string;
  title: string;
  content: string;
  category: RepForumCategory;
  pinned: boolean;
  replyCount: number;
  authorPosition?: string;
  authorIsRep: boolean;
  hidden: boolean;
  hiddenReason?: string;
  reported: boolean;
  reportReason?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface RepReply {
  id: ID;
  threadId: ID;
  authorId: ID;
  authorName: string;
  authorPosition?: string;
  authorIsRep: boolean;
  content: string;
  createdAt: ISODateTime;
}

export interface RepAttachment {
  name: string;
  url: string;
  kind: 'image' | 'pdf' | 'document';
  sizeBytes?: number;
}

export interface RepAnnouncement {
  id: ID;
  title: string;
  content: string;
  authorId: ID;
  authorName: string;
  authorPosition?: string;
  pinned: boolean;
  publishDate?: ISODate;
  summary?: string;
  coverUrl?: string;
  draft: boolean;
  attachments: RepAttachment[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface RepAnnouncementBody {
  title: string;
  content: string;
  pinned?: boolean;
  publishDate?: ISODate | null;
  summary?: string | null;
  coverUrl?: string | null;
  draft?: boolean;
  attachments?: RepAttachment[];
}

export interface RepClaimHistoryItem {
  at: ISODateTime;
  type: 'CREATED' | 'STATUS' | 'FORWARDED' | 'RESPONSE' | 'ARCHIVED';
  title: string;
  note?: string;
  actorName: string;
}

export interface RepClaim {
  id: ID;
  authorId: ID;
  authorName?: string;
  authorEmail?: string;
  authorCareer?: string;
  code?: string;
  category: RepClaimCategory;
  title?: string;
  description: string;
  anonymous: boolean;
  status: RepClaimStatus;
  response?: string;
  responderId?: ID;
  forwardedTo?: RepClaimDestination;
  forwardNote?: string;
  archiveReason?: string;
  history: RepClaimHistoryItem[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface RepClaimPatch {
  status?: RepClaimStatus;
  response?: string;
  forwardedTo?: RepClaimDestination;
  forwardNote?: string;
  archiveReason?: string;
  note?: string;
}

// ------------------------------------------------------------ social
export interface DirectoryEntry {
  id: ID;
  firstName: string;
  lastName: string;
  roles: string[];
  avatarUrl?: string;
  position?: string;
}

export interface UserProfile {
  userId: ID;
  bio?: string;
  phone?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  accentColor?: string;
  position?: string;
  links: { id: string; url: string; label: string }[];
  availability: { id: string; dayOfWeek: number; startTime: string; endTime: string }[];
  updatedAt?: ISODateTime;
}

export interface AppNotification {
  id: ID;
  type: NotificationType;
  text: string;
  details?: string;
  link?: string;
  readAt?: ISODateTime;
  createdAt: ISODateTime;
}

export interface PrivateMessage {
  id: ID;
  senderId: ID;
  receiverId: ID;
  text: string;
  readAt?: ISODateTime;
  createdAt: ISODateTime;
}
