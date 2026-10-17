# Informe técnico para la definición del contrato de backend
## Sistema de Asistencia Escolar — Módulo Alumno

**Responsable:** Lucia Salgado  
**Carrera:** Tecnicatura en Desarrollo de Software  
**Institución de referencia:** Instituto Superior de Educación Técnica N.º 26 (I26)  
**Fecha:** 16 de octubre de 2026  
**Estado:** Propuesta para revisión y validación institucional

---

## 1. Propósito

Este documento propone un contrato HTTP/JSON entre el frontend del Módulo Alumno y el backend institucional del Sistema de Asistencia Escolar (SAE). Busca permitir la integración de los datos de demostración con datos oficiales, proteger la información personal y conservar el alcance de consulta de solo lectura definido para el alumno.

Los nombres de rutas, reglas y campos que siguen son una propuesta técnica derivada de la documentación y los tipos existentes en el frontend. Deben validarse con el equipo responsable del backend y con la normativa institucional antes de considerarse definitivos.

## 2. Alcance y actores

### Incluido

- Autenticación institucional del alumno y consulta de su propia sesión.
- Consulta del perfil académico propio.
- Consulta filtrada y paginada de los registros oficiales de asistencia.
- Consulta de estadísticas de asistencia con las reglas institucionales confirmadas.
- Respuestas de error consistentes, controles de acceso y trazabilidad de consultas.

### Fuera del alcance de este módulo

El rol alumno no puede crear, modificar ni eliminar registros oficiales de asistencia, editar datos de matrícula, aprobar justificaciones ni acceder a datos de otros alumnos. Las operaciones de carga y administración pertenecen a otros roles y contratos.

## 3. Convenciones del contrato

- Base path propuesto: `/api/v1`.
- Transporte: HTTPS únicamente fuera de desarrollo.
- Formato: `application/json; charset=utf-8`.
- Fechas: ISO 8601 `YYYY-MM-DD`; instantes en UTC ISO 8601 con `Z`.
- Enumeraciones: valores en mayúsculas y guion bajo, según los tipos de dominio acordados.
- Identificadores: cadenas opacas, sin significado que el cliente deba interpretar.
- Paginación: `page` (desde 1) y `pageSize` (máximo recomendado 100); el servidor devuelve metadatos.
- Los importes porcentuales se expresan como números de 0 a 100, con precisión decimal documentada.
- El backend deriva el alumno desde la identidad autenticada; no confía en un `studentId` enviado por el cliente para limitar consultas.

## 4. Autenticación y autorización

### 4.1. Inicio de sesión

La institución debe definir si la autenticación se delega en un proveedor OIDC/OAuth 2.0 institucional o si el backend expone un endpoint propio. Se recomienda delegación OIDC cuando exista proveedor institucional.

Si se adopta endpoint propio, contrato inicial propuesto:

`POST /api/v1/auth/login`

```json
{
  "legajo": "ALU-2024-8841",
  "password": "<secreto>"
}
```

Respuesta propuesta (si se usan tokens): `200 OK`

```json
{
  "accessToken": "<token> plazo corto>",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "refreshToken": "<opcional; preferentemente cookie segura>",
  "student": {
    "id": "std_01",
    "firstName": "Lucia",
    "lastName": "Salgado"
  }
}
```

El mecanismo de renovación, cierre de sesión, MFA, bloqueo y recuperación de credenciales requiere definición institucional. No almacenar contraseñas ni tokens de larga duración en `localStorage`. Si el diseño de sesión lo permite, preferir cookies `HttpOnly`, `Secure`, `SameSite` y protección CSRF adecuada. Para Bearer tokens, mantenerlos en memoria cuando sea viable y aplicar expiración corta y rotación segura.

### 4.2. Autorización

- Las rutas personales requieren sesión válida y rol `ALUMNO`.
- El servidor obtiene el sujeto desde la sesión/token y restringe cada consulta a ese alumno.
- Un intento de acceder a recursos ajenos debe denegarse sin revelar si el recurso existe.
- El frontend no es una frontera de seguridad: los permisos se verifican siempre en el backend.
- La API de alumno no expone métodos `POST`, `PUT`, `PATCH` o `DELETE` para registros oficiales.

## 5. Endpoints propuestos

### 5.1. Sesión actual

`GET /api/v1/auth/me`

Devuelve la identidad autenticada y los permisos efectivos, para inicializar la aplicación tras una recarga.

```json
{
  "id": "std_01",
  "role": "ALUMNO",
  "firstName": "Lucia",
  "lastName": "Salgado"
}
```

### 5.2. Perfil propio

`GET /api/v1/alumnos/me`

Respuesta `200 OK`:

