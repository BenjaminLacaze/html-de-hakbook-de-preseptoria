# Ajustes para integrar las apps a un backend con base de datos unificada

**Estado:** propuesta de trabajo — 2026-10-23. Decisiones 1, 3 y 4 **aprobadas** el mismo día; la 2 se revisó: se integran los dos portales de Alumno (ver sección 5). Backend: Prisma + Neon, login con cuentas creadas desde Directivos.
**Backend (2026-10-23, local):** `backend/` con Prisma + Hono sobre PostgreSQL (Neon). Login, sesión por cookie y cuentas creadas desde Directivos funcionando en local. Guía de pantallas de login: [`LOGIN_PANTALLAS.md`](LOGIN_PANTALLAS.md).
**Etapa 0:** tipos unificados publicados en [`shared/types.ts`](../shared/types.ts) (equivalencias con los valores viejos en [`shared/README.md`](../shared/README.md)).
**Alcance:** las 4 apps React del repo (`profesores-nicolas`, `directivos-jesica-agustin`,
`alumnos-julian`, `alumnos-lucia`) y el módulo de Preceptoría (`preceptoria-benjamin`, hoy sin app).
**Base:** lectura del código actual de cada app y de los contratos en `docs/`.

> Este documento no reemplaza `docs/CONTRATO_BACKEND.md` ni los contratos por módulo: los
> complementa con **lo que hay que cambiar en las apps** para que dejen de usar datos de
> demostración y empiecen a leer y registrar datos reales en una única base.

---

## 0. Resumen en una página

Hoy **ninguna app guarda datos de verdad**. Cada una tiene su propia copia inventada de alumnos,
cursos y asistencias, y cada una llama a las mismas cosas con nombres distintos. Para usarlas con
una base común hay que hacer tres cosas, en este orden:

1. **Ponerse de acuerdo en un modelo único de datos** (sección 2). Es lo más importante: hoy hay
   4 formas distintas de decir "ausente", 3 de decir "turno" y 2 modelos de curso incompatibles
   (división de secundaria vs. comisión de terciario).
2. **Un solo login y una sola API** para todas las apps (sección 3).
3. **Cambiar la capa de datos de cada app** para que pida y guarde todo en esa API (sección 4).
   La app de Julián está casi lista; la de Directivos es la que más trabajo lleva.

El primer circuito real recomendado es **asistencia**: el profesor la toma, el alumno la ve y
directivos la consulta. Con eso se prueba todo el camino de punta a punta (sección 6).

---

## 1. Diagnóstico: cómo maneja los datos cada app hoy

| App | De dónde salen los datos | Dónde se guardan los cambios | Login | Preparación para API |
|---|---|---|---|---|
| **Profesores** (Nicolás) | `src/data/mockData.ts` | `localStorage` del navegador (`academicService.ts`) | No tiene: profesor fijo `MOCK_TEACHER` | **Media.** Toda la lógica pasa por un único `academicService`: se reemplaza por dentro sin tocar pantallas. |
| **Directivos** (Jesica y Agustín) | `src/data/mockData.ts` cargado en `AppContext.tsx` | Memoria (`useState`): se pierde al recargar | Simulador de rol en la barra superior | **Baja.** No hay capa de servicios: las pantallas modifican el estado directamente. Sí tiene tipos de API en `src/contracts/`. |
| **Alumnos** (Julián) | `src/mocks/mockData.ts` o HTTP según `VITE_USE_MOCK` | Memoria en modo demo | No tiene pantalla de login; lee un token de `sessionStorage` | **Alta.** Ya tiene `apiClient` (Axios), servicios por tema, TanStack Query y variable `VITE_API_BASE_URL`. |
| **Alumnos — Panel de Asistencia** (Lucía) | `src/data/mockData.ts` dentro de `AuthContext.tsx` | No guarda (solo lectura) | Login falso: acepta cualquier usuario y contraseña | **Baja.** No hay cliente HTTP ni servicios de datos. |
| **Preceptoría** (Benjamín) | — | — | — | **No existe app.** Solo `handbook.html`. |

Consecuencias importantes:

