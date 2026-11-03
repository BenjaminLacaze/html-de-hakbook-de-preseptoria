# Panel de Preceptores — ISFDyT N° 26

Panel de Preceptoría (rol `PRECEPTOR` o `SUPER_ADMIN`) conectado a la API institucional (`backend/`, `/api/v1`).

## Desarrollo

1. `npm install --legacy-peer-deps`
2. Levantar el backend en `http://localhost:4000` (ver `backend/`).
3. `npm run dev` (puerto 3003). Vite redirige `/api` al backend, así la cookie de sesión queda en el mismo origen.

La base de la API se puede cambiar con `VITE_API_BASE_URL` (ver `.env.example`).

## Código

- `src/preceptores/api/`: cliente HTTP, una función por endpoint, tipos locales espejo de `shared/types.ts` y mapeo API ↔ pantallas.
- `src/preceptores/auth/SessionGate.tsx`: login, cambio obligatorio de contraseña y control de rol.
- `src/preceptores/context/PreceptorContext.tsx`: estado cargado desde la API. Los porcentajes y el riesgo los calcula el backend.
