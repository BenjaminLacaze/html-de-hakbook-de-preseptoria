# `shared/` — modelo de datos unificado

Código común a las 4 apps. Por ahora contiene **`types.ts`**: los tipos y catálogos que usan
las apps y el backend. Es la Etapa 0 de [`docs/AJUSTES_INTEGRACION_BACKEND.md`](../docs/AJUSTES_INTEGRACION_BACKEND.md).

## Decisiones aprobadas (2026-10-23)

- **Modelo terciario:** carrera → plan → materia → **comisión**. Se deja de usar el
  "curso / división" de secundaria.
- **Los dos portales de Alumno** (Julián y Lucía) se integran a la misma API; se elige uno después de que los prueben los alumnos.
- **API en inglés:** nombres de campos **y** códigos (`PRESENT`, `MORNING`, `TEACHER`…).
  Lo que ve el usuario sale de las tablas `*_LABELS`, que están en español.
- **PostgreSQL** como base de datos.

## Cómo se usa desde una app

Las 4 apps tienen configurado el alias `@shared`:

```ts
import type { Commission, AttendanceRecord } from '@shared/types';
import { ATTENDANCE_STATUS_LABELS, SHIFT_LABELS } from '@shared/types';

<span>{ATTENDANCE_STATUS_LABELS[record.status]}</span>   // "Presente"
```

- Para **tipos**, usá `import type` (no agrega nada al build).
- Los catálogos (`ROLES`, `SHIFTS`…) son arrays: sirven para armar selects y filtros.
- **No copies estos tipos dentro de tu app.** Si te falta un campo, proponelo acá, así lo ve
  todo el equipo y el backend.

## Reglas

1. Los campos que dicen "lo completa el backend" (`recordedBy`, `createdBy`, `justified`,
   `percentage`, `risk`…) **no se envían** desde las apps.
2. El **porcentaje de asistencia y el riesgo** los calcula el backend (`AttendanceSummary`).
   Ninguna app los calcula.
3. La **justificación no es un estado** de asistencia: es un dato aparte (`Justification`), y en
   cada registro aparece como `justified: true/false`.
4. Los **datos sensibles** del alumno (domicilio, contacto de emergencia, salud) están en
   `StudentSensitiveData`, separados de `Student`, y solo los reciben los roles autorizados.
5. Sin `enum` en este archivo: la app de Profesores compila con `erasableSyntaxOnly`.

## Equivalencias: valores viejos → valores nuevos

Para migrar cada app. "—" = esa app no tenía ese valor.

### Estado de asistencia → `AttendanceStatus`

| Nuevo | Profesores | Directivos | Julián | Lucía |
|---|---|---|---|---|
| `PRESENT` | `PRESENTE` | `PRESENTE` | `Presente` | `PRESENTE` |
| `ABSENT` | `AUSENTE` | `AUSENTE_INJUSTIFICADO` | `Ausente` | `AUSENTE` |
| `ABSENT` + `justified: true` | — | `AUSENTE_JUSTIFICADO` | `Justificada` | `JUSTIFICADO` |
| `LATE` | `TARDE` | `TARDANZA` | `Tardanza` | `TARDE` |

### Turno → `Shift`

| Nuevo | Profesores | Directivos | Julián | Lucía |
|---|---|---|---|---|
| `MORNING` | `Mañana` | `MAÑANA` | `Mañana` | texto libre |
| `AFTERNOON` | `Tarde` | `TARDE` | `Tarde` | texto libre |
| `EVENING` | `Vespertino` | `VESPERTINO` | `Noche` | texto libre |

### Roles → `Role`

| Nuevo | Directivos (`UserRole`) | `CONTRATO_BACKEND.md` |
|---|---|---|
| `SUPER_ADMIN` | — | `SUPER_ADMIN` |
| `DIRECTOR` | `DIRECTIVO`, `VICEDIRECTOR` | `DIRECTIVO` |
| `ADMINISTRATIVE` | `SECRETARIA` | `ADMINISTRATIVO` |
| `PRECEPTOR` | `PRECEPTORIA` | `PRECEPTOR` |
| `TEACHER` | `DOCENTE` | `PROFESOR` |
| `STUDENT` | — | `ALUMNO` |
| *(pendiente)* | `ORIENTACION_ESCOLAR` | — |

