# Integración del módulo Profesor con la API común

**Actualizado:** 2026-11-13 · **Estado:** código adaptado a la API común; falta QA con cuenta
real y publicación.

## Sesión y datos

- `SessionGate apps={['profesores']}` + cookie HttpOnly. La identidad y el `teacherId` salen de
  `/auth/me`; no hay docente fijo ni tokens en el navegador.
- `academicService.ts` es la única capa de datos. No hay `localStorage` de negocio ni fallback
  a mocks.
- Si la API responde `401`, se dispara el cierre de sesión; si responde `403`, se muestra el
  mensaje del backend.

## Rutas usadas

| Uso | Ruta | Nota |
|---|---|---|
| Docente y comisiones | `GET /structure/teachers`, `/structure/commissions`, `/structure/cycles` | el backend ya limita a las comisiones del docente |
| Nómina | `GET /academic/scope`, `GET /structure/enrollments?commissionId=` | condición desde la inscripción |
| Clases | `GET/POST /attendance/commissions/:id/sessions` | una clase por comisión y fecha |
| Planilla | `GET/PUT /attendance/sessions/:id` | se guarda con `close:false` |
| Justificados | `GET /attendance?commissionId=&from=&to=` | se cruza por alumno y fecha |
| Observaciones | `GET/POST /records/observations` | fecha pedagógica + `createdBy` del servidor |
| Notas | `GET/PUT /records/grades`, `POST /records/grades/publish` | `PUT` usa `enrollmentId` |
| Agenda | `GET /records/events` | solo lectura; la escribe Dirección |
| Mensajería | `/social/directory`, `/social/messages/conversations`, `/social/messages/with/:id`, `POST /social/messages` | sin asunto/categoría |

## Traducciones

- Asistencia: `PRESENTE/AUSENTE/TARDE` ↔ `PRESENT/ABSENT/LATE`.
- Condición: `IN_PROGRESS/REGULAR/FREE/PROMOTED/PASSED/DROPPED` → `CURSANDO/REGULAR/LIBRE/PROMOCIONADO/APROBADO/BAJA`.
- Notas: la planilla muestra cinco instancias y el backend guarda tres tipos con instancia:
  - `PARCIAL_1` → `PARTIAL` 1 · `PARCIAL_2` → `PARTIAL` 2
  - `RECUPERATORIO_1` → `MAKEUP` 1 · `RECUPERATORIO_2` → `MAKEUP` 2
  - `FINAL` → `FINAL_EXAM` 1
- Agenda: `SchoolEvent.type` se muestra con `EVENT_TYPE_LABELS`; no hay hora, lugar, recordatorio
  ni “cumplido” en el modelo central.

## Límites conocidos

- La agenda es de solo lectura para el docente; si la institución quiere que cargue fechas, es
  un cambio de permisos con alcance a sus comisiones.
- La mensajería no tiene asunto, categoría ni adjuntos.
- No se muestra el porcentaje oficial de asistencia ni el riesgo (`/attendance/summary`).
- Las observaciones no las ve el alumno; Preceptoría todavía no tiene pantalla para leerlas.
- El backend autónomo anterior quedó archivado en [`../legacy/backend-local/`](../legacy/backend-local/)
  y excluido del build.

## Verificación

- `npm run build` (`tsc -b && vite build`) y `npm run lint` de la app.
- No se probaron escrituras con una cuenta real ni la publicación en Vercel en esta revisión.