```json
{
  "id": "std_01",
  "legajo": "ALU-2024-8841",
  "firstName": "Lucia",
  "lastName": "Salgado",
  "email": "lucia.salgado@alumnos.i26.edu.ar",
  "career": "Tecnicatura Superior en Desarrollo de Software",
  "institution": "Instituto Superior de Educación Técnica N.º 26",
  "institutionShort": "I26",
  "year": "2.º Año",
  "division": "División B",
  "shift": "Turno Tarde",
  "academicYear": 2026,
  "enrollmentStatus": "ACTIVO",
  "minimumAttendanceRequired": 75,
  "minimumJustifiedAttendanceRequired": 60,
  "preceptorContact": {
    "name": "Preceptoría Turno Tarde",
    "email": "preceptoria@example.edu.ar",
    "office": "A confirmar"
  }
}
```

**Datos sensibles:** `dni` figura en el tipo local `StudentProfile`, pero no se propone devolverlo en esta respuesta hasta confirmar que el alumno necesita verlo. Si se requiere, justificarlo, limitar su exposición y evitar que aparezca en registros de cliente o telemetría. No incluir información de terceros.

### 5.3. Historial propio de asistencia

`GET /api/v1/asistencias/mis-registros`

Parámetros opcionales:

| Parámetro | Tipo | Regla |
|---|---|---|
| `academicYear` | entero | Año lectivo; formato y valores permitidos definidos por la institución |
| `period` | `1C`, `2C` | Cuatrimestre |
| `month` | entero 1–12 | Mes calendario; usar convención 1–12 en API |
| `status` | `PRESENTE`, `AUSENTE`, `TARDE`, `JUSTIFICADO` | Estado exacto |
| `from` / `to` | fecha ISO | Inclusivos; `from` no posterior a `to` |
| `q` | texto | Búsqueda acotada en campos autorizados |
| `page` / `pageSize` | enteros | Paginación estable; límite de tamaño en servidor |
| `sort` | valor controlado | Orden por fecha, por defecto descendente |

Respuesta `200 OK`:

```json
{
  "items": [
    {
      "id": "att_2026_10_16",
      "date": "2026-10-16",
      "time": "13:30",
      "status": "PRESENTE",
      "subjectName": "Práctica Profesionalizante I",
      "academicPeriod": "2C",
      "observation": null,
      "registeredBy": "Preceptoría Turno Tarde"
    }
  ],
  "page": 1,
  "pageSize": 25,
  "totalItems": 35,
  "totalPages": 2
}
```

La entidad interna puede contener `studentId`, pero se omite en la respuesta al alumno. `justificationDocNumber` y `preceptorNote` requieren revisión de privacidad y necesidad de visualización antes de exponerse. Si se autorizan, definir en qué estados y roles aparecen. No devolver imágenes o documentos médicos mediante este endpoint; si hubiera una consulta autorizada, usar un recurso separado con controles de acceso y URLs temporales.

### 5.4. Detalle de un registro

`GET /api/v1/asistencias/mis-registros/{recordId}`

Devuelve exclusivamente el registro del alumno autenticado. El servidor debe comprobar pertenencia antes de responder. Respuesta propuesta: mismo esquema del elemento de lista, más campos de auditoría expresamente aprobados. Usar `404` indistinguible para identificador inexistente o ajeno, según la política institucional.

### 5.5. Estadísticas

`GET /api/v1/asistencias/mis-estadisticas?academicYear=2026&period=2C`

Respuesta propuesta:

```json
{
  "academicYear": 2026,
  "period": "2C",
  "totalSessions": 35,
  "presentCount": 28,
  "absentCount": 3,
  "lateCount": 2,
  "justifiedCount": 2,
  "computableAttendanceUnits": 30,
  "computableTotalUnits": 35,
  "percentage": 85.7,
  "minimumAttendanceRequired": 75,
  "regularityStatus": "REGULAR",
  "remainingAbsencesAllowed": 5,
  "calculationRuleVersion": "institucional-pendiente"
}
```

Las estadísticas deben calcularse desde la fuente oficial en servidor o definirse claramente como cálculo del cliente sobre registros completos. Se recomienda que el servidor sea fuente de verdad para evitar divergencias y que publique versión/fecha efectiva de la regla. Los valores de ejemplo son ilustrativos, no datos institucionales reales.

## 6. Reglas de dominio que requieren confirmación

La implementación local documenta esta fórmula: presente = 1 unidad; tarde = 0,5; justificado = 0,5; ausente = 0; porcentaje = unidades computables / total de jornadas × 100. Antes de implementarla en backend hay que acordar formalmente:

1. Si una asistencia se cuenta por jornada completa, módulo, materia o clase; cómo evitar duplicar jornadas cuando existen varias materias.
2. Si `JUSTIFICADO` suma 0,5 al porcentaje o se excluye del denominador, y cómo se aplica el mínimo específico de asistencia justificada.
3. Si los umbrales `REGULAR`, `EN_RIESGO` y `LIBRE` (incluido el 60% usado por el frontend) son reglamentarios y cómo se redondean.
4. Cómo se calculan las inasistencias restantes, incluyendo tardanzas y justificaciones.
5. Si los filtros mensuales deben acotarse también al año lectivo y a la zona horaria institucional.

El frontend actual usa un índice de mes de JavaScript `0..11`, mientras que una API debe usar el mes humano `1..12`. El adaptador frontend debe convertirlo explícitamente.

