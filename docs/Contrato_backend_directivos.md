# Informe técnico para el contrato backend — Módulo Directivo (ISFDyT N.° 26)

**Estado:** base de análisis para acordar el contrato de integración; la API actual es demostrativa y no constituye todavía un backend institucional de producción.  
**Frontend analizado:** `directivos-jesica-agustin/app/`  
**Tecnologías:** React 19, TypeScript, Vite y servidor Express para desarrollo/demostración.  
**Fecha de revisión:** 17 de octubre de 2026.  

---

## 1. Objetivo y alcance

Este documento describe las pantallas, datos y operaciones del **Módulo Directivo** y propone el contrato HTTP necesario para integrarlo con los módulos de Alumnos, Preceptoría y Profesorado. Separa las rutas que existen en el servidor demostrativo de las rutas que todavía deben acordarse o implementarse.

La especificación de tipos que sirve como fuente principal está en `directivos-jesica-agustin/app/src/contracts/apiContract.ts`. El catálogo navegable de ejemplos se encuentra en `directivos-jesica-agustin/app/src/contracts/endpointsCatalog.ts`. Este documento traslada y amplía esa información para su revisión intermodular; no reemplaza esos archivos ni declara aprobada una arquitectura institucional.

Se propone el prefijo `/api/v1`, ya utilizado por el prototipo. La elección de backend común, servicios separados, base de datos, autenticación y fuente oficial de cada dato debe acordarse con el equipo antes de una integración de producción.

## 2. Qué está implementado en el frontend

El módulo contempla las siguientes áreas de gestión:

| Sección | Información y acciones previstas |
|---|---|
| Panel directivo | Matrícula, planta docente, divisiones, asistencia, alertas, agenda y actividad reciente. |
| Usuarios y permisos | Consulta, alta, modificación de datos, asignación de roles y estado de acceso. |
| Cursos y divisiones | Consulta y organización por ciclo, año, división, turno, orientación, aula, capacidad y preceptor. |
| Estudiantes y matrícula | Consulta y alta de estudiantes, asignación a curso, datos de tutor y situación académica. |
| Asistencia | Registro diario por división, estados, observaciones y resumen acumulado por estudiante. |
| Rendimiento académico | Registro de calificaciones y consulta de libreta por estudiante, curso, materia y período. |
| Organización y horarios | Asignación de módulos horarios y docentes; calendario de eventos escolares. |
| Circulares y comunicados | Consulta y publicación de avisos para grupos destinatarios. |
| Informes | Consolidado institucional de asistencia; se prevén informes académicos y de matrícula. |
| Auditoría | Consulta de operaciones con usuario, módulo, acción, entidad y valores previos/nuevos cuando corresponda. |
| Configuración | Parámetros institucionales, ciclos lectivos, umbrales de alerta y nota mínima. |

Los modelos principales están definidos en `app/src/types/index.ts`: `User`, `AcademicCycle`, `Course`, `Student`, `Teacher`, `Subject`, `TeacherAssignment`, `AttendanceRecord`, `GradeRecord`, `ScheduleSlot`, `SchoolEvent`, `OfficialNotice`, `AuditLogEntry` e `InstitutionSettings`.

## 3. Estado actual de integración

El repositorio incluye tipos de request/response, un catálogo de ejemplos y rutas de demostración en `app/server.ts`. Conviene distinguir esas piezas:

1. **Contrato tipado:** `apiContract.ts` define las envolturas `ApiResponse<T>` y `ApiErrorResponse`, los códigos de error y tipos de consulta/payload para los diez dominios del módulo.
2. **Catálogo:** `endpointsCatalog.ts` presenta ejemplos de nueve operaciones para la pantalla de contrato. Los ejemplos no cubren todas las lecturas, modificaciones ni recursos declarados por los tipos.
3. **Servidor de demostración:** `server.ts` implementa, entre otras, consultas de usuarios, cursos, estudiantes, comunicados, auditoría y configuración, además de algunas altas. Mantiene los datos en arreglos/objetos en memoria inicializados con fixtures; reiniciar el proceso los restaura.
4. **Estado del frontend:** `AppContext.tsx` inicializa sus entidades desde `mockData.ts` y las persiste en `localStorage`. Las acciones del contexto operan sobre estado local; no consumen las rutas institucionales de `server.ts`.
5. **Autenticación y autorización:** las rutas demostrativas no validan sesión, token ni permisos por operación. El usuario activo de muestra no es una identidad autenticada.
6. **Validación parcial:** algunas rutas del servidor validan campos obligatorios y duplicidad de correo. No todas las reglas de los tipos están comprobadas, y hay rutas que responden con valores fijos de demostración.

