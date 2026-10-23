# Informe técnico para el contrato backend — Módulo Profesor (ISFDyT N.° 26)

**Estado:** Base de análisis técnico para acordar el contrato de integración intermodular; prototipo frontend con persistencia local simulada, todavía sin integración HTTP real.  
**Frontend analizado:** `ModuloProfesores` (`c:\Users\Nicolas\Desktop\ModuloProfesores`)  
**Tecnologías:** React 19, TypeScript, Vite, CSS modular institucional.  
**Fecha de revisión:** 16 de octubre de 2026.  

---

## 1. Objetivo y alcance

Este informe técnico describe qué presenta y qué acciones ofrece el frontend del **Módulo Profesor** del Sistema de Gestión Académica (SGA) del ISFDyT N.° 26, qué datos requiere para operar y qué contrato debe exponer el backend institucional para posibilitar su integración con los módulos desarrollados por otros integrantes del equipo (Preceptoría, Secretaría Académica y Autenticación).

Separa de forma explícita el comportamiento interactivo existente en el prototipo de las operaciones REST propuestas: aunque el código posee una capa de servicios estructurada (`src/services/academicService.ts`) con tipado estricto y métodos asíncronos (`async/await`), el servicio gestiona el estado en memoria y `localStorage` del navegador con fines de demostración y evaluación de usabilidad, sin realizar solicitudes de red mediante `fetch` o `axios`.

El código fuente del módulo se aloja en `c:\Users\Nicolas\Desktop\ModuloProfesores\src`. Sus archivos de entrada (`src/main.tsx`, `src/App.tsx`) montan el portal del docente. La documentación técnica detallada se encuentra normalizada en `docs/contrato-backend/`.

---

## 2. Qué está implementado en el frontend

El portal del docente se organiza en cinco áreas funcionales principales:

| Sección | Datos o comportamiento que muestra | Fuente actual |
|---|---|---|
| **Panel Principal (Dashboard)** | Saludo institucional al docente en sesión, 4 indicadores cuantitativos (comisiones, matrícula total, clases registradas, observaciones), accesos rápidos a flujos de trabajo, listado de comisiones asignadas con botones de acción directa, bitácora de actividad reciente y próximas clases programadas. | `MOCK_TEACHER`, métricas calculadas en tiempo real desde `academicService.ts` y almacenamiento local. |
| **Mis Comisiones** | Catálogo de cátedras a cargo del profesor (carrera, materia, año académico, turno, días/horarios, aula física, matrícula activa). Incluye buscador reactivo por texto y filtro desplegable por turno (*Mañana*, *Tarde*, *Vespertino*). Aviso explícito de permisos de solo lectura (no permite crear ni dar de baja comisiones). | `MOCK_COMMISSIONS`, recalculando `studentCount` según la cantidad de alumnos asignados en `mockData.ts`. |
| **Estudiantes por Comisión** | Selector de comisión y nómina de estudiantes matriculados. Visualiza legajo institucional, DNI, apellido y nombre, correo electrónico y condición de cursada (`REGULAR`, `LIBRE`, `PROMOCIONADO`) con *badges* accesibles. Buscador por texto múltiple (nombre, DNI, legajo), filtro por condición académica y ordenamiento bidireccional por nombre o legajo. Acceso directo a redactar observación individual. | `MOCK_STUDENTS` filtrados por `commissionId`. Modificaciones o matrículas son de solo lectura para el profesor. |
| **Toma de Asistencia (Flujo Estricto)** | Flujo en 3 pasos: (1) Selección de comisión, fecha de clase e instancia histórica/nueva con tema desarrollado; (2) Resumen cuantitativo en vivo de estados (*Presentes*, *Ausentes*, *Tarde*, *Sin Registrar*) con botones de acción masiva ("Marcar todos Presentes" y "Limpiar estados"); (3) Planilla de asignación individual. **Regla estricta:** Selección explícita obligatoria (inicia en estado *Pendiente*; no premarca presentes). Modal de confirmación previa que desglosa totales y bloquea el guardado si resta algún estudiante sin calificar. | `MOCK_CLASS_SESSIONS` y `MOCK_ATTENDANCE_RECORDS`. Al confirmar, genera o actualiza la sesión y reemplaza atómicamente los registros en `localStorage`. |
| **Observaciones Académicas** | Formulario para asentar observaciones formativas cualitativas asociadas a una comisión y a un estudiante específico. Exige indicar obligatoriamente la **fecha pedagógica** (cuándo ocurrió el hecho en el aula, independiente del timestamp del sistema), categoría formativa y contenido descriptivo (mínimo 15 caracteres). Panel histórico con filtros por comisión y búsqueda por contenido libre. Sin calificaciones numéricas ni promedios (estrictamente cualitativo). | `MOCK_OBSERVATIONS`. Al confirmar mediante modal, genera el registro con fecha y hora de auditoría y lo inserta en `localStorage`. |
| **Banner Demostrativo** | Notificación superior fija indicando entorno de demostración sin persistencia oficial. Botón de restablecimiento general que limpia `localStorage` y restaura los fixtures de prueba predeterminados. | Componente `DemoBanner.tsx` interactuando con `academicService.resetDemoData()`. |

