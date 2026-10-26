# CHANGELOG

## 2026-10-26 — API publicada en producción (INT-20 a INT-22)

**Qué se hizo**
- Se copió el repo del equipo (`1c28474`) al repo de deploy: `mjsis20052/sistema-gestion-i26@d44d715`, commit
  firmado por `mjsis20052`, sin forzar. Antes se verificó que lo que estaba publicado (`37485ab`) estuviera
  completo en la historia del equipo (coincide con `3e7f9cd`): no se perdió nada.
- `DATABASE_URL` no se tocó en Vercel: ya la había cargado la integración Neon↔Vercel. Como es una variable
  sensible y no se puede leer, se confirmó por comportamiento: un usuario de prueba, que solo existe en nuestra
  base, entra en producción.

**Probado en producción** (`https://sistema-gestion-i26.vercel.app/api/v1`)
- `/health` 200 · `/auth/me` sin sesión 401 · clave mala 401 · login de `prueba.profesor` 200.
- Cookie: `sga_session=…; Max-Age=43200; Path=/; HttpOnly; Secure; SameSite=Lax`.
- `/auth/me` con sesión 200 · profesor en `/users` 403 · logout 204 · `/auth/me` después 401 · ruta inexistente
  404 con JSON.
- Landing y las 4 apps cargan con contenido y sin errores (en modo demo); `/alumnos-julian/app/materias` 200;
  la redirección de la URL vieja de Nicolás responde 308.

**Observado**
- Cualquier ruta inexistente del sitio (por ejemplo `/.env` o `/package.json`) devuelve la landing con 200. **No
  expone archivos**: son los mismos 7167 bytes de `index.html` para todas. Queda anotado como INT-29.

**Sigue pendiente:** las apps publicadas no usan la API todavía (falta el login de cada una y compilarlas con
`VITE_USE_MOCK=false`); INT-23, 24 y 25 (branch `dev`, rotar la clave de Neon, desactivar los usuarios de prueba).

## 2026-10-24 — Base en Neon, usuarios de prueba y documentación de la integración

**Base de datos (Neon `neondb`, us-east-1, PostgreSQL 18)**
- Migración `20261023234548_init` aplicada con `prisma migrate deploy` (23 tablas). `prisma migrate status`:
  "Database schema is up to date". No se usó SQL a mano.
- Institución cargada; cuenta `direccion@isfdyt26.edu.ar` (Superadministrador + Directivo) con contraseña
  temporal y cambio obligatorio al entrar.
- 5 usuarios de prueba (Directivo, Secretaría, Preceptor, Profesor, Alumno), definidos en `shared/testUsers.ts`.
  Comandos: `npm run db:test-users` / `npm run db:test-users:off`.

**Agregado**
- `shared/testUsers.ts` y `backend/src/test-users.ts`. La guía de login suma el componente `TestUsersHint`
  (los muestra solo en desarrollo o con `VITE_SHOW_TEST_USERS="true"`).
- `docs/INTEGRACION_TECNICA.md`: arquitectura, modelo, autenticación, API, entornos, base, deploy, seguridad
  y problemas frecuentes.
- `docs/BACKLOG_INTEGRACION.md`: 68 tareas (INT-01 a INT-84) con estado, responsable y prioridad, y las
  decisiones pendientes.
- `.env.example` y `backend/README.md` actualizados (Neon ya creada, `sslmode=verify-full`).

**Probado**
- Login de los 5 usuarios de prueba contra Neon (API local): 200, sin cambio obligatorio, y cada uno con
  acceso solo a su app.
- La cuenta de dirección quedó con los roles correctos y la contraseña temporal coincide (verificado con bcrypt,
  sin iniciar sesión).
- `npm run typecheck` OK.

**Riesgos abiertos (ver backlog)**
- El `.env` local apunta a la base de **producción** (INT-23: crear una branch `dev` en Neon).
- La contraseña de Neon se compartió por chat: rotarla (INT-24).
- Los usuarios de prueba tienen una contraseña pública (el repo es público): desactivarlos antes de usar datos
  reales (INT-25).
- La API todavía no está publicada en Vercel (INT-20 a INT-22).

**Para trabajar en local:** `npm install` en la raíz y un `.env` con `DATABASE_URL` (pedírsela a Mauricio).

## 2026-10-23 — Backend: base de datos, login y cuentas desde Directivos

**Decisiones:** se integran los **dos** portales de Alumno (Julián y Lucía); después de que los prueben
los alumnos se elige uno. Backend con **Prisma** sobre **PostgreSQL en Neon**, y API con **Hono** dentro
del mismo proyecto de Vercel (mismo dominio que las apps: una sola sesión para todas). Las cuentas
**se crean desde Directivos**; no hay registro libre.

**Qué se agregó**
- `package.json` (raíz), `prisma.config.ts`, `.env.example`.
- `backend/prisma/schema.prisma` + migración `init`: las 23 tablas del modelo de `shared/types.ts`.
- `backend/src/`: API `/api/v1` — `/auth/login`, `/auth/logout`, `/auth/me`, `/auth/change-password`,
  `/users` (listar, crear con contraseña temporal, editar, blanquear). Seed de la primera cuenta.