Por lo tanto, la existencia de una respuesta HTTP local no significa que los datos estén guardados en una base persistente, que la identidad esté validada o que un permiso se aplique en el servidor. El endpoint `/api/v1/spec` publica el catálogo de ejemplos; no genera por sí mismo una especificación OpenAPI completa.

### 3.1. Rutas actualmente presentes en `server.ts`

| Método y ruta | Comportamiento observado | Límite de la implementación actual |
|---|---|---|
| `GET /api/v1/spec` | Devuelve datos institucionales y `ENDPOINTS_CATALOG`. | Catálogo JSON parcial; no es un documento OpenAPI. |
| `GET /api/v1/users` | Filtra por `role`, `status` y texto de búsqueda. | Sin autenticación; usa datos en memoria. |
| `POST /api/v1/users` | Valida algunos campos y correo duplicado; agrega un usuario al arreglo. | Sin autorización; no persiste al reiniciar. |
| `GET /api/v1/courses` | Lista cursos por `cycleId`. | Ignora `yearLevel`; no implementa alta/edición. |
| `GET /api/v1/students` | Filtra por ciclo y, opcionalmente, curso. | No aplica todos los filtros tipados. |
| `POST /api/v1/students` | Crea un estudiante de muestra. | Fuerza ciclo 2026 y varios valores; sin autorización ni persistencia. |
| `POST /api/v1/attendance/batch` | Valida la forma básica y devuelve conteos por estado. | No escribe `attendanceDb`, no verifica matrícula completa ni identidad real. |
| `POST /api/v1/grades` | Valida una nota de 1 a 10 y agrega un registro al arreglo. | Sin autenticación/autorización; ciclo y fecha se determinan en el servidor de demostración; no persiste al reiniciar. |
| `GET /api/v1/notices` | Lista comunicados por ciclo. | Sin autenticación; datos en memoria. |
| `POST /api/v1/notices` | Crea un comunicado con autor y fecha de muestra. | Sin autorización; el estado llega del cliente; no persiste al reiniciar. |
| `GET /api/v1/audit` | Devuelve los primeros registros según `limit`. | No filtra por módulo, acción o usuario; sin autorización. |
| `GET /api/v1/settings` | Devuelve la configuración inicial. | No existe ruta de actualización; sin autorización. |

El endpoint de descarga `/api/download-zip` no forma parte del contrato funcional de datos. Tampoco es una API de negocio la integración con Google Drive usada para copias de respaldo.

## 4. Operaciones backend que necesita acordar el módulo

Las rutas siguientes describen el contrato objetivo. Las marcadas como **Demo** aparecen actualmente en `server.ts` con las limitaciones indicadas arriba. Las demás son **Propuestas** derivadas de los tipos y las acciones del módulo; deben revisarse con los responsables de los datos y formalizarse antes de conectarlas.