- **Dos apps de Alumno.** Julián y Lucía resuelven lo mismo (el alumno consulta su asistencia).
  Contra una base real hay que decidir cuál es el portal oficial (sección 5).
- **Nadie carga justificaciones ni llegadas tarde.** Según el diseño, eso es tarea de Preceptoría, y
  Preceptoría no tiene app. Hoy solo Directivos tiene una pantalla de "parte diario".
- El `server.ts` de Directivos es un servidor de prueba en memoria (Express). **No es el backend**:
  no persiste nada y no corre en Vercel. Puede servir de referencia para las rutas.

---

## 2. Modelo de datos unificado (decidir antes de programar)

### 2.1 Estructura académica — el conflicto principal

El ISFDyT N.° 26 es **terciario**. Tres apps (Profesores, Julián, Lucía) modelan terciario:
carrera → materia → comisión → cuatrimestre. **Directivos modela una escuela secundaria**:
`Course` con año y división, `orientation`, tutores, trimestres y período `DICIEMBRE_FEBRERO`.

**Propuesta:** adoptar el modelo terciario como el oficial y adaptar Directivos.

```
Carrera (TSDS, profesorados…)
 └─ PlanDeEstudio (TSDS-2022)
     └─ Materia (código, año 1°–4°, cuatrimestral/anual)
         └─ Comisión  ← unidad real de cursada (materia + ciclo + turno + docente + aula)
              ├─ Inscripción (alumno ↔ comisión, con condición: REGULAR / LIBRE / PROMOCIONADO…)
              ├─ Clase (fecha, tema)  ← sobre esta se toma asistencia
              │    └─ Asistencia (alumno, estado)
              └─ Calificación (alumno, instancia, nota)
CicloLectivo (2026, con 1C / 2C)
```

Esto implica en Directivos: reemplazar `Course` (año/división) por `Comisión`, reemplazar
`AcademicPeriod` de trimestres por cuatrimestres, y repensar `TeacherAssignment` y `ScheduleSlot`
como datos de la comisión. `cycleId: '2026' | '2025'` escrito a mano en los tipos pasa a ser un
ciclo que viene de la base.

### 2.2 Catálogos que hoy no coinciden

| Concepto | Profesores | Directivos | Julián | Lucía | **Valor unificado propuesto** |
|---|---|---|---|---|---|
| Estado de asistencia | `PRESENTE` `AUSENTE` `TARDE` | `PRESENTE` `AUSENTE_INJUSTIFICADO` `AUSENTE_JUSTIFICADO` `TARDANZA` | `Presente` `Ausente` `Tardanza` `Justificada` | `PRESENTE` `AUSENTE` `TARDE` `JUSTIFICADO` | `PRESENTE` · `AUSENTE` · `TARDE`, y la **justificación como dato aparte** (sección 2.3) |
| Turno | `Mañana` `Tarde` `Vespertino` | `MAÑANA` `TARDE` `VESPERTINO` | `Mañana` `Tarde` `Noche` | texto libre | `MANANA` · `TARDE` · `VESPERTINO` (la etiqueta con tilde la pone la pantalla) |
| Situación del alumno | `REGULAR` `LIBRE` `PROMOCIONADO` | `REGULAR` `CONDICIONAL` `EGRESADO` `PASIVADO` | texto | `REGULAR` `EN_RIESGO` `LIBRE` | **Dos campos distintos:** estado en la institución (`ACTIVO`, `EGRESADO`, `BAJA`…) y condición **por materia** en la inscripción (`REGULAR`, `LIBRE`, `PROMOCIONADO`). `EN_RIESGO` se calcula, no se guarda. |
| Roles | — | `DIRECTIVO` `VICEDIRECTOR` `SECRETARIA` `PRECEPTORIA` `DOCENTE` `ORIENTACION_ESCOLAR` | — | — | Los de `CONTRATO_BACKEND.md`: `SUPER_ADMIN` · `DIRECTIVO` · `ADMINISTRATIVO` · `PRECEPTOR` · `PROFESOR` · `ALUMNO`. Vicedirección = `DIRECTIVO`; Secretaría = `ADMINISTRATIVO`. `ORIENTACION_ESCOLAR`: decidir si entra. |
| Período | cuatrimestre (texto) | trimestres | `cuatrimestreActual` | `1C` `2C` | `1C` · `2C` · `ANUAL` |