### Situación del alumno

Antes era un solo campo; ahora son **dos**:

| Antes | Nuevo |
|---|---|
| Directivos `REGULAR` | `Student.status = ACTIVE` |
| Directivos `CONDICIONAL` | `Student.status = ACTIVE`; la condición va por materia en `Enrollment.condition` |
| Directivos `EGRESADO` | `Student.status = GRADUATED` |
| Directivos `PASIVADO` | `Student.status = INACTIVE` |
| Profesores `REGULAR` / `LIBRE` / `PROMOCIONADO` | `Enrollment.condition = REGULAR` / `FREE` / `PROMOTED` |
| Lucía `REGULAR` / `LIBRE` | `Enrollment.condition = REGULAR` / `FREE` |
| Lucía `EN_RIESGO` | No se guarda: `AttendanceSummary.risk = AT_RISK` (lo calcula el backend) |

### Período → `AcademicPeriod`

| Nuevo | Lucía | Julián / Profesores | Directivos |
|---|---|---|---|
| `FIRST_TERM` | `1C` | "1° Cuatrimestre" (texto) | trimestres: **no aplica** al modelo terciario |
| `SECOND_TERM` | `2C` | "2° Cuatrimestre" (texto) | ídem |
| `ANNUAL` | — | "Anual" (texto) | ídem |

### Entidades renombradas o reemplazadas

| Antes | Nuevo | Nota |
|---|---|---|
| Directivos `Course` (año + división) | `Commission` | Cambio de modelo: ver documento de ajustes, sección 2.1 |
| Directivos `TeacherAssignment` | `Commission.teacherIds` | |
| Directivos `ScheduleSlot` (con `courseId`) | `Commission.schedule: ScheduleSlot[]` | |
| Directivos `GradeRecord` | `Grade` (cuelga de `Enrollment`) | |
| Directivos `OfficialNotice` | `Notice` | `recipients` → `audience` |
| Directivos `AcademicCycle` (`id: '2026'`) | `AcademicCycle` (`id` UUID + `year: 2026`) | El ciclo deja de estar escrito a mano |
| Profesores `Commission` | `Commission` / `CommissionView` | `subjectName`, `careerName`, `studentCount` solo en `CommissionView` (los arma el backend) |
| Profesores `AcademicObservation` | `Observation` | `pedagogicalDate` → `date`; `teacherId` → `createdBy` |
| Julián `StudentProfile` | `Student` + `AttendanceSummary` | `legajo` → `fileNumber`; promedio y % de asistencia vienen del backend |
| Julián `GradeItem` | `Grade` | `tipoEvaluacion` → `type` + `instance` (ej. "2do Parcial" = `PARTIAL`, 2) |
| Julián `AttendanceRecord.metodoRegistro` | `AttendanceRecord.source` | `QR Aula`→`QR`, `Docente`→`TEACHER`, `Preceptoría`→`PRECEPTOR`, `Planilla`→`IMPORT` |
| Julián `estadoJustificacion` | `Justification.status` | `En Revisión`→`PENDING`, `Aprobada`→`APPROVED`, `Rechazada`→`REJECTED` |
| Campos `legajo` (todas) | `fileNumber` | |

### Nombres de campo español → inglés (portal de Julián)

`fecha`→`date` · `estado`→`status` · `nombre`→`firstName` · `apellido`→`lastName` ·
`telefono`→`phone` · `materiaId`→`subjectId` (o `commissionId`, según el caso) · `nota`→`value` ·
`observaciones`→`notes` · `turno`→`shift` · `carrera`→ nombre de `Career`.

## Pendiente (no está decidido; los tipos lo dejan abierto)

- Cuánto descuenta una llegada tarde → `InstitutionSettings.lateArrivalAbsenceWeight`.
- Si el rol `ORIENTACION_ESCOLAR` entra en la primera etapa.
- Foros, QR de asistencia y justificación cargada por el alumno: **no tienen tipos** acá a propósito,
  porque quedaron fuera de la primera etapa.
