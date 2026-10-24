# Backend — API del Sistema de Gestión ISFDyT N.° 26

API única para las 4 apps, con base de datos PostgreSQL (Neon).

| Pieza | Dónde |
|---|---|
| Esquema de la base | `backend/prisma/schema.prisma` (refleja `shared/types.ts`) |
| Migraciones | `backend/prisma/migrations/` |
| API (Hono) | `backend/src/app.ts` y `backend/src/routes/` |
| Servidor local | `backend/src/dev.ts` → `http://localhost:4000/api/v1` |
| Entrada en Vercel | `api/index.ts` → `https://<sitio>/api/v1` (mismo dominio que las apps) |
| Carga inicial | `backend/src/seed.ts` (primera cuenta + datos del instituto) |
| Configuración de Prisma | `prisma.config.ts` (raíz) |

## Correrlo en local

Requisitos: Node 22+ y una base PostgreSQL. Puede ser una base de Neon (una "branch" de
desarrollo) o un PostgreSQL instalado en tu máquina.

```bash
npm install
cp .env.example .env        # completar DATABASE_URL y SEED_ADMIN_*
npm run db:deploy           # crea las tablas
npm run db:seed             # crea la primera cuenta (superadministrador)
npm run dev:api             # API en http://localhost:4000/api/v1
```

Probar: `http://localhost:4000/api/v1/health` tiene que responder `{"ok":true,…}`.

### Comandos

| Comando | Para qué |
|---|---|
| `npm run dev:api` | API local; se reinicia sola al guardar cambios |
| `npm run db:migrate` | Después de cambiar `schema.prisma`: crea una migración nueva (necesita `SHADOW_DATABASE_URL`) |
| `npm run db:deploy` | Aplica las migraciones pendientes (local o Neon) |
| `npm run db:seed` | Primera cuenta e institución. Se puede repetir: no pisa nada |
| `npm run db:generate` | Regenera el cliente de Prisma (el build lo hace solo) |
| `npm run typecheck` | Chequeo de tipos del backend |
| `npm run db:test-users` | Crea o reactiva los usuarios de prueba (uno por app, ver `shared/testUsers.ts`) |
| `npm run db:test-users:off` | Desactiva los usuarios de prueba (antes de usar datos reales) |

## Base en Neon

**Ya está creada (2026-10-24):** proyecto Neon, base `neondb`, región us-east-1, migración `init`
aplicada, institución cargada, cuenta `direccion@isfdyt26.edu.ar` y usuarios de prueba
(`npm run db:test-users`). Para trabajar en local: pedirle las cadenas de conexión a Mauricio.
Los pasos de abajo son por si hay que crearla de nuevo (por ejemplo, una base de pruebas).

### Crear la base desde cero

1. En <https://neon.tech>, crear el proyecto `sistema-gestion-i26`. Región: **AWS São Paulo
   (sa-east-1)**, la más cercana.
2. En *Connect*, copiar **dos** cadenas de conexión:
   - **Pooled** (el host tiene `-pooler`) → `DATABASE_URL`
   - **Direct** (sin `-pooler`) → `DIRECT_DATABASE_URL`
3. Ponerlas en el `.env` de tu máquina y correr `npm run db:deploy` y luego `npm run db:seed`.
   Con eso la base queda creada, con la primera cuenta.
4. En Vercel → proyecto `sistema-gestion-i26` → *Settings → Environment Variables*, cargar
   `DATABASE_URL` (la pooled). `DIRECT_DATABASE_URL` y `SEED_*` **no** hacen falta en Vercel.
5. Entrar a Directivos con la cuenta del seed, cambiar la contraseña y crear el resto de las
   cuentas desde *Usuarios y Permisos*.

> **Nunca** subir el `.env` ni pegar las cadenas de conexión en el código, en issues o en chats.
> El `.gitignore` ya lo impide; revisarlo con `git check-ignore -v .env`.

**Cuando cambia el esquema:** `npm run db:migrate` en local (crea la migración), commit, y antes
o después del deploy `npm run db:deploy` contra Neon. El deploy de Vercel **no** migra la base
solo, a propósito: así un deploy no puede romper datos sin que alguien lo decida.

## Endpoints disponibles

Prefijo: `/api/v1`. Respuestas en JSON; errores con la forma `ApiError` de `shared/types.ts`.

| Método y ruta | Quién | Qué hace |
|---|---|---|
| `GET /health` | cualquiera | Estado de la API |
| `POST /auth/login` | cualquiera | Ingreso; deja la cookie `sga_session` y devuelve `AuthMe` |
| `POST /auth/logout` | cualquiera | Cierra la sesión |
| `GET /auth/me` | con sesión | Usuario actual (`AuthMe`) |
| `POST /auth/change-password` | con sesión | Cambio de contraseña (obligatorio si `mustChangePassword`) |
| `GET /users?role=&status=&search=` | Directivo, Administrativo, Superadmin | Lista de cuentas |
| `POST /users` | ídem | Crea una cuenta; devuelve la contraseña temporal **una vez** |
| `PATCH /users/{id}` | ídem | Cambia nombre, roles o estado |
| `POST /users/{id}/reset-password` | ídem | Blanquea la contraseña y cierra sus sesiones |

Qué roles puede asignar cada uno: `ASSIGNABLE_ROLES` en `shared/types.ts`. Ejemplo: Secretaría
crea preceptores, profesores y alumnos, pero no directivos.

## Seguridad (lo que ya está hecho)

- Contraseñas con bcrypt. Nunca se guardan ni se devuelven en texto.
- Sesión en una cookie `HttpOnly`, `SameSite=Lax`, y `Secure` en Vercel. En la base se guarda
  solo el hash del token. Dura 12 h (`SESSION_TTL_HOURS`).
- 5 intentos fallidos bloquean la cuenta 15 minutos.
- La primera contraseña es temporal: hasta cambiarla, la API solo permite `/auth/me`, `/auth/logout`
  y `/auth/change-password`.
- Desactivar una cuenta o blanquear su contraseña cierra todas sus sesiones.
- El usuario y los roles salen siempre de la sesión, nunca de lo que manda la app.
- Todo alta, cambio, blanqueo e ingreso queda en `audit_logs`.
- Las mutaciones solo aceptan JSON; junto con `SameSite=Lax`, eso frena pedidos falsos
  armados desde otros sitios (CSRF).

## Pendiente

- Endpoints de estructura académica, asistencia, notas, etc. (Etapas 2 y 3 de
  `docs/AJUSTES_INTEGRACION_BACKEND.md`).
- Probar la función en Vercel (en local está probado; en Vercel todavía no se desplegó).