### 2.3 Asistencia: una sola regla para todos

- **Unidad:** se registra **por clase de una comisión** (como hace Profesores), no por día de
  división (como hace Directivos). El "parte diario" de Directivos pasa a ser un **reporte** que
  agrupa clases.
- **Justificación:** entidad propia (`Justificacion`: alumno, fecha o rango, motivo, comprobante,
  quién la cargó y quién la aprobó). Una ausencia queda justificada si tiene una justificación
  aprobada que la cubre. Así nadie pisa el estado que cargó el profesor.
- **Cálculo del porcentaje:** hoy lo calcula cada app. Lucía cuenta la llegada tarde como media
  asistencia (`attendanceService.ts`); las demás no la descuentan. **El cálculo lo hace el backend,
  con una sola fórmula y el mínimo de regularidad (75 %) como parámetro institucional.** Las apps
  solo muestran el resultado.
- **Corrección de una planilla cerrada:** se reabre con registro de auditoría
  (`PUT /sessions/{id}/reabrir` en el contrato de Profesores).

### 2.4 Convenciones de datos

- **Idioma de los campos:** hoy Julián usa español (`fecha`, `estado`) y el resto inglés
  (`date`, `status`). **Elegir uno para toda la API.** Recomendación: inglés en la API (3 de 4
  apps ya lo usan) y traducir solo en la capa de servicios de Julián.
- **IDs:** los genera el backend (UUID) y viajan como texto. El legajo y el DNI son datos, no IDs.
- **Fechas:** `YYYY-MM-DD` para días. Para fecha y hora, ISO 8601 con zona
  `America/Argentina/Buenos_Aires`.
- **Quién registró:** el backend completa `recordedBy` / `createdBy` a partir de la sesión. Las apps
  **no** lo mandan (hoy Directivos manda `recordedByUserId` desde el navegador).
- **Datos sensibles** (DNI, domicilio, datos del tutor, `healthAlert` de Directivos): se guardan
  con acceso restringido por rol y no se envían a pantallas que no los necesiten (Ley 25.326 de
  protección de datos personales). Un alumno nunca ve datos de otro.

---

## 3. Base común para todas las apps

### 3.1 Una sola API, mismo dominio

Todas las apps se publican en `sistema-gestion-i26.vercel.app/<modulo>/app/`. Recomendación:
exponer el backend **bajo el mismo dominio** con un rewrite en `vercel.json`:

```json
{ "source": "/api/:path*", "destination": "https://<backend>/api/:path*" }
```

Ventajas: no hay que configurar CORS, y la sesión (cookie) sirve para las 4 apps a la vez.

Todas las apps usan la misma variable:

```
VITE_API_BASE_URL=/api/v1
VITE_USE_MOCK=true|false
```

`VITE_USE_MOCK=true` se mantiene para la demo pública y las pruebas; producción usa `false`.

### 3.2 Un solo login

Hoy cada app tiene un login falso distinto (o ninguno). Propuesta:

- Una pantalla de ingreso común (`/login`) que llama a `POST /api/v1/auth/login`.
- El backend responde con una **cookie `HttpOnly` + `Secure` + `SameSite=Lax`**. No guardar
  tokens en `localStorage` ni `sessionStorage` (hoy Julián lo lee de `sessionStorage`).
- Cada app, al arrancar, llama a `GET /api/v1/auth/me` y obtiene usuario y roles. Si responde
  `401`, redirige a `/login?volver=<app>`.
- La landing puede mostrar solo las apps que corresponden al rol del usuario.
- Se eliminan: el login de Lucía, el "Simular acceso con otro rol" de Directivos y el
  `MOCK_TEACHER` fijo de Profesores (quedan solo en modo demo).

### 3.3 Código compartido entre apps (recomendado)

Para no copiar lo mismo 4 veces, crear en la raíz una carpeta `shared/` con:

- `shared/types.ts`: los tipos unificados de la sección 2 (idealmente generados desde el OpenAPI
  del backend).
- `shared/apiClient.ts`: cliente HTTP con la URL base, el envío de la cookie y el manejo uniforme
  de errores (`401` → login, `403` → "sin permiso").
