# Contrato de integración backend — Módulo Alumno

**Proyecto:** Asistencia Terciario
**Módulo:** Alumno (`Julian - Alumnos/Modulo Alumno`)
**Estado:** propuesta basada en la implementación actual; requiere acuerdo del equipo antes de conectar datos institucionales.
**Fecha:** 16 de octubre de 2026

## 1. Propósito y alcance

Este documento actualiza el contrato de integración a partir del nuevo frontend de `Modulo Alumno`. Describe las lecturas que necesita la interfaz, los DTOs tipados que consume y las operaciones que aparecen en el cliente pero todavía requieren autorización funcional.

El módulo alumno es un consumidor de datos académicos. No debe tener acceso directo a MySQL ni mantener copias de las tablas oficiales. La identidad se obtiene del sistema central de autenticación. El backend institucional aplica autorización y obtiene el legajo desde la sesión, sin confiar en un identificador de alumno enviado por el navegador.

El backend, la tecnología de persistencia y los responsables de cada dominio se acuerdan a nivel del proyecto. Los endpoints de este documento son una propuesta versionada, no una afirmación de que ya existan.

## 2. Fuentes inspeccionadas

- `Julian - Alumnos/Modulo Alumno/src/types/index.ts`
- `Julian - Alumnos/Modulo Alumno/src/services/`
- `Julian - Alumnos/Modulo Alumno/src/lib/apiClient.ts`
- `Julian - Alumnos/Modulo Alumno/src/lib/queryClient.ts`
- `Julian - Alumnos/Modulo Alumno/src/mocks/mockData.ts`
- `Julian - Alumnos/Modulo Alumno/src/features/`
- `Julian - Alumnos/Modulo Alumno/README.md`
- `Julian - Alumnos/docs/ALCANCE_MVP.md`
- `Julian - Alumnos/docs/ARQUITECTURA_E_INTEGRACIONES.md`
- `docs/CONTRATO_BACKEND.md`

El frontend nuevo usa React, TypeScript, Vite, Axios, TanStack Query y React Router. `VITE_USE_MOCK` elige entre datos de demostración y HTTP. Los servicios HTTP actuales esperan DTOs con nombres de propiedades en camelCase español y rutas relativas `/student/...`.

## 3. Estado de integración actual

Las operaciones listadas en los servicios todavía alternan entre datos en memoria y solicitudes Axios. No se encontró una implementación del backend ni evidencia de que el dominio `api.asistenciaterciario.edu.ar` esté desplegado. La URL presente en `.env.example` y el valor por defecto del cliente son configuraciones de referencia: no constituyen una API verificada.

| Servicio frontend | Operaciones actuales | Estado con `VITE_USE_MOCK=false` |
|---|---|---|
| `studentService` | perfil; actualizar email/teléfono | `GET /student/profile`; `PATCH /student/profile/contact` |
| `subjectsService` | lista y detalle de materia | `GET /student/subjects`; `GET /student/subjects/{id}` |
| `gradesService` | lista y notas por materia | `GET /student/grades`; `GET /student/subjects/{id}/grades` |
| `attendanceService` | registros, justificar, validar QR | `GET /student/attendance`; dos `POST` |
| `agendaService` | agenda e historial | `GET /student/agenda`; `GET /student/history` |
| `communityService` | directorio autorizado | `GET /student/community` |
| `forumService` | lista, crear tema, responder | `GET` y dos `POST` en `/student/forums` |

En modo mock, los cambios de perfil, justificaciones, registros QR y foros se simulan en memoria. No son persistencia institucional.

## 4. Decisión de alcance: solo lectura en el MVP

`ALCANCE_MVP.md` y `ARQUITECTURA_E_INTEGRACIONES.md` establecen que el rol Alumno consulta datos y no tiene mutaciones académicas. El frontend nuevo presenta algunas operaciones adicionales que contradicen esa regla. Hasta que el equipo y el responsable del backend las aprueben, el contrato MVP habilita solo lecturas:

- `PATCH /student/profile/contact` — no habilitar todavía; acordar si el perfil es editable y qué campos.
- `POST /student/attendance/{id}/justify` — fuera del MVP documentado; requiere decisión de Preceptoría y especificación de adjuntos.
- `POST /student/attendance/qr/validate` — no registrar asistencia real desde un QR de demostración; requiere protocolo institucional y validación de servidor.
- `POST /student/forums` y `POST /student/forums/{id}/replies` — requieren aprobación de publicación, moderación y permisos.

Los controles que hoy simulan esas acciones no prueban que el backend las autorice. Antes de apagar el modo mock, deben deshabilitarse o quedar detrás de una capacidad explícitamente habilitada por el backend.

