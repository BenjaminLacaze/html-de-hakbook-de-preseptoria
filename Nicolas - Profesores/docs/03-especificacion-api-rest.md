# 03 — Especificación de API REST del Módulo Profesor

> **Versión del contrato:** 0.1.0 (Propuesta inicial)  
> **Fecha de redacción:** 2026-10-16  
> **Estado:** Propuesta técnica — pendiente de revisión grupal  
> **Fuente de evidencia:** Métodos de `src/services/academicService.ts` y tipos de `src/types/index.ts`

---

## 1. Convenciones Generales de la API

- **Protocolo y Formato:** HTTPS, transferencias exclusivamente en `application/json; charset=utf-8`.
- **Prefijo base:** `/api/v1`
- **Autenticación:** Cabecera estándar HTTP `Authorization: Bearer <token_jwt>`. La identidad del docente emisor se resuelve en el servidor a partir del token.
- **Nomenclatura JSON:** `camelCase` para compatibilidad transparente con TypeScript (`src/types/index.ts`).
- **Fechas y Horas:**
  - Fechas simples de calendario: formato ISO 8601 extendido `YYYY-MM-DD` (ej. `2026-04-06`).
  - Timestamps con hora y huso: formato ISO 8601 UTC `YYYY-MM-DDTHH:mm:ssZ` o con offset `-03:00` (ej. `2026-04-06T14:15:00-03:00`).

---

## 2. Estructura Estándar de Respuestas

