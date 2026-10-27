# Documentación técnica de la integración

**Sistema de Gestión ISFDyT N.° 26** — cómo están conectadas las apps, la API y la base de datos.
**Actualizado:** 2026-10-27 (consolidación: Preceptoría, Auxiliares y Centro; asistencia unificada; ver sección 12). **Estado:** base de datos, login y API **publicados en producción**
(`https://sistema-gestion-i26.vercel.app/api/v1`). Las apps publicadas siguen en modo demo.

| Documento | Para qué |
|---|---|
| Este archivo | Mapa general: arquitectura, entornos, seguridad, cómo se trabaja |
| [`AJUSTES_INTEGRACION_BACKEND.md`](AJUSTES_INTEGRACION_BACKEND.md) | Qué hay que cambiar en cada app y decisiones del equipo |
| [`BACKLOG_INTEGRACION.md`](BACKLOG_INTEGRACION.md) | Tareas: hecho, en curso y pendiente |
| [`LOGIN_PANTALLAS.md`](LOGIN_PANTALLAS.md) | Guía para armar el login de cada app |
| [`../backend/README.md`](../backend/README.md) | API: comandos, endpoints, Neon |
| [`../shared/README.md`](../shared/README.md) | Modelo de datos unificado y equivalencias con los valores viejos |
| [`../CHANGELOG.md`](../CHANGELOG.md) | Qué cambió, cuándo y qué falta |

---

## 1. Arquitectura

```
                 https://sistema-gestion-i26.vercel.app   (un solo dominio)
 ┌──────────────────────────────────────────────────────────────────────────┐
 │  /                         landing (index.html)                          │
 │  /directivos-jesica-agustin/app/   React ─┐                              │
 │  /profesores-nicolas/app/          React ─┤  fetch('/api/v1/…')          │
 │  /alumnos-julian/app/              React ─┤  + cookie de sesión          │
 │  /alumnos-lucia/app/               React ─┤  (la misma para todas)       │
 │  (preceptoría: sin app todavía)          ─┘                              │
 │                                           │                              │
 │  /api/v1/*   ── función de Vercel (api/index.ts → backend/src/app.ts)    │
 └───────────────────────────────────────────┼──────────────────────────────┘
                                             │ Prisma + pg (conexión "pooled")
                                             ▼
                              Neon · PostgreSQL 18 · base "neondb" (us-east-1)
```

**Por qué así:**

- **Un solo dominio.** Apps y API están en el mismo sitio, así que no hace falta configurar CORS,
  y una sola cookie de sesión sirve para las 4 apps.
- **Un solo backend y una sola base** para todas las apps: los datos no se duplican y cada dato
  tiene una única fuente de verdad.
- **Las apps no tocan la base**: todo pasa por la API, que valida la identidad y los permisos.

## 2. Tecnologías

