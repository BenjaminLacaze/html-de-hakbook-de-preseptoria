# CHANGELOG

## 2026-10-28 — Login común e integración de portales; relevo para Claude (sin publicar)

- Decisión final del usuario: conservar **Neon**. Supabase queda como alternativa documentada, sin migración.
- `shared/auth/SessionGate.tsx`: sesión real, login, cambio obligatorio, referencias de roles y cierre.
  `shared/api.ts`: consultas sin caché y aviso de sesión vencida. React compartido deduplicado por Vite.
- Directivos: panel real de altas académicas/cuentas/inscripciones, asignación de comisión y notas.
- Profesores: servicios reales, clases incluso vacías/cerradas, carga/publicación de calificaciones.
- Ambos portales Alumno: adaptadores reales `/me`, `/records`, `/social`, eliminación de mockData,
  comunidad Centro/mensajes y errores explícitos; se deshabilitan acciones que no tienen soporte real.
- Consolidación: nueva entrada `OperationalApp.tsx` con asistencia, justificaciones, foro/avisos,
  Auxiliares, Centro y datos personales compartidos. La entrada ya no ejecuta el store demo legacy.
- Backend: `GET /attendance/commissions/:id/sessions` y `/ready` para verificar PostgreSQL.
- Batería reproducible: cinco escenarios QA con contraseñas privadas, cinco CRUD Centro/Auxiliar,
  alta completa por HTTP y porcentaje 100→0→100. Pruebas locales y build completo correctos.
- Neon: respaldo consistente de 39 tablas/1210 filas en `.local-backups/` (ignorado), limpieza confirmada
  de 2 carreras/60 alumnos/18 comisiones demo y desactivación de las 7 cuentas públicas de prueba.
  Cinco escenarios QA persistidos. Prueba remota parcial: escenario 1 confirmado; se detuvo para relevo.
- No se publicó el nuevo código en Vercel. Pendientes: completar cinco recorridos Neon, QA visual de
  todas las pantallas y publicación coordinada del repo de deploy.
- Relevo completo: `docs/RELEVO_CLAUDE_2026-10-28.md`, `MEJORAS.md` y `AGENTS.md` de este proyecto.
  Credenciales, respaldo y resultados privados NO se versionan. `recursos/` y `julian appcompleta/` preservados.

## 2026-10-27 (noche) — Publicada la API de datos compartidos

**Publicado:** repo de deploy `53af151` = equipo `f4c3986` (commit firmado por `mjsis20052`, sin forzar; antes se verificó
que lo publicado coincidía con `29ba221`). Vercel: "Deployment has completed".

**Probado en producción (solo lecturas, para no dejar datos de prueba en la base real): 30 de 30 OK.**
- Login de los 7 usuarios de prueba.
- `/structure`: 18 comisiones, 60 alumnos, docentes, ciclos; el profesor ve solo sus comisiones y no ve datos sensibles (403).
- `/records`: comunicados, configuración, eventos, auditoría (directivo sí, preceptor 403).
- `/me`: el alumno ve sus 3 materias con porcentaje de asistencia, registros y notas; el profesor recibe 403.
- `/social`: directorio (8 personas), notificaciones, foro, conversaciones.
- `/staff` y `/centro` (incluidos los participantes de un evento). Landing y `/consolidacion/app/` responden 200.

**No probado en producción:** las escrituras de las rutas nuevas (sí probadas en la base descartable).

## 2026-10-27 (tarde) — Publicación de la consolidación + datos compartidos por API

**Publicado en producción:** repo de deploy `a8397ee` = equipo `29ba221` (commit firmado por `mjsis20052`, sin forzar;
antes se verificó que lo publicado coincidía con `1c28474`). En producción: los 7 usuarios de prueba entran; lecturas de
cada rol OK; quedaron resueltos los 500 de la versión anterior (listado de cuentas y login de Auxiliar y Centro); landing
con 6 tarjetas y el diseño unificado; `/consolidacion/app/` abre sin errores.

**Pedido:** crear los campos en la base y unificar todo para que los datos se compartan y se consulten por API.

**Base** — migración `20261027154747_datos_compartidos` (solo agrega; **aplicada en Neon**): `user_profiles`, `user_notes`,
`private_messages`, `forum_threads`, `forum_replies`, `notifications`. Total: 39 tablas.