Los tipos de datos estructurales se ubican en `src/types/index.ts`: `Teacher`, `Career`, `Subject`, `Commission`, `Student`, `ClassSession`, `AttendanceRecord`, `AcademicObservation`, `Shift`, `StudentStatus`, `AttendanceStatus` y `ActiveScreen`. Sus interfaces constituyen la base directa para los DTOs del backend.

---

## 3. Estado actual de integración

El archivo `src/services/academicService.ts` declara métodos asíncronos para todas las operaciones del módulo:
- `getCurrentTeacher()`
- `getCommissions(teacherId?)` y `getCommissionById(commissionId)`
- `getStudentsByCommission(commissionId, filters?)`
- `getClassSessions(commissionId)` y `getClassSessionById(sessionId)`
- `createOrOpenClassSession(commissionId, date, topic?)`
- `getAttendanceBySession(sessionId)`
- `saveAttendance(sessionId, records, teacherId)`
- `getObservations(filters?)`
- `createObservation(data)`
- `resetDemoData()`

En la implementación actual:
1. **Sin transporte de red real:** Ningún método ejecuta llamadas HTTP vía `fetch` o `axios`. No hay URL base configurada, tokens Bearer ni interceptores de respuesta.
2. **Persistencia aislada en el cliente:** Los datos se leen y escriben en `localStorage` bajo claves con prefijo institucional (`sga_26_commissions`, `sga_26_students`, `sga_26_sessions`, `sga_26_attendance`, `sga_26_observations`).
3. **Identidad fija de demostración:** El perfil del profesor es estático (`MOCK_TEACHER`: *Prof. Lic. Martín Soler*, legajo `DOC-8492`). El backend deberá reemplazarlo derivando la identidad desde el token de autenticación.
4. **Reemplazo atómico simulado:** Al confirmar asistencia, el frontend remueve los registros anteriores de esa sesión en `localStorage` y guarda la nómina completa recién enviada.
5. **Auditoría simulada:** Las fechas de auditoría (`createdAt`, `recordedAt`) se calculan con el reloj del navegador cliente (`new Date()`). En producción deben ser generadas exclusivamente por el servidor.

Por lo tanto, la operatividad actual del frontend demuestra la viabilidad de la experiencia de usuario y la lógica de validación visual, pero **no representa transacciones persistentes en base de datos ni comunicación intermodular**.

---

## 4. Operaciones backend que necesita acordar el módulo

La siguiente matriz presenta la propuesta de contrato de API REST versionada (`/api/v1`). Toda operación debe basarse en el contexto del docente autenticado mediante la cabecera `Authorization: Bearer <token>`, sin confiar en identificadores de docente suministrados libremente por el cliente.

