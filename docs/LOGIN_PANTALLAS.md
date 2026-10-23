# Pantallas de inicio de sesión — guía para cada app

**Para:** quien arme el login de Profesores, Directivos, Alumnos (Julián y Lucía) y Preceptoría.
**Estado del backend:** el login ya funciona (`backend/`). Probado en local el 2026-10-23.

## Cómo funciona el ingreso

- **No hay registro libre.** Las cuentas las crea Directivos, en "Usuarios y Permisos", en la
  pantalla *Cuentas de acceso*. Al crearla se genera una **contraseña temporal**, que se le pasa
  a la persona.
- **Usuario = email institucional.**
- La primera vez que alguien entra (o después de un blanqueo), **tiene que cambiar la
  contraseña** antes de hacer cualquier otra cosa. El backend lo exige.
- La sesión viaja en una **cookie** que el navegador maneja solo. Las apps **no guardan
  tokens** ni contraseñas en `localStorage`, `sessionStorage` ni en ningún otro lado.
- Las 4 apps están en el mismo dominio, así que **una sola sesión sirve para todas**.
- Qué rol entra a qué app está en `APP_ACCESS` (`shared/types.ts`):

| App | `AppId` | Roles que entran |
|---|---|---|
| Directivos | `directivos` | Directivo, Administrativo/Secretaría, Superadministrador |
| Profesores | `profesores` | Profesor/a, Superadministrador |
| Alumnos (Julián y Lucía) | `alumnos` | Alumno/a, Superadministrador |
| Preceptoría | `preceptoria` | Preceptor/a, Superadministrador |

## El flujo, paso a paso

```
Abre la app
   │
   ▼
getMe()  ──── null ────────────────────►  Pantalla de INGRESO
   │                                           │ login(email, clave)
   │◄──────────────────────────────────────────┘
   ▼
me.mustChangePassword ── true ─────────►  Pantalla CAMBIAR CONTRASEÑA
   │                                           │ changePassword(actual, nueva)
   │◄──────────────────────────────────────────┘
   ▼
hasAppAccess(me, '<app>') ── false ────►  Pantalla SIN ACCESO (con botón "Salir")
   │
   ▼
La app normal  (con botón "Cerrar sesión" → logout())
```

## Las 4 pantallas que hay que hacer

### 1. Ingreso

- Campos: **email** y **contraseña**, y botón **Ingresar**.
- Mientras espera la respuesta: botón deshabilitado y con "Ingresando…".
- Si falla, mostrar `error.message` tal cual: ya viene en español y no revela si el email existe.
  - Email o contraseña mal → "Email o contraseña incorrectos."
  - 5 intentos fallidos → cuenta bloqueada 15 minutos (`error.code === 'TOO_MANY_ATTEMPTS'`).
  - Sin conexión → `error.code === 'NETWORK_ERROR'`.
- Sin "Registrarse". Debajo: *"¿No tenés cuenta u olvidaste tu contraseña? Pedila en Secretaría
  o Dirección."*
- Con el estilo de cada app (logo del instituto, colores del manual de marca).

### 2. Cambiar contraseña (obligatoria la primera vez)

- Campos: **contraseña actual** (la temporal), **nueva** y **repetir nueva**.
- Mínimo `MIN_PASSWORD_LENGTH` caracteres (8). Que "repetir" coincida se controla en la pantalla.
- Errores por campo: `error.fieldError('currentPassword')`, `error.fieldError('newPassword')`.
- Al terminar bien, `changePassword` devuelve el usuario con `mustChangePassword: false` y se
  sigue a la app.
- Botón "Salir" por si entró con la cuenta equivocada.

### 3. Sin acceso

Para alguien con sesión, pero con un rol que no corresponde a esta app (por ejemplo, un
alumno que abre Profesores). Mostrar: *"Tu cuenta (Profesor/a) no tiene acceso a esta app."*
(los roles salen de `ROLE_LABELS`), un botón **Ir al inicio** (la landing, `/`) y otro
**Cerrar sesión**.

### 4. Cerrar sesión

Botón en el encabezado o en el menú de usuario → `logout()` y volver a la pantalla de ingreso.
Mostrar nombre y apellido con `me.user.firstName` y `me.user.lastName`.

## Funciones disponibles (`@shared/api`)

