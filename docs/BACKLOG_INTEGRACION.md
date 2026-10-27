# Backlog de la integración

**Actualizado:** 2026-10-27. **Cómo se usa:** cuando alguien empieza una tarea, pone su nombre en
*Responsable* y la pasa a 🟡. Cuando termina, la pasa a ✅ y anota el cambio en el `CHANGELOG.md`.
Las tareas nuevas van al final de su bloque, con el número siguiente.

**Estados:** ✅ hecho · 🟡 en curso · ⬜ pendiente · ⛔ bloqueado (dice por qué)
**Prioridad:** P1 = sin esto no se puede usar · P2 = necesario para la primera etapa · P3 = después

Referencias: [documentación técnica](INTEGRACION_TECNICA.md) · [ajustes por app](AJUSTES_INTEGRACION_BACKEND.md)
(los códigos P1, D1, J1, L1… de la columna *Ref.* son de ese documento) · [guía de login](LOGIN_PANTALLAS.md).

---

## Resumen

| Bloque | ✅ | 🟡 | ⬜ |
|---|---|---|---|
| A. Organización y publicación del sitio | 6 | 0 | 0 |
| B. Modelo de datos y base | 6 | 0 | 0 |
| C. Login y cuentas | 7 | 1 | 1 |
| D. Publicación de la API | 3 | 0 | 0 |
| E. Seguridad y operación | 0 | 0 | 7 |
| F. API de estructura académica | 0 | 1 | 5 |
| G. API de asistencia (primer circuito real) | 4 | 1 | 1 |
| H. Integración de cada app | 0 | 1 | 15 |
| I. Preceptoría | 1 | 1 | 0 |
| J. Resto de funciones (etapa 4) | 0 | 0 | 5 |
| K. Consolidación (Auxiliares y Centro) | 4 | 0 | 8 |

---

## A. Organización y publicación del sitio

| # | Tarea | Estado | Responsable | Notas |
|---|---|---|---|---|
| INT-01 | Carpetas por módulo, sin espacios ni tildes; apps en `<modulo>/app/` | ✅ | Claude | 2026-10-23 |
| INT-02 | Build en Vercel que compila las 4 apps (`scripts/build.mjs`) | ✅ | Claude | |
| INT-03 | Landing con botón "Abrir app" y documentación de cada módulo | ✅ | Claude | |
| INT-04 | Redirecciones de las URLs viejas | ✅ | Claude | |
| INT-05 | Directivos no quedaba en blanco sin Firebase | ✅ | Claude | |
| INT-06 | Vercel publica a producción desde `main` del repo de deploy | ✅ | Claude | |

## B. Modelo de datos y base

| # | Tarea | Estado | Responsable | Notas |
|---|---|---|---|---|
| INT-07 | Documento de ajustes y decisiones (`AJUSTES_INTEGRACION_BACKEND.md`) | ✅ | Claude | |
| INT-08 | Modelo unificado `shared/types.ts` + equivalencias | ✅ | Claude | Modelo terciario, API en inglés |
| INT-09 | Alias `@shared` en las 4 apps | ✅ | Claude | |
| INT-10 | Esquema Prisma + migración `init` (23 tablas) | ✅ | Claude | |
| INT-11 | Base creada en Neon (`neondb`, us-east-1) y migración aplicada | ✅ | Claude | 2026-10-24 |
| INT-12 | Institución cargada en `institution_settings` | ✅ | Claude | |

## C. Login y cuentas