| Método y ruta | Uso / respuesta principal | Acceso propuesto | Estado |
|---|---|---|---|
| `GET /api/v1/users?role=&status=&search=` | Buscar usuarios y consultar estado/rol. | `DIRECTIVO`, `VICEDIRECTOR`, `SECRETARIA` | Demo |
| `POST /api/v1/users` | Crear usuario con rol, contacto y cursos asignados. | `DIRECTIVO`, `SECRETARIA` | Demo |
| `PATCH /api/v1/users/{userId}` | Modificar datos permitidos, estado o asignaciones. | `DIRECTIVO`; delegación a `SECRETARIA` por acordar | Propuesta |
| `GET /api/v1/courses?cycleId=&yearLevel=` | Consultar divisiones por ciclo y año. | Personal autenticado según necesidad de cada módulo | Demo parcial |
| `POST /api/v1/courses` | Crear una división y asignar preceptor. | `DIRECTIVO`, `VICEDIRECTOR`, `SECRETARIA` por acordar | Propuesta; payload tipado |
| `PATCH /api/v1/courses/{courseId}` | Modificar datos de una división. | `DIRECTIVO`, `VICEDIRECTOR`, `SECRETARIA` por acordar | Propuesta; payload tipado |
| `GET /api/v1/students?courseId=&cycleId=&status=&search=` | Consultar nómina y matrícula. | `DIRECTIVO`, `VICEDIRECTOR`, `SECRETARIA`, `PRECEPTORIA` según dato solicitado | Demo parcial |
| `POST /api/v1/students` | Dar de alta y matricular estudiante. | `DIRECTIVO`, `SECRETARIA` | Demo |
| `PATCH /api/v1/students/{studentId}` | Corregir datos o situación académica autorizada. | `DIRECTIVO`, `SECRETARIA` por acordar | Propuesta; payload tipado |
| `POST /api/v1/attendance/batch` | Registrar el parte diario de una división. | `PRECEPTORIA`; acceso directivo de supervisión por definir | Demo incompleta |
| `GET /api/v1/students/{studentId}/attendance-summary?cycleId=` | Consultar totales, porcentaje y alerta de riesgo. | `DIRECTIVO`, `VICEDIRECTOR`, `SECRETARIA`, `PRECEPTORIA` según alcance | Propuesta; respuesta tipada |
| `POST /api/v1/grades` | Registrar o rectificar una calificación. | `DOCENTE` para su materia; `DIRECTIVO` solo bajo regla institucional aprobada | Demo incompleta |
| `GET /api/v1/students/{studentId}/report-card?cycleId=` | Consultar libreta por ciclo. | `DIRECTIVO`, `SECRETARIA`, `DOCENTE` según permisos; limitar datos | Propuesta; respuesta tipada |
| `GET /api/v1/schedules?cycleId=&courseId=` | Consultar horarios y asignaciones. | `DIRECTIVO`, `VICEDIRECTOR`, `SECRETARIA`, `DOCENTE` según alcance | Propuesta |
| `POST /api/v1/schedules` | Crear módulo horario con materia, docente y aula. | `DIRECTIVO`, `VICEDIRECTOR` | Catálogo solamente |
| `GET /api/v1/events?cycleId=&from=&to=` | Consultar calendario escolar. | Personal autenticado según visibilidad del evento | Propuesta |
| `POST /api/v1/events` | Crear evento institucional. | `DIRECTIVO`, `VICEDIRECTOR`, `SECRETARIA` por acordar | Propuesta; payload tipado |
| `GET /api/v1/notices?cycleId=` | Consultar comunicados visibles para el solicitante. | Personal o destinatarios autorizados | Demo |
| `POST /api/v1/notices` | Crear comunicado y definir destinatarios/publicación. | `DIRECTIVO`, `VICEDIRECTOR` | Demo |
| `PATCH /api/v1/notices/{noticeId}` | Editar, archivar o cambiar estado de un comunicado. | Autor o autoridad habilitada | Propuesta |
| `GET /api/v1/reports/attendance?cycleId=` | Consolidar asistencia por curso y período. | `DIRECTIVO`, `VICEDIRECTOR`, `SECRETARIA` | Catálogo solamente |
| `GET /api/v1/audit?module=&action=&userId=&limit=` | Consultar bitácora con filtros. | `DIRECTIVO`; otros roles por definir | Demo parcial |
| `GET /api/v1/settings` | Consultar parámetros institucionales vigentes. | `DIRECTIVO`, `VICEDIRECTOR`, `SECRETARIA` con campos acotados | Demo |
| `PATCH /api/v1/settings` | Actualizar parámetros institucionales autorizados. | `DIRECTIVO`; delegación explícita si aplica | Propuesta; payload tipado |

