/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Cliente HTTP de la API institucional (/api/v1)
 *
 * La sesión viaja en una cookie HttpOnly: no se guarda ningún token en el navegador.
 * Un 401 fuera de /auth avisa al resto de la app con el evento "i26:session-expired".
 */

import type { AuthMe } from './dto';

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || '/api/v1';
export const SESSION_EXPIRED_EVENT = 'i26:session-expired';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export async function apiFetch<T>(path: string, options: { method?: Method; body?: unknown } = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: options.body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor institucional.', 0);
  }

  if (response.status === 204) return undefined as T;
  const data = (await response.json().catch(() => null)) as
    | { error?: { code?: string; message?: string; details?: { field?: string; message?: string }[] } }
    | null;
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/')) {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    const detail = data?.error?.details?.find((d) => d.message)?.message;
    const message = data?.error?.message ?? 'La solicitud no pudo completarse.';
    throw new ApiError(detail && detail !== message ? `${message} ${detail}` : message, response.status, data?.error?.code);
  }
  return data as T;
}

/** Mensaje legible de cualquier error (para toasts y avisos). */
export const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Ocurrió un error inesperado.';

// ------------------------------------------------------------------ sesión

/** null = no hay sesión iniciada. */
export const getMe = async (): Promise<AuthMe | null> => {
  try {
    return await apiFetch<AuthMe>('/auth/me');
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
};

export const login = (email: string, password: string) =>
  apiFetch<AuthMe>('/auth/login', { method: 'POST', body: { email, password } });

export const changePassword = (currentPassword: string, newPassword: string) =>
  apiFetch<AuthMe>('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } });

export const logout = () => apiFetch<void>('/auth/logout', { method: 'POST' });

/** Roles que pueden entrar al panel del Centro (shared/types.ts → APP_ACCESS.centro). */
export const CENTRO_ROLES = ['STUDENT_REP', 'SUPER_ADMIN'] as const;
export const canAccessCentro = (me: AuthMe) => me.user.roles.some((r) => (CENTRO_ROLES as readonly string[]).includes(r));

/** Largo mínimo de contraseña (shared/types.ts → MIN_PASSWORD_LENGTH). */
export const MIN_PASSWORD_LENGTH = 8;