| Capa | Tecnología | Versión |
|---|---|---|
| Apps | React + Vite (+ Tailwind en 3 de las 4) | React 19 · Vite 8 |
| API | [Hono](https://hono.dev) sobre Node | Hono 4.13 · Node 22+ (local 24) |
| Acceso a datos | Prisma ORM + adaptador `pg` | Prisma 7.10 |
| Base de datos | PostgreSQL en Neon (serverless) | PostgreSQL 18 |
| Validación | zod | 4.1 |
| Contraseñas | bcryptjs (10 rondas) | 3.0 |
| Hosting | Vercel: sitio estático + 1 función | — |
| Tipos compartidos | TypeScript en `shared/` (alias `@shared`) | — |

## 3. Estructura del repo

```
/
├── index.html                       landing con todas las apps
├── alumnos-julian/        app/  …   portal Alumno (Julián)
├── alumnos-lucia/         app/  …   Panel Alumno · Sistema de Asistencia Escolar (Lucía)
├── directivos-jesica-agustin/ app/ … panel Directivos (incluye Cuentas de acceso)
├── profesores-nicolas/    app/  …   módulo Profesor
├── preceptoria-benjamin/            handbook (sin app)
├── shared/
│   ├── types.ts                     modelo de datos y catálogos únicos
│   ├── api.ts                       cliente HTTP común (login, sesión, cuentas)
│   └── testUsers.ts                 usuarios de prueba (uno por app)
├── backend/
│   ├── prisma/schema.prisma         esquema de la base
│   ├── prisma/migrations/           migraciones versionadas
│   └── src/                         API (app.ts, routes/, auth/, seed, test-users)
├── api/index.ts                     entrada de la API en Vercel
├── scripts/build.mjs                build del sitio (apps + estático)
├── vercel.json                      build, rewrites, redirects, función
├── prisma.config.ts                 configuración de Prisma (CLI)
├── package.json                     dependencias y comandos de la API
├── .env.example                     variables necesarias (plantilla, sin secretos)
└── docs/                            esta documentación y los contratos por módulo
```

## 4. Modelo de datos

Fuente única: **`shared/types.ts`** (lo que ven las apps) ↔ **`backend/prisma/schema.prisma`**
(tablas). Tienen que coincidir: si cambia uno, cambia el otro.

**Convenciones:**

- Nombres de campos y códigos **en inglés** (`PRESENT`, `MORNING`, `TEACHER`); los textos en
  español salen de las tablas `*_LABELS`.
- IDs: UUID generados por la base.
- Fechas: `YYYY-MM-DD`. Fecha y hora: ISO 8601. Zona: `America/Argentina/Buenos_Aires`.

**Tablas (39; en la sección 12, las 10 que se sumaron el 2026-10-27):**

| Dominio | Tablas |
|---|---|
| Identidad y acceso | `users`, `auth_sessions` |
| Estructura académica (terciario) | `careers`, `study_plans`, `subjects`, `_Prerequisites` (correlativas), `academic_cycles`, `commissions`, `commission_teachers` |
| Personas | `students`, `student_sensitive_data` (Ley 25.326, acceso restringido), `teachers` |
| Cursada | `enrollments`, `class_sessions`, `attendance_records`, `justifications`, `grades`, `observations` |
| Comunicación | `notices`, `school_events` |
| Control | `audit_logs`, `institution_settings` (fila única), `_prisma_migrations` |

```
Career 1─n StudyPlan 1─n Subject 1─n Commission n─1 AcademicCycle
                                         │  ├─n CommissionTeacher n─1 Teacher ─0..1 User
                                         │  ├─n ClassSession 1─n AttendanceRecord n─1 Student
                                         │  └─n Enrollment n─1 Student ─0..1 User
                                         │         └─n Grade
Student 1─0..1 StudentSensitiveData   ·   Student 1─n Justification
User 1─n AuthSession
```

**Reglas de negocio que ya están en el modelo:**

- La justificación **no** es un estado de asistencia: es una tabla aparte, y la API calcula
  `justified` para cada registro.
- El porcentaje de asistencia y el riesgo los calcula **el backend**, con
  `institution_settings.minAttendancePercent` (75 %) y `lateArrivalAbsenceWeight` (0 por ahora,
  pendiente de decisión).
- Un alumno tiene una situación institucional (`students.status`) y una condición **por materia**
  (`enrollments.condition`).

## 5. Autenticación y permisos

**Flujo:**

1. Directivos crea la cuenta (`POST /users`). La API genera una contraseña temporal, la devuelve
   **una sola vez** y marca `mustChangePassword = true`.
2. La persona entra (`POST /auth/login`). La API verifica con bcrypt, crea una sesión y responde
   con `AuthMe`.
3. Mientras `mustChangePassword` sea `true`, la API solo acepta `/auth/me`, `/auth/logout` y
   `/auth/change-password`.
4. Cada app llama `GET /auth/me` al arrancar y decide qué mostrar con `APP_ACCESS`.

**Sesión:**

- Token aleatorio de 32 bytes en la cookie `sga_session`, con las opciones `HttpOnly`,
  `SameSite=Lax` y `Path=/`, y `Secure` en Vercel.
- En la tabla `auth_sessions` se guarda solo el **SHA-256** del token.
- Dura 12 h (`SESSION_TTL_HOURS`).
- Desactivar una cuenta, blanquear o cambiar la contraseña cierra las demás sesiones de esa
  cuenta.

**Protección del ingreso:** 5 intentos fallidos bloquean la cuenta 15 minutos. El mensaje de error
es siempre el mismo ("Email o contraseña incorrectos"), para que no se pueda averiguar qué emails
existen. Cuando el email no existe, igual se hace una comparación bcrypt, así la respuesta tarda lo
mismo.

**Roles y acceso:**

| Rol | Entra a | Puede crear cuentas de |
|---|---|---|
| `SUPER_ADMIN` | todas | cualquier rol |
| `DIRECTOR` | Directivos | Directivo, Administrativo, Preceptor, Profesor, Alumno |
| `ADMINISTRATIVE` | Directivos | Preceptor, Profesor, Alumno |
| `PRECEPTOR` | Preceptoría | — |
| `TEACHER` | Profesores | — |
| `STUDENT` | Alumnos (los dos portales) | — |
| `STAFF` | Consolidación → Auxiliares | — |
| `STUDENT_REP` | Consolidación → Centro de Estudiantes | — |

Para modificar una cuenta, quien la modifica tiene que poder asignar **todos** los roles que esa
cuenta ya tiene. Así, Secretaría no puede tocar a un Directivo. Nadie puede desactivarse ni
cambiarse los roles a sí mismo.

El usuario y los roles salen **siempre de la sesión**, nunca del cuerpo del pedido. `APP_ACCESS`
en las apps es solo para mostrar "sin acceso"; la que decide en cada pedido es la API.

## 6. API

Prefijo `/api/v1`, JSON, errores con forma única:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Hay datos inválidos.",
             "details": [{ "field": "email", "message": "Email inválido." }], "traceId": "a1b2c3d4" } }