| Método y ruta propuesta | Uso en el portal | Respuesta / Datos necesarios | Prioridad |
|---|---|---|---|
| `GET /api/v1/teachers/me` | Encabezado institucional y bienvenida del Dashboard | Objeto `Teacher` con legajo, nombre, título, email institucional, departamento y avatar opcional | **MVP** |
| `GET /api/v1/commissions` | Dashboard, selector global de comisiones, filtros | Arreglo `Commission[]` asignadas al docente autenticado, con nombre de materia, carrera y total de matriculados calculado | **MVP** |
| `GET /api/v1/commissions/{id}` | Ficha de comisión y validación de contexto | Objeto `Commission` detallado con aula, horario, turno y carrera | **MVP** |
| `GET /api/v1/commissions/{id}/students` | Nómina de estudiantes por comisión, filtros y búsqueda | Arreglo `Student[]` con legajo, DNI, nombres, email y condición (`REGULAR`, `LIBRE`, `PROMOCIONADO`) | **MVP** |
| `GET /api/v1/commissions/{id}/sessions` | Selector de clases históricas en Asistencia y Dashboard | Arreglo `ClassSession[]` ordenadas cronológicamente con fecha, tema, estado de cierre y cantidad registrada | **MVP** |
| `POST /api/v1/commissions/{id}/sessions` | Abrir clase para toma de asistencia | Payload `{ date, topic }`. Retorna `ClassSession` creada o existente para esa fecha (idempotente) | **MVP** |
| `GET /api/v1/sessions/{id}/attendance` | Carga de planilla de asistencia guardada previamente | Arreglo `AttendanceRecord[]` con `studentId`, `status` y timestamp | **MVP** |
| `PUT /api/v1/sessions/{id}/attendance` | Guardado y confirmación definitiva de asistencia | Payload `{ records: [{ studentId, status }] }`. Reemplazo atómico. Retorna confirmación y total calificado | **MVP** |
| `GET /api/v1/observations` | Historial de observaciones pedagógicas en el portal | Arreglo `AcademicObservation[]` filtrable por `commissionId`, `studentId` o texto libre. Orden `createdAt DESC` | **MVP** |
| `POST /api/v1/observations` | Registro de nueva observación cualitativa | Payload con `commissionId`, `studentId`, `pedagogicalDate`, `category` y `content`. Genera `id` y `createdAt` en servidor | **MVP** |
| `PUT /api/v1/sessions/{id}/reabrir` | Solicitud de rectificación de asistencia cerrada | Habilitación de edición de planilla con registro de auditoría | **Fase 2 (Acordar política)** |
| `GET /api/v1/commissions/{id}/asistencia/resumen` | Estadísticas agregadas de asistencia de la comisión | Porcentajes de presentismo global y alertas de regularidad | **Fase 2** |

### 4.1. Forma de autenticación y aislamiento
- El frontend consumirá el servicio central de autenticación del SGA. 
- Las peticiones viajarán con cabecera `Authorization: Bearer <token_jwt>` (o cookie `HttpOnly`).
- **Aislamiento estricto:** El backend debe validar que el usuario tenga rol `DOCENTE` y verificar en la tabla de asignaciones que la `commissionId` pertenezca efectivamente al docente autenticado. Si un docente intenta consultar o guardar asistencias de una comisión ajena, el backend debe retornar inmediatamente `403 Forbidden`.
- No se debe autorizar ninguna operación por un `teacherId` recibido en el cuerpo o la URL.

