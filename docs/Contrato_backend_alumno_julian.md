# Informe técnico para el contrato backend — Módulo Alumno (Julián)

**Estado:** base de análisis para acordar el contrato; todavía no hay integración HTTP real.  
**Frontend analizado:** `Julian - Alumnos/Modulo Alumno Frontend`  
**Repositorio revisado:** rama `main`, commit `12416c9` (`Merge remote-tracking branch 'origin/main'`). La consulta a GitHub no encontró commits posteriores al momento de la revisión.  
**Fecha de revisión:** 16 de octubre de 2026.

## 1. Objetivo y alcance

Este informe describe qué presenta y qué acciones ofrece el frontend de Julián, qué datos necesita y qué contrato podría exponer el backend institucional. Separa el comportamiento que existe en el prototipo de las operaciones REST propuestas: aunque el código tiene un `apiService.ts` y comentarios con rutas, el servicio simula las respuestas y no realiza llamadas `fetch` o Axios.

El frontend está dentro de `Julian - Alumnos/Modulo Alumno Frontend/src/JULIAN/`. Sus archivos de entrada (`src/App.tsx`, `src/main.tsx`) montan el portal de Julián. El módulo comparte la carpeta de documentación `Julian - Alumnos/docs` con el resto del módulo Alumno.

## 2. Qué está implementado en el frontend

El portal se organiza en estas secciones:

| Sección | Datos o comportamiento que muestra | Fuente actual |
|---|---|---|
| Inicio / Dashboard | Indicadores de asistencia, faltas, promedio y materias; avisos; materias; notas recientes; agenda próxima | Datos de prueba y cálculos del contexto |
| Perfil | Identidad y datos académicos/personales, contacto de emergencia y solicitud informativa de corrección | `MOCK_STUDENT`; la solicitud solo cambia el estado visual |
| Agenda | Eventos, grilla semanal y mesas de examen | `MOCK_CALENDAR_EVENTS` más horarios de las materias |
| Materias | Comisión, docentes, cursada, horarios, aulas, asistencia, promedio, correlativas y detalle | `MOCK_SUBJECTS` |
| Notas | Evaluaciones, notas, estados, devoluciones y filtros | `MOCK_GRADES` |
| Faltas / Asistencia | Registros, estados, método, porcentaje y solicitud de justificación | Datos de prueba; asistencia puede guardarse en `localStorage` |
| Historial | Línea de tiempo académica combinada | Combina datos locales del portal |
| Comunidad | Directorio de docentes, preceptoría y compañeros; formulario de consulta | `MOCK_COMMUNITY`; el envío solo muestra confirmación |
| Foros | Temas, respuestas, creación de tema y búsqueda | `MOCK_FORUMS`; cambios guardados en `localStorage` |
| Opciones | Preferencias de alertas, umbral de asistencia y datos informativos de cuenta | Estado local temporal; no se persiste ni se envía |
| Apariencia | Seis temas, tipografía, bordes, contraste y movimiento | Preferencias guardadas en `localStorage` |
| Asistencia QR | Simulación de validación y alta de una asistencia | Token, sesión y resultado simulados en el frontend |

Los tipos principales están en `src/JULIAN/types/index.ts`: `StudentProfile`, `Subject`, `Grade`, `AttendanceRecord`, `CalendarEvent`, `AcademicNotice`, `CommunityMember`, `ForumTopic`, `ForumReply`, `NotificationItem` y `QRScanSession`. Sus propiedades son la fuente más directa para preparar DTOs compatibles con la UI.

## 3. Estado actual de integración

`src/JULIAN/services/apiService.ts` declara métodos para perfil, materias, notas, asistencias, justificaciones, QR, agenda, avisos, comunidad, foros y notificaciones. En la implementación actual:

- Los métodos devuelven `MOCK_*` con un retardo artificial; no hay URL base, `fetch`, cliente HTTP, encabezado `Authorization`, manejo común de errores ni configuración de ambiente para la API.
- El perfil, las materias, las notas, agenda, avisos, comunidad y notificaciones se inicializan directamente desde `mockData.ts` en `PortalContext.tsx`.
- Asistencias y foros leen/escriben `localStorage`. Las justificaciones solo actualizan el registro local, guardan el texto del motivo y un nombre de archivo; no envían el contenido del archivo.
- La validación QR ignora el token y el `studentId` recibidos y siempre devuelve una sesión y resultado simulados; la asistencia se agrega al almacenamiento local.
- Las respuestas y temas del foro se crean en el navegador y se persisten en `localStorage`.
- El formulario de comunidad, la solicitud de corrección de perfil y las opciones de alertas no llaman a un servicio.
- La apariencia se persiste localmente y no requiere backend en el alcance actual.