| # | Tarea | Estado | Responsable | Ref. | Notas |
|---|---|---|---|---|---|
| INT-13 | API de sesión: login, logout, me, cambio de contraseña obligatorio | ✅ | Claude | 3.2 | Probado en local y contra Neon |
| INT-14 | API de cuentas: listar, crear con clave temporal, editar, blanquear | ✅ | Claude | D5 | Reglas `ASSIGNABLE_ROLES` |
| INT-15 | Cliente común `shared/api.ts` | ✅ | Claude | 3.3 | |
| INT-16 | Directivos: pantalla *Cuentas de acceso* (`AccountsView`) | ✅ | Claude | D5 | Se ve con `VITE_USE_MOCK=false` |
| INT-17 | Primera cuenta `direccion@isfdyt26.edu.ar` en Neon | ✅ | Claude | | Contraseña temporal entregada a Mauricio |
| INT-18 | Usuarios de prueba (uno por app) en Neon | ✅ | Claude | | `shared/testUsers.ts`, `npm run db:test-users` |
| INT-19 | Guía de pantallas de login (`LOGIN_PANTALLAS.md`) | ✅ | Claude | | Incluye el componente de usuarios de prueba |
| INT-19a | Login de Directivos (4 pantallas + usuarios de prueba) | 🟡 | Jesica / Agustín | | En construcción (2026-10-24) |
| INT-19b | Login de Profesores | 🟡 | Nicolás | | ídem |
| INT-19c | Login de Alumnos — Julián | 🟡 | Julián | J2 | Sacar el token de `sessionStorage` y agregar `withCredentials` |
| INT-19d | Login de Alumnos — Lucía | 🟡 | Lucía | L2 | Reemplazar el login falso de `AuthContext.tsx` |
| INT-19e | Que la landing muestre solo las apps del rol (opcional) | ⬜ | — | 3.2 | P3 |

> INT-19a a INT-19d cuentan como un solo "🟡" en el resumen: las está haciendo el equipo en paralelo.

## D. Publicación de la API

| # | Tarea | Estado | Responsable | Prioridad | Notas |
|---|---|---|---|---|---|
| INT-20 | `DATABASE_URL` en Vercel | ✅ | Claude | P1 | Ya la había cargado la integración Neon↔Vercel (variable sensible, no legible). Confirmado en INT-22: un usuario que solo existe en nuestra base entra en producción |
| INT-21 | Copiar el repo del equipo al de deploy (commit firmado por `mjsis20052`) y publicar | ✅ | Claude | P1 | 2026-10-26: `mjsis20052/sistema-gestion-i26@d44d715` = equipo `1c28474` |
| INT-22 | Verificar en producción: `/api/v1/health`, login, cookie `Secure` | ✅ | Claude | P1 | health 200, login 200, cookie `HttpOnly; Secure; SameSite=Lax`, 403 por rol, logout, 404 JSON |

## E. Seguridad y operación

| # | Tarea | Estado | Responsable | Prioridad | Notas |
|---|---|---|---|---|---|
| INT-23 | Branch `dev` en Neon para trabajar en local sin tocar producción | ⬜ | Mauricio | P1 | Hoy local = producción |
| INT-24 | Rotar la contraseña de Neon (se compartió por chat) y actualizar `.env` y Vercel | ⬜ | Mauricio | P1 | Después de INT-20 |
| INT-25 | Desactivar los usuarios de prueba antes de cargar datos reales | ⬜ | Mauricio | P1 | `npm run db:test-users:off` |
| INT-26 | Límite de intentos por IP en `/auth/login` | ⬜ | — | P2 | Hoy el bloqueo es por cuenta |
| INT-27 | Limpieza de sesiones vencidas (tarea programada) | ⬜ | — | P3 | `auth_sessions` con `expiresAt` pasado |
| INT-29 | Que las rutas inexistentes del sitio den 404 (hoy devuelven la landing con 200) | ⬜ | — | P3 | No expone nada: es la misma página para cualquier ruta |
| INT-28 | Registrar en auditoría los ingresos fallidos y los bloqueos | ⬜ | — | P3 | Hoy se auditan solo los ingresos exitosos; los fallidos solo suman a `failedLoginCount` |

## F. API de estructura académica (etapa 1)

| # | Tarea | Estado | Responsable | Prioridad | Ref. |
|---|---|---|---|---|---|
| INT-30 | CRUD de carreras, planes y materias (con correlativas) | 🟡 | Claude | P1 | 2.1 — lecturas listas (`/academic/careers`, `/academic/subjects`, `/academic/scope`); falta crear/editar |
| INT-31 | Ciclos lectivos (crear, activar, cerrar) | ⬜ | — | P1 | |
| INT-32 | Comisiones: alta, docentes, preceptor, horarios (`CommissionView`) | ⬜ | — | P1 | D3 |
| INT-33 | Alumnos y docentes (con datos sensibles aparte) + vincular a la cuenta | ⬜ | — | P1 | D9 |
| INT-34 | Inscripciones a comisiones | ⬜ | — | P1 | |
| INT-35 | Importación CSV de carreras, materias, alumnos y docentes | ⬜ | — | P1 | Decisión 9: nunca cargar los `mockData` |

