import { apiClient } from './client';
import { UserProfile, UserRole } from '../types/api';

/** Respuesta de /auth/login y /auth/me de la API común. */
interface AuthMe {
  user: { id: string; email: string; firstName: string; lastName: string; roles: string[] };
  mustChangePassword: boolean;
}

const ROLE_MAP: Record<string, UserRole> = {
  GUARDIAN: 'GUARDIAN',
  STUDENT: 'STUDENT',
  STUDENT_REP: 'STUDENT',
  TEACHER: 'TEACHER',
  PRECEPTOR: 'PRECEPTOR',
};

function toProfile(me: AuthMe): UserProfile {
  const roles = me.user.roles ?? [];
  return {
    id: me.user.id,
    email: me.user.email,
    firstName: me.user.firstName,
    lastName: me.user.lastName,
    dni: '',
    phone: '',
    // Este panel es solo para familias: cualquier otro rol ve la pantalla de "sin acceso".
    role: roles.includes('GUARDIAN') ? 'GUARDIAN' : (ROLE_MAP[roles[0]] ?? 'ADMIN'),
    mustChangePassword: me.mustChangePassword,
  };
}

export async function login(email: string, password: string): Promise<UserProfile> {
  const me = await apiClient<AuthMe>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
  return toProfile(me);
}

export async function getMe(): Promise<UserProfile> {
  return toProfile(await apiClient<AuthMe>('/auth/me', { method: 'GET' }));
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  await apiClient<AuthMe>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return { success: true, message: 'Contraseña actualizada correctamente.' };
}

export async function logout(): Promise<{ success: boolean }> {
  await apiClient('/auth/logout', { method: 'POST' });
  return { success: true };
}