Por eso, no debe interpretarse que las rutas comentadas o los mensajes de éxito actuales demuestran una integración o una transacción real.

## 4. Operaciones backend que necesita acordar el módulo

La siguiente matriz es una propuesta de contrato inicial, no una descripción de endpoints ya existentes. Se recomienda que toda identidad se derive de la sesión autenticada, sin aceptar un `alumno_id` arbitrario enviado por el navegador.

| Método y ruta propuesta | Uso en el portal | Respuesta/datos necesarios | Prioridad |
|---|---|---|---|
| `GET /api/v1/alumnos/me` | Perfil del estudiante autenticado | `StudentProfile` con campos autorizados para el portal | MVP |
| `GET /api/v1/alumnos/me/materias` | Dashboard, listado y agenda semanal | Colección de `Subject` o DTO resumido con comisión, cursada, docente, horarios y aula | MVP |
| `GET /api/v1/alumnos/me/materias/{materiaId}` | Ficha detallada de materia | Descripción, comisión, docentes, horarios, correlativas y resumen de cursada | MVP |
| `GET /api/v1/alumnos/me/notas` | Libreta y notas recientes | `Grade[]`; filtro opcional `materiaId`, `tipo`, `estado` | MVP |
| `GET /api/v1/alumnos/me/asistencias` | Faltas, porcentaje e historial | `AttendanceRecord[]` más agregado por materia; filtro opcional `materiaId`, `desde`, `hasta` | MVP |
| `POST /api/v1/alumnos/me/asistencias/{asistenciaId}/justificaciones` | Enviar motivo y comprobante a Preceptoría | Identificador de solicitud, estado inicial `PENDIENTE`, fecha de presentación | Requiere decisión de alcance y carga real de archivo |
| `POST /api/v1/alumnos/me/asistencia-qr/validar` | Registrar asistencia a partir del token de clase | Resultado validado por servidor y registro de asistencia | Requiere definición del sistema QR institucional |
| `GET /api/v1/alumnos/me/agenda?desde={fecha}&hasta={fecha}` | Cronograma, vencimientos y agenda | `CalendarEvent[]` dentro del período; especificar zona horaria institucional | MVP |
| `GET /api/v1/alumnos/me/avisos` | Avisos de Preceptoría e institucionales | Avisos visibles para el alumno/comisión | Acordar si entra en MVP |
| `GET /api/v1/alumnos/me/notificaciones` | Centro de notificaciones | `NotificationItem[]` con destino de navegación | Acordar si entra en MVP |
| `PATCH /api/v1/alumnos/me/notificaciones/{notificacionId}` | Marcar notificación leída | Estado actualizado | Solo si las notificaciones son persistentes en servidor |
| `GET /api/v1/foros` | Listado de debates | `ForumTopic[]` con tema, autor, fecha, etiquetas y respuestas o paginación | Acordar visibilidad y alcance |
| `POST /api/v1/foros` | Crear un tema desde el portal | Tema creado con autor derivado de la sesión | Fuera del alcance read-only documentado; requiere aprobación funcional |
| `POST /api/v1/foros/{temaId}/respuestas` | Responder un tema | Respuesta creada con autor derivado de la sesión | Fuera del alcance read-only documentado; requiere aprobación funcional |
| `GET /api/v1/comunidad` | Directorio institucional | Miembros visibles para la comisión/rol del alumno | Acordar autorización y privacidad |

### 4.1 Forma de autenticación y aislamiento

El frontend debe usar la sesión/autenticación central del sistema. Las rutas `/me` representan al alumno asociado a esa sesión. El backend debe validar el rol `ALUMNO`, obtener el identificador real desde la identidad autenticada y limitar las consultas a sus datos y a la comisión que le corresponda. No se debe confiar en `studentId`, `alumno_id` o `comision_id` suministrados por el cliente para autorizar acceso.

La renovación, almacenamiento y expiración del token quedan a cargo del mecanismo institucional de autenticación y deben definirse antes de cablear el cliente HTTP. La pantalla actual no implementa login ni sesión real.

### 4.2 Convenciones sugeridas