- `api/index.ts`: entrada de la API en Vercel.
- `shared/api.ts`: cliente común (login, sesión, cuentas). `shared/types.ts`: `AuthMe` con
  `mustChangePassword`, `UserDTO`, `APP_ACCESS`, `ASSIGNABLE_ROLES`, `TOO_MANY_ATTEMPTS`.
- Directivos: nueva pantalla `AccountsView.tsx` (*Cuentas de acceso*). Con `VITE_USE_MOCK=false`
  reemplaza a *Usuarios y Permisos*; en modo demo se sigue viendo `UsersView`.
- `docs/LOGIN_PANTALLAS.md` (guía para el equipo) y `backend/README.md` (Neon, comandos, seguridad).

**Qué cambió**
- Puertos de desarrollo fijos: API 4000 · Directivos 5173 · Profesores 5174 · Julián 5175 · Lucía 5176
  (antes Julián, Lucía y Directivos usaban todos el 3000). Proxy `/api` → 4000 en las 4 apps.
- Directivos: `npm run dev` ahora es Vite; el servidor de prueba anterior quedó como `npm run dev:mock`.
- `vercel.json`: `installCommand: npm install`, `/api/*` → función. `scripts/build.mjs` corre
  `prisma generate` y no publica `backend/`, `api/`, `shared/` ni archivos ocultos.

**Probado (en local, contra un PostgreSQL de prueba)**
- Migración en base vacía + seed (idempotente).
- Login, clave mala, cambio de contraseña obligatorio (la API frena todo lo demás hasta cambiarla),
  alta de cuentas, email duplicado, validaciones por campo, permisos por rol (Secretaría no puede crear
  Directivos ni tocar al superadmin), blanqueo (cierra las sesiones), desactivación, bloqueo tras 5
  intentos, logout, auditoría de cada acción, nombres con acentos.
- Directivos en el navegador (modo API): la pantalla *Cuentas de acceso* lista las cuentas, crea una y
  muestra la contraseña temporal. La cookie de sesión no es legible desde JavaScript.
- Build completo de las 4 apps OK; el sitio publicado sigue en modo demo.

**NO probado**
- La API desplegada en Vercel (`api/index.ts` + rewrite `/api/*`): subido al repo del equipo, pero NO a `mjsis20052/sistema-gestion-i26` (el que publica Vercel): el sitio no cambió.
- Neon: falta crear la base (pasos en `backend/README.md`).

**Para que ande en Vercel:** crear la base en Neon, `npm run db:deploy` + `npm run db:seed` contra Neon,
y cargar `DATABASE_URL` (pooled) en Vercel.

## 2026-10-23 — Etapa 0: modelo de datos unificado (`shared/`)

**Decisiones aprobadas:** modelo terciario (comisiones), API en inglés (campos y códigos) y
PostgreSQL (Neon). Los **dos** portales de Alumno se integran; se elige uno después de que los prueben. Registradas en `docs/AJUSTES_INTEGRACION_BACKEND.md`.

**Qué cambió**
- Nuevo `shared/types.ts`: tipos y catálogos únicos (roles, turnos, estados de asistencia,
  comisiones, inscripciones, clases, justificaciones, notas, comunicados, auditoría, errores de API
  y pedidos del primer circuito de asistencia). Textos en español en las tablas `*_LABELS`.
- Nuevo `shared/README.md`: cómo usarlo y **tabla de equivalencias** de los valores viejos de cada
  app a los nuevos.
- Alias `@shared` en las 4 apps: `vite.config.ts` (más `server.fs.allow` para el modo desarrollo)
  y `tsconfig.json` / `tsconfig.app.json` (Profesores).
- `scripts/build.mjs` no publica la carpeta `shared/` en el sitio.

**Probado**
- `shared/types.ts` compila en modo estricto (incluido `erasableSyntaxOnly`, que usa Profesores).
- En las 4 apps, un archivo de prueba que importa de `@shared/types` pasa el chequeo de tipos, y un
  valor viejo (`'PRESENTE'`) es rechazado como corresponde. El archivo de prueba se borró.
- Servidor de desarrollo (Profesores y Julián): `shared/types.ts` responde 200 y el resto de las
  carpetas fuera de la app sigue bloqueado (403).
- Build completo OK.

**Todavía no:** ninguna app usa estos tipos en sus pantallas; la migración de cada app es la Etapa 2.
El sitio publicado no cambia.

## 2026-10-23 — Documento de ajustes para el backend unificado

- Nuevo `docs/AJUSTES_INTEGRACION_BACKEND.md`: diagnóstico de cómo maneja los datos cada app,
  modelo de datos unificado (catálogos que hoy no coinciden), login y API comunes, ajustes por app
  con archivos concretos, decisiones pendientes del equipo y orden de trabajo por etapas.
- Hallazgos principales: Directivos modela secundaria (divisiones/trimestres) y el resto terciario
  (comisiones/cuatrimestres); hay 4 catálogos distintos de estado de asistencia; hay dos portales de
  Alumno (Julián y Lucía); Preceptoría no tiene app.
