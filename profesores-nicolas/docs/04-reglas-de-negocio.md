# 04 — Reglas de Negocio del Módulo Profesor

> **Versión del contrato:** 0.1.0 (Propuesta inicial)  
> **Fecha de redacción:** 2026-10-16  
> **Estado:** Propuesta técnica — pendiente de revisión grupal  
> **Fuente de evidencia:** Validaciones e interfaces en `src/views/`, `src/services/academicService.ts` y `src/types/`

---

## 1. Propósito

Este documento cataloga de forma rigurosa las reglas de negocio institucionales que rigen el Módulo Profesor en el SGA del ISFDyT N.° 26. Establece qué validaciones deben ser garantizadas tanto en el cliente como en el backend.

---

## 2. Reglas sobre Comisiones y Asignación Docente

### RN-COM-01: Aislamiento por Cátedra (Autorización Estricta)
- **Definición:** Un docente solo tiene autorización para consultar y operar sobre las comisiones en las que figura formalmente como titular o adjunto en el ciclo lectivo en curso.
- **Frontend:** Filtra las comisiones consultadas por `teacherId` (`academicService.ts:85`).
- **Backend:** Toda consulta (`/api/v1/commissions/...`) debe resolver la identidad del docente desde el token JWT y comprobar la relación en base de datos. Si el docente intenta operar sobre una comisión ajena, el backend debe responder `403 Forbidden`.

### RN-COM-02: Inmutabilidad de Estructura Curricular desde el Módulo Docente
- **Definición:** El docente no puede crear comisiones, renombrar materias, modificar cargas horarias, reasignar aulas ni alterar cupos. Esas atribuciones corresponden a Secretaría Académica.
- **Frontend:** No ofrece interfaces de creación o edición de comisiones.

### RN-COM-03: Cálculo Dinámico de Matrícula Activa
- **Definición:** El contador de estudiantes (`studentCount`) de una comisión no es un valor estático, sino el conteo dinámico de inscripciones válidas activas provistas por Preceptoría.
- **Frontend:** Implementado en `academicService.ts:81`.

---

## 3. Reglas sobre Estudiantes y Nómina

### RN-EST-01: Nómina de Cursada como Fuente Única de Verdad
- **Definición:** La lista de estudiantes habilitados para registrar asistencia u observaciones es gestionada exclusivamente por Preceptoría. El docente no puede añadir alumnos "por fuera de lista" ni darlos de baja.
- **Frontend:** La lista de estudiantes es de solo lectura y se carga directamente asociada a `commissionId`.

### RN-EST-02: Estados Académicos de Cursada
- **Definición:** Los estados permitidos para un estudiante en la cursada son:
  - `REGULAR`: Estudiante cursando con derecho a asistencia y parciales.
  - `LIBRE`: Estudiante que perdió la condición de regularidad (mantiene registro histórico).
  - `PROMOCIONADO`: Estudiante que alcanzó el régimen de promoción anticipada.
- **Evidencia:** `src/types/index.ts:9`.

---

## 4. Reglas de Toma y Confirmación de Asistencia

### RN-ASI-01: Estados de Asistencia Válidos (Terna Cerrada)
- **Definición:** Todo registro de asistencia debe pertenecer obligatoriamente a uno de los tres estados:
  - `PRESENTE`
  - `AUSENTE`
  - `TARDE`
- **Frontend:** No se admiten valores nulos, blancos ni estados adicionales en el momento del guardado.

### RN-ASI-02: Prohibición de Asignación Automática por Defecto (Selección Explícita)
- **Definición:** Al abrir una nueva clase para toma de asistencia, el sistema **no debe premarcar a todos los alumnos como "Presente" ni como "Ausente"**.
- **Justificación:** Previene errores de registro por omisión o inatención. Cada estudiante debe ser evaluado explícitamente por el docente.
- **Frontend:** Los estados se inicializan en `null` (`AttendanceView.tsx:89-92`) mostrando la insignia visual "Pendiente". El botón "Marcar todos Presentes" existe solo como acción rápida voluntaria del usuario (`AttendanceView.tsx:388-395`).

### RN-ASI-03: Validación de Cobertura Total (Bloqueo Previo al Guardado)
- **Definición:** Para confirmar la asistencia de una clase, el 100% de los estudiantes de la nómina deben tener asignado un estado (`PRESENTE`, `AUSENTE` o `TARDE`).
- **Frontend:** Si existe al menos un alumno en estado `null`, el botón "Confirmar Asistencia" permanece deshabilitado (`AttendanceView.tsx:783`) y se muestra advertencia (`AttendanceView.tsx:200-205`).
- **Backend:** Si el arreglo `records` de la petición `PUT` no contiene exactamente a todos los estudiantes de la comisión, debe rechazar la operación con `422 Unprocessable Entity`.