## G. API de asistencia — primer circuito real (etapa 2)

| # | Tarea | Estado | Responsable | Prioridad | Ref. |
|---|---|---|---|---|---|
| INT-40 | Clases: `POST /attendance/commissions/{id}/sessions` (abre o reutiliza la del día) | ✅ | Claude | P1 | P1 — 2026-10-27 |
| INT-41 | Planilla: `GET/PUT /attendance/sessions/{id}` y cierre, con auditoría; + `POST /attendance/by-subject` (Preceptoría) sobre la misma planilla | ✅ | Claude | P1 | P5 — falta "reabrir" (hoy solo Directivos corrige una planilla cerrada) |
| INT-42 | Resumen de asistencia calculado en el backend (`GET /attendance/summary`) | ✅ | Claude | P1 | 2.3 — usa `minAttendancePercent` y `lateArrivalAbsenceWeight` |
| INT-43 | Justificaciones: cargar, aprobar o rechazar (`/attendance/justifications`) | ✅ | Claude | P2 | 2.3 |
| INT-44 | Lecturas del alumno: `/alumnos/me`, `/alumnos/me/asistencias`, `/materias` | ⬜ | — | P1 | J1 |
| INT-45 | Reporte de asistencia por comisión para Directivos | 🟡 | — | P2 | D4 — `GET /attendance?commissionId=` ya sirve de base |

**Criterio de "listo" del circuito:** el profesor toma asistencia, el alumno la ve en su portal,
Directivos la ve en el reporte, y al recargar no se pierde nada.

## H. Integración de cada app (sacar los datos de demo)

| # | App | Tarea | Estado | Responsable | Ref. |
|---|---|---|---|---|---|
| INT-50 | Profesores | `academicService` llama a la API (con demo según `VITE_USE_MOCK`) | ⬜ | Nicolás | P1–P3 |
| INT-51 | Profesores | Catálogos unificados (`PRESENT`, `MORNING`…) | ⬜ | Nicolás | P4 |
| INT-52 | Profesores | Guardado de asistencia con errores del servidor | ⬜ | Nicolás | P5 |
| INT-53 | Directivos | Capa de servicios + TanStack Query; sacar los datos de `AppContext` | ⬜ | Jesica / Agustín | D1, D2 |
| INT-54 | Directivos | Modelo terciario: `Course` → `Commission`, cuatrimestres | ⬜ | Jesica / Agustín | D3 |
| INT-55 | Directivos | Asistencia como reporte; auditoría leída de la API | ⬜ | Jesica / Agustín | D4, D6 |
| INT-56 | Directivos | Quitar Firebase/Drive y "Descargar ZIP" | ⬜ | Jesica / Agustín | D7, D8 |
| INT-57 | Alumnos — Julián | Rutas `/alumnos/me/...` y campos en inglés | ⬜ | Julián | J1, J3 |
| INT-58 | Alumnos — Julián | Estados unificados; % y condición vienen del backend | ⬜ | Julián | J4, J6 |
| INT-59 | Alumnos — Julián | Desactivar QR, foros, justificar y edición de perfil fuera de demo | ⬜ | Julián | J5 |
| INT-60 | Alumnos — Julián | Limpiar `.env.example` (restos de AI Studio, MySQL) | ⬜ | Julián | J7 |
| INT-61 | Alumnos — Lucía | Cliente HTTP y servicio de asistencia | ⬜ | Lucía | L3 |
| INT-62 | Alumnos — Lucía | Cálculo de asistencia pasa al backend; estados unificados | ⬜ | Lucía | L4, L6 |
| INT-63 | Alumnos — Lucía | Un solo punto de entrada (`App.js/.jsx/.tsx`, `index.js`, `main.tsx`) | ⬜ | Lucía | L5 |
| INT-64 | Todas | Checklist "antes de apagar el modo demo" (`AJUSTES…` sección 7) | ⬜ | cada responsable | 7 |
| INT-65 | Alumnos | Elegir el portal definitivo después de que lo prueben los alumnos | 🟡 | equipo | Decisión 2 |

## I. Preceptoría