### 2.1. Respuesta Exitosa Unificada
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación completada exitosamente."
}
```

### 2.2. Respuesta de Error Unificada
```json
{
  "success": false,
  "error": {
    "code": "COMMISSION_NOT_FOUND",
    "message": "La comisión solicitada no existe o no se encuentra asignada al docente.",
    "details": []
  }
}
```

### 2.3. Códigos de Estado HTTP Principales
- `200 OK`: Consulta o actualización exitosa.
- `201 Created`: Creación de recurso completada.
- `400 Bad Request`: Parámetros inválidos o violación de formato de payload.
- `401 Unauthorized`: Token no provisto, inválido o expirado.
- `403 Forbidden`: El recurso existe pero el docente no tiene permisos de cátedra.
- `404 Not Found`: Recurso no encontrado.
- `409 Conflict`: Conflicto de estado o regla de negocio (ej. sesión ya cerrada).
- `422 Unprocessable Entity`: Error de validación semántica (ej. faltan estudiantes por calificar).
- `500 Internal Server Error`: Falla interna no controlada en el backend.

---

## 3. Matriz de Endpoints Requeridos

| Método | Endpoint | Descripción | Método Frontend Origen |
|---|---|---|---|
| `GET` | `/api/v1/teachers/me` | Obtiene el perfil del docente autenticado | `academicService.getCurrentTeacher()` |
| `GET` | `/api/v1/commissions` | Lista las comisiones asignadas al docente | `academicService.getCommissions()` |
| `GET` | `/api/v1/commissions/{id}` | Obtiene el detalle de una comisión específica | `academicService.getCommissionById()` |
| `GET` | `/api/v1/commissions/{id}/students` | Nómina de estudiantes matriculados | `academicService.getStudentsByCommission()` |
| `GET` | `/api/v1/commissions/{id}/sessions` | Historial de sesiones / clases | `academicService.getClassSessions()` |
| `POST` | `/api/v1/commissions/{id}/sessions` | Abre o crea una instancia de clase | `academicService.createOrOpenClassSession()` |
| `GET` | `/api/v1/sessions/{id}/attendance` | Consulta registros de asistencia de una clase | `academicService.getAttendanceBySession()` |
| `PUT` | `/api/v1/sessions/{id}/attendance` | Guarda/confirma la asistencia completa | `academicService.saveAttendance()` |
| `GET` | `/api/v1/observations` | Consulta historial de observaciones | `academicService.getObservations()` |
| `POST` | `/api/v1/observations` | Registra una nueva observación pedagógica | `academicService.createObservation()` |

---

## 4. Especificación Detallada de Endpoints

### 4.1. Perfil del Docente Autenticado

#### `GET /api/v1/teachers/me`
Obtiene los datos institucionales del docente en sesión.

- **Headers:** `Authorization: Bearer <token>`
- **Códigos:** `200 OK`, `401 Unauthorized`

##### Respuesta 200 OK:
```json
{
  "success": true,
  "data": {
    "id": "tch-8492",
    "legajo": "DOC-8492",
    "name": "Prof. Lic. Martín Soler",
    "title": "Profesor en Matemática y Especialista en Didáctica Superior",
    "email": "martin.soler@isfdyt26.edu.ar",
    "department": "Departamento de Formación Docente y Ciencias Exactas",
    "avatarUrl": null
  }
}
```

---

### 4.2. Comisiones

#### `GET /api/v1/commissions`
Obtiene las comisiones activas asignadas a la cátedra del docente autenticado.

- **Query Parameters:**
  - `academicYear` *(opcional, string)*: Ciclo lectivo (ej. `2026`).
- **Códigos:** `200 OK`, `401 Unauthorized`

##### Respuesta 200 OK:
```json
{
  "success": true,
  "data": [
    {
      "id": "com-mat-101",
      "code": "MAT-101-TT",
      "name": "1° A - Turno Tarde",
      "subjectId": "sub-mat-pd1",
      "subjectName": "Práctica Docente I: Contexto y Escenarios Educativos",
      "careerName": "Profesorado de Educación Secundaria en Matemática",
      "academicYear": "Ciclo Lectivo 2026 - 1° Cuatrimestre",
      "shift": "Tarde",
      "schedule": "Lunes y Miércoles 14:00 - 17:30 hs",
      "classroom": "Aula 4 (Sede Central)",
      "teacherId": "tch-8492",
      "studentCount": 18
    }
  ]
}
```

#### `GET /api/v1/commissions/{id}`
Obtiene el detalle de una comisión específica.

- **Path Parameters:**
  - `id` *(requerido, string)*: Identificador de la comisión.
- **Códigos:** `200 OK`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

---

### 4.3. Estudiantes por Comisión

#### `GET /api/v1/commissions/{id}/students`
Recupera la nómina completa de estudiantes inscriptos en la comisión con filtros opcionales.

- **Path Parameters:**
  - `id` *(requerido, string)*: Identificador de la comisión.
- **Query Parameters:**
  - `searchQuery` *(opcional, string)*: Filtro por apellido, nombre, legajo o DNI.
  - `status` *(opcional, string)*: `REGULAR`, `LIBRE`, `PROMOCIONADO` o `TODOS`.
  - `sortBy` *(opcional, string)*: `name` | `legajo` (default: `name`).
  - `sortOrder` *(opcional, string)*: `asc` | `desc` (default: `asc`).
- **Códigos:** `200 OK`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

##### Respuesta 200 OK:
```json
{
  "success": true,
  "data": [
    {
      "id": "est-101",
      "legajo": "EST-2026-0014",
      "dni": "44.821.902",
      "lastName": "Álvarez",
      "firstName": "Camila Belén",
      "email": "c.alvarez.fic@isfdyt26.edu.ar",
      "commissionId": "com-mat-101",
      "status": "REGULAR",
      "enrollmentDate": "2026-03-01"
    }
  ]
}
```

---

### 4.4. Instancias de Clase (Sesiones)

#### `GET /api/v1/commissions/{id}/sessions`
Recupera el listado de sesiones de clase registradas para la comisión, ordenadas descendentemente por fecha.

- **Path Parameters:**
  - `id` *(requerido, string)*: Identificador de la comisión.
- **Códigos:** `200 OK`, `401 Unauthorized`, `403 Forbidden`

##### Respuesta 200 OK:
```json
{
  "success": true,
  "data": [
    {
      "id": "ses-101-01",
      "commissionId": "com-mat-101",
      "date": "2026-04-06",
      "topic": "Presentación del programa formativo y aproximación a la institución escolar",
      "isClosed": true,
      "registeredCount": 18
    }
  ]
}
```

#### `POST /api/v1/commissions/{id}/sessions`
Abre una nueva instancia de clase para una fecha determinada, o retorna la existente si ya fue creada para esa misma fecha (idempotente).

- **Path Parameters:**
  - `id` *(requerido, string)*: Identificador de la comisión.
- **Request Body:**
```json
{
  "date": "2026-04-20",
  "topic": "Análisis de dimensiones institucionales y dinámicas de aula"
}
```
- **Códigos:** `200 OK` (si ya existía), `201 Created` (si es nueva), `400 Bad Request`, `403 Forbidden`

##### Respuesta 201 Created:
```json
{
  "success": true,
  "data": {
    "id": "ses-101-03",
    "commissionId": "com-mat-101",
    "date": "2026-04-20",
    "topic": "Análisis de dimensiones institucionales y dinámicas de aula",
    "isClosed": false,
    "registeredCount": 0
  },
  "message": "Instancia de clase habilitada para toma de asistencia."
}
```

---

### 4.5. Registro y Consulta de Asistencia

#### `GET /api/v1/sessions/{id}/attendance`
Obtiene los registros de asistencia vigentes para una sesión de clase dada.

- **Path Parameters:**
  - `id` *(requerido, string)*: Identificador de la sesión de clase.
- **Códigos:** `200 OK`, `401 Unauthorized`, `404 Not Found`

##### Respuesta 200 OK:
```json
{
  "success": true,
  "data": [
    {
      "id": "att-101-01",
      "classSessionId": "ses-101-01",
      "studentId": "est-101",
      "status": "PRESENTE",
      "recordedAt": "2026-04-06 14:15",
      "recordedByTeacherId": "tch-8492"
    }
  ]
}
```

#### `PUT /api/v1/sessions/{id}/attendance`
Guarda y consolida el registro de asistencia de todos los estudiantes de la comisión para la sesión especificada. Reemplaza cualquier registro previo de esa sesión de forma atómica.

- **Path Parameters:**
  - `id` *(requerido, string)*: Identificador de la sesión de clase.
- **Request Body:**
```json
{
  "records": [
    { "studentId": "est-101", "status": "PRESENTE" },
    { "studentId": "est-102", "status": "PRESENTE" },
    { "studentId": "est-103", "status": "TARDE" },
    { "studentId": "est-104", "status": "AUSENTE" }
  ]
}
```
- **Reglas de Validación del Backend:**
  1. La cantidad de registros enviados debe coincidir exactamente con la nómina de estudiantes matriculados en la comisión (no se admiten alumnos sin estado).
  2. Cada `status` debe ser uno de: `'PRESENTE'`, `'AUSENTE'`, `'TARDE'`.
  3. No se permiten `studentId` duplicados en el arreglo.
- **Códigos:**
  - `200 OK`: Asistencia guardada y sesión marcada como cerrada (`isClosed: true`).
  - `400 Bad Request`: Formato de body inválido o estados desconocidos.
  - `403 Forbidden`: La sesión pertenece a una comisión no asignada al docente.
  - `422 Unprocessable Entity`: Faltan calificar estudiantes requeridos o existen estudiantes ajenos a la comisión.

##### Respuesta 200 OK:
```json
{
  "success": true,
  "data": {
    "sessionId": "ses-101-01",
    "savedCount": 18,
    "isClosed": true
  },
  "message": "Asistencia guardada exitosamente para 18 estudiantes."
}
```

---

### 4.6. Observaciones Académicas Cualitativas

#### `GET /api/v1/observations`
Obtiene las observaciones pedagógicas registradas, con ordenamiento cronológico inverso (`createdAt DESC`).

- **Query Parameters:**
  - `commissionId` *(opcional, string)*: Filtrar por comisión (o `TODAS`).
  - `studentId` *(opcional, string)*: Filtrar por estudiante (o `TODOS`).
  - `searchQuery` *(opcional, string)*: Filtro de texto libre (búsqueda sobre contenido, nombre del estudiante, categoría o nombre de comisión).
- **Códigos:** `200 OK`, `401 Unauthorized`

##### Respuesta 200 OK:
```json
{
  "success": true,
  "data": [
    {
      "id": "obs-001",
      "commissionId": "com-mat-101",
      "commissionName": "1° A - Turno Tarde (Práctica Docente I)",
      "studentId": "est-101",
      "studentName": "Álvarez, Camila Belén",
      "studentLegajo": "EST-2026-0014",
      "pedagogicalDate": "2026-04-06",
      "createdAt": "2026-04-07 09:20",
      "content": "Participación muy activa en el debate sobre la primera visita a la escuela asociada. Demuestra excelente capacidad de articulación teórica con las categorías de observación trabajadas en el taller.",
      "category": "Seguimiento pedagógico",
      "teacherId": "tch-8492"
    }
  ]
}
```

#### `POST /api/v1/observations`
Registra una nueva observación académica pedagógica cualitativa.

- **Request Body:**
```json
{
  "commissionId": "com-mat-101",
  "commissionName": "1° A - Turno Tarde (Práctica Docente I)",
  "studentId": "est-101",
  "studentName": "Álvarez, Camila Belén",
  "studentLegajo": "EST-2026-0014",
  "pedagogicalDate": "2026-04-18",
  "category": "Seguimiento pedagógico",
  "content": "El estudiante demostró gran solvencia en la entrega de su informe preliminar de observación áulica."
}
```
- **Reglas de Validación del Backend:**
  - `commissionId`: Obligatorio, perteneciente al docente.
  - `studentId`: Obligatorio, matriculado en la comisión.
  - `pedagogicalDate`: Obligatorio, formato `YYYY-MM-DD`, no puede ser posterior a la fecha actual (`pedagogicalDate <= hoy`).
  - `category`: Debe ser uno de `'Seguimiento pedagógico'`, `'Participación y desempeño'`, `'Adecuación / Apoyo'`, `'General'`.
  - `content`: Obligatorio, string no vacío, mínimo 15 caracteres.
- **Comportamiento del Servidor:**
  - Genera el `id` (ej. UUID).
  - Fija `createdAt` con la fecha y hora de auditoría del servidor (`now()`).
  - Asigna `teacherId` desde el token de autenticación del docente.
- **Códigos:** `201 Created`, `400 Bad Request`, `403 Forbidden`, `422 Unprocessable Entity`

##### Respuesta 201 Created:
```json
{
  "success": true,
  "data": {
    "id": "obs-1792198000000",
    "commissionId": "com-mat-101",
    "commissionName": "1° A - Turno Tarde (Práctica Docente I)",
    "studentId": "est-101",
    "studentName": "Álvarez, Camila Belén",
    "studentLegajo": "EST-2026-0014",
    "pedagogicalDate": "2026-04-18",
    "createdAt": "2026-04-18 10:45",
    "category": "Seguimiento pedagógico",
    "content": "El estudiante demostró gran solvencia en la entrega de su informe preliminar de observación áulica.",
    "teacherId": "tch-8492"
  },
  "message": "Observación cualitativa registrada correctamente."
}
```