### RN-ASI-04: Unicidad de Instancia de Clase por Comisión y Fecha
- **Definición:** No puede existir más de una instancia de clase (`ClassSession`) para la misma comisión en el mismo día calendario (`UNIQUE(commission_id, date)`).
- **Frontend:** `createOrOpenClassSession` busca primero si ya existe una sesión para la fecha; si existe, la devuelve para consulta o actualización (`academicService.ts:175-178`).

### RN-ASI-05: Reemplazo Atómico de Registros de Asistencia
- **Definición:** Guardar la asistencia de una sesión reemplaza en una sola transacción atómica todos los registros previos de esa misma sesión.
- **Frontend:** Filtra los registros previos y agrega la nueva nómina completa (`academicService.ts:215-229`).
- **Backend:** Debe implementarse dentro de una transacción (`BEGIN TRANSACTION ... DELETE FROM attendance_record WHERE session_id = ...; INSERT INTO ... COMMIT`).

### RN-ASI-06: Cierre de Sesión y Auditoría
- **Definición:** Al confirmarse la asistencia, la sesión de clase pasa a estado `isClosed: true` y registra la cantidad de asistentes evaluados (`registeredCount`).
- **Auditoría:** Cada registro de asistencia individual guarda el timestamp del momento exacto del guardado y el `id` del docente que firmó la planilla (`recordedAt`, `recordedByTeacherId`).

---

## 5. Reglas de Observaciones Académicas Cualitativas

### RN-OBS-01: Carácter Estrictamente Pedagógico y Cualitativo
- **Definición:** Las observaciones del Módulo Profesor son de carácter cualitativo y de seguimiento pedagógico formativo. **No constituyen calificaciones numéricas, notas de parciales ni ponderaciones porcentuales.**
- **Frontend:** No contempla campos numéricos ni promedios ponderados.

### RN-OBS-02: Disociación de Fecha Pedagógica vs. Fecha de Auditoría del Sistema
- **Definición:** Se reconocen y almacenan dos fechas independientes:
  - `pedagogicalDate`: Fecha de calendario en la que ocurrió el hecho formativo (ingresada por el docente, ej. el día que se realizó la exposición o trabajo en campo).
  - `createdAt`: Timestamp oficial del servidor generado al persistir el registro en base de datos.
- **Regla Temporal:** `pedagogicalDate` no puede ser una fecha futura respecto al día de registro (`pedagogicalDate <= today`).

### RN-OBS-03: Categorización Pedagógica Obligatoria
- **Definición:** Toda observación debe encuadrarse en una de las cuatro categorías institucionales aprobadas:
  1. `Seguimiento pedagógico`: Evolución general del proceso de aprendizaje.
  2. `Participación y desempeño`: Intervenciones en clase, trabajos prácticos y exposiciones.
  3. `Adecuación / Apoyo`: Tutorías, adaptaciones curriculares o instancias de acompañamiento.
  4. `General`: Comunicaciones institucionales y notas de contexto.
- **Evidencia:** `src/types/index.ts:93`.

### RN-OBS-04: Requisito de Densidad Descriptiva Mínima
- **Definición:** El contenido de una observación no puede ser trivial ni vacío. Debe aportar valor pedagógico comprobable.
- **Validación:** Longitud mínima obligatoria de **15 caracteres** de texto útil (sin contar espacios en blanco redundantes).
- **Frontend:** `ObservationsView.tsx:127-129`.
- **Backend:** Debe validar `content.trim().length >= 15` retornando `400 Bad Request` en caso contrario.

### RN-OBS-05: Inmutabilidad e Historial del Estudiante
- **Definición:** Las observaciones constituyen un historial cronológico inmutable del acompañamiento pedagógico del estudiante. En la versión actual no se contempla borrado físico ni edición destructiva por parte del usuario.

---

## 6. Cuadro Comparativo: Entorno de Demostración vs. Entorno Productivo

| Regla | Comportamiento en Demo (Frontend Actual) | Comportamiento Requerido en Backend Productivo |
|---|---|---|
| **Identidad docente** | Constante fija `MOCK_TEACHER` (`tch-8492`). | Extraída criptográficamente del token JWT en cabecera `Authorization`. |
| **Persistencia** | `localStorage` del navegador cliente. | Base de datos relacional con transaccionalidad ACID. |
| **Validaciones** | Verificaciones en componentes React antes de invocar el servicio. | Doble validación: cliente (UX) y middleware del backend (seguridad). |
| **Restablecimiento de datos** | Botón en `DemoBanner` que borra claves en `localStorage`. | **No disponible en producción** (o restringido a entorno de testing/staging). |
| **Reapertura de asistencias** | Sobrescribe directamente sin control de antigüedad. | Política de edición permitida dentro de ventana de tiempo (ej. 48 hs) con registro de auditoría. |