`PATCH` se propone para modificaciones parciales; los tipos no fijan el verbo HTTP. Si el equipo elige `PUT`, debe aclarar si el cliente reemplaza el recurso completo. No se propone una operación de borrado físico para usuarios, estudiantes, registros de asistencia o auditoría; los cambios de estado deben conservar trazabilidad e historia.

### 4.1. Envolturas de respuesta y errores

La forma definida por `ApiResponse<T>` es:

```json
{
  "success": true,
  "data": {},
  "timestamp": "2026-10-17T12:00:00.000Z",
  "version": "v1"
}
```

La forma definida por `ApiErrorResponse` es:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El valor informado no es válido.",
    "details": ["La nota debe estar entre 1 y 10."],
    "field": "score"
  },
  "timestamp": "2026-10-17T12:00:00.000Z",
  "version": "v1"
}
```

Códigos incluidos en el tipo: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `RESOURCE_NOT_FOUND`, `SCHEDULE_CONFLICT`, `DUPLICATE_ENTRY`, `CYCLE_LOCKED` e `INTERNAL_SERVER_ERROR`.

Mapeo HTTP recomendado para la API definitiva: `200` lectura/actualización correcta, `201` alta, `400` JSON o parámetros mal formados, `401` sesión faltante/expirada, `403` permiso insuficiente, `404` recurso inexistente o fuera del ámbito visible, `409` duplicado o conflicto de horario/ciclo, `422` datos sintácticamente válidos que incumplen reglas de negocio y `500` error inesperado. El servidor de demostración hoy usa `400` para algunas validaciones y `409` para correo duplicado; conviene normalizarlo con el frontend antes de producción.

### 4.2. Convenciones sugeridas

- JSON en UTF-8 y propiedades `camelCase`, de acuerdo con los tipos TypeScript.
- `Authorization: Bearer <token>` o cookie de sesión `HttpOnly`, según el proveedor institucional que se acuerde. TLS obligatorio fuera del entorno local.
- Fechas civiles como `YYYY-MM-DD`; marcas temporales ISO 8601 con zona horaria explícita. El backend debe generar timestamps de auditoría y publicación.
- IDs estables y uniformes, preferentemente UUID en producción. Los IDs `usr-...`, `std-...` y otros del prototipo son identificadores de demostración.
- Listas paginadas cuando el tamaño pueda crecer; definir el sobre de paginación (`data`, `meta`, cursores) antes de implementar.
- Los ejemplos usan ciclos `2025` y `2026`; el contrato definitivo debe aceptar ciclos configurados, no restringir el sistema a esos dos literales.
- Parámetros de consulta deben validarse y limitarse: por ejemplo `limit` debe tener un máximo, y filtros por texto no deben ampliar el ámbito de acceso.

## 5. DTOs que el frontend espera

Los DTOs deben corresponder a los tipos de `app/src/types/index.ts` y a las interfaces de `app/src/contracts/apiContract.ts`. Los campos opcionales se muestran como tales; la serialización de fechas, nullabilidad y campos protegidos debe definirse de forma uniforme.

### 5.1. Usuario (`User`)

`id`, `name`, `email`, `role`, `dni`, `phone`, `status`, `assignedCourses?`, `lastLogin` y `createdAt`.

Roles definidos: `DIRECTIVO`, `VICEDIRECTOR`, `SECRETARIA`, `PRECEPTORIA`, `DOCENTE` y `ORIENTACION_ESCOLAR`. Estados: `ACTIVO` e `INACTIVO`. El servidor debe derivar la identidad del operador desde la sesión; nunca aceptar `role`, `userId` o identidad de auditoría como prueba de autorización. DNI y teléfono son datos personales: devolverlos solo a roles y pantallas que los necesiten.

### 5.2. Ciclo y curso (`AcademicCycle`, `Course`)

- `AcademicCycle`: `id`, `year`, `status` (`VIGENTE`/`CERRADO`), `startDate`, `endDate`, `description`.
- `Course`: `id`, `cycleId`, `yearLevel`, `division`, `shift`, `orientation`, `preceptorId`, `classroom`, `capacity`.
- Turnos admitidos por el tipo: `MAÑANA`, `TARDE`, `VESPERTINO`.

El backend debe validar que el curso, preceptor y ciclo existan y que la capacidad sea positiva. Los cambios estructurales deben conservar la relación con el ciclo histórico. Si `CYCLE_LOCKED` impide una mutación, la respuesta debe identificar el ciclo y la regla aplicable.

### 5.3. Estudiante y matrícula (`Student`)

El modelo incluye `id`, `legajo`, `dni`, `lastName`, `firstName`, `birthDate`, `tutorName`, `tutorPhone`, `tutorEmail`, `courseId`, `cycleId`, `status`, `address` y `healthAlert?`. Estados: `REGULAR`, `CONDICIONAL`, `EGRESADO` y `PASIVADO`.

La respuesta debe aplicar minimización de datos. Domicilio, DNI, contacto de tutor y alertas de salud requieren autorización específica y no deben incluirse en listados generales si la pantalla no los necesita. La matrícula debe preservar historial por ciclo en vez de sobrescribir la pertenencia anterior.

`CreateStudentRequest` solicita DNI, nombres, nacimiento, curso/ciclo, tutor, teléfono y domicilio; `tutorEmail`, `healthAlert` y estado son opcionales. `UpdateStudentRequest` hace parciales esos campos. La versión final debe definir validación de unicidad de DNI/legajo, formato de fecha, edad y campos obligatorios según normativa institucional.

### 5.4. Asistencia (`AttendanceRecord` y resumen)

`AttendanceRecord`: `id`, `cycleId`, `date`, `studentId`, `courseId`, `status`, `notes?`, `recordedByUserId`. Estados: `PRESENTE`, `AUSENTE_INJUSTIFICADO`, `AUSENTE_JUSTIFICADO` y `TARDANZA`.

`SaveBatchAttendanceRequest` contiene `cycleId`, `courseId`, `date` (`YYYY-MM-DD`) y `records[]` (`studentId`, `status`, `notes?`). `SaveBatchAttendanceResponse` devuelve `processedCount`, conteos por estado, `recordedByUserId` y `updatedAt`. `StudentAttendanceSummaryResponse` devuelve `totalRecords`, conteos, `percentAttendance` e `isAtRisk` para el ciclo.

El usuario que registra y el timestamp deben provenir del servidor. El guardado en lote debe ser atómico; validar que cada estudiante pertenezca al curso/ciclo, que no haya duplicados en el lote y que la matrícula requerida esté cubierta. Definir la política de correcciones, duplicidad de parte para curso/fecha y cierre de ciclos.

### 5.5. Rendimiento y libreta (`GradeRecord`, `StudentReportCardResponse`)

`GradeRecord` contiene `id`, `cycleId`, `period`, `studentId`, `courseId`, `subjectId`, `score`, `isApproved`, `teacherNotes?` y `date`. Períodos: `1_TRIMESTRE`, `2_TRIMESTRE`, `3_TRIMESTRE` y `DICIEMBRE_FEBRERO`. La escala tipada es de 1 a 10.

`SaveGradeRequest`: `cycleId`, `period`, estudiante, curso, materia, `score` y `teacherNotes?`. `StudentReportCardResponse` agrupa estudiante, curso, ciclo y materias con calificaciones parciales, promedio final e indicador de aprobación. Acordar quién puede ingresar/rectificar cada nota; `DIRECTIVO` no debe reemplazar la responsabilidad del docente sin una regla institucional explícita. Registrar toda rectificación en auditoría.

### 5.6. Horarios y eventos (`ScheduleSlot`, `SchoolEvent`)

- `ScheduleSlot`: ciclo, curso, día (`1` lunes a `5` viernes), módulo, horas de inicio/fin, materia, docente y aula.
- `CreateScheduleSlotRequest` contiene esos campos; días aceptados de lunes a viernes.
- `SchoolEvent`: ciclo, fecha, título, tipo, descripción e indicador obligatorio.
- Tipos: `ACTO_ESCOLAR`, `JORNADA_INSTITUCIONAL`, `MESA_EXAMEN`, `CIERRE_NOTAS`, `FERIADO` y `REUNION_PADRES`.

Validar rangos horarios, pertenencia de docentes/materias al ciclo y conflictos de aula o docente. Para conflictos usar `SCHEDULE_CONFLICT` y detallar el registro en conflicto sin revelar datos no autorizados.

### 5.7. Comunicados (`OfficialNotice`)

Campos: `id`, `cycleId`, `title`, `content`, `category`, `recipients`, `status`, `publishDate`, `authorName`, `authorRole`, `readCount` e `isPinned`.

Categorías: `URGENTE`, `INSTITUCIONAL`, `PEDAGOGICO`, `ACADEMICO`; destinatarios: `TODOS`, `DOCENTES`, `PRECEPTORES`, `FAMILIAS`; estados: `BORRADOR`, `PUBLICADO`, `VENCIDO`, `ARCHIVADO`. El backend debe derivar autor/fecha, validar transición de estados y calcular lecturas en servidor. No permitir que un cliente se atribuya un autor o publique a grupos fuera de su permiso.

### 5.8. Informes, auditoría y configuración

- `AttendanceReportResponse`: ciclo, cursos con matrícula y conteos por estado, tasa por curso, tasa global y `generatedAt`.
- `AuditLogEntry`: timestamp, usuario y rol, módulo, acción, entidad, ID, detalle y valores previos/nuevos opcionales. Acciones tipadas: `CREACION`, `MODIFICACION`, `CAMBIO_ESTADO`, `ELIMINACION_CONTROLADA`, `CONFIGURACION`, `EXPORTACION`, `CAMBIO_CICLO`.
- `InstitutionSettings`: nombre, número escolar, CUE, distrito, región, domicilio, teléfono, correo, autoridades, umbral porcentual de alertas, umbral de ausencias consecutivas, nota mínima, escala y ciclo activo.

Los informes deben usar las mismas reglas de cálculo que las pantallas. La auditoría no debe modificarse o borrarse desde el cliente. La configuración se debe actualizar parcialmente y validar límites de negocio; los cambios de CUE, ciclo activo o escala requieren control/auditoría reforzados.

## 6. Mutaciones visibles y decisiones funcionales pendientes

1. **Permisos de Directivo:** definir qué puede ejecutar el rol `DIRECTIVO` directamente y qué acciones corresponden a `SECRETARIA`, `PRECEPTORIA` o `DOCENTE`. La UI y los ejemplos actuales habilitan algunas escrituras para Directivo, pero el alcance institucional debe aprobarse por operación.
2. **Alta de roles:** determinar quién puede asignar o cambiar roles privilegiados, cómo se verifica el correo institucional y si una cuenta nueva comienza `INACTIVO`/pendiente hasta activación.
3. **Matrícula y datos sensibles:** definir responsables de escritura y campos visibles para Dirección. Alertas de salud, DNI, domicilio y datos de tutores necesitan controles de campo y auditoría.
4. **Asistencia en lote:** acordar cobertura obligatoria de la nómina, edición posterior, motivo, ventana de corrección, unicidad curso/fecha y casos de asistencia justificada.
5. **Notas:** acordar el rol que carga, publica y rectifica notas; preservar valor anterior, autor, motivo y fecha de cada rectificación.
6. **Calendario y horarios:** definir reglas de conflictos, responsables de asignaciones y si los eventos se publican a toda la comunidad o a grupos seleccionados.
7. **Comunicados:** definir alcance de destinatarios, vigencia, lectura confirmada, transiciones de estado y política de edición/archivo.
8. **Informes:** especificar filtros, zona horaria, momento de corte, fórmulas, paginación y si las exportaciones contienen datos personales.
9. **Configuración y ciclos cerrados:** definir el alcance de `CYCLE_LOCKED`, quién puede reabrir un ciclo y el proceso de aprobación.
10. **Errores:** cerrar la diferencia entre respuestas de demo (`400`, `409`) y los códigos tipados; decidir si la validación de negocio usa `422` y normalizar mensajes por campo.
11. **Persistencia:** elegir base de datos/fuente de verdad y resolver la discrepancia entre `localStorage`, arreglos en memoria y datos compartidos entre módulos.

## 7. Requisitos que debe cubrir el backend

- Validar sesión y permisos en **cada** ruta; no considerar suficiente ocultar botones en el frontend.
- Derivar identidad, `recordedByUserId`, autor de comunicado, rol efectivo y timestamps a partir del contexto autenticado del servidor.
- Aplicar autorización por recurso/relación: por ejemplo, comprobar que estudiante, curso, ciclo, materia y docente estén vinculados antes de devolver o cambiar datos.
- Proteger los datos personales con mínimo privilegio, filtros por campo y trazabilidad de consultas/exportaciones sensibles cuando corresponda.
- Ejecutar transaccionalmente operaciones de lote y cambios relacionados; devolver errores sin dejar escrituras parciales.
- Validar enums, campos obligatorios, unicidad, rangos numéricos/horarios, ciclos, destinatarios, límites de consulta y transiciones de estado.
- Usar almacenamiento persistente institucional y copias de seguridad; no depender de memoria del proceso ni del almacenamiento del navegador para registros oficiales.
- Auditar altas, cambios de roles, matrícula, asistencia, notas, configuración, comunicados y exportaciones. La auditoría debe ser append-only para el cliente.
- Aplicar HTTPS, CORS limitado a los orígenes aprobados, límites de frecuencia/tamaño y consultas parametrizadas. No incluir claves privadas o credenciales de base de datos en el frontend.
- Mantener una fuente de verdad por entidad y acordar responsabilidades con Preceptoría, Docentes, Secretaría y módulo Alumno para evitar escrituras contradictorias.

## 8. Secuencia recomendada de integración

1. Acordar arquitectura, proveedor de identidad, roles, permisos, fuentes de verdad, IDs, ciclos y política de datos personales con los responsables intermodulares.
2. Publicar el contrato acordado en una especificación común (por ejemplo OpenAPI) y alinear `apiContract.ts`, `endpointsCatalog.ts` y este documento para que no existan rutas contradictorias.
3. Implementar primero lecturas autenticadas de identidad, cursos, matrícula, asistencia, calificaciones, calendario, comunicados, informes, auditoría y configuración según el MVP acordado.
4. Implementar mutaciones con validación de servidor, autorización por recurso, transacciones, auditoría e idempotencia donde corresponda.
5. Sustituir el estado mock/local de `AppContext.tsx` por una capa de cliente HTTP configurable por ambiente; retirar escrituras de datos oficiales en `localStorage`.
6. Normalizar envolturas, errores, fechas, paginación y límites entre frontend y backend; distinguir errores de autorización, validación y conflicto.
7. Validar los flujos integrados por rol y verificar que los cambios de Preceptoría/Docentes se reflejen en consultas y reportes directivos sin duplicar datos.

## 9. Archivos consultados del proyecto

- `directivos-jesica-agustin/app/src/contracts/apiContract.ts`
- `directivos-jesica-agustin/app/src/contracts/endpointsCatalog.ts`
- `directivos-jesica-agustin/app/src/types/index.ts`
- `directivos-jesica-agustin/app/src/context/AppContext.tsx`
- `directivos-jesica-agustin/app/src/data/mockData.ts`
- `directivos-jesica-agustin/app/src/components/views/BackendContractView.tsx`
- `directivos-jesica-agustin/app/server.ts`
- `directivos-jesica-agustin/app/README.md`
- `docs/CONTRATO_BACKEND.md`
- `docs/Contrato_backend_alumno_julian.md`
- `docs/nico-contrato-backend-profesores.md`

---

## Conclusión

El Módulo Directivo cuenta con modelos tipados, un catálogo de rutas y un servidor de demostración que permite explorar operaciones. La aplicación actual sigue usando datos de prueba y persistencia local; el servidor mantiene algunos registros en memoria y carece de autenticación y autorización. Por eso, este documento trata las rutas como propuesta de integración, identifica las operaciones existentes solo en la demostración y deja explícitas las decisiones pendientes antes de usarlas con información institucional.

La prioridad es acordar permisos, fuentes de datos y persistencia con los otros roles, y después convertir el catálogo parcial en un contrato común versionado. El archivo TypeScript existente se conserva como parte del código; este `.md` centraliza el análisis de backend en `docs/` junto a los contratos del resto de los módulos.