- `shared/auth.ts`: `getMe()` y protección de rutas.

Cada app lo importa con un alias en `vite.config.ts`. El build actual (`scripts/build.mjs`) ya
compila todo desde la raíz del repo, así que no hay que cambiar el despliegue.

### 3.4 Formato de errores

Una sola forma para toda la API (ya propuesta en el contrato de Julián):

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "…", "details": [], "traceId": "…" } }
```

Directivos ya tiene `ApiErrorResponse` en `src/contracts/apiContract.ts`: alinear con este formato.

---

## 4. Ajustes por app

### 4.1 Profesores — `profesores-nicolas/app`

| # | Ajuste | Archivo(s) |
|---|---|---|
| P1 | Reemplazar el interior de `academicService` por llamadas HTTP a las rutas del contrato de Profesores. Las pantallas no cambian porque ya usan solo el servicio. | `src/services/academicService.ts` |
| P2 | Quitar la persistencia en `localStorage` (`sga_26_*`): con datos reales quedaría información vieja en el navegador. Mantenerla solo con `VITE_USE_MOCK=true`. | `academicService.ts` |
| P3 | Obtener el profesor de la sesión (`/auth/me` + `/teachers/me`) en lugar de `MOCK_TEACHER`. | `academicService.ts`, `Header.tsx` |
| P4 | Unificar `AttendanceStatus` y `Shift` según la sección 2.2. | `src/types/index.ts`, `AttendanceView.tsx` |
| P5 | Guardar asistencia con `PUT /sessions/{id}/attendance` y mostrar errores del servidor (planilla cerrada, alumno no inscripto). Hoy guardar siempre "funciona". | `AttendanceView.tsx` |
| P6 | `Commission` tiene `subjectName`, `careerName` y `studentCount` copiados: con la base, vienen calculados del backend. No editarlos en el frontend. | `src/types/index.ts` |
| P7 | Mostrar el `DemoBanner` solo en modo demo. | `components/common/DemoBanner.tsx` |

### 4.2 Directivos — `directivos-jesica-agustin/app` (el que más trabajo lleva)

| # | Ajuste | Archivo(s) |
|---|---|---|
| D1 | **Crear una capa de servicios** (`src/services/*.ts`) y sacar la lógica de datos de `AppContext.tsx`. Hoy el contexto inicializa todo con `mockData` y las pantallas llaman `setStudents`, `setAttendanceRecords`, etc. | `src/context/AppContext.tsx`, `components/views/*` |
| D2 | Usar TanStack Query (como Julián) para leer y guardar: estados de carga, error y recarga sin escribirlos a mano. | nuevo |
| D3 | **Adaptar el modelo a terciario** (sección 2.1): `Course` → `Comisión`, trimestres → cuatrimestres, `cycleId` dinámico. Afecta Cursos, Asistencia, Calificaciones, Horarios y Reportes. | `src/types/index.ts`, `CoursesView`, `AttendanceView`, `GradesView`, `ReportsView` |
| D4 | Asistencia: pasa a ser **consulta y supervisión** (reporte por comisión y alumno). La carga la hacen Profesores y Preceptoría. Decidir si Directivos puede corregir, y en ese caso con auditoría. | `AttendanceView.tsx` |
| D5 | Usuarios: el alta de usuarios crea la cuenta en el backend (con contraseña inicial o invitación por email). Unificar roles (sección 2.2). Quitar el simulador de rol fuera del modo demo. | `UsersView.tsx`, `TopBar.tsx`, `types/index.ts` |
| D6 | Auditoría: el registro lo escribe **el backend** en cada operación; la pantalla solo lo lee (`GET /audit`). Hoy se arma en el navegador. | `AuditView.tsx`, `AppContext.tsx` |
| D7 | Quitar el backup a Google Drive (Firebase): con base de datos, el respaldo es del servidor. El botón "Descargar ZIP" (`/api/download-zip`) se reemplaza por exportaciones del backend (CSV/PDF) o se elimina. | `GoogleDriveBackupModal.tsx`, `services/google*.ts`, `TopBar.tsx` |
| D8 | `server.ts`: dejar de usarlo como servidor. Puede servir de borrador de rutas para el backend real. | `server.ts`, `package.json` (`dev` pasa a `vite`) |
| D9 | Restringir los datos sensibles de alumnos (tutor, domicilio, `healthAlert`) a los roles que los necesitan. | `types/index.ts`, `CoursesView.tsx` |

### 4.3 Alumnos — Julián — `alumnos-julian/app` (el más preparado)

| # | Ajuste | Archivo(s) |
|---|---|---|
| J1 | Cambiar las rutas `/student/...` por las canónicas `/alumnos/me/...` (tabla de equivalencias en `docs/Contrato_backend_alumno_julian.md`, sección 6). | `src/services/*.ts` |
| J2 | Sesión con cookie: sacar la lectura del token de `sessionStorage`, agregar `withCredentials`, y ante `401` redirigir a `/login`. Es mejor usar el cliente compartido (3.3). | `src/lib/apiClient.ts`, `LogoutModal.tsx` |
| J3 | Traducir los campos en español de la API (`fecha`, `estado`) en la capa de servicios, si se elige inglés para la API (2.4). | `src/services/*.ts`, `src/types/index.ts` |
| J4 | Unificar estados de asistencia: `Justificada` deja de ser un estado y pasa a ser un indicador (2.3). | `types/index.ts`, `AttendanceView.tsx` |
| J5 | **Desactivar fuera del modo demo** las acciones que el MVP no permite: QR de asistencia, justificar desde el alumno, foros y edición de contacto. Ya figura en su contrato (sección 4). | `AttendanceQRView.tsx`, `ForumsView.tsx`, `ProfileView.tsx` |
| J6 | Que el porcentaje de asistencia y la condición (`porcentajeAsistenciaGlobal`, `estadoAcademico`) vengan del backend; no calcularlos en el navegador. | servicios y vistas de dashboard |
| J7 | Limpiar `.env.example`: `GEMINI_API_KEY` y `APP_URL` son restos de AI Studio que la app no usa. | `.env.example` |

### 4.4 Alumnos — Lucía (Panel de Asistencia) — `alumnos-lucia/app`

| # | Ajuste | Archivo(s) |
|---|---|---|
| L1 | **Decisión previa:** si se integra al portal de Julián o queda como app propia (sección 5). Si se integra, lo valioso para rescatar es la pantalla de asistencia con estadísticas, el detalle de registro y la configuración de accesibilidad. | — |
| L2 | Si queda como app propia: eliminar el login falso de `AuthContext.tsx` (acepta cualquier contraseña) y usar el login común. | `src/context/AuthContext.tsx`, `LoginView.tsx` |
| L3 | Crear cliente HTTP y servicio de asistencia (`GET /alumnos/me/asistencias`, `GET /alumnos/me`). | nuevo `src/services/` |
| L4 | Pasar la regla de cálculo de `attendanceService.ts` (tarde = 0,5) al backend, como regla institucional única (2.3). | `src/services/attendanceService.ts` |
| L5 | Ordenar los puntos de entrada duplicados: hoy existen `App.js`, `App.jsx`, `App.tsx`, `index.js` y `main.tsx`; la app arranca por `index.js` → `App.jsx`. Dejar uno solo. | `src/`, `index.html` |
| L6 | Unificar estados de asistencia y turno (2.2). | `src/types/index.ts` |

### 4.5 Preceptoría — `preceptoria-benjamin` (falta la app)

Según el diseño, Preceptoría registra llegadas tarde y justificaciones y sigue las alertas de
inasistencia. **Sin esa app, el circuito de asistencia queda incompleto.** Opciones:

- **a)** Benjamín construye la app de Preceptoría con la misma base técnica (React + Vite +
  `shared/`) y la deja en `preceptoria-benjamin/app`. El build ya la toma si se agrega a
  `modulesWithApp` en `scripts/build.mjs`.
- **b)** Mientras tanto, agregar a Directivos una sección de justificaciones, habilitada para el rol
  `PRECEPTOR`.

Pantallas mínimas: alumnos con alertas, carga y aprobación de justificaciones, registro de
llegadas tarde y consulta de asistencia por comisión.

---

## 5. Decisiones que tiene que tomar el equipo

| # | Decisión | Recomendación / **resolución** |
|---|---|---|
| 1 | Modelo académico: terciario (comisiones) o secundario (divisiones) | ✅ **Aprobado (2026-10-23): terciario.** |
| 2 | ¿Un portal de Alumno o dos? | 🔄 **Revisado (2026-10-23): se integran LOS DOS** (Julián y Lucía) a la misma API y base. Después de que los prueben los alumnos se elige uno. |
| 3 | Idioma de los campos de la API | ✅ **Aprobado (2026-10-23): inglés**, en nombres de campos y en códigos de catálogo (`PRESENT`, `MORNING`, `TEACHER`…). Los textos en español salen de las tablas `*_LABELS` de `shared/types.ts`. |
| 4 | Motor de base de datos | ✅ **Aprobado (2026-10-23): PostgreSQL.** Corregir las menciones a MySQL del portal de Julián. |
| 5 | Tecnología y alojamiento del backend | Pendiente. Requisitos: API REST `/api/v1`, OpenAPI publicado, sesión por cookie y migraciones versionadas. |
| 6 | ¿La llegada tarde descuenta asistencia? ¿Cuánto? | Definir la regla institucional (hoy solo Lucía usa 0,5). |
| 7 | Quién carga y quién aprueba justificaciones | Preceptoría carga y aprueba; Directivos supervisa. |
| 8 | ¿El alumno puede justificar, marcar QR o publicar en foros? | **No en la primera etapa** (alineado con el contrato de Julián). |
| 9 | Cómo se cargan los datos reales iniciales (carreras, materias, comisiones, alumnos, docentes) | Importación desde planilla CSV hecha por el backend. **Nunca** cargar los `mockData` en la base real. |
| 10 | Rol `ORIENTACION_ESCOLAR` | Confirmar si entra en la primera etapa. |

---

## 6. Orden de trabajo sugerido

**Etapa 0 — Acuerdos.** ✅ Decisiones 1 a 4 cerradas. ✅ Tipos unificados en `shared/types.ts`, con alias
`@shared` configurado en las 4 apps. Pendientes: decisiones 5 a 10.

**Etapa 1 — Backend base.** Login y sesión (`/auth/login`, `/auth/me`, `/auth/logout`), usuarios
y roles, estructura académica (carreras, materias, ciclos, comisiones, inscripciones) e
importación CSV. Datos de prueba propios (seed), separados de los reales.

**Etapa 2 — Primer circuito real: asistencia.**
- Profesores: P1–P5 (toma asistencia real).
- Alumno (Julián): J1, J2, J4–J6 (ve su asistencia real).
- Directivos: D1, D2 y D4 solo para la pantalla de asistencia (reporte).

Criterio de "listo": un profesor toma asistencia, el alumno la ve al instante en su portal, el
directivo la ve en el reporte, y al recargar la página nada se pierde.

**Etapa 3 — Gestión institucional.** Directivos completo (D3, D5–D9): usuarios, comisiones,
alumnos, auditoría. App de Preceptoría o sección de justificaciones (4.5).

**Etapa 4 — Resto.** Calificaciones, observaciones pedagógicas, avisos, agenda, foros (si se
aprueban) y exportaciones.

---

## 7. Checklist por app antes de apagar el modo demo

- [ ] Usa `VITE_API_BASE_URL` y `VITE_USE_MOCK`; con `VITE_USE_MOCK=false` no importa ningún `mockData`.
- [ ] No guarda datos de negocio en `localStorage` ni `sessionStorage` (sí preferencias visuales: tema, accesibilidad).
- [ ] Obtiene el usuario de `/auth/me`; no tiene usuarios ni roles fijos.
- [ ] Usa los catálogos unificados (estado de asistencia, turno, roles, período).
- [ ] No envía `createdBy`, rol ni `alumnoId` como prueba de permiso: los pone el backend.
- [ ] Muestra carga, error y vacío en cada pantalla que lee datos.
- [ ] Ante `401` va al login; ante `403` muestra "sin permiso".
- [ ] Las acciones fuera del alcance de la etapa están ocultas o deshabilitadas.
- [ ] No hay claves ni credenciales en el código ni en `.env` versionados.
