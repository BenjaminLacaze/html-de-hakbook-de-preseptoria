/**
 * Cliente común de la API — lo usan las 4 apps.
 *
 *   import { login, getMe, logout, changePassword, ApiRequestError } from '@shared/api';
 *
 * - Habla con /api/v1 del mismo dominio. En local, el proxy de Vite manda /api a la API
 *   (npm run dev:api en la raíz, puerto 4000).
 * - La sesión viaja sola en una cookie HttpOnly: las apps NO guardan tokens.
 * - Sin React ni otras dependencias: se puede usar desde cualquier app.
 *
 * Guía para las pantallas de ingreso: docs/LOGIN_PANTALLAS.md
 */
import type {
  ApiError,
  ApiErrorCode,
  AppId,
  AuthMe,
  CreateUserRequest,
  Role,
  UpdateUserRequest,
  UserDTO,
  UserStatus,
  UserWithTemporaryPassword,
} from './types';
import { canAccessApp } from './types';

/** URL base de la API. Se puede cambiar con VITE_API_BASE_URL (por defecto, /api/v1). */
export const API_BASE_URL: string =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_API_BASE_URL ?? '/api/v1';

/** Error de la API con el formato común. `message` ya está en español y se puede mostrar. */
export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode | 'NETWORK_ERROR';
  readonly details: { field?: string; message: string }[];
  readonly traceId?: string;

  constructor(
    status: number,
    code: ApiErrorCode | 'NETWORK_ERROR',
    message: string,
    details: { field?: string; message: string }[] = [],
    traceId?: string,
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.traceId = traceId;
  }

  /** Mensaje de error de un campo del formulario, si el backend lo marcó. */
  fieldError(field: string): string | undefined {
    return this.details.find((d) => d.field === field)?.message;
  }
}

/** Pedido genérico a la API. Lanza ApiRequestError si algo sale mal. */
export async function apiFetch<T>(
  path: string,
  options: { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown; query?: Record<string, string | undefined> } = {},
): Promise<T> {
  const qs = options.query
    ? '?' +
      new URLSearchParams(
        Object.entries(options.query).filter((e): e is [string, string] => e[1] !== undefined && e[1] !== ''),
      ).toString()
    : '';

  let res: Response;
  try {
    res = await fetch(API_BASE_URL + path + qs, {
      method: options.method ?? 'GET',
      credentials: 'include',
      headers: options.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiRequestError(0, 'NETWORK_ERROR', 'No hay conexión con el servidor. Revisá tu internet y probá de nuevo.');
  }

  if (res.status === 204) return undefined as T;
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (data as ApiError | null)?.error;
    throw new ApiRequestError(
      res.status,
      err?.code ?? 'INTERNAL_ERROR',
      err?.message ?? 'Ocurrió un error inesperado. Probá de nuevo.',
      err?.details ?? [],
      err?.traceId,
    );
  }
  return data as T;
}

// ============================================================================
// Sesión
// ============================================================================

/**
 * Inicia sesión. Si `mustChangePassword` viene en true, la app tiene que mostrar
 * la pantalla de cambio de contraseña antes que nada (el resto de la API lo exige).
 */
export const login = (email: string, password: string) =>
  apiFetch<AuthMe>('/auth/login', { method: 'POST', body: { email, password } });

/** Usuario de la sesión actual, o null si no hay sesión. Llamarla al arrancar la app. */
export async function getMe(): Promise<AuthMe | null> {
  try {
    return await apiFetch<AuthMe>('/auth/me');
  } catch (e) {
    if (e instanceof ApiRequestError && e.status === 401) return null;
    throw e;
  }
}

export const logout = () => apiFetch<void>('/auth/logout', { method: 'POST' });

export const changePassword = (currentPassword: string, newPassword: string) =>
  apiFetch<AuthMe>('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } });

/** true si el usuario de la sesión puede usar esta app (ver APP_ACCESS en types.ts). */
export const hasAppAccess = (me: AuthMe, app: AppId) => canAccessApp(me.user.roles, app);

// ============================================================================
// Cuentas de usuario (panel de Directivos)
// ============================================================================

export const listUsers = (filters: { role?: Role; status?: UserStatus; search?: string } = {}) =>
  apiFetch<UserDTO[]>('/users', { query: filters });

/** Crea la cuenta. Devuelve la contraseña temporal: mostrarla UNA vez para que se la pasen a la persona. */
export const createUser = (data: CreateUserRequest) =>
  apiFetch<UserWithTemporaryPassword>('/users', { method: 'POST', body: data });

export const updateUser = (id: string, data: UpdateUserRequest) =>
  apiFetch<UserDTO>(`/users/${id}`, { method: 'PATCH', body: data });

/** Genera una contraseña temporal nueva y cierra las sesiones abiertas de esa cuenta. */
export const resetUserPassword = (id: string) =>
  apiFetch<UserWithTemporaryPassword>(`/users/${id}/reset-password`, { method: 'POST' });