### 4.2. Convenciones sugeridas
- **Formato:** JSON codificado en UTF-8, nomenclatura de propiedades en `camelCase` para compatibilidad transparente con TypeScript.
- **Fechas y horas:** Formato ISO 8601 estricto: fechas de calendario como `YYYY-MM-DD` (ej. `2026-04-06`) y marcas de tiempo completas con huso horario (`2026-04-06T14:15:00-03:00` o UTC `Z`).
- **Identificadores:** Cadenas de caracteres homogéneas (UUID v4 recomendado para producción).
- **Sobre estándar de respuesta:**
  - Éxito: `{ "success": true, "data": { ... }, "message": "..." }`
  - Error: `{ "success": false, "error": { "code": "...", "message": "...", "details": [] } }`
- **Códigos HTTP normalizados:** `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `422 Unprocessable Entity` (para errores de validación de negocio).

---

## 5. DTOs que el frontend espera

Los DTOs deben mapear de forma fidedigna las estructuras declaradas en `src/types/index.ts`:

### 5.1. Perfil del Docente (`Teacher`)
- `id`: string (identificador único del docente).
- `legajo`: string (código de personal, ej. `"DOC-8492"`).
- `name`: string (nombre completo y título de presentación).
- `title`: string (grado académico o especialidad).
- `email`: string (correo institucional).
- `department`: string (área o departamento académico de pertenencia).
- `avatarUrl`: string opcional / nullable.

### 5.2. Comisión (`Commission`)
- `id`: string.
- `code`: string (código identificador de comisión, ej. `"MAT-101-TT"`).
- `name`: string (nombre de la comisión y división, ej. `"1° A - Turno Tarde"`).
- `subjectId`: string (identificador de la materia).
- `subjectName`: string (nombre de la asignatura según plan de estudios).
- `careerName`: string (carrera en la que se dicta).
- `academicYear`: string (ej. `"Ciclo Lectivo 2026 - 1° Cuatrimestre"`).
- `shift`: `'Mañana' | 'Tarde' | 'Vespertino'`.
- `schedule`: string (días y franjas horarias).
- `classroom`: string (espacio físico asignado).
- `teacherId`: string.
- `studentCount`: number (conteo dinámico de matriculados activos).

### 5.3. Estudiante (`Student`)
- `id`: string.
- `legajo`: string (código de matrícula del alumno, ej. `"EST-2026-0014"`).
- `dni`: string (documento de identidad con formato legible).
- `lastName`: string.
- `firstName`: string.
- `email`: string (correo institucional).
- `commissionId`: string.
- `status`: `'REGULAR' | 'LIBRE' | 'PROMOCIONADO'` (condición de cursada administrada por Preceptoría).
- `enrollmentDate`: string (`YYYY-MM-DD`).

### 5.4. Instancia de Clase (`ClassSession`)
- `id`: string.
- `commissionId`: string.
- `date`: string (`YYYY-MM-DD`).
- `topic`: string opcional (tema o contenido abordado).
- `isClosed`: boolean (indica si la asistencia fue confirmada y guardada).
- `registeredCount`: number (total de estudiantes calificados en la sesión).

### 5.5. Registro de Asistencia (`AttendanceRecord`) y Payload de Envío
- **Registro individual:**
  - `id`: string.
  - `classSessionId`: string.
  - `studentId`: string.
  - `status`: `'PRESENTE' | 'AUSENTE' | 'TARDE'`.
  - `recordedAt`: string (timestamp de auditoría del servidor).
  - `recordedByTeacherId`: string.
- **Payload de guardado (`PUT /api/v1/sessions/{id}/attendance`):**
  ```json
  {
    "records": [
      { "studentId": "est-101", "status": "PRESENTE" },
      { "studentId": "est-102", "status": "AUSENTE" },
      { "studentId": "est-103", "status": "TARDE" }
    ]
  }
  ```

### 5.6. Observación Pedagógica Cualitativa (`AcademicObservation`)
- `id`: string.
- `commissionId`: string.
- `commissionName`: string.
- `studentId`: string.
- `studentName`: string.
- `studentLegajo`: string.
- `pedagogicalDate`: string (`YYYY-MM-DD`, fecha del hecho en el aula).
- `createdAt`: string (timestamp del servidor al asentar el registro).
- `category`: `'Seguimiento pedagógico' | 'Participación y desempeño' | 'Adecuación / Apoyo' | 'General'`.
- `content`: string (texto descriptivo, mínimo 15 caracteres).
- `teacherId`: string.

---

## 6. Mutaciones visibles y decisiones funcionales pendientes

El frontend actual contempla dos operaciones críticas de escritura (mutaciones) que impactan en la vida académica del instituto:

### 6.1. Toma de Asistencia
1. **Regla de los 3 estados:** El sistema opera estrictamente con `PRESENTE`, `AUSENTE` y `TARDE`. No existen valores nulos ni justificaciones automáticas al momento del pase de lista del docente.
2. **Cobertura al 100% (No omisión):** El frontend bloquea el botón de confirmación si existe al menos un estudiante sin calificar. El backend debe replicar esta validación retornando `422 Unprocessable Entity` si la lista enviada no coincide en cardinalidad y pertenencia con la matrícula activa.
3. **Reapertura y rectificación:** Actualmente el prototipo permite volver a guardar sobre una clase cerrada. El equipo debe consensuar si en producción la rectificación es libre dentro de una ventana de tiempo (ej. 48 hs) o si requiere desbloqueo de Preceptoría con log de auditoría.

### 6.2. Observaciones Pedagógicas Cualitativas
1. **Doble fecha:** Se requiere almacenar de forma separada la `pedagogicalDate` (ingresada por el docente) y la `createdAt` (sellada por el reloj del servidor).
2. **Inmutabilidad y permisos de lectura:** Actualmente las observaciones son acumulativas (no se editan ni se eliminan desde la UI). Debe definirse si Preceptoría y el Equipo de Orientación tendrán acceso de lectura a las observaciones de categoría `"Adecuación / Apoyo"`.
3. **Calificaciones excluidas:** El módulo no gestiona notas numéricas ni actas de examen. Esas funciones pertenecen a un eventual submódulo de Calificaciones o Secretaría.

### 6.3. Creación de Instancias de Clase
- El frontend actual permite al docente indicar cualquier fecha y abrir la clase (`createOrOpenClassSession`).
- **Decisión pendiente:** Definir si las clases son generadas bajo demanda por el profesor o si Secretaría/Preceptoría precargan el cronograma oficial del cuatrimestre y el profesor solo pasa lista sobre fechas autorizadas.

---

## 7. Requisitos que debe cubrir el backend

1. **Autenticación y Autorización Categórica:** Control de acceso en cada endpoint. Resolver siempre la identidad del docente a partir del token JWT; jamás a partir de parámetros libres enviados en la petición.
2. **Verificación de Cátedra (ABAC):** Comprobar que el docente tenga asignada la comisión antes de devolver nóminas o registrar asistencias (`403 Forbidden` ante accesos no autorizados).
3. **Transaccionalidad en Asistencias:** El guardado de asistencia para una sesión debe ejecutarse en una transacción ACID atómica: o se registran todos los estudiantes o no se aplica ninguno.
4. **Validación Semántica Estricta:**
   - La asistencia debe cubrir a todos los matriculados sin omitir a ninguno.
   - La `pedagogicalDate` no puede ser una fecha futura (`pedagogicalDate <= hoy`).
   - El contenido de la observación debe tener al menos 15 caracteres descriptivos útiles.
5. **Sanitización y Prevención de Inyecciones:**
   - Sanitizar caracteres HTML en el texto de observaciones para neutralizar ataques XSS almacenados.
   - Empleo de consultas parametrizadas u ORMs seguros contra inyecciones SQL.
6. **Protección de Datos Personales (Ley N.° 25.326):**
   - No exponer contraseñas, hashes ni información privada de estudiantes más allá de los campos estrictamente requeridos para la cursada (legajo, DNI, nombre, email institucional).
   - Canales seguros obligatorios (HTTPS / TLS 1.3).
7. **Política de CORS y Conectividad:**
   - Habilitar cabeceras CORS controladas para el origen del frontend (`http://localhost:5173` en desarrollo) permitiendo cabeceras de autorización.

