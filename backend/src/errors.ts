// Errores con la forma única de la API (ApiError en shared/types.ts).
import type { ApiError, ApiErrorCode } from '../../shared/types.js';

const STATUS: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_ATTEMPTS: 429,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  readonly code: ApiErrorCode;
  readonly details?: ApiError['error']['details'];

  constructor(code: ApiErrorCode, message: string, details?: ApiError['error']['details']) {
    super(message);
    this.code = code;
    this.details = details;
  }

  get status(): number {
    return STATUS[this.code];
  }

  toBody(traceId?: string): ApiError {
    return { error: { code: this.code, message: this.message, details: this.details, traceId } };
  }
}

export const unauthenticated = () =>
  new AppError('UNAUTHENTICATED', 'Tenés que iniciar sesión.');

export const forbidden = (message = 'No tenés permiso para hacer esto.') =>
  new AppError('FORBIDDEN', message);

export const notFound = (message = 'No se encontró lo que buscabas.') =>
  new AppError('NOT_FOUND', message);