- JSON en UTF-8 para operaciones ordinarias; fechas civiles como `YYYY-MM-DD` y marcas de tiempo como ISO 8601 con zona horaria explícita.
- Identificadores estables de tipo string o entero, definidos de forma uniforme por el backend. El frontend actual modela los IDs como `string`.
- Listas con filtros/paginación cuando puedan crecer; acordar si la respuesta es un array directo o un sobre `{ data, meta }` antes de implementar.
- Errores consistentes, por ejemplo `{ "error": { "code": "...", "message": "...", "traceId": "..." } }`, con estados HTTP adecuados para no autenticado, sin permisos, no encontrado, validación y conflicto.
- No exponer datos personales que la vista no necesite. `StudentProfile` hoy incluye DNI, domicilio y contacto de emergencia; su inclusión en `/me` necesita revisión de privacidad y autorización.

## 5. DTOs que el frontend espera

Los DTOs deberían mapear los tipos de `src/JULIAN/types/index.ts`. A continuación se resumen los campos que afectan las pantallas; los enums deben normalizarse para evitar diferencias entre etiquetas de presentación y códigos backend.

### Alumno (`StudentProfile`)

`id`, `fullName`, `dni`, `legajo`, `email`, `career`, `institution`, `plan`, `year`, `division`, `shift`, `status`, `cohort`, `tutorPreceptor`, `preceptorEmail`, `emergencyContact`, `address`, `avatarUrl`.

El estado actual de perfil usa `Regular Activo | Condicional | En Trámite`. El contrato debería transportar códigos estables, por ejemplo `REGULAR_ACTIVO`, y dejar la etiqueta visible al frontend. Confirmar qué campos personales estarán disponibles en el portal.

### Materia (`Subject`)

`id`, `code`, `name`, `professor`, `professorEmail`, `commission`, `year`, `schedules[]` (`day`, `startTime`, `endTime`, `classroom`, `modality`), `status`, `attendancePercentage`, `attendedClasses`, `totalClasses`, `absences`, `maxAllowedAbsences`, `currentAverage`, `correlatives[]`, `description` y `nextExam` opcional.

El frontend muestra horarios y aulas en agenda, dashboard y detalle. Acordar si los agregados de asistencia/promedio llegan desde el backend o se calculan en un servicio institucional a partir de registros oficiales.

### Nota (`Grade`)

`id`, `subjectId`, `subjectName`, `evaluationName`, `type`, `score` anulable, `minPassingScore`, `maxScore`, `date`, `isApproved` anulable, `status`, `feedback` opcional y `weightPercentage` opcional. Valores de UI: `Parcial | Trabajo Práctico | Recuperatorio | Examen Final`; estado `Publicada | Pendiente de Publicación | Ausente Justificado`.

Las notas deben provenir del módulo docente/registro oficial. No presentar calificaciones no publicadas como oficiales.

### Asistencia (`AttendanceRecord`)

`id`, `subjectId`, `subjectName`, `date`, `time`, `status`, `hoursCount`, `classroom`, `method`, `justificationStatus?`, `justificationReason?`, `justificationAttachment?`, `justificationSubmittedAt?`.

Estados de asistencia de la interfaz: `Presente | Ausente | Tardanza | Justificada`. Métodos: `Código QR | Planilla Docente | Preceptoría`. Estado del trámite de justificación: `No Requerida | Pendiente | Aprobada | Rechazada`. Conviene separar el estado de asistencia del estado de la solicitud de justificación en el DTO backend.

### Agenda, avisos, foros y comunidad

- `CalendarEvent`: `id`, `title`, `type`, `subjectId?`, `subjectName?`, `date`, `startTime`, `endTime`, `classroom?`, `description`, `priority`.
- `AcademicNotice`: `id`, `title`, `category`, `author`, `authorRole`, `date`, `summary`, `content`, `isRead`, `priority`.
- `ForumTopic` y `ForumReply`: tema/materia, autor, contenido, fecha, etiquetas, respuestas, fijado, vistas y likes. Los campos `isCurrentUser` son de presentación: no deben ser autoridad del servidor; deducir autoría mediante la sesión.
- `CommunityMember`: `id`, `name`, `role`, `roleDetail`, `institutionalEmail`, `commission`, `officeHours?`, `avatarUrl?`, `status`.

## 6. Mutaciones visibles y decisiones funcionales pendientes

El README del frontend presenta 13 secciones; sin embargo, el MVP de `Julian - Alumnos/docs/ALCANCE_MVP.md` y `ARQUITECTURA_E_INTEGRACIONES.md` describe un patrón **read-only** para el rol Alumno y deja fuera de alcance las justificaciones. El prototipo actual incluye varias acciones de escritura simuladas: justificación de inasistencias, validación QR, creación de temas y respuestas de foro. Antes de acordar el contrato definitivo, el equipo debe decidir explícitamente:

