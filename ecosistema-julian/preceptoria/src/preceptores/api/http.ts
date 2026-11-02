/**
 * Cliente HTTP de la API institucional (/api/v1).
 * Sesión por cookie HttpOnly: todas las llamadas van con credentials: 'include'.
 * Errores del backend: { error: { code, message, details? } }.
 */

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
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
  const data = (await response.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/')) {
      window.dispatchEvent(new Event('i26:session-expired'));
    }
    throw new ApiError(data?.error?.message ?? 'La solicitud no pudo completarse.', response.status, data?.error?.code);
  }
  return data as T;
}

/** Arma un query string ignorando valores vacíos. */
export function qs(params: Record<string, string | number | undefined | null>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');
}

export const errorMessage = (reason: unknown, fallback = 'La solicitud no pudo completarse.') =>
  reason instanceof Error ? reason.message : fallback;