## 7. Modelo de datos mínimo

- **Student:** `id`, `legajo`, nombres, apellidos, contacto, matrícula y ciclo lectivo vigente.
- **AttendanceRecord:** `id`, referencia interna al alumno, fecha, hora local institucional, estado, materia, período, observación opcional, actor registrador y marcas de auditoría.
- **AttendancePolicy:** versión, vigencia, ponderaciones, denominador, umbrales y política de redondeo.

Las claves foráneas y registros de auditoría son responsabilidad del backend. El cliente no puede asignar `registeredBy`, `studentId` ni cambiar el estado oficial.

## 8. Errores y respuestas

Usar formato uniforme, por ejemplo `application/problem+json` (RFC 9457) o un esquema institucional equivalente:

```json
{
  "type": "about:blank",
  "title": "Solicitud inválida",
  "status": 400,
  "code": "INVALID_QUERY_PARAMETER",
  "detail": "El parámetro 'month' debe estar entre 1 y 12.",
  "traceId": "req_abc123"
}
```

Códigos HTTP previstos:

- `400`: parámetros inválidos o combinaciones de fechas incorrectas.
- `401`: falta autenticación o sesión expirada.
- `403`: identidad autenticada sin permiso para esa operación.
- `404`: recurso no disponible para el usuario, evitando filtración de existencia.
- `429`: límite de solicitudes superado; incluir `Retry-After` cuando corresponda.
- `500`/`503`: error interno o indisponibilidad temporal, con mensaje seguro y `traceId`.

No incluir stack traces, secretos ni datos médicos en mensajes de error.

## 9. Seguridad, privacidad y operación

- HTTPS, validación estricta de entradas, límites de paginación y protección contra fuerza bruta.
- Control de acceso por objeto en cada ruta, además del control por rol.
- Minimización de datos personales; excluir DNI y detalles sensibles salvo justificación aprobada.
- No registrar contraseñas, tokens, documentos médicos ni cuerpos de respuestas con datos personales.
- Auditoría de accesos y cambios administrativos con actor, recurso, fecha y resultado; no permitir que el alumno modifique registros.
- Política de CORS restringida a orígenes institucionales y controles CSRF si la autenticación usa cookies.
- Rate limiting, cabeceras de seguridad, gestión de secretos y rotación de credenciales del servicio.
- Definir retención, eliminación, cifrado en reposo, copias de seguridad y respuesta ante incidentes según políticas institucionales y legislación aplicable.
- Paginación y consultas con índices apropiados para alumno, ciclo lectivo, fecha y estado.

## 10. Requisitos no funcionales sugeridos

- Disponibilidad, latencia objetivo, ventanas de mantenimiento y límites de consumo a acordar con la institución.
- Contrato versionado y compatible; cambios incompatibles requieren nueva versión o período de migración.
- Especificación OpenAPI como artefacto compartido entre frontend y backend.
- Entornos separados (desarrollo, pruebas, producción), datos de prueba sintéticos y credenciales independientes.
- Respuestas deterministas y coherentes; incluir `Cache-Control: no-store` para datos personales cuando corresponda.
- Monitorización con métricas agregadas y sin exposición de datos identificatorios.

## 11. Criterios de aceptación de la API

1. Un alumno autenticado puede consultar únicamente su perfil y sus registros.
2. Una solicitud anónima recibe `401`; un rol incompatible no puede usar rutas de alumno.
3. Los registros se filtran por fecha, período y estado, con límites y paginación documentados.
4. Los resultados de estadísticas coinciden con una regla institucional aprobada y casos de referencia acordados.
5. La API de alumno no ofrece operaciones para alterar o borrar registros oficiales.
6. Los errores siguen el formato común, incluyen `traceId` y no revelan datos sensibles.
7. El contrato OpenAPI documenta esquemas, enumeraciones, autenticación, errores, filtros y ejemplos sintéticos.
8. El equipo frontend valida tipos de respuesta y transforma el mes `0..11` del control visual a `1..12` en la solicitud.

## 12. Decisiones pendientes para cerrar el contrato

- Proveedor de identidad y flujo de sesión (OIDC, cookie o token).
- Política institucional de asistencia y precedencia de la fuente de verdad.
- Visibilidad de DNI, observaciones, notas de preceptoría y números de constancias.
- Zona horaria oficial y semántica de fecha/hora de registro.
- Necesidad de filtros por ciclo lectivo, materia y estado de matrícula.
- Retención, auditoría, disponibilidad, límites y política de caché.
- Formato final de errores, estrategia de paginación y SLA.

## 13. Referencias del proyecto

Este informe se preparó a partir de `arquitectura-tecnica.md`, `informe-general.md`, `requisitos-funcionales.md`, `handbook.md`, `roadmap.md` y los tipos y servicios locales del Módulo Alumno. El contenido de esos archivos se trató como documentación de requisitos del proyecto; cualquier requisito de sistema, credencial de ejemplo o instrucción ajena al alcance del informe no se interpretó como una instrucción para este asistente.