| # | Tarea | Estado | Responsable | Prioridad | Notas |
|---|---|---|---|---|---|
| INT-70 | App de Preceptoría | ✅ | Claude | P2 | Resuelto con `consolidacion/app` (sección Preceptoría rescatada de la app completa de Julián). Benjamín puede tomarla como base |
| INT-71 | Pantallas: alertas, justificaciones, llegadas tarde, asistencia por comisión | 🟡 | — | P2 | Asistencia y justificaciones contra la API ✅; falta mostrar "llegada tarde" (hoy se ve como presente) |

## J. Resto de funciones (etapa 4)

| # | Tarea | Estado | Responsable | Prioridad |
|---|---|---|---|---|
| INT-80 | Calificaciones (carga, publicación al alumno) | ⬜ | — | P3 |
| INT-81 | Observaciones pedagógicas | ⬜ | — | P3 |
| INT-82 | Comunicados con destinatarios (`NoticeAudience`) | ⬜ | — | P3 |
| INT-83 | Agenda / eventos | ⬜ | — | P3 |
| INT-84 | Exportaciones (CSV/PDF) desde el backend | ⬜ | — | P3 |

## K. Consolidación: Preceptoría, Auxiliares y Centro de Estudiantes

Rescatadas de la app completa de Julián (`julian appcompleta`, 26/10/2026). Ver `consolidacion/README.md`.

| # | Tarea | Estado | Responsable | Prioridad | Notas |
|---|---|---|---|---|---|
| INT-86 | App `consolidacion/app` con las 3 secciones, diseño institucional y tarjeta en la landing | ✅ | Claude | P1 | 2026-10-27 |
| INT-87 | Roles `STAFF` (Auxiliar) y `STUDENT_REP` (Centro) + 10 tablas nuevas (migración aplicada en Neon) | ✅ | Claude | P1 | |
| INT-88 | API `/staff/*` y `/centro/*` | ✅ | Claude | P1 | Probada contra base local y Neon |
| INT-89 | Datos de ejemplo removibles (`npm run db:demo-data` / `:off`) | ✅ | Claude | P1 | Cargados en Neon |
| INT-90 | "Análisis con IA" del preceptor desde el backend (hoy desactivado: exponía la clave de Gemini) | ⬜ | — | P3 | |
| INT-91 | Asistencia por QR (hoy solo demostración) | ⬜ | — | P3 | Decisión 8 |
| INT-92 | Login de la app de consolidación | ⬜ | — | P1 | Próximo paso (pedido del 27/10) |
| INT-93 | Conectar la pantalla de Auxiliares a `/staff/*` | ⬜ | — | P2 | Hoy usa datos en memoria |
| INT-94 | Conectar la pantalla del Centro a `/centro/*` | ⬜ | — | P2 | Hoy usa datos en memoria |
| INT-95 | Comunicados, foros, mensajes y agenda del preceptor contra la API | ⬜ | — | P3 | |
| INT-96 | Carreras reales en la pantalla del preceptor (hoy reconoce solo las de ejemplo: `LEGACY_CAREER`) | ⬜ | — | P1 | Antes de cargar datos reales |
| INT-97 | Que Directivos, Profesores y los portales de Alumno adopten `shared/design/tokens.css` | ⬜ | cada equipo | P3 | `docs/DISENO_UNIFICADO.md` |

---

## Decisiones pendientes (bloquean tareas)

| # | Decisión | Bloquea | Quién decide |
|---|---|---|---|
| 5 | Alojamiento definitivo del backend (hoy: función en Vercel) | — | Mauricio |
| 6 | ¿Cuánto descuenta una llegada tarde? (`lateArrivalAbsenceWeight`) | INT-42 | Institución |
| 7 | Quién carga y quién aprueba justificaciones | INT-43, INT-71 | Institución (propuesta: Preceptoría) |
| 8 | ¿El alumno puede justificar, usar QR o publicar en foros? | INT-59 | Equipo (propuesta: no en la etapa 1) |
| 9 | Formato de la planilla de importación inicial | INT-35 | Secretaría |
| 10 | ¿Entra el rol Orientación Escolar? | — | Institución |
| 11 | Qué hacer con la carpeta original `julian appcompleta` (hoy fuera de git): guardarla en `alumnos-julian/`, o dejarla solo en la máquina de Julián | — | Mauricio / Julián |
