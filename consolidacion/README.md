# Consolidación — Preceptoría, Auxiliares y Centro de Estudiantes

App que reúne tres secciones **rescatadas de la "app completa" de Julián**
(`julian appcompleta`, versión del 26/10/2026), integradas al sistema común: misma API, misma
base de datos y diseño unificado.

Publicada en: `/consolidacion/app/` (tarjeta "Preceptoría, Auxiliares y Centro de Estudiantes" en la landing).

| Sección | Rol que entra | Qué tiene | Estado de integración |
|---|---|---|---|
| **Preceptoría** | Preceptor/a | Toma de asistencia por materia y fecha, justificaciones, historial, alumnos en riesgo, comunicados, foros, agenda | ✅ **Asistencia y justificaciones contra la API** (misma planilla que Profesores). El resto, en memoria |
| **Auxiliares** | Auxiliar | Tareas del día, plano de instalaciones, incidencias, mantenimiento, turnos | ✅ Tareas, instalaciones, incidencias y mantenimiento contra la API (`useApiStaff.ts`). Turnos, en memoria |
| **Centro de Estudiantes** | Centro de Estudiantes | Eventos e inscripción, comunicados, foro de la comunidad, reclamos | ✅ Eventos, foro, comunicados y reclamos contra la API (`useApiCentro.ts`) |

## Cómo funciona

```
consolidacion/app/src/
├── App.tsx                  elige la sección (demo) o usa la sesión (API)
├── data/
│   ├── useLegacyStore.ts    estado en memoria (igual que la App original de Julián)
│   ├── useApiAttendance.ts  traductor Preceptoría ↔ API
│   ├── useApiStaff.ts       traductor Auxiliares ↔ API
│   ├── useApiCentro.ts      traductor Centro ↔ API
│   └── sync.ts              herramientas comunes (ids, diferencias de listas)
├── legacy/                  pantallas rescatadas, casi sin cambios (ver abajo)
└── styles.css               diseño unificado + tema original + tema "institucional"
```

- **Modo demo** (por defecto, y en el sitio publicado): pantalla para elegir la sección; datos de
  ejemplo en memoria; nada se guarda.
- **Modo API** (`VITE_USE_MOCK="false"` en `.env.development.local`): usa la sesión. Con un solo
  rol entra directo a su sección. La asistencia del preceptor se lee y se guarda en la base.

### La toma de asistencia unificada

Preceptoría carga **por materia y fecha** (`POST /attendance/by-subject`); Profesores, **por
comisión y clase** (`PUT /attendance/sessions/{id}`). Las dos escriben en la misma planilla:
una clase por comisión y fecha, un registro por alumno. Probado: lo que carga el preceptor lo ve
el profesor en su clase, y la corrección del profesor la ve el preceptor.

Traducciones de la pantalla del preceptor (`useApiAttendance.ts`):

| Pantalla | API |
|---|---|
| Presente | `PRESENT` |
| Ausente | `ABSENT` |
| Justificado | `ABSENT` + justificación de ese día, aprobada |
| Pendiente (bandeja "Justificaciones") | `ABSENT` + justificación `PENDING` |
| — | `LATE` (llegada tarde de Profesores) se muestra como **Presente**: la pantalla del preceptor no tiene ese estado |

## Cambios hechos a las pantallas rescatadas (`src/legacy/`)

Mínimos y comentados:

1. `App.ts`: solo los tipos de apariencia que importan los tableros, más el tema
   **"institucional"** (por defecto).
2. `PreceptorDashboard.tsx`: el "Análisis con IA" llamaba a Gemini **desde el navegador con la clave
   expuesta**. Ahora importa `aiStub.ts` y muestra un error controlado. Hay que pasarlo al backend
   (backlog INT-90).
3. `AppearanceModal.tsx`: se suma la tipografía "Institucional".
4. `StudentRepDashboard.tsx`: corrección de un tipo de React 19, sin cambio visible.
5. `index.html` → `legacy/legacy-theme.css`: los estilos pasaron a un CSS propio, y Tailwind se
   instala con npm (antes venía de un CDN en cada carga).

No se rescató: el login con contraseñas escritas en el código y los **códigos de registro fijos**
(las cuentas se crean desde Directivos), los paneles de Alumno y Profesor (ya existen en sus apps) y
la dependencia de los CDN de AI Studio.

## Correr en local

```bash
# en la raíz del repo: la API (puerto 4000)
npm run dev:api
# en esta carpeta
cd consolidacion/app
npm install --legacy-peer-deps
npm run dev            # http://localhost:5177
```

Para probar con datos: en la raíz, `npm run db:test-users` y `npm run db:demo-data`. Después
entrá con `prueba.preceptor@…`, `prueba.auxiliar@…` o `prueba.centro@…` (ver `shared/testUsers.ts`).
Las pantallas de inicio de sesión de esta app son el próximo paso.

## Pendiente (backlog)

- INT-95: comunicados, foros, mensajes y agenda del preceptor siguen en memoria (la API ya existe: `/records/notices`, `/social/*`).
- INT-106: perfil, notas y notificaciones de las tres secciones siguen en memoria (API lista en `/social/*`).
- INT-96: la pantalla del preceptor reconoce solo las carreras de ejemplo (`LEGACY_CAREER` en
  `useApiAttendance.ts`); con carreras reales hay que traer la lista desde la API.
- INT-90: análisis con IA desde el backend.
- INT-91: el QR de asistencia es solo demostración.

## Relación con el Portal del Alumno

Los paneles de Consolidación y el Portal del Alumno comparten la API institucional, pero cada rol mantiene su alcance:

- **Preceptoría y Profesores** registran asistencia en la misma planilla. El Alumno debe leer solo sus registros, su resumen y sus justificaciones desde las rutas personales `/me/*`.
- **Centro de Estudiantes** administra eventos, comunicados y el foro comunitario. Con sesión, el Alumno puede consultar ese contenido y participar en las operaciones autorizadas; la gestión de eventos y comunicados queda en `STUDENT_REP` y `SUPER_ADMIN`.
- El foro académico `/social/forum` tiene moderación de Preceptoría y es distinto de `/centro/threads`.
- **Auxiliares** usan las rutas `/staff/*` para tareas, instalaciones, incidencias y mantenimiento. El rol `STUDENT` no tiene acceso a esos datos.

La nueva app de Julián está en `alumnos-julian/app v2/`, pero todavía usa `demoDB` y no consume la API común. La integración pendiente está detallada en [`alumnos-julian/docs/Contrato_backend_alumno_julian.md`](../alumnos-julian/docs/Contrato_backend_alumno_julian.md).