## 5. Convenciones de API propuestas

- Prefijo canónico recomendado: `/api/v1`.
- JSON UTF-8. Propiedades de respuesta compatibles con los tipos actuales en `src/types/index.ts`.
- Autenticación central del proyecto; las rutas protegidas requieren sesión válida y rol `ALUMNO`.
- El backend deriva el usuario y `alumnoId` del contexto autenticado. No aceptar `alumnoId`, rol o legajo del body/query como prueba de autorización.
- Los datos quedan aislados al alumno autenticado y a sus comisiones vigentes.
- Fechas civiles como `YYYY-MM-DD`; timestamps ISO 8601 con offset/zona explícita. El backend define la zona institucional.
- IDs estables serializados como string, de acuerdo con los tipos frontend.
- Listas pequeñas pueden ser arrays. Para listas extensas, acordar cursor y metadatos antes de implementar paginación.
- Errores con forma uniforme, por ejemplo `{"error":{"code":"...","message":"...","traceId":"..."}}`.
- Estados recomendados: `400` validación, `401` no autenticado, `403` sin permisos, `404` recurso no visible/no encontrado, `409` conflicto y `5xx` error del servidor. No revelar si existe el legajo de otra persona.
- Versionar cambios incompatibles; documentar la API aprobada con OpenAPI.

### Autenticación

La autenticación corresponde al servicio central, no a una implementación paralela de este módulo. La interfaz actual consulta `sessionStorage` para añadir `Authorization: Bearer ...`, pero no incluye flujo de login, renovación ni expiración. El equipo debe acordar el mecanismo de sesión. Si se utilizan cookies, deben ser `HttpOnly`, `Secure` y con política `SameSite` apropiada; si se mantiene token Bearer, definir su ciclo de vida y entrega segura. El backend debe aplicar autorización en cada endpoint, independientemente de la protección visual de rutas.

## 6. Endpoints de lectura del MVP

Estas rutas son el contrato recomendado. El frontend actualmente usa prefijos `/student/...`; se debe acordar un mapeo o actualizar `src/lib/apiClient.ts` y los servicios antes de conectar producción. El backend no debe exponer IDs de alumno en las rutas personales.

| Método y ruta canónica | Propósito | DTO esperado / filtros |
|---|---|---|
| `GET /api/v1/auth/me` | Confirmar identidad y rol de la sesión | `userId`, `studentId`, nombre, email institucional y roles autorizados. Solo lo necesario para el contexto de UI. |
| `GET /api/v1/alumnos/me` | Perfil académico del alumno autenticado | `StudentProfile` con campos autorizados; aplicar minimización de datos personales. |
| `GET /api/v1/alumnos/me/materias` | Materias del alumno en el período vigente | `Subject[]`; período académico vigente resuelto o filtro documentado. |
| `GET /api/v1/alumnos/me/materias/{materiaId}` | Detalle de una materia propia | `Subject`; verificar matrícula activa del alumno. |
| `GET /api/v1/alumnos/me/materias/{materiaId}/notas` | Notas oficiales de una materia propia | `GradeItem[]`; solo publicaciones visibles para el alumno. |
| `GET /api/v1/alumnos/me/notas` | Notas de todas las materias propias | `GradeItem[]`; filtro opcional `materiaId`. |
| `GET /api/v1/alumnos/me/asistencias` | Registros y agregados de presentismo | `AttendanceRecord[]`; filtros opcionales `materiaId`, `desde`, `hasta`. |
| `GET /api/v1/alumnos/me/agenda` | Clases, evaluaciones y eventos autorizados | `AcademicEvent[]`; filtros `desde`, `hasta`, `materiaId`. |
| `GET /api/v1/alumnos/me/historial` | Línea de tiempo académica del alumno | `TimelineEvent[]`; filtros por fecha/tipo/materia si se acuerdan. |
| `GET /api/v1/alumnos/me/comunidad` | Directorio visible para el alumno | `CommunityMember[]`; acotado a comisión y política institucional. |
| `GET /api/v1/foros` | Consultar publicaciones visibles | `ForumPost[]`; filtros opcionales `materiaId`, `categoria`, paginación. La visibilidad debe acordarse con el equipo. |

`/api/v1/auth/me` depende del servicio central. Foros puede ser un dominio compartido, no propiedad del módulo Alumno. Avisos y notificaciones no tienen actualmente un servicio separado en el nuevo frontend; no agregar rutas para ellos hasta confirmar su fuente de verdad y alcance.

### Correspondencia temporal con las rutas del cliente

