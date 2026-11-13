import { ApiError } from '../types/api';

export const API_BASE_URL = '/api/v1';

export class ApiException extends Error {
  code: ApiError['error']['code'];
  details?: string;
  traceId?: string;
  statusCode: number;

  constructor(apiError: ApiError['error'], statusCode: number) {
    super(apiError.message);
    this.name = 'ApiException';
    this.code = apiError.code;
    this.details = apiError.details;
    this.traceId = apiError.traceId;
    this.statusCode = statusCode;
  }
}

const CODE_BY_STATUS: Record<number, ApiError['error']['code']> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  429: 'TOO_MANY_ATTEMPTS',
};

/** La API manda los detalles como lista [{ field, message }]; las pantallas esperan un texto. */
function detailsText(details: unknown): string | undefined {
  if (!details) return undefined;
  if (typeof details === 'string') return details;
  if (Array.isArray(details)) return details.map((d) => d?.message).filter(Boolean).join(' ');
  return undefined;
}

/**
 * Cliente HTTP único del panel. Habla con la API común del sistema (/api/v1).
 * La sesión va en una cookie HttpOnly: por eso credentials: 'include' y nada en localStorage.
 */
export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers, credentials: 'include' });
  } catch (err: any) {
    throw new ApiException(
      { code: 'INTERNAL_ERROR', message: 'No fue posible conectar con el servidor institucional.', details: err?.message },
      0,
    );
  }

  if (!response.ok) {
    let body: any = null;
    try {
      body = await response.json();
    } catch {
      // respuesta sin JSON
    }
    throw new ApiException(
      {
        code: body?.error?.code ?? CODE_BY_STATUS[response.status] ?? 'INTERNAL_ERROR',
        message: body?.error?.message || 'Ocurrió un error inesperado. Probá de nuevo.',
        details: detailsText(body?.error?.details),
        traceId: body?.error?.traceId,
      },
      response.status,
    );
  }

  if (response.status === 204) return {} as T;
  return (await response.json()) as T;
}

// ---- Fechas: la API manda ISO en UTC; se muestran en hora de Argentina ----

const AR = 'America/Argentina/Buenos_Aires';
const parts = (iso: string) => {
  const p = new Intl.DateTimeFormat('es-AR', {
    timeZone: AR, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date(iso));
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? '';
  return { y: get('year'), m: get('month'), d: get('day'), hh: get('hour'), mm: get('minute') };
};

/** "2026-11-13T15:04:00Z" → "2026-11-13" (día en Argentina). */
export const isoDay = (iso: string) => {
  const { y, m, d } = parts(iso);
  return `${y}-${m}-${d}`;
};
/** → "12:04" */
export const isoTime = (iso: string) => {
  const { hh, mm } = parts(iso);
  return `${hh}:${mm}`;
};
/** → "13/11/2026 12:04" */
export const isoDateTime = (iso?: string | null) => {
  if (!iso) return undefined;
  const { y, m, d, hh, mm } = parts(iso);
  return `${d}/${m}/${y} ${hh}:${mm}`;
};
