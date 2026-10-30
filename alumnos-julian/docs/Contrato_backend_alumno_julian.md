# Contrato de integración — Portal del Alumno app v2

**Estado de app v2 (2026-10-30):** conexión inicial implementada en el código local: login institucional, cookie de sesión HttpOnly y lecturas del alumno, foros, eventos y comunicados desde la API compartida. Requiere publicar esta versión y validar el flujo con una cuenta QA autorizada.
**Estado del backend general:** hay rutas compartidas para Alumno, Profesores, Preceptoría, Auxiliares y Centro de Estudiantes; consultar docs/INTEGRACION_TECNICA.md y consolidacion/README.md.
**Fuentes de la app:** `JULIAN/shared/services/http.ts`, `JULIAN/shared/services/api.ts` y `JULIAN/shared/types/index.ts`. `JULIAN/mocks/` queda como fixtures históricos y no como fuente conectada.

## Decisión de arquitectura — base compartida

No crear una segunda base. El sistema ya tiene PostgreSQL en Neon, esquema Prisma y una API única `/api/v1` que comparten los módulos. La URL actualmente publicada en [alumnos-julian-v2.vercel.app](https://alumnos-julian-v2.vercel.app) no incluye estos cambios locales aún. La app V2 ya tiene un cliente para login y lecturas compartidas; falta publicar y validar contra QA autorizado.

Las relaciones principales son `User → Student → Enrollment → Commission → Subject`; Preceptoría y Profesores escriben en las mismas `ClassSession`, `AttendanceRecord` y `Justification` que el portal Alumno lee desde `/me/*`. Centro de Estudiantes usa `RepEvent`, participantes vinculados a `User`, `RepThread`/`RepReply`, `RepAnnouncement` y `RepClaim`. Auxiliares usa `StaffTask`, `Installation`, `Incident` y `MaintenanceLog` en la misma base, detrás de `/staff/*` y con permisos de personal. Compartir base no significa mostrar tareas o incidencias de Auxiliares al alumno.

La V2 usa un rewrite same-origin `/api/v1` hacia la API institucional para conservar la cookie HttpOnly; el proxy local de Vite apunta al backend de desarrollo. Nunca debe recibir `DATABASE_URL` ni conectarse directamente a Neon desde el navegador.

## 1. Frontera actual

`StudentApi` usa ahora el cliente HTTP de `/api/v1` en lugar de `demoDB`. La sesión y las lecturas académicas se resuelven en el servidor. Preferencias, avisos leídos y recordatorios siguen locales al navegador; mocks permanecen como fixtures y no son fuente de los datos institucionales conectados.

El login/cambio de contraseña usa cookie HttpOnly y permisos de backend. `VITE_API_BASE_URL` puede cambiar la base en desarrollo. No guardar tokens de sesión en localStorage.

## 2. Responsabilidad entre paneles

| Dominio | Quién escribe o administra | Qué debe leer el Alumno |
|---|---|---|
| Asistencia | Preceptoría por materia/fecha y Profesores por comisión/clase; ambos usan los mismos registros | Solo sus registros y resumen propio |
| Justificaciones | Alumno consulta; Preceptoría/gestión crea o resuelve según permisos actuales | Sus solicitudes y estados desde la sesión |
| Calificaciones | Profesor de la comisión y gestión publican | Solo notas publicadas de sus inscripciones |
| Comunicados institucionales | Gestión y Preceptoría dentro de sus destinatarios autorizados | Solo comunicados publicados visibles para su cuenta |
| Eventos institucionales | Gestión | Eventos visibles del calendario escolar |
| Eventos y anuncios del Centro | STUDENT_REP y SUPER_ADMIN los gestionan | Contenido del Centro de Estudiantes accesible con sesión |
| Foro académico | Alumno participa; Preceptoría modera según reglas del backend | Temas aprobados y los propios según el contrato de la API |
| Foro comunitario del Centro | STUDENT_REP gestiona; alumnos participan | Temas, respuestas y anuncios propios de este dominio |
| Operación de Auxiliares | STAFF y roles de gestión autorizados | Sin acceso para el rol STUDENT |

No mezclar el foro académico con el foro del Centro, ni los eventos/comunicados del Centro con el calendario y comunicados institucionales. Comparten backend, pero tienen responsables, tablas y reglas distintas.

## 3. Endpoints compartidos existentes

Estas rutas están implementadas en el backend del repositorio con el prefijo /api/v1. La app v2 todavía debe conectarlas y validar sus DTOs.

### Portal personal del alumno

| Método y ruta | Uso | Alcance |
|---|---|---|
| GET /me/student | Perfil básico | Alumno vinculado a la sesión |
| GET /me/subjects | Materias, cursadas y resumen por comisión | Inscripciones propias |
| GET /me/attendance?commissionId= | Registros de asistencia | Registros propios |
| GET /me/summary?commissionId= | Resumen de asistencia | Calculado en backend para el alumno |
| GET /me/grades | Calificaciones | Solo publicadas y de inscripciones propias |
| GET /me/justifications | Justificaciones | Solo propias |

La ruta personal deriva la identidad del alumno desde la cookie de sesión, no de un studentId enviado por el cliente.

### Preceptoría y Profesores

- POST /attendance/by-subject: planilla por materia/fecha de Preceptoría.
- POST /attendance/commissions/{id}/sessions y PUT /attendance/sessions/{id}: sesiones de clase para Profesores.
- GET /attendance y GET /attendance/summary: vistas restringidas al personal responsable; el alumno debe consumir /me/attendance y /me/summary.
- GET/POST /attendance/justifications y PATCH /attendance/justifications/{id}: consulta/gestión de justificaciones para el personal autorizado. No son rutas de envío del alumno.

Las dos pantallas de toma de asistencia escriben en class_sessions y attendance_records. El origen queda identificado como PRECEPTOR o TEACHER; el backend calcula el resumen que comparten las vistas de personal y Alumno.

### Centro de Estudiantes

- GET /centro/events: eventos; POST/DELETE /centro/events/{id}/join: inscripción propia de una persona con sesión.
- GET /centro/threads y GET /centro/threads/{id}/replies: foro comunitario.
- POST /centro/threads y POST /centro/threads/{id}/replies: participación de Alumno o Centro.
- GET /centro/announcements: comunicados del Centro; crear, editar y borrar es gestión del rol STUDENT_REP o SUPER_ADMIN.
- GET/POST /centro/claims: un alumno consulta y crea sus reclamos; el Centro ve y responde los reclamos según rol.

### Otros dominios

- GET /records/notices y GET /records/events: comunicados y eventos institucionales visibles para la cuenta.
- GET /social/forum y GET /social/forum/{id}/replies: foro académico separado, con moderación de Preceptoría.
- GET /social/notifications: notificaciones de la sesión.
- /staff/tasks, /staff/installations, /staff/incidents y /staff/maintenance: operaciones de Auxiliares; no habilitar para el rol STUDENT.

Confirmar siempre el método, el DTO y el rol requerido en backend/src/routes/ antes de programar una integración.

## 4. Acciones de la app que aún son solo demo o no tienen endpoint de alumno

- Solicitud de corrección de datos del perfil: no hay endpoint de alumno confirmado.
- Envío de justificación desde el portal: el backend documentado permite la consulta personal, mientras que la creación y revisión corresponde al personal autorizado. No exponer el formulario como trámite real hasta que exista un flujo aprobado.
- Registro QR: no hay endpoint confirmado para que el alumno certifique su propia asistencia. La validación debe ocurrir en servidor y la escritura debe usar la regla institucional.
- Marcado leído de avisos, preferencias de cuenta y recordatorios: confirmar contrato de persistencia y endpoint antes de sincronizar.
- Foros: elegir claramente si cada pantalla usa foro académico o comunitario del Centro; no mezclar DTOs o reglas de moderación.

Mientras no exista el endpoint y su autorización, la UI indica que el trámite no está habilitado y no afirma que fue recibido por Bedelía, Preceptoría o el Centro.

## 5. Seguridad y privacidad

- Usar la sesión compartida con cookie HttpOnly; no almacenar tokens de acceso en localStorage.
- Exigir rol y permiso en servidor en cada endpoint.
- Resolver studentId desde la sesión, y devolver solo datos propios para rutas personales.
- Mantener los módulos de origen como autoridad para matrícula, asistencia, notas y comunicados.
- Minimizar datos personales; la app no debe solicitar información fuera del propósito de cada pantalla.
- Revisar autorización, auditoría, límites y tratamiento de adjuntos antes de habilitar escrituras.
- No enviar datos a endpoints de Auxiliares desde el portal Alumno.
- Usar DTOs compartidos o adaptadores tipados y validar respuestas antes de mostrarlas.

## 6. Pasos de integración

1. Publicar la V2 con su rewrite same-origin y validar login/cambio de contraseña con una cuenta QA autorizada.
2. Verificar las lecturas `/me/*`, eventos y comunicados institucionales, Centro y foros por rol.
3. Mantener el portal Alumno fuera de `/staff/*`; Auxiliares usa la misma base/API, con roles, datos y pantallas propios.
4. Mantener locales o deshabilitadas las funciones sin endpoint aprobado. Antes de agregar tablas, acordar el contrato de rectificaciones, preferencias, adjuntos y asistencia QR.
5. Solo si se propone cambio de esquema, probarlo en PostgreSQL local aislado y revisar referencias antes de planificar una migración de Neon.

La arquitectura integra los cuatro módulos mediante una base y API comunes; cada llamada sigue su dominio y autorización. La integración de la V2 quedará validada cuando se publique y se comprueben los flujos autorizados de sesión, lecturas propias y acceso del Centro, manteniendo Auxiliares aislado por rol.