| Ruta relativa actual | Ruta canónica sugerida |
|---|---|
| `/student/profile` | `/alumnos/me` |
| `/student/subjects` | `/alumnos/me/materias` |
| `/student/subjects/{id}` | `/alumnos/me/materias/{materiaId}` |
| `/student/grades` | `/alumnos/me/notas` |
| `/student/subjects/{id}/grades` | `/alumnos/me/materias/{materiaId}/notas` |
| `/student/attendance` | `/alumnos/me/asistencias` |
| `/student/agenda` | `/alumnos/me/agenda` |
| `/student/history` | `/alumnos/me/historial` |
| `/student/community` | `/alumnos/me/comunidad` |
| `/student/forums` | `/foros` |

El prefijo `/api/v1` se define en la URL base, no se debe duplicar en cada ruta relativa. Confirmar la convención con el equipo antes de cambiar el cliente.

## 7. DTOs y reglas de representación

Los campos siguientes reflejan `src/types/index.ts`. Son el contrato de datos esperado por el frontend; el backend puede mantener nombres internos distintos y mapearlos en su capa de transporte.

### StudentProfile

Campos tipados actualmente: `id`, `legajo`, `nombre`, `apellido`, `dni`, `email`, `telefono`, `carrera`, `codigoCarrera`, `institucion`, `planEstudio`, `anioCursada`, `cuatrimestreActual`, `comision`, `turno`, `estadoAcademico`, `fechaInscripcion`, `promedioGeneral`, `porcentajeAsistenciaGlobal`, `avatarUrl?`.

Minimización requerida: incluir DNI y teléfono solo si la política institucional y el propósito de la vista lo autorizan. No se debe devolver DNI en cada pantalla por conveniencia. El perfil es de solo lectura en el MVP documentado. `promedioGeneral` y `porcentajeAsistenciaGlobal` deben originarse en reglas institucionales verificables, no en inferencias del cliente.

### Subject

`id`, `codigo`, `nombre`, `carrera`, `anio`, `cuatrimestre`, `comision`, `docentes[]`, `horarios[]`, `estadoCursada`, `totalClasesPrevistas`, `clasesDictadas`, `asistenciasPresentes`, `asistenciasAusentes`, `asistenciasJustificadas`, `porcentajeAsistencia`, `limiteFaltas`, `promedioParciales`, `correlativas[]`.

`SubjectTeacher`: `id`, `nombre`, `rol`, `email`. `SubjectSchedule`: `dia`, `horarioInicio`, `horarioFin`, `aula`, `modalidad`.

La inclusión de email docente y límite de faltas debe ajustarse a política de privacidad y reglamento vigente. Enumera códigos estables y separa etiquetas localizadas cuando el equipo lo defina.

### GradeItem

`id`, `materiaId`, `materiaNombre`, `tipoEvaluacion`, `nota` (nullable si está pendiente), `fechaEvaluacion`, `fechaPublicacion?`, `estado`, `ponderacion?`, `observaciones?`, `esOficial`.

Solo incluir notas oficializadas/visibles o marcar claramente su estado pendiente. El backend es la fuente oficial. No aceptar operaciones del alumno que modifiquen la nota.

### AttendanceRecord

`id`, `materiaId`, `materiaNombre`, `fecha`, `estado`, `justificacionDetalle?`, `estadoJustificacion?`, `metodoRegistro`, `observacion?`.

Estados frontend: `Presente`, `Ausente`, `Tardanza`, `Justificada`. Métodos: `QR Aula`, `Docente`, `Preceptoría`, `Planilla`. Si una justificación existe como proceso institucional, separar estado del registro de asistencia y estado de su trámite. La API de lectura no permite alterarlos.

### AcademicEvent y TimelineEvent

`AcademicEvent`: `id`, `titulo`, `tipo`, `materiaId?`, `materiaNombre?`, `fecha`, `horarioInicio`, `horarioFin`, `ubicacion`, `descripcion?`, `importante?`.

`TimelineEvent`: `id`, `fecha`, `tipo`, `titulo`, `descripcion`, `materiaNombre?`, `badgeTexto`, `badgeVariant`.

Las fechas/horarios deben venir con zona horaria institucional acordada. Los eventos se filtran a los que el alumno puede consultar.

### CommunityMember y ForumPost

`CommunityMember`: `id`, `nombre`, `rol`, `carrera`, `comision`, `email`, `materiasCompartidas?`, `activo`. Devolver solamente contactos institucionales que el alumno está autorizado a ver; no exponer correos personales.