1. Si se mantiene read-only como regla del MVP o si se habilitan esas operaciones del alumno.
2. Si foros/comunidad pertenecen al backend de este módulo o a servicios institucionales compartidos.
3. Si las justificaciones aceptan archivos reales y cuáles son límites de tamaño, tipos MIME, retención y permisos de consulta para Preceptoría.
4. Qué sistema emite el QR, cómo expira/rota, cómo se valida la presencia y qué errores puede devolver. La UI menciona red institucional, geocerca y tolerancias, pero el prototipo no implementa ni verifica esas señales.
5. Si las mesas de examen, avisos y notificaciones forman parte del MVP o son datos de otros módulos.
6. Qué preferencias se guardan solo en el navegador y cuáles necesitan persistencia por cuenta. Hoy las opciones de correo/alertas se pierden al desmontar la pantalla; la apariencia sí persiste localmente.
7. Si el formulario para corregir datos personales solo informa al alumno o debe crear una solicitud formal a Bedelía/Secretaría.

La documentación anterior también propone rutas con `/alumnos/{alumno_id}/...`, mientras que el servicio del frontend propone rutas `/alumnos/me/...`. Se recomienda adoptar `/me` para reducir riesgo de acceso a otros legajos y registrar cualquier excepción como decisión de arquitectura.

## 7. Requisitos que debe cubrir el backend

- Autenticación institucional y autorización por rol `ALUMNO` en cada operación.
- Aislamiento por alumno y comisión; nunca autorizar por un ID provisto sin comprobar su relación con la sesión.
- Fuente oficial de datos: el portal consume información de Administración/Cursadas, Asistencia/Preceptoría, Docentes y Autenticación; no crea tablas académicas duplicadas ni conecta el navegador directamente a la base.
- Respuestas que distingan dato inexistente, no publicado, pendiente y error; no reemplazar ausencias de datos por estimaciones del navegador.
- Auditoría de operaciones que creen solicitudes, asistencias, temas o respuestas, si esas operaciones se aprueban.
- Validaciones de negocio en servidor: plazos de justificación, estado elegible del registro, duplicados, vigencia y unicidad de tokens QR, y moderación/permisos de foro.
- CORS, límites de carga y protección contra abuso según el despliegue institucional. Nunca colocar secretos de servicio ni claves privadas en el bundle frontend.

## 8. Secuencia recomendada de integración

1. Confirmar los siete puntos funcionales de la sección 6 y nombrar los módulos responsables de cada dato.
2. Acordar autenticación, convención de rutas, códigos de estado, errores, fechas, IDs, paginación y política de datos personales.
3. Implementar primero las lecturas de perfil, materias, notas, asistencia y agenda; definir explícitamente el estado “sin datos” y “dato pendiente”.
4. Conectar avisos, comunidad y notificaciones si entran en alcance.
5. Aprobar y especificar cada mutación (justificación, QR y foros) por separado, incluyendo payloads, autorización, idempotencia, auditoría y reglas de negocio.
6. Reemplazar los métodos mock de `apiService.ts` por un cliente HTTP configurable por ambiente; centralizar encabezados, errores y validación de respuesta.
7. Retirar las escrituras de datos académicos en `localStorage` cuando exista backend; conservar localmente únicamente las preferencias de interfaz que se decida mantener en el dispositivo.

## 9. Archivos consultados

- `Julian - Alumnos/Modulo Alumno Frontend/src/JULIAN/types/index.ts`
- `Julian - Alumnos/Modulo Alumno Frontend/src/JULIAN/services/apiService.ts`
- `Julian - Alumnos/Modulo Alumno Frontend/src/JULIAN/context/PortalContext.tsx`
- `Julian - Alumnos/Modulo Alumno Frontend/src/JULIAN/data/mockData.ts`
- `Julian - Alumnos/Modulo Alumno Frontend/src/JULIAN/pages/`
- `Julian - Alumnos/Modulo Alumno Frontend/src/JULIAN/components/`
- `Julian - Alumnos/Modulo Alumno Frontend/README.md`
- `Julian - Alumnos/Modulo Alumno Frontend/src/JULIAN/README.md`
- `Julian - Alumnos/docs/ALCANCE_MVP.md`
- `Julian - Alumnos/docs/ARQUITECTURA_E_INTEGRACIONES.md`

**Conclusión:** el frontend sirve como especificación de experiencia y de modelos, pero hoy sus datos y acciones son simulados. El contrato backend debe formalizarse a partir de estos DTOs y cerrar primero la contradicción entre el MVP read-only y las mutaciones que presenta el prototipo.
