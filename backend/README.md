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
cp .env.example .env        # valores seguros apuntan a PostgreSQL local; completar clave local
npm run db:deploy           # crea las tablas
npm run db:seed             # crea la primera cuenta (superadministrador)
npm run db:test-users       # cuentas ficticias, solo para desarrollo local
npm run db:demo-data        # datos ficticios de los cuatro módulos
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
| `npm run db:demo-data` | Carga los datos de ejemplo (carreras, alumnos, asistencias, Auxiliares, Centro) |
| `npm run db:demo-data:off` | Borra los datos de ejemplo (todo lo marcado `demo`) |

### PostgreSQL local preparado en este equipo

La base de desarrollo local es `i26_dev` en `127.0.0.1:5440`; el clúster queda en
`backend/.local-dev/pgdata/` (ignorado por Git). Iniciar el servidor desde la raíz:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" -D "backend/.local-dev/pgdata" -l "backend/.local-dev/postgres.log" -o "-p 5440 -h 127.0.0.1" start
```

Apagarlo:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" -D "backend/.local-dev/pgdata" stop -m fast
```

El clúster escucha solo en loopback y usa autenticación local de desarrollo. Cargar únicamente
datos ficticios o de prueba. La base PostgreSQL no se sube a GitHub: allí se publican
`schema.prisma`, las migraciones y el código que puede reconstruirla. No cargar `.env`, respaldos
ni archivos `pgdata` al repositorio.

## Base en Neon

**Registro histórico del repo (2026-10-24):** documenta un proyecto Neon `neondb`, región
us-east-1, migraciones y cuentas de prueba. El usuario informa que actualmente no dispone de un
proyecto Neon para este entorno. Hasta volver a verificar titularidad/estado, tratar esos datos
como históricos y no conectarse ni migrar a Neon. La base local de desarrollo de arriba es la
única base habilitada en este paso.

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

### Endpoints agregados el 2026-10-27

Académico (`/academic/*`), asistencia unificada y justificaciones (`/attendance/*`), Auxiliares (`/staff/*`),
Centro de Estudiantes (`/centro/*`), estructura y personas (`/structure/*`), notas, comunicados, eventos,
auditoría y configuración (`/records/*`), portal del alumno (`/me/*`) y datos compartidos (`/social/*`).
Tablas completas en `docs/INTEGRACION_TECNICA.md`, secciones 12 y 13.

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