`ForumPost`: `id`, `materiaId?`, `materiaNombre?`, `categoria`, `titulo`, `contenido`, `autorNombre`, `autorRol`, `fecha`, `fijado?`, `respuestasCount`, `respuestas[]`. `ForumPostReply`: `id`, `postId`, `autorNombre`, `autorRol`, `fecha`, `contenido`.

`autorNombre`, `autorRol` e `isCurrentUser` son datos de presentación; el backend deriva el autor real de la sesión, nunca del body. Definir moderación, publicación y límites antes de activar escrituras.

## 8. Operaciones fuera del contrato MVP

Si el equipo aprueba estas capacidades en otra fase, definir un contrato separado con autorización, validación, auditoría, idempotencia y errores específicos:

| Operación que aparece en el cliente | Ruta actual | Requisitos antes de habilitar |
|---|---|---|
| Actualizar email/teléfono | `PATCH /student/profile/contact` | Confirmar campos editables, verificación de email, validación y fuente de verdad. |
| Pedir justificación | `POST /student/attendance/{id}/justify` | Aprobación de Preceptoría, plazo, adjuntos, límites MIME/tamaño, almacenamiento y estado de trámite. |
| Validar QR de asistencia | `POST /student/attendance/qr/validate` | Token emitido por servidor, expiración/uso único, contexto de cursada, prevención de replay y registro auditable. |
| Crear foro / respuesta | `POST /student/forums`, `POST /student/forums/{id}/replies` | Confirmar alcance, autorización, reglas de moderación, límites de contenido y protección antiabuso. |

El cliente de QR actual genera una asistencia simulada y no puede ser autoridad de registro. No activar en producción hasta contar con la validación oficial del backend.

## 9. Seguridad, privacidad y operación

- Aplicar autorización por `ALUMNO` y control de acceso a cada recurso en servidor; proteger endpoints aunque la UI oculte rutas.
- Obtener el alumno desde identidad autenticada; no aceptar un `studentId` de cliente para delimitar datos.
- Mantener una fuente oficial para perfil, inscripción, comisiones, asistencia y calificaciones. El portal solo consume esos dominios.
- Minimizar datos personales en cada respuesta. Revisar especialmente `dni`, teléfono, dirección/contacto y emails.
- No devolver notas no publicadas como oficiales ni construir datos académicos por estimación local.
- Registrar auditoría de operaciones de escritura solo cuando estén aprobadas; nunca guardar tokens completos o credenciales en logs.
- Configurar CORS por origen, límites de petición, TLS, protección ante abuso y manejo de errores sin filtrar stack traces.
- No colocar credenciales MySQL, claves privadas o secretos de servicio en el frontend. `VITE_*` se incorpora al bundle y no es secreto.
- Para campos personales de muestra, utilizar datos sintéticos reservados para documentación, por ejemplo `example.invalid`; no publicar datos reales en mocks.

## 10. Decisiones que debe confirmar el equipo

1. Confirmar autenticación central, formato de sesión/token y endpoint de identidad.
2. Aprobar nombres/rutas canónicas y si se mantiene alias temporal para las rutas actuales `/student/...`.
3. Confirmar período/ciclo lectivo resuelto por defecto y filtros aceptados.
4. Definir privacidad para DNI, teléfono, emails institucionales y datos de comisión.
5. Confirmar qué servicio es fuente de verdad para materias, asistencia, notas, agenda, comunidad e historial.
6. Mantener read-only como MVP o aprobar formalmente cada mutación del apartado 8.
7. Acordar semántica de estados, paginación, zonas horarias y formato de error.
8. Publicar el contrato aprobado en OpenAPI y entregar URL base por ambiente. La URL de ejemplo actual no se debe considerar operativa hasta verificarla.

## 11. Plan de integración

1. Acordar las decisiones de la sección 10 con los responsables de Autenticación, Administración/Cursadas, Asistencia/Preceptoría y Docentes.
2. Implementar primero autenticación de sesión e endpoints de lectura del MVP.
3. Actualizar `src/lib/apiClient.ts` y los servicios para usar la base y rutas aprobadas; validar respuestas en la frontera de API.
4. Usar TanStack Query para estados de carga, error y revalidación. En cambios de sesión, limpiar la caché de datos privados.
5. Ejecutar la integración con `VITE_USE_MOCK=false` únicamente contra un ambiente autorizado y con datos de prueba.
6. Habilitar las mutaciones fuera de alcance solo tras aprobación y contrato independiente.

**Conclusión:** el nuevo módulo amplía la capa de servicios y define DTOs más ricos que el frontend anterior, pero no confirma que haya backend conectado. Este contrato fija una propuesta compatible con el código actual, conserva el MVP de lectura y deja las mutaciones simuladas explícitamente pendientes de aprobación.
