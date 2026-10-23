import axios from 'axios';

/**
 * Cliente Axios centralizado.
 * Preparado para la futura conexión con la API REST institucional.
 * La URL base se obtiene mediante la variable de entorno Vite 'VITE_API_BASE_URL'.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor para agregar token JWT cuando esté disponible en la autenticación real
apiClient.interceptors.request.use(
  (config) => {
    // Si en el futuro se almacena un token de sesión en memoria/cookie:
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('asistencia_auth_token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para respuestas y manejo de errores unificado
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Manejo futuro de sesión expirada
      console.warn('Sesión no autorizada o expirada en backend.');
    }
    return Promise.reject(error);
  }
);