**API nueva**
- `/structure/*`: carreras, planes, materias (con correlativas), ciclos, comisiones, alumnos (+ datos sensibles aparte),
  docentes e inscripciones.
- `/records/*`: notas (carga, corrección, publicación), observaciones, comunicados con destinatarios, eventos, auditoría y
  configuración institucional.
- `/me/*`: portal del alumno (ficha, materias con asistencia, registros, resumen, notas publicadas, justificaciones).
- `/social/*`: directorio, perfil, notas personales, mensajes, foro académico moderado y notificaciones.
- Auxiliares: alta y baja de sectores, baja de tareas. Centro: participantes de un evento.
- Notificaciones automáticas (`backend/src/notify.ts`); cálculo único de asistencia (`backend/src/summary.ts`).
- `shared/types.ts`: tipos de todo lo nuevo; `NoticeAudience.years`.

**App de consolidación:** Auxiliares (`useApiStaff.ts`) y Centro (`useApiCentro.ts`) leen y guardan en la API en modo API;
herramientas comunes en `sync.ts`.

**Probado**
- Base descartable: más de 60 pruebas de API. Fallaron 2, y eran errores de la prueba: en una, la comisión creada sí era
  del profesor; en la otra, un título de 1 letra se rechazaba antes por dato inválido. Repetidas con datos correctos: 403 y
  404, como corresponde.
- Navegador: Auxiliares carga desde la base y "Completar" tarea llega a la API (`PATCH` 200, sin recargas en bucle). El
  Centro carga desde la base (último comunicado y eventos).
- Neon: `migrate deploy` OK, "Database schema is up to date".

**No probado:** las acciones del Centro hechas desde los botones de su pantalla (solo por API); la API nueva en producción
(esta versión todavía no está publicada).

**Pendiente:** conectar Directivos, Profesores y portales de Alumno a las rutas nuevas (INT-107); perfil, notas y
notificaciones de las pantallas rescatadas (INT-106); planificaciones, material didáctico y turnos de auxiliares (INT-108,
INT-109).

## 2026-10-27 — Consolidación: Preceptoría, Auxiliares y Centro + asistencia unificada + diseño común

**Pedido:** rescatar Preceptoría, Centro de Estudiantes y Auxiliares de la app completa de Julián, integrarlas a la
toma de asistencia, sumarlas a la landing, unificar el diseño, carpeta `consolidacion/`, y backend y base
centralizados para todas las apps. Las pantallas de login quedan para el próximo paso.

**Agregado**
- `consolidacion/app`: las 3 secciones rescatadas (`src/legacy/`, casi sin cambios) + `App.tsx` nuevo + capa
  traductora `useApiAttendance.ts`. Modo demo (por defecto) y modo API. README en `consolidacion/README.md`.
- API: `backend/src/routes/academic.ts`, `attendance.ts`, `staff.ts`, `centro.ts` y `scope.ts` (alcance por rol).
- Base: migración `20261027003910_consolidacion_auxiliares_centro` (10 tablas, roles `STAFF` y `STUDENT_REP`,
  columna `demo`). Solo agrega. **Aplicada en Neon.**
- `backend/src/demo-data.ts` + `npm run db:demo-data` / `:off`. **Cargado en Neon.**
- Usuarios de prueba `prueba.auxiliar@…` y `prueba.centro@…` (ahora son 7). **Creados en Neon.**
- `shared/types.ts`: roles, `APPS`/`APP_ACCESS` (`auxiliares`, `centro`), tipos de asistencia, Auxiliares y Centro.
- Diseño unificado: `shared/design/tokens.css` + `docs/DISENO_UNIFICADO.md`. La landing ya lo usa (azul y dorado
  institucional, Inter/Outfit, barra superior), y tiene la tarjeta nueva.
- `scripts/build.mjs` y `vercel.json`: compilan y publican `consolidacion/app` y los tokens de diseño.

**Seguridad**
- No se rescataron el login con contraseñas escritas en el código ni los códigos de registro fijos de la app original.
- El "Análisis con IA" llamaba a Gemini desde el navegador, con la clave expuesta: queda desactivado (`aiStub.ts`).