- Solo documentación: no se cambió código.

## 2026-10-23 — Reorganización y publicación de las apps

**Problema:** en Vercel solo andaban los informes HTML. Las 4 apps React
(Profesor, Directivos, Alumno Julián, Alumno Lucía) nunca se compilaban: Vercel
servía el código fuente y el `index.html` pedía `/src/main.tsx` en la raíz del
sitio, que no existe. Además las carpetas tenían espacios y tildes en el nombre.

**Qué cambió**

- Carpetas renombradas (con `git mv`, el historial se conserva):
  - `Benjamin - Preceptoría/` → `preceptoria-benjamin/`
  - `Jesica y Agustin - Directivos/` → `directivos-jesica-agustin/`
  - `Julian - Alumnos/` → `alumnos-julian/` y `Modulo Alumno/` → `app/`
  - `Lucia - Alumnos/` → `alumnos-lucia/`, `modulo alumno/modulo-alumno-documentacion/` → `documentacion/`,
    `panel-alumno---sistema-de-asistencia-escolar/` → `app/`
  - `Nicolas - Profesores/` → `profesores-nicolas/` y `Modulo Profesor/` → `app/`
- Nuevo `scripts/build.mjs` + `vercel.json`: Vercel compila cada `app/` y la publica en
  `/<modulo>/app/`. Las URLs viejas (con espacios) redirigen a las nuevas.
- Landing (`index.html`): cada tarjeta tiene botón **Abrir app** + enlaces a la documentación.
- `alumnos-julian/app/src/App.tsx`: `BrowserRouter` con `basename` para funcionar dentro de una subcarpeta.
- `directivos-jesica-agustin/app/src/services/googleAuth.ts`: Firebase solo se inicializa si
  están las variables `VITE_FIREBASE_*`. Sin eso la app entera quedaba en blanco
  (`auth/invalid-api-key`). Ahora arranca y solo el backup a Google Drive avisa que no está configurado.
- Borrados duplicados exactos: `profesores-nicolas/app/docs/contrato-backend/` (igual a `profesores-nicolas/docs/`)
  y `alumnos-julian/app/vercel.json` (lo reemplaza el de la raíz).
- `docs/Contrato_backend_alumno_julian.md` actualizado a la versión nueva que estaba en `alumnos-julian/docs/`.
- Rutas viejas corregidas dentro de READMEs y contratos.
- Nuevos `README.md` (estructura y cómo sumar módulos) y `.gitignore` (`node_modules/`, `dist/`, `.env*`).

**Para que ande**

- Nada que configurar en Vercel: `vercel.json` define build, salida y rewrites.
- Compañeros: `git pull`. Si tenían cambios sin subir en las carpetas viejas, moverlos a la carpeta nueva.
- Para correr una app: `cd <modulo>/app && npm install --legacy-peer-deps && npm run dev`.

**Probado localmente:** build completo OK (las 4 apps compilan) y las 4 apps cargan
con contenido en el navegador servidas desde `dist/`.

**Pendiente / no tocado**

- `alumnos-lucia/app/src` tiene archivos de entrada repetidos (`App.js`, `App.jsx`, `App.tsx`,
  `index.js`, `main.tsx`); se usa `index.js` → `App.jsx`. No se borró nada: que lo decida Lucía.
- `directivos-jesica-agustin/app/server.ts` (API mock con Express) no corre en Vercel: la app usa
  sus datos de prueba internos. El botón "Descargar ZIP" (`/api/download-zip`) no funciona publicado.
- El build usa `vite build` sin `tsc`: errores de tipos no frenan el deploy.

**Deploy (cómo está conectado):** `sistema-gestion-i26.vercel.app` **no** se publica desde este repo,
sino desde `mjsis20052/sistema-gestion-i26` (proyecto Vercel `mjsis20052-3236s-projects/sistema-gestion-i26`).
- Antes, los pushes a `main` de ese repo quedaban como **Preview** (la rama de producción no estaba
  definida). Se reconectó el repo en Vercel y quedó `productionBranch = main`: probado, un push a
  `main` ahora publica directo en producción.
- Se intentó conectar Vercel a **este** repo (`BenjaminLacaze/...`) y falló: la app de Vercel en GitHub
  no tiene acceso a repos de la cuenta de Benjamín. Para eso, Benjamín tiene que darle acceso
  (o transferir/compartir el repo). Mientras tanto, los cambios de acá se publican copiándolos a
  `mjsis20052/sistema-gestion-i26`.
- Vercel (plan Hobby) **bloquea** commits cuyo autor no es `mjsis20052`
  ("Deployment was blocked"). Los commits a ese repo tienen que ir firmados por esa cuenta.
- 2026-10-23: publicado en producción con el contenido de `d525248`; las 4 apps verificadas en vivo.

## 2026-10-23 — Redirecciones de URLs viejas

Las redirecciones con espacios en el `source` no coincidían en Vercel (daban 404).
`vercel.json` ahora usa patrones `(.*)` que cubren espacios y `%20`.
