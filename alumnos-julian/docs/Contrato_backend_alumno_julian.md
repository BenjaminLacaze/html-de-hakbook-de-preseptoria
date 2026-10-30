# Contrato de integración — Portal del Alumno app v2

**Estado de app v2:** usa demo local; todavía no consume la API compartida.
**Estado del backend general:** hay rutas compartidas para Alumno, Profesores, Preceptoría, Auxiliares y Centro de Estudiantes; consultar docs/INTEGRACION_TECNICA.md y consolidacion/README.md.
**Fuentes de la app:** JULIAN/shared/services/api.ts, JULIAN/shared/types/index.ts, JULIAN/mocks/db.ts y JULIAN/mocks/dataset.ts.

## 1. Frontera actual

StudentApi delega en demoDB. Los datos iniciales vienen de mocks y los cambios se guardan en localStorage con la clave alumno-demo-db-v1. La demora de 300–700 ms y los fallos simulados no son solicitudes de red reales.

La app v2 no tiene login institucional ni autorización de servidor. No usa el cliente común apiFetch. Los valores de plantilla de .env.example no configuran la API.

El backend real usa /api/v1, cookie HttpOnly de sesión y permisos validados en cada solicitud. En local, la URL base del cliente común es /api/v1 y puede configurarse con VITE_API_BASE_URL. No guardar tokens de sesión en localStorage.

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

Mientras no exista el endpoint y su autorización, la UI debe indicar que una acción es una demostración y no afirmar que fue recibida por Bedelía, Preceptoría o el Centro.

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

1. Integrar el gate de sesión común y validar acceso STUDENT.
2. Reemplazar las lecturas demo por /me/student, /me/subjects, /me/attendance, /me/summary y /me/grades.
3. Conectar avisos y eventos institucionales con sus rutas; agregar contenido del Centro desde /centro/* solo donde corresponda.
4. Mantener separados los foros y sus políticas de moderación.
5. Deshabilitar o rotular como demo las acciones sin endpoint aprobado.
6. Validar con la cuenta de prueba de Alumno y confirmar en backend qué lecturas, escrituras y permisos operan en el entorno vigente.

La nueva app queda integrada cuando muestra datos de sesión, comparte los registros de Preceptoría/Profesores y consulta contenido habilitado del Centro, sin acceder a la información operativa de Auxiliares ni confundir los dominios.
