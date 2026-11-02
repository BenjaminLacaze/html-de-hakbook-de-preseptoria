# Propuestas para el backend común — Ecosistema de Julián

Formato de la sección 12 del Contrato de Unificación (`docs/CONTRATO_UNIFICACION.html`). Todo es **aditivo**: tablas, columnas, valores y endpoints nuevos. No se renombra ni se borra nada del esquema central.

- **Código:** [`propuesta/backend.patch`](propuesta/backend.patch). Se aplica desde la raíz del repo con `git apply ecosistema-julian/backend/propuesta/backend.patch` (verificado: aplica limpio sobre `main` del 01/11/2026). Incluye esquema, 4 migraciones, rutas, tipos en `shared/types.ts`, pruebas y `scripts/deploy-api.mjs`.
- **Incluye también trabajo previo de otro agente:** el padrón institucional de Preceptoría y la auditoría de lecturas de datos sensibles (migración `20261030120000_auditar_lecturas_datos_sensibles`). Las propuestas de abajo se apoyan en ese trabajo.
- **Estado:** todas probadas en PostgreSQL local (`backend/test/paneles-flow.mjs`, `ecosistema-flow.mjs` e `integration-flow.mjs`, OK) y en la versión online propia (Vercel + Neon). **No** aplicadas en el backend ni en el Neon del equipo.

---

## P-JUL-01 · Comunicados leídos por usuario
- App: Alumnos (y todos los roles) · Fecha: 2026-11-01
- Tipo: tabla nueva + endpoint nuevo
- Modelo: `NoticeRead { noticeId → Notice, userId → User, readAt }`, clave `(noticeId, userId)`
- Endpoint: `POST /records/notices/:id/read`; `GET /records/notices` agrega `readAt` del usuario de la sesión
- Quién escribe / quién lee: cada usuario, lo propio
- Afecta a otras apps: ninguna (campo opcional)
- Estado: propuesta

## P-JUL-02 · Asistencia por código QR
- App: Preceptoría y Profesores generan · Alumnos registra · Fecha: 2026-11-01
- Tipo: tabla nueva + endpoints nuevos
- Modelo: `AttendanceQrCode { id, sessionId → ClassSession, codeHash (único), expiresAt, revokedAt?, createdBy, createdAt }`. Se guarda solo el hash.
- Endpoint: `POST|DELETE /attendance/sessions/:id/qr` (1 a 30 min); `POST /me/attendance/qr { code }` → `PRESENT` con origen `QR`, sin duplicar
- Quién escribe / quién lee: PRECEPTOR, TEACHER, DIRECTOR generan; STUDENT inscripto registra
- Afecta a otras apps: Profesores podría sumar el botón; usa `AttendanceSource.QR`, que ya existe
- Estado: propuesta

## P-JUL-03 · Pedido de corrección de ficha
- App: Alumnos pide · Preceptoría o Administración resuelve · Fecha: 2026-11-01
- Tipo: tabla nueva + endpoints nuevos
- Modelo: `DataCorrectionRequest { id, studentId → Student, field (CorrectionField), currentValue?, proposedValue, reason, documentUrl?, status (CorrectionStatus), createdBy, reviewedBy?, reviewedAt?, reviewNotes? }`
- Endpoint: `GET|POST /me/corrections`; `GET /structure/corrections`, `PATCH /structure/corrections/:id`
- Quién escribe / quién lee: STUDENT pide; PRECEPTOR, DIRECTOR, ADMINISTRATIVE resuelven. Aprobar no cambia la ficha: se edita aparte.
- Afecta a otras apps: Directivos podría mostrarlo
- Estado: propuesta

## P-JUL-04 · Justificación pedida por el alumno, opcionalmente por materia
- App: Alumnos pide · Preceptoría aprueba · Fecha: 2026-11-01
- Tipo: endpoint nuevo + campos nuevos
- Modelo: `Justification` + `subjectId? → Subject`, `documentType? (MEDICAL | WORK | FORCE_MAJEURE)`, `documentName?`
- Endpoint: `POST /me/justifications`. `PATCH /attendance/justifications/:id` responde 409 si ya fue resuelta.
- Quién escribe / quién lee: STUDENT pide (aviso a sus preceptores); REVIEWERS aprueban
- Afecta a otras apps: el cálculo de asistencia (`summary.ts`) considera la materia: sin materia, la justificación cubre todas, como hoy
- Estado: propuesta

