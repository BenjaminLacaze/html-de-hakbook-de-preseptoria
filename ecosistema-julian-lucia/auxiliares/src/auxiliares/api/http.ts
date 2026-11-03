/**
 * Cliente HTTP de la API institucional (/api/v1).
 * La sesión viaja en una cookie HttpOnly: nunca se guardan tokens en el navegador.
 */
import type { AuthMe } from './dto';

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/** Evento global que se dispara cuando la API responde 401 fuera de /auth. */
export const SESSION_EXPIRED_EVENT = 'i26:session-expired';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export async function apiFetch<T>(
  path: string,
  options: { method?: Method; body?: unknown } = {}
): Promise<T> {
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
    | { error?: { code?: string; message?: string; details?: unknown } }
    | null;
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/')) {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    throw new ApiError(
      data?.error?.message ?? 'La solicitud no pudo completarse.',
      response.status,
      data?.error?.code,
      data?.error?.details
    );
  }
  return data as T;
}

/** Mensaje legible para mostrar en un toast. */
export const errorMessage = (error: unknown, fallback = 'No se pudo completar la acción.') =>
  error instanceof Error && error.message ? error.message : fallback;

// ------------------------------------------------------------------- sesión

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
  apiFetch<AuthMe>('/auth/change-password', {
    method: 'POST',
    body: { currentPassword, newPassword },
  });

export const logout = () => apiFetch<void>('/auth/logout', { method: 'POST' });