---

## 8. Secuencia recomendada de integración

1. **Acuerdo Intermodular Inicial:**
   - Consensuar con los desarrolladores de Secretaría y Preceptoría las claves primarias (`id` UUID v4) y la estructura de las tablas compartidas (`Commission`, `Student`, `Enrollment`).
   - Definir el proveedor central de autenticación y el formato del token JWT institucional.
2. **Puesta a Punto de Endpoints de Lectura (Read-Only):**
   - Implementar y probar `GET /api/v1/teachers/me` y `GET /api/v1/commissions`.
   - Conectar `GET /api/v1/commissions/{id}/students` y comprobar que la nómina responda con las condiciones de cursada oficiales.
3. **Puesta a Punto de Endpoints Transaccionales (Mutaciones):**
   - Habilitar `POST /api/v1/commissions/{id}/sessions` con restricción de unicidad por fecha.
   - Implementar `PUT /api/v1/sessions/{id}/attendance` con validación de cobertura del 100% y transacción atómica.
   - Habilitar `POST /api/v1/observations` asegurando la disociación entre fecha pedagógica y timestamp del servidor.
4. **Sustitución en la Capa de Servicios del Frontend:**
   - En `src/services/academicService.ts`, sustituir las lecturas/escrituras de `localStorage` por peticiones HTTP asíncronas (`fetch` / `axios`) apuntando a `VITE_API_BASE_URL`.
   - Integrar manejo de errores HTTP (`401` redirige a login, `403` alerta de falta de asignación, `422` alerta de validación).