## P-JUL-05 · Turnos y cambios de turno de Auxiliares (INT-109)
- App: Auxiliares · Fecha: 2026-11-01
- Tipo: tablas nuevas + endpoints nuevos
- Modelo: `StaffShift { userId → User, date, startTime?, endTime?, type (REGULAR | SWAP | OFF | HOLIDAY), notes? }`; `ShiftChangeRequest { requesterId, colleagueId, requesterShiftId, colleagueShiftId, reason?, status (PENDING | ACCEPTED | REJECTED | CANCELLED), respondedAt?, respondedBy? }`
- Endpoint: `GET /staff/people`; `GET|POST|PATCH|DELETE /staff/shifts` (alta: Dirección); `GET|POST /staff/shift-changes`, `PATCH /staff/shift-changes/:id`
- Quién escribe / quién lee: Dirección carga turnos; STAFF pide y responde cambios. Sin horarios superpuestos.
- Afecta a otras apps: Directivos podría cargar los turnos
- Estado: propuesta

## P-JUL-06 · Ausencias del personal de Auxiliares
- App: Auxiliares pide · Dirección resuelve · Fecha: 2026-11-01
- Tipo: tabla nueva + endpoints nuevos
- Modelo: `StaffAbsence { userId → User, fromDate, toDate, reason (StaffAbsenceReason), notes, documentName?, documentUrl?, status (JustificationStatus), reviewedBy?, reviewedAt?, reviewNotes? }`
- Endpoint: `GET|POST|DELETE /staff/absences`, `PATCH /staff/absences/:id`
- Quién escribe / quién lee: STAFF pide; DIRECTOR, ADMINISTRATIVE resuelven
- Afecta a otras apps: Directivos debería mostrar las pendientes
- Estado: propuesta

## P-JUL-07 · Centro de Estudiantes: eventos, comunicados, foro y reclamos
- App: Centro de Estudiantes · Fecha: 2026-11-01
- Tipo: campos nuevos + valores nuevos + endpoints nuevos
- Modelo:
  - `RepEvent` + `endTime?`, `capacity?`, `coverUrl?`
  - `RepAnnouncement` + `summary?`, `coverUrl?`, `draft`, `attachments (Json, enlaces)`
  - `RepThread` + `hidden`, `hiddenReason?`, `reported`, `reportReason?`
  - `RepClaim` + `code (REC-AAAA-NNN, único)`, `title?`, `anonymous`, `forwardedTo? (RepClaimDestination)`, `forwardNote?`, `archiveReason?`, `history (Json)`
  - `RepClaimStatus` + `FORWARDED`
- Endpoint: inscripción con cupo (409 si está lleno); `POST /centro/threads/:id/report`; `PATCH /centro/threads/:id { pinned?, hidden?, hiddenReason?, reported:false }`; `PATCH /centro/claims/:id { status?, response?, forwardedTo?, forwardNote?, archiveReason?, note? }`; inscriptos con email y carrera
- Quién escribe / quién lee: STUDENT_REP gestiona; STUDENT participa. Borradores, programados y temas ocultos solo los ve el Centro. En los anónimos, el autor no se muestra ni al Centro.
- Afecta a otras apps: el portal de Alumnos de Lucía usa `REP_CLAIM_STATUS_LABELS` (incluye la etiqueta nueva; compila sin cambios)
- Estado: propuesta

## P-JUL-08 · Auxiliares: tareas, sectores e incidencias
- App: Auxiliares · Fecha: 2026-11-01
- Tipo: campos nuevos
- Modelo: `StaffTask` + `priority?`, `installationId? → Installation`; `Installation` + `code?`, `floor?`, `lastCleanedBy?`; `Incident` + `notes?`
- Endpoint: los existentes aceptan los campos nuevos. La incidencia puede cambiar y restaurar el estado del sector (`installationStatus`, `restoreInstallation`). Las respuestas incluyen nombres (`completedByName`, `reportedByName`, `resolvedByName`, `lastCleanedByName`). Foto como URL o data URL de hasta ~1,5 MB.
- Quién escribe / quién lee: STAFF y Dirección
- Afecta a otras apps: ninguna (campos opcionales)
- Estado: propuesta

## P-JUL-09 · Preceptoría: resumen masivo, correcciones auditadas, comunicados propios, canales del foro
- App: Preceptoría · Fecha: 2026-11-01
- Tipo: endpoints nuevos + campo nuevo
- Modelo: `ForumThread` + `channel (ForumChannel: GENERAL | QUESTIONS | PROPOSALS, por defecto GENERAL)`
- Endpoint: `GET /attendance/summary/bulk?commissionId|subjectId`; `GET /attendance/audit?commissionId|subjectId` (cada cambio de estado de un registro ya cargado queda en `audit_logs`); `GET /records/notices?mine=1`; `GET /social/forum?channel=`
- Quién escribe / quién lee: READERS de asistencia (Preceptoría, Profesores, Directivos)
- Afecta a otras apps: Profesores puede usar el resumen masivo y el historial
- Estado: propuesta