```

| Código | HTTP | Cuándo |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Datos inválidos (`details` dice qué campo) |
| `UNAUTHENTICATED` | 401 | Sin sesión, o email/contraseña incorrectos |
| `FORBIDDEN` | 403 | Sin permiso, o falta cambiar la contraseña |
| `NOT_FOUND` | 404 | No existe, o la ruta no existe |
| `CONFLICT` | 409 | Duplicado (ej. email ya usado) |
| `TOO_MANY_ATTEMPTS` | 429 | Cuenta bloqueada por intentos fallidos |
| `INTERNAL_ERROR` | 500 | Error inesperado; el `traceId` se busca en los logs |

Endpoints actuales: ver la tabla en [`backend/README.md`](../backend/README.md#endpoints-disponibles).
Cliente para las apps: `shared/api.ts` (`login`, `getMe`, `logout`, `changePassword`, `listUsers`,
`createUser`, `updateUser`, `resetUserPassword`, `apiFetch` genérico).

**Agregar un endpoint:**

1. Crear la ruta en `backend/src/routes/<tema>.ts`, con `requireAuth` y `requireRoles(...)`.
2. Validar el cuerpo con `parseBody(c, z.object({…}))`.
3. Si modifica datos, registrar en `audit(...)`.
4. Montarla en `backend/src/app.ts` con `app.route('/<tema>', …)`.
5. Agregar los tipos del pedido y la respuesta en `shared/types.ts` y la función en `shared/api.ts`.
6. `npm run typecheck`, probar en local y anotar en el CHANGELOG.

## 7. Entornos y variables

| Entorno | Base | API | Apps |
|---|---|---|---|
| **Local** | Neon (`.env` en la raíz) | `npm run dev:api` → `localhost:4000` | `npm run dev` en cada app; Vite manda `/api` a 4000 |
| **Producción** | Neon `neondb` | Función de Vercel en `/api/v1` | Sitio estático de Vercel |

| Variable | Dónde | Para qué |
|---|---|---|
| `DATABASE_URL` | `.env` local y Vercel | Conexión pooled (host con `-pooler`), con `sslmode=verify-full` |
| `DIRECT_DATABASE_URL` | solo `.env` local | Conexión directa, para migraciones |
| `SHADOW_DATABASE_URL` | solo `.env` local | Base auxiliar, solo para `npm run db:migrate` |
| `SEED_ADMIN_*` | solo al correr el seed | Primera cuenta |
| `SESSION_TTL_HOURS` | opcional | Duración de la sesión (12 por defecto) |
| `VITE_USE_MOCK` | `.env.development.local` de cada app | `"false"` = usar la API; si no, modo demo |
| `VITE_SHOW_TEST_USERS` | opcional, en cada app | `"true"` = mostrar usuarios de prueba fuera de `npm run dev` |

Puertos locales: API 4000 · Directivos 5173 · Profesores 5174 · Julián 5175 · Lucía 5176.

> **Ojo:** hoy el entorno local usa **la misma base que producción**. Antes de cargar datos
> reales, crear en Neon una branch `dev` y apuntar los `.env` locales a esa (backlog INT-23).

## 8. Base de datos: operación

| Tarea | Comando (en la raíz) |
|---|---|
| Aplicar migraciones pendientes | `npm run db:deploy` |
| Crear una migración después de cambiar el esquema | `npm run db:migrate` (con `SHADOW_DATABASE_URL`) |
| Primera cuenta e institución (se puede repetir) | `npm run db:seed` |
| Crear o reactivar usuarios de prueba | `npm run db:test-users` |
| Desactivar usuarios de prueba | `npm run db:test-users:off` |
| Ver tablas y datos | Neon → SQL Editor, o `npx prisma studio` |

**Estado de Neon (2026-10-24):**

- Migración `20261023234548_init` aplicada (23 tablas).
- Institución cargada.
- Cuenta `direccion@isfdyt26.edu.ar` creada (Superadministrador + Directivo), con contraseña
  temporal pendiente de cambio.
- 5 usuarios de prueba activos.

**Migrar en producción:** el deploy de Vercel **no** migra la base solo. Primero se corre
`npm run db:deploy` apuntando a Neon y después se publica el código.

**Respaldo:** Neon guarda historial y permite restaurar la base a un momento anterior (según el
plan). Antes de una migración riesgosa, crear una branch de respaldo en Neon.

## 9. Publicación (deploy)

Hay **dos repos**:

| Repo | Para qué |
|---|---|
| `BenjaminLacaze/html-de-hakbook-de-preseptoria` | Donde trabaja el equipo (`git pull` / `git push`) |
| `mjsis20052/sistema-gestion-i26` | El que publica Vercel (proyecto `mjsis20052-3236s-projects/sistema-gestion-i26`) |

Vercel no tiene acceso al repo de Benjamín, así que para publicar se copia el contenido del repo
del equipo al de `mjsis20052`, con un commit **firmado por `mjsis20052`**: el plan Hobby bloquea
commits de otros autores. Un push a `main` de ese repo publica directo en producción.

**Build en Vercel** (`vercel.json` → `scripts/build.mjs`):

1. `npm install` (dependencias de la API).
2. `prisma generate`.
3. Copia el contenido estático a `dist/`, sin `backend/`, `api/`, `shared/` ni archivos ocultos.
4. Compila cada app con Vite en `dist/<modulo>/app/`.
5. Vercel publica `dist/` y la función `api/index.ts`. `/api/*` va a la función, y las rutas de
   cada app a su `index.html`.

**Primera publicación de la API: hecha el 2026-10-26** (INT-20 a INT-22). Los pasos, por si hay que repetirlos:

1. `DATABASE_URL` en Vercel → *Settings → Environment Variables*. Hoy la carga la integración
   Neon↔Vercel (junto con `POSTGRES_*`, `PG*`, etc.). Si se cambia la contraseña de Neon (INT-24),
   revisar que la integración la actualice.
2. Copiar el repo del equipo al de deploy y publicar.
3. Verificar `https://sistema-gestion-i26.vercel.app/api/v1/health` y un login.
4. Las apps publicadas siguen en modo demo mientras no se compilen con `VITE_USE_MOCK=false`.

## 10. Seguridad: lista de control

- [x] Contraseñas con bcrypt; nunca se devuelven ni se registran en los logs.
- [x] Cookie `HttpOnly` + `SameSite=Lax` + `Secure`; en la base, solo el hash del token.
- [x] Bloqueo por intentos fallidos; mensajes de error que no revelan qué emails existen.
- [x] Permisos por rol en la API; el usuario sale de la sesión.
- [x] Mutaciones solo JSON (protección contra CSRF junto con `SameSite`).
- [x] Auditoría de altas, cambios, blanqueos e ingresos.
- [x] `.env` fuera del repo (verificado con `git check-ignore`); en el repo solo está `.env.example`.
- [x] Datos sensibles del alumno en una tabla aparte.
- [ ] Rotar la contraseña de Neon: se compartió por chat el 2026-10-24 (INT-24).
- [ ] Desactivar los usuarios de prueba antes de usar el sistema con datos reales (INT-25).
- [ ] Branch `dev` en Neon, para no probar contra producción (INT-23).
- [ ] Límite de pedidos por IP en `/auth/login` (hoy el bloqueo es por cuenta) (INT-26).

## 11. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| La app pide `/src/main.tsx` y queda en blanco en Vercel | La app no se compiló | Agregarla a `modulesWithApp` en `scripts/build.mjs` |
| `npm install` falla con `ERESOLVE … esbuild` | Versiones de AI Studio | `npm install --legacy-peer-deps` |
| 401 en todo | No hay sesión, o la cookie no viaja | Revisar que el pedido vaya a `/api/v1` del mismo dominio (en local, por el proxy de Vite) |
| 403 "Tenés que cambiar tu contraseña" | `mustChangePassword` | Mostrar la pantalla de cambio de contraseña |
| 429 en el login | 5 intentos fallidos | Esperar 15 min o blanquear desde Directivos |
| `Falta la variable DATABASE_URL` | No hay `.env` en la raíz | Copiar `.env.example` y completarlo |
| Aviso `SECURITY WARNING: The SSL modes…` | `sslmode=require` | Usar `sslmode=verify-full` (es lo mismo, explícito) |
| Directivos: `npm run dev` ya no levanta el servidor de prueba | Ahora `dev` es Vite | El servidor de prueba es `npm run dev:mock` |
| Vercel: "Deployment was blocked" | Commit de otro autor en el repo de deploy | Commit firmado por `mjsis20052` |
| Acentos raros al probar con curl en Windows | curl manda los acentos en otra codificación | Probar desde la app o con `fetch` de Node |

## 12. Consolidación y API ampliada (2026-10-27)

**Qué se sumó**

- App `consolidacion/app` (`/consolidacion/app/`), con Preceptoría, Auxiliares y Centro de
  Estudiantes, rescatadas de la app completa de Julián. Detalle en
  [`consolidacion/README.md`](../consolidacion/README.md).
- Roles `STAFF` (Auxiliar) y `STUDENT_REP` (Centro de Estudiantes). Directivo y Administrativo los
  pueden asignar.
- Migración `20261027003910_consolidacion_auxiliares_centro`: suma 10 tablas (`staff_tasks`,
  `installations`, `incidents`, `maintenance_logs`, `rep_events`, `rep_event_participants`,
  `rep_threads`, `rep_replies`, `rep_announcements`, `rep_claims`) y la columna `demo` en
  `careers`, `students` y `teachers`. **Solo agrega; no borra nada.**
- Diseño unificado: [`shared/design/tokens.css`](../shared/design/tokens.css) y
  [`DISENO_UNIFICADO.md`](DISENO_UNIFICADO.md). Lo usan la landing y la app de consolidación.

**Toma de asistencia unificada**

Preceptoría carga por **materia y fecha**; Profesores, por **comisión y clase**. Las dos escriben
en la misma planilla (`class_sessions` + `attendance_records`): una clase por comisión y fecha, y
un registro por alumno. El origen queda en `source` (`PRECEPTOR` / `TEACHER`). Una planilla
cerrada solo la corrige Directivos.

**Alcance por rol** (`backend/src/scope.ts`):

| Rol | Ve y carga asistencia de |
|---|---|
| Directivo, Administrativo, Superadmin | todas las comisiones del ciclo vigente (Administrativo solo lee) |
| Preceptor | las comisiones donde es el preceptor asignado |
| Profesor | las comisiones que dicta |
| Auxiliar, Centro, Alumno | nada (el alumno, su resumen propio) |

**Endpoints nuevos**

| Grupo | Rutas |
|---|---|
| Académico | `GET /academic/cycles/active`, `/academic/careers`, `/academic/subjects`, `/academic/scope` |
| Asistencia | `GET /attendance`, `POST /attendance/by-subject`, `GET /attendance/summary`, `POST /attendance/commissions/{id}/sessions`, `GET`/`PUT /attendance/sessions/{id}` |
| Justificaciones | `GET`/`POST /attendance/justifications`, `PATCH /attendance/justifications/{id}` |
| Auxiliares | `/staff/tasks`, `/staff/installations`, `/staff/incidents`, `/staff/maintenance` |
| Centro | `/centro/events` (+ `/join`), `/centro/threads` (+ `/replies`), `/centro/announcements`, `/centro/claims` |

**Datos de ejemplo:** `npm run db:demo-data` carga 2 carreras, 18 materias y comisiones, 60 alumnos,
asistencias, justificaciones, instalaciones, tareas, eventos y reclamos. `npm run db:demo-data:off`
los borra (todo lo marcado `demo`). Asignaciones: `prueba.preceptor` → carrera "dev";
`prueba.profesor` → 2.º año de "dev"; `prueba.alumno` → un alumno de 1.º.

**Probado (2026-10-27)**

- Base descartable: 36 de 37 pruebas de API OK. La que no pasó era un error de la prueba: un
  profesor que intenta aprobar una justificación recibe 403, que es lo correcto.
- Navegador: la pantalla del preceptor guardó 9 registros (7 presentes, 1 ausente, 1 justificado) y la
  API devolvió exactamente eso.
- Neon: migración aplicada; lecturas de cada rol OK.

**Ojo:** mientras no se publique esta versión, la API publicada (la anterior) **falla con 500** al
listar cuentas y en el ingreso de Auxiliar y Centro, porque en la base ya existen esos roles nuevos.

## 13. Datos compartidos: todo consultable por API (2026-10-27, tarde)

Todo lo que las apps guardaban en memoria y es de interés común ahora vive en la base y se consulta por API.

**Migración `20261027154747_datos_compartidos`** (solo agrega, aplicada en Neon): `user_profiles`,
`user_notes`, `private_messages`, `forum_threads`, `forum_replies`, `notifications`. Total: **39 tablas**.

| Grupo | Rutas | Quién |
|---|---|---|
| Estructura y personas | `/structure/careers`, `/plans`, `/subjects`, `/cycles`, `/commissions`, `/students` (+ `/sensitive`), `/teachers`, `/enrollments` | Escriben Directivo, Secretaría y Superadmin; Preceptor y Profesor leen lo suyo |
| Registros | `/records/grades` (+ `/publish`), `/records/observations`, `/records/notices`, `/records/events`, `/records/audit`, `/records/settings` | Notas: el docente de la comisión. Comunicados: gestión a todos; preceptor solo a sus carreras o comisiones |
| Portal del alumno | `/me/student`, `/me/subjects`, `/me/attendance`, `/me/summary`, `/me/grades`, `/me/justifications` | Alumno (y Centro). Siempre lo propio, resuelto desde la sesión |
| Compartido | `/social/directory`, `/social/profiles`, `/social/notes`, `/social/messages`, `/social/forum`, `/social/notifications` | Cualquier persona con sesión |
| Auxiliares | además: `POST`/`DELETE /staff/installations`, `DELETE /staff/tasks/{id}` | |
| Centro | además: `GET /centro/events/{id}/participants` | Centro |

**Reglas que aplica la API:**

- Datos sensibles del alumno: solo Directivo, Secretaría, Superadmin y Preceptor (este último, de sus alumnos).
- Foro académico: lo que publica un alumno queda **pendiente** hasta que Preceptoría lo aprueba. Si el autor lo
  edita, vuelve a revisión. Un tema cerrado no admite respuestas.
- Notas: solo las carga el docente de esa comisión (o Directivos). El alumno ve solo las **publicadas**.
- El porcentaje de asistencia sale de una sola función (`backend/src/summary.ts`), la misma para el preceptor y el alumno.
- Notificaciones automáticas al resolver una justificación, responder un reclamo, recibir un mensaje, moderar o
  responder un tema del foro, y publicar notas.

**Pantallas conectadas** (app de consolidación, modo API): Preceptoría (asistencia y justificaciones),
**Auxiliares** (tareas, instalaciones, incidencias, mantenimiento) y **Centro** (eventos, foro, comunicados,
reclamos). Directivos, Profesores y los portales de Alumno tienen la API lista, y cada equipo las conecta (INT-107).

**Probado:** más de 60 pruebas de API en una base descartable, todas OK. Hubo dos que fallaron, y eran errores
de la prueba; repetidas con los datos correctos, la API respondió lo esperado. Desde el navegador: Auxiliares carga
desde la base y completar una tarea llega a la API; el Centro carga desde la base.
