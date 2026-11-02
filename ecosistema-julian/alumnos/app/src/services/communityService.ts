import { apiFetch } from '@shared/api';
import type { DirectoryEntry } from '@shared/types';
import type { CommunityMember } from '../types';
export const communityService = { async getMembers(): Promise<CommunityMember[]> { return (await apiFetch<DirectoryEntry[]>('/social/directory')).map(u => ({ id: u.id, nombre: u.firstName + ' ' + u.lastName, rol: u.roles.includes('TEACHER') ? 'Docente' : u.roles.includes('PRECEPTOR') ? 'Preceptor' : u.roles.includes('STUDENT') ? 'Compañero' : 'Coordinador', carrera: 'Sin informar', comision: 'Sin informar', email: '', activo: true })); } };