```ts
import { getMe, login, changePassword, logout, hasAppAccess, ApiRequestError } from '@shared/api';
import { MIN_PASSWORD_LENGTH, ROLE_LABELS, type AuthMe } from '@shared/types';
```

| Función | Qué hace |
|---|---|
| `getMe()` | Usuario de la sesión o `null` si no hay. Llamar al arrancar la app. |
| `login(email, password)` | Entra. Devuelve `AuthMe`. Lanza `ApiRequestError` si falla. |
| `changePassword(actual, nueva)` | Cambia la contraseña. Devuelve `AuthMe` actualizado. |
| `logout()` | Cierra la sesión. |
| `hasAppAccess(me, 'profesores')` | `true` si el rol del usuario puede usar esa app. |

`ApiRequestError` trae `message` (en español, para mostrar), `code`, `status` y
`fieldError(campo)`.

## Ejemplo en React (para copiar y adaptar)

`shared/` no puede importar React (no tiene `node_modules`), así que el *hook* va en cada app,
por ejemplo en `src/auth/useSession.ts`:

```tsx
import { useCallback, useEffect, useState } from 'react';
import { getMe, login as apiLogin, logout as apiLogout, changePassword as apiChange } from '@shared/api';
// en App.tsx además: import { hasAppAccess } from '@shared/api';
import type { AuthMe } from '@shared/types';

export function useSession() {
  const [me, setMe] = useState<AuthMe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe().then(setMe).finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => setMe(await apiLogin(email, password)), []);
  const changePassword = useCallback(async (a: string, n: string) => setMe(await apiChange(a, n)), []);
  const logout = useCallback(async () => {
    await apiLogout();
    setMe(null);
  }, []);

  return { me, loading, login, changePassword, logout };
}
```

Y en `App.tsx`:

```tsx
const USE_API = import.meta.env.VITE_USE_MOCK === 'false';

function App() {
  const { me, loading, login, changePassword, logout } = useSession();
  if (!USE_API) return <AppNormal />;                    // modo demo: sin login
  if (loading) return <PantallaCargando />;
  if (!me) return <Ingreso onLogin={login} />;
  if (me.mustChangePassword) return <CambiarClave onSubmit={changePassword} onLogout={logout} />;
  if (!hasAppAccess(me, 'profesores')) return <SinAcceso me={me} onLogout={logout} />;
  return <AppNormal me={me} onLogout={logout} />;
}
```

Si `getMe()` falla por algo que no es "sin sesión" (servidor caído, sin internet), lanza un
error: mostrar "No se pudo conectar" con un botón **Reintentar**.

## Modo demo

Con `VITE_USE_MOCK` distinto de `"false"` (es lo que tiene hoy el sitio publicado), la app
**no pide login** y sigue con sus datos de ejemplo. Así la demo pública no se rompe mientras
integramos.

## Cómo probarlo en tu máquina

1. En la raíz del repo, la primera vez: `npm install`, copiar `.env.example` a `.env` y
   completarlo (ver `backend/README.md`), y después `npm run db:deploy` y `npm run db:seed`.
2. API: `npm run dev:api` (queda en `http://localhost:4000`).
3. En tu app, crear `.env.development.local` con `VITE_USE_MOCK="false"`, y correr `npm run dev`.
   El proxy de Vite manda `/api` a la API local.
4. Para tener cuentas de prueba: entrar a Directivos (`http://localhost:5173`) con la cuenta del
   seed y crearlas en *Usuarios y Permisos*.

| App | Puerto local |
|---|---|
| Directivos | 5173 |
| Profesores | 5174 |
| Alumnos — Julián | 5175 |
| Alumnos — Lucía | 5176 |
| API | 4000 |

## Lo que NO hay que hacer

- No guardar el token, el usuario ni la contraseña en `localStorage` o `sessionStorage`.
- No validar la contraseña en la pantalla contra datos propios (hoy Lucía acepta cualquier
  contraseña en `AuthContext.tsx`: eso se reemplaza por `login()`).
- No tener listas propias de usuarios ni de roles: salen de la API.
- No decir si lo que está mal es el email o la contraseña.
- Julián: sacar la lectura del token de `sessionStorage` en `src/lib/apiClient.ts` y agregar
  `withCredentials: true` a Axios; la cookie viaja sola.