5. **Retiro de Herramientas de Demostración:**
   - Desactivar o condicionar el banner de demostración y el botón de reseteo local mediante la variable de entorno `VITE_ENABLE_DEMO_TOOLS=false`.
6. **Pruebas de Integración Extremo a Extremo (E2E):**
   - Ejecutar la suite de pruebas cruzadas verificando que una asistencia asentada por el profesor impacte en los reportes de Preceptoría y en el historial del alumno.

---

## 9. Archivos consultados del proyecto

- `src/types/index.ts`: Contratos de tipos de datos de TypeScript.
- `src/services/academicService.ts`: Capa de servicios desacoplada y métodos asíncronos.
- `src/data/mockData.ts`: Fixtures de demostración (docente, cátedras, nóminas, sesiones históricas y observaciones).
- `src/views/DashboardView.tsx`: Métricas, accesos rápidos y comisiones activas.
- `src/views/CommissionsView.tsx`: Catálogo de comisiones, filtros por turno y búsqueda.
- `src/views/StudentsView.tsx`: Nómina por comisión, ordenamiento y filtros de regularidad.
- `src/views/AttendanceView.tsx`: Flujo estricto de toma de asistencia, contadores en vivo, validación de cobertura total y modal de confirmación.
- `src/views/ObservationsView.tsx`: Formulario de registro pedagógico, fechas disociadas, validación descriptiva e historial cualitativo.
- `src/components/common/DemoBanner.tsx`: Gestión de reinicio de demostración en cliente.
- `src/App.tsx`: Enrutamiento y orquestación de pantallas.
- `docs/contrato-backend/`: Especificaciones técnicas detalladas (documentos 01 al 07).

---

## Conclusión

El frontend del Módulo Profesor constituye una especificación viva, navegable y rigurosamente tipada de los requerimientos visuales y de negocio del docente del ISFDyT N.° 26. 

Todas las operaciones de la interfaz están desacopladas en `academicService.ts`, lo que permite una **transición directa y transparente hacia los endpoints REST del backend** una vez que el equipo acuerde el esquema de autenticación central, el formato de identificadores y el modelo de datos compartido entre módulos.