**Probado**
- Base descartable: 36 de 37 pruebas de API OK. La restante era un error de la prueba: el profesor recibe 403 al
  aprobar una justificación, que es lo correcto.
- La integración: lo que carga el preceptor por materia lo ve el profesor en su clase, y al revés. La planilla
  cerrada no se puede modificar, salvo Directivos. Los permisos por rol funcionan.
- Navegador (modo API): el preceptor tomó asistencia desde la pantalla; en la base quedaron 7 presentes, 1 ausente
  y 1 justificado, igual que lo marcado.
- Navegador (modo demo): las 3 secciones abren sin errores. Build completo de las 5 apps OK.
- Neon: `migrate deploy` OK; lecturas de cada rol OK con la API local.

**Problema abierto:** la API **publicada** (versión anterior) responde 500 al listar cuentas y en el login de Auxiliar
y Centro, porque la base ya tiene esos roles. Se resuelve publicando esta versión. Hoy no afecta a nadie: las apps
publicadas están en modo demo.

**Fuera de git, a propósito:** `julian appcompleta/` (original de Julián, con un .zip de 800 KB) y `recursos/`.

**Para que ande en otra máquina:** `git pull`, `npm install` en la raíz y en `consolidacion/app`
(`--legacy-peer-deps`), y `npm run dev` (puerto 5177).

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

## 2026-10-28 — Codex: pruebas QA locales de backend

Agregados backend/src/integration-fixtures.ts, backend/test/integration-flow.mjs, backend/test/README.md, backend/package.json y backend/.gitignore. Cinco alumnos/docentes QA, cuentas aleatorias privadas, estructura académica y cinco registros por categoría staff/Centro. Pruebas HTTP reales: cinco recorridos académicos y cinco CRUD Centro/auxiliar OK; typecheck OK. Comandos, límites y detalle del incidente de DIRECT_DATABASE_URL documentados en backend/test/README.md. Sin commits ni push, según pedido. No se modificaron apps/shared ni paquete raíz.

## 2026-10-28 — Codex: porcentaje y alta HTTP completos

backend/test/integration-flow.mjs verifica ausencia → pendiente → aprobada en resumen y materias de los cinco alumnos (100 → 0 → 100), y alta HTTP de alumno/cuenta vinculada/cambio de clave/inscripción/asistencia. Repetido OK; evidencia privada en backend/.local-test/integration-result.txt. backend/test/local-api.ts deja API 4052 sin dotenv y con entorno restringido a conexiones locales. Corregida resolución de ruta Windows del manifest con fileURLToPath y conservación de campos HTTP al recargar fixtures. Sin cambios de apps/shared/rutas productivas. Detalle del comando previo que tomó DIRECT_DATABASE_URL remoto y salidas recuperadas en backend/test/README.md: no hay confirmación del resultado de migrate remoto; P2002 posterior corresponde a fixtures locales solapadas. Sin comandos remotos en esta ampliación, sin commits.

## 2026-10-28 — Codex: habilitación configurada QA explícita, sin ejecución remota

integration-fixtures.ts admite únicamente con --allow-configured-qa + ALLOW_REMOTE_QA=true la DATABASE_URL configurada y separa neon-manifest.json; default restringido a PG local. Configurada exige un solo ACTIVE existente, nunca crea ciclo. Test configurado exige autorización y localhost/127.0.0.1:4053, manifest QA, verifica pertenencia previa de IDs y rechaza redirecciones; omite DELETE en configurada. Documentados comandos del padre sin migraciones. Reejecutado sólo local: porcentaje cinco alumnos y alta HTTP completa OK, CRUD OK y typecheck OK. Ningún comando remoto ni commit. Rutas existentes modificadas por otro trabajo no se tocaron.

## 2026-10-28 — Codex: configuración institucional en fixtures

backend/src/integration-fixtures.ts agrega institutionSettings id=1 con los mismos mínimos de seed (name, shortName, city, district), upsert con update vacío para preservar valores existentes. backend/test/integration-flow.mjs comprueba GET /records/settings como alumno antes del circuito. Ejecutado exclusivamente PG local 5452: fixtures OK, settings alumno OK, cinco porcentajes/recorridos y CRUD OK, alta HTTP OK; typecheck OK. API local 4052 sigue viva. No se ejecutó contra Neon ni se tocó la base remota en ejecución; sin commits.
